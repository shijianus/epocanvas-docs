---
title: AI 智能协同中枢与多模型池架构
description: 覆盖 OpenAI/Claude/Gemini/DeepSeek 多模型池接入、0-Token 探测、协同场景与 15 日用量大屏
---

为了在去中心化协作生态中赋予团队无与伦比的生产力，EpoCanvas 原生构建了企业级 **AI Hub（智能中枢与多模型池架构）**。系统将大语言模型（LLM）深度融入即时通信、画板协同与知识归档全流程，并通过标准化的抽象网关支持多厂商模型动态负载与角色分级调度。

![AI 统计看板与多模型调用分析大屏](/images/canvas/analytics-dashboard.png)

---

## 🌐 1. 全主流大模型协议聚合网关

AI Hub 提供了协议自适应适配层，统一屏蔽不同云厂商的接口格式差异。管理员仅需在后台填入 API Key 与服务地址，系统即可自动接入：

| 模型厂商 / 生态 | 协议规范 | 核心适配模型 | 特点与优势 |
| :--- | :--- | :--- | :--- |
| **OpenAI** | `/v1/chat/completions` | `gpt-4o`, `o1`, `o3-mini` | 通用能力强劲，函数调用 (Function Calling) 稳定 |
| **Anthropic Claude**| `/v1/messages` | `claude-3-7-sonnet`, `claude-3-5-haiku` | 编码推理深度拔尖，富文本排版遵循度极高 |
| **Google Gemini** | `/v1beta/models/...` | `gemini-2.0-flash`, `gemini-1.5-pro` | 超长上下文窗口（可达 1M~2M Tokens），多模态理解迅速 |
| **DeepSeek** | OpenAI 兼容格式 | `deepseek-chat`, `deepseek-reasoner` (R1)| 数学与复杂逻辑思考模型，运行性价比极高 |
| **阿里通义千问** | DashScope / OpenAI | `qwen-max`, `qwen-plus`, `qwen-2.5-coder` | 中文语境与本地代码生成能力优秀 |
| **Workers AI 边缘** | Cloudflare AI Binding | `@cf/meta/llama-3.3-70b-instruct` | 边缘原生直接推理，0 外部 API 依赖，零出网延迟 |

---

## 🚀 2. 协同核心应用场景

### 2.1 频道长上下文智能摘要 (Channel Rollup & Action Items)
针对团队离线期间积攒的数百条长讨论流，点击顶栏「AI 摘要」，系统自动提取：
- **讨论核心主线**：几句话提炼各方争议与共识。
- **待办事项清单 (Action Items)**：自动抽取出 `@责任人` 与执行要求。
- **决策定案记录 (Decisions Log)**：提取会议达成的正式决议，一键同步沉淀至团队知识库。

### 2.2 保持富文本排版的双语翻译 (Layout-Preserved Translation)
传统的机器翻译常破坏 Markdown 代码块、表格缩进与 LaTeX 公式。EpoCanvas 研发了排版标记保护算法：
1. 在提取内容时，自动用特殊占位符屏蔽代码块、链接与媒体资源。
2. 翻译完成后，100% 保持原有格式、段落层次与表格网格对齐。

### 2.3 画布图元与 Mermaid 架构图一键生成
在讨论架构设计时，在输入框键入 `/ai diagram "三层架构流转图"`，AI Hub 将自动生成规范的 Mermaid 代码并立即在画板视口中渲染为可拖拽交互的矢量图形。

---

## ⚡ 3. 候选端点自适应补齐与 0-Token 纯测速探测

许多用户在配置第三方 API 聚合中继时，常为 URL 路径规范（如是否携带 `/v1`、`/chat/completions`）困扰。

EpoCanvas 实现了**智能拓扑自适应补齐与容灾重试算法**：

```typescript
// 智能端点补齐算法
export function resolveCandidateEndpoints(rawUrl: string): string[] {
  const base = rawUrl.trim().replace(/\/+$/, '');
  if (base.endsWith('/chat/completions') || base.endsWith('/messages')) {
    return [base];
  }
  if (base.endsWith('/v1')) {
    return [`${base}/chat/completions`, `${base}/messages`, base];
  }
  return [
    `${base}/v1/chat/completions`,
    `${base}/chat/completions`,
    `${base}/v1/messages`,
    base
  ];
}
```

### 0-Token 纯测速机制 (Zero-Token Ping Probe)
为了让管理员随时测试各模型的网络健康度而避免浪费 Token，AI Hub 创新使用 `GET /v1/models` 端点发起轻量 HTTP 请求：
- **零成本**：无需调用耗费 Token 的推理端点。
- **毫秒级测速**：精准测出边缘节点到模型提供商机房的网络握手往返延迟 (RTT)。
- **动态故障转移**：当主通道超时超过 3500ms 时，自动熔断并热切换至备用模型提供商。

---

## 🎛️ 4. 基于 RBAC 权限的角色分级模型池 (Model Routing)

不同角色的算力需求与使用成本差异巨大。EpoCanvas 允许将特定模型池与内置角色绑定：

```
[普通协作者 Member]   ──▶ 绑定轻量高效模型池 (Gemini 2.0 Flash / Qwen 2.5)
[核心架构师 Admin]    ──▶ 解锁深度推理模型池 (Claude 3.7 Sonnet / DeepSeek R1)
[自动化系统 Bot]      ──▶ 分配低时延无限制通道 (Workers AI Llama 3.3)
```

- **每日使用限额 (Token Quota)**：按角色限制每日最大 Token 消耗量，并在前台提供用量仪表盘。
- **敏感词过滤与私有化防护**：在模型调用前，支持本地轻量正则表达式脱敏（自动将密码、API 密钥打码为 `***`），确保团队核心机密绝不泄漏至公共大模型训练集。

---

## 📊 5. 15 日 AI 消耗监控与可视化数据大屏

系统内置 ECharts 交互式大屏，实时呈现：
1. **全域 Token 吞吐曲线**：按日统计 Prompt 输入 Tokens 与 Completion 输出 Tokens。
2. **各模型调用占比环形图**：直观展示团队在 Claude、GPT、DeepSeek 之间的使用偏好。
3. **响应延时分布直方图**：监控 P50、P90、P99 推理生成时延，及时优化中继线路。
