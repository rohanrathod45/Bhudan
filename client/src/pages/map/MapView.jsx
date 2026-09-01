import { useEffect, useMemo, useState } from 'react';
import { analysisApi } from '../../services/api';
import useDistricts from '../../hooks/useDistricts';
import RiskMap, { MapLegend, MapLayerControls } from '../../components/map/RiskMap';
import { Card, Badge, Spinner } from '../../components/ui';
import { ScoreGauge } from '../../components/charts';
import { MapPin, Layers, Info as InfoIcon, ShieldCheck, ArrowRight } from 'lucide-react';

const DEFAULT_CENTER = [20.5937, 78.9629];

export default function MapView() {
  const { districts, centers } = useDistricts();
  const [district, setDistrict] = useState('Wayanad');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [basemap, setBasemap] = useState('esri_dark');
  const [activeHazardFilters, setActiveHazardFilters] = useState({
    flood: true,
    landslide: true,
    coastal_erosion: true,
    cloudburst: true,
  });

  useEffect(() => {
    setLoading(true);
    setSelected(null);
    analysisApi
      .districtAnalysis(district)
      .then((res) => setData(res.analysis))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [district]);

  const toggleHazardFilter = (key) => {
    setActiveHazardFilters((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const zones = useMemo(() => (data?.redZones || []).map((r) => r.zone), [data]);
  const sites = useMemo(() => (data?.capacity?.sites || []).map((s) => s), [data]);
  const center = centers[district] || DEFAULT_CENTER;

  return (
    <div className="space-y-5">
      {/* Header Bar */}
      <div className="glass-card p-5 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <span>GIS Hazard & Risk Heatmap</span>
            <Badge tone="brand">Interactive Spatial Layer</Badge>
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Real-time geospatial hazard score visualization • Zoom & click markers for site metrics
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

      {/* Map & Detail Sidebar Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Full-Screen Map Container */}
        <div className="lg:col-span-2 relative min-h-[580px] rounded-2xl overflow-hidden glass-card p-0 border border-white/15">
          {loading ? (
            <div className="h-[580px] flex items-center justify-center">
              <Spinner label="Loading spatial GIS layers…" />
            </div>
          ) : (
            <>
              <RiskMap
                zones={zones}
                sites={sites}
                center={center}
                zoom={10}
                onSelectZone={setSelected}
                activeHazardFilters={activeHazardFilters}
                basemap={basemap}
              />
              <MapLegend />
              <MapLayerControls
                activeFilters={activeHazardFilters}
                onToggle={toggleHazardFilter}
                basemap={basemap}
                onBasemapChange={setBasemap}
              />
            </>
          )}
        </div>

        {/* Selected Zone Detail or Safe Sites List */}
        <div className="space-y-5">
          {selected ? (
            <Card
              title={selected.habitation}
              subtitle={`${selected.district} District • ${selected.state || 'India'}`}
              right={<Badge tone={selected.riskClass?.toLowerCase()}>{selected.riskClass}</Badge>}
            >
              <ScoreGauge score={selected.riskScore} color={selected.color} />
              <div className="grid grid-cols-2 gap-2.5 text-xs mt-3">
                <InfoItem label="Primary Hazards" value={selected.mainHazards?.join(', ')} />
                <InfoItem label="Exposed Pop" value={selected.populationExposed?.toLocaleString()} />
                <InfoItem label="Model Confidence" value={(selected.confidence * 100).toFixed(0) + '%'} />
                <InfoItem label="Data Source" value={selected.dataSource || 'ISRO/Bhuvan'} />
              </div>
              <div className="mt-4 pt-3 border-t border-white/10">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Stated Algorithm Limitations
                </div>
                <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                  {selected.limitations?.map((l, i) => (
                    <li key={i}>{l}</li>
                  ))}
                </ul>
                <a
                  href={`/habitations/${selected.habitationId}`}
                  className="mt-4 btn btn-primary w-full text-xs justify-center flex items-center space-x-1"
                >
                  <span>Open Full Assessment Breakdown</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </a>
              </div>
            </Card>
          ) : (
            <Card
              title="District Safe Shelters"
              subtitle={`Carrying capacity in ${district}`}
              right={<Badge tone="brand">{sites.length} Sites</Badge>}
            >
              {sites.length ? (
                <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
                  {sites.map((s) => (
                    <div
                      key={s.safeSiteId || s.id}
                      className="glass-panel p-3 flex items-center justify-between text-xs border border-white/10 hover:border-white/20 transition-all rounded-xl"
                    >
                      <div>
                        <div className="font-bold text-white flex items-center gap-1.5">
                          <span>🏕️</span>
                          <span>{s.name || s.siteName}</span>
                        </div>
                        <div className="text-[11px] text-slate-300 mt-0.5">
                          Available: <span className="font-semibold text-emerald-400">{s.availableCapacity}</span> / {s.maxCapacity}
                        </div>
                      </div>
                      <Badge tone={s.status === 'optimal' ? 'green' : 'slate'}>{s.status || 'Active'}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 py-8 text-center">No safe sites registered in this district.</p>
              )}
            </Card>
          )}

          <Card title="Multi-Factor Risk Model Parameters">
            <div className="space-y-2 text-xs text-slate-300">
              <p className="text-[11px] text-slate-400 mb-2">
                BhuDan calculates risk dynamically using weighted spatial indices:
              </p>
              <div className="grid grid-cols-1 gap-1.5 font-mono text-[11px]">
                <div className="flex justify-between border-b border-white/5 pb-1">
                  <span>1. Composite Hazard Severity</span>
                  <span className="font-bold text-brand-300">32%</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-1">
                  <span>2. Population Exposure Index</span>
                  <span className="font-bold text-amber-300">22%</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-1">
                  <span>3. Social Vulnerability Score</span>
                  <span className="font-bold text-purple-300">18%</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-1">
                  <span>4. Infrastructure Vulnerability</span>
                  <span className="font-bold text-sky-300">18%</span>
                </div>
                <div className="flex justify-between">
                  <span>5. Slope & Terrain Elevation</span>
                  <span className="font-bold text-emerald-300">10%</span>
                </div>
              </div>
            </div>
          </Card>
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