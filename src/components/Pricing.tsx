import React from 'react';
import { ShieldCheck, Check, Sparkles, Zap, ArrowRight, Lock } from 'lucide-react';

interface PricingProps {
  onSelectPlan?: (planName: string) => void;
}

export const Pricing: React.FC<PricingProps> = ({ onSelectPlan }) => {
  return (
    <section id="pricing" className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-slate-800/80">
      
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/10 blur-[160px] rounded-full pointer-events-none" />

      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-cyan-400 text-xs font-mono uppercase tracking-widest mb-3">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>TRANSPARENT ENTERPRISE LICENSING</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-extrabold text-white font-mono tracking-tight">
          Scalable Threat Defense for Every Scale
        </h2>
        <p className="text-slate-400 text-base mt-3">
          Deploy SentinelX eBPF sensors in minutes. Start free or upgrade to full autonomous AI SOC automation.
        </p>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
        
        {/* Tier 1: Community Dev (Free) */}
        <div className="glass-card rounded-2xl p-6 sm:p-8 border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-all">
          <div>
            <div className="text-xs font-mono uppercase text-slate-400 tracking-wider">DEVELOPER & TESTING</div>
            <h3 className="text-2xl font-extrabold text-white font-mono mt-1">Community Edition</h3>
            <div className="mt-4 flex items-baseline gap-1">
              <span className="text-4xl font-extrabold text-white font-mono">$0</span>
              <span className="text-slate-400 text-xs font-mono">/ forever free</span>
            </div>
            <p className="text-xs text-slate-400 mt-2">Ideal for personal homelabs, developer clusters, and staging environments.</p>

            <div className="my-6 pt-6 border-t border-slate-800 space-y-3 font-mono text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-cyan-400" />
                <span>Up to 3 Kubernetes Worker Nodes</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-cyan-400" />
                <span>eBPF Packet Inspection Engine</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-cyan-400" />
                <span>Basic Rule Signature Library</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-cyan-400" />
                <span>24-Hour Forensic Log Retention</span>
              </div>
              <div className="flex items-center gap-2 text-slate-500">
                <Check className="w-4 h-4 text-slate-600" />
                <span>Community Discord Support</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onSelectPlan && onSelectPlan('Community')}
            className="w-full py-3 px-4 rounded-xl font-mono text-xs font-bold uppercase tracking-wider text-slate-200 bg-slate-900 border border-slate-700 hover:bg-slate-800 transition-all cursor-pointer"
          >
            Deploy Free Node
          </button>
        </div>

        {/* Tier 2: Pro SOC Team (Most Popular) */}
        <div className="glass-card rounded-2xl p-6 sm:p-8 border-2 border-cyan-500/80 flex flex-col justify-between relative glow-box-cyan bg-slate-950/80">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-cyan-400 text-slate-950 font-mono text-[10px] font-extrabold uppercase rounded-full tracking-wider">
            MOST POPULAR FOR SOC TEAMS
          </div>

          <div>
            <div className="text-xs font-mono uppercase text-cyan-400 tracking-wider">PRODUCTION SECURITY</div>
            <h3 className="text-2xl font-extrabold text-white font-mono mt-1">Pro SOC Defense</h3>
            <div className="mt-4 flex items-baseline gap-1">
              <span className="text-4xl font-extrabold text-white font-mono">$499</span>
              <span className="text-slate-400 text-xs font-mono">/ month</span>
            </div>
            <p className="text-xs text-slate-400 mt-2">For growing technology companies needing active zero-day AI mitigation.</p>

            <div className="my-6 pt-6 border-t border-slate-800 space-y-3 font-mono text-xs text-slate-200">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-cyan-400" />
                <span>Up to 25 Protected Nodes / Pods</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-cyan-400" />
                <span>Gemini 2.5 Flash Incident AI Copilot</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-cyan-400" />
                <span>Automated eBPF Kernel Drop Rules</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-cyan-400" />
                <span>30-Day Forensic Log Search & Export</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-cyan-400" />
                <span>Slack & PagerDuty Instant Alerts</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-cyan-400" />
                <span>99.9% Uptime Guarantee SLA</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onSelectPlan && onSelectPlan('Pro SOC')}
            className="w-full py-3.5 px-4 rounded-xl font-mono text-xs font-bold uppercase tracking-wider text-slate-950 bg-gradient-to-r from-cyan-400 to-blue-500 shadow-lg hover:brightness-110 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Start 14-Day Free Trial</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Tier 3: Enterprise Autonomous Fortress */}
        <div className="glass-card rounded-2xl p-6 sm:p-8 border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-all">
          <div>
            <div className="text-xs font-mono uppercase text-slate-400 tracking-wider">ENTERPRISE ARCHITECTURE</div>
            <h3 className="text-2xl font-extrabold text-white font-mono mt-1">Autonomous Fortress</h3>
            <div className="mt-4 flex items-baseline gap-1">
              <span className="text-4xl font-extrabold text-white font-mono">Custom</span>
              <span className="text-slate-400 text-xs font-mono">/ annual billing</span>
            </div>
            <p className="text-xs text-slate-400 mt-2">Unlimited nodes, custom compliance models, and dedicated threat intelligence.</p>

            <div className="my-6 pt-6 border-t border-slate-800 space-y-3 font-mono text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-cyan-400" />
                <span>Unlimited Kubernetes & Multi-Cloud Nodes</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-cyan-400" />
                <span>Dedicated Single-Tenant AI Reasoning Cluster</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-cyan-400" />
                <span>Cross-Tenant Threat Correlation Mesh</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-cyan-400" />
                <span>SOC 2 Type II, HIPAA, ISO27001 Reports</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-cyan-400" />
                <span>Custom Fine-Tuned AI Detection Models</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-cyan-400" />
                <span>24/7 Dedicated Security Architect SLA</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onSelectPlan && onSelectPlan('Enterprise')}
            className="w-full py-3 px-4 rounded-xl font-mono text-xs font-bold uppercase tracking-wider text-slate-200 bg-slate-900 border border-slate-700 hover:bg-slate-800 transition-all cursor-pointer"
          >
            Contact Security Sales
          </button>
        </div>

      </div>

    </section>
  );
};
