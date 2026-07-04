# Content Sphere Hub - CMS Design Document v3.1

> **Status:** Ready for Implementation  
> **Version:** 3.1 (Corrected Planning - TypeScript Enterprise CMS)  
> **Stack:** MERN + TypeScript  
> **Created:** July 4, 2026  
> **Updated:** July 4, 2026

---

## 1. Project Overview

**Name:** Content Sphere Hub  
**Type:** Enterprise-Grade Content Management System  
**Stack:** MERN + TypeScript (MongoDB, Express, React, Node.js)  
**Architecture:** Module-based, Provider-abstracted, Cloud-ready

---

## 2. Final Technical Decisions

| Area | Development | Production | Status |
|------|-------------|------------|--------|
| **Language** | TypeScript (Backend + Frontend) | TypeScript | Approved |
| **Database** | Local MongoDB + Compass | MongoDB Atlas | Approved |
| **Media Storage** | Local uploads | Cloudinary (images) + S3 (docs/backups) | Approved |
| **Email** | Fake SMTP / Mailtrap | SendGrid → AWS SES (high-volume) | Approved |
| **Search** | MongoDB Text Search | Elasticsearch / Atlas Search (later) | Approved |
| **Rich Text Editor** | TipTap | TipTap | Approved |
| **OAuth** | Email/password MVP, Google+GitHub Phase 2 | + Facebook Phase 3 | Approved |
| **Deployment** | Docker + Local | Self-hosted → Cloud-ready | Approved |
| **Cache/Queue** | Redis + BullMQ | Redis + BullMQ | Approved |
| **Real-time** | Socket.io | Socket.io | Approved |

---

## 3. Complete Feature List (200+ Features)

### 3.1 Authentication & Security

| Feature | Phase | Status | Description |
|---------|-------|--------|-------------|
| Email/Password Registration | MVP | Not Started | Standard signup with validation |
| JWT Authentication | MVP | Not Started | Access + Refresh token flow |
| Token Refresh & Rotation | MVP | Not Started | Secure token management |
| Rate Limiting | MVP | Not Started | Prevent brute force |
| Email Verification | Phase 2 | Not Started | Verify email on signup |
| Password Reset | Phase 2 | Not Started | Email-based reset flow |
| Google OAuth | Phase 2 | Not Started | Social login |
| GitHub OAuth | Phase 2 | Not Started | Social login |
| Two-Factor Auth (2FA) | Phase 2 | Not Started | TOTP-based (Google Authenticator) |
| Session Management | Phase 2 | Not Started | View/revoke active sessions |
| Login History | Phase 2 | Not Started | Track login attempts with IP/device |
| Account Lockout | Phase 2 | Not Started | Auto-lock after failed attempts |
| Facebook OAuth | Phase 3 | Not Started | Social login |
| IP Allowlist (Admin) | Phase 3 | Not Started | Extra admin protection |
| Device Trust | Phase 3 | Not Started | Trusted device management |
| Mandatory 2FA (Admins) | Phase 3 | Not Started | Force 2FA for admin roles |
| Account Linking | Phase 3 | Not Started | Link social accounts |

### 3.2 User Management & RBAC

| Feature | Phase | Status | Description |
|---------|-------|--------|-------------|
| User CRUD | MVP | Not Started | Create, view, edit, delete users |
| Role-Based Access | MVP | Not Started | Granular permission system |
| Custom Roles | MVP | Not Started | Create custom roles with permissions |
| Permission Strings | MVP | Not Started | `content:create`, `media:upload`, etc. |
| User Profiles | MVP | Not Started | Avatar, bio, social links |
| User Preferences | MVP | Not Started | Language, timezone, theme |
| User Activity Log | Phase 2 | Not Started | Track all user actions |
| User Invitations | Phase 2 | Not Started | Invite users via email |
| User Groups/Teams | Phase 3 | Not Started | Organize users |
| Bulk User Actions | Phase 3 | Not Started | Import, export, bulk status |

### 3.3 Content Management

