# 部署文档

<img src="icon-deployment.svg" alt="Deployment" width="48" height="48" align="right"/>

本文档提供了 Unified Monitor 的详细部署指南，包括 Docker 部署、本地开发和生产环境配置。

## 目录

- [系统要求](#系统要求)
- [快速开始](#快速开始)
- [Docker 部署](#docker-部署)
- [本地开发](#本地开发)
- [生产环境部署](#生产环境部署)
- [配置说明](#配置说明)
- [故障排查](#故障排查)

## 系统要求

### 最低要求

- **操作系统**: Linux / macOS / Windows
- **Docker**: 20.10+
- **Docker Compose**: 2.0+
- **内存**: 2GB+
- **磁盘空间**: 5GB+

### 推荐配置

- **操作系统**: Ubuntu 20.04+ / CentOS 8+ / Debian 11+
- **Docker**: 24.0+
- **Docker Compose**: 2.20+
- **内存**: 4GB+
- **磁盘空间**: 10GB+
- **CPU**: 2 核心+

## 快速开始

### 使用 Docker Compose（推荐）

这是最快速、最简单的部署方式。

1. **克隆项目**

```bash
git clone https://github.com/yourusername/unified-monitor.git
cd unified-monitor
```

2. **配置环境变量**

```bash
cd docker
cp .env.example .env
```

3. **编辑配置文件**

编辑 `.env` 文件，填入你的 Cloudflare 和 EdgeOne 凭证：

```env
# Cloudflare 配置
CF_TOKENS=your_cloudflare_token
CF_ZONES=zone_id_1,zone_id_2
CF_DOMAINS=example.com,cdn.example.com
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
ALIYUN_ESA_ACCOUNT_NAME=Main Account

# 站点配置
SITE_NAME=Unified Monitor Dashboard
SITE_ICON=https://q2.qlogo.cn/headimg_dl?dst_uin=2726730791&spec=0
```

4. **启动服务**

```bash
docker-compose up -d
```

5. **访问应用**

打开浏览器访问 `http://localhost` 或 `http://your-server-ip`

## Docker 部署

### 方式一：Docker Compose（推荐）

#### 1. 准备配置文件

```bash
cd docker
cp .env.example .env
nano .env  # 或使用 vim .env
```

#### 2. 配置说明

##### Cloudflare 配置

**单账户配置**

```env
CF_TOKENS=your_cloudflare_token
CF_ZONES=zone_id_1,zone_id_2
CF_DOMAINS=example.com,cdn.example.com
CF_ACCOUNT_NAME=Main Account
```

**多账户配置**

```env
CF_TOKENS_1=token1
CF_ZONES_1=zone1,zone2
CF_DOMAINS_1=site1.com,site2.com
CF_ACCOUNT_NAME_1=Account 1

CF_TOKENS_2=token2
CF_ZONES_2=zone3,zone4
CF_DOMAINS_2=site3.com,site4.com
CF_ACCOUNT_NAME_2=Account 2
```

##### EdgeOne 配置

**单账户配置**

```env
EO_SECRET_ID=your_secret_id
EO_SECRET_KEY=your_secret_key
EO_REGION=ap-guangzhou
EO_ACCOUNT_NAME=Main Account
```

**多账户配置**

```env
EO_SECRET_ID_1=secret_id_1
EO_SECRET_KEY_1=secret_key_1
EO_REGION_1=ap-guangzhou
EO_ACCOUNT_NAME_1=Account 1

EO_SECRET_ID_2=secret_id_2
EO_SECRET_KEY_2=secret_key_2
EO_REGION_2=ap-guangzhou
EO_ACCOUNT_NAME_2=Account 2
```

#### 3. 启动服务

```bash
# 启动所有服务
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down

# 停止服务并删除数据卷
docker-compose down -v
```

#### 4. 服务说明

Docker Compose 会启动以下服务：

| 服务 | 端口 | 说明 |
|------|------|------|
| backend | 4000 | 后端 API 服务 |
| frontend | 3000 | 前端应用 |
| nginx | 80 | 反向代理 |

### 方式二：单独构建 Docker 镜像

#### 1. 构建后端镜像

```bash
cd backend
docker build -t unified-monitor-backend .
```

#### 2. 构建前端镜像

```bash
cd frontend
docker build -t unified-monitor-frontend .
```

#### 3. 运行容器

```bash
# 运行后端
docker run -d \
  --name unified-monitor-backend \
  -p 4000:4000 \
  -v $(pwd)/data:/app/backend/data \
  -e CF_TOKENS=your_token \
  -e CF_ZONES=your_zone_id \
  -e CF_DOMAINS=your_domain \
  unified-monitor-backend

# 运行前端
docker run -d \
  --name unified-monitor-frontend \
  -p 3000:80 \
  unified-monitor-frontend
```

### 方式三：使用 Docker Run 命令

```bash
docker run -d \
  --name unified-monitor \
  -p 80:80 \
  -e CF_TOKENS=your_cloudflare_token \
  -e CF_ZONES=zone_id_1,zone_id_2 \
  -e CF_DOMAINS=example.com,cdn.example.com \
  -e CF_ACCOUNT_NAME=Main Account \
  -e EO_SECRET_ID=your_secret_id \
  -e EO_SECRET_KEY=your_secret_key \
  -e EO_REGION=ap-guangzhou \
  -e EO_ACCOUNT_NAME=Main Account \
  -e SITE_NAME=Unified Monitor Dashboard \
  -e SITE_ICON=https://q2.qlogo.cn/headimg_dl?dst_uin=2726730791&spec=0 \
  unified-monitor:latest
```

## 本地开发

### 环境准备

1. **安装 Node.js**

```bash
# 使用 nvm 安装（推荐）
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18
```

2. **克隆项目**

```bash
git clone https://github.com/yourusername/unified-monitor.git
cd unified-monitor
```

### 后端开发

1. **安装依赖**

```bash
cd backend
npm install
```

2. **配置环境变量**

```bash
cp .env.example .env
nano .env
```

3. **启动开发服务器**

```bash
npm run dev
```

后端服务将在 `http://localhost:4000` 启动。

### 前端开发

1. **安装依赖**

```bash
cd frontend
npm install
```

2. **启动开发服务器**

```bash
npm run dev
```

前端应用将在 `http://localhost:3000` 启动。

### 开发工具

- **代码格式化**: 使用 ESLint 和 Prettier
- **类型检查**: 使用 TypeScript（可选）
- **测试**: 使用 Jest 和 React Testing Library

## 生产环境部署

### 使用 Nginx 反向代理

#### 1. 配置 Nginx

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api/ {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

#### 2. 配置 SSL（使用 Let's Encrypt）

```bash
# 安装 Certbot
sudo apt-get install certbot python3-certbot-nginx

# 获取 SSL 证书
sudo certbot --nginx -d your-domain.com

# 自动续期
sudo certbot renew --dry-run
```

### 使用 PM2 管理进程

#### 1. 安装 PM2

```bash
npm install -g pm2
```

#### 2. 创建 PM2 配置文件

创建 `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [
    {
      name: 'unified-monitor-backend',
      script: './backend/src/index.js',
      instances: 1,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 4000
      }
    }
  ]
};
```

#### 3. 启动应用

```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 使用 Systemd 服务

#### 1. 创建服务文件

创建 `/etc/systemd/system/unified-monitor.service`:

```ini
[Unit]
Description=Unified Monitor
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/unified-monitor/backend
ExecStart=/usr/bin/node src/index.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=PORT=4000

[Install]
WantedBy=multi-user.target
```

#### 2. 启动服务

```bash
sudo systemctl daemon-reload
sudo systemctl enable unified-monitor
sudo systemctl start unified-monitor
sudo systemctl status unified-monitor
```

## 配置说明

### 环境变量

#### 服务器配置

| 变量 | 默认值 | 说明 |
|------|--------|------|
| PORT | 4000 | 后端服务端口 |
| NODE_ENV | development | 运行环境（development/production） |
| EN | false | 是否使用英文界面 |

#### Cloudflare 配置

| 变量 | 必填 | 说明 |
|------|------|------|
| CF_TOKENS | 是 | Cloudflare API Token（逗号分隔） |
| CF_ZONES | 是 | Zone ID（逗号分隔） |
| CF_DOMAINS | 否 | 域名（逗号分隔） |
| CF_ACCOUNT_NAME | 否 | 账户显示名称 |

#### EdgeOne 配置

| 变量 | 必填 | 说明 |
|------|------|------|
| EO_SECRET_ID | 是 | 腾讯云 SecretId |
| EO_SECRET_KEY | 是 | 腾讯云 SecretKey |
| EO_REGION | 否 | 区域（默认 ap-guangzhou） |
| EO_ACCOUNT_NAME | 否 | 账户显示名称 |

#### 阿里云 ESA 配置

| 变量 | 必填 | 说明 |
|------|------|------|
| ALIYUN_ESA_ACCESS_KEY_ID | 是 | 阿里云 AccessKeyId |
| ALIYUN_ESA_ACCESS_KEY_SECRET | 是 | 阿里云 AccessKeySecret |
| ALIYUN_ESA_REGION | 否 | 区域（cn=国内版, international=国际版，默认 cn） |
| ALIYUN_ESA_ACCOUNT_NAME | 否 | 账户显示名称 |

#### 缓存配置

| 变量 | 默认值 | 说明 |
|------|--------|------|
| CF_UPDATE_INTERVAL | 7200000 | Cloudflare 数据更新间隔（毫秒） |
| EO_CACHE_TTL | 300000 | EdgeOne 数据缓存时间（毫秒） |

#### 站点配置

| 变量 | 默认值 | 说明 |
|------|--------|------|
| SITE_NAME | Unified Monitor Dashboard | 站点名称 |
| SITE_ICON | 默认图标 | 站点图标 URL |

### 配置文件

#### Cloudflare 配置文件

文件位置: `backend/src/config/cloudflare.yml`

```yaml
accounts:
  - name: "主账号"
    token: "YOUR_CF_TOKEN_1"
    zones:
      - zone_id: "ZONE_ID_1"
        domain: "example.com"
      - zone_id: "ZONE_ID_2"
        domain: "cdn.example.com"
  - name: "副账号"
    token: "YOUR_CF_TOKEN_2"
    zones:
      - zone_id: "ZONE_ID_3"
        domain: "foo.net"
```

#### EdgeOne 配置文件

文件位置: `backend/src/config/edgeone.yml`

```yaml
accounts:
  - name: "主账号"
    secretId: "YOUR_SECRET_ID"
    secretKey: "YOUR_SECRET_KEY"
    region: "ap-guangzhou"
  - name: "副账号"
    secretId: "YOUR_SECRET_ID_2"
    secretKey: "YOUR_SECRET_KEY_2"
    region: "ap-guangzhou"
```

#### 阿里云 ESA 配置文件

文件位置: `backend/src/config/aliyun.yml`

```yaml
accounts:
  - name: "主账号"
    accessKeyId: "YOUR_ACCESS_KEY_ID"
    accessKeySecret: "YOUR_ACCESS_KEY_SECRET"
    region: "cn"  # cn=国内版, international=国际版
  - name: "副账号"
    accessKeyId: "YOUR_ACCESS_KEY_ID_2"
    accessKeySecret: "YOUR_ACCESS_KEY_SECRET_2"
    region: "international"

# 可选：配置站点显示
enabledZones:
  - "example.com"
  - "cdn.example.com"

# 可选：禁用某些站点
disabledZones:
  - "test.example.com"
```

## 故障排查

### 常见问题

#### 1. 容器无法启动

**问题**: Docker 容器启动失败

**解决方案**:

```bash
# 查看容器日志
docker-compose logs backend
docker-compose logs frontend

# 检查端口占用
netstat -tulpn | grep :4000
netstat -tulpn | grep :3000

# 重新构建镜像
docker-compose build --no-cache
docker-compose up -d
```

#### 2. 无法连接到 Cloudflare API

**问题**: Cloudflare API 连接失败

**解决方案**:

1. 检查 API Token 是否正确
2. 确认 Token 权限是否包含：
   - Account | Analytics | Read
   - Zone | Analytics | Read
   - Zone | Zone | Read
3. 检查网络连接是否正常

#### 3. 无法连接到 EdgeOne API

**问题**: EdgeOne API 连接失败

**解决方案**:

1. 检查 SecretId 和 SecretKey 是否正确
2. 确认密钥权限是否包含 EdgeOne 只读访问权限
3. 检查区域配置是否正确

#### 4. 前端无法加载数据

**问题**: 前端显示"加载数据失败"

**解决方案**:

1. 检查后端服务是否正常运行
2. 检查 API 端点是否可访问
3. 检查浏览器控制台是否有错误信息
4. 检查 CORS 配置是否正确

#### 5. 数据更新不及时

**问题**: Cloudflare 数据没有更新

**解决方案**:

1. 检查定时任务是否正常运行
2. 检查数据文件权限是否正确
3. 手动触发数据更新

### 日志查看

#### Docker 日志

```bash
# 查看所有服务日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs -f backend
docker-compose logs -f frontend

# 查看最近 100 行日志
docker-compose logs --tail=100
```

#### 应用日志

```bash
# 查看后端日志
tail -f backend/logs/app.log

# 查看 Nginx 日志
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### 性能优化

#### 1. 增加内存缓存

修改 `backend/src/middleware/cache.js`:

```javascript
const cache = new NodeCache({ stdTTL: 600, checkperiod: 620 });
```

#### 2. 启用 Gzip 压缩

修改 `docker/nginx.conf`:

```nginx
gzip on;
gzip_vary on;
gzip_proxied any;
gzip_comp_level 6;
gzip_types text/plain text/css text/xml text/javascript
           application/json application/javascript application/xml+rss
           application/rss+xml font/truetype font/opentype
           application/vnd.ms-fontobject image/svg+xml;
```

#### 3. 启用 CDN

将静态资源托管到 CDN，加速访问。

## 备份与恢复

### 备份

```bash
# 备份数据文件
tar -czf backup-$(date +%Y%m%d).tar.gz backend/data/

# 备份配置文件
tar -czf config-$(date +%Y%m%d).tar.gz backend/src/config/
```

### 恢复

```bash
# 恢复数据文件
tar -xzf backup-20240101.tar.gz -C backend/

# 恢复配置文件
tar -xzf config-20240101.tar.gz -C backend/src/config/
```

## 监控与告警

### 健康检查

```bash
# 检查服务健康状态
curl http://localhost:4000/health
curl http://localhost:4000/api/status
```

### 日志监控

使用工具如 ELK Stack、Grafana Loki 等进行日志监控。

### 性能监控

使用工具如 Prometheus、Grafana 等进行性能监控。

## 更新升级

### 更新代码

```bash
# 拉取最新代码
git pull origin main

# 重新构建镜像
docker-compose build

# 重启服务
docker-compose up -d
```

### 数据迁移

在更新前备份数据，更新后验证数据完整性。

## 安全建议

1. **使用强密码**: 为所有账户使用强密码
2. **启用 HTTPS**: 在生产环境中启用 SSL/TLS
3. **限制访问**: 使用防火墙限制不必要的访问
4. **定期更新**: 定期更新系统和依赖
5. **监控日志**: 定期检查日志，发现异常
6. **备份数据**: 定期备份重要数据

## 部署到静态托管平台

### EdgeOne Pages 部署

支持前端静态部署到 EdgeOne Pages。

1. **克隆项目**

```bash
git clone https://github.com/yourusername/unified-monitor.git
cd unified-monitor
```

2. **配置后端 API 地址**

编辑 `frontend/.env.production` 文件，配置后端 API 地址：

```env
VITE_API_TARGET=https://your-backend-domain.com
```

3. **在 EdgeOne Pages 创建项目**

- 登录 [EdgeOne Pages 控制台](https://console.cloud.tencent.com/tencentcloud/pages)
- 连接 GitHub/GitLab 仓库
- 选择 `frontend` 目录作为构建目录
- 构建命令: `npm run build`
- 输出目录: `dist`

4. **配置环境变量**

在 EdgeOne Pages 项目设置中添加:
- `VITE_API_TARGET`: 后端服务地址

### Cloudflare Pages 部署

支持前端静态部署到 Cloudflare Pages。

1. **推送代码到 GitHub**

将代码推送到 GitHub 仓库。

2. **配置 Cloudflare**

- 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
- 进入 Pages 项目
- 连接 GitHub 仓库
- 选择 `frontend` 目录
- 构建命令: `npm run build`
- 输出目录: `dist`

3. **配置环境变量**

在 Pages 设置中添加:
- `VITE_API_TARGET`: 后端服务地址

4. **配置 secrets**

在 GitHub 仓库设置中添加:
- `CLOUDFLARE_API_TOKEN`: Cloudflare API Token
- `CLOUDFLARE_ACCOUNT_ID`: Cloudflare 账户 ID

5. **自动部署**

推送代码后，GitHub Actions 会自动部署到 Cloudflare Pages。

### GitHub Pages 部署

支持前端静态部署到 GitHub Pages。

1. **启用 GitHub Pages**

- 进入仓库设置
- 找到 Pages 选项
- 选择 GitHub Actions 作为部署源

2. **配置环境变量**

在 GitHub 仓库设置中添加:
- `VITE_API_TARGET`: 后端服务地址

3. **自动部署**

推送代码后，GitHub Actions 会自动部署到 GitHub Pages。

## 部署到 Serverless 平台

### EdgeOne 云函数部署后端

后端支持部署到腾讯云 EdgeOne 云函数（Serverless）。

1. **克隆项目**

```bash
git clone https://github.com/yourusername/unified-monitor.git
cd unified-monitor
```

2. **配置环境变量**

复制环境变量示例文件并配置：

```bash
cd backend
cp .env.example .env
# 编辑配置文件，添加您的 API 密钥
```

3. **安装 Serverless Framework**

```bash
npm install -g serverless
```

4. **部署到腾讯云**

```bash
serverless deploy
```

或者使用 Serverless CLI：

```bash
cd backend
serverless deploy
```

5. **获取 API 地址**

部署完成后，Serverless 会输出 API 网关地址，格式类似：
```
apiGateway:
  url: https://service-xxx-xxx.ap-guangzhou.apigateway.com
```

6. **配置前端环境变量**

将获取到的 API 地址配置到前端：
```
VITE_API_TARGET=https://service-xxx-xxx.ap-guangzhou.apigateway.com
```

### Cloudflare Workers 部署后端

后端支持部署到 Cloudflare Workers（Serverless）。

1. **克隆项目**

```bash
git clone https://github.com/yourusername/unified-monitor.git
cd unified-monitor
```

2. **配置环境变量**

复制环境变量示例文件并配置：

```bash
cd backend
cp .env.example .env
# 编辑配置文件，添加您的 API 密钥
```

3. **安装 Wrangler CLI**

```bash
npm install -g wrangler
```

4. **部署到 Cloudflare Workers**

```bash
cd backend
wrangler deploy
```

5. **获取 API 地址**

部署完成后，Wrangler 会输出 Workers 地址，格式类似：
```
https://unified-monitor-backend.your-account.workers.dev
```

6. **配置前端环境变量**

将获取到的 API 地址配置到前端：
```
VITE_API_TARGET=https://unified-monitor-backend.your-account.workers.dev
```

## 支持

如有问题，请提交 Issue 或联系技术支持。
