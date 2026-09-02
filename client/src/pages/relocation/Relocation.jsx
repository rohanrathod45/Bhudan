import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { analysisApi, relocationApi, dataApi } from '../../services/api';
import useDistricts from '../../hooks/useDistricts';
import { Card, StatCard, Badge, Spinner, StateDistrictSelector } from '../../components/ui';
import RiskMap, { MapLegend } from '../../components/map/RiskMap';

export default function Relocation() {
  const { centers, districtMeta, getStateForDistrict, selectedDistrict: district, setSelectedDistrict } = useDistricts();
  const [priority, setPriority] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [savedId, setSavedId] = useState(null);
  const [safeSites, setSafeSites] = useState([]);

  const load = (d) => {
    if (!d || d === 'All') {
      setPriority([]);
      setSummary(null);
      setSafeSites([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    Promise.all([
      analysisApi.relocation(d),
      dataApi.sites({ district: d }),
    ]).then(([relRes, sitesRes]) => {
      const priority = (relRes && relRes.data && relRes.data.priority) || [];
      const summary = (relRes && relRes.data && relRes.data.summary) || null;
      const sites = (sitesRes && (sitesRes.data || sitesRes.sites)) || [];
      setPriority(priority);
      setSummary(summary);
      setSafeSites(sites);
      setLoading(false);
    }).catch(() => {
      setPriority([]);
      setSummary(null);
      setSafeSites([]);
      setLoading(false);
    });
  };
  useEffect(() => { load(district); }, [district]);

  const districtCenter = (district && centers[district]) || [22.0, 79.0];
  const currentMeta = district ? (districtMeta[district] || {}) : {};
  const currentState = currentMeta.state || getStateForDistrict(district) || '';

  const generate = async () => {
    if (!district || district === 'All') {
      alert('Please select a specific State and District first before generating relocation plans.');
      return;
    }

    setGenerating(true);
    try {
      const res = await relocationApi.generate(district);
      setSavedId(res.data?.[0]?.id || null);
      alert(`✅ Relocation report generated! ${res.count} plan(s) have been saved to the database. You can view and manage them in the Reports tab.`);
    } catch (e) {
      alert('Could not generate plan — please ensure the server is running with npm start.');
    } finally {
      setGenerating(false);
    }
  };

  const s = summary || {};
  return (
    <div className="space-y-5">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">🛟</span>
            <h2 className="text-xl font-bold text-slate-800">Relocation Priority & Evacuation</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Ranked vulnerable habitations & nearest safe-site capacity assignments
          </p>
        </div>
        <div className="flex flex-wrap gap-2.5 items-center">
          <StateDistrictSelector value={district} onChange={(d) => setSelectedDistrict(d)} />
          <button className="btn btn-primary text-xs" onClick={generate} disabled={generating || !district}>
            {generating ? 'Generating…' : 'Generate Plans'}
          </button>
        </div>
      </div>

      {!district ? (
        <div className="card p-12 text-center bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="text-4xl mb-3">📍</div>
          <h3 className="text-lg font-bold text-slate-800">Select a District</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
            Please choose a <strong>State</strong> and <strong>District</strong> using the selector above to calculate relocation priorities and evacuation shelter matching.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="People to relocate" value={s.totalPopulation?.toLocaleString() || 0} icon="👥" color="text-risk-orange" />
        <StatCard label="Need shelter (vulnerable)" value={s.totalVulnerable?.toLocaleString() || 0} icon="🛟" color="text-risk-yellow" />
        <StatCard label="Red zones" value={s.redZoneCount || 0} icon="🚨" color="text-risk-red" />
        <StatCard label="Capacity gap" value={s.capacityGap?.toLocaleString() || 0} icon="⚠️" color={s.capacityGap > 0 ? 'text-risk-red' : 'text-emerald-600'} />
            </div>

      {/* Map: habitation zones shown as teardrop pins, safe sites as circles */}
      <Card title="Relocation zone map" subtitle="Red-zone habitations (pins) & safe sites (circles)">
        <div className="map-card">
          {loading ? (
            <div className="h-full w-full flex items-center justify-center text-slate-400">
              <Spinner /> Loading map…
            </div>
          ) : (
            <RiskMap
              zones={priority}
              sites={safeSites}
              center={districtCenter}
              zoom={11}
              districtName={district}
              stateName={currentState}
              showDistrictCircle={true}
              showRiskCircles={true}
              showPins={true}
              showSites={true}
            />
          )}
        </div>
      </Card>

      <Card title="Relocation priority ranking" subtitle="Highest urgency first">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 border-b border-slate-200">
                <th className="py-2 font-medium">#</th>
                <th className="py-2 font-medium">Habitation</th>
                <th className="py-2 font-medium">Population</th>
                <th className="py-2 font-medium">Risk</th>
                <th className="py-2 font-medium">Vuln</th>
                <th className="py-2 font-medium">Priority</th>
                <th className="py-2 font-medium">Assignment</th>
              </tr>
            </thead>
            <tbody>
              {priority.length ? priority.map((h, i) => (
                <tr key={h.habitationId} className="border-b border-slate-100 last:border-0">
                  <td className="py-2 text-slate-500">{i + 1}</td>
                  <td className="py-2 font-medium text-slate-800">{h.habitation}</td>
                  <td className="py-2">{(h.population || 0).toLocaleString()}</td>
                  <td className="py-2">{h.riskScore ?? '—'} {h.riskClass ? <Badge tone={h.riskClass.toLowerCase()}>{h.riskClass}</Badge> : <Badge tone="slate">n/a</Badge>}</td>
                  <td className="py-2">{h.vulnerabilityScore ?? '—'} {h.vulnerabilityClass ? <Badge tone="slate">{h.vulnerabilityClass}</Badge> : <Badge tone="slate">n/a</Badge>}</td>
                  <td className="py-2"><Badge tone="red">{h.relocationScore ?? '—'}</Badge></td>
                  <td className="py-2 text-slate-500">{(h.assignments || []).map((a) => `${a.safeSiteName} (${a.assignedPopulation})`).join(' + ') || `– ${h.unallocatedPopulation ?? 0} unassigned`}</td>
                </tr>
              )) : <tr><td colSpan="7" className="py-6 text-center text-slate-400">No relocation candidates in this district.</td></tr>}
            </tbody>
          </table>
        </div>
      </Card>

      {savedId && (
        <Card title="Last generated plan">
          <p className="text-sm text-slate-600">
            Plan saved with id <span className="font-mono">{savedId}</span>. Open it in the{' '}
            <Link className="text-brand-600 underline" to="/reports">Reports</Link> section.
          </p>
        </Card>
      )}
      </>
      )}
    </div>
  );
}