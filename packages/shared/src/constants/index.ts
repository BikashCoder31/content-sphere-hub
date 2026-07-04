export * from './permissions.js';
export * from './roles.js';

/**
 * Content status values
 */
export const CONTENT_STATUS = {
  DRAFT: 'draft',
  PENDING_REVIEW: 'pending_review',
  IN_REVIEW: 'in_review',
  CHANGES_REQUESTED: 'changes_requested',
  APPROVED: 'approved',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
  TRASH: 'trash',
} as const;

export type ContentStatus = (typeof CONTENT_STATUS)[keyof typeof CONTENT_STATUS];

/**
 * Content visibility values
 */
export const CONTENT_VISIBILITY = {
  PUBLIC: 'public',
  PRIVATE: 'private',
  PASSWORD_PROTECTED: 'password_protected',
  MEMBERS_ONLY: 'members_only',
} as const;

export type ContentVisibility = (typeof CONTENT_VISIBILITY)[keyof typeof CONTENT_VISIBILITY];

/**
 * Content types
 */
export const CONTENT_TYPES = {
  ARTICLE: 'article',
  PAGE: 'page',
  POST: 'post',
  NEWS: 'news',
  TUTORIAL: 'tutorial',
  REVIEW: 'review',
  GUIDE: 'guide',
} as const;

export type ContentType = (typeof CONTENT_TYPES)[keyof typeof CONTENT_TYPES];

/**
 * Media providers
 */
export const MEDIA_PROVIDERS = {
  LOCAL: 'local',
  CLOUDINARY: 'cloudinary',
  S3: 's3',
} as const;

export type MediaProvider = (typeof MEDIA_PROVIDERS)[keyof typeof MEDIA_PROVIDERS];

/**
 * Theme options
 */
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
} as const;

export type Theme = (typeof THEMES)[keyof typeof THEMES];

/**
 * Pagination defaults
 */
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

/**
 * Token expiry defaults (in seconds)
 */
export const TOKEN_EXPIRY = {
  ACCESS_TOKEN: 15 * 60, // 15 minutes
  REFRESH_TOKEN: 7 * 24 * 60 * 60, // 7 days
  VERIFICATION_TOKEN: 24 * 60 * 60, // 24 hours
  PASSWORD_RESET_TOKEN: 60 * 60, // 1 hour
} as const;

/**
 * Upload limits
 */
export const UPLOAD_LIMITS = {
  IMAGE_MAX_SIZE: 10 * 1024 * 1024, // 10MB
  DOCUMENT_MAX_SIZE: 25 * 1024 * 1024, // 25MB
  VIDEO_MAX_SIZE: 100 * 1024 * 1024, // 100MB
  AUDIO_MAX_SIZE: 50 * 1024 * 1024, // 50MB
} as const;

/**
 * Allowed MIME types
 */
export const ALLOWED_MIME_TYPES = {
  IMAGES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  DOCUMENTS: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
  VIDEOS: ['video/mp4', 'video/webm'],
  AUDIO: ['audio/mpeg', 'audio/wav', 'audio/ogg'],
} as const;

/**
 * Rate limiting defaults
 */
export const RATE_LIMITS = {
  WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  MAX_REQUESTS: 100,
  AUTH_MAX_REQUESTS: 10,
} as const;
