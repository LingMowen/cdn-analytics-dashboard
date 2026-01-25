# Unified Monitor 项目使用指南

## 目录

- [项目简介](#项目简介)
- [功能特性](#功能特性)
- [技术架构](#技术架构)
- [环境要求](#环境要求)
- [快速开始](#快速开始)
- [详细配置](#详细配置)
- [使用指南](#使用指南)
- [API 接口](#api-接口)
- [部署说明](#部署说明)
- [常见问题](#常见问题)
- [更新日志](#更新日志)
- [贡献指南](#贡献指南)
- [许可证](#许可证)

## 项目简介

Unified Monitor 是一个统一监控仪表盘项目，旨在帮助用户同时监控 Cloudflare 和 EdgeOne 两个主流 CDN 平台的流量数据。通过本项目，您可以：

- 在统一的界面中查看所有 CDN 平台的监控数据
- 快速切换不同平台的视图进行对比分析
- 支持多账户、多 Zone 的统一管理
- 实时掌握流量、带宽、请求数等关键指标
- 获取详细的地理位置分布和缓存分析数据

本项目采用前后端分离架构，后端基于 Node.js + Express 构建，前端基于 React + Vite + Tailwind CSS 构建，支持 Docker 容器化部署。

## 功能特性

### 核心功能

1. **多平台支持**
   - 支持 Cloudflare CDN 平台
   - 支持 EdgeOne CDN 平台
   - 统一的数据展示和管理界面

2. **统一仪表盘**
   - 在一个界面查看所有平台数据
   - 实时数据更新和展示
   - 直观的数据可视化图表

3. **平台切换**
   - 快速切换不同平台视图
   - 支持数据对比分析
   - 独立的平台配置管理

4. **多账户管理**
   - 支持多个 Cloudflare 账户
   - 支持多个 EdgeOne 账户
   - 灵活的账户配置方式

5. **多 Zone 监控**
   - 支持监控多个 Zone
   - Zone 级别的数据统计
   - 批量数据获取和处理

### Cloudflare 专属功能

- 多账户和多 Zone 监控
- 历史数据分析（支持 1/3/7/30 天时间范围）
- 地理位置统计（显示前 15 个国家/地区）
- 缓存分析（请求和带宽缓存统计）
- Token 验证和权限检查
- 定时数据更新（每 2 小时自动更新）

### EdgeOne 专属功能

- 实时流量监控
- 多维度 Top N 分析（支持国家、省份、状态码、域名、URL 等维度）
- 回源分析（回源流量、带宽、请求数统计）
- Pages 统计（构建次数、云函数请求监控）
- 灵活时间段查询（支持近 1 小时到近 31 天）
- 多粒度查询（分钟/小时/天/自动）

### 界面功能

- **多语言支持**：支持中文和英文界面切换
- **主题切换**：支持明暗主题切换
- **响应式设计**：完美适配桌面端和移动端设备
- **数据导出**：支持数据导出功能（CSV、Excel 格式）
- **自定义仪表盘**：可根据需求自定义展示组件
- **告警通知**：支持自定义告警规则和通知设置

## 技术架构

### 后端技术栈

- **运行环境**：Node.js 18+
- **框架**：Express 4.x
- **HTTP 客户端**：axios
- **定时任务**：node-cron
- **配置管理**：js-yaml、dotenv
- **SDK 支持**：
  - tencentcloud-sdk-nodejs-teo（EdgeOne）
  - tencentcloud-sdk-nodejs-common（腾讯云公共组件）
- **缓存管理**：node-cache
- **日志系统**：自定义日志工具

### 前端技术栈

- **框架**：React 18
- **构建工具**：Vite 5.x
- **UI 样式**：Tailwind CSS 3.x
- **图表库**：ECharts 5.x
- **状态管理**：React Context API
- **国际化**：i18next + react-i18next
- **HTTP 客户端**：axios
- **路由管理**：react-router-dom
- **工具库**：clsx、tailwind-merge

### 部署架构

- **容器化**：Docker + Docker Compose
- **反向代理**：Nginx
- **进程管理**：PM2 / Systemd
- **操作系统**：支持 Linux、macOS、Windows

### 数据存储

- **配置文件**：YAML 格式
- **环境变量**：.env 文件
- **缓存数据**：内存缓存（NodeCache）
- **持久化数据**：JSON 文件（analytics.json）

## 环境要求

### 系统要求

| 项目 | 最低要求 | 推荐配置 |
|------|----------|----------|
| 操作系统 | Linux/macOS/Windows | Ubuntu 20.04+ / CentOS 8+ |
| Docker | 20.10+ | 24.0+ |
| Docker Compose | 2.0+ | 2.20+ |
| Node.js | 18.0+ | 18.20+ |
| 内存 | 2GB | 4GB |
| 磁盘空间 | 5GB | 10GB |
| CPU | 1 核心 | 2 核心+ |

### 网络要求

- 稳定的互联网连接
- 能够访问 Cloudflare API（api.cloudflare.com）
- 能够访问 EdgeOne API（edgeone.tencentcs.com）
- 开放以下端口：
  - 80（HTTP，默认）
  - 443（HTTPS，可选）
  - 3000（前端开发服务器）
  - 4000（后端 API 服务）

## 快速开始

### 方式一：使用 Docker Compose（推荐）

这是最简单、最快速的部署方式。

**步骤 1：克隆项目**

```bash
git clone https://github.com/yourusername/unified-monitor.git
cd unified-monitor
```

**步骤 2：配置环境变量**

```bash
cd docker
cp .env.example .env
```

**步骤 3：编辑配置文件**

根据您的实际情况修改 `.env` 文件：

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

# 站点配置
SITE_NAME=Unified Monitor Dashboard
SITE_ICON=https://your-domain.com/favicon.ico
```

**步骤 4：启动服务**

```bash
docker-compose up -d
```

**步骤 5：访问应用**

打开浏览器访问：
- http://localhost（生产环境）
- http://localhost:3000（前端）
- http://localhost:4000（后端 API）

### 方式二：本地开发环境

**步骤 1：安装 Node.js**

建议使用 nvm 管理 Node.js 版本：

```bash
# 安装 nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# 安装并使用 Node.js 18
nvm install 18
nvm use 18
```

**步骤 2：克隆项目**

```bash
git clone https://github.com/yourusername/unified-monitor.git
cd unified-monitor
```

**步骤 3：安装后端依赖**

```bash
cd backend
npm install
cp .env.example .env
```

**步骤 4：配置后端环境变量**

编辑 `backend/.env` 文件，填入您的 Cloudflare 和 EdgeOne 凭证。

**步骤 5：启动后端服务**

```bash
npm run dev
```

后端服务将在 http://localhost:4000 启动。

**步骤 6：安装前端依赖**

```bash
cd ../frontend
npm install
```

**步骤 7：启动前端服务**

```bash
npm run dev
```

前端应用将在 http://localhost:3000 启动。

## 详细配置

### Cloudflare 配置

#### 方式一：环境变量配置（推荐）

在 `.env` 文件中添加以下配置：

```env
# 单账户配置
CF_TOKENS=your_cloudflare_token
CF_ZONES=zone_id_1,zone_id_2
CF_DOMAINS=example.com,cdn.example.com
CF_ACCOUNT_NAME=Main Account

# 多账户配置
CF_TOKENS_1=token1
CF_ZONES_1=zone1,zone2
CF_DOMAINS_1=site1.com,site2.com
CF_ACCOUNT_NAME_1=Account 1

CF_TOKENS_2=token2
CF_ZONES_2=zone3,zone4
CF_DOMAINS_2=site3.com,site4.com
CF_ACCOUNT_NAME_2=Account 2
```

#### 方式二：配置文件配置

编辑 `backend/src/config/cloudflare.yml` 文件：

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

#### Cloudflare API Token 权限要求

创建 API Token 时需要配置以下权限：

1. **Account | Analytics | Read** - 账户分析数据读取
2. **Zone | Analytics | Read** - 区域分析数据读取
3. **Zone | Zone | Read** - 区域信息读取

访问 [Cloudflare Dashboard](https://dash.cloudflare.com/profile/api-tokens) 创建 Token。

### EdgeOne 配置

#### 方式一：环境变量配置（推荐）

在 `.env` 文件中添加以下配置：

```env
# 单账户配置
EO_SECRET_ID=your_secret_id
EO_SECRET_KEY=your_secret_key
EO_REGION=ap-guangzhou
EO_ACCOUNT_NAME=Main Account

# 多账户配置
EO_SECRET_ID_1=secret_id_1
EO_SECRET_KEY_1=secret_key_1
EO_REGION_1=ap-guangzhou
EO_ACCOUNT_NAME_1=Account 1

EO_SECRET_ID_2=secret_id_2
EO_SECRET_KEY_2=secret_key_2
EO_REGION_2=ap-hongkong
EO_ACCOUNT_NAME_2=Account 2
```

#### 方式二：配置文件配置

编辑 `backend/src/config/edgeone.yml` 文件：

```yaml
accounts:
  - name: "主账号"
    secretId: "YOUR_SECRET_ID"
    secretKey: "YOUR_SECRET_KEY"
    region: "ap-guangzhou"
  - name: "副账号"
    secretId: "YOUR_SECRET_ID_2"
    secretKey: "YOUR_SECRET_KEY_2"
    region: "ap-hongkong"
```

#### EdgeOne 密钥权限要求

密钥需要拥有 **EdgeOne 只读访问权限** (`QcloudTEOReadOnlyaccess`)。

在以下地址创建密钥（只需要编程访问）：
- [国内版](https://console.cloud.tencent.com/cam/user/userType)
- [海外版](https://console.tencentcloud.com/cam/user/userType)

### 服务器配置

| 环境变量 | 默认值 | 说明 |
|----------|--------|------|
| PORT | 4000 | 后端服务端口 |
| NODE_ENV | development | 运行环境（development/production） |
| EN | false | 是否使用英文界面（true/false） |

### 缓存配置

| 环境变量 | 默认值 | 说明 |
|----------|--------|------|
| CF_UPDATE_INTERVAL | 7200000 | Cloudflare 数据更新间隔（毫秒），默认 2 小时 |
| EO_CACHE_TTL | 300000 | EdgeOne 数据缓存时间（毫秒），默认 5 分钟 |

### 站点配置

| 环境变量 | 默认值 | 说明 |
|----------|--------|------|
| SITE_NAME | Unified Monitor Dashboard | 站点名称 |
| SITE_ICON | 默认图标 | 站点图标 URL |

## 使用指南

### 界面操作

#### 平台切换

1. 在页面顶部找到平台切换组件
2. 选择您要查看的平台（Cloudflare 或 EdgeOne）
3. 界面将自动加载对应平台的数据

#### 时间范围选择

1. 在时间选择器中选择时间范围
2. Cloudflare 支持：1 天、3 天、7 天、30 天
3. EdgeOne 支持：近 1 小时、近 6 小时、近 12 小时、近 1 天、近 3 天、近 7 天、近 31 天

#### 账户和 Zone 选择

1. 在下拉菜单中选择账户
2. 选择要查看的 Zone
3. 数据将根据选择自动更新

### 数据查看

#### 仪表盘概览

- **流量统计**：查看总请求数、带宽使用量
- **威胁统计**：查看安全威胁拦截数量
- **缓存统计**：查看缓存命中率和缓存流量占比
- **趋势图表**：查看各项指标的时间趋势

#### 地理分布

- **国家/地区排行**：查看访问来源国家/地区分布
- **省份分布**：查看国内访问省份分布（仅 EdgeOne）
- **地图可视化**：直观的地理分布热力图

#### Top N 分析

- **状态码分布**：查看 HTTP 状态码占比
- **域名排行**：查看各域名流量分布
- **URL 排行**：查看访问量最高的 URL
- **资源类型**：查看各类资源的访问分布
- **Referer 来源**：查看流量来源分析

#### 回源分析

- **回源流量**：查看回源请求数和流量
- **回源带宽**：查看回源带宽使用情况
- **回源请求数**：统计回源请求总量

#### Pages 统计

- **构建次数**：查看 Pages 构建成功/失败次数
- **云函数请求**：查看云函数调用统计
- **CPU 时间**：查看云函数 CPU 消耗时间

### 主题切换

1. 点击页面右上角的主题切换按钮
2. 在亮色主题和暗色主题之间切换
3. 偏好设置将保存在本地

### 语言切换

1. 点击页面右上角的语言切换按钮
2. 在中文和英文界面之间切换
3. 语言偏好将保存在本地

## API 接口

### 基础信息

- **Base URL**：http://localhost:4000/api
- **Content-Type**：application/json
- **字符编码**：UTF-8

### 通用接口

#### 健康检查

```http
GET /health
```

**响应示例**：

```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

#### 状态查询

```http
GET /api/status
```

**响应示例**：

```json
{
  "status": "running",
  "platforms": ["cloudflare", "edgeone"],
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Cloudflare 接口

#### 获取配置

```http
GET /api/cloudflare/config
```

#### 获取 Zone 列表

```http
GET /api/cloudflare/zones
```

#### 获取分析数据

```http
GET /api/cloudflare/analytics
```

#### 获取指标数据

```http
GET /api/cloudflare/metrics?zoneId={zoneId}&startTime={startTime}&endTime={endTime}&interval={interval}
```

#### 获取地理位置数据

```http
GET /api/cloudflare/geography?zoneId={zoneId}&startTime={startTime}&endTime={endTime}
```

### EdgeOne 接口

#### 获取配置

```http
GET /api/edgeone/config
```

#### 获取 Zone 列表

```http
GET /api/edgeone/zones
```

#### 获取指标数据

```http
GET /api/edgeone/metrics?zoneId={zoneId}&startTime={startTime}&endTime={endTime}&interval={interval}
```

#### 获取地理位置数据

```http
GET /api/edgeone/geography?zoneId={zoneId}&startTime={startTime}&endTime={endTime}
```

#### 获取回源数据

```http
GET /api/edgeone/origin-pull?zoneId={zoneId}&startTime={startTime}&endTime={endTime}&interval={interval}
```

#### 获取 Top 分析数据

```http
GET /api/edgeone/top-analysis?zoneId={zoneId}&metric={metric}&startTime={startTime}&endTime={endTime}
```

#### 获取 Pages 构建次数

```http
GET /api/edgeone/pages/build-count?zoneId={zoneId}
```

#### 获取 Pages 云函数请求

```http
GET /api/edgeone/pages/cloud-function-requests?zoneId={zoneId}&startTime={startTime}&endTime={endTime}
```

### 响应格式

#### 成功响应

```json
{
  "data": {},
  "message": "success"
}
```

#### 错误响应

```json
{
  "error": "错误描述",
  "code": "ERROR_CODE"
}
```

### 错误码

| 错误码 | 说明 |
|--------|------|
| 400 | 请求参数错误 |
| 401 | 未授权 |
| 403 | 禁止访问 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

### 数据缓存说明

- **Cloudflare 数据**：每 2 小时更新一次
- **EdgeOne 数据**：实时查询，带 5 分钟缓存
- 建议合理使用缓存，避免频繁请求

### 示例代码

#### JavaScript (Axios)

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:4000/api',
  timeout: 30000
});

// 获取 Cloudflare 配置
const getCloudflareConfig = async () => {
  const response = await api.get('/cloudflare/config');
  return response.data;
};

// 获取 EdgeOne 指标数据
const getEdgeOneMetrics = async (zoneId, startTime, endTime) => {
  const response = await api.get('/edgeone/metrics', {
    params: { zoneId, startTime, endTime }
  });
  return response.data;
};
```

#### Python (Requests)

```python
import requests

base_url = 'http://localhost:4000/api'

# 获取 Cloudflare 配置
def get_cloudflare_config():
    response = requests.get(f'{base_url}/cloudflare/config')
    return response.json()

# 获取 EdgeOne 指标数据
def get_edgeone_metrics(zone_id, start_time, end_time):
    params = {
        'zoneId': zone_id,
        'startTime': start_time,
        'endTime': end_time
    }
    response = requests.get(f'{base_url}/edgeone/metrics', params=params)
    return response.json()
```

#### cURL

```bash
# 获取 Cloudflare 配置
curl -X GET http://localhost:4000/api/cloudflare/config

# 获取 EdgeOne 指标数据
curl -X GET "http://localhost:4000/api/edgeone/metrics?zoneId=zone_id_1&startTime=2024-01-01T00:00:00Z&endTime=2024-01-02T00:00:00Z"
```

## 部署说明

### Docker 部署

#### 1. 准备配置文件

```bash
cd docker
cp .env.example .env
nano .env  # 编辑配置文件
```

#### 2. 启动服务

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

#### 3. 服务说明

| 服务 | 端口 | 说明 |
|------|------|------|
| backend | 4000 | 后端 API 服务 |
| frontend | 3000 | 前端应用 |
| nginx | 80 | 反向代理 |

### 生产环境部署

#### 使用 Nginx 反向代理

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

#### 使用 PM2 管理进程

```bash
# 安装 PM2
npm install -g pm2

# 创建配置文件 ecosystem.config.js
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

# 启动应用
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 更新升级

```bash
# 拉取最新代码
git pull origin main

# 重新构建镜像
docker-compose build

# 重启服务
docker-compose up -d
```

## 常见问题

### 1. 容器无法启动

**问题**：Docker 容器启动失败

**解决方案**：

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

### 2. 无法连接到 Cloudflare API

**问题**：Cloudflare API 连接失败

**解决方案**：

1. 检查 API Token 是否正确
2. 确认 Token 权限是否包含：
   - Account | Analytics | Read
   - Zone | Analytics | Read
   - Zone | Zone | Read
3. 检查网络连接是否正常

### 3. 无法连接到 EdgeOne API

**问题**：EdgeOne API 连接失败

**解决方案**：

1. 检查 SecretId 和 SecretKey 是否正确
2. 确认密钥权限是否包含 EdgeOne 只读访问权限
3. 检查区域配置是否正确（ap-guangzhou、ap-hongkong 等）

### 4. 前端无法加载数据

**问题**：前端显示"加载数据失败"

**解决方案**：

1. 检查后端服务是否正常运行
2. 检查 API 端点是否可访问
3. 检查浏览器控制台是否有错误信息
4. 检查 CORS 配置是否正确

### 5. 数据更新不及时

**问题**：Cloudflare 数据没有更新

**解决方案**：

1. 检查定时任务是否正常运行
2. 检查数据文件权限是否正确
3. 手动触发数据更新
4. 检查缓存配置是否正确

### 6. 如何配置多个账户

**问题**：需要监控多个 Cloudflare 或 EdgeOne 账户

**解决方案**：

在环境变量中使用带数字后缀的配置：

```env
# Cloudflare 多账户
CF_TOKENS_1=token1
CF_ZONES_1=zone1,zone2
CF_DOMAINS_1=site1.com,site2.com
CF_ACCOUNT_NAME_1=Account 1

CF_TOKENS_2=token2
CF_ZONES_2=zone3,zone4
CF_DOMAINS_2=site3.com,site4.com
CF_ACCOUNT_NAME_2=Account 2

# EdgeOne 多账户
EO_SECRET_ID_1=secret_id_1
EO_SECRET_KEY_1=secret_key_1
EO_ACCOUNT_NAME_1=Account 1

EO_SECRET_ID_2=secret_id_2
EO_SECRET_KEY_2=secret_key_2
EO_ACCOUNT_NAME_2=Account 2
```

### 7. 如何切换语言

**问题**：如何将界面切换为英文

**解决方案**：

设置环境变量：

```env
EN=true
```

或在运行时指定：

```bash
EN=true node src/index.js
```

### 8. 如何查看日志

**问题**：需要查看应用运行日志

**解决方案**：

```bash
# Docker 日志
docker-compose logs -f backend
docker-compose logs -f frontend

# 本地开发日志
tail -f backend/logs/app.log
```

## 更新日志

### v1.0.0 (2024-01-01)

- 初始版本发布
- 支持 Cloudflare 和 EdgeOne 两个平台
- 统一仪表盘和平台切换功能
- 多账户和多 Zone 支持
- 多语言和主题切换
- Docker 部署支持
- 完整的 API 文档

### 后续版本计划

- [ ] 支持更多 CDN 平台（阿里云 CDN、腾讯云 CDN 等）
- [ ] 数据导出功能（CSV、Excel）
- [ ] 自定义仪表盘组件
- [ ] 告警通知功能（邮件、短信、Webhook）
- [ ] 移动端应用
- [ ] 数据可视化增强
- [ ] 性能优化和功能增强

## 贡献指南

欢迎贡献代码！请遵循以下步骤：

1. **Fork 本仓库**

2. **创建特性分支**

```bash
git checkout -b feature/AmazingFeature
```

3. **提交更改**

```bash
git commit -m 'Add some AmazingFeature'
```

4. **推送到分支**

```bash
git push origin feature/AmazingFeature
```

5. **提交 Pull Request**

### 贡献规范

- 遵循项目代码规范
- 编写清晰的提交信息
- 添加必要的测试
- 更新相关文档

### 报告问题

如发现 Bug 或有功能建议，请：

1. 搜索现有 Issue 确认是否已有人报告
2. 创建新的 Issue，详细描述问题或建议
3. 等待维护者回复和处理

## 许可证

本项目采用 MIT 许可证，详见 [LICENSE](LICENSE) 文件。

## 联系方式

- **作者**：Unified Monitor Team
- **邮箱**：support@unified-monitor.example.com
- **项目地址**：https://github.com/yourusername/unified-monitor
- **文档地址**：https://github.com/yourusername/unified-monitor/tree/main/docs

## 致谢

本项目基于以下优秀开源项目：

- [Cloudflare Analytics Dashboard](https://github.com/Geekertao/cloudflare-analytics)
- [EdgeOne Monitoring Dashboard](https://github.com/afoim/eo_monitor)

感谢所有贡献者和用户！

## 支持

如有问题或建议，请：

- 提交 [GitHub Issue](https://github.com/yourusername/unified-monitor/issues)
- 发送邮件至 support@unified-monitor.example.com
- 查看 [详细文档](docs/)
