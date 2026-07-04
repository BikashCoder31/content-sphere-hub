import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env file from project root
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

/**
 * Environment configuration with type safety and defaults
 */
export const config = {
  // App
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  apiVersion: process.env.API_VERSION || 'v1',
  appName: process.env.APP_NAME || 'Content Sphere Hub',
  appUrl: process.env.APP_URL || 'http://localhost:5173',

  // Database
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/content-sphere-hub',
    dbName: process.env.MONGODB_DB_NAME || 'content-sphere-hub',
  },

  // Redis
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
  },

  // JWT
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'dev-access-secret-change-in-production',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-change-in-production',
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    issuer: process.env.JWT_ISSUER || 'content-sphere-hub',
    audience: process.env.JWT_AUDIENCE || 'content-sphere-hub-api',
  },

  // Security
  security: {
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12', 10),
    rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 min
    rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
    corsOrigins: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:5173'],
  },

  // Uploads
  upload: {
    provider: process.env.UPLOAD_PROVIDER || 'local',
    localPath: process.env.UPLOAD_LOCAL_PATH || './uploads',
    maxImageSize: parseInt(process.env.UPLOAD_MAX_IMAGE_SIZE || '10485760', 10), // 10MB
    maxDocumentSize: parseInt(process.env.UPLOAD_MAX_DOCUMENT_SIZE || '26214400', 10), // 25MB
    maxVideoSize: parseInt(process.env.UPLOAD_MAX_VIDEO_SIZE || '104857600', 10), // 100MB
    allowedImageTypes: process.env.UPLOAD_ALLOWED_IMAGE_TYPES?.split(',') || [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
    ],
    allowedDocTypes: process.env.UPLOAD_ALLOWED_DOC_TYPES?.split(',') || ['application/pdf'],
  },

  // Feature flags
  features: {
    enableRegistration: process.env.FEATURE_ENABLE_REGISTRATION !== 'false',
    enableComments: process.env.FEATURE_ENABLE_COMMENTS !== 'false',
    enableNewsletter: process.env.FEATURE_ENABLE_NEWSLETTER === 'true',
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'pretty',
  },
} as const;

/**
 * Validate required configuration in production
 */
export function validateConfig(): void {
  if (config.env === 'production') {
    const required = ['JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET', 'MONGODB_URI'];

    const missing = required.filter((key) => !process.env[key]);

    if (missing.length > 0) {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }

    // Warn about default secrets
    if (config.jwt.accessSecret.includes('dev-')) {
      console.warn('WARNING: Using development JWT secrets in production!');
    }
  }
}

export type Config = typeof config;
