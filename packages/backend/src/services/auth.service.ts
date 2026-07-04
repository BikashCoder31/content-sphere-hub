import * as bcrypt from 'bcryptjs';
import { User, IUser } from '../models/user.model.js';
import { Role } from '../models/role.model.js';
import { config } from '../config/env.js';
import {
  generateTokenPair,
  verifyRefreshToken,
  compareRefreshToken,
  TokenPair,
} from '../utils/jwt.js';
import type { RegisterInput, LoginInput } from '../schemas/auth.schema.js';

/**
 * Auth error types
 */
export class AuthError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 401
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

/**
 * Auth service response types
 */
export interface AuthResponse {
  user: Omit<IUser, 'passwordHash' | 'refreshTokenHash'>;
  tokens: TokenPair;
}

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName?: string;
  avatar?: string;
  bio?: string;
  role: {
    id: string;
    name: string;
    slug: string;
    permissions: string[];
  };
  status: string;
  theme: string;
  emailVerified: boolean;
  createdAt: Date;
}

/**
 * Register a new user
 */
export async function register(input: RegisterInput): Promise<AuthResponse> {
  const { email, password, name, firstName: inputFirstName, lastName: inputLastName, role: requestedRole } = input;

  // Handle name field - split into firstName/lastName if provided
  let firstName = inputFirstName;
  let lastName = inputLastName || '';
  
  if (name && !firstName) {
    const nameParts = name.trim().split(/\s+/);
    firstName = nameParts[0];
    lastName = nameParts.slice(1).join(' ') || '';
  }

  if (!firstName) {
    throw new AuthError('Name is required', 'VALIDATION_ERROR', 400);
  }

  // Check if user already exists
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw new AuthError('Email already registered', 'EMAIL_EXISTS', 409);
  }

  // Get the requested role or fall back to default
  let userRole;
  if (requestedRole) {
    userRole = await Role.findBySlug(requestedRole);
    if (!userRole) {
      throw new AuthError(`Role '${requestedRole}' not found`, 'ROLE_NOT_FOUND', 400);
    }
  } else {
    userRole = await Role.getDefaultRole();
    if (!userRole) {
      throw new AuthError('Default role not configured', 'ROLE_NOT_FOUND', 500);
    }
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, config.security.bcryptRounds);

  // Create user
  const user = await User.create({
    email: email.toLowerCase(),
    passwordHash,
    firstName,
    lastName,
    displayName: lastName ? `${firstName} ${lastName}` : firstName,
    roleId: userRole._id,
    status: 'active', // Active by default (set to 'pending' when email verification is enabled)
    emailVerified: false,
  });

  // Generate tokens
  const { tokens, refreshTokenHash } = await generateTokenPair(
    user._id.toString(),
    user.email,
    user.roleId.toString()
  );

  // Store refresh token hash
  user.refreshTokenHash = refreshTokenHash;
  await user.save();

  // Populate role for response
  await user.populate('role');

  return {
    user: user.toJSON() as unknown as Omit<IUser, 'passwordHash' | 'refreshTokenHash'>,
    tokens,
  };
}

/**
 * Login user
 */
export async function login(input: LoginInput, ipAddress?: string): Promise<AuthResponse> {
  const { email, password } = input;

  // Find user with password hash
  const user = await User.findOne({ email: email.toLowerCase() }).select(
    '+passwordHash +refreshTokenHash'
  );
  if (!user) {
    throw new AuthError('Invalid email or password', 'INVALID_CREDENTIALS');
  }

  // Check if account is locked
  if (user.isLocked()) {
    const lockMinutes = Math.ceil((user.lockedUntil!.getTime() - Date.now()) / 60000);
    throw new AuthError(
      `Account is locked. Try again in ${lockMinutes} minutes.`,
      'ACCOUNT_LOCKED',
      423
    );
  }

  // Check if account is active
  if (user.status === 'suspended') {
    throw new AuthError('Account is suspended', 'ACCOUNT_SUSPENDED', 403);
  }

  if (user.status === 'inactive') {
    throw new AuthError('Account is inactive', 'ACCOUNT_INACTIVE', 403);
  }

  // Verify password
  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) {
    // Increment failed attempts
    await user.incrementFailedAttempts();
    throw new AuthError('Invalid email or password', 'INVALID_CREDENTIALS');
  }

  // Reset failed attempts on successful login
  await user.resetFailedAttempts();

  // Generate new tokens
  const { tokens, refreshTokenHash } = await generateTokenPair(
    user._id.toString(),
    user.email,
    user.roleId.toString()
  );

  // Update user with new refresh token hash and login info
  user.refreshTokenHash = refreshTokenHash;
  user.lastLoginAt = new Date();
  user.lastLoginIp = ipAddress || undefined;
  await user.save();

  // Populate role for response
  await user.populate('role');

  return {
    user: user.toJSON() as unknown as Omit<IUser, 'passwordHash' | 'refreshTokenHash'>,
    tokens,
  };
}

