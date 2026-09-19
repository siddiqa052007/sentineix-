import { jsPDF } from 'jspdf';
import { ReportItem } from '../types';

export interface IncidentPdfRow {
  id: string;
  title: string;
  device: string;
  department: string;
  severity: string;
  status: string;
  detectedAt: string;
  action: string;
}

export interface ComprehensiveReportData {
  reportTitle?: string;
  generatedTime: string;
  securityScore: number;
  stats: {
    total: number;
    resolved: number;
    active: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  breakdown: Array<{
    severity: string;
    total: number;
    resolved: number;
    active: number;
  }>;
  incidents: IncidentPdfRow[];
  aiSummary: string;
}

export const generateComprehensiveReportPdf = (data: ComprehensiveReportData) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // ~210mm
  const pageHeight = doc.internal.pageSize.getHeight(); // ~297mm
  let y = 15;

  const drawHeader = () => {
    // Header Banner Background
    doc.setFillColor(10, 15, 30); // Dark Navy
    doc.rect(0, 0, pageWidth, 36, 'F');

    // Accent Line
    doc.setFillColor(0, 212, 255); // Cyan #00D4FF
    doc.rect(0, 36, pageWidth, 1.5, 'F');

    // Brand Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(255, 255, 255);
    doc.text('SENTINELX', 14, 16);

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 212, 255);
    doc.text((data.reportTitle || 'ENTERPRISE SOC SECURITY INCIDENT & TELEMETRY REPORT').toUpperCase(), 14, 22);

    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text('CONFIDENTIAL / CENTRALIZED INCIDENT DATASET', 14, 28);

    // Right Side Metadata
    doc.setFontSize(8.5);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('SECURITY REPORT', pageWidth - 14, 16, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(`Generated: ${data.generatedTime}`, pageWidth - 14, 22, { align: 'right' });
    doc.text(`Security Posture Score: ${data.securityScore}/100`, pageWidth - 14, 28, { align: 'right' });
  };

  drawHeader();
  y = 44;

  // 1. EXECUTIVE SUMMARY SECTION
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('1. EXECUTIVE SUMMARY & POSTURE', 14, y);
  doc.setDrawColor(0, 212, 255);
  doc.setLineWidth(0.5);
  doc.line(14, y + 1.5, 80, y + 1.5);
  y += 7;

