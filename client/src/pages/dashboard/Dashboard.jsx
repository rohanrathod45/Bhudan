import { useEffect, useState } from 'react';
import { analysisApi } from '../../services/api';
import useDistricts from '../../hooks/useDistricts';
import { Card, StatCard, Spinner, Badge, StateDistrictSelector } from '../../components/ui';
import { RiskDistributionChart, DonutChart } from '../../components/charts';
import { RISK_COLORS } from '../../components/charts';

export default function Dashboard() {
  const { selectedDistrict: district, setSelectedDistrict } = useDistricts();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!district || district === 'All') {
      setData(null);
      setLoading(false);
      setError('');
      return;
    }

    setLoading(true);
    setError('');
    analysisApi
      .districtAnalysis(district)
      .then((res) => {
        if (res && res.analysis) {
          setData(res.analysis);
        } else {
          setData(null);
        }
      })
      .catch((err) => {
        console.error('Failed to load analysis:', err);
        setError('Could not load analysis. Is the backend server running? Start it with npm start.');
      })
      .finally(() => setLoading(false));
  }, [district]);

  const s = data?.summary || {};

  const riskRows = ['RED', 'ORANGE', 'YELLOW', 'GREEN'].map((k) => ({
    name: k,
    value: s[`${k.toLowerCase()}Count`] || 0,
  }));

  const vulnRows = [
    { name: 'Critical', value: s.vulnerabilityByClass?.critical || 0 },
    { name: 'High', value: s.vulnerabilityByClass?.high || 0 },
    { name: 'Moderate', value: s.vulnerabilityByClass?.moderate || 0 },
    { name: 'Low', value: s.vulnerabilityByClass?.low || 0 },
  ].filter((x) => x.value > 0);

  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');

  const handleLiveSync = async () => {
    if (!district || district === 'All') return;
    setSyncing(true);
    setSyncMessage('');
    try {
      const res = await analysisApi.districtAnalysis(district);
      if (res && res.analysis) {
        setData(res.analysis);
        setSyncMessage('✅ Live district data & weather telemetry successfully synchronized!');
        setTimeout(() => setSyncMessage(''), 4000);
      }
    } catch (e) {
      setSyncMessage('⚠️ Live sync encountered a momentary error. Loaded cached data.');
    } finally {
      setSyncing(false);
    }
  };

  const liveTel = data?.liveTelemetry;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">📊</span>
            <h2 className="text-xl font-bold text-slate-800">Decision-Support Dashboard</h2>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              LIVE DATA STREAM
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time Open-Meteo & OpenStreetMap live multi-hazard risk, vulnerability & carrying capacity
          </p>
        </div>
        <div className="flex items-center gap-2">
          <StateDistrictSelector value={district} onChange={(d) => setSelectedDistrict(d)} />
          {district && district !== 'All' && (
            <button
              onClick={handleLiveSync}
              disabled={syncing}
              className="px-3 py-2 text-xs font-semibold rounded-lg bg-brand-600 text-white hover:bg-brand-700 transition flex items-center gap-1.5 whitespace-nowrap shadow-xs disabled:opacity-50"
            >
              <span>{syncing ? '⏳ Syncing…' : '⚡ Sync Live'}</span>
            </button>
          )}
        </div>
      </div>

      {syncMessage && (
        <div className="text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg px-3 py-2">
          {syncMessage}
        </div>
      )}

      {error && <div className="text-sm bg-red-50 text-red-600 border border-red-200 rounded-lg px-3 py-2">{error}</div>}

      {loading ? (
        <Spinner label="Computing live hazard analysis…" />
      ) : !district ? (
        <div className="card p-12 text-center bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="text-4xl mb-3">📍</div>
          <h3 className="text-lg font-bold text-slate-800">Select a Geographical Location</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
            Please use the <strong>State</strong> and <strong>District</strong> selector above to view real-time multi-hazard risk zonation, vulnerable habitations, and carrying-capacity analytics.
          </p>
        </div>
      ) : (
        <>
          {/* Live Weather & Meteorological Telemetry Bar */}
          {liveTel && (
            <div className="bg-slate-900 text-white p-4 rounded-xl shadow-sm border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="text-3xl">🌦️</div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-100">{district} Live Weather Telemetry</span>
                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                      liveTel.imdAlertLevel === 'RED' ? 'bg-red-500 text-white' :
                      liveTel.imdAlertLevel === 'ORANGE' ? 'bg-orange-500 text-white' :
                      liveTel.imdAlertLevel === 'YELLOW' ? 'bg-yellow-400 text-slate-900' :
                      'bg-emerald-500 text-white'
                    }`}>
                      IMD {liveTel.imdAlertLevel} ALERT
                    </span>
                  </div>
                  <div className="text-xs text-slate-300 mt-0.5">
                    {liveTel.alertDescription || 'Continuous real-time meteorological feed active'}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs w-full md:w-auto">
                <div className="bg-white/10 px-3 py-1.5 rounded-lg">
                  <div className="text-slate-400 text-[10px]">Current Rain</div>
                  <div className="font-bold text-slate-100">{liveTel.precipitationMm ?? 0} mm/h</div>
                </div>
                <div className="bg-white/10 px-3 py-1.5 rounded-lg">
                  <div className="text-slate-400 text-[10px]">24h Rain Sum</div>
                  <div className="font-bold text-slate-100">{liveTel.dailyPrecipitationSumMm ?? 0} mm</div>
                </div>
                <div className="bg-white/10 px-3 py-1.5 rounded-lg">
                  <div className="text-slate-400 text-[10px]">Soil Saturation</div>
                  <div className="font-bold text-slate-100">{Math.round((liveTel.soilMoisture || 0.25) * 100)}%</div>
                </div>
                <div className="bg-white/10 px-3 py-1.5 rounded-lg">
                  <div className="text-slate-400 text-[10px]">Temperature</div>
                  <div className="font-bold text-slate-100">{liveTel.temperatureC ?? 24}°C</div>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
            <StatCard label="Habitations" value={s.totalHabitations} icon="🏘️" color="text-brand-600" />
            <StatCard label="Red Zones" value={s.redZoneCount} icon="🚨" color="text-risk-red" sub="Critical risk" />
            <StatCard label="Population Exposed" value={s.totalPopulationExposed?.toLocaleString()} icon="👥" color="text-risk-orange" />
            <StatCard label="Vulnerable" value={s.totalVulnerable?.toLocaleString()} icon="🛟" color="text-risk-yellow" />
            <StatCard label="Capacity Available" value={s.capacityAvailable?.toLocaleString()} icon="⚖️" color="text-sky-500" />
            <StatCard label="Capacity Gap" value={s.capacityGap?.toLocaleString()} icon="⚠️" color={s.capacityGap > 0 ? 'text-risk-red' : 'text-emerald-600'} />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card title="Risk-Zone Distribution" subtitle={`Habitations by risk class · ${district}`}>
              <RiskDistributionChart data={riskRows} />
            </Card>
            <Card
              title="Vulnerable Population by Class"
              subtitle="Count of vulnerable people needing support"
              right={<Badge tone={s.capacityGap > 0 ? 'red' : 'green'}>{s.capacityGap > 0 ? 'Capacity gap' : 'Sufficient'}</Badge>}
            >
              {vulnRows.length ? (
                <>
                  <DonutChart
                    data={vulnRows}
                    colors={[RISK_COLORS.RED, RISK_COLORS.ORANGE, RISK_COLORS.YELLOW, RISK_COLORS.GREEN]}
                  />
                  <div className="flex justify-end mt-2">
                    <div
                      className={`inline-flex flex-col text-xs rounded-lg border p-2.5 shadow-xs max-w-xs ${
                        s.capacityGap > 0
                          ? 'bg-red-50/90 border-red-200 text-red-800'
                          : 'bg-emerald-50/90 border-emerald-200 text-emerald-800'
                      }`}
                    >
                      <div className="font-semibold flex items-center gap-1.5">
                        <span
                          className={`w-2 h-2 rounded-full shrink-0 ${
                            s.capacityGap > 0 ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'
                          }`}
                        />
                        <span>{s.capacityGap > 0 ? 'Red Badge: Capacity Gap' : 'Green Badge: Sufficient Capacity'}</span>
                      </div>
                      <p className="text-[10.5px] text-slate-600 mt-1 leading-snug">
                        {s.capacityGap > 0
                          ? 'Deficit: Exposed population exceeds available safe shelter capacity.'
                          : 'Safe: Shelter capacity adequately covers vulnerable population.'}
                      </p>
                      <div className="mt-1.5 pt-1.5 border-t border-slate-200/80 flex items-center justify-between text-[10px] text-slate-500">
                        <span className="inline-flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Green = Sufficient
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> Red = Deficit
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-sm text-slate-500 py-10 text-center">No vulnerability data.</p>
              )}
            </Card>
          </div>

          <Card title="Red-Zone Risk Register" subtitle="Highest-risk habitations in this district">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-500 border-b border-slate-200">
                    <th className="py-2 pr-4 font-medium">Habitation</th>
                    <th className="py-2 pr-4 font-medium">Hazards</th>
                    <th className="py-2 pr-4 font-medium">Exposed</th>
                    <th className="py-2 font-medium">Risk</th>
                    <th className="py-2 font-medium">Zone</th>
                  </tr>
                </thead>
                <tbody>
                  {(data?.redZones || []).slice(0, 6).map((r) => (
                    <tr key={r.zone.habitationId} className="border-b border-slate-100 last:border-0">
                      <td className="py-2 pr-4 font-medium text-slate-800">{r.zone.habitation}</td>
                      <td className="py-2 pr-4 text-slate-500">{r.zone.mainHazards.join(', ')}</td>
                      <td className="py-2 pr-4 text-slate-600">{r.zone.populationExposed.toLocaleString()}</td>
                      <td className="py-2 pr-4 font-semibold text-slate-800">{r.zone.riskScore}</td>
                      <td className="py-2">
                        <Badge tone={r.zone.riskClass.toLowerCase()} className="capitalize">{r.zone.riskClass}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}