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
  if (f.district && f.district !== 'All') out = out.filter((d) => String(d.district).toLowerCase() === String(f.district).toLowerCase());
  if (f.state && f.state !== 'ALL' && f.state !== 'All') out = out.filter((d) => String(d.state).toLowerCase() === String(f.state).toLowerCase());
  if (f.hazard) {
    out = out.filter((d) =>
      (d.exposure || []).some((e) => e.hazardType === f.hazard)
    );
  }
  if (f.search) {
    const s = f.search.trim().toLowerCase();
    out = out.filter((d) => `${d.name || ''} ${d.village || ''} ${d.district || ''} ${d.state || ''} ${d.taluk || ''} ${d.type || ''}`.toLowerCase().includes(s));
  }
  return out;
}

/* ------------------------------ Store factory ----------------------------- */
function buildStore(key, model) {
  return {
    async list(filter = {}) {
      if (!isMongooseReady()) return filterRows(memory[key], filter);
      let query = model.find();
      if (filter.search && String(filter.search).trim()) {
        const re = new RegExp(String(filter.search).trim(), 'i');
        query = query.or([{ name: re }, { district: re }, { village: re }, { state: re }, { taluk: re }, { type: re }]);
      }
      if (filter.district) {
        const distVal = typeof filter.district === 'object' && filter.district !== null ? filter.district.district : filter.district;
        if (typeof distVal === 'string' && distVal.trim() && distVal !== 'All') {
          query = query.where('district').equals(distVal.trim());
        }
      }
      if (filter.state && typeof filter.state === 'string' && filter.state !== 'ALL' && filter.state !== 'All') {
        query = query.where('state').equals(filter.state.trim());
      }
      if (filter.hazard && typeof filter.hazard === 'string') {
        query = query.where('exposure.hazardType').equals(filter.hazard);
      }
      const docs = await query.lean();
      return docs.map(normalize);
    },
    async findById(id) {
      if (!id) return null;
      if (!isMongooseReady()) {
        const found = memory[key].find((d) => String(d.id) === String(id));
        return normalize(found || null);
      }
      try {
        if (mongoose.isValidObjectId(id)) {
          const doc = await model.findById(id).lean();
          if (doc) return normalize(doc);
        }
        const doc = await model.findOne({ $or: [{ name: id }, { email: id }] }).lean();
        return doc ? normalize(doc) : null;
      } catch (e) {
        return null;
      }
    },
    async findByField(field, value) {
      if (!isMongooseReady()) {
        const found = memory[key].find((d) => d[field] === value);
        return normalize(found || null);
      }
      try {
        const doc = await model.findOne({ [field]: value }).lean();
        return doc ? normalize(doc) : null;
      } catch (e) {
        return null;
      }
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
      if (!id) return null;
      if (!isMongooseReady()) {
        const idx = memory[key].findIndex((d) => String(d.id) === String(id));
        if (idx === -1) return null;
        memory[key][idx] = { ...memory[key][idx], ...patch, updatedAt: new Date() };
        return normalize(memory[key][idx]);
      }
      try {
        if (mongoose.isValidObjectId(id)) {
          const doc = await model.findByIdAndUpdate(id, patch, { new: true }).lean();
          if (doc) return normalize(doc);
        }
        const doc = await model.findOneAndUpdate({ name: id }, patch, { new: true }).lean();
        return doc ? normalize(doc) : null;
      } catch (e) {
        return null;
      }
    },
    async remove(id) {
      if (!id) return false;
      if (!isMongooseReady()) {
        const idx = memory[key].findIndex((d) => String(d.id) === String(id));
        if (idx === -1) return false;
        memory[key].splice(idx, 1);
        return true;
      }
      try {
        if (mongoose.isValidObjectId(id)) {
          const res = await model.findByIdAndDelete(id);
          if (res) return true;
        }
        const res = await model.findOneAndDelete({ name: id });
        return !!res;
      } catch (e) {
        return false;
      }
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
 * Seed the active backend with initial users and dataset if empty.
 */
async function seed(overrides = {}) {
  const s = { ...seedData, ...overrides };
  console.log('[data] checking dataset initialization…');
  if (mongoose.connection.readyState === 1) {
    const userCount = await models.User.countDocuments();
    if (userCount === 0) {
      const preparedUsers = s.users.map((u) => {
        const doc = { ...u };
        if (!doc.passwordHash && doc.password) {
          doc.passwordHash = bcrypt.hashSync(doc.password, 10);
        }
        delete doc.password;
        return doc;
      });
      await models.User.insertMany(preparedUsers);
      console.log(`[data] initialized ${preparedUsers.length} system users into MongoDB`);
    }

    const habCount = await models.Habitation.countDocuments();
    if (habCount === 0 && s.habitations && s.habitations.length) {
      await Promise.all([
        models.Habitation.insertMany(s.habitations),
        models.SafeSite.insertMany(s.safeSites),
      ]);
      console.log(`[data] loaded ${s.habitations.length} habitations, ${s.safeSites.length} safe sites into MongoDB`);
    }
  } else {
    if (memory.users.length === 0) {
      seq = 1;
      for (const u of s.users) {
        const doc = { ...u };
        if (!doc.passwordHash && doc.password) {
          doc.passwordHash = bcrypt.hashSync(doc.password, 10);
        }
        delete doc.password;
        await users.create(doc);
      }
    }
    if (memory.habitations.length === 0 && s.habitations) {
      for (const h of s.habitations) await habitations.create(h);
      for (const st of s.safeSites) await safeSites.create(st);
    }
  }
}

module.exports = { users, habitations, safeSites, relocations, seed, stores: { users, habitations, safeSites, relocations } };