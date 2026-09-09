---
title: "ECCP Handshake Specification (ECCP-HS)"
description: Cryptographic handshake and session derivation protocol for ECCP.
sidebar:
  order: 2
---

The ECCP handshake operates as a 3-way authenticated key exchange (AKE) establishing mutually authenticated, quantum-resistant session keys.

## 1. Handshake State Machine

```text
 Client (Initiator)                           Server / Peer (Responder)
   ------------------                           -------------------------
   Ephemeral P-256/X25519 PK (e_c)
   ML-KEM Encapsulation Context (k_c)
   Client Hello [ECCP_MAGIC, CipherSuites]
                       ------------------------>
                                                Ephemeral P-256/X25519 PK (e_s)
                                                ML-KEM Decapsulated Secret (ct_s)
                                                Server Hello + Encrypted Certificate
                       <------------------------
   Finished + Auth Token
                       ------------------------>
   [ Secure Ratchet Session Established ]       [ Secure Ratchet Session Established ]
```

## 2. Key Derivation Function (KDF)

Upon exchange of ephemeral keying material, both endpoints compute the Master Shared Secret ($SS$) via dual-layer HKDF-SHA512:

$$SS = \text{HKDF-Extract}(\text{Salt}, ECDH(e_c, e_s) \mathbin{\Vert} \text{ML-KEM-Decap}(k_c, ct_s))$$

From $SS$, four distinct unidirectional keys are derived:

- $K_{c2s\_enc}$: Client-to-Server ChaCha20-Poly1305 encryption key (256-bit)
- $K_{c2s\_mac}$: Client-to-Server BLAKE3 integrity check key (256-bit)
- $K_{s2c\_enc}$: Server-to-Client ChaCha20-Poly1305 encryption key (256-bit)
- $K_{s2c\_mac}$: Server-to-Client BLAKE3 integrity check key (256-bit)

## 3. Session Renegotiation & Rekeying

To maintain Forward Secrecy across prolonged connections:
- A new ephemeral DH key is injected every $2^{16}$ packets or every 60 minutes.
- Old packet keys are immediately shredded from volatile memory using secure zeroing (`memset_s` / `sodium_memzero`).
