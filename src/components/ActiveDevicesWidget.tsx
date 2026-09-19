import React from 'react';
import { Cpu, Server, CheckCircle2, Shield, Activity, AlertTriangle } from 'lucide-react';
import { useThreats } from '../context/ThreatContext';

export const ActiveDevicesWidget: React.FC = () => {
  const { devices, healthyDevicesCount, setActiveTab } = useThreats();

  // Take first 4 active enterprise devices to display on dashboard
  const displayDevices = devices.slice(0, 4);

  return (
    <div className="glass-card p-6 rounded-2xl border border-slate-800 hover:border-cyan-500/30 transition-all font-mono">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-4">
        <div className="flex items-center gap-2">
          <Server className="w-5 h-5 text-[#00D4FF]" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Monitored Enterprise Infrastructure
          </h3>
        </div>
        <button
          onClick={() => setActiveTab('connected-devices')}
          className="text-[10px] bg-emerald-950 text-emerald-400 px-2.5 py-0.5 rounded border border-emerald-800 font-bold hover:bg-emerald-900 transition-colors cursor-pointer"
        >
          {healthyDevicesCount}/{devices.length} NODES HEALTHY
        </button>
      </div>

      {/* Node Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {displayDevices.map((device) => {
          const isHealthy = device.status === 'Healthy';
          const isQuarantined = device.status === 'Quarantined';
          const isWarning = device.status === 'Warning';

          return (
            <div 
              key={device.deviceId} 
              onClick={() => setActiveTab('connected-devices')}
              className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-900 hover:border-[#00D4FF]/30 transition-all space-y-2 group cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 overflow-hidden">
                  <Cpu className="w-4 h-4 text-[#00D4FF] shrink-0" />
                  <span className="text-xs font-bold text-white truncate group-hover:text-cyan-300 transition-colors">
                    {device.hostname}
                  </span>
                </div>
                <span className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded border font-bold ${
                  isHealthy
                    ? 'text-emerald-400 bg-emerald-950/80 border-emerald-800'
                    : isQuarantined
                    ? 'text-amber-400 bg-amber-950/80 border-amber-800'
                    : 'text-rose-400 bg-rose-950/80 border-rose-800'
                }`}>
                  {isHealthy ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                  <span>{device.status.toUpperCase()}</span>
                </span>
              </div>

              <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-900">
                <span>Dept: <strong className="text-slate-300">{device.department}</strong></span>
                <span>OS: <strong className="text-[#00D4FF]">{device.operatingSystem.split(' ')[0]}</strong></span>
              </div>

              <div className="text-[10px] text-slate-400 flex items-center justify-between">
                <span>IP: <strong className="text-white font-mono">{device.ipAddress}</strong></span>
                <span className="text-slate-500">Seen: {device.lastSeen}</span>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
