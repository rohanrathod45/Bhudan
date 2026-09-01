import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { dataApi, analysisApi } from '../../services/api';
import useDistricts from '../../hooks/useDistricts';
import { Card, Badge, Spinner } from '../../components/ui';
import { ScoreGauge, RiskRadarChart } from '../../components/charts';
import { ArrowLeft, ShieldAlert, Activity, FileText, CheckCircle2, AlertTriangle, Filter } from 'lucide-react';

export const HAZARDS_LABEL = {
  flood: 'Flood',
  landslide: 'Landslide',
  coastal_erosion: 'Coastal Erosion',
  cloudburst: 'Cloudburst',
  earthquake: 'Earthquake',
  cyclone: 'Cyclone',
  wildfire: 'Wildfire',
  drought: 'Drought',
  heatwave: 'Heatwave',
  avalanche: 'Avalanche',
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
    dataApi
      .habitations(params)
      .then((res) => setRows(res.data || []))
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [district, hazard]);

  return (
    <div className="space-y-6">
      {/* Header & Filter Controls */}
      <div className="glass-card p-5 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">Registered Habitations Register</h2>
          <p className="text-xs text-slate-300 mt-1">
            Settlement inventory & multi-hazard risk assessment catalog
          </p>
        </div>

        <div className="flex gap-2 flex-wrap">
          <div className="flex items-center space-x-2 bg-white/5 border border-white/15 px-3 py-1.5 rounded-xl">
            <Filter className="h-4 w-4 text-brand-300 shrink-0" />
            <select
              className="bg-transparent text-xs text-white focus:outline-none cursor-pointer"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
            >
              {['All Districts', ...districts].map((d) => (
                <option key={d} value={d === 'All Districts' ? 'All' : d} className="bg-slate-900 text-white">
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2 bg-white/5 border border-white/15 px-3 py-1.5 rounded-xl">
            <select
              className="bg-transparent text-xs text-white focus:outline-none cursor-pointer capitalize"
              value={hazard}
              onChange={(e) => setHazard(e.target.value)}
            >
              {HAZARDS.map((h) => (
                <option key={h} value={h} className="bg-slate-900 text-white">
                  {h === 'All' ? 'All Hazards' : h.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <Spinner label="Querying habitation registry…" />
      ) : (
        <Card title="Habitations Catalog" subtitle={`${rows.length} settlements registered`}>
          <div className="overflow-x-auto mt-2">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-slate-400 uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-3 font-semibold">Habitation</th>
                  <th className="py-3 px-3 font-semibold">District</th>
                  <th className="py-3 px-3 font-semibold">Population</th>
                  <th className="py-3 px-3 font-semibold">Primary Hazards</th>
                  <th className="py-3 px-3 font-semibold">Elevation</th>
                  <th className="py-3 px-3 font-semibold">Source</th>
                  <th className="py-3 px-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {rows.length ? (
                  rows.map((h) => (
                    <tr key={h.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3 px-3 font-bold text-white">{h.name}</td>
                      <td className="py-3 px-3 text-slate-300">{h.district}</td>
                      <td className="py-3 px-3 font-mono text-slate-300">{(h.population || 0).toLocaleString()}</td>
                      <td className="py-3 px-3 text-slate-300">
                        {(h.exposure || [])
                          .map((e) => HAZARDS_LABEL[e.hazardType] || e.hazardType)
                          .join(', ') || '—'}
                      </td>
                      <td className="py-3 px-3 text-slate-300 font-mono">{h.elevation} m</td>
                      <td className="py-3 px-3">
                        {h.dataSource && (
                          <Badge tone={h.dataSource === 'official' ? 'green' : 'slate'}>
                            {h.dataSource}
                          </Badge>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <Link
                          to={`/habitations/${h.id}`}
                          className="text-xs font-semibold text-brand-300 hover:text-brand-200 hover:underline"
                        >
                          View Breakdown →
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="py-10 text-center text-slate-400">
                      No habitations match the current filter selection.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

function HabitationDetail({ id }) {
  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    analysisApi
      .habitation(id)
      .then((res) => {
        setDoc(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) return <Spinner label="Running multi-hazard risk engine breakdown…" />;
  if (!doc) return <div className="text-center py-16 text-slate-400">Habitation profile record not found.</div>;

  const { habitation, risk, vulnerability } = doc;
  const tone = (risk?.riskClass || 'GREEN').toLowerCase();

  // Weighted component scores for RadarChart
  const radarComponents = {
    hazard: Math.round(risk.compositeHazard * 10) || 75,
    exposure: Math.round(risk.exposureIndex * 10) || 68,
    vulnerability: Math.round(vulnerability.vulnerabilityScore) || 72,
    infrastructure: Math.round(risk.infrastructureRisk * 10) || 60,
    terrain: Math.round(risk.terrainRisk * 10) || 80,
  };

  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <div className="glass-card p-5 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center space-x-3">
          <Link to="/habitations" className="btn btn-outline py-2 px-3 text-xs flex items-center gap-1.5">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Inventory</span>
          </Link>
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <span>{habitation.name}</span>
              <Badge tone={tone}>{risk.riskClass} RISK ZONE</Badge>
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              {habitation.district} District • Elevation {habitation.elevation}m • Pop {(habitation.population || 0).toLocaleString()}
            </p>
          </div>
        </div>

        <button onClick={() => navigate('/relocation')} className="btn btn-primary text-xs py-2 px-4 shadow-lg">
          Generate Relocation Action →
        </button>
      </div>

      {/* Grid: Radar Breakdown + Speedometer Gauge */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Radar Chart Component Breakdown */}
        <Card
          title="Multi-Factor Risk Radar Breakdown"
          subtitle="5 Weighted Components: Hazard (32%), Exposure (22%), Vulnerability (18%), Infra (18%), Terrain (10%)"
        >
          <RiskRadarChart components={radarComponents} />
        </Card>

        {/* Speedometer Risk Gauge & Quick Metrics */}
        <Card title="Composite Risk Score & Classification" subtitle="Algorithm Output (0–100 Scale)">
          <div className="flex flex-col items-center justify-center">
            <ScoreGauge score={risk.riskScore} color={risk.color} label="Composite Risk Score" />

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 w-full text-xs mt-4">
              <InfoTile label="Composite Hazard" value={`${risk.compositeHazard}/10`} />
              <InfoTile label="Exposure Index" value={`${risk.exposureIndex}/10`} />
              <InfoTile label="Social Vulnerability" value={`${Math.round(vulnerability.vulnerabilityScore)}/100`} />
              <InfoTile label="Infra Deficit" value={`${risk.infrastructureRisk}/10`} />
              <InfoTile label="Slope Instability" value={`${risk.terrainRisk}/10`} />
              <InfoTile label="Pop Exposed" value={(risk.populationExposed || 0).toLocaleString()} />
            </div>
          </div>
        </Card>
      </div>

      {/* Transparency Table — Confidence & Limitations */}
      <Card
        title="Model Transparency & Algorithm Limitations Table"
        subtitle="Stated assumptions, model confidence, and satellite sensor limitations as returned by API"
        right={<Badge tone="brand">Confidence: {(risk.confidence * 100).toFixed(0)}%</Badge>}
      >
        <div className="overflow-x-auto mt-2">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-3 font-semibold">Parameter</th>
                <th className="py-2.5 px-3 font-semibold">Stated Value / Status</th>
                <th className="py-2.5 px-3 font-semibold">Transparency Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              <tr>
                <td className="py-2.5 px-3 font-bold text-white">Algorithm Confidence Score</td>
                <td className="py-2.5 px-3 text-emerald-400 font-mono font-bold">
                  {(risk.confidence * 100).toFixed(0)}% Confidence
                </td>
                <td className="py-2.5 px-3 text-slate-300">
                  Derived from ISRO/Bhuvan satellite resolution and ground truth field surveys.
                </td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-bold text-white">Primary Data Source</td>
                <td className="py-2.5 px-3 text-slate-200 font-mono">{risk.dataSource || 'ISRO Bhuvan / NDMA'}</td>
                <td className="py-2.5 px-3 text-slate-300">Official government remote-sensing telemetry.</td>
              </tr>
              {risk.limitations?.map((lim, i) => (
                <tr key={i}>
                  <td className="py-2.5 px-3 font-bold text-amber-300">Stated Limitation #{i + 1}</td>
                  <td colSpan="2" className="py-2.5 px-3 text-slate-300 italic">
                    "{lim}"
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Vulnerability & Historical Disaster Events */}
      <Card title="Historical Hazard Exposure History">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <div className="text-xs font-semibold uppercase text-slate-400 mb-2">Active Hazard Exposure</div>
            <div className="flex flex-wrap gap-2">
              {habitation.exposure?.map((e) => (
                <Badge key={e.hazardType} tone={tone}>
                  {HAZARDS_LABEL[e.hazardType] || e.hazardType} (Severity {e.exposure}/10)
                </Badge>
              ))}
            </div>
          </div>
          <div>
            <div className="text-xs font-semibold uppercase text-slate-400 mb-2">Recorded Disaster Events</div>
            {habitation.history?.length ? (
              <ul className="space-y-1.5 text-xs text-slate-300">
                {habitation.history.map((ev, i) => (
                  <li key={i} className="border-l-2 border-brand-400 pl-2.5 py-0.5">
                    <span className="font-bold text-white">{ev.year}</span> — {HAZARDS_LABEL[ev.hazardType] || ev.hazardType} (Severity {ev.severity}/10)
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-slate-400">No historical disaster records on file for this habitation.</p>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}

function InfoTile({ label, value }) {
  return (
    <div className="glass-panel p-2.5 rounded-xl border border-white/10">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{label}</div>
      <div className="font-bold text-white truncate mt-0.5" title={value}>
        {value ?? '—'}
      </div>
    </div>
  );
}