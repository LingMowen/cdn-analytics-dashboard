export class BaseService {
  constructor(config) {
    this.config = config;
  }

  async validateCredentials() {
    throw new Error('validateCredentials must be implemented');
  }

  async fetchZones() {
    throw new Error('fetchZones must be implemented');
  }

  async fetchMetrics(zoneId, startTime, endTime, interval) {
    throw new Error('fetchMetrics must be implemented');
  }

  async fetchGeography(zoneId, startTime, endTime) {
    throw new Error('fetchGeography must be implemented');
  }

  async fetchCacheStats(zoneId, startTime, endTime) {
    throw new Error('fetchCacheStats must be implemented');
  }

  async fetchOriginPull(zoneId, startTime, endTime) {
    throw new Error('fetchOriginPull must be implemented');
  }

  async fetchTopAnalysis(zoneId, metric, startTime, endTime) {
    throw new Error('fetchTopAnalysis must be implemented');
  }

  formatData(rawData) {
    throw new Error('formatData must be implemented');
  }
}
