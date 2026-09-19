import React, { useState } from 'react';
import { ShieldAlert, Eye, ChevronRight } from 'lucide-react';
import { ThreatDetailsDrawer, ThreatDetails } from './ThreatDetailsDrawer';
import { useThreats } from '../context/ThreatContext';

export const RecentAlertsWidget: React.FC = () => {
  const { threats, alerts, setActiveTab } = useThreats();
  const [selectedThreat, setSelectedThreat] = useState<ThreatDetails | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Combine threats and alerts for a comprehensive recent feed
  const displayAlerts = alerts.length > 0 
    ? alerts.slice(0, 4).map(a => {
        const matchingThreat = threats.find(t => t.id === a.threatId || t.title.toLowerCase() === a.title.toLowerCase());
        if (matchingThreat) return matchingThreat;
        return {
          id: a.id,
          title: a.title,
          severity: a.severity,
          status: 'Active' as const,
          sourceIp: a.source || 'Kernel Socket Filter',
          destination: 'Cluster Ingress Subnet',
          detectedAt: a.timestamp,
          protocol: 'HTTPS / TLS 1.3',
          riskScore: a.severity === 'Critical' ? 95 : a.severity === 'High' ? 82 : 65,
          description: a.description,
          businessImpacts: ['Potential service latency', 'Ingress packet inspection recommended'],
          recommendedActions: [
            { id: '1', text: 'Verify ingress filter rules', completed: false },
            { id: '2', text: 'Inspect connection rate limits', completed: false }
          ],
          timeline: [
            { time: a.timestamp, title: 'Alert Generated', desc: a.description, statusTag: 'TRIGGERED' }
          ]
        } as ThreatDetails;
      })
    : threats.slice(0, 4);

  const handleOpenAlert = (threat: ThreatDetails) => {
    setSelectedThreat(threat);
    setIsDrawerOpen(true);
  };

  return (
    <div className="glass-card p-6 rounded-2xl border border-slate-800 bg-slate-950/70 hover:border-cyan-500/30 transition-all font-sans">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-4">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-rose-400" />
          <h3 className="text-lg font-bold text-white font-heading">
            Recent Security Alerts
          </h3>
        </div>
        <button
          onClick={() => setActiveTab('threats')}
          className="text-xs font-mono text-[#00D4FF] hover:underline flex items-center gap-1 cursor-pointer"
        >
          <span>View All ({threats.length})</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Alert Feed */}
      <div className="space-y-3">
        {displayAlerts.map((alert, idx) => (
          <div
            key={`${alert.id}-${idx}`}
            onClick={() => handleOpenAlert(alert)}
            className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/80 hover:border-slate-700 transition-all flex items-center justify-between gap-3 group cursor-pointer"
          >
            <div className="flex items-center gap-3 overflow-hidden">
              {/* Severity Badge */}
              <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase shrink-0 font-mono border ${
                alert.severity === 'Critical'
                  ? 'bg-rose-950/90 text-rose-400 border-rose-800/80 shadow-[0_0_10px_rgba(244,63,94,0.2)]'
                  : alert.severity === 'High'
                  ? 'bg-amber-950/90 text-amber-400 border-amber-800/80'
                  : alert.severity === 'Medium'
                  ? 'bg-yellow-950/80 text-yellow-400 border-yellow-800/80'
                  : 'bg-blue-950/80 text-blue-400 border-blue-800/80'
              }`}>
                {alert.severity}
              </span>

              <div className="overflow-hidden">
                <div className="text-sm font-bold text-slate-200 group-hover:text-[#00D4FF] transition-colors flex items-center gap-2">
                  <span className="truncate">{alert.title}</span>
                  {alert.status === 'Resolved' && (
                    <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 shrink-0">
                      Resolved
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-400 mt-0.5 font-mono">
                  Time: {alert.detectedAt} • Target: {alert.destination}
                </div>
              </div>
            </div>

            {/* View Details Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleOpenAlert(alert);
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-slate-200 font-medium transition-all cursor-pointer flex items-center gap-1.5 shrink-0 group-hover:border-[#00D4FF]/50"
            >
              <Eye className="w-3.5 h-3.5 text-[#00D4FF]" />
              <span>Details</span>
            </button>
          </div>
        ))}
      </div>

      {/* PREMIUM RIGHT-SIDE SLIDING THREAT DETAILS PANEL (DRAWER) */}
      <ThreatDetailsDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        threat={selectedThreat}
      />

    </div>
  );
};
