import { z } from 'zod';
import { CONTENT_STATUS, CONTENT_VISIBILITY, CONTENT_TYPES } from '@content-sphere-hub/shared';
import type { ContentStatus, ContentVisibility, ContentType } from '@content-sphere-hub/shared';

/**
 * MongoDB ObjectId regex pattern
 */
const objectIdPattern = /^[a-f\d]{24}$/i;
const objectIdSchema = z.string().regex(objectIdPattern, 'Invalid ObjectId');

/**
 * Slug validation schema
 */
export const slugSchema = z
  .string()
  .min(1, 'Slug is required')
  .max(200, 'Slug must be at most 200 characters')
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase alphanumeric with hyphens');

/**
 * TipTap JSON content schema (basic validation)
 */
export const jsonContentSchema = z.object({
  type: z.string().optional(),
  content: z.array(z.any()).optional(),
  attrs: z.record(z.unknown()).optional(),
  marks: z.array(z.any()).optional(),
  text: z.string().optional(),
});

/**
 * JSON content type
 */
export interface JsonContent {
  type?: string;
  content?: unknown[];
  attrs?: Record<string, unknown>;
  marks?: unknown[];
  text?: string;
}

/**
 * Content SEO schema
 */
export const contentSeoSchema = z.object({
  metaTitle: z.string().max(70, 'SEO title should be under 70 characters').optional(),
  metaDescription: z.string().max(160, 'SEO description should be under 160 characters').optional(),
  metaKeywords: z.array(z.string()).max(10, 'Maximum 10 keywords').default([]),
  ogImage: z.string().url('Invalid OG image URL').optional().or(z.literal('')),
  ogTitle: z.string().max(70, 'OG title should be under 70 characters').optional(),
  ogDescription: z.string().max(200, 'OG description should be under 200 characters').optional(),
  canonicalUrl: z.string().url('Invalid canonical URL').optional().or(z.literal('')),
  noIndex: z.boolean().default(false),
  noFollow: z.boolean().default(false),
});

/**
 * Content SEO type
 */
export interface ContentSeo {
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  ogImage?: string;
  ogTitle?: string;
  ogDescription?: string;
  canonicalUrl?: string;
  noIndex?: boolean;
  noFollow?: boolean;
}

/**
 * Content status enum for validation
 */
const contentStatusValues = [
  CONTENT_STATUS.DRAFT,
  CONTENT_STATUS.PENDING_REVIEW,
  CONTENT_STATUS.PUBLISHED,
  CONTENT_STATUS.ARCHIVED,
  CONTENT_STATUS.TRASH,
] as const;

/**
 * Content visibility enum for validation
 */
const contentVisibilityValues = [
  CONTENT_VISIBILITY.PUBLIC,
  CONTENT_VISIBILITY.PRIVATE,
  CONTENT_VISIBILITY.PASSWORD_PROTECTED,
  CONTENT_VISIBILITY.MEMBERS_ONLY,
] as const;

/**
 * Content type enum for validation
 */
const contentTypeValues = [
  CONTENT_TYPES.ARTICLE,
  CONTENT_TYPES.PAGE,
  CONTENT_TYPES.POST,
  CONTENT_TYPES.NEWS,
  CONTENT_TYPES.TUTORIAL,
  CONTENT_TYPES.REVIEW,
  CONTENT_TYPES.GUIDE,
] as const;

/**
 * Create content schema
 */
export const createContentSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be at most 200 characters')
    .trim(),
  slug: slugSchema.optional(),
  excerpt: z.string().max(500, 'Excerpt must be at most 500 characters').trim().optional(),
  content: jsonContentSchema.default({ type: 'doc', content: [] }),
  contentType: z.enum(contentTypeValues).default(CONTENT_TYPES.ARTICLE),
  status: z.enum(contentStatusValues).default(CONTENT_STATUS.DRAFT),
  visibility: z.enum(contentVisibilityValues).default(CONTENT_VISIBILITY.PUBLIC),
  categoryIds: z.array(objectIdSchema).default([]),
  tagIds: z.array(objectIdSchema).default([]),
  featuredImage: z.string().optional(),
  featuredImageAlt: z.string().max(200, 'Alt text must be at most 200 characters').optional(),
  seo: contentSeoSchema.optional(),
  isFeatured: z.boolean().default(false),
  allowComments: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
  parentId: objectIdSchema.optional(),
  scheduledAt: z.coerce.date().optional(),
});

