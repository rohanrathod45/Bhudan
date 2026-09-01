import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { analysisApi, dataApi } from '../../services/api';
import useDistricts from '../../hooks/useDistricts';
import RiskMap, { MapLegend } from '../../components/map/RiskMap';
import { Card, StatCard, Badge, Spinner } from '../../components/ui';
import { ScoreGauge } from '../../components/charts';
import { AlertTriangle, MapPin, Flame, ArrowRight } from 'lucide-react';

const DEFAULT_CENTER = [20.5937, 78.9629];

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
    dataApi
      .sites({ district })
      .then((res) => setSites(res.data || []))
      .catch(() => setSites([]))
      .finally(() => setLoading(false));
  }, [district]);

  const zones = analysis?.data || [];
  const riskSum = zones.reduce((a, z) => a + z.riskScore, 0);

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="glass-card p-5 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <span>Hazard-Based Red Zones</span>
            <Badge tone="red">Critical Evacuation Focus</Badge>
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Habitations filtered by High & Critical risk threshold (Risk Score ≥ 55)
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-white/5 border border-white/15 px-3.5 py-2 rounded-xl">
          <MapPin className="h-4 w-4 text-emerald-400 shrink-0" />
          <select
            className="bg-transparent text-xs text-white focus:outline-none cursor-pointer"
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
          >
            {districts.map((d) => (
              <option key={d} value={d} className="bg-slate-900 text-white">
                {d} District
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Red Zones (Critical)"
          value={zones.filter((z) => z.riskClass === 'RED').length}
          icon={AlertTriangle}
          color="text-red-400"
          sub="Risk Score ≥ 70"
        />
        <StatCard
          label="Orange Zones (High)"
          value={zones.filter((z) => z.riskClass === 'ORANGE').length}
          icon={Flame}
          color="text-orange-400"
          sub="Risk Score 55–69"
        />
        <StatCard
          label="Total Critical Zones"
          value={zones.length}
          icon={AlertTriangle}
          color="text-amber-400"
          sub="High Urgency"
        />
        <StatCard
          label="Average Risk Score"
          value={zones.length ? Math.round(riskSum / zones.length) : 0}
          icon="📊"
          color="text-brand-300"
          sub="District Mean"
        />
      </div>

      {/* Map & List Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <div className="lg:col-span-3 min-h-[500px] glass-card p-0 relative rounded-2xl overflow-hidden border border-white/15">
          {loading ? (
            <div className="h-[500px] flex items-center justify-center">
              <Spinner label="Querying Red-Zone GIS points…" />
            </div>
          ) : (
            <>
              <RiskMap
                zones={zones}
                sites={sites}
                center={centers[district] || DEFAULT_CENTER}
                zoom={10}
                onSelectZone={setSelected}
              />
              <MapLegend />
            </>
          )}
        </div>

        <div className="lg:col-span-2 space-y-4 max-h-[520px] overflow-y-auto pr-1">
          {selected ? (
            <Card title={selected.habitation} right={<Badge tone="red">{selected.riskClass}</Badge>}>
              <ScoreGauge score={selected.riskScore} color={selected.color} />
              <div className="grid grid-cols-2 gap-2 text-xs mt-3">
                <InfoItem label="Primary Hazards" value={selected.mainHazards?.join(', ')} />
                <InfoItem label="Total Population" value={selected.population?.toLocaleString()} />
                <InfoItem label="Exposed Pop" value={selected.populationExposed?.toLocaleString()} />
                <InfoItem label="Exposure Index" value={selected.exposureIndex} />
                <InfoItem label="Infra Risk" value={selected.infrastructureRisk} />
                <InfoItem label="Model Confidence" value={(selected.confidence * 100).toFixed(0) + '%'} />
              </div>
              <button
                className="btn btn-primary w-full mt-4 text-xs justify-center flex items-center space-x-1"
                onClick={() => navigate(`/habitations/${selected.habitationId}`)}
              >
                <span>Open Full Assessment</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </Card>
          ) : (
            <Card title="Critical Red & Orange Habitations" subtitle="Click a marker on the map to inspect breakdown">
              {zones.length ? (
                <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
                  {zones.map((z) => (
                    <div
                      key={z.habitationId}
                      className="glass-panel p-3 border border-white/10 hover:border-white/20 transition-all rounded-xl cursor-pointer flex items-center justify-between text-xs"
                      onClick={() => setSelected(z)}
                    >
                      <div>
                        <div className="font-bold text-white text-sm">{z.habitation}</div>
                        <div className="text-[11px] text-slate-300 mt-0.5">
                          {z.district} • {z.mainHazards?.join(', ')}
                        </div>
                      </div>
                      <Badge tone={z.riskClass?.toLowerCase()}>{z.riskScore} {z.riskClass}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 py-8 text-center">No red or orange zones in this district.</p>
              )}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoItem({ label, value }) {
  return (
    <div className="glass-panel p-2 rounded-xl">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{label}</div>
      <div className="font-bold text-white truncate mt-0.5" title={value}>
        {value ?? '—'}
      </div>
    </div>
  );
}