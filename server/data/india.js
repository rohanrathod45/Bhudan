/**
 * india.js — India-wide demo data generator.
 *
 * Reads DISTRICT_LIST and produces deterministic habitations + safe sites
 * for every district so the whole country is covered by the analysis
 * pipeline. Values are seeded per-district → identical on every server start.
 */

const DISTRICT_REGISTRY = require('./districtList');

const HAZARD_BY_REGION = {
  coast: ['flood', 'cyclone', 'coastal_erosion'],
  hill: ['landslide', 'flood', 'earthquake', 'cloudburst'],
  himalaya: ['landslide', 'cloudburst', 'avalanche', 'flood'],
  desert: ['drought', 'heatwave', 'flood'],
  plain: ['flood', 'heatwave', 'earthquake', 'cloudburst'],
  island: ['flood', 'cyclone', 'coastal_erosion'],
  semi: ['drought', 'heatwave', 'flood', 'earthquake'],
};

/* Deterministic PRNG (mulberry32) + string hash */
function hashSeed(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(a) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const int = (rng, min, max) => Math.round(min + rng() * (max - min));
const pick = (rng, arr) => arr[Math.floor(rng() * arr.length)];
const round1 = (n) => Math.round(n * 100) / 100;

const HAB_TYPE = ['village', 'colony', 'hamlet', 'ward', 'town'];
const HAB_NAME_A = ['Madhav', 'Ram', 'Krishna', 'Ganga', 'Shakti', 'Ambedkar', 'Netaji', 'Mahavir'];
const HAB_NAME_B = ['Nagar', 'Basti', 'Pur', 'Ganj', 'Colony', 'Wadi', 'Vihar', 'Para'];
const SITE_TYPE = ['school', 'relief_camp', 'community_hall', 'open_ground'];
const SITE_NAME_A = ['Govt. Higher Secondary', 'Panchayat Community', 'District Relief', 'Municipal Welfare', 'Zila Shelter'];
const SITE_NAME_B = ['School Campus', 'Relief Centre', 'Community Hall', 'Open Ground'];

function elevationFor(region, rng) {
  if (region === 'himalaya') return int(rng, 1400, 3200);
  if (region === 'hill') return int(rng, 400, 1400);
  if (region === 'coast') return int(rng, 2, 40);
  if (region === 'island') return int(rng, 2, 20);
  if (region === 'desert') return int(rng, 150, 400);
  return int(rng, 60, 350);
}

function terrainFor(region) {
  if (region === 'himalaya') return 8;
  if (region === 'hill') return 6;
  if (region === 'coast' || region === 'island') return 2;
  if (region === 'desert') return 4;
  return 3;
}

function buildHabitation(meta, rng, idx) {
  const risks = HAZARD_BY_REGION[meta.region] || ['flood'];
  const population = int(rng, 1200, 7200);
  const vulnerable = Math.round(population * (0.24 + rng() * 0.2));
  const exposure = risks.slice(0, 2).map((ht) => ({
    hazardType: ht,
    exposure: int(rng, 4, 9),
    frequency: int(rng, 3, 8),
    distanceKm: round1(rng() * 1.5),
  }));
  const history = [];
  if (rng() > 0.45) {
    history.push({
      hazardType: pick(rng, risks),
      year: 2024 - int(rng, 0, 5),
      severity: int(rng, 4, 9),
      affectedPopulation: Math.round(population * (0.1 + rng() * 0.25)),
      description: `${pick(rng, risks)} event on record`,
      source: rng() > 0.5 ? 'official' : 'mixed',
    });
  }
  return {
    name: `${pick(rng, HAB_NAME_A)}${pick(rng, HAB_NAME_B)} ${meta.name}`,
    type: pick(rng, HAB_TYPE),
    state: meta.state,
    district: meta.name,
    taluk: meta.name,
    village: meta.name,
    lat: round1(meta.lat + (rng() - 0.5) * 0.2),
    lng: round1(meta.lng + (rng() - 0.5) * 0.2),
    elevation: elevationFor(meta.region, rng),
    population,
    households: Math.round(population / 3.7),
    areaSqKm: round1(0.6 + rng() * 3.5),
    densityPerSqKm: Math.round(population / Math.max(0.6, 0.6 + rng() * 3.5)),
    vulnerablePopulation: vulnerable,
    criteria: {
      housingCondition: int(rng, 3, 8),
      infrastructureCondition: int(rng, 3, 8),
      accessibility: int(rng, 3, 9),
      drainage: int(rng, 3, 8),
      waterAccess: int(rng, 3, 8),
      sanitation: int(rng, 3, 8),
      emergencyFacilityKm: int(rng, 5, 30),
      healthcareKm: int(rng, 8, 40),
    },
    exposure,
    history,
    terrainFactor: terrainFor(meta.region),
    dataSource: pick(rng, ['official', 'mixed', 'estimated']),
    revised: rng() > 0.5,
  };
}

function buildSafeSite(meta, rng, idx) {
  const type = pick(rng, SITE_TYPE);
  const maxPop = int(rng, 500, 1600);
  return {
    name: `${pick(rng, SITE_NAME_A)} ${type === 'open_ground' ? 'Open Ground' : type === 'school' ? 'School' : 'Camp'} ${meta.name}`,
    type,
    state: meta.state,
    district: meta.name,
    taluk: meta.name,
    lat: round1(meta.lat + (rng() - 0.5) * 0.15),
    lng: round1(meta.lng + (rng() - 0.5) * 0.15),
    maxPopulationCapacity: maxPop,
    currentOccupancy: int(rng, 0, Math.round(maxPop * 0.35)),
    shelterCapacity: Math.round(maxPop * (0.8 + rng() * 0.2)),
    waterAvailability: int(rng, 40, 95),
    housing: int(rng, 30, 90),
    healthcare: int(rng, 25, 75),
    sanitation: int(rng, 40, 90),
    foodLogistics: int(rng, 35, 90),
    roadConnectivity: int(rng, 45, 95),
    emergencyServices: int(rng, 35, 90),
    status: pick(rng, ['operational', 'available', 'planned']),
    dataSource: pick(rng, ['official', 'mixed', 'estimated']),
  };
}

function buildAll() {
  const habitations = [];
  const safeSites = [];
  for (const entry of DISTRICT_REGISTRY) {
    const meta = { name: entry[0], state: entry[1], lat: entry[2], lng: entry[3], region: entry[4] };
    const rng = mulberry32(hashSeed(`bhudan:${meta.state}:${meta.name}`));
    const nHabs = int(rng, 2, 4);
    const nSites = int(rng, 1, 3);
    for (let i = 0; i < nHabs; i++) habitations.push(buildHabitation(meta, rng, i));
    for (let i = 0; i < nSites; i++) safeSites.push(buildSafeSite(meta, rng, i));
  }
  return { habitations, safeSites };
}

function districtNames() {
  return DISTRICT_REGISTRY.map((d) => d[0]);
}

function districtCenters() {
  const map = {};
  for (const d of DISTRICT_REGISTRY) map[d[0]] = [d[2], d[3]];
  return map;
}

module.exports = {
  DISTRICT_REGISTRY,
  HAZARD_BY_REGION,
  buildAll,
  districtNames,
  districtCenters,
  hashSeed,
  mulberry32,
};