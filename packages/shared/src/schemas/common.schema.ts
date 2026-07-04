import { z } from 'zod';
import { PAGINATION } from '../constants/index.js';

/**
 * Pagination query schema (reusable)
 */
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(PAGINATION.DEFAULT_PAGE),
  limit: z.coerce.number().int().min(1).max(PAGINATION.MAX_LIMIT).default(PAGINATION.DEFAULT_LIMIT),
});

export type PaginationInput = z.infer<typeof paginationSchema>;

/**
 * Sort query schema (reusable)
 */
export const sortSchema = z.object({
  sortBy: z.string().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type SortInput = z.infer<typeof sortSchema>;

/**
 * ID parameter schema
 */
export const idParamSchema = z.object({
  id: z.string().min(1, 'ID is required'),
});

export type IdParam = z.infer<typeof idParamSchema>;

/**
 * Search query schema
 */
export const searchQuerySchema = z.object({
  q: z.string().min(1, 'Search query is required').max(200),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type SearchQuery = z.infer<typeof searchQuerySchema>;

/**
 * Bulk IDs schema
 */
export const bulkIdsSchema = z.object({
  ids: z.array(z.string()).min(1, 'At least one ID is required').max(100, 'Maximum 100 items'),
});

export type BulkIdsInput = z.infer<typeof bulkIdsSchema>;

/**
 * Date range schema
 */
export const dateRangeSchema = z
  .object({
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
  })
  .refine((data) => data.startDate <= data.endDate, {
    message: 'Start date must be before end date',
    path: ['startDate'],
  });

export type DateRangeInput = z.infer<typeof dateRangeSchema>;
