/**
 * Hazard metadata & dynamic hazard aggregation.
 *
 * Scans active habitations dynamically to compute real-time hazard counts,
 * exposed populations, and active hazard profiles.
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
  earthquake: { label: 'Earthquake', color: '#dc2626', defaultSeverity: 5, description: 'Seismic hazard' },
  cyclone: { label: 'Cyclone', color: '#0ea5e9', defaultSeverity: 5, description: 'Tropical cyclone / storm surge' },
  wildfire: { label: 'Wildfire', color: '#f97316', defaultSeverity: 5, description: 'Forest & vegetation fire' },
  drought: { label: 'Drought', color: '#a16207', defaultSeverity: 5, description: 'Water scarcity' },
  heatwave: { label: 'Heatwave', color: '#ef4444', defaultSeverity: 5, description: 'Extreme temperature' },
  avalanche: { label: 'Avalanche', color: '#94a3b8', defaultSeverity: 5, description: 'Snow avalanche' },
};

/**
 * Dynamically computes active hazards by inspecting habitations in the system.
 */
function computeDynamicHazards(habitationsList = []) {
  const hazardStats = {};

  // Initialize stats for known hazards
  Object.keys(HAZARDS).forEach((k) => {
    hazardStats[k] = {
      key: k,
      ...HAZARDS[k],
      habitationsCount: 0,
      exposedPopulation: 0,
      totalExposureScore: 0,
      isActive: false,
    };
  });

  // Scan live habitations
  habitationsList.forEach((h) => {
    (h.exposure || []).forEach((exp) => {
      const k = exp.hazardType;
      if (!hazardStats[k]) {
        hazardStats[k] = {
          key: k,
          label: k.charAt(0).toUpperCase() + k.slice(1).replace('_', ' '),
          color: '#64748b',
          defaultSeverity: 5,
          description: 'Geospatial hazard',
          habitationsCount: 0,
          exposedPopulation: 0,
          totalExposureScore: 0,
          isActive: false,
        };
      }
      hazardStats[k].habitationsCount++;
      hazardStats[k].exposedPopulation += Math.round((h.population || 0) * ((exp.exposure || 5) / 10));
      hazardStats[k].totalExposureScore += exp.exposure || 5;
      hazardStats[k].isActive = true;
    });
  });

  const active = Object.values(hazardStats).filter((h) => h.isActive || ['flood', 'landslide', 'cloudburst', 'cyclone', 'earthquake'].includes(h.key));
  const all = Object.values(hazardStats);

  return { active, all };
}

function getHazard(key) {
  return HAZARDS[key] || { label: key, color: '#64748b', defaultSeverity: 5, description: '' };
}

module.exports = { HAZARDS, computeDynamicHazards, getHazard };