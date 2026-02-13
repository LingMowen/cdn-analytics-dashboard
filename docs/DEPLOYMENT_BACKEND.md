# 后端部署指南

本文档详细介绍 Unified Monitor 后端的多种部署方式。

## 目录

- [Node.js 部署](#nodejs-部署)
- [Docker 部署](#docker-部署)
- [PM2 部署](#pm2-部署)
- [Cloudflare Workers 部署](#cloudflare-workers-部署)
- [腾讯云云函数部署](#腾讯云云函数部署)

## 准备工作

### 1. 克隆项目

```bash
git clone https://github.com/LingMowen/cdn-analytics-dashboard.git
cd cdn-analytics-dashboard
```

### 2. 配置环境变量

```bash
cd backend
cp .env.example .env
# 编辑 .env 文件，配置您的 API 密钥
```

## Node.js 部署

### 环境要求

- Node.js 18+
- npm 9+

### 1. 安装依赖

```bash
cd backend
npm install
```

### 2. 配置环境变量

编辑 `backend/.env` 文件：

```env
# 服务器配置
PORT=4000
NODE_ENV=production
EN=false

# Cloudflare 配置
CF_TOKENS=your_cloudflare_token
CF_ZONES=zone_id_1,zone_id_2
CF_DOMAINS=example.com
CF_ACCOUNT_NAME=Main Account

# EdgeOne 配置
EO_SECRET_ID=your_secret_id
EO_SECRET_KEY=your_secret_key
EO_REGION=ap-guangzhou
EO_ACCOUNT_NAME=Main Account

# 阿里云 ESA 配置
ALIYUN_ESA_ACCESS_KEY_ID=your_access_key_id
ALIYUN_ESA_ACCESS_KEY_SECRET=your_access_key_secret
ALIYUN_ESA_REGION=cn

# 站点配置
SITE_NAME=Unified Monitor
```

### 3. 启动服务

```bash
# 开发环境
npm run dev

# 生产环境
npm start
```

### 4. 使用 Nginx 反向代理

```nginx
server {
    listen 80;
    server_name api.example.com;

    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Docker 部署

### 1. 构建 Docker 镜像

```bash
cd backend
docker build -t cdn-analytics-backend .
```

### 2. 运行容器

```bash
docker run -d \
  --name cdn-backend \
  -p 4000:4000 \
  -v $(pwd)/.env:/app/.env \
  cdn-analytics-backend
```

### 3. 使用 Docker Compose

在项目根目录创建 `docker-compose.yml`：

```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "4000:4000"
    env_file:
      - ./backend/.env
    restart: unless-stopped
```

启动：

```bash
docker-compose up -d
```

## PM2 部署

### 1. 安装 PM2

```bash
npm install -g pm2
```

### 2. 启动服务

```bash
cd backend
pm2 start src/index.js --name cdn-backend
```

### 3. 管理 PM2

```bash
# 查看状态
pm2 status

# 查看日志
pm2 logs cdn-backend

# 重启
pm2 restart cdn-backend

# 停止
pm2 stop cdn-backend
```

### 4. 开机自启

```bash
pm2 startup
pm2 save
```

## Cloudflare Workers 部署

### 1. 安装 Wrangler CLI

```bash
npm install -g wrangler
```

### 2. 登录 Cloudflare

```bash
wrangler login
```

### 3. 配置 wrangler.toml

在 `backend` 目录创建 `wrangler.toml`：

```toml
name = "cdn-analytics-backend"
main = "src/index.js"
compatibility_date = "2023-12-01"

[env.production]
vars = { NODE_ENV = "production" }

[[kv_namespaces]]
binding = "CACHE"
preview_id = "preview-cache"
```

### 4. 部署

```bash
cd backend
wrangler deploy --env production
```

### 5. 获取 API 地址

部署完成后会返回 Workers 地址，格式如：
```
https://cdn-analytics-backend.your-account.workers.dev
```

## 腾讯云云函数部署

### 1. 安装 Serverless Framework

```bash
npm install -g serverless
```

### 2. 配置 serverless.yml

在 `backend` 目录创建 `serverless.yml`：

```yaml
component: apigw
name: cdn-analytics-backend
inputs:
  name: cdn-analytics-backend
  runtime: Nodejs18
  region: ap-guangzhou
  timeout: 60
  memorySize: 512
  environment:
    variables:
      NODE_ENV: production
  events:
    - apigw:
        name: cdn-analytics-backend
        endpoints:
          - path: /
            method: ANY
          - path: /{proxy+}
            method: ANY
```

### 3. 部署

```bash
cd backend
serverless deploy
```

### 4. 获取 API 地址

部署完成后会返回 API 网关地址，格式如：
```
https://service-xxx-xxx.ap-guangzhou.apigateway.com
```

## 环境变量说明

### 服务器配置

| 变量 | 默认值 | 说明 |
|------|--------|------|
| PORT | 4000 | 服务端口 |
| NODE_ENV | development | 运行环境 |
| EN | false | 是否使用英文 |

### Cloudflare 配置

| 变量 | 说明 |
|------|------|
| CF_TOKENS | Cloudflare API Token（逗号分隔） |
| CF_ZONES | Zone ID（逗号分隔） |
| CF_DOMAINS | 域名（逗号分隔） |
| CF_ACCOUNT_NAME | 账户显示名称 |

### EdgeOne 配置

| 变量 | 说明 |
|------|------|
| EO_SECRET_ID | 腾讯云 SecretId |
| EO_SECRET_KEY | 腾讯云 SecretKey |
| EO_REGION | 区域 |
| EO_ACCOUNT_NAME | 账户显示名称 |

### 阿里云 ESA 配置

| 变量 | 说明 |
|------|------|
| ALIYUN_ESA_ACCESS_KEY_ID | 阿里云 AccessKeyId |
| ALIYUN_ESA_ACCESS_KEY_SECRET | 阿里云 AccessKeySecret |
| ALIYUN_ESA_REGION | cn=国内版, international=国际版 |

## 常见问题

### 1. 端口被占用

```bash
# 查找占用端口的进程
lsof -i :4000

# 杀死进程
kill -9 <PID>
```

### 2. 内存不足

增加 Node.js 内存限制：
```bash
NODE_OPTIONS="--max-old-space-size=4096" npm start
```

### 3. CORS 错误

确保后端配置允许前端域名的 CORS 访问。

### 4. 数据获取失败

检查环境变量中的 API 密钥是否正确配置。
