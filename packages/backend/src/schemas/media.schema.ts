import { z } from 'zod';

/**
 * MongoDB ObjectId regex pattern
 */
const objectIdPattern = /^[a-f\d]{24}$/i;
const objectIdSchema = z.string().regex(objectIdPattern, 'Invalid ObjectId');

/**
 * Media variant schema
 */
export const mediaVariantSchema = z.object({
  name: z.string(),
  path: z.string(),
  url: z.string(),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  size: z.number().int().positive(),
  mimeType: z.string(),
});

export type MediaVariant = z.infer<typeof mediaVariantSchema>;

/**
 * Media types enum
 */
export const mediaTypes = ['image', 'document', 'video', 'audio', 'other'] as const;
export type MediaType = (typeof mediaTypes)[number];

/**
 * Update media metadata schema
 */
export const updateMediaSchema = z.object({
  alt: z.string().max(200, 'Alt text must be at most 200 characters').optional(),
  caption: z.string().max(500, 'Caption must be at most 500 characters').optional(),
  title: z.string().max(200, 'Title must be at most 200 characters').optional(),
  description: z.string().max(2000, 'Description must be at most 2000 characters').optional(),
  folderId: objectIdSchema.optional().nullable(),
});

export interface UpdateMediaInput {
  alt?: string;
  caption?: string;
  title?: string;
  description?: string;
  folderId?: string | null;
}

/**
 * Media list query schema
 */
export const mediaListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(24),
  search: z.string().trim().optional(),
  mediaType: z.enum(mediaTypes).optional(),
  folderId: objectIdSchema.optional().nullable(),
  uploadedBy: objectIdSchema.optional(),
  includeDeleted: z.coerce.boolean().default(false),
  sortBy: z.enum(['createdAt', 'updatedAt', 'filename', 'size']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export interface MediaListQueryParams {
  page: number;
  limit: number;
  search?: string;
  mediaType?: MediaType;
  folderId?: string | null;
  uploadedBy?: string;
  includeDeleted: boolean;
  sortBy: 'createdAt' | 'updatedAt' | 'filename' | 'size';
  sortOrder: 'asc' | 'desc';
}

/**
 * Media ID param schema
 */
export const mediaIdParamSchema = z.object({
  id: objectIdSchema,
});

/**
 * Bulk media operation schema
 */
export const bulkMediaOperationSchema = z.object({
  ids: z.array(objectIdSchema).min(1, 'At least one media ID is required').max(50, 'Maximum 50 items per operation'),
  action: z.enum(['delete', 'restore', 'move']),
  folderId: objectIdSchema.optional(), // For move action
});

export interface BulkMediaOperation {
  ids: string[];
  action: 'delete' | 'restore' | 'move';
  folderId?: string;
}

/**
 * Create media folder schema
 */
export const createMediaFolderSchema = z.object({
  name: z.string().min(1, 'Folder name is required').max(100, 'Folder name must be at most 100 characters').trim(),
  parentId: objectIdSchema.optional().nullable(),
});

export interface CreateMediaFolderInput {
  name: string;
  parentId?: string | null;
}

/**
 * Update media folder schema
 */
export const updateMediaFolderSchema = z.object({
  name: z.string().min(1, 'Folder name is required').max(100, 'Folder name must be at most 100 characters').trim().optional(),
  parentId: objectIdSchema.optional().nullable(),
});

export interface UpdateMediaFolderInput {
  name?: string;
  parentId?: string | null;
}

/**
 * Media upload response
 */
export interface MediaUploadResponse {
  id: string;
  filename: string;
  originalName: string;
  path: string;
  url: string;
  mimeType: string;
  size: number;
  mediaType: MediaType;
  width?: number;
  height?: number;
  variants?: MediaVariant[];
}

/**
 * Media response (full details)
 */
export interface MediaResponse extends MediaUploadResponse {
  alt?: string;
  caption?: string;
  title?: string;
  description?: string;
  folderId?: string;
  uploadedBy: {
    id: string;
    email: string;
    displayName?: string;
  };
  usageCount: number;
  isDeleted: boolean;
  deletedAt?: string;
  createdAt: string;
  updatedAt: string;
}
