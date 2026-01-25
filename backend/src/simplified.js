import express from 'express';
import axios from 'axios';
import 'dotenv/config';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Test endpoint to check environment variables
app.get('/test-env', (req, res) => {
  const env = {
    EO_SECRET_ID: process.env.EO_SECRET_ID ? '***HIDDEN***' : 'NOT_SET',
    EO_SECRET_KEY: process.env.EO_SECRET_KEY ? '***HIDDEN***' : 'NOT_SET',
    EO_REGION: process.env.EO_REGION || 'NOT_SET',
    EO_ACCOUNT_NAME: process.env.EO_ACCOUNT_NAME || 'NOT_SET',
    CF_TOKENS: process.env.CF_TOKENS || 'NOT_SET',
    PORT: process.env.PORT || 'NOT_SET'
  };
  res.json(env);
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Root path
app.get('/', (req, res) => {
  res.json({ message: 'Unified Monitor Backend', status: 'running' });
});

// API routes
app.get('/api/edgeone/config', (req, res) => {
  res.json({
    platform: 'edgeone',
    siteName: process.env.SITE_NAME || 'Unified Monitor Dashboard',
    siteIcon: process.env.SITE_ICON || 'https://q2.qlogo.cn/headimg_dl?dst_uin=2726730791&spec=0',
    accounts: [{
      name: process.env.EO_ACCOUNT_NAME || 'Default Account',
      region: process.env.EO_REGION || 'ap-guangzhou'
    }]
  });
});

app.get('/api/edgeone/zones', (req, res) => {
  res.json([{
    account: process.env.EO_ACCOUNT_NAME || 'Default Account',
    zones: [
      {
        id: 'test-zone-1',
        name: 'example.com'
      }
    ]
  }]);
});

app.get('/api/edgeone/metrics', (req, res) => {
  console.log('GET /api/edgeone/metrics requested with params:', req.query);
  // Generate sample data for the last 24 hours
  const data = [];
  const now = new Date();
  for (let i = 23; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 60 * 60 * 1000);
    data.push({
      timestamp: time.toISOString(),
      requests: Math.floor(Math.random() * 10000) + 5000,
      bytes: Math.floor(Math.random() * 1000000000) + 500000000,
      bandwidth: Math.floor(Math.random() * 1000000) + 500000
    });
  }
  res.json(data);
});

app.get('/api/cloudflare/config', (req, res) => {
  res.json({
    platform: 'cloudflare',
    accounts: []
  });
});

app.get('/api/cloudflare/analytics', (req, res) => {
  res.json({ accounts: [] });
});

app.get('/api/status', (req, res) => {
  res.json({
    status: 'running',
    platforms: ['cloudflare', 'edgeone'],
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`Simplified backend server running on port ${PORT}`);
  console.log('EdgeOne account configured:', process.env.EO_SECRET_ID ? 'YES' : 'NO');
  console.log('Cloudflare account configured:', process.env.CF_TOKENS && process.env.CF_TOKENS !== 'your_cloudflare_token' ? 'YES' : 'NO');
});
