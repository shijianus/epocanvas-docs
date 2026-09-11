# EpoCanvas Docs v1.2.0 Release Notes

**发布版本**: `v1.2.0`  
**发布时间**: 2026-09-11  
**站点地址**: [https://doc.epocanvas.com](https://doc.epocanvas.com) / [https://epocanvas-docs.pages.dev](https://epocanvas-docs.pages.dev)  
**源码仓库**: [https://github.com/shijianus/epocanvas-docs](https://github.com/shijianus/epocanvas-docs)

---

## 🌟 重大更新与里程碑概述

本版本对 EpoCanvas 官方技术文档库（`epocanvas-docs`）完成了全方位的重构与代际演进：彻底清除了早期测试阶段的 Epomail 遗留主题，全面升级为聚焦 **EpoCanvas 数字协作平台** 与 **ECCP (EpoCanvas Communication Protocol v7.4)** 协议标准的官方技术与运维指南。

---

## 🚀 核心更新明细

### 1. 全域内容重构与架构分层体系
- **全面聚焦 EpoCanvas**：全量删除旧版邮件系统相关文档与组件路由，重写了全部 12 大核心技术文档。
- **ECCP 四层分工体系**：
  - **Layer 1: 协议标准层 (The Standard)**：Double Ratchet 双棘轮算法、X25519 协商、Ed25519 签名、Megolm 群组加密与 DAG 事件状态决议。
  - **Layer 2: 服务端节点层 (Homeservers / Nodes)**：Cloudflare Workers 边缘 Serverless 架构与 Docker 独立容器化双模部署。
  - **Layer 3: 客户端应用层 (Apps)**：PrivChat 官方旗舰跨平台 App 与 exine 极客客户端。
  - **Layer 4: 生态扩展层 (Ecosystem)**：Shadow Rooms 隐形通道、加密 Bot API、跨协议 Bridges 与 Drawing 图床。

### 2. 深度植入真实高保真界面截图与矢量架构图
- `architecture.svg`：EpoCanvas 系统分层全景架构图。
- `event-flow.svg`：端到端事件流转、双棘轮加密、边缘存储与 P2P 联邦数据流拓扑图。
- `client-landing.png`：PrivChat 旗舰客户端启动与欢迎大屏。
- `workbench-chat.png`：现代化三栏式会话与 Markdown 实时渲染协作视口。
- `call-channel.png`：WebRTC SFU 音视频协同与频道通话视口。
- `conference-collab.png`：多方大屏音视频会议与协同矩阵。
- `auth-login.png`：基于 Argon2id、TOTP 2FA 与 Passkeys 的零信任登录中心。
- `analytics-dashboard.png`：AI Hub 多模型池 Token 消耗走势与模型分布数据大屏。
- `rules-labels.png`：四阶段流式规则引擎编排与多维度标签治理界面。
- `rbac-matrix.svg`：6 大内置角色与权限细粒度访问控制矩阵。
- `rule-engine-levels.svg`：三层递进规则裁决瀑布流架构图。

### 3. 前端交互规范与 UX 设计标准
- **C-01 伺服器信任徽章**：Official (绿) / Authorized (蓝) / Affiliate (灰) / Custom Root (紫) / Community (淡灰) 双轴正交体系。
- **C-08 房间保护徽章**：Sovereign (主权房间) / Escrow active (托管保护) / Public (公开房间)。
- **Tier 0–4 弹窗排队仲裁器 (Global Overlay Resolver)**：严格避免弹窗打架，确保 TCR 否决与危急告警等最高优先级信号万无一失。
- **双引擎搜索体系**：纯前端 CSS Custom Highlight API 页面无损高亮 + 零知识本地客户端倒排索引检索。

### 4. 自动化构建与 Cloudflare 全球边缘部署
- 编译生成 14 个完整静态路由页面，通过 Pagefind 完成全站离线分词检索索引构建。
- 自动化流水线直连 Cloudflare Pages，主控域名 `https://doc.epocanvas.com` 及全球分发节点 `https://epocanvas-docs.pages.dev` 实时秒级生效。
