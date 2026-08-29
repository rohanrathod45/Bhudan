/**
 * RISK / RED-ZONE ENGINE
 * -----------------------
 * Computes a multi-hazard risk score (0–100) for each habitation using a
 * transparent, weighted model:
 *
 *   risk = w1*compositeHazard + w2*exposureIndex + w3*vulnerabilityIndex
 *          + w4*infrastructureRisk + w5*terrainRisk
 *
 * Scores are binned into GREEN / YELLOW / ORANGE / RED zones.
 *
 * IMPORTANT: This is a decision-support heuristic, NOT a forecast. Every
 * result carries a confidence band and explicit limitations so it can never
 * be mistaken for a guaranteed prediction.
 */

const { clamp, round } = require('../utils/helpers');
const { getHazard } = require('./hazards');

const WEIGHTS = {
  hazard: 0.32,
  exposure: 0.22,
  vulnerability: 0.18,
  infrastructure: 0.18,
  terrain: 0.10,
};

function riskClass(score) {
  if (score >= 70) return 'RED';
  if (score >= 55) return 'ORANGE';
  if (score >= 30) return 'YELLOW';
  return 'GREEN';
}

function riskClassMeta(cls) {
  const map = {
    GREEN: { label: 'Low Risk', color: '#16a34a', severity: 1 },
    YELLOW: { label: 'Moderate Risk', color: '#ca8a04', severity: 2 },
    ORANGE: { label: 'High Risk', color: '#ea580c', severity: 3 },
    RED: { label: 'Critical / Very High Risk', color: '#dc2626', severity: 4 },
  };
  return map[cls];
}

/**
 * Composite hazard value. Uses explicit exposure entries plus historical
 * events, all normalised to 0..10 then collapsed to 0..10.
 */
function computeCompositeHazard(h) {
  const exposure = h.exposure || [];
  const history = h.history || [];

  let sum = 0;
  let count = 0;
  for (const e of exposure) {
    const sev = clamp(e.exposure, 0, 10);
    const freq = clamp(e.frequency, 0, 10);
    sum += comboSeverity(sev, freq);
    count++;
  }
  for (const ev of history) {
    const sev = clamp(ev.severity, 0, 10);
    sum += sev * 0.8; // historical events weigh slightly less than current exposure
    count += 0.8;
  }
  if (count === 0) return 0;
  let average = clamp(sum / count, 0, 10);

  // Recency & intensity boost: a severe (>=7) event in the last 5 years
  // significantly raises current hazard likelihood. This is what pushes
  // recently-devastated habitations toward RED without overreacting to old
  // or minor events.
  const nowYear = new Date().getFullYear();
  const severeHistory = (h.history || []).filter(
    (ev) => ev.year && nowYear - ev.year <= 5 && clamp(ev.severity, 0, 10) >= 7
  );
  for (const ev of severeHistory) {
    const sev = clamp(ev.severity, 0, 10);
    if (sev >= 9) average += 2.0; // catastrophic recent event
    else if (sev >= 7) average += 1.0; // major recent event
  }
  return clamp(average, 0, 10);
}

function comboSeverity(sev, freq) {
  // Combine severity and recurrence; recurrence amplifies a severe hazard.
  return clamp(sev * 0.7 + freq * 0.3, 0, 10);
}

/**
 * Population exposure: what fraction are (a) exposed and (b) harder to move
 * quickly. Higher density & vulnerable share raise exposure.
 */
function computeExposureIndex(h) {
  const population = h.population || 0;
  const vulnerable = h.vulnerablePopulation || population * 0.25;
  const area = h.areaSqKm || 1;
  const density = h.densityPerSqKm || population / Math.max(area, 0.1);

  const densityFactor = clamp(density / 6000, 0, 1); // 6000/sqm => max exposure
  const vulnerableShare = clamp(vulnerable / Math.max(population, 1), 0, 1);
  const sizeFactor = clamp(Math.log10(population + 1) / 4.3, 0, 1);
  return clamp((densityFactor * 0.4 + vulnerableShare * 0.4 + sizeFactor * 0.2) * 10, 0, 10);
}

/**
 * Infrastructure & accessibility risk (inverse of readiness).
 * criteria values are 0..10 where 10 = best; risk = (10 - value).
 */
