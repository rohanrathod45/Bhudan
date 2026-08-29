const express = require('express');
const c = require('../controllers/relocationController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, c.listPlans);
router.get('/:id', protect, c.getPlan);
router.post('/generate', protect, authorize('>=analyst'), c.generatePlan);
router.patch('/:id/status', protect, authorize('>=disaster_authority'), c.updateStatus);

module.exports = router;