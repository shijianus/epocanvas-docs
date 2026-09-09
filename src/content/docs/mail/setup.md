---
title: EpoMail Setup & Configuration
description: Step-by-step setup guide for configuring domains and DNS records for EpoMail.
sidebar:
  order: 2
---

This guide details DNS record provisioning and client key generation for EpoMail.

## Step 1: DNS Records Setup

To ensure deliverability and strict cryptographic authenticity, configure the following DNS records on your registrar:

### 1. MX Records
Point inbound mail traffic to the EpoMail gateway:

| Type | Host | Points To | Priority |
| :--- | :--- | :--- | :--- |
| MX | `@` | `mail1.epocanvas.com` | 10 |
| MX | `@` | `mail2.epocanvas.com` | 20 |

### 2. SPF Record
Prevent domain spoofing by restricting authorized sending hosts:

```text
v=spf1 include:_spf.epocanvas.com ~all
```

### 3. DKIM Public Key Record
Publish your RSA-2048 or Ed25519 signing key at selector `epomail._domainkey`:

```text
v=DKIM1; k=ed25519; p=MCowBQYDK2VwAyEAGbJ9k8i...
```

### 4. DMARC Policy Record
Enforce reject or quarantine policies on unverified origins at `_dmarc`:

```text
v=DMARC1; p=quarantine; rua=mailto:dmarc-reports@epocanvas.com; pct=100; adkim=s; aspf=s
```

## Step 2: Client Setup & Key Initialization

1. Download the EpoMail client for your operating system.
2. Launch the key setup wizard and select **Generate New Master Identity**.
3. Safely back up your 24-word cryptographic seed phrase offline.
4. Export your public key to EpoMail Key Directory to start receiving encrypted emails immediately.
