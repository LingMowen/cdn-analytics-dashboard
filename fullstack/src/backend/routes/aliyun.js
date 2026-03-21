import { AliyunESAService } from '../services/aliyun.js';
import { loadAliyunESAConfig } from '../config/index.js';

let aliyunConfig;
let aliyunService;

export async function registerAliyunRoutes(app) {
  aliyunConfig = loadAliyunESAConfig();
  aliyunService = new AliyunESAService({});

  if (aliyunConfig.accounts.length === 0) {
    console.log('No Aliyun ESA accounts configured, skipping Aliyun routes');
    return;
  }

  app.get('/api/aliyun/config', (req, res) => {
    const safeConfig = {
      accounts: aliyunConfig.accounts.map(acc => ({
        name: acc.name,
        region: acc.region
      })),
      enabledZones: aliyunConfig.enabledZones,
      disabledZones: aliyunConfig.disabledZones,
      hasConfig: aliyunConfig.accounts.length > 0
    };
    res.json(safeConfig);
  });

  app.get('/api/aliyun/zones', async (req, res) => {
    try {
      const allZones = [];
      for (const account of aliyunConfig.accounts) {
        const validation = await aliyunService.validateCredentials(account);
        if (validation.valid) {
          const zones = await aliyunService.fetchZones(account);
          const filteredZones = filterZones(zones, aliyunConfig);
          allZones.push(...filteredZones.map(zone => ({
            ...zone,
            accountName: account.name,
            platform: 'aliyun'
          })));
        }
      }
      res.json({ zones: allZones });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/aliyun/analytics', async (req, res) => {
    try {
      const { startTime, endTime, interval, accountName } = req.query;
      const allData = [];

      for (const account of aliyunConfig.accounts) {
        if (accountName && accountName !== account.name) continue;

        const validation = await aliyunService.validateCredentials(account);
        if (validation.valid) {
          const zones = await aliyunService.fetchZones(account);
          const filteredZones = filterZones(zones, aliyunConfig);

          for (const zone of filteredZones) {
            const metrics = await aliyunService.fetchMetrics(
              zone.id,
              startTime || new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
              endTime || new Date().toISOString(),
              interval || 'hour',
              account
            );

            allData.push({
              zone: zone.name,
              domain: zone.domain,
              accountName: account.name,
              platform: 'aliyun',
              ...metrics
            });
          }
        }
      }
      res.json({ analytics: allData });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/aliyun/dashboard', async (req, res) => {
    try {
      const { zoneId } = req.query;
      const allData = [];

      for (const account of aliyunConfig.accounts) {
        const validation = await aliyunService.validateCredentials(account);
        if (validation.valid) {
          const zones = await aliyunService.fetchZones(account);
          const filteredZones = filterZones(zones, aliyunConfig);

          if (zoneId) {
            const targetZone = filteredZones.find(z => z.id === zoneId);
            if (targetZone) {
              const data = await aliyunService.fetchDashboardData(account, targetZone);
              allData.push(data);
            }
          } else {
            for (const zone of filteredZones) {
              const data = await aliyunService.fetchDashboardData(account, zone);
              allData.push(data);
            }
          }
        }
      }
      res.json({ dashboard: allData });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
}

function filterZones(zones, config) {
  if (!zones || zones.length === 0) return [];

  return zones.filter(zone => {
    if (config.enabledZones.length > 0) {
      return config.enabledZones.some(enabled =>
        zone.name.includes(enabled) || zone.domain?.includes(enabled)
      );
    }
    if (config.disabledZones.length > 0) {
      return !config.disabledZones.some(disabled =>
        zone.name.includes(disabled) || zone.domain?.includes(disabled)
      );
    }
    return true;
  });
}
