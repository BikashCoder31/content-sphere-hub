import { Request, Response, NextFunction } from 'express';
import { sendSuccess, sendError } from '../utils/response.js';
import * as roleService from '../services/role.service.js';
import type { CreateRoleInput, UpdateRoleInput } from '../schemas/user.schema.js';

/**
 * Get all roles
 * GET /api/v1/roles
 */
export async function getRoles(
  req: Request<unknown, unknown, unknown, { includeSystem?: string }>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const includeSystem = req.query.includeSystem !== 'false';
    const roles = await roleService.getRoles(includeSystem);
    sendSuccess(res, roles);
  } catch (error) {
    next(error);
  }
}

/**
 * Get role by ID
 * GET /api/v1/roles/:id
 */
export async function getRoleById(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const role = await roleService.getRoleById(req.params.id);
    sendSuccess(res, role);
  } catch (error) {
    if (error instanceof roleService.RoleError) {
      sendError(res, error.code, error.message, error.statusCode);
    } else {
      next(error);
    }
  }
}

/**
 * Create new role
 * POST /api/v1/roles
 */
export async function createRole(
  req: Request<unknown, unknown, CreateRoleInput>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const role = await roleService.createRole(req.body);
    sendSuccess(res, role, 201);
  } catch (error) {
    if (error instanceof roleService.RoleError) {
      sendError(res, error.code, error.message, error.statusCode);
    } else {
      next(error);
    }
  }
}

/**
 * Update role
 * PATCH /api/v1/roles/:id
 */
export async function updateRole(
  req: Request<{ id: string }, unknown, UpdateRoleInput>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const role = await roleService.updateRole(req.params.id, req.body);
    sendSuccess(res, role);
  } catch (error) {
    if (error instanceof roleService.RoleError) {
      sendError(res, error.code, error.message, error.statusCode);
    } else {
      next(error);
    }
  }
}

/**
 * Delete role
 * DELETE /api/v1/roles/:id
 */
export async function deleteRole(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    await roleService.deleteRole(req.params.id);
    sendSuccess(res, { message: 'Role deleted successfully' });
  } catch (error) {
    if (error instanceof roleService.RoleError) {
      sendError(res, error.code, error.message, error.statusCode);
    } else {
      next(error);
    }
  }
}

/**
 * Get all available permissions
 * GET /api/v1/roles/permissions
 */
export async function getPermissions(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const permissions = roleService.getPermissions();
    sendSuccess(res, permissions);
  } catch (error) {
    next(error);
  }
}
