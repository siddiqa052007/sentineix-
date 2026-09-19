import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { jsPDF } from 'jspdf';
import { 
  X, 
  ShieldAlert, 
  CheckCircle2, 
  Sparkles, 
  Download, 
  Clock, 
  AlertTriangle, 
  Activity, 
  FileText, 
  ShieldCheck, 
  Loader2,
  RefreshCw,
  AlertCircle,
  Ban,
  HardDrive,
  BellRing,
  Send,
  UserCheck,
  Zap,
  Server,
  Lock
} from 'lucide-react';
import { useThreats } from '../context/ThreatContext';
import { ThreatDetails } from '../types';

export { type ThreatDetails };

const ROTATING_MESSAGES = [
  'Understanding attack pattern...',
  'Evaluating risk level...',
  'Generating recommendations...',
  'Synthesizing threat intelligence...',
  'Finalizing SecOps intelligence report...'
];

export const DEFAULT_BRUTE_FORCE_THREAT: ThreatDetails = {
  id: 'TRT-1004',
  title: 'Brute Force Attack',
  severity: 'Critical',
  status: 'Active',
  sourceIp: '192.168.1.24',
  destination: 'Authentication Server',
  detectedAt: '10:20 AM',
  protocol: 'HTTPS',
  riskScore: 96,
  description: 'This attack consists of repeated failed login attempts from the same source IP within a short period of time. The pattern strongly indicates an automated password guessing attempt targeting root and admin accounts.',
  businessImpacts: [
    'Unauthorized account access & privilege escalation',
    'Credential compromise across authentication tokens',
    'Service disruption due to rate limit triggers & resource exhaustion'
  ],
  recommendedActions: [
    { id: 'act-1', text: 'Block Source IP (192.168.1.24) at ingress WAF', completed: false },
    { id: 'act-2', text: 'Enable Multi-Factor Authentication (MFA) for target accounts', completed: true },
    { id: 'act-3', text: 'Review authentication logs for breached session tokens', completed: false },
    { id: 'act-4', text: 'Reset affected passwords and invalidate active JWTs', completed: false }
  ],
  timeline: [
    { time: '10:18 AM', title: 'Multiple login attempts detected', desc: '140 failed requests/sec flagged', statusTag: 'TRIGGERED' },
    { time: '10:20 AM', title: 'Brute Force identified', desc: 'Pattern matched automated dictionary payload', statusTag: 'ANALYZED' },
    { time: '10:21 AM', title: 'Alert generated', desc: 'SentinelX SOC high-priority notification triggered', statusTag: 'ALERT' }
  ],
  aiAnalysis: {
    explanation: 'This attack attempts to guess passwords by repeatedly trying multiple combinations against the authentication gateway within a compressed timeframe.',
    businessImpact: 'User accounts may be compromised, leading to unauthorized data exfiltration or lateral movement.',
    recommendedResponse: 'Immediately block the source IP at the network boundary. Force MFA re-validation and audit failed login audit trails.',
    futurePrevention: [
      'Implement adaptive rate limiting on /api/auth endpoints.',
      'Enforce stronger zero-trust password policies.',
      'Monitor real-time authentication log telemetry via eBPF.'
    ]
  }
};

interface ThreatDetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  threat?: ThreatDetails | null;
  onAskAiTabNav?: () => void;
}

