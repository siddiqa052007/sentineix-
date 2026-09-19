import React, { useState } from 'react';
import { Bell, Search, X, CheckCircle2, ShieldAlert, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface TopNavProps {
  onOpenNotifications?: () => void;
}

export const TopNav: React.FC<TopNavProps> = () => {
  const { currentUser } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);

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

  // Format current date e.g. "Monday, July 27, 2026"
  const formattedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <header className="py-5 px-6 sm:px-8 border-b border-slate-800/80 bg-[#070b14]/80 sticky top-0 z-30 backdrop-blur-md font-sans flex flex-col md:flex-row md:items-center justify-between gap-4">
      
      {/* Left: Dynamic Time-based Greeting & Subtitle */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-heading flex items-center gap-2">
          <span>{getGreeting()}, {currentUser?.name || 'User'}</span> 👋
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 font-sans flex flex-wrap items-center gap-2">
          <span>{currentUser?.company || 'SentinelX Enterprise SOC'}</span>
          <span>•</span>
          <span className="text-slate-300 font-mono">{currentUser?.email}</span>
          {currentUser?.employeeId && (
            <>
              <span>•</span>
              <span className="text-[#00D4FF] font-mono font-medium">ID: {currentUser.employeeId}</span>
            </>
          )}
        </p>
      </div>

      {/* Right: Date, Notifications, Profile Avatar */}
      <div className="flex items-center gap-4 self-end md:self-center">
        
        {/* Date Display */}
        <div className="hidden sm:block px-3.5 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs font-mono text-slate-300">
          {formattedDate}
        </div>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-300 hover:text-white hover:border-[#00D4FF]/50 transition-all cursor-pointer relative"
            title="Notifications"
          >
            <Bell className="w-4 h-4 text-[#00D4FF]" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-rose-500" />
          </button>

          {/* Notifications Drawer */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-slate-950 border border-slate-800 rounded-2xl p-4 shadow-2xl z-50 text-xs font-sans space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="font-bold text-white uppercase font-mono">Recent Alerts (2)</span>
                <button onClick={() => setShowNotifications(false)} className="text-slate-400 hover:text-white cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2">
                <div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300">
                  <div className="font-bold">Brute Force Attack Detected</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">10:20 AM • Critical Severity</div>
                </div>
                <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-800/60 text-amber-300">
                  <div className="font-bold">SQL Injection Blocked</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">10:46 AM • High Severity</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Profile Avatar */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-800/80">
          <img 
            src={currentUser?.profilePicture || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
            alt={currentUser?.name || 'User'}
            className="w-9 h-9 rounded-xl object-cover border border-[#00D4FF]/40 shadow-[0_0_12px_rgba(0,212,255,0.3)] shrink-0"
          />
          <div className="hidden lg:block text-left">
            <div className="text-xs font-bold text-white leading-tight flex items-center gap-1.5">
              <span>{currentUser?.name || 'Security Analyst'}</span>
              {currentUser?.role === 'Super Admin' && (
                <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
              )}
            </div>
            <div className="text-[10px] text-slate-400 font-mono">{currentUser?.role || 'Security Analyst'}</div>
          </div>
        </div>

      </div>

    </header>
  );
};


