---
title: 系统全局设置与服务集成
description: 联邦协作模式、R2/S3 存储治理、Drawing 图床微服务、Webhook 机器人与 TURN/STUN 网络穿透
---

EpoCanvas 控制台提供了高度集中、模块化的系统治理面板。管理员可以在不重启后端 Worker 的前提下，**热更新**联邦互联策略、对象存储桶、Drawing 图床微服务、安全告警机器人及音视频穿透服务器等关键基础设施。

![系统配置面板与服务治理](/images/canvas/profile-details.png)

---

## 🎛️ 1. 全局系统治理与联邦拓扑策略

在【系统设置】→【站点配置】中，站长可实时调整全节点行为准则：

### 核心系统参数
- **开放注册策略 (Registration Policy)**：
  - `OPEN`：允许公网访客自主注册账号。
  - `INVITE_ONLY`：仅允许持有有效管理员邀请码（Reg-Key）的用户注册。
  - `CLOSED`：完全关闭公网注册通道，仅限超级管理员后台手动创建。
- **公开个人主页 (Public Identity Profile)**：
  控制是否允许外部联邦节点查阅脱敏后的用户公钥指纹与公开名片。
- **强制 TOTP 双因素认证 (Enforce 2FA)**：
  开启后，所有 `member` 及以上特权角色必须在初次登录后 24 小时内绑定 TOTP 验证器，否则强制限制核心操作权限。

### 三大联邦互联模式 (Federation Modes)

| 模式名称 | 内部标识 | 行为准则与网络隔离要求 | 典型适用场景 |
| :--- | :--- | :--- | :--- |
| **开放联邦模式 (Open Federation)** | `open` | 遵循标准 ECCP 规范，接受来自全球任何合规节点的 TLS 8448 握手。 | 开源社区、公共通信节点、跨机构科研协作 |
| **联盟受限模式 (Allowlist Only)** | `restricted`| 仅与白名单中的特定域名（如 `*.partner.org`）建立双向证书互信。 | 供应链企业联合协作网、跨国金融专网 |
| **私有飞地模式 (Isolated Enclave)**| `isolated`  | 完全切断外网 8448 端口广播，节点仅服务于内部专有网络。 | 军工国防、核心金融机密室、自闭环内网 |

---

## 📦 2. 对象存储治理 (Cloudflare R2 / AWS S3 / MinIO)

EpoCanvas 将大文件附件、会话媒体切片与静态设计稿统一交由对象存储托管：

### 2.1 存储桶配置参数
- **存储驱动 (Driver)**：支持 `cloudflare_r2`、`aws_s3` 与自建 `minio`。
- **Bucket 标识**：`epocanvas-media`。
- **公共访问域 (Public Access Domain)**：绑定专属自定义加速域名（如 `https://media.epocanvas.com`）。

### 2.2 预签名直传机制 (Pre-signed Direct Upload)
为了减轻边缘 Worker 的内存开销并支持高达 500MB+ 的多媒体直传，系统采用客户端直连存储桶机制：
1. 客户端向后端发起 `POST /_eccp/client/v1/media/create-upload`。
2. Worker 校验用户配额后，使用 S3 兼容 API 生成具备 15 分钟有效期的预签名 PUT URL。
3. 客户端直接将文件流上传至 R2 / S3，实现零边缘流出中转费用。

---

## 🎨 3. Drawing 独立图床微服务集成 (`drawing.epocanvas.com`)

EpoCanvas 生态内嵌了专为画板矢量素材与图片剪切板优化的高性能图床系统：

- **自动化素材同步**：当用户在画板中粘贴高清截图或导入 SVG 图标时，客户端自动调用 Drawing 图床接口生成唯一资源哈希。
- **智能图片处理**：原生支持 WebP 格式自适应转码与基于边缘 CDN 的缩略图生成（Thumbnail on-the-fly）。
- **画板版本快照存盘**：画板的每一次重要里程碑版本快照均自动推入图床进行持久化存储。

---

## 🤖 4. Webhook 外部通知总线与机器人联动

EpoCanvas 支持通过轻量 Webhook 将关键系统事件与企业通讯录、报警系统打通：

### 4.1 Telegram 告警机器人
在后台填入 `TELEGRAM_BOT_TOKEN` 与管理员 `CHAT_ID`，系统自动分发：
- 节点遭受异常高频爆破登录时的风控警报。
- 联邦节点出现连续 3 次 TLS 握手失败时的连通性告警。
- 超级管理员密码变更或关键权限提升时的即时推送。

### 4.2 自定义 REST Webhooks
支持在发生事件时向外部 Webhook 广播包含 HMAC 签名的请求：

```http
POST /api/webhooks/epocanvas HTTP/1.1
Host: your-ops.internal.com
X-ECCP-Signature: sha256=d5b0a7...
Content-Type: application/json

{
  "event_id": "$evt_98234ab12",
  "event_type": "m.room.message",
  "room_id": "!ops_alert:example.com",
  "sender": "@bot_monitor:example.com",
  "timestamp": 1773289200000,
  "summary": "[ALERT] 存储集群用量已超 85%"
}
```

---

## 📞 5. WebRTC STUN / TURN 音视频穿透配置

为了确保处于对称型 NAT（Symmetric NAT）或复杂企业内网防火墙后的协作者能够顺利接通音视频会议，系统支持无缝配置 STUN/TURN 中继：

```typescript
// 客户端接收的 ICE 服务器配置集合
export const defaultIceServers: RTCIceServer[] = [
  {
    urls: "stun:stun.cloudflare.com:3478"
  },
  {
    urls: [
      "turn:turn.epocanvas.com:3478?transport=udp",
      "turns:turn.epocanvas.com:5349?transport=tcp"
    ],
    username: "epo_turn_guest",
    credential: "epocanvas-turn-ephemeral-secret"
  }
];
```

配合自托管的 **Coturn** 或 Cloudflare Calls 边缘实时音视频网络，音视频连接建立成功率可达 99.8% 以上。