| Feature | Phase | Status | Description |
|---------|-------|--------|-------------|
| Content CRUD | MVP | Not Started | Create, read, update, delete |
| TipTap Rich Text Editor | MVP | Not Started | WYSIWYG with extensions |
| Markdown Support | MVP | Not Started | Toggle WYSIWYG/Markdown |
| Content Types | MVP | Not Started | Articles, Pages, Blogs, News |
| Auto-Save Drafts | MVP | Not Started | Auto-save every 30s |
| Featured Content | MVP | Not Started | Mark as featured |
| Content Status | MVP | Not Started | Draft → Pending → Published → Archived |
| Content Preview | MVP | Not Started | Preview before publishing |
| Reading Time | MVP | Not Started | Auto-calculate read time |
| Word Count | MVP | Not Started | Live word/character count |
| Content Cloning | Phase 2 | Not Started | Duplicate content |
| Content Versioning | Phase 2 | Not Started | Full revision history |
| Version Restore | Phase 2 | Not Started | Restore any version |
| Scheduled Publishing | Phase 2 | Not Started | Publish at future date |
| Trash/Soft Delete | Phase 2 | Not Started | Soft delete with restore |
| Bulk Operations | Phase 2 | Not Started | Bulk delete, status change |
| Custom Content Types | Phase 3 | Not Started | Admin-defined structures |
| Custom Fields | Phase 3 | Not Started | Add meta fields to content |
| Content Templates | Phase 3 | Not Started | Pre-defined templates |
| Version Diff View | Phase 3 | Not Started | Compare versions |
| Content Locking | Phase 3 | Not Started | Prevent simultaneous editing |
| Content Expiry | Phase 3 | Not Started | Auto-archive after date |
| Related Content | Phase 3 | Not Started | Link related articles |
| Content Series | Phase 3 | Not Started | Group into series/collections |
| Reusable Blocks | Phase 4 | Not Started | CTAs, banners, FAQs |
| Page Builder | Phase 4 | Not Started | Visual page building |

### 3.4 Content Workflow & Collaboration

| Feature | Phase | Status | Description |
|---------|-------|--------|-------------|
| Approval Workflow | Phase 3 | Not Started | Submit → Review → Approve → Publish |
| Multi-Stage Review | Phase 3 | Not Started | Configurable review stages |
| Reviewer Assignment | Phase 3 | Not Started | Assign specific reviewers |
| Inline Comments | Phase 3 | Not Started | Comments on content |
| Change Requests | Phase 3 | Not Started | Request changes before approval |
| Workflow Notifications | Phase 3 | Not Started | Email/in-app alerts |
| Editorial Calendar | Phase 3 | Not Started | Visual calendar view |
| Content Assignments | Phase 3 | Not Started | Assign to authors |
| Deadline Tracking | Phase 3 | Not Started | Due dates with reminders |
| Draft Preview Links | Phase 3 | Not Started | Expiring preview URLs |
| Real-time Presence | Phase 4 | Not Started | See who is editing |

### 3.5 SEO & Meta Management

| Feature | Phase | Status | Description |
|---------|-------|--------|-------------|
| SEO Meta Fields | MVP | Not Started | Title, description, keywords |
| Open Graph Tags | MVP | Not Started | Facebook/social sharing |
| Twitter Cards | MVP | Not Started | Twitter-specific meta |
| URL Slugs | MVP | Not Started | Auto-generated, editable |
| Canonical URLs | Phase 2 | Not Started | Set canonical URLs |
| Slug Conflict Warning | Phase 2 | Not Started | Avoid duplicate URLs |
| SEO Score/Analysis | Phase 3 | Not Started | Real-time SEO suggestions |
| Redirect Manager | Phase 3 | Not Started | 301/302 redirects |
| Sitemap Generation | Phase 3 | Not Started | Auto-generate XML sitemap |
| Robots.txt Editor | Phase 3 | Not Started | Edit robots.txt |
| Structured Data | Phase 3 | Not Started | JSON-LD schema markup |
| Broken Link Checker | Phase 3 | Not Started | Scan for broken links |
| OG/Twitter Preview | Phase 3 | Not Started | Preview social cards |

### 3.6 Media Library

| Feature | Phase | Status | Description |
|---------|-------|--------|-------------|
| File Upload | MVP | Not Started | Single and multiple upload |
| Drag & Drop | MVP | Not Started | Drag and drop zone |
| Supported Types | MVP | Not Started | Images, Videos, Docs, Audio |
| Thumbnails | MVP | Not Started | Auto-generate sizes |
| Media Search | MVP | Not Started | Search by name, type |
| Alt Text & Captions | MVP | Not Started | Accessibility metadata |
| Bulk Upload | MVP | Not Started | Multiple files |
| MIME Validation | MVP | Not Started | Security validation |
| Magic Byte Check | MVP | Not Started | Prevent disguised files |
| Image Optimization | Phase 2 | Not Started | Auto-compress uploads |
| Folder Organization | Phase 2 | Not Started | Organize in folders |
| Media Tags | Phase 2 | Not Started | Tag media files |
| Image Editor | Phase 3 | Not Started | Crop, resize, rotate |
| Focal Point | Phase 3 | Not Started | Responsive cropping |
| Media Usage Tracking | Phase 3 | Not Started | Track where used |
| Cloudinary Integration | Phase 3 | Not Started | Cloud image storage |
| S3 Integration | Phase 3 | Not Started | Document storage |
| Video Thumbnails | Phase 3 | Not Started | Auto-extract thumbnails |
| CDN Support | Phase 4 | Not Started | Serve via CDN |

