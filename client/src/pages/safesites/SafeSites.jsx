import { useEffect, useState, useMemo } from 'react';
import { dataApi } from '../../services/api';
import useDistricts from '../../hooks/useDistricts';
import { Card, Badge, Spinner } from '../../components/ui';

export default function SafeSites() {
  const { districts, states, districtsByState, districtMeta } = useDistricts();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [district, setDistrict] = useState('All');
  const [selectedState, setSelectedState] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const load = (d, st, q) => {
    setLoading(true);
    const params = {};
    if (d && d !== 'All') params.district = d;
    if (st && st !== 'All' && st !== 'ALL') params.state = st;
    if (q && q.trim()) params.search = q.trim();
    dataApi.sites(params)
      .then((res) => {
        setRows(res.data || []);
      })
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      load(district, selectedState, searchQuery);
    }, 200);
    return () => clearTimeout(timer);
  }, [district, selectedState, searchQuery]);

  const handleStateChange = (e) => {
    const newState = e.target.value;
    setSelectedState(newState);
    setDistrict('All');
  };

  const availableDistricts = useMemo(() => {
    if (!selectedState || selectedState === 'All') return districts;
    return districtsByState[selectedState] || districts;
  }, [selectedState, districtsByState, districts]);

  // Client-side filtering as an extra layer for instant responsiveness
  const filteredRows = useMemo(() => {
    if (!searchQuery.trim()) return rows;
    const q = searchQuery.toLowerCase().trim();
    return rows.filter((s) => {
      const name = (s.name || '').toLowerCase();
      const dist = (s.district || '').toLowerCase();
      const state = (s.state || '').toLowerCase();
      const taluk = (s.taluk || '').toLowerCase();
      const type = (s.type || '').toLowerCase();
      return name.includes(q) || dist.includes(q) || state.includes(q) || taluk.includes(q) || type.includes(q);
    });
  }, [rows, searchQuery]);

  const availabilityPct = (s) => {
    const max = s.maxPopulationCapacity || 1;
    return Math.round(((s.maxPopulationCapacity - (s.currentOccupancy || 0)) / max) * 100);
  };

  const totalCapacity = useMemo(() => {
    return filteredRows.reduce((acc, s) => acc + (s.maxPopulationCapacity || 0), 0);
  }, [filteredRows]);

  const totalAvailable = useMemo(() => {
    return filteredRows.reduce((acc, s) => acc + Math.max(0, (s.maxPopulationCapacity || 0) - (s.currentOccupancy || 0)), 0);
  }, [filteredRows]);

  return (
    <div className="space-y-5">
      {/* Header & Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span>🛡️ Safe Sites & Relocation Centers</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Verified evacuation shelters, cyclone relief centers, and designated safe havens across India.
          </p>
        </div>

        {/* Quick summary badges */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <span className="px-3 py-1 bg-brand-50 text-brand-700 font-semibold rounded-lg border border-brand-200">
            {filteredRows.length} Sites Listed
          </span>
          <span className="px-3 py-1 bg-emerald-50 text-emerald-700 font-semibold rounded-lg border border-emerald-200">
            {totalAvailable.toLocaleString()} / {totalCapacity.toLocaleString()} Capacity Avail.
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            🔍
          </span>
          <input
            type="text"
            placeholder="Search by state, district, taluk, or site name..."
            className="input w-full pl-9 pr-8 text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 text-sm"
              title="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        {/* State Selector */}
        <div className="flex items-center gap-1.5 min-w-[170px]">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">State:</label>
          <select
            className="input text-sm py-1.5 font-medium flex-1 cursor-pointer"
            value={selectedState}
            onChange={handleStateChange}
          >
            <option value="All">All States</option>
            {states.map((st) => (
              <option key={st} value={st}>{st}</option>
            ))}
          </select>
        </div>

        {/* District Selector */}
        <div className="flex items-center gap-1.5 min-w-[170px]">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">District:</label>
          <select
            className="input text-sm py-1.5 font-semibold text-brand-700 flex-1 cursor-pointer"
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
          >
            <option value="All">All Districts</option>
            {availableDistricts.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        {/* Reset Filters */}
        {(selectedState !== 'All' || district !== 'All' || searchQuery) && (
          <button
            onClick={() => {
              setSelectedState('All');
              setDistrict('All');
              setSearchQuery('');
            }}
            className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition whitespace-nowrap"
          >
            Reset Filters
          </button>
        )}
      </div>

      {loading ? (
        <Spinner label="Loading safe sites details…" />
      ) : (
        <Card
          title="Relocation & Safe Shelter Database"
          subtitle={`Showing ${filteredRows.length} safe sites for the selected geographical filter`}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b border-slate-200">
                  <th className="py-2.5 font-semibold">Site Name</th>
                  <th className="py-2.5 font-semibold">Geographical Location</th>
                  <th className="py-2.5 font-semibold">Coordinates</th>
                  <th className="py-2.5 font-semibold">Type</th>
                  <th className="py-2.5 font-semibold">Capacity (Available / Total)</th>
                  <th className="py-2.5 font-semibold">Resources (Avg / 100)</th>
                  <th className="py-2.5 font-semibold">Source</th>
                  <th className="py-2.5 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.length ? (
                  filteredRows.map((s) => {
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
                    const availCount = Math.max(0, (s.maxPopulationCapacity || 0) - (s.currentOccupancy || 0));
                    const stateName = s.state || districtMeta[s.district]?.state || 'India';

                    return (
                      <tr key={s.safeSiteId || s.id || s._id} className="border-b border-slate-100 hover:bg-slate-50/70 transition last:border-0">
                        <td className="py-3 font-semibold text-slate-800">
                          <div className="flex items-center gap-1.5">
                            <span>🏕️</span>
                            <span>{s.name}</span>
                          </div>
                        </td>
                        <td className="py-3 text-slate-600">
                          <div className="font-medium text-slate-800">{s.district}</div>
                          <div className="text-xs text-slate-400">
                            {stateName} {s.taluk && s.taluk !== s.district ? `· ${s.taluk}` : ''}
                          </div>
                        </td>
                        <td className="py-3 text-xs text-slate-500 font-mono">
                          {s.lat != null && s.lng != null ? `${s.lat.toFixed(3)}°N, ${s.lng.toFixed(3)}°E` : '—'}
                        </td>
                        <td className="py-3 text-slate-500 capitalize">
                          {String(s.type || '').replace(/_/g, ' ')}
                        </td>
                        <td className="py-3">
                          <div className="font-medium text-slate-800">
                            {availabilityPct(s)}% available
                          </div>
                          <div className="text-xs text-slate-400">
                            {availCount.toLocaleString()} / {(s.maxPopulationCapacity || 0).toLocaleString()} pax
                          </div>
                        </td>
                        <td className="py-3">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                              avg >= 70
                                ? 'bg-emerald-100 text-emerald-800'
                                : avg >= 50
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {avg}/100
                          </span>
                        </td>
                        <td className="py-3">
                          {s.dataSource && (
                            <Badge
                              tone={
                                s.dataSource === 'official'
                                  ? 'green'
                                  : s.dataSource === 'estimated'
                                  ? 'yellow'
                                  : 'orange'
                              }
                            >
                              {s.dataSource}
                            </Badge>
                          )}
                        </td>
                        <td className="py-3">
                          {s.status && (
                            <Badge
                              tone={
                                s.status === 'operational'
                                  ? 'green'
                                  : s.status === 'available'
                                  ? 'slate'
                                  : 'red'
                              }
                            >
                              {s.status}
                            </Badge>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="8" className="py-10 text-center">
                      <div className="text-3xl mb-2">🔍</div>
                      <p className="text-sm font-medium text-slate-600">No safe sites found for your search query.</p>
                      <p className="text-xs text-slate-400 mt-1">Try searching for a different State, District, Taluk, or Shelter name.</p>
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