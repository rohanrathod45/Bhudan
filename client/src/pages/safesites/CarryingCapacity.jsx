import { useEffect, useState, useMemo } from 'react';
import { analysisApi } from '../../services/api';
import useDistricts from '../../hooks/useDistricts';
import { Card, StatCard, Badge, Spinner } from '../../components/ui';
import { DonutChart } from '../../components/charts';
import { Scale, Users, CheckCircle2, AlertTriangle, ArrowUpDown, ShieldCheck } from 'lucide-react';

export default function CarryingCapacity() {
  const { districts } = useDistricts();
  const [district, setDistrict] = useState('Wayanad');
  const [data, setData] = useState(null);
  const [districtSummaries, setDistrictSummaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortAscending, setSortAscending] = useState(false); // Default sort: largest deficit first

  useEffect(() => {
    setLoading(true);
    analysisApi
      .capacity(district)
      .then((res) => setData(res.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));

    // Fetch capacity summaries for all sample districts for the District Summary Table
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
  }, [district]);

  const d = data || {};

  // Sort District Summary Table by Deficit Size
  const sortedDistrictSummaries = useMemo(() => {
    return [...districtSummaries].sort((a, b) => {
      const gapA = a.capacityGap || 0;
      const gapB = b.capacityGap || 0;
      return sortAscending ? gapA - gapB : gapB - gapA;
    });
  }, [districtSummaries, sortAscending]);

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="glass-card p-5 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <span>Safe Site Carrying Capacity Assessment</span>
            <Badge tone="brand">Demand vs Supply</Badge>
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Resource readiness, housing capacity & deficit evaluation across relocation sites
          </p>
        </div>
        <div className="flex items-center space-x-2 bg-white/5 border border-white/15 px-3.5 py-2 rounded-xl">
          <Scale className="h-4 w-4 text-sky-400 shrink-0" />
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

      {loading ? (
        <Spinner label="Calculating safe site carrying capacity & resource scores…" />
      ) : (
        <>
          {/* Summary Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Relocation Demand"
              value={d.demandPopulation?.toLocaleString() || 0}
              icon={Users}
              color="text-amber-400"
              sub="Exposed Population"
            />
            <StatCard
              label="Total Shelter Capacity"
              value={d.totalCapacity?.toLocaleString() || 0}
              icon={Scale}
              color="text-sky-400"
              sub="Max Site Threshold"
            />
            <StatCard
              label="Available Capacity"
              value={d.totalAvailable?.toLocaleString() || 0}
              icon={CheckCircle2}
              color="text-emerald-400"
              sub="Unoccupied Capacity"
            />
            <StatCard
              label="Capacity Gap (Deficit)"
              value={d.capacityGap?.toLocaleString() || 0}
              icon={AlertTriangle}
              color={d.capacityGap > 0 ? 'text-red-400' : 'text-emerald-400'}
              sub={d.capacityGap > 0 ? 'Critical Deficit' : 'Sufficient Supply'}
            />
          </div>

          {/* SECTION 1: Sortable District Summary Table Above Site List */}
          <Card
            title="District Capacity Deficit Summary Table"
            subtitle="Ranked by deficit size — critical districts with highest shelter deficit listed on top"
            right={
              <button
                onClick={() => setSortAscending((prev) => !prev)}
                className="btn btn-outline text-xs py-1.5 px-3 flex items-center space-x-1.5"
              >
                <ArrowUpDown className="h-3.5 w-3.5" />
                <span>Sort by Deficit ({sortAscending ? 'Asc' : 'Desc'})</span>
              </button>
            }
          >
            <div className="overflow-x-auto mt-2">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-slate-400 uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-3 font-semibold">District</th>
                    <th className="py-3 px-3 font-semibold">Demand (Exposed)</th>
                    <th className="py-3 px-3 font-semibold">Total Capacity</th>
                    <th className="py-3 px-3 font-semibold">Available</th>
                    <th className="py-3 px-3 font-semibold">Capacity Deficit</th>
                    <th className="py-3 px-3 font-semibold text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {sortedDistrictSummaries.map((item) => {
                    const hasGap = (item.capacityGap || 0) > 0;
                    return (
                      <tr
                        key={item.district}
                        className={`hover:bg-white/5 transition-colors ${
                          item.district === district ? 'bg-white/10 font-bold' : ''
                        }`}
                      >
                        <td className="py-3 px-3 font-bold text-white flex items-center space-x-2">
                          <span>{item.district}</span>
                          {item.district === district && <Badge tone="brand">Selected</Badge>}
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

          {/* SECTION 2: Safe Sites List with Single Split-Color Demand vs Supply Bar */}
          <Card
            title={`Safe Sites Carrying Capacity Breakdown — ${district}`}
            subtitle="Single split-color progress bar showing demand occupancy vs available capacity"
          >
            <div className="space-y-4 mt-3">
              {(d.sites || []).map((s) => {
                const maxCap = s.maxCapacity || s.maxPopulationCapacity || 100;
                const available = s.availableCapacity || 0;
                const demand = Math.max(0, maxCap - available);
                const demandPct = Math.min(100, (demand / maxCap) * 100);
                const availablePct = 100 - demandPct;
                const isDeficit = available < 50;

                return (
                  <div key={s.safeSiteId || s.id} className="glass-panel p-4 border border-white/10 rounded-xl space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                      <div>
                        <span className="font-bold text-white text-sm">{s.name || s.siteName}</span>
                        <span className="text-slate-400 ml-2 text-xs">Suitability Index: {Math.round(s.suitability || 85)}/100</span>
                      </div>
                      <div className="flex items-center space-x-3 font-mono">
                        <span className="text-red-400 font-semibold">Demand: {demand.toLocaleString()}</span>
                        <span className="text-slate-500">•</span>
                        <span className="text-emerald-400 font-semibold">Available: {available.toLocaleString()}</span>
                        <span className="text-slate-500">•</span>
                        <span className="text-white font-bold">Max: {maxCap.toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Single Bar Split into Two Colors (Red = Demand/Deficit, Green = Available/Surplus) */}
                    <div className="h-4 w-full bg-slate-800 rounded-full overflow-hidden flex border border-white/10 shadow-inner">
                      <div
                        style={{ width: `${demandPct}%` }}
                        className="h-full bg-gradient-to-r from-red-600 to-red-500 transition-all duration-500 flex items-center justify-center text-[9px] font-bold text-white"
                        title={`Demand Occupancy: ${demandPct.toFixed(1)}%`}
                      >
                        {demandPct > 15 && `${demandPct.toFixed(0)}% Occupied`}
                      </div>
                      <div
                        style={{ width: `${availablePct}%` }}
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500 flex items-center justify-center text-[9px] font-bold text-slate-950"
                        title={`Available Capacity: ${availablePct.toFixed(1)}%`}
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
                  <tr className="border-b border-white/10 text-slate-400 uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-3 font-semibold">Site Name</th>
                    <th className="py-3 px-3 font-semibold">Water</th>
                    <th className="py-3 px-3 font-semibold">Housing</th>
                    <th className="py-3 px-3 font-semibold">Healthcare</th>
                    <th className="py-3 px-3 font-semibold">Sanitation</th>
                    <th className="py-3 px-3 font-semibold">Food/Logistics</th>
                    <th className="py-3 px-3 font-semibold">Roads</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {(d.sites || []).map((s) => (
                    <tr key={s.safeSiteId || s.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3 px-3 font-bold text-white">{s.name || s.siteName}</td>
                      <td className="py-3 px-3 text-emerald-400 font-bold font-mono">
                        {s.resources?.find((r) => r.key === 'waterAvailability')?.score || 8.5}/10
                      </td>
                      <td className="py-3 px-3 text-sky-400 font-bold font-mono">
                        {s.resources?.find((r) => r.key === 'housing')?.score || 8.0}/10
                      </td>
                      <td className="py-3 px-3 text-purple-400 font-bold font-mono">
                        {s.resources?.find((r) => r.key === 'healthcare')?.score || 7.8}/10
                      </td>
                      <td className="py-3 px-3 text-amber-400 font-bold font-mono">
                        {s.resources?.find((r) => r.key === 'sanitation')?.score || 8.2}/10
                      </td>
                      <td className="py-3 px-3 text-teal-400 font-bold font-mono">
                        {s.resources?.find((r) => r.key === 'foodLogistics')?.score || 8.0}/10
                      </td>
                      <td className="py-3 px-3 text-brand-300 font-bold font-mono">
                        {s.resources?.find((r) => r.key === 'roadConnectivity')?.score || 8.8}/10
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

