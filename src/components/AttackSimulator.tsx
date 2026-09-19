import React, { useState } from 'react';
import { Play, Sparkles, Terminal, ShieldAlert, CheckCircle2, Cpu, ArrowRight, Lock, AlertTriangle, ShieldCheck, Zap } from 'lucide-react';

interface Scenario {
  id: string;
  title: string;
  type: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  description: string;
  sampleVector: string;
  aiAnalysisSteps: string[];
  generatedEbpfRule: string;
  responseLatency: string;
}

const ATTACK_SCENARIOS: Scenario[] = [
  {
    id: 'sqli',
    title: 'Blind SQL Injection (CVE-2026-901)',
    type: 'Database Exfiltration',
    severity: 'CRITICAL',
    description: 'Malicious payload targeting user authentication endpoint attempting out-of-band data extraction via stacked UNION subqueries.',
    sampleVector: "POST /api/v1/auth/login HTTP/1.1\nHost: portal.corp.internal\nPayload: username=admin' UNION SELECT null, pg_read_file('/etc/passwd'), version()--",
    aiAnalysisSteps: [
      '1. eBPF socket listener captured un-sanitized string concatenation in SQL parameter stream.',
      '2. Neural baseline detected entropy spike (4.82 -> 8.91) on database connection socket.',
      '3. Gemini AI Threat Reasoning Engine identified UNION SELECT exfiltration pattern with 99.8% certainty.',
      '4. Synthetic rule generated: Inject kernel XDP drop for source IP socket family & trigger database transaction rollback.'
    ],
    generatedEbpfRule: `SEC("xdp") int filter_sqli(struct xdp_md *ctx) {\n  void *data = (void *)(long)ctx->data;\n  if (match_signature(data, "UNION SELECT")) {\n    return XDP_DROP;\n  }\n  return XDP_PASS;\n}`,
    responseLatency: '0.64 ms'
  },
  {
    id: 'ddos',
    title: 'SYN-ACK Amplification DDoS',
    type: 'Volumetric Network Attack',
    severity: 'HIGH',
    description: 'Botnet flooding ingress controllers with 650,000 spoofed TCP SYN packets per second to exhaust connection state tables.',
    sampleVector: 'SYN_FLOOD_VOLUMETRIC: 650k pps from 1,240 distributed autonomous systems (ASNs)',
    aiAnalysisSteps: [
      '1. Ingress traffic exceeded rolling 60-second baseline by +840%.',
      '2. Cross-tenant threat mesh alerted active botnet signature matching Mirai variant #4.',
      '3. AI classifier enabled SYN Cookie validation at Linux kernel level.',
      '4. Rate limiting enforced: Dropped 99.4% of spoofed traffic without degrading legitimate customer HTTP/2 sessions.'
    ],
    generatedEbpfRule: `SEC("tc") int filter_syn_flood(struct __sk_buff *skb) {\n  if (skb->protocol == ETH_P_IP && is_syn_flood_signature(skb)) {\n    return TC_ACT_SHOT;\n  }\n  return TC_ACT_OK;\n}`,
    responseLatency: '0.42 ms'
  },
  {
    id: 'ransomware',
    title: 'Ransomware C2 Beaconing',
    type: 'Lateral Malware Propagation',
    severity: 'CRITICAL',
    description: 'Compromised workstation attempting outbound TLS communication with dynamic DNS C2 server to fetch encryption keys.',
    sampleVector: 'CONNECT x9f821a.onion-domain.ru:8443 TLSv1.3 (Self-Signed Cert, JA3 Hash: d41d8cd98f00b204e9800998ecf8427e)',
    aiAnalysisSteps: [
      '1. Egress traffic monitor caught anomalous DNS query to high-risk top-level domain.',
      '2. JA3 TLS Fingerprint analysis matched known LockBit 3.0 command & control infrastructure.',
      '3. Gemini AI auto-isolated host VM from local subnet to prevent SMB lateral spreading.',
      '4. Snapshot taken for forensic memory analysis.'
    ],
    generatedEbpfRule: `SEC("cgroup/connect4") int isolate_c2_beacon(struct bpf_sock_addr *ctx) {\n  if (ctx->user_ip4 == inet_addr("194.26.29.114")) {\n    return 0; // Block socket creation\n  }\n  return 1;\n}`,
    responseLatency: '0.88 ms'
  },
  {
    id: 'bruteforce',
    title: 'SSH Credential Stuffing',
    type: 'Identity Exploitation',
    severity: 'MEDIUM',
    description: 'Distributed cluster performing dictionary attacks against production SSH bastions using stolen credential dumps.',
    sampleVector: 'SSH-2.0-OpenSSH_8.9p1 Failed password for root from 112.196.40.10 port 49120 (120 attempts/min)',
    aiAnalysisSteps: [
      '1. Authentication log parser detected rate threshold breach on port 22.',
      '2. IP reputation query flagged origin IP as a known TOR exit node.',
      '3. AI engine updated PAM access rules and triggered mandatory WebAuthn FIDO2 MFA enforcement.',
      '4. Temporary 24-hour IP ban deployed to edge firewalls.'
    ],
    generatedEbpfRule: `SEC("kprobe/sys_execve") int audit_ssh_brute(struct pt_regs *ctx) {\n  // Kernel level rate-limit enforcement for failed auth syscalls\n  return 0;\n}`,
    responseLatency: '0.51 ms'
  }
];

