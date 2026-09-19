import React, { createContext, useContext, useState, useEffect } from 'react';
import initialDevicesData from '../data/devices.json';
import initialThreatsData from '../data/threats.json';
import initialAlertsData from '../data/alerts.json';
import initialReportsData from '../data/reports.json';
import initialBlockedIpsData from '../data/blockedIps.json';
import { Device, ThreatDetails, AlertItem, ReportItem, BlockedIpItem, ToastNotification } from '../types';

export interface CopilotContextData {
  type: 'threat' | 'device' | 'report' | 'global';
  id?: string;
  title?: string;
  data?: any;
}

interface ThreatContextType {
  // Centralized State
  devices: Device[];
  threats: ThreatDetails[];
  alerts: AlertItem[];
  reports: ReportItem[];
  blockedIps: BlockedIpItem[];
  toasts: ToastNotification[];
  activeTab: string;
  setActiveTab: (tab: string) => void;

  // Copilot Context
  copilotContext: CopilotContextData;
  setCopilotContext: (ctx: CopilotContextData) => void;
  askAiAboutThreat: (threat: ThreatDetails) => void;
  askAiAboutDevice: (device: Device) => void;
  askAiAboutReport: (report: ReportItem) => void;
  scanDevice: (deviceId: string) => void;

  // Drawer & Filter States
  isSecurityOverviewOpen: boolean;
  setIsSecurityOverviewOpen: (open: boolean) => void;
  threatFilter: { status?: string; search?: string };
  setThreatFilter: (filter: { status?: string; search?: string }) => void;
  isAiAnalysisOpen: boolean;
  setIsAiAnalysisOpen: (open: boolean) => void;
  selectedAiInsight: any | null;
  setSelectedAiInsight: (insight: any | null) => void;

  // Actions
  addToast: (message: string, type?: ToastNotification['type']) => void;
  removeToast: (id: string) => void;
  
  blockIp: (threatId: string, customIp?: string, reason?: string) => void;
  quarantineDevice: (threatId: string, deviceTarget?: string) => void;
  quarantineDeviceById: (deviceId: string) => void;
  releaseDevice: (deviceId: string) => void;
  setDeviceStatus: (deviceId: string, status: 'Healthy' | 'Warning' | 'At Risk' | 'Quarantined' | 'Offline', riskLevel?: 'Low' | 'Medium' | 'High' | 'Critical') => void;
  addDeviceLog: (deviceId: string, title: string, details?: string, level?: 'INFO' | 'NOTICE' | 'WARNING' | 'CRITICAL' | 'ALERT', category?: string, user?: string) => void;
  markDeviceScannedPostQuarantine: (deviceId: string, value: boolean) => void;
  refreshDevices: () => void;
  notifySecurityTeam: (threatId: string) => void;
  resolveThreat: (threatId: string, resolvedBy?: string, method?: string) => void;
  archiveThreat: (threatId: string) => void;
  deleteThreat: (threatId: string) => void;
  
  updateThreatAiAnalysis: (id: string, aiAnalysis: ThreatDetails['aiAnalysis']) => void;
  toggleAction: (threatId: string, actionId: string) => void;
  markAlertRead: (alertId: string) => void;
  addReport: (report: ReportItem) => void;
  deleteReport: (reportId: string) => void;

  // Calculated Metrics
  connectedDevicesCount: number;
  totalDevicesCount: number;
  healthyDevicesCount: number;
  quarantinedDevicesCount: number;
  warningDevicesCount: number;
  offlineDevicesCount: number;
  criticalRiskDevicesCount: number;
  highRiskDevicesCount: number;
  mediumRiskDevicesCount: number;
  lowRiskDevicesCount: number;
  
  activeThreatsCount: number;
  criticalThreatsCount: number;
  devicesAtRiskCount: number;
  resolvedThreatsCount: number;
  blockedAttacksCount: number;
  securityScore: number;
}

