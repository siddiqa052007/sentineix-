import { ThreatDetails } from '../types';

export const getSeverityBadgeStyle = (severity: ThreatDetails['severity']) => {
  switch (severity) {
    case 'Critical':
      return 'bg-rose-950/80 text-rose-400 border-rose-800 shadow-[0_0_10px_rgba(244,63,94,0.2)]';
    case 'High':
      return 'bg-amber-950/80 text-amber-400 border-amber-800';
    case 'Medium':
      return 'bg-blue-950/80 text-blue-400 border-blue-800';
    case 'Low':
    default:
      return 'bg-slate-900 text-slate-400 border-slate-800';
  }
};

export const getStatusBadgeStyle = (status: ThreatDetails['status']) => {
  switch (status) {
    case 'Resolved':
    case 'Archived':
      return 'bg-emerald-950/80 text-emerald-400 border-emerald-800';
    case 'Action Taken':
      return 'bg-purple-950/80 text-purple-300 border-purple-800';
    case 'Under Investigation':
      return 'bg-cyan-950/80 text-[#00D4FF] border-cyan-800';
    case 'Active':
    default:
      return 'bg-rose-950/80 text-rose-300 border-rose-800';
  }
};

export const formatTimestampNow = (): string => {
  const now = new Date();
  const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const date = now.toLocaleDateString([], { month: 'short', day: 'numeric' });
  return `${time}, ${date}`;
};
