import React from 'react';

export function Card({ title, subtitle, right, children, className = '', staticCard = false }) {
  const cardClass = staticCard ? 'gov-card-static' : 'gov-card';
  return (
    <div className={`${cardClass} p-5 md:p-6 ${className}`}>
      {(title || right) && (
        <div className="flex items-start justify-between mb-4 flex-wrap gap-2 pb-3 border-b border-slate-100">
          <div>
            {title && (
              <h3 className="text-base md:text-lg font-bold text-[#0B2447] tracking-tight font-heading">
                {title}
              </h3>
            )}
            {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          {right && <div>{right}</div>}
        </div>
      )}
      {children}
    </div>
  );
}

export function StatCard({ label, value, sub, icon: IconComponent, color = 'text-[#0B2447]', bg = 'bg-slate-100' }) {
  return (
    <div className="gov-card p-4.5 flex items-center space-x-3.5 group">
      {IconComponent && (
        <div className={`h-12 w-12 rounded-xl ${bg} border border-slate-200 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-2xs`}>
          {typeof IconComponent === 'string' ? (
            <span className="text-xl">{IconComponent}</span>
          ) : (
            <IconComponent className={`h-5 w-5 ${color}`} />
          )}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 truncate">{label}</p>
        <p className="text-2xl font-bold text-[#0B2447] mt-0.5 tracking-tight font-heading truncate">{value ?? '—'}</p>
        {sub && <p className="text-xs text-slate-500 mt-0.5 truncate">{sub}</p>}
      </div>
    </div>
  );
}

const badgeStyles = {
  green: 'bg-[#16A34A]/10 text-[#15803D] border-[#16A34A]/30',
  yellow: 'bg-[#CA8A04]/10 text-[#A16207] border-[#CA8A04]/30',
  orange: 'bg-[#EA580C]/10 text-[#C2410C] border-[#EA580C]/30',
  red: 'bg-[#DC2626]/10 text-[#B91C1C] border-[#DC2626]/30 font-bold',
  slate: 'bg-slate-100 text-slate-700 border-slate-200',
  brand: 'bg-[#0B2447]/10 text-[#0B2447] border-[#0B2447]/20 font-semibold',
  saffron: 'bg-[#F59E0B]/15 text-[#92400E] border-[#F59E0B]/30 font-semibold',
};

export function Badge({ children, tone = 'slate', className = '' }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
        badgeStyles[tone] || badgeStyles.slate
      } ${className}`}
    >
      {children}
    </span>
  );
}

export function riskTone(riskClass) {
  return String(riskClass || '').toLowerCase();
}

export function Spinner({ label = 'Loading data…' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-slate-500">
      <div className="h-9 w-9 border-3 border-[#0B2447] border-t-transparent rounded-full animate-spin" />
      <p className="mt-3 text-xs font-semibold tracking-wide text-[#0B2447]">{label}</p>
    </div>
  );
}