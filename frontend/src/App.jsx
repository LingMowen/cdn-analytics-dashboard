import React, { useEffect, useState } from 'react';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext.jsx';
import { ThemeProvider } from './contexts/ThemeContext.jsx';
import { PlatformProvider, usePlatform } from './contexts/PlatformContext.jsx';
import { RefreshProvider } from './contexts/RefreshContext.jsx';
import Header from './components/common/Header';
import CFDashboard from './components/cloudflare/Dashboard';
import EODashboard from './components/edgeone/Dashboard';
import UnifiedDashboard from './components/common/UnifiedDashboard';
import './index.css';

function AppContent() {
  const { t } = useLanguage();
  const { platform } = usePlatform();
  const [config, setConfig] = useState(null);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const response = await fetch('/api/edgeone/config');
      if (!response.ok) {
        const body = await response.text().catch(() => '');
        throw new Error(body || `HTTP ${response.status}`);
      }

      const text = await response.text();
      if (!text) return;

      const data = JSON.parse(text);
      setConfig(data);
      if (data.siteName) {
        document.title = data.siteName;
      }
    } catch (err) {
      console.error("Error fetching config:", err);
    }
  };

  return (
    <div className="app-container min-h-screen w-full">
      <Header />
      <main className="w-full px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        {platform === 'unified' && <UnifiedDashboard />}
        {platform === 'cloudflare' && <CFDashboard />}
        {platform === 'edgeone' && <EODashboard />}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <PlatformProvider>
          <RefreshProvider>
            <AppContent />
          </RefreshProvider>
        </PlatformProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
