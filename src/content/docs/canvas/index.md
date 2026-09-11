---
title: EpoCanvas 项目概览与全栈架构设计
description: EpoCanvas (ECCP) 开放通信与数字协同生态系统：去中心化、端对端加密协议、边缘自治节点、PrivChat 客户端与协同中枢
---

**EpoCanvas** 是一套面向下一代去中心化数字协作与隐私安全通信打造的现代化全栈生态系统。系统基于 **ECCP (EpoCanvas Communication Protocol)** 开放通信标准构建，采用前后端彻底解耦的分层设计，依托 **Cloudflare 全球边缘计算网络**（Workers + D1 + KV + R2）与独立自托管节点，提供毫秒级冷启动、零出站流量费、端对端强加密（E2EE）与企业级自治合规的数字协作中枢。

![EpoCanvas 全景架构设计图](/images/canvas/architecture.svg)

---

## 💡 为什么选择 EpoCanvas？

在数字化办公与即时通信领域，企业与开发者长期面临隐私黑盒与高昂基建成本的双重制约：

1. **商业 SaaS 平台的隐私与垄断困局**：中心化平台（如 Slack、Discord、Teams）垄断用户数据，通信内容与元数据在服务端明文可查，且面临单点停机、数据封锁与高昂的按席位订阅费用（每用户每月 $8~$25+）。
2. **传统自建方案的运维灾难**：传统自建通信系统（如 Matrix Synapse 单体架构、XMPP 协议栈）依赖重度常驻 VPS，配置繁复、内存消耗高（单节点常驻内存常超 2GB~4GB），面对跨区网络抖动与数据库并发性能瓶颈捉襟见肘。

EpoCanvas 创新地采用**协议开放化**与**基建边缘 Serverless 化**的双重代际跃迁，将企业与团队协作系统的搭建门槛降至最低：

| 维度 | 传统商业 SaaS (Slack / Discord) | 传统自建单体服务 (Synapse / VPS) | EpoCanvas 边缘去中心化架构 |
| :--- | :--- | :--- | :--- |
| **基础设施成本** | 每席位 $8~$25+/月，无限期累加 | 需独占高配 VPS ($20~$100+/月) | **$0 启动**（CF 免费额度充分覆盖微型团队） |
| **数据主权与隐私** | 数据归云厂商所有，服务端完全可查 | 数据私有，但数据库明文存储易泄露 | **端对端加密 (E2EE Double Ratchet)**，服务端不可解密 |
| **部署与扩容难度** | 无法自建，强依赖厂商闭源生态 | 需调优 Postgres、Redis、Python 环境 | **一键 CLI 编排**（Wrangler / Docker 一键发布） |
| **存储扩展性** | 阶梯存储收费，超量费用昂贵 | 受限于单机磁盘，扩容需停机挂载卷 | **R2 对象存储无限水平扩展，零出站流出费** |
| **启动与网络延时** | 中心化机房，跨国访问延时高 | 单点单机房，跨大洲网络容易超时 | **毫秒级边缘冷启动**（全球 300+ 边缘节点） |
| **反欺诈与流控** | 黑盒规则，误封无法排查恢复 | 手动编写 iptables / fail2ban | **四阶段流式规则引擎 + 智能信誉评分拦截** |
| **AI 扩展能力** | 仅官方闭源 AI，无法切换模型 | 需自行搭建庞大 GPU 推理服务 | **原生集成 AI Hub 多模型池（OpenAI / Claude / Gemini / DeepSeek）** |
| **开放生态与认证**| 私有协议，API 受严格频率限制 | API 历史负担重，扩展复杂 | **开放 REST/WebSocket API + 原生 OAuth 2.0 / OIDC** |

---

## 🏛️ ECCP 协议分层架构模型

EpoCanvas 将通信生态划分为严格正交的四个层次，实现标准规范、基础设施、用户界面与业务扩展的深度解耦：

