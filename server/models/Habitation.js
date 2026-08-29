const mongoose = require('mongoose');

const exposureSchema = new mongoose.Schema(
  {
    hazardType: { type: String, required: true }, // flood, landslide, coastal_erosion, cloudburst
    exposure: { type: Number, min: 0, max: 10, default: 0 }, // 0..10 severity of exposure
    frequency: { type: Number, min: 0, max: 10, default: 0 }, // 0..10 recurrence
    distanceKm: { type: Number, default: 0 },
  },
  { _id: false }
);

const historicEventSchema = new mongoose.Schema(
  {
    hazardType: { type: String, default: '' },
    year: { type: Number, default: null },
    severity: { type: Number, min: 0, max: 10, default: 0 },
    affectedPopulation: { type: Number, default: 0 },
    description: { type: String, default: '' },
    source: { type: String, default: '' },
  },
  { _id: false }
);

const habitationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    type: { type: String, default: 'village' },
    state: { type: String, default: 'Kerala' },
    district: { type: String, required: true },
    taluk: { type: String, default: '' },
    village: { type: String, default: '' },

    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    elevation: { type: Number, default: 0 },

    population: { type: Number, default: 0 },
    households: { type: Number, default: 0 },
    areaSqKm: { type: Number, default: 0 },
    densityPerSqKm: { type: Number, default: 0 },
    vulnerablePopulation: { type: Number, default: 0 },

    criteria: {
      housingCondition: { type: Number, min: 0, max: 10, default: 5 },
      infrastructureCondition: { type: Number, min: 0, max: 10, default: 5 },
      accessibility: { type: Number, min: 0, max: 10, default: 5 },
      drainage: { type: Number, min: 0, max: 10, default: 5 },
      waterAccess: { type: Number, min: 0, max: 10, default: 5 },
      sanitation: { type: Number, min: 0, max: 10, default: 5 },
      emergencyFacilityKm: { type: Number, default: 8 },
      healthcareKm: { type: Number, default: 20 },
    },

    exposure: { type: [exposureSchema], default: [] },
    history: { type: [historicEventSchema], default: [] },

    terrainFactor: { type: Number, min: 0, max: 10, default: 5 },
    dataSource: { type: String, enum: ['official', 'estimated', 'mixed'], default: 'estimated' },
    revised: { type: Boolean, default: false },
    lastUpdatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

habitationSchema.index({ lat: 1, lng: 1 });
habitationSchema.index({ district: 1 });

module.exports = mongoose.model('Habitation', habitationSchema);