import React, { useState } from 'react';
import { Shield, Cpu, Activity, ChevronRight, Menu, X, Lock, Terminal, Sparkles } from 'lucide-react';

interface NavbarProps {
  onLaunchConsole?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onLaunchConsole }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#070b14]/80 backdrop-blur-md border-b border-cyan-500/10 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/40 glow-box-cyan">
              <Shield className="w-5 h-5 text-cyan-400" />
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl tracking-wider text-white font-mono">
                  SENTINEL<span className="text-cyan-400">X</span>
                </span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-500/30">
                  AI IDS v4
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono tracking-tight">AUTONOMOUS THREAT SHIELD</p>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#features" className="hover:text-cyan-400 transition-colors">Engine Capabilities</a>
            <a href="#radar" className="hover:text-cyan-400 transition-colors flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
              </span>
              Live Threat Mesh
            </a>
            <a href="#simulator" className="hover:text-cyan-400 transition-colors">Attack Sandbox</a>
            <a href="#benchmark" className="hover:text-cyan-400 transition-colors">Benchmark</a>
            <a href="#pricing" className="hover:text-cyan-400 transition-colors">Enterprise</a>
          </div>

          {/* Right Action CTA Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <a 
              href="#simulator" 
              className="text-xs font-mono font-medium text-slate-300 hover:text-white px-3 py-2 rounded-lg hover:bg-slate-800/60 border border-transparent hover:border-slate-700 transition-all flex items-center gap-1.5"
            >
              <Terminal className="w-3.5 h-3.5 text-cyan-400" />
              Interactive Demo
            </a>
            <button
              onClick={onLaunchConsole}
              className="relative inline-flex items-center gap-2 px-4 py-2 text-xs font-mono font-bold tracking-wide uppercase text-slate-900 bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 rounded-lg shadow-[0_0_20px_rgba(0,240,255,0.4)] hover:shadow-[0_0_30px_rgba(0,240,255,0.7)] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 fill-slate-900" />
              <span>Launch Console</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0a0f1d] border-b border-cyan-500/20 px-4 pt-2 pb-6 space-y-3">
          <a
            href="#features"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:text-white hover:bg-slate-800/60"
          >
            Engine Capabilities
          </a>
          <a
            href="#radar"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:text-white hover:bg-slate-800/60"
          >
            Live Threat Mesh
          </a>
          <a
            href="#simulator"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:text-white hover:bg-slate-800/60"
          >
            Attack Sandbox
          </a>
          <a
            href="#pricing"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:text-white hover:bg-slate-800/60"
          >
            Enterprise Plans
          </a>
          <div className="pt-2 border-t border-slate-800 flex flex-col gap-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                if (onLaunchConsole) onLaunchConsole();
              }}
              className="w-full py-2.5 px-4 text-center font-mono font-bold text-xs uppercase tracking-wider text-slate-900 bg-cyan-400 rounded-lg shadow-lg"
            >
              Launch Console
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};
