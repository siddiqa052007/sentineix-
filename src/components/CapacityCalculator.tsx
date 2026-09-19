import React, { useState } from 'react';
import { Calculator, Zap, Shield, Clock, TrendingUp, Sparkles, CheckCircle2 } from 'lucide-react';

export const CapacityCalculator: React.FC = () => {
  const [bandwidthGb, setBandwidthGb] = useState<number>(2500);
  const [protectedNodes, setProtectedNodes] = useState<number>(35);

  // Calculations
  const packetsPerMonth = (bandwidthGb * 1000000000) / 800; // Assuming ~800 byte avg packet
  const estimatedAttacksNeutralized = Math.round((bandwidthGb * 1.8) + (protectedNodes * 12));
  const socHoursSavedPerMonth = Math.round((bandwidthGb * 0.08) + (protectedNodes * 1.2));
  const estimatedCostSaving = Math.round(socHoursSavedPerMonth * 125); // $125/hr SOC analyst rate

  return (
    <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-slate-800/80">
      
      {/* Background radial glow */}
      <div className="absolute top-1/2 right-1/4 w-[500px] h-[500px] bg-cyan-500/10 blur-[150px] rounded-full pointer-events-none" />

      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-cyan-400 text-xs font-mono uppercase tracking-widest mb-3">
          <Calculator className="w-3.5 h-3.5" />
          <span>ENTERPRISE ROI & CAPACITY ESTIMATOR</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-extrabold text-white font-mono tracking-tight">
          Calculate Your Security Telemetry ROI
        </h2>
        <p className="text-slate-400 text-base mt-3">
          Estimate the automated threat neutralization volume and SOC analyst hour savings for your cloud infrastructure scale.
        </p>
      </div>

      {/* Main Grid: Controls + Calculated Impact Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Sliders Form (6 cols) */}
        <div className="lg:col-span-6 glass-card p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-6">
          
          {/* Slider 1: Network Bandwidth */}
          <div>
            <div className="flex justify-between items-center mb-2 font-mono text-xs">
              <span className="text-slate-300 font-bold">MONTHLY NETWORK INGRESS:</span>
              <span className="text-cyan-400 font-extrabold text-sm">{bandwidthGb.toLocaleString()} GB / month</span>
            </div>
            <input
              type="range"
              min="100"
              max="50000"
              step="100"
              value={bandwidthGb}
              onChange={(e) => setBandwidthGb(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
              <span>100 GB (Startup)</span>
              <span>10 TB (Mid-Market)</span>
              <span>50 TB+ (Global Enterprise)</span>
            </div>
          </div>

          {/* Slider 2: Protected Cloud Nodes */}
          <div>
            <div className="flex justify-between items-center mb-2 font-mono text-xs">
              <span className="text-slate-300 font-bold">PROTECTED KUBERNETES NODES / VMS:</span>
              <span className="text-cyan-400 font-extrabold text-sm">{protectedNodes} Nodes</span>
            </div>
            <input
              type="range"
              min="2"
              max="500"
              step="1"
              value={protectedNodes}
              onChange={(e) => setProtectedNodes(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
              <span>2 Nodes</span>
              <span>100 Nodes</span>
              <span>500 Nodes</span>
            </div>
          </div>

          <div className="p-4 bg-slate-950 rounded-xl border border-cyan-500/20 text-xs font-mono text-slate-300 space-y-2">
            <div className="flex items-center gap-2 text-cyan-400 font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>eBPF KERNEL DEPLOYMENT BENEFIT:</span>
            </div>
            <p className="text-slate-400 text-xs">
              Zero agent sidecars required. SentinelX mounts directly onto Linux kernel XDP sockets across all {protectedNodes} nodes with under 0.8ms inspection latency.
            </p>
          </div>

        </div>

        {/* Calculated Impact Display (6 cols) */}
        <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          <div className="glass-card p-6 rounded-2xl border border-slate-800 hover:border-cyan-500/40 transition-all">
            <div className="text-slate-400 font-mono text-xs uppercase mb-1">Monthly Attacks Neutralized</div>
            <div className="text-3xl font-extrabold font-mono text-emerald-400">
              ~{estimatedAttacksNeutralized.toLocaleString()}
            </div>
            <p className="text-[11px] font-mono text-slate-400 mt-2">
              Automated eBPF drops & AI anomaly isolation before breach execution.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-slate-800 hover:border-cyan-500/40 transition-all">
            <div className="text-slate-400 font-mono text-xs uppercase mb-1">SOC Hours Saved / Month</div>
            <div className="text-3xl font-extrabold font-mono text-cyan-400">
              {socHoursSavedPerMonth.toLocaleString()} hrs
            </div>
            <p className="text-[11px] font-mono text-slate-400 mt-2">
              Eliminates manual pcap investigations & alert fatigue triage.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-slate-800 hover:border-cyan-500/40 transition-all">
            <div className="text-slate-400 font-mono text-xs uppercase mb-1">Est. Operational Cost Savings</div>
            <div className="text-3xl font-extrabold font-mono text-amber-400">
              ${estimatedCostSaving.toLocaleString()}
            </div>
            <p className="text-[11px] font-mono text-slate-400 mt-2">
              Based on standard $125/hr SOC tier-2 analyst triage baseline.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-slate-800 hover:border-cyan-500/40 transition-all">
            <div className="text-slate-400 font-mono text-xs uppercase mb-1">AI Inspection SLA</div>
            <div className="text-3xl font-extrabold font-mono text-white">
              &lt; 0.82 ms
            </div>
            <p className="text-[11px] font-mono text-emerald-400 mt-2">
              99.999% uptime guarantee with kernel fail-safe fallback.
            </p>
          </div>

        </div>

      </div>

    </section>
  );
};
