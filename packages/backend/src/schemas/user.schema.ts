import { z } from 'zod';

/**
 * User ID parameter validation
 */
export const userIdParamSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid user ID format'),
  }),
});

/**
 * User list query validation
 */
export const userListQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    search: z.string().optional(),
    status: z.enum(['active', 'inactive', 'suspended', 'pending']).optional(),
    roleId: z
      .string()
      .regex(/^[a-f\d]{24}$/i, 'Invalid role ID format')
      .optional(),
    sortBy: z
      .enum(['createdAt', 'email', 'firstName', 'lastName', 'lastLoginAt'])
      .default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
  }),
});

/**
 * Create user validation (admin)
 */
export const createUserSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email format').toLowerCase(),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(128, 'Password cannot exceed 128 characters'),
    firstName: z.string().min(1, 'First name is required').max(50),
    lastName: z.string().min(1, 'Last name is required').max(50),
    displayName: z.string().max(100).optional(),
    roleId: z
      .string()
      .regex(/^[a-f\d]{24}$/i, 'Invalid role ID format')
      .optional(),
    status: z.enum(['active', 'inactive', 'pending']).default('active'),
  }),
});

/**
 * Update user validation (admin)
 */
export const updateUserSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid user ID format'),
  }),
  body: z.object({
    firstName: z.string().min(1).max(50).optional(),
    lastName: z.string().min(1).max(50).optional(),
    displayName: z.string().max(100).optional(),
    bio: z.string().max(500).optional(),
    roleId: z
      .string()
      .regex(/^[a-f\d]{24}$/i, 'Invalid role ID format')
      .optional(),
    status: z.enum(['active', 'inactive', 'suspended', 'pending']).optional(),
  }),
});

/**
 * Update user status validation
 */
export const updateUserStatusSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid user ID format'),
  }),
  body: z.object({
    status: z.enum(['active', 'inactive', 'suspended']),
    reason: z.string().max(500).optional(),
  }),
});

/**
 * Assign role validation
 */
export const assignRoleSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid user ID format'),
  }),
  body: z.object({
    roleId: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid role ID format'),
  }),
});

/**
 * Update profile validation (self)
 */
export const updateProfileSchema = z.object({
  body: z.object({
    firstName: z.string().min(1).max(50).optional(),
    lastName: z.string().min(1).max(50).optional(),
    displayName: z.string().max(100).optional(),
    bio: z.string().max(500).optional(),
    theme: z.enum(['light', 'dark', 'system']).optional(),
  }),
});

/**
 * Role list query validation
 */
export const roleListQuerySchema = z.object({
  query: z.object({
    includeSystem: z.coerce.boolean().default(true),
  }),
});

/**
 * Create role validation
 */
export const createRoleSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Role name is required').max(50),
    slug: z
      .string()
      .min(1)
      .max(50)
      .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
    description: z.string().max(200).optional(),
    permissions: z.array(z.string()).min(1, 'At least one permission is required'),
    isDefault: z.boolean().default(false),
  }),
});

/**
 * Update role validation
 */
export const updateRoleSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid role ID format'),
  }),
  body: z.object({
    name: z.string().min(1).max(50).optional(),
    description: z.string().max(200).optional(),
    permissions: z.array(z.string()).min(1).optional(),
    isDefault: z.boolean().optional(),
  }),
});

// Export types
export type UserIdParam = z.infer<typeof userIdParamSchema>;
export type UserListQuery = z.infer<typeof userListQuerySchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>['body'];
export type UpdateUserInput = z.infer<typeof updateUserSchema>['body'];
export type UpdateUserStatusInput = z.infer<typeof updateUserStatusSchema>['body'];
export type AssignRoleInput = z.infer<typeof assignRoleSchema>['body'];
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>['body'];
export type CreateRoleInput = z.infer<typeof createRoleSchema>['body'];
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>['body'];
export type UserListQueryParams = UserListQuery['query'];
