---
title: 域名解析与联邦网络配置
description: 深入规范配置 ECCP 联邦服务发现、SRV 记录、Well-Known 机制与 TLS 8448 安全互联
---

EpoCanvas 基于去中心化联邦架构构建。每个自治节点既服务于本地客户端用户，也作为联邦网络的一个对等中继（Peer）。为了使全球其他自建节点能够正确发现你的节点并建立安全的互联通道，必须在域名 DNS 控制台中完成标准化的**联邦服务发现 (Federation Discovery)**、**端口规划**与 **TLS 证书配置**。

![EpoCanvas 域名服务与节点网络拓扑](/images/canvas/architecture.svg)

---

## 🌐 1. 节点域名与命名空间规划

在 ECCP 协议中，用户身份采用 `@username:domain.com` 的命名空间格式。为了保持整洁的标识符，推荐遵循以下两种拓扑设计：

### 模式 A：根域委托模式（推荐）
- 用户标识符：`@alice:example.com`
- 实际节点服务地址：`chat.example.com`
- 实现方式：通过在根域 `example.com` 下配置 `/.well-known/eccp/server` 重定向或 DNS SRV 记录，将协议流量隐式引导至 `chat.example.com`。

### 模式 B：子域直连模式
- 用户标识符：`@alice:chat.example.com`
- 实际节点服务地址：`chat.example.com`
- 适用场景：根域名已有其他生产业务占用，希望完全隔离。

---

## 🧭 2. Well-Known 规范化服务发现

ECCP 客户端与联邦服务器在发起通信时，首先通过标准 HTTP GET 请求探测服务发现端点。

### 2.1 联邦节点发现 (`/.well-known/eccp/server`)

远端节点欲向本域投递事件时，将请求本端点确定实际通信主机与端口：

```http
GET https://example.com/.well-known/eccp/server HTTP/1.1
Host: example.com
```

响应头与 JSON 主体必须满足：

```http
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8
Access-Control-Allow-Origin: *

{
  "m.server": "chat.example.com:8448"
}
```

### 2.2 客户端接入发现 (`/.well-known/eccp/client`)

PrivChat 客户端登录时，仅需输入 `example.com`，客户端将自动解析该端点以获取真实 API 根路径与身份验证中枢地址：

```json
{
  "m.homeserver": {
    "base_url": "https://chat.example.com"
  },
  "m.identity_server": {
    "base_url": "https://chat.example.com"
  },
  "org.epocanvas.drawing": {
    "base_url": "https://drawing.epocanvas.com"
  }
}
```

> [!TIP]
> 如果你的主站托管在 Cloudflare Pages / Workers，可以通过添加 `public/.well-known/eccp/server` 静态文件或在 Edge Worker 中添加对应的路由拦截直接下发该 JSON。

---

## 🚦 3. DNS 记录配置矩阵

在域名 DNS 控制台（Cloudflare DNS、Aliyun DNS、DNSPod 或 Route53）中添加以下记录：

| 记录类型 | 主机记录 (Name) | 记录值 (Value / Target) | 端口 / 优先级 | 代理状态 (Proxy) | 说明 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **A / CNAME** | `chat` | `<服务器公网 IP>` 或 `<worker-cname>` | - | **开启 (Proxied)** | Web 端点与 HTTPS 客户端 API 接入 |
| **A** | `fed` | `<服务器直连公网 IP>` | - | **仅 DNS (DNS Only)** | 联邦专用节点，直通 8448 端口 |
| **SRV** | `_eccp-server._tcp` | `fed.example.com.` | 优先级 10，权重 5，端口 8448 | - | 备用联邦 SRV 服务解析 |

### SRV 记录完整语法参考：
```text
_eccp-server._tcp.example.com. 3600 IN SRV 10 5 8448 fed.example.com.
```

---

## 🔒 4. 端口规划与防火墙策略

EpoCanvas 遵循最小权限网络暴露原则，各端口职责分工如下：

```
                    Internet
                       │
       ┌───────────────┴───────────────┐
       ▼                               ▼
[Port 443 / HTTPS]             [Port 8448 / mTLS]
客户端 Web / WSS / API          联邦节点点对点互联
Cloudflare CDN 边缘代理         双向证书握手直连
       │                               │
       └───────────────┬───────────────┘
                       ▼
               EpoCanvas Core Node
                       │
       ┌───────────────┴───────────────┐
       ▼                               ▼
[Port 3478 / UDP]              [50000-50100 / UDP]
WebRTC STUN/TURN 信令           音视频通话多媒体中继
```

### 防火墙规则（以 UFW 为例）：

```bash
# 允许客户端 Web 与 API 接入
sudo ufw allow 443/tcp comment 'HTTPS Client & Web'

# 允许联邦节点间通信
sudo ufw allow 8448/tcp comment 'ECCP Federation Port'

# 允许 WebRTC 音视频穿透与多媒体中继
sudo ufw allow 3478/udp comment 'STUN/TURN NAT Traversal'
sudo ufw allow 50000:50100/udp comment 'WebRTC Media Relay Range'

sudo ufw reload
```

---

## 🛡️ 5. TLS / SSL 双向加密与证书管理

### 1. 客户端端口 (443)
由 Cloudflare Universal SSL 或 Nginx ACME (Let's Encrypt / Certbot) 自动签发管理，确保所有前端交互采用 TLS 1.3 传输加密。

### 2. 联邦端口 (8448) 握手规范
ECCP 联邦采用**相互身份验证 (Mutual Authentication)**：
- 节点间不仅验证 TLS 证书链有效性，还需比对请求中携带的 `Authorization: ECCP-FED <KeyID> <Signature>` 头部。
- 签名基于节点的长期 Ed25519 密钥对，杜绝中继冒充。

```bash
# 使用 certbot 独立为联邦域名申请泛域名或独立证书
certbot certonly --standalone -d fed.example.com --preferred-challenges http
```

---

## 🔍 6. 联通性验证与诊断排查

完成 DNS 与网络配置后，执行以下命令验证网络全局可见性：

### 1. 验证 Well-Known 发现解析
```bash
curl -i https://example.com/.well-known/eccp/server
```
预期输出：`HTTP/1.1 200 OK`，返回正确的域名与 8448 端口。

### 2. 验证联邦端口 TLS 握手与证书有效性
```bash
openssl s_client -connect fed.example.com:8448 -servername fed.example.com
```
确认返回的证书主体（Subject Alternative Name）包含目标域名，握手协议版本为 `TLSv1.3`。

### 3. 使用 ECCP 官方联通性探针测试
```bash
curl -X POST https://chat.example.com/_eccp/federation/v1/diagnose \
  -H "Content-Type: application/json" \
  -d '{"peer_domain": "matrix.org"}'
```
若返回 `{"reachability": "SUCCESS", "latency_ms": 42}`，说明你的 EpoCanvas 节点已成功融入全球去中心化联邦生态！
