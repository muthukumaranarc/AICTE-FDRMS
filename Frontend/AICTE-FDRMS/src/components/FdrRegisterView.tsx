import React, { useState } from 'react';
import {
  Landmark,
  Search,
  Plus,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ExternalLink,
  RefreshCw,
  FileText,
  UserCheck,
  Shield,
  X,
  History,
  FileCheck2,
  ArrowUpRightSquare
} from 'lucide-react';
import {
  FdrInstrument,
  Institution,
  InternalUser,
  InstrumentStatus,
  VerificationStatus,
  DocumentRecord,
  ScrutinyObservation,
  ScrutinyVerificationRecord
} from '../types';
import { api } from '../services/api';
import { formatInr, formatInrCompact, formatDate, getInstrumentStatusBadge, getVerificationStatusBadge } from '../utils/formatters';

interface FdrRegisterViewProps {
  fdrs: FdrInstrument[];
  institutions: Institution[];
  users: InternalUser[];
  onRefresh: () => void;
  currentUser: InternalUser;
  selectedFdrModal: FdrInstrument | null;
  onCloseFdrModal: () => void;
  onOpenFdrModal: (fdr: FdrInstrument) => void;
  onInitiateRenewal: (fdr: FdrInstrument) => void;
  onInitiateRelease: (fdr: FdrInstrument) => void;
  onInitiateVerification: (fdr: FdrInstrument) => void;
}

