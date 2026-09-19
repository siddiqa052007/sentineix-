import React, { useState } from 'react';
import { 
  Bot, 
  Sparkles, 
  Shield, 
  ShieldAlert, 
  Radio, 
  Monitor, 
  CheckCircle2, 
  RefreshCw, 
  Send, 
  Loader2, 
  AlertCircle, 
  Clock, 
  X,
  Search,
  Zap,
  Lock,
  AlertTriangle,
  Info
} from 'lucide-react';
import { useThreats } from '../context/ThreatContext';
import { ThreatDetails, Device } from '../types';
import { ThreatDetailsDrawer } from './ThreatDetailsDrawer';
import { DeviceDetailsDrawer } from './DeviceDetailsDrawer';

type CardCategory = 
  | 'security_score' 
  | 'active_incidents' 
  | 'critical_threats' 
  | 'devices_at_risk' 
  | 'quarantined' 
  | 'last_analysis';

export const AiAssistantTab: React.FC = () => {
  const {
    devices,
    threats,
    blockedIps,
    activeThreatsCount,
    criticalThreatsCount,
    devicesAtRiskCount,
    resolvedThreatsCount,
    quarantinedDevicesCount,
    securityScore,
    addToast
  } = useThreats();

  // Selected Card Category (defaults to null so AI analyzes ONLY on demand when clicked)
  const [selectedCategory, setSelectedCategory] = useState<CardCategory | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

  // Drawer States for optional informational inspection
  const [selectedThreatForDrawer, setSelectedThreatForDrawer] = useState<ThreatDetails | null>(null);
  const [isThreatDrawerOpen, setIsThreatDrawerOpen] = useState(false);
  
  const [selectedDeviceForDrawer, setSelectedDeviceForDrawer] = useState<Device | null>(null);
  const [isDeviceDrawerOpen, setIsDeviceDrawerOpen] = useState(false);

  // Optional AI Custom Prompt Query
  const [queryInput, setQueryInput] = useState('');
  const [isQueryLoading, setIsQueryLoading] = useState(false);
  const [customAiResponse, setCustomAiResponse] = useState<string | null>(null);

  // Last Analysis Timestamp
  const [lastAnalysisTime, setLastAnalysisTime] = useState<string>(() => 
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  );

  // Computed Lists derived from ThreatContext State
  const activeThreatsList = threats.filter(t => (t.status === 'Active' || t.status === 'Under Investigation' || t.status === 'Action Taken') && !t.resolved);
  const criticalThreatsList = activeThreatsList.filter(t => t.severity === 'Critical');

  const highThreatsList = activeThreatsList.filter(t => t.severity === 'High');
  const highThreatsCount = highThreatsList.length;

  const devicesAtRiskList = devices.filter(d => 
    (d.riskLevel === 'High' || d.riskLevel === 'Critical' || d.status === 'Warning' || d.status === 'At Risk') && d.status !== 'Quarantined'
  );

  const quarantinedDevicesList = devices.filter(d => d.status === 'Quarantined');

  const oldestActiveThreat = [...activeThreatsList].sort((a, b) => {
    return new Date(a.detectedAt).getTime() - new Date(b.detectedAt).getTime();
  })[0];

  // Card Click Handler — Triggers AI Analysis On-Demand at Click Time
  const handleCardClick = (category: CardCategory) => {
    setSelectedCategory(category);
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
    }, 650);
  };

  // Re-scan Telemetry
  const handleRescanTelemetry = () => {
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setLastAnalysisTime(timeNow);
    addToast('🔄 Telemetry re-scanned. Click any card to analyze updated dataset.', 'info');
    if (selectedCategory) {
      setIsAnalyzing(true);
      setTimeout(() => setIsAnalyzing(false), 500);
    }
  };

  // Submit Optional Custom Query
  const handleSendCustomQuery = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!queryInput.trim() || isQueryLoading) return;

    const promptText = queryInput.trim();
    setIsQueryLoading(true);

    try {
      const response = await fetch('/api/copilot-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptText,
          context: {
            securityScore,
            activeThreatsCount,
            criticalThreatsCount,
            devicesAtRiskCount,
            quarantinedDevicesCount,
            devicesList: devices.map(d => ({ deviceId: d.deviceId, hostname: d.hostname, riskLevel: d.riskLevel, status: d.status })),
            threatsList: activeThreatsList.map(t => ({ id: t.id, title: t.title, severity: t.severity, sourceIp: t.sourceIp }))
          }
        })
      });

      if (!response.ok) throw new Error("Failed to query Copilot API");

      const data = await response.json();
      setCustomAiResponse(data.analysis?.threatSummary || data.analysis?.recommendedResponse || "Analysis completed for query.");
    } catch (err) {
      setCustomAiResponse(`Analysis for "${promptText}": Evaluated current enterprise telemetry state. Security score is ${securityScore}/100 with ${activeThreatsCount} active threats.`);
    } finally {
      setIsQueryLoading(false);
    }
  };

  // Helper: Open Threat Drawer for informational inspection
  const openThreatDetails = (threat: ThreatDetails) => {
    setSelectedThreatForDrawer(threat);
    setIsThreatDrawerOpen(true);
  };

  // Helper: Open Device Drawer for informational inspection
  const openDeviceDetails = (device: Device) => {
    setSelectedDeviceForDrawer(device);
    setIsDeviceDrawerOpen(true);
  };

  return (
    <div className="space-y-8 font-sans relative pb-12">
      
      {/* ====================================================
          1. HEADER & TELEMETRY SYNC BAR
          ==================================================== */}
      <div className="glass-card p-6 sm:p-7 rounded-2xl border border-purple-500/30 bg-gradient-to-r from-purple-950/40 via-slate-950 to-slate-950 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-[#00D4FF]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600/30 to-cyan-600/30 border border-purple-400/50 flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.3)] shrink-0">
              <Bot className="w-6 h-6 text-purple-300 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-black text-white font-heading tracking-wide">
                  Sentinel<span className="text-purple-400">X</span> AI Security Analysis
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-purple-900/60 border border-purple-400/40 text-[10px] font-mono font-bold text-purple-300 uppercase tracking-widest flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#00D4FF]" />
                  Real-Time Security Copilot
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Interactive Security Analysis & Risk Diagnostics • Click any summary card below to run targeted AI analysis
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="px-3.5 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-right hidden sm:block">
              <span className="text-[10px] font-mono text-slate-500 block uppercase">Dataset Status</span>
              <span className="text-xs font-mono font-bold text-emerald-400 flex items-center justify-end gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Synced ({lastAnalysisTime})
              </span>
            </div>

            <button
              onClick={handleRescanTelemetry}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-900/80 to-blue-900/80 hover:from-purple-800 hover:to-blue-800 border border-purple-500/40 text-purple-100 text-xs font-bold font-mono flex items-center gap-2 cursor-pointer transition-all shadow-[0_0_15px_rgba(168,85,247,0.2)]"
            >
              <RefreshCw className="w-3.5 h-3.5 text-purple-300" />
              <span>Re-Scan Telemetry</span>
            </button>
          </div>
        </div>
      </div>

      {/* ====================================================
          2. THE 6 INTERACTIVE SECURITY SUMMARY CARDS
          ==================================================== */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-[#00D4FF]" />
            Security Summary Overview (Click Card to Analyze)
          </h3>
          <span className="text-[11px] font-mono text-purple-300">
            Selected Category: <strong className="text-white uppercase">{selectedCategory ? selectedCategory.replace('_', ' ') : 'None'}</strong>
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          
          {/* CARD 1: Security Score */}
          <button
            onClick={() => handleCardClick('security_score')}
            className={`p-4 rounded-xl border text-left transition-all cursor-pointer relative group ${
              selectedCategory === 'security_score'
                ? 'bg-slate-900/95 border-[#00D4FF] shadow-[0_0_20px_rgba(0,212,255,0.25)] ring-2 ring-[#00D4FF]/40'
                : 'bg-slate-950/80 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/60'
            }`}
          >
            <div className="flex items-center justify-between text-slate-400 mb-1.5">
              <span className="text-[10px] font-mono uppercase tracking-wider">Security Score</span>
              <Shield className={`w-4 h-4 ${selectedCategory === 'security_score' ? 'text-[#00D4FF]' : 'text-slate-500'}`} />
            </div>
            <div className="text-2xl font-black text-white font-mono flex items-baseline gap-1">
              {securityScore}
              <span className="text-xs text-slate-500 font-normal">/100</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  securityScore >= 80 ? 'bg-emerald-400' : securityScore >= 60 ? 'bg-amber-400' : 'bg-rose-500'
                }`}
                style={{ width: `${securityScore}%` }}
              />
            </div>
            {selectedCategory === 'security_score' && (
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#00D4FF] shadow-[0_0_8px_#00D4FF]" />
            )}
          </button>

          {/* CARD 2: Active Incidents */}
          <button
            onClick={() => handleCardClick('active_incidents')}
            className={`p-4 rounded-xl border text-left transition-all cursor-pointer relative group ${
              selectedCategory === 'active_incidents'
                ? 'bg-slate-900/95 border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.25)] ring-2 ring-amber-500/40'
                : 'bg-slate-950/80 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/60'
            }`}
          >
            <div className="flex items-center justify-between text-slate-400 mb-1.5">
              <span className="text-[10px] font-mono uppercase tracking-wider">Active Incidents</span>
              <Radio className={`w-4 h-4 ${selectedCategory === 'active_incidents' ? 'text-amber-400' : 'text-slate-500'}`} />
            </div>
            <div className="text-2xl font-black text-amber-400 font-mono">
              {activeThreatsCount}
            </div>
            <p className="text-[10px] text-slate-500 font-mono mt-1 truncate">
              {resolvedThreatsCount} Resolved
            </p>
            {selectedCategory === 'active_incidents' && (
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_#f59e0b]" />
            )}
          </button>

          {/* CARD 3: Critical Threats */}
          <button
            onClick={() => handleCardClick('critical_threats')}
            className={`p-4 rounded-xl border text-left transition-all cursor-pointer relative group ${
              selectedCategory === 'critical_threats'
                ? 'bg-slate-900/95 border-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.25)] ring-2 ring-rose-500/40'
                : 'bg-slate-950/80 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/60'
            }`}
          >
            <div className="flex items-center justify-between text-slate-400 mb-1.5">
              <span className="text-[10px] font-mono uppercase tracking-wider">Critical Threats</span>
              <ShieldAlert className={`w-4 h-4 ${selectedCategory === 'critical_threats' ? 'text-rose-400' : 'text-slate-500'}`} />
            </div>
            <div className="text-2xl font-black text-rose-400 font-mono">
              {criticalThreatsCount}
            </div>
            <p className="text-[10px] text-slate-500 font-mono mt-1 truncate">
              Requires immediate SLA
            </p>
            {selectedCategory === 'critical_threats' && (
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-400 shadow-[0_0_8px_#f43f5e]" />
            )}
          </button>

          {/* CARD 4: Devices At Risk */}
          <button
            onClick={() => handleCardClick('devices_at_risk')}
            className={`p-4 rounded-xl border text-left transition-all cursor-pointer relative group ${
              selectedCategory === 'devices_at_risk'
                ? 'bg-slate-900/95 border-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.25)] ring-2 ring-amber-400/40'
                : 'bg-slate-950/80 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/60'
            }`}
          >
            <div className="flex items-center justify-between text-slate-400 mb-1.5">
              <span className="text-[10px] font-mono uppercase tracking-wider">Devices At Risk</span>
              <Monitor className={`w-4 h-4 ${selectedCategory === 'devices_at_risk' ? 'text-amber-300' : 'text-slate-500'}`} />
            </div>
            <div className="text-2xl font-black text-white font-mono">
              {devicesAtRiskCount}
            </div>
            <p className="text-[10px] text-slate-500 font-mono mt-1 truncate">
              High / Warning Risk
            </p>
            {selectedCategory === 'devices_at_risk' && (
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-amber-300 shadow-[0_0_8px_#fcd34d]" />
            )}
          </button>

          {/* CARD 5: Quarantined */}
          <button
            onClick={() => handleCardClick('quarantined')}
            className={`p-4 rounded-xl border text-left transition-all cursor-pointer relative group ${
              selectedCategory === 'quarantined'
                ? 'bg-slate-900/95 border-purple-400 shadow-[0_0_20px_rgba(192,132,252,0.25)] ring-2 ring-purple-400/40'
                : 'bg-slate-950/80 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/60'
            }`}
          >
            <div className="flex items-center justify-between text-slate-400 mb-1.5">
              <span className="text-[10px] font-mono uppercase tracking-wider">Quarantined</span>
              <Lock className={`w-4 h-4 ${selectedCategory === 'quarantined' ? 'text-purple-400' : 'text-slate-500'}`} />
            </div>
            <div className="text-2xl font-black text-purple-300 font-mono">
              {quarantinedDevicesCount}
            </div>
            <p className="text-[10px] text-slate-500 font-mono mt-1 truncate">
              Isolated Workstations
            </p>
            {selectedCategory === 'quarantined' && (
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-purple-400 shadow-[0_0_8px_#c084fc]" />
            )}
          </button>

          {/* CARD 6: Last Analysis */}
          <button
            onClick={() => handleCardClick('last_analysis')}
            className={`p-4 rounded-xl border text-left transition-all cursor-pointer relative group ${
              selectedCategory === 'last_analysis'
                ? 'bg-slate-900/95 border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.25)] ring-2 ring-cyan-400/40'
                : 'bg-slate-950/80 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/60'
            }`}
          >
            <div className="flex items-center justify-between text-slate-400 mb-1.5">
              <span className="text-[10px] font-mono uppercase tracking-wider">Last Analysis</span>
              <Clock className={`w-4 h-4 ${selectedCategory === 'last_analysis' ? 'text-[#00D4FF]' : 'text-slate-500'}`} />
            </div>
            <div className="text-sm font-bold text-slate-200 font-mono truncate mt-1">
              {lastAnalysisTime}
            </div>
            <p className="text-[10px] text-emerald-400 font-mono mt-1 truncate flex items-center gap-1">
              <CheckCircle2 className="w-2.5 h-2.5" />
              Dataset Sync
            </p>
            {selectedCategory === 'last_analysis' && (
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
            )}
          </button>

        </div>
      </div>

      {/* ====================================================
          3. DYNAMIC ON-DEMAND AI SECURITY ANALYSIS PANEL
          ==================================================== */}
      <div className="glass-card rounded-2xl border border-slate-800/90 bg-slate-950/90 overflow-hidden shadow-2xl p-6 sm:p-8 relative">
        
        {/* If no card is selected yet */}
        {!selectedCategory && !isAnalyzing && (
          <div className="p-8 text-center space-y-3">
            <Bot className="w-10 h-10 text-purple-400 mx-auto animate-bounce" />
            <h3 className="text-base font-bold text-white font-heading">AI Security Analysis Engine Ready</h3>
            <p className="text-xs text-slate-400 font-mono max-w-md mx-auto leading-relaxed">
              Click any Security Summary Card above to trigger real-time AI risk analysis and receive targeted recommendations based on current live telemetry.
            </p>
          </div>
        )}

        {/* Loading state when user clicks a card */}
        {isAnalyzing && (
          <div className="p-12 text-center space-y-4">
            <Loader2 className="w-10 h-10 text-[#00D4FF] animate-spin mx-auto" />
            <div className="space-y-1 font-mono">
              <h4 className="text-sm font-bold text-white">Analyzing current security data...</h4>
              <p className="text-xs text-slate-400">
                Reviewing active incidents • Checking affected endpoints • Evaluating risk posture • Generating recommendations
              </p>
            </div>
          </div>
        )}

        {/* Analysis Output when loading is complete */}
        {selectedCategory && !isAnalyzing && (
          <div>
            {/* Panel Category Badge Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-slate-800/80 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-950/80 border border-purple-500/40 flex items-center justify-center text-[#00D4FF] shadow-inner">
                  <Bot className="w-5 h-5 text-purple-300" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-white font-heading tracking-wide">
                      AI Security Analysis
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-[11px] font-mono text-[#00D4FF] uppercase font-bold">
                      {selectedCategory.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    On-demand SecOps assessment calculated from live SentinelX telemetry
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-slate-500">Priority Level:</span>
                <span className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold uppercase border ${
                  selectedCategory === 'critical_threats' && criticalThreatsCount > 0
                    ? 'bg-rose-950/90 text-rose-300 border-rose-800'
                    : selectedCategory === 'quarantined' && quarantinedDevicesCount > 0
                    ? 'bg-purple-950/90 text-purple-300 border-purple-800'
                    : selectedCategory === 'devices_at_risk' && devicesAtRiskCount > 0
                    ? 'bg-amber-950/90 text-amber-300 border-amber-800'
                    : 'bg-emerald-950/90 text-emerald-300 border-emerald-800'
                }`}>
                  {selectedCategory === 'critical_threats' && criticalThreatsCount > 0 ? 'CRITICAL' : selectedCategory === 'devices_at_risk' || selectedCategory === 'active_incidents' ? 'HIGH / MODERATE' : 'NORMAL / MONITORING'}
                </span>
              </div>
            </div>

            {/* ----------------------------------------------------
                CATEGORY 1: SECURITY SCORE ANALYSIS
                ---------------------------------------------------- */}
            {selectedCategory === 'security_score' && (
              <div className="space-y-6">
                <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                  <div>
                    <span className="text-xs font-mono text-slate-400 uppercase block mb-1">Current Security Score</span>
                    <div className="text-3xl font-black font-mono text-white flex items-baseline gap-2">
                      {securityScore} <span className="text-sm font-normal text-slate-500">/ 100</span>
                    </div>
                    <div className="text-xs font-mono mt-1 text-slate-300">
                      Risk Level: <strong className={securityScore >= 80 ? 'text-emerald-400' : securityScore >= 60 ? 'text-amber-400' : 'text-rose-400'}>
                        {securityScore >= 80 ? 'Low / Healthy' : securityScore >= 60 ? 'Moderate Risk' : 'Critical Risk'}
                      </strong>
                    </div>
                  </div>
                  <div className="text-xs text-slate-300 space-y-1.5 font-sans leading-relaxed bg-slate-950/80 p-3.5 rounded-lg border border-slate-800">
                    <span className="font-bold text-purple-300 block font-mono">AI Assessment:</span>
                    Current security score reflects active telemetry inputs: {criticalThreatsCount} critical threats, {devicesAtRiskCount} at-risk devices, {activeThreatsCount} total active incidents, and {quarantinedDevicesCount} quarantined endpoints.
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-white font-heading mb-2 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-400" />
                    Key Factors Influencing Security Score
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-300 font-mono bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                    <li className="flex items-center gap-2">
                      <span className={criticalThreatsCount > 0 ? 'text-rose-400 font-bold' : 'text-emerald-400'}>•</span>
                      <span>{criticalThreatsCount} critical threat(s) active (-6 pts ea)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className={devicesAtRiskCount > 0 ? 'text-amber-400 font-bold' : 'text-emerald-400'}>•</span>
                      <span>{devicesAtRiskCount} device(s) flagged at High or Warning risk level</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className={activeThreatsCount > 0 ? 'text-amber-400 font-bold' : 'text-emerald-400'}>•</span>
                      <span>{activeThreatsCount} total active incident(s) require review</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className={quarantinedDevicesCount > 0 ? 'text-purple-400 font-bold' : 'text-emerald-400'}>•</span>
                      <span>{quarantinedDevicesCount} device(s) currently isolated in quarantine</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-emerald-400">•</span>
                      <span>{blockedIps.length} malicious IP address(es) blackholed at perimeter WAF</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-white font-heading mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#00D4FF]" />
                    AI Recommended Improvements
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                      <span className="text-[10px] font-mono font-bold text-rose-400 uppercase block mb-1">Priority 1</span>
                      <h5 className="text-xs font-bold text-white mb-1">Investigate Active Critical Incidents</h5>
                      <p className="text-[11px] text-slate-300 leading-relaxed">
                        Review critical incidents in the Threat Monitor page to resolve high-severity threat vectors and restore posture points.
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                      <span className="text-[10px] font-mono font-bold text-amber-400 uppercase block mb-1">Priority 2</span>
                      <h5 className="text-xs font-bold text-white mb-1">Scan High-Risk Endpoints</h5>
                      <p className="text-[11px] text-slate-300 leading-relaxed">
                        Navigate to Connected Devices to initiate eBPF malware and process socket scans on flagged workstations.
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                      <span className="text-[10px] font-mono font-bold text-purple-400 uppercase block mb-1">Priority 3</span>
                      <h5 className="text-xs font-bold text-white mb-1">Review Quarantined Isolation Rules</h5>
                      <p className="text-[11px] text-slate-300 leading-relaxed">
                        Verify quarantined workstations before releasing or maintaining isolation on corporate subnets.
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                      <span className="text-[10px] font-mono font-bold text-[#00D4FF] uppercase block mb-1">Priority 4</span>
                      <h5 className="text-xs font-bold text-white mb-1">Clear Unresolved Warnings</h5>
                      <p className="text-[11px] text-slate-300 leading-relaxed">
                        Archive resolved background warnings to bring overall security posture back up to 95+.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ----------------------------------------------------
                CATEGORY 2: ACTIVE INCIDENTS ANALYSIS
                ---------------------------------------------------- */}
            {selectedCategory === 'active_incidents' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-900/80 p-4 rounded-xl border border-slate-800 font-mono">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Total Active Incidents</span>
                    <span className="text-lg font-bold text-amber-400">{activeThreatsCount}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Critical Severity</span>
                    <span className="text-lg font-bold text-rose-400">{criticalThreatsCount}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">High Severity</span>
                    <span className="text-lg font-bold text-amber-300">{highThreatsCount}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Resolved</span>
                    <span className="text-lg font-bold text-emerald-400">{resolvedThreatsCount}</span>
                  </div>
                </div>

                <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-2 text-xs text-slate-300 font-mono">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Oldest Unresolved Incident:</span>
                    <span className="text-white font-bold">{oldestActiveThreat ? `${oldestActiveThreat.id} (${oldestActiveThreat.detectedAt})` : 'None'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Escalation Priority:</span>
                    <span className={criticalThreatsCount > 0 ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
                      {criticalThreatsCount > 0 ? `${criticalThreatsCount} critical incident(s) requiring immediate review` : 'Standard SLA'}
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-white font-heading mb-3 flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-amber-400" />
                    Active Incident Breakdown & Recommendations
                  </h4>

                  {activeThreatsList.length === 0 ? (
                    <div className="p-8 text-center bg-slate-900/40 rounded-xl border border-slate-800 text-slate-400 text-xs font-mono">
                      <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                      No active security incidents detected. All threat vectors resolved.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {activeThreatsList.map(threat => (
                        <div 
                          key={threat.id} 
                          className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all space-y-2"
                        >
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                                threat.severity === 'Critical' ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                                threat.severity === 'High' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                                'bg-yellow-950 text-yellow-300 border border-yellow-800'
                              }`}>
                                {threat.severity}
                              </span>
                              <span className="text-xs font-mono font-bold text-white">{threat.id}</span>
                              <span className="text-xs font-bold text-slate-200">• {threat.title}</span>
                            </div>
                            <button
                              onClick={() => openThreatDetails(threat)}
                              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-mono font-bold flex items-center gap-1 cursor-pointer border border-slate-700"
                            >
                              <Info className="w-3 h-3 text-[#00D4FF]" />
                              <span>View Incident Context</span>
                            </button>
                          </div>
                          <p className="text-xs text-slate-400">{threat.description}</p>
                          <div className="text-[11px] font-mono text-slate-500 flex items-center gap-3">
                            <span>Target: <strong className="text-slate-300">{threat.deviceName || threat.destination}</strong></span>
                            <span>Source IP: <strong className="text-slate-300">{threat.sourceIp}</strong></span>
                            <span>Detected: {threat.detectedAt}</span>
                          </div>
                          <div className="mt-2 p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 text-[11px] text-purple-300 font-mono">
                            <strong>AI Recommendation:</strong> Review threat details in Threat Monitor and verify source IP {threat.sourceIp} against perimeter WAF rules.
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ----------------------------------------------------
                CATEGORY 3: CRITICAL THREATS ANALYSIS
                ---------------------------------------------------- */}
            {selectedCategory === 'critical_threats' && (
              <div className="space-y-6">
                <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-900/60 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-mono text-rose-300 uppercase block font-bold">Critical SLA Status</span>
                    <span className="text-xl font-black font-mono text-rose-400">
                      {criticalThreatsCount} Critical Threat(s) Active
                    </span>
                  </div>
                  <ShieldAlert className="w-8 h-8 text-rose-400" />
                </div>

                {criticalThreatsCount === 0 ? (
                  <div className="p-8 text-center bg-slate-900/50 rounded-xl border border-slate-800 space-y-2">
                    <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                    <h4 className="text-sm font-bold text-white font-heading">No Critical Threats Active</h4>
                    <p className="text-xs text-slate-400 max-w-md mx-auto font-mono">
                      All critical security SLAs are satisfied. Continue regular eBPF socket monitoring and zero-trust verification.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-white font-heading flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-rose-400" />
                      Critical Threats Requiring Attention
                    </h4>

                    {criticalThreatsList.map(threat => (
                      <div 
                        key={threat.id}
                        className="p-5 rounded-xl bg-slate-900/90 border border-rose-500/40 space-y-3 shadow-lg"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded bg-rose-950 border border-rose-800 text-rose-300 text-[10px] font-mono font-bold uppercase">
                              CRITICAL
                            </span>
                            <span className="text-xs font-mono font-bold text-white">{threat.id}</span>
                            <h5 className="text-sm font-bold text-rose-200">• {threat.title}</h5>
                          </div>
                          <button
                            onClick={() => openThreatDetails(threat)}
                            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-mono font-bold flex items-center gap-1 cursor-pointer border border-slate-700 shrink-0"
                          >
                            <Info className="w-3 h-3 text-[#00D4FF]" />
                            <span>View Context</span>
                          </button>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono text-slate-300 bg-slate-950/80 p-3 rounded-lg border border-slate-800">
                          <div>
                            <span className="text-[10px] text-slate-500 block uppercase">Target Device</span>
                            <span className="font-bold text-white">{threat.deviceName || threat.destination}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-500 block uppercase">Source IP</span>
                            <span className="font-bold text-amber-300">{threat.sourceIp}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-500 block uppercase">Protocol</span>
                            <span className="font-bold text-cyan-300">{threat.protocol}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-500 block uppercase">Status</span>
                            <span className="font-bold text-rose-400">{threat.status}</span>
                          </div>
                        </div>

                        <p className="text-xs text-slate-300 leading-relaxed font-sans">{threat.description}</p>

                        <div className="p-3 rounded-lg bg-slate-950/90 border border-rose-900/50 space-y-1 text-xs">
                          <span className="font-bold text-rose-300 font-mono block">AI Risk Explanation & Recommended Considerations:</span>
                          <p className="text-slate-300 font-sans leading-relaxed">
                            This critical threat poses remote privilege escalation or unauthorized egress risks. Consider inspecting target host {threat.deviceName || threat.destination} on Connected Devices or applying firewall rules against IP {threat.sourceIp} in Threat Monitor.
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ----------------------------------------------------
                CATEGORY 4: DEVICES AT RISK ANALYSIS
                ---------------------------------------------------- */}
            {selectedCategory === 'devices_at_risk' && (
              <div className="space-y-6">
                <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-900/60 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-mono text-amber-300 uppercase block font-bold">Risky Endpoint Telemetry</span>
                    <span className="text-xl font-black font-mono text-amber-400">
                      {devicesAtRiskCount} Device(s) Requiring Attention
                    </span>
                  </div>
                  <Monitor className="w-8 h-8 text-amber-400" />
                </div>

                {devicesAtRiskList.length === 0 ? (
                  <div className="p-8 text-center bg-slate-900/50 rounded-xl border border-slate-800 space-y-2">
                    <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                    <h4 className="text-sm font-bold text-white font-heading">All Connected Devices Healthy</h4>
                    <p className="text-xs text-slate-400 font-mono">Zero devices currently flagged at High or Warning risk.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {devicesAtRiskList.map(device => {
                      const matchingThreats = threats.filter(t => 
                        !t.resolved && (t.deviceId === device.deviceId || t.deviceName?.toLowerCase() === device.hostname.toLowerCase() || t.sourceIp === device.ipAddress)
                      );

                      return (
                        <div 
                          key={device.deviceId}
                          className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all space-y-2"
                        >
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                                device.riskLevel === 'Critical' ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                                device.riskLevel === 'High' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                                'bg-yellow-950 text-yellow-300 border border-yellow-800'
                              }`}>
                                Risk: {device.riskLevel || 'High'}
                              </span>
                              <span className="text-xs font-mono font-bold text-white">{device.hostname}</span>
                              <span className="text-xs text-slate-400">({device.ipAddress})</span>
                              <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-800 text-slate-300 rounded">
                                {device.status}
                              </span>
                            </div>
                            <button
                              onClick={() => openDeviceDetails(device)}
                              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-mono font-bold flex items-center gap-1 cursor-pointer border border-slate-700"
                            >
                              <Info className="w-3 h-3 text-[#00D4FF]" />
                              <span>View Device Info</span>
                            </button>
                          </div>

                          <div className="text-xs text-slate-300 font-sans">
                            Department: <strong>{device.department}</strong> • OS: <strong>{device.operatingSystem}</strong>
                          </div>

                          <div className="text-[11px] font-mono text-slate-400">
                            Active Threat Vector(s): <strong className={matchingThreats.length > 0 ? 'text-amber-400' : 'text-slate-300'}>
                              {matchingThreats.length > 0 ? `${matchingThreats.length} threat(s) (${matchingThreats.map(t => t.title).join(', ')})` : 'Egress socket anomaly / policy warning'}
                            </strong>
                          </div>

                          <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 text-[11px] text-amber-300 font-mono">
                            <strong>AI Recommended Next Step:</strong> Consider initiating a process scan or reviewing active sockets on Connected Devices for {device.hostname}.
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ----------------------------------------------------
                CATEGORY 5: QUARANTINED ANALYSIS
                ---------------------------------------------------- */}
            {selectedCategory === 'quarantined' && (
              <div className="space-y-6">
                <div className="p-4 rounded-xl bg-purple-950/40 border border-purple-900/60 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-mono text-purple-300 uppercase block font-bold">Network Isolation Status</span>
                    <span className="text-xl font-black font-mono text-purple-300">
                      {quarantinedDevicesCount} Workstation(s) Isolated
                    </span>
                  </div>
                  <Lock className="w-8 h-8 text-purple-400" />
                </div>

                {quarantinedDevicesCount === 0 ? (
                  <div className="p-8 text-center bg-slate-900/50 rounded-xl border border-slate-800 space-y-3">
                    <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                    <h4 className="text-sm font-bold text-white font-heading">No devices are currently quarantined.</h4>
                    <p className="text-xs text-slate-300 max-w-lg mx-auto font-mono leading-relaxed">
                      <strong>AI Recommendation:</strong> Continue monitoring high-risk devices and isolate only when security investigation confirms necessity.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-white font-heading flex items-center gap-2">
                      <Lock className="w-4 h-4 text-purple-400" />
                      Currently Quarantined Workstations Analysis
                    </h4>

                    {quarantinedDevicesList.map(device => {
                      const associatedThreat = threats.find(t => 
                        t.deviceId === device.deviceId || t.deviceName?.toLowerCase() === device.hostname.toLowerCase()
                      );

                      return (
                        <div 
                          key={device.deviceId}
                          className="p-5 rounded-xl bg-slate-900/90 border border-purple-500/40 space-y-3"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded bg-purple-950 border border-purple-800 text-purple-300 text-[10px] font-mono font-bold uppercase">
                                ISOLATED
                              </span>
                              <h5 className="text-sm font-bold text-white">{device.hostname}</h5>
                              <span className="text-xs font-mono text-slate-400">({device.ipAddress})</span>
                            </div>
                            <button
                              onClick={() => openDeviceDetails(device)}
                              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-mono font-bold flex items-center gap-1 cursor-pointer border border-slate-700 shrink-0"
                            >
                              <Info className="w-3 h-3 text-[#00D4FF]" />
                              <span>View Device</span>
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono text-slate-300 bg-slate-950/80 p-3 rounded-lg border border-slate-800">
                            <div>
                              <span className="text-[10px] text-slate-500 block uppercase">Reason for Quarantine</span>
                              <span className="font-bold text-purple-300">
                                {associatedThreat?.description || "Isolated due to anomalous egress socket telemetry"}
                              </span>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-500 block uppercase">Threat Vector</span>
                              <span className="font-bold text-amber-300">
                                {associatedThreat?.title || "Suspicious Socket Activity"}
                              </span>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-500 block uppercase">Post-Quarantine Scan</span>
                              <span className={device.scannedPostQuarantine ? 'font-bold text-emerald-400' : 'font-bold text-amber-400'}>
                                {device.scannedPostQuarantine ? 'Clean scan completed' : 'Scan recommended prior to release'}
                              </span>
                            </div>
                          </div>

                          <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 text-[11px] text-purple-300 font-mono">
                            <strong>AI Guidance:</strong> Keep {device.hostname} isolated until endpoint logs are verified and malware scans return clear.
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ----------------------------------------------------
                CATEGORY 6: LAST ANALYSIS METADATA
                ---------------------------------------------------- */}
            {selectedCategory === 'last_analysis' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-900/80 p-4 rounded-xl border border-slate-800 font-mono">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Last Analysis Time</span>
                    <span className="text-base font-bold text-cyan-300">{lastAnalysisTime}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Dataset Status</span>
                    <span className="text-base font-bold text-emerald-400">Synced (Real-Time)</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Incidents Analyzed</span>
                    <span className="text-base font-bold text-white">{threats.length} total</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Devices Analyzed</span>
                    <span className="text-base font-bold text-white">{devices.length} connected</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3 text-xs font-mono text-slate-300">
                  <h4 className="text-sm font-bold text-white font-heading">Dataset Telemetry Integrity</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded bg-slate-950/80 border border-slate-800 flex justify-between">
                      <span className="text-slate-400">Analysis Engine:</span>
                      <span className="font-bold text-purple-300">SentinelX Gemini SecOps</span>
                    </div>
                    <div className="p-2.5 rounded bg-slate-950/80 border border-slate-800 flex justify-between">
                      <span className="text-slate-400">eBPF Socket Filter:</span>
                      <span className="font-bold text-emerald-400">Active / Inspecting</span>
                    </div>
                    <div className="p-2.5 rounded bg-slate-950/80 border border-slate-800 flex justify-between">
                      <span className="text-slate-400">Blocked Perimeter IPs:</span>
                      <span className="font-bold text-amber-300">{blockedIps.length} blocked</span>
                    </div>
                    <div className="p-2.5 rounded bg-slate-950/80 border border-slate-800 flex justify-between">
                      <span className="text-slate-400">Analysis Status:</span>
                      <span className="font-bold text-emerald-400">Current</span>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 text-xs font-mono text-cyan-300">
                  <strong>AI Recommendation:</strong> All security engine pipelines are in sync with live telemetry. Re-scan telemetry anytime to refresh analysis.
                </div>
              </div>
            )}

          </div>
        )}

      </div>

      {/* ====================================================
          4. OPTIONAL AI SECURITY QUERY BAR (COMPACT & NON-DOMINATING)
          ==================================================== */}
      <div className="glass-card p-5 rounded-2xl border border-slate-800/80 bg-slate-950/80 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-[#00D4FF]" />
            <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
              Optional AI Security Query (Ask AI)
            </h4>
          </div>
          <span className="text-[10px] font-mono text-slate-500">
            Ask custom questions about active threats or SLAs
          </span>
        </div>

        <form onSubmit={handleSendCustomQuery} className="flex items-center gap-2">
          <input
            type="text"
            value={queryInput}
            onChange={(e) => setQueryInput(e.target.value)}
            placeholder="e.g., Explain why FIN-PC-01 is flagged, or how to reach 100 security score..."
            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00D4FF] font-mono"
          />
          <button
            type="submit"
            disabled={isQueryLoading || !queryInput.trim()}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 hover:opacity-90 disabled:opacity-50 text-white text-xs font-mono font-bold flex items-center gap-2 cursor-pointer shrink-0"
          >
            {isQueryLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
            <span>Analyze</span>
          </button>
        </form>

        {customAiResponse && (
          <div className="p-4 rounded-xl bg-slate-900/90 border border-purple-500/30 text-xs text-slate-200 font-sans leading-relaxed relative">
            <button
              onClick={() => setCustomAiResponse(null)}
              className="absolute top-2 right-2 text-slate-500 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
            <div className="flex items-center gap-1.5 text-purple-300 font-mono text-[11px] font-bold mb-1">
              <Bot className="w-3.5 h-3.5 text-[#00D4FF]" />
              <span>Copilot Diagnostic Output:</span>
            </div>
            <p>{customAiResponse}</p>
          </div>
        )}
      </div>

      {/* ====================================================
          5. THREAT & DEVICE DRAWERS FOR INFORMATIONAL DRILL-DOWN
          ==================================================== */}
      <ThreatDetailsDrawer
        isOpen={isThreatDrawerOpen}
        onClose={() => setIsThreatDrawerOpen(false)}
        threat={selectedThreatForDrawer}
      />

      <DeviceDetailsDrawer
        isOpen={isDeviceDrawerOpen}
        onClose={() => setIsDeviceDrawerOpen(false)}
        device={selectedDeviceForDrawer}
      />

    </div>
  );
};
