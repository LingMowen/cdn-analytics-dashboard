import api from './api';

export const cloudflareAPI = {
  getConfig: () => api.get('/cloudflare/config'),
  getZones: () => api.get('/cloudflare/zones'),
  getAnalytics: () => api.get('/cloudflare/analytics'),
  getMetrics: (params) => api.get('/cloudflare/metrics', { params }),
  getGeography: (params) => api.get('/cloudflare/geography', { params })
};
