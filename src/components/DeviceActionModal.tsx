import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  ShieldAlert, 
  CheckCircle2, 
  Lock, 
  Unlock, 
  RefreshCw, 
  Loader2, 
  AlertTriangle,
  Server,
  ShieldCheck,
  Check
} from 'lucide-react';
import { useThreats } from '../context/ThreatContext';
import { Device } from '../types';

interface DeviceActionModalProps {
  device: Device | null;
  action: 'scan' | 'quarantine' | 'release' | null;
  onClose: () => void;
  onPostScanReleaseReady?: () => void;
}

export const DeviceActionModal: React.FC<DeviceActionModalProps> = ({
  device,
  action,
  onClose,
  onPostScanReleaseReady
}) => {
  const { 
    quarantineDeviceById, 
    releaseDevice, 
    setDeviceStatus, 
    addDeviceLog, 
    markDeviceScannedPostQuarantine,
    addToast,
    threats
  } = useThreats();

  // Scan states
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStepMessage, setScanStepMessage] = useState('');
  const [scanFinished, setScanFinished] = useState(false);
  const [scanOutcome, setScanOutcome] = useState<'safe' | 'threat_found' | null>(null);

  // Release sub-step state: 'recommend_scan' | 'confirm_release'
  const [releaseStep, setReleaseStep] = useState<'recommend_scan' | 'confirm_release'>('confirm_release');

  // Sync action and device state
  useEffect(() => {
    if (!device) return;

    if (action === 'release') {
      if (!device.scannedPostQuarantine) {
        setReleaseStep('recommend_scan');
      } else {
        setReleaseStep('confirm_release');
      }
    } else if (action === 'scan') {
      startScanProcess();
    }
  }, [action, device?.deviceId]);

  if (!device || !action) return null;

  // Start the 3-5s security scan animation
  function startScanProcess() {
    setIsScanning(true);
    setScanFinished(false);
    setScanProgress(0);
    setScanOutcome(null);

    // Initial log entry
    addDeviceLog(
      device!.deviceId,
      'Manual Scan Started',
      'Security scan initiated by SecOps Operator.',
      'INFO',
      'Security Scans'
    );

    const steps = [
      { pct: 15, msg: 'Initializing scan...' },
      { pct: 35, msg: 'Checking running processes...' },
      { pct: 60, msg: 'Inspecting network activity...' },
      { pct: 85, msg: 'Verifying security policies...' },
      { pct: 100, msg: 'Finalizing...' }
    ];

    let current = 0;
    setScanStepMessage(steps[0].msg);
    setScanProgress(steps[0].pct);

    const interval = setInterval(() => {
      current += 1;
      if (current < steps.length) {
        setScanStepMessage(steps[current].msg);
        setScanProgress(steps[current].pct);
      } else {
        clearInterval(interval);
        setIsScanning(false);
        setScanFinished(true);

        // Determine outcome
        const devThreats = threats.filter(t => 
          t.deviceId === device!.deviceId || 
          (t.deviceName && t.deviceName.toLowerCase() === device!.hostname.toLowerCase())
        );
        const hasActiveThreats = devThreats.some(t => t.status === 'Active' || t.status === 'Under Investigation');

        if (device!.status === 'Quarantined') {
          // Post-quarantine scan is clean
          markDeviceScannedPostQuarantine(device!.deviceId, true);
          setScanOutcome('safe');
          addDeviceLog(
            device!.deviceId,
            'Security Scan Completed',
            'Endpoint verified clean during post-quarantine inspection.',
            'INFO',
            'Security Scans'
          );
          addToast('Security scan completed successfully. Device is clean and ready for release.', 'success');
        } else if (hasActiveThreats || device!.status === 'Warning' || device!.status === 'At Risk') {
          // Threat outcome
          setScanOutcome('threat_found');
          setDeviceStatus(device!.deviceId, 'At Risk', 'High');
          addDeviceLog(
            device!.deviceId,
            'Threat Detected',
            'Suspicious activity detected during security scan. Device set to At Risk.',
            'WARNING',
            'Security Scans'
          );
          addToast('Potential security threat detected.', 'warning');
        } else {
          // Safe outcome for Healthy device
          setScanOutcome('safe');
          addDeviceLog(
            device!.deviceId,
            'Security Scan Completed',
            'No active threats detected. System binaries and sockets clean.',
            'INFO',
            'Security Scans'
          );
          addToast('Security scan completed successfully. No threats found.', 'success');
        }
      }
    }, 700);
  }

  // Handle quarantine confirmation
  const handleConfirmQuarantine = () => {
    quarantineDeviceById(device.deviceId);
    onClose();
  };

  // Handle release confirmation
  const handleConfirmRelease = () => {
    releaseDevice(device.deviceId);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-lg bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5 font-sans relative"
        >
          {/* Close button if not scanning */}
          {!isScanning && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          {/* ==================== SCAN ACTION ==================== */}
          {action === 'scan' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-cyan-950/80 border border-cyan-500/40 text-[#00D4FF]">
                  <RefreshCw className={`w-6 h-6 ${isScanning ? 'animate-spin' : ''}`} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Security Scan in Progress</h3>
                  <p className="text-xs text-slate-400 font-mono">
                    Endpoint: <span className="text-cyan-300 font-bold">{device.hostname}</span> ({device.deviceId})
                  </p>
                </div>
              </div>

              {/* Progress animation during scan */}
              {isScanning && (
                <div className="p-4 rounded-xl bg-slate-900 border border-cyan-500/30 space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-cyan-300 flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                      <span>{scanStepMessage}</span>
                    </span>
                    <span className="text-cyan-400 font-bold">{scanProgress}%</span>
                  </div>

                  <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                    <motion.div
                      className="h-full bg-gradient-to-r from-cyan-500 to-[#00D4FF] shadow-[0_0_12px_#00D4FF]"
                      initial={{ width: '0%' }}
                      animate={{ width: `${scanProgress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>

                  <p className="text-[11px] text-slate-500 font-mono text-center pt-1">
                    Please wait while SentinelX inspects kernel processes and network sockets...
                  </p>
                </div>
              )}

              {/* Scan Finished Outcome */}
              {scanFinished && (
                <div className="space-y-4">
                  {scanOutcome === 'safe' ? (
                    <div className="p-4 rounded-xl bg-emerald-950/50 border border-emerald-500/40 text-emerald-300 space-y-2">
                      <div className="flex items-center gap-2 font-bold text-sm text-emerald-400 font-mono">
                        <CheckCircle2 className="w-5 h-5 shrink-0" />
                        <span>✅ No active threats detected.</span>
                      </div>
                      <p className="text-xs text-slate-300 font-sans">
                        All kernel memory buffers, running processes, and eBPF network sockets on <strong>{device.hostname}</strong> are clean and verified safe.
                      </p>
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-rose-950/50 border border-rose-500/40 text-rose-300 space-y-2">
                      <div className="flex items-center gap-2 font-bold text-sm text-rose-400 font-mono">
                        <AlertTriangle className="w-5 h-5 shrink-0" />
                        <span>⚠ Suspicious activity detected.</span>
                      </div>
                      <p className="text-xs text-slate-300 font-sans">
                        Anomalous network signatures detected on <strong>{device.hostname}</strong>. Device status has been automatically set to <strong>At Risk</strong>.
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-2 pt-2">
                    {device.status === 'Quarantined' && scanOutcome === 'safe' && (
                      <button
                        onClick={() => {
                          onClose();
                          if (onPostScanReleaseReady) onPostScanReleaseReady();
                        }}
                        className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <Unlock className="w-4 h-4" />
                        <span>Proceed to Release</span>
                      </button>
                    )}
                    <button
                      onClick={onClose}
                      className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-mono font-bold text-slate-200 transition-all cursor-pointer"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ==================== QUARANTINE ACTION ==================== */}
          {action === 'quarantine' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-rose-950/80 border border-rose-500/40 text-rose-400">
                  <Lock className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Quarantine Device</h3>
                  <p className="text-xs text-slate-400 font-mono">
                    Target Endpoint: <span className="text-rose-300 font-bold">{device.hostname}</span> ({device.deviceId})
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-800/60 text-xs text-slate-300 leading-relaxed font-sans space-y-2">
                <p>
                  This device has suspicious activity. Quarantining will isolate it from the enterprise network to prevent threat propagation.
                </p>
                <div className="pt-2 border-t border-rose-900/40 text-[11px] font-mono text-rose-300/90 flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <span>Subnet ingress/egress ports will be immediately blocked via eBPF.</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2 font-mono text-xs">
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmQuarantine}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold transition-all cursor-pointer shadow-[0_0_15px_rgba(225,29,72,0.4)] flex items-center gap-1.5"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Quarantine</span>
                </button>
              </div>
            </div>
          )}

          {/* ==================== RELEASE ACTION ==================== */}
          {action === 'release' && (
            <div className="space-y-4">
              {releaseStep === 'recommend_scan' ? (
                /* Step 1: Scan Recommended Warning Dialog */
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-amber-950/80 border border-amber-500/40 text-amber-400">
                      <AlertTriangle className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">Scan Recommended Before Release</h3>
                      <p className="text-xs text-slate-400 font-mono">
                        Device: <span className="text-amber-300 font-bold">{device.hostname}</span>
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-800/60 text-xs text-slate-300 leading-relaxed font-sans">
                    This device has not been scanned after quarantine. It is recommended to perform a security scan before reconnecting it.
                  </div>

                  <div className="flex flex-wrap items-center justify-end gap-2 pt-2 font-mono text-xs">
                    <button
                      onClick={onClose}
                      className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => setReleaseStep('confirm_release')}
                      className="px-3.5 py-2 rounded-xl bg-amber-950 hover:bg-amber-900 border border-amber-700 text-amber-300 transition-all cursor-pointer"
                    >
                      Release Anyway
                    </button>
                    <button
                      onClick={startScanProcess}
                      className="px-4 py-2 rounded-xl bg-[#00D4FF] hover:bg-cyan-400 text-slate-950 font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-[0_0_15px_rgba(0,212,255,0.4)]"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Run Scan</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Step 2: Final Release Confirmation Dialog */
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-400">
                      <Unlock className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">Release Device</h3>
                      <p className="text-xs text-slate-400 font-mono">
                        Endpoint: <span className="text-emerald-300 font-bold">{device.hostname}</span> ({device.deviceId})
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-800/60 text-xs text-slate-300 leading-relaxed font-sans">
                    This will reconnect the device to the enterprise network.
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2 font-mono text-xs">
                    <button
                      onClick={onClose}
                      className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleConfirmRelease}
                      className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition-all cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.4)] flex items-center gap-1.5"
                    >
                      <Unlock className="w-3.5 h-3.5" />
                      <span>Release</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
