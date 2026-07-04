import { PERMISSIONS } from './permissions.js';

/**
 * Default role names
 */
export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  EDITOR: 'editor',
  AUTHOR: 'author',
  CONTRIBUTOR: 'contributor',
  VIEWER: 'viewer',
} as const;

export type RoleName = (typeof ROLES)[keyof typeof ROLES];

/**
 * Role display names
 */
export const ROLE_DISPLAY_NAMES: Record<RoleName, string> = {
  [ROLES.SUPER_ADMIN]: 'Super Admin',
  [ROLES.ADMIN]: 'Admin',
  [ROLES.EDITOR]: 'Editor',
  [ROLES.AUTHOR]: 'Author',
  [ROLES.CONTRIBUTOR]: 'Contributor',
  [ROLES.VIEWER]: 'Viewer',
};

/**
 * Role descriptions
 */
export const ROLE_DESCRIPTIONS: Record<RoleName, string> = {
  [ROLES.SUPER_ADMIN]: 'Full system access including admin management',
  [ROLES.ADMIN]: 'Administrative access without Super Admin management',
  [ROLES.EDITOR]: 'Can manage all content but limited user/settings access',
  [ROLES.AUTHOR]: 'Can create and manage their own content only',
  [ROLES.CONTRIBUTOR]: 'Can create draft content but cannot publish',
  [ROLES.VIEWER]: 'Read-only access to published content',
};

/**
 * Default permissions for each role
 */
export const ROLE_PERMISSIONS: Record<RoleName, string[]> = {
  [ROLES.SUPER_ADMIN]: ['*'], // All permissions

  [ROLES.ADMIN]: [
    'content:*',
    'media:*',
    'users:manage',
    'roles:read',
    'categories:*',
    'tags:*',
    'comments:*',
    'settings:*',
    'analytics:*',
    'notifications:*',
    'newsletter:*',
    'backup:*',
    'workflow:*',
  ],

  [ROLES.EDITOR]: [
    'content:*',
    'media:*',
    'users:read',
    'categories:*',
    'tags:*',
    'comments:*',
    'analytics:read',
    'notifications:read',
    'workflow:*',
  ],

  [ROLES.AUTHOR]: [
    PERMISSIONS.CONTENT_CREATE,
    PERMISSIONS.CONTENT_READ,
    PERMISSIONS.CONTENT_UPDATE_OWN,
    PERMISSIONS.CONTENT_DELETE_OWN,
    PERMISSIONS.MEDIA_CREATE,
    PERMISSIONS.MEDIA_READ,
    PERMISSIONS.MEDIA_UPDATE_OWN,
    PERMISSIONS.MEDIA_DELETE_OWN,
    PERMISSIONS.CATEGORIES_READ,
    PERMISSIONS.TAGS_READ,
    PERMISSIONS.ANALYTICS_READ_OWN,
    PERMISSIONS.WORKFLOW_SUBMIT,
  ],

  [ROLES.CONTRIBUTOR]: [
    PERMISSIONS.CONTENT_CREATE,
    PERMISSIONS.CONTENT_READ_OWN,
    PERMISSIONS.CONTENT_UPDATE_OWN,
    PERMISSIONS.MEDIA_CREATE,
    PERMISSIONS.MEDIA_READ,
    PERMISSIONS.CATEGORIES_READ,
    PERMISSIONS.TAGS_READ,
    PERMISSIONS.WORKFLOW_SUBMIT,
  ],

  [ROLES.VIEWER]: [
    PERMISSIONS.CONTENT_READ_PUBLISHED,
    PERMISSIONS.MEDIA_READ_PUBLIC,
    PERMISSIONS.CATEGORIES_READ,
    PERMISSIONS.TAGS_READ,
  ],
};

/**
 * System roles that cannot be deleted
 */
export const SYSTEM_ROLES: RoleName[] = [
  ROLES.SUPER_ADMIN,
  ROLES.ADMIN,
  ROLES.EDITOR,
  ROLES.AUTHOR,
  ROLES.CONTRIBUTOR,
  ROLES.VIEWER,
];

/**
 * Role hierarchy (higher index = more permissions)
 */
export const ROLE_HIERARCHY: RoleName[] = [
  ROLES.VIEWER,
  ROLES.CONTRIBUTOR,
  ROLES.AUTHOR,
  ROLES.EDITOR,
  ROLES.ADMIN,
  ROLES.SUPER_ADMIN,
];

/**
 * Check if role1 has higher or equal rank than role2
 */
export function hasHigherOrEqualRank(role1: RoleName, role2: RoleName): boolean {
  return ROLE_HIERARCHY.indexOf(role1) >= ROLE_HIERARCHY.indexOf(role2);
}