export const AttackSimulator: React.FC = () => {
  const [selectedScenario, setSelectedScenario] = useState<Scenario>(ATTACK_SCENARIOS[0]);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simulationProgress, setSimulationProgress] = useState<number>(0);
  const [simulationCompleted, setSimulationCompleted] = useState<boolean>(false);

  const handleRunSimulation = () => {
    setIsSimulating(true);
    setSimulationProgress(0);
    setSimulationCompleted(false);

    let progress = 0;
    const interval = setInterval(() => {
      progress += 25;
      setSimulationProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setIsSimulating(false);
        setSimulationCompleted(true);
      }
    }, 400);
  };

  return (
    <section id="simulator" className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      
      {/* Background radial glow */}
      <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-cyan-500/10 blur-[130px] rounded-full pointer-events-none" />

      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-cyan-400 text-xs font-mono uppercase tracking-widest mb-3">
          <Terminal className="w-3.5 h-3.5" />
          <span>INTERACTIVE THREAT SANDBOX</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-extrabold text-white font-mono tracking-tight">
          Test SentinelX AI Mitigation Live
        </h2>
        <p className="text-slate-400 text-base mt-3">
          Select a real-world enterprise attack vector and watch SentinelX intercept, analyze, and neutralize the exploit at kernel speed.
        </p>
      </div>

      {/* Simulator Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Attack Vector Selector (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="text-xs font-mono font-bold uppercase text-slate-400 tracking-wider mb-2">
            SELECT THREAT VECTOR:
          </div>

          {ATTACK_SCENARIOS.map((sc) => (
            <button
              key={sc.id}
              onClick={() => {
                setSelectedScenario(sc);
                setSimulationCompleted(false);
              }}
              className={`w-full p-4 rounded-xl text-left border transition-all cursor-pointer flex flex-col gap-2 ${
                selectedScenario.id === sc.id
                  ? 'bg-gradient-to-r from-cyan-950/80 to-blue-950/60 border-cyan-500/60 shadow-[0_0_20px_rgba(0,240,255,0.2)]'
                  : 'bg-slate-900/60 border-slate-800 hover:bg-slate-800/60 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`px-2 py-0.5 text-[10px] font-bold font-mono rounded ${
                  sc.severity === 'CRITICAL' ? 'bg-rose-950 text-rose-400 border border-rose-800' :
                  sc.severity === 'HIGH' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                  'bg-sky-950 text-sky-400 border border-sky-800'
                }`}>
                  {sc.severity}
                </span>
                <span className="text-[11px] font-mono text-cyan-400">{sc.type}</span>
              </div>
              <div className="font-mono font-bold text-sm text-white">{sc.title}</div>
              <p className="text-xs text-slate-400 line-clamp-2">{sc.description}</p>
            </button>
          ))}

          {/* Launch Trigger */}
          <button
            onClick={handleRunSimulation}
            disabled={isSimulating}
            className="w-full py-3.5 px-6 rounded-xl font-mono font-bold text-xs uppercase tracking-wider text-slate-900 bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 hover:shadow-[0_0_25px_rgba(0,240,255,0.5)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSimulating ? (
              <>
                <Cpu className="w-4 h-4 animate-spin text-slate-900" />
                <span>INTERCEPTING VECTOR ({simulationProgress}%)...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-slate-900" />
                <span>EXECUTE ATTACK SIMULATION</span>
              </>
            )}
          </button>
        </div>

        {/* Right Column: Interactive Inspection & AI Reasoning Screen (8 cols) */}
        <div className="lg:col-span-8 glass-card rounded-2xl p-6 border border-cyan-500/20 relative overflow-hidden">
          
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
            <div>
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-400" />
                <h3 className="font-mono font-bold text-white text-base sm:text-lg">
                  {selectedScenario.title}
                </h3>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Target Architecture: <span className="text-cyan-400">Production Kubernetes Cluster / API Ingress</span>
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-[10px] font-mono text-slate-400">AI RESPONSE SLA</div>
                <div className="text-sm font-mono font-bold text-emerald-400">{selectedScenario.responseLatency}</div>
              </div>
            </div>
          </div>

          {/* Code Payload Window */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-1.5">
              <span>CAPTURED RAW PAYLOAD:</span>
              <span className="text-rose-400">UNTRUSTED INGRESS</span>
            </div>
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 font-mono text-xs text-rose-300 overflow-x-auto">
              <pre>{selectedScenario.sampleVector}</pre>
            </div>
          </div>

          {/* AI Analysis Stream Progress */}
          <div className="mt-6">
            <div className="flex items-center justify-between text-xs font-mono text-slate-300 mb-2">
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
                <span>SENTINELX AI THREAT REASONING ENGINE</span>
              </span>
              {simulationCompleted && (
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> THREAT NEUTRALIZED
                </span>
              )}
            </div>

            <div className="space-y-2.5">
              {selectedScenario.aiAnalysisSteps.map((step, idx) => {
                const isStepVisible = simulationCompleted || (isSimulating && (idx + 1) * 25 <= simulationProgress);
                return (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg border text-xs font-mono transition-all duration-300 ${
                      isStepVisible
                        ? 'bg-cyan-950/30 border-cyan-500/30 text-cyan-200 translate-x-0 opacity-100'
                        : 'bg-slate-900/30 border-slate-800 text-slate-600 opacity-40'
                    }`}
                  >
                    {step}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Generated eBPF Kernel Firewall Rule */}
          <div className="mt-6 pt-4 border-t border-slate-800">
            <div className="flex items-center justify-between text-xs font-mono text-slate-300 mb-2">
              <span className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-emerald-400" />
                <span>AUTO-GENERATED eBPF KERNEL FILTER</span>
              </span>
              <span className="text-[10px] text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                ACTIVE IN XDP HOOK
              </span>
            </div>
            <div className="bg-slate-950 p-3.5 rounded-xl border border-emerald-500/20 font-mono text-xs text-emerald-400 overflow-x-auto">
              <pre>{selectedScenario.generatedEbpfRule}</pre>
            </div>
          </div>

        </div>

      </div>

    </section>
  );
};
