const express = require('express');
const c = require('../controllers/dataController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Habitations — all authenticated roles can read.
router.get('/habitations', protect, c.listHabitations);
router.get('/habitations/:id', protect, c.getHabitation);
// Writes require at least Analyst.
router.post('/habitations', protect, authorize('>=analyst'), c.createHabitation);
router.put('/habitations/:id', protect, authorize('>=analyst'), c.updateHabitation);
router.delete('/habitations/:id', protect, authorize('>=analyst'), c.removeHabitation);

// Safe sites
router.get('/sites', protect, c.listSafeSites);
router.get('/sites/:id', protect, c.getSafeSite);
router.post('/sites', protect, authorize('>=analyst'), c.createSafeSite);
router.put('/sites/:id', protect, authorize('>=analyst'), c.updateSafeSite);
router.delete('/sites/:id', protect, authorize('>=analyst'), c.removeSafeSite);

module.exports = router;