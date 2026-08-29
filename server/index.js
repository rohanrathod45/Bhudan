const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/db');
const routes = require('./routes');
const { seed } = require('./dataAccess');

const app = express();
const PORT = process.env.PORT || 5000;

/* Middleware */
app.use(cors({ origin: process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',') : '*' }));
app.use(express.json({ limit: '2mb' }));

/* API version banner on root */
app.get('/', (req, res) => res.json({ success: true, service: 'BhuDan Risk & Relocation API', docs: '/api/health' }));

/* Routes */
app.use(routes);

/* 404 + error handlers */
app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found.' }));
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('[error]', err.message, err.stack);
  res.status(500).json({ success: false, message: 'Internal server error.', detail: err.message });
});

async function start() {
  await connectDB();

  // Seed demo dataset in demo mode (or when flagged). Tolerates failures in production.
  const shouldSeed = process.env.DEMO_SEED !== 'false';
  if (shouldSeed) {
    try {
      await seed();
    } catch (e) {
      console.warn('[seed] demo seed skipped:', e.message);
    }
  }

  app.listen(PORT, () => console.log(`[server] API running on http://localhost:${PORT}`));
}

start().catch((e) => {
  console.error('[server] failed to start:', e);
  process.exit(1);
});

module.exports = app;