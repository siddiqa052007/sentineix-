import { useThreats } from '../context/ThreatContext';

export const useThreatMetrics = () => {
  const {
    devices,
    threats,
    alerts,
    reports,
    blockedIps,
    connectedDevicesCount,
    healthyDevicesCount,
    quarantinedDevicesCount,
    warningDevicesCount,
    offlineDevicesCount,
    activeThreatsCount,
    resolvedThreatsCount,
    blockedAttacksCount,
    securityScore
  } = useThreats();

  return {
    totalDevices: devices.length,
    connectedDevices: connectedDevicesCount,
    healthyDevices: healthyDevicesCount,
    quarantinedDevices: quarantinedDevicesCount,
    warningDevices: warningDevicesCount,
    offlineDevices: offlineDevicesCount,

    totalThreats: threats.length,
    activeThreats: activeThreatsCount,
    resolvedThreats: resolvedThreatsCount,
    blockedIpsCount: blockedIps.length,
    blockedAttacks: blockedAttacksCount,

    alertsCount: alerts.length,
    unreadAlertsCount: alerts.filter(a => !a.read).length,
    reportsCount: reports.length,

    securityScore
  };
};
