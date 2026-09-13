const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { users } = require('../dataAccess');
const { ROLES } = require('../config/roles');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';
const JWT_EXPIRES = process.env.JWT_EXPIRES || '7d';

function signToken(user) {
  return jwt.sign({ sub: user.id, role: user.role, name: user.name }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES,
  });
}

/* ------------------------------- Register ------------------------------- */
async function register(req, res) {
  const { name, email, password, role = ROLES.VIEWER, designation = '', district = '' } = req.body || {};
  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
  }
  if (password.length < 6) {
    return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
  }
  const validRoles = Object.values(ROLES);
  const normalizedRole = validRoles.includes(role) ? role : ROLES.VIEWER;

  const trimmedEmail = email.trim().toLowerCase();
  const existing = await users.findByField('email', trimmedEmail);
  if (existing) {
    return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
  }

  const passwordHash = bcrypt.hashSync(password, 10);
  const created = await users.create({
    name: name.trim(),
    email: trimmedEmail,
    passwordHash,
    role: normalizedRole,
    designation: designation.trim(),
    district: district.trim(),
  });

  const safeUser = {
    id: created.id,
    name: created.name,
    email: created.email,
    role: created.role,
    designation: created.designation,
    district: created.district,
  };

  return res.status(201).json({ success: true, user: safeUser, message: 'Account registered successfully.' });
}

/* -------------------------------- Login -------------------------------- */
async function login(req, res) {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required.' });
  }
  const trimmedEmail = email.trim().toLowerCase();
  const user = await users.findByField('email', trimmedEmail);
  if (!user || !user.passwordHash) {
    return res.status(401).json({ success: false, message: 'Invalid email or password.' });
  }
  const ok = bcrypt.compareSync(password, user.passwordHash);
  if (!ok) {
    return res.status(401).json({ success: false, message: 'Invalid email or password.' });
  }
  if (user.active === false) {
    return res.status(403).json({ success: false, message: 'Account has been disabled. Please contact administrator.' });
  }
  const token = signToken(user);
  const safeUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    designation: user.designation,
    district: user.district,
  };
  return res.json({ success: true, token, user: safeUser });
}

/* ------------------------------- Get me -------------------------------- */
async function getMe(req, res) {
  const user = await users.findById(req.user.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
  const safeUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    designation: user.designation,
    district: user.district,
  };
  return res.json({ success: true, user: safeUser });
}

module.exports = { register, login, getMe };