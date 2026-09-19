import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, FileText, Download, Filter, ShieldAlert, CheckCircle2, Lock, Terminal, Activity, Search } from 'lucide-react';
import { Device } from '../types';

interface DeviceLogsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  device: Device | null;
}

export const DeviceLogsDrawer: React.FC<DeviceLogsDrawerProps> = ({ isOpen, onClose, device }) => {
  const [filterType, setFilterType] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');

  if (!device) return null;

  // Generate realistic log events for this device
  const generatedLogs = [
    {
      id: 'log-01',
      timestamp: `${device.lastSeen === 'Just now' ? 'Just now' : device.lastSeen}`,
      category: 'Security Scans',
      level: 'INFO',
      event: 'SentinelX EDR Realtime Memory Scan',
      details: `Kernel memory buffer check completed. Hash verification clean for 1422 active processes.`,
      user: 'system/ebpf'
    },
    {
      id: 'log-02',
      timestamp: '12 mins ago',
      category: 'Policy Updates',
      level: 'INFO',
      event: 'Kernel eBPF Socket Policy Synchronized',
      details: `Applied ingress ruleset v4.19.0. IP table blacklist updated with 12 edge entries.`,
      user: 'secops-admin'
    },
    {
      id: 'log-03',
      timestamp: '34 mins ago',
      category: 'Login Events',
      level: 'NOTICE',
      event: 'PAM Key-Based SSH Authentication',
      details: `Accepted publickey for user ${device.assignedUser || 'operator'} from 10.0.1.15 port 49210 ssh2`,
      user: device.assignedUser || 'admin'
    },
    {
      id: 'log-04',
      timestamp: '1 hour ago',
      category: device.status === 'Quarantined' || device.status === 'Warning' ? 'Threat Detections' : 'Security Scans',
      level: device.status === 'Quarantined' ? 'CRITICAL' : device.status === 'Warning' ? 'WARNING' : 'INFO',
      event: device.status === 'Quarantined' ? 'Zero-Trust Network Isolation Triggered' : 'Ingress Packet Inspection Pass',
      details: device.status === 'Quarantined'
        ? `Endpoint isolated from local subnet due to malicious payload signature.`
        : `Inspected 1,204,500 packets across eth0. 0 anomaly signatures flagged.`,
      user: 'system/sentinelx'
    },
    {
      id: 'log-05',
      timestamp: '2 hours ago',
      category: 'Login Events',
      level: 'INFO',
      event: 'System Interactive Session Opened',
      details: `User session logged in via TLS 1.3 encrypted admin gateway.`,
      user: device.assignedUser || 'sysadmin'
    },
    {
      id: 'log-06',
      timestamp: '4 hours ago',
      category: 'Quarantine Events',
      level: device.status === 'Quarantined' ? 'ALERT' : 'INFO',
      event: device.status === 'Quarantined' ? 'Quarantine Enforced by SecOps Tier-2' : 'Subnet Health Verification',
      details: device.status === 'Quarantined'
        ? `MAC ${device.macAddress || '00:1A:2B:3C:4D:5E'} blocked at switch ingress port.`
        : `Switch port 24 status verified link-up speed 10Gbps full duplex.`,
      user: 'secops-soar'
    },
    {
      id: 'log-07',
      timestamp: '1 day ago',
      category: 'Policy Updates',
      level: 'INFO',
      event: 'Agent Heartbeat & Config Pull',
      details: `SentinelX Endpoint Agent v4.2.1-ebpf reporting clean integrity telemetry.`,
      user: 'agent'
    }
  ];

  const filteredLogs = generatedLogs.filter(log => {
    const matchesFilter = filterType === 'All' || log.category === filterType;
    const matchesSearch = searchTerm === '' || 
      log.event.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleExportLogs = () => {
    const logContent = filteredLogs.map(l => `[${l.timestamp}] [${l.level}] [${l.category}] (${l.user}): ${l.event} - ${l.details}`).join('\n');
    const blob = new Blob([logContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `logs-${device.hostname}-${Date.now()}.log`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end bg-slate-950/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0"
          />

          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="relative w-full max-w-2xl bg-slate-950 border-l border-slate-800 shadow-2xl h-full flex flex-col z-10"
          >
            {/* Header */}
            <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-cyan-950/60 border border-cyan-500/30 text-[#00D4FF]">
                  <Terminal className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    Device Audit Logs
                    <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-800 text-cyan-300 font-normal">
                      {device.hostname}
                    </span>
                  </h2>
                  <p className="text-xs text-slate-400 font-mono">ID: {device.deviceId} • IP: {device.ipAddress}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportLogs}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-mono font-medium text-slate-200 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Export</span>
                </button>
                <button
                  onClick={onClose}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="p-4 bg-slate-900/30 border-b border-slate-800/80 space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Filter logs by keyword, event, or user..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono placeholder:text-slate-600"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {['All', 'Security Scans', 'Threat Detections', 'Login Events', 'Quarantine Events', 'Policy Updates'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setFilterType(tab)}
                    className={`px-3 py-1 rounded-lg text-[11px] font-mono transition-all cursor-pointer ${
                      filterType === tab
                        ? 'bg-cyan-500/20 text-[#00D4FF] border border-cyan-500/40 font-bold'
                        : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Logs List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-3 font-mono text-xs">
              {filteredLogs.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <FileText className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p>No log events matched current search filter.</p>
                </div>
              ) : (
                filteredLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-all space-y-2"
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          log.level === 'CRITICAL' ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                          log.level === 'WARNING' || log.level === 'ALERT' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                          'bg-slate-800 text-cyan-300 border border-slate-700'
                        }`}>
                          {log.level}
                        </span>
                        <span className="text-slate-300 font-bold">{log.event}</span>
                      </div>
                      <span className="text-slate-500 text-[10px]">{log.timestamp}</span>
                    </div>

                    <p className="text-slate-300 leading-relaxed text-[11px] font-sans">
                      {log.details}
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-800/40">
                      <span>Category: <span className="text-slate-400">{log.category}</span></span>
                      <span>User: <span className="text-cyan-400/80">{log.user}</span></span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-900/40 text-center text-xs text-slate-500 font-mono">
              SentinelX Kernel Audit Trail • Immutable eBPF Log Pipeline
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
