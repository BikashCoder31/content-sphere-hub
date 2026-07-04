# Content Sphere Hub - Environment Variables

> **Purpose:** Complete reference for all environment variables  
> **Version:** 1.0  
> **Created:** July 4, 2026

---

## Overview

Environment variables are organized by category. All variables with `*` are **required** for the application to start.

---

## Application

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NODE_ENV` | * | - | Environment: `development`, `staging`, `production` |
| `APP_NAME` | | `Content Sphere Hub` | Application display name |
| `APP_URL` | * | - | Frontend URL (e.g., `http://localhost:5173`) |
| `API_URL` | * | - | Backend API URL (e.g., `http://localhost:5000`) |
| `PORT` | | `5000` | Backend server port |
| `LOG_LEVEL` | | `info` | Logging level: `debug`, `info`, `warn`, `error` |

---

## Database

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `MONGODB_URI` | * | - | MongoDB connection string |

**Development:**
```
MONGODB_URI=mongodb://127.0.0.1:27017/content_sphere_hub
```

**Production (Atlas):**
```
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/content_sphere_hub
```

---

## Authentication

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `JWT_ACCESS_SECRET` | * | - | Secret for signing access tokens (min 32 chars) |
| `JWT_REFRESH_SECRET` | * | - | Secret for signing refresh tokens (min 32 chars) |
| `ACCESS_TOKEN_EXPIRES_IN` | | `15m` | Access token expiry (e.g., `15m`, `1h`) |
| `REFRESH_TOKEN_EXPIRES_IN` | | `7d` | Refresh token expiry (e.g., `7d`, `30d`) |
| `COOKIE_SECRET` | * | - | Secret for signing cookies |
| `SESSION_SECRET` | * | - | Secret for session management |

**Security Notes:**
- Use cryptographically random strings (32+ characters)
- Never reuse secrets between environments
- Rotate secrets periodically in production

---

## Admin

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `ADMIN_EMAIL` | | - | Default admin email for seeding |
| `ADMIN_PASSWORD` | | - | Default admin password for seeding (dev only) |
| `ADMIN_IP_ALLOWLIST` | | - | Comma-separated IPs for admin access |

---

## Redis

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `REDIS_URL` | | `redis://localhost:6379` | Redis connection URL |
| `REDIS_PASSWORD` | | - | Redis password (if authentication enabled) |

---

## Storage

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `STORAGE_PROVIDER` | | `local` | Storage provider: `local`, `cloudinary`, `s3` |
| `LOCAL_UPLOAD_DIR` | | `uploads` | Local upload directory path |
| `PUBLIC_UPLOAD_URL` | | `http://localhost:5000/uploads` | Public URL for uploaded files |
| `MAX_UPLOAD_SIZE_MB` | | `25` | Maximum file upload size in MB |

### Allowed File Types

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `ALLOWED_IMAGE_TYPES` | | `image/jpeg,image/png,image/gif,image/webp` | Allowed image MIME types |
| `ALLOWED_DOCUMENT_TYPES` | | `application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document` | Allowed document MIME types |
| `ALLOWED_VIDEO_TYPES` | | `video/mp4,video/webm` | Allowed video MIME types |
| `ALLOWED_AUDIO_TYPES` | | `audio/mpeg,audio/wav,audio/ogg` | Allowed audio MIME types |

### Cloudinary (Phase 3)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `CLOUDINARY_CLOUD_NAME` | | - | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | | - | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | | - | Cloudinary API secret |

### S3-Compatible Storage (Phase 3)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `S3_ENDPOINT` | | - | S3 endpoint URL |
| `S3_BUCKET` | | - | S3 bucket name |
| `S3_REGION` | | - | S3 region |
| `S3_ACCESS_KEY_ID` | | - | S3 access key |
| `S3_SECRET_ACCESS_KEY` | | - | S3 secret key |
| `S3_FORCE_PATH_STYLE` | | `false` | Use path-style URLs |

---

## Email

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `EMAIL_PROVIDER` | | `test` | Email provider: `test`, `smtp`, `sendgrid`, `ses` |
| `EMAIL_FROM` | | `noreply@example.com` | Default from email address |
| `EMAIL_FROM_NAME` | | `Content Sphere Hub` | Default from name |

### SMTP

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `SMTP_HOST` | | - | SMTP server hostname |
| `SMTP_PORT` | | `587` | SMTP server port |
| `SMTP_USER` | | - | SMTP username |
| `SMTP_PASS` | | - | SMTP password |
| `SMTP_SECURE` | | `false` | Use TLS |

### SendGrid (Phase 2+)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `SENDGRID_API_KEY` | | - | SendGrid API key |

