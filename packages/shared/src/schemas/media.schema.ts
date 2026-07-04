import { z } from 'zod';
import { ALLOWED_MIME_TYPES, UPLOAD_LIMITS } from '../constants/index.js';

/**
 * Allowed MIME types as a flat array
 */
const allAllowedMimeTypes = [
  ...ALLOWED_MIME_TYPES.IMAGES,
  ...ALLOWED_MIME_TYPES.DOCUMENTS,
  ...ALLOWED_MIME_TYPES.VIDEOS,
  ...ALLOWED_MIME_TYPES.AUDIO,
] as const;

/**
 * Media upload validation schema
 */
export const mediaUploadSchema = z.object({
  file: z.object({
    originalname: z.string(),
    mimetype: z.string().refine((mime) => allAllowedMimeTypes.includes(mime as any), {
      message: 'File type not allowed',
    }),
    size: z
      .number()
      .max(
        Math.max(
          UPLOAD_LIMITS.IMAGE_MAX_SIZE,
          UPLOAD_LIMITS.DOCUMENT_MAX_SIZE,
          UPLOAD_LIMITS.VIDEO_MAX_SIZE,
          UPLOAD_LIMITS.AUDIO_MAX_SIZE
        ),
        'File too large'
      ),
    buffer: z.any().optional(), // Buffer validation is backend-only
    path: z.string().optional(),
  }),
  altText: z.string().max(255).optional(),
  caption: z.string().max(1000).optional(),
  folderId: z.string().optional(),
});

export type MediaUploadInput = z.infer<typeof mediaUploadSchema>;

/**
 * Media update schema
 */
export const updateMediaSchema = z.object({
  altText: z.string().max(255).optional(),
  caption: z.string().max(1000).optional(),
  tags: z.array(z.string()).max(20, 'Maximum 20 tags').optional(),
  focalPoint: z
    .object({
      x: z.number().min(0).max(100),
      y: z.number().min(0).max(100),
    })
    .optional(),
});

export type UpdateMediaInput = z.infer<typeof updateMediaSchema>;

/**
 * Media list query schema
 */
export const mediaListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  mimeType: z.string().optional(),
  folderId: z.string().optional(),
  uploadedById: z.string().optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'size', 'originalName']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type MediaListQuery = z.infer<typeof mediaListQuerySchema>;

/**
 * Validate file type matches MIME category
 */
export function validateFileCategory(
  mimeType: string,
  expectedCategory: 'images' | 'documents' | 'videos' | 'audio'
): boolean {
  const categoryKey = expectedCategory.toUpperCase() as keyof typeof ALLOWED_MIME_TYPES;
  const categoryMimes = ALLOWED_MIME_TYPES[categoryKey] as readonly string[];
  return categoryMimes.includes(mimeType);
}

/**
 * Get max file size for MIME type
 */
export function getMaxFileSizeForMime(mimeType: string): number {
  if ((ALLOWED_MIME_TYPES.IMAGES as readonly string[]).includes(mimeType)) {
    return UPLOAD_LIMITS.IMAGE_MAX_SIZE;
  }
  if ((ALLOWED_MIME_TYPES.DOCUMENTS as readonly string[]).includes(mimeType)) {
    return UPLOAD_LIMITS.DOCUMENT_MAX_SIZE;
  }
  if ((ALLOWED_MIME_TYPES.VIDEOS as readonly string[]).includes(mimeType)) {
    return UPLOAD_LIMITS.VIDEO_MAX_SIZE;
  }
  if ((ALLOWED_MIME_TYPES.AUDIO as readonly string[]).includes(mimeType)) {
    return UPLOAD_LIMITS.AUDIO_MAX_SIZE;
  }
  return 0;
}
