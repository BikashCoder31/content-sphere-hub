# Content Sphere Hub - Security Guide

> **Purpose:** Security best practices and implementation guidelines  
> **Version:** 1.0  
> **Created:** July 4, 2026

---

## 1. Authentication Security

### 1.1 Password Handling

**Rules:**
- ✅ Never store plain-text passwords
- ✅ Use bcrypt with minimum 12 rounds
- ✅ Store as `passwordHash`, not `password`
- ✅ Validate password strength on registration

**Implementation:**
```typescript
import bcrypt from 'bcrypt';

const BCRYPT_ROUNDS = 12;

// Hashing
const passwordHash = await bcrypt.hash(plainPassword, BCRYPT_ROUNDS);

// Verification
const isValid = await bcrypt.compare(plainPassword, passwordHash);
```

**Password Requirements:**
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

### 1.2 JWT Token Security

**Access Tokens:**
- Short-lived: 15 minutes default
- Stored in memory (not localStorage)
- Sent via Authorization header

**Refresh Tokens:**
- Longer-lived: 7 days default
- Stored as hash in database (never raw)
- Sent via httpOnly cookie
- Rotated on each use

**Implementation:**
```typescript
// Store only the hash of refresh token
const refreshTokenHash = await bcrypt.hash(refreshToken, 10);

// On token refresh, verify hash
const isValid = await bcrypt.compare(providedToken, storedHash);
```

### 1.3 Session Security

**Session Token Storage:**
```typescript
sessions: [{
  sessionId: string;        // UUID
  refreshTokenHash: string; // Hashed, never raw
  device: string;
  ip: string;
  userAgent: string;
  lastActive: Date;
  expiresAt: Date;
  revokedAt?: Date;
}]
```

**Security Measures:**
- ✅ Store only hashed tokens
- ✅ Track IP and device for anomaly detection
- ✅ Expire sessions automatically
- ✅ Allow users to revoke sessions
- ✅ Limit concurrent sessions (optional)

### 1.4 Rate Limiting

**Auth Endpoints (Strict):**
- 10 requests per 15-minute window
- Per IP address
- Block for 15 minutes after exceeded

**General API (Normal):**
- 100 requests per 15-minute window
- Per authenticated user

**Implementation:**
```typescript
import rateLimit from 'express-rate-limit';

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: 'Too many requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/v1/auth', authLimiter);
```

### 1.5 Account Lockout

**Implementation:**
- Lock account after 5 failed login attempts
- Lock duration: 30 minutes
- Track in user model:
  ```typescript
  failedLoginAttempts: number;
  lockedUntil?: Date;
  ```

---

## 2. File Upload Security

### 2.1 MIME Type Validation

**Required for MVP:**
```typescript
const ALLOWED_TYPES = {
  images: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  documents: ['application/pdf'],
  videos: ['video/mp4', 'video/webm'],
  audio: ['audio/mpeg', 'audio/wav'],
};
```

### 2.2 Magic Byte Validation

**Required for MVP:** Validate actual file content, not just extension or declared MIME type.

```typescript
import { fileTypeFromBuffer } from 'file-type';

async function validateFile(buffer: Buffer, declaredMimeType: string) {
  const detected = await fileTypeFromBuffer(buffer);
  
  if (!detected) {
    throw new Error('Could not detect file type');
  }
  
  if (detected.mime !== declaredMimeType) {
    throw new Error('File type mismatch');
  }
  
  if (!ALLOWED_TYPES.flat().includes(detected.mime)) {
    throw new Error('File type not allowed');
  }
  
  return detected;
}
```

### 2.3 File Size Limits

| File Type | Max Size |
|-----------|----------|
| Images | 10 MB |
| Documents | 25 MB |
| Videos | 100 MB |
| Audio | 50 MB |

### 2.4 Filename Sanitization

```typescript
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

function sanitizeFilename(originalName: string): string {
  const ext = path.extname(originalName).toLowerCase();
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf', '.mp4'];
  
  if (!allowedExtensions.includes(ext)) {
    throw new Error('Extension not allowed');
  }
  
  return `${uuidv4()}${ext}`;
}
```

### 2.5 Upload Directory Security

- Store uploads outside web root
- Serve via dedicated route with access control
- Never execute uploaded files
- Scan for malware (production recommendation)

---

## 3. Input Validation & Sanitization

### 3.1 Request Validation (Zod)

**All inputs must be validated:**
```typescript
import { z } from 'zod';

const createContentSchema = z.object({
  title: z.string().min(1).max(200),
  slug: z.string().regex(/^[a-z0-9-]+$/).max(200),
  bodyJson: z.object({}).passthrough(), // TipTap JSONContent
  status: z.enum(['draft', 'pending_review', 'published']),
});
```

### 3.2 HTML Sanitization

**TipTap content must be sanitized before storage:**

