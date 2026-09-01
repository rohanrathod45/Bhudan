import { useEffect, useState } from 'react';
import { dataApi } from '../../services/api';
import useDistricts from '../../hooks/useDistricts';
import { Card, Badge, Spinner } from '../../components/ui';
import { ShieldCheck, Filter } from 'lucide-react';

export default function SafeSites() {
  const { districts } = useDistricts();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [district, setDistrict] = useState('');

  const load = (d) => {
    setLoading(true);
    const params = {};
    if (d && d !== 'All') params.district = d;
    dataApi
      .sites(params)
      .then((res) => setRows(res.data || []))
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load(district);
  }, [district]);

  const availabilityPct = (s) => {
    const max = s.maxPopulationCapacity || 1;
    return Math.round(((s.maxPopulationCapacity - (s.currentOccupancy || 0)) / max) * 100);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="glass-card p-5 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <span>Registered Safe Shelters</span>
            <Badge tone="green">Verified Sites</Badge>
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Emergency shelter inventory, resource availability & carrying capacity thresholds
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-white/5 border border-white/15 px-3.5 py-2 rounded-xl">
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
      </div>

      {loading ? (
        <Spinner label="Loading safe shelter inventory…" />
      ) : (
        <Card title="Safe Shelters Inventory" subtitle={`${rows.length} sites registered`}>
          <div className="overflow-x-auto mt-2">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-slate-400 uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-3 font-semibold">Site Name</th>
                  <th className="py-3 px-3 font-semibold">District</th>
                  <th className="py-3 px-3 font-semibold">Type</th>
                  <th className="py-3 px-3 font-semibold">Capacity (Available / Max)</th>
                  <th className="py-3 px-3 font-semibold">Resource Index</th>
                  <th className="py-3 px-3 font-semibold">Source</th>
                  <th className="py-3 px-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {rows.length ? (
                  rows.map((s) => {
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

                    return (
                      <tr key={s.safeSiteId || s.id} className="hover:bg-white/5 transition-colors">
                        <td className="py-3 px-3 font-bold text-white flex items-center space-x-2">
                          <span>🏕️</span>
                          <span>{s.name}</span>
                        </td>
                        <td className="py-3 px-3 text-slate-300">{s.district}</td>
                        <td className="py-3 px-3 text-slate-300 capitalize">{s.type || 'Relocation Center'}</td>
                        <td className="py-3 px-3 font-mono">
                          <span className="text-emerald-400 font-bold">{avail.toLocaleString()}</span>
                          <span className="text-slate-400"> / {(s.maxPopulationCapacity || 0).toLocaleString()} ({availabilityPct(s)}% free)</span>
                        </td>
                        <td className="py-3 px-3 font-bold text-sky-300 font-mono">{avg}/100</td>
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
                      No safe sites found for the selected filter.
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