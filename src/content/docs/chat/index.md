---
title: EpoCanvas Chat Overview
description: Overview and architecture of EpoCanvas End-to-End Encrypted (E2EE) Instant Messaging.
sidebar:
  order: 1
  badge:
    text: E2EE
    variant: tip
---

EpoCanvas Chat is an enterprise-grade, privacy-first instant messaging system designed for high-assurance communication.

## Core Architectural Pillars

1. **Zero-Knowledge by Default**: Private keys and ratchet states remain exclusively on client devices. The central synapse/relay server has zero cryptographic capability to decrypt payloads or inspect metadata graphs.
2. **Double Ratchet Mechanism**: Implements the Signal Protocol cryptographic standard, providing Forward Secrecy (FS) and Break-in Recovery (Post-Compromise Security).
3. **Cross-Platform Parity**: Available across Android, iOS, Desktop (Electron/Rust Tauri), and WebAssembly (WASM).
4. **Federation Ready**: Supports decentralized clustering through standard ECCP federation bridges.

## Quick Links

- [Deployment & Setup Guide](/chat/deployment/): How to deploy your own private EpoCanvas Chat homeserver using Docker Compose or Kubernetes.
- [ECCP Protocol Spec](/eccp/): Technical deep-dive into how packets are signed, padded, and transmitted.

## Client Feature Matrix

| Feature | Android | iOS | Desktop | Web |
| :--- | :---: | :---: | :---: | :---: |
| 1:1 E2EE Messaging | ✅ | ✅ | ✅ | ✅ |
| Encrypted Group Voice/Video | ✅ | ✅ | ✅ | ⚠️ (Beta) |
| Local Encrypted SQLite Vault | ✅ | ✅ | ✅ | ❌ (IndexedDB) |
| Multi-Device Session Sync | ✅ | ✅ | ✅ | ✅ |
