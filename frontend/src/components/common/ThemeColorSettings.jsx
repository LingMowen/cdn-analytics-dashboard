import React, { useState } from 'react';
import { useTheme, presetColors } from '../../contexts/ThemeContext.jsx';
import { useLanguage } from '../../contexts/LanguageContext.jsx';

export default function ThemeColorSettings() {
  const { t } = useLanguage();
  const {
    theme,
    themeColors,
    updateLightColor,
    updateDarkColor,
    toggleSyncColors,
    resetThemeColors,
  } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const getColorName = (value) => {
    const color = presetColors.find(c => c.value === value);
    return color ? color.label : t('custom');
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg bg-secondary/80 hover:bg-secondary transition-colors"
        title={t('themeColorSettings') || '主题色设置'}
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
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M12 2a10 10 0 0 1 10 10" />
          <path d="M12 12 2.5 8.5" />
          <path d="M12 12v10" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-80 bg-popover border border-border rounded-lg shadow-lg z-50 p-4 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">
                {t('themeColorSettings') || '主题色设置'}
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Sync Toggle */}
            <div className="flex items-center justify-between mb-4 p-3 rounded-lg bg-secondary/50">
              <span className="text-sm text-foreground">
                {t('syncColors') || '同步两种模式'}
              </span>
              <button
                onClick={toggleSyncColors}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  themeColors.sync ? 'bg-primary' : 'bg-muted'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    themeColors.sync ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Light Mode Color */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-foreground">
                  {t('lightModeColor') || '浅色模式'}
                </label>
                <span className="text-xs text-muted-foreground">
                  {getColorName(themeColors.light)}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {presetColors.map((color) => (
                  <button
                    key={`light-${color.name}`}
                    onClick={() => updateLightColor(color.value)}
                    className={`aspect-square rounded-lg border-2 transition-all ${
                      themeColors.light === color.value
                        ? 'border-primary scale-110'
                        : 'border-transparent hover:border-border'
                    }`}
                    style={{ backgroundColor: `hsl(${color.value})` }}
                    title={color.label}
                  />
                ))}
              </div>
            </div>

            {/* Dark Mode Color */}
            {!themeColors.sync && (
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-foreground">
                    {t('darkModeColor') || '深色模式'}
                  </label>
                  <span className="text-xs text-muted-foreground">
                    {getColorName(themeColors.dark)}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {presetColors.map((color) => (
                    <button
                      key={`dark-${color.name}`}
                      onClick={() => updateDarkColor(color.value)}
                      className={`aspect-square rounded-lg border-2 transition-all ${
                        themeColors.dark === color.value
                          ? 'border-primary scale-110'
                          : 'border-transparent hover:border-border'
                      }`}
                      style={{ backgroundColor: `hsl(${color.value})` }}
                      title={color.label}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Current Preview */}
            <div className="mb-4 p-3 rounded-lg bg-secondary/30">
              <div className="text-xs text-muted-foreground mb-2">
                {t('currentPreview') || '当前预览'}
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="text-xs text-muted-foreground mb-1">
                    {t('light') || '浅色'}
                  </div>
                  <div
                    className="h-8 rounded-lg"
                    style={{ backgroundColor: `hsl(${themeColors.light})` }}
                  />
                </div>
                {!themeColors.sync && (
                  <div className="flex-1">
                    <div className="text-xs text-muted-foreground mb-1">
                      {t('dark') || '深色'}
                    </div>
                    <div
                      className="h-8 rounded-lg"
                      style={{ backgroundColor: `hsl(${themeColors.dark})` }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Reset Button */}
            <button
              onClick={resetThemeColors}
              className="w-full py-2 px-3 rounded-lg border border-destructive text-destructive hover:bg-destructive/10 text-sm transition-colors"
            >
              {t('reset') || '重置'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
