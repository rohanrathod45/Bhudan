const mongoose = require('mongoose');

/**
 * Connect to MongoDB if a MONGO_URI is configured.
 * When no URI is present the application runs in DEMO mode using an
 * in-memory seeded store (see ../dataAccess.js) so the platform is fully
 * demonstrable without external infrastructure and uses a real database
 * whenever one is available.
 */
async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.log('[db] No MONGO_URI set — running in DEMO mode (in-memory store).');
    return false;
  }
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[db] MongoDB connected: ${conn.connection.host}`);
    return true;
  } catch (err) {
    console.warn('[db] MongoDB connection failed, falling back to DEMO mode:', err.message);
    return false;
  }
}

module.exports = { connectDB, isMongooseReady: () => mongoose.connection.readyState === 1 };