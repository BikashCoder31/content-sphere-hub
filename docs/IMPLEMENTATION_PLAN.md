# Content Sphere Hub - Implementation Plan

> **Project:** Content Sphere Hub  
> **Version:** v3.1  
> **Total Sprints:** 24 (Phase A: 12 MVP, Phase B: 8 Production, Phase C: 4 Advanced)  
> **Estimated Duration:** 12-16 weeks

---

## Sprint Overview

### Phase A — Foundation and MVP (Sprints 0-12)

| Sprint | Name | Duration | Status |
|--------|------|----------|--------|
| 0 | Planning Cleanup and Repository Rules | 1 day | ✅ Complete |
| 1 | TypeScript Monorepo Setup | 2 days | ✅ Complete |
| 2 | Backend Core Setup | 2 days | ✅ Complete |
| 3 | Database Models and Seed System | 2 days | ✅ Complete |
| 4 | Authentication Core | 3 days | ✅ Complete |
| 5 | RBAC and User Management | 2 days | ✅ Complete |
| 6 | Frontend Foundation | 3 days | ✅ Complete |
| 7 | Content CRUD API | 3 days | ✅ Complete |
| 8 | TipTap Editor & Content UI | 3 days | ✅ Complete |
| 9 | Local Media Library MVP | 3 days | Not Started |
| 10 | Categories, Tags, and MongoDB Search | 2 days | Not Started |
| 11 | SEO, Dashboard MVP, and Settings | 2 days | Not Started |
| 12 | Docker Self-Hosted MVP Deployment | 2 days | Not Started |

### Phase B — Production Essentials (Sprints 13-20)

| Sprint | Name | Duration | Status |
|--------|------|----------|--------|
| 13 | Email, Verification, Password Reset | 3 days | Not Started |
| 14 | OAuth, 2FA, and Session Management | 3 days | Not Started |
| 15 | Revisions, Scheduling, and Trash | 3 days | Not Started |
| 16 | Notifications and Real-Time Events | 3 days | Not Started |
| 17 | Workflow and Editorial Calendar | 3 days | Not Started |
| 18 | Comments and Moderation | 3 days | Not Started |
| 19 | Newsletter and Subscribers | 3 days | Not Started |
| 20 | Storage Providers, Backups, Restore | 3 days | Not Started |

### Phase C — Advanced Production Features (Sprints 21-24)

| Sprint | Name | Duration | Status |
|--------|------|----------|--------|
| 21 | Advanced SEO, Webhooks, API Keys | 3 days | Not Started |
| 22 | i18n, Accessibility, PWA, UX Polish | 3 days | Not Started |
| 23 | Optional AI Features | 3 days | Not Started |
| 24 | Final Hardening, Testing, Documentation | 4 days | Not Started |

---

## Detailed Sprint Plans

---

### Sprint 0: Planning Cleanup and Repository Rules

**Goal:** Prepare the project for clean implementation.

**Status:** ✅ Complete

**Tasks:**

| ID | Task | Status |
|----|------|--------|
| 0.1 | Apply v3.1 corrections to design document | ✅ Complete |
| 0.2 | Remove completion ticks from all planned features | ✅ Complete |
| 0.3 | Add status tracking rules documentation | ✅ Complete |
| 0.4 | Confirm monorepo structure | ✅ Complete |
| 0.5 | Create environment variables documentation | ✅ Complete |
| 0.6 | Create security guide | ✅ Complete |
| 0.7 | Create RBAC permission matrix | ✅ Complete |
| 0.8 | Create .env.example | ✅ Complete |
| 0.9 | Create README.md | ✅ Complete |

**Deliverables:**
- [x] `docs/CMS_DESIGN_DOCUMENT_v3_1.md`
- [x] `docs/IMPLEMENTATION_PLAN.md`
- [x] `docs/STATUS_TRACKING_RULES.md`
- [x] `docs/ENVIRONMENT_VARIABLES.md`
- [x] `docs/SECURITY_GUIDE.md`
- [x] `docs/RBAC_PERMISSION_MATRIX.md`
- [x] `.env.example`
- [x] `README.md`

**Acceptance Criteria:**
- ✅ No planned feature is marked as completed
- ✅ Feature statuses use proper status values
- ✅ Project has clear MVP scope before coding starts

---

### Sprint 1: TypeScript Monorepo Setup

**Goal:** Create the TypeScript foundation.

**Status:** ✅ Complete

**Tasks:**

