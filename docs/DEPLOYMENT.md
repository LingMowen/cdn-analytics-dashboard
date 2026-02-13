# 部署文档

<img src="images/icon-deployment.svg" alt="Deployment" width="48" height="48" align="right"/>

Unified Monitor 的详细部署指南。

## 快速链接

- [前端部署](DEPLOYMENT_FRONTEND.md) - GitHub Pages / Cloudflare Pages / EdgeOne Pages / Vercel / Netlify
- [后端部署](DEPLOYMENT_BACKEND.md) - Node.js / Docker / PM2 / Cloudflare Workers / 腾讯云云函数
- [配置指南](CONFIG.md) - 环境变量和配置文件详解

## 选择部署方式

### 前端部署方式

| 方式 | 难度 | 适合场景 |
|------|------|----------|
| [GitHub Pages](DEPLOYMENT_FRONTEND.md#github-pages-部署) | ⭐ | 免费，简单 |
| [Cloudflare Pages](DEPLOYMENT_FRONTEND.md#cloudflare-pages-部署) | ⭐⭐ | 全球CDN加速 |
| [EdgeOne Pages](DEPLOYMENT_FRONTEND.md#edgeone-pages-部署) | ⭐⭐ | 国内访问快 |
| [Vercel](DEPLOYMENT_FRONTEND.md#vercel-部署) | ⭐ | 快速部署 |
| [Netlify](DEPLOYMENT_FRONTEND.md#netlify-部署) | ⭐ | 简单易用 |

### 后端部署方式

| 方式 | 难度 | 适合场景 |
|------|------|----------|
| [Node.js](DEPLOYMENT_BACKEND.md#nodejs-部署) | ⭐⭐ | 简单部署 |
| [Docker](DEPLOYMENT_BACKEND.md#docker-部署) | ⭐⭐ | 容器化部署 |
| [PM2](DEPLOYMENT_BACKEND.md#pm2-部署) | ⭐⭐ | 生产环境 |
| [Cloudflare Workers](DEPLOYMENT_BACKEND.md#cloudflare-workers-部署) | ⭐⭐⭐ | Serverless |
| [腾讯云云函数](DEPLOYMENT_BACKEND.md#腾讯云云函数部署) | ⭐⭐⭐ | 国内Serverless |
| [GitHub Actions CI/CD](DEPLOYMENT_BACKEND.md#github-actions-cicd) | ⭐⭐ | 自动化构建部署 |

**注意**: GitHub 本身不提供 Node.js 后端托管服务，可通过 GitHub Actions 自动化构建后部署到其他平台。

## 快速开始

### 方式一：Docker Compose（推荐）

最简单的一键部署方式。

```bash
git clone https://github.com/LingMowen/cdn-analytics-dashboard.git
cd cdn-analytics-dashboard
cd docker
cp .env.example .env
# 编辑 .env 配置您的 API 密钥
docker-compose up -d
```

访问 `http://localhost`

### 方式二：前后端分离

1. **部署后端**

   按照[后端部署指南](DEPLOYMENT_BACKEND.md)部署后端服务。

2. **部署前端**

   按照[前端部署指南](DEPLOYMENT_FRONTEND.md)部署前端静态文件。

3. **配置前端**

   确保前端环境变量指向您的后端地址：
   ```
   VITE_API_TARGET=https://your-backend-api.com
   ```

## 系统要求

### 最低要求

- **操作系统**: Linux / macOS / Windows
- **Docker**: 20.10+（Docker 部署）
- **Node.js**: 18+（Node.js 部署）
- **内存**: 2GB+
- **磁盘空间**: 5GB+

### 推荐配置

- **操作系统**: Ubuntu 20.04+ / CentOS 8+ / Debian 11+
- **内存**: 4GB+
- **磁盘空间**: 10GB+

## 配置

详细配置说明请参考[配置指南](CONFIG.md)。

## 故障排查

### 1. 前端无法连接后端

- 检查 `VITE_API_TARGET` 是否正确
- 检查后端服务是否正常运行
- 检查防火墙/安全组端口是否开放

### 2. 数据不显示

- 检查 API 密钥是否正确
- 检查日志中的错误信息
- 确认账户和 Zone ID 是否正确

### 3. 部署失败

- 检查 Node.js/Docker 版本
- 查看构建日志
- 确认网络连接正常

## 获取帮助

- 提交 [Issue](https://github.com/LingMowen/cdn-analytics-dashboard/issues)
- 查看 [API 文档](API.md)