### 3.7 Categories & Taxonomy

| Feature | Phase | Status | Description |
|---------|-------|--------|-------------|
| Hierarchical Categories | MVP | Not Started | Parent/child tree |
| Nested Categories | MVP | Not Started | Unlimited depth |
| Tags | MVP | Not Started | Flat tag system |
| Taxonomy Images | Phase 2 | Not Started | Category/tag images |
| Taxonomy SEO | Phase 2 | Not Started | Meta fields for categories |
| Bulk Tag Management | Phase 2 | Not Started | Bulk operations |
| Drag-drop Reorder | Phase 2 | Not Started | Reorder categories |
| Merge Tags | Phase 3 | Not Started | Merge duplicates |
| Tag Suggestions | Phase 4 | Not Started | AI-powered suggestions |
| Custom Taxonomies | Phase 4 | Not Started | Create custom types |

### 3.8 Comments System

| Feature | Phase | Status | Description |
|---------|-------|--------|-------------|
| Threaded Comments | Phase 3 | Not Started | Nested reply threads |
| Comment Moderation | Phase 3 | Not Started | Approve, reject, spam |
| Comment Status | Phase 3 | Not Started | Pending, approved, spam |
| Guest Comments | Phase 3 | Not Started | Anonymous comments |
| User Comments | Phase 3 | Not Started | Logged-in comments |
| Comment Notifications | Phase 3 | Not Started | Email on new comments |
| Comment Likes | Phase 3 | Not Started | Upvote/downvote |
| Comment Editing | Phase 3 | Not Started | Edit window for users |
| Spam Protection | Phase 3 | Not Started | reCAPTCHA integration |
| Profanity Filter | Phase 3 | Not Started | Auto-filter bad words |

### 3.9 Newsletter & Subscribers

| Feature | Phase | Status | Description |
|---------|-------|--------|-------------|
| Subscriber Management | Phase 3 | Not Started | Manage subscribers |
| Subscription Forms | Phase 3 | Not Started | Embeddable forms |
| Double Opt-in | Phase 3 | Not Started | Email confirmation |
| Subscriber Segments | Phase 3 | Not Started | Group by interest |
| Newsletter Composer | Phase 3 | Not Started | Create newsletters |
| Newsletter Templates | Phase 3 | Not Started | Email templates |
| Campaign Scheduling | Phase 3 | Not Started | Schedule delivery |
| Campaign Analytics | Phase 3 | Not Started | Open/click rates |
| Unsubscribe | Phase 3 | Not Started | One-click unsubscribe |
| Email Provider Integration | Phase 3 | Not Started | SendGrid/AWS SES |

### 3.10 Multi-Language (i18n)

| Feature | Phase | Status | Description |
|---------|-------|--------|-------------|
| Multiple Languages | Phase 4 | Not Started | Unlimited languages |
| Content Translation | Phase 4 | Not Started | Per-language content |
| Language Switcher | Phase 4 | Not Started | Frontend selector |
| RTL Support | Phase 4 | Not Started | Right-to-left languages |
| Translation Status | Phase 4 | Not Started | Track progress |
| Default Language | Phase 4 | Not Started | Site default |
| Admin UI Translation | Phase 4 | Not Started | Translate interface |

### 3.11 Dashboard & Analytics

| Feature | Phase | Status | Description |
|---------|-------|--------|-------------|
| Overview Dashboard | MVP | Not Started | Key metrics |
| Activity Feed | MVP | Not Started | Recent activity |
| Content Analytics | Phase 2 | Not Started | Views, engagement |
| Custom Date Range | Phase 2 | Not Started | Filter by date |
| Traffic Sources | Phase 3 | Not Started | Where visitors from |
| Geographic Data | Phase 3 | Not Started | Visitor locations |
| Device Analytics | Phase 3 | Not Started | Desktop/mobile breakdown |
| User Analytics | Phase 3 | Not Started | Active users |
| Real-time Stats | Phase 3 | Not Started | Live visitor count |
| Export Reports | Phase 3 | Not Started | CSV, PDF export |
| Google Analytics | Phase 3 | Not Started | GA4 integration |
| Performance Metrics | Phase 3 | Not Started | Load times, API response |
| Search Analytics | Phase 3 | Not Started | Query analytics |
| Author Performance | Phase 3 | Not Started | Editorial insights |

### 3.12 Notifications System

