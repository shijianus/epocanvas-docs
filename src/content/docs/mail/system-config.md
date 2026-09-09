---
title: 系统设置与服务集成
description: 邮件发送提供商配置、R2 附件管理、Telegram 推送通知与 Turnstile 防护
---

EpoMail 控制台提供模块化的系统设置面板，方便管理员动态管理存储参数、通知通道与外部 API 密钥。

![系统设置界面](/images/mail/demo-settings.png)

## 外发邮件服务集成（Resend）

虽然 Cloudflare Email Routing 原生擅长处理邮件接收，但外发邮件需要借助专业发信通道以保障极高的信誉度和送达率。

1. 前往 [Resend 控制台](https://resend.com/) 注册账号并添加发信域名。
2. 生成拥有完整发信权限的 API Key（形如 `re_123456...`）。
3. 在 EpoMail 系统设置中填入 API Key 与默认发件人邮箱前缀。

```typescript
// Worker 内部外发调度示例
const resendResponse = await fetch('https://api.resend.com/emails', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${env.RESEND_API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    from: `${senderName} <${senderEmail}>`,
    to: [recipientEmail],
    subject: subject,
    html: htmlContent,
  }),
});
```

## 对象存储与附件管理（Cloudflare R2）

当用户在邮件中附带超大附件或内嵌高分辨率图片时，附件数据将通过流式管道持久化于 Cloudflare R2 对象存储桶中：

- **零出站流量费**：相比 AWS S3，R2 拥有极低的长期成本优势。
- **签名预授权下载**：文件下载链接带有时效性签名，防止未授权恶意抓取与盗链。

## Telegram 机器人实时通知推送

启用 Telegram 消息推送后，系统将在接收到新邮件的第一时间向指定频道或个人推送精炼卡片：

1. 在 Telegram 联系 `@BotFather` 创建新机器人并获取 `BOT_TOKEN`。
2. 向机器人发送 `/start` 获取你的专属 `CHAT_ID`。
3. 在 EpoMail 控制台勾选开启 Telegram 推送并保存配置。

推送通知将展示发件人、主题摘要、时间戳，并智能标记出 Cloudflare AI 提取出的高亮验证码。

## 数据指标与监控大屏

系统内置综合数据统计看板，可实时查阅全域邮件收发增长走势、活跃会话分布与存储消耗：

![系统统计大屏](/images/mail/demo-stats.png)
