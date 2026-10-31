import React, { useState } from 'react';
import {
  ShieldCheck,
  Search,
  Filter,
  Eye,
  Calendar,
  User,
  ArrowRight,
  X,
  Lock
} from 'lucide-react';
import { AuditTrailEntry } from '../types';

interface AuditTrailViewProps {
  auditEntries: AuditTrailEntry[];
}

export const AuditTrailView: React.FC<AuditTrailViewProps> = ({ auditEntries }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [entityFilter, setEntityFilter] = useState('');
  const [selectedEntry, setSelectedEntry] = useState<AuditTrailEntry | null>(null);

  const filtered = auditEntries.filter((a) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match =
        (a.details && a.details.toLowerCase().includes(q)) ||
        (a.entityId && a.entityId.toLowerCase().includes(q)) ||
        (a.performedBy && a.performedBy.toLowerCase().includes(q)) ||
        (a.id && a.id.toLowerCase().includes(q));
      if (!match) return false;
    }
    if (actionFilter && a.action !== actionFilter) return false;
    if (entityFilter && a.entityType !== entityFilter) return false;
    return true;
  });

  const uniqueActions = Array.from(new Set(auditEntries.map((a) => a.action).filter(Boolean)));
  const uniqueEntities = Array.from(new Set(auditEntries.map((a) => a.entityType).filter(Boolean)));

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'CREATE':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'APPROVE':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'VERIFY':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'RENEWAL':
        return 'bg-indigo-100 text-indigo-800 border-indigo-300';
      case 'RELEASE_RECORDED':
        return 'bg-slate-200 text-slate-800 border-slate-300';
      case 'UPDATE':
      case 'STATUS_CHANGE':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg font-bold text-[#0f2e5a] flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-700" />
            AICTE FDRMS Immutable Official Audit Trail & Record History
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Tamper-evident chronological log of all administrative creations, status transitions, scrutiny findings, and authority decisions.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-300 text-slate-600 text-xs font-mono">
          <Lock className="w-3.5 h-3.5 text-slate-500" />
          <span>READ-ONLY • WRITE RESTRICTED</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Audit ID, Entity ID, User Email, or Action Details..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-700"
          >
            <option value="">All Action Types</option>
            {uniqueActions.map((act) => (
              <option key={act} value={act}>
                {act}
              </option>
            ))}
          </select>

          <select
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
            className="text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-700"
          >
            <option value="">All Entity Types</option>
            {uniqueEntities.map((ent) => (
              <option key={ent} value={ent}>
                {ent}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Audit ID & Timestamp</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Entity Type & ID</th>
                <th className="py-3 px-4">Official (User & Role)</th>
                <th className="py-3 px-4">Audit Narrative & Summary</th>
                <th className="py-3 px-4 text-right">Diff / Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No audit records matching the search criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((entry) => (
                  <tr key={entry.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-slate-900 block">{entry.id}</span>
                      <span className="text-[10px] text-slate-400 font-mono block">{entry.timestamp}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-block text-[10px] px-2 py-0.5 rounded border font-bold uppercase ${getActionBadge(entry.action)}`}>
                        {entry.action}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-800 block">{entry.entityType}</span>
                      <span className="font-mono text-[10px] text-blue-900 block font-bold">{entry.entityId}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium text-slate-800 block truncate max-w-[160px]">{entry.performedBy}</span>
                      <span className="text-[10px] text-slate-500 font-mono block">{entry.userRole}</span>
                    </td>
                    <td className="py-3 px-4 max-w-md">
                      <p className="text-slate-700 line-clamp-2 leading-relaxed">
                        {entry.details}
                      </p>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {(entry.beforeValue || entry.afterValue) ? (
                        <button
                          onClick={() => setSelectedEntry(entry)}
                          className="px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold rounded text-xs border border-blue-200 transition"
                        >
                          View Diff
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-400 italic">No Diff</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Audit Diff Modal */}
      {selectedEntry && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg p-6 space-y-4 text-xs">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-[#0f2e5a]">Audit Entry State Diff</h3>
                <span className="text-[10px] font-mono text-slate-400">
                  {selectedEntry.id} • {selectedEntry.timestamp}
                </span>
              </div>
              <button onClick={() => setSelectedEntry(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-slate-50 rounded border border-slate-200">
                <div className="text-[10px] font-bold text-slate-500 uppercase">Action Description:</div>
                <p className="text-xs font-semibold text-slate-800 mt-0.5">{selectedEntry.details}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-red-50/50 border border-red-200">
                  <span className="text-[10px] font-bold text-red-800 uppercase block">Before Value:</span>
                  <div className="mt-1 font-mono text-slate-800 text-[11px] break-all">
                    {selectedEntry.beforeValue || '<Null / Initial Creation>'}
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-emerald-50/50 border border-emerald-200">
                  <span className="text-[10px] font-bold text-emerald-800 uppercase block">After Value:</span>
                  <div className="mt-1 font-mono text-slate-800 text-[11px] break-all">
                    {selectedEntry.afterValue || '<Empty>'}
                  </div>
                </div>
              </div>

              <div className="text-[10px] text-slate-400 flex justify-between pt-2 border-t border-slate-100">
                <span>Recorded by: {selectedEntry.performedBy} ({selectedEntry.userRole})</span>
                <span>IP: {selectedEntry.ipAddress}</span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedEntry(null)}
                className="px-4 py-1.5 bg-slate-800 text-white font-semibold rounded-lg hover:bg-slate-700"
              >
                Close Diff
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
