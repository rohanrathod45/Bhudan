/**
 * ANALYSIS SERVICE
 * ----------------
 * Orchestrates the full decision-support pipeline for a district:
 *
 *   Habitations + Safe sites ---> risk engine -> red zones
 *                              --> vulnerability engine -> vulnerable habitations
 *                              --> capacity engine    -> carrying capacity
 *                              --> relocation engine  -> priority + assignment
 *
 * All analysis is deterministic given the same inputs so it stays
 * reproducible and explainable.
 */

const { riskClass, assessHabitation } = require('./riskEngine');
const { assessVulnerability } = require('./vulnerabilityEngine');
const { assessSite, assessDistrict } = require('./capacityEngine');
const { allocate } = require('./relocationEngine');

/**
 * Full analysis for a set of habitations + safe sites (usually a district).
 * Optionally accepts real-time liveWeather telemetry.
 */
function runFullAnalysis(habitations, safeSites = [], liveWeather = null) {
  // 1. Per-habitation risk + vulnerability.
  const detailed = habitations.map((h) => {
    const vulnerability = assessVulnerability(h);
    const risk = assessHabitation(h, vulnerability, liveWeather || h.liveWeather);
    return { habitation: h, risk, vulnerability };
  });

  // 2. Red-zone aggregation.
  const redZones = detailed
    .map((d) => d.risk)
    .sort((a, b) => b.riskScore - a.riskScore)
    .map((r) => ({ zone: r }));

  // 3. Vulnerability summary by class.
  const vulnerabilityByClass = {};
  for (const d of detailed) {
    const cls = d.vulnerability.vulnerabilityClass;
    vulnerabilityByClass[cls] = (vulnerabilityByClass[cls] || 0) + d.vulnerability.vulnerablePopulation;
  }

  // 4. Carrying capacity for the set of safe sites against the total exposed.
  const totalExposed = detailed.reduce((a, d) => a + (d.risk.populationExposed || 0), 0);
  const capacity = assessDistrict(totalExposed, safeSites);

  // 5. Relocation priority + allocation.
  const ranked = rankHabitations(detailed);
  const allocations = allocate(ranked, safeSites);

  return {
    habitations: detailed,
    redZones,
    capacity,
    relocation: allocations,
    liveTelemetry: liveWeather ? {
      isLive: liveWeather.isLive,
      source: liveWeather.source,
      precipitationMm: liveWeather.currentPrecipitationMm,
      dailyPrecipitationSumMm: liveWeather.dailyPrecipitationSumMm,
      imdAlertLevel: liveWeather.imdAlertLevel,
      alertDescription: liveWeather.alertDescription,
      windSpeedKmh: liveWeather.windSpeedKmh,
      soilMoisture: liveWeather.soilMoisture,
      temperatureC: liveWeather.temperatureC,
      fetchedAt: liveWeather.fetchedAt,
    } : null,
    summary: {
      totalHabitations: detailed.length,
      redZoneCount: detailed.filter((d) => d.risk.riskClass === 'RED').length,
      orangeCount: detailed.filter((d) => d.risk.riskClass === 'ORANGE').length,
      yellowCount: detailed.filter((d) => d.risk.riskClass === 'YELLOW').length,
      greenCount: detailed.filter((d) => d.risk.riskClass === 'GREEN').length,
      totalPopulation: detailed.reduce((a, d) => a + (d.habitation.population || 0), 0),
      totalPopulationExposed: totalExposed,
      totalVulnerable: detailed.reduce((a, d) => a + d.vulnerability.vulnerablePopulation, 0),
      capacityAvailable: capacity.totalAvailable,
      capacityGap: capacity.capacityGap,
      vulnerabilityByClass: vulnerability_breakdown(vulnerabilityByClass),
      liveDataSource: liveWeather ? 'OpenStreetMap + Open-Meteo Real-Time Ingestion' : 'Database Registered',
    },
  };
}

function rankHabitations(detailed) {
  return detailed
    .map(({ habitation, risk, vulnerability }) => ({
      habitationId: normalizeId(habitation),
      habitation: habitation.name,
      district: habitation.district,
      lat: habitation.lat,
      lng: habitation.lng,
      population: habitation.population || 0,
      households: habitation.households || 0,
      vulnerablePopulation: habitation.vulnerablePopulation || 0,
      riskScore: risk.riskScore,
      riskClass: risk.riskClass,
      vulnerabilityScore: vulnerability.vulnerabilityScore,
      vulnerabilityClass: vulnerability.vulnerabilityClass,
      relocationScore: relocationScore(risk, vulnerability, habitation),
      needsRelocation: risk.riskClass === 'RED' || risk.riskClass === 'ORANGE',
    }))
    .sort((a, b) => b.relocationScore - a.relocationScore);
}

function relocationScore(risk, vulnerability, habitation) {
  const historyBoost = Math.min((habitation.history || []).length, 3) * 2;
  return Math.max(0, Math.min(100, risk.riskScore * 0.6 + vulnerability.vulnerabilityScore * 0.3 + historyBoost));
}

function vulnerability_breakdown(map) {
  return {
    critical: map.Critical || 0,
    high: map.High || 0,
    moderate: map.Moderate || 0,
    low: map.Low || 0,
  };
}

function normalizeId(o) {
  return o && (o.id || o._id);
}

module.exports = { runFullAnalysis, rankHabitations };