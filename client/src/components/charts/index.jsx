import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
  CartesianGrid,
} from 'recharts';

const RISK_COLORS = { GREEN: '#16a34a', YELLOW: '#ca8a04', ORANGE: '#ea580c', RED: '#dc2626' };

export function RiskDistributionChart({ data }) {
  // data: [{ name: 'RED', value: n }]
  const rows = ['RED', 'ORANGE', 'YELLOW', 'GREEN'].map((k) => {
    const d = (data || []).find((x) => x.name === k) || { name: k, value: 0 };
    return d;
  }).filter((d) => d.value > 0);
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
          <Tooltip />
          <Bar dataKey="value" name="Zones" radius={[6, 6, 0, 0]}>
            {rows.map((d) => (
              <Cell key={d.name} fill={RISK_COLORS[d.name] || '#94a3b8'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function DonutChart({ title = '', data, dataKey = 'value', nameKey = 'name', colors }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey={dataKey} nameKey={nameKey} innerRadius={50} outerRadius={80} paddingAngle={2}>
            {(data || []).map((d, i) => (
              <Cell key={i} fill={(colors && colors[i]) || '#64748b'} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ScoreGauge({ score = 0, label = 'Risk Score', color = '#dc2626' }) {
  const data = [{ name: label, value: score, fill: color }];
  return (
    <div className="h-40 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart innerRadius="70%" outerRadius="100%" data={data} startAngle={220} endAngle={-40}>
          <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
          <RadialBar dataKey="value" cornerRadius={10} background={{ fill: '#e2e8f0' }} />
          <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central" className="fill-slate-800 font-bold">
            <tspan fontSize="24">{score}</tspan>
            <tspan fontSize="12" x="50%" dy="18" className="fill-slate-500">
              {label}
            </tspan>
          </text>
        </RadialBarChart>
      </ResponsiveContainer>
    </div>
  );
}

export { RISK_COLORS };