/**
 * Create content input type
 */
export interface CreateContentInput {
  title: string;
  slug?: string;
  excerpt?: string;
  content: JsonContent;
  contentType: ContentType;
  status: ContentStatus;
  visibility: ContentVisibility;
  categoryIds: string[];
  tagIds: string[];
  featuredImage?: string;
  featuredImageAlt?: string;
  seo?: ContentSeo;
  isFeatured: boolean;
  allowComments: boolean;
  sortOrder: number;
  parentId?: string;
  scheduledAt?: Date;
}

/**
 * Update content schema
 */
export const updateContentSchema = createContentSchema.partial();

/**
 * Update content input type
 */
export interface UpdateContentInput {
  title?: string;
  slug?: string;
  excerpt?: string;
  content?: JsonContent;
  contentType?: ContentType;
  status?: ContentStatus;
  visibility?: ContentVisibility;
  categoryIds?: string[];
  tagIds?: string[];
  featuredImage?: string;
  featuredImageAlt?: string;
  seo?: ContentSeo;
  isFeatured?: boolean;
  allowComments?: boolean;
  sortOrder?: number;
  parentId?: string;
  scheduledAt?: Date;
}

/**
 * Content list query schema
 */
export const contentListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().optional(),
  status: z.enum(contentStatusValues).optional(),
  contentType: z.enum(contentTypeValues).optional(),
  visibility: z.enum(contentVisibilityValues).optional(),
  authorId: objectIdSchema.optional(),
  categoryId: objectIdSchema.optional(),
  tagId: objectIdSchema.optional(),
  isFeatured: z.coerce.boolean().optional(),
  includeTrash: z.coerce.boolean().default(false),
  sortBy: z.enum(['createdAt', 'updatedAt', 'publishedAt', 'title', 'viewCount']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

/**
 * Content list query params type
 */
export interface ContentListQueryParams {
  page: number;
  limit: number;
  search?: string;
  status?: ContentStatus;
  contentType?: ContentType;
  visibility?: ContentVisibility;
  authorId?: string;
  categoryId?: string;
  tagId?: string;
  isFeatured?: boolean;
  includeTrash: boolean;
  sortBy: 'createdAt' | 'updatedAt' | 'publishedAt' | 'title' | 'viewCount';
  sortOrder: 'asc' | 'desc';
}

/**
 * Content ID param schema
 */
export const contentIdParamSchema = z.object({
  id: objectIdSchema,
});

/**
 * Update content status schema
 */
export const updateContentStatusSchema = z.object({
  status: z.enum(contentStatusValues),
});

/**
 * Update content status input type
 */
export interface UpdateContentStatusInput {
  status: ContentStatus;
}

/**
 * Bulk operation schema
 */
export const bulkContentOperationSchema = z.object({
  ids: z.array(objectIdSchema).min(1, 'At least one content ID is required').max(50, 'Maximum 50 items per operation'),
  action: z.enum(['trash', 'restore', 'delete', 'publish', 'unpublish']),
});

/**
 * Bulk content operation type
 */
export interface BulkContentOperation {
  ids: string[];
  action: 'trash' | 'restore' | 'delete' | 'publish' | 'unpublish';
}

/**
 * Content slug check schema
 */
export const checkSlugSchema = z.object({
  slug: slugSchema,
  excludeId: objectIdSchema.optional(),
});

/**
 * Check slug input type
 */
export interface CheckSlugInput {
  slug: string;
  excludeId?: string;
}
