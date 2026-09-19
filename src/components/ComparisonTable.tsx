import React from 'react';
import { Check, X, ShieldCheck, Zap, AlertCircle } from 'lucide-react';

export const ComparisonTable: React.FC = () => {
  return (
    <section id="benchmark" className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-slate-800/80">
      
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/3 w-[500px] h-[500px] bg-cyan-500/10 blur-[150px] rounded-full pointer-events-none" />

      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-cyan-400 text-xs font-mono uppercase tracking-widest mb-3">
          <Zap className="w-3.5 h-3.5" />
          <span>TECHNICAL BENCHMARK MATRIX</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-extrabold text-white font-mono tracking-tight">
          Why Modern SOCs Switch to SentinelX
        </h2>
        <p className="text-slate-400 text-base mt-3">
          Legacy intrusion detection systems are slow, compute-heavy, and overwhelmed by noisy alerts. See the direct architectural comparison.
        </p>
      </div>

      {/* Comparison Grid Container */}
      <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-mono text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/80">
                <th className="p-4 sm:p-6 text-slate-400 uppercase text-xs">Architectural Capability</th>
                <th className="p-4 sm:p-6 text-cyan-400 font-bold bg-cyan-950/40 border-x border-cyan-500/30 text-center text-sm sm:text-base">
                  <span className="flex items-center justify-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-cyan-400" />
                    SENTINELX AI
                  </span>
                </th>
                <th className="p-4 sm:p-6 text-slate-400 text-center">Legacy Snort / Suricata</th>
                <th className="p-4 sm:p-6 text-slate-400 text-center">Standard Cloud SIEM</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              
              <tr>
                <td className="p-4 sm:p-6 font-semibold text-white">Inspection Latency</td>
                <td className="p-4 sm:p-6 bg-cyan-950/20 border-x border-cyan-500/20 text-center font-bold text-emerald-400">
                  Sub-1 ms (&lt;0.82ms)
                </td>
                <td className="p-4 sm:p-6 text-center text-slate-400">18 - 45 ms</td>
                <td className="p-4 sm:p-6 text-center text-slate-400">Seconds to Minutes</td>
              </tr>

              <tr>
                <td className="p-4 sm:p-6 font-semibold text-white">Worker Node CPU Overhead</td>
                <td className="p-4 sm:p-6 bg-cyan-950/20 border-x border-cyan-500/20 text-center font-bold text-emerald-400">
                  &lt;0.5% (eBPF Kernel)
                </td>
                <td className="p-4 sm:p-6 text-center text-slate-400">12% - 25% (User-space)</td>
                <td className="p-4 sm:p-6 text-center text-slate-400">High Log Agent CPU</td>
              </tr>

              <tr>
                <td className="p-4 sm:p-6 font-semibold text-white">Zero-Day Attack Prevention</td>
                <td className="p-4 sm:p-6 bg-cyan-950/20 border-x border-cyan-500/20 text-center font-bold text-cyan-300">
                  <span className="inline-flex items-center gap-1.5 text-emerald-400">
                    <Check className="w-4 h-4" /> AI Neural Baseline
                  </span>
                </td>
                <td className="p-4 sm:p-6 text-center text-rose-400 font-medium">
                  <span className="inline-flex items-center gap-1.5">
                    <X className="w-4 h-4" /> Static Signatures Only
                  </span>
                </td>
                <td className="p-4 sm:p-6 text-center text-amber-400 font-medium">
                  <span className="inline-flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4" /> Post-Facto Queries
                  </span>
                </td>
              </tr>

              <tr>
                <td className="p-4 sm:p-6 font-semibold text-white">Mitigation Speed</td>
                <td className="p-4 sm:p-6 bg-cyan-950/20 border-x border-cyan-500/20 text-center font-bold text-emerald-400">
                  Automated eBPF Kernel Drops
                </td>
                <td className="p-4 sm:p-6 text-center text-slate-400">Manual Rule Generation</td>
                <td className="p-4 sm:p-6 text-center text-slate-400">SOC Playbook Workflows</td>
              </tr>

              <tr>
                <td className="p-4 sm:p-6 font-semibold text-white">False Positive Reduction</td>
                <td className="p-4 sm:p-6 bg-cyan-950/20 border-x border-cyan-500/20 text-center font-bold text-emerald-400">
                  92.4% Noise Reduction
                </td>
                <td className="p-4 sm:p-6 text-center text-rose-400">High Alert Fatigue</td>
                <td className="p-4 sm:p-6 text-center text-amber-400">Moderate Alert Fatigue</td>
              </tr>

              <tr>
                <td className="p-4 sm:p-6 font-semibold text-white">Natural Language AI Copilot</td>
                <td className="p-4 sm:p-6 bg-cyan-950/20 border-x border-cyan-500/20 text-center font-bold text-cyan-300">
                  <span className="inline-flex items-center gap-1 text-cyan-400">
                    <Check className="w-4 h-4" /> Gemini 2.5 Integrated
                  </span>
                </td>
                <td className="p-4 sm:p-6 text-center text-slate-500">None</td>
                <td className="p-4 sm:p-6 text-center text-slate-400">Basic Regex Assistant</td>
              </tr>

            </tbody>
          </table>
        </div>
      </div>

    </section>
  );
};
