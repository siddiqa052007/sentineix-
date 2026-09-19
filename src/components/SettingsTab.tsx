import React, { useState } from 'react';
import { Settings, Shield, Lock, Bell, Cpu, Save, User, Building, CreditCard, Mail, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const SettingsTab: React.FC = () => {
  const { currentUser } = useAuth();
  const [autoQuarantine, setAutoQuarantine] = useState(true);
  const [aiAnalysis, setAiAnalysis] = useState(true);
  const [ebpfRingMode, setEbpfRingMode] = useState('High Performance (0.5ms)');

  return (
    <div className="space-y-6 font-mono max-w-4xl">
      <div className="pb-4 border-b border-slate-800">
        <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
          <Settings className="w-5 h-5 text-cyan-400" />
          SentinelX Account Profile & Configuration
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          View registered user account details, eBPF ring buffer sensitivity, and Gemini AI controls.
        </p>
      </div>

      {/* User Details Card */}
      {currentUser && (
        <div className="glass-card p-6 rounded-2xl border border-slate-800/80 bg-slate-950/70 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <img 
                src={currentUser.profilePicture || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'} 
                alt={currentUser.name} 
                className="w-12 h-12 rounded-2xl object-cover border border-cyan-500/40 shadow-[0_0_15px_rgba(0,212,255,0.2)]"
              />
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>{currentUser.name}</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/50 text-emerald-400 text-[10px]">
                    {currentUser.status || 'Approved'}
                  </span>
                </h3>
                <p className="text-xs text-slate-400">{currentUser.email}</p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-xl bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 text-xs font-bold">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>{currentUser.role}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800/80 space-y-1">
              <div className="text-[10px] text-slate-500 uppercase flex items-center gap-1.5 font-bold">
                <User className="w-3 h-3 text-cyan-400" />
                <span>Full Name</span>
              </div>
              <div className="font-bold text-white truncate">{currentUser.name}</div>
            </div>

            <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800/80 space-y-1">
              <div className="text-[10px] text-slate-500 uppercase flex items-center gap-1.5 font-bold">
                <Mail className="w-3 h-3 text-cyan-400" />
                <span>Email Address</span>
              </div>
              <div className="font-bold text-white truncate">{currentUser.email}</div>
            </div>

            <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800/80 space-y-1">
              <div className="text-[10px] text-slate-500 uppercase flex items-center gap-1.5 font-bold">
                <Building className="w-3 h-3 text-cyan-400" />
                <span>Company / Org</span>
              </div>
              <div className="font-bold text-white truncate">{currentUser.company || 'Enterprise SOC'}</div>
            </div>

            <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800/80 space-y-1">
              <div className="text-[10px] text-slate-500 uppercase flex items-center gap-1.5 font-bold">
                <CreditCard className="w-3 h-3 text-cyan-400" />
                <span>Employee ID</span>
              </div>
              <div className="font-bold text-white truncate">{currentUser.employeeId || 'EMP-2026'}</div>
            </div>

            <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800/80 space-y-1">
              <div className="text-[10px] text-slate-500 uppercase flex items-center gap-1.5 font-bold">
                <Shield className="w-3 h-3 text-cyan-400" />
                <span>System Role</span>
              </div>
              <div className="font-bold text-white truncate">{currentUser.role}</div>
            </div>

            <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800/80 space-y-1">
              <div className="text-[10px] text-slate-500 uppercase flex items-center gap-1.5 font-bold">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>Account Status</span>
              </div>
              <div className="font-bold text-emerald-400 truncate">{currentUser.status || 'Approved'}</div>
            </div>
          </div>
        </div>
      )}

      {/* System Settings */}
      <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-6">
        <h3 className="text-sm font-bold text-white flex items-center gap-2 pb-2 border-b border-slate-800">
          <Cpu className="w-4 h-4 text-cyan-400" />
          eBPF Kernel & AI Controls
        </h3>
        
        {/* Toggle 1 */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <div className="text-sm font-bold text-white">Automated eBPF Zero-Day Quarantine</div>
            <div className="text-xs text-slate-400">Instantly isolate pods exhibiting memory injection anomalies</div>
          </div>
          <button 
            onClick={() => setAutoQuarantine(!autoQuarantine)}
            className={`w-10 h-6 rounded-full transition-colors relative cursor-pointer ${autoQuarantine ? 'bg-cyan-500' : 'bg-slate-800'}`}
          >
            <div className={`w-4 h-4 rounded-full bg-slate-950 absolute top-1 transition-transform ${autoQuarantine ? 'left-5' : 'left-1'}`} />
          </button>
        </div>

        {/* Toggle 2 */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <div className="text-sm font-bold text-white">Gemini SecOps Real-Time Synthesis</div>
            <div className="text-xs text-slate-400">Enable automatic generative root-cause analysis for Critical alerts</div>
          </div>
          <button 
            onClick={() => setAiAnalysis(!aiAnalysis)}
            className={`w-10 h-6 rounded-full transition-colors relative cursor-pointer ${aiAnalysis ? 'bg-purple-500' : 'bg-slate-800'}`}
          >
            <div className={`w-4 h-4 rounded-full bg-slate-950 absolute top-1 transition-transform ${aiAnalysis ? 'left-5' : 'left-1'}`} />
          </button>
        </div>

        {/* Select */}
        <div className="space-y-2">
          <label className="text-xs text-slate-300 font-bold">eBPF Kernel Ring Buffer Performance Profile</label>
          <select 
            value={ebpfRingMode}
            onChange={(e) => setEbpfRingMode(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
          >
            <option>High Performance (0.5ms inspection SLA)</option>
            <option>Deep Packet Inspection (Comprehensive payload audit)</option>
            <option>Minimal Overhead (&lt;0.1% CPU impact)</option>
          </select>
        </div>

        <button 
          onClick={() => alert('Configuration preferences saved!')}
          className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold rounded-xl text-xs flex items-center gap-2 cursor-pointer transition-all"
        >
          <Save className="w-4 h-4" />
          Save Configuration Changes
        </button>

      </div>
    </div>
  );
};
