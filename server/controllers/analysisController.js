const { habitations, safeSites } = require('../dataAccess');
const { runFullAnalysis } = require('../services/analysisService');
const { assessHabitation } = require('../services/riskEngine');
const { assessVulnerability } = require('../services/vulnerabilityEngine');
const { assessSite, assessDistrict } = require('../services/capacityEngine');
const { activeHazards, allHazards } = require('../services/hazards');
const { DISTRICT_REGISTRY } = require('../data/india');

const DEFAULTS = { district: 'Wayanad' };

async function loadContext(district) {
  const h = await habitations.list({ district });
  const s = await safeSites.list({ district });
  return { habitations: h, safeSites: s };
}

/**
 * GET /api/analysis/district?district=X
 * Full decision-support pipeline for a district.
 */
async function analyzeDistrict(req, res) {
  const district = req.query.district || DEFAULTS.district;
  const { habitations: hb, safeSites: ss } = await loadContext(district);
  if (!hb.length) {
    return res.status(200).json({ success: true, district, note: 'No habitation data for this district.', analysis: null });
  }
  const analysis = runFullAnalysis(hb, ss);
  return res.json({ success: true, district, analysis });
}

/**
 * GET /api/analysis/habitation/:id
 * Deep-dive assessment (risk + vulnerability) for a single habitation.
 */
async function analyzeHabitation(req, res) {
  const h = await habitations.findById(req.params.id);
  if (!h) return res.status(404).json({ success: false, message: 'Habitation not found.' });
  const vulnerability = assessVulnerability(h);
  const risk = assessHabitation(h, vulnerability);
  return res.json({ success: true, data: { habitation: h, risk, vulnerability } });
}

/**
 * GET /api/analysis/red-zones?district=X
 * Only the red/orange zone list.
 */
async function redZones(req, res) {
  const district = req.query.district || DEFAULTS.district;
  const { habitations: hb, safeSites: ss } = await loadContext(district);
  const analysis = runFullAnalysis(hb, ss);
  const zones = analysis.redZones
    .filter((r) => r.zone.riskClass === 'RED' || r.zone.riskClass === 'ORANGE')
    .map((r) => r.zone);
  return res.json({ success: true, district, count: zones.length, data: zones });
}

/**
 * GET /api/analysis/capacity?district=X
 * Carrying-capacity overview for a district's safe sites.
 */
async function capacity(req, res) {
  const district = req.query.district || DEFAULTS.district;
  const { habitations: hb, safeSites: ss } = await loadContext(district);
  const totalExposed = hb.reduce((a, h) => a + Math.round((h.population || 0) * 0.6), 0);
  const result = assessDistrict(totalExposed, ss);
  return res.json({ success: true, district, data: result });
}

/**
 * GET /api/analysis/relocation?district=X
 * Relocation priority plan + safe-site assignment.
 */
async function relocation(req, res) {
  const district = req.query.district || DEFAULTS.district;
  const { habitations: hb, safeSites: ss } = await loadContext(district);
  const analysis = runFullAnalysis(hb, ss);
  return res.json({ success: true, district, data: { priority: analysis.relocation, summary: analysis.summary } });
}

/**
 * GET /api/analysis/hazards
 * Hazard catalogue.
 */
async function hazards(req, res) {
  return res.json({ success: true, active: activeHazards(), all: allHazards() });
}

/**
 * GET /api/analysis/meta
 * Reference material (risk classes, vuln classes, roles).
 */
async function meta(req, res) {
  return res.json({
    success: true,
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
 * All districts with coordinates (for dropdowns + map centers).
 */
async function districts(req, res) {
  return res.json({
    success: true,
    count: DISTRICT_REGISTRY.length,
    data: DISTRICT_REGISTRY.map((d) => ({
      name: d[0],
      state: d[1],
      lat: d[2],
      lng: d[3],
      region: d[4],
    })),
  });
}

module.exports = { analyzeDistrict, analyzeHabitation, redZones, capacity, relocation, hazards, meta, districts };