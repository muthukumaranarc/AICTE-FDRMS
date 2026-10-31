import React, { useState, useEffect } from 'react';
import {
  ListTodo,
  AlertTriangle,
  Clock,
  FileCheck2,
  FileQuestion,
  RefreshCw,
  ArrowUpRightSquare,
  UserCheck,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  Calendar,
  Users,
  LayoutGrid
} from 'lucide-react';
import { FdrInstrument, ReleaseRefundCase, QueueItem, InternalUser } from '../types';
import { api } from '../services/api';
import { formatInr, formatDate, getInstrumentStatusBadge, getVerificationStatusBadge, getCaseStatusBadge } from '../utils/formatters';

interface WorkQueuesViewProps {
  currentUser: InternalUser;
  users: InternalUser[];
  onSelectFdr: (fdr: FdrInstrument) => void;
  onSelectReleaseCase: (c: ReleaseRefundCase) => void;
  onRefresh: () => void;
}

export const WorkQueuesView: React.FC<WorkQueuesViewProps> = ({
  currentUser,
  users,
  onSelectFdr,
  onSelectReleaseCase,
  onRefresh
}) => {
  type QueueTab =
    | 'all'
    | 'pending-verif'
    | 'discrepancies'
    | 'missing-docs'
    | 'upcoming-expiries'
    | 'overdue-renewals'
    | 'release-scrutiny'
    | 'authority-approval';

  const [activeQueue, setActiveQueue] = useState<QueueTab>('all');

  const [pendingVerifItems, setPendingVerifItems] = useState<QueueItem[]>([]);
  const [discrepancyItems, setDiscrepancyItems] = useState<QueueItem[]>([]);
  const [missingDocItems, setMissingDocItems] = useState<QueueItem[]>([]);
  const [upcomingExpiryItems, setUpcomingExpiryItems] = useState<QueueItem[]>([]);
  const [overdueRenewalItems, setOverdueRenewalItems] = useState<QueueItem[]>([]);
  const [releaseScrutinyItems, setReleaseScrutinyItems] = useState<ReleaseRefundCase[]>([]);
  const [authorityApprovalItems, setAuthorityApprovalItems] = useState<ReleaseRefundCase[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Reassignment modal
  const [reassignModalItem, setReassignModalItem] = useState<FdrInstrument | null>(null);
  const [selectedOfficialId, setSelectedOfficialId] = useState('');

  // Unified item structure for "All" tab
  interface UnifiedQueueEntry {
    id: string;
    queueType: string;
    queueBadge: { bg: string; text: string; border: string };
    priority: string;
    ageDays: number;
    fdrNumber: string;
    institutionName: string;
    bankOrReason: string;
    amount: number;
    maturityDate?: string;
    daysToMaturity?: number;
    daysToMaturityText?: string;
    isOverdue?: boolean;
    assignedReviewer: string;
    reviewerId?: string;
    nextRequiredAction: string;
    isReleaseCase: boolean;
    rawFdr?: FdrInstrument;
    rawCase?: ReleaseRefundCase;
  }

  const allQueueItems: UnifiedQueueEntry[] = [
    ...pendingVerifItems.map((item) => ({
      id: `PV-${item.instrument.id}`,
      queueType: 'Pending Verification',
      queueBadge: { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-300' },
      priority: item.instrument.priority || 'MEDIUM',
      ageDays: item.ageDays,
      fdrNumber: item.instrument.fdrNumber,
      institutionName: item.instrument.institutionName,
      bankOrReason: item.instrument.bankName,
      amount: item.instrument.amount,
      maturityDate: item.instrument.maturityDate,
      daysToMaturity: item.daysToMaturity,
      isOverdue: item.daysToMaturity < 0,
      assignedReviewer: item.instrument.assignedReviewerName || 'Unassigned',
      reviewerId: item.instrument.assignedReviewerId,
      nextRequiredAction: item.nextRequiredAction,
      isReleaseCase: false,
      rawFdr: item.instrument
    })),
    ...discrepancyItems.map((item) => ({
      id: `DISC-${item.instrument.id}`,
      queueType: 'Discrepancy & Issue',
      queueBadge: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-300' },
      priority: item.instrument.priority || 'URGENT',
      ageDays: item.ageDays,
      fdrNumber: item.instrument.fdrNumber,
      institutionName: item.instrument.institutionName,
      bankOrReason: item.instrument.bankName,
      amount: item.instrument.amount,
      maturityDate: item.instrument.maturityDate,
      daysToMaturity: item.daysToMaturity,
      isOverdue: item.daysToMaturity < 0,
      assignedReviewer: item.instrument.assignedReviewerName || 'Unassigned',
      reviewerId: item.instrument.assignedReviewerId,
      nextRequiredAction: item.nextRequiredAction,
      isReleaseCase: false,
      rawFdr: item.instrument
    })),
    ...upcomingExpiryItems.map((item) => ({
      id: `UE-${item.instrument.id}`,
      queueType: 'Upcoming Expiry',
      queueBadge: { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-300' },
      priority: item.instrument.priority || 'HIGH',
      ageDays: item.ageDays,
      fdrNumber: item.instrument.fdrNumber,
      institutionName: item.instrument.institutionName,
      bankOrReason: item.instrument.bankName,
      amount: item.instrument.amount,
      maturityDate: item.instrument.maturityDate,
      daysToMaturity: item.daysToMaturity,
      isOverdue: false,
      assignedReviewer: item.instrument.assignedReviewerName || 'Unassigned',
      reviewerId: item.instrument.assignedReviewerId,
      nextRequiredAction: item.nextRequiredAction,
      isReleaseCase: false,
      rawFdr: item.instrument
    })),
    ...overdueRenewalItems.map((item) => ({
      id: `OD-${item.instrument.id}`,
      queueType: 'Overdue Renewal',
      queueBadge: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-300' },
      priority: item.instrument.priority || 'URGENT',
      ageDays: item.ageDays,
      fdrNumber: item.instrument.fdrNumber,
      institutionName: item.instrument.institutionName,
      bankOrReason: item.instrument.bankName,
      amount: item.instrument.amount,
      maturityDate: item.instrument.maturityDate,
      daysToMaturity: item.daysToMaturity,
      isOverdue: true,
      assignedReviewer: item.instrument.assignedReviewerName || 'Unassigned',
      reviewerId: item.instrument.assignedReviewerId,
      nextRequiredAction: item.nextRequiredAction,
      isReleaseCase: false,
      rawFdr: item.instrument
    })),
    ...releaseScrutinyItems.map((c) => ({
      id: `RS-${c.id}`,
      queueType: 'Release Scrutiny',
      queueBadge: { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-300' },
      priority: 'HIGH',
      ageDays: 14,
      fdrNumber: c.fdrNumber,
      institutionName: c.institutionName,
      bankOrReason: `Release: ${c.requestReason.replace(/_/g, ' ')}`,
      amount: c.amount,
      maturityDate: c.requestDate,
      daysToMaturity: 0,
      isOverdue: false,
      assignedReviewer: c.reviewedBy || 'Smt. Ananya Sen',
      nextRequiredAction: 'Scrutinize Compliance & Issue Recommendation',
      isReleaseCase: true,
      rawCase: c
    })),
    ...authorityApprovalItems.map((c) => ({
      id: `AA-${c.id}`,
      queueType: 'Authority Approval',
      queueBadge: { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-300' },
      priority: 'URGENT',
      ageDays: 21,
      fdrNumber: c.fdrNumber,
      institutionName: c.institutionName,
      bankOrReason: `Release: ${c.requestReason.replace(/_/g, ' ')}`,
      amount: c.amount,
      maturityDate: c.requestDate,
      daysToMaturity: 0,
      isOverdue: false,
      assignedReviewer: c.assignedReviewer || 'Dr. Rajesh Sharma',
      nextRequiredAction: 'Execute Sanction Order / Discharge Certificate',
      isReleaseCase: true,
      rawCase: c
    }))
  ];

  const loadAllQueues = async () => {
    setLoading(true);
    try {
      const [
        sum,
        pv,
        disc,
        md,
        ue,
        od,
        rs,
        aa
      ] = await Promise.all([
        api.getQueueSummary(),
        api.getPendingVerificationQueue(),
        api.getDiscrepanciesQueue(),
        api.getMissingDocumentsQueue(),
        api.getUpcomingExpiriesQueue(),
        api.getOverdueRenewalsQueue(),
        api.getReleaseScrutinyQueue(),
        api.getAuthorityApprovalQueue()
      ]);

      setSummary(sum);
      setPendingVerifItems(pv);
      setDiscrepancyItems(disc);
      setMissingDocItems(md);
      setUpcomingExpiryItems(ue);
      setOverdueRenewalItems(od);
      setReleaseScrutinyItems(rs);
      setAuthorityApprovalItems(aa);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllQueues();
  }, []);

  const handleReassign = async () => {
    if (!reassignModalItem || !selectedOfficialId) return;
    try {
      await api.assignFdrReviewer(reassignModalItem.id, selectedOfficialId);
      setReassignModalItem(null);
      loadAllQueues();
      onRefresh();
      alert('Reviewer reassigned successfully.');
    } catch (err) {
      console.error(err);
      alert('Failed to reassign reviewer');
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'HIGH':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'MEDIUM':
        return 'bg-blue-100 text-blue-800 border-blue-300';
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
            <ListTodo className="w-5 h-5 text-blue-700" />
            Consolidated AICTE Scrutiny & Action Work Queues
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Operational queues categorizing cases by required regulatory actions, deadlines, and urgency.
          </p>
        </div>

        <button
          onClick={loadAllQueues}
          className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg transition border border-slate-300 flex items-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Queues</span>
        </button>
      </div>

      {/* Supervisor Workload Summary Widget */}
      {summary && summary.workloadByOfficial && (
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
            <Users className="w-4 h-4 text-blue-600" />
            <span>Supervisor View • Official Case Load Distribution</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {Object.entries(summary.workloadByOfficial).map(([official, count]: any) => (
              <div key={official} className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex justify-between items-center text-xs">
                <div>
                  <div className="font-bold text-slate-800 leading-tight">{official}</div>
                  <div className="text-[10px] text-slate-500">Active assigned instruments</div>
                </div>
                <span className="text-base font-extrabold text-[#0f2e5a] px-2.5 py-0.5 rounded-full bg-white border border-slate-300">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Queues Navigation Bar */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveQueue('all')}
          className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition ${
            activeQueue === 'all'
              ? 'bg-[#0f2e5a] text-white shadow-xs'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <LayoutGrid className="w-3.5 h-3.5" />
          <span>All</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${activeQueue === 'all' ? 'bg-amber-400 text-slate-950 font-bold' : 'bg-slate-100 text-slate-700'}`}>
            {allQueueItems.length}
          </span>
        </button>

        <button
          onClick={() => setActiveQueue('pending-verif')}
          className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition ${
            activeQueue === 'pending-verif'
              ? 'bg-[#0f2e5a] text-white shadow-xs'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <FileCheck2 className="w-3.5 h-3.5" />
          <span>Pending Verification</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${activeQueue === 'pending-verif' ? 'bg-amber-400 text-slate-950 font-bold' : 'bg-slate-100 text-slate-700'}`}>
            {pendingVerifItems.length}
          </span>
        </button>

        <button
          onClick={() => setActiveQueue('discrepancies')}
          className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition ${
            activeQueue === 'discrepancies'
              ? 'bg-[#0f2e5a] text-white shadow-xs'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
          <span>Discrepancies & Issues</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${activeQueue === 'discrepancies' ? 'bg-red-500 text-white' : 'bg-red-100 text-red-700'}`}>
            {discrepancyItems.length}
          </span>
        </button>

        <button
          onClick={() => setActiveQueue('upcoming-expiries')}
          className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition ${
            activeQueue === 'upcoming-expiries'
              ? 'bg-[#0f2e5a] text-white shadow-xs'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Clock className="w-3.5 h-3.5 text-amber-400" />
          <span>Upcoming Expiries (30-90 Days)</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${activeQueue === 'upcoming-expiries' ? 'bg-amber-400 text-slate-950' : 'bg-amber-100 text-amber-800'}`}>
            {upcomingExpiryItems.length}
          </span>
        </button>

        <button
          onClick={() => setActiveQueue('overdue-renewals')}
          className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition ${
            activeQueue === 'overdue-renewals'
              ? 'bg-[#0f2e5a] text-white shadow-xs'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <RefreshCw className="w-3.5 h-3.5 text-red-400" />
          <span>Overdue Renewals</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${activeQueue === 'overdue-renewals' ? 'bg-red-500 text-white' : 'bg-red-100 text-red-700'}`}>
            {overdueRenewalItems.length}
          </span>
        </button>

        <button
          onClick={() => setActiveQueue('release-scrutiny')}
          className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition ${
            activeQueue === 'release-scrutiny'
              ? 'bg-[#0f2e5a] text-white shadow-xs'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <ArrowUpRightSquare className="w-3.5 h-3.5 text-purple-400" />
          <span>Release Scrutiny Queue</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${activeQueue === 'release-scrutiny' ? 'bg-purple-300 text-slate-950' : 'bg-purple-100 text-purple-800'}`}>
            {releaseScrutinyItems.length}
          </span>
        </button>

        <button
          onClick={() => setActiveQueue('authority-approval')}
          className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition ${
            activeQueue === 'authority-approval'
              ? 'bg-[#0f2e5a] text-white shadow-xs'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5 text-emerald-400" />
          <span>Authority Approval Queue</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${activeQueue === 'authority-approval' ? 'bg-emerald-400 text-slate-950' : 'bg-emerald-100 text-emerald-800'}`}>
            {authorityApprovalItems.length}
          </span>
        </button>
      </div>

      {/* Queue Items Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-slate-400">Loading queue records...</div>
        ) : (
          <div className="overflow-x-auto">
            {activeQueue === 'all' ? (
              // Consolidated Table for "All" Categories
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Queue &amp; Priority</th>
                    <th className="py-3 px-4">FDR No. / Case ID &amp; Institution</th>
                    <th className="py-3 px-4">Issuing Bank / Details</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Maturity / Target Date</th>
                    <th className="py-3 px-4">Current Reviewer</th>
                    <th className="py-3 px-4">Next Required Action</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {allQueueItems.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400">
                        No pending items across any queue.
                      </td>
                    </tr>
                  ) : (
                    allQueueItems.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50 transition">
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className={`inline-block text-[10px] px-2 py-0.5 rounded border font-bold uppercase ${getPriorityBadge(item.priority)}`}>
                              {item.priority}
                            </span>
                            <span className={`inline-block text-[10px] px-2 py-0.5 rounded-full border font-semibold ${item.queueBadge.bg} ${item.queueBadge.text} ${item.queueBadge.border}`}>
                              {item.queueType}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-500 font-mono block">
                            Age: {item.ageDays}d
                          </span>
                        </td>
                        <td className="py-3.5 px-4 max-w-xs">
                          {item.isReleaseCase ? (
                            <div>
                              <button
                                onClick={() => item.rawCase && onSelectReleaseCase(item.rawCase)}
                                className="font-mono font-bold text-purple-900 hover:underline block text-left"
                              >
                                {item.rawCase?.id}
                              </button>
                              <span className="text-[10px] font-mono text-slate-500 block">
                                Linked FDR: {item.fdrNumber}
                              </span>
                            </div>
                          ) : (
                            <button
                              onClick={() => item.rawFdr && onSelectFdr(item.rawFdr)}
                              className="font-mono font-bold text-blue-900 hover:underline block text-left"
                            >
                              {item.fdrNumber}
                            </button>
                          )}
                          <span className="text-[11px] text-slate-600 block truncate" title={item.institutionName}>
                            {item.institutionName}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-medium text-slate-800 block text-xs">{item.bankOrReason}</span>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="font-bold text-slate-900 text-xs">{formatInr(item.amount)}</span>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="font-mono font-semibold text-slate-800 block">{item.maturityDate ? formatDate(item.maturityDate) : '-'}</span>
                          {item.isOverdue ? (
                            <span className="text-[10px] text-red-600 font-bold block">Overdue by {Math.abs(item.daysToMaturity || 0)} days</span>
                          ) : item.daysToMaturity && item.daysToMaturity > 0 ? (
                            <span className="text-[10px] text-amber-700 font-medium block">{item.daysToMaturity} days to maturity</span>
                          ) : (
                            <span className="text-[10px] text-slate-500 font-medium block">{item.daysToMaturityText || 'Active Cycle'}</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-semibold text-slate-800 block">{item.assignedReviewer}</span>
                          {!item.isReleaseCase && item.rawFdr && (
                            <button
                              onClick={() => {
                                setReassignModalItem(item.rawFdr!);
                                setSelectedOfficialId(item.rawFdr!.assignedReviewerId || '');
                              }}
                              className="text-[10px] text-blue-600 hover:underline flex items-center gap-0.5 mt-0.5"
                            >
                              <UserCheck className="w-3 h-3" /> Reassign
                            </button>
                          )}
                        </td>
                        <td className="py-3.5 px-4 max-w-xs">
                          <span className="text-slate-800 font-medium block leading-tight text-xs">
                            {item.nextRequiredAction}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          {item.isReleaseCase ? (
                            <button
                              onClick={() => item.rawCase && onSelectReleaseCase(item.rawCase)}
                              className="px-3 py-1 bg-purple-50 text-purple-700 hover:bg-purple-100 font-semibold rounded text-xs border border-purple-200 transition"
                            >
                              Open Case
                            </button>
                          ) : (
                            <button
                              onClick={() => item.rawFdr && onSelectFdr(item.rawFdr!)}
                              className="px-3 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold rounded text-xs border border-blue-200 transition"
                            >
                              Inspect
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            ) : activeQueue === 'release-scrutiny' || activeQueue === 'authority-approval' ? (
              // Table for Release Cases
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Case ID</th>
                    <th className="py-3 px-4">Institution Name</th>
                    <th className="py-3 px-4">FDR Number</th>
                    <th className="py-3 px-4">Deposit Amount</th>
                    <th className="py-3 px-4">Request Reason</th>
                    <th className="py-3 px-4">Case Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {((activeQueue === 'release-scrutiny' ? releaseScrutinyItems : authorityApprovalItems) || []).length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        No cases in this queue currently.
                      </td>
                    </tr>
                  ) : (
                    (activeQueue === 'release-scrutiny' ? releaseScrutinyItems : authorityApprovalItems).map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50 transition">
                        <td className="py-3.5 px-4 font-mono font-bold text-blue-900">{c.id}</td>
                        <td className="py-3.5 px-4 font-semibold text-slate-800">{c.institutionName}</td>
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-800">{c.fdrNumber}</td>
                        <td className="py-3.5 px-4 font-bold text-slate-900">{formatInr(c.amount)}</td>
                        <td className="py-3.5 px-4 text-slate-600">{c.requestReason.replace(/_/g, ' ')}</td>
                        <td className="py-3.5 px-4">
                          <span className={`inline-block text-[10px] px-2.5 py-0.5 rounded-full border font-semibold ${getCaseStatusBadge(c.caseStatus).bg} ${getCaseStatusBadge(c.caseStatus).text} ${getCaseStatusBadge(c.caseStatus).border}`}>
                            {getCaseStatusBadge(c.caseStatus).label}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => onSelectReleaseCase(c)}
                            className="px-3 py-1 bg-purple-50 text-purple-700 hover:bg-purple-100 font-semibold rounded text-xs border border-purple-200 transition"
                          >
                            Open Case
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            ) : (
              // Table for FDR Instruments Queue
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Priority & Age</th>
                    <th className="py-3 px-4">FDR No. & Institution</th>
                    <th className="py-3 px-4">Issuing Bank & Amount</th>
                    <th className="py-3 px-4">Maturity Date</th>
                    <th className="py-3 px-4">Current Reviewer</th>
                    <th className="py-3 px-4">Next Required Action</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(
                    activeQueue === 'pending-verif'
                      ? pendingVerifItems
                      : activeQueue === 'discrepancies'
                      ? discrepancyItems
                      : activeQueue === 'missing-docs'
                      ? missingDocItems
                      : activeQueue === 'upcoming-expiries'
                      ? upcomingExpiryItems
                      : overdueRenewalItems
                  ).length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        No pending items in this queue.
                      </td>
                    </tr>
                  ) : (
                    (
                      activeQueue === 'pending-verif'
                        ? pendingVerifItems
                        : activeQueue === 'discrepancies'
                        ? discrepancyItems
                        : activeQueue === 'missing-docs'
                        ? missingDocItems
                        : activeQueue === 'upcoming-expiries'
                        ? upcomingExpiryItems
                        : overdueRenewalItems
                    ).map((item) => {
                      const fdr = item.instrument;
                      return (
                        <tr key={fdr.id} className="hover:bg-slate-50 transition">
                          <td className="py-3.5 px-4">
                            <span className={`inline-block text-[10px] px-2 py-0.5 rounded border font-bold uppercase ${getPriorityBadge(fdr.priority)}`}>
                              {fdr.priority}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono block mt-1">
                              Age: {item.ageDays}d
                            </span>
                          </td>
                          <td className="py-3.5 px-4 max-w-xs">
                            <button
                              onClick={() => onSelectFdr(fdr)}
                              className="font-mono font-bold text-blue-900 hover:underline block text-left"
                            >
                              {fdr.fdrNumber}
                            </button>
                            <span className="text-[11px] text-slate-600 block truncate" title={fdr.institutionName}>
                              {fdr.institutionName}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-bold text-slate-800 block">{formatInr(fdr.amount)}</span>
                            <span className="text-[10px] text-slate-500 block">{fdr.bankName}</span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-mono font-semibold text-slate-800 block">{formatDate(fdr.maturityDate)}</span>
                            {item.daysToMaturity < 0 ? (
                              <span className="text-[10px] text-red-600 font-bold block">Overdue by {Math.abs(item.daysToMaturity)} days</span>
                            ) : (
                              <span className="text-[10px] text-amber-700 font-medium block">{item.daysToMaturity} days to maturity</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-semibold text-slate-800 block">{fdr.assignedReviewerName || 'Unassigned'}</span>
                            <button
                              onClick={() => {
                                setReassignModalItem(fdr);
                                setSelectedOfficialId(fdr.assignedReviewerId || '');
                              }}
                              className="text-[10px] text-blue-600 hover:underline flex items-center gap-0.5 mt-0.5"
                            >
                              <UserCheck className="w-3 h-3" /> Reassign
                            </button>
                          </td>
                          <td className="py-3.5 px-4 max-w-xs">
                            <span className="text-slate-800 font-medium block leading-tight">
                              {item.nextRequiredAction}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => onSelectFdr(fdr)}
                              className="px-3 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold rounded text-xs border border-blue-200 transition"
                            >
                              Inspect
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {/* Reassign Official Modal */}
      {reassignModalItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-4 text-xs">
            <h3 className="text-base font-bold text-slate-800">
              Reassign FDR Reviewer
            </h3>
            <p className="text-slate-600">
              Select an AICTE Regulation Bureau official to take ownership of FDR: <span className="font-mono font-bold">{reassignModalItem.fdrNumber}</span>
            </p>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Select Official</label>
              <select
                value={selectedOfficialId}
                onChange={(e) => setSelectedOfficialId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
              >
                <option value="">Select official</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} — {u.designation} ({u.role.replace('ROLE_', '')})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setReassignModalItem(null)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReassign}
                className="px-4 py-2 bg-[#0f2e5a] text-white rounded-lg font-bold hover:bg-[#1e3a8a]"
              >
                Confirm Reassignment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
