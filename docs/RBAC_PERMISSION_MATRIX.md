# Content Sphere Hub - RBAC Permission Matrix

> **Purpose:** Define roles, permissions, and access control  
> **Version:** 1.0  
> **Created:** July 4, 2026

---

## 1. Permission String Format

Permissions follow the pattern: `resource:action`

**Resources:**
- `content` - Articles, pages, blogs, news
- `media` - Files, images, videos
- `users` - User accounts
- `roles` - Role management
- `categories` - Content categories
- `tags` - Content tags
- `comments` - User comments
- `settings` - System settings
- `analytics` - Dashboard and analytics
- `notifications` - System notifications
- `newsletter` - Subscriber and campaigns
- `backup` - Backup and restore
- `workflow` - Editorial workflow

**Actions:**
- `create` - Create new resources
- `read` - View resources
- `update` - Modify resources
- `delete` - Remove resources
- `publish` - Publish content
- `manage` - Full control including admin functions

---

## 2. Default Roles

### Super Admin

**Description:** Full system access. Can manage all aspects including other admins.

**Permissions:** All permissions (*)

### Admin

**Description:** Administrative access without Super Admin management capabilities.

**Permissions:**
```
content:*
media:*
users:manage
roles:read
categories:*
tags:*
comments:*
settings:*
analytics:*
notifications:*
newsletter:*
backup:*
workflow:*
```

### Editor

**Description:** Can manage all content but limited user and settings access.

**Permissions:**
```
content:*
media:*
users:read
categories:*
tags:*
comments:*
analytics:read
notifications:read
workflow:*
```

### Author

**Description:** Can create and manage their own content only.

**Permissions:**
```
content:create
content:read
content:update:own
content:delete:own
media:create
media:read
media:update:own
media:delete:own
categories:read
tags:read
analytics:read:own
```

### Contributor

**Description:** Can create draft content but cannot publish.

**Permissions:**
```
content:create
content:read:own
content:update:own
media:create
media:read
categories:read
tags:read
```

### Viewer

**Description:** Read-only access to published content.

**Permissions:**
```
content:read:published
media:read:public
categories:read
tags:read
```

---

## 3. Permission Matrix by Role

### Content Permissions

| Action | Super Admin | Admin | Editor | Author | Contributor | Viewer |
|--------|-------------|-------|--------|--------|-------------|--------|
| Create | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Read All | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Read Own | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Read Published | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Update All | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Update Own | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Delete All | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Delete Own | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Publish | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Unpublish | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |

### Media Permissions

| Action | Super Admin | Admin | Editor | Author | Contributor | Viewer |
|--------|-------------|-------|--------|--------|-------------|--------|
| Upload | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| View All | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| View Public | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Update All | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Update Own | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Delete All | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Delete Own | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |

### User Management Permissions

| Action | Super Admin | Admin | Editor | Author | Contributor | Viewer |
|--------|-------------|-------|--------|--------|-------------|--------|
| View All | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| View Profile | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Create | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Update | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Delete | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Assign Roles | ✅ | ✅* | ❌ | ❌ | ❌ | ❌ |
| Manage Admins | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |

*Admin cannot assign Super Admin role

### Role Management Permissions

| Action | Super Admin | Admin | Editor | Author | Contributor | Viewer |
|--------|-------------|-------|--------|--------|-------------|--------|
| View | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Create | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Update | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Delete | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |

### Category & Tag Permissions

| Action | Super Admin | Admin | Editor | Author | Contributor | Viewer |
|--------|-------------|-------|--------|--------|-------------|--------|
| View | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Create | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Update | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Delete | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |

### Settings Permissions

| Action | Super Admin | Admin | Editor | Author | Contributor | Viewer |
|--------|-------------|-------|--------|--------|-------------|--------|
| View | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Update | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Security Settings | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |

### Analytics Permissions

| Action | Super Admin | Admin | Editor | Author | Contributor | Viewer |
|--------|-------------|-------|--------|--------|-------------|--------|
| View All | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| View Own | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Export | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |

### Workflow Permissions

