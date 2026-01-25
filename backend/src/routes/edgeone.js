import express from 'express';
import { EdgeOneService } from '../services/edgeone.js';
import { loadEdgeOneConfig } from '../config/index.js';

const router = express.Router();

const eoConfig = loadEdgeOneConfig();
const eoService = new EdgeOneService(eoConfig);

router.get('/config', (req, res) => {
  res.json({
    platform: 'edgeone',
    siteName: process.env.SITE_NAME || 'Unified Monitor Dashboard',
    siteIcon: process.env.SITE_ICON || 'https://q2.qlogo.cn/headimg_dl?dst_uin=2726730791&spec=0',
    accounts: eoConfig.accounts.map(acc => ({
      name: acc.name,
      region: acc.region
    }))
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
      results.push({
        account: account.name,
        zones: zones.map(z => ({
          id: z.ZoneId,
          name: z.ZoneName
        }))
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
    const formattedData = eoService.formatData(rawData);

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
