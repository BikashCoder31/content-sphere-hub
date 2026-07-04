import * as bcrypt from 'bcryptjs';
import { User, IUser } from '../models/user.model.js';
import { Role, IRole } from '../models/role.model.js';
import { config } from '../config/env.js';
import type {
  UserListQueryParams,
  CreateUserInput,
  UpdateUserInput,
  UpdateUserStatusInput,
  UpdateProfileInput,
} from '../schemas/user.schema.js';

/**
 * User service error
 */
export class UserError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = 'UserError';
  }
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

/**
 * User response (without sensitive fields)
 */
export interface UserResponse {
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
  };
  status: string;
  theme: string;
  emailVerified: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Transform user document to response
 */
function toUserResponse(user: IUser & { role?: IRole }): UserResponse {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const populatedUser = user as any;
  const role = populatedUser.role || {};

  return {
    id: user._id.toString(),
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    displayName: user.displayName,
    avatar: user.avatar,
    bio: user.bio,
    role: {
      id: role._id?.toString() || user.roleId?.toString(),
      name: role.name || 'Unknown',
      slug: role.slug || 'unknown',
    },
    status: user.status,
    theme: user.theme,
    emailVerified: user.emailVerified,
    lastLoginAt: user.lastLoginAt,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

/**
 * Get paginated user list
 */
export async function getUsers(
  query: UserListQueryParams
): Promise<PaginatedResponse<UserResponse>> {
  const { page, limit, search, status, roleId, sortBy, sortOrder } = query;
  const skip = (page - 1) * limit;

  // Build filter
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filter: any = {};

  if (search) {
    filter.$or = [
      { email: { $regex: search, $options: 'i' } },
      { firstName: { $regex: search, $options: 'i' } },
      { lastName: { $regex: search, $options: 'i' } },
      { displayName: { $regex: search, $options: 'i' } },
    ];
  }

  if (status) {
    filter.status = status;
  }

  if (roleId) {
    filter.roleId = roleId;
  }

  // Build sort
  const sort: Record<string, 1 | -1> = {
    [sortBy]: sortOrder === 'asc' ? 1 : -1,
  };

  // Execute query
  const [users, total] = await Promise.all([
    User.find(filter).populate('role').sort(sort).skip(skip).limit(limit),
    User.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    data: users.map(toUserResponse),
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasMore: page < totalPages,
    },
  };
}

/**
 * Get user by ID
 */
export async function getUserById(id: string): Promise<UserResponse> {
  const user = await User.findById(id).populate('role');

  if (!user) {
    throw new UserError('User not found', 'USER_NOT_FOUND', 404);
  }

  return toUserResponse(user);
}

/**
 * Create new user (admin)
 */
export async function createUser(input: CreateUserInput): Promise<UserResponse> {
  const { email, password, firstName, lastName, displayName, roleId, status } = input;

  // Check if user exists
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw new UserError('Email already registered', 'EMAIL_EXISTS', 409);
  }

  // Get role (use provided or default)
  let role;
  if (roleId) {
    role = await Role.findById(roleId);
    if (!role) {
      throw new UserError('Role not found', 'ROLE_NOT_FOUND', 404);
    }
  } else {
    role = await Role.getDefaultRole();
    if (!role) {
      throw new UserError('Default role not configured', 'ROLE_NOT_FOUND', 500);
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
    displayName: displayName || `${firstName} ${lastName}`,
    roleId: role._id,
    status,
    emailVerified: status === 'active', // Auto-verify if admin creates as active
  });

  await user.populate('role');

  return toUserResponse(user);
}

/**
 * Update user (admin)
 */
export async function updateUser(
  id: string,
  input: UpdateUserInput,
  adminId: string
): Promise<UserResponse> {
  const user = await User.findById(id);

  if (!user) {
    throw new UserError('User not found', 'USER_NOT_FOUND', 404);
  }

  // Prevent self-role change or self-status change via admin endpoint
  if (id === adminId && (input.roleId || input.status)) {
    throw new UserError(
      'Cannot change your own role or status via admin endpoint',
      'SELF_MODIFICATION_NOT_ALLOWED',
      403
    );
  }

  // Validate role if provided
  if (input.roleId) {
    const role = await Role.findById(input.roleId);
    if (!role) {
      throw new UserError('Role not found', 'ROLE_NOT_FOUND', 404);
    }
    user.roleId = role._id;
  }

  // Update allowed fields
  if (input.firstName) user.firstName = input.firstName;
  if (input.lastName) user.lastName = input.lastName;
  if (input.displayName !== undefined) user.displayName = input.displayName;
  if (input.bio !== undefined) user.bio = input.bio;
  if (input.status) user.status = input.status;

  await user.save();
  await user.populate('role');

  return toUserResponse(user);
}

/**
 * Update user status
 */
export async function updateUserStatus(
  id: string,
  input: UpdateUserStatusInput,
  adminId: string
): Promise<UserResponse> {
  const user = await User.findById(id);

  if (!user) {
    throw new UserError('User not found', 'USER_NOT_FOUND', 404);
  }

  // Prevent self-status change
  if (id === adminId) {
    throw new UserError('Cannot change your own status', 'SELF_MODIFICATION_NOT_ALLOWED', 403);
  }

  user.status = input.status;

  // If suspending, invalidate refresh token
  if (input.status === 'suspended') {
    user.refreshTokenHash = undefined;
  }

  await user.save();
  await user.populate('role');

  return toUserResponse(user);
}

/**
 * Assign role to user
 */
export async function assignRole(
  userId: string,
  roleId: string,
  adminId: string
): Promise<UserResponse> {
  const user = await User.findById(userId);

  if (!user) {
    throw new UserError('User not found', 'USER_NOT_FOUND', 404);
  }

  // Prevent self-role change
  if (userId === adminId) {
    throw new UserError('Cannot change your own role', 'SELF_MODIFICATION_NOT_ALLOWED', 403);
  }

  const role = await Role.findById(roleId);
  if (!role) {
    throw new UserError('Role not found', 'ROLE_NOT_FOUND', 404);
  }

  user.roleId = role._id;
  await user.save();
  await user.populate('role');

  return toUserResponse(user);
}

/**
 * Delete user (soft delete by setting status)
 */
export async function deleteUser(id: string, adminId: string): Promise<void> {
  const user = await User.findById(id);

  if (!user) {
    throw new UserError('User not found', 'USER_NOT_FOUND', 404);
  }

  // Prevent self-deletion
  if (id === adminId) {
    throw new UserError(
      'Cannot delete your own account via admin endpoint',
      'SELF_MODIFICATION_NOT_ALLOWED',
      403
    );
  }

  // Soft delete: set status to inactive and clear sensitive data
  user.status = 'inactive';
  user.refreshTokenHash = undefined;
  await user.save();
}

/**
 * Get own profile
 */
export async function getProfile(userId: string): Promise<UserResponse> {
  const user = await User.findById(userId).populate('role');

  if (!user) {
    throw new UserError('User not found', 'USER_NOT_FOUND', 404);
  }

  return toUserResponse(user);
}

/**
 * Update own profile
 */
export async function updateProfile(
  userId: string,
  input: UpdateProfileInput
): Promise<UserResponse> {
  const user = await User.findById(userId);

  if (!user) {
    throw new UserError('User not found', 'USER_NOT_FOUND', 404);
  }

  // Update allowed profile fields
  if (input.firstName) user.firstName = input.firstName;
  if (input.lastName) user.lastName = input.lastName;
  if (input.displayName !== undefined) user.displayName = input.displayName;
  if (input.bio !== undefined) user.bio = input.bio;
  if (input.theme) user.theme = input.theme;

  await user.save();
  await user.populate('role');

  return toUserResponse(user);
}
