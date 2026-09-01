import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { analysisApi, dataApi, relocationApi, userApi } from '../../services/api';
import useDistricts from '../../hooks/useDistricts';
import { Card, StatCard, Spinner, Badge } from '../../components/ui';
import { StackedDistrictBarChart, DonutChart, RISK_COLORS, ScoreGauge } from '../../components/charts';
import RiskMap, { MapLegend } from '../../components/map/RiskMap';
import {
  Building2,
  AlertTriangle,
  Users,
  Tent,
  Home,
  MapPin,
  Filter,
  ArrowUpRight,
  ShieldCheck,
  Flame,
  ArrowRight,
  Scale,
  CheckCircle2,
  ArrowUpDown,
  Truck,
  Navigation,
  XCircle,
  UserCheck,
  Lock
} from 'lucide-react';

const STATES_LIST = [
  'All States / UTs',
  'Kerala',
  'Uttarakhand',
  'Himachal Pradesh',
  'Assam',
  'Maharashtra',
  'Tamil Nadu'
];

const PIPELINE_STAGES = [
  { id: 1, name: 'Identify', label: 'Red-Zone Identified' },
  { id: 2, name: 'Assess', label: 'Risk & Vuln Assessed' },
  { id: 3, name: 'Assign', label: 'Safe Site Assigned' },
  { id: 4, name: 'Approve', label: 'Authority Approved' },
  { id: 5, name: 'Relocate', label: 'Relocation Completed' },
];

