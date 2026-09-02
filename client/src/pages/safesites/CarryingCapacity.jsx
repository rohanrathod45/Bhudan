import { useEffect, useState } from 'react';
import { analysisApi } from '../../services/api';
import useDistricts from '../../hooks/useDistricts';
import { Card, StatCard, Badge, Spinner, StateDistrictSelector } from '../../components/ui';
import { DonutChart } from '../../components/charts';

export default function CarryingCapacity() {
  const { selectedDistrict: district, setSelectedDistrict } = useDistricts();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!district || district === 'All') {
      setData(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    analysisApi
      .capacity(district)
      .then((res) => setData(res.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [district]);

  const d = data || {};

  return (
    <div className="space-y-5">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">⚖️</span>
            <h2 className="text-xl font-bold text-slate-800">Carrying-Capacity Assessment</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Safe-site carrying capacity vs. exposed population requiring shelter
          </p>
        </div>
        <StateDistrictSelector value={district} onChange={(d) => setSelectedDistrict(d)} />
      </div>

      {loading ? (
        <Spinner />
      ) : !district ? (
        <div className="card p-12 text-center bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="text-4xl mb-3">📍</div>
          <h3 className="text-lg font-bold text-slate-800">Select a District</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
            Please choose a <strong>State</strong> and <strong>District</strong> using the selector above to assess safe shelter carrying capacity vs. displaced population demand.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Demand (exposed)" value={d.demandPopulation?.toLocaleString() || 0} icon="👥" color="text-risk-orange" />
            <StatCard label="Total capacity" value={d.totalCapacity?.toLocaleString() || 0} icon="⚖️" color="text-sky-500" />
            <StatCard label="Available capacity" value={d.totalAvailable?.toLocaleString() || 0} icon="✅" color="text-emerald-600" />
            <StatCard label="Capacity gap" value={d.capacityGap?.toLocaleString() || 0} icon="⚠️" color={d.capacityGap > 0 ? 'text-risk-red' : 'text-emerald-600'} />
          </div>

          <Card title="Capacity sufficiency" subtitle={`Status: ${(
            <Badge tone={d.capacityGap > 0 ? 'red' : 'green'}>
              {d.status === 'insufficient' ? 'Insufficient — relocation not fully feasible' : 'Sufficient'}
            </Badge>
          )}`}>
            <div className="grid md:grid-cols-2 gap-6 items-center">
              <div className="h-56">
                <DonutChart
                  data={[
                    { name: 'Available', value: d.totalAvailable },
                    { name: 'Occupied', value: Math.max(0, d.totalCapacity - d.totalAvailable) },
                  ]}
                  colors={['#16a34a', '#cbd5e1']}
                />
              </div>
              <div className="space-y-2">
                <Bar label="Demand" value={d.demandPopulation || 0} max={Math.max(d.totalCapacity, d.demandPopulation, 1)} color="text-risk-orange" />
                <Bar label="Capacity" value={d.totalCapacity || 0} max={Math.max(d.totalCapacity, d.demandPopulation, 1)} color="text-sky-500" />
                <Bar label="Available" value={d.totalAvailable || 0} max={Math.max(d.totalCapacity, d.demandPopulation, 1)} color="text-emerald-600" />
                <Bar label="Gap (deficit)" value={d.capacityGap || 0} max={Math.max(d.totalCapacity, d.demandPopulation, 1)} color="text-risk-red" />
              </div>
            </div>
          </Card>

          <Card title="Resource readiness by site">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-500 border-b border-slate-200">
                    <th className="py-2 font-medium">Site</th>
                    <th className="py-2 font-medium">Suitability</th>
                    <th className="py-2 font-medium">Water</th>
                    <th className="py-2 font-medium">Housing</th>
                    <th className="py-2 font-medium">Healthcare</th>
                    <th className="py-2 font-medium">Sanitation</th>
                    <th className="py-2 font-medium">Food/Log</th>
                    <th className="py-2 font-medium">Roads</th>
                  </tr>
                </thead>
                <tbody>
                  {(d.sites || []).map((s) => (
                    <tr key={s.safeSiteId} className="border-b border-slate-100 last:border-0">
                      <td className="py-2 font-medium text-slate-800">{s.name}</td>
                      <td className="py-2">{Math.round(s.suitability || 0)}</td>
                      <td className="py-2">{s.resources?.find((r) => r.key === 'waterAvailability')?.score || 0}</td>
                      <td className="py-2">{s.resources?.find((r) => r.key === 'housing')?.score || 0}</td>
                      <td className="py-2">{s.resources?.find((r) => r.key === 'healthcare')?.score || 0}</td>
                      <td className="py-2">{s.resources?.find((r) => r.key === 'sanitation')?.score || 0}</td>
                      <td className="py-2">{s.resources?.find((r) => r.key === 'foodLogistics')?.score || 0}</td>
                      <td className="py-2">{s.resources?.find((r) => r.key === 'roadConnectivity')?.score || 0}</td>
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

function Bar({ label, value, max, color }) {
  const pct = max ? (value / max) * 100 : 0;
  return (
    <div>
      <div className="flex justify-between text-xs text-slate-600 mb-0.5">
        <span>{label}</span>
        <span>{value?.toLocaleString() || 0}</span>
      </div>
      <div className="h-4 bg-slate-200 rounded">
        <div className={`h-4 rounded ${color.includes('bg') ? color : 'bg-current'}`} style={{ width: `${Math.min(100, pct)}%`, background: color }} />
      </div>
    </div>
  );
}
