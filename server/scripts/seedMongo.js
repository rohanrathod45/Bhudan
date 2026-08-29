/**
 * Manual Mongo seeding script.
 * Run: npm run seed (in server/) — connects to MONGO_URI if set, otherwise
 * prints instructions. demo_seed_env must be exported if none present.
 */
require('dotenv').config();
const mongoose = require('mongoose');
const { seed } = require('../dataAccess');

async function run() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.log('No MONGO_URI set. Running in-memory demo (nothing to seed persistently).');
    await seed();
    console.log('Demo store populated.');
    return;
  }
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
  await seed();
  await mongoose.disconnect();
  console.log('Mongo seeding complete.');
}

run().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});