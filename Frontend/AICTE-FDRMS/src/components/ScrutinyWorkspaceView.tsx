import React, { useState } from 'react';
import {
  FileCheck2,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Landmark,
  FileText,
  ShieldAlert,
  Send,
  Building,
  Calendar,
  X,
  AlertCircle
} from 'lucide-react';
import {
  FdrInstrument,
  InternalUser,
  ScrutinyObservation,
  ScrutinyVerificationRecord,
  ScrutinySeverity
} from '../types';
import { api } from '../services/api';
import { formatInr, formatInrCompact, formatDate, getInstrumentStatusBadge, getVerificationStatusBadge } from '../utils/formatters';

interface ScrutinyWorkspaceViewProps {
  fdrs: FdrInstrument[];
  currentUser: InternalUser;
  onRefresh: () => void;
  targetFdr?: FdrInstrument | null;
}

export const ScrutinyWorkspaceView: React.FC<ScrutinyWorkspaceViewProps> = ({
  fdrs,
  currentUser,
  onRefresh,
  targetFdr
}) => {
  const [selectedFdrId, setSelectedFdrId] = useState<string>(
    targetFdr ? targetFdr.id : fdrs.length > 0 ? fdrs[0].id : ''
  );

  const selectedFdr = fdrs.find((f) => f.id === selectedFdrId) || fdrs[0];

  const [verifications, setVerifications] = useState<ScrutinyVerificationRecord[]>([]);
  const [observations, setObservations] = useState<ScrutinyObservation[]>([]);

  // Verification modal state
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verifForm, setVerifForm] = useState({
    verificationMethod: 'OFFICIAL_BANK_LETTER',
    verificationSource: '',
    referenceNumber: '',
    verificationDate: new Date().toISOString().substring(0, 10),
    result: 'VERIFIED',
    confirmedAmount: selectedFdr ? selectedFdr.amount : 0,
    confirmedMaturityDate: selectedFdr ? selectedFdr.maturityDate : '',
    confirmedLienStatus: true,
    discrepancyDetails: '',
    remarks: '',
    supportingDocumentTitle: ''
  });

  // Observation form state
  const [obsCategory, setObsCategory] = useState('LIEN_ENDORSEMENT_MISSING');
  const [obsSeverity, setObsSeverity] = useState<ScrutinySeverity>('HIGH');
  const [obsText, setObsText] = useState('');
  const [obsFollowUp, setObsFollowUp] = useState(true);
  const [obsActionRequired, setObsActionRequired] = useState('');

  // Fetch verifications & observations for selected FDR
  const loadFdrScrutiny = async (id: string) => {
    if (!id) return;
    try {
      const [v, o] = await Promise.all([api.getVerifications(id), api.getObservations(id)]);
      setVerifications(v);
      setObservations(o);
    } catch (err) {
      console.error(err);
    }
  };

  React.useEffect(() => {
    if (selectedFdr) {
      loadFdrScrutiny(selectedFdr.id);
      setVerifForm((prev) => ({
        ...prev,
        confirmedAmount: selectedFdr.amount,
        confirmedMaturityDate: selectedFdr.maturityDate,
        confirmedLienStatus: selectedFdr.jointLienMarked
      }));
    }
  }, [selectedFdr?.id]);

  const handleRecordVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFdr) return;
    try {
      await api.recordVerification({
        ...verifForm,
        fdrId: selectedFdr.id,
        verifiedBy: currentUser.email
      });
      setShowVerifyModal(false);
      loadFdrScrutiny(selectedFdr.id);
      onRefresh();
      alert('Verification record saved successfully.');
    } catch (err) {
      console.error(err);
      alert('Failed to record verification');
    }
  };

  const handleAddObservation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFdr || !obsText.trim()) return;
    try {
      await api.recordObservation({
        fdrId: selectedFdr.id,
        category: obsCategory,
        severity: obsSeverity,
        observation: obsText,
        followUpRequired: obsFollowUp,
        actionRequired: obsActionRequired,
        recordedBy: currentUser.email
      });
      setObsText('');
      setObsActionRequired('');
      loadFdrScrutiny(selectedFdr.id);
      onRefresh();
    } catch (err) {
      console.error(err);
      alert('Failed to log observation');
    }
  };

  const handleResolveObservation = async (id: string) => {
    const notes = prompt('Enter resolution notes / evidence confirming resolution:');
    if (!notes) return;
    try {
      await api.resolveObservation(id, notes);
      loadFdrScrutiny(selectedFdr.id);
      onRefresh();
    } catch (err) {
      console.error(err);
      alert('Failed to resolve observation');
    }
  };

  if (!selectedFdr) {
    return (
      <div className="p-12 text-center text-slate-400">
        No FDR records available for scrutiny.
      </div>
    );
  }

  // Detect discrepancies between submitted details and latest verification
  const latestVerification = verifications.length > 0 ? verifications[0] : null;
  const isAmountMismatched =
    latestVerification && latestVerification.confirmedAmount !== selectedFdr.amount;
  const isLienMismatched =
    latestVerification && latestVerification.confirmedLienStatus !== selectedFdr.jointLienMarked;
  const isDateMismatched =
    latestVerification &&
    latestVerification.confirmedMaturityDate &&
    selectedFdr.maturityDate &&
    latestVerification.confirmedMaturityDate !== selectedFdr.maturityDate;

  return (
    <div className="space-y-6">
      {/* Official Standard Notice */}
      <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl text-amber-900 text-xs flex items-start gap-3 shadow-xs">
        <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div>
          <div className="font-bold text-amber-950 uppercase tracking-wider text-[11px]">
            AICTE Regulation Bureau • Verification Standard Notice
          </div>
          <p className="mt-0.5 text-[11px] leading-relaxed">
            Document upload, OCR extraction, or reviewer notes do NOT constitute independent bank confirmation. FDR genuineness and joint lien endorsements must be independently confirmed via authorized bank communication channels (official branch letter, official bank portal confirmation, or SFMS advice).
          </p>
        </div>
      </div>

      {/* Selector & Workspace Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg font-bold text-[#0f2e5a] flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-blue-700" />
            Official Scrutiny & Verification Workspace
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Side-by-side reconciliation of institution-provided records vs bank-confirmed details.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <label className="text-xs font-semibold text-slate-600 shrink-0">Select Instrument:</label>
          <select
            value={selectedFdr.id}
            onChange={(e) => setSelectedFdrId(e.target.value)}
            className="text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-800 font-bold focus:ring-2 focus:ring-blue-500 max-w-xs truncate"
          >
            {fdrs.map((f) => (
              <option key={f.id} value={f.id}>
                {f.fdrNumber} — {f.institutionName} ({formatInrCompact(f.amount)})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Side-by-Side Comparison Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Panel 1: Institution Submitted Details */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
          <div className="p-4 bg-slate-100 border-b border-slate-200 flex justify-between items-center">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Source A</span>
              <h3 className="text-sm font-bold text-slate-800">Institution Provided FDR Leaf Record</h3>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-medium">
              Submitted Document Copy
            </span>
          </div>

          <div className="p-5 space-y-3.5 flex-1 text-xs">
            <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Institution Name:</span>
              <span className="font-bold text-slate-800 text-right">{selectedFdr.institutionName}</span>
            </div>

            <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
              <span className="text-slate-500">AICTE Permanent ID:</span>
              <span className="font-mono font-bold text-blue-900">{selectedFdr.institutionAicteId}</span>
            </div>

            <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
              <span className="text-slate-500">FDR Leaf Number:</span>
              <span className="font-mono font-bold text-slate-900 text-sm">{selectedFdr.fdrNumber}</span>
            </div>

            <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Deposit Amount:</span>
              <span className="font-extrabold text-[#0f2e5a] text-sm">{formatInr(selectedFdr.amount)}</span>
            </div>

            <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Issuing Bank & Branch:</span>
              <div className="text-right">
                <span className="font-bold text-slate-800 block">{selectedFdr.bankName}</span>
                <span className="text-[11px] text-slate-500 block">{selectedFdr.branchName}</span>
              </div>
            </div>

            <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Maturity Date:</span>
              <span className="font-mono font-bold text-slate-800">{formatDate(selectedFdr.maturityDate)}</span>
            </div>

            <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
              <span className="text-slate-500">AICTE Joint Lien Claimed:</span>
              <span className={selectedFdr.jointLienMarked ? 'font-bold text-emerald-700' : 'font-bold text-red-600'}>
                {selectedFdr.jointLienMarked ? 'Yes (Marked on Leaf)' : 'No (Missing on Leaf)'}
              </span>
            </div>

            <div className="flex justify-between items-center py-1.5">
              <span className="text-slate-500">Joint Account Holder Name:</span>
              <span className="font-medium text-slate-700 text-right">{selectedFdr.jointHolderName || 'N/A'}</span>
            </div>
          </div>

          <div className="p-3 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-500">
            Compliance Ref: <span className="font-mono font-semibold text-slate-700">{selectedFdr.complianceReference}</span>
          </div>
        </div>

        {/* Panel 2: Authorized Independent Bank Confirmation */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
          <div className="p-4 bg-blue-50/70 border-b border-blue-200 flex justify-between items-center">
            <div>
              <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">Source B</span>
              <h3 className="text-sm font-bold text-[#0f2e5a]">Authorized Bank Confirmation Evidence</h3>
            </div>
            <button
              onClick={() => setShowVerifyModal(true)}
              className="px-3 py-1 bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded text-xs transition shadow-xs"
            >
              Record New Verification
            </button>
          </div>

          <div className="p-5 space-y-3.5 flex-1 text-xs">
            {latestVerification ? (
              <>
                <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Verification Outcome:</span>
                  <span className={`inline-block px-2.5 py-0.5 rounded-full font-bold uppercase text-[10px] ${
                    latestVerification.result === 'VERIFIED'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-red-100 text-red-800 border border-red-300'
                  }`}>
                    {latestVerification.result}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Authorized Verification Source:</span>
                  <span className="font-bold text-slate-800 text-right">{latestVerification.verificationSource}</span>
                </div>

                <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Bank Official Ref No:</span>
                  <span className="font-mono font-bold text-slate-900">{latestVerification.referenceNumber}</span>
                </div>

                <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Confirmed Amount:</span>
                  <div className="text-right">
                    <span className="font-extrabold text-[#0f2e5a] text-sm block">
                      {formatInr(latestVerification.confirmedAmount)}
                    </span>
                    {isAmountMismatched && (
                      <span className="text-[10px] text-red-600 font-bold">
                        Mismatch! (Submitted was {formatInr(selectedFdr.amount)})
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Confirmed Maturity Date:</span>
                  <div className="text-right">
                    <span className="font-mono font-bold text-slate-800 block">
                      {formatDate(latestVerification.confirmedMaturityDate)}
                    </span>
                    {isDateMismatched && (
                      <span className="text-[10px] text-red-600 font-bold">Date Inconsistency!</span>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Lien Registered in Bank CBS:</span>
                  <div className="text-right">
                    <span className={latestVerification.confirmedLienStatus ? 'font-bold text-emerald-700' : 'font-bold text-red-700'}>
                      {latestVerification.confirmedLienStatus ? 'Confirmed (AICTE Lien Noted)' : 'NO LIEN MARKED! (Unencumbered)'}
                    </span>
                    {isLienMismatched && (
                      <span className="text-[10px] text-red-600 font-bold block">
                        Critical: College claimed lien, but bank confirms NO lien!
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center py-1.5">
                  <span className="text-slate-500">Verified By / Date:</span>
                  <span className="font-medium text-slate-600">
                    {latestVerification.verifiedBy} ({formatDate(latestVerification.verificationDate)})
                  </span>
                </div>
              </>
            ) : (
              <div className="py-12 text-center text-slate-400">
                <AlertCircle className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                <p className="font-semibold text-slate-600">No independent bank verification recorded yet</p>
                <p className="text-[11px] text-slate-400 mt-1 max-w-xs mx-auto">
                  Click 'Record New Verification' once official confirmation letter or bank email is received.
                </p>
              </div>
            )}
          </div>

          <div className="p-3 bg-blue-50/40 border-t border-blue-100 text-[11px] flex justify-between items-center">
            <span className="text-slate-500">Method: {latestVerification?.verificationMethod || 'Pending'}</span>
            <span className="font-bold text-blue-900">Total Verification Attempts: {verifications.length}</span>
          </div>
        </div>
      </div>

      {/* Discrepancy Alert Bar if Any Detected */}
      {(isAmountMismatched || isLienMismatched || isDateMismatched || selectedFdr.flagDiscrepancy) && (
        <div className="p-4 bg-red-50 border-2 border-red-300 rounded-xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-700 shrink-0 mt-0.5" />
          <div className="text-xs">
            <h4 className="font-extrabold text-red-950 uppercase tracking-wide">
              Active Scrutiny Discrepancy Flagged
            </h4>
            <p className="text-red-900 mt-0.5 leading-relaxed">
              Inconsistencies detected between submitted deposit records and bank confirmation records. This instrument cannot be marked genuine or processed for release until rectified.
            </p>
          </div>
        </div>
      )}

      {/* Structured Scrutiny Observations Section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
        <h3 className="text-sm font-bold text-[#0f2e5a] flex items-center gap-2">
          <FileText className="w-4 h-4 text-blue-700" />
          Structured Scrutiny Observations & Discrepancy Log
        </h3>

        {/* Existing Observations */}
        <div className="space-y-3">
          {observations.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-400 bg-slate-50 rounded-lg border border-slate-200">
              No scrutiny observations logged yet for this instrument.
            </div>
          ) : (
            observations.map((obs) => (
              <div
                key={obs.id}
                className={`p-3.5 rounded-lg border text-xs ${
                  obs.resolved ? 'bg-slate-50 border-slate-200 opacity-80' : 'bg-red-50/40 border-red-200'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
                        obs.severity === 'CRITICAL'
                          ? 'bg-red-100 text-red-800 border-red-300'
                          : obs.severity === 'HIGH'
                          ? 'bg-orange-100 text-orange-800 border-orange-300'
                          : 'bg-amber-100 text-amber-800 border-amber-300'
                      }`}
                    >
                      {obs.severity} • {obs.category}
                    </span>
                    {obs.resolved ? (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
                        Resolved
                      </span>
                    ) : (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-bold border border-rose-300">
                        Pending Follow-Up
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">{obs.recordedAt}</span>
                </div>

                <p className="mt-2 text-xs font-semibold text-slate-800 leading-relaxed">
                  {obs.observation}
                </p>

                {obs.actionRequired && (
                  <div className="mt-2 p-2 rounded bg-white border border-slate-200 text-[11px] text-slate-700">
                    <span className="font-bold text-slate-900">Required Action:</span> {obs.actionRequired}
                  </div>
                )}

                {obs.resolved && obs.resolutionNotes && (
                  <div className="mt-2 p-2 rounded bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-900">
                    <span className="font-bold">Resolution Recorded:</span> {obs.resolutionNotes} (by {obs.resolvedBy} on {obs.resolvedAt})
                  </div>
                )}

                <div className="mt-3 flex justify-between items-center text-[10px] text-slate-400 pt-2 border-t border-slate-200/60">
                  <span>Logged by: {obs.recordedBy}</span>
                  {!obs.resolved && (
                    <button
                      onClick={() => handleResolveObservation(obs.id)}
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded text-[11px] transition shadow-2xs"
                    >
                      Mark Resolved
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Add Observation Form */}
        <form onSubmit={handleAddObservation} className="pt-4 border-t border-slate-200 space-y-3">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Record New Official Scrutiny Finding
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block font-bold text-slate-600 mb-1">Discrepancy / Observation Category</label>
              <select
                value={obsCategory}
                onChange={(e) => setObsCategory(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
              >
                <option value="LIEN_ENDORSEMENT_MISSING">Joint Lien Endorsement Missing</option>
                <option value="AMOUNT_MISMATCH">Amount Inconsistency</option>
                <option value="DATE_MISMATCH">Maturity Date Discrepancy</option>
                <option value="BANK_UNAUTHORIZED">Bank Branch Not Authorized / Unlisted</option>
                <option value="TITLE_DISCREPANCY">Name / Title Discrepancy</option>
                <option value="EXPIRED_DOCUMENT">Expired / Non-Renewed Leaf</option>
                <option value="GENERAL_INQUIRY">General Inquiry / Clarification</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-600 mb-1">Severity Rating</label>
              <select
                value={obsSeverity}
                onChange={(e) => setObsSeverity(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
              >
                <option value="CRITICAL">Critical (Blocks EoA / Regulatory Clearance)</option>
                <option value="HIGH">High (Action Overdue / Bank Notice Required)</option>
                <option value="MEDIUM">Medium (Follow-Up Clarification)</option>
                <option value="LOW">Low (Minor Documentation Defect)</option>
                <option value="INFO">Informational Only</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-600 mb-1">Observation Note</label>
            <textarea
              required
              rows={2}
              placeholder="State the exact discrepancy or finding noted upon physical or digital scrutiny..."
              value={obsText}
              onChange={(e) => setObsText(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-600 mb-1">Required Follow-Up Action</label>
            <input
              type="text"
              placeholder="e.g. Issue letter to Branch Manager and Institution Principal to submit fresh lien endorsement"
              value={obsActionRequired}
              onChange={(e) => setObsActionRequired(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-[#0f2e5a] hover:bg-[#1e3a8a] text-white font-bold text-xs rounded-lg transition shadow-xs flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Log Scrutiny Observation</span>
            </button>
          </div>
        </form>
      </div>

      {/* Record Verification Modal */}
      {showVerifyModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden">
            <div className="p-5 bg-[#0f2e5a] text-white flex justify-between items-center">
              <div>
                <h3 className="text-base font-bold">Record Independent Bank Verification</h3>
                <p className="text-xs text-blue-100 mt-0.5">
                  FDR: {selectedFdr.fdrNumber} • {selectedFdr.institutionName}
                </p>
              </div>
              <button onClick={() => setShowVerifyModal(false)} className="text-white/80 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordVerification} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Verification Method <span className="text-red-500">*</span></label>
                  <select
                    value={verifForm.verificationMethod}
                    onChange={(e) => setVerifForm({ ...verifForm, verificationMethod: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="OFFICIAL_BANK_LETTER">Official Bank Branch Letter</option>
                    <option value="OFFICIAL_BANK_EMAIL">Direct Official Bank Email</option>
                    <option value="BANK_PORTAL_CONFIRMATION">Issuing Bank Official Portal / API</option>
                    <option value="SFMS_BANK_ADVICE">SFMS Bank Confirmation Advice</option>
                    <option value="PHYSICAL_INSPECTION">Physical Inspection at Bank Branch</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Verification Result <span className="text-red-500">*</span></label>
                  <select
                    value={verifForm.result}
                    onChange={(e) => setVerifForm({ ...verifForm, result: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-bold"
                  >
                    <option value="VERIFIED">VERIFIED (Authentic & Valid)</option>
                    <option value="DISCREPANCY_FOUND">DISCREPANCY FOUND (Flag Case)</option>
                    <option value="UNABLE_TO_VERIFY">UNABLE TO VERIFY (No Response from Bank)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Verification Source / Bank Official <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Shri K. Ramanathan, Chief Manager, SBI Connaught Place"
                    value={verifForm.verificationSource}
                    onChange={(e) => setVerifForm({ ...verifForm, verificationSource: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Bank Reference / Letter Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SBI/CP/CONF/2026/9981"
                    value={verifForm.referenceNumber}
                    onChange={(e) => setVerifForm({ ...verifForm, referenceNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Confirmed Deposit Amount</label>
                  <input
                    type="number"
                    value={verifForm.confirmedAmount}
                    onChange={(e) => setVerifForm({ ...verifForm, confirmedAmount: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Confirmed Maturity Date</label>
                  <input
                    type="date"
                    value={verifForm.confirmedMaturityDate}
                    onChange={(e) => setVerifForm({ ...verifForm, confirmedMaturityDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Verification Date</label>
                  <input
                    type="date"
                    value={verifForm.verificationDate}
                    onChange={(e) => setVerifForm({ ...verifForm, verificationDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="confirmedLienCheck"
                    checked={verifForm.confirmedLienStatus}
                    onChange={(e) => setVerifForm({ ...verifForm, confirmedLienStatus: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <label htmlFor="confirmedLienCheck" className="font-bold text-slate-800 cursor-pointer">
                    Issuing Bank Explicitly Confirms AICTE Joint Lien Registered in Core Banking
                  </label>
                </div>
              </div>

              {verifForm.result === 'DISCREPANCY_FOUND' && (
                <div>
                  <label className="block font-bold text-red-700 mb-1">
                    Discrepancy Details <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={2}
                    required
                    placeholder="Specify the mismatch (amount variance, non-existent lien, unauthorized branch, etc.)"
                    value={verifForm.discrepancyDetails}
                    onChange={(e) => setVerifForm({ ...verifForm, discrepancyDetails: e.target.value })}
                    className="w-full px-3 py-2 border border-red-300 rounded-lg bg-red-50/30 text-red-950 font-medium"
                  />
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">Supporting Evidence Document Title</label>
                <input
                  type="text"
                  placeholder="e.g. Bank Confirmation Certificate Ref SBI/CP/2026/01"
                  value={verifForm.supportingDocumentTitle}
                  onChange={(e) => setVerifForm({ ...verifForm, supportingDocumentTitle: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowVerifyModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0f2e5a] hover:bg-[#1e3a8a] text-white font-bold rounded-lg shadow-xs"
                >
                  Save Verification Outcome
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