| ID | Task | Status |
|----|------|--------|
| 1.1 | Create root package.json with workspaces | ✅ Complete |
| 1.2 | Create pnpm-workspace.yaml | ✅ Complete |
| 1.3 | Create tsconfig.base.json | ✅ Complete |
| 1.4 | Create packages/backend structure | ✅ Complete |
| 1.5 | Create packages/frontend structure | ✅ Complete |
| 1.6 | Create packages/shared structure | ✅ Complete |
| 1.7 | Configure ESLint | ✅ Complete |
| 1.8 | Configure Prettier | ✅ Complete |
| 1.9 | Add shared type exports | ✅ Complete |
| 1.10 | Add root scripts (dev, build, lint, test) | ✅ Complete |
| 1.11 | Verify all packages compile | ✅ Complete |

**Deliverables:**
- [x] Working TypeScript monorepo
- [x] Shared TypeScript package (75 permissions, 6 roles, Zod schemas)
- [x] TypeScript build setup (NodeNext resolution)
- [x] Formatting/linting setup (Prettier + ESLint)

**Acceptance Criteria:**
- ✅ `pnpm install` works from root
- ✅ Backend, frontend, and shared packages compile
- ✅ Lint script runs without fatal errors
- ✅ Shared types are importable from backend and frontend

---

### Sprint 2: Backend Core Setup

**Goal:** Build the backend foundation.

**Status:** ✅ Complete

**Tasks:**

| ID | Task | Status |
|----|------|--------|
| 2.1 | Create Express app in TypeScript | ✅ Complete |
| 2.2 | Add environment config loader with Zod validation | ✅ Complete |
| 2.3 | Add global error handler | ✅ Complete |
| 2.4 | Add request logging (Winston/Pino) | ✅ Complete |
| 2.5 | Add Helmet security headers | ✅ Complete |
| 2.6 | Add CORS configuration | ✅ Complete |
| 2.7 | Add rate limiter middleware | ✅ Complete |
| 2.8 | Add health check route | ✅ Complete |
| 2.9 | Add API version prefix (/api/v1) | ✅ Complete |
| 2.10 | Create base response utilities | ✅ Complete |

**Deliverables:**
- [x] `packages/backend/src/app.ts`
- [x] `packages/backend/src/index.ts`
- [x] Core middleware (validate, errorHandler)
- [x] `/api/v1/health` endpoint
- [x] `docker-compose.yml` for dev services

**Acceptance Criteria:**
- ✅ Backend starts successfully
- ✅ `/api/v1/health` returns healthy response
- ✅ Invalid environment variables fail early with clear errors

---

### Sprint 3: Database Models and Seed System

**Goal:** Create the core MongoDB models.

**Status:** ✅ Complete

**Tasks:**

| ID | Task | Status |
|----|------|--------|
| 3.1 | Configure MongoDB connection | ✅ Complete |
| 3.2 | Create User model (with passwordHash) | ✅ Complete |
| 3.3 | Create Role model | ✅ Complete |
| 3.4 | Create Permission constants | ✅ Complete |
| 3.5 | Create Content model (with categoryIds, tagIds) | ✅ Complete |
| 3.6 | Create Category model | ✅ Complete |
| 3.7 | Create Tag model | ✅ Complete |
| 3.8 | Create Media model (with detectedMimeType) | ✅ Complete |
| 3.9 | Create Settings model | ✅ Complete |
| 3.10 | Add database indexes | ✅ Complete |
| 3.11 | Create seed script for default roles | ✅ Complete |
| 3.12 | Create seed script for default admin user | ✅ Complete |

**Deliverables:**
- [x] Mongoose models with TypeScript interfaces (7 models)
- [x] Database connection configuration
- [x] Seed scripts (roles, admin, settings)
- [x] Default roles and permissions

**Acceptance Criteria:**
- ✅ MongoDB connects using `MONGODB_URI`
- ✅ Default admin can be seeded
- ✅ Indexes are defined
- ✅ Models use corrected v3.1 field names

---

### Sprint 4: Authentication Core

**Goal:** Implement secure MVP authentication.

**Status:** ✅ Complete

**Tasks:**

| ID | Task | Status |
|----|------|--------|
| 4.1 | Create auth validation schemas (Zod) | ✅ Complete |
| 4.2 | Create register endpoint | ✅ Complete |
| 4.3 | Create login endpoint | ✅ Complete |
| 4.4 | Create logout endpoint | ✅ Complete |
| 4.5 | Create refresh token endpoint | ✅ Complete |
| 4.6 | Create current user endpoint | ✅ Complete |
| 4.7 | Implement password hashing (bcrypt) | ✅ Complete |
| 4.8 | Implement JWT access token generation | ✅ Complete |
| 4.9 | Implement JWT refresh token generation | ✅ Complete |
| 4.10 | Store hashed refresh tokens (not raw) | ✅ Complete |
| 4.11 | Implement refresh token rotation | ✅ Complete |
| 4.12 | Add auth-specific rate limiting | ✅ Complete |
| 4.13 | Create auth middleware (JWT verify) | ✅ Complete |
| 4.14 | Handle failed login attempts | ✅ Complete |
| 4.15 | Write auth unit tests | Deferred to Sprint 12 |

