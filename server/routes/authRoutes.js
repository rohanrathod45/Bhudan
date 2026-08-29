const express = require('express');
const { register, login, getMe, demoHint } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.get('/demo', demoHint);

module.exports = router;