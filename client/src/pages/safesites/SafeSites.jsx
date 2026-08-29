import { useEffect, useState } from 'react';
import { dataApi } from '../../services/api';
import useDistricts from '../../hooks/useDistricts';
import { Card, Badge, Spinner } from '../../components/ui';

export default function SafeSites() {
  const { districts } = useDistricts();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [district, setDistrict] = useState('');

  const load = (d) => {
    setLoading(true);
    const params = {};
    if (d && d !== 'All') params.district = d;
    dataApi.sites(params).then((res) => setRows(res.data)).catch(() => setRows([]));
    setLoading(false);
  };
  useEffect(() => { load(district); }, [district]);

  const availabilityPct = (s) => {
    const max = s.maxPopulationCapacity || 1;
    return Math.round(((s.maxPopulationCapacity - (s.currentOccupancy || 0)) / max) * 100);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-xl font-bold text-slate-800">Safe Sites</h2>
        <select className="input w-auto" value={district} onChange={(e) => setDistrict(e.target.value)}>
          {['All', ...districts].map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      {loading ? <Spinner /> : (
        <Card title="Relocation / safe sites" subtitle={`${rows.length} registered sites`}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b border-slate-200">
                  <th className="py-2 font-medium">Site</th>
                  <th className="py-2 font-medium">District</th>
                  <th className="py-2 font-medium">Type</th>
                  <th className="py-2 font-medium">Capacity (available)</th>
                  <th className="py-2 font-medium">Resources (avg/100)</th>
                  <th className="py-2 font-medium">Source</th>
                  <th className="py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.length ? rows.map((s) => {
                  const resourceFields = ['waterAvailability', 'housing', 'healthcare', 'sanitation', 'foodLogistics', 'roadConnectivity', 'emergencyServices'];
                  const avg = Math.round(resourceFields.reduce((a, f) => a + (s[f] || 0), 0) / resourceFields.length);
                  return (
                    <tr key={s.safeSiteId || s.id} className="border-b border-slate-100 last:border-0">
                      <td className="py-2 font-medium text-slate-800">🏕 {s.name}</td>
                      <td className="py-2 text-slate-600">{s.district}</td>
                      <td className="py-2 text-slate-500">{s.type}</td>
                      <td className="py-2">{`${availabilityPct(s)}% avail · ${(s.maxPopulationCapacity - (s.currentOccupancy || 0)).toLocaleString()}/${(s.maxPopulationCapacity || 0).toLocaleString()}`}</td>
                      <td className="py-2">{avg}</td>
                      <td className="py-2">{s.dataSource && <Badge tone={s.dataSource === 'official' ? 'green' : s.dataSource === 'estimated' ? 'yellow' : 'orange'}>{s.dataSource}</Badge>}</td>
                      <td className="py-2">{s.status && <Badge tone="slate">{s.status}</Badge>}</td>
                    </tr>
                  );
                }) : <tr><td colSpan="7" className="py-6 text-center text-slate-400">No safe sites found.</td></tr>}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}