**Deliverables:**
- [x] Auth routes, controller, service
- [x] JWT utilities (access + refresh tokens)
- [x] Refresh token rotation with reuse detection
- [x] Auth middleware (authenticate, requirePermissions, requireRole)
- [ ] Auth tests (deferred)

**Acceptance Criteria:**
- ✅ User can register and login
- ✅ Access token works for protected routes
- ✅ Refresh token rotation works
- ✅ Raw refresh tokens are NOT stored in database
- ✅ Failed login attempts are tracked (5 attempts → 15min lockout)

---

### Sprint 5: RBAC and User Management

**Goal:** Add role-based access and user administration.

**Status:** ✅ Complete

**Tasks:**

| ID | Task | Status |
|----|------|--------|
| 5.1 | Create RBAC middleware | ✅ Complete |
| 5.2 | Create permission checking utility | ✅ Complete |
| 5.3 | Create user list endpoint (paginated) | ✅ Complete |
| 5.4 | Create user detail endpoint | ✅ Complete |
| 5.5 | Create update user endpoint | ✅ Complete |
| 5.6 | Create activate/deactivate user endpoint | ✅ Complete |
| 5.7 | Create role assignment endpoint | ✅ Complete |
| 5.8 | Create profile endpoint | ✅ Complete |
| 5.9 | Create profile update endpoint | ✅ Complete |
| 5.10 | Create roles CRUD endpoints | ✅ Complete |
| 5.11 | Write RBAC tests | Deferred to Sprint 12 |

**Deliverables:**
- [x] RBAC system (requirePermissions, requireRole middleware)
- [x] User management API (CRUD, pagination, search, filtering)
- [x] Profile API (get/update own profile)
- [x] Role management API (CRUD, permission validation)
- [ ] RBAC tests (deferred)

**Acceptance Criteria:**
- ✅ Super Admin can manage users
- ✅ Admin permissions are enforced on backend
- ✅ Unauthorized users cannot access restricted routes
- ✅ Permission strings follow pattern: `resource:action`

---

### Sprint 6: Frontend Foundation

**Goal:** Create the frontend base application.

**Status:** ✅ Complete

**Tasks:**

| ID | Task | Status |
|----|------|--------|
| 6.1 | Create Vite + React + TypeScript app | ✅ Complete |
| 6.2 | Configure Tailwind CSS | ✅ Complete |
| 6.3 | Configure React Router v6 | ✅ Complete |
| 6.4 | Configure Redux Toolkit + RTK Query | ✅ Complete |
| 6.5 | Create auth slice | ✅ Complete |
| 6.6 | Create auth API (RTK Query) | ✅ Complete |
| 6.7 | Create protected route wrapper | ✅ Complete |
| 6.8 | Create dashboard layout | ✅ Complete |
| 6.9 | Create auth layout | ✅ Complete |
| 6.10 | Create login page | ✅ Complete |
| 6.11 | Create register page | ✅ Complete |
| 6.12 | Implement theme context (dark/light/system) | ✅ Complete |
| 6.13 | Create base UI components (Button, Input, etc.) | ✅ Complete |
| 6.14 | Implement token storage and auto-refresh | ✅ Complete |

**Deliverables:**
- [x] Frontend app shell (Vite + React + TypeScript)
- [x] Auth pages (Login, Register)
- [x] Dashboard layout with sidebar navigation
- [x] Theme system (dark/light/system)
- [x] RTK Query API client with auto-refresh

**Acceptance Criteria:**
- ✅ User can login from frontend
- ✅ Protected dashboard works
- ✅ Theme switching works
- ✅ API errors display properly
- ✅ Token refresh works automatically

---

### Sprint 7: Content CRUD API

**Goal:** Implement the backend content system.

**Status:** ✅ Complete

**Tasks:**

