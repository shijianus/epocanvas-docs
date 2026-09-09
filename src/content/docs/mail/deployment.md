---
title: 界面与服务部署
description: EpoMail 后端 Worker 及前端 Dashboard 完整部署流程与步骤详解
---

本指南指导你在 Cloudflare 平台上部署 EpoMail 的后端计算节点（Workers）与前端管理界面（Pages）。

## 准备工作

在开始部署前，请确保你已备齐以下前置资源：

1. **Cloudflare 账号**：拥有已激活的 Cloudflare 账户，且至少绑定并托管了一个根域名（如 `example.com`）。
2. **Node.js 环境**：本地开发环境推荐使用 Node.js `v20.0+` 及 `pnpm` 包管理器。
3. **Wrangler CLI**：Cloudflare 官方命令行工具，用于资源编排与 Worker 发布。

```bash
# 全局或项目局部安装 Wrangler
pnpm add -D wrangler
# 登录 Cloudflare 授权
pnpm wrangler login
```

## 创建与绑定数据库资源

EpoMail 需要借助 Cloudflare D1 存储核心用户和邮件元数据，并使用 KV 缓存高频会话信息。

### 1. 创建 D1 数据库

运行以下命令在你的 Cloudflare 组织中初始化数据库实例：

```bash
pnpm wrangler d1 create epomail-db
```

命令输出将包含数据库名称和 `database_id`，将其记录下来，稍后填入配置文件中。

### 2. 执行数据库迁移脚本

```bash
pnpm wrangler d1 execute epomail-db --file=./migrations/0001_initial.sql
```

### 3. 创建 KV 缓存命名空间

```bash
pnpm wrangler kv namespace create EPOMAIL_KV
```

## 部署后端 Worker

进入项目的 `mail-worker` 目录，配置 `wrangler.toml` 中的资源绑定：

```toml
name = "epomail-worker"
main = "src/index.ts"
compatibility_date = "2024-09-23"

# 数据库绑定
[[d1_databases]]
binding = "DB"
database_name = "epomail-db"
database_id = "<YOUR_D1_DATABASE_ID>"

# KV 绑定
[[kv_namespaces]]
binding = "KV"
id = "<YOUR_KV_NAMESPACE_ID>"
```

随后执行上线发布指令：

```bash
pnpm wrangler deploy
```

部署成功后，系统将分配形如 `https://epomail-worker.<your-subdomain>.workers.dev` 的专属服务端点。

## 部署前端 WebUI 控制台

EpoMail 前端控制台基于 Vue 3 构建，可一键部署至 Cloudflare Pages 或任何静态托管网络。

![控制台域名接入示意](/images/mail/demo-domain.png)

1. 在项目根目录或前端子目录中安装构建依赖：
   ```bash
   pnpm install
   ```
2. 配置生产环境后端 API 地址（`.env.production`）：
   ```bash
   VITE_API_BASE_URL=https://epomail-worker.yourdomain.workers.dev
   ```
3. 构建静态产物：
   ```bash
   pnpm build
   ```
4. 将 `dist` 目录上传至 Cloudflare Pages，并绑定对应访问子域（例如 `mail.example.com`）。
