import React from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid 
} from 'recharts';
import { Activity } from 'lucide-react';

const CHART_DATA_TODAY = [
  { time: 'Morning', traffic: 1240, threats: 15 },
  { time: 'Afternoon', traffic: 2850, threats: 42 },
  { time: 'Evening', traffic: 1920, threats: 28 },
  { time: 'Night', traffic: 890, threats: 8 },
];

export const NetworkActivityChart: React.FC = () => {
  return (
    <div className="glass-card p-6 rounded-2xl border border-slate-800 bg-slate-950/70 hover:border-cyan-500/30 transition-all font-sans">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#00D4FF]" />
            <h3 className="text-lg font-bold text-white font-heading">
              Network Activity
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5 font-sans">
            Overall network activity today.
          </p>
        </div>

        <div className="px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-mono text-[#00D4FF] flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#00D4FF] animate-pulse" />
          <span>Live Ingress</span>
        </div>
      </div>

      {/* Area Chart */}
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={CHART_DATA_TODAY} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorTraffic" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00D4FF" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#00D4FF" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="time" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12, fontFamily: 'Inter' }} />
            <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12, fontFamily: 'Inter' }} />
            
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-slate-950 border border-[#00D4FF]/40 p-3 rounded-xl shadow-2xl font-sans text-xs space-y-1">
                      <div className="text-slate-300 font-bold border-b border-slate-800 pb-1">{label} Period</div>
                      <div className="text-[#00D4FF] font-semibold">
                        Network Traffic: {payload[0].value} Req/s
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />

            <Area
              type="monotone"
              dataKey="traffic"
              stroke="#00D4FF"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorTraffic)"
              name="Network Traffic"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Footer Legend */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-800/80 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded bg-[#00D4FF] shadow-[0_0_8px_#00D4FF]" />
          <span>Traffic Volume (Requests/sec)</span>
        </div>
        <span className="font-mono text-emerald-400 font-medium">Optimal Bandwidth</span>
      </div>

    </div>
  );
};

