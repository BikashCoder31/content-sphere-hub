import { z } from 'zod';

/**
 * Environment variable validation schema
 */
const envSchema = z.object({
  // App
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().positive().default(5000),
  API_VERSION: z.string().default('v1'),
  APP_NAME: z.string().default('Content Sphere Hub'),
  APP_URL: z.string().url().default('http://localhost:5173'),
  PUBLIC_API_URL: z.string().url().optional(),

  // Database
  MONGODB_URI: z.string().default('mongodb://localhost:27017/content-sphere-hub'),
  MONGODB_DB_NAME: z.string().default('content-sphere-hub'),

  // Redis
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.coerce.number().positive().default(6379),
  REDIS_PASSWORD: z.string().optional(),

  // JWT
  JWT_ACCESS_SECRET: z.string().min(32).default('dev-access-secret-change-in-production-min32'),
  JWT_REFRESH_SECRET: z.string().min(32).default('dev-refresh-secret-change-in-production-min32'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  JWT_ISSUER: z.string().default('content-sphere-hub'),
  JWT_AUDIENCE: z.string().default('content-sphere-hub-api'),

  // Security
  BCRYPT_ROUNDS: z.coerce.number().min(10).max(15).default(12),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().positive().default(900000),
  RATE_LIMIT_MAX: z.coerce.number().positive().default(100),
  CORS_ORIGINS: z.string().default('http://localhost:5173'),

  // Uploads
  UPLOAD_PROVIDER: z.enum(['local', 'cloudinary', 's3']).default('local'),
  UPLOAD_LOCAL_PATH: z.string().default('./uploads'),
  UPLOAD_MAX_IMAGE_SIZE: z.coerce.number().positive().default(10485760),
  UPLOAD_MAX_DOCUMENT_SIZE: z.coerce.number().positive().default(26214400),
  UPLOAD_MAX_VIDEO_SIZE: z.coerce.number().positive().default(104857600),

  // Features
  FEATURE_ENABLE_REGISTRATION: z
    .string()
    .transform((v) => v !== 'false')
    .default('true'),
  FEATURE_ENABLE_COMMENTS: z
    .string()
    .transform((v) => v !== 'false')
    .default('true'),
  FEATURE_ENABLE_NEWSLETTER: z
    .string()
    .transform((v) => v === 'true')
    .default('false'),

  // Logging
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
  LOG_FORMAT: z.enum(['pretty', 'json']).default('pretty'),
});

/**
 * Parse and validate environment variables
 */
function parseEnv() {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error('❌ Invalid environment variables:');
    console.error(result.error.format());
    throw new Error('Environment validation failed');
  }

  return result.data;
}

// Parse once at startup
const env = parseEnv();

/**
 * Typed configuration object
 */
export const config = {
  // App
  env: env.NODE_ENV,
  port: env.PORT,
  apiVersion: env.API_VERSION,
  appName: env.APP_NAME,
  appUrl: env.APP_URL,
  publicApiUrl: env.PUBLIC_API_URL?.replace(/\/$/, ''),
  isDev: env.NODE_ENV === 'development',
  isProd: env.NODE_ENV === 'production',
  isTest: env.NODE_ENV === 'test',

  // Database
  mongodb: {
    uri: env.MONGODB_URI,
    dbName: env.MONGODB_DB_NAME,
  },

  // Redis
  redis: {
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
    password: env.REDIS_PASSWORD,
  },

  // JWT
  jwt: {
    accessSecret: env.JWT_ACCESS_SECRET,
    refreshSecret: env.JWT_REFRESH_SECRET,
    accessExpiresIn: env.JWT_ACCESS_EXPIRES_IN,
    refreshExpiresIn: env.JWT_REFRESH_EXPIRES_IN,
    issuer: env.JWT_ISSUER,
    audience: env.JWT_AUDIENCE,
  },

  // Security
  security: {
    bcryptRounds: env.BCRYPT_ROUNDS,
    rateLimitWindowMs: env.RATE_LIMIT_WINDOW_MS,
    rateLimitMax: env.RATE_LIMIT_MAX,
    corsOrigins: env.CORS_ORIGINS.split(',').map((o) => o.trim()),
  },

  // Uploads
  upload: {
    provider: env.UPLOAD_PROVIDER,
    localPath: env.UPLOAD_LOCAL_PATH,
    maxImageSize: env.UPLOAD_MAX_IMAGE_SIZE,
    maxDocumentSize: env.UPLOAD_MAX_DOCUMENT_SIZE,
    maxVideoSize: env.UPLOAD_MAX_VIDEO_SIZE,
  },

  // Feature flags
  features: {
    enableRegistration: env.FEATURE_ENABLE_REGISTRATION,
    enableComments: env.FEATURE_ENABLE_COMMENTS,
    enableNewsletter: env.FEATURE_ENABLE_NEWSLETTER,
  },

  // Logging
  logging: {
    level: env.LOG_LEVEL,
    format: env.LOG_FORMAT,
  },
} as const;

/**
 * Validate production-specific requirements
 */
export function validateProductionConfig(): void {
  if (config.isProd) {
    const warnings: string[] = [];
    const errors: string[] = [];

    // Check for development secrets in production
    if (config.jwt.accessSecret.includes('dev-')) {
      errors.push('JWT_ACCESS_SECRET contains development value');
    }
    if (config.jwt.refreshSecret.includes('dev-')) {
      errors.push('JWT_REFRESH_SECRET contains development value');
    }

    // Check MongoDB
    if (config.mongodb.uri.includes('localhost')) {
      warnings.push('MONGODB_URI points to localhost in production');
    }

    // Log warnings
    warnings.forEach((w) => console.warn(`⚠️  WARNING: ${w}`));

    // Throw on errors
    if (errors.length > 0) {
      console.error('❌ Production configuration errors:');
      errors.forEach((e) => console.error(`   - ${e}`));
      throw new Error('Production configuration validation failed');
    }
  }
}

export type Config = typeof config;
export { envSchema };
