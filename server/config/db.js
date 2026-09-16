const mongoose = require('mongoose');

// Default provided MongoDB Atlas URI to ensure persistence even if environment variable is missing on cloud deployment
const DEFAULT_MONGO_URI =
  'mongodb://symprasih_db_user:cfuvyK34RDnd5x1V@ac-sbkielb-shard-00-00.ossyaiv.mongodb.net:27017,ac-sbkielb-shard-00-01.ossyaiv.mongodb.net:27017,ac-sbkielb-shard-00-02.ossyaiv.mongodb.net:27017/?ssl=true&replicaSet=atlas-9lwch2-shard-0&authSource=admin&appName=Cluster0';

let isConnecting = false;

// Attach connection lifecycle events
mongoose.connection.on('connected', () => {
  console.log('[db] MongoDB connected successfully.');
});
mongoose.connection.on('error', (err) => {
  console.error('[db] MongoDB error:', err.message);
});
mongoose.connection.on('disconnected', () => {
  console.warn('[db] MongoDB disconnected.');
});

/**
 * Connect to MongoDB Atlas. Uses process.env.MONGO_URI if set, otherwise uses the provided MongoDB Atlas database.
 */
async function connectDB() {
  if (mongoose.connection.readyState === 1) return true;
  if (isConnecting) {
    return ensureDB();
  }

  const uri = process.env.MONGO_URI || DEFAULT_MONGO_URI;
  isConnecting = true;

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
    });
    console.log(`[db] MongoDB ready on host: ${conn.connection.host}`);
    isConnecting = false;
    return true;
  } catch (err) {
    isConnecting = false;
    console.warn('[db] MongoDB connection failed, fallback to in-memory store:', err.message);
    return false;
  }
}

/**
 * Ensure the database connection is ready before servicing requests.
 * If connecting, awaits resolution instead of immediately failing.
 */
async function ensureDB() {
  if (mongoose.connection.readyState === 1) return true;
  if (mongoose.connection.readyState === 2 || isConnecting) {
    return new Promise((resolve) => {
      const onConnect = () => {
        cleanup();
        resolve(true);
      };
      const onError = () => {
        cleanup();
        resolve(false);
      };
      const timeout = setTimeout(() => {
        cleanup();
        resolve(mongoose.connection.readyState === 1);
      }, 10000);

      function cleanup() {
        clearTimeout(timeout);
        mongoose.connection.removeListener('connected', onConnect);
        mongoose.connection.removeListener('error', onError);
      }

      mongoose.connection.once('connected', onConnect);
      mongoose.connection.once('error', onError);
    });
  }
  return connectDB();
}

module.exports = {
  connectDB,
  ensureDB,
  isMongooseReady: () => mongoose.connection.readyState === 1,
};