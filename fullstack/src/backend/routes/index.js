import express from 'express';
import cloudflareRouter from './cloudflare.js';
import edgeoneRouter from './edgeone.js';
import { registerAliyunRoutes } from './aliyun.js';
import { loadAliyunESAConfig } from '../config/index.js';

const router = express.Router();

router.use('/cloudflare', cloudflareRouter);
router.use('/edgeone', edgeoneRouter);

registerAliyunRoutes(router);

router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

router.get('/status', (req, res) => {
  const platforms = ['cloudflare', 'edgeone'];
  
  try {
    const aliyunConfig = loadAliyunESAConfig();
    if (aliyunConfig.accounts.length > 0) {
      platforms.push('aliyun');
    }
  } catch (e) {
    // Aliyun not configured
  }

  res.json({
    status: 'running',
    platforms,
    timestamp: new Date().toISOString()
  });
});

export default router;
