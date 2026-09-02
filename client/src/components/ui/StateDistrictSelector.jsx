import { useMemo, useState } from 'react';
import { useLocation } from '../../context/LocationContext';

const REGION_ICONS = {
  himalaya: { icon: '🏔️', label: 'Himalayan Zone' },
  hill: { icon: '⛰️', label: 'Hill Region' },
  coast: { icon: '🌊', label: 'Coastal Belt' },
  plain: { icon: '🌾', label: 'Gangetic / River Plains' },
  desert: { icon: '🏜️', label: 'Arid / Desert' },
  island: { icon: '🏝️', label: 'Island Territory' },
  semi: { icon: '🌿', label: 'Semi-Arid Plateau' },
};

export default function StateDistrictSelector({
  value,
  onChange,
  className = '',
  showRegion = true,
}) {
  const {
    states,
    districts,
    districtsByState,
    districtMeta,
    selectedDistrict: globalDistrict,
    selectedState: globalState,
    setSelectedDistrict: setGlobalDistrict,
    setSelectedState: setGlobalState,
  } = useLocation();

  const currentDistrict = value !== undefined ? value : (globalDistrict || '');
  const currentMeta = currentDistrict ? (districtMeta[currentDistrict] || {}) : {};
  const activeState = currentMeta.state || globalState || '';

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const availableDistricts = useMemo(() => {
    if (!activeState) return districts;
    return districtsByState[activeState] || districts;
  }, [activeState, districtsByState, districts]);

  const filteredSearchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return districts
      .filter((d) => {
        const meta = districtMeta[d] || {};
        return d.toLowerCase().includes(q) || (meta.state || '').toLowerCase().includes(q);
      })
      .slice(0, 10);
  }, [searchQuery, districts, districtMeta]);

  const handleStateSelect = (e) => {
    const newState = e.target.value;
    setGlobalState(newState);
    if (onChange) onChange('');
    setGlobalDistrict('');
  };

  const handleDistrictSelect = (e) => {
    const newDist = e.target.value;
    setGlobalDistrict(newDist);
    if (onChange) onChange(newDist);
  };

  const handleDirectPick = (dist) => {
    setGlobalDistrict(dist);
    if (onChange) onChange(dist);
    setSearchQuery('');
    setIsSearchOpen(false);
  };

  const regionInfo = currentMeta.region ? (REGION_ICONS[currentMeta.region] || { icon: '📍', label: 'Administrative Zone' }) : null;

  return (
    <div className={`flex flex-wrap items-center gap-2.5 ${className}`}>
      {/* State Dropdown */}
      <div className="flex items-center gap-1.5 bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 shadow-sm text-sm hover:border-slate-400 transition">
        <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">State:</span>
        <select
          aria-label="Select State"
          className="bg-transparent font-medium text-slate-800 focus:outline-none cursor-pointer pr-2 max-w-[150px] truncate"
          value={activeState}
          onChange={handleStateSelect}
        >
          <option value="">-- All States --</option>
          {states.map((st) => (
            <option key={st} value={st}>
              {st}
            </option>
          ))}
        </select>
      </div>

      {/* District Dropdown */}
      <div className="flex items-center gap-1.5 bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 shadow-sm text-sm hover:border-slate-400 transition">
        <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">District:</span>
        <select
          aria-label="Select District"
          className="bg-transparent font-semibold text-brand-700 focus:outline-none cursor-pointer pr-2 max-w-[160px] truncate"
          value={currentDistrict}
          onChange={handleDistrictSelect}
        >
          <option value="">-- Select District --</option>
          {availableDistricts.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>

      {/* Quick Search */}
      <div className="relative">
        <div className="relative">
          <input
            type="text"
            placeholder="🔍 All India Search..."
            className="w-40 bg-white border border-slate-300 rounded-lg pl-3 pr-2 py-1.5 text-xs shadow-sm focus:border-brand-500 focus:outline-none focus:w-52 transition-all"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsSearchOpen(true);
            }}
            onFocus={() => setIsSearchOpen(true)}
            onBlur={() => setTimeout(() => setIsSearchOpen(false), 250)}
          />
        </div>

        {isSearchOpen && filteredSearchResults.length > 0 && (
          <div className="absolute top-full right-0 mt-1.5 w-64 bg-white border border-slate-200 rounded-lg shadow-xl py-1 z-[1200] max-h-64 overflow-y-auto">
            {filteredSearchResults.map((d) => {
              const meta = districtMeta[d] || {};
              return (
                <button
                  key={d}
                  type="button"
                  onMouseDown={() => handleDirectPick(d)}
                  className="w-full text-left px-3 py-1.5 hover:bg-slate-100 flex items-center justify-between text-xs transition"
                >
                  <span className="font-semibold text-slate-800">{d}</span>
                  <span className="text-slate-500 text-[11px]">{meta.state}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Region / Geography Pill */}
      {showRegion && currentMeta.region && (
        <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
          <span>{regionInfo.icon}</span>
          <span className="font-semibold">{regionInfo.label}</span>
        </span>
      )}
    </div>
  );
}
