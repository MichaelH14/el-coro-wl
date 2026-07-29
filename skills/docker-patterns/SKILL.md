---
name: docker-patterns
description: Use when writing Dockerfiles, configuring docker-compose, managing volumes, or optimizing Docker builds and health checks
---

# Docker Patterns

Efficient, secure Docker usage. Multi-stage builds, proper compose setup, volume management.

## Preconditions

- Docker and Docker Compose installed on target machine
- Dockerfile exists or needs to be created
- Application builds and runs locally

## Steps

### 1. Multi-Stage Build

Always use multi-stage to keep images small:

```dockerfile
# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Production
FROM node:20-alpine AS production
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
USER node
EXPOSE 3000
CMD ["node", "dist/index.js"]
```

Key rules:
- `npm ci` not `npm install` (deterministic)
- Copy package.json first (layer caching for dependencies)
- Run as non-root user (`USER node`)
- Use alpine base images

### 2. Docker Compose

```yaml
services:
  app:
    build: .
    ports:
      - "${PORT:-3000}:3000"
    env_file: .env
    depends_on:
      db:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    restart: unless-stopped

  db:
    image: postgres:16-alpine
    volumes:
      - pgdata:/var/lib/postgresql/data
    environment:
      POSTGRES_DB: ${DB_NAME}
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER}"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  pgdata:
```

### 3. Volume Management

- Named volumes for persistent data (databases, uploads)
- Bind mounts only for development (live reload)
- NEVER store application state in container filesystem
- Backup named volumes before destructive operations

### 4. Environment Variables

- Use `.env` file with `env_file:` in compose (never hardcode)
- `.env` in `.gitignore` always
- Provide `.env.example` with placeholder values
- Validate required env vars at application startup

### 5. Health Checks

Every service needs a health check:
- HTTP services: `curl -f http://localhost:PORT/health`
- Database: `pg_isready` or equivalent
- Worker: check PID file or process existence
- `depends_on` with `condition: service_healthy` for startup ordering

### 6. Layer Caching

Order Dockerfile instructions from least to most frequently changing:
1. Base image (rarely changes)
2. System dependencies (occasionally changes)
3. Package files and `npm ci` (changes on dependency update)
4. Application code (changes every deploy)

## Verification / Exit Criteria

- Multi-stage build produces image < 200MB (for Node.js apps)
- Container runs as non-root user
- Health checks defined for all services
- No secrets hardcoded in Dockerfile or compose
- Volumes used for persistent data
- Layer caching effective (dependency install cached when code-only changes)
