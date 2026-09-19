import React, { useState, useEffect } from 'react';
import { Radio, Search, Download, ChevronRight, ShieldAlert, CheckCircle2, AlertTriangle, Activity } from 'lucide-react';
import { ThreatDetailsDrawer, ThreatDetails } from './ThreatDetailsDrawer';
import { useThreats } from '../context/ThreatContext';

export const ThreatMonitorTab: React.FC = () => {
  const { threats, setActiveTab, threatFilter } = useThreats();

  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<'All' | 'Critical' | 'High' | 'Medium' | 'Low'>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Under Investigation' | 'Action Taken' | 'Resolved' | 'Archived'>('All');
  const [showActiveOnly, setShowActiveOnly] = useState(true);
  const [blockedOnly, setBlockedOnly] = useState(false);

  useEffect(() => {
    if (threatFilter?.status === 'Active') {
      setShowActiveOnly(true);
      setBlockedOnly(false);
      setStatusFilter('All');
    } else if (
      threatFilter?.status === 'Blocked' ||
      threatFilter?.status === 'Resolved' ||
      threatFilter?.status === 'Blocked & Resolved'
    ) {
      setShowActiveOnly(false);
      setBlockedOnly(true);
      setStatusFilter('All');
    }
  }, [threatFilter]);

  const [selectedThreat, setSelectedThreat] = useState<ThreatDetails | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Filter pipeline
  const filteredThreats = threats.filter(t => {
    // 1. Blocked & Resolved filter
    if (blockedOnly) {
      const isBlockedOrResolved = Boolean(
        t.blocked ||
        t.status === 'Resolved' ||
        t.status === 'Archived' ||
        t.resolved
      );
      if (!isBlockedOrResolved) {
        return false;
      }
    }

    // 2. Active filter toggle (when active incidents filter is on and not blockedOnly mode)
    if (showActiveOnly && !blockedOnly && (t.status === 'Resolved' || t.status === 'Archived' || t.resolved)) {
      return false;
    }

    // 3. Status dropdown filter
    if (statusFilter !== 'All' && t.status !== statusFilter) {
      return false;
    }

    // 4. Severity filter
    if (severityFilter !== 'All' && t.severity !== severityFilter) {
      return false;
    }

    // 5. Search query filter
    const query = searchTerm.toLowerCase();
    const matchTitle = t.title.toLowerCase().includes(query);
    const matchIp = t.sourceIp.includes(query);
    const matchDest = t.destination.toLowerCase().includes(query);
    const matchId = t.id.toLowerCase().includes(query);

    return matchTitle || matchIp || matchDest || matchId;
  });

  const handleRowClick = (threat: ThreatDetails) => {
    setSelectedThreat(threat);
    setIsDrawerOpen(true);
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white flex items-center gap-2 font-heading">
            <Radio className="w-6 h-6 text-rose-400" />
            Threat Monitor & Vector Inspection
          </h2>
          <p className="text-xs text-slate-400 mt-1 font-sans">
            Real-time inspection of anomalous socket connections intercepted at kernel layer. Click any threat row to inspect detailed analysis and execute mitigation commands.
          </p>
        </div>
        <button
          onClick={() => setActiveTab('reports')}
          className="px-3.5 py-2 bg-slate-900 border border-slate-800 text-slate-300 rounded-xl text-xs font-bold hover:text-white flex items-center gap-2 cursor-pointer self-start sm:self-center"
        >
          <Download className="w-3.5 h-3.5 text-[#00D4FF]" />
          <span>Export Incident History Log</span>
        </button>
      </div>

      {/* Filter Bar & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Filter threat vector, IP address, ID, or target pod..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#00D4FF] font-sans"
          />
        </div>

        {/* Filters Group */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Active Only Toggle Button */}
          <button
            onClick={() => {
              setBlockedOnly(false);
              setStatusFilter('All');
              setShowActiveOnly(!showActiveOnly);
            }}
            className={`px-3 py-2 rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
              showActiveOnly && !blockedOnly && statusFilter === 'All'
                ? 'bg-rose-950/80 text-rose-300 border-rose-800 shadow-[0_0_12px_rgba(244,63,94,0.2)]'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${showActiveOnly && !blockedOnly && statusFilter === 'All' ? 'bg-rose-400 animate-pulse' : 'bg-slate-500'}`} />
            <span>{showActiveOnly && !blockedOnly && statusFilter === 'All' ? 'Active Incidents Only' : 'Active Incidents'}</span>
          </button>

          {/* Blocked & Resolved Filter Button */}
          <button
            onClick={() => {
              setBlockedOnly(!blockedOnly);
              setShowActiveOnly(false);
              setStatusFilter('All');
            }}
            className={`px-3 py-2 rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
              blockedOnly
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${blockedOnly ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
            <span>{blockedOnly ? 'Blocked & Resolved' : 'Blocked & Resolved'}</span>
          </button>

          {/* Status Dropdown */}
          <div className="flex items-center bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 text-xs font-mono">
            <span className="text-slate-500 mr-2 text-[11px] font-sans">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => {
                const val = e.target.value as any;
                setStatusFilter(val);
                if (val !== 'All') {
                  setBlockedOnly(false);
                  setShowActiveOnly(false);
                }
              }}
              className="bg-transparent text-white font-bold focus:outline-none cursor-pointer"
            >
              <option value="All" className="bg-slate-950 text-white">All Statuses</option>
              <option value="Active" className="bg-slate-950 text-white">Active</option>
              <option value="Under Investigation" className="bg-slate-950 text-white">Under Investigation</option>
              <option value="Action Taken" className="bg-slate-950 text-white">Action Taken</option>
              <option value="Resolved" className="bg-slate-950 text-white">Resolved</option>
              <option value="Archived" className="bg-slate-950 text-white">Archived</option>
            </select>
          </div>

          {/* Severity Buttons */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-mono">
            {(['All', 'Critical', 'High', 'Medium', 'Low'] as const).map((sev) => (
              <button
                key={sev}
                onClick={() => setSeverityFilter(sev)}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  severityFilter === sev
                    ? 'bg-[#00D4FF] text-slate-950 font-bold shadow-[0_0_10px_rgba(0,212,255,0.3)]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Interactive Threats Table */}
      <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/90 text-slate-400 uppercase font-bold border-b border-slate-800 text-[10px] font-mono">
              <tr>
                <th className="p-4">Threat ID</th>
                <th className="p-4">Vector Type</th>
                <th className="p-4">Target Pod</th>
                <th className="p-4">Source IP</th>
                <th className="p-4">Severity</th>
                <th className="p-4">Detected At</th>
                <th className="p-4">Risk Score</th>
                <th className="p-4 text-right">Status Lifecycle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredThreats.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500 font-sans">
                    <ShieldAlert className="w-8 h-8 mx-auto text-slate-600 mb-2" />
                    <p className="text-sm font-bold text-slate-400">No matching threat records found.</p>
                    <p className="text-xs text-slate-500 mt-1">Try resetting search keywords or changing severity filters.</p>
                  </td>
                </tr>
              ) : (
                filteredThreats.map((t) => (
                  <tr 
                    key={t.id} 
                    onClick={() => handleRowClick(t)}
                    className="hover:bg-slate-900/80 transition-colors cursor-pointer group"
                  >
                    <td className="p-4 font-bold text-[#00D4FF] font-mono flex items-center gap-1.5">
                      <span>{t.id}</span>
                    </td>
                    <td className="p-4 font-semibold text-white group-hover:text-[#00D4FF] transition-colors">
                      <div className="flex items-center gap-2">
                        <span>{t.title}</span>
                        {t.blocked && (
                          <span className="px-1.5 py-0.2 rounded bg-rose-950 text-rose-400 border border-rose-800 text-[9px] font-mono font-bold">
                            IP BLOCKED
                          </span>
                        )}
                        {t.quarantined && (
                          <span className="px-1.5 py-0.2 rounded bg-amber-950 text-amber-400 border border-amber-800 text-[9px] font-mono font-bold">
                            ISOLATED
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-slate-400 font-mono">{t.destination}</td>
                    <td className="p-4 font-mono text-rose-400 font-bold">{t.sourceIp}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${
                        t.severity === 'Critical'
                          ? 'bg-rose-950/80 text-rose-400 border-rose-800'
                          : t.severity === 'High'
                          ? 'bg-amber-950/80 text-amber-400 border-amber-800'
                          : 'bg-blue-950/80 text-blue-400 border-blue-800'
                      }`}>
                        {t.severity}
                      </span>
                    </td>
                    <td className="p-4 text-slate-400 font-mono">{t.detectedAt}</td>
                    <td className="p-4 font-mono font-extrabold text-rose-400">
                      {t.riskScore} <span className="text-[10px] text-slate-500 font-normal">/ 100</span>
                    </td>
                    <td className="p-4 text-right">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border font-bold text-[10px] uppercase font-mono transition-colors ${
                        t.status === 'Resolved' || t.status === 'Archived'
                          ? 'bg-emerald-950/80 text-emerald-400 border-emerald-800'
                          : t.status === 'Action Taken'
                          ? 'bg-purple-950/80 text-purple-300 border-purple-800'
                          : t.status === 'Under Investigation'
                          ? 'bg-cyan-950/80 text-[#00D4FF] border-cyan-800'
                          : 'bg-rose-950/80 text-rose-300 border-rose-800'
                      }`}>
                        <span>{t.status}</span>
                        <ChevronRight className="w-3 h-3 text-[#00D4FF] group-hover:translate-x-0.5 transition-transform" />
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PREMIUM RIGHT-SIDE SLIDING THREAT DETAILS PANEL (DRAWER) */}
      <ThreatDetailsDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        threat={selectedThreat}
      />

    </div>
  );
};
