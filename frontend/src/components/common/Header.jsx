import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useRefresh } from '../../contexts/RefreshContext';
import { usePlatform } from '../../contexts/PlatformContext';
import PlatformSwitch from './PlatformSwitch';
import BackgroundSettings from './BackgroundSettings';
import ThemeColorSettings from './ThemeColorSettings';

export default function Header() {
  const { t, language } = useLanguage();
  const { platformAvailability } = usePlatform();
  const { triggerRefresh } = useRefresh();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const menuRef = useRef(null);

  const enabledPlatformsCount =
    (platformAvailability?.cloudflare ? 1 : 0) + (platformAvailability?.edgeone ? 1 : 0);
  const isSingleApiMode = platformAvailability && !platformAvailability.unified && enabledPlatformsCount === 1;
  const singlePlatformKey = platformAvailability?.edgeone ? 'edgeone' : 'cloudflare';

  const title = isSingleApiMode
    ? language === 'zh'
      ? `${t(singlePlatformKey)}监控仪表盘`
      : `${t(singlePlatformKey)} Monitor Dashboard`
    : t('dashboardTitle');

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    triggerRefresh();
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      <header 
        className={`
          sticky top-0 z-50 w-full transition-all duration-300
          ${isScrolled 
            ? 'glass shadow-lg' 
            : 'bg-card border-b'
          }
        `}
      >
        <div className="w-full px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <button
                onClick={toggleMobileMenu}
                className="md:hidden p-2.5 hover:bg-secondary/80 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95"
                aria-label="Toggle menu"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="24" 
                  height="24" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  className="transition-transform duration-300"
                  style={{ transform: isMobileMenuOpen ? 'rotate(90deg)' : 'rotate(0deg)' }}
                >
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              </button>
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold truncate max-w-[120px] sm:max-w-[200px] lg:max-w-none">
                {title}
              </h1>
            </div>
            
            <div className="hidden md:flex items-center space-x-3 lg:space-x-4">
              <ThemeColorSettings />
              <BackgroundSettings />
              <PlatformSwitch />
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 hover:shadow-lg transition-all duration-200 disabled:opacity-70 min-h-[44px] hover-lift"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="18" 
                  height="18" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  className={`${isRefreshing ? 'animate-spin' : ''} transition-transform duration-300`}
                  style={{ transform: isRefreshing ? 'rotate(360deg)' : 'rotate(0deg)' }}
                >
                  <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                  <path d="M3 3v5h5" />
                  <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                  <path d="M16 21h5v-5" />
                </svg>
                <span className="hidden sm:inline">{t('refresh')}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-50 md:hidden"
          style={{ position: 'fixed' }}
        >
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div 
            ref={menuRef}
            className="absolute left-0 top-0 h-full w-72 max-w-[85vw] glass shadow-2xl animate-slide-in-right overflow-y-auto"
          >
            <div className="p-4 border-b border-border/50">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">{t('menu')}</h2>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 hover:bg-secondary/80 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95"
                  aria-label="Close menu"
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="20" 
                    height="20" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                    className="transition-transform duration-300"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-4 space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                  <span className="text-sm font-medium text-muted-foreground">{t('platform')}</span>
                  <PlatformSwitch />
                </div>
              </div>

              <div className="border-t border-border/50 pt-4">
                <button
                  onClick={() => {
                    handleRefresh();
                    setIsMobileMenuOpen(false);
                  }}
                  disabled={isRefreshing}
                  className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 hover:shadow-lg transition-all duration-200 disabled:opacity-70 min-h-[44px] hover-lift"
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="20" 
                    height="20" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                    className={`${isRefreshing ? 'animate-spin' : ''} transition-transform duration-300`}
                    style={{ transform: isRefreshing ? 'rotate(360deg)' : 'rotate(0deg)' }}
                  >
                    <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                    <path d="M3 3v5h5" />
                    <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                    <path d="M16 21h5v-5" />
                  </svg>
                  {t('refresh')}
                </button>
              </div>

              <div className="border-t border-border/50 pt-4 space-y-2">
                <div className="px-3 py-2">
                  <p className="text-xs text-muted-foreground">{t('dashboardTitle')}</p>
                </div>
                <div className="grid gap-2">
                  <button 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg bg-secondary/30 hover:bg-secondary/60 transition-all duration-200 hover:translate-x-1"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                      <polyline points="9 22 9 12 15 12 15 22"/>
                    </svg>
                    <span className="text-sm font-medium">{t('dashboard')}</span>
                  </button>
                  <button 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg bg-secondary/30 hover:bg-secondary/60 transition-all duration-200 hover:translate-x-1"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"/>
                      <path d="M12 16v-4"/>
                      <path d="M12 8h.01"/>
                    </svg>
                    <span className="text-sm font-medium">{t('help')}</span>
                  </button>
                </div>
              </div>

              <div className="border-t border-border/50 pt-4">
                <div className="flex items-center justify-between px-3 py-2">
                  <span className="text-xs text-muted-foreground">{t('version')}</span>
                  <span className="text-xs text-muted-foreground">1.0.0</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
