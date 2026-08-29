const mongoose = require('mongoose');

const safeSiteSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    type: { type: String, default: 'relief_camp' }, // school, relief_camp, community_hall, open_ground
    state: { type: String, default: 'Kerala' },
    district: { type: String, required: true },
    taluk: { type: String, default: '' },

    lat: { type: Number, required: true },
    lng: { type: Number, required: true },

    maxPopulationCapacity: { type: Number, default: 0 },
    currentOccupancy: { type: Number, default: 0 },
    shelterCapacity: { type: Number, default: 0 },

    // Resource availability on a 0..100 suitability scale (higher is better).
    waterAvailability: { type: Number, min: 0, max: 100, default: 50 },
    housing: { type: Number, min: 0, max: 100, default: 50 },
    healthcare: { type: Number, min: 0, max: 100, default: 50 },
    sanitation: { type: Number, min: 0, max: 100, default: 50 },
    foodLogistics: { type: Number, min: 0, max: 100, default: 50 },
    roadConnectivity: { type: Number, min: 0, max: 100, default: 50 },
    emergencyServices: { type: Number, min: 0, max: 100, default: 50 },

    status: { type: String, enum: ['operational', 'available', 'planned', 'overflow'], default: 'available' },
    dataSource: { type: String, enum: ['official', 'estimated', 'mixed'], default: 'estimated' },
    lastUpdatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

safeSiteSchema.index({ lat: 1, lng: 1 });

module.exports = mongoose.model('SafeSite', safeSiteSchema);