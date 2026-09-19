import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ShieldCheck, ArrowRight, CheckCircle2, RefreshCw, AlertCircle, Loader2, Bot, ChevronRight } from 'lucide-react';
import { AiAnalysisDrawer } from './AiAnalysisDrawer';
import { useThreats } from '../context/ThreatContext';

const ROTATING_MESSAGES = [
  'Understanding attack pattern...',
  'Evaluating risk level...',
  'Generating recommendations...',
  'Synthesizing threat intelligence...',
  'Finalizing SecOps intelligence report...'
];

export const AiInsightsWidget: React.FC = () => {
  const { addToast } = useThreats();
  const [applied, setApplied] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [loadingStepIndex, setLoadingStepIndex] = useState(0);
  const [streamingText, setStreamingText] = useState('');
  const [customAiOutput, setCustomAiOutput] = useState<{
    explanation?: string;
    businessImpact?: string;
    recommendedResponse?: string;
    futurePrevention?: string[];
  } | null>(null);

  const [recommendations, setRecommendations] = useState([
    'Enable Multi-Factor Authentication across admin endpoints',
    'Review repeated failed logins on port 443',
    'Update BGP null-route firewall policies',
    'Monitor suspicious IP ranges (185.220.101.0/24)'
  ]);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedInsight, setSelectedInsight] = useState<any>(null);

  const handleOpenInsightDrawer = (titleStr: string, expStr?: string) => {
    setSelectedInsight({
      title: titleStr,
      explanation: expStr || customAiOutput?.explanation || `Gemini automated assessment for: "${titleStr}". Anomalous ingress traffic evaluated across cluster boundaries.`,
      businessImpact: customAiOutput?.businessImpact || 'Risk of elevated latency and unauthorized ingress probing if unmitigated.',
      recommendedResponse: customAiOutput?.recommendedResponse || 'Apply zero-trust firewall policy, enforce rate limiting on public endpoints, and verify admin authorization headers.',
      futurePrevention: customAiOutput?.futurePrevention || recommendations
    });
    setIsDrawerOpen(true);
  };

  // Rotate loading status messages while loading
  useEffect(() => {
    if (!isAiLoading) {
      setLoadingStepIndex(0);
      return;
    }
    const interval = setInterval(() => {
      setLoadingStepIndex((prev) => (prev + 1) % ROTATING_MESSAGES.length);
    }, 1300);
    return () => clearInterval(interval);
  }, [isAiLoading]);

  const handleRunAiAudit = async () => {
    setIsAiLoading(true);
    setAiError(null);
    setStreamingText('');
    setCustomAiOutput(null);

    const defaultThreat = {
      id: 'TRT-GLB-001',
      title: 'Global SOC Telemetry Audit',
      severity: 'High',
      status: 'Active',
      sourceIp: 'Multiple Ingress IP Nodes',
      destination: 'Enterprise Gateway & Core APIs',
      protocol: 'HTTPS / TLS 1.3',
      riskScore: 92,
      description: 'System-wide evaluation of current SOC telemetry logs, anomalous connection attempts, and unmitigated zero-day vectors.'
    };

    try {
      const response = await fetch('/api/analyze-threat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ threat: defaultThreat, stream: true })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to generate Gemini AI Security Insights.');
      }

      const reader = response.body?.getReader();
      if (!reader) {
        const data = await response.json();
        if (data.analysis) {
          setCustomAiOutput(data.analysis);
          if (data.analysis.futurePrevention) {
            setRecommendations(data.analysis.futurePrevention);
          }
          return;
        }
        throw new Error('Received empty response from Gemini API.');
      }

      const decoder = new TextDecoder();
      let accumulatedRaw = '';
      let parsedAnalysis: any = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const textChunk = decoder.decode(value, { stream: true });
        const lines = textChunk.split('\n\n');

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('data: ')) {
            const dataStr = trimmed.replace('data: ', '').trim();
            try {
              const payload = JSON.parse(dataStr);
              if (payload.chunk) {
                accumulatedRaw += payload.chunk;
                setStreamingText(accumulatedRaw);
              }
              if (payload.done) {
                if (payload.analysis) {
                  parsedAnalysis = payload.analysis;
                } else if (payload.fullText) {
                  const clean = payload.fullText.replace(/```json/g, "").replace(/```/g, "").trim();
                  parsedAnalysis = JSON.parse(clean);
                }
              }
              if (payload.error) {
                throw new Error(payload.error);
              }
            } catch (e: any) {
              if (e.message && !e.message.includes('JSON')) {
                console.warn('Stream parse notice:', e);
              }
            }
          }
        }
      }

      if (!parsedAnalysis && accumulatedRaw) {
        try {
          const clean = accumulatedRaw.replace(/```json/g, "").replace(/```/g, "").trim();
          parsedAnalysis = JSON.parse(clean);
        } catch (e) {
          console.warn('Raw JSON parse fallback:', e);
        }
      }

      if (parsedAnalysis) {
        setCustomAiOutput(parsedAnalysis);
        if (parsedAnalysis.futurePrevention && parsedAnalysis.futurePrevention.length > 0) {
          setRecommendations(parsedAnalysis.futurePrevention);
        }
      } else {
        throw new Error('Could not parse valid AI analysis from Gemini stream.');
      }
    } catch (err: any) {
      console.error('Gemini Audit Error:', err);
      setAiError(err.message || 'Unable to connect to Gemini SecOps API. Please verify network connectivity.');
    } finally {
      setIsAiLoading(false);
      setStreamingText('');
    }
  };

  return (
    <div className="glass-card p-6 rounded-2xl border border-purple-500/30 bg-gradient-to-br from-purple-950/20 via-slate-950/80 to-slate-950/90 hover:border-purple-400/50 transition-all font-sans relative overflow-hidden">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-purple-500/20 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-purple-900/50 border border-purple-400/40 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-purple-300 fill-purple-300/30" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white font-heading">
              Today's Recommendations
            </h3>
            <p className="text-xs text-purple-300/80">Gemini SecOps Intelligence</p>
          </div>
        </div>

        <button
          onClick={handleRunAiAudit}
          disabled={isAiLoading}
          className="px-2.5 py-1 rounded-lg bg-purple-900/60 hover:bg-purple-800 border border-purple-500/40 text-purple-200 text-[10px] font-mono font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all"
        >
          {isAiLoading ? (
            <Loader2 className="w-3 h-3 animate-spin text-purple-300" />
          ) : (
            <RefreshCw className="w-3 h-3 text-purple-300" />
          )}
          <span>Re-Scan with Gemini</span>
        </button>
      </div>

      {/* Error state with retry button */}
      {aiError && !isAiLoading && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3.5 mb-4 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-200 text-xs flex items-start gap-3"
        >
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div className="flex-1 space-y-1">
            <span className="font-bold text-white block">AI Analysis Failed</span>
            <p className="text-[11px] text-rose-300 leading-relaxed">{aiError}</p>
            <button
              onClick={handleRunAiAudit}
              className="mt-2 px-3 py-1 bg-rose-900 hover:bg-rose-800 border border-rose-700 text-white font-bold rounded-lg text-xs cursor-pointer flex items-center gap-1.5 transition-all"
            >
              <RefreshCw className="w-3 h-3 text-white" />
              <span>Retry Analysis</span>
            </button>
          </div>
        </motion.div>
      )}

      {/* Animated Loading State */}
      {isAiLoading && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          className="py-6 px-4 mb-4 rounded-xl bg-purple-950/40 border border-purple-500/30 text-center space-y-4"
        >
          {/* Cyber Radar / Pulse Animation */}
          <div className="relative w-12 h-12 mx-auto flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-purple-500/20 animate-ping" />
            <div className="absolute inset-1 rounded-full bg-gradient-to-tr from-purple-600 to-cyan-400 animate-spin opacity-80" />
            <div className="relative w-8 h-8 rounded-full bg-slate-950 border border-purple-400 flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.5)]">
              <Sparkles className="w-3.5 h-3.5 text-purple-300 animate-pulse" />
            </div>
          </div>

          <div>
            <h5 className="text-sm font-extrabold text-white font-heading tracking-wide">
              Analyzing security incident...
            </h5>
            <p className="text-[10px] font-mono text-purple-300/80 mt-0.5">
              Gemini SecOps Intelligence Scan
            </p>
          </div>

          {/* Rotating Status Messages */}
          <div className="h-6 flex items-center justify-center overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={loadingStepIndex}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                className="text-xs font-mono font-semibold text-purple-200 flex items-center gap-2 bg-purple-900/60 px-3 py-1 rounded-full border border-purple-500/40 shadow-sm"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#00D4FF] animate-pulse shrink-0" />
                <span>• {ROTATING_MESSAGES[loadingStepIndex]}</span>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Streaming Text Preview */}
          {streamingText && (
            <div className="mt-2 p-2.5 rounded-lg bg-slate-950/90 border border-purple-500/30 text-left font-mono text-[10px] text-purple-200/90 max-h-24 overflow-y-auto leading-relaxed custom-scrollbar">
              <span className="text-[9px] text-purple-400 font-bold block mb-1">
                TELEMETRY STREAM:
              </span>
              <p className="whitespace-pre-wrap">{streamingText}</p>
            </div>
          )}
        </motion.div>
      )}

      {/* Gemini Custom Output or Standard Recommendations */}
      {!isAiLoading && (
        <AnimatePresence mode="wait">
          <motion.div
            key={customAiOutput ? 'custom' : 'standard'}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-3 mb-5"
          >
            {customAiOutput ? (
              <div 
                onClick={() => handleOpenInsightDrawer('Gemini Security Copilot Analysis', customAiOutput.explanation)}
                className="p-3.5 rounded-xl bg-purple-950/40 border border-purple-500/40 hover:border-purple-400 transition-all text-xs space-y-2.5 cursor-pointer group"
              >
                <div className="text-purple-300 font-mono text-[10px] font-bold uppercase tracking-wide flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Bot className="w-3.5 h-3.5 text-[#00D4FF]" />
                    <span>Gemini Security Copilot Analysis</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-purple-400 group-hover:translate-x-0.5 transition-transform" />
                </div>
                {customAiOutput.explanation && (
                  <p className="text-slate-200 leading-relaxed text-xs">{customAiOutput.explanation}</p>
                )}
                {customAiOutput.recommendedResponse && (
                  <div className="p-2 rounded bg-emerald-950/60 border border-emerald-800 text-emerald-200 text-[11px]">
                    <strong className="block text-emerald-300 mb-0.5">Recommended Mitigation:</strong>
                    {customAiOutput.recommendedResponse}
                  </div>
                )}
              </div>
            ) : (
              recommendations.map((rec, idx) => (
                <div 
                  key={idx}
                  onClick={() => handleOpenInsightDrawer(rec)}
                  className="p-3 rounded-xl bg-slate-900/90 border border-purple-900/30 hover:border-purple-400/80 hover:bg-slate-900 transition-all flex items-center justify-between text-xs text-slate-200 cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <span className="w-2 h-2 rounded-full bg-[#00D4FF] shadow-[0_0_8px_#00D4FF] shrink-0" />
                    <span className="font-medium group-hover:text-purple-200 transition-colors truncate">{rec}</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <CheckCircle2 className={`w-4 h-4 ${applied ? 'text-emerald-400' : 'text-slate-600'}`} />
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-purple-300 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              ))
            )}
          </motion.div>
        </AnimatePresence>
      )}

      {/* Interactive Action Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-purple-500/20 gap-3">
        <button
          onClick={() => {
            if (!customAiOutput && !isAiLoading) {
              handleRunAiAudit();
            }
            setApplied(true);
            addToast('✨ Gemini SecOps recommendations applied.', 'success');
          }}
          className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
            applied 
              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' 
              : 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white hover:opacity-90 shadow-[0_0_20px_rgba(168,85,247,0.3)]'
          }`}
        >
          {applied ? (
            <>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Recommendations Applied</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-white" />
              <span>Apply Security Fixes</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </div>

      {/* AI ANALYSIS DRAWER */}
      <AiAnalysisDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        insight={selectedInsight}
        onRegenerate={handleRunAiAudit}
        isRegenerating={isAiLoading}
      />

    </div>
  );
};


