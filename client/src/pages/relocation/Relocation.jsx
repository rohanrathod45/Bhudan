import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { analysisApi, relocationApi, dataApi } from '../../services/api';
import useDistricts from '../../hooks/useDistricts';
import { Card, StatCard, Badge, Spinner } from '../../components/ui';
import RiskMap, { MapLegend } from '../../components/map/RiskMap';

export default function Relocation() {
  const { districts } = useDistricts();
  const [district, setDistrict] = useState('Wayanad');
  const [priority, setPriority] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
    const [savedId, setSavedId] = useState(null);
  const [safeSites, setSafeSites] = useState([]);

  const load = (d) => {
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

  const districtCenter = useMemo(() => {
    const lat = priority.reduce((sum, p) => sum + (p.lat || 0), 0);
    const lng = priority.reduce((sum, p) => sum + (p.lng || 0), 0);
    if (priority.length) return [lat / priority.length, lng / priority.length];
    return [22.0, 79.0];
  }, [priority]);

  const generate = async () => {
    setGenerating(true);
    try {
      const res = await relocationApi.generate(district);
      setSavedId(res.data?.[0]?.id || null);
      alert(`Relocation plans generated: ${res.count} plan(s) saved.`);
    } catch (e) {
      alert('Could not generate plan — do you have Analyst+ role?');
    } finally {
      setGenerating(false);
    }
  };

  const s = summary || {};
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Relocation Priority</h2>
          <p className="text-sm text-slate-500">Ranked habitations & nearest safe-site assignments</p>
        </div>
        <div className="flex gap-2 items-center">
          <select className="input w-auto" value={district} onChange={(e) => setDistrict(e.target.value)}>
            {districts.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          <button className="btn btn-primary" onClick={generate} disabled={generating}>{generating ? 'Generating…' : 'Generate plans'}</button>
        </div>
      </div>

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
    </div>
  );
}