```
┌─────────────────────────────────────────────────────────────┐
│ Layer 4: 生态扩展层 (Ecosystem Extensions)                  │
│ Shadow Rooms 隐形频道 · 加密 Bot API · 跨协议 Bridges · 图床 │
├─────────────────────────────────────────────────────────────┤
│ Layer 3: 客户端应用层 (Client Applications)                 │
│ PrivChat 官方旗舰跨平台 App · exine 极客开发者客户端         │
├─────────────────────────────────────────────────────────────┤
│ Layer 2: 服务端节点层 (Homeservers / Nodes)                 │
│ Cloudflare Workers Serverless 节点 · Docker 自托管节点      │
├─────────────────────────────────────────────────────────────┤
│ Layer 1: 协议标准层 (The Standard — ECCP Spec v7.4)         │
│ 双棘轮加密 · DAG 事件图 · 状态决议 State Resolution v2      │
└─────────────────────────────────────────────────────────────┘
```

### 1. 第一层：协议标准层 (The Standard — ECCP)
定义数据如何在网络中传输、加密、同步与跨节点联邦的**开放协议规范**。
- **端对端加密 (E2EE)**：基于 **X25519** 密钥协商、**Ed25519** 身份签名与 **Double Ratchet (双棘轮)** 演化算法，提供完美前向保密 (PFS) 与后向安全。
- **群组会话加密 (Megolm)**：支持万人规模超大频道的高效流式加密，避免单对单通道建立引发的 O(N²) 计算膨胀。
- **事件拓扑定序 (Event DAG)**：采用有向无环图组织所有操作事件，通过 State Resolution Algorithm v2 实现无中心主节点的分布式最终一致性。

### 2. 第二层：服务端节点层 (Homeservers / Nodes)
实现 ECCP 协议的后端服务端，用户可以选择连接公开节点或完全自托管。
- **边缘 Serverless 实现**：基于 Cloudflare Workers + Hono.js 框架，无常驻进程，零待机消耗。
- **三态存储驱动**：高频游标走 **KV**，拓扑与元数据存储于 **D1**（边缘分布式 SQLite），多媒体附件直存 **R2**（S3 兼容，免流量费）。
- **联邦互通能力**：通过 `8448/tcp` 端口与其他自建 ECCP 节点双向鉴权互通。

### 3. 第三层：客户端应用层 (Apps — PrivChat & exine)
提供面向最终用户与极客开发者的旗舰终端交互界面：
- **PrivChat（官方旗舰客户端）**：面向普通用户与团队，拥有极致打磨的现代化 UI、多设备即时同步、音视频多方通话与画板协作。
- **exine（极客与开发者客户端）**：轻量级可脚本化客户端，支持 CLI 命令交互、自定义插件注入与自动化测试。

![PrivChat 官方客户端全景欢迎与主工作台](/images/canvas/client-landing.png)

### 4. 第四层：生态扩展层 (Ecosystem Extensions)
- **Shadow Rooms（隐形私密空间）**：协议层加密且无法被节点目录检索的隐形频道，仅凭邀请凭证加入，全面抗流量嗅探与元数据分析。
- **隐私 Bot 自动化中枢**：支持在 E2EE 加密房间内运行自动化智能 Bot，通过斜杠命令 (`/command`) 与 Webhook 回调响应业务。
- **协议桥接层 (Bridges)**：通过双向透明代理，打通与 Telegram、Signal、Matrix、Email 等既有通信系统的互联互通。
- **Drawing 图床微服务 (`drawing.epocanvas.com`)**：独立高性能图像与画板素材切片托管服务。

---

## 🌟 核心特性矩阵

### 1. 🖥️ 现代化响应式画布与协作工作台
- **自适应多栏布局**：空间导航栏、会话/频道流、协同画布与多媒体音视频面板灵活自由折叠。
- **多端一致性**：完美适配桌面大屏、平板触控与移动端浏览器，原生支持 PWA 离线运行。
- **流式富文本与公式代码**：内置实时 Markdown 渲染器、KaTeX 数学公式支持与代码语法高亮。

![PrivChat 协作工作台与会话视图](/images/canvas/workbench-chat.png)

### 2. 🛡️ C-01 / C-08 信任徽章与全局优先级体系
- **C-01 伺服器信任徽章**：将官方节点 (Official)、授权节点 (Authorized)、联盟节点 (Affiliate) 与自建社区节点 (Community) 清晰区分，且与证书 CRL 吊销状态正交展示，杜绝仿冒欺诈。
- **C-08 房间保护徽章**：实时标识主权房间 (Sovereign)、托管保护 (Escrow active) 与公开房间 (Public Room)。
- **Tier 0–4 弹窗分级仲裁机制**：严格避免多通知冲突，Tier 0（紧急中断）→ Tier 1（全屏阻断）→ Tier 2（常驻横幅清单堆叠）→ Tier 4（浮动 Toast），保障最高级别安全警示不被遗漏。

