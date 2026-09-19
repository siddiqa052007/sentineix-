import React from 'react';
import { Shield, Sparkles, Terminal, ArrowRight, Play, CheckCircle2, Lock, Cpu, Activity, Zap } from 'lucide-react';

interface HeroProps {
  onLaunchConsole?: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onLaunchConsole }) => {
  return (
    <section className="relative pt-28 pb-20 md:pt-36 md:pb-28 overflow-hidden bg-[#070b14]">
      
      {/* Background Cyber Grid & Glowing Orbs */}
      <div className="absolute inset-0 bg-cyber-grid pointer-events-none opacity-60" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-gradient-to-tr from-cyan-500/20 via-blue-600/10 to-transparent blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute -top-20 -right-20 w-[400px] h-[400px] bg-cyan-400/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Badge */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-slate-900/90 border border-cyan-500/40 text-xs font-mono text-cyan-300 shadow-[0_0_20px_rgba(0,240,255,0.2)]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-bold uppercase tracking-wider text-white">SENTINELX ENGINE v4.2</span>
            <span className="text-slate-500">|</span>
            <span className="text-cyan-400 font-bold">99.98% Anomaly Precision</span>
          </div>
        </div>

        {/* Main Headline */}
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white font-mono tracking-tight leading-[1.1]">
            Autonomous AI Threat Defense & <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500 text-glow-cyan">eBPF Intrusion Detection</span>
          </h1>

          <p className="mt-6 text-base sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            SentinelX inspects Linux kernel packets in real time, isolates zero-day anomalies with Gemini AI, and generates hardware-accelerated firewall rules before exploit execution.
          </p>

          {/* Action CTA Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onLaunchConsole}
              className="w-full sm:w-auto px-8 py-4 rounded-xl font-mono font-bold text-sm uppercase tracking-wider text-slate-950 bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500 shadow-[0_0_30px_rgba(0,240,255,0.5)] hover:shadow-[0_0_40px_rgba(0,240,255,0.8)] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 fill-slate-950" />
              <span>Launch SentinelX Console</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <a
              href="#simulator"
              className="w-full sm:w-auto px-8 py-4 rounded-xl font-mono font-medium text-sm text-slate-300 hover:text-white bg-slate-900/80 border border-slate-700/80 hover:border-cyan-500/50 hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
            >
              <Terminal className="w-4 h-4 text-cyan-400" />
              <span>Explore Attack Sandbox</span>
            </a>
          </div>

          {/* Trust Badges */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs font-mono text-slate-400">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-cyan-400" /> Sub-0.8ms Inspection Latency</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-cyan-400" /> 0% User-Space Agent Overhead</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-cyan-400" /> SOC 2 Type II Compliant</span>
          </div>
        </div>

        {/* Hero Interactive Terminal Visual */}
        <div className="mt-14 max-w-5xl mx-auto glass-card rounded-2xl p-4 sm:p-6 border border-cyan-500/30 shadow-[0_0_50px_rgba(0,240,255,0.15)] relative overflow-hidden">
          
          {/* Terminal Window Top Bar */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs font-mono">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-500/80" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
              <span className="ml-2 text-slate-400 font-bold">sentinelx-kernel-daemon --live-stream</span>
            </div>
            <div className="text-cyan-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span>KERNEL HOOK ACTIVE [XDP]</span>
            </div>
          </div>

          {/* Terminal Content Stream */}
          <div className="mt-3 bg-slate-950 rounded-xl p-4 font-mono text-xs text-slate-300 space-y-2 overflow-x-auto">
            <div className="text-slate-500">[21:35:01 UTC] [INFO] eBPF socket map attached to interface eth0. Ring buffer allocated (64MB).</div>
            <div className="text-slate-500">[21:35:02 UTC] [INFO] Gemini 2.5 AI Reasoning Agent initialized. Threat signature mesh synchronized.</div>
            
            <div className="p-2.5 rounded bg-rose-950/40 border border-rose-800/60 text-rose-300 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="px-1.5 py-0.5 text-[10px] bg-rose-900 text-rose-200 font-bold rounded">ALERT</span>
                <span>INTRUSION VECTOR DETECTED: SQL Injection on /api/v1/auth from IP 185.220.101.5 (RU)</span>
              </div>
              <span className="text-emerald-400 font-bold text-[11px] whitespace-nowrap">ACTION: KERNEL DROP (0.64ms)</span>
            </div>

            <div className="text-cyan-400">[21:35:03 UTC] [AI REASONING] Pattern matched CVE-2026-X81 payload. Generated eBPF filter rule automatically.</div>
            <div className="text-slate-400">[21:35:04 UTC] [METRIC] Ingress rate: 1,482,910 pps | Active Probes: 14,290 | Zero-Days Mitigated: 42</div>
          </div>

        </div>

      </div>

    </section>
  );
};
