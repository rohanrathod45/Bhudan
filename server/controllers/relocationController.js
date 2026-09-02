const { relocations, habitations, safeSites } = require('../dataAccess');
const { runFullAnalysis } = require('../services/analysisService');

/**
 * GET /api/relocation   — list saved plans.
 */
async function listPlans(req, res) {
  let district = req.query.district;
  if (typeof district === 'object' && district !== null) district = district.district;
  const filter = {};
  if (district && district !== 'All' && typeof district === 'string') filter.district = district;
  const rows = await relocations.list(filter);
  return res.json({ success: true, count: rows.length, data: rows });
}

/**
 * POST /api/relocation/generate  — run engine, persist the resulting plan to database.
 */
async function generatePlan(req, res) {
  try {
    let district = req.body.district;
    if (typeof district === 'object' && district !== null) district = district.district;
    if (!district || district === 'All') {
      return res.status(400).json({ success: false, message: 'Please select a specific district to generate a relocation plan.' });
    }

    let hb = await habitations.list({ district });
    let ss = await safeSites.list({ district });

    // On-demand load/generation if district data isn't in store yet
    if (!hb.length) {
      const { buildDistrict } = require('../data/india');
      const generated = buildDistrict(district);
      if (generated) {
        for (const hab of generated.habitations) {
          await habitations.create(hab);
        }
        for (const site of generated.safeSites) {
          await safeSites.create(site);
        }
        hb = await habitations.list({ district });
        ss = await safeSites.list({ district });
      }
    }

    if (!hb.length) return res.status(400).json({ success: false, message: `No habitations found for district ${district}.` });

    const analysis = runFullAnalysis(hb, ss);
    let ranked = (analysis.relocation || []).filter((r) => r.needsRelocation);
    if (!ranked.length && (analysis.relocation || []).length > 0) {
      ranked = analysis.relocation;
    }

    const plans = [];
    for (const r of ranked) {
      const habId = String(r.habitationId || r.id || r._id || `hab_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`);
      const hab = hb.find((h) => String(h.id || h._id) === habId) || hb.find((h) => h.name === r.habitation);
      
      const cleanAssignments = (r.assignments || []).map((a) => ({
        safeSiteId: String(a.safeSiteId || a.id || a._id || ''),
        safeSiteName: String(a.safeSiteName || a.name || 'Designated Shelter'),
        assignedPopulation: Number(a.assignedPopulation) || 0,
        assignedHouseholds: Number(a.assignedHouseholds) || 0,
        distanceKm: Number(a.distanceKm) || 0,
        transitMode: String(a.transitMode || 'road'),
        etaMinutes: Number(a.etaMinutes) || 0,
      }));

      const planData = {
        habitationId: habId,
        habitationName: String(r.habitation || (hab && hab.name) || 'Habitation Zone'),
        district: String(district),
        state: String((hab && hab.state) || 'India'),
        riskScore: Number(r.riskScore) || 0,
        riskClass: String(r.riskClass || 'YELLOW'),
        populationToRelocate: Number(r.population) || 0,
        householdsToRelocate: Number(r.households) || 0,
        populationNeedingShelter: Number(r.vulnerablePopulation) || 0,
        unallocatedPopulation: Number(r.unallocatedPopulation) || 0,
        capacityAvailable: Math.max(0, Number(analysis.capacity?.totalAvailable) || 0),
        relativeRiskScore: Number(r.relocationScore) || 0,
        assignments: cleanAssignments,
        strategy: String(r.strategy || 'Phased evacuation to nearest safe sites'),
        constraints: Array.isArray(r.constraints) ? r.constraints : [],
        recommendedActions: buildRecommendedActions(r, analysis),
        feasibility: Number(r.feasible) || 100,
        status: 'proposed',
        createdBy: req.user ? (req.user.name || req.user.email) : 'System Analyst',
      };

      const plan = await relocations.create(planData);
      plans.push(plan);
    }
    return res.status(201).json({ success: true, count: plans.length, data: plans, summary: analysis.summary });
  } catch (err) {
    console.error('[generatePlan error]', err);
    return res.status(500).json({ success: false, message: 'Failed to generate and save plan.', detail: err.message });
  }
}

function buildRecommendedActions(r, capacity) {
  const actions = [];
  if (r.feasible >= 100) actions.push('Execute planned shelter-assignment immediately.');
  else actions.push('Identify additional safe sites to close the capacity gap.');
  if (r.unallocatedPopulation > 0) actions.push(`Accommodate ${r.unallocatedPopulation} people at interim shelters pending site readiness.`);
  actions.push('Verify field situation with local authorities before issuing orders.');
  return actions;
}

/**
 * GET /api/relocation/:id
 */
async function getPlan(req, res) {
  const plan = await relocations.findById(req.params.id);
  if (!plan) return res.status(404).json({ success: false, message: 'Plan not found.' });
  return res.json({ success: true, data: plan });
}

/**
 * PATCH /api/relocation/:id/status
 * Approve / reject / update status.
 */
async function updateStatus(req, res) {
  const { status } = req.body || {};
  const allowed = ['proposed', 'under_review', 'approved', 'executing', 'rejected'];
  if (!allowed.includes(status)) return res.status(400).json({ success: false, message: 'Invalid status.' });
  const patch = { status };
  if (status === 'approved') {
    patch.approvedBy = req.user ? req.user.name : '';
    patch.approvedAt = new Date();
  }
  const updated = await relocations.update(req.params.id, patch);
  if (!updated) return res.status(404).json({ success: false, message: 'Plan not found.' });
  return res.json({ success: true, data: updated });
}

/**
 * DELETE /api/relocation/:id
 */
async function deletePlan(req, res) {
  const deleted = await relocations.remove(req.params.id);
  if (!deleted) return res.status(404).json({ success: false, message: 'Plan not found.' });
  return res.json({ success: true, message: 'Plan deleted successfully.' });
}

module.exports = { listPlans, generatePlan, getPlan, updateStatus, deletePlan };