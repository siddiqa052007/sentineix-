import React from 'react';
import { FileText, Bot, RefreshCw, Zap } from 'lucide-react';

interface QuickActionsWidgetProps {
  onGenerateReport: () => void;
  onAskAi: () => void;
  onRefreshDashboard: () => void;
}

export const QuickActionsWidget: React.FC<QuickActionsWidgetProps> = ({
  onGenerateReport,
  onAskAi,
  onRefreshDashboard
}) => {
  return (
    <div className="glass-card p-6 rounded-2xl border border-slate-800 bg-slate-950/70 hover:border-cyan-500/30 transition-all font-sans">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-4">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-400" />
          <h3 className="text-lg font-bold text-white font-heading">
            Quick Actions
          </h3>
        </div>
        <span className="text-xs font-mono text-slate-400">One-Click SOC Tasks</span>
      </div>

      {/* 3 Large Premium Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Button 1: Generate Report */}
        <button
          onClick={onGenerateReport}
          className="p-4 rounded-2xl bg-slate-900/90 hover:bg-cyan-950/40 border border-slate-800 hover:border-[#00D4FF]/60 transition-all flex flex-col items-center text-center gap-3 group cursor-pointer shadow-[0_0_15px_rgba(0,0,0,0.3)]"
        >
          <div className="w-12 h-12 rounded-2xl bg-cyan-950/80 border border-cyan-800/80 flex items-center justify-center text-[#00D4FF] group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(0,212,255,0.2)]">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <div className="text-sm font-bold text-white group-hover:text-[#00D4FF] transition-colors">
              Generate Report
            </div>
            <p className="text-xs text-slate-400 mt-1">Export executive PDF compliance report</p>
          </div>
        </button>

        {/* Button 2: Ask AI Assistant */}
        <button
          onClick={onAskAi}
          className="p-4 rounded-2xl bg-slate-900/90 hover:bg-purple-950/40 border border-slate-800 hover:border-purple-500/60 transition-all flex flex-col items-center text-center gap-3 group cursor-pointer shadow-[0_0_15px_rgba(0,0,0,0.3)]"
        >
          <div className="w-12 h-12 rounded-2xl bg-purple-950/80 border border-purple-800/80 flex items-center justify-center text-purple-300 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(168,85,247,0.2)]">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <div className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">
              Ask AI Assistant
            </div>
            <p className="text-xs text-slate-400 mt-1">Get instant threat intelligence insights</p>
          </div>
        </button>

        {/* Button 3: Refresh Dashboard */}
        <button
          onClick={onRefreshDashboard}
          className="p-4 rounded-2xl bg-slate-900/90 hover:bg-emerald-950/40 border border-slate-800 hover:border-emerald-500/60 transition-all flex flex-col items-center text-center gap-3 group cursor-pointer shadow-[0_0_15px_rgba(0,0,0,0.3)]"
        >
          <div className="w-12 h-12 rounded-2xl bg-emerald-950/80 border border-emerald-800/80 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(16,185,129,0.2)]">
            <RefreshCw className="w-6 h-6" />
          </div>
          <div>
            <div className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
              Refresh Dashboard
            </div>
            <p className="text-xs text-slate-400 mt-1">Re-sync live SOC socket telemetry</p>
          </div>
        </button>

      </div>

    </div>
  );
};

