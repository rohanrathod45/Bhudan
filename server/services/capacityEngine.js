/**
 * CARRYING-CAPACITY ENGINE
 * ------------------------
 * Assesses whether relocation/safe sites can actually accommodate the
 * vulnerable population. For each site it computes:
 *   - max population capacity
 *   - current occupancy
 *   - available capacity
 *   - capacity deficit / surplus
 *   - resource readiness (water, housing, healthcare, sanitation, food,
 *     roads, emergency services, shelter)
 */

const { clamp, round } = require('../utils/helpers');

// Resource fields on the SafeSite model mapped to display labels.
const RESOURCE_FIELDS = [
  'waterAvailability',
  'housing',
  'healthcare',
  'sanitation',
  'foodLogistics',
  'roadConnectivity',
  'emergencyServices',
  'shelterCapacity',
];

function assessSite(site, demandPopulation = 0) {
  const maxCapacity = site.maxPopulationCapacity || 0;
  const occupancy = site.currentOccupancy || 0;
  const available = Math.max(0, maxCapacity - occupancy);
  const gap = Math.max(0, demandPopulation - available); // deficit if > 0

  const suitability = computeSuitability(site);
  const status = statusForCap(site.status, available);

  return {
    safeSiteId: site.id || site._id,
    name: site.name,
    district: site.district,
    type: site.type,
    lat: site.lat,
    lng: site.lng,
    maxPopulationCapacity: maxCapacity,
    currentOccupancy: occupancy,
    availableCapacity: available,
    capacityGap: gap,
    capacitySurplus: Math.max(0, available - demandPopulation),
    demandPopulation,
    status,
    hasDeficit: gap > 0,
    suitability,
    resources: resourceScores(site),
    dataSource: site.dataSource || 'estimated',
    lastUpdatedAt: site.lastUpdatedAt || new Date(),
  };
}

function resourceScores(site) {
  return RESOURCE_FIELDS.map((f) => ({
    key: f,
    score: site[f] != null ? clamp(site[f], 0, 100) : 0,
  }));
}

function computeSuitability(site) {
  const names = ['waterAvailability', 'housing', 'healthcare', 'sanitation', 'foodLogistics', 'roadConnectivity', 'emergencyServices'];
  let sum = 0;
  for (const n of names) sum += clamp(site[n], 0, 100);
  const avg = sum / names.length;
  // Capacity utilisation influences suitability (crowded sites less suitable).
  const maxCap = site.maxPopulationCapacity || 1;
  const occupancyShare = (site.currentOccupancy || 0) / maxCap;
  return round(avg * (1 - occupancyShare * 0.3), 1);
}

function statusForCap(siteStatus, available) {
  if (available <= 0) return 'overflow';
  if (siteStatus === 'planned') return 'planned';
  if (siteStatus === 'operational') return 'operational';
  return 'available';
}

/**
 * Aggregate carrying-capacity picture across many sites for one district.
 * Returns whether the district can absorb the required relocation load.
 */
function assessDistrict(demandPopulation, sites) {
  const siteAssessments = sites.map((s) => assessSite(s, demandPopulation));
  const totalAvailable = siteAssessments.reduce((a, s) => a + s.availableCapacity, 0);
  const totalCapacity = siteAssessments.reduce((a, s) => a + s.maxPopulationCapacity, 0);
  const totalSurplus = Math.max(0, totalAvailable - demandPopulation);
  const totalGap = Math.max(0, demandPopulation - totalAvailable);
  const sufficiency = totalGap === 0 ? 'sufficient' : totalAvailable === 0 ? 'insufficient' : demandPopulation > totalAvailable ? 'insufficient' : 'sufficient';

  return {
    demandPopulation,
    totalCapacity,
    totalAvailable,
    capacityGap: totalGap,
    capacitySurplus: totalSurplus,
    status: sufficiency,
    sites: siteAssessments,
    coveragePercent: totalAvailable ? round(Math.min(100, (demandPopulation / totalAvailable) * 100), 1) : 0,
  };
}

module.exports = { assessSite, assessDistrict, RESOURCE_FIELDS };