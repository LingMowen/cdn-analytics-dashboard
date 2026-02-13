import React, { createContext, useContext, useEffect, useState } from 'react';
import { cloudflareAPI } from '../services/cloudflare';
import { edgeoneAPI } from '../services/edgeone';
import { aliyunAPI } from '../services/aliyun';

const PlatformContext = createContext();

export const usePlatform = () => {
  const context = useContext(PlatformContext);
  if (!context) {
    throw new Error('usePlatform must be used within a PlatformProvider');
  }
  return context;
};

export const PlatformProvider = ({ children }) => {
  const [platform, setPlatform] = useState('unified');
  const [platformAvailability, setPlatformAvailability] = useState({
    unified: true,
    cloudflare: false,
    edgeone: false,
    aliyun: false
  });

  useEffect(() => {
    const checkAvailability = async () => {
      const results = await Promise.allSettled([
        cloudflareAPI.getAnalytics(),
        edgeoneAPI.getZones(),
        aliyunAPI.getZones()
      ]);

      const cfEnabled =
        results[0].status === 'fulfilled' && (results[0].value?.accounts?.length || 0) > 0;
      const eoEnabled =
        results[1].status === 'fulfilled' && (results[1].value?.length || 0) > 0;
      const aliyunEnabled =
        results[2].status === 'fulfilled' && (results[2].value?.zones?.length || 0) > 0;

      const unifiedEnabled = (cfEnabled && eoEnabled) || (!cfEnabled && !eoEnabled && !aliyunEnabled);

      setPlatformAvailability({
        unified: unifiedEnabled,
        cloudflare: cfEnabled,
        edgeone: eoEnabled,
        aliyun: aliyunEnabled
      });

      setPlatform((current) => {
        const enabledPlatforms = [cfEnabled, eoEnabled, aliyunEnabled].filter(Boolean).length;
        const preferredDefault = cfEnabled && eoEnabled && aliyunEnabled
          ? 'unified'
          : aliyunEnabled
            ? 'aliyun'
            : eoEnabled
              ? 'edgeone'
              : cfEnabled
                ? 'cloudflare'
                : 'unified';

        if (current === 'cloudflare' && !cfEnabled) return preferredDefault;
        if (current === 'edgeone' && !eoEnabled) return preferredDefault;
        if (current === 'aliyun' && !aliyunEnabled) return preferredDefault;
        if (current === 'unified' && !unifiedEnabled) return preferredDefault;
        if (current === 'unified') return preferredDefault;
        return current;
      });
    };

    checkAvailability();
  }, []);

  const changePlatform = (newPlatform) => {
    setPlatform(newPlatform);
  };

  return (
    <PlatformContext.Provider value={{ platform, changePlatform, platformAvailability }}>
      {children}
    </PlatformContext.Provider>
  );
};
