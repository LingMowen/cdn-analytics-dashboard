import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  async (error) => {
    const config = error.config || {};
    const url = config.url || '';
    const method = (config.method || 'get').toLowerCase();

    const isNetworkError = !error.response && !!error.request;
    const isTimeout = error.code === 'ECONNABORTED';
    const isCanceled = error.code === 'ERR_CANCELED';

    if (!config.__retryCount) config.__retryCount = 0;

    if (!isCanceled && method === 'get' && (isNetworkError || isTimeout) && config.__retryCount < 2) {
      config.__retryCount += 1;
      await sleep(250 * config.__retryCount);
      return api.request(config);
    }

    if (error.response) {
      const status = error.response.status;
      const message = error.response?.data?.error || error.response?.data?.message || error.message;

      if (status >= 500) {
        console.warn(`API ${status} [${method.toUpperCase()} ${url}]:`, message);
      } else if (status !== 401) {
        console.warn(`API ${status} [${method.toUpperCase()} ${url}]:`, message);
      }
    } else if (!isCanceled) {
      console.warn(`API Network Error [${method.toUpperCase()} ${url}]:`, error.message);
    }

    return Promise.reject(error);
  }
);

export default api;
