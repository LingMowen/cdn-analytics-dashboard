import React, { useEffect, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { cloudflareAPI } from '../../services/cloudflare';
import { Icons } from '../../components/common/Icons';
import { SkeletonDashboard } from '../../components/common/Skeleton';
import Select from '../../components/common/Select';
import { getCountryName } from '../../utils/countryNames';

export default function CFDashboard() {
  const { t, language } = useLanguage();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('1day');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await cloudflareAPI.getAnalytics();
      setAccounts(data.accounts || []);
      setError(null);
    } catch (error) {
      console.error('API Error:', error);
      setError(t('loadError'));
    } finally {
      setTimeout(() => setLoading(false), 300);
    }
  };

  if (loading) {
    return <SkeletonDashboard count={6} />;
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
          onClick={fetchData}
          className="ml-4 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all duration-200 hover-lift min-h-[44px]"
        >
          {t('retry')}
        </button>
      </div>
    );
  }

  if (!accounts || accounts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
        <svg className="w-16 h-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
        <p className="text-lg">{t('noData')}</p>
      </div>
    );
  }

  const aggregatedData = accounts.reduce((acc, account) => {
    account.zones?.forEach(zone => {
      const useHourlyData = selectedPeriod === '1day' || selectedPeriod === '3days';
      const rawData = useHourlyData ? (zone.rawHours || []) : (zone.raw || []);

      if (rawData && Array.isArray(rawData)) {
        rawData.forEach(item => {
          if (item.sum) {
            acc.requests += item.sum.requests || 0;
            acc.bytes += item.sum.bytes || 0;
            acc.threats += item.sum.threats || 0;
            acc.cachedRequests += item.sum.cachedRequests || 0;
            acc.cachedBytes += item.sum.cachedBytes || 0;
          }
        });
      }
    });
    return acc;
  }, { requests: 0, bytes: 0, threats: 0, cachedRequests: 0, cachedBytes: 0 });

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

  const cacheHitRate = aggregatedData.requests > 0
    ? ((aggregatedData.cachedRequests / aggregatedData.requests) * 100).toFixed(2)
    : '0.00';

  const trafficChartOption = {
    title: {
      text: t('traffic'),
      left: 'center'
    },
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: [t('requests'), t('bytes')],
      top: 30
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: accounts[0]?.zones[0]?.raw?.map(d => d.dimensions.date).slice(-30) || []
    },
    yAxis: [
      {
        type: 'value',
        name: t('requests')
      },
      {
        type: 'value',
        name: t('bytes'),
        axisLabel: {
          formatter: (value) => formatBytes(value)
        }
      }
    ],
    series: [
      {
        name: t('requests'),
        type: 'line',
        data: accounts[0]?.zones[0]?.raw?.map(d => d.sum.requests).slice(-30) || [],
        yAxisIndex: 0
      },
      {
        name: t('bytes'),
        type: 'line',
        data: accounts[0]?.zones[0]?.raw?.map(d => d.sum.bytes).slice(-30) || [],
        yAxisIndex: 1
      }
    ]
  };

  return (
    <div className="w-full space-y-4 sm:space-y-5 lg:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="text-lg sm:text-xl font-bold">Cloudflare</h2>
        <div className="w-full sm:w-40">
          <Select
            value={selectedPeriod}
            onChange={(val) => setSelectedPeriod(val)}
            options={[
              { value: '1day', label: t('last24Hours') },
              { value: '3days', label: t('last7Days') },
              { value: '7days', label: t('last30Days') }
            ]}
            placeholder={t('selectPeriod')}
          />
        </div>
      </div>

      <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
        <div className="data-card rounded-xl border bg-card text-card-foreground shadow-sm p-4 sm:p-6 card-glow animate-slide-up stagger-1">
          <div className="flex items-center gap-2 mb-2">
            <div className="icon-wrapper p-1.5 rounded-lg bg-blue-500/10">
              <Icons.requests />
            </div>
            <h3 className="text-xs sm:text-sm font-medium text-muted-foreground">{t('totalRequests')}</h3>
          </div>
          <p className="number-display text-xl sm:text-2xl font-bold">{formatNumber(aggregatedData.requests)}</p>
        </div>
        <div className="data-card rounded-xl border bg-card text-card-foreground shadow-sm p-4 sm:p-6 card-glow animate-slide-up stagger-2">
          <div className="flex items-center gap-2 mb-2">
            <div className="icon-wrapper p-1.5 rounded-lg bg-emerald-500/10">
              <Icons.traffic />
            </div>
            <h3 className="text-xs sm:text-sm font-medium text-muted-foreground">{t('totalTraffic')}</h3>
          </div>
          <p className="number-display text-xl sm:text-2xl font-bold">{formatBytes(aggregatedData.bytes)}</p>
        </div>
        <div className="data-card rounded-xl border bg-card text-card-foreground shadow-sm p-4 sm:p-6 card-glow animate-slide-up stagger-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="icon-wrapper p-1.5 rounded-lg bg-red-500/10">
              <Icons.threats />
            </div>
            <h3 className="text-xs sm:text-sm font-medium text-muted-foreground">{t('totalThreats')}</h3>
          </div>
          <p className="number-display text-xl sm:text-2xl font-bold">{formatNumber(aggregatedData.threats)}</p>
        </div>
        <div className="data-card rounded-xl border bg-card text-card-foreground shadow-sm p-4 sm:p-6 card-glow animate-slide-up stagger-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="icon-wrapper p-1.5 rounded-lg bg-purple-500/10">
              <Icons.cachedRequests />
            </div>
            <h3 className="text-xs sm:text-sm font-medium text-muted-foreground">{t('cachedRequests')}</h3>
          </div>
          <p className="number-display text-xl sm:text-2xl font-bold">{formatNumber(aggregatedData.cachedRequests)}</p>
        </div>
        <div className="data-card rounded-xl border bg-card text-card-foreground shadow-sm p-4 sm:p-6 card-glow animate-slide-up stagger-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="icon-wrapper p-1.5 rounded-lg bg-purple-500/10">
              <Icons.cachedBytes />
            </div>
            <h3 className="text-xs sm:text-sm font-medium text-muted-foreground">{t('cachedBytes')}</h3>
          </div>
          <p className="number-display text-xl sm:text-2xl font-bold">{formatBytes(aggregatedData.cachedBytes)}</p>
        </div>
        <div className="data-card rounded-xl border bg-card text-card-foreground shadow-sm p-4 sm:p-6 card-glow animate-slide-up stagger-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="icon-wrapper p-1.5 rounded-lg bg-emerald-500/10">
              <Icons.cacheHitRate />
            </div>
            <h3 className="text-xs sm:text-sm font-medium text-muted-foreground">{t('cacheHitRate')}</h3>
          </div>
          <p className="number-display text-xl sm:text-2xl font-bold">{cacheHitRate}%</p>
        </div>
      </div>

      <div className="chart-container rounded-xl border bg-card text-card-foreground shadow-sm animate-fade-in-up stagger-7">
        <div className="p-4 sm:p-6">
          <ReactECharts 
            option={{
              ...trafficChartOption,
              animationDuration: 1000,
              animationEasing: 'cubic-bezier(0.4, 0, 0.2, 1)',
              animationDelay: (idx) => idx * 100
            }} 
            style={{ height: '300px', minHeight: '250px' }} 
          />
        </div>
      </div>

      {accounts.map((account, accIndex) => (
        <div key={accIndex} className="space-y-3 sm:space-y-4 animate-fade-in-up" style={{ animationDelay: `${accIndex * 0.1}s` }}>
          <h3 className="text-base sm:text-lg font-semibold section-title">{account.name}</h3>
          {account.zones.map((zone, zoneIndex) => (
            <div key={zoneIndex} className="data-card rounded-xl border bg-card text-card-foreground shadow-sm p-4 sm:p-6 card-glow animate-slide-up" style={{ animationDelay: `${(accIndex * 0.1) + (zoneIndex * 0.05)}s` }}>
              <h4 className="text-sm sm:text-md font-medium mb-3 sm:mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary/30"></span>
                {zone.domain}
              </h4>
              {zone.error && (
                <p className="text-destructive text-sm flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  Error: {zone.error}
                </p>
              )}
              {zone.geography && zone.geography.length > 0 && (
                <div>
                  <h5 className="text-xs sm:text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {t('geography')}
                  </h5>
                  <div className="space-y-2">
                    {zone.geography.slice(0, 5).map((geo, geoIndex) => (
                      <div key={geoIndex} className="flex items-center gap-3 text-sm group">
                        <div className="flex-1 truncate flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary/40 group-hover:bg-primary/60 transition-colors"></span>
                          <span className="truncate max-w-[150px]">{getCountryName(geo.dimensions.clientCountryName, language)}</span>
                        </div>
                        <span className="font-medium tabular-nums opacity-70 group-hover:opacity-100 transition-opacity">{formatNumber(geo.sum.requests)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