### AWS SES (Phase 3+)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `AWS_SES_REGION` | | - | AWS SES region |
| `AWS_ACCESS_KEY_ID` | | - | AWS access key |
| `AWS_SECRET_ACCESS_KEY` | | - | AWS secret key |

---

## OAuth (Phase 2+)

### Google

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `GOOGLE_CLIENT_ID` | | - | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | | - | Google OAuth client secret |
| `GOOGLE_CALLBACK_URL` | | `/api/v1/auth/google/callback` | Google OAuth callback URL |

### GitHub

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `GITHUB_CLIENT_ID` | | - | GitHub OAuth client ID |
| `GITHUB_CLIENT_SECRET` | | - | GitHub OAuth client secret |
| `GITHUB_CALLBACK_URL` | | `/api/v1/auth/github/callback` | GitHub OAuth callback URL |

### Facebook (Phase 3+)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `FACEBOOK_CLIENT_ID` | | - | Facebook OAuth client ID |
| `FACEBOOK_CLIENT_SECRET` | | - | Facebook OAuth client secret |
| `FACEBOOK_CALLBACK_URL` | | `/api/v1/auth/facebook/callback` | Facebook OAuth callback URL |

---

## Search

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `SEARCH_PROVIDER` | | `mongodb` | Search provider: `mongodb`, `elasticsearch`, `atlas` |

### Elasticsearch (Phase 3+)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `ELASTICSEARCH_URL` | | - | Elasticsearch URL |
| `ELASTICSEARCH_USERNAME` | | - | Elasticsearch username |
| `ELASTICSEARCH_PASSWORD` | | - | Elasticsearch password |

### Atlas Search (Phase 3+)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `ATLAS_SEARCH_INDEX` | | - | Atlas Search index name |

---

## Security

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `CORS_ORIGIN` | | `*` | CORS allowed origins (comma-separated) |
| `RATE_LIMIT_WINDOW_MS` | | `900000` | Rate limit window in ms (15 min) |
| `RATE_LIMIT_MAX` | | `100` | Max requests per window |
| `AUTH_RATE_LIMIT_MAX` | | `10` | Max auth requests per window |
| `BCRYPT_ROUNDS` | | `12` | bcrypt hashing rounds |

---

## AI (Optional - Phase 4)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `AI_PROVIDER` | | `none` | AI provider: `none`, `openai`, `anthropic`, `local` |
| `OPENAI_API_KEY` | | - | OpenAI API key |
| `ANTHROPIC_API_KEY` | | - | Anthropic API key |
| `LOCAL_AI_BASE_URL` | | - | Local AI server URL |

---

## Queue (BullMQ)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `QUEUE_PREFIX` | | `csh` | Queue name prefix |
| `JOB_ATTEMPTS` | | `3` | Default job retry attempts |
| `JOB_BACKOFF_DELAY` | | `5000` | Backoff delay between retries (ms) |

---

## Backup (Phase 3+)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `BACKUP_PROVIDER` | | `local` | Backup provider: `local`, `s3`, `gcs` |
| `BACKUP_ENCRYPTION_KEY` | | - | Encryption key for backups |
| `BACKUP_RETENTION_DAYS` | | `30` | Days to retain backups |

---

## Feature Flags

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `ENABLE_REGISTRATION` | | `true` | Allow public registration |
| `ENABLE_COMMENTS` | | `true` | Enable comment system |
| `ENABLE_NEWSLETTER` | | `false` | Enable newsletter features |
| `MAINTENANCE_MODE` | | `false` | Enable maintenance mode |

---

## Development vs Production

### Minimum Development Configuration

```env
NODE_ENV=development
APP_URL=http://localhost:5173
API_URL=http://localhost:5000
PORT=5000

MONGODB_URI=mongodb://127.0.0.1:27017/content_sphere_hub

JWT_ACCESS_SECRET=dev_access_secret_min_32_characters_here
JWT_REFRESH_SECRET=dev_refresh_secret_min_32_characters_here
COOKIE_SECRET=dev_cookie_secret_min_32_characters
SESSION_SECRET=dev_session_secret_min_32_characters

REDIS_URL=redis://localhost:6379

STORAGE_PROVIDER=local
EMAIL_PROVIDER=test

CORS_ORIGIN=http://localhost:5173
```

### Production Requirements

All development variables plus:
- Use secure, randomly generated secrets
- Set proper CORS origins
- Configure email provider (SendGrid/SES)
- Configure proper storage (Cloudinary/S3)
- Set `ADMIN_IP_ALLOWLIST` for admin security
- Use MongoDB Atlas or secured MongoDB instance

---

## Generating Secrets

Use this command to generate secure random secrets:

```bash
# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# OpenSSL
openssl rand -hex 32
```

---

*Environment Variables Document Version: 1.0*  
*Created: July 4, 2026*