function computeInfrastructureRisk(h) {
  const c = h.criteria || {};
  const fields = ['housingCondition', 'infrastructureCondition', 'accessibility', 'drainage', 'waterAccess', 'sanitation'];
  let sum = 0;
  for (const f of fields) sum += 10 - clamp(c[f], 0, 10);
  const avg = sum / fields.length;

  const distKm = c.emergencyFacilityKm || 20;
  const distFactor = clamp(distKm / 30, 0, 1) * 2; // 0..2

  return clamp(avg + distFactor, 0, 10);
}

/**
 * Terrain/topographic risk. Higher slopes (landslide) and very low coastal
 * terrain (flood/erosion) raise risk; terrainFactor (0..10) captures this.
 */
function computeTerrainRisk(h) {
  if (h.terrainFactor == null && h.elevation != null) {
    const elev = h.elevation;
    if (elev < 2) return 9; // coastal / low-lying
    if (elev > 800) return Math.min(10, 5 + (elev - 800) / 400); // steep highland
    return 4;
  }
  return clamp(h.terrainFactor, 0, 10);
}
/**
 * Run the full risk assessment for one habitation.
 * Accepts an optional precomputed vulnerabilityResult to avoid double work.
 */
function assessHabitation(h, vulnerabilityResult) {
  const compositeHazard = round(computeCompositeHazard(h), 2);
  const exposureIndex = round(computeExposureIndex(h), 2);
  const vulnerabilityScore = vulnerabilityResult ? vulnerabilityResult.vulnerabilityScore : null;
  const vulnerabilityIndex =
    vulnerabilityScore != null ? vulnerabilityScore / 10 : round(vulnerabilityFallback(h), 2);
  const infrastructureRisk = round(computeInfrastructureRisk(h), 2);
  const terrainRisk = round(computeTerrainRisk(h), 2);

  const raw =
    compositeHazard * WEIGHTS.hazard +
    exposureIndex * WEIGHTS.exposure +
    vulnerabilityIndex * WEIGHTS.vulnerability +
    infrastructureRisk * WEIGHTS.infrastructure +
    terrainRisk * WEIGHTS.terrain;

  // Sub-scores are on a 0..10 scale; rescale the weighted sum to 0..100.
  const riskScore = round(clamp(raw * 10, 0, 100), 1);
  const cls = riskClass(riskScore);
  const meta = riskClassMeta(cls);

  const mainHazards = (h.exposure || [])
    .map((e) => getHazard(e.hazardType).label)
    .filter((v, i, a) => a.indexOf(v) === i);

  return {
    habitationId: h.id || h._id,
    habitation: h.name,
    district: h.district,
    state: h.state,
    lat: h.lat,
    lng: h.lng,
    riskScore,
    riskClass: cls,
    riskLabel: meta.label,
    color: meta.color,
    severity: meta.severity,
    mainHazards,
    exposureIndex,
    vulnerabilityIndex: round(vulnerabilityIndex, 2),
    infrastructureRisk,
    terrainRisk,
    compositeHazard,
    population: h.population || 0,
    populationExposed: round((h.population || 0) * (0.5 + exposureIndex / 20), 0),
    dataSource: h.dataSource || 'estimated',
    lastUpdatedAt: h.lastUpdatedAt || new Date(),
    confidence: computeConfidence(h),
    limitations: buildLimitations(h),
  };
}

function vulnerabilityFallback(h) {
  const pop = h.population || 0;
  const vulnerable = h.vulnerablePopulation || pop * 0.25;
  const share = vulnerable / Math.max(pop, 1);
  const c = h.criteria || {};
  const inf =
    10 - clamp(c.housingCondition, 0, 10) +
    (10 - clamp(c.accessibility, 0, 10));
  const distFactor = clamp((c.emergencyFacilityKm || 20) / 30, 0, 1);
  return clamp(share * 10 + inf / 2 + distFactor * 2, 0, 10);
}

function computeConfidence(h) {
  const source = h.dataSource || 'estimated';
  const revised = !!h.revised;
  const historyCount = (h.history || []).length;
  let base = source === 'official' ? 0.85 : source === 'mixed' ? 0.7 : 0.5;
  if (revised) base += 0.08;
  if (historyCount > 0) base += 0.05;
  return round(clamp(base, 0, 1), 2);
}

function buildLimitations(h) {
  const lims = [];
  if ((h.dataSource || 'estimated') !== 'official') lims.push('Source data partially estimated, not verified on ground.');
  if ((h.history || []).length === 0) lims.push('No local historical event records available.');
  lims.push('Result is a decision-support heuristic, not a guaranteed prediction.');
  return lims;
}

module.exports = { assessHabitation, riskClass, riskClassMeta, WEIGHTS };