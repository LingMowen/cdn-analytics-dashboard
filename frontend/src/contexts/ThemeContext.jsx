import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// 预设主题色
export const presetColors = [
  { name: 'blue', value: '221.2 83.2% 53.3%', label: '蓝色' },
  { name: 'green', value: '142.1 76.2% 36.3%', label: '绿色' },
  { name: 'purple', value: '262.1 83.3% 57.8%', label: '紫色' },
  { name: 'orange', value: '24.6 95% 53.1%', label: '橙色' },
  { name: 'pink', value: '330.4 81.2% 60.4%', label: '粉色' },
  { name: 'red', value: '0 72.2% 50.6%', label: '红色' },
  { name: 'cyan', value: '189.5 94.5% 43.1%', label: '青色' },
  { name: 'yellow', value: '47.9 95.8% 53.1%', label: '黄色' },
];

// 生成主题 CSS 变量
const generateThemeVariables = (primaryHue, isDark = false) => {
  const hue = primaryHue;
  
  if (isDark) {
    return {
      '--primary': `${hue} 70% 60%`,
      '--primary-foreground': `${hue} 20% 10%`,
      '--ring': `${hue} 70% 60%`,
    };
  } else {
    return {
      '--primary': `${hue} 70% 50%`,
      '--primary-foreground': '0 0% 100%',
      '--ring': `${hue} 70% 50%`,
    };
  }
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');
  const [themeColors, setThemeColors] = useState({
    light: localStorage.getItem('theme-color-light') || '221.2 83.2% 53.3%',
    dark: localStorage.getItem('theme-color-dark') || '221.2 83.2% 53.3%',
    sync: localStorage.getItem('theme-color-sync') === 'true',
  });

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    
    // 应用保存的主题色
    applyThemeColors();
  }, []);

  useEffect(() => {
    applyThemeColors();
  }, [theme, themeColors]);

  const applyThemeColors = () => {
    const root = document.documentElement;
    const currentColor = theme === 'dark' ? themeColors.dark : themeColors.light;
    const hue = currentColor.split(' ')[0];
    
    const variables = generateThemeVariables(parseFloat(hue), theme === 'dark');
    
    Object.entries(variables).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  const updateLightColor = (color) => {
    const newColors = { ...themeColors, light: color };
    if (themeColors.sync) {
      newColors.dark = color;
    }
    setThemeColors(newColors);
    localStorage.setItem('theme-color-light', color);
    if (themeColors.sync) {
      localStorage.setItem('theme-color-dark', color);
    }
  };

  const updateDarkColor = (color) => {
    const newColors = { ...themeColors, dark: color };
    setThemeColors(newColors);
    localStorage.setItem('theme-color-dark', color);
  };

  const toggleSyncColors = () => {
    const newSync = !themeColors.sync;
    const newColors = { 
      ...themeColors, 
      sync: newSync,
      dark: newSync ? themeColors.light : themeColors.dark
    };
    setThemeColors(newColors);
    localStorage.setItem('theme-color-sync', newSync);
    if (newSync) {
      localStorage.setItem('theme-color-dark', themeColors.light);
    }
  };

  const resetThemeColors = () => {
    const defaultColors = {
      light: '221.2 83.2% 53.3%',
      dark: '221.2 83.2% 53.3%',
      sync: false,
    };
    setThemeColors(defaultColors);
    localStorage.removeItem('theme-color-light');
    localStorage.removeItem('theme-color-dark');
    localStorage.removeItem('theme-color-sync');
  };

  return (
    <ThemeContext.Provider 
      value={{ 
        theme, 
        toggleTheme, 
        themeColors,
        updateLightColor,
        updateDarkColor,
        toggleSyncColors,
        resetThemeColors,
        presetColors,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};
