import { z } from 'zod';
import { THEMES } from '../constants/index.js';

/**
 * User preferences schema
 */
export const userPreferencesSchema = z.object({
  language: z.string().default('en'),
  timezone: z.string().default('UTC'),
  theme: z.enum([THEMES.LIGHT, THEMES.DARK, THEMES.SYSTEM]).default(THEMES.SYSTEM),
  notifications: z
    .object({
      email: z.boolean().default(true),
      push: z.boolean().default(false),
      inApp: z.boolean().default(true),
    })
    .default({}),
});

/**
 * Update user profile schema
 */
export const updateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100).trim().optional(),
  bio: z.string().max(500, 'Bio must be at most 500 characters').optional(),
  avatar: z.string().url('Invalid avatar URL').optional().or(z.literal('')),
  preferences: userPreferencesSchema.partial().optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

/**
 * Create user schema (admin)
 */
export const createUserSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase().trim(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128)
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  name: z.string().min(2, 'Name must be at least 2 characters').max(100).trim(),
  roleId: z.string().min(1, 'Role is required'),
  isActive: z.boolean().default(true),
  sendInvite: z.boolean().default(false),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;

/**
 * Update user schema (admin)
 */
export const updateUserSchema = z.object({
  name: z.string().min(2).max(100).trim().optional(),
  roleId: z.string().optional(),
  isActive: z.boolean().optional(),
  permissionOverrides: z.array(z.string()).optional(),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;

/**
 * User list query schema
 */
export const userListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  roleId: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'name', 'email']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type UserListQuery = z.infer<typeof userListQuerySchema>;
