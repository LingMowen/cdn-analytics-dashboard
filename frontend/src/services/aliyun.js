import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_TARGET || '';

export const aliyunAPI = {
  async getConfig() {
    try {
      const response = await axios.get(`${API_BASE}/api/aliyun/config`);
      return response.data;
    } catch (error) {
      return { accounts: [], hasConfig: false };
    }
  },

  async getZones() {
    try {
      const response = await axios.get(`${API_BASE}/api/aliyun/zones`);
      return response.data;
    } catch (error) {
      return { zones: [] };
    }
  },

  async getAnalytics(startTime, endTime, interval) {
    try {
      const params = new URLSearchParams();
      if (startTime) params.append('startTime', startTime);
      if (endTime) params.append('endTime', endTime);
      if (interval) params.append('interval', interval);

      const response = await axios.get(`${API_BASE}/api/aliyun/analytics?${params}`);
      return response.data;
    } catch (error) {
      return { analytics: [] };
    }
  },

  async getDashboard(zoneId) {
    try {
      const params = zoneId ? `?zoneId=${zoneId}` : '';
      const response = await axios.get(`${API_BASE}/api/aliyun/dashboard${params}`);
      return response.data;
    } catch (error) {
      return { dashboard: [] };
    }
  }
};
