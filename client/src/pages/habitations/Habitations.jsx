import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { dataApi, analysisApi } from '../../services/api';
import useDistricts from '../../hooks/useDistricts';
import { Card, Badge, Spinner } from '../../components/ui';
import { ScoreGauge } from '../../components/charts';

export const HAZARDS_LABEL = {
  flood: 'Flood', landslide: 'Landslide', coastal_erosion: 'Coastal erosion', cloudburst: 'Cloudburst',
  earthquake: 'Earthquake', cyclone: 'Cyclone', wildfire: 'Wildfire', drought: 'Drought', heatwave: 'Heatwave', avalanche: 'Avalanche',
};

const HAZARDS = ['All', 'flood', 'landslide', 'coastal_erosion', 'cloudburst'];

export default function Habitations() {
  const { id } = useParams();
  if (id) return <HabitationDetail id={id} />;

  const { districts } = useDistricts();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [district, setDistrict] = useState('');
  const [hazard, setHazard] = useState('');

  const load = () => {
    setLoading(true);
    const params = {};
    if (district && district !== 'All') params.district = district;
    if (hazard && hazard !== 'All') params.hazard = hazard;
    dataApi.habitations(params).then((res) => setRows(res.data)).catch(() => setRows([]));
    setLoading(false);
  };
  useEffect(() => { load(); }, [district, hazard]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-xl font-bold text-slate-800">Habitations</h2>
        <div className="flex gap-2">
          <select className="input w-auto" value={district} onChange={(e) => setDistrict(e.target.value)}>
            {['All', ...districts].map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          <select className="input w-auto" value={hazard} onChange={(e) => setHazard(e.target.value)}>
            {HAZARDS.map((h) => <option key={h} value={h}>{h.replace(/_/g, ' ')}</option>)}
          </select>
        </div>
      </div>

      {loading ? <Spinner /> : (
        <Card title="Registered habitations" subtitle={`${rows.length} habitations`}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b border-slate-200">
                  <th className="py-2 font-medium">Habitation</th>
                  <th className="py-2 font-medium">District</th>
                  <th className="py-2 font-medium">Population</th>
                  <th className="py-2 font-medium">Hazards</th>
                  <th className="py-2 font-medium">Elevation</th>
                  <th className="py-2 font-medium">Source</th>
                  <th className="py-2 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.length ? rows.map((h) => (
                  <tr key={h.id} className="border-b border-slate-100 last:border-0">
                    <td className="py-2 font-medium text-slate-800">{h.name}</td>
                    <td className="py-2 text-slate-600">{h.district}</td>
                    <td className="py-2">{(h.population || 0).toLocaleString()}</td>
                    <td className="py-2 text-slate-500">{(h.exposure || []).map((e) => HAZARDS_LABEL[e.hazardType] || e.hazardType).join(', ') || '—'}</td>
                    <td className="py-2 text-slate-600">{h.elevation} m</td>
                    <td className="py-2">{h.dataSource && <Badge tone={h.dataSource === 'official' ? 'green' : 'slate'}>{h.dataSource}</Badge>}</td>
                    <td className="py-2 text-right"><Link to={`/habitations/${h.id}`} className="text-sm text-brand-600 font-semibold hover:underline">Details</Link></td>
                  </tr>
                )) : <tr><td colSpan="7" className="py-6 text-center text-slate-400">No habitations match the filter.</td></tr>}
              </tbody>
            </table>
          </div>
        </Card>
      )}
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

function HabitationDetail({ id }) {
  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    analysisApi.habitation(id).then((res) => { setDoc(res.data); setLoading(false); }).catch(() => setLoading(false));
  }, [id]);

  if (loading) return <Spinner label="Loading habitation…" />;
  if (!doc) return <div className="text-center py-16 text-slate-400">Habitation not found.</div>;

  const { habitation, risk, vulnerability } = doc;
  const tone = (risk?.riskClass || 'GREEN').toLowerCase();

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Link to="/habitations" className="btn btn-outline">← Back</Link>
        <h2 className="text-xl font-bold text-slate-800">{habitation.name}</h2>
        <Badge tone="slate">{habitation.dataSource}</Badge>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <Card title="Risk assessment" right={<Badge tone={tone} className="capitalize">{risk.riskClass}</Badge>}>
          <div className="flex items-center gap-4 flex-wrap">
            <ScoreGauge score={risk.riskScore} color={risk.color} label="Risk" />
            <div className="grid grid-cols-2 gap-2 text-sm">
              <Info label="Composite hazard" value={risk.compositeHazard} />
              <Info label="Exposure index" value={risk.exposureIndex} />
              <Info label="Infrastructure risk" value={risk.infrastructureRisk} />
              <Info label="Terrain risk" value={risk.terrainRisk} />
              <Info label="Population exposed" value={risk.populationExposed?.toLocaleString()} />
              <Info label="Confidence" value={(risk.confidence * 100).toFixed(0) + '%'} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xs font-semibold uppercase text-slate-500 mb-1">Limitations</div>
            <ul className="text-xs text-slate-500 list-disc list-inside space-y-1">
              {risk.limitations?.map((l, i) => <li key={i}>{l}</li>)}
            </ul>
          </div>
        </Card>

        <Card title="Vulnerability profile" right={<Badge tone={tone}>{vulnerability.vulnerabilityClass}</Badge>}>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <Info label="Vulnerability score" value={vulnerability.vulnerabilityScore} />
            <Info label="Vulnerable population" value={vulnerability.vulnerablePopulation?.toLocaleString()} />
            <Info label="Vulnerable share" value={vulnerability.vulnerableShare + '%'} />
            <Info label="Density" value={Math.round(vulnerability.populationDensity) + '/km²'} />
            <Info label="Emergency facility" value={vulnerability.emergencyFacilityKm + ' km'} />
            <Info label="Healthcare" value={vulnerability.healthcareKm + ' km'} />
            <Info label="Historical events" value={vulnerability.historicalEvents} />
            <Info label="Hazard exposure" value={vulnerability.hazardExposure} />
          </div>
        </Card>
      </div>

      <Card title="Hazards & historical exposure" right={<Badge tone="slate">Data: {risk.dataSource}</Badge>}>
        <div className="grid md:grid-cols-2 gap-5">
          <div>
            <div className="text-xs font-semibold uppercase text-slate-500 mb-1.5">Current hazard exposure</div>
            <div className="flex flex-wrap gap-1.5">
              {habitation.exposure?.map((e) => (
                <Badge key={e.hazardType} tone={tone}>{HAZARDS_LABEL[e.hazardType] || e.hazardType} (sev {e.exposure}/10)</Badge>
              ))}
            </div>
          </div>
          <div>
            <div className="text-xs font-semibold uppercase text-slate-500 mb-1.5">Historical disaster events</div>
            {habitation.history?.length ? (
              <ul className="space-y-1 text-sm">
                {habitation.history.map((ev, i) => (
                  <li key={i} className="border-l-2 border-brand-500 pl-2">
                    <span className="font-medium">{ev.year}</span> — {HAZARDS_LABEL[ev.hazardType] || ev.hazardType}, severity {ev.severity}
                  </li>
                ))}
              </ul>
            ) : <p className="text-sm text-slate-500">No records on file.</p>}
          </div>
        </div>
        <div className="mt-3 flex justify-end">
          <button className="btn-primary" onClick={() => navigate('/relocation')}>Generate relocation plan →</button>
        </div>
      </Card>
    </div>
  );
}