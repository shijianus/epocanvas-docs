---
title: 开放 RESTful API 开发者参考规范
description: 涵盖 ECCP 客户端同步、端对端密钥管理、房间与画板操作、多媒体直传及 AI 协处理接口
---

EpoCanvas 提供了一套遵循 RESTful 规范与事件驱动流式模型的全功能开放 API。开发者可基于此 API 构建自动化测试脚本、自研终端客户端、业务告警机器人，或将加密通信与数字画布能力嵌入现有企业系统。

---

## 🔑 1. 认证协议与调用约定

### 接口基础路径 (Base URL)
```text
https://chat.example.com
```

### 身份鉴权标头
除公开接口（如登录、注册、服务发现）外，所有客户端端点均需在 HTTP 标头中附带有效的 Bearer JWT 访问令牌：

```http
Authorization: Bearer <ACCESS_TOKEN>
Content-Type: application/json
```

### 标准统一响应封装
所有客户端 API 统一返回规范的 JSON 数据载荷：

```json
{
  "code": 200,
  "message": "success",
  "data": { ... }
}
```

- `code === 200`：请求成功处理。
- `code >= 400`：业务或鉴权异常，`message` 包含明确的错误说明与诊断代码（如 `M_FORBIDDEN`、`M_UNKNOWN_TOKEN`、`M_LIMIT_EXCEEDED`）。

---

## 👤 2. 身份认证与设备注册 API

### 2.1 用户注册 (Register)
```http
POST /_eccp/client/v1/register
```

#### 请求示例：
```bash
curl -X POST https://chat.example.com/_eccp/client/v1/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "ada",
    "password": "SecurePassword#2026",
    "display_name": "Ada Lovelace",
    "device_name": "Ada MacBook Pro"
  }'
```

#### 成功响应：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "user_id": "@ada:example.com",
    "access_token": "epo_tok_a1b2c3d4e5f6...",
    "device_id": "DEV_MBP_8923",
    "home_server": "example.com"
  }
}
```

### 2.2 用户登录 (Login)
```http
POST /_eccp/client/v1/login
```

#### 请求示例：
```bash
curl -X POST https://chat.example.com/_eccp/client/v1/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "ada",
    "password": "SecurePassword#2026",
    "device_name": "Ada iPhone"
  }'
```

---

## 🔐 3. 端对端密钥协商与管理 API

### 3.1 批量上传设备密钥与一次性预共享密钥 (One-Time Keys)
```http
POST /_eccp/client/v1/keys/upload
```

#### 请求体：
```json
{
  "device_keys": {
    "user_id": "@ada:example.com",
    "device_id": "DEV_MBP_8923",
    "algorithms": ["ed25519", "curve25519"],
    "keys": {
      "ed25519:DEV_MBP_8923": "J7fg6R2...",
      "curve25519:DEV_MBP_8923": "dK91pQ4..."
    },
    "signatures": {
      "@ada:example.com": {
        "ed25519:DEV_MBP_8923": "sig_base64_blob..."
      }
    }
  },
  "one_time_keys": {
    "signed_curve25519:AAAAAA": {
      "key": "x25519_otk_pubkey...",
      "signatures": { ... }
    }
  }
}
```

### 3.2 索取对端设备一次性密钥 (Claim Keys)
当向其他成员首次发起 E2EE 会话前，调用此接口索取一次性握手公钥：

```http
POST /_eccp/client/v1/keys/claim
```

---

## 💬 4. 房间、频道与事件分发 API

### 4.1 创建房间 / 协作画布 (Create Room)
```http
POST /_eccp/client/v1/rooms/create
```

#### 请求参数：
```json
{
  "name": "EpoCanvas 核心架构组",
  "topic": "新一代端对端加密协作讨论",
  "visibility": "private",
  "preset": "private_chat",
  "is_shadow_room": false,
  "creation_content": {
    "m.federatable": true,
    "org.epocanvas.canvas_enabled": true
  }
}
```

#### 返回结果：
```json
{
  "code": 200,
  "data": {
    "room_id": "!canvas_core_9876:example.com"
  }
}
```

### 4.2 发送加密消息 / 画布图元事件 (Send Event)
```http
PUT /_eccp/client/v1/rooms/{roomId}/send/{eventType}/{txnId}
```

- `{roomId}`：目标房间 ID。
- `{eventType}`：事件类型，如 `m.room.encrypted`、`m.room.message` 或 `org.epocanvas.drawing.stroke`。
- `{txnId}`：客户端生成的幂等事务 ID，防止网络抖动导致的重复发送。

#### 请求体：
```json
{
  "algorithm": "eccp.megolm.v1",
  "sender_key": "x25519_pubkey...",
  "session_id": "megolm_session_12345",
  "ciphertext": "base64_encrypted_payload..."
}
```

---

## 🔄 5. 实时长轮询与增量同步 API (Sync Engine)

PrivChat 客户端通过单连接轮询获取全量/增量事件流：

```http
GET /_eccp/client/v1/sync?since={next_batch}&timeout=30000
```

- `since`：上一批次返回的游标 Token。若不传，则执行全量冷拉取。
- `timeout`：服务端挂起等待新事件的最长毫秒数（支持边缘 Long-Polling）。

#### 响应结构：
```json
{
  "next_batch": "s89234_981_0_1",
  "rooms": {
    "join": {
      "!canvas_core_9876:example.com": {
        "timeline": {
          "events": [
            {
              "type": "m.room.encrypted",
              "sender": "@bob:example.com",
              "content": { ... },
              "origin_server_ts": 1773291000000,
              "event_id": "$evt_9831a..."
            }
          ]
        }
      }
    }
  }
}
```

---

## 📦 6. 媒体与白板素材预签名直传 API

### 6.1 请求上传预签名 URL (Create Upload)
```http
POST /_eccp/client/v1/media/create-upload
```

#### 请求示例：
```json
{
  "filename": "architecture-diagram.png",
  "content_type": "image/png",
  "file_size": 2097152
}
```

#### 返回参数：
```json
{
  "code": 200,
  "data": {
    "upload_url": "https://<account-id>.r2.cloudflarestorage.com/epocanvas-media/media/ada/xyz123.png?X-Amz-Signature=...",
    "download_url": "https://media.epocanvas.com/media/ada/xyz123.png",
    "expires_in": 900
  }
}
```

---

## 🤖 7. AI Hub 智能协处理 API

### 7.1 会话流长上下文智能摘要
```http
POST /_eccp/client/v1/ai/summarize
```

#### 请求参数：
```json
{
  "room_id": "!canvas_core_9876:example.com",
  "event_ids": ["$evt_1", "$evt_2", "$evt_3"],
  "model": "deepseek-reasoner",
  "language": "zh-CN"
}
```

#### 返回数据：
```json
{
  "code": 200,
  "data": {
    "summary": "团队确认了 v7.4 协议的发布时间，并分配了关于 WebRTC 穿透优化的待办事项给 @ada。",
    "action_items": [
      { "assignee": "@ada:example.com", "task": "部署 Coturn 备用节点" }
    ],
    "tokens_used": 342
  }
}
```