| ID | Task | Status |
|----|------|--------|
| 7.1 | Create content validation schemas | ✅ Complete |
| 7.2 | Create slug generation utility | ✅ Complete |
| 7.3 | Create content service | ✅ Complete |
| 7.4 | Create content controller | ✅ Complete |
| 7.5 | Create content routes | ✅ Complete |
| 7.6 | Implement content status handling | ✅ Complete |
| 7.7 | Implement visibility handling | ✅ Complete |
| 7.8 | Implement author ownership rules | ✅ Complete |
| 7.9 | Implement pagination | ✅ Complete |
| 7.10 | Implement filtering | ✅ Complete |
| 7.11 | Implement soft delete (trash) | ✅ Complete |
| 7.12 | Implement bulk operations | ✅ Complete |

**Deliverables:**
- Content CRUD API
- Slug utility with uniqueness
- Pagination and filtering
- Content permissions
- Bulk operations

**Acceptance Criteria:**
- ✅ Users can CRUD content based on permissions
- ✅ Slugs are unique and auto-generated
- ✅ Lists are paginated with filters
- ✅ Soft delete (trash) is supported
- ✅ Authors can only edit their own content
- ✅ Admins can edit all content

---

### Sprint 8: TipTap Editor and Content UI

**Goal:** Build the content editor experience.

**Status:** ✅ Complete

**Tasks:**

| ID | Task | Status |
|----|------|--------|
| 8.1 | Install TipTap dependencies | ✅ Complete |
| 8.2 | Create TipTap editor component | ✅ Complete |
| 8.3 | Add heading extension | ✅ Complete |
| 8.4 | Add text formatting (bold, italic, etc.) | ✅ Complete |
| 8.5 | Add link extension | ✅ Complete |
| 8.6 | Add image extension | ✅ Complete |
| 8.7 | Add code block extension | ✅ Complete |
| 8.8 | Add table extension | ✅ Complete |
| 8.9 | Add blockquote and list extensions | ✅ Complete |
| 8.10 | Create editor toolbar | ✅ Complete |
| 8.11 | Implement HTML sanitization (backend) | ✅ Complete |
| 8.12 | Create content API slice (RTK Query) | ✅ Complete |
| 8.13 | Create content list page | ✅ Complete |
| 8.14 | Create content create page | ✅ Complete |
| 8.15 | Create content edit page | ✅ Complete |
| 8.16 | Implement autosave | ✅ Complete |
| 8.17 | Add unsaved changes warning | ✅ Complete |
| 8.18 | Add word count and reading time | ✅ Complete |

**Deliverables:**
- TipTap editor with extensions
- Content list page
- Content create/edit pages
- Autosave functionality
- Preview page

**Acceptance Criteria:**
- Editor saves structured JSON (JSONContent)
- HTML is sanitized before storage
- Plain text is generated for search
- Autosave works reliably
- User sees save indicator

---

### Sprint 9: Local Media Library MVP

**Goal:** Implement safe local media upload.

**Status:** Not Started

**Tasks:**

| ID | Task | Status |
|----|------|--------|
| 9.1 | Create storage provider interface | Not Started |
| 9.2 | Implement local storage provider | Not Started |
| 9.3 | Configure Multer for uploads | Not Started |
| 9.4 | Implement MIME validation | Not Started |
| 9.5 | Implement magic byte validation (file-type) | Not Started |
| 9.6 | Implement file size limits | Not Started |
| 9.7 | Create media service | Not Started |
| 9.8 | Create media controller | Not Started |
| 9.9 | Create media routes | Not Started |
| 9.10 | Implement image optimization (Sharp) | Not Started |
| 9.11 | Generate thumbnails (small, medium, large) | Not Started |
| 9.12 | Create media API (RTK Query) | Not Started |
| 9.13 | Create media library page | Not Started |
| 9.14 | Create media grid component | Not Started |
| 9.15 | Create media uploader (drag & drop) | Not Started |
| 9.16 | Create media detail component | Not Started |
| 9.17 | Create media picker modal | Not Started |
| 9.18 | Integrate media picker with TipTap | Not Started |

**Deliverables:**
- Media upload API
- Local storage provider
- Media library UI
- Media picker component

**Acceptance Criteria:**
- Upload rejects invalid MIME types
- Upload rejects disguised files (magic byte check)
- Upload rejects oversized files
- Images generate thumbnails
- Content editor can select media

---

### Sprint 10: Categories, Tags, and MongoDB Search

**Goal:** Add organization and basic search.

**Status:** Not Started

**Tasks:**

