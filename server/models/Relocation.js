const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema(
  {
    safeSiteId: { type: String, default: '' },
    safeSiteName: { type: String, default: '' },
    assignedPopulation: { type: Number, default: 0 },
    assignedHouseholds: { type: Number, default: 0 },
    distanceKm: { type: Number, default: 0 },
    transitMode: { type: String, default: 'road' },
    etaMinutes: { type: Number, default: 0 },
  },
  { _id: false }
);

const relocationPlanSchema = new mongoose.Schema(
  {
    habitationId: { type: String, required: true },
    habitationName: { type: String, default: '' },
    district: { type: String, required: true },
    state: { type: String, default: 'Kerala' },

    riskScore: { type: Number, default: 0 },
    riskClass: { type: String, default: '' },

    populationToRelocate: { type: Number, default: 0 },
    householdsToRelocate: { type: Number, default: 0 },
    populationNeedingShelter: { type: Number, default: 0 },
    unallocatedPopulation: { type: Number, default: 0 },

    capacityAvailable: { type: Number, default: 0 },
    relativeRiskScore: { type: Number, default: 0 },

    assignments: { type: [assignmentSchema], default: [] },
    strategy: { type: String, default: '' },
    constraints: { type: [String], default: [] },
    recommendedActions: { type: [String], default: [] },
    feasibility: { type: Number, min: 0, max: 100, default: 0 },

    status: {
      type: String,
      enum: ['proposed', 'under_review', 'approved', 'executing', 'rejected'],
      default: 'proposed',
    },
    approvedBy: { type: String, default: '' },
    approvedAt: { type: Date, default: null },
    createdBy: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('RelocationPlan', relocationPlanSchema);