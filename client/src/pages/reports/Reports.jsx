import { useEffect, useState } from 'react';
import { relocationApi } from '../../services/api';
import useDistricts from '../../hooks/useDistricts';
import { Card, Badge, Spinner, StateDistrictSelector } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import OfficialReportPdfModal from '../../components/reports/OfficialReportPdfModal';

const STATUS_COLOR = {
  proposed: 'slate',
  under_review: 'yellow',
  approved: 'green',
  executing: 'blue',
  rejected: 'red',
};

export default function Reports() {
  const { user } = useAuth();
  const { selectedDistrict: district, setSelectedDistrict } = useDistricts();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [selectedPdfPlan, setSelectedPdfPlan] = useState(null);

  const canApprove = (user?.role || '') === 'admin' || (user?.role || '') === 'disaster_authority';
  const canGenerate = (user?.role || '') === 'admin' || (user?.role || '') === 'disaster_authority' || (user?.role || '') === 'analyst' || !user;

  const [allPlansCount, setAllPlansCount] = useState(0);

  const load = () => {
    setLoading(true);
    const distParam = district && district !== 'All' && district !== '' ? district : undefined;
    
    Promise.all([
      relocationApi.list(distParam),
      relocationApi.list(), // fetch total across all districts to show database status
    ])
      .then(([filteredRes, allRes]) => {
        setPlans(filteredRes.data || []);
        setAllPlansCount((allRes.data || []).length);
      })
      .catch((err) => {
        console.error('Failed to load reports from database:', err);
        setPlans([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [district]);

  const handleGenerateReport = async () => {
    if (!district || district === 'All') {
      setFeedback('⚠️ Please select a specific State and District from the dropdown above before generating a report.');
      return;
    }

    setGenerating(true);
    setFeedback('');
    try {
      const res = await relocationApi.generate(district);
      setFeedback(`✅ Official relocation report generated! ${res.count} plan(s) saved to the database.`);
      load();
      if (res.data && res.data[0]) {
        setSelectedPdfPlan(res.data[0]);
      }
      setTimeout(() => setFeedback(''), 6000);
    } catch (err) {
      console.error('Error generating report:', err);
      setFeedback(`❌ Could not generate report: ${err.response?.data?.message || err.message}`);
    } finally {
      setGenerating(false);
    }
  };

  const updateStatus = async (id, status) => {
    await relocationApi.updateStatus(id, status);
    load();
  };

  const deletePlan = async (id) => {
    if (!window.confirm('Are you sure you want to delete this report from the database?')) return;
    try {
      await relocationApi.delete(id);
      load();
    } catch (err) {
      alert(`Could not delete report: ${err.message}`);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">📑</span>
            <h2 className="text-xl font-bold text-slate-800">Relocation Reports &amp; Decision Registers</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Operational evacuation plans, carrying capacity directives, and PDF decision dossiers
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <StateDistrictSelector value={district} onChange={(d) => setSelectedDistrict(d)} />
          {canGenerate && (
            <button
              className="btn btn-primary text-xs flex items-center gap-1.5 shadow-sm"
              onClick={handleGenerateReport}
              disabled={generating}
            >
              <span>{generating ? '⏳' : '⚡'}</span>
              <span>{generating ? 'Generating &amp; Saving…' : 'Generate &amp; Save Report'}</span>
            </button>
          )}
          {plans.length > 0 && (
            <button
              className="btn btn-outline text-xs flex items-center gap-1"
              onClick={() => setSelectedPdfPlan(plans[0])}
              title="View formatted PDF directive"
            >
              <span>📄</span>
              <span>View PDF Format</span>
            </button>
          )}
          <button
            className="btn btn-outline text-xs flex items-center gap-1"
            onClick={() => window.print()}
            title="Print or export as PDF"
          >
            <span>🖨️</span>
            <span>Print All</span>
          </button>
        </div>
      </div>

      {feedback && (
        <div className={`text-sm px-4 py-3 rounded-lg border flex items-center justify-between ${
          feedback.startsWith('✅')
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
            : 'bg-red-50 text-red-800 border-red-200'
        }`}>
          <span>{feedback}</span>
          <button onClick={() => setFeedback('')} className="text-xs font-bold text-slate-400 hover:text-slate-600">✕</button>
        </div>
      )}

      {loading ? (
        <Spinner label="Loading saved reports from database…" />
      ) : (
        <Card
          title="Database Decision Registers &amp; Relocation Records"
          subtitle={`${plans.length} plan(s) retrieved from MongoDB for ${district || 'All Districts'}`}
        >
          {plans.length ? (
            <div className="space-y-4">
              {plans.map((p) => (
                <PlanCard
                  key={p.id || p._id}
                  plan={p}
                  onStatus={updateStatus}
                  onDelete={deletePlan}
                  onViewPdf={(planItem) => setSelectedPdfPlan(planItem)}
                  canApprove={canApprove}
                />
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <div className="text-3xl mb-2">📑</div>
              <p className="text-sm font-semibold text-slate-700">
                {district ? `No saved reports found for ${district}.` : 'No saved relocation reports found in the database.'}
              </p>
              <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                {district
                  ? `Click "Generate & Save Report" to run the risk engine for ${district} and save it to MongoDB.`
                  : 'Select a district above and click "Generate & Save Report" to create and store the evacuation report in MongoDB.'}
              </p>
              <div className="mt-4 flex items-center justify-center gap-2.5">
                {canGenerate && district && (
                  <button
                    className="btn btn-primary btn-sm inline-flex items-center gap-1 shadow-sm"
                    onClick={handleGenerateReport}
                    disabled={generating}
                  >
                    ⚡ Generate &amp; Save for {district}
                  </button>
                )}
                {district && allPlansCount > 0 && (
                  <button
                    className="btn btn-outline btn-sm inline-flex items-center gap-1"
                    onClick={() => setSelectedDistrict('')}
                  >
                    🌐 View All Saved Reports ({allPlansCount})
                  </button>
                )}
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Official Government PDF Layout Modal */}
      {selectedPdfPlan && (
        <OfficialReportPdfModal
          plan={selectedPdfPlan}
          district={district}
          onClose={() => setSelectedPdfPlan(null)}
        />
      )}
    </div>
  );
}

function PlanCard({ plan, onStatus, onDelete, onViewPdf, canApprove }) {
  const planId = plan.id || plan._id;
  const formattedDate = plan.createdAt ? new Date(plan.createdAt).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }) : 'Recently created';

  return (
    <div className="border border-slate-200 rounded-xl p-4 bg-white hover:border-slate-300 transition shadow-xs">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-slate-800 text-base">{plan.habitationName}</h3>
            <span className={`px-2 py-0.5 text-xs font-bold rounded ${
              plan.riskClass === 'RED' ? 'bg-red-100 text-red-700 border border-red-200' :
              plan.riskClass === 'ORANGE' ? 'bg-orange-100 text-orange-700 border border-orange-200' :
              'bg-yellow-100 text-yellow-700 border border-yellow-200'
            }`}>
              {plan.riskClass} Risk · Score {plan.riskScore}
            </span>
            <span className="text-xs font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
              REF: {planId.slice(-6).toUpperCase()}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {plan.district}, {plan.state} · Created: {formattedDate} {plan.createdBy ? `by ${plan.createdBy}` : ''}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Badge tone={STATUS_COLOR[plan.status] || 'slate'}>{plan.status?.replace('_', ' ').toUpperCase()}</Badge>
          
          <button
            onClick={() => onViewPdf(plan)}
            className="px-2.5 py-1 bg-brand-50 hover:bg-brand-100 text-brand-700 text-xs font-bold rounded border border-brand-200 flex items-center gap-1 transition cursor-pointer"
            title="Open official PDF document format"
          >
            <span>📄</span>
            <span>PDF Format</span>
          </button>

          {onDelete && (
            <button
              onClick={() => onDelete(planId)}
              className="text-slate-400 hover:text-red-600 text-xs p-1 rounded transition"
              title="Delete report from database"
            >
              🗑️
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mt-3.5">
        <Info label="Total Habitation Pop." value={plan.populationToRelocate?.toLocaleString() || 0} />
        <Info label="Needing Shelter" value={plan.populationNeedingShelter?.toLocaleString() || 0} />
        <Info label="Feasibility Rating" value={`${plan.feasibility || 0}%`} highlight={plan.feasibility >= 80 ? 'text-emerald-700' : 'text-amber-700'} />
        <Info label="Assigned Safe Sites" value={plan.assignments?.length || 0} />
      </div>

      <div className="mt-3.5 bg-slate-50 rounded-lg p-3 border border-slate-100">
        <div className="text-xs font-bold uppercase text-slate-500 mb-1.5 flex items-center justify-between">
          <span>Safe Site Capacity Allocations</span>
          {plan.unallocatedPopulation > 0 && (
            <span className="text-risk-red font-semibold lowercase">
              ⚠ {plan.unallocatedPopulation.toLocaleString()} pax unallocated
            </span>
          )}
        </div>
        <ul className="text-xs text-slate-700 space-y-1.5">
          {(plan.assignments || []).length > 0 ? (
            plan.assignments.map((a, idx) => (
              <li key={a.safeSiteId || idx} className="flex items-center justify-between bg-white p-2 rounded border border-slate-200">
                <span className="font-semibold text-slate-800">🏕️ {a.safeSiteName}</span>
                <span className="text-slate-600">
                  <strong>{a.assignedPopulation?.toLocaleString()}</strong> people ({a.distanceKm} km · ~{a.etaMinutes} min)
                </span>
              </li>
            ))
          ) : (
            <li className="text-slate-400 italic">No safe sites assigned.</li>
          )}
        </ul>
      </div>

      {plan.recommendedActions?.length > 0 && (
        <div className="mt-3">
          <div className="text-xs font-semibold uppercase text-slate-500 mb-1">Recommended Directives</div>
          <ul className="text-xs text-slate-600 list-disc list-inside space-y-0.5">
            {plan.recommendedActions.map((a, i) => (
              <li key={i}>{a}</li>
            ))}
          </ul>
        </div>
      )}

      {canApprove && (
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2">
          <div className="text-xs text-slate-400">
            {plan.approvedBy ? `Approved by ${plan.approvedBy} on ${new Date(plan.approvedAt).toLocaleDateString()}` : 'Pending administrative action'}
          </div>
          <div className="flex gap-2">
            <button className="btn btn-outline btn-sm text-xs" onClick={() => onStatus(planId, 'under_review')}>Under Review</button>
            <button className="btn btn-primary btn-sm text-xs bg-emerald-600 hover:bg-emerald-700 border-emerald-600" onClick={() => onStatus(planId, 'approved')}>Approve Order</button>
            <button className="btn btn-outline btn-sm text-xs text-blue-600 border-blue-200 hover:bg-blue-50" onClick={() => onStatus(planId, 'executing')}>Execute Order</button>
          </div>
        </div>
      )}
    </div>
  );
}

function Info({ label, value, highlight }) {
  return (
    <div className="bg-slate-50/80 rounded-lg p-2.5 border border-slate-100">
      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</div>
      <div className={`font-bold text-slate-800 text-sm mt-0.5 ${highlight || ''}`}>{value}</div>
    </div>
  );
}