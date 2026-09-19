import React from 'react';
import { Navbar } from '../components/Navbar';
import { Hero } from '../components/Hero';
import { LiveRadarWidget } from '../components/LiveRadarWidget';
import { AttackSimulator } from '../components/AttackSimulator';
import { FeatureShowcase } from '../components/FeatureShowcase';
import { ComparisonTable } from '../components/ComparisonTable';
import { CapacityCalculator } from '../components/CapacityCalculator';
import { Pricing } from '../components/Pricing';
import { Footer } from '../components/Footer';

interface LandingPageProps {
  onLaunchConsole?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLaunchConsole }) => {
  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 selection:bg-cyan-500 selection:text-slate-950">
      <Navbar onLaunchConsole={onLaunchConsole} />
      <main>
        <Hero onLaunchConsole={onLaunchConsole} />
        <LiveRadarWidget />
        <AttackSimulator />
        <FeatureShowcase />
        <ComparisonTable />
        <CapacityCalculator />
        <Pricing onSelectPlan={onLaunchConsole} />
      </main>
      <Footer />
    </div>
  );
};
