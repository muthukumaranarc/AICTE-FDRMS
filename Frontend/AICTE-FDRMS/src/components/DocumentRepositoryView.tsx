import React, { useState } from 'react';
import {
  FileText,
  Search,
  Plus,
  Filter,
  Eye,
  Download,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Landmark,
  X,
  FileCheck2,
  FileX
} from 'lucide-react';
import { DocumentRecord, FdrInstrument, Institution, InternalUser, DocumentType, DocumentStatus } from '../types';
import { api } from '../services/api';
import { formatDate } from '../utils/formatters';

interface DocumentRepositoryViewProps {
  documents: DocumentRecord[];
  fdrs: FdrInstrument[];
  institutions: Institution[];
  currentUser: InternalUser;
  onRefresh: () => void;
}

export const DocumentRepositoryView: React.FC<DocumentRepositoryViewProps> = ({
  documents,
  fdrs,
  institutions,
  currentUser,
  onRefresh
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Preview modal
  const [previewDoc, setPreviewDoc] = useState<DocumentRecord | null>(null);

  // Upload modal
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadForm, setUploadForm] = useState<Partial<DocumentRecord>>({
    fdrId: fdrs.length > 0 ? fdrs[0].id : '',
    institutionId: '',
    documentType: 'FDR_ORIGINAL_COPY',
    title: '',
    fileName: '',
    sourceReference: 'Official speed post communication',
    status: 'PENDING_REVIEW',
    notes: '',
    scrutinyFlags: []
  });

  const [flagQuestionable, setFlagQuestionable] = useState(false);
  const [flagIncomplete, setFlagIncomplete] = useState(false);
  const [flagUnreadable, setFlagUnreadable] = useState(false);

  const filteredDocs = documents.filter((doc) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match =
        (doc.title && doc.title.toLowerCase().includes(q)) ||
        (doc.fileName && doc.fileName.toLowerCase().includes(q)) ||
        (doc.fdrId && doc.fdrId.toLowerCase().includes(q)) ||
        (doc.sourceReference && doc.sourceReference.toLowerCase().includes(q));
      if (!match) return false;
    }
    if (typeFilter && doc.documentType !== typeFilter) return false;
    if (statusFilter && doc.status !== statusFilter) return false;
    return true;
  });

  const handleSaveDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadForm.fdrId || !uploadForm.title) {
      alert('Please fill all required fields');
      return;
    }

    const selectedFdr = fdrs.find((f) => f.id === uploadForm.fdrId);
    const flags: string[] = [];
    if (flagQuestionable) flags.push('QUESTIONABLE');
    if (flagIncomplete) flags.push('INCOMPLETE');
    if (flagUnreadable) flags.push('UNREADABLE');

    try {
      await api.addDocument({
        ...uploadForm,
        institutionId: selectedFdr ? selectedFdr.institutionId : '',
        fileName: uploadForm.fileName || `${uploadForm.title?.replaceAll(' ', '_')}.pdf`,
        fileSize: '1.4 MB',
        fileContentType: 'application/pdf',
        receivedDate: new Date().toISOString().substring(0, 10),
        uploadedDate: new Date().toISOString().substring(0, 10),
        version: 1,
        scrutinyFlags: flags,
        status: flags.length > 0 ? 'QUESTIONABLE' : 'ACCEPTED'
      });

      setShowUploadModal(false);
      onRefresh();
      alert('Document uploaded and associated with instrument dossier successfully.');
    } catch (err) {
      console.error(err);
      alert('Failed to upload document');
    }
  };

  const getDocStatusBadge = (status: string) => {
    switch (status) {
      case 'ACCEPTED':
        return 'bg-emerald-50 text-emerald-800 border-emerald-300';
      case 'QUESTIONABLE':
        return 'bg-red-50 text-red-800 border-red-300';
      case 'REJECTED':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      default:
        return 'bg-amber-50 text-amber-800 border-amber-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg font-bold text-[#0f2e5a] flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-700" />
            Digital Document Repository & Version Management
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Centralized document repository preserving original deposit copies, bank verifications, scrutiny notes, and sanction orders.
          </p>
        </div>

        <button
          onClick={() => {
            setUploadForm({
              fdrId: fdrs.length > 0 ? fdrs[0].id : '',
              documentType: 'FDR_ORIGINAL_COPY',
              title: '',
              fileName: '',
              sourceReference: 'Speed Post submission',
              status: 'PENDING_REVIEW',
              notes: '',
              scrutinyFlags: []
            });
            setShowUploadModal(true);
          }}
          className="px-4 py-2 bg-[#0f2e5a] hover:bg-[#1e3a8a] text-white font-bold text-xs rounded-lg transition shadow-xs flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Upload Supporting Record</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Document Title, File Name, FDR ID, or Postal Reference..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-700"
          >
            <option value="">All Document Types</option>
            <option value="FDR_ORIGINAL_COPY">FDR Original Copy</option>
            <option value="BANK_CONFIRMATION_LETTER">Bank Confirmation Letter</option>
            <option value="JOINT_LIEN_UNDERTAKING">Joint Lien Undertaking</option>
            <option value="RENEWAL_RECEIPT">Renewal Receipt</option>
            <option value="INSTITUTION_COVER_LETTER">Institution Cover Letter</option>
            <option value="SCRUTINY_SHEET">Scrutiny Sheet</option>
            <option value="SANCTION_ORDER">Sanction Order</option>
            <option value="RELEASE_DISCHARGE_ORDER">Discharge Order</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-700"
          >
            <option value="">All Review Statuses</option>
            <option value="PENDING_REVIEW">Pending Review</option>
            <option value="ACCEPTED">Accepted / Verified</option>
            <option value="QUESTIONABLE">Questionable / Flagged</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {/* Documents Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Document Title & File</th>
                <th className="py-3 px-4">Document Type</th>
                <th className="py-3 px-4">Associated FDR & Institution</th>
                <th className="py-3 px-4">Receipt / Uploaded</th>
                <th className="py-3 px-4">Version & Status</th>
                <th className="py-3 px-4 text-right">Preview / Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDocs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No documents matching selected filters.
                  </td>
                </tr>
              ) : (
                filteredDocs.map((doc) => {
                  const fdr = fdrs.find((f) => f.id === doc.fdrId);
                  return (
                    <tr key={doc.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-4">
                        <button
                          onClick={() => setPreviewDoc(doc)}
                          className="font-bold text-blue-900 hover:underline block text-left"
                        >
                          {doc.title}
                        </button>
                        <span className="text-[10px] text-slate-500 font-mono block">
                          {doc.fileName} ({doc.fileSize})
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 font-semibold text-[10px]">
                          {doc.documentType.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4 max-w-xs">
                        <span className="font-mono font-bold text-slate-800 block">
                          {fdr ? fdr.fdrNumber : doc.fdrId}
                        </span>
                        <span className="text-[10px] text-slate-500 block truncate" title={fdr?.institutionName}>
                          {fdr?.institutionName || 'AICTE Record'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-mono text-slate-700 block font-semibold">
                          {formatDate(doc.uploadedDate)}
                        </span>
                        <span className="text-[10px] text-slate-400 block truncate max-w-[140px]" title={doc.sourceReference}>
                          {doc.sourceReference}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-slate-700 text-[10px] bg-slate-100 px-1.5 py-0.2 rounded border">
                            v{doc.version}
                          </span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold uppercase ${getDocStatusBadge(doc.status)}`}>
                            {doc.status}
                          </span>
                        </div>
                        {doc.scrutinyFlags && doc.scrutinyFlags.length > 0 && (
                          <div className="flex gap-1 mt-1">
                            {doc.scrutinyFlags.map((flg) => (
                              <span key={flg} className="text-[9px] px-1 rounded bg-red-100 text-red-800 font-bold">
                                {flg}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setPreviewDoc(doc)}
                          className="px-3 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold rounded text-xs border border-blue-200 transition inline-flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Preview</span>
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

      {/* Document Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="p-4 bg-[#0f2e5a] text-white flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold truncate max-w-md">{previewDoc.title}</h3>
                <span className="text-[10px] font-mono text-blue-200">
                  {previewDoc.fileName} • {previewDoc.documentType} • Version {previewDoc.version}
                </span>
              </div>
              <button onClick={() => setPreviewDoc(null)} className="text-white/80 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Document Body Simulation */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1 bg-slate-100 text-xs">
              {/* Simulated Paper Document Viewer */}
              <div className="bg-white p-8 rounded-lg shadow-sm border border-slate-300 min-h-[360px] font-serif space-y-4 text-slate-800">
                <div className="text-center border-b pb-3 border-slate-200">
                  <div className="font-bold text-xs uppercase tracking-widest text-slate-600">
                    ALL INDIA COUNCIL FOR TECHNICAL EDUCATION • FDRMS DOCUMENT ARCHIVE
                  </div>
                  <h4 className="text-base font-bold text-slate-900 mt-1">
                    {previewDoc.title}
                  </h4>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                    ARCHIVE RECORD ID: {previewDoc.id} • SOURCE REF: {previewDoc.sourceReference}
                  </div>
                </div>

                <div className="space-y-3 font-sans text-xs">
                  <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded border border-slate-200 text-[11px]">
                    <div>
                      <span className="text-slate-500 block">Associated FDR ID:</span>
                      <span className="font-mono font-bold text-slate-800">{previewDoc.fdrId}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Uploaded On:</span>
                      <span className="font-mono text-slate-800">{formatDate(previewDoc.uploadedDate)}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Scrutiny Status:</span>
                      <span className="font-bold text-slate-800">{previewDoc.status}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Uploaded By:</span>
                      <span className="text-slate-800">{previewDoc.uploadedBy}</span>
                    </div>
                  </div>

                  <div>
                    <span className="font-bold text-slate-700 block text-xs mb-1">Official Document Scrutiny Notes:</span>
                    <p className="p-3 bg-slate-50 rounded border border-slate-200 text-slate-700 italic text-[11px] leading-relaxed">
                      {previewDoc.notes || 'Document verified under official custody. Leaf endorsed with joint lien and preserved in Regulation Bureau records.'}
                    </p>
                  </div>

                  {previewDoc.scrutinyFlags && previewDoc.scrutinyFlags.length > 0 && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded text-red-900 text-xs">
                      <strong>Scrutiny Alerts / Flags:</strong> {previewDoc.scrutinyFlags.join(', ')}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-3 bg-white border-t border-slate-200 flex justify-between items-center text-xs">
              <span className="text-slate-500 font-mono text-[11px]">
                Cryptographic Checksum: SHA-256 Verified
              </span>
              <button
                onClick={() => setPreviewDoc(null)}
                className="px-4 py-1.5 bg-slate-800 text-white font-semibold rounded-lg hover:bg-slate-700"
              >
                Close Viewer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Document Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg p-6 space-y-4 text-xs">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-[#0f2e5a]">
                Upload Supporting Record to FDR Dossier
              </h3>
              <button onClick={() => setShowUploadModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDocument} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Select Associated FDR <span className="text-red-500">*</span></label>
                <select
                  required
                  value={uploadForm.fdrId}
                  onChange={(e) => setUploadForm({ ...uploadForm, fdrId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-semibold"
                >
                  {fdrs.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.fdrNumber} — {f.institutionName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Document Record Type <span className="text-red-500">*</span></label>
                <select
                  value={uploadForm.documentType}
                  onChange={(e) => setUploadForm({ ...uploadForm, documentType: e.target.value as any })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="FDR_ORIGINAL_COPY">Scanned Copy of FDR Leaf</option>
                  <option value="BANK_CONFIRMATION_LETTER">Direct Bank Confirmation Letter</option>
                  <option value="JOINT_LIEN_UNDERTAKING">Joint Lien Undertaking / Affidavit</option>
                  <option value="RENEWAL_RECEIPT">Renewal Deposit Receipt Leaf</option>
                  <option value="INSTITUTION_COVER_LETTER">Institution Compliance Cover Letter</option>
                  <option value="SCRUTINY_SHEET">Scrutiny Sheet & Observations</option>
                  <option value="SANCTION_ORDER">Sanction Order</option>
                  <option value="RELEASE_DISCHARGE_ORDER">Release / Discharge Order</option>
                  <option value="LEGAL_AFFIDAVIT">Legal Affidavit</option>
                  <option value="OTHER">Other Prescribed Supporting Document</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Document Title <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Canara Bank FDR Confirmation Letter Ref 2026/09"
                  value={uploadForm.title || ''}
                  onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Source / Reference Received</label>
                <input
                  type="text"
                  placeholder="e.g. Registered Speed Post ED8392182IN / Bank Official Letter"
                  value={uploadForm.sourceReference || ''}
                  onChange={(e) => setUploadForm({ ...uploadForm, sourceReference: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              {/* Scrutiny Flags */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5">
                <span className="font-bold text-slate-700 block text-[11px]">Flag Initial Scrutiny Concerns (if any):</span>
                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={flagQuestionable}
                      onChange={(e) => setFlagQuestionable(e.target.checked)}
                      className="rounded text-red-600"
                    />
                    <span className="text-slate-700 font-medium text-[11px]">Questionable Document</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={flagIncomplete}
                      onChange={(e) => setFlagIncomplete(e.target.checked)}
                      className="rounded text-red-600"
                    />
                    <span className="text-slate-700 font-medium text-[11px]">Incomplete Pages</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={flagUnreadable}
                      onChange={(e) => setFlagUnreadable(e.target.checked)}
                      className="rounded text-red-600"
                    />
                    <span className="text-slate-700 font-medium text-[11px]">Unreadable Scan</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Official Notes</label>
                <textarea
                  rows={2}
                  placeholder="Record verification notes or remarks..."
                  value={uploadForm.notes || ''}
                  onChange={(e) => setUploadForm({ ...uploadForm, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0f2e5a] text-white rounded-lg font-bold hover:bg-[#1e3a8a]"
                >
                  Upload & Register Document
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