| Feature | Phase | Status | Description |
|---------|-------|--------|-------------|
| In-App Notifications | Phase 2 | Not Started | Bell icon dropdown |
| Real-time Updates | Phase 2 | Not Started | WebSocket live updates |
| Email Notifications | Phase 2 | Not Started | Configurable alerts |
| Notification Preferences | Phase 2 | Not Started | User controls |
| Notification Center | Phase 2 | Not Started | View all past |
| @Mentions | Phase 3 | Not Started | Mention users |
| Digest Emails | Phase 3 | Not Started | Daily/weekly summary |
| Push Notifications | Phase 4 | Not Started | Browser push |

### 3.13 Import/Export & Backup

| Feature | Phase | Status | Description |
|---------|-------|--------|-------------|
| Content Import | Phase 3 | Not Started | CSV, JSON, XML |
| Content Export | Phase 3 | Not Started | CSV, JSON, XML |
| Markdown Import/Export | Phase 3 | Not Started | Developer-friendly |
| Media Export | Phase 3 | Not Started | Bulk download |
| Database Backup | Phase 3 | Not Started | Scheduled backups |
| Backup Restore | Phase 3 | Not Started | One-click restore |
| Backup to Cloud | Phase 3 | Not Started | S3, Google Drive |
| Backup Encryption | Phase 3 | Not Started | Secure backups |
| Restore Testing | Phase 3 | Not Started | Verify backups work |
| WordPress Import | Phase 4 | Not Started | Migration tool |

### 3.14 API & Integrations

| Feature | Phase | Status | Description |
|---------|-------|--------|-------------|
| REST API | MVP | Not Started | Full RESTful API |
| API Documentation | MVP | Not Started | Swagger/OpenAPI |
| API Keys | Phase 3 | Not Started | External access keys |
| API Key Scopes | Phase 3 | Not Started | Permission-based keys |
| Webhooks | Phase 3 | Not Started | Outgoing webhooks |
| Webhook Retry Logs | Phase 3 | Not Started | Debug failed hooks |
| Slack Integration | Phase 3 | Not Started | Post to Slack |
| Discord Integration | Phase 3 | Not Started | Post to Discord |
| RSS Feed | Phase 3 | Not Started | RSS/Atom feeds |
| GraphQL API | Phase 4 | Not Started | Optional GraphQL |
| Public API SDK | Phase 4 | Not Started | JS/TS SDK |

### 3.15 System Settings

| Feature | Phase | Status | Description |
|---------|-------|--------|-------------|
| General Settings | MVP | Not Started | Site name, URL, logo |
| Security Settings | MVP | Not Started | Password policy |
| Registration Settings | MVP | Not Started | Open/closed, default role |
| Content Settings | MVP | Not Started | Default status |
| SEO Settings | MVP | Not Started | Default meta |
| Health Check | MVP | Not Started | System status |
| Email Settings | Phase 2 | Not Started | SMTP configuration |
| Storage Settings | Phase 2 | Not Started | Local/S3/Cloudinary |
| Notification Settings | Phase 2 | Not Started | Email templates |
| Maintenance Mode | Phase 2 | Not Started | Enable maintenance |
| System Logs | Phase 2 | Not Started | Error/access logs |
| Queue Dashboard | Phase 3 | Not Started | Monitor jobs |
| Feature Flags | Phase 4 | Not Started | Enable/disable features |

### 3.16 UI/UX Features

| Feature | Phase | Status | Description |
|---------|-------|--------|-------------|
| Dark Mode | MVP | Not Started | Toggle dark/light/system |
| Responsive Design | MVP | Not Started | Mobile-friendly |
| Accessibility (WCAG) | MVP | Not Started | AA compliance |
| Quick Create Button | MVP | Not Started | Fast content creation |
| Autosave Indicator | MVP | Not Started | User confidence |
| Unsaved Warning | MVP | Not Started | Prevent data loss |
| Keyboard Shortcuts | Phase 2 | Not Started | Power user shortcuts |
| Command Palette | Phase 2 | Not Started | Cmd+K global search |
| Drag & Drop | Phase 2 | Not Started | Reorder content |
| Infinite Scroll | Phase 2 | Not Started | Lazy loading |
| Recent Items | Phase 2 | Not Started | Quick access |
| Table Preferences | Phase 2 | Not Started | Save column prefs |
| Bulk Edit | Phase 2 | Not Started | Faster workflows |
| Bookmarks | Phase 3 | Not Started | Favorite content |
| Customizable Dashboard | Phase 3 | Not Started | Widget-based |
| Saved Filters/Views | Phase 3 | Not Started | Better management |
| Admin Onboarding | Phase 3 | Not Started | First setup checklist |
| PWA Support | Phase 4 | Not Started | Install as app |

