import { useRef } from 'react';
import { Badge } from '../ui';

export default function OfficialReportPdfModal({ plan, district, onClose }) {
  const printRef = useRef(null);

  if (!plan) return null;

  const planId = plan.id || plan._id || 'REF-2026-001';
  const issueDate = plan.createdAt
    ? new Date(plan.createdAt).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : new Date().toLocaleDateString('en-IN');
  const issueTime = plan.createdAt
    ? new Date(plan.createdAt).toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : new Date().toLocaleTimeString('en-IN');

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[2000] overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 print:p-0 print:bg-white print:static print:overflow-visible">
      {/* Container Dialog */}
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] print:max-h-none print:shadow-none print:border-none print:w-full print:rounded-none">
        {/* Modal Action Bar (Hidden when printing) */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between flex-wrap gap-3 print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-xl">📄</span>
            <div>
              <h3 className="text-base font-bold">Official Decision Support &amp; Relocation Directive</h3>
              <p className="text-xs text-slate-300">Format: Standard Disaster Management Authority Directive (A4 Print Ready)</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs rounded-lg shadow-md flex items-center gap-2 transition cursor-pointer"
            >
              <span>🖨️</span>
              <span>Print / Save as PDF</span>
            </button>
            <button
              onClick={onClose}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold rounded-lg transition cursor-pointer"
            >
              ✕ Close
            </button>
          </div>
        </div>

        {/* Scrollable Printable Document Canvas */}
        <div className="overflow-y-auto p-6 sm:p-10 bg-slate-100 flex justify-center print:bg-white print:p-0 print:overflow-visible">
          <div
            ref={printRef}
            className="printable-doc bg-white w-full max-w-[210mm] min-h-[297mm] p-8 sm:p-12 shadow-md print:shadow-none border border-slate-300 print:border-none rounded-lg print:rounded-none text-slate-800 font-serif leading-relaxed"
          >
            {/* Government Emblem & Header Pattern */}
            <div className="border-b-2 border-slate-900 pb-5 text-center relative">
              <div className="flex justify-between items-start text-xs font-mono text-slate-500 mb-2">
                <span>REF: NDMA/SDMA/REL/{plan.district?.toUpperCase() || 'IND'}/{planId.slice(-6).toUpperCase()}</span>
                <span>SECURITY: OFFICIAL USE ONLY</span>
              </div>

              <div className="mx-auto w-12 h-12 mb-2 flex items-center justify-center rounded-full bg-slate-900 text-white font-bold text-lg font-sans shadow-sm">
                🏛️
              </div>
              <h1 className="text-lg sm:text-xl font-bold uppercase tracking-wider text-slate-900">
                Government of India / State Disaster Management Authority
              </h1>
              <p className="text-xs font-sans uppercase tracking-widest text-slate-600 font-semibold mt-0.5">
                District Disaster Management Authority (DDMA) · {plan.district || district}, {plan.state || 'India'}
              </p>
              <div className="mt-3 inline-block bg-slate-900 text-white font-sans text-xs font-bold uppercase tracking-widest px-4 py-1 rounded">
                Executive Relocation &amp; Evacuation Directive
              </div>
            </div>

            {/* Directive Metadata Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-5 py-3 px-4 bg-slate-50 border border-slate-200 rounded font-sans text-xs">
              <div>
                <span className="text-slate-500 block uppercase text-[10px] font-bold">Issue Date</span>
                <span className="font-semibold text-slate-800">{issueDate}</span>
              </div>
              <div>
                <span className="text-slate-500 block uppercase text-[10px] font-bold">Time of Issue</span>
                <span className="font-semibold text-slate-800">{issueTime} IST</span>
              </div>
              <div>
                <span className="text-slate-500 block uppercase text-[10px] font-bold">Risk Tier</span>
                <span className={`font-bold ${
                  plan.riskClass === 'RED' ? 'text-red-700' :
                  plan.riskClass === 'ORANGE' ? 'text-orange-700' : 'text-amber-700'
                }`}>
                  {plan.riskClass} ALERT (Score: {plan.riskScore}/100)
                </span>
              </div>
              <div>
                <span className="text-slate-500 block uppercase text-[10px] font-bold">Execution Status</span>
                <span className="font-bold text-slate-900 capitalize">{plan.status?.replace('_', ' ') || 'Proposed'}</span>
              </div>
            </div>

            {/* SECTION 1: HABITATION DEMOGRAPHICS */}
            <div className="mb-6 font-sans">
              <h2 className="text-sm font-bold uppercase text-slate-900 border-b border-slate-300 pb-1 mb-3 flex items-center gap-1.5 font-sans">
                <span>1.</span> <span>Target Habitation &amp; Vulnerability Profile</span>
              </h2>
              <table className="w-full text-xs border border-slate-300">
                <tbody>
                  <tr className="border-b border-slate-200">
                    <td className="p-2.5 bg-slate-50 font-semibold text-slate-600 w-1/3">Habitation Name:</td>
                    <td className="p-2.5 font-bold text-slate-900">{plan.habitationName}</td>
                    <td className="p-2.5 bg-slate-50 font-semibold text-slate-600 w-1/4">Jurisdiction:</td>
                    <td className="p-2.5 text-slate-800">{plan.district}, {plan.state}</td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="p-2.5 bg-slate-50 font-semibold text-slate-600">Total Population:</td>
                    <td className="p-2.5 font-semibold text-slate-800">{plan.populationToRelocate?.toLocaleString()} persons</td>
                    <td className="p-2.5 bg-slate-50 font-semibold text-slate-600">Total Households:</td>
                    <td className="p-2.5 text-slate-800">{plan.householdsToRelocate?.toLocaleString() || '—'} families</td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="p-2.5 bg-slate-50 font-semibold text-slate-600">Vulnerable Requiring Shelter:</td>
                    <td className="p-2.5 font-bold text-red-700">{plan.populationNeedingShelter?.toLocaleString()} persons</td>
                    <td className="p-2.5 bg-slate-50 font-semibold text-slate-600">Feasibility Rating:</td>
                    <td className="p-2.5 font-bold text-emerald-700">{plan.feasibility || 0}% Operational</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* SECTION 2: SAFE SITE ALLOCATIONS */}
            <div className="mb-6 font-sans">
              <h2 className="text-sm font-bold uppercase text-slate-900 border-b border-slate-300 pb-1 mb-3 flex items-center gap-1.5 font-sans">
                <span>2.</span> <span>Designated Safe Sites &amp; Transit Logistics Allocations</span>
              </h2>
              <table className="w-full text-xs border border-slate-300 text-left">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-300 text-slate-700 font-bold">
                    <th className="p-2">#</th>
                    <th className="p-2">Allocated Safe Shelter</th>
                    <th className="p-2">Allocated Pax</th>
                    <th className="p-2">Road Distance</th>
                    <th className="p-2">Transit ETA</th>
                    <th className="p-2">Transit Mode</th>
                  </tr>
                </thead>
                <tbody>
                  {(plan.assignments || []).length > 0 ? (
                    plan.assignments.map((a, idx) => (
                      <tr key={idx} className="border-b border-slate-200">
                        <td className="p-2 font-mono text-slate-500">{idx + 1}</td>
                        <td className="p-2 font-bold text-slate-900">🏕️ {a.safeSiteName}</td>
                        <td className="p-2 font-bold text-slate-800">{a.assignedPopulation?.toLocaleString()} people</td>
                        <td className="p-2 text-slate-700">{a.distanceKm} km</td>
                        <td className="p-2 text-slate-700">~{a.etaMinutes} min</td>
                        <td className="p-2 text-slate-700 capitalize">{a.transitMode || 'Road convoy'}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="p-4 text-center text-slate-500 italic">
                        No immediate safe sites matched within range. Urgent regional shelter allocation required.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {plan.unallocatedPopulation > 0 && (
                <div className="mt-2.5 p-2.5 bg-red-50 border border-red-200 rounded text-xs text-red-800 flex items-center gap-2">
                  <span>⚠️</span>
                  <span>
                    <strong>Capacity Deficit Warning:</strong> {plan.unallocatedPopulation?.toLocaleString()} individuals cannot be accommodated in designated local sites and require transit to secondary district shelters.
                  </span>
                </div>
              )}
            </div>

            {/* SECTION 3: DIRECTIVES & RECOMMENDED ACTIONS */}
            <div className="mb-6 font-sans">
              <h2 className="text-sm font-bold uppercase text-slate-900 border-b border-slate-300 pb-1 mb-3 flex items-center gap-1.5 font-sans">
                <span>3.</span> <span>Standard Operating Directives &amp; Action Protocol</span>
              </h2>
              <ol className="text-xs text-slate-800 list-decimal list-inside space-y-1.5 leading-relaxed bg-slate-50 p-4 border border-slate-200 rounded">
                {(plan.recommendedActions || []).length > 0 ? (
                  plan.recommendedActions.map((action, i) => (
                    <li key={i} className="font-medium text-slate-800">
                      {action}
                    </li>
                  ))
                ) : (
                  <>
                    <li>Immediate notification of Village Disaster Management Committee (VDMC) and ward members.</li>
                    <li>Mobilize civil defense vehicles and ambulances along verified disaster-free access corridors.</li>
                    <li>Execute prioritized relocation for elderly, infant, pregnant, and disabled individuals.</li>
                    <li>Establish safe-haven medical triage, water sanitation, and supply continuity at designated safe sites.</li>
                  </>
                )}
              </ol>
            </div>

            {/* SECTION 4: ADMINISTRATIVE SIGN-OFF */}
            <div className="mt-10 pt-6 border-t-2 border-slate-900 font-sans grid grid-cols-2 gap-8 text-xs">
              <div>
                <p className="font-bold text-slate-800 uppercase">Prepared &amp; Verified By:</p>
                <div className="h-12 flex items-end">
                  <span className="font-serif italic text-slate-600 underline">
                    {plan.createdBy || 'BhuDan AI Decision Engine / DDMA Analyst'}
                  </span>
                </div>
                <p className="text-slate-500 text-[11px] mt-1">
                  National Disaster Analytics System · BhuDan SIH 2026
                </p>
              </div>

              <div className="text-right">
                <p className="font-bold text-slate-800 uppercase">Approved by District Authority:</p>
                <div className="h-12 flex items-end justify-end">
                  <div className="border border-dashed border-slate-400 px-3 py-1 text-[11px] font-bold text-slate-700 rounded uppercase">
                    {plan.approvedBy ? `SEALED & SIGNED: ${plan.approvedBy}` : 'PENDING FINAL DDMA SIGNATURE'}
                  </div>
                </div>
                <p className="text-slate-500 text-[11px] mt-1">
                  District Collector &amp; DDMA Magistrate
                </p>
              </div>
            </div>

            {/* Document Footer */}
            <div className="mt-8 pt-3 border-t border-slate-200 text-center text-[10px] font-mono text-slate-400 flex justify-between print:mt-12">
              <span>BhuDan Disaster Decision Support Platform</span>
              <span>Generated from MongoDB Persistence Store</span>
              <span>Page 1 of 1</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
