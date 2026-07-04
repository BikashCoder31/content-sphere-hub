import { Role, IRole } from '../models/role.model.js';
import { User } from '../models/user.model.js';
import { PERMISSIONS, Permission } from '@content-sphere-hub/shared';
import type { CreateRoleInput, UpdateRoleInput } from '../schemas/user.schema.js';

/**
 * Role service error
 */
export class RoleError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = 'RoleError';
  }
}

/**
 * Role response
 */
export interface RoleResponse {
  id: string;
  name: string;
  slug: string;
  description?: string;
  permissions: string[];
  isSystem: boolean;
  isDefault: boolean;
  userCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Transform role document to response
 */
function toRoleResponse(role: IRole, userCount?: number): RoleResponse {
  return {
    id: role._id.toString(),
    name: role.name,
    slug: role.slug,
    description: role.description,
    permissions: role.permissions,
    isSystem: role.isSystem,
    isDefault: role.isDefault,
    userCount,
    createdAt: role.createdAt,
    updatedAt: role.updatedAt,
  };
}

/**
 * Get all roles
 */
export async function getRoles(includeSystem = true): Promise<RoleResponse[]> {
  const filter = includeSystem ? {} : { isSystem: false };
  const roles = await Role.find(filter).sort({ isSystem: -1, name: 1 });

  // Get user counts for each role
  const roleCounts = await User.aggregate([{ $group: { _id: '$roleId', count: { $sum: 1 } } }]);

  const countMap = new Map(roleCounts.map((r) => [r._id.toString(), r.count]));

  return roles.map((role) => toRoleResponse(role, countMap.get(role._id.toString()) || 0));
}

/**
 * Get role by ID
 */
export async function getRoleById(id: string): Promise<RoleResponse> {
  const role = await Role.findById(id);

  if (!role) {
    throw new RoleError('Role not found', 'ROLE_NOT_FOUND', 404);
  }

  const userCount = await User.countDocuments({ roleId: id });

  return toRoleResponse(role, userCount);
}

/**
 * Create new role
 */
export async function createRole(input: CreateRoleInput): Promise<RoleResponse> {
  const { name, slug, description, permissions, isDefault } = input;

  // Check slug uniqueness
  const existingRole = await Role.findOne({ slug });
  if (existingRole) {
    throw new RoleError('Role slug already exists', 'SLUG_EXISTS', 409);
  }

  // Validate permissions
  const validPermissions = Object.values(PERMISSIONS);
  const invalidPermissions = permissions.filter(
    (p) => !validPermissions.includes(p as (typeof validPermissions)[number])
  );

  if (invalidPermissions.length > 0) {
    throw new RoleError(
      `Invalid permissions: ${invalidPermissions.join(', ')}`,
      'INVALID_PERMISSIONS',
      400
    );
  }

  // If setting as default, unset other defaults
  if (isDefault) {
    await Role.updateMany({ isDefault: true }, { isDefault: false });
  }

  const role = await Role.create({
    name,
    slug,
    description,
    permissions,
    isSystem: false,
    isDefault,
  });

  return toRoleResponse(role, 0);
}

/**
 * Update role
 */
export async function updateRole(id: string, input: UpdateRoleInput): Promise<RoleResponse> {
  const role = await Role.findById(id);

  if (!role) {
    throw new RoleError('Role not found', 'ROLE_NOT_FOUND', 404);
  }

  // System roles can only have permissions updated
  if (role.isSystem) {
    if (input.name || input.isDefault !== undefined) {
      throw new RoleError(
        'Cannot modify system role name or default status',
        'SYSTEM_ROLE_PROTECTED',
        403
      );
    }
  }

  // Validate permissions if provided
  if (input.permissions) {
    const validPermissions = Object.values(PERMISSIONS);
    const invalidPermissions = input.permissions.filter(
      (p) => !validPermissions.includes(p as (typeof validPermissions)[number])
    );

    if (invalidPermissions.length > 0) {
      throw new RoleError(
        `Invalid permissions: ${invalidPermissions.join(', ')}`,
        'INVALID_PERMISSIONS',
        400
      );
    }
    role.permissions = input.permissions as Permission[];
  }

  // Update allowed fields
  if (input.name) role.name = input.name;
  if (input.description !== undefined) role.description = input.description;

  // Handle default role change
  if (input.isDefault !== undefined && input.isDefault !== role.isDefault) {
    if (input.isDefault) {
      await Role.updateMany({ isDefault: true }, { isDefault: false });
    }
    role.isDefault = input.isDefault;
  }

  await role.save();

  const userCount = await User.countDocuments({ roleId: id });

  return toRoleResponse(role, userCount);
}

/**
 * Delete role
 */
export async function deleteRole(id: string): Promise<void> {
  const role = await Role.findById(id);

  if (!role) {
    throw new RoleError('Role not found', 'ROLE_NOT_FOUND', 404);
  }

  if (role.isSystem) {
    throw new RoleError('Cannot delete system role', 'SYSTEM_ROLE_PROTECTED', 403);
  }

  // Check if role has users
  const userCount = await User.countDocuments({ roleId: id });
  if (userCount > 0) {
    throw new RoleError(
      `Cannot delete role with ${userCount} assigned users`,
      'ROLE_HAS_USERS',
      400
    );
  }

  await Role.deleteOne({ _id: id });
}

/**
 * Get all available permissions
 */
export function getPermissions(): { permission: string; resource: string; action: string }[] {
  return Object.values(PERMISSIONS).map((p) => {
    const [resource, action] = p.split(':');
    return { permission: p, resource, action };
  });
}
