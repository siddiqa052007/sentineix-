import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { PieChart as PieIcon } from 'lucide-react';

const THREAT_OVERVIEW_DATA = [
  { name: 'Brute Force', value: 40, color: '#f43f5e' },
  { name: 'Port Scan', value: 25, color: '#eab308' },
  { name: 'SQL Injection', value: 20, color: '#00D4FF' },
  { name: 'Others', value: 15, color: '#8b5cf6' },
];

export const ThreatDistributionChart: React.FC = () => {
  return (
    <div className="glass-card p-6 rounded-2xl border border-slate-800 bg-slate-950/70 hover:border-cyan-500/30 transition-all font-sans">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-4">
        <div className="flex items-center gap-2">
          <PieIcon className="w-5 h-5 text-[#00D4FF]" />
          <h3 className="text-lg font-bold text-white font-heading">
            Threat Overview
          </h3>
        </div>
        <span className="text-xs font-mono text-slate-400">Total 100% Attack Distribution</span>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
        
        {/* Donut Chart */}
        <div className="h-48 w-48 relative shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-slate-950 border border-slate-800 p-2.5 rounded-xl shadow-2xl font-sans text-xs">
                        <div className="font-bold text-white">{data.name}</div>
                        <div className="text-[#00D4FF] font-bold mt-1">
                          Share: {data.value}%
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Pie
                data={THREAT_OVERVIEW_DATA}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={75}
                paddingAngle={4}
                dataKey="value"
              >
                {THREAT_OVERVIEW_DATA.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="#070b14" strokeWidth={2} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
            <span className="text-lg font-extrabold text-white font-heading">24</span>
            <span className="text-[9px] text-slate-400 font-mono uppercase tracking-wider">TOTAL EVENTS</span>
          </div>
        </div>

        {/* Legend */}
        <div className="space-y-2.5 w-full">
          {THREAT_OVERVIEW_DATA.map((item) => (
            <div key={item.name} className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/80 hover:border-slate-700 transition-colors">
              <div className="flex items-center gap-2.5">
                <span 
                  className="w-3 h-3 rounded-md shrink-0" 
                  style={{ backgroundColor: item.color, boxShadow: `0 0 8px ${item.color}` }} 
                />
                <span className="text-slate-200 font-medium">{item.name}</span>
              </div>
              <span className="font-mono font-bold text-white">{item.value}%</span>
            </div>
          ))}
        </div>

      </div>

    </div>
  );
};

