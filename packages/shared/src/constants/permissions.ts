/**
 * Permission constants following the pattern: resource:action
 */
export const PERMISSIONS = {
  // Content
  CONTENT_CREATE: 'content:create',
  CONTENT_READ: 'content:read',
  CONTENT_READ_OWN: 'content:read:own',
  CONTENT_READ_PUBLISHED: 'content:read:published',
  CONTENT_UPDATE: 'content:update',
  CONTENT_UPDATE_OWN: 'content:update:own',
  CONTENT_DELETE: 'content:delete',
  CONTENT_DELETE_OWN: 'content:delete:own',
  CONTENT_PUBLISH: 'content:publish',
  CONTENT_MANAGE: 'content:manage',

  // Media
  MEDIA_CREATE: 'media:create',
  MEDIA_READ: 'media:read',
  MEDIA_READ_PUBLIC: 'media:read:public',
  MEDIA_UPDATE: 'media:update',
  MEDIA_UPDATE_OWN: 'media:update:own',
  MEDIA_DELETE: 'media:delete',
  MEDIA_DELETE_OWN: 'media:delete:own',
  MEDIA_MANAGE: 'media:manage',

  // Users
  USERS_CREATE: 'users:create',
  USERS_READ: 'users:read',
  USERS_UPDATE: 'users:update',
  USERS_DELETE: 'users:delete',
  USERS_MANAGE: 'users:manage',

  // Roles
  ROLES_READ: 'roles:read',
  ROLES_CREATE: 'roles:create',
  ROLES_UPDATE: 'roles:update',
  ROLES_DELETE: 'roles:delete',
  ROLES_MANAGE: 'roles:manage',

  // Categories
  CATEGORIES_CREATE: 'categories:create',
  CATEGORIES_READ: 'categories:read',
  CATEGORIES_UPDATE: 'categories:update',
  CATEGORIES_DELETE: 'categories:delete',
  CATEGORIES_MANAGE: 'categories:manage',

  // Tags
  TAGS_CREATE: 'tags:create',
  TAGS_READ: 'tags:read',
  TAGS_UPDATE: 'tags:update',
  TAGS_DELETE: 'tags:delete',
  TAGS_MANAGE: 'tags:manage',

  // Comments
  COMMENTS_CREATE: 'comments:create',
  COMMENTS_READ: 'comments:read',
  COMMENTS_UPDATE: 'comments:update',
  COMMENTS_DELETE: 'comments:delete',
  COMMENTS_MODERATE: 'comments:moderate',
  COMMENTS_MANAGE: 'comments:manage',

  // Settings
  SETTINGS_READ: 'settings:read',
  SETTINGS_UPDATE: 'settings:update',
  SETTINGS_SECURITY: 'settings:security',
  SETTINGS_MANAGE: 'settings:manage',

  // Analytics
  ANALYTICS_READ: 'analytics:read',
  ANALYTICS_READ_OWN: 'analytics:read:own',
  ANALYTICS_EXPORT: 'analytics:export',
  ANALYTICS_MANAGE: 'analytics:manage',

  // Notifications
  NOTIFICATIONS_READ: 'notifications:read',
  NOTIFICATIONS_MANAGE: 'notifications:manage',

  // Newsletter
  NEWSLETTER_READ: 'newsletter:read',
  NEWSLETTER_CREATE: 'newsletter:create',
  NEWSLETTER_SEND: 'newsletter:send',
  NEWSLETTER_MANAGE: 'newsletter:manage',

  // Backup
  BACKUP_READ: 'backup:read',
  BACKUP_CREATE: 'backup:create',
  BACKUP_RESTORE: 'backup:restore',
  BACKUP_MANAGE: 'backup:manage',

  // Workflow
  WORKFLOW_SUBMIT: 'workflow:submit',
  WORKFLOW_APPROVE: 'workflow:approve',
  WORKFLOW_REJECT: 'workflow:reject',
  WORKFLOW_ASSIGN: 'workflow:assign',
  WORKFLOW_MANAGE: 'workflow:manage',
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

/**
 * All permission values as an array
 */
export const ALL_PERMISSIONS = Object.values(PERMISSIONS);
