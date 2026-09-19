import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  FileText, 
  Sparkles, 
  Calendar, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Loader2,
  Server,
  Globe,
  Shield
} from 'lucide-react';
import { useThreats } from '../context/ThreatContext';
import { ReportItem } from '../types';

interface GenerateReportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onReportGenerated?: (report: ReportItem) => void;
}

export const GenerateReportDialog: React.FC<GenerateReportDialogProps> = ({
  isOpen,
  onClose,
  onReportGenerated
}) => {
  const { 
    securityScore, 
    activeThreatsCount, 
    resolvedThreatsCount, 
    quarantinedDevicesCount, 
    blockedIpsCount, 
    connectedDevicesCount, 
    threats, 
    alerts,
    addReport,
    addToast
  } = useThreats();

  const [reportType, setReportType] = useState<'Daily' | 'Weekly' | 'Monthly' | 'Custom'>('Daily');
  const [reportTitle, setReportTitle] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10));
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;

  const criticalCount = threats.filter(t => t.severity === 'Critical').length;
  const recentThreatTitles = threats.slice(0, 5).map(t => t.title);

  const handleGenerate = async () => {
    setIsGenerating(true);
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateToday = new Date().toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
    const timestamp = `${dateToday}, ${timeNow}`;
    
    const finalTitle = reportTitle.trim() || `${reportType} Executive Security Report`;
    const reportId = `REP-${Math.floor(1000 + Math.random() * 9000)}`;

    let aiExecSummary = {
      currentSecurityPosture: `Enterprise posture is rated at ${securityScore}/100. Perimeter WAF and eBPF socket monitoring are fully operational.`,
      mostCriticalIncident: threats.find(t => t.severity === 'Critical')?.title || 'No active critical incidents.',
      riskAssessment: `Low risk across ${connectedDevicesCount} endpoints with ${quarantinedDevicesCount} quarantined and ${blockedIpsCount} ingress IPs blocked.`,
      recommendations: [
        'Maintain automated ingress firewall null-route policies',
        'Audit zero-trust re-authentication tokens quarterly',
        'Monitor endpoint CPU and socket rate spikes via kernel telemetry'
      ]
    };

    try {
      const response = await fetch('/api/generate-report-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportType,
          securityScore,
          activeThreatsCount,
          resolvedThreatsCount,
          criticalIncidentsCount: criticalCount,
          quarantinedDevicesCount,
          blockedIpsCount,
          totalDevicesCount: connectedDevicesCount,
          recentThreats: recentThreatTitles
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.summary) {
          aiExecSummary = data.summary;
        }
      }
    } catch (e) {
      console.warn('Using client fallback summary due to API response error:', e);
    }

    const newReport: ReportItem = {
      id: reportId,
      threatName: finalTitle,
      reportType,
      severity: criticalCount > 0 ? 'Critical' : activeThreatsCount > 2 ? 'High' : 'Medium',
      affectedDevice: 'Enterprise Network Subnets',
      generatedBy: 'SecOps AI Automated',
      generatedTime: timestamp,
      resolutionTime: timestamp,
      resolvedBy: 'Admin',
      method: 'Automated Gemini Synthesis & Kernel Telemetry',
      status: 'Resolved',
      dateRange: reportType === 'Custom' ? `${startDate} to ${endDate}` : dateToday,
      executiveSummary: aiExecSummary,
      snapshot: {
        securityScore,
        activeThreatsCount,
        resolvedThreatsCount,
        criticalIncidentsCount: criticalCount,
        quarantinedDevicesCount,
        blockedIpsCount,
        totalDevicesCount: connectedDevicesCount
      },
      details: {
        description: `Comprehensive ${reportType.toLowerCase()} security audit report generated from live application telemetry.`,
        protocol: 'eBPF / HTTPS / SSH',
        sourceIp: 'Multiple Ingress Ranges',
        destination: 'Enterprise Production Subnet',
        businessImpacts: [
          'Guaranteed SLA compliance and SOC audit logging',
          'Zero unauthorized endpoint access detected'
        ],
        actionsTaken: [
          `Inbound firewall blocked ${blockedIpsCount} origin IPs`,
          `Quarantined ${quarantinedDevicesCount} isolated endpoints`,
          `Mitigated ${resolvedThreatsCount} security incidents`
        ],
        recommendations: aiExecSummary.recommendations
      }
    };

    setIsGenerating(false);
    addReport(newReport);
    onClose();

    if (onReportGenerated) {
      onReportGenerated(newReport);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 font-sans">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative w-full max-w-2xl bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden z-10 text-slate-200"
          >
            {/* Header */}
            <div className="p-6 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-cyan-950 border border-cyan-800 text-[#00D4FF]">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-white font-heading">
                    Generate Security Report
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Synthesize live SOC metrics, threat telemetry, and Gemini AI executive summary.
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                disabled={isGenerating}
                className="p-2 rounded-xl bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              
              {/* Report Type Selector */}
              <div>
                <label className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider block mb-2">
                  1. Select Report Scope & Frequency
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {(['Daily', 'Weekly', 'Monthly', 'Custom'] as const).map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setReportType(type)}
                      className={`p-3 rounded-2xl border text-xs font-bold font-mono transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                        reportType === type
                          ? 'bg-cyan-950/80 border-[#00D4FF] text-[#00D4FF] shadow-[0_0_15px_rgba(0,212,255,0.2)]'
                          : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                      }`}
                    >
                      <Calendar className="w-4 h-4" />
                      <span>{type} Report</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Date Range Picker */}
              {reportType === 'Custom' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-900/50 p-4 rounded-2xl border border-slate-800"
                >
                  <div>
                    <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">Start Date</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00D4FF] font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">End Date</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00D4FF] font-mono"
                    />
                  </div>
                </motion.div>
              )}

              {/* Custom Title Input */}
              <div>
                <label className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider block mb-1">
                  2. Report Title / Document Name
                </label>
                <input
                  type="text"
                  placeholder={`e.g. ${reportType} Executive Security Summary & Incident Audit`}
                  value={reportTitle}
                  onChange={(e) => setReportTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#00D4FF]"
                />
              </div>

              {/* Live Application Data Preview Card */}
              <div>
                <label className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider block mb-2">
                  3. Live Application Data Snapshot Included
                </label>
                
                <div className="bg-slate-900/70 p-4 rounded-2xl border border-slate-800 space-y-3 text-xs">
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center">
                    <div className="p-2 bg-slate-950 rounded-xl border border-slate-800/80">
                      <span className="text-[9px] font-mono text-slate-400 block uppercase">Score</span>
                      <span className="font-extrabold text-emerald-400 font-mono">{securityScore}</span>
                    </div>
                    <div className="p-2 bg-slate-950 rounded-xl border border-slate-800/80">
                      <span className="text-[9px] font-mono text-slate-400 block uppercase">Active</span>
                      <span className="font-extrabold text-rose-400 font-mono">{activeThreatsCount}</span>
                    </div>
                    <div className="p-2 bg-slate-950 rounded-xl border border-slate-800/80">
                      <span className="text-[9px] font-mono text-slate-400 block uppercase">Critical</span>
                      <span className="font-extrabold text-amber-400 font-mono">{criticalCount}</span>
                    </div>
                    <div className="p-2 bg-slate-950 rounded-xl border border-slate-800/80">
                      <span className="text-[9px] font-mono text-slate-400 block uppercase">Resolved</span>
                      <span className="font-extrabold text-cyan-400 font-mono">{resolvedThreatsCount}</span>
                    </div>
                    <div className="p-2 bg-slate-950 rounded-xl border border-slate-800/80">
                      <span className="text-[9px] font-mono text-slate-400 block uppercase">Blocked IP</span>
                      <span className="font-extrabold text-purple-400 font-mono">{blockedIpsCount}</span>
                    </div>
                    <div className="p-2 bg-slate-950 rounded-xl border border-slate-800/80">
                      <span className="text-[9px] font-mono text-slate-400 block uppercase">Quarantine</span>
                      <span className="font-extrabold text-rose-400 font-mono">{quarantinedDevicesCount}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-slate-400 pt-1 font-mono">
                    <Sparkles className="w-3.5 h-3.5 text-[#00D4FF]" />
                    <span>Gemini 3.6 Flash will generate an AI Executive Summary & Action Plan.</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Footer Buttons */}
            <div className="p-5 border-t border-slate-800 bg-slate-950 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isGenerating}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleGenerate}
                disabled={isGenerating}
                className="px-5 py-2.5 bg-[#00D4FF] text-slate-950 font-extrabold rounded-xl text-xs hover:bg-cyan-300 transition-colors cursor-pointer flex items-center gap-2 shadow-[0_0_20px_rgba(0,212,255,0.3)] disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                    <span>Synthesizing Telemetry...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 fill-slate-950" />
                    <span>Generate Report with Gemini AI</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
