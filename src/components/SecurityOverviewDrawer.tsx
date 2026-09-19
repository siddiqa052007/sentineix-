import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle, 
  Server, 
  Ban, 
  Sparkles, 
  FileText, 
  CheckCircle2, 
  Clock, 
  Activity,
  ChevronRight
} from 'lucide-react';
import { useThreats } from '../context/ThreatContext';

interface SecurityOverviewDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SecurityOverviewDrawer: React.FC<SecurityOverviewDrawerProps> = ({ isOpen, onClose }) => {
  const { 
    securityScore, 
    healthyDevicesCount, 
    activeThreatsCount, 
    blockedIps, 
    quarantinedDevicesCount, 
    warningDevicesCount, 
    resolvedThreatsCount, 
    threats, 
    setActiveTab 
  } = useThreats();

  if (!isOpen) return null;

  // Active risk distribution
  const activeThreatsList = threats.filter(t => t.status === 'Active' || t.status === 'Under Investigation' || t.status === 'Action Taken');
  const criticalCount = activeThreatsList.filter(t => t.severity === 'Critical').length;
  const highCount = activeThreatsList.filter(t => t.severity === 'High').length;
  const mediumCount = activeThreatsList.filter(t => t.severity === 'Medium').length;
  const lowCount = activeThreatsList.filter(t => t.severity === 'Low').length;

  const devicesRequiringAttention = quarantinedDevicesCount + warningDevicesCount;

  // Dynamic recommendations
  const recommendations: string[] = [];
  if (criticalCount > 0) {
    recommendations.push(`Immediate action required: Resolve ${criticalCount} active Critical threat${criticalCount > 1 ? 's' : ''}.`);
  }
  if (devicesRequiringAttention > 0) {
    recommendations.push(`Audit ${devicesRequiringAttention} device${devicesRequiringAttention > 1 ? 's' : ''} currently in Warning or Quarantined status.`);
  }
  recommendations.push('Maintain strict eBPF kernel socket monitoring across all ingress nodes.');
  recommendations.push('Ensure multi-factor authentication (MFA) is enforced for all privileged SOC users.');

