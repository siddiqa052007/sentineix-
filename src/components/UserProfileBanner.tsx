import React from 'react';
import { ShieldCheck, UserCheck, Building, CreditCard, Mail, Shield, CheckCircle2, Award } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const UserProfileBanner: React.FC = () => {
  const { currentUser } = useAuth();

  if (!currentUser) return null;

  // Time-based dynamic greeting (Good Morning / Good Afternoon / Good Evening)
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      return 'Good Morning';
    } else if (hour >= 12 && hour < 17) {
      return 'Good Afternoon';
    } else {
      return 'Good Evening';
    }
  };

  return (
    <div className="glass-card p-5 sm:p-6 rounded-3xl border border-cyan-500/30 bg-gradient-to-r from-slate-950/90 via-[#0a1020]/90 to-slate-950/90 backdrop-blur-2xl shadow-[0_0_40px_rgba(0,212,255,0.12)] relative overflow-hidden font-sans">
      
      {/* Top Subtle Cyan Gradient Line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#00D4FF] to-transparent opacity-80" />

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
        
        {/* Left: User Avatar & Main Info */}
        <div className="flex items-start sm:items-center gap-4 sm:gap-5">
          <div className="relative shrink-0">
            <img 
              src={currentUser.profilePicture || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'} 
              alt={currentUser.name} 
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-[#00D4FF] shadow-[0_0_20px_rgba(0,212,255,0.3)]"
            />
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-slate-950 flex items-center justify-center shadow-[0_0_8px_#10b981]">
              <CheckCircle2 className="w-3.5 h-3.5 text-slate-950 stroke-[3]" />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="text-xs font-mono text-[#00D4FF] uppercase tracking-wider font-bold">
              {getGreeting()}, Welcome Back 👋
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight font-heading">
                {currentUser.name}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-950/90 border border-emerald-500/50 text-emerald-400 font-mono text-[10px] font-bold flex items-center gap-1 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>{currentUser.status || 'Approved'}</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-950/90 border border-cyan-500/50 text-cyan-300 font-mono text-[10px] font-bold flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-cyan-400" />
                <span>{currentUser.role}</span>
              </span>
            </div>

            <p className="text-xs text-slate-300 font-mono flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="flex items-center gap-1 text-slate-200">
                <Mail className="w-3.5 h-3.5 text-[#00D4FF]" />
                <span>{currentUser.email}</span>
              </span>
              <span className="text-slate-600 hidden sm:inline">•</span>
              <span className="flex items-center gap-1 text-slate-200">
                <Building className="w-3.5 h-3.5 text-[#00D4FF]" />
                <span>{currentUser.company || 'Enterprise SOC'}</span>
              </span>
            </p>

            <div className="text-[11px] text-slate-400 font-mono flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-slate-300 font-bold">
                ID: {currentUser.employeeId || 'EMP-2026'}
              </span>
              <span>•</span>
              <span className="text-slate-400">Authenticated SOC Session Active</span>
            </div>
          </div>
        </div>

        {/* Right: Quick Stats or Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono text-xs pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-800">
          
          <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-800/80 space-y-0.5">
            <div className="text-[10px] text-slate-500 font-bold uppercase flex items-center gap-1">
              <Building className="w-3 h-3 text-cyan-400" />
              <span>Company</span>
            </div>
            <div className="font-bold text-white text-xs truncate">{currentUser.company || 'Enterprise SOC'}</div>
          </div>

          <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-800/80 space-y-0.5">
            <div className="text-[10px] text-slate-500 font-bold uppercase flex items-center gap-1">
              <CreditCard className="w-3 h-3 text-cyan-400" />
              <span>Employee ID</span>
            </div>
            <div className="font-bold text-white text-xs truncate">{currentUser.employeeId || 'EMP-2026'}</div>
          </div>

          <div className="col-span-2 sm:col-span-1 bg-slate-900/80 p-3 rounded-2xl border border-slate-800/80 space-y-0.5">
            <div className="text-[10px] text-slate-500 font-bold uppercase flex items-center gap-1">
              <Award className="w-3 h-3 text-purple-400" />
              <span>Access Level</span>
            </div>
            <div className="font-bold text-purple-300 text-xs truncate">{currentUser.role}</div>
          </div>

        </div>

      </div>

    </div>
  );
};
