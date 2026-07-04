import { Router, IRouter } from 'express';
import { validate } from '../middleware/validate.js';
import { authenticate, requirePermissions } from '../middleware/auth.js';
import {
  userListQuerySchema,
  userIdParamSchema,
  createUserSchema,
  updateUserSchema,
  updateUserStatusSchema,
  assignRoleSchema,
  updateProfileSchema,
} from '../schemas/user.schema.js';
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  updateUserStatus,
  assignRole,
  deleteUser,
  getProfile,
  updateProfile,
} from '../controllers/user.controller.js';

export const userRouter: IRouter = Router();

// ==========================================
// Profile routes (own user)
// ==========================================

/**
 * @route   GET /api/v1/profile
 * @desc    Get own profile
 * @access  Authenticated
 */
userRouter.get('/profile', authenticate, getProfile);

/**
 * @route   PATCH /api/v1/profile
 * @desc    Update own profile
 * @access  Authenticated
 */
userRouter.patch('/profile', authenticate, validate(updateProfileSchema), updateProfile);

// ==========================================
// User management routes (admin)
// ==========================================

/**
 * @route   GET /api/v1/users
 * @desc    Get paginated user list
 * @access  users:read permission
 */
userRouter.get(
  '/',
  authenticate,
  requirePermissions('users:read'),
  validate(userListQuerySchema),
  getUsers as Parameters<typeof userRouter.get>[1]
);

/**
 * @route   GET /api/v1/users/:id
 * @desc    Get user by ID
 * @access  users:read permission
 */
userRouter.get(
  '/:id',
  authenticate,
  requirePermissions('users:read'),
  validate(userIdParamSchema),
  getUserById
);

/**
 * @route   POST /api/v1/users
 * @desc    Create new user
 * @access  users:create permission
 */
userRouter.post(
  '/',
  authenticate,
  requirePermissions('users:create'),
  validate(createUserSchema),
  createUser
);

/**
 * @route   PATCH /api/v1/users/:id
 * @desc    Update user
 * @access  users:update permission
 */
userRouter.patch(
  '/:id',
  authenticate,
  requirePermissions('users:update'),
  validate(updateUserSchema),
  updateUser
);

/**
 * @route   PATCH /api/v1/users/:id/status
 * @desc    Update user status (activate/deactivate/suspend)
 * @access  users:update permission
 */
userRouter.patch(
  '/:id/status',
  authenticate,
  requirePermissions('users:update'),
  validate(updateUserStatusSchema),
  updateUserStatus
);

/**
 * @route   PUT /api/v1/users/:id/role
 * @desc    Assign role to user
 * @access  users:update permission
 */
userRouter.put(
  '/:id/role',
  authenticate,
  requirePermissions('users:update'),
  validate(assignRoleSchema),
  assignRole
);

/**
 * @route   DELETE /api/v1/users/:id
 * @desc    Delete user (soft delete)
 * @access  users:delete permission
 */
userRouter.delete(
  '/:id',
  authenticate,
  requirePermissions('users:delete'),
  validate(userIdParamSchema),
  deleteUser
);
