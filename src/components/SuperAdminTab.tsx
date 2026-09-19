import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, UserRole, UserStatus, ActivityLog } from '../types';
import { 
  ShieldCheck, 
  Users, 
  UserCheck, 
  Clock, 
  Ban, 
  Trash2, 
  RefreshCw, 
  Search, 
  Filter, 
  ShieldAlert, 
  Activity, 
  Lock, 
  Building, 
  CreditCard, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  UserPlus,
  Sliders,
  Sparkles,
  Key,
  Database
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const SuperAdminTab: React.FC = () => {
  const { 
    currentUser, 
    users, 
    activityLogs, 
    fetchUsers, 
    fetchActivityLogs, 
    approveUser, 
    rejectUser, 
    suspendUser, 
    reactivateUser, 
    deleteUser, 
    updateUserRole 
  } = useAuth();

  const [activeSubTab, setActiveSubTab] = useState<'users' | 'logs'>('users');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  useEffect(() => {
    fetchUsers();
    fetchActivityLogs();
  }, []);

  const showNotification = (text: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleApprove = async (user: User) => {
    setActionLoadingId(user.id);
    const res = await approveUser(user.id);
    setActionLoadingId(null);
    if (res.success) {
      showNotification(`Account for ${user.name} (${user.email}) approved successfully.`, 'success');
    } else {
      showNotification(res.message, 'error');
    }
  };

  const handleReject = async (user: User) => {
    setActionLoadingId(user.id);
    const res = await rejectUser(user.id);
    setActionLoadingId(null);
    if (res.success) {
      showNotification(`Account request for ${user.email} rejected.`, 'info');
    } else {
      showNotification(res.message, 'error');
    }
  };

  const handleSuspend = async (user: User) => {
    if (user.isProtectedAdmin) {
      showNotification("Permanent Super Admin account cannot be suspended.", 'error');
      return;
    }
    setActionLoadingId(user.id);
    const res = await suspendUser(user.id);
    setActionLoadingId(null);
    if (res.success) {
      showNotification(`Account for ${user.email} suspended.`, 'info');
    } else {
      showNotification(res.message, 'error');
    }
  };

  const handleReactivate = async (user: User) => {
    setActionLoadingId(user.id);
    const res = await reactivateUser(user.id);
    setActionLoadingId(null);
    if (res.success) {
      showNotification(`Account for ${user.email} reactivated.`, 'success');
    } else {
      showNotification(res.message, 'error');
    }
  };

  const handleDelete = async (user: User) => {
    if (user.isProtectedAdmin) {
      showNotification("Permanent Super Admin account cannot be deleted.", 'error');
      return;
    }
    if (!window.confirm(`Are you sure you want to PERMANENTLY delete user ${user.email}? This action cannot be undone.`)) {
      return;
    }
    setActionLoadingId(user.id);
    const res = await deleteUser(user.id);
    setActionLoadingId(null);
    if (res.success) {
      showNotification(`User ${user.email} deleted from platform.`, 'info');
    } else {
      showNotification(res.message, 'error');
    }
  };

  const handleRoleChange = async (user: User, newRole: UserRole) => {
    if (user.isProtectedAdmin) {
      showNotification("Permanent Super Admin role cannot be re-assigned.", 'error');
      return;
    }
    setActionLoadingId(user.id);
    const res = await updateUserRole(user.id, newRole);
    setActionLoadingId(null);
    if (res.success) {
      showNotification(`Updated ${user.name}'s role to ${newRole}.`, 'success');
    } else {
      showNotification(res.message, 'error');
    }
  };

  // Filter users
  const filteredUsers = users.filter(u => {
    const matchesSearch = 
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (statusFilter === 'all') return matchesSearch;
    return matchesSearch && u.status.toLowerCase() === statusFilter.toLowerCase();
  });

  // Calculate statistics
  const pendingCount = users.filter(u => u.status === 'Pending').length;
  const approvedCount = users.filter(u => u.status === 'Approved').length;
  const suspendedCount = users.filter(u => u.status === 'Suspended').length;
  const rejectedCount = users.filter(u => u.status === 'Rejected').length;

  return (
    <div className="space-y-8 font-sans max-w-7xl mx-auto">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-6 right-6 z-50 p-4 rounded-xl border font-mono text-xs flex items-center gap-3 shadow-2xl backdrop-blur-xl ${
              toastMessage.type === 'success' 
                ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200'
                : toastMessage.type === 'error'
                ? 'bg-rose-950/90 border-rose-500/50 text-rose-200'
                : 'bg-cyan-950/90 border-cyan-500/50 text-cyan-200'
            }`}
          >
            {toastMessage.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
            {toastMessage.type === 'error' && <AlertTriangle className="w-5 h-5 text-rose-400" />}
            {toastMessage.type === 'info' && <Sparkles className="w-5 h-5 text-cyan-400" />}
            <span>{toastMessage.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Banner */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-[#00D4FF]/30 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 shadow-[0_0_50px_rgba(0,212,255,0.1)] flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="space-y-2 relative z-10">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-[10px] font-mono uppercase tracking-widest text-[#00D4FF] font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#00D4FF]" />
              Permanent Super Admin Authorization
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-heading">
            Super Admin Access & Identity Control
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 font-sans max-w-2xl">
            Centralized RBAC governance. Review pending user approvals, enforce authentication rules, manage user roles, and monitor full SOC login activity.
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10 self-start md:self-auto">
          <button
            onClick={() => { fetchUsers(); fetchActivityLogs(); showNotification('Refreshed user roster and audit trails.', 'info'); }}
            className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-[#00D4FF]/40 text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer"
          >
            <RefreshCw className="w-4 h-4 text-[#00D4FF]" />
            <span>Sync Telemetry</span>
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="glass-card p-5 rounded-2xl border border-slate-800 bg-slate-950/80 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>TOTAL USERS</span>
            <Users className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white font-heading">
            {users.length}
          </div>
          <p className="text-[11px] text-slate-400">Registered across platform</p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-amber-500/30 bg-amber-950/20 space-y-2">
          <div className="flex items-center justify-between text-amber-300 text-xs font-mono">
            <span>PENDING APPROVAL</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-400 font-heading">
            {pendingCount}
          </div>
          <p className="text-[11px] text-amber-200/80">Awaiting Super Admin review</p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-emerald-500/30 bg-emerald-950/20 space-y-2">
          <div className="flex items-center justify-between text-emerald-300 text-xs font-mono">
            <span>ACTIVE APPROVED</span>
            <UserCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-heading">
            {approvedCount}
          </div>
          <p className="text-[11px] text-emerald-200/80">Granted full application access</p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-rose-500/30 bg-rose-950/20 space-y-2">
          <div className="flex items-center justify-between text-rose-300 text-xs font-mono">
            <span>SUSPENDED / REJECTED</span>
            <Ban className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-rose-400 font-heading">
            {suspendedCount + rejectedCount}
          </div>
          <p className="text-[11px] text-rose-200/80">{suspendedCount} Suspended • {rejectedCount} Rejected</p>
        </div>

      </div>

      {/* Sub-Tab Navigation Bar */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab('users')}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'users'
                ? 'bg-cyan-950 text-[#00D4FF] border border-[#00D4FF]/40 shadow-[0_0_15px_rgba(0,212,255,0.2)]'
                : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>User Accounts & Approvals ({users.length})</span>
            {pendingCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black">
                {pendingCount} Pending
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveSubTab('logs')}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'logs'
                ? 'bg-cyan-950 text-[#00D4FF] border border-[#00D4FF]/40 shadow-[0_0_15px_rgba(0,212,255,0.2)]'
                : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Login Activity & Audit Logs ({activityLogs.length})</span>
          </button>
        </div>
      </div>

      {/* TAB 1: USERS & APPROVALS */}
      {activeSubTab === 'users' && (
        <div className="space-y-6">
          
          {/* Controls: Search Bar & Status Filter */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 glass-card p-4 rounded-2xl border border-slate-800 bg-slate-950/60">
            
            {/* Search Input */}
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by name, email, company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 focus:border-[#00D4FF] rounded-xl pl-10 pr-4 py-2 text-xs text-white focus:outline-none font-sans placeholder:text-slate-500"
              />
            </div>

            {/* Status Filter Buttons */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
              {['all', 'pending', 'approved', 'suspended', 'rejected'].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-medium capitalize transition-all cursor-pointer whitespace-nowrap ${
                    statusFilter === status
                      ? 'bg-[#00D4FF] text-slate-950 font-extrabold'
                      : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>

          </div>

          {/* User Table */}
          <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden bg-slate-950/80">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/90 text-slate-400 font-mono text-[11px] uppercase tracking-wider">
                    <th className="p-4">User Details</th>
                    <th className="p-4">Company & ID</th>
                    <th className="p-4">Role Assignment</th>
                    <th className="p-4">Approval Status</th>
                    <th className="p-4">Registered Date</th>
                    <th className="p-4 text-right">Super Admin Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-200">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-12 text-center text-slate-500 font-mono">
                        No registered users matching current filter parameters.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-slate-900/40 transition-colors">
                        
                        {/* User Details */}
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={user.profilePicture || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
                              alt={user.name}
                              className="w-10 h-10 rounded-xl object-cover border border-slate-700 shrink-0"
                            />
                            <div>
                              <div className="font-bold text-white text-sm flex items-center gap-2">
                                <span>{user.name}</span>
                                {user.isProtectedAdmin && (
                                  <span className="px-2 py-0.5 rounded-md bg-purple-950 border border-purple-500/50 text-purple-300 text-[9px] font-mono font-bold flex items-center gap-1">
                                    <ShieldCheck className="w-3 h-3 text-purple-400" />
                                    PERMANENT ADMIN
                                  </span>
                                )}
                              </div>
                              <div className="text-slate-400 font-mono text-[11px]">{user.email}</div>
                            </div>
                          </div>
                        </td>

                        {/* Company & Employee ID */}
                        <td className="p-4 font-mono">
                          <div className="flex items-center gap-1.5 text-slate-300">
                            <Building className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                            <span>{user.company || 'N/A'}</span>
                          </div>
                          <div className="text-[10px] text-slate-500 mt-0.5">ID: {user.employeeId || 'N/A'}</div>
                        </td>

                        {/* Role Assignment Dropdown */}
                        <td className="p-4 font-mono">
                          {user.isProtectedAdmin ? (
                            <span className="px-3 py-1 rounded-xl bg-purple-950/80 border border-purple-800 text-purple-300 font-bold text-[11px]">
                              Super Admin
                            </span>
                          ) : (
                            <select
                              value={user.role}
                              onChange={(e) => handleRoleChange(user, e.target.value as UserRole)}
                              disabled={actionLoadingId === user.id}
                              className="bg-slate-900 border border-slate-700 text-slate-200 focus:border-[#00D4FF] rounded-xl px-2.5 py-1.5 text-xs font-mono focus:outline-none cursor-pointer hover:border-slate-600"
                            >
                              <option value="Security Analyst">Security Analyst</option>
                              <option value="Network Admin">Network Admin</option>
                              <option value="Incident Responder">Incident Responder</option>
                              <option value="Auditor">Auditor</option>
                              <option value="Super Admin">Super Admin</option>
                              <option value="User">Standard User</option>
                            </select>
                          )}
                        </td>

                        {/* Status Badge */}
                        <td className="p-4 font-mono">
                          {user.status === 'Pending' && (
                            <span className="px-3 py-1 rounded-full bg-amber-950/80 border border-amber-500/50 text-amber-300 font-bold text-[11px] inline-flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                              Pending Approval
                            </span>
                          )}
                          {user.status === 'Approved' && (
                            <span className="px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 font-bold text-[11px] inline-flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-emerald-400" />
                              Approved Access
                            </span>
                          )}
                          {user.status === 'Suspended' && (
                            <span className="px-3 py-1 rounded-full bg-rose-950/80 border border-rose-500/50 text-rose-300 font-bold text-[11px] inline-flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-rose-500" />
                              Suspended
                            </span>
                          )}
                          {user.status === 'Rejected' && (
                            <span className="px-3 py-1 rounded-full bg-slate-900 border border-slate-700 text-slate-400 font-bold text-[11px] inline-flex items-center gap-1.5">
                              <XCircle className="w-3 h-3 text-slate-500" />
                              Rejected
                            </span>
                          )}
                        </td>

                        {/* Date */}
                        <td className="p-4 font-mono text-slate-400 text-[11px]">
                          {new Date(user.createdAt).toLocaleDateString()}
                          {user.lastLoginAt && (
                            <div className="text-[10px] text-slate-500 mt-0.5">Last login: {new Date(user.lastLoginAt).toLocaleDateString()}</div>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            
                            {/* Pending User Actions */}
                            {user.status === 'Pending' && (
                              <>
                                <button
                                  onClick={() => handleApprove(user)}
                                  disabled={actionLoadingId === user.id}
                                  className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono font-bold text-xs flex items-center gap-1 cursor-pointer transition-all shadow-[0_0_12px_rgba(16,185,129,0.3)]"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>Approve</span>
                                </button>
                                <button
                                  onClick={() => handleReject(user)}
                                  disabled={actionLoadingId === user.id}
                                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-950 hover:text-rose-300 border border-slate-700 text-slate-300 font-mono font-bold text-xs flex items-center gap-1 cursor-pointer transition-all"
                                >
                                  <XCircle className="w-3.5 h-3.5" />
                                  <span>Reject</span>
                                </button>
                              </>
                            )}

                            {/* Approved User Actions */}
                            {user.status === 'Approved' && !user.isProtectedAdmin && (
                              <button
                                onClick={() => handleSuspend(user)}
                                disabled={actionLoadingId === user.id}
                                className="px-3 py-1.5 rounded-xl bg-amber-950/60 hover:bg-amber-900 border border-amber-800/80 text-amber-300 font-mono font-bold text-xs flex items-center gap-1 cursor-pointer transition-all"
                                title="Suspend Account"
                              >
                                <Ban className="w-3.5 h-3.5 text-amber-400" />
                                <span>Suspend</span>
                              </button>
                            )}

                            {/* Suspended User Actions */}
                            {user.status === 'Suspended' && (
                              <button
                                onClick={() => handleReactivate(user)}
                                disabled={actionLoadingId === user.id}
                                className="px-3 py-1.5 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 font-mono font-bold text-xs flex items-center gap-1 cursor-pointer transition-all"
                              >
                                <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
                                <span>Reactivate</span>
                              </button>
                            )}

                            {/* Delete Action */}
                            {!user.isProtectedAdmin && (
                              <button
                                onClick={() => handleDelete(user)}
                                disabled={actionLoadingId === user.id}
                                className="p-1.5 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 border border-transparent hover:border-rose-900/50 transition-all cursor-pointer"
                                title="Delete User Permanently"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}

                          </div>
                        </td>

                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: AUDIT & LOGIN ACTIVITY LOGS */}
      {activeSubTab === 'logs' && (
        <div className="glass-card p-6 rounded-2xl border border-slate-800 bg-slate-950/80 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="font-extrabold text-white text-base font-heading flex items-center gap-2">
                <Activity className="w-5 h-5 text-[#00D4FF]" />
                SOC System Authentication & Audit Stream
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Real-time security logs recording login attempts, pending status blocks, role changes, and admin approvals.
              </p>
            </div>

            <button
              onClick={() => fetchActivityLogs()}
              className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-xs font-mono flex items-center gap-1.5 hover:text-white"
            >
              <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
              Refresh
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase tracking-wider">
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">User Email</th>
                  <th className="py-3 px-4">Event Action</th>
                  <th className="py-3 px-4">IP Address</th>
                  <th className="py-3 px-4">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {activityLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500">
                      No security audit logs recorded yet.
                    </td>
                  </tr>
                ) : (
                  activityLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-900/40">
                      <td className="py-3 px-4 text-slate-400">{new Date(log.timestamp).toLocaleString()}</td>
                      <td className="py-3 px-4 text-white font-bold">{log.userEmail}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                          log.status === 'SUCCESS' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                          log.status === 'WARNING' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                          log.status === 'DANGER' ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                          'bg-cyan-950 text-cyan-300 border border-cyan-800'
                        }`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400">{log.ipAddress || '127.0.0.1'}</td>
                      <td className="py-3 px-4 text-slate-300">{log.details}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
