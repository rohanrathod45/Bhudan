const test = require('node:test');
const assert = require('node:assert');
const {
  fetchLiveWeather,
  fetchLiveSeismic,
  fetchLiveDisasterAlerts,
} = require('../services/liveDataService');
const { assessHabitation } = require('../services/riskEngine');
const { assessVulnerability } = require('../services/vulnerabilityEngine');

test('Live Data Service fetches weather telemetry with rainfall and IMD alerts', async () => {
  const weather = await fetchLiveWeather(11.605, 76.083); // Wayanad coordinates
  assert.ok(weather, 'Weather object should be returned');
  assert.ok(typeof weather.temperatureC === 'number', 'Temperature should be a number');
  assert.ok(typeof weather.currentPrecipitationMm === 'number', 'Precipitation should be a number');
  assert.ok(['GREEN', 'YELLOW', 'ORANGE', 'RED'].includes(weather.imdAlertLevel), 'Valid IMD alert level required');
  assert.ok(weather.weatherCondition, 'Weather condition label should exist');
});

test('Live Data Service fetches USGS seismic events', async () => {
  const seismic = await fetchLiveSeismic(22.5937, 78.9629, 2000);
  assert.ok(seismic, 'Seismic data should be returned');
  assert.ok(Array.isArray(seismic.events), 'Events should be an array');
  assert.ok(typeof seismic.maxMagnitude === 'number', 'maxMagnitude should be a number');
});

test('Live Data Service provides active disaster and weather warning feeds', async () => {
  const alerts = await fetchLiveDisasterAlerts();
  assert.ok(Array.isArray(alerts), 'Alerts should be an array');
  assert.ok(alerts.length >= 1, 'Should have at least 1 active alert');
  assert.ok(alerts[0].agency && alerts[0].title, 'Alert must have agency and title');
});

test('Risk Engine dynamically increases hazard and risk score under heavy live rainfall', () => {
  const sampleHab = {
    name: 'Wayanad Tea Estate Village',
    district: 'Wayanad',
    state: 'Kerala',
    population: 1200,
    vulnerablePopulation: 400,
    elevation: 900,
    slope: 32,
    exposure: [{ hazardType: 'landslide', exposure: 7, frequency: 6 }],
    criteria: {
      housingCondition: 4,
      accessibility: 4,
      drainage: 3,
      emergencyFacilityKm: 18,
    },
  };

  const vuln = assessVulnerability(sampleHab);

  // 1. Dry/Normal weather
  const normalWeather = {
    currentPrecipitationMm: 2,
    dailyPrecipitationSumMm: 10,
    soilMoisture: 0.20,
    imdAlertLevel: 'GREEN',
    isLive: true,
  };
  const normalRisk = assessHabitation(sampleHab, vuln, normalWeather);

  // 2. Extreme Monsoon Live Weather
  const extremeWeather = {
    currentPrecipitationMm: 65,
    dailyPrecipitationSumMm: 220,
    soilMoisture: 0.55,
    imdAlertLevel: 'RED',
    isLive: true,
  };
  const extremeRisk = assessHabitation(sampleHab, vuln, extremeWeather);

  assert.ok(
    extremeRisk.riskScore > normalRisk.riskScore,
    `Extreme weather risk (${extremeRisk.riskScore}) should exceed normal risk (${normalRisk.riskScore})`
  );
  assert.strictEqual(extremeRisk.riskClass, 'RED');
  assert.ok(extremeRisk.dataSource.includes('Live Telemetry'));
});
