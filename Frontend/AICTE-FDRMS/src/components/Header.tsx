import React, { useState, useEffect, useRef } from 'react';
import { Search, Bell, ChevronDown, CheckCircle2, Clock, AlertTriangle, Info, UserCheck } from 'lucide-react';
import { InternalUser, Notification, FdrInstrument, Institution, ReleaseRefundCase, DocumentRecord } from '../types';
import { GlobalSearch } from './GlobalSearch';
import { NavTab } from './Navigation';

interface HeaderProps {
  currentUser: InternalUser;
  availableUsers: InternalUser[];
  onSwitchUser: (user: InternalUser) => void;
  notifications: Notification[];
  unreadCount: number;
  onMarkNotificationRead: (id: string) => void;
  onMarkAllRead: () => void;
  onNavigateToEntity: (entityType: string, entityId: string) => void;
  fdrs?: FdrInstrument[];
  institutions?: Institution[];
  releaseCases?: ReleaseRefundCase[];
  documents?: DocumentRecord[];
  onSelectTab?: (tab: NavTab) => void;
  onSelectFdr?: (fdr: FdrInstrument) => void;
  onSelectInstitution?: (institutionId: string) => void;
  onSelectReleaseCase?: (releaseCase: ReleaseRefundCase) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  availableUsers,
  onSwitchUser,
  notifications,
  unreadCount,
  onMarkNotificationRead,
  onMarkAllRead,
  onNavigateToEntity,
  fdrs = [],
  institutions = [],
  releaseCases = [],
  documents = [],
  onSelectTab = () => {},
  onSelectFdr = () => {},
  onSelectInstitution = () => {},
  onSelectReleaseCase = () => {}
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);

  const notifMenuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (showNotifMenu && notifMenuRef.current && !notifMenuRef.current.contains(target)) {
        setShowNotifMenu(false);
      }
      if (showUserMenu && userMenuRef.current && !userMenuRef.current.contains(target)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifMenu, showUserMenu]);

  // Formatted date string matching "Sat, 31 Oct 2026"
  const formattedDate = new Date().toLocaleDateString('en-GB', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  // Initials for avatar circle (e.g. "SA" for Smt. Ananya Sen)
  const getInitials = (name: string) => {
    if (!name) return 'AI';
    const parts = name.replace(/^(Dr\.|Smt\.|Shri|Prof\.)\s*/i, '').trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'ROLE_APPROVER':
        return 'Advisor • Approver';
      case 'ROLE_REVIEWER':
        return 'Deputy Director • Reviewer';
      case 'ROLE_ADMIN':
        return 'Admin Officer • Administrator';
      default:
        return role;
    }
  };

  return (
    <header className="relative w-full bg-white border-b border-slate-200/80 px-6 py-2.5 flex items-center justify-between sticky top-0 z-30 select-none min-h-[57px]">
      {/* Left side anchor */}
      <div className="flex items-center gap-3 z-10 min-w-[20px]" />

      {/* Search Bar (Moved 150px left from center) */}
      <div
        className="absolute left-1/2 w-full max-w-[580px] px-4 flex justify-center pointer-events-none"
        style={{ transform: 'translateX(calc(-50% - 100px))' }}
      >
        <div className="w-full pointer-events-auto">
          <GlobalSearch
            fdrs={fdrs}
            institutions={institutions}
            releaseCases={releaseCases}
            documents={documents}
            onSelectTab={onSelectTab}
            onSelectFdr={onSelectFdr}
            onSelectInstitution={onSelectInstitution}
            onSelectReleaseCase={onSelectReleaseCase}
          />
        </div>
      </div>

      {/* Right side: Date, Notifications, User Profile */}
      <div className="flex items-center gap-4 shrink-0 z-10">
        {/* Date */}
        <span className="text-xs text-slate-500 font-medium hidden sm:inline">
          {formattedDate}
        </span>

        {/* Notifications Bell */}
        <div className="relative" ref={notifMenuRef}>
          <button
            onClick={() => {
              setShowNotifMenu(!showNotifMenu);
              setShowUserMenu(false);
            }}
            className="relative p-1.5 text-amber-500 hover:bg-slate-50 rounded-lg transition"
            title="System Notifications & Alerts"
          >
            {/* Custom yellow bell matching the reference icon */}
            <Bell className="w-4 h-4 fill-amber-400 text-amber-500" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-[#b91c1c] text-white text-[9px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center border border-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Drawer */}
          {showNotifMenu && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50 text-left">
              <div className="px-4 py-2 border-b border-slate-100 flex justify-between items-center">
                <span className="font-bold text-xs text-slate-800">Official Notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={() => {
                      onMarkAllRead();
                      setShowNotifMenu(false);
                    }}
                    className="text-[11px] text-blue-600 hover:underline font-medium"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-400">No active alerts</div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => {
                        onMarkNotificationRead(n.id);
                        if (n.relatedEntityType && n.relatedEntityId) {
                          onNavigateToEntity(n.relatedEntityType, n.relatedEntityId);
                          setShowNotifMenu(false);
                        }
                      }}
                      className={`p-3 text-xs hover:bg-slate-50 cursor-pointer transition flex items-start gap-2.5 ${
                        !n.isRead ? 'bg-blue-50/30' : ''
                      }`}
                    >
                      <div className="mt-0.5">
                        {n.severity === 'URGENT' ? (
                          <AlertTriangle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                        ) : n.severity === 'WARNING' ? (
                          <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        ) : (
                          <Info className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <p className={`font-semibold text-xs leading-snug ${!n.isRead ? 'text-slate-900 font-bold' : 'text-slate-700'}`}>
                            {n.title}
                          </p>
                          {!n.isRead && (
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0 ml-1.5 mt-1"></span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
                          {n.message}
                        </p>
                        <span className="text-[10px] text-slate-400 mt-1 block font-mono">
                          {n.createdAt}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Area */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => {
              setShowUserMenu(!showUserMenu);
              setShowNotifMenu(false);
            }}
            className="flex items-center gap-2.5 p-1 rounded-lg hover:bg-slate-50 transition"
          >
            {/* Dark Navy Avatar Circle */}
            <div className="w-7 h-7 rounded-full bg-[#0f2a59] text-white text-[11px] font-bold flex items-center justify-center shrink-0">
              {getInitials(currentUser.name)}
            </div>

            {/* Name + Designation */}
            <div className="text-left hidden sm:block">
              <div className="text-xs font-bold text-slate-900 leading-tight">
                {currentUser.name}
              </div>
              <div className="text-[10px] text-slate-400 font-medium leading-none mt-0.5">
                {getRoleDisplayName(currentUser.role)}
              </div>
            </div>
          </button>

          {/* User Switcher Dropdown (Supports testing Reviewer / Approver / Admin roles) */}
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50 text-left">
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Active Internal Officer</p>
                <p className="font-bold text-xs text-slate-900 mt-0.5">{currentUser.name}</p>
                <p className="text-[11px] text-slate-500">{currentUser.email}</p>
                <span className="inline-block mt-1 px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-semibold border border-blue-200">
                  {currentUser.role}
                </span>
              </div>

              <div className="py-1">
                <p className="px-4 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Switch Testing Persona</p>
                {availableUsers.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => {
                      onSwitchUser(u);
                      setShowUserMenu(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-xs flex items-center justify-between hover:bg-slate-50 transition ${
                      u.id === currentUser.id ? 'bg-blue-50/50 text-blue-700 font-bold' : 'text-slate-700'
                    }`}
                  >
                    <div>
                      <div className="font-semibold">{u.name}</div>
                      <div className="text-[10px] text-slate-400">{u.designation}</div>
                    </div>
                    {u.id === currentUser.id && <UserCheck className="w-3.5 h-3.5 text-blue-600" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
