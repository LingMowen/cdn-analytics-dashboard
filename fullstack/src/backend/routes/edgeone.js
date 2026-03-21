import express from 'express';
import { EdgeOneService } from '../services/edgeone.js';
import { loadEdgeOneConfig } from '../config/index.js';

const router = express.Router();

const eoConfig = loadEdgeOneConfig();
const eoService = new EdgeOneService(eoConfig);

// 根据配置过滤站点
function filterZones(zones, config) {
  if (!zones || !Array.isArray(zones)) return zones;
  
  const enabledZones = config.enabledZones || [];
  const disabledZones = config.disabledZones || [];
  
  // 如果没有配置，返回所有站点
  if (enabledZones.length === 0 && disabledZones.length === 0) {
    return zones;
  }
  
  return zones.filter(zone => {
    const zoneName = zone.name || zone.ZoneName || '';
    
    // 如果在禁用列表中，不显示
    if (disabledZones.length > 0) {
      const isDisabled = disabledZones.some(dz => 
        zoneName.toLowerCase() === dz.toLowerCase() ||
        zoneName.toLowerCase().includes(dz.toLowerCase())
      );
      if (isDisabled) return false;
    }
    
    // 如果启用了白名单，只显示白名单中的站点
    if (enabledZones.length > 0) {
      const isEnabled = enabledZones.some(ez => 
        zoneName.toLowerCase() === ez.toLowerCase() ||
        zoneName.toLowerCase().includes(ez.toLowerCase())
      );
      return isEnabled;
    }
    
    return true;
  });
}

router.get('/config', (req, res) => {
  res.json({
    platform: 'edgeone',
    siteName: process.env.SITE_NAME || 'Unified Monitor Dashboard',
    siteIcon: process.env.SITE_ICON || 'https://q2.qlogo.cn/headimg_dl?dst_uin=2726730791&spec=0',
    accounts: eoConfig.accounts.map(acc => ({
      name: acc.name,
      region: acc.region
    })),
    zoneConfig: {
      enabledZones: eoConfig.enabledZones || [],
      disabledZones: eoConfig.disabledZones || [],
      totalEnabled: (eoConfig.enabledZones || []).length,
      totalDisabled: (eoConfig.disabledZones || []).length
    }
  });
});

router.get('/zones', async (req, res) => {
  try {
    const results = [];

    for (const account of eoConfig.accounts) {
      const validation = await eoService.validateCredentials(account);
      if (!validation.valid) {
        return res.status(400).json({ error: validation.error });
      }

      const zones = await eoService.fetchZones(account);
      
      // 转换并过滤站点
      const mappedZones = zones.map(z => ({
        id: z.ZoneId,
        name: z.ZoneName
      }));
      
      const filteredZones = filterZones(mappedZones, eoConfig);
      
      results.push({
        account: account.name,
        zones: filteredZones
      });
    }

    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/metrics', async (req, res) => {
  try {
    const { zoneId, startTime, endTime, interval } = req.query;

    if (!zoneId) {
      return res.status(400).json({ error: 'zoneId is required' });
    }

    const account = eoConfig.accounts[0];
    const rawData = await eoService.fetchMetrics(account, zoneId, startTime, endTime, interval);
    const formattedData = eoService.formatData(rawData);

    res.json(formattedData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/geography', async (req, res) => {
  try {
    const { zoneId, startTime, endTime } = req.query;

    if (!zoneId) {
      return res.status(400).json({ error: 'zoneId is required' });
    }

    const account = eoConfig.accounts[0];
    const data = await eoService.fetchGeography(account, zoneId, startTime, endTime);

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/origin-pull', async (req, res) => {
  try {
    const { zoneId, startTime, endTime, interval } = req.query;

    if (!zoneId) {
      return res.status(400).json({ error: 'zoneId is required' });
    }

    const account = eoConfig.accounts[0];
    const rawData = await eoService.fetchOriginPull(account, zoneId, startTime, endTime, interval);
    
    console.log('DEBUG OriginPull rawData:', JSON.stringify(rawData, null, 2));
    
    const formattedData = eoService.formatOriginPullData(rawData);
    
    console.log('DEBUG OriginPull formatted:', JSON.stringify(formattedData, null, 2));

    res.json(formattedData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/top-analysis', async (req, res) => {
  try {
    const { zoneId, metric, startTime, endTime } = req.query;

    if (!zoneId || !metric) {
      return res.status(400).json({ error: 'zoneId and metric are required' });
    }

    const account = eoConfig.accounts[0];
    const data = await eoService.fetchTopAnalysis(account, zoneId, metric, startTime, endTime);

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/pages/build-count', async (req, res) => {
  try {
    const { zoneId } = req.query;
    const account = eoConfig.accounts[0];

    let targetZoneId = zoneId;

    if (!targetZoneId) {
      try {
        const zonesData = await eoService.fetchZones(account);
        if (zonesData && zonesData.length > 0) {
          const pagesZone = zonesData.find(z => z.ZoneName === 'default-pages-zone');
          if (pagesZone) {
            targetZoneId = pagesZone.ZoneId;
          } else {
            targetZoneId = zonesData[0].ZoneId;
          }
        }
      } catch (zErr) {
        console.error("Error fetching zones for Pages:", zErr);
      }
    }

    if (!targetZoneId) {
      return res.status(400).json({ error: "Missing ZoneId and could not auto-discover one." });
    }

    const data = await eoService.fetchPagesBuildCount(account, targetZoneId);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/pages/cloud-function-requests', async (req, res) => {
  try {
    const { zoneId, startTime, endTime } = req.query;
    const account = eoConfig.accounts[0];

    let targetZoneId = zoneId;

    if (!targetZoneId) {
      try {
        const zonesData = await eoService.fetchZones(account);
        if (zonesData && zonesData.length > 0) {
          const pagesZone = zonesData.find(z => z.ZoneName === 'default-pages-zone');
          if (pagesZone) {
            targetZoneId = pagesZone.ZoneId;
          } else {
            targetZoneId = zonesData[0].ZoneId;
          }
        }
      } catch (zErr) {
        console.error("Error fetching zones for Pages:", zErr);
      }
    }

    if (!targetZoneId) {
      return res.status(400).json({ error: "Missing ZoneId and could not auto-discover one." });
    }

    const data = await eoService.fetchPagesCloudFunctionRequests(account, targetZoneId, startTime, endTime);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/pages/cloud-function-monthly-stats', async (req, res) => {
  try {
    const { zoneId } = req.query;
    const account = eoConfig.accounts[0];

    let targetZoneId = zoneId;

    if (!targetZoneId) {
      try {
        const zonesData = await eoService.fetchZones(account);
        if (zonesData && zonesData.length > 0) {
          const pagesZone = zonesData.find(z => z.ZoneName === 'default-pages-zone');
          if (pagesZone) {
            targetZoneId = pagesZone.ZoneId;
          } else {
            targetZoneId = zonesData[0].ZoneId;
          }
        }
      } catch (zErr) {
        console.error("Error fetching zones for Pages:", zErr);
      }
    }

    if (!targetZoneId) {
      return res.status(400).json({ error: "Missing ZoneId and could not auto-discover one." });
    }

    const data = await eoService.fetchPagesCloudFunctionMonthlyStats(account, targetZoneId);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
