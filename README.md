# Content Sphere Hub

> 🌐 Enterprise-Grade Content Management System built with MERN Stack + TypeScript

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)]()
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)]()
[![Node.js](https://img.shields.io/badge/Node.js-22.x-green.svg)]()
[![React](https://img.shields.io/badge/React-18.x-61dafb.svg)]()
[![MongoDB](https://img.shields.io/badge/MongoDB-7.x-47A248.svg)]()
[![License](https://img.shields.io/badge/license-MIT-blue.svg)]()

![Content Sphere Hub Landing Page](docs/screenshots/landing-page.png)

## 🚀 Live Demo

🌐 **[Frontend — Vercel](https://content-sphere-hub.vercel.app/)**

⚙️ **[Backend API — Railway](https://content-sphere-hubbackend-production.up.railway.app/api)**

💚 **[Backend Health Check](https://content-sphere-hubbackend-production.up.railway.app/health/ready)**

## 📸 Screenshots

<details>
<summary>Click to view screenshots</summary>

### Landing Page
![Landing Page](docs/screenshots/landing-page.png)

### Login & Registration
![Login Page](docs/screenshots/login.png)
![Register Page](docs/screenshots/register.png)

### Dashboard
![Dashboard](docs/screenshots/dashboard.png)

### Content Editor
![Content Editor](docs/screenshots/content-editor.png)

### Media Library
![Media Library](docs/screenshots/media-library.png)

</details>

## ✨ Features

### Content Management
- 📝 **Rich Text Editor** - TipTap-based editor with media embedding, code blocks, tables, and formatting
- 📁 **Media Library** - Upload, organize, and manage images/documents with folder support
- 📄 **Content Versioning** - Revision history and content scheduling
- 🏷️ **Categories & Tags** - Hierarchical categories and color-coded tags

### Security & Access Control
- 🔐 **Role-Based Access Control** - 6 roles with 75 granular permissions
- 🔑 **JWT Authentication** - Secure access + refresh token system with httpOnly cookies
- 👥 **User Management** - Super Admin, Admin, Editor, Author, Contributor, Viewer roles

### Modern UI/UX
- 🌙 **Dark Mode** - System preference detection with manual override
- 📱 **Responsive Design** - Mobile-first approach
- ⚡ **Fast Performance** - Code splitting, lazy loading, optimized builds
- 🎨 **Beautiful Landing Page** - Animated glowing sphere with modern dark theme

### Developer Experience
- 📦 **Monorepo Architecture** - Organized with pnpm workspaces
- 🔷 **Full TypeScript** - End-to-end type safety
- ✅ **Zod Validation** - Runtime validation with TypeScript inference
- 🐳 **Docker Ready** - Production-ready Docker Compose setup

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18, Redux Toolkit, RTK Query, TailwindCSS |
| **Editor** | TipTap (ProseMirror-based) |
| **Backend** | Node.js 22, Express.js |
| **Database** | MongoDB 7 with Mongoose ODM |
| **Auth** | JWT (Access + Refresh tokens), bcrypt |
| **Validation** | Zod (shared between frontend & backend) |
| **Charts** | Recharts |
| **Build** | Vite, TypeScript 5, pnpm workspaces |
| **Styling** | TailwindCSS 3, Lucide Icons |

## 📁 Project Structure

```
content-sphere-hub/
├── packages/
│   ├── shared/              # Shared types, schemas, constants
│   │   └── src/
│   │       ├── schemas/     # Zod validation schemas
│   │       ├── types/       # TypeScript interfaces
│   │       └── constants/   # Roles, permissions, config
│   │
│   ├── backend/             # Express.js API server
│   │   └── src/
│   │       ├── controllers/ # Request handlers
│   │       ├── middleware/  # Auth, validation, error handling
│   │       ├── models/      # Mongoose schemas
│   │       ├── routes/      # API route definitions
│   │       ├── services/    # Business logic
│   │       ├── seeds/       # Database seeders
│   │       └── schemas/     # Request validation
│   │
│   └── frontend/            # React SPA
│       └── src/
│           ├── components/  # UI components
│           │   ├── ui/      # Base components (Button, Input, etc.)
│           │   ├── layouts/ # Page layouts
│           │   └── auth/    # Auth components
│           ├── pages/       # Route pages
│           ├── store/       # Redux store & RTK Query APIs
│           ├── hooks/       # Custom React hooks
│           └── lib/         # Utilities
│
├── docker/                  # Docker configuration
│   ├── Dockerfile.backend
│   ├── Dockerfile.frontend
│   └── nginx.conf
│
├── docker-compose.yml       # Full stack deployment
└── .env.example             # Environment template
```

## 🚀 Getting Started

### Prerequisites

- Node.js 22.x or later
- pnpm 9.x or later
- MongoDB 7.x (local or [MongoDB Atlas](https://www.mongodb.com/atlas))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/BikashCoder31/content-sphere-hub.git
   cd content-sphere-hub
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your MongoDB URI and JWT secrets
   ```

4. **Seed the database**
   ```bash
   cd packages/backend && pnpm seed
   ```

5. **Start development servers**
   ```bash
   # Terminal 1 - Backend (port 5000)
   cd packages/backend && pnpm dev
   
   # Terminal 2 - Frontend (port 5173)
   cd packages/frontend && pnpm dev
   ```

6. **Open in browser**
   - Frontend: http://localhost:5173
   - API: http://localhost:5000/api/v1

### Default Accounts

After seeding, you can login with:

| Role | Email | Password |
|------|-------|----------|
| Super Admin | admin@content-sphere-hub.local | Admin123!@ |

## 🐳 Docker Deployment

```bash
# Build and run all services
docker-compose up -d

# View logs
docker-compose logs -f
```

## 📊 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Register new user |
| POST | `/api/v1/auth/login` | User login |
| POST | `/api/v1/auth/refresh` | Refresh access token |
| GET | `/api/v1/content` | List content items |
| POST | `/api/v1/content` | Create content |
| GET | `/api/v1/media` | List media files |
| POST | `/api/v1/media/upload` | Upload media |
| GET | `/api/v1/categories` | List categories |
| GET | `/api/v1/tags` | List tags |

## 🔒 Role Permissions

| Role | Permissions |
|------|-------------|
| **Super Admin** | Full system access (`*`) |
| **Admin** | All content, user, and settings management |
| **Editor** | Manage all content, categories, tags |
| **Author** | Create and manage own content |
| **Contributor** | Create content (cannot publish) |
| **Viewer** | Read-only access |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request


## 👨‍💻 Author

**Bikash Kushwaha**
- GitHub: [@BikashCoder31](https://github.com/BikashCoder31)
- LinkedIn: [Bikash Kushwaha](https://www.linkedin.com/in/kushwahabikash)

---

⭐ **Star this repo if you found it helpful!**
