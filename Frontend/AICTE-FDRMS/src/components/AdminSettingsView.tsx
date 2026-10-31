import React, { useState, useEffect } from 'react';
import {
  Settings,
  Users,
  Shield,
  BellRing,
  Building,
  Plus,
  Edit,
  CheckCircle2,
  X,
  Lock
} from 'lucide-react';
import { InternalUser, MasterConfiguration, BankMaster, UserRole } from '../types';
import { api } from '../services/api';

interface AdminSettingsViewProps {
  currentUser: InternalUser;
  users: InternalUser[];
  onRefreshUsers: () => void;
}

export const AdminSettingsView: React.FC<AdminSettingsViewProps> = ({
  currentUser,
  users,
  onRefreshUsers
}) => {
  const [config, setConfig] = useState<MasterConfiguration | null>(null);
  const [loading, setLoading] = useState(false);

  // User modal
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<InternalUser | null>(null);
  const [userFormData, setUserFormData] = useState<Partial<InternalUser>>({
    name: '',
    designation: '',
    email: '',
    role: 'ROLE_REVIEWER',
    bureau: 'Regulation Bureau, AICTE New Delhi',
    phone: '',
    status: 'ACTIVE'
  });

  // Reminder rules form
  const [advanceDays, setAdvanceDays] = useState('30, 60, 90');
  const [escalationDays, setEscalationDays] = useState(15);
  const [scrutinyDueDays, setScrutinyDueDays] = useState(14);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    setLoading(true);
    try {
      const cfg = await api.getMasterConfiguration();
      setConfig(cfg);
      if (cfg.advanceReminderDays) {
        setAdvanceDays(cfg.advanceReminderDays.join(', '));
      }
      setEscalationDays(cfg.escalationThresholdDays || 15);
      setScrutinyDueDays(cfg.scrutinyDueDays || 14);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await api.updateUser(editingUser.id, userFormData);
      } else {
        await api.createUser(userFormData);
      }
      setShowUserModal(false);
      setEditingUser(null);
      onRefreshUsers();
      alert('Internal AICTE user account saved successfully.');
    } catch (err) {
      console.error(err);
      alert('Failed to save user account');
    }
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!config) return;
    try {
      const days = advanceDays
        .split(',')
        .map((s) => parseInt(s.trim()))
        .filter((n) => !isNaN(n));

      const updated: MasterConfiguration = {
        ...config,
        advanceReminderDays: days,
        escalationThresholdDays: escalationDays,
        scrutinyDueDays: scrutinyDueDays
      };

      await api.updateMasterConfiguration(updated);
      loadConfig();
      alert('Master configuration & reminder rules updated successfully.');
    } catch (err) {
      console.error(err);
      alert('Failed to update configuration');
    }
  };

  if (currentUser.role !== 'ROLE_ADMIN') {
    return (
      <div className="p-12 text-center text-slate-500 bg-white rounded-xl border border-slate-200">
        <Lock className="w-10 h-10 mx-auto text-amber-500 mb-2" />
        <h3 className="text-base font-bold text-slate-800">Restricted Administration Desk</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
          Access to internal user management, reminder thresholds, and master data is restricted to Portal Administrators (ROLE_ADMIN).
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg font-bold text-[#0f2e5a] flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-700" />
            AICTE Internal Administration & Master Configuration
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Internal user account provisioning, role-based access permissions, reminder schedules, and authorized bank lists.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingUser(null);
            setUserFormData({
              name: '',
              designation: '',
              email: '',
              role: 'ROLE_REVIEWER',
              bureau: 'Regulation Bureau, AICTE New Delhi',
              phone: '',
              status: 'ACTIVE'
            });
            setShowUserModal(true);
          }}
          className="px-4 py-2 bg-[#0f2e5a] hover:bg-[#1e3a8a] text-white font-bold text-xs rounded-lg transition shadow-xs flex items-center gap-1.5 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Provision Internal User</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Internal Users Table */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center text-xs">
            <span className="font-bold text-slate-700 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-blue-700" />
              Authorized AICTE Regulation Bureau Users ({users.length})
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Official Name & Designation</th>
                  <th className="py-3 px-4">Assigned Role</th>
                  <th className="py-3 px-4">Bureau / Division</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-800">{u.name}</div>
                      <div className="text-[11px] text-slate-500">{u.designation}</div>
                      <div className="text-[10px] font-mono text-slate-400">{u.email}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-block text-[10px] px-2 py-0.5 rounded font-bold uppercase border ${
                        u.role === 'ROLE_APPROVER'
                          ? 'bg-purple-100 text-purple-800 border-purple-300'
                          : u.role === 'ROLE_ADMIN'
                          ? 'bg-amber-100 text-amber-800 border-amber-300'
                          : 'bg-blue-100 text-blue-800 border-blue-300'
                      }`}>
                        {u.role.replace('ROLE_', '')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 max-w-[180px] truncate" title={u.bureau}>
                      {u.bureau}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-block text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        u.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => {
                          setEditingUser(u);
                          setUserFormData(u);
                          setShowUserModal(true);
                        }}
                        className="px-2.5 py-1 text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded text-xs font-semibold transition"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right 1 Col: Reminder & Escalation Settings */}
        <div className="space-y-6">
          <form onSubmit={handleSaveConfig} className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4 text-xs">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <BellRing className="w-4 h-4 text-amber-600" />
              Automated Reminder & Escalation Rules
            </h4>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Advance Maturity Reminders (Days before maturity)
              </label>
              <input
                type="text"
                value={advanceDays}
                onChange={(e) => setAdvanceDays(e.target.value)}
                placeholder="e.g. 30, 60, 90"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-xs"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Comma-separated integers. Triggers reminder alerts in reviewer work queues.
              </span>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Escalation Threshold (Days Overdue)
              </label>
              <input
                type="number"
                value={escalationDays}
                onChange={(e) => setEscalationDays(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Days past maturity before escalating to Bureau Head with URGENT priority.
              </span>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Scrutiny SLA Turnaround (Days)
              </label>
              <input
                type="number"
                value={scrutinyDueDays}
                onChange={(e) => setScrutinyDueDays(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-[#0f2e5a] hover:bg-[#1e3a8a] text-white font-bold rounded-lg transition shadow-xs"
            >
              Update Reminder Rules
            </button>
          </form>

          {/* Master Reference Banks */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3 text-xs">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Building className="w-4 h-4 text-blue-700" />
              Approved Banking Institutions ({config?.authorizedBanks?.length || 0})
            </h4>

            <div className="max-h-56 overflow-y-auto divide-y divide-slate-100 text-[11px]">
              {config?.authorizedBanks?.map((bank) => (
                <div key={bank.id} className="py-1.5 flex justify-between items-center">
                  <div>
                    <span className="font-semibold text-slate-800">{bank.bankName}</span>
                    <span className="text-[10px] text-slate-400 font-mono block">IFSC: {bank.ifscPrefix}</span>
                  </div>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                    {bank.bankCategory}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* User Provisioning Modal */}
      {showUserModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg p-6 space-y-4 text-xs">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-[#0f2e5a]">
                {editingUser ? 'Edit Internal Official Account' : 'Provision Internal AICTE User'}
              </h3>
              <button onClick={() => setShowUserModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Official Full Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Smt. Kavita Sharma"
                  value={userFormData.name || ''}
                  onChange={(e) => setUserFormData({ ...userFormData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Official AICTE Email <span className="text-red-500">*</span></label>
                  <input
                    type="email"
                    required
                    placeholder="sharma.k@aicte-india.org"
                    value={userFormData.email || ''}
                    onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Designation</label>
                  <input
                    type="text"
                    placeholder="e.g. Assistant Director (Scrutiny)"
                    value={userFormData.designation || ''}
                    onChange={(e) => setUserFormData({ ...userFormData, designation: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Assigned Role <span className="text-red-500">*</span></label>
                  <select
                    value={userFormData.role || 'ROLE_REVIEWER'}
                    onChange={(e) => setUserFormData({ ...userFormData, role: e.target.value as UserRole })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-bold"
                  >
                    <option value="ROLE_REVIEWER">Scrutiny Officer / Reviewer</option>
                    <option value="ROLE_APPROVER">Competent Authority / Approver</option>
                    <option value="ROLE_ADMIN">Portal Administrator</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Account Status</label>
                  <select
                    value={userFormData.status || 'ACTIVE'}
                    onChange={(e) => setUserFormData({ ...userFormData, status: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Bureau / Regional Office</label>
                <input
                  type="text"
                  placeholder="e.g. Regulation Bureau, Headquarters New Delhi"
                  value={userFormData.bureau || ''}
                  onChange={(e) => setUserFormData({ ...userFormData, bureau: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowUserModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0f2e5a] text-white rounded-lg font-bold hover:bg-[#1e3a8a]"
                >
                  Save User Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
