# Cloudflare & EdgeOne 监控系统整合文档

<img src="icon-integration.svg" alt="Integration" width="48" height="48" align="right"/>

## 项目概述

本项目将 Cloudflare Monitor 和 EdgeOne Monitor 两个独立的监控项目进行了系统性融合，创建了一个统一的监控仪表盘，支持同时监控 Cloudflare 和 EdgeOne 两个平台的流量数据。

## 整合目标

1. **统一技术栈**: 将两个项目的技术栈进行统一，便于维护和扩展
2. **代码复用**: 提取公共组件和服务，减少代码重复
3. **功能整合**: 保留两个项目的核心功能，并新增统一视图
4. **平台切换**: 支持在不同平台之间快速切换
5. **部署简化**: 统一部署方案，降低部署复杂度

## 技术栈对比

### 原项目技术栈

| 组件 | Cloudflare Monitor | EdgeOne Monitor |
|------|-------------------|-----------------|
| 后端框架 | Node.js + Express 4.x | Node.js + Express 5.x |
| 前端框架 | React 18 | 原生 HTML |
| 图表库 | Recharts | ECharts |
| 样式库 | CSS-in-JS | Tailwind CSS |
| 部署方式 | Docker + Nginx | EdgeOne Pages |
| 数据存储 | JSON 文件 | 实时 API 调用 |

### 整合后技术栈

| 组件 | 技术选型 |
|------|---------|
| 后端框架 | Node.js + Express 4.x |
| 前端框架 | React 18 + Vite |
| 图表库 | ECharts 5.x |
| 样式库 | Tailwind CSS + Shadcn/UI |
| 状态管理 | React Context API |
| 国际化 | i18next |
| 部署方式 | Docker + Nginx |
| 数据存储 | JSON 文件 + 内存缓存 |

## 架构设计

### 后端架构

```
backend/
├── src/
│   ├── config/           # 配置管理
│   │   ├── index.js      # 统一配置加载器
│   │   ├── cloudflare.yml # Cloudflare 配置
│   │   └── edgeone.yml    # EdgeOne 配置
│   ├── services/         # 服务层（抽象接口）
│   │   ├── base.js       # 基础服务接口
│   │   ├── cloudflare.js # Cloudflare 服务实现
│   │   └── edgeone.js    # EdgeOne 服务实现
│   ├── routes/          # 路由层
│   │   ├── index.js      # 路由聚合
│   │   ├── cloudflare.js # Cloudflare 路由
│   │   └── edgeone.js    # EdgeOne 路由
│   ├── middleware/       # 中间件
│   │   └── cache.js     # 缓存中间件
│   ├── utils/           # 工具函数
│   │   └── logger.js    # 日志工具
│   └── index.js         # 入口文件
└── data/               # 数据存储
    ├── cache/           # 缓存数据
    └── analytics.json   # Cloudflare 缓存数据
```

### 前端架构

```
frontend/
├── src/
│   ├── components/      # 组件
│   │   ├── common/      # 通用组件
│   │   │   ├── Header.jsx
│   │   │   ├── PlatformSwitch.jsx
│   │   │   ├── LanguageSwitch.jsx
│   │   │   ├── ThemeSwitch.jsx
│   │   │   └── UnifiedDashboard.jsx
│   │   ├── cloudflare/  # Cloudflare 专用组件
│   │   │   └── Dashboard.jsx
│   │   └── edgeone/     # EdgeOne 专用组件
│   │       └── Dashboard.jsx
│   ├── contexts/       # 上下文
│   │   ├── LanguageContext.js
│   │   ├── ThemeContext.js
│   │   └── PlatformContext.js
│   ├── services/       # API 服务
│   │   ├── api.js       # API 封装
│   │   ├── cloudflare.js # Cloudflare API
│   │   └── edgeone.js   # EdgeOne API
│   ├── utils/          # 工具函数
│   ├── App.jsx         # 主应用组件
│   └── main.jsx        # 入口文件
└── public/             # 静态资源
```

## 核心功能整合

### 1. 配置管理