| Action | Super Admin | Admin | Editor | Author | Contributor | Viewer |
|--------|-------------|-------|--------|--------|-------------|--------|
| Submit for Review | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Approve | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Reject | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Request Changes | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Assign Reviewers | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |

---

## 4. Permission Constants

```typescript
// packages/shared/src/constants/permissions.ts

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

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];
```

---

## 5. Role Definitions

```typescript
// packages/shared/src/constants/roles.ts

import { PERMISSIONS } from './permissions';

export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  EDITOR: 'editor',
  AUTHOR: 'author',
  CONTRIBUTOR: 'contributor',
  VIEWER: 'viewer',
} as const;

export type RoleName = typeof ROLES[keyof typeof ROLES];

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
    'content:create',
    'content:read',
    'content:update:own',
    'content:delete:own',
    'media:create',
    'media:read',
    'media:update:own',
    'media:delete:own',
    'categories:read',
    'tags:read',
    'analytics:read:own',
    'workflow:submit',
  ],
  
  [ROLES.CONTRIBUTOR]: [
    'content:create',
    'content:read:own',
    'content:update:own',
    'media:create',
    'media:read',
    'categories:read',
    'tags:read',
    'workflow:submit',
  ],
  
  [ROLES.VIEWER]: [
    'content:read:published',
    'media:read:public',
    'categories:read',
    'tags:read',
  ],
};
```

---

## 6. Permission Checking

```typescript
// packages/backend/src/middleware/rbac.middleware.ts

import { Request, Response, NextFunction } from 'express';
import { ROLE_PERMISSIONS, RoleName } from '@content-sphere-hub/shared';

function hasPermission(
  userPermissions: string[],
  requiredPermission: string
): boolean {
  // Super admin has all permissions
  if (userPermissions.includes('*')) {
    return true;
  }

  // Check exact match
  if (userPermissions.includes(requiredPermission)) {
    return true;
  }

  // Check wildcard (e.g., 'content:*' matches 'content:create')
  const [resource, action] = requiredPermission.split(':');
  if (userPermissions.includes(`${resource}:*`)) {
    return true;
  }

  return false;
}

export function requirePermission(permission: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Get role permissions + user overrides
    const rolePermissions = ROLE_PERMISSIONS[user.role as RoleName] || [];
    const allPermissions = [...rolePermissions, ...user.permissionOverrides];

    if (!hasPermission(allPermissions, permission)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    next();
  };
}

// Usage in routes
router.post(
  '/content',
  authenticate,
  requirePermission(PERMISSIONS.CONTENT_CREATE),
  contentController.create
);
```

---

## 7. Ownership Checks

For `:own` permissions, also verify ownership:

```typescript
export function requireOwnership(resourceType: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    const resourceId = req.params.id;

    // Super admin and admin bypass ownership
    if (user.role === 'super_admin' || user.role === 'admin') {
      return next();
    }

    // Get the resource and check ownership
    let resource;
    switch (resourceType) {
      case 'content':
        resource = await Content.findById(resourceId);
        if (resource?.authorId.toString() !== user._id.toString()) {
          return res.status(403).json({ message: 'Not your content' });
        }
        break;
      case 'media':
        resource = await Media.findById(resourceId);
        if (resource?.uploadedById.toString() !== user._id.toString()) {
          return res.status(403).json({ message: 'Not your media' });
        }
        break;
    }

    next();
  };
}
```

---

## 8. Custom Roles

Admins can create custom roles with specific permissions:

```typescript
interface IRole {
  _id: ObjectId;
  name: string;
  slug: string;
  description?: string;
  permissions: string[];
  isSystem: boolean; // System roles cannot be deleted
  createdAt: Date;
  updatedAt: Date;
}
```

**Constraints:**
- System roles (super_admin, admin, etc.) cannot be deleted
- Custom roles cannot include `*` (all permissions)
- Custom roles cannot exceed Admin permissions
- Only Super Admin can create/modify roles

---

*RBAC Permission Matrix Version: 1.0*  
*Created: July 4, 2026*
