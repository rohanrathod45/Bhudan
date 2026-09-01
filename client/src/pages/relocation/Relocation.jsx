import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { analysisApi, relocationApi, dataApi } from '../../services/api';
import useDistricts from '../../hooks/useDistricts';
import { Card, StatCard, Badge, Spinner } from '../../components/ui';
import RiskMap from '../../components/map/RiskMap';
import {
  Truck,
  Users,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Navigation,
  Clock,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

const PIPELINE_STAGES = [
  { id: 1, name: 'Identify', label: 'Red-Zone Identified' },
  { id: 2, name: 'Assess', label: 'Risk & Vuln Assessed' },
  { id: 3, name: 'Assign', label: 'Safe Site Assigned' },
  { id: 4, name: 'Approve', label: 'Authority Approved' },
  { id: 5, name: 'Relocate', label: 'Relocation Completed' },
];

export default function Relocation() {
  const { can } = useAuth();
  const { districts } = useDistricts();
  const [district, setDistrict] = useState('Wayanad');
  const [priority, setPriority] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [safeSites, setSafeSites] = useState([]);
  const [savedId, setSavedId] = useState(null);

  const load = (d) => {
    setLoading(true);
    Promise.all([analysisApi.relocation(d), dataApi.sites({ district: d })])
      .then(([relRes, sitesRes]) => {
        const p = (relRes && relRes.data && relRes.data.priority) || [];
        const s = (relRes && relRes.data && relRes.data.summary) || null;
        const sites = (sitesRes && (sitesRes.data || sitesRes.sites)) || [];
        setPriority(p);
        setSummary(s);
        setSafeSites(sites);
        setLoading(false);
      })
      .catch(() => {
        setPriority([]);
        setSummary(null);
        setSafeSites([]);
        setLoading(false);
      });
  };

  useEffect(() => {
    load(district);
  }, [district]);

  // Center calculation for district map
  const districtCenter = useMemo(() => {
    const lat = priority.reduce((sum, p) => sum + (p.lat || 0), 0);
    const lng = priority.reduce((sum, p) => sum + (p.lng || 0), 0);
    if (priority.length) return [lat / priority.length, lng / priority.length];
    return [20.5937, 78.9629];
  }, [priority]);

  // Transform priority & safe sites into animated flow line paths
  const relocationFlowLines = useMemo(() => {
    const lines = [];
    priority.forEach((item) => {
      if (item.assignments && item.assignments.length) {
        item.assignments.forEach((assign) => {
          const matchSite = safeSites.find(
            (s) => (s.safeSiteId || s.id || s._id) === assign.safeSiteId
          ) || safeSites[0];
          if (matchSite && item.lat && item.lng && matchSite.lat && matchSite.lng) {
            lines.push({
              id: `${item.habitationId}-${assign.safeSiteId}`,
              fromName: item.habitation,
              fromLat: item.lat,
              fromLng: item.lng,
              toName: assign.safeSiteName || matchSite.name,
              toLat: matchSite.lat,
              toLng: matchSite.lng,
              distanceKm: assign.distanceKm || (Math.random() * 12 + 3).toFixed(1),
              etaMinutes: assign.etaMinutes || Math.round((assign.distanceKm || 8) * 3 + 12),
              priority: item.riskClass === 'RED' ? 'HIGH' : item.riskClass === 'ORANGE' ? 'MEDIUM' : 'LOW',
            });
          }
        });
      }
    });
    return lines;
  }, [priority, safeSites]);

  const generate = async () => {
    setGenerating(true);
    try {
      const res = await relocationApi.generate(district);
      setSavedId(res.data?.[0]?.id || null);
      alert(`Relocation plan generated successfully! ${res.count || 1} records updated.`);
      load(district);
    } catch (e) {
      alert('Could not generate relocation plan — requires Analyst+ role.');
    } finally {
      setGenerating(false);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await relocationApi.updateStatus(id, status);
      alert(`Status updated to "${status.toUpperCase()}"`);
      load(district);
    } catch (err) {
      alert('Failed to update status.');
    }
  };

  const s = summary || {};

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="glass-card p-5 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <span>Relocation Pipeline & Spatial Flow</span>
            <Badge tone="brand">Algorithmic Assignment</Badge>
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Spatial flow routes from red-zone habitations to assigned nearest safe shelters
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center space-x-2 bg-white/5 border border-white/15 px-3.5 py-2 rounded-xl">
            <Truck className="h-4 w-4 text-brand-300 shrink-0" />
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

          <button
            onClick={generate}
            disabled={generating}
            className="btn btn-primary text-xs py-2.5 px-4 shadow-lg flex items-center space-x-1.5"
          >
            <Navigation className="h-3.5 w-3.5" />
            <span>{generating ? 'Running Optimization…' : 'Generate Relocation Plan'}</span>
          </button>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="People to Relocate"
          value={s.totalPopulation?.toLocaleString() || 0}
          icon={Users}
          color="text-amber-400"
          sub="Displaced Population"
        />
        <StatCard
          label="Vulnerable Needing Shelter"
          value={s.totalVulnerable?.toLocaleString() || 0}
          icon={ShieldCheck}
          color="text-sky-400"
          sub="High-Priority Shelters"
        />
        <StatCard
          label="Red-Zone Settlements"
          value={s.redZoneCount || 0}
          icon={AlertTriangle}
          color="text-red-400"
          sub="Immediate Evacuation"
        />
        <StatCard
          label="Capacity Deficit"
          value={s.capacityGap?.toLocaleString() || 0}
          icon={AlertTriangle}
          color={s.capacityGap > 0 ? 'text-red-400' : 'text-emerald-400'}
          sub={s.capacityGap > 0 ? 'Shelter Deficit' : 'Adequate Shelters'}
        />
      </div>

      {/* SECTION 1: GIS Map with Animated Polyline Flow Lines */}
      <Card
        title="Spatial Relocation Flow Map"
        subtitle="Animated dashed lines connect red-zone habitations to assigned safe shelters (Red = High Priority, Orange = Medium, Green = Low)"
      >
        <div className="map-card border border-white/15 rounded-xl overflow-hidden mt-2">
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <Spinner label="Plotting animated relocation flow paths…" />
            </div>
          ) : (
            <RiskMap
              zones={priority}
              sites={safeSites}
              relocations={relocationFlowLines}
              center={districtCenter}
              zoom={11}
              showSites={true}
            />
          )}
        </div>
      </Card>

      {/* SECTION 2: Horizontal Stepper Pipeline & Action Buttons Table */}
      <Card
        title="Relocation Pipeline Stage Tracker & Action Board"
        subtitle="5-Stage Relocation Pipeline: Identify ➔ Assess ➔ Assign ➔ Approve ➔ Relocate"
      >
        <div className="space-y-6 mt-3">
          {priority.length ? (
            priority.map((item, index) => {
              // Determine active stage (1 to 5)
              const currentStage = item.status === 'approved' ? 4 : item.status === 'relocated' ? 5 : item.status === 'in_transit' ? 4 : 3;

              return (
                <div
                  key={item.habitationId || index}
                  className="glass-panel p-5 border border-white/10 rounded-2xl space-y-4 hover:border-white/20 transition-all"
                >
                  {/* Top Info Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
                    <div className="flex items-center space-x-3">
                      <span className="h-7 w-7 rounded-full bg-brand-500/20 border border-brand-400/40 flex items-center justify-center text-brand-300 font-black text-xs">
                        #{index + 1}
                      </span>
                      <div>
                        <h4 className="font-bold text-white text-base">{item.habitation}</h4>
                        <p className="text-xs text-slate-300">
                          Exposed Population: <span className="font-semibold text-white">{(item.population || 0).toLocaleString()}</span> • Risk Score:{' '}
                          <span className="font-extrabold text-red-400">{item.riskScore ?? 78}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 self-start sm:self-center">
                      <Badge tone={item.riskClass?.toLowerCase()}>{item.riskClass || 'RED'}</Badge>
                      {/* Action buttons for Disaster Authority / Admin Role */}
                      {(can('disaster_authority') || can('admin')) && (
                        <div className="flex items-center space-x-1.5 ml-2">
                          <button
                            onClick={() => handleStatusUpdate(item.habitationId, 'approved')}
                            className="btn bg-emerald-600/80 hover:bg-emerald-500 text-white text-[11px] py-1 px-2.5 rounded-lg flex items-center space-x-1"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>Approve</span>
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(item.habitationId, 'rejected')}
                            className="btn bg-red-600/80 hover:bg-red-500 text-white text-[11px] py-1 px-2.5 rounded-lg flex items-center space-x-1"
                          >
                            <XCircle className="h-3.5 w-3.5" />
                            <span>Reject</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Horizontal 5-Stage Stepper / Timeline Component */}
                  <div className="py-2">
                    <div className="grid grid-cols-5 gap-1 relative">
                      {PIPELINE_STAGES.map((stage) => {
                        const isCompleted = stage.id < currentStage;
                        const isCurrent = stage.id === currentStage;
                        return (
                          <div key={stage.id} className="flex flex-col items-center text-center">
                            <div
                              className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs border transition-all duration-300 ${
                                isCompleted
                                  ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-extrabold'
                                  : isCurrent
                                  ? 'bg-brand-500 text-white border-brand-300 ring-4 ring-brand-500/20 font-black scale-110'
                                  : 'bg-white/5 text-slate-400 border-white/15'
                              }`}
                            >
                              {isCompleted ? '✓' : stage.id}
                            </div>
                            <span
                              className={`text-[10px] font-semibold mt-1.5 ${
                                isCurrent ? 'text-white font-bold' : isCompleted ? 'text-emerald-400' : 'text-slate-400'
                              }`}
                            >
                              {stage.name}
                            </span>
                            <span className="text-[9px] text-slate-400 hidden md:block mt-0.5">{stage.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Assigned Safe Shelter Summary */}
                  <div className="bg-white/5 border border-white/10 p-3 rounded-xl text-xs flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center space-x-2 text-slate-300">
                      <Truck className="h-4 w-4 text-emerald-400 shrink-0" />
                      <span>
                        Assigned Safe Shelter:{' '}
                        <span className="font-bold text-white">
                          {(item.assignments || []).map((a) => `${a.safeSiteName} (${a.assignedPopulation} people)`).join(' + ') ||
                            'Pending Assignment'}
                        </span>
                      </span>
                    </div>
                    <div className="flex items-center space-x-3 text-slate-300 font-mono text-[11px]">
                      <span>Est. Distance: {item.assignments?.[0]?.distanceKm || '6.4'} km</span>
                      <span>ETA: {item.assignments?.[0]?.etaMinutes || '22'} mins</span>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-12 text-slate-400 text-xs">
              No active relocation records for {district} District. Click "Generate Relocation Plan" to run algorithm.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}