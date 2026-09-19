export interface DeviceSecurityIssue {
  deviceNumber?: number | string;
  ipAddress: string;
  risk: 'Critical' | 'High' | 'Medium' | 'Low' | string;
  reason: string;
  rootCause: string;
  resolution: string[];
  hostname?: string;
  deviceId?: string;
  department?: string;
  status?: string;
}

export interface DeviceLogItem {
  id: string;
  time: string;
  title: string;
  details: string;
  level: 'INFO' | 'NOTICE' | 'WARNING' | 'CRITICAL' | 'ALERT';
  category: string;
  user: string;
}

export interface Device {
  deviceId: string;
  hostname: string;
  department: string;
  operatingSystem: string;
  ipAddress: string;
  status: 'Healthy' | 'Warning' | 'At Risk' | 'Quarantined' | 'Offline';
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  lastSeen: string;
  assignedUser?: string;
  deviceType?: string;
  serialNumber?: string;
  macAddress?: string;
  agentVersion?: string;
  protectionStatus?: string;
  lastScan?: string;
  securityScore?: number;
  cpuUsage?: string;
  memoryUsage?: string;
  diskUsage?: string;
  uptime?: string;
  lastLogin?: string;
  scannedPostQuarantine?: boolean;
  logs?: DeviceLogItem[];
}

export type ThreatStatus = 'Active' | 'Under Investigation' | 'Action Taken' | 'Resolved' | 'Archived';

export interface ThreatTimelineStep {
  time: string;
  title: string;
  desc: string;
  statusTag?: string;
}

export interface ThreatDetails {
  id: string;
  title: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  status: ThreatStatus;
  deviceId?: string;
  sourceIp: string;
  destination: string;
  detectedAt: string;
  resolved?: boolean;
  resolvedAt?: string;
  resolvedBy?: string;
  resolutionMethod?: string;
  protocol: string;
  riskScore: number;
  description: string;
  businessImpacts: string[];
  recommendedActions: Array<{ id: string; text: string; completed: boolean }>;
  timeline: ThreatTimelineStep[];
  aiAnalysis?: {
    explanation: string;
    businessImpact: string;
    recommendedResponse: string;
    futurePrevention: string[];
  };
  // Incident response fields
  blocked?: boolean;
  blockedAt?: string;
  blockedReason?: string;
  deviceName?: string;
  deviceStatus?: 'Connected' | 'Quarantined' | 'Isolated';
  quarantined?: boolean;
  quarantinedAt?: string;
  notificationSent?: boolean;
  notificationTime?: string;
  investigationStarted?: boolean;
  investigationTime?: string;
}

export interface ThreatEvent {
  id: string;
  timestamp: string;
  sourceIp: string;
  location: string;
  targetService: string;
  attackType: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  confidenceScore: number;
  status: 'BLOCKED' | 'ISOLATED' | 'MITIGATED' | 'ANALYZING';
  payloadSnippet: string;
}

export interface AlertItem {
  id: string;
  title: string;
  timestamp: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  source: string;
  description: string;
  read?: boolean;
  threatId?: string;
}

export interface ExecutiveSummary {
  currentSecurityPosture: string;
  mostCriticalIncident: string;
  riskAssessment: string;
  recommendations: string[];
}

export interface ReportItem {
  id: string;
  threatId?: string;
  threatName: string;
  reportType?: 'Daily' | 'Weekly' | 'Monthly' | 'Custom';
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  affectedDevice?: string;
  generatedBy?: string;
  generatedTime?: string;
  resolutionTime?: string;
  resolvedBy?: string;
  method?: string;
  status: 'Open' | 'Resolved' | 'Archived';
  dateRange?: string;
  executiveSummary?: ExecutiveSummary;
  snapshot?: {
    securityScore: number;
    activeThreatsCount: number;
    resolvedThreatsCount: number;
    criticalIncidentsCount: number;
    quarantinedDevicesCount: number;
    blockedIpsCount: number;
    totalDevicesCount: number;
  };
  details?: {
    description?: string;
    protocol?: string;
    sourceIp?: string;
    destination?: string;
    businessImpacts?: string[];
    timeline?: Array<{ time: string; title: string; desc: string; statusTag?: string }>;
    actionsTaken?: string[];
    recommendations?: string[];
    aiAnalysis?: {
      explanation?: string;
      businessImpact?: string;
      recommendedResponse?: string;
      futurePrevention?: string[];
    };
  };
}

export interface BlockedIpItem {
  ip: string;
  blockedAt: string;
  reason: string;
  threatId?: string;
}

export interface ToastNotification {
  id: string;
  message: string;
  type?: 'success' | 'info' | 'warning' | 'error';
  timestamp: string;
}

export interface MetricSummary {
  packetsInspectedPerSec: number;
  activeProbesCount: number;
  zeroDaysMitigated: number;
  avgAiLatencyMs: number;
}

export type UserRole = 
  | 'Super Admin' 
  | 'Security Analyst' 
  | 'Network Admin' 
  | 'Incident Responder' 
  | 'Auditor' 
  | 'User';

export type UserStatus = 'Pending' | 'Approved' | 'Suspended' | 'Rejected';

export interface User {
  id: string;
  name: string;
  email: string;
  company: string;
  employeeId: string;
  role: UserRole;
  status: UserStatus;
  profilePicture?: string;
  createdAt: string;
  lastLoginAt?: string;
  lastLoginIp?: string;
  isProtectedAdmin?: boolean;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  userEmail: string;
  userName?: string;
  action: 
    | 'LOGIN_SUCCESS' 
    | 'LOGIN_FAILED_PENDING' 
    | 'LOGIN_FAILED_PASSWORD' 
    | 'LOGIN_FAILED_SUSPENDED' 
    | 'LOGIN_FAILED_REJECTED' 
    | 'ACCOUNT_REGISTERED' 
    | 'ACCOUNT_APPROVED' 
    | 'ACCOUNT_REJECTED' 
    | 'ACCOUNT_SUSPENDED' 
    | 'ACCOUNT_REACTIVATED' 
    | 'ACCOUNT_DELETED' 
    | 'ROLE_CHANGED' 
    | 'PROFILE_UPDATED';
  status: 'SUCCESS' | 'WARNING' | 'DANGER' | 'INFO';
  ipAddress: string;
  details: string;
}