### 3.17 AI Features (Optional)

| Feature | Phase | Status | Description |
|---------|-------|--------|-------------|
| AI SEO Title Generator | Phase 4 | Not Started | Faster SEO |
| AI Meta Description | Phase 4 | Not Started | Better snippets |
| AI Tag Suggestions | Phase 4 | Not Started | Auto-tagging |
| AI Image Alt-Text | Phase 4 | Not Started | Accessibility |
| AI Content Summary | Phase 4 | Not Started | Quick excerpts |
| AI Translation Helper | Phase 4 | Not Started | Faster i18n |
| AI Grammar Check | Phase 4 | Not Started | Better writing |
| AI Duplicate Warning | Phase 4 | Not Started | Avoid repeats |

**Note:** AI features are optional and provider-based (`AI_PROVIDER=none|openai|anthropic|local`)

### 3.18 Developer Features

| Feature | Phase | Status | Description |
|---------|-------|--------|-------------|
| Seed Scripts | MVP | Not Started | Fast local setup |
| Environment Validation | MVP | Not Started | Prevent broken deploys |
| Debug Mode | Phase 2 | Not Started | Detailed errors |
| Code Injection | Phase 3 | Not Started | Custom CSS/JS |
| API Playground | Phase 3 | Not Started | Test API in browser |
| Plugin System | Phase 4 | Not Started | Extend functionality |
| Hook System | Phase 4 | Not Started | Action/filter hooks |
| Theme Support | Phase 4 | Not Started | Custom themes |

---

## 4. Technology Stack

### 4.1 Backend

| Technology | Purpose |
|------------|---------|
| Node.js 20+ | Runtime |
| Express.js | Backend framework |
| **TypeScript** | Type-safe development |
| MongoDB | Main database |
| Mongoose | ODM with TS interfaces |
| Redis | Cache, sessions, rate limiting |
| BullMQ | Background job queue |
| Socket.io | Real-time features |
| Passport.js | OAuth strategies |
| JWT | Authentication tokens |
| bcrypt | Password hashing |
| **Zod** | Request validation |
| Nodemailer | Development email |
| SendGrid | Production email |
| AWS SES | High-volume email (later) |
| Multer | File upload handling |
| Sharp | Image processing |
| file-type | Magic byte validation |
| Winston/Pino | Logging |
| Swagger | API documentation |
| Helmet | Security headers |
| express-rate-limit | API protection |
| DOMPurify / sanitize-html | HTML sanitization |

### 4.2 Frontend

| Technology | Purpose |
|------------|---------|
| React 18+ | UI library |
| Vite | Build tool |
| **TypeScript** | Type-safe frontend |
| Redux Toolkit + RTK Query | State & API |
| React Router v6 | Routing |
| Tailwind CSS | Styling |
| Headless UI / Radix UI | Accessible components |
| React Hook Form | Form handling |
| **Zod** | Form validation |
| **TipTap** | Rich text editor |
| Monaco Editor | Code editor |
| Recharts | Dashboard charts |
| Socket.io-client | Real-time |
| i18next | Multi-language |
| Workbox | PWA/service worker |

### 4.3 DevOps

| Technology | Purpose |
|------------|---------|
| Docker | Containerization |
| Docker Compose | Local/self-hosted |
| Nginx | Reverse proxy |
| PM2 | Process manager (optional) |
| GitHub Actions | CI/CD |
| MongoDB Backup Tools | Database backups |
| Cloudinary | Image CDN (later) |
| S3-compatible | Documents/backups (later) |

---

## 5. Project Structure (TypeScript Monorepo)

