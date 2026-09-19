import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Sparkles, 
  Copy, 
  Download, 
  RefreshCw, 
  CheckCircle2, 
  ShieldAlert, 
  Bot, 
  FileText,
  AlertCircle
} from 'lucide-react';
import { useThreats } from '../context/ThreatContext';

interface AiAnalysisDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  insight: {
    title?: string;
    explanation?: string;
    businessImpact?: string;
    recommendedResponse?: string;
    futurePrevention?: string[];
  } | null;
  onRegenerate?: () => void;
  isRegenerating?: boolean;
}

export const AiAnalysisDrawer: React.FC<AiAnalysisDrawerProps> = ({
  isOpen,
  onClose,
  insight,
  onRegenerate,
  isRegenerating = false
}) => {
  const { addToast } = useThreats();

  if (!isOpen || !insight) return null;

  const title = insight.title || 'Gemini SecOps Intelligence Insight';
  const explanation = insight.explanation || 'Anomalous network telemetry intercepted across ingress nodes. Automated Gemini heuristic analysis indicates elevated risk of credential probing and zero-day execution.';
  const businessImpact = insight.businessImpact || 'Potential service disruption to API endpoints and risk of lateral movement if unmitigated.';
  const recommendedResponse = insight.recommendedResponse || 'Isolate affected subnet nodes, null-route source IP address at eBPF layer, and rotate API access keys.';
  const futurePrevention = insight.futurePrevention || [
    'Enforce MFA for all administrative accounts',
    'Review SSL/TLS port 443 handshake rate limits',
    'Update firewall null-route rules for suspicious CIDR blocks',
    'Enable eBPF socket level packet inspection across worker pods'
  ];

  const fullReportText = `SENTINELX AI SECURITY ANALYSIS
========================================
Title: ${title}
Timestamp: ${new Date().toLocaleString()}

EXPLANATION:
${explanation}

BUSINESS IMPACT:
${businessImpact}

RECOMMENDED RESPONSE:
${recommendedResponse}

FUTURE PREVENTION CONTROLS:
${futurePrevention.map((p, i) => `${i + 1}. ${p}`).join('\n')}
`;

  const handleCopy = () => {
    navigator.clipboard.writeText(fullReportText);
    addToast('📋 AI Security Analysis copied to clipboard.', 'success');
  };

  const handleDownload = () => {
    const blob = new Blob([fullReportText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SentinelX_AI_Analysis_${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addToast('📥 AI Analysis report downloaded.', 'info');
  };

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
              className="w-screen max-w-xl bg-[#070b14] border-l border-purple-500/40 text-slate-100 flex flex-col justify-between shadow-2xl relative z-10"
            >
              {/* Drawer Header */}
              <div className="p-6 border-b border-purple-500/30 bg-slate-950/90 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-900/60 border border-purple-400/40 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-purple-300" />
                  </div>
                  <div>
                    <h2 className="text-xl font-extrabold text-white font-heading">
                      AI Security Analysis
                    </h2>
                    <p className="text-xs text-purple-300/80 font-mono">
                      Gemini Copilot Threat Intelligence
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

              {/* Drawer Body Content */}
              <div className="p-6 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
                
                {/* Title Card */}
                <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/30 space-y-1">
                  <span className="text-[10px] font-mono font-bold text-purple-400 uppercase tracking-wider block">
                    Target Insight
                  </span>
                  <h3 className="text-base font-extrabold text-white font-heading">
                    {title}
                  </h3>
                </div>

                {/* Explanation */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <h4 className="text-xs font-mono font-bold text-[#00D4FF] uppercase tracking-wider flex items-center gap-2">
                    <Bot className="w-4 h-4" />
                    <span>Technical Explanation</span>
                  </h4>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    {explanation}
                  </p>
                </div>

                {/* Business Impact */}
                <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-800/60 space-y-2">
                  <h4 className="text-xs font-mono font-bold text-rose-400 uppercase tracking-wider flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    <span>Business Impact</span>
                  </h4>
                  <p className="text-xs text-rose-200/90 leading-relaxed">
                    {businessImpact}
                  </p>
                </div>

                {/* Recommended Response */}
                <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-800/60 space-y-2">
                  <h4 className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4" />
                    <span>Recommended Response</span>
                  </h4>
                  <p className="text-xs text-emerald-200/90 leading-relaxed">
                    {recommendedResponse}
                  </p>
                </div>

                {/* Future Prevention */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <h4 className="text-xs font-mono font-bold text-purple-300 uppercase tracking-wider flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-purple-400" />
                    <span>Future Prevention Controls</span>
                  </h4>
                  <ul className="space-y-2">
                    {futurePrevention.map((prev, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5 shrink-0" />
                        <span>{prev}</span>
                      </li>
                    ))}
                  </ul>
                </div>

              </div>

              {/* Drawer Actions Footer */}
              <div className="p-5 border-t border-slate-800/80 bg-slate-950/90 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-200 font-bold transition-all cursor-pointer flex items-center gap-1.5"
                    title="Copy Analysis"
                  >
                    <Copy className="w-3.5 h-3.5 text-[#00D4FF]" />
                    <span>Copy</span>
                  </button>

                  <button
                    onClick={handleDownload}
                    className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-200 font-bold transition-all cursor-pointer flex items-center gap-1.5"
                    title="Download Report"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Download</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  {onRegenerate && (
                    <button
                      onClick={onRegenerate}
                      disabled={isRegenerating}
                      className="px-3 py-2 rounded-xl bg-purple-900/60 hover:bg-purple-800 border border-purple-500/40 text-purple-200 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin text-purple-300' : ''}`} />
                      <span>{isRegenerating ? 'Analyzing...' : 'Regenerate'}</span>
                    </button>
                  )}

                  <button
                    onClick={onClose}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-white font-bold transition-all cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>

            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};
