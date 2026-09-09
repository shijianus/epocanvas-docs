---
title: ECCP Protocol Specification Overview
description: High-level overview and design goals of the EpoCanvas Cryptographic Protocol (ECCP).
sidebar:
  order: 1
  badge:
    text: RFC-Style
    variant: caution
---

**Status**: Standards Track  
**Category**: Cryptographic Protocols  
**Author**: EpoCanvas Architecture Board  
**Version**: 1.0.0-draft  

## Abstract

This document defines the **EpoCanvas Cryptographic Protocol (ECCP)**, an application-layer transport protocol designed to provide authenticated, forward-secret, and quantum-resistant communications across asynchronous and synchronous network topographies.

## Design Principles

- **Zero Implicit Trust**: Every packet header and payload chunk is cryptographically bound to the ephemeral session context.
- **Deniability**: ECCP provides message deniability (plausible deniability) after session teardown, similar to the Signal Protocol.
- **Traffic Padding & Shaping**: Constant-rate packet dummy generation to obfuscate metadata packet size and frequency analysis.
- **Post-Quantum Forward Secrecy**: Hybrid KEM (Key Encapsulation Mechanism) incorporating ML-KEM-768 alongside X25519.

## Table of Specifications

1. [Handshake Specification (ECCP-HS)](/eccp/handshake-spec/): Ephemeral key establishment, certificate exchange, and ratchet session generation.
2. Packet Framing & Serialization: Binary schema for multiplexed streams and control channels (Upcoming RFC 102).
3. Post-Quantum KEM Negotiation: Cipher suite agility and parameter boundaries (Upcoming RFC 103).
