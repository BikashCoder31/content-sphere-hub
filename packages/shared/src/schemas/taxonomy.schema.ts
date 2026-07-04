import { z } from 'zod';

/**
 * Slug schema helper
 */
const slugSchema = z
  .string()
  .min(1, 'Slug is required')
  .max(100, 'Slug must be at most 100 characters')
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase alphanumeric with hyphens');

/**
 * Category SEO schema
 */
export const categorySeoSchema = z.object({
  title: z.string().max(70).optional(),
  description: z.string().max(160).optional(),
  keywords: z.array(z.string()).max(10).optional(),
});

/**
 * Create category schema
 */
export const createCategorySchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be at most 100 characters')
    .trim(),
  slug: slugSchema.optional(),
  description: z.string().max(500, 'Description must be at most 500 characters').optional(),
  parentId: z.string().optional(),
  imageId: z.string().optional(),
  order: z.number().int().min(0).default(0),
  seo: categorySeoSchema.optional(),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;

/**
 * Update category schema
 */
export const updateCategorySchema = createCategorySchema.partial().extend({
  _id: z.string().min(1, 'Category ID is required'),
});

export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;

/**
 * Category list query schema
 */
export const categoryListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  search: z.string().optional(),
  parentId: z.string().optional(),
  flat: z.coerce.boolean().default(false),
  sortBy: z.enum(['createdAt', 'updatedAt', 'name', 'order']).default('order'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

export type CategoryListQuery = z.infer<typeof categoryListQuerySchema>;

/**
 * Create tag schema
 */
export const createTagSchema = z.object({
  name: z.string().min(1, 'Name is required').max(50, 'Name must be at most 50 characters').trim(),
  slug: slugSchema.optional(),
  description: z.string().max(255, 'Description must be at most 255 characters').optional(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format')
    .optional(),
});

export type CreateTagInput = z.infer<typeof createTagSchema>;

/**
 * Update tag schema
 */
export const updateTagSchema = createTagSchema.partial().extend({
  _id: z.string().min(1, 'Tag ID is required'),
});

export type UpdateTagInput = z.infer<typeof updateTagSchema>;

/**
 * Tag list query schema
 */
export const tagListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(200).default(50),
  search: z.string().optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'name', 'contentCount']).default('name'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

export type TagListQuery = z.infer<typeof tagListQuerySchema>;
