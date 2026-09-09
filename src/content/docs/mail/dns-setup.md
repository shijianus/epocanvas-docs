---
title: 域名解析与安全认证
description: 规范配置 MX、SPF、DKIM 及 DMARC 记录保障邮件投递率与防伪造
---

为了使 EpoMail 能够正常收发电子邮件，并防止邮件被各大主流厂商（如 Gmail、Outlook、QQ 邮箱）标记为垃圾邮件或拦截伪造，必须在域名 DNS 控制台中完成标准化记录配置。

## MX 记录配置

MX（Mail Exchanger）记录指引互联网邮件服务器将发送给你域名的邮件路由至 Cloudflare Email Routing 处理管线。

| 类型 | 主机记录 / 名称 | 记录值 | 优先级 | 说明 |
| :--- | :--- | :--- | :--- | :--- |
| **MX** | `@` | `isaac.mx.cloudflare.net` | 10 | Cloudflare 邮件接收主路由 |
| **MX** | `@` | `linda.mx.cloudflare.net` | 20 | Cloudflare 邮件接收备路由 |
| **MX** | `@` | `amir.mx.cloudflare.net` | 30 | Cloudflare 邮件接收容灾路由 |

## SPF 记录防伪造

SPF（Sender Policy Framework）记录用于明确声明哪些发信源服务器被授权代表你的域名发送邮件。

在 DNS 控制台添加一条 `TXT` 记录：

```text
主机记录: @
记录类型: TXT
记录值:   v=spf1 include:_spf.mx.cloudflare.net include:resend.com ~all
```

> 此规则允许 Cloudflare 转发网关与 Resend 发信通道代表你的域名发送有效邮件，其他未授权来源将触发软失效（SoftFail）。

## DKIM 签名验证

DKIM（DomainKeys Identified Mail）通过在邮件头中嵌入公私钥数字签名，确保邮件正文和重要标头在传输过程中未被篡改。

根据 Resend 控制台或你的签名密钥生成器，添加对应的 CNAME 或 TXT 记录：

```text
主机记录: resend._domainkey
记录类型: TXT
记录值:   k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC3...
```

## DMARC 策略报告

DMARC（Domain-based Message Authentication, Reporting, and Conformance）在 SPF 与 DKIM 之上构建策略裁决标准，指引收信网关如何处置未通过鉴权的仿冒邮件。

添加以下 TXT 记录：

```text
主机记录: _dmarc
记录类型: TXT
记录值:   v=DMARC1; p=quarantine; rua=mailto:dmarc-reports@yourdomain.com; pct=100
```

- `p=quarantine`：对未通过校验的邮件执行隔离/归入垃圾邮件夹处理。
- `rua=mailto:...`：接收各大收信服务商定期汇总的安全鉴权统计分析报告。

## 配置生效验证

DNS 解析通常在数分钟至 24 小时内全球生效。你可以在控制台或通过标准 `dig` 命令检查记录状态：

```bash
dig MX yourdomain.com +short
dig TXT yourdomain.com +short
```
