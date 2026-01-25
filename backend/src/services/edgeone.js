import { teo } from "tencentcloud-sdk-nodejs-teo";
import { CommonClient } from "tencentcloud-sdk-nodejs-common";
import { BaseService } from './base.js';

const ORIGIN_PULL_METRICS = [
  'l7Flow_outFlux_hy',
  'l7Flow_outBandwidth_hy',
  'l7Flow_request_hy',
  'l7Flow_inFlux_hy',
  'l7Flow_inBandwidth_hy'
];

const TOP_ANALYSIS_METRICS = [
  'l7Flow_outFlux_country',
  'l7Flow_outFlux_province',
  'l7Flow_outFlux_statusCode',
  'l7Flow_outFlux_domain',
  'l7Flow_outFlux_url',
  'l7Flow_outFlux_resourceType',
  'l7Flow_outFlux_sip',
  'l7Flow_outFlux_referers',
  'l7Flow_outFlux_ua_device',
  'l7Flow_outFlux_ua_browser',
  'l7Flow_outFlux_ua_os',
  'l7Flow_outFlux_ua',
  'l7Flow_request_country',
  'l7Flow_request_province',
  'l7Flow_request_statusCode',
  'l7Flow_request_domain',
  'l7Flow_request_url',
  'l7Flow_request_resourceType',
  'l7Flow_request_sip',
  'l7Flow_request_referers',
  'l7Flow_request_ua_device',
  'l7Flow_request_ua_browser',
  'l7Flow_request_ua_os',
  'l7Flow_request_ua'
];

const SECURITY_METRICS = [
  'ccAcl_interceptNum',
  'ccManage_interceptNum',
  'ccRate_interceptNum'
];

const FUNCTION_METRICS = [
  'function_requestCount',
  'function_cpuCostTime'
];

export class EdgeOneService extends BaseService {
  constructor(config) {
    super(config);
  }

  _createClient(account) {
    const clientConfig = {
      credential: {
        secretId: account.secretId,
        secretKey: account.secretKey,
      },
      region: account.region || "ap-guangzhou",
      profile: {
        httpProfile: {
          endpoint: "teo.tencentcloudapi.com",
        },
      },
    };

    const TeoClient = teo.v20220901.Client;
    return new TeoClient(clientConfig);
  }

  _createCommonClient(account) {
    const clientConfig = {
      credential: {
        secretId: account.secretId,
        secretKey: account.secretKey,
      },
      region: account.region || "ap-guangzhou",
      profile: {
        httpProfile: {
          endpoint: "teo.tencentcloudapi.com",
        },
      },
    };

    return new CommonClient(
      "teo.tencentcloudapi.com",
      "2022-09-01",
      clientConfig
    );
  }

  async validateCredentials(account) {
    try {
      const client = this._createClient(account);
      const data = await client.DescribeZones({});
      return {
        valid: true,
        zones: data.Zones || []
      };
    } catch (error) {
      return {
        valid: false,
        error: error.message
      };
    }
  }

  async fetchZones(account) {
    try {
      const client = this._createClient(account);
      const data = await client.DescribeZones({});
      return data.Zones || [];
    } catch (error) {
      throw new Error(`Failed to fetch zones: ${error.message}`);
    }
  }

  async fetchMetrics(account, zoneId, startTime, endTime, interval = 'hour') {
    try {
      const client = this._createClient(account);
      
      const formatTime = (isoString) => {
          const d = new Date(isoString);
          return d.toISOString().split('.')[0] + 'Z';
      };

      const params = {
        StartTime: formatTime(startTime),
        EndTime: formatTime(endTime),
        MetricNames: ['l7Flow_outFlux', 'l7Flow_outBandwidth', 'l7Flow_request'], 
        ZoneIds: [zoneId]
      };

      if (interval && interval !== 'auto') {
         if (interval === 'min') interval = '5min';
         params.Interval = interval;
      }

      console.log('DEBUG EdgeOne fetchMetrics params:', JSON.stringify(params));

      const data = await client.DescribeTimingL7AnalysisData(params);
      return data.Data || [];
    } catch (error) {
      console.error(`[EdgeOne] fetchMetrics failed for zone ${zoneId}:`, error.message);
      throw new Error(`Failed to fetch metrics: ${error.message}`);
    }
  }

