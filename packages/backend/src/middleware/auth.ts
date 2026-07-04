import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt.js';
import { sendError, ErrorCodes } from '../utils/response.js';
import { User } from '../models/user.model.js';
import { Role, IRole } from '../models/role.model.js';
import type { Permission } from '@content-sphere-hub/shared';

/**
 * Extended request with auth info
 */
export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    roleId: string;
    role?: IRole;
  };
}

/**
 * Extract bearer token from Authorization header
 */
function extractBearerToken(authHeader?: string): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.slice(7);
}

/**
 * Authentication middleware - verifies JWT access token
 */
export function authenticate(req: AuthRequest, res: Response, next: NextFunction): void {
  const token = extractBearerToken(req.headers.authorization);

  if (!token) {
    sendError(res, ErrorCodes.UNAUTHORIZED, 'Authentication required', 401);
    return;
  }

  try {
    const payload = verifyAccessToken(token);

    req.user = {
      id: payload.userId,
      email: payload.email,
      roleId: payload.roleId,
    };

    next();
  } catch (error) {
    if (error instanceof Error && error.name === 'TokenExpiredError') {
      sendError(res, ErrorCodes.TOKEN_EXPIRED, 'Access token expired', 401);
    } else {
      sendError(res, ErrorCodes.UNAUTHORIZED, 'Invalid access token', 401);
    }
  }
}

/**
 * Optional authentication - attaches user if token present, continues if not
 */
export function optionalAuth(req: AuthRequest, res: Response, next: NextFunction): void {
  const token = extractBearerToken(req.headers.authorization);

  if (!token) {
    next();
    return;
  }

  try {
    const payload = verifyAccessToken(token);

    req.user = {
      id: payload.userId,
      email: payload.email,
      roleId: payload.roleId,
    };
  } catch {
    // Token invalid, but continue without auth
  }

  next();
}

/**
 * Require specific permissions
 */
export function requirePermissions(...permissions: Permission[]) {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      sendError(res, ErrorCodes.UNAUTHORIZED, 'Authentication required', 401);
      return;
    }

    try {
      // Fetch role if not already loaded
      if (!req.user.role) {
        const role = await Role.findById(req.user.roleId);
        if (!role) {
          sendError(res, ErrorCodes.FORBIDDEN, 'Role not found', 403);
          return;
        }
        req.user.role = role;
      }

      // Check permissions
      const userPermissions = req.user.role.permissions;
      const hasAllPermissions = permissions.every((p) => userPermissions.includes(p));

      if (!hasAllPermissions) {
        sendError(res, ErrorCodes.FORBIDDEN, 'Insufficient permissions', 403);
        return;
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Require any of the specified permissions
 */
export function requireAnyPermission(...permissions: Permission[]) {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      sendError(res, ErrorCodes.UNAUTHORIZED, 'Authentication required', 401);
      return;
    }

    try {
      // Fetch role if not already loaded
      if (!req.user.role) {
        const role = await Role.findById(req.user.roleId);
        if (!role) {
          sendError(res, ErrorCodes.FORBIDDEN, 'Role not found', 403);
          return;
        }
        req.user.role = role;
      }

      // Check if user has any of the permissions
      const userPermissions = req.user.role.permissions;
      const hasAnyPermission = permissions.some((p) => userPermissions.includes(p));

      if (!hasAnyPermission) {
        sendError(res, ErrorCodes.FORBIDDEN, 'Insufficient permissions', 403);
        return;
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Require specific role(s) by slug
 */
export function requireRole(...roleSlugs: string[]) {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      sendError(res, ErrorCodes.UNAUTHORIZED, 'Authentication required', 401);
      return;
    }

    try {
      // Fetch role if not already loaded
      if (!req.user.role) {
        const role = await Role.findById(req.user.roleId);
        if (!role) {
          sendError(res, ErrorCodes.FORBIDDEN, 'Role not found', 403);
          return;
        }
        req.user.role = role;
      }

      // Check if user's role matches any of the required roles
      if (!roleSlugs.includes(req.user.role.slug)) {
        sendError(res, ErrorCodes.FORBIDDEN, 'Access denied for this role', 403);
        return;
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Require active user status
 */
export async function requireActiveUser(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  if (!req.user) {
    sendError(res, ErrorCodes.UNAUTHORIZED, 'Authentication required', 401);
    return;
  }

  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      sendError(res, ErrorCodes.NOT_FOUND, 'User not found', 404);
      return;
    }

    if (user.status !== 'active') {
      sendError(res, ErrorCodes.FORBIDDEN, `Account is ${user.status}`, 403);
      return;
    }

    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Load user role (for use after authenticate or optionalAuth)
 * Useful when you need role info for access control but not permission checking
 */
export async function loadUserRole(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  if (!req.user) {
    next();
    return;
  }

  try {
    if (!req.user.role) {
      const role = await Role.findById(req.user.roleId);
      if (role) {
        req.user.role = role;
      }
    }
    next();
  } catch (error) {
    next(error);
  }
}