const ThreatContext = createContext<ThreatContextType | undefined>(undefined);

export const ThreatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Devices State
  const [devices, setDevices] = useState<Device[]>(() => {
    const saved = localStorage.getItem('sentinelx_devices_v9');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error("Error loading devices", e); }
    }
    return initialDevicesData as Device[];
  });

  // 2. Threats State
  const [threats, setThreats] = useState<ThreatDetails[]>(() => {
    const saved = localStorage.getItem('sentinelx_threats_v9');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error("Error loading threats", e); }
    }
    return initialThreatsData as ThreatDetails[];
  });

  // 3. Alerts State
  const [alerts, setAlerts] = useState<AlertItem[]>(() => {
    const saved = localStorage.getItem('sentinelx_alerts_v9');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error("Error loading alerts", e); }
    }
    return initialAlertsData as AlertItem[];
  });

  // 4. Reports State
  const [reports, setReports] = useState<ReportItem[]>(() => {
    const saved = localStorage.getItem('sentinelx_reports_v9');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error("Error loading reports", e); }
    }
    return initialReportsData as ReportItem[];
  });

  // 5. Blocked IPs State
  const [blockedIps, setBlockedIps] = useState<BlockedIpItem[]>(() => {
    const saved = localStorage.getItem('sentinelx_blocked_ips_v9');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error("Error loading blocked IPs", e); }
    }
    return initialBlockedIpsData as BlockedIpItem[];
  });

  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Copilot Context State
  const [copilotContext, setCopilotContext] = useState<CopilotContextData>({
    type: 'global',
    title: 'Enterprise SOC Telemetry'
  });

  // Drawer & Filter States
  const [isSecurityOverviewOpen, setIsSecurityOverviewOpen] = useState<boolean>(false);
  const [threatFilter, setThreatFilter] = useState<{ status?: string; search?: string }>({});
  const [isAiAnalysisOpen, setIsAiAnalysisOpen] = useState<boolean>(false);
  const [selectedAiInsight, setSelectedAiInsight] = useState<any | null>(null);

  const askAiAboutThreat = (threat: ThreatDetails) => {
    setCopilotContext({
      type: 'threat',
      id: threat.id,
      title: `${threat.id} - ${threat.title}`,
      data: threat
    });
    setActiveTab('ai-assistant');
    addToast(`🤖 Loaded incident ${threat.id} into AI Security Copilot.`, 'info');
  };

  const askAiAboutDevice = (device: Device) => {
    setCopilotContext({
      type: 'device',
      id: device.deviceId,
      title: `${device.hostname} (${device.department})`,
      data: device
    });
    setActiveTab('ai-assistant');
    addToast(`🤖 Loaded device ${device.hostname} into AI Security Copilot.`, 'info');
  };

  const askAiAboutReport = (report: ReportItem) => {
    setCopilotContext({
      type: 'report',
      id: report.id,
      title: `Report: ${report.threatName}`,
      data: report
    });
    setActiveTab('ai-assistant');
    addToast(`🤖 Loaded report ${report.id} into AI Security Copilot.`, 'info');
  };

  const scanDevice = (deviceId: string) => {
    addDeviceLog(deviceId, 'Initiated Deep Security Scan', 'Triggered full disk & socket process scan via SOC Agent.', 'INFO', 'Security Scan', 'SecOps AI');
    addToast(`Initiated deep security scan on device ${deviceId}.`, 'info');
  };

  // Persistence Effects
  useEffect(() => {
    localStorage.setItem('sentinelx_devices_v9', JSON.stringify(devices));
  }, [devices]);

  useEffect(() => {
    localStorage.setItem('sentinelx_threats_v9', JSON.stringify(threats));
  }, [threats]);

  useEffect(() => {
    localStorage.setItem('sentinelx_alerts_v9', JSON.stringify(alerts));
  }, [alerts]);

  useEffect(() => {
    localStorage.setItem('sentinelx_reports_v9', JSON.stringify(reports));
  }, [reports]);

  useEffect(() => {
    localStorage.setItem('sentinelx_blocked_ips_v9', JSON.stringify(blockedIps));
  }, [blockedIps]);

  // Toast Notification System
  const addToast = (message: string, type: ToastNotification['type'] = 'info') => {
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
    const newToast: ToastNotification = { id, message, type, timestamp: nowStr };
    
    setToasts(prev => [newToast, ...prev].slice(0, 5));

    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const getFormattedTimestamp = () => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateStr = now.toLocaleDateString([], { month: 'short', day: 'numeric' });
    return { timeStr, timestamp: `${timeStr}, ${dateStr}` };
  };

  // STEP 5: INCIDENT RESPONSE ACTIONS

  // Action 1: Block Source IP
  const blockIp = (threatId: string, customIp?: string, reason?: string) => {
    const { timeStr, timestamp } = getFormattedTimestamp();

    let targetIp = customIp;
    let threatTitle = 'Unknown Threat';

    setThreats(prev =>
      prev.map(t => {
        if (t.id === threatId) {
          targetIp = targetIp || t.sourceIp;
          threatTitle = t.title;
          const defaultReason = reason || `Automated ingress block triggered for IP ${targetIp}`;
          const newStatus = (t.status === 'Active' || t.status === 'Under Investigation') ? 'Action Taken' : t.status;
          
          const newTimelineItem = {
            time: timeStr,
            title: 'Source IP Blocked',
            desc: `Ingress firewall rule executed at eBPF layer. IP ${targetIp} blackholed.`,
            statusTag: 'BLOCKED'
          };

          return {
            ...t,
            blocked: true,
            blockedAt: timestamp,
            blockedReason: defaultReason,
            status: newStatus as ThreatDetails['status'],
            timeline: [...t.timeline, newTimelineItem]
          };
        }
        return t;
      })
    );

    if (targetIp) {
      setBlockedIps(prev => {
        if (prev.some(item => item.ip === targetIp)) return prev;
        return [
          {
            ip: targetIp!,
            blockedAt: timestamp,
            reason: reason || `Blocked during incident response for ${threatTitle}`,
            threatId
          },
          ...prev
        ];
      });
    }

    addToast(`Source IP ${targetIp || ''} successfully blocked at ingress firewall.`, 'success');
  };

  // Action 2: Quarantine Device
  const quarantineDevice = (threatId: string, deviceTarget?: string) => {
    const { timeStr, timestamp } = getFormattedTimestamp();

    let foundDeviceId: string | undefined;
    let foundTargetName: string | undefined;

    setThreats(prev =>
      prev.map(t => {
        if (t.id === threatId) {
          foundDeviceId = t.deviceId;
          foundTargetName = deviceTarget || t.deviceName || t.destination;
          const newStatus = (t.status === 'Active' || t.status === 'Under Investigation') ? 'Action Taken' : t.status;

          const newTimelineItem = {
            time: timeStr,
            title: 'Device Quarantined',
            desc: `Endpoint ${foundTargetName} isolated from local network subnet.`,
            statusTag: 'ISOLATED'
          };

          return {
            ...t,
            quarantined: true,
            quarantinedAt: timestamp,
            deviceName: foundTargetName,
            deviceStatus: 'Quarantined' as const,
            status: newStatus as ThreatDetails['status'],
            timeline: [...t.timeline, newTimelineItem]
          };
        }
        return t;
      })
    );

    // Update Device Status in Devices list (Healthy -> Quarantined)
    setDevices(prev =>
      prev.map(d => {
        const matchesId = foundDeviceId && d.deviceId === foundDeviceId;
        const matchesName = foundTargetName && (d.hostname.toLowerCase().includes(foundTargetName.toLowerCase()) || foundTargetName.toLowerCase().includes(d.hostname.toLowerCase()));
        
        if (matchesId || matchesName) {
          return {
            ...d,
            status: 'Quarantined',
            riskLevel: 'Critical'
          };
        }
        return d;
      })
    );

    addToast(`Device ${foundTargetName || ''} successfully isolated from network.`, 'warning');
  };

  const addDeviceLog = (
    deviceId: string,
    title: string,
    details: string = '',
    level: 'INFO' | 'NOTICE' | 'WARNING' | 'CRITICAL' | 'ALERT' = 'INFO',
    category: string = 'Security Scans',
    user: string = 'secops-admin'
  ) => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newLogItem = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      time: timeStr,
      title,
      details,
      level,
      category,
      user
    };

    setDevices(prev =>
      prev.map(d => {
        if (d.deviceId === deviceId) {
          const existingLogs = d.logs || [];
          return {
            ...d,
            logs: [newLogItem, ...existingLogs]
          };
        }
        return d;
      })
    );
  };

  const setDeviceStatus = (
    deviceId: string,
    status: 'Healthy' | 'Warning' | 'At Risk' | 'Quarantined' | 'Offline',
    riskLevel?: 'Low' | 'Medium' | 'High' | 'Critical'
  ) => {
    setDevices(prev =>
      prev.map(d => {
        if (d.deviceId === deviceId) {
          const newRisk = riskLevel || (
            status === 'Healthy' ? 'Low' : 
            status === 'Quarantined' ? 'Critical' : 
            status === 'At Risk' || status === 'Warning' ? 'High' : d.riskLevel
          );
          return {
            ...d,
            status,
            riskLevel: newRisk
          };
        }
        return d;
      })
    );
  };

  const markDeviceScannedPostQuarantine = (deviceId: string, value: boolean) => {
    setDevices(prev =>
      prev.map(d => (d.deviceId === deviceId ? { ...d, scannedPostQuarantine: value } : d))
    );
  };

  const quarantineDeviceById = (deviceId: string) => {
    const { timeStr, timestamp } = getFormattedTimestamp();
    let targetName = deviceId;

    setDevices(prev =>
      prev.map(d => {
        if (d.deviceId === deviceId) {
          targetName = d.hostname;
          const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          const newLog = {
            id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
            time,
            title: 'Device Quarantined',
            details: 'Endpoint isolated from enterprise network to prevent threat propagation.',
            level: 'CRITICAL' as const,
            category: 'Quarantine Events',
            user: 'secops-admin'
          };
          return {
            ...d,
            status: 'Quarantined' as const,
            riskLevel: 'Critical' as const,
            scannedPostQuarantine: false,
            logs: [newLog, ...(d.logs || [])]
          };
        }
        return d;
      })
    );

    setThreats(prev =>
      prev.map(t => {
        if (t.deviceId === deviceId || (t.deviceName && t.deviceName.toLowerCase() === targetName.toLowerCase())) {
          return {
            ...t,
            quarantined: true,
            quarantinedAt: timestamp,
            deviceStatus: 'Quarantined' as const,
            timeline: [
              ...t.timeline,
              {
                time: timeStr,
                title: 'Device Quarantined',
                desc: `Endpoint ${targetName} isolated from local network subnet via EDR action.`,
                statusTag: 'ISOLATED'
              }
            ]
          };
        }
        return t;
      })
    );

    addToast('Device successfully quarantined.', 'warning');
  };

  const releaseDevice = (deviceId: string) => {
    const { timeStr, timestamp } = getFormattedTimestamp();
    let targetName = deviceId;

    setDevices(prev =>
      prev.map(d => {
        if (d.deviceId === deviceId) {
          targetName = d.hostname;
          const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          const newLog = {
            id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
            time,
            title: 'Released From Quarantine',
            details: 'Endpoint reconnected to the enterprise network.',
            level: 'INFO' as const,
            category: 'Quarantine Events',
            user: 'secops-admin'
          };
          return {
            ...d,
            status: 'Healthy' as const,
            riskLevel: 'Low' as const,
            scannedPostQuarantine: false,
            logs: [newLog, ...(d.logs || [])]
          };
        }
        return d;
      })
    );

    setThreats(prev =>
      prev.map(t => {
        if (t.deviceId === deviceId || (t.deviceName && t.deviceName.toLowerCase() === targetName.toLowerCase())) {
          return {
            ...t,
            quarantined: false,
            deviceStatus: 'Connected' as const,
            timeline: [
              ...t.timeline,
              {
                time: timeStr,
                title: 'Device Quarantine Released',
                desc: `Endpoint ${targetName} re-admitted to enterprise network subnet.`,
                statusTag: 'CONNECTED'
              }
            ]
          };
        }
        return t;
      })
    );

    addToast('Device released successfully.', 'success');
  };

  const refreshDevices = () => {
    setDevices(prev =>
      prev.map(d => d.status !== 'Offline' ? { ...d, lastSeen: 'Just now' } : d)
    );
    addToast('🔄 Refreshed all connected endpoint telemetry and eBPF socket states.', 'info');
  };

  // Action 3: Notify Security Team
  const notifySecurityTeam = (threatId: string) => {
    const { timeStr, timestamp } = getFormattedTimestamp();

    setThreats(prev =>
      prev.map(t => {
        if (t.id === threatId) {
          const newStatus = t.status === 'Active' ? 'Under Investigation' : t.status;

          const newTimelineItem = {
            time: timeStr,
            title: 'Security Team Notified',
            desc: `PagerDuty high-priority alert dispatched to Tier-2 SecOps on-call team.`,
            statusTag: 'NOTIFIED'
          };

          return {
            ...t,
            notificationSent: true,
            notificationTime: timestamp,
            investigationStarted: true,
            investigationTime: timestamp,
            status: newStatus as ThreatDetails['status'],
            timeline: [...t.timeline, newTimelineItem]
          };
        }
        return t;
      })
    );

    addToast('Security team has been notified via PagerDuty.', 'info');
  };

  // Action 4: Mark as Resolved
  const resolveThreat = (threatId: string, resolvedBy = 'Admin', method = 'Mitigated via Incident Response Controls') => {
    const { timeStr, timestamp } = getFormattedTimestamp();

    let resolvedThreatObj: ThreatDetails | undefined;

    setThreats(prev =>
      prev.map(t => {
        if (t.id === threatId) {
          const updatedTimeline = [
            ...t.timeline,
            {
              time: timeStr,
              title: 'Threat Resolved',
              desc: `Incident closed & marked as mitigated by ${resolvedBy} at ${timestamp}`,
              statusTag: 'RESOLVED'
            }
          ];
          const updatedActions = t.recommendedActions.map(a => ({ ...a, completed: true }));

          resolvedThreatObj = {
            ...t,
            status: 'Resolved' as const,
            resolved: true,
            resolvedAt: timestamp,
            resolvedBy,
            resolutionMethod: method,
            recommendedActions: updatedActions,
            timeline: updatedTimeline
          };

          return resolvedThreatObj;
        }
        return t;
      })
    );

    // Step 7: Automatically add a record to Report History
    if (resolvedThreatObj) {
      const newReport: ReportItem = {
        id: `REP-${Date.now()}`,
        threatId: resolvedThreatObj.id,
        threatName: resolvedThreatObj.title,
        severity: resolvedThreatObj.severity,
        resolutionTime: timestamp,
        resolvedBy,
        method,
        status: 'Resolved'
      };

      setReports(prev => [newReport, ...prev]);
    }

    addToast(`Threat ${threatId} successfully resolved and archived into SOC Reports.`, 'success');
  };

  // Action 5: Archive Threat
  const archiveThreat = (threatId: string) => {
    const { timeStr, timestamp } = getFormattedTimestamp();

    setThreats(prev =>
      prev.map(t => {
        if (t.id === threatId) {
          return {
            ...t,
            status: 'Archived' as const,
            resolved: true,
            resolvedAt: t.resolvedAt || timestamp,
            timeline: [
              ...t.timeline,
              { time: timeStr, title: 'Threat Archived', desc: `Filed into SOC historical compliance archive.`, statusTag: 'ARCHIVED' }
            ]
          };
        }
        return t;
      })
    );

    addToast('Threat archived into historical audit database.', 'info');
  };

  // Action 6: Delete Threat
  const deleteThreat = (threatId: string) => {
    setThreats(prev => prev.filter(t => t.id !== threatId));
    addToast(`Incident ${threatId} deleted from central dataset.`, 'info');
  };

  const updateThreatAiAnalysis = (id: string, aiAnalysis: ThreatDetails['aiAnalysis']) => {
    setThreats(prev =>
      prev.map(t => (t.id === id ? { ...t, aiAnalysis } : t))
    );
  };

  const toggleAction = (threatId: string, actionId: string) => {
    setThreats(prev =>
      prev.map(t => {
        if (t.id === threatId) {
          return {
            ...t,
            recommendedActions: t.recommendedActions.map(a =>
              a.id === actionId ? { ...a, completed: !a.completed } : a
            )
          };
        }
        return t;
      })
    );
  };

  const markAlertRead = (alertId: string) => {
    setAlerts(prev => prev.map(a => (a.id === alertId ? { ...a, read: true } : a)));
  };

  // STEP 8: SIMULATED REAL-TIME DATA (Every 30 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      // 1. Randomly update Last Seen timestamps for devices
      setDevices(prevDevices => {
        const randomIndex = Math.floor(Math.random() * prevDevices.length);
        return prevDevices.map((dev, idx) => {
          if (idx === randomIndex && dev.status !== 'Offline') {
            return { ...dev, lastSeen: 'Just now' };
          }
          return dev;
        });
      });

      // 2. Randomly generate an alert or update socket pulse (50% chance)
      if (Math.random() > 0.5) {
        const alertTypes = [
          { title: 'eBPF Socket Filter Pulse', severity: 'Low' as const, desc: 'Routine packet inspection check completed across worker nodes.' },
          { title: 'Inbound TLS Handshake Spike', severity: 'Medium' as const, desc: 'Increased SSL negotiation request rate on port 443.' },
          { title: 'Zero-Trust Re-Authentication', severity: 'Low' as const, desc: 'JWT token re-validated for admin session.' },
          { title: 'Ingress Port Scanner Probe', severity: 'Medium' as const, desc: 'SYN packet probe blocked by automated perimeter filter.' }
        ];

        const randomAlertObj = alertTypes[Math.floor(Math.random() * alertTypes.length)];
        const { timeStr } = getFormattedTimestamp();

        const newAlert: AlertItem = {
          id: `ALT-RT-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          title: randomAlertObj.title,
          timestamp: timeStr,
          severity: randomAlertObj.severity,
          source: 'Kernel eBPF Telemetry',
          description: randomAlertObj.desc,
          read: false
        };

        setAlerts(prev => [newAlert, ...prev].slice(0, 15));
      }
    }, 30000); // 30 seconds interval

    return () => clearInterval(interval);
  }, []);

  // STEP 3: CALCULATE METRICS AUTOMATICALLY
  const totalDevicesCount = devices.length;
  const connectedDevicesCount = devices.filter(d => d.status !== 'Offline').length;
  const healthyDevicesCount = devices.filter(d => d.status === 'Healthy').length;
  const quarantinedDevicesCount = devices.filter(d => d.status === 'Quarantined').length;
  const warningDevicesCount = devices.filter(d => d.status === 'Warning' || d.status === 'At Risk').length;
  const offlineDevicesCount = devices.filter(d => d.status === 'Offline').length;
  const criticalRiskDevicesCount = devices.filter(d => d.riskLevel === 'Critical').length;
  const highRiskDevicesCount = devices.filter(d => d.riskLevel === 'High').length;
  const mediumRiskDevicesCount = devices.filter(d => d.riskLevel === 'Medium').length;
  const lowRiskDevicesCount = devices.filter(d => d.riskLevel === 'Low').length;

  const activeThreatsList = threats.filter(t => (t.status === 'Active' || t.status === 'Under Investigation' || t.status === 'Action Taken') && !t.resolved);
  const activeThreatsCount = activeThreatsList.length;

  const criticalThreatsList = activeThreatsList.filter(t => t.severity === 'Critical');
  const criticalThreatsCount = criticalThreatsList.length;

  const devicesAtRiskList = devices.filter(d => 
    (d.riskLevel === 'High' || d.riskLevel === 'Critical' || d.status === 'Warning' || d.status === 'At Risk') && d.status !== 'Quarantined'
  );
  const devicesAtRiskCount = devicesAtRiskList.length;

  const resolvedThreatsCount = threats.filter(t => t.status === 'Resolved' || t.status === 'Archived' || t.resolved).length;
  const blockedAttacksCount = blockedIps.length + threats.filter(t => t.blocked).length;

  // Security score calculation
  const activeCritical = activeThreatsList.filter(t => t.severity === 'Critical').length;
  const activeHigh = activeThreatsList.filter(t => t.severity === 'High').length;
  const activeMedium = activeThreatsList.filter(t => t.severity === 'Medium').length;
  const activeLow = activeThreatsList.filter(t => t.severity === 'Low').length;

  const penalty = (activeCritical * 6) + (activeHigh * 3) + (activeMedium * 1.5) + (activeLow * 0.5) + (quarantinedDevicesCount * 2) + (warningDevicesCount * 1);
  const securityScore = Math.max(60, Math.min(100, Math.round(100 - penalty)));

  const addReport = (report: ReportItem) => {
    setReports(prev => [report, ...prev]);
    addToast(`Security Report ${report.id} generated successfully.`, 'success');
  };

  const deleteReport = (reportId: string) => {
    setReports(prev => prev.filter(r => r.id !== reportId));
    addToast(`Report ${reportId} deleted from SOC repository.`, 'info');
  };

  return (
    <ThreatContext.Provider
      value={{
        devices,
        threats,
        alerts,
        reports,
        blockedIps,
        toasts,
        activeTab,
        setActiveTab,

        copilotContext,
        setCopilotContext,
        askAiAboutThreat,
        askAiAboutDevice,
        askAiAboutReport,
        scanDevice,

        isSecurityOverviewOpen,
        setIsSecurityOverviewOpen,
        threatFilter,
        setThreatFilter,
        isAiAnalysisOpen,
        setIsAiAnalysisOpen,
        selectedAiInsight,
        setSelectedAiInsight,

        addToast,
        removeToast,
        blockIp,
        quarantineDevice,
        quarantineDeviceById,
        releaseDevice,
        setDeviceStatus,
        addDeviceLog,
        markDeviceScannedPostQuarantine,
        refreshDevices,
        notifySecurityTeam,
        resolveThreat,
        archiveThreat,
        deleteThreat,
        updateThreatAiAnalysis,
        toggleAction,
        markAlertRead,
        addReport,
        deleteReport,

        connectedDevicesCount,
        totalDevicesCount,
        healthyDevicesCount,
        quarantinedDevicesCount,
        warningDevicesCount,
        offlineDevicesCount,
        criticalRiskDevicesCount,
        highRiskDevicesCount,
        mediumRiskDevicesCount,
        lowRiskDevicesCount,
        activeThreatsCount,
        criticalThreatsCount,
        devicesAtRiskCount,
        resolvedThreatsCount,
        blockedAttacksCount,
        securityScore
      }}
    >
      {children}
    </ThreatContext.Provider>
  );
};

export const useThreats = () => {
  const ctx = useContext(ThreatContext);
  if (!ctx) {
    throw new Error('useThreats must be used within a ThreatProvider');
  }
  return ctx;
};
