import React from 'react';
import { usePlatform } from '../../contexts/PlatformContext';
import { useLanguage } from '../../contexts/LanguageContext';
import LanguageSwitch from './LanguageSwitch';
import ThemeSwitch from './ThemeSwitch';

export default function PlatformSwitch() {
  const { platform, changePlatform, platformAvailability } = usePlatform();
  const { t } = useLanguage();

  const platforms = ['unified', 'cloudflare', 'edgeone'].filter((p) => {
    if (!platformAvailability) return true;
    return !!platformAvailability[p];
  });
  const showPlatformTabs = platforms.length > 1;

  return (
    <div className="flex items-center space-x-2">
      <LanguageSwitch />
      <ThemeSwitch />
      {showPlatformTabs && (
        <div className="flex items-center space-x-1 bg-secondary rounded-md p-1">
          {platforms.map((p) => (
            <button
              key={p}
              onClick={() => changePlatform(p)}
              className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-colors min-h-[36px] sm:min-h-[44px] ${
                platform === p
                  ? 'bg-primary text-primary-foreground'
                  : 'text-secondary-foreground hover:bg-secondary/80'
              }`}
            >
              {t(p)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
