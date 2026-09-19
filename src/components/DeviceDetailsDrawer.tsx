import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  ShieldAlert, 
  CheckCircle2, 
  ShieldCheck, 
  HardDrive, 
  Cpu, 
  Activity, 
  Radio, 
  Lock, 
  Unlock, 
  RefreshCw, 
  FileText, 
  AlertTriangle, 
  Clock, 
  User, 
  Laptop, 
  Terminal, 
  ChevronRight,
  Loader2,
  Server,
  Globe,
  Network,
  Wifi,
  BellRing,
  Bot
} from 'lucide-react';
import { useThreats } from '../context/ThreatContext';
import { Device, ThreatDetails } from '../types';
import { DeviceLogsDrawer } from './DeviceLogsDrawer';
import { ThreatDetailsDrawer } from './ThreatDetailsDrawer';
import { DeviceActionModal } from './DeviceActionModal';

interface DeviceDetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  device: Device | null;
  initialTab?: 'general' | 'network' | 'security' | 'system' | 'threats' | 'logs' | 'response' | 'overview';
}

export const DeviceDetailsDrawer: React.FC<DeviceDetailsDrawerProps> = ({ 
  isOpen, 
  onClose, 
  device, 
  initialTab = 'general' 
}) => {
  const { 
    threats, 
    quarantineDeviceById, 
    releaseDevice, 
    notifySecurityTeam,
    askAiAboutDevice,
    addToast 
  } = useThreats();

  const [activeSubTab, setActiveSubTab] = useState<'general' | 'network' | 'security' | 'system' | 'threats' | 'logs' | 'response'>('general');

  useEffect(() => {
    if (initialTab === 'overview' || initialTab === 'general') {
      setActiveSubTab('general');
    } else if (initialTab === 'threats') {
      setActiveSubTab('threats');
    } else if (initialTab === 'network') {
      setActiveSubTab('network');
    } else if (initialTab === 'security') {
      setActiveSubTab('security');
    } else if (initialTab === 'system') {
      setActiveSubTab('system');
    } else if (initialTab === 'logs') {
      setActiveSubTab('logs');
    } else if (initialTab === 'response') {
      setActiveSubTab('response');
    }
  }, [initialTab, isOpen]);

  // Modal / Action states
  const [actionModalType, setActionModalType] = useState<'scan' | 'quarantine' | 'release' | null>(null);
  const [isLogsDrawerOpen, setIsLogsDrawerOpen] = useState(false);

  // Selected Threat for Nested Threat Details Drawer
  const [selectedThreat, setSelectedThreat] = useState<ThreatDetails | null>(null);
  const [isThreatDrawerOpen, setIsThreatDrawerOpen] = useState(false);

  if (!device) return null;

  // Derive threats targeting this device
  const deviceThreats = threats.filter(t => 
    t.deviceId === device.deviceId || 
    (t.deviceName && t.deviceName.toLowerCase() === device.hostname.toLowerCase()) ||
    t.destination.toLowerCase().includes(device.hostname.toLowerCase()) ||
    t.sourceIp === device.ipAddress
  );

  const activeThreats = deviceThreats.filter(t => t.status === 'Active' || t.status === 'Under Investigation' || t.status === 'Action Taken');

  // Enriched details calculated from device state
  const assignedUser = device.assignedUser || `${device.department.split(' ')[0]} Administrator`;
  const serialNumber = device.serialNumber || `SN-88${device.deviceId.replace('DEV-', '')}-X9`;
  const macAddress = device.macAddress || `00:1A:2B:3C:${device.deviceId.slice(-2)}:F1`;
  const deviceType = device.deviceType || (device.operatingSystem.toLowerCase().includes('mac') ? 'MacBook Pro 16"' : device.operatingSystem.toLowerCase().includes('windows') ? 'Windows Enterprise Server' : 'Linux Kernel Host');
  const agentVersion = device.agentVersion || 'v4.2.1-ebpf';
  const protectionStatus = device.protectionStatus || (device.status === 'Quarantined' ? 'Quarantined (Subnet Blocked)' : 'Active (Kernel eBPF Shield)');
  const lastScan = device.lastScan || '12 mins ago';
  const securityScore = device.securityScore || (device.status === 'Healthy' ? 96 : device.status === 'Warning' ? 74 : device.status === 'Quarantined' ? 42 : 80);
  const cpuUsage = device.cpuUsage || (device.status === 'Warning' ? '78%' : '14%');
  const memoryUsage = device.memoryUsage || (device.status === 'Warning' ? '82%' : '38%');
  const diskUsage = device.diskUsage || '29%';
  const uptime = device.uptime || '14d 8h 22m';
  const lastLogin = device.lastLogin || `${device.lastSeen} (${assignedUser})`;

  // Network enriched information
  const ipParts = device.ipAddress.split('.');
  const gatewayIp = `10.0.${ipParts[2] || '1'}.1`;
  const subnetMask = '255.255.255.0 (/24 CIDR)';
  const domain = 'CORP.SENTINELX.INTERNAL';
  const networkInterface = 'eth0 (10Gbps VirtIO eBPF Core)';
  const bandwidthRate = device.status === 'Quarantined' ? '0.0 Mbps (Subnet Blocked)' : '54.2 Mbps Ingress / 18.1 Mbps Egress';
  const activeSockets = device.status === 'Quarantined' ? '0 Active (Isolated)' : '24 Active TCP/UDP Sockets';
  const firewallProfile = device.status === 'Quarantined' ? 'Quarantine Subnet Blackhole Enforced' : 'Zero-Trust Strict (Inbound Block / Outbound Proxy)';

  const handleResetSockets = () => {
    addToast(`🔄 eBPF socket descriptors re-bound and re-synchronized for ${device.hostname}`, 'success');
  };

  const handleNotifySOC = () => {
    if (activeThreats.length > 0) {
      notifySecurityTeam(activeThreats[0].id);
    } else {
      addToast(`📢 Dispatched SOC notification alert for endpoint ${device.hostname}.`, 'info');
    }
  };

  // Sample device logs for Activity Logs tab
  const sampleLogs = [
    {
      time: device.lastSeen,
      type: 'eBPF Probe',
      level: 'INFO',
      message: `Kernel memory inspection clean for ${device.hostname}. 0 anomaly signatures flagged.`
    },
    {
      time: '14 mins ago',
      type: 'Network Policy',
      level: 'INFO',
      message: `Ingress firewall policy re-validated on interface ${networkInterface}.`
    },
    {
      time: '38 mins ago',
      type: 'User Session',
      level: 'NOTICE',
      message: `PAM SSH session established by ${assignedUser} from ${gatewayIp}.`
    },
    {
      time: '2 hours ago',
      type: device.status === 'Quarantined' ? 'Isolation' : 'Agent Pulse',
      level: device.status === 'Quarantined' ? 'CRITICAL' : 'INFO',
      message: device.status === 'Quarantined'
        ? `Quarantine policy active. Port blocked at switch ingress.`
        : `SentinelX Agent ${agentVersion} telemetry beat ACK (200 OK).`
    }
  ];

  return (
    <>
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
              className="relative w-full max-w-3xl bg-slate-950 border-l border-slate-800 shadow-2xl h-full flex flex-col z-10 overflow-hidden"
            >
              {/* Drawer Header */}
              <div className="p-6 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <div className={`p-3 rounded-2xl border ${
                    device.status === 'Healthy' ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-400' :
                    device.status === 'Warning' ? 'bg-amber-950/60 border-amber-500/40 text-amber-400' :
                    device.status === 'Quarantined' ? 'bg-rose-950/60 border-rose-500/40 text-rose-400' :
                    'bg-slate-800 border-slate-700 text-slate-400'
                  }`}>
                    <Server className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold text-white font-sans">{device.hostname}</h2>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${
                        device.status === 'Healthy' ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30' :
                        device.status === 'Warning' ? 'bg-amber-500/10 text-amber-300 border-amber-500/30' :
                        device.status === 'Quarantined' ? 'bg-rose-500/10 text-rose-300 border-rose-500/30' :
                        'bg-slate-800 text-slate-400 border-slate-700'
                      }`}>
                        {device.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">
                      ID: {device.deviceId} • IP: {device.ipAddress} • {device.department}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      askAiAboutDevice(device);
                      onClose();
                    }}
                    className="px-3 py-1.5 rounded-xl bg-purple-950/80 hover:bg-purple-900 border border-purple-500/40 text-purple-300 text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                    title="Ask AI to analyze this device"
                  >
                    <Bot className="w-3.5 h-3.5 text-[#00D4FF]" />
                    <span className="hidden sm:inline">Ask AI</span>
                  </button>

                  <button
                    onClick={onClose}
                    className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Sub-Tabs Bar covering all 7 requested sections */}
              <div className="px-4 bg-slate-900/40 border-b border-slate-800 flex gap-1.5 overflow-x-auto text-xs font-mono font-semibold scrollbar-none py-2">
                <button
                  onClick={() => setActiveSubTab('general')}
                  className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    activeSubTab === 'general'
                      ? 'bg-cyan-500/20 text-[#00D4FF] border-cyan-500/50 font-bold'
                      : 'bg-slate-900/60 text-slate-400 hover:text-white border-transparent'
                  }`}
                >
                  <Laptop className="w-3.5 h-3.5" />
                  <span>General Info</span>
                </button>

                <button
                  onClick={() => setActiveSubTab('network')}
                  className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    activeSubTab === 'network'
                      ? 'bg-cyan-500/20 text-[#00D4FF] border-cyan-500/50 font-bold'
                      : 'bg-slate-900/60 text-slate-400 hover:text-white border-transparent'
                  }`}
                >
                  <Network className="w-3.5 h-3.5" />
                  <span>Network Info</span>
                </button>

                <button
                  onClick={() => setActiveSubTab('security')}
                  className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    activeSubTab === 'security'
                      ? 'bg-cyan-500/20 text-[#00D4FF] border-cyan-500/50 font-bold'
                      : 'bg-slate-900/60 text-slate-400 hover:text-white border-transparent'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Security Info</span>
                </button>

                <button
                  onClick={() => setActiveSubTab('system')}
                  className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    activeSubTab === 'system'
                      ? 'bg-cyan-500/20 text-[#00D4FF] border-cyan-500/50 font-bold'
                      : 'bg-slate-900/60 text-slate-400 hover:text-white border-transparent'
                  }`}
                >
                  <Activity className="w-3.5 h-3.5" />
                  <span>System Info</span>
                </button>

                <button
                  onClick={() => setActiveSubTab('threats')}
                  className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    activeSubTab === 'threats'
                      ? 'bg-cyan-500/20 text-[#00D4FF] border-cyan-500/50 font-bold'
                      : 'bg-slate-900/60 text-slate-400 hover:text-white border-transparent'
                  }`}
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Threat History</span>
                  {deviceThreats.length > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-500/20 text-rose-300 font-bold">
                      {deviceThreats.length}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setActiveSubTab('logs')}
                  className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    activeSubTab === 'logs'
                      ? 'bg-cyan-500/20 text-[#00D4FF] border-cyan-500/50 font-bold'
                      : 'bg-slate-900/60 text-slate-400 hover:text-white border-transparent'
                  }`}
                >
                  <Terminal className="w-3.5 h-3.5" />
                  <span>Activity Logs</span>
                </button>

                <button
                  onClick={() => setActiveSubTab('response')}
                  className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    activeSubTab === 'response'
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 font-bold'
                      : 'bg-slate-900/60 text-slate-400 hover:text-white border-transparent'
                  }`}
                >
                  <Radio className="w-3.5 h-3.5 text-rose-400" />
                  <span>Incident Response</span>
                </button>
              </div>

              {/* Drawer Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">

                {/* 1. GENERAL INFORMATION */}
                {activeSubTab === 'general' && (
                  <div className="space-y-6 font-sans">
                    <div className="space-y-3">
                      <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                        <Laptop className="w-4 h-4 text-[#00D4FF]" />
                        General Information
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-900/60 border border-slate-800 font-mono text-xs">
                        <div>
                          <span className="text-slate-500 block text-[10px]">HOSTNAME</span>
                          <span className="text-slate-200 font-bold">{device.hostname}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px]">DEVICE ID</span>
                          <span className="text-cyan-300 font-bold">{device.deviceId}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px]">ASSIGNED USER</span>
                          <span className="text-slate-200 font-bold">{assignedUser}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px]">DEPARTMENT</span>
                          <span className="text-slate-200">{device.department}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px]">OPERATING SYSTEM</span>
                          <span className="text-slate-200">{device.operatingSystem}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px]">DEVICE TYPE</span>
                          <span className="text-slate-200">{deviceType}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px]">SERIAL NUMBER</span>
                          <span className="text-slate-300">{serialNumber}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px]">MAC ADDRESS</span>
                          <span className="text-slate-300">{macAddress}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px]">LAST USER LOGIN</span>
                          <span className="text-slate-300">{lastLogin}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. NETWORK INFORMATION */}
                {activeSubTab === 'network' && (
                  <div className="space-y-6 font-sans">
                    <div className="space-y-3">
                      <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                        <Network className="w-4 h-4 text-[#00D4FF]" />
                        Network Information & Topology
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-900/60 border border-slate-800 font-mono text-xs">
                        <div>
                          <span className="text-slate-500 block text-[10px]">IP ADDRESS</span>
                          <span className="text-cyan-400 font-bold">{device.ipAddress}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px]">SUBNET MASK</span>
                          <span className="text-slate-300">{subnetMask}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px]">DEFAULT GATEWAY</span>
                          <span className="text-slate-300">{gatewayIp}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px]">MAC ADDRESS</span>
                          <span className="text-slate-300">{macAddress}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px]">ENTERPRISE DOMAIN</span>
                          <span className="text-slate-200">{domain}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px]">PRIMARY INTERFACE</span>
                          <span className="text-slate-200">{networkInterface}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px]">BANDWIDTH TRAFFIC RATE</span>
                          <span className="text-slate-300">{bandwidthRate}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px]">ACTIVE SOCKET CONNECTIONS</span>
                          <span className="text-slate-300">{activeSockets}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px]">FIREWALL PROFILE</span>
                          <span className="text-emerald-400 font-bold">{firewallProfile}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. SECURITY INFORMATION */}
                {activeSubTab === 'security' && (
                  <div className="space-y-6 font-sans">
                    <div className="space-y-3">
                      <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-[#00D4FF]" />
                        Security Information & eBPF Telemetry
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-900/60 border border-slate-800 font-mono text-xs">
                        <div>
                          <span className="text-slate-500 block text-[10px]">SENTINELX AGENT</span>
                          <span className="text-emerald-400 font-bold">{agentVersion}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px]">PROTECTION STATUS</span>
                          <span className="text-slate-200">{protectionStatus}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px]">LAST SCAN</span>
                          <span className="text-slate-300">{lastScan}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px]">SECURITY SCORE</span>
                          <span className={`font-bold ${securityScore > 80 ? 'text-emerald-400' : securityScore > 60 ? 'text-amber-400' : 'text-rose-400'}`}>
                            {securityScore} / 100
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px]">RISK LEVEL</span>
                          <span className={`font-bold ${
                            device.riskLevel === 'Critical' ? 'text-rose-400' :
                            device.riskLevel === 'High' ? 'text-amber-400' :
                            device.riskLevel === 'Medium' ? 'text-yellow-300' : 'text-emerald-400'
                          }`}>
                            {device.riskLevel}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px]">ACTIVE INCIDENTS</span>
                          <span className="text-slate-200 font-bold">
                            {activeThreats.length > 0 ? `${activeThreats.length} Active` : '0 Active'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. SYSTEM INFORMATION */}
                {activeSubTab === 'system' && (
                  <div className="space-y-6 font-sans">
                    <div className="space-y-3">
                      <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                        <Activity className="w-4 h-4 text-[#00D4FF]" />
                        System Resource Metrics
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
                        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
                          <span className="text-slate-500 text-[10px]">CPU UTILIZATION</span>
                          <div className="text-xl font-bold text-cyan-300">{cpuUsage}</div>
                          <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-cyan-400" style={{ width: cpuUsage }} />
                          </div>
                        </div>

                        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
                          <span className="text-slate-500 text-[10px]">MEMORY USAGE</span>
                          <div className="text-xl font-bold text-purple-300">{memoryUsage}</div>
                          <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-purple-400" style={{ width: memoryUsage }} />
                          </div>
                        </div>

                        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
                          <span className="text-slate-500 text-[10px]">DISK CONSUMPTION</span>
                          <div className="text-xl font-bold text-slate-200">{diskUsage}</div>
                          <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-400" style={{ width: diskUsage }} />
                          </div>
                        </div>

                        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
                          <span className="text-slate-500 text-[10px]">SYSTEM UPTIME</span>
                          <div className="text-sm font-bold text-slate-300 mt-1">{uptime}</div>
                          <span className="text-[10px] text-slate-500">Kernel 6.2 eBPF</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                        <HardDrive className="w-4 h-4 text-[#00D4FF]" />
                        Hardware & Kernel Details
                      </h3>
                      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3 font-mono text-xs">
                        <div className="flex justify-between py-1 border-b border-slate-800/60">
                          <span className="text-slate-500">OS Build Version</span>
                          <span className="text-slate-200">{device.operatingSystem}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-800/60">
                          <span className="text-slate-500">Kernel Module</span>
                          <span className="text-cyan-300">ebpf-sentinel-v4.2.o</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-800/60">
                          <span className="text-slate-500">Network Interface</span>
                          <span className="text-slate-200">{networkInterface}</span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span className="text-slate-500">Firewall Ruleset</span>
                          <span className="text-emerald-400">Enforced (Zero-Trust Kernel Ingress)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 5. THREAT HISTORY */}
                {activeSubTab === 'threats' && (
                  <div className="space-y-4 font-sans">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4 text-rose-400" />
                        Historical Threats on this Endpoint
                      </h3>
                      <span className="text-xs font-mono text-slate-500">
                        {deviceThreats.length} total incidents
                      </span>
                    </div>

                    {deviceThreats.length === 0 ? (
                      <div className="p-8 text-center rounded-2xl bg-slate-900/40 border border-slate-800 space-y-2">
                        <ShieldCheck className="w-10 h-10 text-emerald-400/80 mx-auto" />
                        <p className="text-sm font-semibold text-slate-200">No Threats Detected</p>
                        <p className="text-xs text-slate-500">This endpoint has no recorded malicious incidents in SentinelX history.</p>
                      </div>
                    ) : (
                      <div className="space-y-3 font-sans">
                        {deviceThreats.map((t) => (
                          <div
                            key={t.id}
                            onClick={() => {
                              setSelectedThreat(t);
                              setIsThreatDrawerOpen(true);
                            }}
                            className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-rose-500/50 transition-all cursor-pointer group space-y-2"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                                  t.severity === 'Critical' ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                                  t.severity === 'High' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                                  'bg-slate-800 text-cyan-300'
                                }`}>
                                  {t.severity}
                                </span>
                                <span className="text-xs font-bold text-white group-hover:text-rose-300 transition-colors">
                                  {t.title}
                                </span>
                              </div>
                              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-rose-300 group-hover:translate-x-0.5 transition-all" />
                            </div>

                            <p className="text-xs text-slate-400 line-clamp-2">{t.description}</p>

                            <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-2 border-t border-slate-800/60">
                              <span>Detected: {t.detectedAt}</span>
                              <span className={`font-bold ${t.status === 'Resolved' ? 'text-emerald-400' : 'text-rose-400'}`}>
                                STATUS: {t.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* 6. ACTIVITY LOGS */}
                {activeSubTab === 'logs' && (
                  <div className="space-y-4 font-sans">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                        <Terminal className="w-4 h-4 text-[#00D4FF]" />
                        Activity & Telemetry Stream
                      </h3>
                      <button
                        onClick={() => setIsLogsDrawerOpen(true)}
                        className="px-3 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-mono text-cyan-300 hover:text-white transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <Terminal className="w-3.5 h-3.5" />
                        <span>Open Full Audit Terminal</span>
                      </button>
                    </div>

                    <div className="space-y-2.5 font-mono text-xs">
                      {sampleLogs.map((log, idx) => (
                        <div key={idx} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                                log.level === 'CRITICAL' ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                                log.level === 'NOTICE' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                                'bg-slate-800 text-cyan-300'
                              }`}>
                                {log.type}
                              </span>
                              <span className="text-slate-300 font-bold">{log.message}</span>
                            </div>
                            <span className="text-slate-500 text-[10px]">{log.time}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 7. INCIDENT RESPONSE */}
                {activeSubTab === 'response' && (
                  <div className="space-y-6 font-sans">
                    <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
                      <div className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wide flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <Radio className="w-4 h-4 text-rose-400" />
                          Endpoint Incident Containment Controls
                        </span>
                        <span className="text-[10px] text-cyan-400 font-mono">EDR Action Engine</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {device.status === 'Quarantined' ? (
                          <button
                            onClick={() => setActionModalType('release')}
                            className="p-3 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/50 text-emerald-300 text-xs font-mono font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
                          >
                            <Unlock className="w-4 h-4" />
                            <span>Release from Quarantine</span>
                          </button>
                        ) : (device.status === 'Warning' || device.status === 'At Risk') ? (
                          <button
                            onClick={() => setActionModalType('quarantine')}
                            className="p-3 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/50 text-rose-300 text-xs font-mono font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
                          >
                            <Lock className="w-4 h-4" />
                            <span>Quarantine & Isolate Subnet</span>
                          </button>
                        ) : null}

                        {device.status !== 'Offline' && (
                          <button
                            onClick={() => setActionModalType('scan')}
                            className="p-3 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 text-cyan-300 text-xs font-mono font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
                          >
                            <RefreshCw className="w-4 h-4" />
                            <span>Run Security Scan</span>
                          </button>
                        )}

                        <button
                          onClick={() => setIsLogsDrawerOpen(true)}
                          className="p-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-300 text-xs font-mono font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <Terminal className="w-4 h-4 text-cyan-400" />
                          <span>View Audit Logs</span>
                        </button>

                        <button
                          onClick={handleNotifySOC}
                          className="p-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-mono font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <BellRing className="w-4 h-4 text-amber-400" />
                          <span>Dispatch SOC Notification</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

              </div>

              {/* Drawer Footer */}
              <div className="p-4 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-500">
                  Status: <span className="text-slate-300 font-bold">{device.status}</span>
                </span>
                <span className="text-slate-500">
                  Last Telemetry Pulse: <span className="text-cyan-400">{device.lastSeen}</span>
                </span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DEVICE ACTION MODAL */}
      {actionModalType && (
        <DeviceActionModal
          device={device}
          action={actionModalType}
          onClose={() => setActionModalType(null)}
          onPostScanReleaseReady={() => setActionModalType('release')}
        />
      )}

      {/* DEVICE LOGS DRAWER */}
      <DeviceLogsDrawer
        isOpen={isLogsDrawerOpen}
        onClose={() => setIsLogsDrawerOpen(false)}
        device={device}
      />

      {/* NESTED THREAT DETAILS DRAWER */}
      {selectedThreat && (
        <ThreatDetailsDrawer
          isOpen={isThreatDrawerOpen}
          onClose={() => setIsThreatDrawerOpen(false)}
          threat={selectedThreat}
        />
      )}
    </>
  );
};
