import { Request, Response, NextFunction } from 'express';
import { sendSuccess, sendError, sendPaginated } from '../utils/response.js';
import * as userService from '../services/user.service.js';
import type { AuthRequest } from '../middleware/auth.js';
import type {
  UserListQueryParams,
  CreateUserInput,
  UpdateUserInput,
  UpdateUserStatusInput,
  AssignRoleInput,
  UpdateProfileInput,
} from '../schemas/user.schema.js';

/**
 * Get paginated user list
 * GET /api/v1/users
 */
export async function getUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // Query params are validated and transformed by middleware
    const query = req.query as unknown as UserListQueryParams;
    const result = await userService.getUsers(query);
    sendPaginated(
      res,
      result.data,
      result.pagination.page,
      result.pagination.limit,
      result.pagination.total
    );
  } catch (error) {
    next(error);
  }
}

/**
 * Get user by ID
 * GET /api/v1/users/:id
 */
export async function getUserById(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const user = await userService.getUserById(req.params.id);
    sendSuccess(res, user);
  } catch (error) {
    if (error instanceof userService.UserError) {
      sendError(res, error.code, error.message, error.statusCode);
    } else {
      next(error);
    }
  }
}

/**
 * Create new user (admin)
 * POST /api/v1/users
 */
export async function createUser(
  req: Request<unknown, unknown, CreateUserInput>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const user = await userService.createUser(req.body);
    sendSuccess(res, user, 201);
  } catch (error) {
    if (error instanceof userService.UserError) {
      sendError(res, error.code, error.message, error.statusCode);
    } else {
      next(error);
    }
  }
}

/**
 * Update user (admin)
 * PATCH /api/v1/users/:id
 */
export async function updateUser(
  req: Request<{ id: string }, unknown, UpdateUserInput>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authReq = req as AuthRequest;
    const user = await userService.updateUser(req.params.id, req.body, authReq.user!.id);
    sendSuccess(res, user);
  } catch (error) {
    if (error instanceof userService.UserError) {
      sendError(res, error.code, error.message, error.statusCode);
    } else {
      next(error);
    }
  }
}

/**
 * Update user status
 * PATCH /api/v1/users/:id/status
 */
export async function updateUserStatus(
  req: Request<{ id: string }, unknown, UpdateUserStatusInput>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authReq = req as AuthRequest;
    const user = await userService.updateUserStatus(req.params.id, req.body, authReq.user!.id);
    sendSuccess(res, user);
  } catch (error) {
    if (error instanceof userService.UserError) {
      sendError(res, error.code, error.message, error.statusCode);
    } else {
      next(error);
    }
  }
}

/**
 * Assign role to user
 * PUT /api/v1/users/:id/role
 */
export async function assignRole(
  req: Request<{ id: string }, unknown, AssignRoleInput>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authReq = req as AuthRequest;
    const user = await userService.assignRole(req.params.id, req.body.roleId, authReq.user!.id);
    sendSuccess(res, user);
  } catch (error) {
    if (error instanceof userService.UserError) {
      sendError(res, error.code, error.message, error.statusCode);
    } else {
      next(error);
    }
  }
}

/**
 * Delete user (soft)
 * DELETE /api/v1/users/:id
 */
export async function deleteUser(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authReq = req as AuthRequest;
    await userService.deleteUser(req.params.id, authReq.user!.id);
    sendSuccess(res, { message: 'User deleted successfully' });
  } catch (error) {
    if (error instanceof userService.UserError) {
      sendError(res, error.code, error.message, error.statusCode);
    } else {
      next(error);
    }
  }
}

/**
 * Get own profile
 * GET /api/v1/profile
 */
export async function getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const authReq = req as AuthRequest;
    const profile = await userService.getProfile(authReq.user!.id);
    sendSuccess(res, profile);
  } catch (error) {
    if (error instanceof userService.UserError) {
      sendError(res, error.code, error.message, error.statusCode);
    } else {
      next(error);
    }
  }
}

/**
 * Update own profile
 * PATCH /api/v1/profile
 */
export async function updateProfile(
  req: Request<unknown, unknown, UpdateProfileInput>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authReq = req as AuthRequest;
    const profile = await userService.updateProfile(authReq.user!.id, req.body);
    sendSuccess(res, profile);
  } catch (error) {
    if (error instanceof userService.UserError) {
      sendError(res, error.code, error.message, error.statusCode);
    } else {
      next(error);
    }
  }
}
