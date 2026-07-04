import { ROLE_PERMISSIONS, ROLES, Permission } from '@content-sphere-hub/shared';
import { Role } from '../models/role.model.js';
import logger from '../config/logger.js';

/**
 * Default roles configuration
 */
const defaultRoles = [
  {
    name: 'Super Admin',
    slug: ROLES.SUPER_ADMIN,
    description: 'Full system access with all permissions',
    permissions: ROLE_PERMISSIONS[ROLES.SUPER_ADMIN],
    isSystem: true,
    isDefault: false,
  },
  {
    name: 'Admin',
    slug: ROLES.ADMIN,
    description: 'Administrative access to manage content and users',
    permissions: ROLE_PERMISSIONS[ROLES.ADMIN],
    isSystem: true,
    isDefault: false,
  },
  {
    name: 'Editor',
    slug: ROLES.EDITOR,
    description: 'Can edit and publish any content',
    permissions: ROLE_PERMISSIONS[ROLES.EDITOR],
    isSystem: true,
    isDefault: false,
  },
  {
    name: 'Author',
    slug: ROLES.AUTHOR,
    description: 'Can create and manage own content',
    permissions: ROLE_PERMISSIONS[ROLES.AUTHOR],
    isSystem: true,
    isDefault: false,
  },
  {
    name: 'Contributor',
    slug: ROLES.CONTRIBUTOR,
    description: 'Can create content but not publish',
    permissions: ROLE_PERMISSIONS[ROLES.CONTRIBUTOR],
    isSystem: true,
    isDefault: true, // Default role for new users
  },
  {
    name: 'Viewer',
    slug: ROLES.VIEWER,
    description: 'Read-only access to content',
    permissions: ROLE_PERMISSIONS[ROLES.VIEWER],
    isSystem: true,
    isDefault: false,
  },
];

/**
 * Seed default roles
 */
export async function seedRoles(): Promise<void> {
  logger.info('Seeding default roles...');

  for (const roleData of defaultRoles) {
    const existing = await Role.findOne({ slug: roleData.slug });

    if (existing) {
      // Update existing role's permissions if it's a system role
      if (existing.isSystem) {
        existing.permissions = roleData.permissions as Permission[];
        await existing.save();
        logger.info(`Updated role: ${roleData.name}`);
      } else {
        logger.info(`Skipped role (exists): ${roleData.name}`);
      }
    } else {
      await Role.create(roleData);
      logger.info(`Created role: ${roleData.name}`);
    }
  }

  logger.info('Roles seeding completed');
}

export default seedRoles;
