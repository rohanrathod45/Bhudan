const test = require('node:test');
const assert = require('node:assert');
const { assessHabitation, calculateExposureIndex } = require('../services/riskEngine');
const { assessVulnerability } = require('../services/vulnerabilityEngine');
const { assessSite, assessDistrict } = require('../services/capacityEngine');
const { relocationScore, rankHabitations, allocate } = require('../services/relocationEngine');
const { computeDynamicHazards } = require('../services/hazards');

test('Risk Engine computes scores and classifications accurately', () => {
  const sampleHab = {
    name: 'Test Village',
    district: 'Chamoli',
    state: 'Uttarakhand',
    population: 3000,
    vulnerablePopulation: 900,
    elevation: 1800,
    terrainFactor: 8,
    exposure: [
      { hazardType: 'landslide', exposure: 9, frequency: 8, distanceKm: 0.2 },
      { hazardType: 'cloudburst', exposure: 8, frequency: 7, distanceKm: 0.4 },
    ],
    history: [{ hazardType: 'landslide', severity: 9, affectedPopulation: 500 }],
    criteria: {
      housingCondition: 3,
      infrastructureCondition: 3,
      accessibility: 4,
      drainage: 3,
      emergencyFacilityKm: 25,
      healthcareKm: 30,
    },
  };

  const vuln = assessVulnerability(sampleHab);
  assert.ok(vuln.vulnerabilityScore > 0, 'Vulnerability score should be positive');
  assert.ok(['Low', 'Moderate', 'High', 'Critical'].includes(vuln.vulnerabilityClass));

  const risk = assessHabitation(sampleHab, vuln);
  assert.ok(risk.riskScore >= 0 && risk.riskScore <= 100, 'Risk score must be between 0 and 100');
  assert.ok(['GREEN', 'YELLOW', 'ORANGE', 'RED'].includes(risk.riskClass));
});

test('Capacity Engine evaluates safe-site capacity and district deficit/surplus', () => {
  const sites = [
    { name: 'Camp Alpha', maxPopulationCapacity: 1000, currentOccupancy: 200, status: 'operational' },
    { name: 'School Beta', maxPopulationCapacity: 800, currentOccupancy: 100, status: 'available' },
  ];

  const districtCap = assessDistrict(1500, sites);
  assert.strictEqual(districtCap.totalCapacity, 1800);
  assert.strictEqual(districtCap.totalAvailable, 1500);
  assert.strictEqual(districtCap.demandPopulation, 1500);
  assert.strictEqual(districtCap.capacityGap, 0);
  assert.strictEqual(districtCap.status, 'sufficient');
});

test('Relocation Engine allocates habitations to nearest safe sites with ETAs', () => {
  const rankedHabitations = [
    {
      habitationId: 'hab_1',
      habitation: 'Red Village',
      district: 'Chamoli',
      lat: 30.42,
      lng: 79.32,
      population: 600,
      households: 150,
      vulnerablePopulation: 200,
      riskScore: 85,
      riskClass: 'RED',
      vulnerabilityScore: 70,
      vulnerabilityClass: 'High',
      relocationScore: 80,
      needsRelocation: true,
    },
  ];

  const sites = [
    {
      id: 'site_1',
      name: 'Safe Camp 1',
      lat: 30.45,
      lng: 79.35,
      maxPopulationCapacity: 1000,
      currentOccupancy: 0,
      transitMode: 'road',
    },
  ];

  const allocation = allocate(rankedHabitations, sites);
  assert.strictEqual(allocation.length, 1);
  const result = allocation[0];
  assert.strictEqual(result.feasible, 100);
  assert.strictEqual(result.unallocatedPopulation, 0);
  assert.strictEqual(result.assignments.length, 1);
  assert.strictEqual(result.assignments[0].assignedPopulation, 600);
  assert.ok(result.assignments[0].distanceKm > 0, 'Distance should be greater than 0');
  assert.ok(result.assignments[0].etaMinutes > 0, 'ETA should be greater than 0');
});

test('Dynamic Hazards Engine aggregates live habitations exposure data', () => {
  const habitations = [
    {
      population: 2000,
      exposure: [{ hazardType: 'landslide', exposure: 8 }],
    },
    {
      population: 3500,
      exposure: [
        { hazardType: 'flood', exposure: 9 },
        { hazardType: 'cloudburst', exposure: 7 },
      ],
    },
  ];

  const { active, all } = computeDynamicHazards(habitations);
  assert.ok(Array.isArray(active));
  assert.ok(Array.isArray(all));
  const landslide = active.find((h) => h.key === 'landslide');
  assert.ok(landslide, 'Landslide should be active');
  assert.strictEqual(landslide.habitationsCount, 1);
});
