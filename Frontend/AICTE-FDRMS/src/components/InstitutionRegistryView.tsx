import React, { useState } from 'react';
import {
  Building2,
  Search,
  Plus,
  Filter,
  Eye,
  Edit,
  Landmark,
  FileText,
  ArrowUpRightSquare,
  AlertTriangle,
  MapPin,
  Mail,
  Phone,
  User,
  X,
  CheckCircle2
} from 'lucide-react';
import { Institution, FdrInstrument, DocumentRecord, ReleaseRefundCase, UserRole } from '../types';
import { api } from '../services/api';
import { formatInr, formatInrCompact, formatDate, getInstrumentStatusBadge } from '../utils/formatters';

interface InstitutionRegistryViewProps {
  institutions: Institution[];
  onRefresh: () => void;
  userRole: UserRole;
  onSelectFdr: (fdr: FdrInstrument) => void;
}

export const InstitutionRegistryView: React.FC<InstitutionRegistryViewProps> = ({
  institutions,
  onRefresh,
  userRole,
  onSelectFdr
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedType, setSelectedType] = useState('');

  // Modals state
  const [selectedInstDetails, setSelectedInstDetails] = useState<{
    institution: Institution;
    fdrs: FdrInstrument[];
    documents: DocumentRecord[];
    releaseCases: ReleaseRefundCase[];
    totalDepositAmount: number;
  } | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingInst, setEditingInst] = useState<Institution | null>(null);

  // Form state
  const [formData, setFormData] = useState<Partial<Institution>>({
    name: '',
    aictePermanentId: '',
    currentApplicationId: '',
    institutionType: 'Engineering & Technology',
    state: '',
    district: '',
    pincode: '',
    address: '',
    headName: '',
    headDesignation: 'Principal / Director',
    headEmail: '',
    headPhone: '',
    registrarEmail: '',
    approvalStatus: 'Approved (EoA 2026-27)',
    administrativeNotes: ''
  });

  const [dupeWarning, setDupeWarning] = useState<Institution[]>([]);
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Filtered institutions
  const filtered = institutions.filter((inst) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match =
        (inst.name && inst.name.toLowerCase().includes(q)) ||
        (inst.aictePermanentId && inst.aictePermanentId.toLowerCase().includes(q)) ||
        (inst.district && inst.district.toLowerCase().includes(q));
      if (!match) return false;
    }
    if (selectedState && inst.state !== selectedState) return false;
    if (selectedType && inst.institutionType !== selectedType) return false;
    return true;
  });

  // Unique states and types for filters
  const uniqueStates = Array.from(new Set(institutions.map((i) => i.state).filter(Boolean)));
  const uniqueTypes = Array.from(new Set(institutions.map((i) => i.institutionType).filter(Boolean)));

  const handleOpenDetails = async (inst: Institution) => {
    setLoadingDetails(true);
    try {
      const details = await api.getInstitutionDetails(inst.id);
      setSelectedInstDetails(details);
    } catch (err) {
      console.error(err);
      alert('Failed to load institution details');
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleCheckDuplicates = async (name?: string, aicteId?: string) => {
    if (!name && !aicteId) return;
    try {
      const dupes = await api.checkInstitutionDuplicates(name, aicteId, editingInst?.id);
      setDupeWarning(dupes);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveInstitution = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitting(true);
    try {
      if (editingInst) {
        await api.updateInstitution(editingInst.id, formData);
      } else {
        await api.createInstitution(formData);
      }
      setShowAddModal(false);
      setEditingInst(null);
      onRefresh();
    } catch (err) {
      console.error(err);
      alert('Failed to save institution record');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleStartEdit = (inst: Institution) => {
    setEditingInst(inst);
    setFormData(inst);
    setShowAddModal(true);
    setDupeWarning([]);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-[#0f2e5a] flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-700" />
            AICTE Central Institution Registry
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Internal repository of institutions submitting mandatory security deposits and FDRs.
            <span className="font-semibold text-amber-700 ml-1.5">(Internal records only — no institution login permitted)</span>
          </p>
        </div>

        {userRole === 'ROLE_ADMIN' && (
          <button
            onClick={() => {
              setEditingInst(null);
              setFormData({
                name: '',
                aictePermanentId: '',
                currentApplicationId: '',
                institutionType: 'Engineering & Technology',
                state: '',
                district: '',
                pincode: '',
                address: '',
                headName: '',
                headDesignation: 'Principal / Director',
                headEmail: '',
                headPhone: '',
                registrarEmail: '',
                approvalStatus: 'Approved (EoA 2026-27)',
                administrativeNotes: ''
              });
              setDupeWarning([]);
              setShowAddModal(true);
            }}
            className="px-4 py-2 bg-[#0f2e5a] hover:bg-[#1e3a8a] text-white font-bold text-xs rounded-lg transition shadow-xs flex items-center gap-1.5 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Register Institution</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Institution Name, AICTE Permanent ID (e.g. 1-10928472), or District..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All States ({uniqueStates.length})</option>
            {uniqueStates.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Categories</option>
            {uniqueTypes.map((tp) => (
              <option key={tp} value={tp}>
                {tp}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Institutions Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">AICTE Perm ID</th>
                <th className="py-3 px-4">Institution Name & Location</th>
                <th className="py-3 px-4">Type / Category</th>
                <th className="py-3 px-4">Head of Institution</th>
                <th className="py-3 px-4">Approval Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No institutions matching the selected criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((inst) => (
                  <tr key={inst.id} className="hover:bg-slate-50 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-900">
                      {inst.aictePermanentId}
                    </td>
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="font-bold text-slate-800 leading-snug">{inst.name}</div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{inst.district}, {inst.state} - {inst.pincode}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">
                      <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-[11px] font-medium">
                        {inst.institutionType}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      <div className="font-semibold text-slate-800">{inst.headName}</div>
                      <div className="text-[11px] text-slate-500">{inst.headEmail}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-block text-[10px] px-2.5 py-0.5 rounded-full font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {inst.approvalStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenDetails(inst)}
                        className="px-3 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold rounded text-xs border border-blue-200 transition"
                      >
                        Profile & FDRs
                      </button>
                      {userRole === 'ROLE_ADMIN' && (
                        <button
                          onClick={() => handleStartEdit(inst)}
                          className="px-2 py-1 text-slate-600 hover:text-slate-900 font-semibold rounded text-xs hover:bg-slate-100 transition"
                          title="Edit Institution"
                        >
                          <Edit className="w-3.5 h-3.5 inline" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Comprehensive Institution Profile Modal */}
      {selectedInstDetails && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 bg-[#0f2e5a] text-white flex justify-between items-start">
              <div>
                <div className="text-xs font-semibold text-amber-300 font-mono">
                  AICTE PERMANENT ID: {selectedInstDetails.institution.aictePermanentId}
                </div>
                <h3 className="text-lg font-bold mt-0.5">
                  {selectedInstDetails.institution.name}
                </h3>
                <p className="text-xs text-blue-100 mt-1">
                  {selectedInstDetails.institution.address}, {selectedInstDetails.institution.district}, {selectedInstDetails.institution.state} - {selectedInstDetails.institution.pincode}
                </p>
              </div>
              <button
                onClick={() => setSelectedInstDetails(null)}
                className="text-white/80 hover:text-white p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              {/* Summary Banner */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                  <div className="text-[11px] font-semibold text-slate-500 uppercase">Total Deposit Value</div>
                  <div className="text-lg font-extrabold text-[#0f2e5a] mt-0.5">
                    {formatInrCompact(selectedInstDetails.totalDepositAmount)}
                  </div>
                  <div className="text-[10px] text-slate-600 font-mono mt-0.5">
                    {formatInr(selectedInstDetails.totalDepositAmount)}
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                  <div className="text-[11px] font-semibold text-slate-500 uppercase">Active Instruments</div>
                  <div className="text-lg font-extrabold text-emerald-800 mt-0.5">
                    {selectedInstDetails.fdrs.length} Instruments
                  </div>
                  <div className="text-[10px] text-emerald-700 mt-0.5">Under AICTE Joint Lien</div>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="text-[11px] font-semibold text-slate-500 uppercase">Approval Lifecycle</div>
                  <div className="text-sm font-bold text-slate-800 mt-1">
                    {selectedInstDetails.institution.approvalStatus}
                  </div>
                  <div className="text-[10px] text-slate-500">EoA Compliance Verified</div>
                </div>
              </div>

              {/* Contact Details */}
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500">Head of Institution</span>
                  <div className="font-bold text-slate-800 text-xs mt-0.5">{selectedInstDetails.institution.headName}</div>
                  <div className="text-slate-600 text-[11px]">{selectedInstDetails.institution.headDesignation}</div>
                  <div className="text-slate-600 text-[11px] mt-0.5">{selectedInstDetails.institution.headEmail}</div>
                  <div className="text-slate-600 text-[11px]">{selectedInstDetails.institution.headPhone}</div>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500">Institution Category</span>
                  <div className="font-bold text-slate-800 text-xs mt-0.5">{selectedInstDetails.institution.institutionType}</div>
                  <div className="text-slate-600 text-[11px] mt-1">
                    Application ID: <span className="font-mono font-semibold">{selectedInstDetails.institution.currentApplicationId}</span>
                  </div>
                  <div className="text-slate-600 text-[11px]">
                    Registrar: {selectedInstDetails.institution.registrarEmail}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500">Administrative Notes</span>
                  <p className="text-slate-700 text-[11px] mt-0.5 leading-relaxed italic">
                    {selectedInstDetails.institution.administrativeNotes || 'No special administrative instructions logged.'}
                  </p>
                </div>
              </div>

              {/* Associated FDR Instruments */}
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Landmark className="w-4 h-4 text-blue-700" />
                  Associated Security Deposits & Fixed Deposit Receipts ({selectedInstDetails.fdrs.length})
                </h4>

                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-700 font-semibold uppercase text-[10px]">
                      <tr>
                        <th className="py-2 px-3">FDR Number</th>
                        <th className="py-2 px-3">Bank & Branch</th>
                        <th className="py-2 px-3">Amount</th>
                        <th className="py-2 px-3">Maturity Date</th>
                        <th className="py-2 px-3">Joint Lien</th>
                        <th className="py-2 px-3">Status</th>
                        <th className="py-2 px-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedInstDetails.fdrs.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-4 text-center text-slate-400">
                            No FDR instruments recorded for this institution yet.
                          </td>
                        </tr>
                      ) : (
                        selectedInstDetails.fdrs.map((fdr) => {
                          const statusBadge = getInstrumentStatusBadge(fdr.instrumentStatus);
                          return (
                            <tr key={fdr.id} className="hover:bg-slate-50">
                              <td className="py-2.5 px-3 font-mono font-bold text-blue-800">
                                {fdr.fdrNumber}
                              </td>
                              <td className="py-2.5 px-3">
                                <span className="font-semibold text-slate-800 block">{fdr.bankName}</span>
                                <span className="text-[10px] text-slate-500 block">{fdr.branchName}</span>
                              </td>
                              <td className="py-2.5 px-3 font-bold text-slate-800">
                                {formatInr(fdr.amount)}
                              </td>
                              <td className="py-2.5 px-3 font-mono text-slate-600">
                                {formatDate(fdr.maturityDate)}
                              </td>
                              <td className="py-2.5 px-3">
                                {fdr.jointLienMarked ? (
                                  <span className="text-emerald-700 font-semibold flex items-center gap-1 text-[11px]">
                                    <CheckCircle2 className="w-3 h-3" /> Endorsed
                                  </span>
                                ) : (
                                  <span className="text-red-600 font-semibold flex items-center gap-1 text-[11px]">
                                    <AlertTriangle className="w-3 h-3" /> Missing Lien
                                  </span>
                                )}
                              </td>
                              <td className="py-2.5 px-3">
                                <span className={`inline-block text-[10px] px-2 py-0.5 rounded-full border font-semibold ${statusBadge.bg} ${statusBadge.text} ${statusBadge.border}`}>
                                  {statusBadge.label}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 text-right">
                                <button
                                  onClick={() => {
                                    setSelectedInstDetails(null);
                                    onSelectFdr(fdr);
                                  }}
                                  className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 text-blue-700 font-semibold rounded text-[11px] border border-slate-300"
                                >
                                  Open FDR
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

              {/* Associated Documents */}
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-blue-700" />
                  Institution Supporting Records ({selectedInstDetails.documents.length})
                </h4>
                <div className="border border-slate-200 rounded-lg overflow-hidden divide-y divide-slate-100">
                  {selectedInstDetails.documents.length === 0 ? (
                    <div className="p-4 text-center text-slate-400">No documents attached</div>
                  ) : (
                    selectedInstDetails.documents.map((doc) => (
                      <div key={doc.id} className="p-2.5 flex justify-between items-center text-xs hover:bg-slate-50">
                        <div>
                          <div className="font-semibold text-slate-800">{doc.title}</div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            Type: {doc.documentType} • Source: {doc.sourceReference} • Uploaded: {formatDate(doc.uploadedDate)}
                          </div>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 border font-medium">
                          v{doc.version} - {doc.status}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedInstDetails(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs rounded-lg transition"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Register / Edit Institution Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden">
            <div className="p-5 bg-[#0f2e5a] text-white flex justify-between items-center">
              <h3 className="text-base font-bold">
                {editingInst ? 'Edit Institution Profile' : 'Register New Educational Institution'}
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-white/80 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveInstitution} className="p-6 space-y-4 text-xs">
              {/* Duplicate Warning Banner */}
              {dupeWarning.length > 0 && (
                <div className="p-3 rounded-lg bg-amber-50 border border-amber-300 text-amber-900 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Possible Duplicate Record Detected:</span>
                    <p className="mt-0.5 text-[11px]">
                      An institution with similar Name or AICTE Permanent ID already exists ({dupeWarning.map((d) => `${d.name} [${d.aictePermanentId}]`).join(', ')}). Please verify before creating.
                    </p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    AICTE Permanent Institute ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 1-10928472"
                    value={formData.aictePermanentId || ''}
                    onChange={(e) => {
                      setFormData({ ...formData, aictePermanentId: e.target.value });
                      handleCheckDuplicates(formData.name, e.target.value);
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Current AICTE Application ID
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 1-4392817201"
                    value={formData.currentApplicationId || ''}
                    onChange={(e) => setFormData({ ...formData, currentApplicationId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Full Institution Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Delhi Institute of Technology & Management"
                  value={formData.name || ''}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    handleCheckDuplicates(e.target.value, formData.aictePermanentId);
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-semibold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Institution Category</label>
                  <select
                    value={formData.institutionType || 'Engineering & Technology'}
                    onChange={(e) => setFormData({ ...formData, institutionType: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="Engineering & Technology">Engineering & Technology</option>
                    <option value="Management">Management</option>
                    <option value="Pharmacy">Pharmacy</option>
                    <option value="Architecture">Architecture</option>
                    <option value="Polytechnic / Diploma">Polytechnic / Diploma</option>
                    <option value="State / Central University">State / Central University</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Approval Status</label>
                  <input
                    type="text"
                    value={formData.approvalStatus || 'Approved (EoA 2026-27)'}
                    onChange={(e) => setFormData({ ...formData, approvalStatus: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">State <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Delhi"
                    value={formData.state || ''}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">District</label>
                  <input
                    type="text"
                    placeholder="e.g. North West Delhi"
                    value={formData.district || ''}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">PIN Code</label>
                  <input
                    type="text"
                    placeholder="e.g. 110085"
                    value={formData.pincode || ''}
                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Campus Address</label>
                <input
                  type="text"
                  placeholder="Plot / Sector / Road details"
                  value={formData.address || ''}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Head of Institution</label>
                  <input
                    type="text"
                    placeholder="Principal / Director name"
                    value={formData.headName || ''}
                    onChange={(e) => setFormData({ ...formData, headName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Official Email</label>
                  <input
                    type="email"
                    placeholder="director@college.edu.in"
                    value={formData.headEmail || ''}
                    onChange={(e) => setFormData({ ...formData, headEmail: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Official Phone</label>
                  <input
                    type="text"
                    placeholder="+91..."
                    value={formData.headPhone || ''}
                    onChange={(e) => setFormData({ ...formData, headPhone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Administrative Notes</label>
                <textarea
                  rows={2}
                  placeholder="Official comments on deposit obligations, conditional EoA terms, etc."
                  value={formData.administrativeNotes || ''}
                  onChange={(e) => setFormData({ ...formData, administrativeNotes: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-600">
                <strong>Internal AICTE Notice:</strong> This profile stores official administrative data only. Educational institutions do not have system access in this V1 portal.
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-4 py-2 bg-[#0f2e5a] hover:bg-[#1e3a8a] text-white font-bold rounded-lg shadow-xs"
                >
                  {formSubmitting ? 'Saving...' : editingInst ? 'Update Record' : 'Save Institution'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
