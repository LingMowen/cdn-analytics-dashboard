import { BaseService } from './base.js';

const ESA_DOMAINS = {
  'cn': 'waf.cn-shanghai.aliyuncs.com',
  'international': 'waf.ap-southeast-1.aliyuncs.com'
};

const ESA_REGIONS = {
  'cn': 'cn-shanghai',
  'international': 'ap-southeast-1'
};

export class AliyunESAService extends BaseService {
  constructor(config) {
    super(config);
    this.domain = ESA_DOMAINS[config.region] || ESA_DOMAINS['cn'];
    this.apiVersion = '2021-12-29';
  }

  _createClient(account) {
    const https = require('https');
    return {
      endpoint: this.domain,
      accessKeyId: account.accessKeyId,
      accessKeySecret: account.accessKeySecret,
      regionId: ESA_REGIONS[account.region] || ESA_REGIONS['cn']
    };
  }

  async _makeRequest(account, action, params = {}) {
    const timestamp = new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14);
    const commonParams = {
      Format: 'json',
      Version: this.apiVersion,
      AccessKeyId: account.accessKeyId,
      SignatureMethod: 'HMAC-SHA1',
      Timestamp: timestamp,
      SignatureVersion: '1.0',
      SignatureNonce: Math.random().toString(36).substring(2),
      Action: action
    };

    const sortedParams = { ...commonParams, ...params };
    const sortedKeys = Object.keys(sortedParams).sort();
    
    const canonicalizedQueryString = sortedKeys.map(key => {
      const encodedKey = encodeURIComponent(key);
      const encodedValue = encodeURIComponent(sortedParams[key]);
      return `${encodedKey}=${encodedValue}`;
    }).join('&');

    const stringToSign = `GET&%2F&${encodeURIComponent(canonicalizedQueryString)}`;
    const signature = require('crypto').createHmac('sha1', `${account.accessKeySecret}&`)
      .update(stringToSign)
      .digest('base64');

    sortedParams.Signature = signature;

    const queryString = Object.keys(sortedParams).map(key => {
      return `${encodeURIComponent(key)}=${encodeURIComponent(sortedParams[key])}`;
    }).join('&');

    const url = `https://${this.domain}/?${queryString}`;

