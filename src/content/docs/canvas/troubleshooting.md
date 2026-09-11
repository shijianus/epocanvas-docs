---
title: 故障排查与运维最佳实践
description: 覆盖联邦握手互联、E2EE 密钥解密、D1/R2 存储、WebRTC 穿透与生产级日志诊断
---

本文档系统汇总了在搭建、运维与扩展 EpoCanvas 过程中最常见的技术挑战、故障排查路径与恢复方案，帮助团队运维人员与站长迅速定位问题并保障集群的长期高可用。

---

## 🛑 1. 部署与边缘基础设施常见异常

### 异常 1：`wrangler deploy` 报错 `D1_ERROR` 或 `Database not found`
- **故障根因**：`wrangler.toml` 中的 `database_id` 与实际在 Cloudflare 控制台中创建的数据库 UUID 不一致。
- **排查与修复**：
  ```bash
  # 1. 查询当前账户下全部 D1 数据库实例
  wrangler d1 list
  # 2. 找到名为 epocanvas_db 的实例，复制其 UUID
  # 3. 检查 wrangler.toml 中的 database_id 并修正
  ```

### 异常 2：数据库迁移执行失败 `table already exists`
- **故障根因**：之前曾手动执行过建表 SQL，再次运行迁移脚本发生冲突。
- **修复方式**：在执行迁移文件前检查是否存在 `IF NOT EXISTS` 守卫语句，或者通过 `wrangler d1 execute epocanvas_db --remote --command="SELECT name FROM sqlite_master WHERE type='table';"` 巡检当前已存在的表集合。

---

## 🌐 2. 联邦网络互通与发现故障 (Federation Troubleshooting)

### 故障 1：其他节点无法向本节点投递事件，报错 `M_UNKNOWN_HOST`
- **排查步骤**：
  1. **检查 Well-Known 服务发现**：
     ```bash
     curl -i https://yourdomain.com/.well-known/eccp/server
     ```
     确认返回包含 `{"m.server": "chat.yourdomain.com:8448"}`，且响应头包含 `Access-Control-Allow-Origin: *`。
  2. **检查 8448 端口公网可达性**：
     通过外部探针网络运行 `nc -zv chat.yourdomain.com 8448`。若连接超时，检查云服务器安全组（Security Group）与本地防火墙（UFW）是否放行了 `8448/tcp`。

### 故障 2：联邦请求返回 `401 M_UNAUTHORIZED` 或签名校验失败
- **故障根因**：请求中携带的 Ed25519 节点签名与远端节点通过 Key 接口获取的公钥指纹不匹配。
- **排查方式**：
  ```bash
  # 检查本节点对外公布的签名公钥
  curl https://chat.yourdomain.com:8448/_eccp/federation/v1/version
  ```
  确认服务器系统时间（NTP）是否与标准原子钟偏差超过 5 秒（时间漂移会导致数字签名时间戳判定过期）。

---

## 🔐 3. 端对端加密 (E2EE) 与密钥同步故障

### 现象 1：部分历史消息显示「正在等待对端协商会话密钥 (UTD - Unable to Decrypt)」
- **故障根因**：
  1. 当前设备是新登入设备，发信方尚未向新设备分享 Megolm 群组会话棘轮。
  2. 发件人的客户端离线，尚未收到增量一次性公钥 (One-Time Keys)。
- **解决方法**：
  1. **主动发起密钥索取**：在工作台消息右键菜单选择「重新请求此消息的加密密钥」。
  2. **检查一次性密钥水位**：确保用户的当前设备在连接时上传了充足的 OTKs（建议维持 50~100 个预留公钥）：
     ```bash
     curl -H "Authorization: Bearer <TOKEN>" \
       https://chat.yourdomain.com/_eccp/client/v1/keys/upload
     ```

### 现象 2：意外触发了 TCR 恢复否决警告（Tier 0 阻断）
- **处理建议**：
  若并非本人发起助记词恢复，请**务必在 48 小时冷静期内立即点击【否决此操作】**，并前往安全中心执行【一键吊销所有异常设备】，重新生成主恢复凭据。

---

## 📦 4. 对象存储与 Drawing 图床直传排障

### 现象 1：客户端直传附件时，浏览器控制台抛出 `403 CORS Policy Blocked`
- **故障根因**：Cloudflare R2 或 AWS S3 存储桶未配置跨域资源共享规则。
- **修复配置**：
  前往 Cloudflare 控制台 → **R2** → 选择 `epocanvas-media` → **Settings** → **CORS Policy**，添加：
  ```json
  [
    {
      "AllowedOrigins": ["https://chat.yourdomain.com", "http://localhost:*"],
      "AllowedMethods": ["GET", "PUT", "POST", "HEAD"],
      "AllowedHeaders": ["*"],
      "ExposeHeaders": ["ETag"],
      "MaxAgeSeconds": 3600
    }
  ]
  ```

---

## 📞 5. WebRTC 音视频与白板协同延迟排查

### 现象 1：发起通话后双方界面卡在「ICE 协商中 (Connecting...)」
- **排查步骤**：
  1. **检查双方网络拓扑**：若双方均处于对称型 NAT（常见于校园网、大型移动基站或企业内网），P2P 直连将无法穿透，必须强制依赖 TURN 中继。
  2. **验证 TURN 服务可用性**：使用 [Trickle ICE 在线测试工具](https://webrtc.github.io/samples/src/content/peerconnection/trickle-ice/) 填入你在 `epocanvas.config.ts` 中配置的 TURN 节点地址与临时认证密钥，确保能成功收集到类型为 `relay` 的候选候选人。

---

## 🩺 6. 生产级实时日志捕获与健康探针

### 使用 Wrangler Tail 实时监控边缘报错
无需侵入代码即可实时流式抓取 Cloudflare Worker 执行日志：

```bash
# 启动实时控制台日志追踪
wrangler tail epocanvas-core --format=pretty

# 针对 HTTP 500 级异常进行定向过滤
wrangler tail epocanvas-core --status=error
```

### 生产容器级健康巡检脚本
对于 Docker 自建节点，可配置系统 Cron 定期运行健康探活探针：

```bash
#!/usr/bin/env bash
HEALTH_URL="https://chat.yourdomain.com/_eccp/client/v1/health"
STATUS_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$HEALTH_URL")

if [ "$STATUS_CODE" -ne 200 ]; then
    echo "[ERROR] EpoCanvas 服务异常，HTTP 状态码: $STATUS_CODE"
    # 可在此触发企业微信/钉钉/Telegram 报警通知
    exit 1
fi
echo "[OK] EpoCanvas 服务正常运行中"
```
