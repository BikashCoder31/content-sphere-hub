import { Router, IRouter } from 'express';
import { validate } from '../middleware/validate.js';
import { authenticate, requirePermissions } from '../middleware/auth.js';
import {
  roleListQuerySchema,
  userIdParamSchema,
  createRoleSchema,
  updateRoleSchema,
} from '../schemas/user.schema.js';
import {
  getRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
  getPermissions,
} from '../controllers/role.controller.js';

export const roleRouter: IRouter = Router();

/**
 * @route   GET /api/v1/roles/permissions
 * @desc    Get all available permissions
 * @access  roles:read permission
 */
roleRouter.get('/permissions', authenticate, requirePermissions('roles:read'), getPermissions);

/**
 * @route   GET /api/v1/roles
 * @desc    Get all roles
 * @access  roles:read permission
 */
roleRouter.get(
  '/',
  authenticate,
  requirePermissions('roles:read'),
  validate(roleListQuerySchema),
  getRoles
);

/**
 * @route   GET /api/v1/roles/:id
 * @desc    Get role by ID
 * @access  roles:read permission
 */
roleRouter.get(
  '/:id',
  authenticate,
  requirePermissions('roles:read'),
  validate(userIdParamSchema),
  getRoleById
);

/**
 * @route   POST /api/v1/roles
 * @desc    Create new role
 * @access  roles:create permission
 */
roleRouter.post(
  '/',
  authenticate,
  requirePermissions('roles:create'),
  validate(createRoleSchema),
  createRole
);

/**
 * @route   PATCH /api/v1/roles/:id
 * @desc    Update role
 * @access  roles:update permission
 */
roleRouter.patch(
  '/:id',
  authenticate,
  requirePermissions('roles:update'),
  validate(updateRoleSchema),
  updateRole
);

/**
 * @route   DELETE /api/v1/roles/:id
 * @desc    Delete role
 * @access  roles:delete permission
 */
roleRouter.delete(
  '/:id',
  authenticate,
  requirePermissions('roles:delete'),
  validate(userIdParamSchema),
  deleteRole
);
