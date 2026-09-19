import React, { useState } from 'react';
import { Cpu, Sparkles, Activity, Globe, ShieldCheck, Database, Zap, Lock, Terminal, Layers, RefreshCw, BarChart3 } from 'lucide-react';

export const FeatureShowcase: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'ebpf' | 'ai' | 'neural' | 'mesh'>('ebpf');

  return (
    <section id="features" className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-slate-800/80">
      
      {/* Background glow */}
      <div className="absolute top-1/2 right-10 w-[500px] h-[500px] bg-blue-600/10 blur-[140px] rounded-full pointer-events-none" />

      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-cyan-400 text-xs font-mono uppercase tracking-widest mb-3">
          <Cpu className="w-3.5 h-3.5" />
          <span>AUTONOMOUS ENGINE ARCHITECTURE</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-extrabold text-white font-mono tracking-tight">
          Engineered for Zero-Day Precision
        </h2>
        <p className="text-slate-400 text-base mt-3">
          Replace legacy, signature-only firewalls with deep kernel-level visibility and neural intelligence.
        </p>
      </div>

      {/* Capability Selector Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
        <button
          onClick={() => setActiveTab('ebpf')}
          className={`px-5 py-3 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer flex items-center gap-2.5 border ${
            activeTab === 'ebpf'
              ? 'bg-cyan-950/80 border-cyan-500 text-cyan-300 shadow-[0_0_20px_rgba(0,240,255,0.25)]'
              : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
          }`}
        >
          <Cpu className="w-4 h-4 text-cyan-400" />
          <span>eBPF Kernel Interception</span>
        </button>

        <button
          onClick={() => setActiveTab('ai')}
          className={`px-5 py-3 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer flex items-center gap-2.5 border ${
            activeTab === 'ai'
              ? 'bg-cyan-950/80 border-cyan-500 text-cyan-300 shadow-[0_0_20px_rgba(0,240,255,0.25)]'
              : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
          }`}
        >
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>Gemini Incident AI</span>
        </button>

        <button
          onClick={() => setActiveTab('neural')}
          className={`px-5 py-3 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer flex items-center gap-2.5 border ${
            activeTab === 'neural'
              ? 'bg-cyan-950/80 border-cyan-500 text-cyan-300 shadow-[0_0_20px_rgba(0,240,255,0.25)]'
              : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
          }`}
        >
          <Activity className="w-4 h-4 text-cyan-400" />
          <span>Neural Anomaly Baseline</span>
        </button>

        <button
          onClick={() => setActiveTab('mesh')}
          className={`px-5 py-3 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer flex items-center gap-2.5 border ${
            activeTab === 'mesh'
              ? 'bg-cyan-950/80 border-cyan-500 text-cyan-300 shadow-[0_0_20px_rgba(0,240,255,0.25)]'
              : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
          }`}
        >
          <Globe className="w-4 h-4 text-cyan-400" />
          <span>Cross-Tenant Threat Mesh</span>
        </button>
      </div>

      {/* Tab Content Display */}
      <div className="glass-card rounded-2xl p-6 sm:p-10 border border-slate-800">
        
        {activeTab === 'ebpf' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <div className="inline-block px-2.5 py-1 rounded bg-cyan-950 text-cyan-400 font-mono text-xs border border-cyan-800 mb-3">
                0% USER-SPACE OVERHEAD
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-mono mb-4">
                Kernel-Level Inspection without Sidecar Containers
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed mb-6">
                SentinelX injects lightweight eBPF bytecode directly into Linux kernel socket layers (XDP/TC hooks). Gain 100% visibility over L3-L7 packet payloads, TLS handshake SNI headers, and process syscalls with under 1% CPU footprint.
              </p>
              <ul className="space-y-3 font-mono text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-cyan-400" />
                  <span>Intercept packets before network stack protocol processing.</span>
                </li>
                <li className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-cyan-400" />
                  <span>No daemon set sidecar proxy required on Kubernetes worker nodes.</span>
                </li>
                <li className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-cyan-400" />
                  <span>Instant XDP drop rule generation for hardware NIC offloading.</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-slate-950 rounded-xl p-5 border border-slate-800 font-mono text-xs text-slate-300 space-y-3">
              <div className="flex items-center justify-between text-slate-500 text-[11px] pb-2 border-b border-slate-800">
                <span>FILE: ebpf_xdp_packet_filter.c</span>
                <span className="text-emerald-400">STATUS: LOADED IN KERNEL</span>
              </div>
              <div className="text-cyan-400">
                <code>{`// eBPF Fast-Path Packet Filter Hook`}</code>
              </div>
              <div className="text-slate-300">
                <pre>{`SEC("xdp")
int sentinelx_xdp_hook(struct xdp_md *ctx) {
    void *data = (void *)(long)ctx->data;
    void *data_end = (void *)(long)ctx->data_end;
    
    struct ethhdr *eth = data;
    if ((void *)(eth + 1) > data_end)
        return XDP_PASS;
        
    // Fast-path anomaly score check against eBPF ring buffer
    if (bpf_map_lookup_elem(&blacklisted_ips, &eth->h_source)) {
        return XDP_DROP; // Drop packet in hardware
    }
    return XDP_PASS;
}`}</pre>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'ai' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <div className="inline-block px-2.5 py-1 rounded bg-cyan-950 text-cyan-400 font-mono text-xs border border-cyan-800 mb-3">
                GEMINI 2.5 FLASH REASONING
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-mono mb-4">
                Automated Incident Analysis & CISO Reporting
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed mb-6">
                When a complex multi-vector intrusion occurs, Gemini AI compiles raw pcap traces, authentication logs, and process parentage trees into natural language root-cause reports with step-by-step mitigation advice.
              </p>
              <ul className="space-y-3 font-mono text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span>Translates obfuscated payloads into plain English threat explanations.</span>
                </li>
                <li className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span>Recommends exact firewall syntax for Cloudflare, AWS WAF, and iptables.</span>
                </li>
                <li className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span>Generates executive SOC summaries for compliance audits in seconds.</span>
                </li>
              </ul>
            </div>

            <div className="bg-slate-950 rounded-xl p-5 border border-slate-800 font-mono text-xs text-slate-300 space-y-3">
              <div className="flex items-center justify-between text-slate-500 text-[11px] pb-2 border-b border-slate-800">
                <span className="flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5 text-cyan-400" /> AI COPILOT FEED</span>
                <span className="text-cyan-400">CONFIDENCE: 99.8%</span>
              </div>
              <div className="bg-slate-900 p-3 rounded border border-slate-800 text-slate-200">
                <p className="font-bold text-cyan-400 mb-1">Incident #INC-892 Summary:</p>
                <p className="text-xs text-slate-300">
                  "Attacker IP 185.220.101.5 initiated an automated credential stuffing run against /api/v2/auth, then pivoted to execute an unauthenticated blind SQL injection on the user metadata endpoint. SentinelX isolated the database transaction within 0.78ms."
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'neural' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <div className="inline-block px-2.5 py-1 rounded bg-cyan-950 text-cyan-400 font-mono text-xs border border-cyan-800 mb-3">
                UNSUPERVISED ANOMALY MODELING
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-mono mb-4">
                Dynamic Behavioral Baselining for Zero-Day Vectors
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed mb-6">
                SentinelX constantly learns normal flow parameters (request frequency, payload entropy, protocol field lengths, microsecond inter-arrival times). Anything deviating beyond 3.5 standard deviations triggers immediate adaptive isolation.
              </p>
              <ul className="space-y-3 font-mono text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  <span>Catches novel exploits before CVE signatures are published.</span>
                </li>
                <li className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  <span>Eliminates false positives by learning seasonal traffic bursts.</span>
                </li>
              </ul>
            </div>

            <div className="bg-slate-950 rounded-xl p-5 border border-slate-800 font-mono text-xs space-y-3">
              <div className="text-slate-400 text-xs font-bold">NORMAL TRAFFIC ENTROPY VS ANOMALY SPIKE</div>
              <div className="h-32 flex items-end gap-1 bg-slate-900 p-3 rounded border border-slate-800">
                {[20, 25, 22, 28, 24, 21, 26, 23, 85, 95, 92, 24, 22, 25, 21].map((val, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center">
                    <div 
                      style={{ height: `${val}%` }} 
                      className={`w-full rounded-t ${val > 50 ? 'bg-rose-500 shadow-[0_0_10px_#f43f5e]' : 'bg-cyan-500'}`}
                    />
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-500">
                <span>00:00 UTC</span>
                <span className="text-rose-400 font-bold">ANOMALY DETECTED (ENTROPY 8.91)</span>
                <span>00:15 UTC</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'mesh' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <div className="inline-block px-2.5 py-1 rounded bg-cyan-950 text-cyan-400 font-mono text-xs border border-cyan-800 mb-3">
                COLLECTIVE DEFENSE
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-mono mb-4">
                Cross-Tenant Global Threat Correlation Mesh
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed mb-6">
                When an attacker attempts an exploit against any SentinelX node anywhere in the world, the malicious IP, payload fingerprint, and TLS signature are instantly broadcasted across the entire global mesh.
              </p>
              <ul className="space-y-3 font-mono text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-cyan-400" />
                  <span>Immunize your infrastructure against attacks hitting other enterprises.</span>
                </li>
                <li className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-cyan-400" />
                  <span>Privacy-first hash matching keeps payload content confidential.</span>
                </li>
              </ul>
            </div>

            <div className="bg-slate-950 rounded-xl p-5 border border-slate-800 font-mono text-xs space-y-3">
              <div className="flex items-center justify-between text-slate-400">
                <span>GLOBAL REPUTATION BROADCAST</span>
                <span className="text-emerald-400 animate-pulse">● MESH SYNCHRONIZED</span>
              </div>
              <div className="space-y-2">
                <div className="p-2.5 bg-slate-900 rounded border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-300">IP: 185.220.101.5</span>
                  <span className="text-rose-400 font-bold">BLOCKED ON 1,420 NODES</span>
                </div>
                <div className="p-2.5 bg-slate-900 rounded border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-300">JA3: d41d8cd98f00b204</span>
                  <span className="text-rose-400 font-bold">BLOCKED ON 980 NODES</span>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

    </section>
  );
};
