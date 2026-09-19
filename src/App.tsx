/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { LoginPage } from './pages/LoginPage';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { AuthProvider } from './context/AuthContext';

export default function App() {
  const [currentView, setCurrentView] = useState<'login' | 'dashboard' | 'landing'>('login');

  return (
    <AuthProvider>
      {currentView === 'login' && (
        <LoginPage 
          onLoginSuccess={() => setCurrentView('dashboard')} 
          onNavigateToLanding={() => setCurrentView('landing')}
        />
      )}

      {currentView === 'dashboard' && (
        <DashboardPage 
          onReturnToHome={() => setCurrentView('login')} 
        />
      )}

      {currentView === 'landing' && (
        <LandingPage 
          onLaunchConsole={() => setCurrentView('login')} 
        />
      )}
    </AuthProvider>
  );
}