```
content-sphere-hub/
│
├── packages/
│   ├── backend/
│   │   ├── src/
│   │   │   ├── config/
│   │   │   │   ├── db.ts
│   │   │   │   ├── redis.ts
│   │   │   │   ├── passport.ts
│   │   │   │   ├── email.ts
│   │   │   │   ├── env.ts
│   │   │   │   └── constants.ts
│   │   │   │
│   │   │   ├── modules/
│   │   │   │   ├── auth/
│   │   │   │   │   ├── auth.routes.ts
│   │   │   │   │   ├── auth.controller.ts
│   │   │   │   │   ├── auth.service.ts
│   │   │   │   │   ├── auth.validation.ts
│   │   │   │   │   └── auth.types.ts
│   │   │   │   ├── users/
│   │   │   │   │   ├── users.routes.ts
│   │   │   │   │   ├── users.controller.ts
│   │   │   │   │   ├── users.service.ts
│   │   │   │   │   ├── users.repository.ts
│   │   │   │   │   ├── users.model.ts
│   │   │   │   │   ├── users.validation.ts
│   │   │   │   │   └── users.types.ts
│   │   │   │   ├── roles/
│   │   │   │   ├── content/
│   │   │   │   ├── media/
│   │   │   │   ├── categories/
│   │   │   │   ├── tags/
│   │   │   │   ├── comments/
│   │   │   │   ├── newsletter/
│   │   │   │   ├── analytics/
│   │   │   │   ├── notifications/
│   │   │   │   ├── settings/
│   │   │   │   ├── seo/
│   │   │   │   └── webhooks/
│   │   │   │
│   │   │   ├── providers/
│   │   │   │   ├── email/
│   │   │   │   │   ├── email.interface.ts
│   │   │   │   │   ├── nodemailer.provider.ts
│   │   │   │   │   ├── sendgrid.provider.ts
│   │   │   │   │   └── ses.provider.ts
│   │   │   │   ├── storage/
│   │   │   │   │   ├── storage.interface.ts
│   │   │   │   │   ├── local.provider.ts
│   │   │   │   │   ├── cloudinary.provider.ts
│   │   │   │   │   └── s3.provider.ts
│   │   │   │   ├── search/
│   │   │   │   │   ├── search.interface.ts
│   │   │   │   │   ├── mongodb.provider.ts
│   │   │   │   │   └── elasticsearch.provider.ts
│   │   │   │   └── ai/
│   │   │   │       ├── ai.interface.ts
│   │   │   │       ├── openai.provider.ts
│   │   │   │       └── anthropic.provider.ts
│   │   │   │
│   │   │   ├── middleware/
│   │   │   │   ├── auth.middleware.ts
│   │   │   │   ├── rbac.middleware.ts
│   │   │   │   ├── rateLimiter.middleware.ts
│   │   │   │   ├── validator.middleware.ts
│   │   │   │   ├── errorHandler.middleware.ts
│   │   │   │   ├── upload.middleware.ts
│   │   │   │   ├── cache.middleware.ts
│   │   │   │   ├── sanitize.middleware.ts
│   │   │   │   └── activityLog.middleware.ts
│   │   │   │
│   │   │   ├── jobs/
│   │   │   │   ├── scheduledPublish.job.ts
│   │   │   │   ├── contentExpiry.job.ts
│   │   │   │   ├── newsletter.job.ts
│   │   │   │   ├── backup.job.ts
│   │   │   │   └── cleanup.job.ts
│   │   │   │
│   │   │   ├── sockets/
│   │   │   │   ├── index.ts
│   │   │   │   ├── notifications.socket.ts
│   │   │   │   └── presence.socket.ts
│   │   │   │
│   │   │   ├── app.ts
│   │   │   └── server.ts
│   │   │
│   │   ├── tests/
│   │   ├── uploads/
│   │   ├── logs/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── Dockerfile
│   │
│   ├── frontend/
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── common/
│   │   │   │   ├── layout/
│   │   │   │   ├── content/
│   │   │   │   ├── media/
│   │   │   │   ├── users/
│   │   │   │   ├── dashboard/
│   │   │   │   └── settings/
│   │   │   │
│   │   │   ├── pages/
│   │   │   │   ├── auth/
│   │   │   │   ├── dashboard/
│   │   │   │   ├── content/
│   │   │   │   ├── media/
│   │   │   │   ├── users/
│   │   │   │   └── settings/
│   │   │   │
│   │   │   ├── store/
│   │   │   │   ├── store.ts
│   │   │   │   ├── api/
│   │   │   │   │   ├── authApi.ts
│   │   │   │   │   ├── contentApi.ts
│   │   │   │   │   ├── mediaApi.ts
│   │   │   │   │   └── usersApi.ts
│   │   │   │   └── slices/
│   │   │   │       ├── authSlice.ts
│   │   │   │       ├── uiSlice.ts
│   │   │   │       └── notificationSlice.ts
│   │   │   │
│   │   │   ├── hooks/
│   │   │   ├── contexts/
│   │   │   ├── utils/
│   │   │   ├── styles/
│   │   │   ├── i18n/
│   │   │   ├── App.tsx
│   │   │   ├── main.tsx
│   │   │   └── routes.tsx
│   │   │
│   │   ├── public/
│   │   ├── tests/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── vite.config.ts
│   │   ├── tailwind.config.js
│   │   └── Dockerfile
│   │
│   └── shared/
│       ├── src/
│       │   ├── types/
│       │   │   ├── user.types.ts
│       │   │   ├── content.types.ts
│       │   │   ├── media.types.ts
│       │   │   ├── category.types.ts
│       │   │   ├── tag.types.ts
│       │   │   └── api.types.ts
│       │   ├── schemas/
│       │   │   ├── auth.schema.ts
│       │   │   ├── content.schema.ts
│       │   │   ├── media.schema.ts
│       │   │   └── user.schema.ts
│       │   ├── constants/
│       │   │   ├── permissions.ts
│       │   │   └── roles.ts
│       │   └── index.ts
│       ├── package.json
│       └── tsconfig.json
│
├── docker/
│   ├── docker-compose.yml
│   ├── docker-compose.prod.yml
│   └── nginx/
│       └── nginx.conf
│
├── docs/
│   ├── CMS_DESIGN_DOCUMENT_v3_1.md
│   ├── IMPLEMENTATION_PLAN.md
│   ├── STATUS_TRACKING_RULES.md
│   ├── ENVIRONMENT_VARIABLES.md
│   ├── SECURITY_GUIDE.md
│   ├── RBAC_PERMISSION_MATRIX.md
│   └── API.md
│
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── deploy.yml
│
├── .gitignore
├── .env.example
├── package.json
├── pnpm-workspace.yaml
├── tsconfig.base.json
└── README.md
```

