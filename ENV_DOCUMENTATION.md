# Environment Variable Documentation

## Overview

All sensitive configuration is externalized to environment variables. This follows the **12-Factor App** methodology and is the standard approach used at Amazon, Google, and Netflix.

## Quick Start

```bash
# 1. Copy the example file
cp .env.example .env

# 2. Edit with your values
nano .env

# 3. Start the stack
docker compose up -d
```

## Variable Reference

### Database

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DB_URL` | Prod only | `jdbc:mysql://localhost:3306/scholarship_db?createDatabaseIfNotExist=true` | JDBC connection URL |
| `DB_USERNAME` | Yes | `root` (dev) | MySQL username |
| `DB_PASSWORD` | Yes | *(dev default)* | MySQL password |
| `DB_ROOT_PASSWORD` | Docker only | — | MySQL root password for container init |

### JWT Authentication

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `JWT_SECRET` | **Yes (prod)** | Dev-only default | HMAC-SHA256 signing key. **Must be ≥32 characters** |
| `JWT_EXPIRATION_MS` | No | `86400000` (24h) | Token expiration in milliseconds |

> ⚠️ **Security**: In production, generate a cryptographically secure random secret:
> ```bash
> openssl rand -base64 48
> ```

### Email (SMTP)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `EMAIL_ENABLED` | No | `true` | Enable/disable email sending |
| `SMTP_HOST` | No | `smtp.gmail.com` | SMTP server hostname |
| `SMTP_PORT` | No | `587` | SMTP server port (TLS) |
| `SMTP_FROM` | Prod only | *(dev default)* | Sender email address |
| `SMTP_USERNAME` | Prod only | *(dev default)* | SMTP auth username |
| `SMTP_PASSWORD` | **Yes (prod)** | *(dev default)* | SMTP auth password / app password |

### Redis

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `REDIS_HOST` | No | `localhost` / `redis` (Docker) | Redis server hostname |
| `REDIS_PORT` | No | `6379` | Redis server port |
| `REDIS_PASSWORD` | No | *(empty)* | Redis AUTH password |

### Kafka

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `KAFKA_BOOTSTRAP_SERVERS` | No | `localhost:9092` / `kafka:29092` (Docker) | Kafka broker address(es) |

### Application

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `SPRING_PROFILES_ACTIVE` | No | *(none)* | Set to `prod` for production |
| `CORS_ORIGINS` | No | `http://localhost:3000` | Allowed CORS origins (comma-separated) |
| `UPLOAD_DIR` | No | `uploads/documents` | File upload directory |
| `LOG_FILE` | No | `logs/scholarship-app.log` | Log file path |

## Profile-Based Configuration

| Profile | Usage | Secrets |
|---------|-------|---------|
| *(default)* | Local development (`mvn spring-boot:run`) | Has dev defaults, embedded Kafka/Redis |
| `prod` | Production / Docker | **All secrets required via env vars** |

## Security Best Practices

1. **Never commit `.env` files** — they are in `.gitignore`
2. **Rotate JWT secrets** regularly in production
3. **Use app-specific passwords** for Gmail SMTP
4. **Use strong database passwords** (min 16 characters, mixed case + symbols)
5. **In production**, use a secret manager (AWS Secrets Manager, Vault) instead of env vars
