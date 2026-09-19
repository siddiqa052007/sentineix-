import React from 'react';
import { ShieldCheck, CheckCircle2, AlertTriangle, Sparkles, ArrowRight, Zap, RefreshCw } from 'lucide-react';

interface SecurityScoreGaugeProps {
  score?: number; // 0 - 100
  onFixRecommendation?: (title: string) => void;
}

export const SecurityScoreGauge: React.FC<SecurityScoreGaugeProps> = ({ 
  score = 98,
  onFixRecommendation
}) => {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="glass-card p-6 rounded-2xl border border-slate-800 hover:border-cyan-500/30 transition-all font-mono">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-cyan-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Infrastructure Posture Score
          </h3>
        </div>
        <span className="text-[10px] bg-emerald-950 text-emerald-400 px-2.5 py-0.5 rounded border border-emerald-800 font-bold">
          SECURE & PROTECTED
        </span>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-6">
        
        {/* Animated Radial Circle Score (SVG) */}
        <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
          <svg className="w-full h-full transform -rotate-90">
            {/* Background Ring */}
            <circle
              cx="72"
              cy="72"
              r={radius}
              className="stroke-slate-800"
              strokeWidth="10"
              fill="transparent"
            />
            {/* Animated Score Arc */}
            <circle
              cx="72"
              cy="72"
              r={radius}
              className="stroke-cyan-400 transition-all duration-1000 ease-out shadow-[0_0_15px_#00f0ff]"
              strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>
          
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-3xl font-extrabold text-white text-glow-cyan">{score}</span>
            <span className="text-[10px] text-slate-400 font-mono">/ 100 INDEX</span>
          </div>
        </div>

        {/* Breakdown Stats */}
        <div className="flex-1 space-y-3 w-full">
          <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-800/80">
            <span className="text-slate-400">eBPF Kernel Coverage:</span>
            <span className="text-emerald-400 font-bold">100% (25/25 Nodes)</span>
          </div>

          <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-800/80">
            <span className="text-slate-400">Zero-Day Vulnerability Exposure:</span>
            <span className="text-cyan-400 font-bold">0 Unmitigated</span>
          </div>

          <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-800/80">
            <span className="text-slate-400">Average Inspection SLA:</span>
            <span className="text-white font-bold">0.78 ms</span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Compliance Benchmark:</span>
            <span className="text-emerald-400 font-bold">SOC2 & HIPAA Ready</span>
          </div>
        </div>

      </div>

      {/* AI Posture Recommendation Banner */}
      <div className="mt-5 p-3 rounded-xl bg-slate-950 border border-cyan-500/20 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 overflow-hidden">
          <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
          <span className="text-slate-300 truncate">Enable automatic TLS 1.3 JA3 fingerprint rotation for +2 pts score.</span>
        </div>
        <button
          onClick={() => onFixRecommendation && onFixRecommendation('Auto-Rotate TLS JA3 Fingerprints')}
          className="px-2.5 py-1 bg-cyan-500 text-slate-950 font-bold rounded-lg hover:bg-cyan-400 transition-all text-[11px] whitespace-nowrap cursor-pointer shrink-0"
        >
          Auto-Fix
        </button>
      </div>

    </div>
  );
};