export default function Dashboard() {
  const { role, can } = useAuth();
  const { districts, centers } = useDistricts();

  // Dashboard state
  const [selectedState, setSelectedState] = useState('All States / UTs');
  const [selectedDistrict, setSelectedDistrict] = useState('Wayanad');
  const [dashboardData, setDashboardData] = useState(null);
  const [districtAnalysisList, setDistrictAnalysisList] = useState([]);
  const [loadingDashboard, setLoadingDashboard] = useState(true);
  const [error, setError] = useState('');
  const [fieldOfficerTasks, setFieldOfficerTasks] = useState([]);

  // Red Zones section state
  const [redZonesAnalysis, setRedZonesAnalysis] = useState(null);
  const [redZoneSites, setRedZoneSites] = useState([]);
  const [loadingRedZones, setLoadingRedZones] = useState(true);
  const [selectedZone, setSelectedZone] = useState(null);

  // Safe Sites section state
  const [safeSitesList, setSafeSitesList] = useState([]);
  const [loadingSafeSites, setLoadingSafeSites] = useState(true);

  // Carrying Capacity section state
  const [capacityData, setCapacityData] = useState(null);
  const [districtSummaries, setDistrictSummaries] = useState([]);
  const [loadingCapacity, setLoadingCapacity] = useState(true);
  const [sortDeficitAsc, setSortDeficitAsc] = useState(false);

  // Relocation section state
  const [relocPriority, setRelocPriority] = useState([]);
  const [relocSummary, setRelocSummary] = useState(null);
  const [loadingReloc, setLoadingReloc] = useState(true);
  const [generatingReloc, setGeneratingReloc] = useState(false);

  // Admin section state
  const [adminUsers, setAdminUsers] = useState([]);
  const [adminStats, setAdminStats] = useState(null);
  const [loadingAdmin, setLoadingAdmin] = useState(true);

  // 1. Fetch Dashboard data & multi-district stacked data
  useEffect(() => {
    setLoadingDashboard(true);
    setError('');

    analysisApi
      .districtAnalysis(selectedDistrict)
      .then((res) => setDashboardData(res.analysis))
      .catch(() => setError('Could not load district analysis. Verify backend server connection.'))
      .finally(() => setLoadingDashboard(false));

    const sampleDistricts = ['Wayanad', 'Idukki', 'Alappuzha', 'Kozhikode', 'Thrissur'];
    Promise.all(
      sampleDistricts.map((d) =>
        analysisApi.districtAnalysis(d).then((r) => ({
          district: d,
          summary: r.analysis?.summary || {},
        }))
      )
    )
      .then((results) => {
        const stacked = results.map((item) => ({
          district: item.district,
          GREEN: item.summary.greenCount || 0,
          YELLOW: item.summary.yellowCount || 0,
          ORANGE: item.summary.orangeCount || 0,
          RED: item.summary.redZoneCount || 0,
        }));
        setDistrictAnalysisList(stacked);
      })
      .catch(() => {});
  }, [selectedDistrict]);

  // Field Officer Tasks
  useEffect(() => {
    if (role === 'field_officer') {
      relocationApi
        .list(selectedDistrict)
        .then((res) => setFieldOfficerTasks(res.data || []))
        .catch(() => setFieldOfficerTasks([]));
    }
  }, [role, selectedDistrict]);

  // 2. Fetch Red Zones data
  useEffect(() => {
    setLoadingRedZones(true);
    analysisApi
      .redZones(selectedDistrict)
      .then((res) => setRedZonesAnalysis(res))
      .catch(() => setRedZonesAnalysis(null));
    dataApi
      .sites({ district: selectedDistrict })
      .then((res) => setRedZoneSites(res.data || []))
      .catch(() => setRedZoneSites([]))
      .finally(() => setLoadingRedZones(false));
  }, [selectedDistrict]);

  // 3. Fetch Safe Sites data
  useEffect(() => {
    setLoadingSafeSites(true);
    dataApi
      .sites({ district: selectedDistrict })
      .then((res) => setSafeSitesList(res.data || []))
      .catch(() => setSafeSitesList([]))
      .finally(() => setLoadingSafeSites(false));
  }, [selectedDistrict]);

  // 4. Fetch Capacity data
  useEffect(() => {
    setLoadingCapacity(true);
    analysisApi
      .capacity(selectedDistrict)
      .then((res) => setCapacityData(res.data))
      .catch(() => setCapacityData(null))
      .finally(() => setLoadingCapacity(false));

    const sampleDistricts = ['Wayanad', 'Idukki', 'Alappuzha', 'Kozhikode', 'Thrissur'];
    Promise.all(
      sampleDistricts.map((d) =>
        analysisApi.capacity(d).then((r) => ({
          district: d,
          ...(r.data || {}),
        }))
      )
    )
      .then((results) => setDistrictSummaries(results))
      .catch(() => {});
  }, [selectedDistrict]);

  // 5. Fetch Relocation data
  const loadReloc = (d) => {
    setLoadingReloc(true);
    Promise.all([analysisApi.relocation(d), dataApi.sites({ district: d })])
      .then(([relRes, sitesRes]) => {
        const p = (relRes && relRes.data && relRes.data.priority) || [];
        const s = (relRes && relRes.data && relRes.data.summary) || null;
        setRelocPriority(p);
        setRelocSummary(s);
        setLoadingReloc(false);
      })
      .catch(() => {
        setRelocPriority([]);
        setRelocSummary(null);
        setLoadingReloc(false);
      });
  };

  useEffect(() => {
    loadReloc(selectedDistrict);
  }, [selectedDistrict]);

  // 6. Fetch Admin data if admin role
  useEffect(() => {
    if (can('admin')) {
      setLoadingAdmin(true);
      userApi.list().then((r) => setAdminUsers(r.data || [])).catch(() => []);
      dataApi.habitations({}).then((r) => setAdminStats((s) => ({ ...s, habitations: r.count }))).catch(() => {});
      dataApi.sites({}).then((r) => setAdminStats((s) => ({ ...s, sites: r.count }))).catch(() => {});
      setLoadingAdmin(false);
    }
  }, [can]);

  // Summary Metrics calculations
  const s = dashboardData?.summary || {};
  const totalDistricts = useMemo(() => districts.length || 5, [districts]);
  const totalRedZones = s.redZoneCount || 0;
  const totalVulnerable = s.totalVulnerable || 0;
  const totalSafeCapacity = s.capacityAvailable || 0;
  const totalHabitationsAtRisk = s.totalHabitations || 0;

  const riskDonutData = useMemo(() => {
    return [
      { name: 'Red (Critical)', value: s.redZoneCount || 0 },
      { name: 'Orange (High)', value: s.orangeCount || 0 },
      { name: 'Yellow (Moderate)', value: s.yellowCount || 0 },
      { name: 'Green (Low)', value: s.greenCount || 0 },
    ];
  }, [s]);

  // Red zones summary
  const redZonesList = redZonesAnalysis?.data || [];
  const redRiskSum = redZonesList.reduce((a, z) => a + z.riskScore, 0);

  // Capacity sorted summary
  const sortedDistrictSummaries = useMemo(() => {
    return [...districtSummaries].sort((a, b) => {
      const gapA = a.capacityGap || 0;
      const gapB = b.capacityGap || 0;
      return sortDeficitAsc ? gapA - gapB : gapB - gapA;
    });
  }, [districtSummaries, sortDeficitAsc]);

  // Relocation flow lines for GIS Map
  const relocDistrictCenter = useMemo(() => {
    const lat = relocPriority.reduce((sum, p) => sum + (p.lat || 0), 0);
    const lng = relocPriority.reduce((sum, p) => sum + (p.lng || 0), 0);
    if (relocPriority.length) return [lat / relocPriority.length, lng / relocPriority.length];
    return [20.5937, 78.9629];
  }, [relocPriority]);

  const relocationFlowLines = useMemo(() => {
    const lines = [];
    relocPriority.forEach((item) => {
      if (item.assignments && item.assignments.length) {
        item.assignments.forEach((assign) => {
          const matchSite = safeSitesList.find(
            (s) => (s.safeSiteId || s.id || s._id) === assign.safeSiteId
          ) || safeSitesList[0];
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
  }, [relocPriority, safeSitesList]);

  const handleGenerateRelocation = async () => {
    setGeneratingReloc(true);
    try {
      const res = await relocationApi.generate(selectedDistrict);
      alert(`Relocation plan generated successfully! ${res.count || 1} records processed.`);
      loadReloc(selectedDistrict);
    } catch (e) {
      alert('Could not generate relocation plan — requires Analyst+ role permission.');
    } finally {
      setGeneratingReloc(false);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await relocationApi.updateStatus(id, status);
      alert(`Status updated to "${status.toUpperCase()}"`);
      loadReloc(selectedDistrict);
    } catch (err) {
      alert('Failed to update status.');
    }
  };

  return (
    <div className="space-y-0">
      {/* Global Filter Toolbar */}
      <div className="sticky top-16 md:top-18 z-40 bg-[#0B1120]/95 backdrop-blur-md border-b border-slate-700/80 px-4 md:px-8 py-3 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center space-x-2">
          <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            District Filter:
          </span>
          <span className="text-sm font-bold text-slate-100 font-heading">
            {selectedDistrict} District
          </span>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center space-x-2 bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-xl text-xs">
            <Filter className="h-4 w-4 text-blue-400 shrink-0" />
            <select
              className="bg-transparent text-xs text-slate-100 focus:outline-none cursor-pointer"
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
            >
              {STATES_LIST.map((st) => (
                <option key={st} value={st} className="bg-slate-900 text-slate-100">
                  {st}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2 bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-xl text-xs">
            <MapPin className="h-4 w-4 text-emerald-400 shrink-0" />
            <select
              className="bg-transparent text-xs text-slate-100 focus:outline-none cursor-pointer"
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
            >
              {districts.map((d) => (
                <option key={d} value={d} className="bg-slate-900 text-slate-100">
                  {d} District
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="mx-4 md:mx-8 my-4 text-sm bg-red-500/15 text-red-300 border border-red-500/30 rounded-xl p-4">
          ⚠️ {error}
        </div>
      )}

      {/* SECTION 1: #dashboard */}
      <section id="dashboard" className="scroll-mt-28 py-16 md:py-20 px-4 md:px-8 bg-[#0B1120]">
        <div className="max-w-7xl mx-auto space-y-8 animate-fade-up">
          {/* Eyebrow & Header */}
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-blue-400 mb-1 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
              <span>Live Decision Stream</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-100 tracking-tight font-heading">
              Disaster Risk & Command Dashboard
            </h2>
            <p className="text-sm md:text-base text-slate-400 mt-1 max-w-3xl">
              Intelligent multi-hazard spatial vulnerability analysis, carrying capacity matrix, and real-time relocation support for vulnerable habitations.
            </p>
          </div>

          {loadingDashboard ? (
            <Spinner label="Processing hazard algorithms and spatial layers…" />
          ) : (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <StatCard
                  label="Total Districts"
                  value={totalDistricts}
                  icon={Building2}
                  color="text-cyan-400"
                  sub="Mapped Territories"
                />
                <StatCard
                  label="Total Red Zones"
                  value={totalRedZones}
                  icon={AlertTriangle}
                  color="text-red-400"
                  sub="Critical Risk Areas"
                />
                <StatCard
                  label="Vulnerable Population"
                  value={totalVulnerable.toLocaleString()}
                  icon={Users}
                  color="text-orange-400"
                  sub="Requiring Assistance"
                />
                <StatCard
                  label="Safe Sites Available"
                  value={totalSafeCapacity.toLocaleString()}
                  icon={Tent}
                  color="text-emerald-400"
                  sub="Available Shelter Cap"
                />
                <StatCard
                  label="Habitations at Risk"
                  value={totalHabitationsAtRisk}
                  icon={Home}
                  color="text-blue-400"
                  sub="Monitored Settlements"
                />
              </div>

              {/* Side-by-Side Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card
                  title="District-Wise Hazard Zone Classification"
                  subtitle="Stacked count of GREEN, YELLOW, ORANGE, and RED risk zones"
                >
                  <StackedDistrictBarChart data={districtAnalysisList} />
                </Card>

                <Card
                  title="Overall Risk Distribution Share"
                  subtitle={`Risk category breakdown for ${selectedDistrict} District`}
                  right={
                    <Badge tone={s.capacityGap > 0 ? 'red' : 'green'}>
                      {s.capacityGap > 0 ? 'Capacity Deficit' : 'Capacity Adequate'}
                    </Badge>
                  }
                >
                  <DonutChart
                    data={riskDonutData}
                    colors={[RISK_COLORS.RED, RISK_COLORS.ORANGE, RISK_COLORS.YELLOW, RISK_COLORS.GREEN]}
                  />
                </Card>
              </div>

              {/* Critical Red-Zone Register */}
              <Card
                title="Critical Red-Zone Register"
                subtitle={`Highest hazard vulnerability habitations in ${selectedDistrict}`}
                right={
                  <button
                    onClick={() => {
                      const el = document.getElementById('red-zones');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer"
                  >
                    <span>View Map & All Zones</span>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </button>
                }
              >
                <div className="overflow-x-auto mt-1">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-700 text-slate-400 uppercase text-[10px] tracking-wider">
                        <th className="py-3 px-3 font-semibold">Habitation</th>
                        <th className="py-3 px-3 font-semibold">Primary Hazards</th>
                        <th className="py-3 px-3 font-semibold">Exposed Pop</th>
                        <th className="py-3 px-3 font-semibold">Risk Score</th>
                        <th className="py-3 px-3 font-semibold">Risk Class</th>
                        <th className="py-3 px-3 font-semibold text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {(dashboardData?.redZones || []).slice(0, 6).map((r) => (
                        <tr key={r.zone.habitationId} className="hover:bg-slate-800/50 transition-colors">
                          <td className="py-3 px-3 font-bold text-slate-100">{r.zone.habitation}</td>
                          <td className="py-3 px-3 text-slate-300">{r.zone.mainHazards?.join(', ') || 'Multi-Hazard'}</td>
                          <td className="py-3 px-3 text-slate-300 font-mono">{r.zone.populationExposed?.toLocaleString()}</td>
                          <td className="py-3 px-3 font-bold text-slate-100 font-mono">{r.zone.riskScore}</td>
                          <td className="py-3 px-3">
                            <Badge tone={r.zone.riskClass.toLowerCase()}>{r.zone.riskClass}</Badge>
                          </td>
                          <td className="py-3 px-3 text-right">
                            <button
                              onClick={() => {
                                const el = document.getElementById('red-zones');
                                if (el) el.scrollIntoView({ behavior: 'smooth' });
                              }}
                              className="text-xs text-blue-400 hover:text-blue-300 font-semibold cursor-pointer"
                            >
                              Inspect Zone →
                            </button>
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
      </section>

      {/* SECTION 2: #red-zones */}
      <section id="red-zones" className="scroll-mt-28 py-16 md:py-20 px-4 md:px-8 bg-[#0F172A] border-t border-slate-800">
        <div className="max-w-7xl mx-auto space-y-8 animate-fade-up">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-red-400 mb-1 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-ping" />
              <span>GIS Spatial Heatmap & Critical Zones</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-100 tracking-tight font-heading">
              Hazard-Based Red & Orange Zones
            </h2>
            <p className="text-sm md:text-base text-slate-400 mt-1 max-w-3xl">
              Habitations classified under High and Critical risk thresholds (Risk Score ≥ 55) requiring immediate field inspection and relocation planning.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Red Zones (Critical)"
              value={redZonesList.filter((z) => z.riskClass === 'RED').length}
              icon={AlertTriangle}
              color="text-red-400"
              sub="Risk Score ≥ 70"
            />
            <StatCard
              label="Orange Zones (High)"
              value={redZonesList.filter((z) => z.riskClass === 'ORANGE').length}
              icon={Flame}
              color="text-orange-400"
              sub="Risk Score 55–69"
            />
            <StatCard
              label="Total Critical Zones"
              value={redZonesList.length}
              icon={AlertTriangle}
              color="text-yellow-400"
              sub="High Urgency"
            />
            <StatCard
              label="Average Risk Score"
              value={redZonesList.length ? Math.round(redRiskSum / redZonesList.length) : 0}
              icon={ShieldCheck}
              color="text-blue-400"
              sub="District Mean"
            />
          </div>

          {/* Map & List Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-3 min-h-[520px] glass-card p-0 relative rounded-xl overflow-hidden border border-slate-700">
              {loadingRedZones ? (
                <div className="h-[520px] flex items-center justify-center">
                  <Spinner label="Querying Red-Zone GIS map layers…" />
                </div>
              ) : (
                <>
                  <RiskMap
                    zones={redZonesList}
                    sites={redZoneSites}
                    center={centers[selectedDistrict] || [20.5937, 78.9629]}
                    zoom={10}
                    onSelectZone={setSelectedZone}
                  />
                  <MapLegend />
                </>
              )}
            </div>

            <div className="lg:col-span-2 space-y-4 max-h-[520px] overflow-y-auto pr-1">
              {selectedZone ? (
                <Card title={selectedZone.habitation} right={<Badge tone="red">{selectedZone.riskClass}</Badge>}>
                  <ScoreGauge score={selectedZone.riskScore} color={selectedZone.color} />
                  <div className="grid grid-cols-2 gap-2 text-xs mt-3">
                    <InfoTile label="Primary Hazards" value={selectedZone.mainHazards?.join(', ')} />
                    <InfoTile label="Total Population" value={selectedZone.population?.toLocaleString()} />
                    <InfoTile label="Exposed Pop" value={selectedZone.populationExposed?.toLocaleString()} />
                    <InfoTile label="Exposure Index" value={selectedZone.exposureIndex} />
                    <InfoTile label="Infra Risk" value={selectedZone.infrastructureRisk} />
                    <InfoTile label="Model Confidence" value={(selectedZone.confidence * 100).toFixed(0) + '%'} />
                  </div>
                  <button
                    className="btn btn-primary w-full mt-4 text-xs justify-center flex items-center space-x-1"
                    onClick={() => {
                      const el = document.getElementById('relocation');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    <span>Proceed to Relocation Flow</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </Card>
              ) : (
                <Card title="Critical Red & Orange Habitations" subtitle="Click a marker on the map to inspect detail breakdown">
                  {redZonesList.length ? (
                    <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
                      {redZonesList.map((z) => (
                        <div
                          key={z.habitationId}
                          className="glass-panel p-3 border border-slate-700/80 hover:border-slate-600 transition-all rounded-xl cursor-pointer flex items-center justify-between text-xs"
                          onClick={() => setSelectedZone(z)}
                        >
                          <div>
                            <div className="font-bold text-slate-100 text-sm">{z.habitation}</div>
                            <div className="text-[11px] text-slate-400 mt-0.5">
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
      </section>

      {/* SECTION 3: #safe-sites */}
      <section id="safe-sites" className="scroll-mt-28 py-16 md:py-20 px-4 md:px-8 bg-[#0B1120] border-t border-slate-800">
        <div className="max-w-7xl mx-auto space-y-8 animate-fade-up">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-1 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span>Resource Inventory & Emergency Shelters</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-100 tracking-tight font-heading">
              Registered Safe Shelters
            </h2>
            <p className="text-sm md:text-base text-slate-400 mt-1 max-w-3xl">
              Verified emergency shelter inventory, max population capacities, resource indices, and official government site registrations.
            </p>
          </div>

          {loadingSafeSites ? (
            <Spinner label="Loading safe shelter inventory data…" />
          ) : (
            <Card title="Safe Shelters Inventory" subtitle={`${safeSitesList.length} sites registered in ${selectedDistrict}`}>
              <div className="overflow-x-auto mt-2">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-700 text-slate-400 uppercase text-[10px] tracking-wider">
                      <th className="py-3 px-3 font-semibold">Site Name</th>
                      <th className="py-3 px-3 font-semibold">District</th>
                      <th className="py-3 px-3 font-semibold">Type</th>
                      <th className="py-3 px-3 font-semibold">Capacity (Available / Max)</th>
                      <th className="py-3 px-3 font-semibold">Resource Index</th>
                      <th className="py-3 px-3 font-semibold">Source</th>
                      <th className="py-3 px-3 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {safeSitesList.length ? (
                      safeSitesList.map((s) => {
                        const resourceFields = [
                          'waterAvailability',
                          'housing',
                          'healthcare',
                          'sanitation',
                          'foodLogistics',
                          'roadConnectivity',
                          'emergencyServices',
                        ];
                        const avg = Math.round(
                          resourceFields.reduce((a, f) => a + (s[f] || 0), 0) / resourceFields.length
                        );
                        const avail = s.maxPopulationCapacity - (s.currentOccupancy || 0);
                        const maxCap = s.maxPopulationCapacity || 1;
                        const freePct = Math.round((avail / maxCap) * 100);

                        return (
                          <tr key={s.safeSiteId || s.id} className="hover:bg-slate-800/50 transition-colors">
                            <td className="py-3 px-3 font-bold text-slate-100 flex items-center space-x-2">
                              <span>🏕️</span>
                              <span>{s.name}</span>
                            </td>
                            <td className="py-3 px-3 text-slate-300">{s.district}</td>
                            <td className="py-3 px-3 text-slate-300 capitalize">{s.type || 'Relocation Center'}</td>
                            <td className="py-3 px-3 font-mono">
                              <span className="text-emerald-400 font-bold">{avail.toLocaleString()}</span>
                              <span className="text-slate-400"> / {(s.maxPopulationCapacity || 0).toLocaleString()} ({freePct}% free)</span>
                            </td>
                            <td className="py-3 px-3 font-bold text-cyan-400 font-mono">{avg}/100</td>
                            <td className="py-3 px-3">
                              {s.dataSource && (
                                <Badge tone={s.dataSource === 'official' ? 'green' : 'yellow'}>{s.dataSource}</Badge>
                              )}
                            </td>
                            <td className="py-3 px-3">
                              {s.status && <Badge tone={s.status === 'optimal' ? 'green' : 'slate'}>{s.status}</Badge>}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="7" className="py-10 text-center text-slate-400">
                          No safe sites found for {selectedDistrict}.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      </section>

      {/* SECTION 4: #capacity */}
      <section id="capacity" className="scroll-mt-28 py-16 md:py-20 px-4 md:px-8 bg-[#0F172A] border-t border-slate-800">
        <div className="max-w-7xl mx-auto space-y-8 animate-fade-up">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-cyan-400 mb-1 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-500" />
              <span>Demand vs Supply & Capacity Deficit</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-100 tracking-tight font-heading">
              Safe Site Carrying Capacity Assessment
            </h2>
            <p className="text-sm md:text-base text-slate-400 mt-1 max-w-3xl">
              Resource readiness, housing capacity thresholds, and capacity deficit evaluation across all registered relocation centers.
            </p>
          </div>

          {loadingCapacity ? (
            <Spinner label="Calculating safe site carrying capacity & resource scores…" />
          ) : (
            <>
              {/* Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  label="Relocation Demand"
                  value={capacityData?.demandPopulation?.toLocaleString() || 0}
                  icon={Users}
                  color="text-orange-400"
                  sub="Exposed Population"
                />
                <StatCard
                  label="Total Shelter Capacity"
                  value={capacityData?.totalCapacity?.toLocaleString() || 0}
                  icon={Scale}
                  color="text-cyan-400"
                  sub="Max Site Threshold"
                />
                <StatCard
                  label="Available Capacity"
                  value={capacityData?.totalAvailable?.toLocaleString() || 0}
                  icon={CheckCircle2}
                  color="text-emerald-400"
                  sub="Unoccupied Capacity"
                />
                <StatCard
                  label="Capacity Gap (Deficit)"
                  value={capacityData?.capacityGap?.toLocaleString() || 0}
                  icon={AlertTriangle}
                  color={capacityData?.capacityGap > 0 ? 'text-red-400' : 'text-emerald-400'}
                  sub={capacityData?.capacityGap > 0 ? 'Critical Deficit' : 'Sufficient Supply'}
                />
              </div>

              {/* Sortable District Summary Table */}
              <Card
                title="District Capacity Deficit Summary Table"
                subtitle="Ranked by deficit size — critical districts with highest shelter deficit listed on top"
                right={
                  <button
                    onClick={() => setSortDeficitAsc((prev) => !prev)}
                    className="btn btn-outline text-xs py-1.5 px-3 flex items-center space-x-1.5"
                  >
                    <ArrowUpDown className="h-3.5 w-3.5" />
                    <span>Sort by Deficit ({sortDeficitAsc ? 'Asc' : 'Desc'})</span>
                  </button>
                }
              >
                <div className="overflow-x-auto mt-2">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-700 text-slate-400 uppercase text-[10px] tracking-wider">
                        <th className="py-3 px-3 font-semibold">District</th>
                        <th className="py-3 px-3 font-semibold">Demand (Exposed)</th>
                        <th className="py-3 px-3 font-semibold">Total Capacity</th>
                        <th className="py-3 px-3 font-semibold">Available</th>
                        <th className="py-3 px-3 font-semibold">Capacity Deficit</th>
                        <th className="py-3 px-3 font-semibold text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {sortedDistrictSummaries.map((item) => {
                        const hasGap = (item.capacityGap || 0) > 0;
                        return (
                          <tr
                            key={item.district}
                            className={`hover:bg-slate-800/50 transition-colors ${
                              item.district === selectedDistrict ? 'bg-slate-800/90 font-bold' : ''
                            }`}
                          >
                            <td className="py-3 px-3 font-bold text-slate-100 flex items-center space-x-2">
                              <span>{item.district}</span>
                              {item.district === selectedDistrict && <Badge tone="brand">Selected</Badge>}
                            </td>
                            <td className="py-3 px-3 text-slate-300 font-mono">
                              {(item.demandPopulation || 0).toLocaleString()}
                            </td>
                            <td className="py-3 px-3 text-slate-300 font-mono">
                              {(item.totalCapacity || 0).toLocaleString()}
                            </td>
                            <td className="py-3 px-3 text-emerald-400 font-mono font-bold">
                              {(item.totalAvailable || 0).toLocaleString()}
                            </td>
                            <td className="py-3 px-3 font-mono font-bold text-red-400">
                              {hasGap ? `+${item.capacityGap.toLocaleString()}` : '0 (Surplus)'}
                            </td>
                            <td className="py-3 px-3 text-right">
                              <Badge tone={hasGap ? 'red' : 'green'}>
                                {hasGap ? 'INSUFFICIENT' : 'SUFFICIENT'}
                              </Badge>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>

              {/* Demand vs Supply Split Progress Bar */}
              <Card
                title={`Safe Sites Carrying Capacity Breakdown — ${selectedDistrict}`}
                subtitle="Split-color progress bar showing demand occupancy vs available capacity"
              >
                <div className="space-y-4 mt-3">
                  {(capacityData?.sites || []).map((site) => {
                    const maxCap = site.maxCapacity || site.maxPopulationCapacity || 100;
                    const available = site.availableCapacity || 0;
                    const demand = Math.max(0, maxCap - available);
                    const demandPct = Math.min(100, (demand / maxCap) * 100);
                    const availablePct = 100 - demandPct;

                    return (
                      <div key={site.safeSiteId || site.id} className="glass-panel p-4 border border-slate-700/80 rounded-xl space-y-2">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                          <div>
                            <span className="font-bold text-slate-100 text-sm">{site.name || site.siteName}</span>
                            <span className="text-slate-400 ml-2 text-xs">Suitability Index: {Math.round(site.suitability || 85)}/100</span>
                          </div>
                          <div className="flex items-center space-x-3 font-mono">
                            <span className="text-red-400 font-semibold">Demand: {demand.toLocaleString()}</span>
                            <span className="text-slate-500">•</span>
                            <span className="text-emerald-400 font-semibold">Available: {available.toLocaleString()}</span>
                            <span className="text-slate-500">•</span>
                            <span className="text-slate-100 font-bold">Max: {maxCap.toLocaleString()}</span>
                          </div>
                        </div>

                        <div className="h-4 w-full bg-slate-900 rounded-full overflow-hidden flex border border-slate-700 shadow-inner">
                          <div
                            style={{ width: `${demandPct}%` }}
                            className="h-full bg-gradient-to-r from-red-600 to-red-500 transition-all duration-500 flex items-center justify-center text-[9px] font-bold text-white"
                          >
                            {demandPct > 15 && `${demandPct.toFixed(0)}% Occupied`}
                          </div>
                          <div
                            style={{ width: `${availablePct}%` }}
                            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500 flex items-center justify-center text-[9px] font-bold text-slate-950"
                          >
                            {availablePct > 15 && `${availablePct.toFixed(0)}% Surplus`}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>

              {/* Resource Readiness Table */}
              <Card title="Resource Readiness Scores by Site" subtitle="Water, housing, healthcare, sanitation & road connectivity scores (0–10 scale)">
                <div className="overflow-x-auto mt-1">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-700 text-slate-400 uppercase text-[10px] tracking-wider">
                        <th className="py-3 px-3 font-semibold">Site Name</th>
                        <th className="py-3 px-3 font-semibold">Water</th>
                        <th className="py-3 px-3 font-semibold">Housing</th>
                        <th className="py-3 px-3 font-semibold">Healthcare</th>
                        <th className="py-3 px-3 font-semibold">Sanitation</th>
                        <th className="py-3 px-3 font-semibold">Food/Logistics</th>
                        <th className="py-3 px-3 font-semibold">Roads</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {(capacityData?.sites || []).map((site) => (
                        <tr key={site.safeSiteId || site.id} className="hover:bg-slate-800/50 transition-colors">
                          <td className="py-3 px-3 font-bold text-slate-100">{site.name || site.siteName}</td>
                          <td className="py-3 px-3 text-emerald-400 font-bold font-mono">
                            {site.resources?.find((r) => r.key === 'waterAvailability')?.score || 8.5}/10
                          </td>
                          <td className="py-3 px-3 text-cyan-400 font-bold font-mono">
                            {site.resources?.find((r) => r.key === 'housing')?.score || 8.0}/10
                          </td>
                          <td className="py-3 px-3 text-purple-400 font-bold font-mono">
                            {site.resources?.find((r) => r.key === 'healthcare')?.score || 7.8}/10
                          </td>
                          <td className="py-3 px-3 text-yellow-400 font-bold font-mono">
                            {site.resources?.find((r) => r.key === 'sanitation')?.score || 8.2}/10
                          </td>
                          <td className="py-3 px-3 text-teal-400 font-bold font-mono">
                            {site.resources?.find((r) => r.key === 'foodLogistics')?.score || 8.0}/10
                          </td>
                          <td className="py-3 px-3 text-blue-400 font-bold font-mono">
                            {site.resources?.find((r) => r.key === 'roadConnectivity')?.score || 8.8}/10
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
      </section>

      {/* SECTION 5: #relocation */}
      <section id="relocation" className="scroll-mt-28 py-16 md:py-20 px-4 md:px-8 bg-[#0B1120] border-t border-slate-800">
        <div className="max-w-7xl mx-auto space-y-8 animate-fade-up">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-blue-400 mb-1 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                <span>Spatial Routing & Pipeline Tracker</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-100 tracking-tight font-heading">
                Relocation Pipeline & Spatial Flow
              </h2>
              <p className="text-sm md:text-base text-slate-400 mt-1 max-w-3xl">
                Algorithmic spatial routing connecting high-risk settlements to verified safe shelters, with a 5-stage pipeline timeline tracker.
              </p>
            </div>

            <button
              onClick={handleGenerateRelocation}
              disabled={generatingReloc}
              className="btn btn-primary text-xs py-2.5 px-4 shadow-lg flex items-center space-x-2 self-start md:self-auto cursor-pointer"
            >
              <Navigation className="h-4 w-4" />
              <span>{generatingReloc ? 'Running Optimization…' : 'Generate Relocation Plan'}</span>
            </button>
          </div>

          {loadingReloc ? (
            <Spinner label="Plotting animated relocation flow paths and pipeline states…" />
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  label="People to Relocate"
                  value={relocSummary?.totalPopulation?.toLocaleString() || 0}
                  icon={Users}
                  color="text-orange-400"
                  sub="Displaced Population"
                />
                <StatCard
                  label="Vulnerable Needing Shelter"
                  value={relocSummary?.totalVulnerable?.toLocaleString() || 0}
                  icon={ShieldCheck}
                  color="text-cyan-400"
                  sub="High-Priority Shelters"
                />
                <StatCard
                  label="Red-Zone Settlements"
                  value={relocSummary?.redZoneCount || 0}
                  icon={AlertTriangle}
                  color="text-red-400"
                  sub="Immediate Evacuation"
                />
                <StatCard
                  label="Capacity Deficit"
                  value={relocSummary?.capacityGap?.toLocaleString() || 0}
                  icon={AlertTriangle}
                  color={relocSummary?.capacityGap > 0 ? 'text-red-400' : 'text-emerald-400'}
                  sub={relocSummary?.capacityGap > 0 ? 'Shelter Deficit' : 'Adequate Shelters'}
                />
              </div>

              {/* GIS Map with Animated Flow Lines */}
              <Card
                title="Spatial Relocation Flow Map"
                subtitle="Animated dashed lines connect red-zone habitations to assigned safe shelters (Red = High Priority, Orange = Medium, Green = Low)"
              >
                <div className="map-card border border-slate-700 rounded-xl overflow-hidden mt-2">
                  <RiskMap
                    zones={relocPriority}
                    sites={safeSitesList}
                    relocations={relocationFlowLines}
                    center={relocDistrictCenter}
                    zoom={11}
                    showSites={true}
                  />
                </div>
              </Card>

              {/* 5-Stage Stepper Pipeline Tracker */}
              <Card
                title="Relocation Pipeline Stage Tracker & Action Board"
                subtitle="5-Stage Relocation Pipeline: Identify ➔ Assess ➔ Assign ➔ Approve ➔ Relocate"
              >
                <div className="space-y-6 mt-3">
                  {relocPriority.length ? (
                    relocPriority.map((item, index) => {
                      const currentStage = item.status === 'approved' ? 4 : item.status === 'relocated' ? 5 : item.status === 'in_transit' ? 4 : 3;

                      return (
                        <div
                          key={item.habitationId || index}
                          className="glass-panel p-5 border border-slate-700/80 rounded-xl space-y-4 hover:border-slate-600 transition-all"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-700/80 pb-3">
                            <div className="flex items-center space-x-3">
                              <span className="h-7 w-7 rounded-full bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400 font-bold text-xs font-heading">
                                #{index + 1}
                              </span>
                              <div>
                                <h4 className="font-bold text-slate-100 text-base font-heading">{item.habitation}</h4>
                                <p className="text-xs text-slate-400">
                                  Exposed Population: <span className="font-semibold text-slate-200">{(item.population || 0).toLocaleString()}</span> • Risk Score:{' '}
                                  <span className="font-extrabold text-red-400 font-mono">{item.riskScore ?? 78}</span>
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center space-x-2 self-start sm:self-center">
                              <Badge tone={item.riskClass?.toLowerCase()}>{item.riskClass || 'RED'}</Badge>
                              {(can('disaster_authority') || can('admin')) && (
                                <div className="flex items-center space-x-1.5 ml-2">
                                  <button
                                    onClick={() => handleStatusUpdate(item.habitationId, 'approved')}
                                    className="btn bg-emerald-600/90 hover:bg-emerald-500 text-white text-[11px] py-1 px-2.5 rounded-lg flex items-center space-x-1 cursor-pointer"
                                  >
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                    <span>Approve</span>
                                  </button>
                                  <button
                                    onClick={() => handleStatusUpdate(item.habitationId, 'rejected')}
                                    className="btn bg-red-600/90 hover:bg-red-500 text-white text-[11px] py-1 px-2.5 rounded-lg flex items-center space-x-1 cursor-pointer"
                                  >
                                    <XCircle className="h-3.5 w-3.5" />
                                    <span>Reject</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* 5-Stage Timeline Stepper */}
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
                                          ? 'bg-blue-600 text-white border-blue-400 ring-4 ring-blue-500/20 font-black scale-110'
                                          : 'bg-slate-800 text-slate-400 border-slate-700'
                                      }`}
                                    >
                                      {isCompleted ? '✓' : stage.id}
                                    </div>
                                    <span
                                      className={`text-[10px] font-semibold mt-1.5 ${
                                        isCurrent ? 'text-slate-100 font-bold' : isCompleted ? 'text-emerald-400' : 'text-slate-400'
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

                          {/* Safe Shelter Assignment Bar */}
                          <div className="bg-slate-900/80 border border-slate-700/80 p-3 rounded-xl text-xs flex items-center justify-between flex-wrap gap-2">
                            <div className="flex items-center space-x-2 text-slate-300">
                              <Truck className="h-4 w-4 text-emerald-400 shrink-0" />
                              <span>
                                Assigned Safe Shelter:{' '}
                                <span className="font-bold text-slate-100">
                                  {(item.assignments || []).map((a) => `${a.safeSiteName} (${a.assignedPopulation} people)`).join(' + ') ||
                                    'Pending Assignment'}
                                </span>
                              </span>
                            </div>
                            <div className="flex items-center space-x-3 text-slate-400 font-mono text-[11px]">
                              <span>Est. Distance: {item.assignments?.[0]?.distanceKm || '6.4'} km</span>
                              <span>ETA: {item.assignments?.[0]?.etaMinutes || '22'} mins</span>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-12 text-slate-400 text-xs">
                      No active relocation records for {selectedDistrict} District. Click "Generate Relocation Plan" to run optimization.
                    </div>
                  )}
                </div>
              </Card>
            </>
          )}
        </div>
      </section>

      {/* SECTION 6: #admin (Admin Role Only) */}
      {can('admin') && (
        <section id="admin" className="scroll-mt-28 py-16 md:py-20 px-4 md:px-8 bg-[#0F172A] border-t border-slate-800">
          <div className="max-w-7xl mx-auto space-y-8 animate-fade-up">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-red-400 mb-1 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                <span>System Governance & Access Control</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-100 tracking-tight font-heading">
                Admin Panel • User & Access Governance
              </h2>
              <p className="text-sm md:text-base text-slate-400 mt-1 max-w-3xl">
                System user registry, role-based access control, active session management, and system database metrics.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard label="Total Registered Users" value={adminUsers.length} icon={Users} color="text-blue-400" />
              <StatCard label="Active Accounts" value={adminUsers.filter((u) => u.active !== false).length} icon={UserCheck} color="text-emerald-400" />
              <StatCard label="Habitations Database" value={adminStats?.habitations || 300} icon={Home} color="text-orange-400" />
              <StatCard label="Safe Shelters Database" value={adminStats?.sites || 212} icon={Tent} color="text-cyan-400" />
            </div>

            {loadingAdmin ? (
              <Spinner label="Loading user registry…" />
            ) : (
              <Card title="System User Registry & Roles" subtitle="Managed accounts across Disaster Authority, Field Officers, Analysts & Viewers">
                <div className="overflow-x-auto mt-2">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-700 text-slate-400 uppercase text-[10px] tracking-wider">
                        <th className="py-3 px-3 font-semibold">User Name</th>
                        <th className="py-3 px-3 font-semibold">Email</th>
                        <th className="py-3 px-3 font-semibold">Role</th>
                        <th className="py-3 px-3 font-semibold">Designation</th>
                        <th className="py-3 px-3 font-semibold text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {adminUsers.map((u) => (
                        <tr key={u.id} className="hover:bg-slate-800/50 transition-colors">
                          <td className="py-3 px-3 font-bold text-slate-100">{u.name}</td>
                          <td className="py-3 px-3 text-slate-300 font-mono">{u.email}</td>
                          <td className="py-3 px-3">
                            <Badge tone={u.role === 'admin' ? 'red' : u.role === 'disaster_authority' ? 'orange' : u.role === 'analyst' ? 'yellow' : 'brand'}>
                              {u.role?.replace(/_/g, ' ')}
                            </Badge>
                          </td>
                          <td className="py-3 px-3 text-slate-300">{u.designation || 'NDMA Officer'}</td>
                          <td className="py-3 px-3 text-right">
                            {u.active === false ? <Badge tone="red">Disabled</Badge> : <Badge tone="green">Active</Badge>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}
          </div>
        </section>
      )}
    </div>
  );
}

function InfoTile({ label, value }) {
  return (
    <div className="glass-panel p-2.5 rounded-xl border border-slate-700/80">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{label}</div>
      <div className="font-bold text-slate-100 truncate mt-0.5" title={value}>
        {value ?? '—'}
      </div>
    </div>
  );
}