/**
 * Unified data access layer.
 *
 * Runs in DEMO mode (in-memory seeded store) by default and transparently uses
 * MongoDB via Mongoose whenever MONGO_URI is configured & reachable.
 *
 * Each entity exposes a symmetric interface: list, findById, findByField,
 * create, update, remove, count — so controllers and the AI engines never know
 * which backend is active. Documents are always exposed with a string `id`.
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const seedData = require('./data/seedData');
const models = require('./models');
let { isMongooseReady } = require('./config/db');

function normalize(doc) {
  const d = doc && typeof doc.toObject === 'function' ? doc.toObject() : { ...doc };
  if (d && d._id) d.id = d._id.toString();
  if (d) delete d.__v;
  return d;
}

/* --------------------------- In-memory helpers ---------------------------- */
const memory = { users: [], habitations: [], safeSites: [], relocations: [] };
let seq = 1;
const nextId = () => `id_${seq++}`;

function filterRows(rows, f = {}) {
  let out = rows.map(normalize);
  if (f.district) out = out.filter((d) => String(d.district) === f.district);
  if (f.state) out = out.filter((d) => d.state === f.state);
  if (f.hazard) {
    out = out.filter((d) =>
      (d.exposure || []).some((e) => e.hazardType === f.hazard)
    );
  }
  if (f.search) {
    const s = f.search.toLowerCase();
    out = out.filter((d) => `${d.name} ${d.village || ''} ${d.district}`.toLowerCase().includes(s));
  }
  return out;
}

/* ------------------------------ Store factory ----------------------------- */
function buildStore(key, model) {
  return {
    async list(filter = {}) {
      if (!isMongooseReady()) return filterRows(memory[key], filter);
      let query = model.find();
      if (filter.search) {
        const re = new RegExp(filter.search, 'i');
        query = query.or([{ name: re }, { district: re }, { village: re }]);
      }
      if (filter.district) query = query.where('district').equals(filter.district);
      if (filter.state) query = query.where('state').equals(filter.state);
      if (filter.hazard) query = query.where('exposure.hazardType').equals(filter.hazard);
      const docs = await query.lean();
      return docs.map(normalize);
    },
    async findById(id) {
      if (!isMongooseReady()) {
        const found = memory[key].find((d) => d.id === id);
        return normalize(found || null);
      }
      const doc = await model.findById(id).lean();
      return doc ? normalize(doc) : null;
    },
    async findByField(field, value) {
      if (!isMongooseReady()) {
        const found = memory[key].find((d) => d[field] === value);
        return normalize(found || null);
      }
      const doc = await model.findOne({ [field]: value }).lean();
      return doc ? normalize(doc) : null;
    },
    async create(data) {
      if (!isMongooseReady()) {
        const created = { ...data, id: nextId(), createdAt: new Date(), updatedAt: new Date() };
        memory[key].push(created);
        return normalize(created);
      }
      const doc = await model.create(data);
      return normalize(doc);
    },
    async update(id, patch) {
      if (!isMongooseReady()) {
        const idx = memory[key].findIndex((d) => d.id === id);
        if (idx === -1) return null;
        memory[key][idx] = { ...memory[key][idx], ...patch, updatedAt: new Date() };
        return normalize(memory[key][idx]);
      }
      const doc = await model.findByIdAndUpdate(id, patch, { new: true }).lean();
      return doc ? normalize(doc) : null;
    },
    async remove(id) {
      if (!isMongooseReady()) {
        const idx = memory[key].findIndex((d) => d.id === id);
        if (idx === -1) return false;
        memory[key].splice(idx, 1);
        return true;
      }
      const res = await model.findByIdAndDelete(id);
      return !!res;
    },
    async count() {
      if (!isMongooseReady()) return memory[key].length;
      return model.countDocuments();
    },
  };
}

/* ------------------------------ Public stores ----------------------------- */
const users = buildStore('users', models.User);
const habitations = buildStore('habitations', models.Habitation);
const safeSites = buildStore('safeSites', models.SafeSite);
const relocations = buildStore('relocations', models.Relocation);

/**
 * Seed the active backend with demo data.
 */
async function seed(overrides = {}) {
  const s = { ...seedData, ...overrides };
  console.log('[data] seeding demo dataset…');
  if (mongoose.connection.readyState === 1) {
    await Promise.all([
      models.User.deleteMany({}),
      models.Habitation.deleteMany({}),
      models.SafeSite.deleteMany({}),
      models.Relocation.deleteMany({}),
    ]);
  } else {
    memory.users = [];
    memory.habitations = [];
    memory.safeSites = [];
    memory.relocations = [];
    seq = 1;
  }
  for (const u of s.users) {
    const doc = { ...u };
    if (!doc.passwordHash && doc.password) {
      doc.passwordHash = bcrypt.hashSync(doc.password, 10);
    }
    delete doc.password;
    await users.create(doc);
  }
  for (const h of s.habitations) await habitations.create(h);
  for (const st of s.safeSites) await safeSites.create(st);
  console.log(
    `[data] seeded ${s.users.length} users, ${s.habitations.length} habitations, ${s.safeSites.length} safe sites`
  );
}

module.exports = { users, habitations, safeSites, relocations, seed, stores: { users, habitations, safeSites, relocations } };