  async fetchGeography(account, zoneId, startTime, endTime) {
    try {
      const client = this._createClient(account);
      const formatTime = (isoString) => new Date(isoString).toISOString().split('.')[0] + 'Z';
      const params = {
        StartTime: formatTime(startTime),
        EndTime: formatTime(endTime),
        MetricName: 'l7Flow_request_country',
        ZoneIds: [zoneId]
      };

      const data = await client.DescribeTopL7AnalysisData(params);
      if (data.Data && data.Data.length > 0 && data.Data[0].DetailData) {
        return data.Data[0].DetailData.map(item => ({
            country: item.Key,
            value: item.Value
        }));
      }
      return [];
    } catch (error) {
      console.error(`[EdgeOne] fetchGeography failed for zone ${zoneId}:`, error.message);
      return []; 
    }
  }

  async fetchOriginPull(account, zoneId, startTime, endTime, interval = 'hour') {
    try {
      const client = this._createClient(account);
      const formatTime = (isoString) => new Date(isoString).toISOString().split('.')[0] + 'Z';
      const params = {
        StartTime: formatTime(startTime),
        EndTime: formatTime(endTime),
        MetricNames: ORIGIN_PULL_METRICS,
        ZoneIds: [zoneId]
      };

      if (interval && interval !== 'auto') {
        params.Interval = interval;
      }

      const data = await client.DescribeTimingL7OriginPullData(params);
      return data.Data || [];
    } catch (error) {
      console.error(`[EdgeOne] fetchOriginPull failed for zone ${zoneId}:`, error.message);
      return [];
    }
  }

  async fetchTopAnalysis(account, zoneId, metric, startTime, endTime) {
    try {
      let data;
      const formatTime = (isoString) => new Date(isoString).toISOString().split('.')[0] + 'Z';
      const sTime = formatTime(startTime);
      const eTime = formatTime(endTime);

      if (TOP_ANALYSIS_METRICS.includes(metric)) {
        const client = this._createClient(account);
        const params = {
          StartTime: sTime,
          EndTime: eTime,
          MetricName: metric,
          ZoneIds: [zoneId]
        };
        data = await client.DescribeTopL7AnalysisData(params);
      } else if (SECURITY_METRICS.includes(metric)) {
        const client = this._createCommonClient(account);
        const params = {
          StartTime: sTime,
          EndTime: eTime,
          MetricNames: [metric],
          ZoneIds: [zoneId]
        };
        data = await client.request("DescribeWebProtectionData", params);
      } else if (FUNCTION_METRICS.includes(metric)) {
        const client = this._createCommonClient(account);
        let metricNames = [metric];
        if (metric === 'function_cpuCostTime') {
          metricNames = ["function_requestCount", "function_cpuCostTime"];
        }
        const params = {
          StartTime: sTime,
          EndTime: eTime,
          MetricNames: metricNames,
          ZoneIds: [zoneId]
        };
        data = await client.request("DescribeTimingFunctionAnalysisData", params);
      } else {
        const client = this._createClient(account);
        const params = {
          StartTime: sTime,
          EndTime: eTime,
          MetricNames: [metric],
          ZoneIds: [zoneId]
        };
        data = await client.DescribeTimingL7AnalysisData(params);
      }

      return data.Data || data;
    } catch (error) {
      throw new Error(`Failed to fetch top analysis: ${error.message}`);
    }
  }

  async fetchPagesBuildCount(account, zoneId) {
    try {
      const client = this._createCommonClient(account);
      const params = {
        "Interface": "pages:DescribePagesDeploymentUsage",
        "Payload": "{}",
        "ZoneId": zoneId
      };

      const data = await client.request("DescribePagesResources", params);
      if (data && data.Result) {
        try {
          data.parsedResult = JSON.parse(data.Result);
        } catch (e) {
          console.error("Error parsing Result JSON:", e);
        }
      }
      return data;
    } catch (error) {
      throw new Error(`Failed to fetch pages build count: ${error.message}`);
    }
  }

