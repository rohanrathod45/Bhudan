const express = require('express');
const authRoutes = require('./authRoutes');
const dataRoutes = require('./dataRoutes');
const analysisRoutes = require('./analysisRoutes');
const relocationRoutes = require('./relocationRoutes');
const userRoutes = require('./userRoutes');
const liveRoutes = require('./liveRoutes');

const router = express.Router();

router.get('/health', (req, res) => res.json({ success: true, status: 'ok', time: new Date().toISOString() }));

router.use('/api/auth', authRoutes);
router.use('/api', dataRoutes);
router.use('/api/analysis', analysisRoutes);
router.use('/api/relocation', relocationRoutes);
router.use('/api/users', userRoutes);
router.use('/api/live', liveRoutes);

module.exports = router;