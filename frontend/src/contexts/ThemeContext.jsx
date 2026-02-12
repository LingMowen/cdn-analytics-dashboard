import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// 预设主题色 - 开发者可在此处修改预设颜色
export const presetColors = {
  light: '221.2 83.2% 53.3%',  // 蓝色 - 可修改
  dark: '221.2 83.2% 53.3%',   // 蓝色 - 可修改
};

// 生成主题 CSS 变量
const generateThemeVariables = (primaryHue, isDark = false) => {
  const hue = parseFloat(primaryHue);
  
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

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    
    // 应用预设主题色
    applyThemeColors(savedTheme);
  }, []);

  const applyThemeColors = (currentTheme) => {
    const root = document.documentElement;
    const currentColor = currentTheme === 'dark' ? presetColors.dark : presetColors.light;
    const hue = currentColor.split(' ')[0];
    
    const variables = generateThemeVariables(parseFloat(hue), currentTheme === 'dark');
    
    Object.entries(variables).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
    applyThemeColors(newTheme);
  };

  return (
    <ThemeContext.Provider 
      value={{ 
        theme, 
        toggleTheme,
        presetColors,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};