---

## 6. Database Schema (Corrected Models)

### 6.1 User Model (Corrected)

```typescript
import type { ObjectId } from "mongoose";

interface IUser {
  _id: ObjectId;
  email: string;
  passwordHash: string;  // CORRECTED: was "password"
  name: string;
  avatar?: string;
  bio?: string;

  roleId: ObjectId;  // ref: Role
  permissionOverrides: string[];  // Override permissions

  preferences: {
    language: string;
    timezone: string;
    theme: "light" | "dark" | "system";
    notifications: {
      email: boolean;
      push: boolean;
      inApp: boolean;
    };
  };

  twoFactor: {
    enabled: boolean;
    secret?: string;
    backupCodesHash?: string[];  // CORRECTED: store hashed backup codes
  };

  socialLogins: {
    google?: { id: string; email: string };
    github?: { id: string; username: string; email?: string };
    facebook?: { id: string; email?: string };
  };

  // CORRECTED: Store hashed refresh tokens, not raw tokens
  sessions: Array<{
    sessionId: string;
    refreshTokenHash: string;
    device: string;
    ip: string;
    userAgent: string;
    lastActive: Date;
    expiresAt: Date;
    revokedAt?: Date;
  }>;

  loginHistory: Array<{
    ip: string;
    device: string;
    userAgent: string;
    location?: string;
    timestamp: Date;
    success: boolean;
    failureReason?: string;
  }>;

  isActive: boolean;
  isVerified: boolean;
  verificationTokenHash?: string;  // CORRECTED: store hashed token
  passwordResetTokenHash?: string;  // CORRECTED: store hashed token
  passwordResetExpires?: Date;
  lockedUntil?: Date;
  failedLoginAttempts: number;

  createdAt: Date;
  updatedAt: Date;
}
```

### 6.2 Content Model (Corrected)

```typescript
import type { ObjectId } from "mongoose";
import type { JSONContent } from "@tiptap/core";

type ContentStatus =
  | "draft"
  | "pending_review"
  | "in_review"
  | "changes_requested"
  | "approved"
  | "published"
  | "archived"
  | "trash";

type ContentVisibility =
  | "public"
  | "private"
  | "password_protected"
  | "members_only";

interface IContent {
  _id: ObjectId;
  title: string;
  slug: string;
  excerpt?: string;

  // TipTap editor data - CORRECTED: Use JSONContent type
  bodyJson: JSONContent;
  bodyHtml: string;
  bodyText: string;
  bodyMarkdown?: string;

  contentType: "article" | "page" | "blog" | "news" | string;
  status: ContentStatus;
  visibility: ContentVisibility;
  passwordHash?: string;  // For password-protected content

  authorId: ObjectId;  // ref: User
  contributorIds: ObjectId[];  // ref: User[]
  categoryIds: ObjectId[];  // CORRECTED: was "category" (single)
  tagIds: ObjectId[];  // CORRECTED: was "tags"
  featuredImageId?: ObjectId;  // ref: Media

  workflow: {
    currentStage: string;
    assignedToId?: ObjectId;
    dueDate?: Date;
    reviewerIds: ObjectId[];
    approvedById?: ObjectId;
    approvedAt?: Date;
    comments: Array<{
      userId: ObjectId;
      text: string;
      createdAt: Date;
    }>;
  };

  scheduling: {
    publishAt?: Date;
    expireAt?: Date;
  };

  seo: {
    title?: string;
    description?: string;
    keywords: string[];
    canonical?: string;
    noIndex: boolean;
    noFollow: boolean;
    ogImage?: string;
    structuredData?: Record<string, unknown>;
  };

  settings: {
    allowComments: boolean;
    showAuthor: boolean;
    showDate: boolean;
    isFeatured: boolean;
    isPinned: boolean;
    customFields: Record<string, unknown>;
  };

  stats: {
    views: number;
    uniqueViews: number;
    shares: number;
    comments: number;
    readTime: number;
    wordCount: number;
  };

  relatedContentIds: ObjectId[];

  series?: {
    name: string;
    order: number;
  };

  lock?: {
    userId: ObjectId;
    lockedAt: Date;
    expiresAt: Date;
  };

  version: number;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}
```

