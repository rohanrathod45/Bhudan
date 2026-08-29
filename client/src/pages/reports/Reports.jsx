import { useEffect, useState } from 'react';
import { relocationApi } from '../../services/api';
import useDistricts from '../../hooks/useDistricts';
import { Card, Badge, Spinner } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';

const STATUS_COLOR = {
  proposed: 'slate',
  under_review: 'yellow',
  approved: 'green',
  executing: 'blue',
  rejected: 'red',
};

export default function Reports() {
  const { user } = useAuth();
  const { districts } = useDistricts();
  const [district, setDistrict] = useState('');
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  const canApprove = (user?.role || '') === 'admin' || (user?.role || '') === 'disaster_authority';
  const load = () => {
    setLoading(true);
    const p = {};
    if (district && district !== 'All') p.district = district;
    relocationApi.list(p).then((res) => setPlans(res.data)).catch(() => setPlans([]));
    setLoading(false);
  };
  useEffect(() => { load(); }, [district]);

  const updateStatus = async (id, status) => {
    await relocationApi.updateStatus(id, status);
    load();
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Reports & Relocation Plans</h2>
          <p className="text-sm text-slate-500">Saved plans and their approval status</p>
        </div>
        <select className="input w-auto" value={district} onChange={(e) => setDistrict(e.target.value)}>
          {['All', ...districts].map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      {loading ? <Spinner /> : (
        <Card title="Saved relocation plans" subtitle={`${plans.length} plan(s)`}>
          {plans.length ? (
            <div className="space-y-4">
              {plans.map((p) => (
                <PlanCard key={p.id || p._id} plan={p} onStatus={updateStatus} canApprove={(user?.role || '') >= 'disaster_authority'} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">No plans saved yet. Generate one from the Relocation page.</p>
          )}
        </Card>
      )}
    </div>
  );
}

function PlanCard({ plan, onStatus, canApprove }) {
  return (
    <div className="border border-slate-200 rounded-lg p-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="font-semibold text-slate-800">{plan.habitationName}</h3>
          <p className="text-sm text-slate-500">{plan.district} · Risk {plan.riskScore} ({plan.riskClass})</p>
        </div>
        <Badge tone={STATUS_COLOR[plan.status] || 'slate'}>{plan.status}</Badge>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-sm mt-3">
        <Info label="People to relocate" value={plan.populationToRelocate?.toLocaleString() || 0} />
        <Info label="Feasibility" value={plan.feasibility + '%'} />
        <Info label="Capacity available" value={plan.capacityAvailable?.toLocaleString() || 0} />
        <Info label="Assigned sites" value={plan.assignments?.length || 0} />
      </div>

      <div className="mt-3">
        <div className="text-xs font-semibold uppercase text-slate-500 mb-1">Assignments</div>
        <ul className="text-xs text-slate-600 space-y-1">
          {plan.assignments?.map((a) => (
            <li key={a.safeSiteId}>→ {a.safeSiteName}: {a.assignedPopulation} people ({a.distanceKm} km, ~{a.etaMinutes} min)</li>
          ))}
          {plan.unallocatedPopulation > 0 && (
            <li className="text-risk-red">⚠ {plan.unallocatedPopulation} not accommodated</li>
          )}
        </ul>
      </div>

      {canApprove && (
        <div className="mt-3 flex gap-2">
          <button className="btn btn-primary btn-sm" onClick={() => onStatus(plan.id, 'under_review')}>Review</button>
          <button className="btn btn-outline btn-sm" onClick={() => onStatus(plan.id, 'approved')}>Approve</button>
          <button className="btn btn-outline btn-sm" onClick={() => onStatus(plan.id, 'executing')}>Execute</button>
        </div>
      )}
      {plan.recommendedActions?.length > 0 && (
        <div className="mt-3">
          <div className="text-xs font-semibold uppercase text-slate-500 mb-1">Recommended actions</div>
          <ul className="text-xs text-slate-600 list-disc list-inside">
            {plan.recommendedActions.map((a, i) => <li key={i}>{a}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="bg-slate-50 rounded-lg p-2">
      <div className="text-[10px] font-semibold uppercase text-slate-400">{label}</div>
      <div className="font-medium text-slate-700">{value}</div>
    </div>
  );
}