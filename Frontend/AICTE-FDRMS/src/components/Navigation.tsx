import React from 'react';
import {
  LayoutDashboard,
  Building2,
  Landmark,
  FileCheck2,
  ListTodo,
  RefreshCw,
  ArrowUpRightSquare,
  FileText,
  BarChart3,
  ShieldCheck,
  Settings,
  LucideIcon
} from 'lucide-react';
import { UserRole } from '../types';

export type NavTab =
  | 'dashboard'
  | 'institutions'
  | 'fdrs'
  | 'scrutiny'
  | 'queues'
  | 'renewals'
  | 'releases'
  | 'documents'
  | 'reports'
  | 'audit'
  | 'admin';

interface NavigationProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  userRole: UserRole;
  queueCounts?: {
    pendingVerification?: number;
    discrepancies?: number;
    upcomingExpiries?: number;
    overdueRenewals?: number;
    authorityApproval?: number;
  };
}

interface TabItem {
  id: NavTab;
  label: string;
  icon: LucideIcon;
  badge?: number;
  adminOnly?: boolean;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onSelectTab,
  userRole,
  queueCounts
}) => {
  const totalQueueAlerts =
    (queueCounts?.discrepancies || 0) + (queueCounts?.overdueRenewals || 0);

  const mainTabs: TabItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'institutions', label: 'Institution Registry', icon: Building2 },
    { id: 'fdrs', label: 'FDR Register', icon: Landmark },
    { id: 'scrutiny', label: 'Scrutiny & Verification', icon: FileCheck2 },
    {
      id: 'queues',
      label: 'Work Queues',
      icon: ListTodo,
      badge: totalQueueAlerts > 0 ? totalQueueAlerts : 2
    }
  ];

  const lifecycleTabs: TabItem[] = [
    { id: 'renewals', label: 'Renewals & Replacements', icon: RefreshCw },
    {
      id: 'releases',
      label: 'Release & Refund',
      icon: ArrowUpRightSquare,
      badge: queueCounts?.authorityApproval && queueCounts.authorityApproval > 0 ? queueCounts.authorityApproval : undefined
    }
  ];

  const recordsTabs: TabItem[] = [
    { id: 'documents', label: 'Digital Documents', icon: FileText },
    { id: 'reports', label: 'Reports & Analytics', icon: BarChart3 },
    { id: 'audit', label: 'Audit Trail', icon: ShieldCheck },
    { id: 'admin', label: 'Master Data & Settings', icon: Settings, adminOnly: true }
  ];

  const renderTabItem = (item: TabItem) => {
    if (item.adminOnly && userRole !== 'ROLE_ADMIN') return null;
    const isActive = activeTab === item.id;
    const IconComponent = item.icon;

    return (
      <button
        key={item.id}
        onClick={() => onSelectTab(item.id)}
        className={`group w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition duration-150 text-left ${
          isActive
            ? 'bg-[#edf2fe] text-[#1e40af] font-bold shadow-2xs'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 font-medium'
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <IconComponent
            className={`w-4 h-4 shrink-0 transition-colors ${
              isActive
                ? 'text-[#1e40af]'
                : 'text-slate-400 group-hover:text-slate-700'
            }`}
            strokeWidth={2}
          />
          <span className="truncate">{item.label}</span>
        </div>

        {item.badge !== undefined && item.badge > 0 && (
          <span className="w-4 h-4 rounded-full bg-[#b91c1c] text-white text-[10px] font-bold flex items-center justify-center shrink-0 ml-1.5">
            {item.badge}
          </span>
        )}
      </button>
    );
  };

  return (
    <aside className="w-60 min-w-60 bg-white border-r border-slate-200/80 h-screen sticky top-0 flex flex-col shrink-0 select-none z-20">
      {/* Top Logo Brand */}
      <div className="p-3.5 flex items-center gap-3 border-b border-slate-100">
        <img
          src="/fdrms-icon.svg"
          alt="AICTE FDRMS Official Emblem"
          className="w-10 h-10 rounded-xl shadow-xs shrink-0 object-contain"
        />
        <div className="overflow-hidden min-w-0">
          <h1 className="text-sm font-extrabold text-[#0f2e5a] leading-tight tracking-tight truncate">
            AICTE-FDRMS
          </h1>
          <p className="text-[10px] text-slate-500 font-medium leading-tight mt-0.5 truncate">
            Security Deposit Portal
          </p>
        </div>
      </div>

      {/* Navigation Groups */}
      <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
        <div className="space-y-0.5">
          {mainTabs.map(renderTabItem)}
        </div>

        <div className="pt-4">
          <p className="px-3 pb-1 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
            LIFECYCLE
          </p>
          <div className="space-y-0.5">
            {lifecycleTabs.map(renderTabItem)}
          </div>
        </div>

        <div className="pt-4">
          <p className="px-3 pb-1 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
            RECORDS
          </p>
          <div className="space-y-0.5">
            {recordsTabs.map(renderTabItem)}
          </div>
        </div>
      </nav>

      {/* Internal Security Badge at sidebar bottom */}
      <div className="p-3 border-t border-slate-100 text-[10px] text-slate-400 flex items-center justify-between">
        <span>V1.0 • Regulation Bureau</span>
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
      </div>
    </aside>
  );
};
