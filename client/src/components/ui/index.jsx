import React from 'react';

export function Card({ title, subtitle, right, children, className = '' }) {
  return (
    <div className={`glass-card p-5 md:p-6 transition-all duration-300 ${className}`}>
      {(title || right) && (
        <div className="flex items-start justify-between mb-4 flex-wrap gap-2 pb-3 border-b border-slate-700/60">
          <div>
            {title && (
              <h3 className="text-base md:text-lg font-bold text-slate-100 tracking-tight font-heading">
                {title}
              </h3>
            )}
            {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
          </div>
          {right && <div>{right}</div>}
        </div>
      )}
      {children}
    </div>
  );
}

export function StatCard({ label, value, sub, icon: IconComponent, color = 'text-blue-400' }) {
  return (
    <div className="glass-card p-4.5 flex items-center space-x-3.5 hover:border-slate-600 transition-all duration-300 group">
      {IconComponent && (
        <div className="h-12 w-12 rounded-xl bg-slate-900/80 border border-slate-700/80 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-inner">
          {typeof IconComponent === 'string' ? (
            <span className="text-xl">{IconComponent}</span>
          ) : (
            <IconComponent className={`h-5 w-5 ${color}`} />
          )}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 truncate">{label}</p>
        <p className="text-2xl font-bold text-slate-100 mt-0.5 tracking-tight font-heading truncate">{value ?? '—'}</p>
        {sub && <p className="text-xs text-slate-400 mt-0.5 truncate">{sub}</p>}
      </div>
    </div>
  );
}

const badgeStyles = {
  green: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  yellow: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  orange: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
  red: 'bg-red-500/15 text-red-400 border-red-500/30 shadow-[0_0_12px_rgba(239,68,68,0.2)]',
  slate: 'bg-slate-800 text-slate-300 border-slate-700',
  brand: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  cyan: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
};

export function Badge({ children, tone = 'slate', className = '' }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border backdrop-blur-sm ${
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
    <div className="flex flex-col items-center justify-center py-16 text-slate-400">
      <div className="h-9 w-9 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
      <p className="mt-3 text-xs font-medium tracking-wide text-slate-400">{label}</p>
    </div>
  );
}