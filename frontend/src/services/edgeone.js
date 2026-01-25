import api from './api';

export const edgeoneAPI = {
  getConfig: () => api.get('/edgeone/config'),
  getZones: () => api.get('/edgeone/zones'),
  getMetrics: (params) => api.get('/edgeone/metrics', { params }),
  getGeography: (params) => api.get('/edgeone/geography', { params }),
  getOriginPull: (params) => api.get('/edgeone/origin-pull', { params }),
  getTopAnalysis: (params) => api.get('/edgeone/top-analysis', { params }),
  getPagesBuildCount: (params) => api.get('/edgeone/pages/build-count', { params }),
  getPagesCloudFunctionRequests: (params) => api.get('/edgeone/pages/cloud-function-requests', { params }),
  getPagesCloudFunctionMonthlyStats: (params) => api.get('/edgeone/pages/cloud-function-monthly-stats', { params })
};
