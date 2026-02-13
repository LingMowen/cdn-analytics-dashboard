import React, { useEffect, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { aliyunAPI } from '../../services/aliyun';
import { useRefresh } from '../../contexts/RefreshContext';
import { SkeletonDashboard } from '../../components/common/Skeleton';
import Select from '../../components/common/Select';

export default function AliyunDashboard() {
  const { t, language } = useLanguage();
  const { refreshTrigger } = useRefresh();
  const [zones, setZones] = useState([]);
  const [selectedZone, setSelectedZone] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [trafficData, setTrafficData] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    loadZones();
  }, []);

  useEffect(() => {
    if (selectedZone) {
      loadDashboardData();
    }
  }, [selectedZone, refreshTrigger]);

  const loadZones = async () => {
    try {
      const data = await aliyunAPI.getZones();
      if (data.zones && data.zones.length > 0) {
        setZones(data.zones);
        setSelectedZone(data.zones[0].id);
      } else {
        setZones([]);
      }
    } catch (err) {
      console.error('Failed to load zones:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadDashboardData = async () => {
    if (!selectedZone) return;
    
    setLoading(true);
    try {
      const data = await aliyunAPI.getDashboard(selectedZone);
      if (data.dashboard && data.dashboard.length > 0) {
        setDashboardData(data.dashboard[0]);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getChartOption = (data, title, unit) => {
    if (!data || !data.trend || data.trend.length === 0) {
      return {
        title: { text: title, left: 'center', textStyle: { fontSize: 14 } },
        graphic: { type: 'text', left: 'center', top: 'middle', style: { text: t('noData') || 'No Data' } }
      };
    }

    return {
      title: { text: title, left: 'center', textStyle: { fontSize: 14 } },
      tooltip: { trigger: 'axis' },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: data.trend.map(item => {
          const date = new Date(item.timestamp);
          return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:00`;
        })
      },
      yAxis: { type: 'value', name: unit },
      series: [{
        name: title,
        type: 'line',
        smooth: true,
        data: data.trend.map(item => item.value),
        areaStyle: { opacity: 0.3 },
        lineStyle: { width: 2 }
      }]
    };
  };

  if (loading && zones.length === 0) {
    return <SkeletonDashboard />;
  }

  if (zones.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-muted-foreground">{t('noZonesAvailable') || 'No ESA zones available'}</p>
          <p className="text-sm text-muted-foreground mt-2">
            {t('configureAliyun') || 'Please configure Aliyun ESA in backend'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Aliyun ESA</h1>
        <Select
          value={selectedZone}
          onChange={(e) => setSelectedZone(e.target.value)}
          options={zones.map(zone => ({
            value: zone.id,
            label: zone.name || zone.domain
          }))}
        />
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-2 rounded-lg">
          {error}
        </div>
      )}

      {dashboardData && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard
              title={t('totalTraffic') || 'Total Traffic'}
              value={dashboardData.traffic?.total?.toFixed(2) || '0'}
              unit={dashboardData.traffic?.unit || 'GB'}
            />
            <MetricCard
              title={t('peakBandwidth') || 'Peak Bandwidth'}
              value={dashboardData.traffic?.bandwidth?.peak?.toFixed(2) || '0'}
              unit={dashboardData.traffic?.bandwidth?.unit || 'Mbps'}
            />
            <MetricCard
              title={t('totalRequests') || 'Total Requests'}
              value={dashboardData.requests?.total?.toLocaleString() || '0'}
              unit=""
            />
            <MetricCard
              title={t('lastUpdate') || 'Last Update'}
              value={dashboardData.timestamp ? new Date(dashboardData.timestamp).toLocaleString() : '-'}
              unit=""
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-card rounded-lg p-4 shadow-sm">
              <ReactECharts
                option={getChartOption(dashboardData.traffic, t('trafficTrend') || 'Traffic Trend', 'GB')}
                style={{ height: '300px' }}
              />
            </div>
            <div className="bg-card rounded-lg p-4 shadow-sm">
              <ReactECharts
                option={getChartOption(dashboardData.requests, t('requestsTrend') || 'Requests Trend', '')}
                style={{ height: '300px' }}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function MetricCard({ title, value, unit }) {
  return (
    <div className="bg-card rounded-lg p-4 shadow-sm">
      <div className="text-sm text-muted-foreground">{title}</div>
      <div className="text-2xl font-bold mt-1">
        {value} <span className="text-sm font-normal text-muted-foreground">{unit}</span>
      </div>
    </div>
  );
}
