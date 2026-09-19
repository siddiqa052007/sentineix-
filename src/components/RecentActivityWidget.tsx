import React from 'react';
import { Clock, ShieldCheck, AlertTriangle, UserCheck, FileText } from 'lucide-react';

export interface TimelineEvent {
  time: string;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  borderColor: string;
}

const TIMELINE_EVENTS: TimelineEvent[] = [
  {
    time: '09:00',
    title: 'Administrator Login',
    description: 'SecOps admin session authenticated via SSO & YubiKey MFA',
    icon: UserCheck,
    color: 'text-[#00D4FF]',
    bgColor: 'bg-cyan-950/60',
    borderColor: 'border-cyan-800/80',
  },
  {
    time: '09:25',
    title: 'Threat Detected',
    description: 'Brute force authentication cluster flagged on ingress gateway',
    icon: AlertTriangle,
    color: 'text-rose-400',
    bgColor: 'bg-rose-950/60',
    borderColor: 'border-rose-800/80',
  },
  {
    time: '10:15',
    title: 'Threat Resolved',
    description: 'eBPF firewall rules deployed & malicious subnets quarantined',
    icon: ShieldCheck,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-950/60',
    borderColor: 'border-emerald-800/80',
  },
  {
    time: '11:40',
    title: 'Security Report Generated',
    description: 'SOC executive audit report PDF compiled and dispatched',
    icon: FileText,
    color: 'text-purple-400',
    bgColor: 'bg-purple-950/60',
    borderColor: 'border-purple-800/80',
  },
];

export const RecentActivityWidget: React.FC = () => {
  return (
    <div className="glass-card p-6 rounded-2xl border border-slate-800 bg-slate-950/70 hover:border-cyan-500/30 transition-all font-sans">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-4">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-[#00D4FF]" />
          <h3 className="text-lg font-bold text-white font-heading">
            Recent Activity
          </h3>
        </div>
        <span className="text-xs font-mono text-slate-400">Audit Stream</span>
      </div>

      {/* Timeline List */}
      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
        {TIMELINE_EVENTS.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="relative group">
              {/* Timeline Bullet Node */}
              <div className={`absolute -left-[23px] top-0.5 w-5 h-5 rounded-full ${item.bgColor} border ${item.borderColor} flex items-center justify-center shadow-[0_0_10px_rgba(0,0,0,0.5)] z-10`}>
                <Icon className={`w-3 h-3 ${item.color}`} />
              </div>

              {/* Event Content */}
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 hover:border-slate-700 transition-all">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-bold text-white font-sans">{item.title}</span>
                  <span className="text-xs font-mono font-bold text-[#00D4FF]">{item.time}</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed font-sans">{item.description}</p>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
