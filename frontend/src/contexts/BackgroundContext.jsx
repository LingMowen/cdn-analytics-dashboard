import React, { createContext, useContext, useState, useEffect } from 'react';

const BackgroundContext = createContext();

export const useBackground = () => {
  const context = useContext(BackgroundContext);
  if (!context) {
    throw new Error('useBackground must be used within a BackgroundProvider');
  }
  return context;
};

export const BackgroundProvider = ({ children }) => {
  const [backgroundSettings, setBackgroundSettings] = useState({
    image: localStorage.getItem('bg-image') || '',
    opacity: parseFloat(localStorage.getItem('bg-opacity')) || 0.15,
    blur: parseInt(localStorage.getItem('bg-blur')) || 0,
    enabled: localStorage.getItem('bg-enabled') === 'true' || false,
  });

  useEffect(() => {
    applyBackgroundSettings(backgroundSettings);
  }, [backgroundSettings]);

  const applyBackgroundSettings = (settings) => {
    const root = document.documentElement;
    
    if (settings.enabled && settings.image) {
      root.style.setProperty('--bg-image', `url(${settings.image})`);
      root.style.setProperty('--bg-opacity', settings.opacity);
      root.style.setProperty('--bg-blur', `${settings.blur}px`);
      root.classList.add('custom-background');
    } else {
      root.classList.remove('custom-background');
      root.style.removeProperty('--bg-image');
      root.style.removeProperty('--bg-opacity');
      root.style.removeProperty('--bg-blur');
    }
  };

  const updateBackground = (image) => {
    const newSettings = { ...backgroundSettings, image, enabled: !!image };
    setBackgroundSettings(newSettings);
    localStorage.setItem('bg-image', image);
    localStorage.setItem('bg-enabled', !!image);
  };

  const updateOpacity = (opacity) => {
    const newSettings = { ...backgroundSettings, opacity };
    setBackgroundSettings(newSettings);
    localStorage.setItem('bg-opacity', opacity);
  };

  const updateBlur = (blur) => {
    const newSettings = { ...backgroundSettings, blur };
    setBackgroundSettings(newSettings);
    localStorage.setItem('bg-blur', blur);
  };

  const toggleBackground = () => {
    const newSettings = { ...backgroundSettings, enabled: !backgroundSettings.enabled };
    setBackgroundSettings(newSettings);
    localStorage.setItem('bg-enabled', newSettings.enabled);
  };

  const resetBackground = () => {
    const defaultSettings = {
      image: '',
      opacity: 0.15,
      blur: 0,
      enabled: false,
    };
    setBackgroundSettings(defaultSettings);
    localStorage.removeItem('bg-image');
    localStorage.removeItem('bg-opacity');
    localStorage.removeItem('bg-blur');
    localStorage.removeItem('bg-enabled');
  };

  return (
    <BackgroundContext.Provider
      value={{
        backgroundSettings,
        updateBackground,
        updateOpacity,
        updateBlur,
        toggleBackground,
        resetBackground,
      }}
    >
      {children}
    </BackgroundContext.Provider>
  );
};
