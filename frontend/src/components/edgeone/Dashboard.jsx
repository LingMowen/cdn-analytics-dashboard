import React, { useEffect, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { edgeoneAPI } from '../../services/edgeone';
import { useRefresh } from '../../contexts/RefreshContext';
import { Icons } from '../../components/common/Icons';
import { SkeletonDashboard } from '../../components/common/Skeleton';
import Select from '../../components/common/Select';
import { getCountryName } from '../../utils/countryNames';

export default function EODashboard() {
  const { t, language } = useLanguage();
  const { refreshTrigger } = useRefresh();
  const [zones, setZones] = useState([]);
  const [selectedZone, setSelectedZone] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [trafficData, setTrafficData] = useState([]);
  const [bandwidthData, setBandwidthData] = useState([]);
  const [geographyData, setGeographyData] = useState([]);
  const [originPullData, setOriginPullData] = useState([]);
  const [topUrls, setTopUrls] = useState([]);
  const [topReferers, setTopReferers] = useState([]);
  const [topBrowsers, setTopBrowsers] = useState([]);
  const [topOS, setTopOS] = useState([]);
  const [topDevices, setTopDevices] = useState([]);
  const [statusCodes, setStatusCodes] = useState([]);
  const [securityData, setSecurityData] = useState({});
  const [functionData, setFunctionData] = useState({});
  const [last30DaysTotals, setLast30DaysTotals] = useState({ requests: 0, bytes: 0 });
  const [period, setPeriod] = useState('last24Hours');
  const [customStartDraft, setCustomStartDraft] = useState('');
  const [customEndDraft, setCustomEndDraft] = useState('');
  const [customApplied, setCustomApplied] = useState({ start: '', end: '' });

  useEffect(() => {
    fetchZones();
  }, []);

  useEffect(() => {
    if (selectedZone) {
      fetchMetrics();
    }
  }, [selectedZone, refreshTrigger, period, customApplied.start, customApplied.end]);

  const applyCustomRange = () => {
    setCustomApplied({ start: customStartDraft, end: customEndDraft });
  };

  const getRange = () => {
    const now = new Date();
    let start = null;
    let end = now;

    if (period === 'custom') {
      const cs = customApplied.start ? new Date(customApplied.start) : null;
      const ce = customApplied.end ? new Date(customApplied.end) : null;
      if (cs && !Number.isNaN(cs.getTime())) start = cs;
      if (ce && !Number.isNaN(ce.getTime())) end = ce;
    } else if (period === 'last7Days') {
      start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (period === 'last30Days') {
      start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    } else {
      start = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }

    if (!start || Number.isNaN(start.getTime()) || start >= end) {
      start = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      end = now;
    }

    const days = (end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000);
    const interval = days <= 7 ? 'hour' : 'day';

    return {
      startTime: start.toISOString(),
      endTime: end.toISOString(),
      interval
    };
  };

  const fetchZones = async () => {
    try {
      setLoading(true);
      const data = await edgeoneAPI.getZones();
      if (data && data.length > 0 && data[0].zones) {
        setZones(data[0].zones);
        const preferredZone =
          data[0].zones.find((z) => z.name && z.name.includes('.')) || data[0].zones[0];
        setSelectedZone(preferredZone?.id || '');
      }
      setError(null);
    } catch (error) {
      console.error('API Error:', error);
      setError(t('loadError'));
    } finally {
      setLoading(false);
    }
  };

  const fetchMetrics = async () => {
    try {
      const { startTime, endTime, interval } = getRange();
      const now = new Date();
      const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const startTime30d = last30Days.toISOString();

      const results = await Promise.allSettled([
        edgeoneAPI.getMetrics({ zoneId: selectedZone, startTime, endTime, interval }),
        edgeoneAPI.getMetrics({ zoneId: selectedZone, startTime: startTime30d, endTime, interval: 'day' }),
        edgeoneAPI.getGeography({ zoneId: selectedZone, startTime, endTime }),
        edgeoneAPI.getOriginPull({ zoneId: selectedZone, startTime, endTime }),
        edgeoneAPI.getTopAnalysis({ zoneId: selectedZone, metric: 'l7Flow_request_url', startTime, endTime }),
        edgeoneAPI.getTopAnalysis({ zoneId: selectedZone, metric: 'l7Flow_request_referers', startTime, endTime }),
        edgeoneAPI.getTopAnalysis({ zoneId: selectedZone, metric: 'l7Flow_request_ua_browser', startTime, endTime }),
        edgeoneAPI.getTopAnalysis({ zoneId: selectedZone, metric: 'l7Flow_request_ua_os', startTime, endTime }),
        edgeoneAPI.getTopAnalysis({ zoneId: selectedZone, metric: 'l7Flow_request_ua_device', startTime, endTime }),
        edgeoneAPI.getTopAnalysis({ zoneId: selectedZone, metric: 'l7Flow_request_statusCode', startTime, endTime }),
        edgeoneAPI.getTopAnalysis({ zoneId: selectedZone, metric: 'ccRate_interceptNum', startTime, endTime }),
        edgeoneAPI.getTopAnalysis({ zoneId: selectedZone, metric: 'function_cpuCostTime', startTime, endTime }),
      ]);

      const metrics = results[0].status === 'fulfilled' ? results[0].value : [];
      const metrics30d = results[1].status === 'fulfilled' ? results[1].value : [];
      const geography = results[2].status === 'fulfilled' ? results[2].value : [];
      const originPull = results[3].status === 'fulfilled' ? results[3].value : [];
      
      const parseTopData = (res) => {
        if (res.status === 'fulfilled' && res.value && res.value.length > 0 && res.value[0].DetailData) {
          return res.value[0].DetailData;
        }
        return [];
      };

      const parseSecurityData = (res) => {
         if (res.status === 'fulfilled' && res.value) {
            // Check if it's the structure from DescribeWebProtectionData which returns array of metrics
            // structure: { Data: [{ MetricName: '...', Detail: [{ Timestamp: ..., Value: ... }] }] }
            const data = res.value.Data || res.value;
            
            if (Array.isArray(data)) {
               const metric = data.find(m => m.MetricName === 'ccRate_interceptNum');
               if (metric && metric.Detail) {
                  const total = metric.Detail.reduce((acc, curr) => acc + (curr.Value || 0), 0);
                  return { ccRate_interceptNum: total };
               }
            }
            return {};
         }
         return {};
      };

      const parseFunctionData = (res) => {
         if (res.status === 'fulfilled' && res.value) {
            return res.value;
         }
         return {};
      };

      setTrafficData(metrics || []);
      setBandwidthData(metrics || []);
      setGeographyData(geography || []);
      setOriginPullData(originPull || []);
      setTopUrls(parseTopData(results[4]));
      setTopReferers(parseTopData(results[5]));
      setTopBrowsers(parseTopData(results[6]));
      setTopOS(parseTopData(results[7]));
      setTopDevices(parseTopData(results[8]));
      setStatusCodes(parseTopData(results[9]));
      setSecurityData(parseSecurityData(results[10]));
      setFunctionData(parseFunctionData(results[11]));

      const totals30d = (Array.isArray(metrics30d) ? metrics30d : []).reduce(
        (acc, item) => {
          acc.requests += item.requests || 0;
          acc.bytes += item.bytes || 0;
          return acc;
        },
        { requests: 0, bytes: 0 }
      );
      setLast30DaysTotals(totals30d);
    } catch (error) {
      console.error('Metrics Error:', error);
    }
  };

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

  const totalRequests = trafficData.reduce((acc, item) => acc + (item.requests || 0), 0);
  const totalBytes = trafficData.reduce((acc, item) => acc + (item.bytes || 0), 0);
  const totalBandwidth = bandwidthData.length ? Math.max(...bandwidthData.map(item => item.bandwidth || 0)) : 0;
  const totalOriginPull = originPullData.reduce((acc, item) => acc + (item.requests || 0), 0);
  
  // Calculate specific traffic metrics
  // EdgeOne currently does not support l7Flow_inFlux via API, so we set bytesIn to 0 for now.
  const totalBytesIn = 0; 
  const peakBandwidthIn = 0;
  
  // Calculate Cache Hit Rate
  const cacheHitRate = totalRequests > 0 
      ? ((totalRequests - totalOriginPull) / totalRequests * 100).toFixed(2) 
      : '0.00';

  const trafficChartOption = {
    title: {
      text: t('traffic'),
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      formatter: (params) => {
        let res = params[0].name + '<br/>';
        params.forEach((item) => {
          res += item.marker + item.seriesName + ': <b>' + formatBytes(item.value) + '</b><br/>';
        });
        return res;
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: trafficData.map(d => d.timestamp)
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: (value) => formatBytes(value)
      }
    },
    series: [{
      name: t('traffic'),
      type: 'line',
      data: trafficData.map(d => d.bytes),
      smooth: true
    }]
  };

  const bandwidthChartOption = {
    title: {
      text: t('bandwidth'),
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      formatter: (params) => {
        let res = params[0].name + '<br/>';
        params.forEach((item) => {
          res += item.marker + item.seriesName + ': <b>' + formatBytes(item.value) + '/s</b><br/>';
        });
        return res;
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: bandwidthData.map(d => d.timestamp)
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: (value) => formatBytes(value) + '/s'
      }
    },
    series: [{
      name: t('bandwidth'),
      type: 'line',
      data: bandwidthData.map(d => d.bandwidth),
      smooth: true
    }]
  };

  const geographyChartOption = {
    title: {
      text: t('geography'),
      left: 'center'
    },
    tooltip: {
      trigger: 'item'
    },
    series: [{
      name: t('country'),
      type: 'pie',
      radius: '50%',
      data: geographyData.slice(0, 10).map(d => ({
        name: getCountryName(d.country, language),
        value: d.value
      })),
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }]
  };

  const topBrowsersChartOption = {
    title: {
      text: t('topBrowsers'),
      left: 'center'
    },
    tooltip: {
      trigger: 'item'
    },
    series: [{
      name: t('topBrowsers'),
      type: 'pie',
      radius: '50%',
      data: topBrowsers.slice(0, 10).map(d => ({
        name: d.Key,
        value: d.Value
      })),
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }]
  };

  const topDevicesChartOption = {
    title: {
      text: t('topDevices'),
      left: 'center'
    },
    tooltip: {
      trigger: 'item'
    },
    series: [{
      name: t('topDevices'),
      type: 'pie',
      radius: '45%',
      center: ['50%', '55%'],
      data: topDevices.slice(0, 10).map(d => ({
        name: d.Key,
        value: d.Value
      })),
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }]
  };

  const topOSChartOption = {
    title: {
      text: t('topOS'),
      left: 'center'
    },
    tooltip: {
      trigger: 'item'
    },
    series: [{
      name: t('topOS'),
      type: 'pie',
      radius: '45%',
      center: ['50%', '55%'],
      data: topOS.slice(0, 10).map(d => ({
        name: d.Key,
        value: d.Value
      })),
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }]
  };

  const statusCodeChartOption = {
    title: {
      text: t('statusCodeDistribution'),
      left: 'center'
    },
    tooltip: {
      trigger: 'item'
    },
    series: [{
      name: t('statusCodeDistribution'),
      type: 'pie',
      radius: '45%',
      center: ['50%', '55%'],
      data: statusCodes.map(d => ({
        name: d.Key,
        value: d.Value
      })),
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }]
  };

  const TopTable = ({ title, data }) => {
    const total = data.reduce((acc, item) => acc + item.Value, 0);
    return (
      <div className="rounded-xl border bg-card text-card-foreground shadow-sm h-full">
        <div className="p-6">
          <h3 className="text-lg font-bold mb-4">{title}</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-secondary/50">
                <tr>
                  <th className="px-4 py-2 w-2/3">{t('item')}</th>
                  <th className="px-4 py-2">{t('count')}</th>
                  <th className="px-4 py-2">{t('ratio')}</th>
                </tr>
              </thead>
              <tbody>
                {data.slice(0, 10).map((item, index) => (
                  <tr key={index} className="border-b last:border-0 hover:bg-secondary/20">
                    <td className="px-4 py-2 font-mono truncate max-w-[200px]" title={item.Key}>
                      {item.Key}
                    </td>
                    <td className="px-4 py-2">{formatNumber(item.Value)}</td>
                    <td className="px-4 py-2">
                      {total > 0 ? ((item.Value / total) * 100).toFixed(1) + '%' : '0%'}
                    </td>
                  </tr>
                ))}
                {data.length === 0 && (
                  <tr>
                    <td colSpan="3" className="px-4 py-4 text-center text-muted-foreground">
                      {t('noData')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return <SkeletonDashboard count={8} />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-destructive text-lg flex items-center gap-2">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          {error}
        </p>
        <button
          onClick={fetchZones}
          className="ml-4 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all duration-200 hover-lift min-h-[44px]"
        >
          {t('retry')}
        </button>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4 sm:space-y-5 lg:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="text-lg sm:text-xl font-bold">EdgeOne</h2>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <div className="w-full sm:w-40">
            <Select
              value={period}
              onChange={(val) => setPeriod(val)}
              options={[
                { value: 'last24Hours', label: t('last24Hours') },
                { value: 'last7Days', label: t('last7Days') },
                { value: 'last30Days', label: t('last30Days') },
                { value: 'custom', label: t('customRange') }
              ]}
              placeholder={t('selectPeriod')}
            />
          </div>
          {period === 'custom' && (
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full animate-fade-in">
              <div className="relative select-dropdown group flex-1">
                <input
                  type="datetime-local"
                  value={customStartDraft}
                  onChange={(e) => setCustomStartDraft(e.target.value)}
                  className="w-full px-3 py-2.5 pr-10 bg-secondary/80 text-secondary-foreground rounded-lg border border-secondary/50 hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 min-h-[44px]"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-50">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <span className="hidden sm:inline text-muted-foreground self-center">-</span>
              <div className="relative select-dropdown group flex-1">
                <input
                  type="datetime-local"
                  value={customEndDraft}
                  onChange={(e) => setCustomEndDraft(e.target.value)}
                  className="w-full px-3 py-2.5 pr-10 bg-secondary/80 text-secondary-foreground rounded-lg border border-secondary/50 hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 min-h-[44px]"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-50">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <button
                onClick={applyCustomRange}
                className="px-4 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 min-h-[44px] w-full sm:w-auto hover-lift"
              >
                {t('apply')}
              </button>
            </div>
          )}
          <div className="w-full sm:w-56">
            <Select
              value={selectedZone}
              onChange={(val) => setSelectedZone(val)}
              options={zones.map(zone => ({ value: zone.id, label: zone.name }))}
              placeholder={t('selectZone')}
              searchEnabled={true}
            />
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-2 lg:grid-cols-4">
        <div className="data-card rounded-xl border bg-card text-card-foreground shadow-sm p-4 sm:p-6 card-glow animate-slide-up stagger-1">
          <div className="flex items-center gap-2 mb-2">
            <div className="icon-wrapper p-1.5 rounded-lg bg-blue-500/10">
              <Icons.requests />
            </div>
            <h3 className="text-xs sm:text-sm font-medium text-muted-foreground">{t('totalRequests')}</h3>
          </div>
          <p className="number-display text-xl sm:text-2xl font-bold">{formatNumber(totalRequests)}</p>
        </div>
        <div className="data-card rounded-xl border bg-card text-card-foreground shadow-sm p-4 sm:p-6 card-glow animate-slide-up stagger-2">
          <div className="flex items-center gap-2 mb-2">
            <div className="icon-wrapper p-1.5 rounded-lg bg-emerald-500/10">
              <Icons.traffic />
            </div>
            <h3 className="text-xs sm:text-sm font-medium text-muted-foreground">{t('totalTraffic')}</h3>
          </div>
          <p className="number-display text-xl sm:text-2xl font-bold">{formatBytes(totalBytes)}</p>
        </div>
        <div className="data-card rounded-xl border bg-card text-card-foreground shadow-sm p-4 sm:p-6 card-glow animate-slide-up stagger-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="icon-wrapper p-1.5 rounded-lg bg-amber-500/10">
              <Icons.bandwidth />
            </div>
            <h3 className="text-xs sm:text-sm font-medium text-muted-foreground">{t('totalBandwidth')}</h3>
          </div>
          <p className="number-display text-xl sm:text-2xl font-bold">{formatBytes(totalBandwidth)}/s</p>
        </div>
        <div className="data-card rounded-xl border bg-card text-card-foreground shadow-sm p-4 sm:p-6 card-glow animate-slide-up stagger-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="icon-wrapper p-1.5 rounded-lg bg-orange-500/10">
              <Icons.originPull />
            </div>
            <h3 className="text-xs sm:text-sm font-medium text-muted-foreground">{t('originPull')}</h3>
          </div>
          <p className="number-display text-xl sm:text-2xl font-bold">{formatNumber(totalOriginPull)}</p>
        </div>
        <div className="data-card rounded-xl border bg-card text-card-foreground shadow-sm p-4 sm:p-6 card-glow animate-slide-up stagger-5">
           <div className="flex items-center gap-2 mb-2">
             <div className="icon-wrapper p-1.5 rounded-lg bg-emerald-500/10">
               <Icons.cacheHitRate />
             </div>
             <h3 className="text-xs sm:text-sm font-medium text-muted-foreground">{t('cacheHitRate')}</h3>
           </div>
           <p className="number-display text-xl sm:text-2xl font-bold">{cacheHitRate}%</p>
        </div>
        <div className="data-card rounded-xl border bg-card text-card-foreground shadow-sm p-4 sm:p-6 card-glow animate-slide-up stagger-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="icon-wrapper p-1.5 rounded-lg bg-red-500/10">
              <Icons.intercepts />
            </div>
            <h3 className="text-xs sm:text-sm font-medium text-muted-foreground">{t('intercepts')}</h3>
          </div>
          <p className="number-display text-xl sm:text-2xl font-bold">{formatNumber(securityData?.ccRate_interceptNum || 0)}</p>
        </div>
        <div className="data-card rounded-xl border bg-card text-card-foreground shadow-sm p-4 sm:p-6 card-glow animate-slide-up stagger-7">
          <div className="flex items-center gap-2 mb-2">
            <div className="icon-wrapper p-1.5 rounded-lg bg-blue-500/10">
              <Icons.requests />
            </div>
            <h3 className="text-xs sm:text-sm font-medium text-muted-foreground">{t('last30Days')}{t('requests')}</h3>
          </div>
          <p className="number-display text-xl sm:text-2xl font-bold">{formatNumber(last30DaysTotals.requests || 0)}</p>
        </div>
        <div className="data-card rounded-xl border bg-card text-card-foreground shadow-sm p-4 sm:p-6 card-glow animate-slide-up stagger-8">
          <div className="flex items-center gap-2 mb-2">
            <div className="icon-wrapper p-1.5 rounded-lg bg-emerald-500/10">
              <Icons.traffic />
            </div>
            <h3 className="text-xs sm:text-sm font-medium text-muted-foreground">{t('last30Days')}{t('traffic')}</h3>
          </div>
          <p className="number-display text-xl sm:text-2xl font-bold">{formatBytes(last30DaysTotals.bytes || 0)}</p>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-bold">{t('trafficAnalysis')}</h3>
        <div className="grid gap-3 sm:gap-4 grid-cols-1 md:grid-cols-3">
          <div className="data-card rounded-xl border bg-card text-card-foreground shadow-sm p-4 sm:p-6 card-glow animate-slide-up stagger-9">
            <div className="flex items-center gap-2 mb-2">
              <div className="icon-wrapper p-1.5 rounded-lg bg-blue-500/10">
                <Icons.traffic />
              </div>
              <h3 className="text-xs sm:text-sm font-medium text-muted-foreground">{t('totalTraffic')}</h3>
            </div>
            <p className="number-display text-xl sm:text-2xl font-bold">{formatBytes(totalBytes)}</p>
          </div>
          <div className="data-card rounded-xl border bg-card text-card-foreground shadow-sm p-4 sm:p-6 card-glow animate-slide-up stagger-10">
            <div className="flex items-center gap-2 mb-2">
              <div className="icon-wrapper p-1.5 rounded-lg bg-emerald-500/10">
                <Icons.requests />
              </div>
              <h3 className="text-xs sm:text-sm font-medium text-muted-foreground">{t('clientRequestTraffic')}</h3>
            </div>
            <p className="number-display text-xl sm:text-2xl font-bold text-muted-foreground">--</p>
          </div>
          <div className="data-card rounded-xl border bg-card text-card-foreground shadow-sm p-4 sm:p-6 card-glow animate-slide-up stagger-11">
            <div className="flex items-center gap-2 mb-2">
              <div className="icon-wrapper p-1.5 rounded-lg bg-amber-500/10">
                <Icons.originPull />
              </div>
              <h3 className="text-xs sm:text-sm font-medium text-muted-foreground">{t('responseTraffic')}</h3>
            </div>
            <p className="number-display text-xl sm:text-2xl font-bold">{formatBytes(totalBytes)}</p>
          </div>
        </div>
        <div className="chart-container rounded-xl border bg-card text-card-foreground shadow-sm animate-fade-in-up stagger-12">
          <div className="p-4 sm:p-6">
            <ReactECharts 
              option={{
                ...trafficChartOption,
                series: [
                  {
                    name: t('traffic'),
                    type: 'line',
                    data: trafficData.map(d => d.bytes),
                    smooth: true,
                    itemStyle: { color: '#3b82f6' }, // Blue
                    lineStyle: { color: '#3b82f6' },
                    areaStyle: {
                      color: {
                        type: 'linear',
                        x: 0,
                        y: 0,
                        x2: 0,
                        y2: 1,
                        colorStops: [{
                          offset: 0, color: 'rgba(59, 130, 246, 0.3)' // Blue with opacity
                        }, {
                          offset: 1, color: 'rgba(59, 130, 246, 0.05)'
                        }]
                      }
                    }
                  }
                ],
                animationDuration: 1000,
                animationEasing: 'cubic-bezier(0.4, 0, 0.2, 1)',
                animationDelay: (idx) => idx * 100
              }} 
              style={{ height: '300px', minHeight: '250px' }} 
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-bold">{t('bandwidthAnalysis')}</h3>
        <div className="grid gap-3 sm:gap-4 grid-cols-1 md:grid-cols-3">
          <div className="data-card rounded-xl border bg-card text-card-foreground shadow-sm p-4 sm:p-6 card-glow animate-slide-up stagger-13">
            <div className="flex items-center gap-2 mb-2">
              <div className="icon-wrapper p-1.5 rounded-lg bg-blue-500/10">
                <Icons.bandwidth />
              </div>
              <h3 className="text-xs sm:text-sm font-medium text-muted-foreground">{t('peakBandwidth')}</h3>
            </div>
            <p className="number-display text-xl sm:text-2xl font-bold">{formatBytes(totalBandwidth)}/s</p>
          </div>
          <div className="data-card rounded-xl border bg-card text-card-foreground shadow-sm p-4 sm:p-6 card-glow animate-slide-up stagger-14">
            <div className="flex items-center gap-2 mb-2">
              <div className="icon-wrapper p-1.5 rounded-lg bg-emerald-500/10">
                <Icons.requests />
              </div>
              <h3 className="text-xs sm:text-sm font-medium text-muted-foreground">{t('peakRequestBandwidth')}</h3>
            </div>
            <p className="number-display text-xl sm:text-2xl font-bold text-muted-foreground">--</p>
          </div>
          <div className="data-card rounded-xl border bg-card text-card-foreground shadow-sm p-4 sm:p-6 card-glow animate-slide-up stagger-15">
            <div className="flex items-center gap-2 mb-2">
              <div className="icon-wrapper p-1.5 rounded-lg bg-amber-500/10">
                <Icons.originPull />
              </div>
              <h3 className="text-xs sm:text-sm font-medium text-muted-foreground">{t('peakResponseBandwidth')}</h3>
            </div>
            <p className="number-display text-xl sm:text-2xl font-bold">{formatBytes(totalBandwidth)}/s</p>
          </div>
        </div>
        <div className="chart-container rounded-xl border bg-card text-card-foreground shadow-sm animate-fade-in-up stagger-16">
          <div className="p-4 sm:p-6">
            <ReactECharts 
              option={{
                ...bandwidthChartOption,
                series: [
                  {
                    name: t('bandwidth'),
                    type: 'line',
                    data: bandwidthData.map(d => d.bandwidth),
                    smooth: true,
                    itemStyle: { color: '#8b5cf6' }, // Purple
                    lineStyle: { color: '#8b5cf6' },
                    areaStyle: {
                      color: {
                        type: 'linear',
                        x: 0,
                        y: 0,
                        x2: 0,
                        y2: 1,
                        colorStops: [{
                          offset: 0, color: 'rgba(139, 92, 246, 0.3)' // Purple with opacity
                        }, {
                          offset: 1, color: 'rgba(139, 92, 246, 0.05)'
                        }]
                      }
                    }
                  }
                ],
                animationDuration: 1000,
                animationEasing: 'cubic-bezier(0.4, 0, 0.2, 1)',
                animationDelay: (idx) => idx * 100
              }} 
              style={{ height: '300px', minHeight: '250px' }} 
            />
          </div>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
         <div className="chart-container rounded-xl border bg-card text-card-foreground shadow-sm animate-fade-in-up stagger-7">
            <div className="p-4 sm:p-6">
               <ReactECharts 
                 option={{
                   ...geographyChartOption,
                   animationDuration: 1000,
                   animationEasing: 'cubic-bezier(0.4, 0, 0.2, 1)',
                   animationDelay: (idx) => idx * 100
                 }} 
                 style={{ height: '350px', minHeight: '300px' }} 
               />
            </div>
         </div>
         <div className="chart-container rounded-xl border bg-card text-card-foreground shadow-sm animate-fade-in-up stagger-8">
            <div className="p-4 sm:p-6">
               <ReactECharts 
                 option={{
                   ...statusCodeChartOption,
                   animationDuration: 1000,
                   animationEasing: 'cubic-bezier(0.4, 0, 0.2, 1)',
                   animationDelay: (idx) => idx * 100
                 }} 
                 style={{ height: '350px', minHeight: '300px' }} 
               />
            </div>
         </div>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        <TopTable title={t('topUrls')} data={topUrls} />
        <TopTable title={t('topReferers')} data={topReferers} />
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm hover:shadow-lg transition-all duration-300">
          <div className="p-4 sm:p-6">
            <ReactECharts option={topBrowsersChartOption} style={{ height: '300px', minHeight: '250px' }} />
          </div>
        </div>
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm hover:shadow-lg transition-all duration-300">
          <div className="p-4 sm:p-6">
            <ReactECharts option={topOSChartOption} style={{ height: '300px', minHeight: '250px' }} />
          </div>
        </div>
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm hover:shadow-lg transition-all duration-300">
          <div className="p-4 sm:p-6">
            <ReactECharts option={topDevicesChartOption} style={{ height: '300px', minHeight: '250px' }} />
          </div>
        </div>
      </div>
    </div>
  );
}
