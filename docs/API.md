# API 文档

## 概述

Unified Monitor API 提供了 Cloudflare 和 EdgeOne 两个平台的监控数据接口。所有接口均使用 RESTful 风格，返回 JSON 格式数据。

## 基础信息

- **Base URL**: `http://localhost:4000/api`
- **Content-Type**: `application/json`
- **字符编码**: `UTF-8`

## 通用响应格式

### 成功响应

```json
{
  "data": {},
  "message": "success"
}
```

### 错误响应

```json
{
  "error": "错误描述",
  "code": "ERROR_CODE"
}
```

## 通用接口

### 健康检查

检查服务是否正常运行。

**请求**

```http
GET /health
```

**响应**

```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 状态查询

查询服务状态和可用平台。

**请求**

```http
GET /status
```

**响应**

```json
{
  "status": "running",
  "platforms": ["cloudflare", "edgeone"],
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Cloudflare 接口

### 获取配置

获取 Cloudflare 平台配置信息。

**请求**

```http
GET /cloudflare/config
```

**响应**

```json
{
  "platform": "cloudflare",
  "accounts": [
    {
      "name": "Main Account",
      "zonesCount": 2
    }
  ]
}
```

### 获取 Zone 列表

获取所有可用的 Zone 列表。

**请求**

```http
GET /cloudflare/zones
```

**响应**

```json
[
  {
    "account": "Main Account",
    "zones": [
      {
        "id": "zone_id_1",
        "name": "example.com"
      },
      {
        "id": "zone_id_2",
        "name": "cdn.example.com"
      }
    ]
  }
]
```

### 获取分析数据

获取 Cloudflare 分析数据（缓存数据）。

**请求**

```http
GET /cloudflare/analytics
```

**响应**

```json
{
  "accounts": [
    {
      "name": "Main Account",
      "zones": [
        {
          "domain": "example.com",
          "raw": [
            {
              "dimensions": {
                "date": "2024-01-01"
              },
              "sum": {
                "requests": 10000,
                "bytes": 1000000000,
                "threats": 100,
                "cachedRequests": 8000,
                "cachedBytes": 800000000
              }
            }
          ],
          "rawHours": [
            {
              "dimensions": {
                "datetime": "2024-01-01T00:00:00Z"
              },
              "sum": {
                "requests": 500,
                "bytes": 50000000,
                "threats": 5,
                "cachedRequests": 400,
                "cachedBytes": 40000000
              }
            }
          ],
          "geography": [
            {
              "dimensions": {
                "clientCountryName": "United States"
              },
              "sum": {
                "requests": 5000,
                "bytes": 500000000,
                "threats": 50
              }
            }
          ]
        }
      ]
    }
  ]
}
```

### 获取指标数据

获取指定 Zone 的指标数据。

**请求**

```http
GET /cloudflare/metrics?zoneId={zoneId}&startTime={startTime}&endTime={endTime}&interval={interval}
```

**参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| zoneId | string | 是 | Zone ID |
| startTime | string | 是 | 开始时间（ISO 8601） |
| endTime | string | 是 | 结束时间（ISO 8601） |
| interval | string | 否 | 时间间隔（hour/day），默认 day |

**示例**

```http
GET /cloudflare/metrics?zoneId=zone_id_1&startTime=2024-01-01T00:00:00Z&endTime=2024-01-02T00:00:00Z&interval=hour
```

**响应**

```json
[
  {
    "timestamp": "2024-01-01T00:00:00Z",
    "requests": 500,
    "bytes": 50000000,
    "threats": 5,
    "cachedRequests": 400,
    "cachedBytes": 40000000
  }
]
```

### 获取地理位置数据

获取指定 Zone 的地理位置数据。

**请求**

```http
GET /cloudflare/geography?zoneId={zoneId}&startTime={startTime}&endTime={endTime}
```

**参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| zoneId | string | 是 | Zone ID |
| startTime | string | 是 | 开始时间（ISO 8601） |
| endTime | string | 是 | 结束时间（ISO 8601） |

**示例**

```http
GET /cloudflare/geography?zoneId=zone_id_1&startTime=2024-01-01&endTime=2024-01-02
```

**响应**

```json
[
  {
    "country": "United States",
    "requests": 5000,
    "bytes": 500000000,
    "threats": 50
  }
]
```

## EdgeOne 接口

### 获取配置

获取 EdgeOne 平台配置信息。

**请求**

```http
GET /edgeone/config
```

**响应**

```json
{
  "platform": "edgeone",
  "siteName": "Unified Monitor Dashboard",
  "siteIcon": "https://q2.qlogo.cn/headimg_dl?dst_uin=2726730791&spec=0",
  "accounts": [
    {
      "name": "Main Account",
      "region": "ap-guangzhou"
    }
  ]
}
```

### 获取 Zone 列表

获取所有可用的 Zone 列表。

**请求**

```http
GET /edgeone/zones
```

**响应**

```json
[
  {
    "account": "Main Account",
    "zones": [
      {
        "id": "zone_id_1",
        "name": "example.com"
      },
      {
        "id": "zone_id_2",
        "name": "cdn.example.com"
      }
    ]
  }
]
```

### 获取指标数据

获取指定 Zone 的指标数据。

**请求**

```http
GET /edgeone/metrics?zoneId={zoneId}&startTime={startTime}&endTime={endTime}&interval={interval}
```

**参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| zoneId | string | 是 | Zone ID |
| startTime | string | 是 | 开始时间（ISO 8601） |
| endTime | string | 是 | 结束时间（ISO 8601） |
| interval | string | 否 | 时间间隔（minute/hour/day/auto），默认 auto |

**示例**

```http
GET /edgeone/metrics?zoneId=zone_id_1&startTime=2024-01-01T00:00:00Z&endTime=2024-01-02T00:00:00Z&interval=hour
```

**响应**

```json
[
  {
    "timestamp": "2024-01-01T00:00:00Z",
    "requests": 500,
    "bytes": 50000000,
    "bandwidth": 10000000
  }
]
```

### 获取地理位置数据

获取指定 Zone 的地理位置数据。

**请求**

```http
GET /edgeone/geography?zoneId={zoneId}&startTime={startTime}&endTime={endTime}
```

**参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| zoneId | string | 是 | Zone ID |
| startTime | string | 是 | 开始时间（ISO 8601） |
| endTime | string | 是 | 结束时间（ISO 8601） |

**示例**

```http
GET /edgeone/geography?zoneId=zone_id_1&startTime=2024-01-01T00:00:00Z&endTime=2024-01-02T00:00:00Z
```

**响应**

```json
[
  {
    "Country": "United States",
    "Value": 5000,
    "value": 5000
  }
]
```

### 获取回源数据

获取指定 Zone 的回源数据。

**请求**

```http
GET /edgeone/origin-pull?zoneId={zoneId}&startTime={startTime}&endTime={endTime}&interval={interval}
```

**参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| zoneId | string | 是 | Zone ID |
| startTime | string | 是 | 开始时间（ISO 8601） |
| endTime | string | 是 | 结束时间（ISO 8601） |
| interval | string | 否 | 时间间隔（minute/hour/day/auto），默认 auto |

**示例**

```http
GET /edgeone/origin-pull?zoneId=zone_id_1&startTime=2024-01-01T00:00:00Z&endTime=2024-01-02T00:00:00Z&interval=hour
```

**响应**

```json
[
  {
    "timestamp": "2024-01-01T00:00:00Z",
    "requests": 100,
    "bytes": 10000000,
    "bandwidth": 2000000
  }
]
```

### 获取 Top 分析数据

获取指定 Zone 的 Top N 分析数据。

**请求**

```http
GET /edgeone/top-analysis?zoneId={zoneId}&metric={metric}&startTime={startTime}&endTime={endTime}
```

**参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| zoneId | string | 是 | Zone ID |
| metric | string | 是 | 指标名称（见下方指标列表） |
| startTime | string | 是 | 开始时间（ISO 8601） |
| endTime | string | 是 | 结束时间（ISO 8601） |

**支持的指标**

| 指标 | 说明 |
|------|------|
| l7Flow_outFlux_country | 响应流量国家排行 |
| l7Flow_outFlux_province | 响应流量省份排行 |
| l7Flow_outFlux_statusCode | 响应流量状态码排行 |
| l7Flow_outFlux_domain | 响应流量域名排行 |
| l7Flow_outFlux_url | 响应流量 URL 排行 |
| l7Flow_outFlux_resourceType | 响应流量资源类型排行 |
| l7Flow_outFlux_sip | 响应流量源 IP 排行 |
| l7Flow_outFlux_referers | 响应流量 Referer 排行 |
| l7Flow_outFlux_ua_device | 响应流量设备类型排行 |
| l7Flow_outFlux_ua_browser | 响应流量浏览器排行 |
| l7Flow_outFlux_ua_os | 响应流量操作系统排行 |
| l7Flow_outFlux_ua | 响应流量 User Agent 排行 |
| l7Flow_request_country | 请求流量国家排行 |
| l7Flow_request_province | 请求流量省份排行 |
| l7Flow_request_statusCode | 请求流量状态码排行 |
| l7Flow_request_domain | 请求流量域名排行 |
| l7Flow_request_url | 请求流量 URL 排行 |
| l7Flow_request_resourceType | 请求流量资源类型排行 |
| l7Flow_request_sip | 请求流量源 IP 排行 |
| l7Flow_request_referers | 请求流量 Referer 排行 |
| l7Flow_request_ua_device | 请求流量设备类型排行 |
| l7Flow_request_ua_browser | 请求流量浏览器排行 |
| l7Flow_request_ua_os | 请求流量操作系统排行 |
| l7Flow_request_ua | 请求流量 User Agent 排行 |
| ccAcl_interceptNum | CC ACL 拦截数 |
| ccManage_interceptNum | CC 管理拦截数 |
| ccRate_interceptNum | CC 限速拦截数 |
| function_requestCount | 云函数请求数 |
| function_cpuCostTime | 云函数 CPU 时间 |

**示例**

```http
GET /edgeone/top-analysis?zoneId=zone_id_1&metric=l7Flow_outFlux_country&startTime=2024-01-01T00:00:00Z&endTime=2024-01-02T00:00:00Z
```

**响应**

```json
[
  {
    "Country": "United States",
    "Value": 5000
  },
  {
    "Country": "China",
    "Value": 3000
  }
]
```

### 获取 Pages 构建次数

获取 EdgeOne Pages 构建次数统计。

**请求**

```http
GET /edgeone/pages/build-count?zoneId={zoneId}
```

**参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| zoneId | string | 否 | Zone ID（不提供则自动查找） |

**示例**

```http
GET /edgeone/pages/build-count?zoneId=zone_id_1
```

**响应**

```json
{
  "Result": "{\"totalBuilds\": 100,\"successBuilds\": 95,\"failedBuilds\": 5}",
  "parsedResult": {
    "totalBuilds": 100,
    "successBuilds": 95,
    "failedBuilds": 5
  }
}
```

### 获取 Pages 云函数请求

获取 EdgeOne Pages 云函数请求数据。

**请求**

```http
GET /edgeone/pages/cloud-function-requests?zoneId={zoneId}&startTime={startTime}&endTime={endTime}
```

**参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| zoneId | string | 否 | Zone ID（不提供则自动查找） |
| startTime | string | 否 | 开始时间（ISO 8601） |
| endTime | string | 否 | 结束时间（ISO 8601） |

**示例**

```http
GET /edgeone/pages/cloud-function-requests?zoneId=zone_id_1&startTime=2024-01-01T00:00:00Z&endTime=2024-01-02T00:00:00Z
```

**响应**

```json
{
  "Result": "[{\"timestamp\":\"2024-01-01T00:00:00Z\",\"requests\":100},{\"timestamp\":\"2024-01-01T01:00:00Z\",\"requests\":150}]",
  "parsedResult": [
    {
      "timestamp": "2024-01-01T00:00:00Z",
      "requests": 100
    },
    {
      "timestamp": "2024-01-01T01:00:00Z",
      "requests": 150
    }
  ]
}
```

## 错误码

| 错误码 | 说明 |
|--------|------|
| 400 | 请求参数错误 |
| 401 | 未授权 |
| 403 | 禁止访问 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

## 速率限制

- Cloudflare 接口：受 Cloudflare API 速率限制影响
- EdgeOne 接口：受腾讯云 API 速率限制影响
- 建议合理使用缓存，避免频繁请求

## 数据缓存

- Cloudflare 数据：每 2 小时更新一次
- EdgeOne 数据：实时查询，带 5 分钟缓存

## 示例代码

### JavaScript (Axios)

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

### Python (Requests)

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

### cURL

```bash
# 获取 Cloudflare 配置
curl -X GET http://localhost:4000/api/cloudflare/config

# 获取 EdgeOne 指标数据
curl -X GET "http://localhost:4000/api/edgeone/metrics?zoneId=zone_id_1&startTime=2024-01-01T00:00:00Z&endTime=2024-01-02T00:00:00Z"
```

## 更新日志

### v1.0.0 (2024-01-01)

- 初始版本发布
- 支持 Cloudflare 和 EdgeOne 两个平台
- 提供完整的监控数据接口
