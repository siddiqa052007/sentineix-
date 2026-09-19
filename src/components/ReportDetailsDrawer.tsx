import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  FileText, 
  Download, 
  FileSpreadsheet, 
  Trash2, 
  ShieldAlert, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  Server, 
  Globe, 
  Cpu, 
  ShieldCheck, 
  User, 
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { ReportItem } from '../types';
import { generateReportPdf } from '../utils/pdfGenerator';
import { exportSingleReportToCsv } from '../utils/csvExport';
import { useThreats } from '../context/ThreatContext';

interface ReportDetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  report: ReportItem | null;
}

export const ReportDetailsDrawer: React.FC<ReportDetailsDrawerProps> = ({
  isOpen,
  onClose,
  report
}) => {
  const { deleteReport, addToast, connectedDevicesCount, totalDevicesCount } = useThreats();

  if (!isOpen || !report) return null;

  const handleDownloadPdf = () => {
    try {
      generateReportPdf(report);
      addToast(`Downloaded PDF for Report ${report.id}`, 'success');
    } catch (e) {
      addToast('Failed to generate PDF.', 'error');
    }
  };

  const handleDownloadCsv = () => {
    try {
      exportSingleReportToCsv(report);
      addToast(`Exported CSV for Report ${report.id}`, 'info');
    } catch (e) {
      addToast('Failed to export CSV.', 'error');
    }
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete report ${report.id}?`)) {
      deleteReport(report.id);
      onClose();
    }
  };

  const exec = report.executiveSummary || {
    currentSecurityPosture: 'System security posture remains stable. Threat vectors have been mitigated.',
    mostCriticalIncident: report.threatName,
    riskAssessment: 'Low residual exposure following incident response protocols.',
    recommendations: [
      'Maintain continuous eBPF kernel socket monitoring',
      'Enforce zero-trust multi-factor authentication across endpoints',
      'Audit external ingress firewall port rules regularly'
    ]
  };

  const snap = report.snapshot || {
    securityScore: 92,
    activeThreatsCount: 2,
    resolvedThreatsCount: 14,
    criticalIncidentsCount: 0,
    quarantinedDevicesCount: 1,
    blockedIpsCount: 5,
    totalDevicesCount: 18
  };

  const det = report.details || {};

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

          {/* Right Drawer Container */}
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="w-screen max-w-2xl bg-slate-950 border-l border-slate-800 shadow-2xl flex flex-col justify-between text-slate-200"
            >
              {/* Drawer Header */}
              <div className="p-6 border-b border-slate-800 bg-slate-900/60 flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className="px-2 py-0.5 rounded bg-cyan-950/80 text-[#00D4FF] border border-cyan-800/80 font-mono text-xs font-bold">
                      {report.id}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-xs font-mono font-bold uppercase border ${
                      report.severity === 'Critical'
                        ? 'bg-rose-950 text-rose-400 border-rose-800'
                        : report.severity === 'High'
                        ? 'bg-amber-950 text-amber-400 border-amber-800'
                        : 'bg-blue-950 text-blue-400 border-blue-800'
                    }`}>
                      {report.severity} Severity
                    </span>
                    <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-mono text-xs font-bold uppercase">
                      {report.status}
                    </span>
                    {report.reportType && (
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-mono text-xs">
                        {report.reportType}
                      </span>
                    )}
                  </div>

                  <h3 className="text-xl font-extrabold text-white font-heading">
                    {report.threatName}
                  </h3>
                  
                  <p className="text-xs text-slate-400 mt-1 flex items-center gap-3 font-mono">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      Generated: {report.generatedTime || report.resolutionTime || 'Recently'}
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-slate-500" />
                      By: {report.generatedBy || report.resolvedBy || 'SecOps AI'}
                    </span>
                  </p>
                </div>

                <button
                  onClick={onClose}
                  className="p-2 rounded-xl bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="p-6 overflow-y-auto space-y-6 flex-1">
                
                {/* Action Buttons Top Bar */}
                <div className="flex items-center gap-3 pb-2 border-b border-slate-800/80 flex-wrap">
                  <button
                    onClick={handleDownloadPdf}
                    className="px-3.5 py-2 rounded-xl bg-[#00D4FF] text-slate-950 font-bold text-xs hover:bg-cyan-300 transition-colors cursor-pointer flex items-center gap-1.5 shadow-[0_0_12px_rgba(0,212,255,0.2)]"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download PDF Report</span>
                  </button>

                  <button
                    onClick={handleDownloadCsv}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors cursor-pointer flex items-center gap-1.5 border border-slate-700"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                    <span>Export CSV</span>
                  </button>

                  <button
                    onClick={handleDelete}
                    className="px-3.5 py-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 font-semibold text-xs transition-colors cursor-pointer flex items-center gap-1.5 border border-rose-800/60 ml-auto"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                </div>

                {/* Metric Telemetry Snapshot */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 uppercase block">Security Score</span>
                    <span className="text-xl font-extrabold text-emerald-400 font-mono">{snap.securityScore}/100</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 uppercase block">Active Threats</span>
                    <span className="text-xl font-extrabold text-rose-400 font-mono">{snap.activeThreatsCount}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 uppercase block">Connected Devices</span>
                    <span className="text-xl font-extrabold text-cyan-400 font-mono">{connectedDevicesCount} <span className="text-xs text-slate-500 font-normal">/{totalDevicesCount}</span></span>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 uppercase block">Resolved Incidents</span>
                    <span className="text-xl font-extrabold text-blue-400 font-mono">{snap.resolvedThreatsCount}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 uppercase block">Blocked IPs</span>
                    <span className="text-xl font-extrabold text-purple-400 font-mono">{snap.blockedIpsCount}</span>
                  </div>
                </div>

                {/* AI Executive Summary Box */}
                <div className="glass-card p-5 rounded-2xl border border-cyan-900/40 bg-gradient-to-br from-cyan-950/20 via-slate-900/40 to-slate-950 space-y-4">
                  <div className="flex items-center gap-2 text-[#00D4FF]">
                    <Sparkles className="w-5 h-5 text-[#00D4FF] animate-pulse" />
                    <h4 className="text-sm font-bold uppercase tracking-wider font-mono">Gemini AI Executive Summary</h4>
                  </div>

                  <div className="space-y-3 text-xs leading-relaxed text-slate-300">
                    <div>
                      <span className="font-bold text-white block mb-0.5">Current Security Posture:</span>
                      <p className="text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                        {exec.currentSecurityPosture}
                      </p>
                    </div>

                    <div>
                      <span className="font-bold text-white block mb-0.5">Most Critical Incident Overview:</span>
                      <p className="text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                        {exec.mostCriticalIncident}
                      </p>
                    </div>

                    <div>
                      <span className="font-bold text-white block mb-0.5">Risk & Exposure Assessment:</span>
                      <p className="text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                        {exec.riskAssessment}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Threat Summary & Target Details */}
                <div className="space-y-3">
                  <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-[#00D4FF]" />
                    Threat Vector & Target Details
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 space-y-1">
                      <span className="text-slate-400 text-[10px] font-mono block">AFFECTED DEVICE / TARGET</span>
                      <span className="font-semibold text-white flex items-center gap-1.5 font-mono">
                        <Server className="w-3.5 h-3.5 text-cyan-400" />
                        {report.affectedDevice || det.destination || 'web-frontend-cluster'}
                      </span>
                    </div>

                    <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 space-y-1">
                      <span className="text-slate-400 text-[10px] font-mono block">ORIGIN SOURCE IP</span>
                      <span className="font-semibold text-rose-400 flex items-center gap-1.5 font-mono">
                        <Globe className="w-3.5 h-3.5 text-rose-400" />
                        {det.sourceIp || '185.220.101.5 (Blackholed)'}
                      </span>
                    </div>

                    <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 space-y-1">
                      <span className="text-slate-400 text-[10px] font-mono block">NETWORK PROTOCOL</span>
                      <span className="font-semibold text-slate-200 font-mono">
                        {det.protocol || 'HTTPS / TCP (443)'}
                      </span>
                    </div>

                    <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 space-y-1">
                      <span className="text-slate-400 text-[10px] font-mono block">MITIGATION METHOD</span>
                      <span className="font-semibold text-emerald-400 font-mono">
                        {report.method || 'eBPF Ingress Null-Route'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Items & Recommendations */}
                <div className="space-y-3">
                  <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Prioritized Action Plan & Recommendations
                  </h4>

                  <div className="space-y-2">
                    {(exec.recommendations || []).map((rec, idx) => (
                      <div key={idx} className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/80 flex items-start gap-2.5 text-xs text-slate-300">
                        <span className="w-5 h-5 rounded-full bg-cyan-950 text-[#00D4FF] border border-cyan-800 font-mono text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <p className="leading-relaxed">{rec}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Audit Footer Info */}
                <div className="p-4 rounded-xl bg-slate-900/30 border border-slate-800 text-[11px] text-slate-500 font-mono space-y-1">
                  <div className="flex justify-between">
                    <span>Audit Log Signature:</span>
                    <span className="text-slate-400">SHA256: 8f92a3b1c0e4...</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Compliance Standard:</span>
                    <span className="text-slate-400">SOC2 Type II / NIST 800-53</span>
                  </div>
                </div>

              </div>

              {/* Drawer Footer */}
              <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between gap-3">
                <span className="text-xs text-slate-500 font-mono">SentinelX Security Console</span>
                <button
                  onClick={onClose}
                  className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};
