---
title: 服务端与客户端全栈部署
description: 涵盖 Cloudflare Workers 边缘无服务器架构与 Docker 独立容器化双模部署实践
---

EpoCanvas 提供了高度灵活的部署选择：既支持依托 **Cloudflare Workers 边缘 Serverless 架构**（Workers + D1 + KV + R2）实现零基础设施成本、全球多活与免运维托管，也支持通过 **Docker / Docker Compose** 在独立 VPS 或私有云基础设施上一键容器化拉起。

![EpoCanvas 全栈初始化与配置导引](/images/canvas/welcome-modal.png)

---

## 📋 部署前准备与环境要求

在开始部署前，请确保具备以下基础研发环境与凭证：

### 1. 基础环境
- **Node.js**：`v22.0.0` 或更高版本（推荐 Node.js 22+ LTS）。
- **pnpm**：`v9.0.0+` 或 `npm v10+`。
- **Git**：用于拉取源码与版本追踪。
- **Docker & Docker Compose**（若采用容器化私有部署）：Docker Engine 24+。

### 2. 云厂商凭证（针对 Cloudflare 模式）
- 已激活且绑定根域名（如 `epocanvas.com`）的 Cloudflare 账户。
- Cloudflare API Token（需具备 Workers、D1、KV、R2 的读写权限）。
- Cloudflare Account ID。

```bash
# 全局安装 pnpm 与 Wrangler 命令行工具
npm install -g pnpm wrangler

# 授权登录 Cloudflare 账户（浏览器将弹出授权确认窗口）
wrangler login
```

---

## 🚀 部署方案 A：Cloudflare 边缘 Serverless 架构（推荐）

该方案将后端 API、事件同步、规则过滤全面下沉至 Cloudflare 全球边缘节点，无需维护常驻虚拟机。

### 1. 获取源码仓库

```bash
git clone https://github.com/shijianus/epocanvas.git
cd epocanvas
pnpm install
```

### 2. 编排并创建 Cloudflare 边缘云资源

在终端执行 Wrangler CLI 指令，一键在 Cloudflare 全球边缘网络中创建所需资源池：

```bash
# 1. 创建 D1 边缘分布式数据库（用于持久化账户、会话元数据与事件 DAG）
wrangler d1 create epocanvas_db

# 2. 创建高频 KV 命名空间（用于存储在线状态游标、OAuth 临时票据与限流缓存）
wrangler kv namespace create epocanvas_kv

# 3. 创建 R2 存储桶（用于托管加密媒体附件与画板素材，享免出站流量费）
wrangler r2 bucket create epocanvas-media
```

记录命令行输出中返回的 `database_id` 与 `kv_id`。

### 3. 配置 `wrangler.toml`

在项目根目录下配置 `wrangler.toml`：

```toml
name = "epocanvas-core"
main = "src/index.ts"
compatibility_date = "2026-09-11"
compatibility_flags = ["nodejs_compat"]

# 绑定 D1 数据库
[[d1_databases]]
binding = "DB"
database_name = "epocanvas_db"
database_id = "<YOUR_D1_DATABASE_ID>"

# 绑定 KV 缓存
[[kv_namespaces]]
binding = "KV"
id = "<YOUR_KV_NAMESPACE_ID>"

# 绑定 R2 存储桶
[[r2_buckets]]
binding = "MEDIA_BUCKET"
bucket_name = "epocanvas-media"

# 环境变量配置
[vars]
ENVIRONMENT = "production"
FEDERATION_DOMAIN = "chat.example.com"
MAX_ATTACHMENT_SIZE_MB = "50"
OAUTH_ISSUER = "https://chat.example.com"
```

### 4. 写入安全机密密钥 (Secrets)

EpoCanvas 遵循零信任安全标准，所有敏感密钥均通过 Cloudflare Secret 加密保护，禁止明文提交代码仓库：

```bash
# 生成 32 字节高强度随机字符串
openssl rand -hex 32

# 依次写入核心机密
wrangler secret put JWT_SECRET
wrangler secret put TOTP_MASTER_KEY
wrangler secret put FEDERATION_SIGNING_KEY
wrangler secret put TURNSTILE_SECRET_KEY
```

### 5. 初始化数据库表结构 (D1 Migrations)

执行初始迁移脚本，在 D1 中建立用户表、设备密钥表、房间状态表与事件 DAG 索引：