export const FdrRegisterView: React.FC<FdrRegisterViewProps> = ({
  fdrs,
  institutions,
  users,
  onRefresh,
  currentUser,
  selectedFdrModal,
  onCloseFdrModal,
  onOpenFdrModal,
  onInitiateRenewal,
  onInitiateRelease,
  onInitiateVerification
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [bankFilter, setBankFilter] = useState<string>('');
  const [institutionFilter, setInstitutionFilter] = useState<string>('');

  // Add FDR modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [fdrFormData, setFdrFormData] = useState<Partial<FdrInstrument>>({
    fdrNumber: '',
    institutionId: '',
    instrumentType: 'FDR',
    bankName: 'State Bank of India',
    branchName: '',
    branchIfsc: '',
    amount: 5000000,
    currency: 'INR',
    issueDate: '2026-01-15',
    maturityDate: '2031-01-15',
    tenureMonths: 60,
    interestRate: 7.10,
    interestType: 'Cumulative',
    maturityAmount: 7000000,
    jointLienMarked: true,
    jointHolderName: 'Regional Officer, AICTE & Principal',
    instrumentEvent: 'NEW_DEPOSIT',
    complianceReference: 'AICTE/REG/2026/FDR-',
    priority: 'MEDIUM',
    remarks: ''
  });

  const [dupeFdrWarning, setDupeFdrWarning] = useState<FdrInstrument[]>([]);
  const [isSubmittingFdr, setIsSubmittingFdr] = useState(false);

  // Tab inside FDR details modal
  const [modalTab, setModalTab] = useState<'details' | 'verifications' | 'observations' | 'documents' | 'chain'>('details');
  const [fdrVerifications, setFdrVerifications] = useState<ScrutinyVerificationRecord[]>([]);
  const [fdrObservations, setFdrObservations] = useState<ScrutinyObservation[]>([]);
  const [fdrDocuments, setFdrDocuments] = useState<DocumentRecord[]>([]);
  const [reassignReviewerId, setReassignReviewerId] = useState('');

  // Fetch sub-details when modal opens
  React.useEffect(() => {
    if (selectedFdrModal) {
      api.getVerifications(selectedFdrModal.id).then(setFdrVerifications).catch(console.error);
      api.getObservations(selectedFdrModal.id).then(setFdrObservations).catch(console.error);
      api.getDocuments({ fdrId: selectedFdrModal.id }).then(setFdrDocuments).catch(console.error);
      setReassignReviewerId(selectedFdrModal.assignedReviewerId || '');
    }
  }, [selectedFdrModal]);

  // Unique bank names
  const uniqueBanks = Array.from(new Set(fdrs.map((f) => f.bankName).filter(Boolean)));

  // Filtered list
  const filteredFdrs = fdrs.filter((f) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match =
        (f.fdrNumber && f.fdrNumber.toLowerCase().includes(q)) ||
        (f.institutionName && f.institutionName.toLowerCase().includes(q)) ||
        (f.bankName && f.bankName.toLowerCase().includes(q)) ||
        (f.complianceReference && f.complianceReference.toLowerCase().includes(q));
      if (!match) return false;
    }
    if (statusFilter && f.instrumentStatus !== statusFilter) return false;
    if (bankFilter && f.bankName !== bankFilter) return false;
    if (institutionFilter && f.institutionId !== institutionFilter) return false;
    return true;
  });

  const handleCheckFdrDuplicates = async (num: string) => {
    if (!num || num.trim().length < 4) {
      setDupeFdrWarning([]);
      return;
    }
    try {
      const dupes = await api.checkFdrDuplicates(num);
      setDupeFdrWarning(dupes);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveFdr = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fdrFormData.institutionId) {
      alert('Please select an institution');
      return;
    }
    setIsSubmittingFdr(true);
    try {
      const newFdr = await api.createFdr(fdrFormData);
      setShowAddModal(false);
      onRefresh();
      onOpenFdrModal(newFdr);
    } catch (err) {
      console.error(err);
      alert('Failed to register FDR');
    } finally {
      setIsSubmittingFdr(false);
    }
  };

  const handleReassign = async () => {
    if (!selectedFdrModal || !reassignReviewerId) return;
    try {
      await api.assignFdrReviewer(selectedFdrModal.id, reassignReviewerId);
      alert('Reviewer reassigned successfully');
      onRefresh();
      onCloseFdrModal();
    } catch (err) {
      console.error(err);
      alert('Failed to reassign reviewer');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-[#0f2e5a] flex items-center gap-2">
            <Landmark className="w-5 h-5 text-blue-700" />
            AICTE Security Deposit & FDR Register
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Institution-wise and instrument-wise repository with complete lifecycle, lien verification, and renewal tracking.
          </p>
        </div>

        <button
          onClick={() => {
            setFdrFormData({
              fdrNumber: '',
              institutionId: institutions.length > 0 ? institutions[0].id : '',
              instrumentType: 'FDR',
              bankName: 'State Bank of India',
              branchName: '',
              branchIfsc: '',
              amount: 5000000,
              currency: 'INR',
              issueDate: '2026-01-15',
              maturityDate: '2031-01-15',
              tenureMonths: 60,
              interestRate: 7.10,
              interestType: 'Cumulative',
              maturityAmount: 7000000,
              jointLienMarked: true,
              jointHolderName: 'Regional Officer, AICTE & Principal',
              instrumentEvent: 'NEW_DEPOSIT',
              complianceReference: 'AICTE/REG/2026/APP-',
              priority: 'MEDIUM',
              remarks: ''
            });
            setDupeFdrWarning([]);
            setShowAddModal(true);
          }}
          className="px-4 py-2 bg-[#0f2e5a] hover:bg-[#1e3a8a] text-white font-bold text-xs rounded-lg transition shadow-xs flex items-center gap-1.5 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Record New Security Deposit</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search FDR Number, Bank, Institution, or Compliance Reference..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="EXPIRING_SOON">Expiring Soon</option>
            <option value="MATURED">Matured</option>
            <option value="OVERDUE">Overdue Renewal</option>
            <option value="RENEWAL_PENDING">Renewal Pending</option>
            <option value="RENEWED">Renewed</option>
            <option value="RELEASE_PENDING">Release Scrutiny</option>
            <option value="RELEASED">Discharged / Released</option>
          </select>

          <select
            value={bankFilter}
            onChange={(e) => setBankFilter(e.target.value)}
            className="text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Issuing Banks ({uniqueBanks.length})</option>
            {uniqueBanks.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* FDR Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">FDR / Reference No.</th>
                <th className="py-3 px-4">Institution Name</th>
                <th className="py-3 px-4">Issuing Bank & Branch</th>
                <th className="py-3 px-4">Deposit Amount</th>
                <th className="py-3 px-4">Maturity Date</th>
                <th className="py-3 px-4">Instrument Status</th>
                <th className="py-3 px-4">Verification</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredFdrs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No FDR records found matching the search criteria.
                  </td>
                </tr>
              ) : (
                filteredFdrs.map((fdr) => {
                  const instBadge = getInstrumentStatusBadge(fdr.instrumentStatus);
                  const verBadge = getVerificationStatusBadge(fdr.verificationStatus);
                  return (
                    <tr key={fdr.id} className="hover:bg-slate-50 transition">
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => onOpenFdrModal(fdr)}
                          className="font-mono font-bold text-blue-900 hover:underline block text-left"
                        >
                          {fdr.fdrNumber}
                        </button>
                        <span className="text-[10px] text-slate-400 font-mono block">
                          Ref: {fdr.complianceReference}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="font-semibold text-slate-800 leading-snug truncate" title={fdr.institutionName}>
                          {fdr.institutionName}
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono">
                          ID: {fdr.institutionAicteId}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-800 block">{fdr.bankName}</span>
                        <span className="text-[10px] text-slate-500 block truncate max-w-[160px]">
                          {fdr.branchName}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-900 block">{formatInr(fdr.amount)}</span>
                        <span className="text-[10px] text-slate-500 block">
                          Rate: {fdr.interestRate ? `${fdr.interestRate}%` : 'N/A'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-semibold text-slate-800 block">
                          {formatDate(fdr.maturityDate)}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {fdr.tenureMonths} mos tenure
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-block text-[10px] px-2.5 py-0.5 rounded-full border font-semibold ${instBadge.bg} ${instBadge.text} ${instBadge.border}`}>
                          {instBadge.label}
                        </span>
                        {fdr.flagDiscrepancy && (
                          <span className="block mt-0.5 text-[9px] text-red-600 font-bold">
                            Discrepancy Found
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-block text-[10px] px-2 py-0.5 rounded border font-semibold ${verBadge.bg} ${verBadge.text} ${verBadge.border}`}>
                          {verBadge.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => onOpenFdrModal(fdr)}
                          className="px-3 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold rounded text-xs border border-blue-200 transition"
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Comprehensive FDR Profile Modal */}
      {selectedFdrModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 bg-[#0f2e5a] text-white flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-amber-300 font-mono">
                    INSTRUMENT ID: {selectedFdrModal.id}
                  </span>
                  <span className="text-[10px] px-2 py-0.2 rounded bg-white/10 border border-white/20">
                    {selectedFdrModal.instrumentType}
                  </span>
                </div>
                <h3 className="text-xl font-extrabold mt-1 tracking-tight flex items-center gap-2">
                  FDR No: {selectedFdrModal.fdrNumber}
                </h3>
                <p className="text-xs text-blue-100 mt-0.5">
                  Institution: <span className="font-semibold text-white">{selectedFdrModal.institutionName}</span> (ID: {selectedFdrModal.institutionAicteId})
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={onCloseFdrModal}
                  className="text-white/80 hover:text-white p-1 rounded-md"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Quick Action Ribbon */}
            <div className="px-6 py-2.5 bg-slate-100 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-600">Assigned Official:</span>
                <span className="text-xs font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200">
                  {selectedFdrModal.assignedReviewerName || 'Unassigned'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    onCloseFdrModal();
                    onInitiateVerification(selectedFdrModal);
                  }}
                  className="px-2.5 py-1 bg-white hover:bg-blue-50 text-blue-700 font-semibold rounded text-xs border border-blue-300 transition flex items-center gap-1"
                >
                  <FileCheck2 className="w-3.5 h-3.5" />
                  <span>Record Scrutiny</span>
                </button>

                <button
                  onClick={() => {
                    onCloseFdrModal();
                    onInitiateRenewal(selectedFdrModal);
                  }}
                  className="px-2.5 py-1 bg-white hover:bg-indigo-50 text-indigo-700 font-semibold rounded text-xs border border-indigo-300 transition flex items-center gap-1"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Record Renewal</span>
                </button>

                <button
                  onClick={() => {
                    onCloseFdrModal();
                    onInitiateRelease(selectedFdrModal);
                  }}
                  className="px-2.5 py-1 bg-white hover:bg-purple-50 text-purple-700 font-semibold rounded text-xs border border-purple-300 transition flex items-center gap-1"
                >
                  <ArrowUpRightSquare className="w-3.5 h-3.5" />
                  <span>Initiate Release</span>
                </button>
              </div>
            </div>

            {/* Tabs Bar */}
            <div className="px-6 border-b border-slate-200 bg-slate-50 flex gap-4 text-xs font-semibold">
              <button
                onClick={() => setModalTab('details')}
                className={`py-3 border-b-2 transition ${
                  modalTab === 'details' ? 'border-blue-700 text-blue-900 font-bold' : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Deposit & Bank Details
              </button>
              <button
                onClick={() => setModalTab('verifications')}
                className={`py-3 border-b-2 transition flex items-center gap-1.5 ${
                  modalTab === 'verifications' ? 'border-blue-700 text-blue-900 font-bold' : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <span>Bank Verifications</span>
                <span className="px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-700 text-[10px]">
                  {fdrVerifications.length}
                </span>
              </button>
              <button
                onClick={() => setModalTab('observations')}
                className={`py-3 border-b-2 transition flex items-center gap-1.5 ${
                  modalTab === 'observations' ? 'border-blue-700 text-blue-900 font-bold' : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <span>Scrutiny Observations</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${fdrObservations.length > 0 ? 'bg-red-100 text-red-700' : 'bg-slate-200 text-slate-700'}`}>
                  {fdrObservations.length}
                </span>
              </button>
              <button
                onClick={() => setModalTab('documents')}
                className={`py-3 border-b-2 transition flex items-center gap-1.5 ${
                  modalTab === 'documents' ? 'border-blue-700 text-blue-900 font-bold' : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <span>Supporting Documents</span>
                <span className="px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-700 text-[10px]">
                  {fdrDocuments.length}
                </span>
              </button>
              <button
                onClick={() => setModalTab('chain')}
                className={`py-3 border-b-2 transition flex items-center gap-1.5 ${
                  modalTab === 'chain' ? 'border-blue-700 text-blue-900 font-bold' : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <span>Renewal / Replacement Chain</span>
                {(selectedFdrModal.previousFdrId || selectedFdrModal.nextFdrId) && (
                  <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                )}
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 text-xs space-y-4">
              {modalTab === 'details' && (
                <div className="space-y-4">
                  {/* Status Banner */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                      <div className="text-[10px] font-semibold text-slate-500 uppercase">Deposit Amount</div>
                      <div className="text-xl font-extrabold text-[#0f2e5a] mt-0.5">
                        {formatInr(selectedFdrModal.amount)}
                      </div>
                      <div className="text-[11px] text-slate-600 mt-0.5">
                        Maturity Value: <span className="font-semibold">{formatInr(selectedFdrModal.maturityAmount)}</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                      <div className="text-[10px] font-semibold text-slate-500 uppercase">Instrument Status</div>
                      <div className="mt-1">
                        <span className={`inline-block text-xs px-2.5 py-0.5 rounded-full border font-bold ${getInstrumentStatusBadge(selectedFdrModal.instrumentStatus).bg} ${getInstrumentStatusBadge(selectedFdrModal.instrumentStatus).text} ${getInstrumentStatusBadge(selectedFdrModal.instrumentStatus).border}`}>
                          {getInstrumentStatusBadge(selectedFdrModal.instrumentStatus).label}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1">
                        Tenure: {selectedFdrModal.tenureMonths} Months ({formatDate(selectedFdrModal.issueDate)} &rarr; {formatDate(selectedFdrModal.maturityDate)})
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                      <div className="text-[10px] font-semibold text-slate-500 uppercase">AICTE Joint Lien Status</div>
                      <div className="mt-1">
                        {selectedFdrModal.jointLienMarked ? (
                          <span className="text-xs font-bold text-emerald-800 flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            Duly Endorsed in Favour of AICTE
                          </span>
                        ) : (
                          <span className="text-xs font-bold text-red-700 flex items-center gap-1">
                            <AlertTriangle className="w-4 h-4 text-red-600" />
                            Lien Not Endorsed! (Discrepancy)
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-600 mt-1 truncate" title={selectedFdrModal.jointHolderName}>
                        Holder: {selectedFdrModal.jointHolderName || 'Sole Name'}
                      </div>
                    </div>
                  </div>

                  {/* Core Bank Details */}
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                        Issuing Bank & Branch Information
                      </h4>
                      <div className="space-y-1.5">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Bank Name:</span>
                          <span className="font-bold text-slate-800">{selectedFdrModal.bankName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Branch Name:</span>
                          <span className="font-semibold text-slate-700">{selectedFdrModal.branchName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">IFSC Code:</span>
                          <span className="font-mono font-bold text-blue-900">{selectedFdrModal.branchIfsc || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Interest Terms:</span>
                          <span className="font-medium text-slate-700">
                            {selectedFdrModal.interestRate}% ({selectedFdrModal.interestType || 'Cumulative'})
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                        Approval & Administrative Details
                      </h4>
                      <div className="space-y-1.5">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Compliance Ref:</span>
                          <span className="font-mono font-semibold text-slate-800">{selectedFdrModal.complianceReference}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Instrument Event:</span>
                          <span className="font-semibold text-slate-700">{selectedFdrModal.instrumentEvent}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Priority Level:</span>
                          <span className="font-bold text-slate-800">{selectedFdrModal.priority}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Created At:</span>
                          <span className="font-mono text-slate-600">{selectedFdrModal.createdAt}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Internal Remarks */}
                  {selectedFdrModal.remarks && (
                    <div className="p-3 bg-amber-50/50 border border-amber-200 rounded-lg">
                      <span className="font-bold text-amber-900 text-[11px] block">Internal Case Remarks:</span>
                      <p className="text-slate-700 text-xs mt-0.5 leading-relaxed">
                        {selectedFdrModal.remarks}
                      </p>
                    </div>
                  )}

                  {/* Reassign Official */}
                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-600">Reassign Case Reviewer:</span>
                    <div className="flex items-center gap-2">
                      <select
                        value={reassignReviewerId}
                        onChange={(e) => setReassignReviewerId(e.target.value)}
                        className="text-xs border border-slate-300 rounded-lg px-3 py-1.5 bg-white text-slate-700"
                      >
                        <option value="">Select Official</option>
                        {users.map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.name} ({u.designation})
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={handleReassign}
                        className="px-3 py-1.5 bg-blue-700 text-white font-semibold rounded-lg hover:bg-blue-800 text-xs transition"
                      >
                        Reassign
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {modalTab === 'verifications' && (
                <div className="space-y-4">
                  <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-lg text-slate-700 text-[11px]">
                    <strong>Mandatory Regulatory Standard:</strong> AICTE regulation requires independent bank verification. Uploaded documents or reviewer notes alone do not establish genuineness.
                  </div>

                  {fdrVerifications.length === 0 ? (
                    <div className="py-8 text-center text-slate-400">
                      No bank verification attempts logged yet.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {fdrVerifications.map((v) => (
                        <div key={v.id} className="p-3.5 rounded-lg border border-slate-200 bg-white shadow-xs">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className={`inline-block text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                                v.result === 'VERIFIED' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                              }`}>
                                Result: {v.result}
                              </span>
                              <h5 className="font-bold text-slate-800 text-xs mt-1">
                                Method: {v.verificationMethod.replace(/_/g, ' ')}
                              </h5>
                            </div>
                            <span className="text-[10px] font-mono text-slate-400">{v.verificationDate}</span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-100 text-[11px]">
                            <div>
                              <span className="text-slate-500">Verification Source:</span>
                              <div className="font-semibold text-slate-800">{v.verificationSource}</div>
                            </div>
                            <div>
                              <span className="text-slate-500">Bank Reference No:</span>
                              <div className="font-mono font-semibold text-slate-800">{v.referenceNumber}</div>
                            </div>
                            <div>
                              <span className="text-slate-500">Confirmed Amount:</span>
                              <div className="font-bold text-slate-800">{formatInr(v.confirmedAmount)}</div>
                            </div>
                            <div>
                              <span className="text-slate-500">Confirmed Lien:</span>
                              <div className="font-semibold text-slate-800">
                                {v.confirmedLienStatus ? 'Yes (Registered)' : 'No (Unencumbered / Missing Lien)'}
                              </div>
                            </div>
                          </div>

                          {v.discrepancyDetails && (
                            <div className="mt-2 p-2 rounded bg-rose-50 border border-rose-200 text-rose-800 text-[11px]">
                              <strong>Discrepancy Details:</strong> {v.discrepancyDetails}
                            </div>
                          )}

                          <div className="mt-2 text-[10px] text-slate-400 flex justify-between">
                            <span>Logged By: {v.verifiedBy}</span>
                            <span>{v.createdAt}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {modalTab === 'observations' && (
                <div className="space-y-4">
                  {fdrObservations.length === 0 ? (
                    <div className="py-8 text-center text-slate-400">
                      No scrutiny observations or discrepancy flags logged.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {fdrObservations.map((obs) => (
                        <div key={obs.id} className="p-3.5 rounded-lg border border-slate-200 bg-white">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="text-[10px] px-2 py-0.5 rounded font-bold uppercase bg-red-100 text-red-800 border border-red-200">
                                {obs.severity} • {obs.category}
                              </span>
                              <p className="text-xs font-semibold text-slate-800 mt-1.5 leading-relaxed">
                                {obs.observation}
                              </p>
                            </div>
                            <span className="text-[10px] font-mono text-slate-400">{obs.recordedAt}</span>
                          </div>

                          {obs.actionRequired && (
                            <div className="mt-2 text-[11px] text-slate-700 bg-slate-50 p-2 rounded border border-slate-200">
                              <span className="font-bold text-slate-800">Follow-Up Action Required:</span> {obs.actionRequired}
                            </div>
                          )}

                          <div className="mt-2 text-[10px] text-slate-400 flex justify-between items-center">
                            <span>Recorded by: {obs.recordedBy}</span>
                            <span>Status: {obs.resolved ? 'RESOLVED' : 'OPEN / PENDING'}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {modalTab === 'documents' && (
                <div className="space-y-3">
                  {fdrDocuments.length === 0 ? (
                    <div className="py-8 text-center text-slate-400">
                      No documents currently attached to this instrument.
                    </div>
                  ) : (
                    fdrDocuments.map((doc) => (
                      <div key={doc.id} className="p-3 rounded-lg border border-slate-200 bg-white flex justify-between items-center text-xs">
                        <div>
                          <div className="font-bold text-slate-800">{doc.title}</div>
                          <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                            Type: {doc.documentType} • Version: v{doc.version} • Source: {doc.sourceReference}
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200 text-[10px]">
                          {doc.status}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              )}

              {modalTab === 'chain' && (
                <div className="space-y-4">
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600 leading-relaxed">
                    <strong>Instrument Traceability Chain:</strong> Connects renewals and replacements to the original security deposit submitted at initial approval.
                  </div>

                  <div className="space-y-3">
                    {selectedFdrModal.previousFdrId && (
                      <div className="p-3 rounded-lg border border-blue-200 bg-blue-50/50">
                        <span className="text-[10px] font-bold text-blue-800 uppercase">Preceding Instrument (Renewed from):</span>
                        <div className="font-mono font-bold text-slate-900 text-xs mt-0.5">
                          FDR ID: {selectedFdrModal.previousFdrId}
                        </div>
                      </div>
                    )}

                    <div className="p-3 rounded-lg border-2 border-[#0f2e5a] bg-white">
                      <span className="text-[10px] font-bold text-emerald-800 uppercase">Current Active Instrument:</span>
                      <div className="font-mono font-bold text-slate-900 text-xs mt-0.5">
                        {selectedFdrModal.fdrNumber} ({selectedFdrModal.id})
                      </div>
                      <div className="text-[11px] text-slate-600 mt-0.5">
                        Amount: {formatInr(selectedFdrModal.amount)} • Maturity: {formatDate(selectedFdrModal.maturityDate)}
                      </div>
                    </div>

                    {selectedFdrModal.nextFdrId && (
                      <div className="p-3 rounded-lg border border-purple-200 bg-purple-50/50">
                        <span className="text-[10px] font-bold text-purple-800 uppercase">Succeeding Instrument (Renewed to):</span>
                        <div className="font-mono font-bold text-slate-900 text-xs mt-0.5">
                          FDR ID: {selectedFdrModal.nextFdrId}
                        </div>
                      </div>
                    )}

                    {!selectedFdrModal.previousFdrId && !selectedFdrModal.nextFdrId && (
                      <div className="py-6 text-center text-slate-400 text-xs">
                        This is a single standalone deposit (no renewal chain linked).
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={onCloseFdrModal}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs rounded-lg transition"
              >
                Close Instrument
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Record New FDR Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="p-5 bg-[#0f2e5a] text-white flex justify-between items-center">
              <h3 className="text-base font-bold">Record Security Deposit / Fixed Deposit Receipt</h3>
              <button onClick={() => setShowAddModal(false)} className="text-white/80 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveFdr} className="p-6 overflow-y-auto space-y-4 text-xs flex-1">
              {/* Duplicate FDR warning banner */}
              {dupeFdrWarning.length > 0 && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-300 text-red-900 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">CRITICAL WARNING: Duplicate FDR Number Detected!</span>
                    <p className="mt-0.5 text-[11px]">
                      An instrument with identical or matching number already exists: {dupeFdrWarning.map((d) => `${d.fdrNumber} [${d.institutionName}]`).join(', ')}. Please verify the leaf carefully.
                    </p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Select Educational Institution <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={fdrFormData.institutionId || ''}
                    onChange={(e) => setFdrFormData({ ...fdrFormData, institutionId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="">Select Institution</option>
                    {institutions.map((i) => (
                      <option key={i.id} value={i.id}>
                        {i.name} ({i.aictePermanentId})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Instrument Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={fdrFormData.instrumentType || 'FDR'}
                    onChange={(e) => setFdrFormData({ ...fdrFormData, instrumentType: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="FDR">FDR (Fixed Deposit Receipt)</option>
                    <option value="BANK_GUARANTEE">Bank Guarantee</option>
                    <option value="JOINT_TERM_DEPOSIT">Joint Term Deposit</option>
                    <option value="ESCROW_DEPOSIT">Escrow Deposit</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    FDR / Instrument Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SBI/ND/2026/998811"
                    value={fdrFormData.fdrNumber || ''}
                    onChange={(e) => {
                      setFdrFormData({ ...fdrFormData, fdrNumber: e.target.value });
                      handleCheckFdrDuplicates(e.target.value);
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Deposit Amount (INR) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={1000}
                    step={1000}
                    placeholder="e.g. 5000000"
                    value={fdrFormData.amount || ''}
                    onChange={(e) => setFdrFormData({ ...fdrFormData, amount: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Issuing Bank <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. State Bank of India"
                    value={fdrFormData.bankName || ''}
                    onChange={(e) => setFdrFormData({ ...fdrFormData, bankName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Branch Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Connaught Place Branch"
                    value={fdrFormData.branchName || ''}
                    onChange={(e) => setFdrFormData({ ...fdrFormData, branchName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Branch IFSC</label>
                  <input
                    type="text"
                    placeholder="e.g. SBIN0000691"
                    value={fdrFormData.branchIfsc || ''}
                    onChange={(e) => setFdrFormData({ ...fdrFormData, branchIfsc: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Issue Date <span className="text-red-500">*</span></label>
                  <input
                    type="date"
                    required
                    value={fdrFormData.issueDate || ''}
                    onChange={(e) => setFdrFormData({ ...fdrFormData, issueDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Maturity Date <span className="text-red-500">*</span></label>
                  <input
                    type="date"
                    required
                    value={fdrFormData.maturityDate || ''}
                    onChange={(e) => setFdrFormData({ ...fdrFormData, maturityDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tenure (Months)</label>
                  <input
                    type="number"
                    placeholder="e.g. 60"
                    value={fdrFormData.tenureMonths || 60}
                    onChange={(e) => setFdrFormData({ ...fdrFormData, tenureMonths: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Interest Rate (% p.a.)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="e.g. 7.10"
                    value={fdrFormData.interestRate || ''}
                    onChange={(e) => setFdrFormData({ ...fdrFormData, interestRate: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Maturity Value (INR)</label>
                  <input
                    type="number"
                    placeholder="Estimated maturity payout"
                    value={fdrFormData.maturityAmount || ''}
                    onChange={(e) => setFdrFormData({ ...fdrFormData, maturityAmount: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              {/* Joint Lien Endorsement Toggle */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="jointLienCheck"
                    checked={fdrFormData.jointLienMarked || false}
                    onChange={(e) => setFdrFormData({ ...fdrFormData, jointLienMarked: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <label htmlFor="jointLienCheck" className="font-bold text-slate-800 cursor-pointer">
                    AICTE Joint Lien Endorsement Marked on Leaf
                  </label>
                </div>

                <div>
                  <label className="block text-slate-600 mb-1 text-[11px]">
                    Joint Account Holder Title (as printed on bank FDR leaf):
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Regional Officer AICTE NWRO & Principal DITM"
                    value={fdrFormData.jointHolderName || ''}
                    onChange={(e) => setFdrFormData({ ...fdrFormData, jointHolderName: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded bg-white text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Compliance / Approval Ref</label>
                  <input
                    type="text"
                    placeholder="e.g. AICTE/NWRO/2026/APP-09"
                    value={fdrFormData.complianceReference || ''}
                    onChange={(e) => setFdrFormData({ ...fdrFormData, complianceReference: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Assigned Case Reviewer</label>
                  <select
                    value={fdrFormData.assignedReviewerId || ''}
                    onChange={(e) => {
                      const u = users.find((x) => x.id === e.target.value);
                      setFdrFormData({
                        ...fdrFormData,
                        assignedReviewerId: e.target.value,
                        assignedReviewerName: u ? u.name : ''
                      });
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="">Select Official</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.designation})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Administrative Remarks</label>
                <textarea
                  rows={2}
                  placeholder="Official comments on receipt channel, courier ref, etc."
                  value={fdrFormData.remarks || ''}
                  onChange={(e) => setFdrFormData({ ...fdrFormData, remarks: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingFdr}
                  className="px-4 py-2 bg-[#0f2e5a] hover:bg-[#1e3a8a] text-white font-bold rounded-lg shadow-xs"
                >
                  {isSubmittingFdr ? 'Saving...' : 'Register Security Deposit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
