# 前端部署指南

本文档详细介绍 Unified Monitor 前端的多种部署方式。

## 目录

- [GitHub Pages 部署](#github-pages-部署)
- [Cloudflare Pages 部署](#cloudflare-pages-部署)
- [EdgeOne Pages 部署](#edgeone-pages-部署)
- [Vercel 部署](#vercel-部署)
- [Netlify 部署](#netlify-部署)

## 准备工作

### 1. 克隆项目

```bash
git clone https://github.com/LingMowen/cdn-analytics-dashboard.git
cd cdn-analytics-dashboard
```

### 2. 配置后端 API 地址

编辑 `frontend/.env.production` 文件：

```env
VITE_API_TARGET=https://your-backend-domain.com
```

## GitHub Pages 部署

### 方式一：自动部署（推荐）

1. **启用 GitHub Pages**

   - 进入仓库设置 → Pages
   - 选择 "GitHub Actions" 作为部署源

2. **配置环境变量**

   在 GitHub 仓库设置中添加：
   - `VITE_API_TARGET`: 后端服务地址

3. **推送代码**

   推送后 GitHub Actions 会自动构建部署。

### 方式二：手动部署

1. **构建前端**

```bash
cd frontend
npm install
npm run build
```

2. **上传 dist 目录**

   将 `frontend/dist` 目录内容上传到 GitHub Pages。

## Cloudflare Pages 部署

### 1. 推送代码到 GitHub

```bash
git push origin main
```

### 2. 创建 Cloudflare Pages 项目

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 进入「Pages」→ 「创建项目」
3. 连接 GitHub 仓库
4. 选择 `frontend` 目录

### 3. 配置构建设置

- **构建命令**: `npm run build`
- **输出目录**: `dist`

### 4. 配置环境变量

在 Pages 设置中添加：
- `VITE_API_TARGET`: 后端服务地址

### 5. 配置 secrets

在 GitHub 仓库设置中添加：
- `CLOUDFLARE_API_TOKEN`: Cloudflare API Token
- `CLOUDFLARE_ACCOUNT_ID`: Cloudflare 账户 ID

### 6. 自动部署

推送代码后，GitHub Actions 会自动部署。

## EdgeOne Pages 部署

### 1. 登录 EdgeOne Pages 控制台

访问 [EdgeOne Pages](https://console.cloud.tencent.com/tencentcloud/pages)

### 2. 创建项目

1. 点击「创建项目」
2. 连接 GitHub/GitLab 仓库
3. 选择 `frontend` 目录

### 3. 配置构建

- **构建命令**: `npm run build`
- **输出目录**: `dist`

### 4. 配置环境变量

添加：
- `VITE_API_TARGET`: 后端服务地址

### 5. 部署

点击部署按钮完成部署。

## Vercel 部署

### 1. 安装 Vercel CLI

```bash
npm install -g vercel
```

### 2. 部署

```bash
cd frontend
vercel
```

### 3. 配置环境变量

在 Vercel 控制台中添加：
- `VITE_API_TARGET`: 后端服务地址

## Netlify 部署

### 1. 登录 Netlify

访问 [Netlify](https://netlify.com)

### 2. 连接 GitHub

1. 点击「New site from Git」
2. 选择 GitHub 仓库
3. 选择 `frontend` 目录

### 3. 配置构建

- **构建命令**: `npm run build`
- **发布目录**: `dist`

### 4. 配置环境变量

添加：
- `VITE_API_TARGET`: 后端服务地址

## 常见问题

### 1. 静态资源加载失败

确保 `VITE_API_TARGET` 已正确配置为后端服务地址。

### 2. CORS 错误

后端需要配置 CORS 允许前端域名访问。

### 3. 页面空白

检查浏览器控制台是否有 JavaScript 错误，确保构建过程无报错。
