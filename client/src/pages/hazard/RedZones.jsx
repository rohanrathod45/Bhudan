import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { analysisApi, dataApi } from '../../services/api';
import useDistricts from '../../hooks/useDistricts';
import RiskMap, { MapLegend } from '../../components/map/RiskMap';
import { Card, StatCard, Badge, Spinner, StateDistrictSelector } from '../../components/ui';
import { ScoreGauge } from '../../components/charts';

const DEFAULT_CENTER = [22.0, 79.0];

export default function RedZones() {
  const { centers, districtMeta, getStateForDistrict, selectedDistrict: district, setSelectedDistrict } = useDistricts();
  const [analysis, setAnalysis] = useState(null);
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!district || district === 'All') {
      setAnalysis(null);
      setSites([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    analysisApi
      .redZones(district)
      .then((res) => setAnalysis(res))
      .catch(() => setAnalysis(null));
    dataApi.sites({ district }).then((res) => setSites(res.data)).catch(() => setSites([]));
    setLoading(false);
  }, [district]);

  const zones = analysis?.data || [];
  const riskSum = zones.reduce((a, z) => a + z.riskScore, 0);
  const center = (district && centers[district]) || DEFAULT_CENTER;
  const currentMeta = district ? (districtMeta[district] || {}) : {};
  const currentState = currentMeta.state || getStateForDistrict(district) || '';

  return (
    <div className="space-y-5">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">🚨</span>
            <h2 className="text-xl font-bold text-slate-800">Hazard-Based Red Zones</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Critical & high-risk habitations requiring immediate relocation Phasing
          </p>
        </div>

        <StateDistrictSelector value={district} onChange={(d) => setSelectedDistrict(d)} />
      </div>

      {!district ? (
        <div className="card p-12 text-center bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="text-4xl mb-3">📍</div>
          <h3 className="text-lg font-bold text-slate-800">Select a District</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
            Please choose a <strong>State</strong> and <strong>District</strong> using the selector above to view the high-risk hazard red-zone habitations.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Red Zones" value={zones.filter((z) => z.riskClass === 'RED').length} icon="🚨" color="text-risk-red" />
            <StatCard label="Orange Zones" value={zones.filter((z) => z.riskClass === 'ORANGE').length} icon="🔥" color="text-risk-orange" />
            <StatCard label="Total Critical" value={zones.length} icon="⚠️" color="text-risk-red" />
            <StatCard label="Avg Risk Score" value={zones.length ? Math.round(riskSum / zones.length) : 0} icon="📊" color="text-brand-600" />
          </div>

          <div className="grid lg:grid-cols-5 gap-5">
        <div className="lg:col-span-3 card p-0 overflow-hidden relative shadow-md" style={{ minHeight: 520 }}>
          {loading ? (
            <div className="h-[520px] flex items-center justify-center">
              <Spinner label="Loading satellite zones…" />
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
              onSelectZone={setSelected}
              selectedId={selected?.habitationId}
            />
          )}
          <MapLegend />
        </div>

        <div className="lg:col-span-2 space-y-4 overflow-y-auto" style={{ maxHeight: 520 }}>
          {selected ? (
            <Card title={selected.habitation} right={<Badge tone="red">{selected.riskClass}</Badge>}>
              <ScoreGauge score={selected.riskScore} color={selected.color} label="Risk Score" />
              <div className="grid grid-cols-2 gap-2 text-sm mt-2">
                <Info label="Main hazards" value={selected.mainHazards?.join(', ')} />
                <Info label="Population" value={selected.population?.toLocaleString()} />
                <Info label="Population exposed" value={selected.populationExposed?.toLocaleString()} />
                <Info label="Exposure index" value={selected.exposureIndex} />
                <Info label="Infrastructure risk" value={selected.infrastructureRisk} />
                <Info label="Confidence" value={(selected.confidence * 100).toFixed(0) + '%'} />
              </div>
              <button
                className="btn-primary w-full mt-3 text-xs"
                onClick={() => navigate(`/habitations/${selected.habitationId}`)}
              >
                Open Habitation Details →
              </button>
            </Card>
          ) : (
            <Card title="Critical Habitations" subtitle="Click any circle or list item to inspect">
              {zones.length ? (
                <ul className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                  {zones.slice(0, 12).map((z) => (
                    <li
                      key={z.habitationId || z._id}
                      className="border border-slate-100 rounded-lg p-3 hover:bg-slate-50 cursor-pointer transition flex items-center justify-between"
                      onClick={() => setSelected(z)}
                    >
                      <div>
                        <div className="font-semibold text-slate-800">{z.habitation}</div>
                        <div className="text-xs text-slate-500">
                          {z.district} · {z.mainHazards?.join(', ')}
                        </div>
                      </div>
                      <Badge tone={z.riskClass.toLowerCase()}>{z.riskScore} {z.riskClass}</Badge>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-500 py-10 text-center">
                  No red/orange zones found in {district} district.
                </p>
              )}
            </Card>
          )}
        </div>
      </div>
      </>
      )}
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="bg-slate-50 rounded-lg p-2 border border-slate-100">
      <div className="text-[10px] font-semibold uppercase text-slate-400">{label}</div>
      <div className="font-medium text-slate-700 truncate" title={value}>{value ?? '—'}</div>
    </div>
  );
}