import React, { createContext, useContext, useEffect, useState } from 'react';
import { cloudflareAPI } from '../services/cloudflare';
import { edgeoneAPI } from '../services/edgeone';

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
    edgeone: false
  });

  useEffect(() => {
    const checkAvailability = async () => {
      const results = await Promise.allSettled([
        cloudflareAPI.getAnalytics(),
        edgeoneAPI.getZones()
      ]);

      const cfEnabled =
        results[0].status === 'fulfilled' && (results[0].value?.accounts?.length || 0) > 0;
      const eoEnabled =
        results[1].status === 'fulfilled' && (results[1].value?.length || 0) > 0;

      const unifiedEnabled = (cfEnabled && eoEnabled) || (!cfEnabled && !eoEnabled);

      setPlatformAvailability({
        unified: unifiedEnabled,
        cloudflare: cfEnabled,
        edgeone: eoEnabled
      });

      setPlatform((current) => {
        const preferredDefault = cfEnabled && eoEnabled
          ? 'unified'
          : eoEnabled
            ? 'edgeone'
            : cfEnabled
              ? 'cloudflare'
              : 'unified';

        if (current === 'cloudflare' && !cfEnabled) return preferredDefault;
        if (current === 'edgeone' && !eoEnabled) return preferredDefault;
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