/**
 * Logout user (invalidate refresh token)
 */
export async function logout(userId: string): Promise<void> {
  await User.findByIdAndUpdate(userId, {
    refreshTokenHash: null,
  });
}

/**
 * Refresh access token
 */
export async function refreshTokens(refreshToken: string): Promise<AuthResponse> {
  // Verify refresh token
  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw new AuthError('Invalid or expired refresh token', 'INVALID_REFRESH_TOKEN');
  }

  // Find user
  const user = await User.findById(payload.userId).select('+refreshTokenHash');
  if (!user) {
    throw new AuthError('User not found', 'USER_NOT_FOUND', 404);
  }

  // Check if refresh token hash matches
  if (!user.refreshTokenHash) {
    throw new AuthError('No active session', 'NO_SESSION');
  }

  const isTokenValid = await compareRefreshToken(refreshToken, user.refreshTokenHash);
  if (!isTokenValid) {
    // Possible token reuse attack - invalidate all sessions
    user.refreshTokenHash = undefined;
    await user.save();
    throw new AuthError('Token reuse detected', 'TOKEN_REUSE', 401);
  }

  // Check account status
  if (user.status === 'suspended' || user.status === 'inactive') {
    throw new AuthError('Account is not active', 'ACCOUNT_INACTIVE', 403);
  }

  // Generate new token pair (rotation)
  const { tokens, refreshTokenHash } = await generateTokenPair(
    user._id.toString(),
    user.email,
    user.roleId.toString()
  );

  // Update refresh token hash
  user.refreshTokenHash = refreshTokenHash;
  await user.save();

  // Populate role for response
  await user.populate('role');

  return {
    user: user.toJSON() as unknown as Omit<IUser, 'passwordHash' | 'refreshTokenHash'>,
    tokens,
  };
}

/**
 * Get current user profile
 */
export async function getCurrentUser(userId: string): Promise<UserProfile> {
  const user = await User.findById(userId).populate('role');
  if (!user) {
    throw new AuthError('User not found', 'USER_NOT_FOUND', 404);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const populatedUser = user as any;
  const role = populatedUser.role as {
    _id: string;
    name: string;
    slug: string;
    permissions: string[];
  };

  return {
    id: user._id.toString(),
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    displayName: user.displayName,
    avatar: user.avatar,
    bio: user.bio,
    role: {
      id: role._id.toString(),
      name: role.name,
      slug: role.slug,
      permissions: role.permissions,
    },
    status: user.status,
    theme: user.theme,
    emailVerified: user.emailVerified,
    createdAt: user.createdAt,
  };
}

/**
 * Change user password
 */
export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<void> {
  const user = await User.findById(userId).select('+passwordHash');
  if (!user) {
    throw new AuthError('User not found', 'USER_NOT_FOUND', 404);
  }

  // Verify current password
  const isPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!isPasswordValid) {
    throw new AuthError('Current password is incorrect', 'INVALID_PASSWORD');
  }

  // Hash new password
  user.passwordHash = await bcrypt.hash(newPassword, config.security.bcryptRounds);
  user.passwordChangedAt = new Date();

  // Invalidate refresh token (force re-login)
  user.refreshTokenHash = undefined;

  await user.save();
}
