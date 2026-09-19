import React from 'react';
import { Shield, Radio, CheckCircle2, Lock, Terminal, Github, Twitter, Linkedin, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#050811] border-t border-slate-800/80 pt-16 pb-12 font-mono text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Footer Row */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          
          {/* Col 1 & 2: Brand & Status */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-500/40 text-cyan-400">
                <Shield className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-lg text-white font-mono tracking-wider">
                SENTINEL<span className="text-cyan-400">X</span>
              </span>
            </div>

            <p className="text-slate-400 text-xs leading-relaxed max-w-sm font-sans">
              Autonomous AI Powered Intrusion Detection System built for modern enterprise cloud infrastructure, Kubernetes clusters, and zero-day threat defense.
            </p>

            {/* Live Status Indicators */}
            <div className="pt-2 flex flex-col gap-2">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-[11px]">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>ALL THREAT ENGINE SYSTEMS OPERATIONAL</span>
              </div>
              <div className="inline-flex items-center gap-2 text-slate-500 text-[11px]">
                <Radio className="w-3.5 h-3.5 text-cyan-400" />
                <span>Global Threat Mesh: 14 Edge Nodes Synchronized</span>
              </div>
            </div>
          </div>

          {/* Col 3: Platform */}
          <div>
            <div className="text-white font-bold uppercase tracking-wider mb-3">Capabilities</div>
            <ul className="space-y-2 text-slate-400">
              <li><a href="#features" className="hover:text-cyan-400 transition-colors">eBPF Packet Engine</a></li>
              <li><a href="#features" className="hover:text-cyan-400 transition-colors">Gemini Copilot AI</a></li>
              <li><a href="#simulator" className="hover:text-cyan-400 transition-colors">Attack Sandbox</a></li>
              <li><a href="#benchmark" className="hover:text-cyan-400 transition-colors">Performance Matrix</a></li>
              <li><a href="#radar" className="hover:text-cyan-400 transition-colors">Live Threat Mesh</a></li>
            </ul>
          </div>

          {/* Col 4: Resources & Docs */}
          <div>
            <div className="text-white font-bold uppercase tracking-wider mb-3">Documentation</div>
            <ul className="space-y-2 text-slate-400">
              <li><a href="#" className="hover:text-cyan-400 transition-colors flex items-center gap-1">API Reference <ExternalLink className="w-3 h-3 text-slate-600" /></a></li>
              <li><a href="#" className="hover:text-cyan-400 transition-colors">eBPF Kernel Drivers</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition-colors">Zero-Day Vulnerability Feed</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition-colors">SOC 2 Compliance</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition-colors">Security Whitepaper</a></li>
            </ul>
          </div>

          {/* Col 5: Security Advisory Newsletter */}
          <div>
            <div className="text-white font-bold uppercase tracking-wider mb-3">Zero-Day Advisories</div>
            <p className="text-slate-400 text-[11px] mb-3 font-sans">
              Subscribe to critical CVE alerts & eBPF detection signature updates.
            </p>
            <form onSubmit={(e) => e.preventDefault()} className="space-y-2">
              <input
                type="email"
                placeholder="secops@company.com"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
              />
              <button
                type="submit"
                className="w-full py-2 bg-cyan-500 text-slate-950 font-bold rounded-lg hover:bg-cyan-400 transition-all cursor-pointer"
              >
                SUBSCRIBE TO CVE FEED
              </button>
            </form>
          </div>

        </div>

        {/* Bottom Legal & Compliance Row */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-[11px]">
          <div>
            © {new Date().getFullYear()} SentinelX Security Technologies Inc. All rights reserved.
          </div>

          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 text-slate-400">
              <Lock className="w-3.5 h-3.5 text-emerald-400" /> SOC 2 TYPE II CERTIFIED
            </span>
            <span className="flex items-center gap-1.5 text-slate-400">
              <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" /> ISO 27001 COMPLIANT
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
};
