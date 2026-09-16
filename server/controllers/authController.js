const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { users } = require('../dataAccess');
const { ROLES } = require('../config/roles');
const { isMongooseReady } = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'bhudan_sih2026_dev_secret_key_please_change_in_production';
const JWT_EXPIRES = process.env.JWT_EXPIRES || '7d';

function signToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      role: user.role,
      name: user.name,
      email: user.email,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES }
  );
}

/* ------------------------------- Register ------------------------------- */
async function register(req, res) {
  try {
    const { name, email, password, role = ROLES.VIEWER, designation = '', district = '' } = req.body || {};

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Full name is required.' });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, message: 'Email address is required.' });
    }
    if (!password) {
      return res.status(400).json({ success: false, message: 'Password is required.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
    }

    const validRoles = Object.values(ROLES);
    const normalizedRole = validRoles.includes(role) ? role : ROLES.VIEWER;
    const trimmedEmail = email.trim().toLowerCase();

    const existing = await users.findByField('email', trimmedEmail);
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists. Please sign in instead.',
      });
    }

    // Secure async password hashing using bcrypt
    const passwordHash = await bcrypt.hash(password, 10);

    const created = await users.create({
      name: name.trim(),
      email: trimmedEmail,
      passwordHash,
      role: normalizedRole,
      designation: designation ? designation.trim() : '',
      district: district ? district.trim() : '',
      active: true,
    });

    const safeUser = {
      id: created.id,
      name: created.name,
      email: created.email,
      role: created.role,
      designation: created.designation || '',
      district: created.district || '',
    };

    // Return JWT token so user can be automatically authenticated immediately
    const token = signToken(safeUser);

    return res.status(201).json({
      success: true,
      token,
      user: safeUser,
      message: 'Account registered successfully.',
    });
  } catch (err) {
    console.error('[auth] register error:', err);
    if (err.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists.',
      });
    }
    return res.status(500).json({
      success: false,
      message: 'An error occurred during registration. Please try again.',
      detail: err.message,
    });
  }
}

/* -------------------------------- Login -------------------------------- */
async function login(req, res) {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const trimmedEmail = email.trim().toLowerCase();
    const user = await users.findByField('email', trimmedEmail);

    if (!user || !user.passwordHash) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    // Async bcrypt comparison
    const passwordValid = await bcrypt.compare(password, user.passwordHash);
    if (!passwordValid) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    if (user.active === false) {
      return res.status(403).json({
        success: false,
        message: 'Account has been disabled. Please contact an administrator.',
      });
    }

    const token = signToken(user);
    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      designation: user.designation || '',
      district: user.district || '',
    };

    return res.json({
      success: true,
      token,
      user: safeUser,
      message: 'Signed in successfully.',
    });
  } catch (err) {
    console.error('[auth] login error:', err);
    return res.status(500).json({
      success: false,
      message: 'An error occurred during login. Please try again.',
      detail: err.message,
    });
  }
}

/* ------------------------------- Get me -------------------------------- */
async function getMe(req, res) {
  try {
    const user = await users.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      designation: user.designation || '',
      district: user.district || '',
    };
    return res.json({ success: true, user: safeUser });
  } catch (err) {
    console.error('[auth] getMe error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve profile.', detail: err.message });
  }
}

/* ----------------------------- Auth status ----------------------------- */
async function getAuthStatus(req, res) {
  return res.json({
    success: true,
    database: isMongooseReady() ? 'mongodb_connected' : 'in_memory_fallback',
    timestamp: new Date().toISOString(),
  });
}

module.exports = { register, login, getMe, getAuthStatus, JWT_SECRET, signToken };