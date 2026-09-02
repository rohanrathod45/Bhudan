const { habitations, safeSites } = require('../dataAccess');
const { runFullAnalysis } = require('../services/analysisService');
const { assessHabitation } = require('../services/riskEngine');
const { assessVulnerability } = require('../services/vulnerabilityEngine');
const { assessSite, assessDistrict } = require('../services/capacityEngine');
const { computeDynamicHazards, HAZARDS } = require('../services/hazards');
const { DISTRICT_REGISTRY, buildDistrict } = require('../data/india');
const {
  fetchLiveWeather,
  fetchRealHabitationsFromOSM,
  fetchRealSafeSitesFromOSM,
} = require('../services/liveDataService');

async function loadContext(district) {
  let h = await habitations.list({ district });
  let s = await safeSites.list({ district });

  // Resolve district metadata
  const regMatch = DISTRICT_REGISTRY.find(
    (d) => d[0].toLowerCase() === String(district).trim().toLowerCase()
  );
  const districtName = regMatch ? regMatch[0] : district;
  const stateName = regMatch ? regMatch[1] : 'India';
  const centerLat = regMatch ? regMatch[2] : 11.605;
  const centerLng = regMatch ? regMatch[3] : 76.083;

  // Fetch Live Weather Telemetry (Open-Meteo)
  const liveWeather = await fetchLiveWeather(centerLat, centerLng);

  // On-demand generation/ingestion if district is in registry but not yet in database
  if (!h.length) {
    // Try fetching real OSM habitations and safe sites first
    const [osmHabs, osmSites] = await Promise.all([
      fetchRealHabitationsFromOSM(districtName, stateName, centerLat, centerLng),
      fetchRealSafeSitesFromOSM(districtName, stateName, centerLat, centerLng),
    ]);

    if (osmHabs && osmHabs.length) {
      for (const hab of osmHabs) {
        hab.liveWeather = liveWeather;
        await habitations.create(hab);
      }
    }
    if (osmSites && osmSites.length) {
      for (const site of osmSites) {
        await safeSites.create(site);
      }
    }

    h = await habitations.list({ district });
    s = await safeSites.list({ district });

    // Fallback to deterministic model generator if OSM is unreachable
    if (!h.length) {
      const generated = buildDistrict(districtName);
      if (generated) {
        for (const hab of generated.habitations) {
          hab.liveWeather = liveWeather;
          await habitations.create(hab);
        }
        for (const site of generated.safeSites) {
          await safeSites.create(site);
        }
        h = await habitations.list({ district });
        s = await safeSites.list({ district });
      }
    }
  }

  return { habitations: h, safeSites: s, liveWeather, districtName, stateName, centerLat, centerLng };
}

/**
 * GET /api/analysis/district?district=X
 * Full decision-support pipeline for a district with real-time live telemetry.
 */
async function analyzeDistrict(req, res) {
  const district = req.query.district;
  if (!district || district === 'All') {
    return res.status(400).json({ success: false, message: 'Please specify a district parameter for analysis.' });
  }
  const { habitations: hb, safeSites: ss, liveWeather } = await loadContext(district);
  if (!hb.length) {
    return res.status(200).json({ success: true, district, note: 'No habitation data for this district.', analysis: null });
  }
  const analysis = runFullAnalysis(hb, ss, liveWeather);
  return res.json({ success: true, district, analysis, liveWeather });
}

/**
 * GET /api/analysis/habitation/:id
 * Deep-dive assessment (risk + vulnerability) for a single habitation with live weather.
 */
async function analyzeHabitation(req, res) {
  const h = await habitations.findById(req.params.id);
  if (!h) return res.status(404).json({ success: false, message: 'Habitation not found.' });

  const liveWeather = (h.lat && h.lng) ? await fetchLiveWeather(h.lat, h.lng) : null;
  const vulnerability = assessVulnerability(h);
  const risk = assessHabitation(h, vulnerability, liveWeather);
  return res.json({ success: true, data: { habitation: h, risk, vulnerability, liveWeather } });
}

/**
 * GET /api/analysis/red-zones?district=X
 * Only the red/orange zone list.
 */
async function redZones(req, res) {
  const district = req.query.district;
  if (!district || district === 'All') {
    return res.status(400).json({ success: false, message: 'Please specify a district parameter.' });
  }
  const { habitations: hb, safeSites: ss, liveWeather } = await loadContext(district);
  const analysis = runFullAnalysis(hb, ss, liveWeather);
  const zones = (analysis.redZones || [])
    .filter((r) => r.zone.riskClass === 'RED' || r.zone.riskClass === 'ORANGE')
    .map((r) => r.zone);
  return res.json({ success: true, district, count: zones.length, data: zones, liveWeather });
}

