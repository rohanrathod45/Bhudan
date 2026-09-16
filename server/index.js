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
const corsOptions = {
  origin: (origin, callback) => {
    // Safely reflect origin so credentialed requests work seamlessly from any deployed frontend or mobile/tool client
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Authorization'],
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json({ limit: '2mb' }));

/* API version banner on root */
app.get('/', (req, res) =>
  res.json({
    success: true,
    service: 'BhuDan Risk & Relocation API',
    status: 'online',
    timestamp: new Date().toISOString(),
    docs: '/api/health',
  })
);

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