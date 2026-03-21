import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';

export default function LanguageSwitch() {
  const { language, changeLanguage } = useLanguage();
  const { theme } = useTheme();

  return (
    <button
      onClick={() => changeLanguage(language === 'zh' ? 'en' : 'zh')}
      className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-colors min-h-[36px] sm:min-h-[44px] ${
        theme === 'dark'
          ? 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
          : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
      }`}
    >
      {language === 'zh' ? 'EN' : '中文'}
    </button>
  );
}
