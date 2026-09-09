---
title: EpoCanvas Chat Deployment
description: Production self-hosting and cluster deployment guide for EpoCanvas Chat.
sidebar:
  order: 2
---

This guide covers production deployment of the EpoCanvas Chat Synapse relay and media streaming gateway.

## Prerequisites

- Linux host running Ubuntu 22.04 LTS / Debian 12 / Rocky Linux 9
- 2 vCPU, 4GB RAM minimum (8GB recommended for >500 active users)
- Docker 24.0+ and Docker Compose v2
- Fully qualified domain name (FQDN) pointing to host IP
- Valid TLS certificate (Let's Encrypt automated via Caddy or Traefik)

## Quick Start via Docker Compose

Create a dedicated directory and `docker-compose.yml`:

```yaml
version: '3.8'

services:
  epocanvas-relay:
    image: ghcr.io/shijianus/epocanvas-synapse:latest
    container_name: epocanvas-relay
    restart: unless-stopped
    ports:
      - "8448:8448"
      - "8008:8008"
    environment:
      - SYNAPSE_SERVER_NAME=chat.epocanvas.com
      - SYNAPSE_REPORT_STATS=no
      - SYNAPSE_CONFIG_PATH=/data/homeserver.yaml
    volumes:
      - ./data:/data
    networks:
      - epocanvas-net

  epocanvas-db:
    image: postgres:16-alpine
    container_name: epocanvas-db
    restart: unless-stopped
    environment:
      - POSTGRES_DB=synapse
      - POSTGRES_USER=synapse_user
      - POSTGRES_PASSWORD=replace_with_strong_secret
    volumes:
      - ./postgres_data:/var/lib/postgresql/data
    networks:
      - epocanvas-net

networks:
  epocanvas-net:
    driver: bridge
```

## Initializing Configuration

Generate the default cluster secrets and homeserver configuration:

```bash
docker compose run --rm -e SYNAPSE_SERVER_NAME=chat.epocanvas.com \
  -e SYNAPSE_REPORT_STATS=no epocanvas-relay generate
```

Start the stack:

```bash
docker compose up -d
```

Verify service health:

```bash
curl -i http://localhost:8008/_matrix/client/versions
```