  const nowTimestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ', ' + new Date().toLocaleDateString([], { month: 'short', day: 'numeric' });

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden font-sans">
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity"
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-screen max-w-xl bg-[#070b14] border-l border-cyan-500/30 text-slate-100 flex flex-col justify-between shadow-2xl relative z-10"
            >
              {/* Drawer Header */}
              <div className="p-6 border-b border-slate-800/80 bg-slate-950/90 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-[#00D4FF]">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-extrabold text-white font-heading">
                      Security Overview
                    </h2>
                    <p className="text-xs text-slate-400 font-mono">
                      Real-Time Security Score & System Posture
                    </p>
                  </div>
                </div>

                <button
                  onClick={onClose}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Close Drawer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="p-6 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
                
                {/* Security Score Banner */}
                <div className="p-5 rounded-2xl bg-slate-950 border border-cyan-500/30 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Overall Security Score
                    </span>
                    <div className="text-4xl font-extrabold text-white font-heading tracking-tight flex items-baseline gap-2">
                      <span>{securityScore}</span>
                      <span className="text-sm font-mono text-cyan-400 font-bold">/ 100</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      {securityScore >= 90 ? 'Optimal Security Posture' : securityScore >= 75 ? 'Elevated Monitoring Required' : 'Critical Action Required'}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className={`px-3 py-1.5 rounded-xl text-xs font-mono font-extrabold border inline-block uppercase ${
                      securityScore >= 90
                        ? 'bg-emerald-950/80 text-emerald-400 border-emerald-800'
                        : securityScore >= 75
                        ? 'bg-amber-950/80 text-amber-400 border-amber-800'
                        : 'bg-rose-950/80 text-rose-400 border-rose-800'
                    }`}>
                      {securityScore >= 90 ? 'EXCELLENT' : securityScore >= 75 ? 'MODERATE' : 'HIGH RISK'}
                    </span>
                  </div>
                </div>

                {/* Score Breakdown Grid */}
                <div>
                  <h3 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-[#00D4FF]" />
                    <span>Score Breakdown Metrics</span>
                  </h3>

                  <div className="grid grid-cols-2 gap-3 font-mono">
                    <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                      <div className="text-[10px] text-slate-400 uppercase font-bold flex items-center justify-between">
                        <span>Healthy Devices</span>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      </div>
                      <div className="text-xl font-bold text-white mt-1">{healthyDevicesCount}</div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                      <div className="text-[10px] text-slate-400 uppercase font-bold flex items-center justify-between">
                        <span>Active Threats</span>
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                      </div>
                      <div className="text-xl font-bold text-rose-400 mt-1">{activeThreatsCount}</div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                      <div className="text-[10px] text-slate-400 uppercase font-bold flex items-center justify-between">
                        <span>Blocked IPs</span>
                        <Ban className="w-3.5 h-3.5 text-cyan-400" />
                      </div>
                      <div className="text-xl font-bold text-[#00D4FF] mt-1">{blockedIps.length}</div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                      <div className="text-[10px] text-slate-400 uppercase font-bold flex items-center justify-between">
                        <span>Devices Requiring Attention</span>
                        <Server className="w-3.5 h-3.5 text-amber-400" />
                      </div>
                      <div className="text-xl font-bold text-amber-400 mt-1">{devicesRequiringAttention}</div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 col-span-2">
                      <div className="text-[10px] text-slate-400 uppercase font-bold flex items-center justify-between">
                        <span>Resolved Incidents</span>
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      </div>
                      <div className="text-xl font-bold text-emerald-400 mt-1">{resolvedThreatsCount}</div>
                    </div>
                  </div>
                </div>

                {/* Risk Distribution */}
                <div>
                  <h3 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-rose-400" />
                    <span>Active Threat Risk Distribution</span>
                  </h3>

                  <div className="grid grid-cols-4 gap-2 font-mono text-center">
                    <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800/80">
                      <span className="text-[10px] text-rose-400 font-bold block uppercase">Critical</span>
                      <span className="text-lg font-bold text-rose-300 mt-1 block">{criticalCount}</span>
                    </div>

                    <div className="p-3 rounded-xl bg-amber-950/60 border border-amber-800/80">
                      <span className="text-[10px] text-amber-400 font-bold block uppercase">High</span>
                      <span className="text-lg font-bold text-amber-300 mt-1 block">{highCount}</span>
                    </div>

                    <div className="p-3 rounded-xl bg-blue-950/60 border border-blue-800/80">
                      <span className="text-[10px] text-blue-400 font-bold block uppercase">Medium</span>
                      <span className="text-lg font-bold text-blue-300 mt-1 block">{mediumCount}</span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">Low</span>
                      <span className="text-lg font-bold text-slate-300 mt-1 block">{lowCount}</span>
                    </div>
                  </div>
                </div>

                {/* AI Security Recommendations */}
                <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/30 space-y-3">
                  <div className="flex items-center gap-2 text-purple-300 font-bold text-xs">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <span>AI Security Recommendations</span>
                  </div>

                  <ul className="space-y-2 text-xs text-slate-200">
                    {recommendations.map((rec, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#00D4FF] mt-1.5 shrink-0" />
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Last Calculated Timestamp */}
                <div className="text-center font-mono text-[11px] text-slate-500 flex items-center justify-center gap-1.5 pt-2">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>Last Calculated: {nowTimestamp}</span>
                </div>

              </div>

              {/* Drawer Footer Actions */}
              <div className="p-5 border-t border-slate-800/80 bg-slate-950/90 flex items-center justify-between gap-3">
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 font-bold transition-all cursor-pointer"
                >
                  Close
                </button>

                <button
                  onClick={() => {
                    onClose();
                    setActiveTab('reports');
                  }}
                  className="px-5 py-2.5 rounded-xl bg-[#00D4FF] hover:bg-[#00b8e6] text-slate-950 text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shadow-[0_0_15px_rgba(0,212,255,0.3)]"
                >
                  <FileText className="w-4 h-4" />
                  <span>View Full Report</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};
