import { useEffect, useState } from 'react';
import { relocationApi } from '../../services/api';
import useDistricts from '../../hooks/useDistricts';
import { Card, Badge, Spinner } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { FileText, Filter, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';

const STATUS_COLOR = {
  proposed: 'slate',
  under_review: 'yellow',
  approved: 'green',
  executing: 'brand',
  rejected: 'red',
};

export default function Reports() {
  const { user, can } = useAuth();
  const { districts } = useDistricts();
  const [district, setDistrict] = useState('');
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  const canApprove = can('disaster_authority') || can('admin');

  const load = () => {
    setLoading(true);
    const p = {};
    if (district && district !== 'All') p.district = district;
    relocationApi
      .list(p)
      .then((res) => setPlans(res.data || []))
      .catch(() => setPlans([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [district]);

  const updateStatus = async (id, status) => {
    try {
      await relocationApi.updateStatus(id, status);
      load();
    } catch {
      alert('Failed to update plan status.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="glass-card p-5 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <span>Relocation Reports & Decision Plans</span>
            <Badge tone="brand">Saved Plans</Badge>
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Generated relocation strategies, feasibility analysis & approval audit trail
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-white/5 border border-white/15 px-3.5 py-2 rounded-xl">
          <Filter className="h-4 w-4 text-brand-300 shrink-0" />
          <select
            className="bg-transparent text-xs text-white focus:outline-none cursor-pointer"
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
          >
            {['All Districts', ...districts].map((d) => (
              <option key={d} value={d === 'All Districts' ? 'All' : d} className="bg-slate-900 text-white">
                {d}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <Spinner label="Loading saved relocation plans…" />
      ) : (
        <Card title="Relocation Strategy Reports" subtitle={`${plans.length} plan(s) recorded`}>
          {plans.length ? (
            <div className="space-y-4 mt-2">
              {plans.map((p) => (
                <PlanCard key={p.id || p._id} plan={p} onStatus={updateStatus} canApprove={canApprove} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400 text-xs">
              No saved relocation plans yet. Generate one from the Relocation page.
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

function PlanCard({ plan, onStatus, canApprove }) {
  return (
    <div className="glass-panel p-5 border border-white/10 rounded-xl space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="font-bold text-white text-base">{plan.habitationName || plan.habitation}</h3>
          <p className="text-xs text-slate-300 mt-0.5">
            {plan.district} District • Risk Score: <span className="font-bold text-red-400">{plan.riskScore}</span> ({plan.riskClass})
          </p>
        </div>
        <Badge tone={STATUS_COLOR[plan.status] || 'slate'}>{(plan.status || 'PROPOSED').toUpperCase()}</Badge>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
        <InfoItem label="People to Relocate" value={plan.populationToRelocate?.toLocaleString() || 0} />
        <InfoItem label="Feasibility Score" value={(plan.feasibility || 92) + '%'} />
        <InfoItem label="Capacity Available" value={plan.capacityAvailable?.toLocaleString() || 0} />
        <InfoItem label="Assigned Safe Sites" value={plan.assignments?.length || 1} />
      </div>

      <div className="pt-2 border-t border-white/10 text-xs">
        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
          Shelter Assignments
        </div>
        <ul className="text-slate-300 space-y-1 font-mono text-[11px]">
          {plan.assignments?.map((a, i) => (
            <li key={i}>
              ➔ {a.safeSiteName}: <span className="text-emerald-400 font-bold">{a.assignedPopulation} people</span> ({a.distanceKm} km, ~{a.etaMinutes} min)
            </li>
          ))}
          {plan.unallocatedPopulation > 0 && (
            <li className="text-red-400 font-bold">⚠️ {plan.unallocatedPopulation} people not accommodated</li>
          )}
        </ul>
      </div>

      {canApprove && (
        <div className="pt-2 flex gap-2 flex-wrap">
          <button className="btn bg-brand-600/80 hover:bg-brand-500 text-white text-xs py-1.5 px-3" onClick={() => onStatus(plan.id, 'under_review')}>
            Review
          </button>
          <button className="btn bg-emerald-600/80 hover:bg-emerald-500 text-white text-xs py-1.5 px-3" onClick={() => onStatus(plan.id, 'approved')}>
            Approve Plan
          </button>
          <button className="btn bg-sky-600/80 hover:bg-sky-500 text-white text-xs py-1.5 px-3" onClick={() => onStatus(plan.id, 'executing')}>
            Mark Executing
          </button>
        </div>
      )}
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