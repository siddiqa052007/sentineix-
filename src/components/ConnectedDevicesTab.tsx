import React, { useState } from 'react';
import { 
  Monitor, 
  Search, 
  ShieldCheck, 
  AlertTriangle, 
  HardDrive, 
  Server, 
  Cpu, 
  ShieldAlert, 
  CheckCircle2, 
  RefreshCw, 
  Download, 
  Eye, 
  Lock, 
  Unlock, 
  Radio, 
  Filter,
  User,
  ArrowUpDown,
  Laptop,
  Terminal,
  Bot
} from 'lucide-react';
import { useThreats } from '../context/ThreatContext';
import { Device } from '../types';
import { DeviceDetailsDrawer } from './DeviceDetailsDrawer';
import { DeviceActionModal } from './DeviceActionModal';
import { DeviceLogsDrawer } from './DeviceLogsDrawer';

export const ConnectedDevicesTab: React.FC = () => {
  const { 
    devices, 
    threats,
    connectedDevicesCount, 
    totalDevicesCount,
    healthyDevicesCount, 
    quarantinedDevicesCount, 
    warningDevicesCount, 
    offlineDevicesCount,
    criticalRiskDevicesCount,
    highRiskDevicesCount,
    mediumRiskDevicesCount,
    lowRiskDevicesCount,
    quarantineDeviceById,
    releaseDevice,
    refreshDevices,
    askAiAboutDevice,
    addToast
  } = useThreats();

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Healthy' | 'Warning' | 'Quarantined' | 'Offline'>('All');
  const [riskFilter, setRiskFilter] = useState<'All' | 'Critical' | 'High' | 'Medium' | 'Low'>('All');
  const [osFilter, setOsFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'hostname' | 'risk' | 'lastSeen'>('hostname');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Drawer state
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [isDeviceDrawerOpen, setIsDeviceDrawerOpen] = useState(false);
  const [initialDrawerTab, setInitialDrawerTab] = useState<'general' | 'network' | 'security' | 'system' | 'threats' | 'logs' | 'response' | 'overview'>('general');

  // Action Modal State
  const [actionModalDevice, setActionModalDevice] = useState<Device | null>(null);
  const [actionModalType, setActionModalType] = useState<'scan' | 'quarantine' | 'release' | null>(null);

  // Logs Drawer State
  const [logsDrawerDevice, setLogsDrawerDevice] = useState<Device | null>(null);
  const [isLogsDrawerOpen, setIsLogsDrawerOpen] = useState(false);

  // Open Drawer helper
  const handleOpenDevice = (dev: Device, tab: 'general' | 'network' | 'security' | 'system' | 'threats' | 'logs' | 'response' | 'overview' = 'general') => {
    setSelectedDevice(dev);
    setInitialDrawerTab(tab);
    setIsDeviceDrawerOpen(true);
  };

  // Export CSV Handler
  const handleExportCSV = () => {
    const headers = ['Hostname', 'User', 'Department', 'Status', 'Risk', 'Operating System', 'IP Address', 'Last Seen'];
    const rows = filteredDevices.map(d => [
      `"${d.hostname}"`,
      `"${d.assignedUser || d.department + ' Admin'}"`,
      `"${d.department}"`,
      `"${d.status}"`,
      `"${d.riskLevel}"`,
      `"${d.operatingSystem}"`,
      `"${d.ipAddress}"`,
      `"${d.lastSeen}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `sentinelx-connected-devices-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast(`📥 Exported ${filteredDevices.length} enterprise endpoints to CSV format.`, 'success');
  };

  // Filter Pipeline
  const filteredDevices = devices.filter(d => {
    // 1. Department
    if (departmentFilter !== 'All' && !d.department.toLowerCase().includes(departmentFilter.toLowerCase())) {
      return false;
    }
    // 2. Status
    if (statusFilter !== 'All' && d.status !== statusFilter) {
      return false;
    }
    // 3. Risk Level
    if (riskFilter !== 'All' && d.riskLevel !== riskFilter) {
      return false;
    }
    // 4. OS
    if (osFilter !== 'All') {
      const osLower = d.operatingSystem.toLowerCase();
      if (osFilter === 'Windows' && !osLower.includes('windows')) return false;
      if (osFilter === 'Linux' && (!osLower.includes('linux') && !osLower.includes('ubuntu') && !osLower.includes('alpine') && !osLower.includes('rhel') && !osLower.includes('debian') && !osLower.includes('centos'))) return false;
      if (osFilter === 'macOS' && !osLower.includes('mac')) return false;
    }
    // 5. Global Search
    const q = searchTerm.toLowerCase();
    const assignedUser = (d.assignedUser || d.department + ' Admin').toLowerCase();
    return d.hostname.toLowerCase().includes(q) || 
           d.ipAddress.includes(q) || 
           d.department.toLowerCase().includes(q) || 
           d.deviceId.toLowerCase().includes(q) || 
           d.operatingSystem.toLowerCase().includes(q) ||
           assignedUser.includes(q);
  }).sort((a, b) => {
    if (sortBy === 'hostname') {
      return sortOrder === 'asc' ? a.hostname.localeCompare(b.hostname) : b.hostname.localeCompare(a.hostname);
    }
    if (sortBy === 'risk') {
      const riskMap = { Critical: 4, High: 3, Medium: 2, Low: 1 };
      const diff = riskMap[b.riskLevel] - riskMap[a.riskLevel];
      return sortOrder === 'asc' ? diff : -diff;
    }
    if (sortBy === 'lastSeen') {
      return sortOrder === 'asc' ? a.lastSeen.localeCompare(b.lastSeen) : b.lastSeen.localeCompare(a.lastSeen);
    }
    return 0;
  });

  return (
    <div className="space-y-6 font-mono">
      {/* PAGE HEADER */}
      <div className="pb-4 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-white flex items-center gap-2.5 font-heading">
            <Monitor className="w-6 h-6 text-[#00D4FF]" />
            Connected Devices
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-sans">
            Monitor and manage all enterprise endpoints connected to SentinelX.
          </p>
        </div>

        {/* HEADER ACTIONS */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <button
            onClick={() => refreshDevices()}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 transition-all flex items-center gap-2 cursor-pointer shadow-lg active:scale-95"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#00D4FF]" />
            <span>Refresh Devices</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 font-bold transition-all flex items-center gap-2 cursor-pointer shadow-lg active:scale-95"
          >
            <Download className="w-3.5 h-3.5 text-[#00D4FF]" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* TOP SUMMARY CARDS (STATISTIC CARDS) */}
      <div className="space-y-3">
        {/* Row 1: Device Connection & Telemetry Status */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Card 1: Connected Devices (Online) */}
          <div
            onClick={() => {
              setStatusFilter('All');
              setRiskFilter('All');
            }}
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer group flex flex-col justify-between ${
              statusFilter === 'All' && riskFilter === 'All'
                ? 'bg-slate-900 border-[#00D4FF] shadow-[0_0_15px_rgba(0,212,255,0.2)]'
                : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase">
              <span>Connected Devices</span>
              <Server className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-2xl font-extrabold text-white mt-1.5 font-sans flex items-baseline gap-1.5">
              <span>{connectedDevicesCount}</span>
              <span className="text-xs font-mono text-slate-400 font-normal">/ {totalDevicesCount} total</span>
            </div>
            <div className="text-[10px] text-cyan-400/90 mt-1 font-mono flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>{connectedDevicesCount} Active Online</span>
            </div>
          </div>

          {/* Card 2: Healthy Devices */}
          <div
            onClick={() => {
              setStatusFilter('Healthy');
              setRiskFilter('All');
            }}
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer group flex flex-col justify-between ${
              statusFilter === 'Healthy'
                ? 'bg-emerald-950/60 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                : 'bg-slate-950/80 border-slate-800 hover:border-emerald-500/50'
            }`}
          >
            <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase">
              <span>Healthy</span>
              <ShieldCheck className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-2xl font-extrabold text-emerald-400 mt-1.5 font-sans">{healthyDevicesCount}</div>
            <div className="text-[10px] text-emerald-400/80 mt-1 font-mono">eBPF Monitored</div>
          </div>

          {/* Card 3: Warning / At Risk Devices */}
          <div
            onClick={() => {
              setStatusFilter('Warning');
              setRiskFilter('All');
            }}
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer group flex flex-col justify-between ${
              statusFilter === 'Warning'
                ? 'bg-amber-950/60 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                : 'bg-slate-950/80 border-slate-800 hover:border-amber-500/50'
            }`}
          >
            <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase">
              <span>Warning</span>
              <AlertTriangle className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-2xl font-extrabold text-amber-400 mt-1.5 font-sans">{warningDevicesCount}</div>
            <div className="text-[10px] text-amber-400/80 mt-1 font-mono">Needs Review</div>
          </div>

          {/* Card 4: Quarantined Devices */}
          <div
            onClick={() => {
              setStatusFilter('Quarantined');
              setRiskFilter('All');
            }}
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer group flex flex-col justify-between ${
              statusFilter === 'Quarantined'
                ? 'bg-rose-950/60 border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.2)]'
                : 'bg-slate-950/80 border-slate-800 hover:border-rose-500/50'
            }`}
          >
            <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase">
              <span>Quarantined</span>
              <Lock className="w-4 h-4 text-rose-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-2xl font-extrabold text-rose-400 mt-1.5 font-sans">{quarantinedDevicesCount}</div>
            <div className="text-[10px] text-rose-400/80 mt-1 font-mono">Subnet Isolated</div>
          </div>

          {/* Card 5: Offline Devices */}
          <div
            onClick={() => {
              setStatusFilter('Offline');
              setRiskFilter('All');
            }}
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer group flex flex-col justify-between ${
              statusFilter === 'Offline'
                ? 'bg-slate-800 border-slate-600 shadow-md'
                : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase">
              <span>Offline</span>
              <Server className="w-4 h-4 text-slate-500 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-2xl font-extrabold text-slate-400 mt-1.5 font-sans">{offlineDevicesCount}</div>
            <div className="text-[10px] text-slate-500 mt-1 font-mono">No Active Socket</div>
          </div>

          {/* Card 6: All Endpoints Total */}
          <div
            onClick={() => {
              setStatusFilter('All');
              setRiskFilter('All');
            }}
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer group flex flex-col justify-between bg-slate-950/80 border-slate-800 hover:border-slate-700`}
          >
            <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase">
              <span>Total Endpoints</span>
              <HardDrive className="w-4 h-4 text-slate-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-2xl font-extrabold text-slate-200 mt-1.5 font-sans">{totalDevicesCount}</div>
            <div className="text-[10px] text-slate-400 mt-1 font-mono">Registered Fleet</div>
          </div>
        </div>

        {/* Row 2: Device Risk Level Breakdown (Explicit Critical, High, Medium, Low Risk Cards) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          {/* Risk Card 1: Critical Risk */}
          <div
            onClick={() => {
              setRiskFilter('Critical');
              setStatusFilter('All');
            }}
            className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
              riskFilter === 'Critical'
                ? 'bg-rose-950 border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.3)]'
                : 'bg-slate-950/90 border-slate-800/80 hover:border-rose-500/50'
            }`}
          >
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block font-mono">Critical Risk Devices</span>
                <span className="text-xs text-slate-300 font-mono">Requires Isolation</span>
              </div>
            </div>
            <span className="text-xl font-extrabold text-rose-400 font-sans px-2.5 py-0.5 rounded-lg bg-rose-950/80 border border-rose-800/80">
              {criticalRiskDevicesCount}
            </span>
          </div>

          {/* Risk Card 2: High Risk */}
          <div
            onClick={() => {
              setRiskFilter('High');
              setStatusFilter('All');
            }}
            className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
              riskFilter === 'High'
                ? 'bg-amber-950 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                : 'bg-slate-950/90 border-slate-800/80 hover:border-amber-500/50'
            }`}
          >
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block font-mono">High Risk Devices</span>
                <span className="text-xs text-slate-300 font-mono">Elevated Exposure</span>
              </div>
            </div>
            <span className="text-xl font-extrabold text-amber-400 font-sans px-2.5 py-0.5 rounded-lg bg-amber-950/80 border border-amber-800/80">
              {highRiskDevicesCount}
            </span>
          </div>

          {/* Risk Card 3: Medium Risk */}
          <div
            onClick={() => {
              setRiskFilter('Medium');
              setStatusFilter('All');
            }}
            className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
              riskFilter === 'Medium'
                ? 'bg-blue-950 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)]'
                : 'bg-slate-950/90 border-slate-800/80 hover:border-blue-500/50'
            }`}
          >
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block font-mono">Medium Risk Devices</span>
                <span className="text-xs text-slate-300 font-mono">Moderate Profile</span>
              </div>
            </div>
            <span className="text-xl font-extrabold text-blue-400 font-sans px-2.5 py-0.5 rounded-lg bg-blue-950/80 border border-blue-800/80">
              {mediumRiskDevicesCount}
            </span>
          </div>

          {/* Risk Card 4: Low Risk */}
          <div
            onClick={() => {
              setRiskFilter('Low');
              setStatusFilter('All');
            }}
            className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
              riskFilter === 'Low'
                ? 'bg-slate-800 border-slate-500'
                : 'bg-slate-950/90 border-slate-800/80 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-slate-300 shrink-0" />
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block font-mono">Low Risk Devices</span>
                <span className="text-xs text-slate-300 font-mono">Baseline Protected</span>
              </div>
            </div>
            <span className="text-xl font-extrabold text-slate-200 font-sans px-2.5 py-0.5 rounded-lg bg-slate-900 border border-slate-700">
              {lowRiskDevicesCount}
            </span>
          </div>
        </div>
      </div>

      {/* SEARCH AND FILTERS TOOLBAR */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-3 font-sans">
        {/* Global Search Input */}
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search endpoint by Hostname, Device ID, IP Address, Assigned User, Department, or Operating System..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#00D4FF] font-sans placeholder:text-slate-600"
          />
        </div>

        {/* Dropdown Filters Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 font-mono text-xs">
          {/* Filter 1: Department */}
          <div>
            <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Department</label>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-slate-200 text-xs focus:outline-none focus:border-[#00D4FF] cursor-pointer"
            >
              <option value="All">All Departments</option>
              <option value="Finance">Finance</option>
              <option value="HR">HR</option>
              <option value="IT">IT</option>
              <option value="Marketing">Marketing</option>
              <option value="Operations">Operations</option>
              <option value="Engineering">Engineering</option>
            </select>
          </div>

          {/* Filter 2: Status */}
          <div>
            <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-slate-200 text-xs focus:outline-none focus:border-[#00D4FF] cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Healthy">Healthy</option>
              <option value="Warning">Warning</option>
              <option value="Quarantined">Quarantined</option>
              <option value="Offline">Offline</option>
            </select>
          </div>

          {/* Filter 3: Risk Level */}
          <div>
            <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Risk Level</label>
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-slate-200 text-xs focus:outline-none focus:border-[#00D4FF] cursor-pointer"
            >
              <option value="All">All Risk Levels</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          {/* Filter 4: Operating System */}
          <div>
            <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Operating System</label>
            <select
              value={osFilter}
              onChange={(e) => setOsFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-slate-200 text-xs focus:outline-none focus:border-[#00D4FF] cursor-pointer"
            >
              <option value="All">All OS Types</option>
              <option value="Windows">Windows</option>
              <option value="Linux">Linux</option>
              <option value="macOS">macOS</option>
            </select>
          </div>

          {/* Filter 5: Sort */}
          <div>
            <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Sort By</label>
            <div className="flex items-center gap-1">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2 py-1.5 text-slate-200 text-xs focus:outline-none focus:border-[#00D4FF] cursor-pointer"
              >
                <option value="hostname">Hostname</option>
                <option value="risk">Risk</option>
                <option value="lastSeen">Last Seen</option>
              </select>
              <button
                onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                className="p-1.5 bg-slate-950 border border-slate-800 rounded-xl hover:border-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
                title="Toggle Sort Order"
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* DEVICE TABLE */}
      <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/90 text-slate-400 uppercase font-bold border-b border-slate-800 text-[10px] font-mono">
              <tr>
                <th className="p-4">Hostname</th>
                <th className="p-4">Device ID</th>
                <th className="p-4">Assigned User</th>
                <th className="p-4">Department</th>
                <th className="p-4">Operating System</th>
                <th className="p-4">IP Address</th>
                <th className="p-4">Status</th>
                <th className="p-4">Risk Level</th>
                <th className="p-4">Last Seen</th>
                <th className="p-4">Running Threats</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300 font-sans">
              {filteredDevices.length === 0 ? (
                <tr>
                  <td colSpan={11} className="p-12 text-center text-slate-500 font-sans">
                    <Server className="w-10 h-10 mx-auto text-slate-600 mb-2 opacity-50" />
                    <p className="text-sm font-bold text-slate-400">No enterprise devices match your current filters.</p>
                    <button
                      onClick={() => {
                        setSearchTerm('');
                        setDepartmentFilter('All');
                        setStatusFilter('All');
                        setRiskFilter('All');
                        setOsFilter('All');
                      }}
                      className="mt-3 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-cyan-400 hover:text-cyan-300 transition-all font-mono"
                    >
                      Reset All Filters
                    </button>
                  </td>
                </tr>
              ) : (
                filteredDevices.map((dev) => {
                  const assignedUser = dev.assignedUser || `${dev.department.split(' ')[0]} Admin`;
                  const devThreats = threats.filter(t => 
                    t.deviceId === dev.deviceId || 
                    (t.deviceName && t.deviceName.toLowerCase() === dev.hostname.toLowerCase()) ||
                    t.destination.toLowerCase().includes(dev.hostname.toLowerCase())
                  );
                  const activeCount = devThreats.filter(t => t.status === 'Active' || t.status === 'Under Investigation' || t.status === 'Action Taken').length;

                  return (
                    <tr 
                      key={dev.deviceId} 
                      className="hover:bg-slate-900/80 transition-colors group cursor-pointer"
                      onClick={() => handleOpenDevice(dev, 'overview')}
                    >
                      {/* Hostname */}
                      <td className="p-4 font-bold text-white flex items-center gap-2">
                        <Cpu className="w-3.5 h-3.5 text-[#00D4FF] shrink-0" />
                        <span className="group-hover:text-[#00D4FF] transition-colors">{dev.hostname}</span>
                      </td>

                      {/* Device ID */}
                      <td className="p-4 font-mono font-bold text-cyan-300/90">{dev.deviceId}</td>

                      {/* Assigned User */}
                      <td className="p-4 text-slate-300 font-medium">{assignedUser}</td>

                      {/* Department */}
                      <td className="p-4 text-slate-400 text-[11px]">{dev.department}</td>

                      {/* Operating System */}
                      <td className="p-4 text-slate-300 text-[11px] font-mono">{dev.operatingSystem}</td>

                      {/* IP Address */}
                      <td className="p-4 font-mono text-cyan-400 font-bold">{dev.ipAddress}</td>

                      {/* Status Badge */}
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border font-bold text-[10px] uppercase font-mono ${
                          dev.status === 'Healthy' ? 'bg-emerald-950/80 text-emerald-400 border-emerald-800' :
                          dev.status === 'Quarantined' ? 'bg-rose-950/80 text-rose-300 border-rose-800' :
                          (dev.status === 'Warning' || dev.status === 'At Risk') ? 'bg-amber-950/80 text-amber-300 border-amber-800' :
                          'bg-slate-900 text-slate-500 border-slate-800'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            dev.status === 'Healthy' ? 'bg-emerald-400' :
                            dev.status === 'Quarantined' ? 'bg-rose-400 animate-pulse' :
                            (dev.status === 'Warning' || dev.status === 'At Risk') ? 'bg-amber-400 animate-pulse' :
                            'bg-slate-500'
                          }`} />
                          <span>{dev.status === 'Warning' ? 'At Risk' : dev.status}</span>
                        </span>
                      </td>

                      {/* Risk Level Badge */}
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${
                          dev.riskLevel === 'Critical' ? 'bg-rose-950 text-rose-300 border-rose-800' :
                          dev.riskLevel === 'High' ? 'bg-amber-950 text-amber-300 border-amber-800' :
                          dev.riskLevel === 'Medium' ? 'bg-blue-950 text-blue-300 border-blue-800' :
                          'bg-slate-900 text-slate-400 border-slate-800'
                        }`}>
                          {dev.riskLevel}
                        </span>
                      </td>

                      {/* Last Seen */}
                      <td className="p-4 font-mono text-slate-400 text-[11px]">{dev.lastSeen}</td>

                      {/* Running Threats */}
                      <td className="p-4 font-mono text-[11px]">
                        {activeCount > 0 ? (
                          <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 font-bold">
                            {activeCount} Active
                          </span>
                        ) : (
                          <span className="text-slate-500">None</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5 font-mono">
                          {/* View Device Details */}
                          <button
                            onClick={() => handleOpenDevice(dev, 'overview')}
                            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-300 hover:text-white transition-all cursor-pointer"
                            title="View Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Run Security Scan */}
                          {dev.status !== 'Offline' && (
                            <button
                              onClick={() => {
                                setActionModalDevice(dev);
                                setActionModalType('scan');
                              }}
                              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-300 hover:text-white transition-all cursor-pointer"
                              title="Run Security Scan"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Quarantine / Release Actions based on status */}
                          {dev.status === 'Quarantined' ? (
                            <button
                              onClick={() => {
                                setActionModalDevice(dev);
                                setActionModalType('release');
                              }}
                              className="p-1.5 rounded-lg bg-emerald-950/80 hover:bg-emerald-900/80 border border-emerald-800 text-emerald-300 transition-all cursor-pointer"
                              title="Release from Quarantine"
                            >
                              <Unlock className="w-3.5 h-3.5" />
                            </button>
                          ) : (dev.status === 'Warning' || dev.status === 'At Risk') ? (
                            <button
                              onClick={() => {
                                setActionModalDevice(dev);
                                setActionModalType('quarantine');
                              }}
                              className="p-1.5 rounded-lg bg-rose-950/80 hover:bg-rose-900/80 border border-rose-800 text-rose-300 transition-all cursor-pointer"
                              title="Quarantine Device"
                            >
                              <Lock className="w-3.5 h-3.5" />
                            </button>
                          ) : null}

                          {/* View Audit Logs */}
                          <button
                            onClick={() => {
                              setLogsDrawerDevice(dev);
                              setIsLogsDrawerOpen(true);
                            }}
                            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-400 hover:text-white transition-all cursor-pointer"
                            title="View Audit Logs"
                          >
                            <Terminal className="w-3.5 h-3.5" />
                          </button>

                          {/* Ask AI Assistant */}
                          <button
                            onClick={() => askAiAboutDevice(dev)}
                            className="p-1.5 rounded-lg bg-purple-950/80 hover:bg-purple-900 border border-purple-500/40 text-purple-300 hover:text-white transition-all cursor-pointer"
                            title="Analyze Device in AI Assistant"
                          >
                            <Bot className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DEVICE DETAILS DRAWER */}
      <DeviceDetailsDrawer
        isOpen={isDeviceDrawerOpen}
        onClose={() => setIsDeviceDrawerOpen(false)}
        device={selectedDevice}
        initialTab={initialDrawerTab}
      />

      {/* DEVICE ACTION MODAL */}
      <DeviceActionModal
        device={actionModalDevice}
        action={actionModalType}
        onClose={() => {
          setActionModalDevice(null);
          setActionModalType(null);
        }}
        onPostScanReleaseReady={() => setActionModalType('release')}
      />

      {/* DEVICE LOGS DRAWER */}
      <DeviceLogsDrawer
        isOpen={isLogsDrawerOpen}
        onClose={() => setIsLogsDrawerOpen(false)}
        device={logsDrawerDevice}
      />

    </div>
  );
};
