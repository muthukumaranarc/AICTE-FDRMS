import React, { useState, useEffect } from 'react';
import { AlertCircle, Mail, Copy, Check, X } from 'lucide-react';
import { Header } from './components/Header';
import { Navigation, NavTab } from './components/Navigation';
import { DashboardView } from './components/DashboardView';
import { InstitutionRegistryView } from './components/InstitutionRegistryView';
import { FdrRegisterView } from './components/FdrRegisterView';
import { ScrutinyWorkspaceView } from './components/ScrutinyWorkspaceView';
import { WorkQueuesView } from './components/WorkQueuesView';
import { RenewalView } from './components/RenewalView';
import { ReleaseRefundView } from './components/ReleaseRefundView';
import { DocumentRepositoryView } from './components/DocumentRepositoryView';
import { ReportsView } from './components/ReportsView';
import { AuditTrailView } from './components/AuditTrailView';
import { AdminSettingsView } from './components/AdminSettingsView';
import { GeminiAssistant } from './components/GeminiAssistant';
import { api, getCurrentUser, setCurrentUser } from './services/api';
import {
  AuditTrailEntry,
  DashboardStats,
  DocumentRecord,
  FdrInstrument,
  Institution,
  InternalUser,
  Notification,
  ReleaseRefundCase
} from './types';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [currentUser, setCurrentUserState] = useState<InternalUser>(getCurrentUser());
  const [availableUsers, setAvailableUsers] = useState<InternalUser[]>([]);

  // Main data states
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [fdrs, setFdrs] = useState<FdrInstrument[]>([]);
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [releaseCases, setReleaseCases] = useState<ReleaseRefundCase[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadNotifCount, setUnreadNotifCount] = useState<number>(0);
  const [auditEntries, setAuditEntries] = useState<AuditTrailEntry[]>([]);

  // Selection states for cross-view deep linking
  const [selectedFdrModal, setSelectedFdrModal] = useState<FdrInstrument | null>(null);
  const [targetScrutinyFdr, setTargetScrutinyFdr] = useState<FdrInstrument | null>(null);
  const [targetRenewalFdr, setTargetRenewalFdr] = useState<FdrInstrument | null>(null);
  const [targetReleaseCase, setTargetReleaseCase] = useState<ReleaseRefundCase | null>(null);

  // Prototype Notice Modal
  const [showPrototypeModal, setShowPrototypeModal] = useState(true);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const [loading, setLoading] = useState(true);

  const loadAllData = async () => {
    try {
      const [
        dashStats,
        instList,
        fdrList,
        docList,
        relList,
        userList,
        notifList,
        notifCount,
        auditList
      ] = await Promise.all([
        api.getDashboardStats().catch(() => null),
        api.getInstitutions().catch(() => []),
        api.getFdrs().catch(() => []),
        api.getDocuments().catch(() => []),
        api.getReleaseCases().catch(() => []),
        api.getUsers().catch(() => []),
        api.getNotifications().catch(() => []),
        api.getUnreadNotifCount().catch(() => 0),
        api.getAuditTrail().catch(() => [])
      ]);

      if (dashStats) setStats(dashStats);
      setInstitutions(instList);
      setFdrs(fdrList);
      setDocuments(docList);
      setReleaseCases(relList);
      if (userList.length > 0) setAvailableUsers(userList);
      setNotifications(notifList);
      setUnreadNotifCount(notifCount);
      setAuditEntries(auditList);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleSwitchUser = (user: InternalUser) => {
    setCurrentUser(user);
    setCurrentUserState(user);
    loadAllData();
  };

  const handleMarkNotificationRead = async (id: string) => {
    try {
      await api.markNotificationAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadNotifCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadNotifCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  const handleNavigateToEntity = (entityType: string, entityId: string) => {
    if (entityType === 'FDR') {
      const f = fdrs.find((x) => x.id === entityId);
      if (f) {
        setSelectedFdrModal(f);
        setActiveTab('fdrs');
      }
    } else if (entityType === 'RELEASE_CASE') {
      const c = releaseCases.find((x) => x.id === entityId);
      if (c) {
        setTargetReleaseCase(c);
        setActiveTab('releases');
      }
    } else if (entityType === 'INSTITUTION') {
      setActiveTab('institutions');
    }
  };

  // Queue counts for navigation badges
  const queueCounts = {
    pendingVerification: fdrs.filter(
      (f) =>
        f.verificationStatus === 'PENDING_SCRUTINY' ||
        f.verificationStatus === 'UNDER_REVIEW'
    ).length,
    discrepancies: fdrs.filter(
      (f) =>
        f.verificationStatus === 'DISCREPANCY_FOUND' ||
        Boolean(f.flagDiscrepancy)
    ).length,
    upcomingExpiries: fdrs.filter((f) => f.instrumentStatus === 'EXPIRING_SOON').length,
    overdueRenewals: fdrs.filter((f) => f.instrumentStatus === 'OVERDUE').length,
    authorityApproval: releaseCases.filter((c) => c.caseStatus === 'AWAITING_APPROVAL').length
  };

  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="min-h-screen bg-[#f8fafc] flex font-sans antialiased text-slate-900">
      {/* Sidebar on left matching reference UI */}
      <Navigation
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          // Reset target parameters when navigating via sidebar
          setTargetScrutinyFdr(null);
          setTargetRenewalFdr(null);
          setTargetReleaseCase(null);
        }}
        userRole={currentUser.role}
        queueCounts={queueCounts}
      />

      {/* Main Content Area on right */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top Header matching reference UI */}
        <Header
          currentUser={currentUser}
          availableUsers={availableUsers.length > 0 ? availableUsers : [currentUser]}
          onSwitchUser={handleSwitchUser}
          notifications={notifications}
          unreadCount={unreadNotifCount}
          onMarkNotificationRead={handleMarkNotificationRead}
          onMarkAllRead={handleMarkAllRead}
          onNavigateToEntity={handleNavigateToEntity}
          fdrs={fdrs}
          institutions={institutions}
          releaseCases={releaseCases}
          documents={documents}
          onSelectTab={(tab) => {
            setActiveTab(tab);
            setTargetScrutinyFdr(null);
            setTargetRenewalFdr(null);
            setTargetReleaseCase(null);
          }}
          onSelectFdr={(fdr) => {
            setSelectedFdrModal(fdr);
            setActiveTab('fdrs');
          }}
          onSelectInstitution={(_instId) => {
            setActiveTab('institutions');
          }}
          onSelectReleaseCase={(rc) => {
            setTargetReleaseCase(rc);
            setActiveTab('releases');
          }}
        />

        {/* Scrollable Main Workspace */}
        <main className="flex-1 p-5 sm:p-6 lg:p-7 max-w-[1600px] w-full">
          {loading ? (
            <div className="py-24 text-center text-slate-400">
              <div className="inline-block w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mb-3"></div>
              <p className="text-xs font-semibold text-slate-600">Connecting to AICTE FDRMS Services...</p>
            </div>
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <DashboardView
                  stats={stats}
                  currentUser={currentUser}
                  onNavigate={(tab) => setActiveTab(tab)}
                  onSelectFdr={(fdr) => {
                    setSelectedFdrModal(fdr);
                    setActiveTab('fdrs');
                  }}
                  onNewFdrClick={() => setActiveTab('fdrs')}
                  onExportClick={() => {
                    window.open('/api/reports/export/csv?type=holdings', '_blank');
                  }}
                />
              )}

            {activeTab === 'institutions' && (
              <InstitutionRegistryView
                institutions={institutions}
                onRefresh={loadAllData}
                userRole={currentUser.role}
                onSelectFdr={(fdr) => {
                  setSelectedFdrModal(fdr);
                  setActiveTab('fdrs');
                }}
              />
            )}

            {activeTab === 'fdrs' && (
              <FdrRegisterView
                fdrs={fdrs}
                institutions={institutions}
                users={availableUsers}
                onRefresh={loadAllData}
                currentUser={currentUser}
                selectedFdrModal={selectedFdrModal}
                onCloseFdrModal={() => setSelectedFdrModal(null)}
                onOpenFdrModal={(fdr) => setSelectedFdrModal(fdr)}
                onInitiateRenewal={(fdr) => {
                  setTargetRenewalFdr(fdr);
                  setActiveTab('renewals');
                }}
                onInitiateRelease={(fdr) => {
                  setActiveTab('releases');
                }}
                onInitiateVerification={(fdr) => {
                  setTargetScrutinyFdr(fdr);
                  setActiveTab('scrutiny');
                }}
              />
            )}

            {activeTab === 'scrutiny' && (
              <ScrutinyWorkspaceView
                fdrs={fdrs}
                currentUser={currentUser}
                onRefresh={loadAllData}
                targetFdr={targetScrutinyFdr}
              />
            )}

            {activeTab === 'queues' && (
              <WorkQueuesView
                currentUser={currentUser}
                users={availableUsers}
                onSelectFdr={(fdr) => {
                  setSelectedFdrModal(fdr);
                  setActiveTab('fdrs');
                }}
                onSelectReleaseCase={(c) => {
                  setTargetReleaseCase(c);
                  setActiveTab('releases');
                }}
                onRefresh={loadAllData}
              />
            )}

            {activeTab === 'renewals' && (
              <RenewalView
                fdrs={fdrs}
                currentUser={currentUser}
                onRefresh={loadAllData}
                onSelectFdr={(fdr) => {
                  setSelectedFdrModal(fdr);
                  setActiveTab('fdrs');
                }}
                targetRenewalFdr={targetRenewalFdr}
              />
            )}

            {activeTab === 'releases' && (
              <ReleaseRefundView
                cases={releaseCases}
                fdrs={fdrs}
                currentUser={currentUser}
                onRefresh={loadAllData}
                targetCase={targetReleaseCase}
              />
            )}

            {activeTab === 'documents' && (
              <DocumentRepositoryView
                documents={documents}
                fdrs={fdrs}
                institutions={institutions}
                currentUser={currentUser}
                onRefresh={loadAllData}
              />
            )}

            {activeTab === 'reports' && (
              <ReportsView
                fdrs={fdrs}
                institutions={institutions}
                onSelectFdr={(fdr) => {
                  setSelectedFdrModal(fdr);
                  setActiveTab('fdrs');
                }}
              />
            )}

            {activeTab === 'audit' && (
              <AuditTrailView auditEntries={auditEntries} />
            )}

            {activeTab === 'admin' && (
              <AdminSettingsView
                currentUser={currentUser}
                users={availableUsers}
                onRefreshUsers={loadAllData}
              />
            )}
          </>
        )}
      </main>

      {/* Prototype Notice Modal on Initial Load */}
      {showPrototypeModal && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 select-none">
          {/* Blurred Backdrop */}
          <div
            className="fixed inset-0 transition-opacity"
            style={{
              backgroundColor: 'rgba(15, 23, 42, 0.45)',
              backdropFilter: 'blur(5px)',
              WebkitBackdropFilter: 'blur(5px)'
            }}
            onClick={() => setShowPrototypeModal(false)}
          />

          {/* Modal Card */}
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-10 text-slate-800 animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="bg-slate-50 border-b border-slate-200/80 px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <img
                  src="/fdrms-icon.svg"
                  alt="AICTE FDRMS Icon"
                  className="w-8 h-8 rounded-lg shadow-xs shrink-0 object-contain"
                />
                <div>
                  <h3 className="font-bold text-sm text-[#0f2e5a]">AICTE-FDRMS Prototype</h3>
                  <p className="text-[11px] text-amber-700 font-medium">Technical Demonstration &amp; Notice</p>
                </div>
              </div>
              <button
                onClick={() => setShowPrototypeModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition"
                title="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-5 space-y-4 text-xs">
              <div className="flex justify-center py-2">
                <img
                  src="/fdrms-icon.svg"
                  alt="AICTE-FDRMS Emblem"
                  className="w-20 h-20 object-contain drop-shadow-md rounded-2xl"
                />
              </div>

              <div className="p-3 bg-amber-50/50 border border-amber-200/80 rounded-xl space-y-1 text-slate-700 leading-relaxed">
                <p className="font-bold text-slate-900 flex items-center gap-1.5">
                  <span>⚠️ Notice:</span>
                  <span>This is a prototype, not a real product.</span>
                </p>
                <p className="text-[11px] text-slate-600">
                  This portal is a working simulation prototype developed for technical demonstration and architecture evaluation.
                </p>
              </div>

              <div>
                <p className="text-slate-600 mb-1.5 font-medium">
                  If you need to contact the developer, please use this email:
                </p>
                <div className="flex items-center justify-between gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <a
                    href="mailto:m.muthukumaranarc@gmail.com"
                    className="flex items-center gap-2 text-blue-600 font-semibold hover:underline truncate"
                  >
                    <Mail className="w-4 h-4 text-blue-600 shrink-0" />
                    <span className="truncate">m.muthukumaranarc@gmail.com</span>
                  </a>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText('m.muthukumaranarc@gmail.com');
                      setCopiedEmail(true);
                      setTimeout(() => setCopiedEmail(false), 2000);
                    }}
                    className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium rounded-lg bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 shadow-2xs shrink-0 transition"
                    title="Copy email address"
                  >
                    {copiedEmail ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700 font-semibold">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-500" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setShowPrototypeModal(false)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-xs rounded-lg shadow-sm transition"
              >
                I Understand &amp; Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RAG AI Assistant with Gemini (Circle floating button in bottom-right & right-side chat drawer) */}
      <GeminiAssistant
        currentUser={currentUser}
        institutions={institutions}
        fdrs={fdrs}
        documents={documents}
        releaseCases={releaseCases}
        stats={stats}
        notifications={notifications}
        auditEntries={auditEntries}
        onSelectFdr={(fdr) => setSelectedFdrModal(fdr)}
        onSelectReleaseCase={(c) => {
          setTargetReleaseCase(c);
          setActiveTab('releases');
        }}
      />
      </div>
    </div>
  );
};

export default App;
