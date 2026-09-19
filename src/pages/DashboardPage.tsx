import React, { useState, useEffect } from 'react';
import { Sidebar } from '../components/Sidebar';
import { TopNav } from '../components/TopNav';
import { MetricCardsGrid } from '../components/MetricCardsGrid';
import { NetworkActivityChart } from '../components/NetworkActivityChart';
import { RecentAlertsWidget } from '../components/RecentAlertsWidget';
import { ThreatDistributionChart } from '../components/ThreatDistributionChart';
import { AiInsightsWidget } from '../components/AiInsightsWidget';
import { RecentActivityWidget } from '../components/RecentActivityWidget';
import { QuickActionsWidget } from '../components/QuickActionsWidget';
import { ThreatMonitorTab } from '../components/ThreatMonitorTab';
import { SettingsTab } from '../components/SettingsTab';
import { ReportsTab } from '../components/ReportsTab';
import { ConnectedDevicesTab } from '../components/ConnectedDevicesTab';
import { AiAssistantTab } from '../components/AiAssistantTab';
import { SuperAdminTab } from '../components/SuperAdminTab';
import { UserProfileBanner } from '../components/UserProfileBanner';
import { SecurityOverviewDrawer } from '../components/SecurityOverviewDrawer';
import { ToastContainer } from '../components/ToastContainer';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, X } from 'lucide-react';
import { ThreatProvider, useThreats } from '../context/ThreatContext';

interface DashboardPageProps {
  onReturnToHome: () => void;
}

const DashboardPageInner: React.FC<DashboardPageProps> = ({ onReturnToHome }) => {
  const { 
    activeTab, 
    setActiveTab, 
    addToast, 
    isSecurityOverviewOpen, 
    setIsSecurityOverviewOpen 
  } = useThreats();

  const mainScrollRef = React.useRef<HTMLDivElement>(null);

  // Ensure page scrolls to top and active tab resets to main overview on mount
  useEffect(() => {
    setActiveTab('dashboard');
    if (mainScrollRef.current) {
      mainScrollRef.current.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
  }, []);

  // Scroll to top whenever tab changes
  useEffect(() => {
    if (mainScrollRef.current) {
      mainScrollRef.current.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
  }, [activeTab]);

  const handleGenerateReport = () => {
    addToast('📄 Executive Security Audit Report generated (PDF download initiated).', 'info');
  };

  const handleAskAi = () => {
    setActiveTab('ai-assistant');
    addToast('🤖 AI Security Copilot activated.', 'info');
  };

  const handleRefreshDashboard = () => {
    addToast('🔄 Dashboard metrics & socket telemetry re-synchronized.', 'info');
  };

  return (
    <div className="h-screen w-screen bg-[#070b14] text-slate-100 flex font-sans selection:bg-[#00D4FF] selection:text-slate-950 overflow-hidden relative">
      
      {/* Toast Notifications System */}
      <ToastContainer />

      {/* Background Animated Cyber Grid */}
      <div className="fixed inset-0 bg-cyber-grid bg-[size:40px_40px] opacity-15 pointer-events-none z-0" />

      {/* Sidebar Navigation - Stationary & Unmovable on Left */}
      <Sidebar onReturnToHome={onReturnToHome} />

      {/* Right Container - Independently Scrollable Workspace */}
      <div ref={mainScrollRef} className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto z-10 relative scroll-smooth">
        
        {/* Top Header Navigation */}
        <TopNav />

        {/* Dynamic Tab Body - Right Side Workspace Animations Only */}
        <main className="p-6 sm:p-8 space-y-8 max-w-7xl w-full mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              {activeTab === 'super-admin' && <SuperAdminTab />}

              {activeTab === 'dashboard' && (
                <div className="space-y-8">
                  {/* User Profile Banner Header */}
                  <UserProfileBanner />

                  {/* Row 1: 4 Statistic Cards */}
                  <MetricCardsGrid />

                  {/* Row 2: Network Activity Chart (Left) & Recent Security Alerts (Right) */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-7">
                      <NetworkActivityChart />
                    </div>
                    <div className="lg:col-span-5">
                      <RecentAlertsWidget />
                    </div>
                  </div>

                  {/* Row 3: Threat Overview Donut Chart (Left) & AI Security Insights (Right) */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-6">
                      <ThreatDistributionChart />
                    </div>
                    <div className="lg:col-span-6">
                      <AiInsightsWidget />
                    </div>
                  </div>

                  {/* Row 4: Recent Activity Timeline (Left) & Quick Actions (Right) */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-5">
                      <RecentActivityWidget />
                    </div>
                    <div className="lg:col-span-7">
                      <QuickActionsWidget
                        onGenerateReport={handleGenerateReport}
                        onAskAi={handleAskAi}
                        onRefreshDashboard={handleRefreshDashboard}
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'threats' && <ThreatMonitorTab />}
              {activeTab === 'connected-devices' && <ConnectedDevicesTab />}
              {activeTab === 'reports' && <ReportsTab />}
              {activeTab === 'ai-assistant' && <AiAssistantTab />}
              {activeTab === 'settings' && <SettingsTab />}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Global Drawers */}
        <SecurityOverviewDrawer
          isOpen={isSecurityOverviewOpen}
          onClose={() => setIsSecurityOverviewOpen(false)}
        />

      </div>
    </div>
  );
};

export const DashboardPage: React.FC<DashboardPageProps> = (props) => {
  return (
    <ThreatProvider>
      <DashboardPageInner {...props} />
    </ThreatProvider>
  );
};