export const ThreatDetailsDrawer: React.FC<ThreatDetailsDrawerProps> = ({
  isOpen,
  onClose,
  threat = DEFAULT_BRUTE_FORCE_THREAT,
  onAskAiTabNav
}) => {
  const currentThreat = threat || DEFAULT_BRUTE_FORCE_THREAT;
  const { 
    blockIp, 
    quarantineDevice, 
    notifySecurityTeam, 
    resolveThreat, 
    updateThreatAiAnalysis, 
    toggleAction 
  } = useThreats();

  // Local state for modals and action loading spinners
  const aiSectionRef = useRef<HTMLDivElement>(null);
  const [showBlockIpModal, setShowBlockIpModal] = useState(false);
  const [showQuarantineModal, setShowQuarantineModal] = useState(false);
  const [showResolveModal, setShowResolveModal] = useState(false);

  const [isBlocking, setIsBlocking] = useState(false);
  const [isQuarantining, setIsQuarantining] = useState(false);
  const [isNotifying, setIsNotifying] = useState(false);
  const [isResolving, setIsResolving] = useState(false);

  const [blockReasonInput, setBlockReasonInput] = useState('');

  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [streamingText, setStreamingText] = useState('');
  const [loadingStepIndex, setLoadingStepIndex] = useState(0);

  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [pdfDownloaded, setPdfDownloaded] = useState(false);

  const isResolved = currentThreat.status === 'Resolved' || currentThreat.status === 'Archived';
  const isBlocked = currentThreat.blocked;
  const isQuarantined = currentThreat.quarantined;
  const isNotificationSent = currentThreat.notificationSent;

  // Rotate AI status messages
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

  // Reset local state on threat change
  useEffect(() => {
    setShowBlockIpModal(false);
    setShowQuarantineModal(false);
    setShowResolveModal(false);
    setIsBlocking(false);
    setIsQuarantining(false);
    setIsNotifying(false);
    setIsResolving(false);
    setIsAiLoading(false);
    setAiError(null);
    setStreamingText('');
    setPdfDownloaded(false);
    setBlockReasonInput(`Automated ingress block for ${currentThreat.sourceIp} (${currentThreat.title})`);
  }, [threat]);

  // Handler: Block Source IP
  const handleConfirmBlockIp = () => {
    setIsBlocking(true);
    setTimeout(() => {
      blockIp(currentThreat.id, blockReasonInput);
      setIsBlocking(false);
      setShowBlockIpModal(false);
    }, 600);
  };

  // Handler: Quarantine Device
  const handleConfirmQuarantine = () => {
    setIsQuarantining(true);
    setTimeout(() => {
      quarantineDevice(currentThreat.id, currentThreat.deviceName || currentThreat.destination);
      setIsQuarantining(false);
      setShowQuarantineModal(false);
    }, 600);
  };

  // Handler: Notify Security Team
  const handleNotifyTeam = () => {
    if (isNotificationSent) return;
    setIsNotifying(true);
    setTimeout(() => {
      notifySecurityTeam(currentThreat.id);
      setIsNotifying(false);
    }, 700);
  };

  // Handler: Mark as Resolved
  const handleConfirmResolve = () => {
    setIsResolving(true);
    setTimeout(() => {
      resolveThreat(currentThreat.id);
      setIsResolving(false);
      setShowResolveModal(false);
      onClose();
    }, 600);
  };

  // Fetch AI Security Analysis via Gemini Streaming API
  const handleFetchAiAnalysis = async () => {
    setIsAiLoading(true);
    setAiError(null);
    setStreamingText('');

    setTimeout(() => {
      if (aiSectionRef.current) {
        aiSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 50);

    try {
      const response = await fetch('/api/analyze-threat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ threat: currentThreat, stream: true })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to generate AI Security Analysis.');
      }

      const reader = response.body?.getReader();
      if (!reader) {
        const data = await response.json();
        if (data.analysis) {
          updateThreatAiAnalysis(currentThreat.id, data.analysis);
          return;
        } else {
          throw new Error('Received empty response from Gemini API.');
        }
      }

      const decoder = new TextDecoder();
      let accumulatedRaw = '';
      let parsedAnalysis: ThreatDetails['aiAnalysis'] | null = null;

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
        updateThreatAiAnalysis(currentThreat.id, parsedAnalysis);
      } else {
        throw new Error('Could not parse valid AI analysis from Gemini stream.');
      }
    } catch (err: any) {
      console.error('AI Analysis Error:', err);
      setAiError(err.message || 'Error communicating with Gemini SecOps model.');
    } finally {
      setIsAiLoading(false);
      setStreamingText('');
    }
  };

  // Export Executive PDF Report
  const handleDownloadPdf = () => {
    setIsDownloadingPdf(true);
    setTimeout(() => {
      try {
        const doc = new jsPDF();

        // Header
        doc.setFillColor(7, 11, 20);
        doc.rect(0, 0, 210, 297, 'F');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(22);
        doc.setTextColor(0, 212, 255);
        doc.text('SENTINELX SOC INCIDENT REPORT', 15, 25);

        doc.setFontSize(10);
        doc.setFont('courier', 'bold');
        doc.setTextColor(148, 163, 184);
        doc.text(`Threat ID: ${currentThreat.id} | Generated: ${new Date().toLocaleString()}`, 15, 33);

        doc.setDrawColor(0, 212, 255);
        doc.setLineWidth(0.5);
        doc.line(15, 38, 195, 38);

        // Attack Info Table
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(13);
        doc.setTextColor(255, 255, 255);
        doc.text('1. Incident Overview', 15, 50);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(203, 213, 225);

        doc.text(`Title: ${currentThreat.title}`, 15, 60);
        doc.text(`Severity: ${currentThreat.severity}`, 15, 67);
        doc.text(`Status: ${currentThreat.status}`, 15, 74);
        doc.text(`Source IP: ${currentThreat.sourceIp}`, 15, 81);
        doc.text(`Target Destination: ${currentThreat.destination}`, 15, 88);
        doc.text(`Protocol: ${currentThreat.protocol}`, 15, 95);
        doc.text(`Risk Score: ${currentThreat.riskScore}/100`, 15, 102);

        // Actions Taken
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(13);
        doc.setTextColor(255, 255, 255);
        doc.text('2. Incident Response Actions Taken', 15, 118);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(203, 213, 225);

        let y = 128;
        doc.text(`• IP Blocked: ${isBlocked ? `YES (${currentThreat.blockedAt})` : 'NO'}`, 15, y);
        y += 7;
        doc.text(`• Device Quarantined: ${isQuarantined ? `YES (${currentThreat.quarantinedAt})` : 'NO'}`, 15, y);
        y += 7;
        doc.text(`• Security Team Notified: ${isNotificationSent ? `YES (${currentThreat.notificationTime})` : 'NO'}`, 15, y);
        y += 7;
        doc.text(`• Lifecycle Status: ${currentThreat.status}`, 15, y);

        // Description
        y += 15;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(13);
        doc.setTextColor(255, 255, 255);
        doc.text('3. Technical Description & Analysis', 15, y);

        y += 10;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(203, 213, 225);
        const splitDesc = doc.splitTextToSize(currentThreat.description, 180);
        doc.text(splitDesc, 15, y);

        // Footer
        doc.setFontSize(8);
        doc.setFont('courier', 'normal');
        doc.setTextColor(100, 116, 139);
        doc.text('CONFIDENTIAL - SENTINELX ENTERPRISE INTRUSION DETECTION SYSTEM', 15, 285);

        doc.save(`SentinelX_Incident_${currentThreat.id}.pdf`);
        setPdfDownloaded(true);
      } catch (err) {
        console.error("PDF generation failed:", err);
      } finally {
        setIsDownloadingPdf(false);
      }
    }, 600);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* BACKDROP */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 cursor-pointer"
          />

          {/* SLIDING PANEL */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 220 }}
            className="fixed top-0 right-0 h-full w-full max-w-2xl bg-[#070b14] border-l border-slate-800 shadow-[0_0_50px_rgba(0,0,0,0.8)] z-50 flex flex-col font-sans overflow-hidden"
          >
            
            {/* PANEL HEADER */}
            <div className="p-5 sm:p-6 border-b border-slate-800/80 bg-slate-950/90 flex items-center justify-between sticky top-0 z-20 backdrop-blur-md">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className={`p-2.5 rounded-xl border shrink-0 shadow-lg ${
                  currentThreat.severity === 'Critical'
                    ? 'bg-rose-950/80 border-rose-800 text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.3)]'
                    : 'bg-amber-950/80 border-amber-800 text-amber-400'
                }`}>
                  <ShieldAlert className="w-5 h-5" />
                </div>

                <div className="overflow-hidden">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-extrabold text-[#00D4FF]">
                      {currentThreat.id}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${
                      currentThreat.severity === 'Critical'
                        ? 'bg-rose-950 text-rose-400 border-rose-800'
                        : 'bg-amber-950 text-amber-400 border-amber-800'
                    }`}>
                      {currentThreat.severity}
                    </span>

                    {/* STATUS LIFECYCLE BADGE */}
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border flex items-center gap-1 ${
                      isResolved
                        ? 'bg-emerald-950/90 text-emerald-400 border-emerald-800'
                        : currentThreat.status === 'Action Taken'
                        ? 'bg-purple-950/90 text-purple-300 border-purple-800'
                        : currentThreat.status === 'Under Investigation'
                        ? 'bg-cyan-950/90 text-[#00D4FF] border-cyan-800'
                        : 'bg-rose-950/90 text-rose-300 border-rose-800'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${isResolved ? 'bg-emerald-400' : 'bg-[#00D4FF] animate-pulse'}`} />
                      <span>{currentThreat.status}</span>
                    </span>

                    {isBlocked && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-rose-950 text-rose-300 border border-rose-800 uppercase">
                        BLOCKED
                      </span>
                    )}
                    {isQuarantined && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-800 uppercase">
                        QUARANTINED
                      </span>
                    )}
                  </div>

                  <h2 className="text-base sm:text-lg font-bold text-white truncate font-heading mt-0.5">
                    {currentThreat.title}
                  </h2>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer shrink-0"
                title="Close Drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* SCROLLABLE BODY CONTENT */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 custom-scrollbar text-xs">
              
              {/* INCIDENT RESPONSE WORKFLOW SECTION (4 ACTION CARDS) */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900/90 to-slate-950 border border-cyan-500/30 shadow-[0_0_25px_rgba(0,212,255,0.08)] space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-[#00D4FF]" />
                    <h3 className="text-sm font-bold text-white font-heading uppercase tracking-wider">
                      Incident Response Control Panel
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-[#00D4FF] bg-cyan-950 px-2 py-0.5 rounded-md border border-cyan-800">
                    SOC MITIGATION
                  </span>
                </div>

                {/* 4 Professional Action Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  
                  {/* CARD 1: BLOCK SOURCE IP */}
                  <div className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between space-y-3 ${
                    isBlocked 
                      ? 'bg-rose-950/30 border-rose-800/80 text-rose-200' 
                      : 'bg-slate-900/90 border-slate-800 hover:border-rose-500/50'
                  }`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className={`p-2 rounded-lg border ${
                          isBlocked ? 'bg-rose-900/60 border-rose-700 text-rose-300' : 'bg-slate-950 border-slate-800 text-rose-400'
                        }`}>
                          <Ban className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-bold text-white text-xs font-heading">
                            1. Block Source IP
                          </h4>
                          <p className="text-[10px] text-slate-400 font-mono">
                            IP: <span className="text-rose-400 font-bold">{currentThreat.sourceIp}</span>
                          </p>
                        </div>
                      </div>

                      {isBlocked && (
                        <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-rose-950 text-rose-300 border border-rose-800 shrink-0">
                          BLOCKED
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                      Blackhole target IP at ingress eBPF firewall boundary.
                    </p>

                    <button
                      onClick={() => setShowBlockIpModal(true)}
                      disabled={isBlocked || isResolved}
                      className={`w-full py-2 px-3 rounded-lg font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        isBlocked
                          ? 'bg-rose-950/80 text-rose-400 border border-rose-800/60 cursor-default'
                          : 'bg-rose-600 hover:bg-rose-500 text-white shadow-[0_0_12px_rgba(244,63,94,0.3)]'
                      }`}
                    >
                      <Ban className="w-3.5 h-3.5" />
                      <span>{isBlocked ? 'Source IP Blocked' : 'Block Source IP'}</span>
                    </button>
                  </div>

                  {/* CARD 2: QUARANTINE DEVICE */}
                  <div className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between space-y-3 ${
                    isQuarantined 
                      ? 'bg-amber-950/30 border-amber-800/80 text-amber-200' 
                      : 'bg-slate-900/90 border-slate-800 hover:border-amber-500/50'
                  }`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className={`p-2 rounded-lg border ${
                          isQuarantined ? 'bg-amber-900/60 border-amber-700 text-amber-300' : 'bg-slate-950 border-slate-800 text-amber-400'
                        }`}>
                          <Server className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-bold text-white text-xs font-heading">
                            2. Quarantine Device
                          </h4>
                          <p className="text-[10px] text-slate-400 font-mono truncate max-w-[120px]">
                            {currentThreat.deviceName || currentThreat.destination}
                          </p>
                        </div>
                      </div>

                      <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold border shrink-0 ${
                        isQuarantined 
                          ? 'bg-amber-950 text-amber-300 border-amber-800' 
                          : 'bg-emerald-950 text-emerald-300 border-emerald-800'
                      }`}>
                        {isQuarantined ? 'ISOLATED' : 'ONLINE'}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                      Isolate target endpoint from network subnet & LAN.
                    </p>

                    <button
                      onClick={() => setShowQuarantineModal(true)}
                      disabled={isQuarantined || isResolved}
                      className={`w-full py-2 px-3 rounded-lg font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        isQuarantined
                          ? 'bg-amber-950/80 text-amber-400 border border-amber-800/60 cursor-default'
                          : 'bg-amber-600 hover:bg-amber-500 text-slate-950 shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                      }`}
                    >
                      <HardDrive className="w-3.5 h-3.5" />
                      <span>{isQuarantined ? 'Device Quarantined' : 'Quarantine Device'}</span>
                    </button>
                  </div>

                  {/* CARD 3: NOTIFY SECURITY TEAM */}
                  <div className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between space-y-3 ${
                    isNotificationSent 
                      ? 'bg-cyan-950/30 border-cyan-800/80 text-cyan-200' 
                      : 'bg-slate-900/90 border-slate-800 hover:border-cyan-500/50'
                  }`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className={`p-2 rounded-lg border ${
                          isNotificationSent ? 'bg-cyan-900/60 border-cyan-700 text-cyan-300' : 'bg-slate-950 border-slate-800 text-[#00D4FF]'
                        }`}>
                          <BellRing className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-bold text-white text-xs font-heading">
                            3. Notify SecOps Team
                          </h4>
                          <p className="text-[10px] text-slate-400 font-mono">
                            Dispatch PagerDuty
                          </p>
                        </div>
                      </div>

                      {isNotificationSent && (
                        <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800 shrink-0">
                          DISPATCHED
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                      Alert Tier-2 SecOps engineers & open incident ticket.
                    </p>

                    <button
                      onClick={handleNotifyTeam}
                      disabled={isNotificationSent || isNotifying || isResolved}
                      className={`w-full py-2 px-3 rounded-lg font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        isNotificationSent
                          ? 'bg-cyan-950/80 text-[#00D4FF] border border-cyan-800/60 cursor-default'
                          : 'bg-[#00D4FF] hover:bg-cyan-300 text-slate-950 shadow-[0_0_12px_rgba(0,212,255,0.3)]'
                      }`}
                    >
                      {isNotifying ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Dispatching Alert...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>{isNotificationSent ? 'Security Team Notified' : 'Notify Security Team'}</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* CARD 4: MARK AS RESOLVED */}
                  <div className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between space-y-3 ${
                    isResolved 
                      ? 'bg-emerald-950/30 border-emerald-800/80 text-emerald-200' 
                      : 'bg-slate-900/90 border-slate-800 hover:border-emerald-500/50'
                  }`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className={`p-2 rounded-lg border ${
                          isResolved ? 'bg-emerald-900/60 border-emerald-700 text-emerald-300' : 'bg-slate-950 border-slate-800 text-emerald-400'
                        }`}>
                          <ShieldCheck className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-bold text-white text-xs font-heading">
                            4. Mark as Resolved
                          </h4>
                          <p className="text-[10px] text-slate-400 font-mono">
                            Close Threat Lifecycle
                          </p>
                        </div>
                      </div>

                      {isResolved && (
                        <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 shrink-0">
                          RESOLVED
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                      Mitigate threat, file post-mortem, and move to History.
                    </p>

                    <button
                      onClick={() => setShowResolveModal(true)}
                      disabled={isResolved}
                      className={`w-full py-2 px-3 rounded-lg font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        isResolved
                          ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 cursor-default'
                          : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{isResolved ? 'Threat Resolved' : 'Mark as Resolved'}</span>
                    </button>
                  </div>

                </div>
              </div>

              {/* SECTION 1: Attack Information */}
              <div>
                <h3 className="text-xs font-mono font-bold text-[#00D4FF] uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-[#00D4FF]" />
                  Section 1: Attack Information
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80">
                    <span className="text-[10px] text-slate-400 uppercase font-mono block mb-1">Threat Name</span>
                    <span className="font-bold text-white text-xs truncate block">{currentThreat.title}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80">
                    <span className="text-[10px] text-slate-400 uppercase font-mono block mb-1">Source IP</span>
                    <span className="font-mono font-bold text-rose-400 text-xs truncate block">{currentThreat.sourceIp}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80">
                    <span className="text-[10px] text-slate-400 uppercase font-mono block mb-1">Destination</span>
                    <span className="font-bold text-slate-200 text-xs truncate block">{currentThreat.destination}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80">
                    <span className="text-[10px] text-slate-400 uppercase font-mono block mb-1">Detected At</span>
                    <span className="font-mono font-bold text-slate-200 text-xs block">{currentThreat.detectedAt}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80">
                    <span className="text-[10px] text-slate-400 uppercase font-mono block mb-1">Protocol</span>
                    <span className="font-mono font-bold text-[#00D4FF] text-xs block">{currentThreat.protocol}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-900/60">
                    <span className="text-[10px] text-rose-300 uppercase font-mono block mb-1">Risk Score</span>
                    <span className="font-mono font-extrabold text-rose-400 text-sm block">
                      {currentThreat.riskScore} <span className="text-[10px] text-slate-400 font-normal">/ 100</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* SECTION 2: Description */}
              <div>
                <h3 className="text-xs font-mono font-bold text-[#00D4FF] uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-[#00D4FF]" />
                  Section 2: Description
                </h3>
                
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800/90 text-slate-300 leading-relaxed font-sans shadow-sm">
                  {currentThreat.description}
                </div>
              </div>

              {/* SECTION 3: Risk Level */}
              <div>
                <h3 className="text-xs font-mono font-bold text-[#00D4FF] uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  Section 3: Risk Level & Business Impact
                </h3>

                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1.5 font-mono text-xs">
                      <span className="font-bold text-rose-400 flex items-center gap-1">
                        Risk Level: {currentThreat.severity}
                      </span>
                      <span className="font-extrabold text-rose-400">{currentThreat.riskScore}%</span>
                    </div>

                    <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800 p-0.5">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${currentThreat.riskScore}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="h-full rounded-full bg-gradient-to-r from-amber-500 via-rose-500 to-rose-600 shadow-[0_0_12px_rgba(244,63,94,0.5)]"
                      />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80">
                    <span className="text-[11px] font-mono font-bold text-slate-300 uppercase block mb-2">
                      Business Impact:
                    </span>
                    <ul className="space-y-2 font-sans">
                      {currentThreat.businessImpacts.map((impact, i) => (
                        <li key={i} className="flex items-start gap-2 text-slate-300 text-xs">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0" />
                          <span>{impact}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* SECTION 4: Recommended Actions */}
              <div>
                <h3 className="text-xs font-mono font-bold text-[#00D4FF] uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Section 4: Recommended Checklist
                </h3>

                <div className="space-y-2.5">
                  {currentThreat.recommendedActions.map((act) => (
                    <div
                      key={act.id}
                      onClick={() => toggleAction(currentThreat.id, act.id)}
                      className={`p-3.5 rounded-xl border transition-all flex items-center gap-3 cursor-pointer ${
                        act.completed
                          ? 'bg-emerald-950/30 border-emerald-800/60 text-emerald-300'
                          : 'bg-slate-900/80 border-slate-800 text-slate-200 hover:border-slate-700'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 border transition-all ${
                        act.completed
                          ? 'bg-emerald-500 border-emerald-400 text-slate-950'
                          : 'border-slate-600 bg-slate-950 text-transparent'
                      }`}>
                        <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />
                      </div>

                      <span className={`text-xs font-sans font-medium ${act.completed ? 'line-through text-slate-400' : 'text-slate-200'}`}>
                        {act.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION 5: INCIDENT RESPONSE TIMELINE */}
              <div>
                <h3 className="text-xs font-mono font-bold text-[#00D4FF] uppercase tracking-wider mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-[#00D4FF]" />
                    <span>Section 5: Incident Response Timeline</span>
                  </div>
                  <span className="text-[10px] text-slate-400">Live Audit Stream</span>
                </h3>

                <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
                  {currentThreat.timeline.map((step, idx) => (
                    <div key={idx} className="relative group">
                      <div className="absolute -left-[23px] top-1 w-4 h-4 rounded-full bg-slate-950 border border-[#00D4FF] flex items-center justify-center shadow-[0_0_8px_#00D4FF]">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#00D4FF]" />
                      </div>

                      <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 hover:border-slate-700 transition-all">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-xs font-sans">{step.title}</span>
                            {step.statusTag && (
                              <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border ${
                                step.statusTag === 'BLOCKED' ? 'bg-rose-950 text-rose-300 border-rose-800' :
                                step.statusTag === 'ISOLATED' ? 'bg-amber-950 text-amber-300 border-amber-800' :
                                step.statusTag === 'NOTIFIED' ? 'bg-cyan-950 text-cyan-300 border-cyan-800' :
                                step.statusTag === 'RESOLVED' ? 'bg-emerald-950 text-emerald-300 border-emerald-800' :
                                'bg-slate-800 text-slate-300 border-slate-700'
                              }`}>
                                {step.statusTag}
                              </span>
                            )}
                          </div>
                          <span className="font-mono text-[10px] text-[#00D4FF] font-bold">{step.time}</span>
                        </div>
                        {step.desc && (
                          <p className="text-[11px] text-slate-400 font-sans leading-relaxed">{step.desc}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION 6: AI SECURITY ANALYSIS */}
              <div ref={aiSectionRef}>
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-purple-950/30 via-slate-950/90 to-slate-950 border border-purple-500/30 shadow-[0_0_25px_rgba(168,85,247,0.15)] space-y-3.5 relative overflow-hidden">
                  
                  {/* Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-purple-500/20">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-purple-900/60 border border-purple-400/40 text-purple-300">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-sm font-heading">
                          AI Security Assistant
                        </h4>
                        <span className="text-[10px] text-purple-300 font-mono">Gemini SecOps Intelligence</span>
                      </div>
                    </div>

                    <button
                      onClick={handleFetchAiAnalysis}
                      disabled={isAiLoading}
                      className="px-2.5 py-1 rounded-lg bg-purple-900/60 hover:bg-purple-800 border border-purple-500/40 text-purple-200 text-[10px] font-mono font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all"
                    >
                      {isAiLoading ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin text-purple-300" />
                          <span>Analyzing...</span>
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-3 h-3 text-purple-300" />
                          <span>Re-Analyze with Gemini</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* AI Error Alert */}
                  {aiError && !isAiLoading && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3.5 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-200 text-xs flex items-start gap-3 shadow-[0_0_15px_rgba(244,63,94,0.15)]"
                    >
                      <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                      <div className="flex-1 space-y-1.5">
                        <span className="font-bold text-white block">AI Security Analysis Error</span>
                        <p className="text-[11px] text-rose-300 leading-relaxed">{aiError}</p>
                        <button
                          onClick={handleFetchAiAnalysis}
                          className="mt-2 px-3 py-1.5 bg-rose-900 hover:bg-rose-800 border border-rose-700 text-white font-bold rounded-lg text-xs cursor-pointer flex items-center gap-1.5 transition-all"
                        >
                          <RefreshCw className="w-3.5 h-3.5 text-white" />
                          <span>Retry Analysis</span>
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* Animated loading state */}
                  {isAiLoading && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      className="py-6 px-4 rounded-xl bg-purple-950/40 border border-purple-500/30 text-center space-y-4"
                    >
                      <div className="relative w-14 h-14 mx-auto flex items-center justify-center">
                        <div className="absolute inset-0 rounded-full bg-purple-500/20 animate-ping" />
                        <div className="absolute inset-1 rounded-full bg-gradient-to-tr from-purple-600 to-cyan-400 animate-spin opacity-80" />
                        <div className="relative w-9 h-9 rounded-full bg-slate-950 border border-purple-400 flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.5)]">
                          <Sparkles className="w-4 h-4 text-purple-300 animate-pulse" />
                        </div>
                      </div>

                      <div>
                        <h5 className="text-sm font-extrabold text-white font-heading tracking-wide">
                          Analyzing security incident...
                        </h5>
                        <p className="text-[11px] font-mono text-purple-300/80 mt-0.5">
                          Gemini SecOps Model Evaluation
                        </p>
                      </div>

                      <div className="h-7 flex items-center justify-center overflow-hidden">
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={loadingStepIndex}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.25 }}
                            className="text-xs font-mono font-semibold text-purple-200 flex items-center gap-2 bg-purple-900/60 px-3.5 py-1 rounded-full border border-purple-500/40 shadow-sm"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-[#00D4FF] animate-pulse shrink-0" />
                            <span>• {ROTATING_MESSAGES[loadingStepIndex]}</span>
                          </motion.div>
                        </AnimatePresence>
                      </div>

                      {streamingText && (
                        <div className="mt-3 p-3 rounded-lg bg-slate-950/90 border border-purple-500/30 text-left font-mono text-[11px] text-purple-200/90 max-h-32 overflow-y-auto leading-relaxed custom-scrollbar">
                          <span className="text-[10px] text-purple-400 font-bold block mb-1">
                            TELEMETRY STREAM:
                          </span>
                          <p className="whitespace-pre-wrap">{streamingText}</p>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {!isAiLoading && !aiError && currentThreat.aiAnalysis && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35 }}
                      className="space-y-3.5"
                    >
                      <div>
                        <span className="text-[10px] font-mono font-bold text-purple-300 uppercase block mb-1">
                          EXPLANATION:
                        </span>
                        <p className="text-xs text-slate-200 font-sans leading-relaxed">
                          {currentThreat.aiAnalysis.explanation}
                        </p>
                      </div>

                      <div>
                        <span className="text-[10px] font-mono font-bold text-rose-300 uppercase block mb-1">
                          BUSINESS IMPACT:
                        </span>
                        <p className="text-xs text-slate-300 font-sans leading-relaxed">
                          {currentThreat.aiAnalysis.businessImpact}
                        </p>
                      </div>

                      <div>
                        <span className="text-[10px] font-mono font-bold text-emerald-300 uppercase block mb-1">
                          RECOMMENDED RESPONSE:
                        </span>
                        <p className="text-xs text-emerald-200/90 font-sans leading-relaxed">
                          {currentThreat.aiAnalysis.recommendedResponse}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-purple-500/20">
                        <span className="text-[10px] font-mono font-bold text-purple-300 uppercase block mb-1.5">
                          FUTURE PREVENTION:
                        </span>
                        <ul className="space-y-1.5 font-sans text-xs">
                          {currentThreat.aiAnalysis.futurePrevention.map((prev, pIdx) => (
                            <li key={pIdx} className="flex items-start gap-2 text-slate-300">
                              <span className="text-purple-400 font-bold">•</span>
                              <span>{prev}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </motion.div>
                  )}

                </div>
              </div>

            </div>

            {/* BOTTOM ACTIONS (Sticky Footer) */}
            <div className="p-4 sm:p-5 border-t border-slate-800/80 bg-[#070b14]/95 sticky bottom-0 z-20 backdrop-blur-md grid grid-cols-3 gap-2.5">
              
              {/* Primary: Mark as Resolved */}
              <button
                onClick={() => setShowResolveModal(true)}
                disabled={isResolved}
                className={`py-2.5 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md ${
                  isResolved
                    ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/80 cursor-default'
                    : 'bg-[#00D4FF] text-slate-950 hover:bg-cyan-300 shadow-[0_0_15px_rgba(0,212,255,0.3)]'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span className="truncate">{isResolved ? 'Resolved' : 'Mark Resolved'}</span>
              </button>

              {/* Secondary: Download Report */}
              <button
                onClick={handleDownloadPdf}
                disabled={isDownloadingPdf}
                className={`py-2.5 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  pdfDownloaded
                    ? 'bg-slate-800 text-emerald-400 border border-emerald-800'
                    : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                }`}
              >
                {isDownloadingPdf ? (
                  <Loader2 className="w-4 h-4 animate-spin text-[#00D4FF]" />
                ) : (
                  <Download className="w-4 h-4 shrink-0" />
                )}
                <span className="truncate">{isDownloadingPdf ? 'Generating...' : pdfDownloaded ? 'PDF Ready' : 'Download Report'}</span>
              </button>

              {/* Outline: Ask AI */}
              <button
                onClick={handleFetchAiAnalysis}
                disabled={isAiLoading}
                className="py-2.5 px-3 rounded-xl font-bold text-xs bg-purple-950/60 hover:bg-purple-900/80 border border-purple-500/50 text-purple-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-[0_0_15px_rgba(168,85,247,0.2)]"
              >
                {isAiLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-purple-300 shrink-0" />
                ) : (
                  <Sparkles className="w-4 h-4 text-purple-300 shrink-0" />
                )}
                <span className="truncate">{isAiLoading ? 'Analyzing...' : 'Ask AI'}</span>
              </button>

            </div>

            {/* MODAL 1: BLOCK SOURCE IP CONFIRMATION */}
            <AnimatePresence>
              {showBlockIpModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-[#0b1220] border border-rose-800/80 rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl text-sans"
                  >
                    <div className="flex items-center gap-3 text-rose-400">
                      <div className="p-2.5 bg-rose-950/80 border border-rose-800 rounded-xl">
                        <Ban className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-white text-base font-heading">
                          Confirm Block IP
                        </h3>
                        <p className="text-xs text-rose-300 font-mono">
                          Target IP: {currentThreat.sourceIp}
                        </p>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed font-sans">
                      Are you sure you want to block this IP address?
                    </p>

                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
                      <div className="flex justify-between text-slate-400 font-mono text-[11px]">
                        <span>Source IP:</span>
                        <span className="text-rose-400 font-bold">{currentThreat.sourceIp}</span>
                      </div>
                      <div className="flex justify-between text-slate-400 font-mono text-[11px]">
                        <span>Severity:</span>
                        <span className="text-rose-400 font-bold">{currentThreat.severity}</span>
                      </div>
                      <div className="pt-1 text-[11px] text-slate-400">
                        <span className="font-bold text-slate-300 block mb-1">Reason:</span>
                        <input
                          type="text"
                          value={blockReasonInput}
                          onChange={(e) => setBlockReasonInput(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded p-1.5 text-xs text-white focus:outline-none focus:border-rose-500 font-mono"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2.5 pt-2">
                      <button
                        onClick={() => setShowBlockIpModal(false)}
                        disabled={isBlocking}
                        className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer"
                      >
                        Cancel
                      </button>

                      <button
                        onClick={handleConfirmBlockIp}
                        disabled={isBlocking}
                        className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white cursor-pointer shadow-[0_0_15px_rgba(244,63,94,0.4)] flex items-center gap-1.5"
                      >
                        {isBlocking ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Blocking IP...</span>
                          </>
                        ) : (
                          <span>Block IP</span>
                        )}
                      </button>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

            {/* MODAL 2: QUARANTINE DEVICE CONFIRMATION */}
            <AnimatePresence>
              {showQuarantineModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-[#0b1220] border border-amber-800/80 rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl text-sans"
                  >
                    <div className="flex items-center gap-3 text-amber-400">
                      <div className="p-2.5 bg-amber-950/80 border border-amber-800 rounded-xl">
                        <Server className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-white text-base font-heading">
                          Confirm Device Isolation
                        </h3>
                        <p className="text-xs text-amber-300 font-mono">
                          Target: {currentThreat.deviceName || currentThreat.destination}
                        </p>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed font-sans">
                      Are you sure you want to quarantine device <span className="font-bold text-white">{currentThreat.deviceName || currentThreat.destination}</span>?
                    </p>

                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5 text-[11px] text-slate-400">
                      <div className="flex justify-between">
                        <span>Device Name:</span>
                        <span className="font-bold text-white">{currentThreat.deviceName || currentThreat.destination}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Current Status:</span>
                        <span className="text-emerald-400 font-bold">{isQuarantined ? 'Quarantined' : 'Connected'}</span>
                      </div>
                      <p className="text-[10px] text-amber-300/80 pt-1">
                        • This device will be detached from network VLAN and isolated until manual release.
                      </p>
                    </div>

                    <div className="flex items-center justify-end gap-2.5 pt-2">
                      <button
                        onClick={() => setShowQuarantineModal(false)}
                        disabled={isQuarantining}
                        className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer"
                      >
                        Cancel
                      </button>

                      <button
                        onClick={handleConfirmQuarantine}
                        disabled={isQuarantining}
                        className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-slate-950 cursor-pointer shadow-[0_0_15px_rgba(245,158,11,0.4)] flex items-center gap-1.5"
                      >
                        {isQuarantining ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Isolating...</span>
                          </>
                        ) : (
                          <span>Quarantine Device</span>
                        )}
                      </button>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

            {/* MODAL 4: MARK AS RESOLVED CONFIRMATION */}
            <AnimatePresence>
              {showResolveModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-[#0b1220] border border-slate-800 rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl text-sans"
                  >
                    <div className="flex items-center gap-3 text-amber-400">
                      <div className="p-2.5 bg-amber-950/80 border border-amber-800 rounded-xl">
                        <AlertTriangle className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-white text-base font-heading">
                          Confirm Resolution
                        </h3>
                        <p className="text-xs text-slate-400 font-mono">
                          Threat ID: {currentThreat.id}
                        </p>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed font-sans">
                      Are you sure you want to mark <span className="font-bold text-white">{currentThreat.title}</span> as <span className="text-emerald-400 font-bold">Resolved</span>?
                    </p>

                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-400 font-sans space-y-1">
                      <p>• Threat status will update from <span className="text-amber-400 font-mono">{currentThreat.status}</span> to <span className="text-emerald-400 font-mono">Resolved</span>.</p>
                      <p>• Threat will automatically move into <span className="text-[#00D4FF]">Incident History Log</span>.</p>
                      <p>• Active threat list & SOC dashboard statistics will refresh automatically.</p>
                    </div>

                    <div className="flex items-center justify-end gap-2.5 pt-2">
                      <button
                        onClick={() => setShowResolveModal(false)}
                        disabled={isResolving}
                        className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer"
                      >
                        Cancel
                      </button>

                      <button
                        onClick={handleConfirmResolve}
                        disabled={isResolving}
                        className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.4)] flex items-center gap-1.5"
                      >
                        {isResolving ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Updating...</span>
                          </>
                        ) : (
                          <span>Yes, Mark Resolved</span>
                        )}
                      </button>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};
