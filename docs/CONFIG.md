# 配置文件指南

本文档详细介绍 Unified Monitor 的所有配置选项。

## 目录

- [环境变量配置](#环境变量配置)
- [配置文件](#配置文件)
- [Cloudflare 配置](#cloudflare-配置)
- [EdgeOne 配置](#edgeone-配置)
- [阿里云 ESA 配置](#阿里云-esa-配置)

## 环境变量配置

### 服务器配置

| 变量 | 默认值 | 说明 |
|------|--------|------|
| PORT | 4000 | 后端服务端口 |
| NODE_ENV | development | 运行环境（development/production） |
| EN | false | 是否使用英文界面 |

### Cloudflare 配置

| 变量 | 必填 | 说明 |
|------|------|------|
| CF_TOKENS | 是 | Cloudflare API Token（逗号分隔多个） |
| CF_ZONES | 是 | Zone ID（逗号分隔多个） |
| CF_DOMAINS | 否 | 域名（逗号分隔多个） |
| CF_ACCOUNT_NAME | 否 | 账户显示名称 |

**示例：**
```env
CF_TOKENS=token1,token2
CF_ZONES=zone1,zone2
CF_DOMAINS=example.com,cdn.example.com
CF_ACCOUNT_NAME=Main Account
```

### EdgeOne 配置

| 变量 | 必填 | 说明 |
|------|------|------|
| EO_SECRET_ID | 是 | 腾讯云 SecretId |
| EO_SECRET_KEY | 是 | 腾讯云 SecretKey |
| EO_REGION | 否 | 区域（默认 ap-guangzhou） |
| EO_ACCOUNT_NAME | 否 | 账户显示名称 |

**支持的区域：**
- `ap-guangzhou` - 广州
- `ap-shanghai` - 上海
- `ap-hongkong` - 香港
- `ap-singapore` - 新加坡
- `ap-tokyo` - 东京
- `ap-mumbai` - 孟买

### 阿里云 ESA 配置

| 变量 | 必填 | 说明 |
|------|------|------|
| ALIYUN_ESA_ACCESS_KEY_ID | 是 | 阿里云 AccessKeyId |
| ALIYUN_ESA_ACCESS_KEY_SECRET | 是 | 阿里云 AccessKeySecret |
| ALIYUN_ESA_REGION | 否 | 区域（默认 cn） |
| ALIYUN_ESA_ACCOUNT_NAME | 否 | 账户显示名称 |

**支持的区域：**
- `cn` - 国内版
- `international` - 国际版

### 缓存配置

| 变量 | 默认值 | 说明 |
|------|--------|------|
| CF_UPDATE_INTERVAL | 7200000 | Cloudflare 数据更新间隔（毫秒） |
| EO_CACHE_TTL | 300000 | EdgeOne 数据缓存时间（毫秒） |

### 站点配置

| 变量 | 说明 |
|------|------|
| SITE_NAME | 站点名称 |
| SITE_ICON | 站点图标 URL |

## 配置文件

除了环境变量，您也可以使用 YAML 配置文件。

### Cloudflare 配置文件

**文件位置：** `backend/src/config/cloudflare.yml`

```yaml
accounts:
  - name: "主账号"
    token: "YOUR_CF_TOKEN"
    zones:
      - zone_id: "ZONE_ID"
        domain: "example.com"
      - zone_id: "ZONE_ID_2"
        domain: "cdn.example.com"
```

### EdgeOne 配置文件

**文件位置：** `backend/src/config/edgeone.yml`

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

### 阿里云 ESA 配置文件

**文件位置：** `backend/src/config/aliyun.yml`

```yaml
accounts:
  - name: "主账号"
    accessKeyId: "YOUR_ACCESS_KEY_ID"
    accessKeySecret: "YOUR_ACCESS_KEY_SECRET"
    region: "cn"

enabledZones:
  - "example.com"
  - "cdn.example.com"

disabledZones:
  - "test.example.com"
```

## 配置优先级

1. **环境变量**（优先）
2. **配置文件**（备用）

系统会优先使用环境变量中的配置，如果环境变量未设置，则读取配置文件。

## 多账户配置

### Cloudflare 多账户

```env
CF_TOKENS=token1,token2
CF_ZONES=zone1_id,zone2_id
CF_DOMAINS=domain1.com,domain2.com
```

### EdgeOne 多账户

使用环境变量：
```env
EO_SECRET_ID=secret1
EO_SECRET_KEY=key1
EO_REGION=ap-guangzhou
EO_ACCOUNT_NAME=Account1

EO_SECRET_ID_1=secret2
EO_SECRET_KEY_2=key2
EO_REGION_1=ap-shanghai
EO_ACCOUNT_NAME_1=Account2
```

### 阿里云 ESA 多账户

```env
ALIYUN_ESA_ACCESS_KEY_ID=key1
ALIYUN_ESA_ACCESS_KEY_SECRET=secret1
ALIYUN_ESA_REGION=cn
ALIYUN_ESA_ACCOUNT_NAME=Account1

ALIYUN_ESA_ACCESS_KEY_ID_1=key2
ALIYUN_ESA_ACCESS_KEY_SECRET_1=secret2
ALIYUN_ESA_REGION_1=international
ALIYUN_ESA_ACCOUNT_NAME_1=Account2
```

## 站点过滤配置

### 启用白名单模式

在配置文件中添加 `enabledZones`：

```yaml
enabledZones:
  - "example.com"
  - "cdn.example.com"
```

只显示列表中的站点。

### 启用黑名单模式

在配置文件中添加 `disabledZones`：

```yaml
disabledZones:
  - "test.example.com"
  - "dev.example.com"
```

排除列表中的站点。

## 获取 API 密钥

### Cloudflare API Token

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 进入「个人资料」→ 「API Token」
3. 点击「创建自定义 Token」
4. 配置权限：
   - Account: Analytics: Read
   - Zone: Analytics: Read
   - Zone: Zone: Read
5. 创建并复制 Token

### 腾讯云 SecretId/SecretKey

1. 登录 [腾讯云控制台](https://console.cloud.tencent.com)
2. 进入「访问管理」→「用户」
3. 创建用户或使用已有用户
4. 获取 API 密钥（编程访问）
5. 确保密钥有 EdgeOne 只读权限

### 阿里云 AccessKey

1. 登录 [阿里云控制台](https://console.aliyun.com)
2. 进入「RAM 访问控制」
3. 创建用户或使用已有用户
4. 获取 AccessKey
5. 确保用户有 ESA 读取权限

## 验证配置

启动后端后，检查日志确认配置是否成功加载：

```
Cloudflare配置加载成功: 1 个账户
EdgeOne配置加载成功: 1 个账户
阿里云ESA配置加载成功: 1 个账户
```

如果配置有误，日志会显示「0 个账户」。
