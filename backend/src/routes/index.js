import express from 'express';
import cloudflareRouter from './cloudflare.js';
import edgeoneRouter from './edgeone.js';

const router = express.Router();

router.use('/cloudflare', cloudflareRouter);
router.use('/edgeone', edgeoneRouter);

router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

router.get('/status', (req, res) => {
  res.json({
    status: 'running',
    platforms: ['cloudflare', 'edgeone'],
    timestamp: new Date().toISOString()
  });
});

export default router;