  async fetchPagesCloudFunctionRequests(account, zoneId, startTime, endTime) {
    try {
      const client = this._createCommonClient(account);
      const payload = {
        ZoneId: zoneId,
        Interval: "hour"
      };

      const formatTime = (isoString) => new Date(isoString).toISOString().split('.')[0] + 'Z';

      if (startTime) payload.StartTime = formatTime(startTime);
      if (endTime) payload.EndTime = formatTime(endTime);

      const params = {
        "ZoneId": zoneId,
        "Interface": "pages:DescribePagesFunctionsRequestDataByZone",
        "Payload": JSON.stringify(payload)
      };

      const data = await client.request("DescribePagesResources", params);
      if (data && data.Result) {
        try {
          data.parsedResult = JSON.parse(data.Result);
        } catch (e) {
          console.error("Error parsing Result JSON:", e);
        }
      }
      return data;
    } catch (error) {
      throw new Error(`Failed to fetch pages cloud function requests: ${error.message}`);
    }
  }

  async fetchPagesCloudFunctionMonthlyStats(account, zoneId) {
    try {
      const client = this._createCommonClient(account);
      const params = {
        "ZoneId": zoneId,
        "Interface": "pages:DescribeHistoryCloudFunctionStats",
        "Payload": JSON.stringify({ ZoneId: zoneId })
      };
      
      const data = await client.request("DescribePagesResources", params);
      if (data && data.Result) {
        try {
          data.parsedResult = JSON.parse(data.Result);
        } catch (e) {
          console.error("Error parsing Result JSON:", e);
        }
      }
      return data;
    } catch (error) {
      console.error(`[EdgeOne] fetchPagesCloudFunctionMonthlyStats failed for zone ${zoneId}:`, error.message);
      throw new Error(`Failed to fetch monthly stats: ${error.message}`);
    }
  }

  formatData(rawData) {
    if (!Array.isArray(rawData) || rawData.length === 0) return [];

    if (rawData[0].TypeValue && Array.isArray(rawData[0].TypeValue)) {
      const mergedData = {};

      const metrics = rawData[0].TypeValue;

      metrics.forEach(metric => {
        const name = metric.MetricName;
        if (metric.Detail) {
          metric.Detail.forEach(point => {
            const timestamp = point.Timestamp;
            if (!mergedData[timestamp]) {
              mergedData[timestamp] = { timestamp: new Date(timestamp * 1000).toISOString() };
            }
            
          if (name === 'l7Flow_outFlux' || name === 'l7Flow_outFlux_hy') mergedData[timestamp].bytes = point.Value;
          if (name === 'l7Flow_outBandwidth' || name === 'l7Flow_outBandwidth_hy') mergedData[timestamp].bandwidth = point.Value;
          if (name === 'l7Flow_request' || name === 'l7Flow_request_hy') mergedData[timestamp].requests = point.Value;
        });
        }
      });

      return Object.values(mergedData).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    }

    if (rawData[0].MetricName && rawData[0].Detail) {
      const mergedData = {};

      rawData.forEach(metric => {
        const name = metric.MetricName;
        metric.Detail.forEach(point => {
          const timestamp = point.Timestamp;
          if (!mergedData[timestamp]) {
            mergedData[timestamp] = { timestamp: new Date(timestamp * 1000).toISOString() };
          }
          
          if (name === 'l7Flow_outFlux' || name === 'l7Flow_outFlux_hy') mergedData[timestamp].bytes = point.Value;
          if (name === 'l7Flow_outBandwidth' || name === 'l7Flow_outBandwidth_hy') mergedData[timestamp].bandwidth = point.Value;
          if (name === 'l7Flow_request' || name === 'l7Flow_request_hy') mergedData[timestamp].requests = point.Value;
        });
      });

      return Object.values(mergedData).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    }

    return rawData.map(item => ({
      timestamp: item.Timestamp || item.Time,
      requests: item.Value || item.Requests || 0,
      bytes: item.Bytes || 0,
      bandwidth: item.Bandwidth || 0
    }));
  }
}
