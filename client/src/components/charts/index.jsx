import React from 'react';
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
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  CartesianGrid,
} from 'recharts';

export const RISK_COLORS = {
  GREEN: '#16A34A',
  YELLOW: '#CA8A04',
  ORANGE: '#EA580C',
  RED: '#DC2626',
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 shadow-lg rounded-lg border border-slate-200 text-xs text-slate-800 z-50">
        <p className="font-bold text-[#0B2447] mb-1.5 border-b border-slate-100 pb-1">{label || payload[0]?.name}</p>
        {payload.map((entry, index) => (
          <div key={`item-${index}`} className="flex items-center space-x-2 py-0.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color || entry.fill }} />
            <span className="text-slate-600 font-medium">{entry.name}:</span>
            <span className="font-bold text-[#0B2447]">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export function StackedDistrictBarChart({ data }) {
  // data format: [{ district: 'Wayanad', GREEN: 12, YELLOW: 24, ORANGE: 18, RED: 8 }]
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -15, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
          <XAxis dataKey="district" tick={{ fill: '#475569', fontSize: 11 }} angle={-25} textAnchor="end" />
          <YAxis allowDecimals={false} tick={{ fill: '#475569', fontSize: 11 }} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '12px', color: '#1E293B' }} />
          <Bar dataKey="GREEN" name="Low (Green)" stackId="a" fill={RISK_COLORS.GREEN} radius={[0, 0, 0, 0]} />
          <Bar dataKey="YELLOW" name="Moderate (Yellow)" stackId="a" fill={RISK_COLORS.YELLOW} radius={[0, 0, 0, 0]} />
          <Bar dataKey="ORANGE" name="High (Orange)" stackId="a" fill={RISK_COLORS.ORANGE} radius={[0, 0, 0, 0]} />
          <Bar dataKey="RED" name="Critical (Red)" stackId="a" fill={RISK_COLORS.RED} radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function RiskDistributionChart({ data }) {
  // data: [{ name: 'RED', value: n }]
  const rows = ['RED', 'ORANGE', 'YELLOW', 'GREEN']
    .map((k) => (data || []).find((x) => x.name === k) || { name: k, value: 0 })
    .filter((d) => d.value >= 0);

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
          <XAxis dataKey="name" tick={{ fill: '#475569', fontSize: 12 }} />
          <YAxis allowDecimals={false} tick={{ fill: '#475569', fontSize: 12 }} />
          <Tooltip content={<CustomTooltip />} />
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
  const defaultColors = [RISK_COLORS.RED, RISK_COLORS.ORANGE, RISK_COLORS.YELLOW, RISK_COLORS.GREEN];
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey={dataKey}
            nameKey={nameKey}
            innerRadius={55}
            outerRadius={85}
            paddingAngle={3}
            stroke="#FFFFFF"
            strokeWidth={2}
          >
            {(data || []).map((d, i) => (
              <Cell key={i} fill={(colors && colors[i]) || defaultColors[i % defaultColors.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: '12px', color: '#475569' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ScoreGauge({ score = 0, label = 'Risk Score', color = '#DC2626' }) {
  const data = [{ name: label, value: Math.min(100, Math.max(0, score)), fill: color }];

  let bandLabel = 'GREEN (Low)';
  if (score >= 70) bandLabel = 'RED (Critical)';
  else if (score >= 55) bandLabel = 'ORANGE (High)';
  else if (score >= 30) bandLabel = 'YELLOW (Moderate)';

  return (
    <div className="h-48 w-full relative flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart innerRadius="72%" outerRadius="100%" data={data} startAngle={210} endAngle={-30}>
          <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
          <RadialBar dataKey="value" cornerRadius={12} background={{ fill: '#F1F5F9' }} />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none pt-2">
        <span className="text-3xl font-black text-[#0B2447] tracking-tight font-heading">{score}</span>
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mt-0.5">{label}</span>
        <span
          className="mt-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full border shadow-2xs"
          style={{
            backgroundColor: `${color}15`,
            borderColor: `${color}40`,
            color: color,
          }}
        >
          {bandLabel}
        </span>
      </div>
    </div>
  );
}

export function RiskRadarChart({ components }) {
  const data = [
    { subject: 'Hazard (32%)', score: components?.hazard || 0, fullMark: 100 },
    { subject: 'Exposure (22%)', score: components?.exposure || 0, fullMark: 100 },
    { subject: 'Vulnerability (18%)', score: components?.vulnerability || 0, fullMark: 100 },
    { subject: 'Infrastructure (18%)', score: components?.infrastructure || 0, fullMark: 100 },
    { subject: 'Terrain (10%)', score: components?.terrain || 0, fullMark: 100 },
  ];

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
          <PolarGrid stroke="#CBD5E1" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: '#334155', fontSize: 11 }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#94A3B8" tick={{ fill: '#64748B', fontSize: 10 }} />
          <Radar name="Risk Factor Score" dataKey="score" stroke="#0B2447" fill="#14356B" fillOpacity={0.35} />
          <Tooltip content={<CustomTooltip />} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}