| ID | Task | Status |
|----|------|--------|
| 10.1 | Create category service and routes | Not Started |
| 10.2 | Create tag service and routes | Not Started |
| 10.3 | Implement nested category support | Not Started |
| 10.4 | Implement category/tag assignment to content | Not Started |
| 10.5 | Create search provider interface | Not Started |
| 10.6 | Implement MongoDB search provider | Not Started |
| 10.7 | Add MongoDB text index | Not Started |
| 10.8 | Create content search endpoint | Not Started |
| 10.9 | Create category UI (CRUD + tree view) | Not Started |
| 10.10 | Create tag UI (CRUD + list) | Not Started |
| 10.11 | Create category select component | Not Started |
| 10.12 | Create tag multi-select component | Not Started |
| 10.13 | Add search to content list page | Not Started |

**Deliverables:**
- Category API and UI
- Tag API and UI
- Search service abstraction
- MongoDB search provider

**Acceptance Criteria:**
- Content can use multiple categories and tags
- Search works across title, excerpt, body
- Search uses provider abstraction
- Results are paginated

---

### Sprint 11: SEO, Dashboard MVP, and Settings

**Goal:** Add CMS admin essentials.

**Status:** Not Started

**Tasks:**

| ID | Task | Status |
|----|------|--------|
| 11.1 | Add SEO fields to content form | Not Started |
| 11.2 | Add slug editor with validation | Not Started |
| 11.3 | Add Open Graph fields | Not Started |
| 11.4 | Add Twitter Card fields | Not Started |
| 11.5 | Create dashboard stats endpoint | Not Started |
| 11.6 | Create recent activity endpoint | Not Started |
| 11.7 | Create dashboard page | Not Started |
| 11.8 | Create stats cards | Not Started |
| 11.9 | Create activity feed component | Not Started |
| 11.10 | Create settings service | Not Started |
| 11.11 | Create general settings UI | Not Started |
| 11.12 | Create security settings UI | Not Started |
| 11.13 | Create content settings UI | Not Started |

**Deliverables:**
- SEO panel in content editor
- Dashboard page
- Settings page
- Activity feed

**Acceptance Criteria:**
- Content can save SEO metadata
- Dashboard shows basic stats
- Settings can be read/updated by admin

---

### Sprint 12: Docker Self-Hosted MVP Deployment

**Goal:** Make the MVP deployable.

**Status:** Not Started

**Tasks:**

| ID | Task | Status |
|----|------|--------|
| 12.1 | Create backend Dockerfile | Not Started |
| 12.2 | Create frontend Dockerfile | Not Started |
| 12.3 | Create docker-compose.yml | Not Started |
| 12.4 | Add MongoDB service | Not Started |
| 12.5 | Add Redis service | Not Started |
| 12.6 | Create Nginx reverse proxy config | Not Started |
| 12.7 | Configure uploads volume | Not Started |
| 12.8 | Create production .env.example | Not Started |
| 12.9 | Write deployment documentation | Not Started |
| 12.10 | Test full deployment | Not Started |

**Deliverables:**
- Dockerized MVP
- `docker-compose.yml`
- Nginx config
- Deployment guide

**Acceptance Criteria:**
- Project runs with `docker-compose up`
- Frontend can call backend
- Uploads persist using volume
- Health check works in container

---

## MVP Completion Checklist

The MVP (Sprints 0-12) is complete when ALL of these are done:

| Area | Status |
|------|--------|
| TypeScript monorepo setup | Not Started |
| Backend core setup | Not Started |
| MongoDB connection and models | Not Started |
| Auth with refresh token rotation | Not Started |
| RBAC | Not Started |
| Frontend auth and dashboard layout | Not Started |
| Content CRUD | Not Started |
| TipTap editor | Not Started |
| Local media upload with MIME + magic byte validation | Not Started |
| Categories and tags | Not Started |
| MongoDB text search | Not Started |
| SEO fields | Not Started |
| Dashboard MVP | Not Started |
| Settings MVP | Not Started |
| Docker deployment | Not Started |

---

## Definition of Done

A sprint can be marked **Completed** only when:

1. All required files are created
2. Feature works through API (if backend)
3. Feature works through UI (if UI is part of sprint)
4. Backend validation exists
5. Backend permission checks exist
6. Errors are handled clearly
7. Tests or manual verification notes exist
8. Documentation is updated
9. No planned item is incorrectly marked as completed

---

## Next Steps

**Current Sprint:** 0 (Planning Cleanup)

**Next Sprint:** 1 (TypeScript Monorepo Setup)

**Blocked:** None

**Risks:**
1. Node.js environment may need setup on Windows
2. MongoDB/Redis need local installation or Docker
3. TipTap integration complexity may extend Sprint 8

---

*Implementation Plan Version: 1.0*  
*Created: July 4, 2026*  
*Status: Active*
