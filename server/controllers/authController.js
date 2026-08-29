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
    return res.status(400).json({ success: false, message: 'name, email and password are required.' });
  }
  // Public registration is only allowed for low-privilege roles.
  const allowed = [ROLES.VIEWER, ROLES.FIELD_OFFICER];
  if (!allowed.includes(role)) {
    return res.status(403).json({ success: false, message: 'Self-registration is limited to Viewer and Field Officer roles.' });
  }
  const existing = await users.findByField('email', email.toLowerCase());
  if (existing) {
    return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
  }
  const passwordHash = bcrypt.hashSync(password, 10);
  const created = await users.create({
    name,
    email: email.toLowerCase(),
    passwordHash,
    role,
    designation,
    district,
  });
  return res.status(201).json({ success: true, user: created });
}

/* -------------------------------- Login -------------------------------- */
async function login(req, res) {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'email and password are required.' });
  }
  const user = await users.findByField('email', email.toLowerCase());
  if (!user || !user.passwordHash) {
    return res.status(401).json({ success: false, message: 'Invalid credentials.' });
  }
  const ok = bcrypt.compareSync(password, user.passwordHash);
  if (!ok) {
    return res.status(401).json({ success: false, message: 'Invalid credentials.' });
  }
  if (user.active === false) {
    return res.status(403).json({ success: false, message: 'Account disabled.' });
  }
  const token = signToken(user);
  return res.json({ success: true, token, user: user });
}

/* ------------------------------- Get me -------------------------------- */
async function getMe(req, res) {
  const user = await users.findById(req.user.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
  return res.json({ success: true, user });
}

/* ------------------------------- (demo) login hint ---------------------- */
async function demoHint(req, res) {
  return res.json({
    success: true,
    accounts: [
      { role: 'admin', email: 'admin@bhudan.gov.in', password: 'Admin@12345' },
      { role: 'disaster_authority', email: 'collector@bhudan.gov.in', password: 'Disaster@12345' },
      { role: 'analyst', email: 'analyst@bhudan.gov.in', password: 'Analyst@12345' },
      { role: 'field_officer', email: 'field@bhudan.gov.in', password: 'Field@12345' },
      { role: 'viewer', email: 'viewer@bhudan.gov.in', password: 'Viewer@12345' },
    ],
  });
}

module.exports = { register, login, getMe, demoHint };