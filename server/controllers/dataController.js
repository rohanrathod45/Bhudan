const { habitations, safeSites } = require('../dataAccess');

/**
 * GET /api/habitations?district=&search=
 */
async function listHabitations(req, res) {
  const filter = { district: req.query.district, search: req.query.search };
  const rows = await habitations.list(filter);
  return res.json({ success: true, count: rows.length, data: rows });
}

async function getHabitation(req, res) {
  const row = await habitations.findById(req.params.id);
  if (!row) return res.status(404).json({ success: false, message: 'Habitation not found.' });
  return res.json({ success: true, data: row });
}

async function createHabitation(req, res) {
  const body = { ...req.body };
  const required = ['name', 'district', 'lat', 'lng'];
  for (const k of required) {
    if (body[k] == null || body[k] === '') {
      return res.status(400).json({ success: false, message: `${k} is required.` });
    }
  }
  if (!body.dataSource) body.dataSource = 'estimated';
  const created = await habitations.create(body);
  return res.status(201).json({ success: true, data: created });
}

async function updateHabitation(req, res) {
  const body = { ...req.body };
  body.lastUpdatedAt = new Date();
  const updated = await habitations.update(req.params.id, body);
  if (!updated) return res.status(404).json({ success: false, message: 'Habitation not found.' });
  return res.json({ success: true, data: updated });
}

async function removeHabitation(req, res) {
  const removed = await habitations.remove(req.params.id);
  if (!removed) return res.status(404).json({ success: false, message: 'Habitation not found.' });
  return res.json({ success: true, message: 'Habitation deleted.' });
}

/* ------------------------------- Safe sites ----------------------------- */

async function listSafeSites(req, res) {
  const filter = { district: req.query.district, search: req.query.search };
  const rows = await safeSites.list(filter);
  return res.json({ success: true, count: rows.length, data: rows });
}

async function getSafeSite(req, res) {
  const row = await safeSites.findById(req.params.id);
  if (!row) return res.status(404).json({ success: false, message: 'Safe site not found.' });
  return res.json({ success: true, data: row });
}

async function createSafeSite(req, res) {
  const body = { ...req.body };
  const required = ['name', 'district', 'lat', 'lng'];
  for (const k of required) {
    if (body[k] == null || body[k] === '') {
      return res.status(400).json({ success: false, message: `${k} is required.` });
    }
  }
  if (body.dataSource == null) body.dataSource = 'estimated';
  const created = await safeSites.create(body);
  return res.status(201).json({ success: true, data: created });
}

async function updateSafeSite(req, res) {
  const body = { ...req.body };
  body.lastUpdatedAt = new Date();
  const updated = await safeSites.update(req.params.id, body);
  if (!updated) return res.status(404).json({ success: false, message: 'Safe site not found.' });
  return res.json({ success: true, data: updated });
}

async function removeSafeSite(req, res) {
  const removed = await safeSites.remove(req.params.id);
  if (!removed) return res.status(404).json({ success: false, message: 'Safe site not found.' });
  return res.json({ success: true, message: 'Safe site deleted.' });
}

module.exports = {
  listHabitations,
  getHabitation,
  createHabitation,
  updateHabitation,
  removeHabitation,
  listSafeSites,
  getSafeSite,
  createSafeSite,
  updateSafeSite,
  removeSafeSite,
};