    return new Promise((resolve, reject) => {
      const https = require('https');
      const req = https.get(url, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const json = JSON.parse(data);
            if (json.Code === 'OK') {
              resolve(json);
            } else {
              reject(new Error(json.Message || 'API request failed'));
            }
          } catch (e) {
            reject(e);
          }
        });
      });
      req.on('error', reject);
      req.setTimeout(10000, () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });
    });
  }

  async validateCredentials(account) {
    try {
      await this._makeRequest(account, 'DescribeInstances');
      return { valid: true };
    } catch (error) {
      return { valid: false, error: error.message };
    }
  }

  async fetchZones(account) {
    try {
      const response = await this._makeRequest(account, 'DescribeInstances', {
        InstanceId: '',
        PageSize: 100
      });

      if (response.Instances && response.Instances.Instance) {
        return response.Instances.Instance.map((instance, index) => ({
          id: instance.InstanceId,
          name: instance.Domain || `ESA-${index + 1}`,
          domain: instance.Domain,
          region: instance.RegionId,
          status: instance.Status
        }));
      }
      return [];
    } catch (error) {
      console.error('Failed to fetch ESA zones:', error.message);
      return [];
    }
  }

  async fetchMetrics(zoneId, startTime, endTime, interval, account) {
    try {
      const start = new Date(startTime).toISOString().replace(/[-:T.]/g, '').slice(0, 14);
      const end = new Date(endTime).toISOString().replace(/[-:T.]/g, '').slice(0, 14);

      const response = await this._makeRequest(account, 'DescribeDomainMetrics', {
        StartTime: start,
        EndTime: end,
        Interval: interval || 'hour',
        Metric: 'bps,traf,request'
      });

      return this._formatMetrics(response);
    } catch (error) {
      console.error('Failed to fetch ESA metrics:', error.message);
      return this._getEmptyMetrics();
    }
  }

  async fetchDashboardData(account, zone) {
    const endTime = new Date();
    const startTime = new Date(endTime.getTime() - 24 * 60 * 60 * 1000);

    try {
      const [trafficMetrics, requestMetrics] = await Promise.all([
        this.fetchMetrics(zone.id, startTime, endTime, 'hour', account),
        this._fetchRequestMetrics(zone.id, startTime, endTime, account)
      ]);

      return {
        domain: zone.domain || zone.name,
        traffic: trafficMetrics,
        requests: requestMetrics,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error(`ESA ${zone.domain} fetch failed:`, error.message);
      return {
        domain: zone.domain || zone.name,
        traffic: this._getEmptyMetrics(),
        requests: { total: 0, trend: [] },
        error: error.message
      };
    }
  }

  async _fetchRequestMetrics(zoneId, startTime, endTime, account) {
    try {
      const start = new Date(startTime).toISOString().replace(/[-:T.]/g, '').slice(0, 14);
      const end = new Date(endTime).toISOString().replace(/[-:T.]/g, '').slice(0, 14);

      const response = await this._makeRequest(account, 'DescribeDomainMetrics', {
        StartTime: start,
        EndTime: end,
        Interval: 'hour',
        Metric: 'request'
      });

      if (response.Metrics && response.Metrics.Metric) {
        const requestMetric = response.Metrics.Metric.find(m => m.Key === 'request');
        if (requestMetric && requestMetric.Values && requestMetric.Values.Value) {
          const total = requestMetric.Values.Value.reduce((sum, v) => sum + (parseInt(v.Value) || 0), 0);
          return {
            total,
            trend: requestMetric.Values.Value.map(v => ({
              timestamp: v.Timestamp,
              value: parseInt(v.Value) || 0
            }))
          };
        }
      }
      return { total: 0, trend: [] };
    } catch (error) {
      console.error('Failed to fetch request metrics:', error.message);
      return { total: 0, trend: [] };
    }
  }

  _formatMetrics(response) {
    if (!response || !response.Metrics || !response.Metrics.Metric) {
      return this._getEmptyMetrics();
    }

    const metrics = {};
    for (const metric of response.Metrics.Metric) {
      if (metric.Values && metric.Values.Value) {
        metrics[metric.Key] = {
          values: metric.Values.Value.map(v => ({
            timestamp: v.Timestamp,
            value: parseFloat(v.Value) || 0
          }))
        };
      }
    }

    return {
      bandwidth: this._calculateBandwidth(metrics.bps),
      traffic: this._calculateTraffic(metrics.traf),
      requests: this._calculateRequests(metrics.request),
      raw: metrics
    };
  }

  _calculateBandwidth(bpsMetric) {
    if (!bpsMetric || !bpsMetric.values) {
      return { peak: 0, trend: [], total: 0, unit: 'Mbps' };
    }

    const values = bpsMetric.values;
    const peak = Math.max(...values.map(v => v.value / 1000000));
    const total = values.reduce((sum, v) => sum + v.value, 0) / 8;

    return {
      peak,
      total,
      unit: 'Mbps',
      trend: values.map(v => ({
        timestamp: v.timestamp,
        value: v.value / 1000000
      }))
    };
  }

  _calculateTraffic(trafMetric) {
    if (!trafMetric || !trafMetric.values) {
      return { total: 0, unit: 'GB', trend: [] };
    }

    const values = trafMetric.values;
    const total = values.reduce((sum, v) => sum + v.value, 0) / 1073741824;

    return {
      total,
      unit: 'GB',
      trend: values.map(v => ({
        timestamp: v.timestamp,
        value: v.value / 1073741824
      }))
    };
  }

  _calculateRequests(requestMetric) {
    if (!requestMetric || !requestMetric.values) {
      return { total: 0, unit: 'requests', trend: [] };
    }

    const values = requestMetric.values;
    const total = values.reduce((sum, v) => sum + v.value, 0);

    return {
      total,
      unit: 'requests',
      trend: values.map(v => ({
        timestamp: v.timestamp,
        value: v.value
      }))
    };
  }

  _getEmptyMetrics() {
    return {
      bandwidth: { peak: 0, total: 0, unit: 'Mbps', trend: [] },
      traffic: { total: 0, unit: 'GB', trend: [] },
      requests: { total: 0, unit: 'requests', trend: [] },
      raw: []
    };
  }
}
