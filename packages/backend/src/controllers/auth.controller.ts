import { Request, Response, NextFunction } from 'express';
import { sendSuccess, sendError, ErrorCodes } from '../utils/response.js';
import * as authService from '../services/auth.service.js';
import type { AuthRequest } from '../middleware/auth.js';
import type {
  RegisterInput,
  LoginInput,
  RefreshTokenInput,
  ChangePasswordInput,
} from '../schemas/auth.schema.js';

/**
 * Register a new user
 * POST /api/v1/auth/register
 */
export async function register(
  req: Request<unknown, unknown, RegisterInput>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const result = await authService.register(req.body);

    // Set refresh token as httpOnly cookie
    setRefreshTokenCookie(res, result.tokens.refreshToken, result.tokens.refreshTokenExpiresAt);

    sendSuccess(
      res,
      {
        user: {
          _id: result.user._id?.toString() || (result.user as unknown as { id: string }).id,
          email: result.user.email,
          name: `${result.user.firstName}${result.user.lastName ? ' ' + result.user.lastName : ''}`,
          avatar: result.user.avatar,
          roleId: result.user.roleId?.toString(),
        },
        tokens: {
          accessToken: result.tokens.accessToken,
          refreshToken: result.tokens.refreshToken,
          expiresIn: Math.floor((result.tokens.accessTokenExpiresAt.getTime() - Date.now()) / 1000),
        },
      },
      201
    );
  } catch (error) {
    if (error instanceof authService.AuthError) {
      sendError(res, error.code, error.message, error.statusCode);
    } else {
      next(error);
    }
  }
}

/**
 * Login user
 * POST /api/v1/auth/login
 */
export async function login(
  req: Request<unknown, unknown, LoginInput>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const ipAddress = req.ip || req.socket.remoteAddress;
    const result = await authService.login(req.body, ipAddress);

    // Set refresh token as httpOnly cookie
    setRefreshTokenCookie(res, result.tokens.refreshToken, result.tokens.refreshTokenExpiresAt);

    sendSuccess(res, {
      user: {
        _id: result.user._id?.toString() || (result.user as unknown as { id: string }).id,
        email: result.user.email,
        name: `${result.user.firstName}${result.user.lastName ? ' ' + result.user.lastName : ''}`,
        avatar: result.user.avatar,
        roleId: result.user.roleId?.toString(),
      },
      tokens: {
        accessToken: result.tokens.accessToken,
        refreshToken: result.tokens.refreshToken,
        expiresIn: Math.floor((result.tokens.accessTokenExpiresAt.getTime() - Date.now()) / 1000),
      },
    });
  } catch (error) {
    if (error instanceof authService.AuthError) {
      sendError(res, error.code, error.message, error.statusCode);
    } else {
      next(error);
    }
  }
}

/**
 * Logout user
 * POST /api/v1/auth/logout
 */
export async function logout(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (req.user) {
      await authService.logout(req.user.id);
    }

    // Clear refresh token cookie
    clearRefreshTokenCookie(res);

    sendSuccess(res, { message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
}

/**
 * Refresh access token
 * POST /api/v1/auth/refresh
 */
export async function refreshToken(
  req: Request<unknown, unknown, RefreshTokenInput>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Try to get refresh token from cookie first, then body
    const token = req.cookies?.refreshToken || req.body.refreshToken;

    if (!token) {
      sendError(res, ErrorCodes.VALIDATION_ERROR, 'Refresh token is required', 400);
      return;
    }

    const result = await authService.refreshTokens(token);

    // Update refresh token cookie
    setRefreshTokenCookie(res, result.tokens.refreshToken, result.tokens.refreshTokenExpiresAt);

    sendSuccess(res, {
      user: {
        _id: result.user._id?.toString() || (result.user as unknown as { id: string }).id,
        email: result.user.email,
        name: `${result.user.firstName}${result.user.lastName ? ' ' + result.user.lastName : ''}`,
        avatar: result.user.avatar,
        roleId: result.user.roleId?.toString(),
      },
      tokens: {
        accessToken: result.tokens.accessToken,
        refreshToken: result.tokens.refreshToken,
        expiresIn: Math.floor((result.tokens.accessTokenExpiresAt.getTime() - Date.now()) / 1000),
      },
    });
  } catch (error) {
    // Clear cookie on refresh failure
    clearRefreshTokenCookie(res);

    if (error instanceof authService.AuthError) {
      sendError(res, error.code, error.message, error.statusCode);
    } else {
      next(error);
    }
  }
}

/**
 * Get current user profile
 * GET /api/v1/auth/me
 */
export async function me(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      sendError(res, ErrorCodes.UNAUTHORIZED, 'Authentication required', 401);
      return;
    }

    const profile = await authService.getCurrentUser(req.user.id);
    sendSuccess(res, profile);
  } catch (error) {
    if (error instanceof authService.AuthError) {
      sendError(res, error.code, error.message, error.statusCode);
    } else {
      next(error);
    }
  }
}

/**
 * Change password
 * POST /api/v1/auth/change-password
 */
export async function changePassword(
  req: AuthRequest & Request<unknown, unknown, ChangePasswordInput>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      sendError(res, ErrorCodes.UNAUTHORIZED, 'Authentication required', 401);
      return;
    }

    await authService.changePassword(req.user.id, req.body.currentPassword, req.body.newPassword);

    // Clear refresh token cookie (force re-login)
    clearRefreshTokenCookie(res);

    sendSuccess(res, { message: 'Password changed successfully' });
  } catch (error) {
    if (error instanceof authService.AuthError) {
      sendError(res, error.code, error.message, error.statusCode);
    } else {
      next(error);
    }
  }
}

/**
 * Set refresh token as httpOnly cookie
 */
function setRefreshTokenCookie(res: Response, token: string, expiresAt: Date): void {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    expires: expiresAt,
    path: '/api/v1/auth',
  });
}

/**
 * Clear refresh token cookie
 */
function clearRefreshTokenCookie(res: Response): void {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/api/v1/auth',
  });
}
