const { relocations, habitations, safeSites } = require('../dataAccess');
const { runFullAnalysis } = require('../services/analysisService');

/**
 * GET /api/relocation   — list saved plans.
 */
async function listPlans(req, res) {
  const rows = await relocations.list({ district: req.query.district });
  return res.json({ success: true, count: rows.length, data: rows });
}

/**
 * POST /api/relocation/generate  — run engine, persist the resulting plan.
 */
async function generatePlan(req, res) {
  const district = req.body.district || 'Wayanad';
  const hb = await habitations.list({ district });
  const ss = await safeSites.list({ district });
  if (!hb.length) return res.status(400).json({ success: false, message: 'No habitations for this district.' });

  const analysis = runFullAnalysis(hb, ss);
  const ranked = analysis.relocation.filter((r) => r.needsRelocation);

  const plans = [];
  for (const r of ranked) {
    const hab = hb.find((h) => (h.id || h._id) === r.habitationId);
    const plan = await relocations.create({
      habitationId: r.habitationId,
      habitationName: r.habitation,
      district,
      state: (hab && hab.state) || 'Kerala',
      riskScore: r.riskScore,
      riskClass: r.riskClass,
      populationToRelocate: r.population,
      householdsToRelocate: r.households,
      populationNeedingShelter: r.vulnerablePopulation,
      capacityAvailable: Math.max(0, analysis.capacity.totalAvailable),
      relativeRiskScore: r.relocationScore,
      assignments: r.assignments,
      strategy: r.strategy,
      constraints: r.constraints,
      recommendedActions: buildRecommendedActions(r, analysis),
      feasibility: r.feasible,
      status: 'proposed',
      createdBy: req.user ? req.user.name : 'system',
    });
    plans.push(plan);
  }
  return res.status(201).json({ success: true, count: plans.length, data: plans, summary: analysis.summary });
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

module.exports = { listPlans, generatePlan, getPlan, updateStatus };