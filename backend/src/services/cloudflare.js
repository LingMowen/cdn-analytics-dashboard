import axios from 'axios';
import { BaseService } from './base.js';

export class CloudflareService extends BaseService {
  constructor(config) {
    super(config);
    this.apiEndpoint = 'https://api.cloudflare.com/client/v4/graphql';
  }

  async validateCredentials(account) {
    try {
      const testQuery = `
        query {
          viewer {
            zones(limit: 50) {
              zoneTag
            }
          }
        }`;

      const response = await axios.post(
        this.apiEndpoint,
        { query: testQuery },
        {
          headers: {
            'Authorization': `Bearer ${account.token}`,
            'Content-Type': 'application/json'
          },
          timeout: 15000
        }
      );

      if (response.data.errors) {
        return {
          valid: false,
          error: 'API access denied',
          details: response.data.errors
        };
      }

      const accessibleZones = response.data.data?.viewer?.zones || [];
      return {
        valid: true,
        accessibleZones: accessibleZones.length,
        zones: accessibleZones
      };
    } catch (error) {
      return {
        valid: false,
        error: error.message,
        httpStatus: error.response?.status
      };
    }
  }

  async fetchZones(account) {
    try {
      const query = `
        query {
          viewer {
            zones {
              zoneTag
              name
            }
          }
        }`;

      const response = await axios.post(
        this.apiEndpoint,
        { query },
        {
          headers: {
            'Authorization': `Bearer ${account.token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data.data.viewer.zones;
    } catch (error) {
      throw new Error(`Failed to fetch zones: ${error.message}`);
    }
  }

  async fetchMetrics(account, zoneId, startTime, endTime, interval = 'day') {
    try {
      const query = interval === 'hour' ? `
        query($zone: String!, $since: Time!, $until: Time!) {
          viewer {
            zones(filter: {zoneTag: $zone}) {
              httpRequests1hGroups(
                filter: {datetime_geq: $since, datetime_leq: $until}
                limit: 200
                orderBy: [datetime_DESC]
              ) {
                dimensions {
                  datetime
                }
                sum {
                  requests
                  bytes
                  threats
                  cachedRequests
                  cachedBytes
                }
              }
            }
          }
        }` : `
        query($zone: String!, $since: Date!, $until: Date!) {
          viewer {
            zones(filter: {zoneTag: $zone}) {
              httpRequests1dGroups(
                filter: {date_geq: $since, date_leq: $until}
                limit: 100
                orderBy: [date_DESC]
              ) {
                dimensions {
                  date
                }
                sum {
                  requests
                  bytes
                  threats
                  cachedRequests
                  cachedBytes
                }
              }
            }
          }
        }`;

      const response = await axios.post(
        this.apiEndpoint,
        { query, variables: { zone: zoneId, since: startTime, until: endTime } },
        {
          headers: {
            'Authorization': `Bearer ${account.token}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );

      const dataKey = interval === 'hour' ? 'httpRequests1hGroups' : 'httpRequests1dGroups';
      return response.data.data.viewer.zones[0][dataKey];
    } catch (error) {
      throw new Error(`Failed to fetch metrics: ${error.message}`);
    }
  }

  async fetchGeography(account, zoneId, startTime, endTime) {
    try {
      const query = `
        query($zone: String!, $since: Date!, $until: Date!) {
          viewer {
            zones(filter: {zoneTag: $zone}) {
              httpRequests1dGroups(
                filter: {date_geq: $since, date_leq: $until}
                limit: 100
                orderBy: [date_DESC]
              ) {
                dimensions {
                  date
                }
                sum {
                  countryMap {
                    bytes
                    requests
                    threats
                    clientCountryName
                  }
                }
              }
            }
          }
        }`;

      const response = await axios.post(
        this.apiEndpoint,
        { query, variables: { zone: zoneId, since: startTime, until: endTime } },
        {
          headers: {
            'Authorization': `Bearer ${account.token}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );

      const rawData = response.data.data.viewer.zones[0].httpRequests1dGroups;
      const countryStats = {};

      rawData.forEach(record => {
        if (record.sum?.countryMap && Array.isArray(record.sum.countryMap)) {
          record.sum.countryMap.forEach(countryData => {
            const country = countryData.clientCountryName;
            if (country && country !== 'Unknown' && country !== '') {
              if (!countryStats[country]) {
                countryStats[country] = {
                  country,
                  requests: 0,
                  bytes: 0,
                  threats: 0
                };
              }
              countryStats[country].requests += countryData.requests || 0;
              countryStats[country].bytes += countryData.bytes || 0;
              countryStats[country].threats += countryData.threats || 0;
            }
          });
        }
      });

      return Object.values(countryStats)
        .sort((a, b) => b.requests - a.requests)
        .slice(0, 15);
    } catch (error) {
      throw new Error(`Failed to fetch geography: ${error.message}`);
    }
  }

  formatData(rawData, interval = 'day') {
    return rawData.map(item => ({
      timestamp: interval === 'hour' ? item.dimensions.datetime : item.dimensions.date,
      requests: item.sum.requests,
      bytes: item.sum.bytes,
      threats: item.sum.threats,
      cachedRequests: item.sum.cachedRequests,
      cachedBytes: item.sum.cachedBytes
    }));
  }

  async fetchDashboardData(account, zone) {
    try {
      const daysSince = new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
      const daysUntil = new Date().toISOString().slice(0, 10);

      const hoursSince = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
      const hoursUntil = new Date().toISOString();

      const today = new Date().toISOString().slice(0, 10);
      const geoSince = today;
      const geoUntil = today;

      const [raw, rawHours, geography] = await Promise.all([
        this.fetchMetrics(account, zone.zone_id, daysSince, daysUntil, 'day'),
        this.fetchMetrics(account, zone.zone_id, hoursSince, hoursUntil, 'hour'),
        this.fetchGeography(account, zone.zone_id, geoSince, geoUntil)
      ]);

      return {
        domain: zone.domain,
        raw: raw || [],
        rawHours: rawHours || [],
        geography: geography || []
      };
    } catch (error) {
      throw new Error(`Dashboard data fetch failed: ${error.message}`);
    }
  }
}
