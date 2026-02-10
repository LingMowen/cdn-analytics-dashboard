import React, { useEffect, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { cloudflareAPI } from '../../services/cloudflare';
import { edgeoneAPI } from '../../services/edgeone';
import { useRefresh } from '../../contexts/RefreshContext';

export default function UnifiedDashboard() {
  const { t } = useLanguage();
  const { refreshTrigger } = useRefresh();
  const [cfData, setCfData] = useState(null);
  const [eoData, setEoData] = useState(null);
  const [eoMetrics, setEoMetrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [backendAvailable, setBackendAvailable] = useState(true);

  useEffect(() => {
    fetchData();
  }, [refreshTrigger]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setBackendAvailable(true);
      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const startTime = yesterday.toISOString();
      const endTime = now.toISOString();

      const [cfRes, eoRes] = await Promise.allSettled([
        cloudflareAPI.getAnalytics(),
        edgeoneAPI.getZones()
      ]);

      // 检测后端是否可用（网络错误、连接被拒绝、服务器错误等）
      const isBackendUnavailable = (res) => {
        if (res.status === 'rejected') {
          const error = res.reason;
          // 检测网络错误、连接被拒绝、无法连接等情况
          if (error?.code === 'ERR_NETWORK' ||
              error?.code === 'ECONNREFUSED' ||
              error?.code === 'ECONNABORTED' ||
              error?.message?.includes('Network Error') ||
              error?.message?.includes('无法连接') ||
              error?.message?.includes('Failed to fetch') ||
              error?.message?.includes('connect ECONNREFUSED') ||
              error?.message?.includes('timeout') ||
              error?.message?.includes('HTTP 500') ||
              error?.message?.includes('500')) {
            return true;
          }
          // 检测服务器 5xx 错误
          if (error?.response?.status >= 500) {
            return true;
          }
        }
        return false;
      };

      const cfUnavailable = isBackendUnavailable(cfRes);
      const eoUnavailable = isBackendUnavailable(eoRes);

      // 如果任一 API 检测到后端不可用，显示后端未启动提示
      if (cfUnavailable || eoUnavailable) {
        setBackendAvailable(false);
        setCfData(null);
        setEoData(null);
        setEoMetrics([]);
        setLoading(false);
        return;
      }

      const cf = cfRes.status === 'fulfilled' ? cfRes.value : { accounts: [] };
      const eo = eoRes.status === 'fulfilled' ? eoRes.value : [];

      // 如果两个 API 都失败了，也认为后端不可用
      if (cfRes.status === 'rejected' && eoRes.status === 'rejected') {
        setBackendAvailable(false);
        setCfData(null);
        setEoData(null);
        setEoMetrics([]);
        setLoading(false);
        return;
      }

      if (cfRes.status === 'rejected') console.warn('Cloudflare Unified API Error:', cfRes.reason);
      if (eoRes.status === 'rejected') console.warn('EdgeOne Unified API Error:', eoRes.reason);

      setCfData(cf);
      setEoData(eo);

      let zoneId;
      const firstAccount = Array.isArray(eo) && eo.length > 0 ? eo[0] : null;
      const zones = firstAccount?.zones || [];
      if (zones.length > 0) {
        const preferredZone = zones.find((z) => z.name && z.name.includes('.')) || zones[0];
        zoneId = preferredZone?.id;
      }

      if (zoneId) {
        try {
          const metrics = await edgeoneAPI.getMetrics({ zoneId, startTime, endTime, interval: 'hour' });
          setEoMetrics(Array.isArray(metrics) ? metrics : []);
        } catch (e) {
          console.warn('EdgeOne Unified Metrics Error:', e);
          setEoMetrics([]);
        }
      } else {
        setEoMetrics([]);
      }

      setError(null);
    } catch (error) {
      console.error('API Error:', error);
      setError(t('loadError'));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner"></div>
        <p className="ml-4">{t('loading')}</p>
      </div>
    );
  }

  if (!backendAvailable) {
    return (
      <div className="w-full space-y-4 sm:space-y-5 lg:space-y-6">
        <h2 className="text-xl font-bold">{t('unified')}</h2>
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-8">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 mb-4 rounded-full bg-amber-500/10 flex items-center justify-center">
              <svg className="w-8 h-8 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">{t('backendNotStarted') || '后端服务未启动'}</h3>
            <p className="text-muted-foreground mb-4">{t('backendNotStartedDesc') || '请启动后端服务以查看统一视图数据'}</p>
            <button
              onClick={fetchData}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              {t('retry')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-500">⚠️ {error}</p>
        <button
          onClick={fetchData}
          className="ml-4 px-4 py-2 bg-primary text-primary-foreground rounded-md"
        >
          {t('retry')}
        </button>
      </div>
    );
  }

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatNumber = (num) => {
    if (num >= 1000000000) return (num / 1000000000).toFixed(2) + 'B';
    if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(2) + 'K';
    return num.toString();
  };

  const cfEnabled = (cfData?.accounts?.length || 0) > 0;

  const cfTotal = cfData?.accounts?.reduce((acc, account) => {
    account.zones?.forEach(zone => {
      const rawData = zone.raw || [];
      if (rawData && Array.isArray(rawData)) {
        rawData.forEach(item => {
          if (item.sum) {
            acc.requests += item.sum.requests || 0;
            acc.bytes += item.sum.bytes || 0;
            acc.threats += item.sum.threats || 0;
          }
        });
      }
    });
    return acc;
  }, { requests: 0, bytes: 0, threats: 0 }) || { requests: 0, bytes: 0, threats: 0 };

  const eoTotal = (Array.isArray(eoMetrics) ? eoMetrics : []).reduce(
    (acc, item) => {
      acc.requests += item.requests || 0;
      acc.bytes += item.bytes || 0;
      acc.bandwidth = Math.max(acc.bandwidth, item.bandwidth || 0);
      return acc;
    },
    { requests: 0, bytes: 0, bandwidth: 0 }
  );

  const edgeOneRequestsChartOption = {
    title: {
      text: t('requests'),
      left: 'center'
    },
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: (Array.isArray(eoMetrics) ? eoMetrics : []).map((d) => d.timestamp)
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: t('requests'),
        type: 'bar',
        data: (Array.isArray(eoMetrics) ? eoMetrics : []).map((d) => d.requests || 0)
      }
    ]
  };

  const comparisonChartOption = {
    title: {
      text: 'Platform Comparison',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      data: ['Cloudflare', 'EdgeOne'],
      top: 30
    },
    xAxis: {
      type: 'category',
      data: [t('requests'), t('bytes'), t('threats')]
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: 'Cloudflare',
        type: 'bar',
        data: [cfTotal.requests, cfTotal.bytes, cfTotal.threats]
      },
      {
        name: 'EdgeOne',
        type: 'bar',
        data: [eoTotal.requests, eoTotal.bytes, 0]
      }
    ]
  };

  return (
    <div className="w-full space-y-4 sm:space-y-5 lg:space-y-6">
      <h2 className="text-xl font-bold">{t('unified')}</h2>

      {cfEnabled ? (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Cloudflare</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">{t('totalRequests')}</span>
                  <span className="text-2xl font-bold">{formatNumber(cfTotal.requests)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">{t('totalTraffic')}</span>
                  <span className="text-2xl font-bold">{formatBytes(cfTotal.bytes)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">{t('totalThreats')}</span>
                  <span className="text-2xl font-bold">{formatNumber(cfTotal.threats)}</span>
                </div>
              </div>
            </div>

            <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">EdgeOne</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">{t('totalRequests')}</span>
                  <span className="text-2xl font-bold">{formatNumber(eoTotal.requests)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">{t('totalTraffic')}</span>
                  <span className="text-2xl font-bold">{formatBytes(eoTotal.bytes)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">{t('totalBandwidth')}</span>
                  <span className="text-2xl font-bold">{formatBytes(eoTotal.bandwidth)}/s</span>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
            <div className="p-6">
              <ReactECharts option={comparisonChartOption} style={{ height: '400px' }} />
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">EdgeOne</h3>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <div className="text-sm font-medium text-muted-foreground">{t('totalRequests')}</div>
                <div className="text-2xl font-bold mt-2">{formatNumber(eoTotal.requests)}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">{t('totalTraffic')}</div>
                <div className="text-2xl font-bold mt-2">{formatBytes(eoTotal.bytes)}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">{t('totalBandwidth')}</div>
                <div className="text-2xl font-bold mt-2">{formatBytes(eoTotal.bandwidth)}/s</div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
            <div className="p-6">
              <ReactECharts option={edgeOneRequestsChartOption} style={{ height: '400px' }} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
