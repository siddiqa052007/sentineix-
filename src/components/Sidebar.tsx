import React, { useState } from 'react';
import { 
  Shield, 
  LayoutDashboard, 
  Radio, 
  Activity, 
  FileText, 
  Bot, 
  Settings, 
  LogOut, 
  ChevronLeft,
  ChevronRight,
  Globe,
  Monitor,
  ShieldCheck,
  ShieldAlert
} from 'lucide-react';
import { useThreats } from '../context/ThreatContext';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  onReturnToHome: () => void;
  engineActive?: boolean;
  setEngineActive?: (active: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  onReturnToHome
}) => {
  const { activeTab, setActiveTab, activeThreatsCount } = useThreats();
  const { currentUser, logout, users } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const pendingApprovalsCount = users.filter(u => u.status === 'Pending').length;

  const navItems = [
    ...(currentUser?.role === 'Super Admin' ? [{
      id: 'super-admin',
      label: 'Super Admin',
      icon: ShieldCheck,
      badge: pendingApprovalsCount > 0 ? `${pendingApprovalsCount} Pending` : 'Admin',
      isAdmin: true
    }] : []),
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'threats', label: 'Threat Monitor', icon: Radio, badge: activeThreatsCount > 0 ? `${activeThreatsCount} Active` : undefined },
    { id: 'connected-devices', label: 'Connected Devices', icon: Monitor },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'ai-assistant', label: 'AI Assistant', icon: Bot, isAi: true },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleLogout = () => {
    logout();
    onReturnToHome();
  };

  return (
    <aside className={`${isCollapsed ? 'w-20' : 'w-64'} bg-[#070b14]/95 border-r border-slate-800/80 flex flex-col justify-between h-screen shrink-0 z-40 select-none backdrop-blur-xl transition-all duration-300 font-sans overflow-y-auto`}>
      <div>
        {/* Brand Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800/80 flex items-center justify-between">
          <div 
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-3 cursor-pointer group overflow-hidden"
          >
            <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-[#00D4FF]/20 to-blue-600/20 border border-[#00D4FF]/40 shadow-[0_0_15px_rgba(0,212,255,0.25)] group-hover:border-[#00D4FF] transition-all shrink-0">
              <Shield className="w-5 h-5 text-[#00D4FF]" />
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            {!isCollapsed && (
              <div className="overflow-hidden">
                <span className="font-extrabold text-lg tracking-wider text-white font-mono">
                  SENTINEL<span className="text-[#00D4FF]">X</span>
                </span>
                <p className="text-[10px] text-slate-400 font-mono tracking-tight uppercase">Security Platform</p>
              </div>
            )}
          </div>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors cursor-pointer"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Global Node Indicator */}
        {!isCollapsed && (
          <div className="p-2.5 mx-3 mt-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-mono flex items-center justify-between">
            <div className="flex items-center gap-2 overflow-hidden">
              <Globe className="w-3.5 h-3.5 text-[#00D4FF] shrink-0" />
              <span className="text-slate-300 truncate text-[11px]">{currentUser?.company || 'SentinelX Corp'}</span>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
          </div>
        )}

        {/* Navigation Items */}
        <nav className="p-3 space-y-1.5 mt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                title={isCollapsed ? item.label : undefined}
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 flex items-center justify-between cursor-pointer group relative ${
                  isActive
                    ? item.isAdmin
                      ? 'bg-gradient-to-r from-purple-950/90 to-slate-950/60 text-purple-300 border border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.2)] font-bold'
                      : 'bg-gradient-to-r from-cyan-950/80 to-blue-950/40 text-[#00D4FF] border border-[#00D4FF]/50 shadow-[0_0_15px_rgba(0,212,255,0.15)] font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
                }`}
              >
                {isActive && (
                  <div 
                    className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full ${
                      item.isAdmin ? 'bg-purple-400 shadow-[0_0_8px_#a855f7]' : 'bg-[#00D4FF] shadow-[0_0_8px_#00D4FF]'
                    }`}
                  />
                )}
                
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 shrink-0 ${
                    isActive ? (item.isAdmin ? 'text-purple-400' : 'text-[#00D4FF]') : item.isAi ? 'text-purple-400' : item.isAdmin ? 'text-purple-400' : 'text-slate-400 group-hover:text-slate-200'
                  }`} />
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </div>

                {!isCollapsed && item.badge && (
                  <span className={`px-2 py-0.5 text-[9px] font-mono font-bold rounded-full uppercase tracking-wider ${
                    item.isAdmin 
                      ? pendingApprovalsCount > 0 
                        ? 'bg-amber-500 text-slate-950 font-black' 
                        : 'bg-purple-950 text-purple-300 border border-purple-800'
                      : 'bg-rose-950 text-rose-400 border border-rose-800'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Logout & Admin Footer */}
      <div className="p-3 border-t border-slate-800/80 space-y-2">
        <button 
          onClick={handleLogout}
          className={`w-full p-2.5 rounded-xl text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 border border-transparent hover:border-rose-900/50 transition-all flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} cursor-pointer`}
          title="Logout"
        >
          <div className="flex items-center gap-3">
            <LogOut className="w-4 h-4 text-slate-400 group-hover:text-rose-400" />
            {!isCollapsed && <span>Logout</span>}
          </div>
        </button>

        {!isCollapsed && (
          <div className="flex items-center gap-2 pt-2 border-t border-slate-800/60 text-xs">
            <img 
              src={currentUser?.profilePicture || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
              alt={currentUser?.name || 'User'}
              className="w-8 h-8 rounded-xl object-cover border border-[#00D4FF]/40 shrink-0"
            />
            <div className="overflow-hidden">
              <div className="text-slate-200 font-bold text-[11px] truncate">{currentUser?.name || 'User Profile'}</div>
              <div className="text-slate-400 text-[9px] truncate font-mono">{currentUser?.email}</div>
              {currentUser?.employeeId && (
                <div className="text-[#00D4FF] text-[9px] truncate font-mono font-bold">ID: {currentUser.employeeId}</div>
              )}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

