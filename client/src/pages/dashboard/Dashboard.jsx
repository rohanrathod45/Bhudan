import { useEffect, useState } from 'react';
import { analysisApi } from '../../services/api';
import useDistricts from '../../hooks/useDistricts';
import { Card, StatCard, Spinner, Badge } from '../../components/ui';
import { RiskDistributionChart, DonutChart } from '../../components/charts';
import { RISK_COLORS } from '../../components/charts';

export default function Dashboard() {
  const { districts } = useDistricts();
  const [district, setDistrict] = useState('Wayanad');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    analysisApi
      .districtAnalysis(district)
      .then((res) => setData(res.analysis))
      .catch(() => setError('Could not load analysis. Is the server running?'))
      .finally(() => setLoading(false));
  }, [district]);

  const s = data?.summary || {};

  const riskRows = ['RED', 'ORANGE', 'YELLOW', 'GREEN'].map((k) => ({
    name: k,
    value: s[`${k.toLowerCase()}Count`] || 0,
  }));

  const vulnRows = [
    { name: 'Critical', value: s.vulnerabilityByClass?.critical || 0 },
    { name: 'High', value: s.vulnerabilityByClass?.high || 0 },
    { name: 'Moderate', value: s.vulnerabilityByClass?.moderate || 0 },
    { name: 'Low', value: s.vulnerabilityByClass?.low || 0 },
  ].filter((x) => x.value > 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Decision-Support Dashboard</h2>
          <p className="text-sm text-slate-500">Multi-hazard risk, vulnerability, capacity & relocation overview</p>
        </div>
        <select className="input w-auto" value={district} onChange={(e) => setDistrict(e.target.value)}>
          {districts.map((d) => <option key={d} value={d}>{d} District</option>)}
        </select>
      </div>

      {error && <div className="text-sm bg-red-50 text-red-600 border border-red-200 rounded-lg px-3 py-2">{error}</div>}

      {loading ? (
        <Spinner label="Computing hazard analysis…" />
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
            <StatCard label="Habitations" value={s.totalHabitations} icon="🏘️" color="text-brand-600" />
            <StatCard label="Red Zones" value={s.redZoneCount} icon="🚨" color="text-risk-red" sub="Critical risk" />
            <StatCard label="Population Exposed" value={s.totalPopulationExposed?.toLocaleString()} icon="👥" color="text-risk-orange" />
            <StatCard label="Vulnerable" value={s.totalVulnerable?.toLocaleString()} icon="🛟" color="text-risk-yellow" />
            <StatCard label="Capacity Available" value={s.capacityAvailable?.toLocaleString()} icon="⚖️" color="text-sky-500" />
            <StatCard label="Capacity Gap" value={s.capacityGap?.toLocaleString()} icon="⚠️" color={s.capacityGap > 0 ? 'text-risk-red' : 'text-emerald-600'} />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card title="Risk-Zone Distribution" subtitle={`Habitations by risk class · ${district}`}>
              <RiskDistributionChart data={riskRows} />
            </Card>
            <Card
              title="Vulnerable Population by Class"
              subtitle="Count of vulnerable people needing support"
              right={<Badge tone={s.capacityGap > 0 ? 'red' : 'green'}>{s.capacityGap > 0 ? 'Capacity gap' : 'Sufficient'}</Badge>}
            >
              {vulnRows.length ? (
                <DonutChart
                  data={vulnRows}
                  colors={[RISK_COLORS.RED, RISK_COLORS.ORANGE, RISK_COLORS.YELLOW, RISK_COLORS.GREEN]}
                />
              ) : (
                <p className="text-sm text-slate-500 py-10 text-center">No vulnerability data.</p>
              )}
            </Card>
          </div>

          <Card title="Red-Zone Risk Register" subtitle="Highest-risk habitations in this district">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-500 border-b border-slate-200">
                    <th className="py-2 pr-4 font-medium">Habitation</th>
                    <th className="py-2 pr-4 font-medium">Hazards</th>
                    <th className="py-2 pr-4 font-medium">Exposed</th>
                    <th className="py-2 font-medium">Risk</th>
                    <th className="py-2 font-medium">Zone</th>
                  </tr>
                </thead>
                <tbody>
                  {(data?.redZones || []).slice(0, 6).map((r) => (
                    <tr key={r.zone.habitationId} className="border-b border-slate-100 last:border-0">
                      <td className="py-2 pr-4 font-medium text-slate-800">{r.zone.habitation}</td>
                      <td className="py-2 pr-4 text-slate-500">{r.zone.mainHazards.join(', ')}</td>
                      <td className="py-2 pr-4 text-slate-600">{r.zone.populationExposed.toLocaleString()}</td>
                      <td className="py-2 pr-4 font-semibold text-slate-800">{r.zone.riskScore}</td>
                      <td className="py-2">
                        <Badge tone={r.zone.riskClass.toLowerCase()} className="capitalize">{r.zone.riskClass}</Badge>
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