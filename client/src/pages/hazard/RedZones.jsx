import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { analysisApi, dataApi } from '../../services/api';
import useDistricts from '../../hooks/useDistricts';
import RiskMap, { MapLegend } from '../../components/map/RiskMap';
import { Card, StatCard, Badge, Spinner } from '../../components/ui';
import { ScoreGauge } from '../../components/charts';

const DEFAULT_CENTER = [22.0, 79.0];

export default function RedZones() {
  const { districts, centers } = useDistricts();
  const [district, setDistrict] = useState('Wayanad');
  const [analysis, setAnalysis] = useState(null);
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    analysisApi
      .redZones(district)
      .then((res) => setAnalysis(res))
      .catch(() => setAnalysis(null));
    dataApi.sites({ district }).then((res) => setSites(res.data)).catch(() => setSites([]));
    setLoading(false);
  }, [district]);

  const zones = analysis?.data || [];
  const riskSum = zones.reduce((a, z) => a + z.riskScore, 0);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Hazard-Based Red Zones</h2>
          <p className="text-sm text-slate-500">Critical & high-risk habitations requiring prioritised action</p>
        </div>
        <select className="input w-auto" value={district} onChange={(e) => setDistrict(e.target.value)}>
          {districts.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Red Zones" value={zones.filter((z) => z.riskClass === 'RED').length} icon="🚨" color="text-risk-red" />
        <StatCard label="Orange Zones" value={zones.filter((z) => z.riskClass === 'ORANGE').length} icon="🔥" color="text-risk-orange" />
        <StatCard label="Total Critical" value={zones.length} icon="⚠️" color="text-risk-red" />
        <StatCard label="Avg Risk Score" value={zones.length ? Math.round(riskSum / zones.length) : 0} icon="📊" color="text-brand-600" />
      </div>

      <div className="grid lg:grid-cols-5 gap-5">
        <div className="lg:col-span-3 card p-0 overflow-hidden relative" style={{ minHeight: 460 }}>
          {loading ? <Spinner label="Loading zones…" /> : <RiskMap zones={zones} sites={sites} center={centers[district] || DEFAULT_CENTER} onSelectZone={setSelected} />}
          <MapLegend />
        </div>

        <div className="space-y-4 overflow-y-auto" style={{ maxHeight: 460 }}>
          {selected ? (
            <Card title={selected.habitation} right={<Badge tone="red">{selected.riskClass}</Badge>}>
              <ScoreGauge score={selected.riskScore} color={selected.color} label="Risk" />
              <div className="grid grid-cols-2 gap-2 text-sm mt-2">
                <Info label="Main hazards" value={selected.mainHazards?.join(', ')} />
                <Info label="Population" value={selected.population.toLocaleString()} />
                <Info label="Population exposed" value={selected.populationExposed.toLocaleString()} />
                <Info label="Exposure index" value={selected.exposureIndex} />
                <Info label="Infrastructure risk" value={selected.infrastructureRisk} />
                <Info label="Confidence" value={(selected.confidence * 100).toFixed(0) + '%'} />
                <Info label="Updated" value={new Date(selected.lastUpdatedAt).toLocaleDateString()} />
              </div>
              <button className="btn-primary w-full mt-3 text-xs" onClick={() => navigate(`/habitations/${selected.habitationId}`)}>Open habitation →</button>
            </Card>
          ) : (
            <Card title="Critical habitations" subtitle="Click a marker to inspect">
              {zones.length ? (
                <ul className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                  {zones.slice(0, 12).map((z) => (
                    <li key={z.habitationId} className="border border-slate-100 rounded-lg p-3 hover:bg-slate-50 cursor-pointer" onClick={() => setSelected(z)}>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-slate-800">{z.habitation}</div>
                          <div className="text-xs text-slate-500">{z.district} · {z.mainHazards.join(', ')}</div>
                        </div>
                        <Badge tone={z.riskClass.toLowerCase()}>{z.riskScore} {z.riskClass}</Badge>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : <p className="text-sm text-slate-500">No red/orange zones in this district.</p>}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="bg-slate-50 rounded-lg p-2">
      <div className="text-[10px] font-semibold uppercase text-slate-400">{label}</div>
      <div className="font-medium text-slate-700" title={value}>{value ?? '—'}</div>
    </div>
  );
}