import express from 'express';
import { CloudflareService } from '../services/cloudflare.js';
import { loadCloudflareConfig } from '../config/index.js';
import fs from 'fs/promises';

const router = express.Router();

const cfConfig = loadCloudflareConfig();
const cfService = new CloudflareService(cfConfig);

const DATA_FILE = './data/analytics.json';

router.get('/config', (req, res) => {
  res.json({
    platform: 'cloudflare',
    accounts: cfConfig.accounts.map(acc => ({
      name: acc.name,
      zonesCount: acc.zones.length
    }))
  });
});

router.get('/zones', async (req, res) => {
  try {
    const results = [];

    for (const account of cfConfig.accounts) {
      const validation = await cfService.validateCredentials(account);
      if (!validation.valid) {
        return res.status(400).json({ error: validation.error });
      }

      const zones = await cfService.fetchZones(account);
      results.push({
        account: account.name,
        zones: zones.map(z => ({
          id: z.zoneTag,
          name: z.name
        }))
      });
    }

    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/analytics', async (req, res) => {
  try {
    const dataExists = await fs.access(DATA_FILE).then(() => true).catch(() => false);

    if (!dataExists) {
      return res.status(404).json({ error: 'Analytics data not found' });
    }

    const data = await fs.readFile(DATA_FILE, 'utf-8');
    res.json(JSON.parse(data));
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

    const account = cfConfig.accounts[0];
    const rawData = await cfService.fetchMetrics(account, zoneId, startTime, endTime, interval);
    const formattedData = cfService.formatData(rawData, interval);

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

    const account = cfConfig.accounts[0];
    const data = await cfService.fetchGeography(account, zoneId, startTime, endTime);

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
