import { useEffect, useMemo, useState } from 'react';
import { analysisApi } from '../../services/api';
import useDistricts from '../../hooks/useDistricts';
import RiskMap, { MapLegend } from '../../components/map/RiskMap';
import { Card, Badge, Spinner, StateDistrictSelector } from '../../components/ui';
import { ScoreGauge } from '../../components/charts';

const DEFAULT_CENTER = [22.0, 79.0];

export default function MapView() {
  const { centers, districtMeta, getStateForDistrict, selectedDistrict: district, setSelectedDistrict } = useDistricts();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    if (!district || district === 'All') {
      setData(null);
      setLoading(false);
      setSelected(null);
      return;
    }

    setLoading(true);
    setSelected(null);
    analysisApi
      .districtAnalysis(district)
      .then((res) => setData(res.analysis))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [district]);

  const zones = useMemo(() => (data?.redZones || []).map((r) => r.zone), [data]);
  const sites = useMemo(() => (data?.capacity?.sites || []).map((s) => s), [data]);
  const center = (district && centers[district]) || DEFAULT_CENTER;
  const currentMeta = district ? (districtMeta[district] || {}) : {};
  const currentState = currentMeta.state || getStateForDistrict(district) || '';

  return (
    <div className="space-y-4">
      {/* Top Header & Nationwide Cascading Selectors */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">🛰️</span>
            <h2 className="text-xl font-bold text-slate-900">Real-World GIS Risk Map</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Live multi-hazard geospatial surveillance · Circular risk perimeters & safe sites across India
          </p>
        </div>

        <StateDistrictSelector value={district} onChange={(d) => setSelectedDistrict(d)} />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Main Map Canvas */}
        <div className="lg:col-span-2 card p-0 overflow-hidden relative shadow-md" style={{ minHeight: 600 }}>
          {loading ? (
            <div className="h-[600px] flex items-center justify-center">
              <Spinner label={`Loading GIS satellite data for ${district || 'selected region'}…`} />
            </div>
          ) : (
            <RiskMap
              zones={zones}
              sites={sites}
              center={center}
              zoom={11}
              districtName={district}
              stateName={currentState}
              showDistrictCircle={true}
              showRiskCircles={true}
              showPins={true}
              showSites={true}
              onSelectZone={setSelected}
              selectedId={selected?.habitationId}
            />
          )}
          <MapLegend />
        </div>

        {/* Side Panel: Selected Zone Details or Capacity / Guidelines */}
        <div className="space-y-4">
          {selected ? (
            <Card
              title={selected.habitation}
              subtitle={`${selected.district} · ${selected.state || currentState}`}
              right={<Badge tone={selected.riskClass.toLowerCase()}>{selected.riskClass} RISK</Badge>}
            >
              <ScoreGauge score={selected.riskScore} color={selected.color} />
              <div className="grid grid-cols-2 gap-2 text-sm mt-3">
                <Info label="Main hazards" value={selected.mainHazards?.join(', ') || 'N/A'} />
                <Info label="Population exposed" value={selected.populationExposed?.toLocaleString()} />
                <Info label="Confidence" value={(selected.confidence * 100).toFixed(0) + '%'} />
                <Info label="Data source" value={selected.dataSource} />
              </div>
              {selected.limitations && selected.limitations.length > 0 && (
                <div className="mt-3 bg-amber-50/70 border border-amber-200/80 rounded-lg p-2.5">
                  <div className="text-[11px] font-bold uppercase text-amber-800 mb-1">
                    ⚠️ Terrain & Risk Advisory
                  </div>
                  <ul className="text-xs text-amber-900 space-y-1 list-disc list-inside">
                    {selected.limitations.map((l, i) => (
                      <li key={i}>{l}</li>
                    ))}
                  </ul>
                </div>
              )}
            </Card>
          ) : (
            <Card
              title={`Safe Sites & Carrying Capacity`}
              subtitle={`${district} District (${sites.length} operational/available sites)`}
            >
              {sites.length ? (
                <ul className="space-y-2 max-h-[440px] overflow-y-auto pr-1">
                  {sites.map((s) => (
                    <li
                      key={s.safeSiteId || s.id || s._id}
                      className="flex items-center justify-between text-sm border border-slate-200/80 rounded-lg p-2.5 hover:bg-slate-50 transition"
                    >
                      <div className="min-w-0 pr-2">
                        <div className="font-semibold text-slate-800 flex items-center gap-1.5 truncate">
                          <span>🏕️</span>
                          <span className="truncate">{s.name}</span>
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          Capacity: <strong className="text-slate-700">{s.availableCapacity ?? s.maxCapacity}</strong> / {s.maxCapacity} persons
                        </div>
                      </div>
                      <Badge tone={s.status === 'operational' ? 'green' : 'slate'} className="capitalize">
                        {s.status}
                      </Badge>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-500 py-6 text-center">
                  No registered safe sites in this district yet.
                </p>
              )}
            </Card>
          )}

          <Card title="Circular Risk Zone Analysis Guide">
            <ul className="text-xs text-slate-600 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-red-500 font-bold mt-0.5">🔴</span>
                <div>
                  <strong>Red Zone (Score 70-100):</strong> Critical immediate hazard perimeter. Automatic trigger for relocation phasing.
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-500 font-bold mt-0.5">🟠</span>
                <div>
                  <strong>Orange Zone (Score 55-69):</strong> High vulnerability & recurrence risk buffer.
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-sky-500 font-bold mt-0.5">🔵</span>
                <div>
                  <strong>District Perimeter Circle:</strong> 18 km administrative disaster monitoring radius.
                </div>
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="bg-slate-50 rounded-lg p-2 border border-slate-100">
      <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{label}</div>
      <div className="font-semibold text-slate-800 truncate" title={value}>
        {value ?? '—'}
      </div>
    </div>
  );
}