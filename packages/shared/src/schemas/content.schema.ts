import { z } from 'zod';
import { CONTENT_STATUS, CONTENT_VISIBILITY, CONTENT_TYPES } from '../constants/index.js';

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
 * Content SEO schema
 */
export const contentSeoSchema = z.object({
  title: z.string().max(70, 'SEO title should be under 70 characters').optional(),
  description: z.string().max(160, 'SEO description should be under 160 characters').optional(),
  keywords: z.array(z.string()).max(10, 'Maximum 10 keywords').default([]),
  canonical: z.string().url('Invalid canonical URL').optional().or(z.literal('')),
  noIndex: z.boolean().default(false),
  noFollow: z.boolean().default(false),
  ogImage: z.string().url('Invalid OG image URL').optional().or(z.literal('')),
  structuredData: z.record(z.unknown()).optional(),
});

/**
 * Content settings schema
 */
export const contentSettingsSchema = z.object({
  allowComments: z.boolean().default(true),
  showAuthor: z.boolean().default(true),
  showDate: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  isPinned: z.boolean().default(false),
  customFields: z.record(z.unknown()).default({}),
});

/**
 * Content scheduling schema
 */
export const contentSchedulingSchema = z.object({
  publishAt: z.coerce.date().optional(),
  expireAt: z.coerce.date().optional(),
});

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
  excerpt: z.string().max(500, 'Excerpt must be at most 500 characters').optional(),
  bodyJson: jsonContentSchema,
  contentType: z
    .enum([
      CONTENT_TYPES.ARTICLE,
      CONTENT_TYPES.PAGE,
      CONTENT_TYPES.POST,
      CONTENT_TYPES.NEWS,
      CONTENT_TYPES.TUTORIAL,
      CONTENT_TYPES.REVIEW,
      CONTENT_TYPES.GUIDE,
    ])
    .or(z.string())
    .default(CONTENT_TYPES.ARTICLE),
  status: z
    .enum([
      CONTENT_STATUS.DRAFT,
      CONTENT_STATUS.PENDING_REVIEW,
      CONTENT_STATUS.PUBLISHED,
      CONTENT_STATUS.ARCHIVED,
    ])
    .default(CONTENT_STATUS.DRAFT),
  visibility: z
    .enum([
      CONTENT_VISIBILITY.PUBLIC,
      CONTENT_VISIBILITY.PRIVATE,
      CONTENT_VISIBILITY.PASSWORD_PROTECTED,
      CONTENT_VISIBILITY.MEMBERS_ONLY,
    ])
    .default(CONTENT_VISIBILITY.PUBLIC),
  categoryIds: z.array(z.string()).default([]),
  tagIds: z.array(z.string()).default([]),
  featuredImageId: z.string().optional(),
  seo: contentSeoSchema.optional(),
  settings: contentSettingsSchema.optional(),
  scheduling: contentSchedulingSchema.optional(),
});

export type CreateContentInput = z.infer<typeof createContentSchema>;

/**
 * Update content schema
 */
export const updateContentSchema = createContentSchema.partial().extend({
  _id: z.string().min(1, 'Content ID is required'),
});

export type UpdateContentInput = z.infer<typeof updateContentSchema>;

/**
 * Content list query schema
 */
export const contentListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  status: z
    .enum([
      CONTENT_STATUS.DRAFT,
      CONTENT_STATUS.PENDING_REVIEW,
      CONTENT_STATUS.IN_REVIEW,
      CONTENT_STATUS.CHANGES_REQUESTED,
      CONTENT_STATUS.APPROVED,
      CONTENT_STATUS.PUBLISHED,
      CONTENT_STATUS.ARCHIVED,
      CONTENT_STATUS.TRASH,
    ])
    .optional(),
  contentType: z.string().optional(),
  authorId: z.string().optional(),
  categoryId: z.string().optional(),
  tagId: z.string().optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'publishedAt', 'title']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type ContentListQuery = z.infer<typeof contentListQuerySchema>;
