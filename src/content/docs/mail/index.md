---
title: EpoMail Overview
description: Overview and security architecture of EpoMail encrypted mail service.
sidebar:
  order: 1
  badge:
    text: PGP / ML-KEM
    variant: note
---

**EpoMail** is an end-to-end encrypted email solution combining standard RFC 5322 email compatibility with modern post-quantum cryptography (ML-KEM / Kyber) and OpenPGP standards.

## Key Capabilities

- **Zero-Access Storage**: Mails stored on the mail transfer agent (MTA) are encrypted with the recipient's public key before touching persistent disk.
- **Post-Quantum Hybrid Encryption**: Combines X25519 with Kyber-768/ML-KEM to protect against "Harvest Now, Decrypt Later" quantum adversary attacks.
- **Custom Domain Support**: Seamlessly bind personal and enterprise domain records (MX, SPF, DKIM, DMARC, TLSA).
- **Web & IMAP/SMTP Gateway**: Native bridge application translating standard IMAP/SMTP traffic into local decrypted plaintext on trusted loopback.

## Getting Started

Follow our [Setup & Configuration Guide](/mail/setup/) to link your custom domain and configure your local desktop client.
