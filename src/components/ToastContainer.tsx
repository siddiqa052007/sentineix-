import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertTriangle, Info, X, ShieldAlert } from 'lucide-react';
import { useThreats } from '../context/ThreatContext';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useThreats();

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-md w-full pointer-events-none font-sans">
      <AnimatePresence>
        {toasts.map((toast) => {
          const isSuccess = toast.type === 'success' || !toast.type;
          const isWarning = toast.type === 'warning';
          const isError = toast.type === 'error';

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className={`pointer-events-auto p-4 rounded-2xl border shadow-2xl backdrop-blur-xl flex items-start gap-3 text-xs ${
                isSuccess
                  ? 'bg-slate-950/95 border-emerald-500/50 text-emerald-300 shadow-[0_0_25px_rgba(16,185,129,0.2)]'
                  : isWarning
                  ? 'bg-slate-950/95 border-amber-500/50 text-amber-300 shadow-[0_0_25px_rgba(245,158,11,0.2)]'
                  : isError
                  ? 'bg-slate-950/95 border-rose-500/50 text-rose-300 shadow-[0_0_25px_rgba(244,63,94,0.2)]'
                  : 'bg-slate-950/95 border-cyan-500/50 text-[#00D4FF] shadow-[0_0_25px_rgba(0,212,255,0.2)]'
              }`}
            >
              <div className="p-1.5 rounded-xl bg-slate-900 border border-slate-800 shrink-0 mt-0.5">
                {isSuccess && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                {isWarning && <AlertTriangle className="w-4 h-4 text-amber-400" />}
                {isError && <ShieldAlert className="w-4 h-4 text-rose-400" />}
                {!isSuccess && !isWarning && !isError && <Info className="w-4 h-4 text-[#00D4FF]" />}
              </div>

              <div className="flex-1 min-w-0 pr-1">
                <div className="font-bold text-white text-xs mb-0.5 flex items-center justify-between">
                  <span>Incident Response Alert</span>
                  <span className="font-mono text-[10px] text-slate-400 font-normal">{toast.timestamp}</span>
                </div>
                <p className="text-slate-200 text-xs leading-relaxed font-sans">{toast.message}</p>
              </div>

              <button
                onClick={() => removeToast(toast.id)}
                className="text-slate-500 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
