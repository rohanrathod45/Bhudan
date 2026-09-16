const express = require('express');
const authRoutes = require('./authRoutes');
const dataRoutes = require('./dataRoutes');
const analysisRoutes = require('./analysisRoutes');
const relocationRoutes = require('./relocationRoutes');
const userRoutes = require('./userRoutes');
const liveRoutes = require('./liveRoutes');

const { isMongooseReady } = require('../config/db');

const router = express.Router();

const getHealthStatus = (req, res) =>
  res.json({
    success: true,
    status: 'ok',
    database: isMongooseReady() ? 'mongodb_connected' : 'in_memory_demo',
    time: new Date().toISOString(),
  });

router.get('/health', getHealthStatus);
router.get('/api/health', getHealthStatus);

router.use('/api/auth', authRoutes);
router.use('/api', dataRoutes);
router.use('/api/analysis', analysisRoutes);
router.use('/api/relocation', relocationRoutes);
router.use('/api/users', userRoutes);
router.use('/api/live', liveRoutes);

module.exports = router;