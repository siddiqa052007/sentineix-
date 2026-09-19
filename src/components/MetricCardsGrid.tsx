import React from 'react';
import { Shield, Monitor, AlertTriangle, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';
import { useThreats } from '../context/ThreatContext';

export const MetricCardsGrid: React.FC = () => {
  const { 
    securityScore, 
    connectedDevicesCount, 
    totalDevicesCount,
    activeThreatsCount, 
    resolvedThreatsCount, 
    setActiveTab,
    setIsSecurityOverviewOpen,
    setThreatFilter
  } = useThreats();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 font-sans">
      
      {/* CARD 1: Security Score */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
        onClick={() => setIsSecurityOverviewOpen(true)}
        className="glass-card p-5 rounded-2xl border border-cyan-500/30 bg-slate-950/70 shadow-[0_0_25px_rgba(0,212,255,0.1)] hover:border-[#00D4FF] transition-all flex flex-col justify-between group cursor-pointer"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
            Security Score
          </span>
          <div className="p-2 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-[#00D4FF]">
            <Shield className="w-4 h-4" />
          </div>
        </div>

        <div className="flex items-center justify-between mt-2">
          <div>
            <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-heading">
              {securityScore}%
            </div>
            <p className="text-xs text-slate-400 mt-1 font-sans">
              Overall network security status
            </p>
          </div>

          {/* Animated Circular Progress Gauge SVG */}
          <div className="relative w-14 h-14 shrink-0 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-800"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <motion.path
                className="text-[#00D4FF]"
                strokeDasharray={`${securityScore}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                initial={{ strokeDasharray: "0, 100" }}
                animate={{ strokeDasharray: `${securityScore}, 100` }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute text-[10px] font-mono font-bold text-[#00D4FF]">{securityScore}%</span>
          </div>
        </div>
      </motion.div>

      {/* CARD 2: Connected Devices */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        onClick={() => setActiveTab('connected-devices')}
        className="glass-card p-5 rounded-2xl border border-slate-800 bg-slate-950/70 hover:border-cyan-500/50 transition-all flex flex-col justify-between group cursor-pointer"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
            Connected Devices
          </span>
          <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 group-hover:text-[#00D4FF] transition-colors">
            <Monitor className="w-4 h-4" />
          </div>
        </div>

        <div className="mt-2">
          <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-heading">
            {connectedDevicesCount}
          </div>
          <p className="text-xs text-slate-400 mt-1 font-sans flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>{connectedDevicesCount} active online / {totalDevicesCount} total endpoints</span>
          </p>
        </div>
      </motion.div>

      {/* CARD 3: Active Threats (Red Accent) */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.15 }}
        onClick={() => {
          setThreatFilter({ status: 'Active' });
          setActiveTab('threats');
        }}
        className="glass-card p-5 rounded-2xl border border-rose-500/30 bg-rose-950/10 shadow-[0_0_20px_rgba(244,63,94,0.1)] hover:border-rose-500/80 transition-all flex flex-col justify-between group cursor-pointer"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-mono font-bold text-rose-300 uppercase tracking-wider flex items-center gap-1">
            Active Threats
          </span>
          <div className="p-2 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-400">
            <AlertTriangle className="w-4 h-4 animate-pulse" />
          </div>
        </div>

        <div className="mt-2">
          <div className="text-3xl sm:text-4xl font-extrabold text-rose-400 tracking-tight font-heading flex items-center gap-2">
            <span>{activeThreatsCount}</span>
            {activeThreatsCount > 0 && (
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-rose-950 border border-rose-800 text-rose-300 font-bold">
                Action Needed
              </span>
            )}
          </div>
          <p className="text-xs text-rose-300/80 mt-1 font-sans">
            Threats requiring attention
          </p>
        </div>
      </motion.div>

      {/* CARD 4: Blocked / Resolved Attacks (Green Accent) */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        onClick={() => {
          setThreatFilter({ status: 'Blocked & Resolved' });
          setActiveTab('threats');
        }}
        className="glass-card p-5 rounded-2xl border border-emerald-500/30 bg-emerald-950/10 shadow-[0_0_20px_rgba(16,185,129,0.1)] hover:border-emerald-500/60 transition-all flex flex-col justify-between group cursor-pointer"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-mono font-bold text-emerald-300 uppercase tracking-wider">
            Blocked & Resolved
          </span>
          <div className="p-2 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
          </div>
        </div>

        <div className="mt-2">
          <div className="text-3xl sm:text-4xl font-extrabold text-emerald-400 tracking-tight font-heading">
            {resolvedThreatsCount}
          </div>
          <p className="text-xs text-emerald-300/80 mt-1 font-sans">
            Threats mitigated & blocked
          </p>
        </div>
      </motion.div>

    </div>
  );
};