#### Cloudflare 配置

支持三种配置方式：

1. **环境变量配置**（推荐）
   ```env
   CF_TOKENS=token1,token2
   CF_ZONES=zone_id_1,zone_id_2
   CF_DOMAINS=domain1,domain2
   CF_ACCOUNT_NAME=Main Account
   ```

2. **多账户环境变量**
   ```env
   CF_TOKENS_1=token1
   CF_ZONES_1=zone1,zone2
   CF_DOMAINS_1=site1,site2
   CF_ACCOUNT_NAME_1=Account 1
   ```

3. **配置文件**
   ```yaml
   accounts:
     - name: "主账号"
       token: "YOUR_CF_TOKEN"
       zones:
         - zone_id: "ZONE_ID"
           domain: "example.com"
   ```

#### EdgeOne 配置

支持两种配置方式：

1. **环境变量配置**（推荐）
   ```env
   EO_SECRET_ID=your_secret_id
   EO_SECRET_KEY=your_secret_key
   EO_REGION=ap-guangzhou
   EO_ACCOUNT_NAME=Main Account
   ```

2. **配置文件**
   ```yaml
   accounts:
     - name: "主账号"
       secretId: "YOUR_SECRET_ID"
       secretKey: "YOUR_SECRET_KEY"
       region: "ap-guangzhou"
   ```

### 2. 服务层抽象

定义了统一的服务接口 `BaseService`，两个平台分别实现：

```javascript
export class BaseService {
  async validateCredentials(account) { }
  async fetchZones(account) { }
  async fetchMetrics(zoneId, startTime, endTime, interval) { }
  async fetchGeography(zoneId, startTime, endTime) { }
  async fetchCacheStats(zoneId, startTime, endTime) { }
  async fetchOriginPull(zoneId, startTime, endTime) { }
  async fetchTopAnalysis(zoneId, metric, startTime, endTime) { }
  formatData(rawData) { }
}
```

### 3. 路由分离

按平台分离路由，统一前缀：

- `/api/cloudflare/*` - Cloudflare 相关接口
- `/api/edgeone/*` - EdgeOne 相关接口
- `/api/health` - 健康检查
- `/api/status` - 状态查询

### 4. 平台切换

前端提供三种视图模式：

1. **统一视图 (Unified)**: 同时显示两个平台的数据
2. **Cloudflare 视图**: 专注于 Cloudflare 数据
3. **EdgeOne 视图**: 专注于 EdgeOne 数据

### 5. 数据缓存策略

- **Cloudflare 数据**: 定时缓存（每 2 小时更新一次）
- **EdgeOne 数据**: 实时查询 + 短期缓存（5 分钟 TTL）

## 功能对比

### Cloudflare 功能

| 功能 | 状态 | 说明 |
|------|------|------|
| 多账户/多 Zone 监控 | ✅ 保留 | 支持多个账户和 Zone |
| 历史数据分析 | ✅ 保留 | 支持 1/3/7/30 天数据 |
| 地理位置统计 | ✅ 保留 | 显示前 15 个国家/地区 |
| 缓存分析 | ✅ 保留 | 请求和带宽缓存统计 |
| Token 验证 | ✅ 保留 | 验证 API Token 权限 |
| 多语言支持 | ✅ 保留 | 中英文切换 |
| 主题切换 | ✅ 保留 | 明暗主题切换 |

### EdgeOne 功能

| 功能 | 状态 | 说明 |
|------|------|------|
| 实时流量监控 | ✅ 保留 | 流量、带宽、请求数 |
| 多维度 Top N 分析 | ✅ 保留 | 国家、省份、状态码等 |
| 回源分析 | ✅ 保留 | 回源流量、带宽、请求数 |
| Pages 统计 | ✅ 保留 | 构建次数、云函数请求 |
| 灵活时间段查询 | ✅ 保留 | 自定义时间范围 |
| 多粒度查询 | ✅ 保留 | 分钟/小时/天/自动 |

### 新增功能

