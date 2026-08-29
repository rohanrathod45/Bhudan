const bcrypt = require('bcryptjs');
const { users } = require('../dataAccess');
const { ROLES, ROLE_LABELS } = require('../config/roles');

/** GET /api/users — list users (admin only). */
async function listUsers(req, res) {
  const rows = await users.list({});
  const clean = rows.map((u) => ({ id: u.id, name: u.name, email: u.email, role: u.role, designation: u.designation, district: u.district, active: u.active }));
  return res.json({ success: true, count: clean.length, data: clean });
}

/** POST /api/users — create a user (admin only). */
async function createUser(req, res) {
  const { name, email, password, role, designation = '', district = '', active = true } = req.body || {};
  if (!name || !email || !password || !role) {
    return res.status(400).json({ success: false, message: 'name, email, password and role are required.' });
  }
  if (!Object.values(ROLES).includes(role)) {
    return res.status(400).json({ success: false, message: `role must be one of ${Object.values(ROLES).join(', ')}.` });
  }
  const existing = await users.findByField('email', email.toLowerCase());
  if (existing) return res.status(409).json({ success: false, message: 'Email already registered.' });
  const created = await users.create({
    name,
    email: email.toLowerCase(),
    passwordHash: bcrypt.hashSync(password, 10),
    role,
    designation,
    district,
    active,
  });
  return res.status(201).json({ success: true, data: { id: created.id, name: created.name, email: created.email, role: created.role } });
}

/** PATCH /api/users/:id — update role/status etc. (admin only). */
async function updateUser(req, res) {
  const patch = { ...req.body };
  if (patch.password) {
    patch.passwordHash = bcrypt.hashSync(patch.password, 10);
    delete patch.password;
  }
  if (patch.role && !Object.values(ROLES).includes(patch.role)) {
    return res.status(400).json({ success: false, message: 'Invalid role.' });
  }
  const updated = await users.update(req.params.id, patch);
  if (!updated) return res.status(404).json({ success: false, message: 'User not found.' });
  return res.json({ success: true, data: { id: updated.id, name: updated.name, email: updated.email, role: updated.role, active: updated.active } });
}

/** DELETE /api/users/:id (admin only). */
async function removeUser(req, res) {
  const target = await users.findById(req.params.id);
  if (!target) return res.status(404).json({ success: false, message: 'User not found.' });
  if (target.id === (req.user && req.user.id)) {
    return res.status(400).json({ success: false, message: 'You cannot delete your own account.' });
  }
  const removed = await users.remove(req.params.id);
  return removed ? res.json({ success: true, message: 'User deleted.' }) : res.status(404).json({ success: false, message: 'User not found.' });
}

module.exports = { listUsers, createUser, updateUser, removeUser };