### 3. 🤖 AI 智能协同中枢与多模型池
- **全主流模型聚合**：原生接入 OpenAI、Anthropic Claude、Google Gemini、DeepSeek 与通义千问模型。
- **智能润色与双语翻译**：独创富文本排版保护算法，重写与翻译时 100% 保持原有段落、代码块与表格结构。
- **0-Token 健康探测**：支持不消耗 Token 的毫秒级接口健康检查与动态负载均衡。

![AI Hub 数据分析看板与模型消耗分析](/images/canvas/analytics-dashboard.png)

### 4. 🔐 OAuth 2.0 / OIDC 身份认证中枢
- **企业级 SSO 身份提供商 (IdP)**：实现 RFC 6749 核心标准与 OpenID Connect 协议，支持第三方企业系统无缝对接。
- **全面 MFA 防护**：支持基于 Google Authenticator 的 TOTP 双重动态密码、WebAuthn / FIDO2 Passkeys 硬件密钥与 Cloudflare Turnstile 智能人机校验。
- **6 大细粒度 RBAC 角色**：超级管理员 (SuperAdmin)、安全审计员 (Auditor)、空间所有者 (SpaceOwner)、频道管理员 (Moderator)、标准成员 (Member)、受限访客 (Guest)。

![系统安全认证与登录界面](/images/canvas/auth-login.png)

---

## 🔄 全链路事件处理与数据流转

EpoCanvas 建立了一套高可靠、事件驱动的双向数据流转管道：

![EpoCanvas 端到端事件流转与联邦数据流拓扑](/images/canvas/event-flow.svg)

- **事件生成阶段 (Client Creation)**：客户端本地完成 Double Ratchet 增量棘轮演化与 X25519 会话密钥加密，附加 Ed25519 数字签名与本地 IndexedDB 乐观存盘。
- **边缘接收与规则判决 (Edge Ingestion & Rule Pipeline)**：Cloudflare Worker 接收事件后，依次经过四阶段规则过滤（预处理 -> 规则匹配 -> 标签染色 -> 路由分流）；AI Hub 可按需执行会话摘要或润色。
- **边缘存储与拓扑落盘 (Storage & DAG Assembly)**：D1 记录事件哈希与父事件指针，构建不可篡改的事件 DAG；大附件通过预签名直传 R2。
- **跨节点联邦广播 (Federation Broadcast)**：节点通过 `8448/tcp` 端口与远程 ECCP 节点发起双向 TLS 握手，经过 State Resolution v2 状态决议合并，对端节点推送至目标客户端并实时解密展示。

---

## 🧭 文档结构与快速导读

建议按以下路径深入了解与实践 EpoCanvas：

1. **环境准备与快速部署**：
   - 查阅 [全栈部署指南](/canvas/deployment/)，通过 Wrangler 或 Docker 快速拉起专属节点与前端。
   - 参考 [域名解析与网络配置](/canvas/dns-setup/)，配置合规的 `/.well-known/eccp/` 联邦发现与 TLS 证书。
2. **核心业务与前端体验**：
   - 查阅 [画布工作台与交互引擎](/canvas/workbench/)，掌握 PrivChat 交互范式、信任徽章与音视频协作通道。
   - 阅读 [双引擎检索与语法规范](/canvas/search-engine/)，熟悉 `from:`、`tag:`、`before:` 等高阶结构化搜索语法。
3. **安全与流控机制**：
   - 阅读 [智能流式规则引擎](/canvas/rule-engine/)，深入事件拦截、条件表达式与标签自动化分流。
   - 探索 [身份认证与 RBAC 权限](/canvas/security-rbac/)，了解多设备密钥轮替、TOTP 2FA 与 6 大角色权限矩阵。
4. **开放生态与高阶集成**：
   - 了解 [AI Hub 与多模型池](/canvas/ai-hub/)，配置各大模型 Provider 与智能协同能力。
   - 阅读 [OAuth 2.0 / OIDC 认证中心](/canvas/oauth-provider/)，将 EpoCanvas 作为统一单点登录源。
   - 查阅 [系统全局配置与服务集成](/canvas/system-config/)、[开放 REST API 参考](/canvas/api-reference/) 与 [故障排查与运维最佳实践](/canvas/troubleshooting/)。
