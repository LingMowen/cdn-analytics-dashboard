import express from 'express';
import cron from 'node-cron';
import fs from 'fs/promises';
import yaml from 'js-yaml';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';
import { loadAllConfig } from './config/index.js';
import routes from './routes/index.js';
import { logger, _ } from './utils/logger.js';
import { CloudflareService } from './services/cloudflare.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONFIG = loadAllConfig();
const OUT = './data/analytics.json';
const PORT = process.env.PORT || CONFIG.server.port || 4000;

const app = express();

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

app.use('/api', routes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

let updateTask = null;

async function updateCloudflareData() {
  try {
    logger.info(_(`[Cloudflare数据更新] 开始更新数据... ${new Date().toLocaleString()}`, `[Cloudflare Data Update] Starting data update... ${new Date().toLocaleString()}`));

    const cfConfig = CONFIG.cloudflare;
    const cfService = new CloudflareService(cfConfig);

    const payload = { accounts: [] };

    for (const [accIndex, acc] of cfConfig.accounts.entries()) {
      logger.info(_(`  处理账户 ${accIndex + 1}/${cfConfig.accounts.length}: ${acc.name}`, `  Processing Account ${accIndex + 1}/${cfConfig.accounts.length}: ${acc.name}`));
      const accData = { name: acc.name, zones: [] };

      for (const [zoneIndex, z] of acc.zones.entries()) {
        try {
          logger.info(_(`    处理 Zone ${zoneIndex + 1}/${acc.zones.length}: ${z.domain}`, `    Processing Zone ${zoneIndex + 1}/${acc.zones.length}: ${z.domain}`));
          
          const zoneData = await cfService.fetchDashboardData(acc, z);
          
          logger.info(_(`    Zone ${z.domain} 数据获取成功: 天级 ${zoneData.raw.length}, 小时级 ${zoneData.rawHours.length}, 地理位置 ${zoneData.geography.length}`, 
                        `    Zone ${z.domain} Data retrieved: Daily ${zoneData.raw.length}, Hourly ${zoneData.rawHours.length}, Geo ${zoneData.geography.length}`));
          
          accData.zones.push(zoneData);

        } catch (error) {
          logger.error(_(`    Zone ${z.domain} 处理失败:`, `    Zone ${z.domain} Processing Failed:`), error.message);
          accData.zones.push({
            domain: z.domain,
            raw: [],
            rawHours: [],
            geography: [],
            error: error.message
          });
        }
      }
      payload.accounts.push(accData);
    }

    await fs.mkdir('./data', { recursive: true });
    await fs.writeFile(OUT, JSON.stringify(payload, null, 2));
    logger.info(_(`[Cloudflare数据更新] 数据更新完成: ${payload.accounts.length} 个账户`, `[Cloudflare Data Update] Data update completed: ${payload.accounts.length} accounts`));
  } catch (error) {
    logger.error(_('[Cloudflare数据更新] 全局错误:', '[Cloudflare Data Update] Global Error:'), error.message);
  }
}

async function initialize() {
  try {
    await updateCloudflareData();
    
    if (!updateTask) {
      updateTask = cron.schedule('0 */2 * * *', updateCloudflareData);
    }
    
    logger.info(_(`[初始化完成] 服务运行在端口 ${PORT}`, `[Initialization Complete] Server running on port ${PORT}`));
    logger.info(_(`环境: ${CONFIG.server.nodeEnv}`, `Environment: ${CONFIG.server.nodeEnv}`));
    logger.info(_(`语言: ${CONFIG.server.isEn ? 'English' : '中文'}`, `Language: ${CONFIG.server.isEn ? 'English' : 'Chinese'}`));
    logger.info(_(`Cloudflare配置加载成功: ${CONFIG.cloudflare.accounts.length} 个账户`, `Cloudflare config loaded: ${CONFIG.cloudflare.accounts.length} accounts`));
    logger.info(_(`EdgeOne配置加载成功: ${CONFIG.edgeone.accounts.length} 个账户`, `EdgeOne config loaded: ${CONFIG.edgeone.accounts.length} accounts`));
    logger.info(_(`阿里云ESA配置加载成功: ${CONFIG.aliyun.accounts.length} 个账户`, `Aliyun ESA config loaded: ${CONFIG.aliyun.accounts.length} accounts`));
  } catch (error) {
    logger.error(_('[初始化失败]', '[Initialization Failed]'), error.message);
  }
}

let server = null;

async function startServer() {
  if (!server) {
    server = app.listen(PORT, () => {
      initialize();
    });
  }
  return server;
}

async function stopServer() {
  if (server) {
    await new Promise((resolve) => {
      server.close(resolve);
    });
    server = null;
    if (updateTask) {
      updateTask.stop();
      updateTask = null;
    }
  }
}

export async function main(event, context) {
  if (event.action === 'start') {
    await startServer();
    return { statusCode: 200, body: 'Server started' };
  }
  
  if (event.httpMethod) {
    return new Promise((resolve) => {
      const req = {
        method: event.httpMethod,
        path: event.path,
        headers: event.headers || {},
        query: event.queryStringParameters || {},
        body: event.body,
        params: event.pathParameters || {}
      };

      const res = {
        statusCode: 200,
        headers: {},
        body: '',
        setHeader: function(key, value) {
          this.headers[key] = value;
        },
        status: function(code) {
          this.statusCode = code;
          return this;
        },
        send: function(data) {
          this.body = typeof data === 'string' ? data : JSON.stringify(data);
          resolve({
            statusCode: this.statusCode,
            headers: this.headers,
            body: this.body
          });
        },
        json: function(data) {
          this.setHeader('Content-Type', 'application/json');
          this.body = JSON.stringify(data);
          resolve({
            statusCode: this.statusCode,
            headers: this.headers,
            body: this.body
          });
        }
      };

      app(req, res);
    });
  }

  return { statusCode: 200, body: 'CDN Analytics API' };
}

startServer();
