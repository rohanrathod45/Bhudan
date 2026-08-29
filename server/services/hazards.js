/**
 * Hazard metadata & configuration.
 *
 * The system ships with four active hazards (flood, landslide, coastal
 * erosion, cloudburst) but is built to accept additional hazard types
 * (earthquake, cyclone, wildfire, drought, heatwave, avalanche) simply by
 * registering them here — no further code changes are required.
 */

const HAZARDS = {
  flood: {
    label: 'Flood',
    color: '#3b82f6',
    defaultSeverity: 5,
    description: 'Riverine, coastal or flash flooding',
  },
  landslide: {
    label: 'Landslide',
    color: '#8b4513',
    defaultSeverity: 5,
    description: 'Slope failure / earth slips',
  },
  coastal_erosion: {
    label: 'Coastal Erosion',
    color: '#f59e0b',
    defaultSeverity: 5,
    description: 'Shoreline retreat & sea wall breaches',
  },
  cloudburst: {
    label: 'Extreme Rainfall / Cloudburst',
    color: '#6366f1',
    defaultSeverity: 5,
    description: 'Extreme rainfall in short duration',
  },
  // --- Extensible hazard types (registered, ready for future data) ---
  earthquake: { label: 'Earthquake', color: '#dc2626', defaultSeverity: 5, description: 'Seismic hazard' },
  cyclone: { label: 'Cyclone', color: '#0ea5e9', defaultSeverity: 5, description: 'Tropical cyclone / storm surge' },
  wildfire: { label: 'Wildfire', color: '#f97316', defaultSeverity: 5, description: 'Forest & vegetation fire' },
  drought: { label: 'Drought', color: '#a16207', defaultSeverity: 5, description: 'Water scarcity' },
  heatwave: { label: 'Heatwave', color: '#ef4444', defaultSeverity: 5, description: 'Extreme temperature' },
  avalanche: { label: 'Avalanche', color: '#94a3b8', defaultSeverity: 5, description: 'Snow avalanche' },
};

const ACTIVE_HAZARD_KEYS = ['flood', 'landslide', 'coastal_erosion', 'cloudburst'];

function activeHazards() {
  return Object.keys(HAZARDS)
    .filter((k) => ACTIVE_HAZARD_KEYS.includes(k))
    .map((k) => ({ key: k, ...HAZARDS[k] }));
}

function allHazards() {
  return Object.keys(HAZARDS).map((k) => ({ key: k, ...HAZARDS[k] }));
}

function getHazard(key) {
  return HAZARDS[key] || { label: key, color: '#64748b', defaultSeverity: 5, description: '' };
}

module.exports = { HAZARDS, ACTIVE_HAZARD_KEYS, activeHazards, allHazards, getHazard };