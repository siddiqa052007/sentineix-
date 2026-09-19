import React, { useState } from 'react';
import { FileText, Terminal, Search, Download, RefreshCw } from 'lucide-react';
import { useThreats } from '../context/ThreatContext';

export const LogsTab: React.FC = () => {
  const { alerts, threats, blockedIps } = useThreats();
  const [logFilter, setLogFilter] = useState('');

  // Dynamically generate raw forensic syslog entries from actual threats, alerts, and blocked IPs
  const syslogEntries = [
    ...alerts.map(a => `[${a.timestamp}] [${a.severity.toUpperCase()}] [${a.source}] ${a.title}: ${a.description}`),
    ...blockedIps.map(b => `[${b.blockedAt}] [FIREWALL-BLOCK] eBPF Ingress Filter blackholed IP ${b.ip} (${b.reason})`),
    ...threats.filter(t => t.resolved).map(t => `[${t.resolvedAt || t.detectedAt}] [INCIDENT-RESOLVED] ${t.id} (${t.title}) resolved by ${t.resolvedBy || 'SecOps Admin'}`)
  ];

  const filteredLogs = syslogEntries.filter(log =>
    log.toLowerCase().includes(logFilter.toLowerCase())
  );

  return (
    <div className="space-y-6 font-mono">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2 font-heading">
            <FileText className="w-5 h-5 text-[#00D4FF]" />
            Forensic Audit & eBPF Syslog Stream
          </h2>
          <p className="text-xs text-slate-400 mt-1 font-sans">
            Immutable kernel event logs for regulatory compliance and SOC auditing. Automatically updated from live state.
          </p>
        </div>

        <button 
          onClick={() => {
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(syslogEntries, null, 2));
            const downloadAnchor = document.createElement('a');
            downloadAnchor.setAttribute("href", dataStr);
            downloadAnchor.setAttribute("download", `sentinelx_syslog_${Date.now()}.json`);
            document.body.appendChild(downloadAnchor);
            downloadAnchor.click();
            downloadAnchor.remove();
          }}
          className="px-3.5 py-2 bg-slate-900 border border-slate-800 text-slate-300 rounded-xl text-xs font-bold hover:text-white hover:border-[#00D4FF] transition-all flex items-center gap-2 cursor-pointer self-start sm:self-center"
        >
          <Download className="w-3.5 h-3.5 text-[#00D4FF]" />
          <span>Export JSON Logs</span>
        </button>
      </div>

      {/* Filter Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
        <input
          type="text"
          placeholder="Filter raw syslog stream by IP, keyword, status, or severity..."
          value={logFilter}
          onChange={(e) => setLogFilter(e.target.value)}
          className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white focus:outline-none focus:border-[#00D4FF] font-mono"
        />
      </div>

      {/* Syslog Terminal View */}
      <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300 space-y-2 overflow-x-auto shadow-2xl">
        <div className="text-[10px] text-[#00D4FF] font-bold border-b border-slate-800 pb-2 mb-2 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Terminal className="w-4 h-4" />
            <span>// STREAMING EBPF KERNEL SYSLOG (TAIL -F)</span>
          </span>
          <span className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            LIVE TELEMETRY STREAM
          </span>
        </div>

        {filteredLogs.length === 0 ? (
          <div className="py-8 text-center text-slate-500 italic">
            No syslog entries match your search query.
          </div>
        ) : (
          filteredLogs.map((log, idx) => (
            <div key={idx} className="hover:bg-slate-900/80 p-1.5 rounded transition-colors font-mono text-[11px] leading-relaxed border-l-2 border-transparent hover:border-[#00D4FF]">
              {log}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
