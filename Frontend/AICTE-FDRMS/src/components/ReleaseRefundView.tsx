import React, { useState } from 'react';
import {
  ArrowUpRightSquare,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Clock,
  Landmark,
  X,
  FileCheck,
  Send,
  AlertCircle
} from 'lucide-react';
import { ReleaseRefundCase, FdrInstrument, InternalUser, CaseStatus } from '../types';
import { api } from '../services/api';
import { formatInr, formatInrCompact, formatDate, getCaseStatusBadge } from '../utils/formatters';

interface ReleaseRefundViewProps {
  cases: ReleaseRefundCase[];
  fdrs: FdrInstrument[];
  currentUser: InternalUser;
  onRefresh: () => void;
  targetCase?: ReleaseRefundCase | null;
}

export const ReleaseRefundView: React.FC<ReleaseRefundViewProps> = ({
  cases,
  fdrs,
  currentUser,
  onRefresh,
  targetCase
}) => {
  const [selectedCaseId, setSelectedCaseId] = useState<string>(
    targetCase ? targetCase.id : cases.length > 0 ? cases[0].id : ''
  );

  const selectedCase = cases.find((c) => c.id === selectedCaseId) || cases[0];

  // Scrutiny checklist & recommendation state
  const [checklist, setChecklist] = useState<Record<string, boolean>>({});
  const [recommendation, setRecommendation] = useState<string>('RECOMMENDED_FOR_RELEASE');
  const [reviewerNotes, setReviewerNotes] = useState<string>('');
  const [isSavingScrutiny, setIsSavingScrutiny] = useState(false);

  // Authority Decision Modal State
  const [showDecisionModal, setShowDecisionModal] = useState(false);
  const [authorityDecision, setAuthorityDecision] = useState('APPROVED');
  const [sanctionOrderNo, setSanctionOrderNo] = useState('');
  const [authorityRemarks, setAuthorityRemarks] = useState('');
  const [decisionDate, setDecisionDate] = useState(new Date().toISOString().substring(0, 10));

  // Discharge Completion Modal State
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [dischargeCertNo, setDischargeCertNo] = useState('');
  const [dispatchRef, setDispatchRef] = useState('');
  const [completionRemarks, setCompletionRemarks] = useState('');
  const [completionDate, setCompletionDate] = useState(new Date().toISOString().substring(0, 10));

  // Create Case Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCaseFdrId, setNewCaseFdrId] = useState('');
  const [newCaseReason, setNewCaseReason] = useState('TENURE_COMPLETION_8_YEARS');
  const [newCaseLetterRef, setNewCaseLetterRef] = useState('');

  React.useEffect(() => {
    if (selectedCase) {
      setChecklist(selectedCase.complianceChecklist || {
        tenureCompleted: false,
        noOutstandingLiabilities: false,
        originalFdrSurrendered: false,
        courtCaseClearance: false,
        stateNocReceived: false
      });
      setRecommendation(selectedCase.scrutinyRecommendation || 'RECOMMENDED_FOR_RELEASE');
      setReviewerNotes(selectedCase.reviewerNotes || '');
    }
  }, [selectedCase?.id]);

  const handleSaveScrutiny = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCase) return;
    setIsSavingScrutiny(true);
    try {
      await api.updateReleaseScrutiny(selectedCase.id, checklist, recommendation, reviewerNotes);
      onRefresh();
      alert('Scrutiny review & recommendation saved successfully.');
    } catch (err) {
      console.error(err);
      alert('Failed to save scrutiny review');
    } finally {
      setIsSavingScrutiny(false);
    }
  };

  const handleSaveDecision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCase) return;
    try {
      await api.recordAuthorityDecision(
        selectedCase.id,
        authorityDecision,
        sanctionOrderNo,
        authorityRemarks,
        decisionDate
      );
      setShowDecisionModal(false);
      onRefresh();
      alert(`Competent Authority decision (${authorityDecision}) recorded successfully.`);
    } catch (err) {
      console.error(err);
      alert('Failed to record authority decision');
    }
  };

  const handleSaveCompletion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCase) return;
    try {
      await api.recordReleaseCompletion(
        selectedCase.id,
        dischargeCertNo,
        dispatchRef,
        completionRemarks,
        completionDate
      );
      setShowCompleteModal(false);
      onRefresh();
      alert('Official discharge & release completion recorded successfully.');
    } catch (err) {
      console.error(err);
      alert('Failed to record release completion');
    }
  };

  const handleCreateCase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCaseFdrId) {
      alert('Please select an active FDR');
      return;
    }
    try {
      await api.createReleaseCase({
        fdrId: newCaseFdrId,
        requestReason: newCaseReason,
        institutionLetterRef: newCaseLetterRef
      });
      setShowCreateModal(false);
      onRefresh();
      alert('Release & refund case registered successfully.');
    } catch (err) {
      console.error(err);
      alert('Failed to initiate release case');
    }
  };

  if (!selectedCase) {
    return (
      <div className="p-12 text-center text-slate-400">
        No release or refund cases recorded.
      </div>
    );
  }

  const isAllChecklistPassed = Object.values(checklist).every(Boolean);

  return (
    <div className="space-y-6">
      {/* Strict Scope Notice Banner */}
      <div className="p-4 bg-slate-900 border border-slate-700 text-slate-200 rounded-xl text-xs flex items-start gap-3 shadow-xs">
        <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <div className="font-bold text-amber-300 uppercase tracking-wider text-[11px]">
            AICTE Regulatory Scope Guardrail • Administrative Tracking Only
          </div>
          <p className="mt-0.5 text-slate-300 leading-relaxed text-[11px]">
            FDRMS records administrative scrutiny observations, Competent Authority sanction orders, and formal discharge certificates. <strong>Under no circumstances does this portal initiate banking wire transfers, electronic disbursements, or fund movements.</strong> Financial settlement occurs strictly outside this portal via authorized government banking channels.
          </p>
        </div>
      </div>

      {/* Header Bar */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg font-bold text-[#0f2e5a] flex items-center gap-2">
            <ArrowUpRightSquare className="w-5 h-5 text-purple-700" />
            Security Deposit Release, Discharge & Refund Case Desk
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            5-point regulatory compliance verification, Competent Authority approval orders, and discharge handover records.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setNewCaseFdrId(fdrs.length > 0 ? fdrs[0].id : '');
              setShowCreateModal(true);
            }}
            className="px-4 py-2 bg-[#0f2e5a] hover:bg-[#1e3a8a] text-white font-bold text-xs rounded-lg transition shadow-xs"
          >
            Initiate Release Request Case
          </button>
        </div>
      </div>

      {/* Case Selector Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {cases.map((c) => {
          const isSelected = c.id === selectedCase.id;
          const badge = getCaseStatusBadge(c.caseStatus);
          return (
            <button
              key={c.id}
              onClick={() => setSelectedCaseId(c.id)}
              className={`px-4 py-3 rounded-xl border text-left min-w-[260px] transition shrink-0 ${
                isSelected
                  ? 'bg-white border-blue-600 shadow-md ring-2 ring-blue-500/20'
                  : 'bg-white/80 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className="flex justify-between items-center text-[10px]">
                <span className="font-mono font-bold text-blue-900">{c.id}</span>
                <span className={`px-2 py-0.2 rounded-full font-bold border ${badge.bg} ${badge.text} ${badge.border}`}>
                  {badge.label}
                </span>
              </div>
              <div className="font-bold text-xs text-slate-800 mt-1 truncate" title={c.institutionName}>
                {c.institutionName}
              </div>
              <div className="flex justify-between items-center text-[11px] text-slate-500 mt-1">
                <span>Amount: <strong className="text-slate-800">{formatInr(c.amount)}</strong></span>
                <span className="font-mono">{formatDate(c.requestDate)}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Case Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Case Scrutiny & Compliance Review */}
        <div className="lg:col-span-2 space-y-6">
          {/* Case Overview Card */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex justify-between items-start pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase font-mono">
                  CASE DOSSIER: {selectedCase.id}
                </span>
                <h3 className="text-base font-extrabold text-[#0f2e5a] mt-0.5">
                  {selectedCase.institutionName}
                </h3>
                <p className="text-xs text-slate-500">
                  AICTE Institute ID: <span className="font-mono font-bold text-slate-700">{selectedCase.institutionAicteId}</span>
                </p>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-slate-500 block uppercase font-semibold">Security Deposit Sum</span>
                <span className="text-xl font-extrabold text-purple-900 block mt-0.5">
                  {formatInr(selectedCase.amount)}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">FDR No: {selectedCase.fdrNumber}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-slate-50 p-3.5 rounded-lg border border-slate-200">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500">Refund Category</span>
                <div className="font-bold text-slate-800 mt-0.5">
                  {selectedCase.requestReason.replace(/_/g, ' ')}
                </div>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500">Institution Letter Ref</span>
                <div className="font-mono font-bold text-slate-800 mt-0.5">
                  {selectedCase.institutionLetterRef || 'N/A'}
                </div>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500">Receipt Date</span>
                <div className="font-mono text-slate-700 mt-0.5">
                  {formatDate(selectedCase.requestDate)}
                </div>
              </div>
            </div>
          </div>

          {/* 5-Point Regulatory Compliance Checklist */}
          <form onSubmit={handleSaveScrutiny} className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <FileCheck className="w-4 h-4 text-blue-700" />
                5-Point Regulatory Compliance Verification Checklist
              </h4>
              <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${isAllChecklistPassed ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                {isAllChecklistPassed ? 'All 5 Criteria Fulfilled' : 'Verification Incomplete'}
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <label className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer transition">
                <input
                  type="checkbox"
                  checked={checklist.tenureCompleted || false}
                  onChange={(e) => setChecklist({ ...checklist, tenureCompleted: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded mt-0.5"
                />
                <div>
                  <div className="font-bold text-slate-800">1. Mandatory Moratorium / Tenure Completion</div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Institution has maintained the security deposit for the prescribed statutory period (8-10 years) without premature withdrawal.
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer transition">
                <input
                  type="checkbox"
                  checked={checklist.noOutstandingLiabilities || false}
                  onChange={(e) => setChecklist({ ...checklist, noOutstandingLiabilities: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded mt-0.5"
                />
                <div>
                  <div className="font-bold text-slate-800">2. No Outstanding AICTE Penalties / Regulatory Liabilities</div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Clearance from AICTE Finance & Approval Bureau confirming zero pending compliance fees, penalty demands, or student grievances.
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer transition">
                <input
                  type="checkbox"
                  checked={checklist.originalFdrSurrendered || false}
                  onChange={(e) => setChecklist({ ...checklist, originalFdrSurrendered: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded mt-0.5"
                />
                <div>
                  <div className="font-bold text-slate-800">3. Physical Surrender of Original Deposit Leaf / Receipt</div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Original FDR receipt leaf physically surrendered to the Regional Office for official cancellation and endorsement discharge.
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer transition">
                <input
                  type="checkbox"
                  checked={checklist.courtCaseClearance || false}
                  onChange={(e) => setChecklist({ ...checklist, courtCaseClearance: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded mt-0.5"
                />
                <div>
                  <div className="font-bold text-slate-800">4. Legal & Court Case Non-Involvement Clearance</div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Affidavit confirmed; no pending writ petition, stay order, or judicial restraint regarding institution operations or bank accounts.
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer transition">
                <input
                  type="checkbox"
                  checked={checklist.stateNocReceived || false}
                  onChange={(e) => setChecklist({ ...checklist, stateNocReceived: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded mt-0.5"
                />
                <div>
                  <div className="font-bold text-slate-800">5. State Government / Affiliating University NOC</div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    No-Objection Certificate received from State Technical Directorate / Affiliating University where required under Approval Process Handbook.
                  </p>
                </div>
              </label>
            </div>

            {/* Scrutiny Officer Recommendation */}
            <div className="pt-3 border-t border-slate-200 space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Scrutiny Officer Formal Recommendation
                </label>
                <select
                  value={recommendation}
                  onChange={(e) => setRecommendation(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-bold"
                >
                  <option value="RECOMMENDED_FOR_RELEASE">RECOMMENDED FOR SANCTION (Eligible for Release)</option>
                  <option value="RECOMMENDED_FOR_REJECTION">RECOMMENDED FOR REJECTION (Non-Compliant)</option>
                  <option value="MORE_INFO_NEEDED">MORE INFORMATION NEEDED (Refer Back to Institution)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Scrutiny Notes & Justification
                </label>
                <textarea
                  rows={3}
                  placeholder="Record formal scrutiny observations, verification findings, and justification for recommendation..."
                  value={reviewerNotes}
                  onChange={(e) => setReviewerNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSavingScrutiny}
                  className="px-4 py-2 bg-[#0f2e5a] hover:bg-[#1e3a8a] text-white font-bold rounded-lg shadow-xs flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSavingScrutiny ? 'Saving...' : 'Update Scrutiny Recommendation'}</span>
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Right 1 Col: Authority Decision & Discharge Execution */}
        <div className="space-y-6">
          {/* Competent Authority Action Card */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-purple-700" />
              Competent Authority Formal Sanction
            </h4>

            {selectedCase.authorityDecision && selectedCase.authorityDecision !== 'PENDING' ? (
              <div className="p-4 rounded-lg bg-purple-50/60 border border-purple-200 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-purple-950 uppercase text-[10px]">Decision Recorded:</span>
                  <span className={`px-2 py-0.5 rounded font-extrabold ${
                    selectedCase.authorityDecision === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {selectedCase.authorityDecision}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">Sanction Order Number:</span>
                  <span className="font-mono font-bold text-slate-900">{selectedCase.sanctionOrderNumber || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">Sanction Remarks:</span>
                  <p className="text-slate-700 italic mt-0.5">{selectedCase.authorityRemarks || 'None'}</p>
                </div>
                <div className="pt-2 border-t border-purple-200/60 text-[10px] text-slate-500 flex justify-between">
                  <span>Authorized by: {selectedCase.authorizedBy}</span>
                  <span>{selectedCase.decisionDate}</span>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-center text-xs space-y-2">
                <Clock className="w-6 h-6 mx-auto text-slate-400" />
                <div className="font-bold text-slate-700">Awaiting Competent Authority Sanction</div>
                <p className="text-[11px] text-slate-500">
                  Case requires formal approval decision by Director / Regional Committee.
                </p>

                {currentUser.role === 'ROLE_APPROVER' || currentUser.role === 'ROLE_ADMIN' ? (
                  <button
                    onClick={() => {
                      setSanctionOrderNo(`AICTE/REG/SAN/${new Date().getFullYear()}/${String(cases.length + 1).padStart(3, '0')}`);
                      setShowDecisionModal(true);
                    }}
                    className="w-full mt-2 py-2 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-lg transition shadow-xs"
                  >
                    Record Approval Decision
                  </button>
                ) : (
                  <div className="text-[10px] text-amber-700 font-semibold p-2 bg-amber-50 rounded border border-amber-200">
                    Your current role ({currentUser.role.replace('ROLE_', '')}) can review scrutiny; authorization requires Competent Authority (ROLE_APPROVER).
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Discharge Certificate & Handover Recording */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              Administrative Discharge Execution
            </h4>

            {selectedCase.caseStatus === 'COMPLETED' ? (
              <div className="p-4 rounded-lg bg-emerald-50/60 border border-emerald-200 space-y-2 text-xs">
                <span className="font-bold text-emerald-950 uppercase text-[10px] block">Discharge Completed:</span>
                <div>
                  <span className="text-slate-500 text-[10px] block">Discharge Certificate No:</span>
                  <span className="font-mono font-bold text-slate-900">{selectedCase.dischargeCertificateNo}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">Dispatch Reference:</span>
                  <span className="font-mono text-slate-800">{selectedCase.dispatchReference}</span>
                </div>
                <div className="pt-2 border-t border-emerald-200 text-[10px] text-slate-500 flex justify-between">
                  <span>Completed by: {selectedCase.completedBy}</span>
                  <span>{selectedCase.releaseCompletionDate}</span>
                </div>
              </div>
            ) : selectedCase.authorityDecision === 'APPROVED' ? (
              <div className="p-4 bg-emerald-50/30 rounded-lg border border-emerald-200 text-center text-xs space-y-2">
                <CheckCircle2 className="w-6 h-6 mx-auto text-emerald-600" />
                <div className="font-bold text-slate-800">Sanction Approved • Ready for Discharge</div>
                <p className="text-[11px] text-slate-500">
                  Issue formal AICTE Discharge Order and return canceled deposit leaf to institution.
                </p>
                <button
                  onClick={() => {
                    setDischargeCertNo(`AICTE/DIS/${new Date().getFullYear()}/${String(cases.length + 1).padStart(3, '0')}`);
                    setShowCompleteModal(true);
                  }}
                  className="w-full mt-2 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg transition shadow-xs"
                >
                  Record Official Discharge Handover
                </button>
              </div>
            ) : (
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-center text-xs text-slate-400">
                Discharge handover can only be executed after Competent Authority approval sanction.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Decision Recording Modal */}
      {showDecisionModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg p-6 space-y-4 text-xs">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-[#0f2e5a]">
                Record Competent Authority Sanction Decision
              </h3>
              <button onClick={() => setShowDecisionModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDecision} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Decision Outcome <span className="text-red-500">*</span></label>
                <select
                  value={authorityDecision}
                  onChange={(e) => setAuthorityDecision(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-bold"
                >
                  <option value="APPROVED">APPROVED (Formal Sanction Granted)</option>
                  <option value="REJECTED">REJECTED (Release Denied)</option>
                  <option value="REFERRED_BACK">REFERRED BACK (More Scrutiny Required)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Sanction / Decision Order Number <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AICTE/REG/SAN/2026/042"
                  value={sanctionOrderNo}
                  onChange={(e) => setSanctionOrderNo(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Decision Date</label>
                <input
                  type="date"
                  value={decisionDate}
                  onChange={(e) => setDecisionDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Formal Authority Remarks</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Record authority reasoning and statutory references under Approval Process Handbook Chapter IV..."
                  value={authorityRemarks}
                  onChange={(e) => setAuthorityRemarks(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowDecisionModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-700 text-white rounded-lg font-bold hover:bg-purple-800"
                >
                  Record Formal Sanction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Discharge Completion Modal */}
      {showCompleteModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg p-6 space-y-4 text-xs">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-[#0f2e5a]">
                Record Release & Discharge Execution
              </h3>
              <button onClick={() => setShowCompleteModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCompletion} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Discharge Certificate Number <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AICTE/DIS/2026/042"
                  value={dischargeCertNo}
                  onChange={(e) => setDischargeCertNo(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Dispatch / Handover Reference <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Handover in person to Principal / Speed Post SP-DL-2026-99"
                  value={dispatchRef}
                  onChange={(e) => setDispatchRef(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Release Completion Date</label>
                <input
                  type="date"
                  value={completionDate}
                  onChange={(e) => setCompletionDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Completion Remarks</label>
                <textarea
                  rows={2}
                  placeholder="Note bank lien release notification dispatched to branch manager..."
                  value={completionRemarks}
                  onChange={(e) => setCompletionRemarks(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowCompleteModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 text-white rounded-lg font-bold hover:bg-emerald-800"
                >
                  Complete Discharge Case
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Case Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg p-6 space-y-4 text-xs">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-[#0f2e5a]">
                Initiate New Release / Refund Case
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCase} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Select Instrument <span className="text-red-500">*</span></label>
                <select
                  required
                  value={newCaseFdrId}
                  onChange={(e) => setNewCaseFdrId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-semibold"
                >
                  <option value="">Select FDR</option>
                  {fdrs
                    .filter((f) => f.instrumentStatus !== 'RELEASED' && f.instrumentStatus !== 'RENEWED')
                    .map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.fdrNumber} — {f.institutionName} ({formatInrCompact(f.amount)})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Release Reason / Category</label>
                <select
                  value={newCaseReason}
                  onChange={(e) => setNewCaseReason(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="TENURE_COMPLETION_8_YEARS">Tenure Completion (8-10 Years)</option>
                  <option value="COURSE_CLOSURE">Approved Course / Program Closure</option>
                  <option value="INSTITUTION_CLOSURE">Approved Institution Closure</option>
                  <option value="SUBSTITUTION_WITH_BG">Substitution with Bank Guarantee</option>
                  <option value="EXCESS_DEPOSIT_REFUND">Excess Deposit Adjustment / Refund</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Institution Letter / Reference No.</label>
                <input
                  type="text"
                  placeholder="e.g. DITM/REG/REFUND/2026/01"
                  value={newCaseLetterRef}
                  onChange={(e) => setNewCaseLetterRef(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0f2e5a] text-white rounded-lg font-bold hover:bg-[#1e3a8a]"
                >
                  Register Release Case
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
