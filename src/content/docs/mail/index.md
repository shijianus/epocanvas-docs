---
title: EpoMail 项目概览
description: 基于 Cloudflare Workers 的现代化响应式邮件系统与统一通信枢纽
---

**EpoMail** 是一套基于 Cloudflare 原生无服务器架构（Cloudflare Workers + D1 + KV + R2）构建的现代化轻量级邮件服务解决方案。只需一个域名，即可搭建安全、低成本、免运维且功能完备的企业级专属邮箱系统。

![系统架构图](/images/mail/architecture.svg)

## 核心特性

- **⚡ 零服务器成本运维**：全量依托 Cloudflare 全球边缘计算网络，彻底告别传统庞大邮件服务器（Postfix/Dovecot）的繁重维护开销。
- **📱 现代化响应式界面**：基于 Vue 3 与 Element Plus 构建，完美适配桌面端、平板及移动设备屏幕。
- **📧 邮件收发与附件管理**：原生支持 HTML 富文本邮件编写、内嵌图片发送及超大附件收发（依托 Cloudflare R2 对象存储）。
- **🤖 智能验证码提取**：结合 Cloudflare Workers AI 模型，自动秒级提取验证码并在通知中心醒目展现。
- **🔔 多通道消息推送**：支持实时转发通知至 Telegram 机器人、WebHook 或备用邮箱，确保重要信息零遗漏。
- **🛡️ 严格安全标准**：全面支持 SPF、DKIM、DMARC 邮件鉴权与 Cloudflare Turnstile 人机防刷防护。

## 界面展示

EpoMail 提供直观明了的控制台体验，界面遵循现代极简设计，兼顾高密度信息流与舒适阅读间距。

![收件箱管理界面](/images/mail/demo-inbox.png)

![富文本写信界面](/images/mail/demo-compose.png)

## 技术架构栈

| 层次 | 技术选型 | 说明 |
| :--- | :--- | :--- |
| **边缘计算** | [Cloudflare Workers](https://developers.cloudflare.com/workers/) | 毫秒级全球冷启动 API 网关与邮件事件流处理 |
| **应用框架** | [Hono.js](https://hono.dev/) | 极致轻量的高性能 TypeScript Web 框架 |
| **关系型数据库** | [Cloudflare D1](https://developers.cloudflare.com/d1/) | Serverless SQLite 边缘分布式数据库 |
| **对象存储** | [Cloudflare R2](https://developers.cloudflare.com/r2/) | 零外网流出费用的邮件附件与媒体文件存储 |
| **前端框架** | [Vue 3](https://vuejs.org/) + [Element Plus](https://element-plus.org/) | 响应式单页面管理控制台 |
| **邮件投递** | [Resend API](https://resend.com/) | 企业级邮件发送路由与高送达率保障 |

## 下一步

开始部署属于你的专属邮件服务：
- 阅读 [界面与服务部署](/mail/deployment/) 了解 Worker 与 WebUI 搭建流程。
- 参考 [域名解析与安全认证](/mail/dns-setup/) 配置 DNS 解析记录。
- 查看 [系统设置与服务集成](/mail/system-config/) 开启 Telegram 通知与外部服务对接。