| 功能 | 说明 |
|------|------|
| 统一仪表盘 | 同时查看 Cloudflare 和 EdgeOne 数据 |
| 平台切换 | 快速切换不同平台视图 |
| 数据对比 | 对比不同平台的数据指标 |
| 统一导出 | 支持导出各平台数据 |

## 技术冲突解决

### 1. 版本依赖冲突

- **Express 版本**: 统一使用 4.x（EdgeOne 使用 5.x，降级到 4.x）
- **React 版本**: 统一使用 18.3.1
- **图表库**: 统一使用 ECharts 5.x（迁移 Recharts 图表）

### 2. 命名空间冲突

- **路由前缀**: 使用 `/api/cloudflare/*` 和 `/api/edgeone/*`
- **组件命名**: 使用平台前缀（如 `CFDashboard`, `EODashboard`）
- **环境变量**: 使用平台前缀（如 `CF_TOKEN`, `EO_SECRET_ID`）

### 3. 数据格式冲突

- **时间格式**: 统一使用 ISO 8601 格式
- **流量单位**: 统一使用 Bytes，前端格式化显示
- **地区代码**: 统一使用 ISO 3166-1 alpha-2

## 部署方案

### Docker 部署

使用 Docker Compose 进行一键部署：

```bash
cd docker
cp .env.example .env
# 编辑 .env 文件，配置 Cloudflare 和 EdgeOne 凭证
docker-compose up -d
```

### 环境变量配置

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
SITE_ICON=https://q2.qlogo.cn/headimg_dl?dst_uin=2726730791&spec=0
```

## 测试方案

### 单元测试

- 后端服务层测试
- 前端组件测试
- 工具函数测试

### 集成测试

- API 接口测试
- 数据流测试
- 平台切换测试

### 系统测试

- 功能完整性测试
- 性能稳定性测试
- 数据一致性测试

## 迁移指南

### 从 Cloudflare Monitor 迁移

1. 备份原项目配置文件 `zones.yml`
2. 将配置复制到新项目的 `cloudflare.yml`
3. 配置环境变量（可选）
4. 启动新项目

### 从 EdgeOne Monitor 迁移

1. 备份原项目配置文件 `key.txt`
2. 将配置复制到新项目的 `edgeone.yml` 或环境变量
3. 配置环境变量（可选）
4. 启动新项目

## 维护指南

### 添加新平台

1. 在 `services/` 目录下创建新的服务类，继承 `BaseService`
2. 在 `routes/` 目录下创建新的路由文件
3. 在 `frontend/src/services/` 目录下创建新的 API 服务
4. 在 `frontend/src/components/` 目录下创建新的仪表盘组件
5. 在 `PlatformContext` 中添加新平台选项

### 添加新功能

1. 在对应的服务类中添加新方法
2. 在路由中添加新接口
3. 在前端 API 服务中添加新方法
4. 在组件中调用新方法并展示数据

## 常见问题

### Q: 如何同时使用两个平台？

A: 在前端选择"统一视图"模式，即可同时查看两个平台的数据。

### Q: 数据更新频率是多少？

A: Cloudflare 数据每 2 小时更新一次，EdgeOne 数据实时查询（带 5 分钟缓存）。

### Q: 如何自定义站点名称和图标？

A: 在环境变量中配置 `SITE_NAME` 和 `SITE_ICON`。

### Q: 支持多账户吗？

A: 支持，Cloudflare 和 EdgeOne 都支持多账户配置。

### Q: 如何导出数据？

A: 目前支持通过 API 导出 JSON 格式数据，后续将支持 CSV 和 Excel 格式。

## 总结

本项目成功将 Cloudflare Monitor 和 EdgeOne Monitor 两个独立项目进行了系统性融合，实现了：

1. ✅ 统一的技术栈和架构设计
2. ✅ 代码复用和模块化设计
3. ✅ 功能整合和平台切换
4. ✅ 简化的部署方案
5. ✅ 完善的文档和测试

通过这次融合，用户可以在一个统一的界面中同时监控 Cloudflare 和 EdgeOne 两个平台的流量数据，大大提高了监控效率和管理便利性。