### 6.3 Media Model (Corrected)

```typescript
import type { ObjectId } from "mongoose";

type MediaProvider = "local" | "cloudinary" | "s3";

interface IMedia {
  _id: ObjectId;

  provider: MediaProvider;
  key: string;
  url: string;
  publicId?: string;
  bucket?: string;

  originalName: string;
  filename: string;
  mimeType: string;
  detectedMimeType: string;  // ADDED: Magic byte detected type
  extension: string;  // ADDED: File extension
  size: number;

  checksum?: string;  // ADDED: For integrity verification

  dimensions?: {
    width: number;
    height: number;
  };

  focalPoint?: {
    x: number;
    y: number;
  };

  thumbnails?: {
    small: string;
    medium: string;
    large: string;
  };

  altText?: string;
  caption?: string;
  tags: string[];
  folderId?: ObjectId;

  uploadedById: ObjectId;  // CORRECTED: was "uploadedBy"
  usedInContentIds: ObjectId[];  // CORRECTED: was "usedIn"

  createdAt: Date;
  updatedAt: Date;
}
```

---

## 7. API Endpoints Summary

**Total: ~120 endpoints across modules**

| Module | Endpoints | Auth Required | MVP |
|--------|-----------|---------------|-----|
| Auth | 15 | Partial | Yes |
| Users | 16 | Yes | Yes |
| Roles | 8 | Admin | Yes |
| Content | 22 | Yes | Yes |
| Media | 12 | Author+ | Yes |
| Categories | 7 | Partial | Yes |
| Tags | 7 | Partial | Yes |
| Settings | 8 | Admin | Yes |
| Dashboard | 5 | Yes | Yes |
| Workflow | 8 | Editor+ | No |
| Comments | 10 | Partial | No |
| Newsletter | 12 | Admin | No |
| Analytics | 10 | Editor+ | No |
| Notifications | 6 | Yes | No |
| SEO | 8 | Admin | No |
| Webhooks | 6 | Admin | No |
| Public | 10 | No | No |

---

## 8. Security Rules

1. Never store plain passwords - use bcrypt with `passwordHash` field
2. Access + Refresh token flow with rotation
3. Store only hashed refresh tokens, never raw tokens
4. Sanitize all HTML from TipTap editor (DOMPurify/sanitize-html)
5. Validate all requests using Zod
6. Check permissions at backend, not just frontend
7. Validate uploads: MIME type + magic bytes (MVP requirement)
8. Limit upload file sizes
9. Rate limit auth endpoints (stricter than general API)
10. Use Helmet for security headers
11. Never commit .env files
12. Audit logs for important actions
13. Soft delete for important content
14. Encrypt backups
15. Lock accounts after failed attempts

---

## 9. Recommended Indexes

```typescript
// User
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ roleId: 1 });
UserSchema.index({ isActive: 1 });
UserSchema.index({ createdAt: -1 });

// Content
ContentSchema.index({ slug: 1 }, { unique: true });
ContentSchema.index({ status: 1 });
ContentSchema.index({ authorId: 1 });
ContentSchema.index({ categoryIds: 1 });
ContentSchema.index({ tagIds: 1 });
ContentSchema.index({ publishedAt: -1 });
ContentSchema.index({ createdAt: -1 });
ContentSchema.index({ deletedAt: 1 });

// Text Search
ContentSchema.index(
  { title: "text", excerpt: "text", bodyText: "text" },
  { weights: { title: 10, excerpt: 5, bodyText: 1 } }
);

// Media
MediaSchema.index({ uploadedById: 1 });
MediaSchema.index({ mimeType: 1 });
MediaSchema.index({ createdAt: -1 });

// Category
CategorySchema.index({ slug: 1 }, { unique: true });
CategorySchema.index({ parentId: 1 });

// Tag
TagSchema.index({ slug: 1 }, { unique: true });
```

---

*Document Version: 3.1*  
*Created: July 4, 2026*  
*Status: Ready for Implementation*