```bash
wrangler d1 execute epocanvas_db --remote --file=./migrations/0001_initial_schema.sql
```

### 6. 发布上线后端 Worker 与前端 Pages

```bash
# 1. 编译并部署核心 Worker 引擎
pnpm run build
wrangler deploy

# 2. 部署 PrivChat 客户端控制台至 Cloudflare Pages
pnpm --filter privchat run build
wrangler pages deploy privchat/dist --project-name epocanvas-client --branch main
```

部署成功后，终端将输出专属访问域名（如 `https://epocanvas-core.<subdomain>.workers.dev`）。

---

## 🐳 部署方案 B：Docker / Docker Compose 自托管模式

若你拥有独立 Linux 服务器（Ubuntu 22.04 / Debian 12 / AlmaLinux 9），可采用标准容器化方式独立运行。

### 1. 编写 `docker-compose.yml`

在服务器上创建部署目录并编写编排文件：

```yaml
version: "3.9"

services:
  epocanvas-node:
    image: ghcr.io/epocanvas-org/eccp-node:latest
    container_name: epocanvas-node
    restart: unless-stopped
    ports:
      - "8000:8000"   # 内部客户端 HTTP/WSS API
      - "8448:8448"   # P2P 联邦双向互联端口
    environment:
      - ECCP_SERVER_NAME=chat.example.com
      - ECCP_LOG_LEVEL=info
      - DATABASE_URL=sqlite:///data/epocanvas.db
      - JWT_SECRET=your-super-secure-jwt-secret-key-32b
      - TOTP_MASTER_KEY=your-super-secure-totp-master-key-32b
      - STORAGE_DRIVER=local
      - STORAGE_PATH=/data/media
    volumes:
      - ./data:/data
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/_eccp/client/v1/health"]
      interval: 30s
      timeout: 5s
      retries: 3

  nginx:
    image: nginx:alpine
    container_name: epocanvas-nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./certs:/etc/nginx/certs:ro
    depends_on:
      - epocanvas-node
```

### 2. 一键拉起服务

```bash
# 启动容器集群并后台运行
docker compose up -d

# 查看运行状态与输出日志
docker compose ps
docker compose logs -f epocanvas-node
```

---

## 🛠️ 系统初次初始化向导

完成服务部署后，需执行一次性安全初始化以创建首位超级管理员：

### 1. 触发系统安全初始化

在终端发起初始化请求，或在浏览器中访问初始引导向导：

```bash
curl -X POST https://chat.example.com/_eccp/client/v1/init-admin \
  -H "Content-Type: application/json" \
  -H "X-Init-Secret: <YOUR_JWT_SECRET>" \
  -d '{
    "username": "root_admin",
    "email": "admin@example.com",
    "password": "YourStrongPassword#2026",
    "display_name": "系统超级管理员"
  }'
```

接口将返回系统管理员凭据及生成的 TOTP 绑定密钥二维码。

### 2. 绑定管理员 TOTP 动态令牌

1. 使用手机安装的 **Google Authenticator** 或 **1Password** 扫描返回的二维码或填入密钥字符串。
2. 输入当前动态 6 位校验码，完成双重身份鉴权激活。
3. 一旦初始化完成，`init-admin` 接口将被永久锁死，防止二次重入攻击。

---

## 🩺 服务健康度检验与验证清单

部署完成后，通过以下步骤确认所有子系统均健康运转：

| 校验环节 | 验证指令 / 测试端点 | 预期结果 |
| :--- | :--- | :--- |
| **API 服务探针** | `GET https://chat.example.com/_eccp/client/v1/health` | HTTP 200 `{"status":"healthy","version":"7.4.0"}` |
| **联邦端点暴露** | `GET https://chat.example.com:8448/_eccp/federation/v1/version` | 返回当前节点版本与 Ed25519 公钥指纹 |
| **Well-Known 解析** | `GET https://chat.example.com/.well-known/eccp/server` | 返回 `{"m.server": "chat.example.com:8448"}` |
| **对象存储直传** | 在工作台上传一张 5MB 图片附件 | 上传成功并在 R2 / 本地目录生成分片哈希 |
| **WebRTC 通话握手** | 发起一次双人音视频通话通道 | 成功建立 STUN/TURN P2P 连接 |

至此，你的 EpoCanvas 全栈协作与通信系统已在生产环境完整就绪！接下来请参考 [域名解析与网络配置](/canvas/dns-setup/) 完成规范化联邦域绑定。