  // Stats Grid Container
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, y, pageWidth - 28, 24, 2, 2, 'FD');

  // Stat items
  const colW = (pageWidth - 28) / 6;
  const statItems = [
    { label: 'SECURITY SCORE', val: `${data.securityScore}%`, color: [16, 185, 129] },
    { label: 'TOTAL INCIDENTS', val: `${data.stats.total}`, color: [15, 23, 42] },
    { label: 'RESOLVED', val: `${data.stats.resolved}`, color: [16, 185, 129] },
    { label: 'ACTIVE', val: `${data.stats.active}`, color: [225, 29, 72] },
    { label: 'CRITICAL', val: `${data.stats.critical}`, color: [225, 29, 72] },
    { label: 'HIGH / MED / LOW', val: `${data.stats.high}/${data.stats.medium}/${data.stats.low}`, color: [217, 119, 6] }
  ];

  statItems.forEach((item, idx) => {
    const startX = 14 + (idx * colW) + 2;
    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(item.label, startX, y + 7);

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(item.color[0], item.color[1], item.color[2]);
    doc.text(item.val, startX, y + 17);
  });

  y += 30;

  // 2. AI EXECUTIVE SUMMARY
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('2. GEMINI AI EXECUTIVE SUMMARY', 14, y);
  doc.line(14, y + 1.5, 78, y + 1.5);
  y += 7;

  doc.setFillColor(240, 249, 255); // light cyan tint
  doc.setDrawColor(186, 230, 253);
  doc.roundedRect(14, y, pageWidth - 28, 18, 2, 2, 'FD');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);
  const aiLines = doc.splitTextToSize(data.aiSummary, pageWidth - 34);
  doc.text(aiLines, 17, y + 6);
  y += 24;

  // 3. INCIDENT BREAKDOWN SUMMARY TABLE
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('3. INCIDENT BREAKDOWN BY SEVERITY', 14, y);
  doc.line(14, y + 1.5, 85, y + 1.5);
  y += 7;

  // Breakdown Table Headers
  const bdTableX = 14;
  const bdTableW = pageWidth - 28;
  doc.setFillColor(30, 41, 59);
  doc.rect(bdTableX, y, bdTableW, 6, 'F');
  
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('SEVERITY LEVEL', bdTableX + 4, y + 4.2);
  doc.text('TOTAL INCIDENTS', bdTableX + 50, y + 4.2);
  doc.text('RESOLVED', bdTableX + 100, y + 4.2);
  doc.text('ACTIVE', bdTableX + 145, y + 4.2);
  y += 6;

  // Breakdown Rows
  data.breakdown.forEach((row, i) => {
    doc.setFillColor(i % 2 === 0 ? '#ffffff' : '#f8fafc');
    doc.rect(bdTableX, y, bdTableW, 6, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.line(bdTableX, y + 6, bdTableX + bdTableW, y + 6);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    if (row.severity === 'Critical') doc.setTextColor(225, 29, 72);
    else if (row.severity === 'High') doc.setTextColor(217, 119, 6);
    else if (row.severity === 'Medium') doc.setTextColor(37, 99, 235);
    else doc.setTextColor(71, 85, 105);

    doc.text(row.severity.toUpperCase(), bdTableX + 4, y + 4.2);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text(`${row.total}`, bdTableX + 50, y + 4.2);
    doc.setTextColor(16, 185, 129);
    doc.text(`${row.resolved}`, bdTableX + 100, y + 4.2);
    doc.setTextColor(row.active > 0 ? 225 : 100, row.active > 0 ? 29 : 116, row.active > 0 ? 72 : 139);
    doc.text(`${row.active}`, bdTableX + 145, y + 4.2);

    y += 6;
  });

  y += 8;

  // 4. COMPLETE INCIDENT TABLE
  const drawIncidentTableHeader = () => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text('4. COMPLETE INCIDENT AUDIT TRAIL', 14, y);
    doc.line(14, y + 1.5, 82, y + 1.5);
    y += 7;

    doc.setFillColor(15, 23, 42);
    doc.rect(14, y, pageWidth - 28, 6.5, 'F');

    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('ID', 16, y + 4.5);
    doc.text('THREAT NAME', 32, y + 4.5);
    doc.text('DEVICE', 88, y + 4.5);
    doc.text('DEPARTMENT', 122, y + 4.5);
    doc.text('SEV', 155, y + 4.5);
    doc.text('STATUS', 170, y + 4.5);
    doc.text('TIME', 188, y + 4.5);
    y += 6.5;
  };

  drawIncidentTableHeader();

  data.incidents.forEach((inc, idx) => {
    // Check page overflow
    if (y > pageHeight - 20) {
      doc.addPage();
      y = 15;
      drawIncidentTableHeader();
    }

    doc.setFillColor(idx % 2 === 0 ? '#ffffff' : '#f8fafc');
    doc.rect(14, y, pageWidth - 28, 6, 'F');
    doc.setDrawColor(241, 245, 249);
    doc.line(14, y + 6, pageWidth - 14, y + 6);

    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(2, 132, 199); // cyan
    doc.text(inc.id, 16, y + 4.2);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    const titleTrunc = inc.title.length > 32 ? inc.title.substring(0, 30) + '...' : inc.title;
    doc.text(titleTrunc, 32, y + 4.2);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    const devTrunc = inc.device.length > 18 ? inc.device.substring(0, 16) + '...' : inc.device;
    doc.text(devTrunc, 88, y + 4.2);

    const deptTrunc = inc.department.length > 16 ? inc.department.substring(0, 14) + '...' : inc.department;
    doc.text(deptTrunc, 122, y + 4.2);

    // Sev
    doc.setFont('helvetica', 'bold');
    if (inc.severity === 'Critical') doc.setTextColor(225, 29, 72);
    else if (inc.severity === 'High') doc.setTextColor(217, 119, 6);
    else if (inc.severity === 'Medium') doc.setTextColor(37, 99, 235);
    else doc.setTextColor(71, 85, 105);
    doc.text(inc.severity.substring(0, 4).toUpperCase(), 155, y + 4.2);

    // Status
    if (inc.status === 'Resolved' || inc.status === 'Archived') doc.setTextColor(16, 185, 129);
    else doc.setTextColor(225, 29, 72);
    doc.text(inc.status.substring(0, 8), 170, y + 4.2);

    // Time
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(inc.detectedAt || 'Today', 188, y + 4.2);

    y += 6;
  });

  // Footer for all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setDrawColor(226, 232, 240);
    doc.line(14, pageHeight - 12, pageWidth - 14, pageHeight - 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text('SentinelX Enterprise Cyber Defense Platform — Comprehensive SOC Report', 14, pageHeight - 7);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - 14, pageHeight - 7, { align: 'right' });
  }

  const filename = `SentinelX_Executive_Report_${Date.now()}.pdf`;
  doc.save(filename);
};

