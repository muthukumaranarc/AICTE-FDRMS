import React, { useState } from 'react';
import {
  RefreshCw,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Landmark,
  ArrowRight,
  Plus,
  X,
  FileText
} from 'lucide-react';
import { FdrInstrument, InternalUser } from '../types';
import { api } from '../services/api';
import { formatInr, formatInrCompact, formatDate, getInstrumentStatusBadge } from '../utils/formatters';

interface RenewalViewProps {
  fdrs: FdrInstrument[];
  currentUser: InternalUser;
  onRefresh: () => void;
  onSelectFdr: (fdr: FdrInstrument) => void;
  targetRenewalFdr?: FdrInstrument | null;
}

export const RenewalView: React.FC<RenewalViewProps> = ({
  fdrs,
  currentUser,
  onRefresh,
  onSelectFdr,
  targetRenewalFdr
}) => {
  const [showRenewalModal, setShowRenewalModal] = useState(!!targetRenewalFdr);
  const [selectedOldFdrId, setSelectedOldFdrId] = useState(targetRenewalFdr ? targetRenewalFdr.id : '');

  const oldFdr = fdrs.find((f) => f.id === selectedOldFdrId);

  // Renewal Form State
  const [renewalForm, setRenewalForm] = useState({
    newFdrNumber: '',
    newBankName: oldFdr ? oldFdr.bankName : '',
    newBranchName: oldFdr ? oldFdr.branchName : '',
    newBranchIfsc: oldFdr ? oldFdr.branchIfsc : '',
    newAmount: oldFdr ? oldFdr.amount : 0,
    newIssueDate: new Date().toISOString().substring(0, 10),
    newMaturityDate: '2029-10-30',
    newTenureMonths: 36,
    newInterestRate: 7.15,
    newMaturityAmount: 0,
    jointLienMarked: true,
    jointHolderName: oldFdr ? oldFdr.jointHolderName : '',
    renewalDocumentTitle: 'Bank Term Deposit Renewal Receipt Leaf',
    renewalDocumentSource: 'Speed Post submission from Institution Principal',
    remarks: 'Mandatory tenure extension under AICTE approval handbook Chapter II.'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Categorize FDRs for renewal monitoring
  const overdueFdrs = fdrs.filter((f) => f.instrumentStatus === 'OVERDUE');
  const expiringSoonFdrs = fdrs.filter((f) => f.instrumentStatus === 'EXPIRING_SOON');
  const renewedFdrs = fdrs.filter((f) => f.instrumentStatus === 'RENEWED' || f.instrumentEvent === 'RENEWAL');

  const handleOpenRenewalModal = (fdr: FdrInstrument) => {
    setSelectedOldFdrId(fdr.id);
    setRenewalForm({
      newFdrNumber: '',
      newBankName: fdr.bankName,
      newBranchName: fdr.branchName,
      newBranchIfsc: fdr.branchIfsc,
      newAmount: fdr.amount,
      newIssueDate: fdr.maturityDate || new Date().toISOString().substring(0, 10),
      newMaturityDate: '2029-10-30',
      newTenureMonths: 36,
      newInterestRate: fdr.interestRate || 7.0,
      newMaturityAmount: (fdr.amount || 0) * 1.25,
      jointLienMarked: true,
      jointHolderName: fdr.jointHolderName,
      renewalDocumentTitle: `Renewal Deposit Leaf - ${fdr.institutionName}`,
      renewalDocumentSource: 'Formal Institution Submission',
      remarks: `Renewed against expiring instrument ${fdr.fdrNumber}`
    });
    setShowRenewalModal(true);
  };

  const handleRecordRenewal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOldFdrId) {
      alert('Please select the expiring FDR');
      return;
    }
    setIsSubmitting(true);
    try {
      await api.recordRenewal({
        ...renewalForm,
        previousFdrId: selectedOldFdrId
      });
      setShowRenewalModal(false);
      onRefresh();
      alert('Renewal instrument successfully recorded and linked into the lifecycle chain!');
    } catch (err) {
      console.error(err);
      alert('Failed to record renewal instrument');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg font-bold text-[#0f2e5a] flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-blue-700" />
            Maturity, Validity & Renewal Management Desk
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Active tracking of instruments approaching validity deadlines and recording renewals with full genealogical linkage.
          </p>
        </div>

        <button
          onClick={() => {
            if (fdrs.length > 0) handleOpenRenewalModal(fdrs[0]);
          }}
          className="px-4 py-2 bg-[#0f2e5a] hover:bg-[#1e3a8a] text-white font-bold text-xs rounded-lg transition shadow-xs flex items-center gap-1.5 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Record Renewal / Replacement</span>
        </button>
      </div>

      {/* KPI Overdue / Expiring Banners */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-red-800 uppercase tracking-wider">Overdue Renewals</span>
            <AlertTriangle className="w-4 h-4 text-red-600" />
          </div>
          <div className="text-2xl font-extrabold text-red-900 mt-1">
            {overdueFdrs.length} Cases
          </div>
          <div className="text-[11px] text-red-700 mt-0.5">
            Total Overdue Value: {formatInrCompact(overdueFdrs.reduce((a, b) => a + (b.amount || 0), 0))}
          </div>
        </div>

        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">Maturity Approaching (&le;60d)</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-extrabold text-amber-900 mt-1">
            {expiringSoonFdrs.length} Cases
          </div>
          <div className="text-[11px] text-amber-700 mt-0.5">
            Total Expiring Value: {formatInrCompact(expiringSoonFdrs.reduce((a, b) => a + (b.amount || 0), 0))}
          </div>
        </div>

        <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-blue-800 uppercase tracking-wider">Historical Renewed Chain</span>
            <CheckCircle2 className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-extrabold text-[#0f2e5a] mt-1">
            {renewedFdrs.length} Instruments
          </div>
          <div className="text-[11px] text-blue-700 mt-0.5">
            Chain preserved in immutable audit history
          </div>
        </div>
      </div>

      {/* Overdue / Expiring Section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Clock className="w-4 h-4 text-red-600" />
            Overdue and Expiring Security Deposits Requiring Renewal Action
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">FDR No. & Institution</th>
                <th className="py-2.5 px-3">Bank & Amount</th>
                <th className="py-2.5 px-3">Maturity Date</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Action Required</th>
                <th className="py-2.5 px-3 text-right">Renewal Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[...overdueFdrs, ...expiringSoonFdrs].length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No overdue or expiring instruments at this time.
                  </td>
                </tr>
              ) : (
                [...overdueFdrs, ...expiringSoonFdrs].map((fdr) => (
                  <tr key={fdr.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-3">
                      <button
                        onClick={() => onSelectFdr(fdr)}
                        className="font-mono font-bold text-blue-900 hover:underline block text-left"
                      >
                        {fdr.fdrNumber}
                      </button>
                      <span className="text-[11px] text-slate-500 block truncate max-w-[220px]" title={fdr.institutionName}>
                        {fdr.institutionName}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-bold text-slate-800 block">{formatInr(fdr.amount)}</span>
                      <span className="text-[10px] text-slate-500 block">{fdr.bankName}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-mono font-bold text-slate-800 block">{formatDate(fdr.maturityDate)}</span>
                      {fdr.instrumentStatus === 'OVERDUE' ? (
                        <span className="text-[10px] text-red-600 font-bold block">Notice Overdue!</span>
                      ) : (
                        <span className="text-[10px] text-amber-700 font-medium block">Expiring in &le;60d</span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`inline-block text-[10px] px-2 py-0.5 rounded-full border font-bold ${getInstrumentStatusBadge(fdr.instrumentStatus).bg} ${getInstrumentStatusBadge(fdr.instrumentStatus).text} ${getInstrumentStatusBadge(fdr.instrumentStatus).border}`}>
                        {getInstrumentStatusBadge(fdr.instrumentStatus).label}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-700">
                      {fdr.instrumentStatus === 'OVERDUE' ? (
                        <span className="text-red-700 font-medium">Issue Show Cause / Record Renewal Leaf</span>
                      ) : (
                        <span className="text-slate-600 font-medium">Send Advance Renewal Notice</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => handleOpenRenewalModal(fdr)}
                        className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded text-xs transition shadow-2xs flex items-center gap-1 ml-auto"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Record Renewal</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Renewal Modal */}
      {showRenewalModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="p-5 bg-[#0f2e5a] text-white flex justify-between items-center">
              <div>
                <h3 className="text-base font-bold">Record FDR Renewal / Replacement Instrument</h3>
                <p className="text-xs text-blue-100 mt-0.5">
                  Establishes genealogical link between existing maturing FDR and newly issued instrument leaf.
                </p>
              </div>
              <button onClick={() => setShowRenewalModal(false)} className="text-white/80 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordRenewal} className="p-6 overflow-y-auto space-y-4 text-xs flex-1">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Maturing Predecessor Instrument (Previous FDR) <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={selectedOldFdrId}
                  onChange={(e) => {
                    setSelectedOldFdrId(e.target.value);
                    const old = fdrs.find((f) => f.id === e.target.value);
                    if (old) {
                      setRenewalForm((prev) => ({
                        ...prev,
                        newBankName: old.bankName,
                        newBranchName: old.branchName,
                        newBranchIfsc: old.branchIfsc,
                        newAmount: old.amount,
                        jointHolderName: old.jointHolderName
                      }));
                    }
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-semibold"
                >
                  <option value="">Select Preceding FDR</option>
                  {fdrs
                    .filter((f) => f.instrumentStatus !== 'RELEASED' && f.instrumentStatus !== 'RENEWED')
                    .map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.fdrNumber} — {f.institutionName} ({formatInrCompact(f.amount)}, Maturity: {formatDate(f.maturityDate)})
                      </option>
                    ))}
                </select>
              </div>

              <div className="p-3 bg-blue-50/50 border border-blue-200 rounded-lg text-slate-700">
                <span className="font-bold text-blue-900 block text-[11px]">Notice of Status Transition:</span>
                <p className="text-[11px] mt-0.5 leading-relaxed">
                  Upon saving, the preceding instrument will be marked as <strong className="text-blue-900">RENEWED</strong> and will retain a permanent bidirectional link to this new instrument.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    New Renewed FDR Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. BARB/CBE/2026/778899"
                    value={renewalForm.newFdrNumber}
                    onChange={(e) => setRenewalForm({ ...renewalForm, newFdrNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Renewed Deposit Amount (INR) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    value={renewalForm.newAmount}
                    onChange={(e) => setRenewalForm({ ...renewalForm, newAmount: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Issuing Bank <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={renewalForm.newBankName}
                    onChange={(e) => setRenewalForm({ ...renewalForm, newBankName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Branch Name</label>
                  <input
                    type="text"
                    value={renewalForm.newBranchName}
                    onChange={(e) => setRenewalForm({ ...renewalForm, newBranchName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Branch IFSC</label>
                  <input
                    type="text"
                    value={renewalForm.newBranchIfsc}
                    onChange={(e) => setRenewalForm({ ...renewalForm, newBranchIfsc: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">New Effective Date <span className="text-red-500">*</span></label>
                  <input
                    type="date"
                    required
                    value={renewalForm.newIssueDate}
                    onChange={(e) => setRenewalForm({ ...renewalForm, newIssueDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">New Maturity Date <span className="text-red-500">*</span></label>
                  <input
                    type="date"
                    required
                    value={renewalForm.newMaturityDate}
                    onChange={(e) => setRenewalForm({ ...renewalForm, newMaturityDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tenure (Months)</label>
                  <input
                    type="number"
                    value={renewalForm.newTenureMonths}
                    onChange={(e) => setRenewalForm({ ...renewalForm, newTenureMonths: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="newJointLienCheck"
                    checked={renewalForm.jointLienMarked}
                    onChange={(e) => setRenewalForm({ ...renewalForm, jointLienMarked: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <label htmlFor="newJointLienCheck" className="font-bold text-slate-800 cursor-pointer">
                    AICTE Joint Lien Endorsement Marked on New Renewal Leaf
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Renewal Proof Document Title</label>
                <input
                  type="text"
                  value={renewalForm.renewalDocumentTitle}
                  onChange={(e) => setRenewalForm({ ...renewalForm, renewalDocumentTitle: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Administrative Notes</label>
                <textarea
                  rows={2}
                  value={renewalForm.remarks}
                  onChange={(e) => setRenewalForm({ ...renewalForm, remarks: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowRenewalModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-[#0f2e5a] hover:bg-[#1e3a8a] text-white font-bold rounded-lg shadow-xs"
                >
                  {isSubmitting ? 'Recording Renewal...' : 'Record Renewal Instrument'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