```typescript
import sanitizeHtml from 'sanitize-html';

const sanitizeOptions = {
  allowedTags: [
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'p', 'br', 'hr',
    'ul', 'ol', 'li',
    'blockquote', 'pre', 'code',
    'a', 'img',
    'strong', 'em', 'u', 's',
    'table', 'thead', 'tbody', 'tr', 'th', 'td',
  ],
  allowedAttributes: {
    'a': ['href', 'title', 'target', 'rel'],
    'img': ['src', 'alt', 'title', 'width', 'height'],
    'code': ['class'],
    'pre': ['class'],
  },
  allowedSchemes: ['http', 'https', 'mailto'],
};

const sanitizedHtml = sanitizeHtml(rawHtml, sanitizeOptions);
```

### 3.3 NoSQL Injection Prevention

- Always use Mongoose methods with proper query building
- Never interpolate user input directly into queries
- Use parameterized queries

```typescript
// ✅ Safe
await User.findOne({ email: userInput });

// ❌ Unsafe - never do this
await User.findOne({ $where: `this.email === '${userInput}'` });
```

---

## 4. API Security

### 4.1 Security Headers (Helmet)

```typescript
import helmet from 'helmet';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
    },
  },
  crossOriginEmbedderPolicy: true,
  crossOriginOpenerPolicy: true,
  crossOriginResourcePolicy: { policy: "same-site" },
  dnsPrefetchControl: true,
  frameguard: { action: "deny" },
  hidePoweredBy: true,
  hsts: true,
  ieNoOpen: true,
  noSniff: true,
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  xssFilter: true,
}));
```

### 4.2 CORS Configuration

```typescript
import cors from 'cors';

const corsOptions = {
  origin: process.env.CORS_ORIGIN?.split(',') || [],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['X-Total-Count'],
  maxAge: 86400, // 24 hours
};

app.use(cors(corsOptions));
```

### 4.3 API Versioning

- Always prefix routes with version: `/api/v1/`
- Never break existing versions
- Deprecate old versions with notice

---

## 5. Database Security

### 5.1 Connection Security

```typescript
const mongoOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  // In production, add:
  ssl: true,
  sslValidate: true,
  retryWrites: true,
  w: 'majority',
};
```

### 5.2 Field-Level Security

- Never return `passwordHash` in API responses
- Never return token hashes in API responses
- Use projection to limit returned fields

```typescript
// User projection - exclude sensitive fields
const safeUserProjection = {
  passwordHash: 0,
  'sessions.refreshTokenHash': 0,
  verificationTokenHash: 0,
  passwordResetTokenHash: 0,
  'twoFactor.secret': 0,
  'twoFactor.backupCodesHash': 0,
};

const user = await User.findById(id, safeUserProjection);
```

### 5.3 Audit Logging

Log these events:
- User login/logout
- Password changes
- Role/permission changes
- Content publish/unpublish
- Settings changes
- Failed login attempts
- Access to admin functions

```typescript
interface AuditLog {
  userId: ObjectId;
  action: string;
  resource: string;
  resourceId?: ObjectId;
  details?: Record<string, unknown>;
  ip: string;
  userAgent: string;
  timestamp: Date;
}
```

---

## 6. Environment Security

### 6.1 Secrets Management

- ✅ Never commit `.env` files
- ✅ Use different secrets per environment
- ✅ Rotate secrets periodically
- ✅ Use 32+ character random strings
- ✅ Consider secrets manager in production

### 6.2 Environment Validation

```typescript
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'staging', 'production']),
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  MONGODB_URI: z.string().url(),
  // ... other required vars
});

// Validate on startup - fail fast if invalid
const env = envSchema.parse(process.env);
```

---

## 7. Security Checklist

### Pre-Deployment

- [ ] All secrets are properly generated (32+ chars)
- [ ] Environment variables are validated
- [ ] CORS is properly configured
- [ ] Rate limiting is enabled
- [ ] Helmet security headers are enabled
- [ ] All user input is validated (Zod)
- [ ] HTML is sanitized
- [ ] File uploads validate MIME + magic bytes
- [ ] Passwords are hashed (bcrypt, 12 rounds)
- [ ] Tokens are stored hashed
- [ ] Sensitive fields excluded from API responses
- [ ] Audit logging is enabled
- [ ] Error messages don't leak sensitive info
- [ ] Debug mode is disabled in production

### Ongoing

- [ ] Monitor for failed login attempts
- [ ] Review audit logs regularly
- [ ] Update dependencies for security patches
- [ ] Rotate secrets periodically
- [ ] Test for common vulnerabilities

---

## 8. Incident Response

### Suspected Compromise

1. **Immediate:** Revoke all active sessions
2. **Immediate:** Rotate all secrets
3. **Immediate:** Review audit logs
4. **Short-term:** Force password reset for affected users
5. **Short-term:** Review and patch vulnerability
6. **Long-term:** Post-incident review and documentation

### Data Breach

1. Document scope of breach
2. Notify affected users
3. Report to relevant authorities (GDPR, etc.)
4. Implement additional safeguards

---

*Security Guide Version: 1.0*  
*Created: July 4, 2026*
