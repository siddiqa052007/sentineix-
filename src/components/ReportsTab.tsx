import React, { useState, useMemo } from 'react';
import { 
  FileText, 
  Download, 
  ShieldCheck, 
  Search, 
  Eye, 
  Clock, 
  CheckCircle2, 
  Calendar, 
  Shield, 
  Plus, 
  FileSpreadsheet, 
  Trash2, 
  AlertTriangle,
  RefreshCw,
  Sparkles,
  Building2,
  Filter,
  ShieldAlert,
  ArrowUpDown,
  Check,
  X,
  Server
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useThreats } from '../context/ThreatContext';
import { ThreatDetails, Device, ReportItem } from '../types';
import { generateComprehensiveReportPdf, generateReportPdf } from '../utils/pdfGenerator';
import { exportIncidentsToCsv, exportSingleReportToCsv, exportReportsToCsv } from '../utils/csvExport';
import { GenerateReportDialog } from './GenerateReportDialog';
import { ReportDetailsDrawer } from './ReportDetailsDrawer';

export const ReportsTab: React.FC = () => {
  const { 
    threats, 
    devices, 
    securityScore, 
    connectedDevicesCount,
    totalDevicesCount,
    criticalRiskDevicesCount,
    highRiskDevicesCount,
    mediumRiskDevicesCount,
    lowRiskDevicesCount,
    deleteThreat, 
    resolveThreat,
    addToast 
  } = useThreats();

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('All');
  const [dateFilter, setDateFilter] = useState<string>('AllTime');

  // Dialog & Drawer States
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false);
  const [selectedReportItem, setSelectedReportItem] = useState<ReportItem | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Current Generated Report Timestamp
  const reportGeneratedTime = useMemo(() => {
    return new Date().toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    }) + ' at ' + new Date().toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }, [threats]);

  // Extract Unique Departments
  const uniqueDepartments = useMemo(() => {
    const deptSet = new Set<string>();
    devices.forEach(d => {
      if (d.department) deptSet.add(d.department);
    });
    // Add default fallbacks
    deptSet.add('Infrastructure & IAM');
    deptSet.add('Cloud Platform');
    deptSet.add('Data Engineering');
    deptSet.add('Finance & Accounting');
    deptSet.add('Engineering');
    deptSet.add('Cybersecurity SOC');
    deptSet.add('Human Resources');
    deptSet.add('Logistics & Supply');
    return Array.from(deptSet).sort();
  }, [devices]);

  // Enriched Incident Mapping from Centralized Threat Dataset
  const enrichedIncidents = useMemo(() => {
    return threats.map(t => {
      // Resolve device
      const dev = devices.find(d => d.deviceId === t.deviceId || d.hostname === t.deviceName || d.ipAddress === t.sourceIp);
      const affectedDeviceName = dev?.hostname || t.deviceName || t.destination || 'Unassigned Device';
      
      // Resolve department
      let department = dev?.department;
      if (!department) {
        const destLower = (t.destination || '').toLowerCase();
        if (destLower.includes('fin') || destLower.includes('erp') || destLower.includes('payment')) department = 'Finance & Accounting';
        else if (destLower.includes('db') || destLower.includes('pg') || destLower.includes('data')) department = 'Data Engineering';
        else if (destLower.includes('hr') || destLower.includes('people')) department = 'Human Resources';
        else if (destLower.includes('k8s') || destLower.includes('cloud') || destLower.includes('ingress')) department = 'Cloud Platform';
        else if (destLower.includes('soc') || destLower.includes('siem') || destLower.includes('sec')) department = 'Cybersecurity SOC';
        else department = 'IT Infrastructure';
      }

      // Check if resolved
      const isResolved = t.resolved || t.status === 'Resolved' || t.status === 'Archived';

      // Resolve action text
      let actionText = 'Pending Response';
      if (isResolved) {
        actionText = t.resolvedBy ? `Resolved by ${t.resolvedBy}` : 'Mitigated & Closed';
      } else if (t.quarantined) {
        actionText = 'Endpoint Quarantined';
      } else if (t.blocked) {
        actionText = 'Source IP Blocked';
      } else if (t.status === 'Action Taken') {
        actionText = 'Automated WAF Action';
      } else if (t.status === 'Under Investigation') {
        actionText = 'Investigation Active';
      } else {
        actionText = 'Monitoring Active';
      }

      return {
        id: t.id,
        title: t.title,
        severity: t.severity,
        status: t.status,
        deviceId: t.deviceId,
        affectedDevice: affectedDeviceName,
        department,
        detectedAt: t.detectedAt || 'Today',
        actionText,
        sourceIp: t.sourceIp,
        protocol: t.protocol || 'TCP / HTTPS',
        riskScore: t.riskScore || 75,
        isResolved,
        originalThreat: t
      };
    });
  }, [threats, devices]);

  // Base Incidents Filtered by Search, Department, and Date (WITHOUT Severity/Status Category Filter)
  // This ensures category navigation buttons always display accurate count badges regardless of active tab
  const categoryBaseIncidents = useMemo(() => {
    return enrichedIncidents.filter(inc => {
      // 1. Search Query
      const q = searchTerm.toLowerCase().trim();
      const matchesSearch = !q || 
        inc.id.toLowerCase().includes(q) ||
        inc.title.toLowerCase().includes(q) ||
        inc.affectedDevice.toLowerCase().includes(q) ||
        inc.department.toLowerCase().includes(q);

      // 2. Department Filter
      const matchesDepartment = selectedDepartment === 'All' || inc.department === selectedDepartment;

      // 3. Date Filter
      let matchesDate = true;
      if (dateFilter === 'Today') {
        const det = inc.detectedAt.toLowerCase();
        matchesDate = det.includes('am') || det.includes('pm') || det.includes('today') || det.includes('just now');
      } else if (dateFilter === 'Last7Days') {
        const det = inc.detectedAt.toLowerCase();
        matchesDate = !det.includes('month ago') && !det.includes('year ago');
      } else if (dateFilter === 'Last30Days') {
        const det = inc.detectedAt.toLowerCase();
        matchesDate = !det.includes('year ago');
      }

      return matchesSearch && matchesDepartment && matchesDate;
    });
  }, [enrichedIncidents, searchTerm, selectedDepartment, dateFilter]);

  // Filtered Incidents Dataset (Constrained by selectedSeverity and selectedStatus)
  const filteredIncidents = useMemo(() => {
    return categoryBaseIncidents.filter(inc => {
      // Severity Filter
      const matchesSeverity = selectedSeverity === 'All' || inc.severity === selectedSeverity;

      // Status Filter
      const matchesStatus = selectedStatus === 'All' || inc.status === selectedStatus;

      return matchesSeverity && matchesStatus;
    });
  }, [categoryBaseIncidents, selectedSeverity, selectedStatus]);

  // Executive Summary Metrics (Calculated from Base Dataset so badges remain constant across category tabs)
  const metrics = useMemo(() => {
    const total = categoryBaseIncidents.length;
    const resolved = categoryBaseIncidents.filter(i => i.isResolved).length;
    const active = total - resolved;

    const critical = categoryBaseIncidents.filter(i => i.severity === 'Critical').length;
    const high = categoryBaseIncidents.filter(i => i.severity === 'High').length;
    const medium = categoryBaseIncidents.filter(i => i.severity === 'Medium').length;
    const low = categoryBaseIncidents.filter(i => i.severity === 'Low').length;

    return { total, resolved, active, critical, high, medium, low };
  }, [categoryBaseIncidents]);

  // Severity Breakdown Table Data (Mathematically Exact)
  const breakdownData = useMemo(() => {
    const severities: Array<'Critical' | 'High' | 'Medium' | 'Low'> = ['Critical', 'High', 'Medium', 'Low'];
    return severities.map(sev => {
      const items = categoryBaseIncidents.filter(i => i.severity === sev);
      const total = items.length;
      const resolved = items.filter(i => i.isResolved).length;
      const active = total - resolved;
      return { severity: sev, total, resolved, active };
    });
  }, [categoryBaseIncidents]);

  // Dynamic AI Executive Summary Narrative
  const aiExecutiveSummary = useMemo(() => {
    if (enrichedIncidents.length === 0) {
      return "No security incidents are registered in the central SOC dataset. Overall enterprise network health is optimal.";
    }

    if (filteredIncidents.length === 0) {
      return "No incidents match the currently applied filter criteria. Reset filters to analyze the full enterprise threat landscape.";
    }

    // Find top department with active/critical threats
    const deptCounts: Record<string, number> = {};
    filteredIncidents.forEach(i => {
      if (!i.isResolved) {
        deptCounts[i.department] = (deptCounts[i.department] || 0) + 1;
      }
    });

    let topDept = 'Finance & Accounting';
    let maxCount = 0;
    Object.entries(deptCounts).forEach(([dept, count]) => {
      if (count > maxCount) {
        maxCount = count;
        topDept = dept;
      }
    });

    const activePhrase = metrics.active > 0 
      ? `${metrics.active} remain active` 
      : `0 remain active`;

    const concentrationPhrase = maxCount > 0 
      ? `Active threats are primarily concentrated within the ${topDept} department.` 
      : `All active threat vectors have been mitigated across network subnets.`;

    return `During this reporting period, SentinelX detected ${metrics.total} security incidents across enterprise subnets. ${metrics.resolved} incidents have been resolved successfully, while ${activePhrase}. ${concentrationPhrase} Immediate attention is recommended for any remaining critical vectors to maintain enterprise compliance.`;
  }, [enrichedIncidents, filteredIncidents, metrics]);

  // Derived active category based on current filters
  const activeCategory = useMemo(() => {
    if (selectedStatus === 'Resolved' && selectedSeverity === 'All') return 'Resolved';
    if (selectedStatus === 'Active' && selectedSeverity === 'All') return 'Active';
    if (selectedSeverity === 'Critical' && selectedStatus === 'All') return 'Critical';
    if (selectedSeverity === 'High' && selectedStatus === 'All') return 'High';
    if (selectedSeverity === 'Medium' && selectedStatus === 'All') return 'Medium';
    if (selectedSeverity === 'Low' && selectedStatus === 'All') return 'Low';
    if (selectedStatus === 'All' && selectedSeverity === 'All') return 'All';
    return 'Filtered';
  }, [selectedStatus, selectedSeverity]);

  const handleSelectCategory = (category: string) => {
    switch (category) {
      case 'All':
        setSelectedStatus('All');
        setSelectedSeverity('All');
        addToast('Showing all security incidents telemetry.', 'info');
        break;
      case 'Resolved':
        setSelectedStatus('Resolved');
        setSelectedSeverity('All');
        addToast('Filtered report for Resolved security incidents.', 'info');
        break;
      case 'Active':
        setSelectedStatus('Active');
        setSelectedSeverity('All');
        addToast('Filtered report for Active threat incidents.', 'info');
        break;
      case 'Critical':
        setSelectedSeverity('Critical');
        setSelectedStatus('All');
        addToast('Filtered report for Critical severity threats.', 'info');
        break;
      case 'High':
        setSelectedSeverity('High');
        setSelectedStatus('All');
        addToast('Filtered report for High severity threats.', 'info');
        break;
      case 'Medium':
        setSelectedSeverity('Medium');
        setSelectedStatus('All');
        addToast('Filtered report for Medium severity threats.', 'info');
        break;
      case 'Low':
        setSelectedSeverity('Low');
        setSelectedStatus('All');
        addToast('Filtered report for Low severity threats.', 'info');
        break;
    }
  };

  // Action Handlers
  const handleExportPdf = () => {
    if (filteredIncidents.length === 0) {
      addToast('No incidents available to export to PDF.', 'warning');
      return;
    }

    const titleMap: Record<string, string> = {
      'Resolved': 'SentinelX Resolved Security Incidents Report',
      'Active': 'SentinelX Active Threats & Exposure Report',
      'Critical': 'SentinelX Critical Severity Security Audit Report',
      'High': 'SentinelX High Severity Threat Incident Report',
      'Medium': 'SentinelX Medium Severity Threat Incident Report',
      'Low': 'SentinelX Low Severity Threat Incident Report',
      'All': 'SentinelX Enterprise SOC Comprehensive Security Report',
    };

    const reportTitle = titleMap[activeCategory] || `SentinelX ${activeCategory} Security Incidents Report`;

    try {
      generateComprehensiveReportPdf({
        reportTitle,
        generatedTime: reportGeneratedTime,
        securityScore,
        stats: metrics,
        breakdown: breakdownData,
        incidents: filteredIncidents.map(i => ({
          id: i.id,
          title: i.title,
          device: i.affectedDevice,
          department: i.department,
          severity: i.severity,
          status: i.status,
          detectedAt: i.detectedAt,
          action: i.actionText
        })),
        aiSummary: aiExecutiveSummary
      });
      addToast(`Exported PDF report for ${activeCategory} incidents.`, 'success');
    } catch (err) {
      console.error(err);
      addToast('Failed to generate PDF export.', 'error');
    }
  };

  const handleExportCsv = () => {
    if (filteredIncidents.length === 0) {
      addToast('No incidents available to export to CSV.', 'warning');
      return;
    }

    try {
      exportIncidentsToCsv(filteredIncidents.map(i => ({
        id: i.id,
        title: i.title,
        device: i.affectedDevice,
        department: i.department,
        severity: i.severity,
        status: i.status,
        detectedAt: i.detectedAt,
        action: i.actionText,
        sourceIp: i.sourceIp,
        protocol: i.protocol,
        riskScore: i.riskScore
      })), 'SentinelX_Security_Incidents');
      addToast(`Exported ${filteredIncidents.length} incidents to CSV.`, 'success');
    } catch (err) {
      console.error(err);
      addToast('Failed to export CSV file.', 'error');
    }
  };

  const handleDeleteIncident = (e: React.MouseEvent, incidentId: string) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete incident ${incidentId} from the central dataset?`)) {
      deleteThreat(incidentId);
    }
  };

  const handleResolveIncident = (e: React.MouseEvent, incidentId: string) => {
    e.stopPropagation();
    resolveThreat(incidentId, 'SecOps Admin', 'Manual SOC Mitigation');
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedSeverity('All');
    setSelectedStatus('All');
    setSelectedDepartment('All');
    setDateFilter('AllTime');
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Page Title & Action Controls Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-800 gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white flex items-center gap-2.5 font-heading">
            <FileText className="w-6 h-6 text-[#00D4FF]" />
            Security Incident Reports
          </h2>
          <p className="text-xs text-slate-400 mt-1 font-sans">
            Enterprise SOC reporting system. Unified telemetry, single source of truth, and dynamic category incident audit logs.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap self-start md:self-center">
          <button
            onClick={() => setIsGenerateDialogOpen(true)}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer flex items-center gap-2"
          >
            <Plus className="w-4 h-4 text-[#00D4FF]" />
            <span>Generate Custom Audit</span>
          </button>

          <button
            onClick={handleExportPdf}
            className="px-4 py-2.5 bg-[#00D4FF] text-slate-950 font-extrabold rounded-xl text-xs hover:bg-cyan-300 transition-colors cursor-pointer flex items-center gap-2 shadow-[0_0_15px_rgba(0,212,255,0.25)] hover:scale-105 transform active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>Export PDF Report ({activeCategory})</span>
          </button>

          <button
            onClick={handleExportCsv}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer flex items-center gap-2"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* 1. TOP CATEGORY NAVIGATION TABS (SELECT RESOLVED, ACTIVE, CRITICAL, HIGH, MEDIUM, LOW, ALL) */}
      <div className="bg-slate-950/80 p-2 rounded-2xl border border-slate-800/80 backdrop-blur-xl shadow-xl space-y-2">
        <div className="px-2 pt-1 flex items-center justify-between">
          <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-[#00D4FF]" />
            Report Categories & Filtering
          </span>
          <span className="text-[11px] font-mono text-slate-400">
            Selected Category: <strong className="text-[#00D4FF]">{activeCategory}</strong> ({filteredIncidents.length} Records)
          </span>
        </div>

        {/* Category Pill Tabs Strip */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          
          {/* ALL INCIDENTS */}
          <button
            onClick={() => handleSelectCategory('All')}
            className={`px-3.5 py-2.5 rounded-xl text-xs font-mono font-bold transition-all shrink-0 cursor-pointer flex items-center gap-2 border ${
              activeCategory === 'All'
                ? 'bg-[#00D4FF] text-slate-950 border-[#00D4FF] shadow-[0_0_20px_rgba(0,212,255,0.4)]'
                : 'bg-slate-900/90 text-slate-300 border-slate-800 hover:border-cyan-500/50 hover:bg-slate-800'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>All Incidents</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
              activeCategory === 'All' ? 'bg-slate-950 text-[#00D4FF]' : 'bg-slate-800 text-slate-300'
            }`}>
              {metrics.total}
            </span>
          </button>

          {/* RESOLVED */}
          <button
            onClick={() => handleSelectCategory('Resolved')}
            className={`px-3.5 py-2.5 rounded-xl text-xs font-mono font-bold transition-all shrink-0 cursor-pointer flex items-center gap-2 border ${
              activeCategory === 'Resolved'
                ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.45)]'
                : 'bg-emerald-950/30 text-emerald-400 border-emerald-900/60 hover:border-emerald-500/60 hover:bg-emerald-950/60'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Resolved</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
              activeCategory === 'Resolved' ? 'bg-slate-950 text-emerald-400' : 'bg-emerald-950/80 text-emerald-300'
            }`}>
              {metrics.resolved}
            </span>
          </button>

          {/* ACTIVE */}
          <button
            onClick={() => handleSelectCategory('Active')}
            className={`px-3.5 py-2.5 rounded-xl text-xs font-mono font-bold transition-all shrink-0 cursor-pointer flex items-center gap-2 border ${
              activeCategory === 'Active'
                ? 'bg-rose-500 text-slate-950 border-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.45)]'
                : 'bg-rose-950/30 text-rose-400 border-rose-900/60 hover:border-rose-500/60 hover:bg-rose-950/60'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Active Threats</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
              activeCategory === 'Active' ? 'bg-slate-950 text-rose-400' : 'bg-rose-950/80 text-rose-300'
            }`}>
              {metrics.active}
            </span>
          </button>

          {/* CRITICAL */}
          <button
            onClick={() => handleSelectCategory('Critical')}
            className={`px-3.5 py-2.5 rounded-xl text-xs font-mono font-bold transition-all shrink-0 cursor-pointer flex items-center gap-2 border ${
              activeCategory === 'Critical'
                ? 'bg-rose-600 text-white border-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.5)]'
                : 'bg-rose-950/40 text-rose-300 border-rose-900/60 hover:border-rose-500/60 hover:bg-rose-950/70'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Critical</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
              activeCategory === 'Critical' ? 'bg-slate-950 text-rose-300' : 'bg-rose-950/80 text-rose-200'
            }`}>
              {metrics.critical}
            </span>
          </button>

          {/* HIGH */}
          <button
            onClick={() => handleSelectCategory('High')}
            className={`px-3.5 py-2.5 rounded-xl text-xs font-mono font-bold transition-all shrink-0 cursor-pointer flex items-center gap-2 border ${
              activeCategory === 'High'
                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.45)]'
                : 'bg-amber-950/30 text-amber-400 border-amber-900/60 hover:border-amber-500/60 hover:bg-amber-950/60'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>High</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
              activeCategory === 'High' ? 'bg-slate-950 text-amber-400' : 'bg-amber-950/80 text-amber-300'
            }`}>
              {metrics.high}
            </span>
          </button>

          {/* MEDIUM */}
          <button
            onClick={() => handleSelectCategory('Medium')}
            className={`px-3.5 py-2.5 rounded-xl text-xs font-mono font-bold transition-all shrink-0 cursor-pointer flex items-center gap-2 border ${
              activeCategory === 'Medium'
                ? 'bg-blue-500 text-white border-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.45)]'
                : 'bg-blue-950/30 text-blue-400 border-blue-900/60 hover:border-blue-500/60 hover:bg-blue-950/60'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Medium</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
              activeCategory === 'Medium' ? 'bg-slate-950 text-blue-300' : 'bg-blue-950/80 text-blue-200'
            }`}>
              {metrics.medium}
            </span>
          </button>

          {/* LOW */}
          <button
            onClick={() => handleSelectCategory('Low')}
            className={`px-3.5 py-2.5 rounded-xl text-xs font-mono font-bold transition-all shrink-0 cursor-pointer flex items-center gap-2 border ${
              activeCategory === 'Low'
                ? 'bg-slate-200 text-slate-950 border-white shadow-[0_0_20px_rgba(255,255,255,0.3)]'
                : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:border-slate-600 hover:bg-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Low</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
              activeCategory === 'Low' ? 'bg-slate-950 text-slate-200' : 'bg-slate-800 text-slate-300'
            }`}>
              {metrics.low}
            </span>
          </button>

        </div>
      </div>

      {/* 2. DEDICATED HERO FOCUS CARD FOR SELECTED CATEGORY */}
      <div className={`p-5 rounded-2xl border backdrop-blur-xl shadow-2xl space-y-4 transition-all ${
        activeCategory === 'Resolved' ? 'bg-gradient-to-r from-emerald-950/80 via-slate-950 to-slate-950 border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.15)]' :
        activeCategory === 'Active' ? 'bg-gradient-to-r from-rose-950/80 via-slate-950 to-slate-950 border-rose-500/50 shadow-[0_0_30px_rgba(244,63,94,0.15)]' :
        activeCategory === 'Critical' ? 'bg-gradient-to-r from-rose-950/90 via-slate-950 to-slate-950 border-rose-500/60 shadow-[0_0_30px_rgba(244,63,94,0.2)]' :
        activeCategory === 'High' ? 'bg-gradient-to-r from-amber-950/80 via-slate-950 to-slate-950 border-amber-500/50 shadow-[0_0_30px_rgba(245,158,11,0.15)]' :
        activeCategory === 'Medium' ? 'bg-gradient-to-r from-blue-950/80 via-slate-950 to-slate-950 border-blue-500/50 shadow-[0_0_30px_rgba(59,130,246,0.15)]' :
        activeCategory === 'Low' ? 'bg-gradient-to-r from-slate-900 via-slate-950 to-slate-950 border-slate-700' :
        'bg-gradient-to-r from-cyan-950/60 via-slate-950 to-slate-950 border-cyan-500/50 shadow-[0_0_30px_rgba(0,212,255,0.15)]'
      }`}>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className={`p-3.5 rounded-2xl border flex items-center justify-center shrink-0 ${
              activeCategory === 'Resolved' ? 'bg-emerald-950/90 border-emerald-400 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.35)]' :
              activeCategory === 'Active' ? 'bg-rose-950/90 border-rose-400 text-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.35)]' :
              activeCategory === 'Critical' ? 'bg-rose-950/90 border-rose-400 text-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.35)]' :
              activeCategory === 'High' ? 'bg-amber-950/90 border-amber-400 text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.35)]' :
              activeCategory === 'Medium' ? 'bg-blue-950/90 border-blue-400 text-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.35)]' :
              'bg-slate-900 border-[#00D4FF] text-[#00D4FF]'
            }`}>
              {activeCategory === 'Resolved' && <CheckCircle2 className="w-8 h-8 text-emerald-400" />}
              {activeCategory === 'Active' && <AlertTriangle className="w-8 h-8 text-rose-400" />}
              {activeCategory === 'Critical' && <ShieldAlert className="w-8 h-8 text-rose-400" />}
              {activeCategory === 'High' && <AlertTriangle className="w-8 h-8 text-amber-400" />}
              {activeCategory === 'Medium' && <Shield className="w-8 h-8 text-blue-400" />}
              {activeCategory === 'Low' && <ShieldCheck className="w-8 h-8 text-slate-300" />}
              {(activeCategory === 'All' || activeCategory === 'Filtered') && <FileText className="w-8 h-8 text-[#00D4FF]" />}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h3 className="text-xl font-extrabold text-white font-heading tracking-tight">
                  {activeCategory === 'Resolved' && 'Resolved Security Incidents Data Report'}
                  {activeCategory === 'Active' && 'Active Threats & Unmitigated Exposure Report'}
                  {activeCategory === 'Critical' && 'Critical Severity Incident Audit Report'}
                  {activeCategory === 'High' && 'High Severity Incident Telemetry Report'}
                  {activeCategory === 'Medium' && 'Medium Severity Incident Telemetry Report'}
                  {activeCategory === 'Low' && 'Low Severity Incident Telemetry Report'}
                  {activeCategory === 'All' && 'Enterprise SOC Comprehensive Security Report'}
                  {activeCategory === 'Filtered' && 'Filtered Incident Audit Report'}
                </h3>
                <span className="px-3 py-1 rounded-full bg-slate-950 text-[#00D4FF] border border-cyan-500/50 text-xs font-mono font-bold shadow">
                  {filteredIncidents.length} {filteredIncidents.length === 1 ? 'Record' : 'Records Found'}
                </span>
              </div>
              <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                {activeCategory === 'Resolved' && 'Complete audit trail of all mitigated & closed threat vectors with resolution timeline, analyst notes, and XDP eBPF kernel enforcement details.'}
                {activeCategory === 'Active' && 'Real-time telemetry of active security threats requiring immediate SecOps SOC intervention and kernel filter deployment.'}
                {activeCategory === 'Critical' && 'High-priority critical threat vectors requiring immediate tier-1 incident response and executive escalation.'}
                {activeCategory === 'High' && 'Significant security threats identified across enterprise subnets requiring mitigation.'}
                {activeCategory === 'Medium' && 'Moderate security events and suspicious traffic patterns logged by eBPF sensors.'}
                {activeCategory === 'Low' && 'Informational logs, policy warnings, and minor network anomalies.'}
                {activeCategory === 'All' && 'Full unified telemetry dataset containing both active threat vectors and resolved security incidents.'}
                {activeCategory === 'Filtered' && 'Filtered view of incident logs based on your active search and filter criteria.'}
              </p>
            </div>
          </div>

          {/* DEDICATED ACTION BUTTONS FOR THE SELECTED CATEGORY */}
          <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row items-stretch gap-2.5 shrink-0">
            <button
              onClick={handleExportPdf}
              className={`px-5 py-3 font-extrabold rounded-xl text-xs transition-all cursor-pointer flex items-center justify-center gap-2.5 shadow-xl hover:scale-105 transform active:scale-95 ${
                activeCategory === 'Resolved' ? 'bg-emerald-400 text-slate-950 hover:bg-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.35)]' :
                activeCategory === 'Active' ? 'bg-rose-500 text-white hover:bg-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.35)]' :
                activeCategory === 'Critical' ? 'bg-rose-600 text-white hover:bg-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.4)]' :
                activeCategory === 'High' ? 'bg-amber-400 text-slate-950 hover:bg-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.35)]' :
                activeCategory === 'Medium' ? 'bg-blue-500 text-white hover:bg-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.35)]' :
                'bg-[#00D4FF] text-slate-950 hover:bg-cyan-300 shadow-[0_0_20px_rgba(0,212,255,0.35)]'
              }`}
            >
              <Download className="w-4 h-4" />
              <span>Export PDF Report ({activeCategory})</span>
            </button>

            <button
              onClick={handleExportCsv}
              className="px-4 py-3 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Category Key Stats Summary Line */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-3 border-t border-slate-800/80 font-mono text-xs">
          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80">
            <span className="text-[10px] text-slate-400 block uppercase font-sans">Category Total</span>
            <span className="text-base font-extrabold text-white mt-0.5 block">{filteredIncidents.length} Records</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80">
            <span className="text-[10px] text-slate-400 block uppercase font-sans">Connected Devices</span>
            <span className="text-base font-extrabold text-cyan-400 mt-0.5 block">{connectedDevicesCount} <span className="text-xs text-slate-400 font-normal">/ {totalDevicesCount} total</span></span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80">
            <span className="text-[10px] text-slate-400 block uppercase font-sans">Overall Mitigated</span>
            <span className="text-base font-extrabold text-emerald-400 mt-0.5 block">{metrics.resolved} of {metrics.total} ({metrics.total > 0 ? Math.round((metrics.resolved / metrics.total) * 100) : 100}%)</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80">
            <span className="text-[10px] text-slate-400 block uppercase font-sans">Security Score</span>
            <span className="text-base font-extrabold text-[#00D4FF] mt-0.5 block">{securityScore}%</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80">
            <span className="text-[10px] text-slate-400 block uppercase font-sans">Device Risk Breakdown</span>
            <span className="text-xs font-bold mt-1 block text-slate-200">
              <span className="text-rose-400">{criticalRiskDevicesCount} Crit</span> • <span className="text-amber-400">{highRiskDevicesCount} High</span> • <span className="text-blue-400">{mediumRiskDevicesCount} Med</span> • <span className="text-slate-400">{lowRiskDevicesCount} Low</span>
            </span>
          </div>
        </div>

        {/* Explicit Cards Preview of Records in Selected Category */}
        <div className="pt-3 border-t border-slate-800/80 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-mono font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-[#00D4FF]" />
              Selected Category Incidents Preview ({filteredIncidents.length} {filteredIncidents.length === 1 ? 'Record' : 'Records'}):
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              Click any record card to inspect details
            </span>
          </div>

          {filteredIncidents.length === 0 ? (
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-center text-slate-400 text-xs">
              No records found for category "{activeCategory}".
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredIncidents.map((inc) => (
                <div
                  key={inc.id}
                  onClick={() => {
                    const reportItem: ReportItem = {
                      id: inc.id,
                      threatName: inc.title,
                      severity: inc.severity,
                      status: inc.status as any,
                      affectedDevice: inc.affectedDevice,
                      generatedTime: inc.detectedAt,
                      generatedBy: 'SecOps AI Central Engine',
                      method: inc.actionText,
                      snapshot: {
                        securityScore,
                        activeThreatsCount: metrics.active,
                        resolvedThreatsCount: metrics.resolved,
                        criticalIncidentsCount: metrics.critical,
                        quarantinedDevicesCount: 1,
                        blockedIpsCount: 5,
                        totalDevicesCount: devices.length
                      },
                      executiveSummary: {
                        currentSecurityPosture: `Enterprise security posture at ${securityScore}/100.`,
                        mostCriticalIncident: inc.title,
                        riskAssessment: `Exposure categorized as ${inc.severity}. Response status: ${inc.status}.`,
                        recommendations: [
                          'Maintain continuous eBPF kernel socket monitoring',
                          'Audit zero-trust re-authentication policies'
                        ]
                      },
                      details: {
                        description: inc.title,
                        sourceIp: inc.sourceIp,
                        protocol: inc.protocol,
                        destination: inc.affectedDevice
                      }
                    };
                    setSelectedReportItem(reportItem);
                    setIsDrawerOpen(true);
                  }}
                  className="p-3.5 rounded-xl bg-slate-950/90 border border-slate-800 hover:border-cyan-500/60 transition-all cursor-pointer group space-y-2 shadow-lg"
                >
                  <div className="flex items-center justify-between gap-2 font-mono">
                    <span className="text-[11px] font-bold text-[#00D4FF] bg-slate-900 px-2 py-0.5 rounded border border-cyan-500/30">
                      {inc.id}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase border ${
                      inc.severity === 'Critical'
                        ? 'bg-rose-950 text-rose-400 border-rose-800'
                        : inc.severity === 'High'
                        ? 'bg-amber-950 text-amber-400 border-amber-800'
                        : inc.severity === 'Medium'
                        ? 'bg-blue-950 text-blue-400 border-blue-800'
                        : 'bg-slate-900 text-slate-300 border-slate-700'
                    }`}>
                      {inc.severity}
                    </span>
                  </div>

                  <h4 className="text-xs font-extrabold text-white group-hover:text-[#00D4FF] transition-colors line-clamp-1">
                    {inc.title}
                  </h4>

                  <div className="grid grid-cols-2 gap-1.5 text-[11px] text-slate-300 font-sans">
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase font-mono block">Device</span>
                      <span className="font-semibold text-slate-200 truncate block">{inc.affectedDevice}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase font-mono block">Department</span>
                      <span className="font-semibold text-slate-200 truncate block">{inc.department}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono">
                    <span className={`px-1.5 py-0.2 rounded font-bold uppercase border flex items-center gap-1 ${
                      inc.isResolved
                        ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                        : 'bg-rose-950 text-rose-400 border-rose-800'
                    }`}>
                      {inc.isResolved ? <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" /> : <AlertTriangle className="w-2.5 h-2.5 text-rose-400" />}
                      <span>{inc.status}</span>
                    </span>
                    <span className="text-slate-400">{inc.detectedAt}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Generate Report Dialog */}
      <GenerateReportDialog
        isOpen={isGenerateDialogOpen}
        onClose={() => setIsGenerateDialogOpen(false)}
        onReportGenerated={(newRep) => {
          setSelectedReportItem(newRep);
          setIsDrawerOpen(true);
        }}
      />

      {/* Report Details Right Drawer */}
      <ReportDetailsDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        report={selectedReportItem}
      />

    </div>
  );
};
