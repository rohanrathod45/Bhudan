const express = require('express');
const { register, login, getMe, getAuthStatus } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/status', getAuthStatus);
router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);

module.exports = router;