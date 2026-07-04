import { z } from 'zod';

// ==================== CATEGORY SCHEMAS ====================

/**
 * Create category input schema
 */
export const createCategorySchema = z.object({
  name: z
    .string()
    .min(1, 'Category name is required')
    .max(100, 'Category name cannot exceed 100 characters')
    .trim(),
  slug: z
    .string()
    .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens')
    .max(100)
    .optional(),
  description: z.string().max(500, 'Description cannot exceed 500 characters').optional(),
  parentId: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid parent ID').nullable().optional(),
  featuredImage: z.string().url().nullable().optional(),
  sortOrder: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
  seo: z
    .object({
      metaTitle: z.string().max(70).optional(),
      metaDescription: z.string().max(160).optional(),
    })
    .optional(),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;

/**
 * Update category input schema
 */
export const updateCategorySchema = createCategorySchema.partial();

export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;

/**
 * Category ID param schema
 */
export const categoryIdParamSchema = z.object({
  id: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid category ID'),
});

/**
 * Category list query schema
 */
export const categoryListQuerySchema = z.object({
  search: z.string().optional(),
  parentId: z.string().regex(/^[a-f\d]{24}$/i).nullable().optional(),
  isActive: z
    .string()
    .transform((val) => val === 'true')
    .optional(),
  tree: z
    .string()
    .transform((val) => val === 'true')
    .optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  sortBy: z.enum(['name', 'sortOrder', 'createdAt', 'contentCount']).default('sortOrder'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

export type CategoryListQuery = z.infer<typeof categoryListQuerySchema>;

// ==================== TAG SCHEMAS ====================

/**
 * Create tag input schema
 */
export const createTagSchema = z.object({
  name: z
    .string()
    .min(1, 'Tag name is required')
    .max(50, 'Tag name cannot exceed 50 characters')
    .trim(),
  slug: z
    .string()
    .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens')
    .max(50)
    .optional(),
  description: z.string().max(255, 'Description cannot exceed 255 characters').optional(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Color must be a valid hex color')
    .default('#6B7280'),
  isActive: z.boolean().default(true),
});

export type CreateTagInput = z.infer<typeof createTagSchema>;

/**
 * Update tag input schema
 */
export const updateTagSchema = createTagSchema.partial();

export type UpdateTagInput = z.infer<typeof updateTagSchema>;

/**
 * Tag ID param schema
 */
export const tagIdParamSchema = z.object({
  id: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid tag ID'),
});

/**
 * Tag list query schema
 */
export const tagListQuerySchema = z.object({
  search: z.string().optional(),
  isActive: z
    .string()
    .transform((val) => val === 'true')
    .optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  sortBy: z.enum(['name', 'createdAt', 'contentCount']).default('name'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

export type TagListQuery = z.infer<typeof tagListQuerySchema>;

/**
 * Bulk tag operation schema
 */
export const bulkTagOperationSchema = z.object({
  action: z.enum(['delete', 'activate', 'deactivate', 'merge']),
  ids: z.array(z.string().regex(/^[a-f\d]{24}$/i)).min(1),
  targetId: z.string().regex(/^[a-f\d]{24}$/i).optional(), // For merge operation
});

export type BulkTagOperation = z.infer<typeof bulkTagOperationSchema>;
