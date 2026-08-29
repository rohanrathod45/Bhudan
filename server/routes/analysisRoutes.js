const express = require('express');
const c = require('../controllers/analysisController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/district', protect, c.analyzeDistrict);
router.get('/habitation/:id', protect, c.analyzeHabitation);
router.get('/red-zones', protect, c.redZones);
router.get('/capacity', protect, c.capacity);
router.get('/relocation', protect, c.relocation);
router.get('/hazards', protect, c.hazards);
router.get('/meta', c.meta);
router.get('/districts', protect, c.districts);

module.exports = router;