import { useEffect, useMemo, useState } from 'react';
import { analysisApi } from '../../services/api';
import useDistricts from '../../hooks/useDistricts';
import RiskMap, { MapLegend } from '../../components/map/RiskMap';
import { Card, Badge, Spinner } from '../../components/ui';
import { ScoreGauge } from '../../components/charts';

const DEFAULT_CENTER = [22.0, 79.0];

export default function MapView() {
  const { districts, centers } = useDistricts();
  const [district, setDistrict] = useState('Wayanad');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
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
  const center = centers[district] || DEFAULT_CENTER;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-800">GIS Risk Map</h2>
          <p className="text-sm text-slate-500">Interactive hazard & red-zone mapping · select a marker for details</p>
        </div>
        <select className="input w-auto" value={district} onChange={(e) => setDistrict(e.target.value)}>
          {districts.map((d) => <option key={d} value={d}>{d} District</option>)}
        </select>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 card p-0 overflow-hidden relative" style={{ minHeight: 560 }}>
          {loading ? (
            <div className="h-[560px]"><Spinner label="Loading map…" /></div>
          ) : (
            <RiskMap zones={zones} sites={sites} center={center} onSelectZone={setSelected} />
          )}
          <MapLegend />
        </div>

        <div className="space-y-4">
          {selected ? (
            <Card title={selected.habitation} subtitle={`${selected.district} · ${selected.state}`} right={<Badge tone={selected.riskClass.toLowerCase()}>{selected.riskClass}</Badge>}>
              <ScoreGauge score={selected.riskScore} color={selected.color} />
              <div className="grid grid-cols-2 gap-3 text-sm mt-2">
                <Info label="Main hazards" value={selected.mainHazards?.join(', ')} />
                <Info label="Population exposed" value={selected.populationExposed?.toLocaleString()} />
                <Info label="Confidence" value={(selected.confidence * 100).toFixed(0) + '%'} />
                <Info label="Source" value={selected.dataSource} />
              </div>
              <div className="mt-3">
                <div className="text-xs font-semibold uppercase text-slate-500 mb-1">Limitations</div>
                <ul className="text-xs text-slate-500 space-y-1 list-disc list-inside">
                  {selected.limitations?.map((l, i) => <li key={i}>{l}</li>)}
                </ul>
              </div>
            </Card>
          ) : (
            <Card title="Safe sites (carrying capacity)">
              {sites.length ? (
                <ul className="space-y-2 max-h-[440px] overflow-y-auto pr-1">
                  {sites.map((s) => (
                    <li key={s.safeSiteId} className="flex items-center justify-between text-sm border border-slate-100 rounded-lg px-3 py-2">
                      <div>
                        <div className="font-medium text-slate-800">{s.name}</div>
                        <div className="text-xs text-slate-500">Available {s.availableCapacity} / {s.maxCapacity}</div>
                      </div>
                      <Badge tone="slate">{s.status}</Badge>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-500">No safe sites in this district.</p>
              )}
            </Card>
          )}

          <Card title="How risk is scored">
            <ol className="text-xs text-slate-600 space-y-1.5 list-decimal list-inside">
              <li>Hazard severity & recurrence</li>
              <li>Population exposure & density</li>
              <li>Vulnerability of residents</li>
              <li>Infrastructure & accessibility</li>
              <li>Terrain / elevation</li>
              <li>Historical disaster evidence</li>
              <li>Distance to emergency facilities</li>
            </ol>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="bg-slate-50 rounded-lg p-2">
      <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</div>
      <div className="font-medium text-slate-800 truncate" title={value}>{value}</div>
    </div>
  );
}