/**
 * GET /api/analysis/capacity?district=X
 * Carrying-capacity overview for a district's safe sites.
 */
async function capacity(req, res) {
  const district = req.query.district;
  if (!district || district === 'All') {
    return res.status(400).json({ success: false, message: 'Please specify a district parameter.' });
  }
  const { habitations: hb, safeSites: ss, liveWeather } = await loadContext(district);
  const totalExposed = hb.reduce((a, h) => a + Math.round((h.population || 0) * 0.6), 0);
  const result = assessDistrict(totalExposed, ss);
  return res.json({ success: true, district, data: result, liveWeather });
}

/**
 * GET /api/analysis/relocation?district=X
 * Relocation priority plan + safe-site assignment.
 */
async function relocation(req, res) {
  const district = req.query.district;
  if (!district || district === 'All') {
    return res.status(400).json({ success: false, message: 'Please specify a district parameter.' });
  }
  const { habitations: hb, safeSites: ss, liveWeather } = await loadContext(district);
  const analysis = runFullAnalysis(hb, ss, liveWeather);
  return res.json({ success: true, district, data: { priority: analysis.relocation, summary: analysis.summary, liveWeather } });
}

/**
 * GET /api/analysis/hazards
 * Dynamic hazard catalogue computing real-time exposure and active frequencies from all habitations.
 */
async function hazards(req, res) {
  const allHabs = await habitations.list({});
  const { active, all } = computeDynamicHazards(allHabs);
  return res.json({ success: true, active, all, totalSurveilledHabitations: allHabs.length });
}

/**
 * GET /api/analysis/meta
 * Dynamic system-wide reference material and live summary stats.
 */
async function meta(req, res) {
  const allHabs = await habitations.list({});
  const allSites = await safeSites.list({});
  const totalPop = allHabs.reduce((sum, h) => sum + (h.population || 0), 0);
  const totalCap = allSites.reduce((sum, s) => sum + (s.maxPopulationCapacity || 0), 0);
  const uniqueStates = new Set(allHabs.map((h) => h.state).filter(Boolean));
  const uniqueDistricts = new Set(allHabs.map((h) => h.district).filter(Boolean));

  return res.json({
    success: true,
    liveStats: {
      totalHabitations: allHabs.length,
      totalSafeSites: allSites.length,
      totalPopulation: totalPop,
      totalShelterCapacity: totalCap,
      monitoredStatesCount: uniqueStates.size,
      monitoredDistrictsCount: uniqueDistricts.size,
    },
    riskClasses: [
      { key: 'GREEN', label: 'Low Risk', threshold: '0–29' },
      { key: 'YELLOW', label: 'Moderate Risk', threshold: '30–54' },
      { key: 'ORANGE', label: 'High Risk', threshold: '55–69' },
      { key: 'RED', label: 'Critical / Very High Risk', threshold: '70–100' },
    ],
    vulnerabilityClasses: ['Low', 'Moderate', 'High', 'Critical'],
    models: [
      {
        name: 'Risk (Red-Zone) Score',
        inputs: 'Hazard severity, recurrence, population exposure, vulnerability, infrastructure, accessibility, terrain, historical events, distance to emergency facilities',
        scale: '0–100',
        classes: 'GREEN / YELLOW / ORANGE / RED',
      },
      {
        name: 'Vulnerability Score',
        inputs: 'Vulnerable population share, density, infrastructure, accessibility, services, history',
        scale: '0–100',
        classes: 'Low / Moderate / High / Critical',
      },
      {
        name: 'Carrying Capacity',
        inputs: 'Max capacity, current occupancy, water, housing, healthcare, sanitation, food, roads, emergency services, shelter',
        output: 'Available capacity, deficit/surplus, Sufficient/Insufficient',
      },
      {
        name: 'Relocation Priority',
        inputs: 'Risk score, vulnerability score, historical exposure',
        output: 'Ranked sites + nearest safe-site assignment with distance & ETA',
      },
    ],
  });
}

/**
 * GET /api/analysis/districts
 * Dynamic districts API returning live coordinates, regions, and state associations.
 */
async function districts(req, res) {
  const allHabs = await habitations.list({});
  const habCountByDist = {};
  allHabs.forEach((h) => {
    habCountByDist[h.district] = (habCountByDist[h.district] || 0) + 1;
  });

  return res.json({
    success: true,
    count: DISTRICT_REGISTRY.length,
    data: DISTRICT_REGISTRY.map((d) => ({
      name: d[0],
      state: d[1],
      lat: d[2],
      lng: d[3],
      region: d[4],
      activeHabitationsCount: habCountByDist[d[0]] || 0,
    })),
  });
}

module.exports = { analyzeDistrict, analyzeHabitation, redZones, capacity, relocation, hazards, meta, districts };