export const generateReportPdf = (report: ReportItem) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let y = 15;

  doc.setFillColor(10, 15, 30);
  doc.rect(0, 0, pageWidth, 38, 'F');
  doc.setFillColor(0, 212, 255);
  doc.rect(0, 38, pageWidth, 1.5, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(255, 255, 255);
  doc.text('SENTINELX', 14, 18);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 212, 255);
  doc.text('ENTERPRISE AI INTRUSION DETECTION & INCIDENT RESPONSE', 14, 24);

  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text('CONFIDENTIAL SECURITY AUDIT REPORT', 14, 30);

  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text(`Report ID: ${report.id}`, pageWidth - 14, 18, { align: 'right' });
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text(`Generated: ${report.generatedTime || report.resolutionTime || 'Today'}`, pageWidth - 14, 24, { align: 'right' });
  doc.text(`By: ${report.generatedBy || report.resolvedBy || 'SecOps AI Engine'}`, pageWidth - 14, 30, { align: 'right' });

  y = 48;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(15, 23, 42);
  doc.text(report.threatName, 14, y);
  y += 7;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  
  const sev = report.severity || 'High';
  if (sev === 'Critical') doc.setFillColor(225, 29, 72);
  else if (sev === 'High') doc.setFillColor(217, 119, 6);
  else if (sev === 'Medium') doc.setFillColor(37, 99, 235);
  else doc.setFillColor(16, 185, 129);
  
  doc.roundedRect(14, y, 28, 6, 1, 1, 'F');
  doc.setTextColor(255, 255, 255);
  doc.text(`SEV: ${sev.toUpperCase()}`, 16, y + 4.2);

  doc.setFillColor(30, 41, 59);
  doc.roundedRect(45, y, 28, 6, 1, 1, 'F');
  doc.setTextColor(56, 189, 248);
  doc.text(`STATUS: ${(report.status || 'Resolved').toUpperCase()}`, 47, y + 4.2);

  if (report.reportType) {
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(76, y, 24, 6, 1, 1, 'F');
    doc.setTextColor(71, 85, 105);
    doc.text(`${report.reportType} Report`, 78, y + 4.2);
  }

  y += 12;

  const snap = report.snapshot || {
    securityScore: 92,
    activeThreatsCount: 2,
    resolvedThreatsCount: 14,
    criticalIncidentsCount: 0,
    quarantinedDevicesCount: 1,
    blockedIpsCount: 5,
    totalDevicesCount: 18
  };

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, y, pageWidth - 28, 20, 2, 2, 'FD');

  const metricBoxW = (pageWidth - 28) / 4;
  
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('SECURITY SCORE', 14 + 6, y + 6);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(16, 185, 129);
  doc.text(`${snap.securityScore}/100`, 14 + 6, y + 15);

  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('ACTIVE THREATS', 14 + metricBoxW + 6, y + 6);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(225, 29, 72);
  doc.text(`${snap.activeThreatsCount}`, 14 + metricBoxW + 6, y + 15);

  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('RESOLVED INCIDENTS', 14 + (metricBoxW * 2) + 6, y + 6);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`${snap.resolvedThreatsCount}`, 14 + (metricBoxW * 2) + 6, y + 15);

  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('BLOCKED IPS', 14 + (metricBoxW * 3) + 6, y + 6);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(2, 132, 199);
  doc.text(`${snap.blockedIpsCount}`, 14 + (metricBoxW * 3) + 6, y + 15);

  y += 28;

  const exec = report.executiveSummary || {
    currentSecurityPosture: 'Enterprise posture remains within target tolerance. Ingress socket filtering neutralized active vectors.',
    mostCriticalIncident: report.threatName,
    riskAssessment: 'Low residual exposure following automated incident response mitigations.',
    recommendations: [
      'Maintain strict eBPF socket level packet inspection across worker nodes',
      'Enforce zero-trust re-authentication for administrative endpoint sessions',
      'Audit API authorization headers on public load balancers'
    ]
  };

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('AI EXECUTIVE SUMMARY', 14, y);
  
  doc.setDrawColor(0, 212, 255);
  doc.setLineWidth(0.5);
  doc.line(14, y + 1.5, 65, y + 1.5);
  y += 7;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text('Current Security Posture:', 14, y);
  y += 4.5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  const postureLines = doc.splitTextToSize(exec.currentSecurityPosture, pageWidth - 28);
  doc.text(postureLines, 14, y);
  y += postureLines.length * 4 + 4;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text('Most Critical Incident & Impact:', 14, y);
  y += 4.5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  const critLines = doc.splitTextToSize(exec.mostCriticalIncident, pageWidth - 28);
  doc.text(critLines, 14, y);
  y += critLines.length * 4 + 4;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text('Risk Assessment:', 14, y);
  y += 4.5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  const riskLines = doc.splitTextToSize(exec.riskAssessment, pageWidth - 28);
  doc.text(riskLines, 14, y);
  y += riskLines.length * 4 + 6;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('INCIDENT DETAILS & ACTIONS TAKEN', 14, y);
  doc.line(14, y + 1.5, 88, y + 1.5);
  y += 7;

  const det = report.details || {};
  
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);

  const detailItems = [
    ['Affected Device / Target:', report.affectedDevice || det.destination || 'All Network Subnets'],
    ['Source IP:', det.sourceIp || '185.220.101.5 (Blackholed)'],
    ['Protocol / Service:', det.protocol || 'HTTPS / TCP (443)'],
    ['Mitigation Method:', report.method || 'Automated ingress block & eBPF rule enforcement']
  ];

  detailItems.forEach(([label, val]) => {
    doc.setFont('helvetica', 'bold');
    doc.text(label, 14, y);
    doc.setFont('helvetica', 'normal');
    doc.text(val, 62, y);
    y += 5;
  });

  y += 4;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('RECOMMENDATIONS & ACTION PLAN', 14, y);
  doc.line(14, y + 1.5, 82, y + 1.5);
  y += 7;

  const recs = exec.recommendations || det.recommendations || [
    'Enforce strict zero-trust identity verification across internal endpoints',
    'Review perimeter firewall SYN flood and port scan threshold rules',
    'Conduct automated vulnerability remediation on identified target servers'
  ];

  recs.forEach((rec, idx) => {
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 150, 200);
    doc.text(`${idx + 1}.`, 14, y);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);
    const recLines = doc.splitTextToSize(rec, pageWidth - 35);
    doc.text(recLines, 20, y);
    y += recLines.length * 4 + 2;
  });

  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setDrawColor(226, 232, 240);
    doc.line(14, pageHeight - 12, pageWidth - 14, pageHeight - 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text('SentinelX Enterprise Cyber Defense Platform — Automated Security Report', 14, pageHeight - 7);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - 14, pageHeight - 7, { align: 'right' });
  }

  const filename = `SentinelX_Report_${report.id}_${Date.now()}.pdf`;
  doc.save(filename);
};
