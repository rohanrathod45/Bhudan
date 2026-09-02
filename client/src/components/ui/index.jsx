export function Card({ title, subtitle, right, children, className = '' }) {
  return (
    <div className={`card p-5 ${className}`}>
      {(title || right) && (
        <div className="flex items-start justify-between mb-4">
          <div>
            {title && <h3 className="text-base font-semibold text-slate-800">{title}</h3>}
            {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          {right && <div>{right}</div>}
        </div>
      )}
      {children}
    </div>
  );
}

export function StatCard({ label, value, sub, icon, color = 'text-brand-600' }) {
  return (
    <div className="card p-4 flex items-start gap-3">
      {icon && (
        <div className={`h-10 w-10 rounded-lg flex items-center justify-center text-xl ${color.replace('text', 'bg')} bg-opacity-10`}>
          <span className={color}>{icon}</span>
        </div>
      )}
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
        <p className="text-2xl font-bold text-slate-800 mt-0.5">{value}</p>
        {sub && <p className="text-xs text-slate-500 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

const badgeStyles = {
  green: 'bg-risk-green/10 text-risk-green border-risk-green/30',
  yellow: 'bg-risk-yellow/15 text-risk-yellow border-risk-yellow/40',
  orange: 'bg-risk-orange/10 text-risk-orange border-risk-orange/30',
  red: 'bg-risk-red/10 text-risk-red border-risk-red/30',
  slate: 'bg-slate-100 text-slate-600 border-slate-200',
};

export function Badge({ children, tone = 'slate', className = '' }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badgeStyles[tone] || badgeStyles.slate} ${className}`}
    >
      {children}
    </span>
  );
}

export function riskTone(riskClass) {
  return String(riskClass || '').toLowerCase();
}

export function Spinner({ label = 'Loading…' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-slate-400">
      <div className="h-8 w-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
      <p className="mt-3 text-sm">{label}</p>
    </div>
  );
}

export { default as StateDistrictSelector } from './StateDistrictSelector';