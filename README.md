# ⚡ HireNest — Full-Stack Job Portal

> A modern, full-stack Job Portal Management System built for the TNP Fullstack Developer assessment.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Setup Instructions](#setup-instructions)
  - [1. Clone & Install](#1-clone--install)
  - [2. Database Setup](#2-database-setup)
  - [3. Environment Variables](#3-environment-variables)
  - [4. Run Migrations & Seed](#4-run-migrations--seed)
  - [5. Start the Servers](#5-start-the-servers)
- [Demo Credentials](#demo-credentials)
- [API Reference](#api-reference)
- [Features](#features)
- [Folder Structure](#folder-structure)

---

## Overview

HireNest is a full-stack job portal with **two separate portals**:

| Portal | Purpose |
|--------|---------|
| **User Portal** | Browse jobs, register/login, apply for jobs, track applications |
| **Admin Portal** | Manage job listings (CRUD), review applications, manage users & categories, view dashboard analytics |

---

## Tech Stack

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | v18+ | Runtime |
| Express.js | ^4.19 | HTTP framework |
| TypeScript | ^5.5 | Type safety |
| PostgreSQL | 14+ | Primary database |
| node-postgres (pg) | ^8.12 | DB client |
| JWT (jsonwebtoken) | ^9.0 | Access + Refresh tokens |
| bcryptjs | ^2.4 | Password hashing |
| express-validator | ^7.2 | Input validation |
| helmet | ^7.1 | Security headers |
| express-rate-limit | ^7.4 | Rate limiting |
| cookie-parser | ^1.4 | HttpOnly cookie support |

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React | ^18 | UI framework |
| TypeScript | ^5.5 | Type safety |
| Vite | ^6 | Build tool |
| Tailwind CSS | ^3.4 | Styling |
| Redux Toolkit | ^2 | State management |
| React Redux | ^9 | React-Redux bindings |
| React Router DOM | ^6 | Client-side routing |
| React Hook Form | ^7 | Form handling |
| Zod | ^3 | Schema validation |
| Axios | ^1 | HTTP client |
| Lucide React | Latest | Icon library |

---

## Project Structure

```
jobbie/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.ts          # PostgreSQL pool
│   │   ├── controllers/
│   │   │   ├── authController.ts    # Register, login, refresh, logout, profile
│   │   │   ├── jobController.ts     # Job CRUD + featured + filter + pagination
│   │   │   ├── categoryController.ts
│   │   │   ├── applicationController.ts
│   │   │   └── dashboardController.ts
│   │   ├── db/
│   │   │   ├── migrate.ts           # DB schema migrations
│   │   │   └── seed.ts              # Seed data (categories, users, jobs)
│   │   ├── middleware/
│   │   │   ├── auth.ts              # JWT authenticate, requireAdmin, optionalAuth
│   │   │   ├── errorHandler.ts      # Global error handler + 404
│   │   │   └── validate.ts          # express-validator middleware
│   │   ├── routes/
│   │   │   ├── authRoutes.ts
│   │   │   ├── jobRoutes.ts
│   │   │   ├── categoryRoutes.ts
│   │   │   ├── applicationRoutes.ts
│   │   │   └── dashboardRoutes.ts
│   │   ├── types/
│   │   │   └── index.ts             # Shared TypeScript types
│   │   ├── utils/
│   │   │   ├── jwt.ts               # Token generation & verification
│   │   │   └── response.ts          # Standardised API responses
│   │   └── index.ts                 # Express app entry point
│   ├── .env
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── api/                     # Axios instance + API modules
│   │   │   ├── axios.ts             # Interceptors + auto token refresh
│   │   │   ├── authApi.ts
│   │   │   ├── jobApi.ts
│   │   │   ├── categoryApi.ts
│   │   │   ├── applicationApi.ts
│   │   │   └── dashboardApi.ts
│   │   ├── app/
│   │   │   ├── store.ts             # Redux store
│   │   │   └── hooks.ts             # Typed useAppDispatch / useAppSelector
│   │   ├── components/
│   │   │   ├── common/              # Toast, Loader, Modal, Pagination, NotFound, EmptyState, ProtectedRoute
│   │   │   ├── layout/              # Navbar, Footer, AdminSidebar, AdminLayout, UserLayout
│   │   │   └── jobs/                # JobCard
│   │   ├── features/
│   │   │   ├── auth/authSlice.ts
│   │   │   ├── jobs/jobsSlice.ts
│   │   │   ├── applications/applicationsSlice.ts
│   │   │   ├── categories/categoriesSlice.ts
│   │   │   └── toast/toastSlice.ts
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   └── useDebounce.ts
│   │   ├── pages/
│   │   │   ├── user/                # HomePage, LoginPage, RegisterPage, JobListingPage, JobDetailPage, MyApplicationsPage, CategoriesPage
│   │   │   └── admin/               # AdminDashboard, AdminJobsPage, AdminJobFormPage, AdminApplicationsPage, AdminUsersPage, AdminCategoriesPage
│   │   ├── types/index.ts           # Shared TypeScript types
│   │   ├── utils/index.ts           # cn, formatSalary, timeAgo, badge color helpers
│   │   ├── App.tsx                  # Route definitions
│   │   ├── main.tsx
│   │   └── index.css                # Tailwind + custom component classes
│   ├── .env
│   ├── .env.example
│   ├── tailwind.config.js
│   ├── vite.config.ts
│   └── package.json
│
└── README.md
```

---

## Prerequisites

| Requirement | Version |
|-------------|---------|
| Node.js | 18 or higher |
| npm | 9 or higher |
| PostgreSQL | 14 or higher |

### Install PostgreSQL (if not installed)

- **Windows**: Download from https://www.postgresql.org/download/windows/
- **macOS**: `brew install postgresql@16`
- **Ubuntu/Debian**: `sudo apt install postgresql`

---

## Setup Instructions

### 1. Clone & Install

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

---

### 2. Database Setup

Create the database in PostgreSQL:

```sql
-- Connect to PostgreSQL
psql -U postgres

-- Create the database
CREATE DATABASE HireNest_db;

-- Exit
\q
```

---

### 3. Environment Variables

#### Backend — `backend/.env`

Copy from the example and fill in your values:

```bash
cp backend/.env.example backend/.env
```

```env
# Server
PORT=5000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=HireNest_db
DB_USER=postgres
DB_PASSWORD=your_postgres_password

# JWT — use long random strings (min 32 chars)
JWT_ACCESS_SECRET=HireNest_access_secret_super_secure_key_2024
JWT_REFRESH_SECRET=HireNest_refresh_secret_super_secure_key_2024
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
```

#### Frontend — `frontend/.env`

```bash
cp frontend/.env.example frontend/.env
```

```env
VITE_API_URL=http://localhost:5000/api
```

---

### 4. Run Migrations & Seed

```bash
# From the backend directory:
cd backend

# Run database migrations (creates all tables, indexes, triggers)
npm run migrate

# Seed master data (10 categories, admin user, demo user, 10 sample jobs)
npm run seed
```

Expected output:
```
✅ Database migration completed successfully
🌱 Seed data inserted successfully

Credentials:
  Admin → admin@hirenest.io / Admin@123
  User  → john@example.com / User@123
```

---

### 5. Start the Servers

Open **two terminals**:

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
# API running on http://localhost:5000
# Health check: http://localhost:5000/health
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
# App running on http://localhost:5173
```

Open your browser at **http://localhost:5173**

---

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@hirenest.io` | `Admin@123` |
| User | `john@example.com` | `User@123` |

> These are pre-seeded by `npm run seed`. Demo credentials are also shown on the login page.

---

## API Reference

Base URL: `http://localhost:5000/api`

### Authentication
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | — | Register new user |
| POST | `/auth/login` | — | Login (returns access + refresh token) |
| POST | `/auth/refresh-token` | Cookie | Refresh access token |
| POST | `/auth/logout` | Bearer | Logout + clear refresh token |
| GET | `/auth/profile` | Bearer | Get own profile |
| PUT | `/auth/profile` | Bearer | Update profile |
| PUT | `/auth/change-password` | Bearer | Change password |

### Jobs
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/jobs` | — | List jobs (filter + paginate) |
| GET | `/jobs/featured` | — | Featured jobs |
| GET | `/jobs/by-category` | — | Jobs grouped by category |
| GET | `/jobs/:id` | — | Single job detail |
| POST | `/jobs` | Admin | Create job |
| PUT | `/jobs/:id` | Admin | Update job |
| DELETE | `/jobs/:id` | Admin | Delete job |
| PATCH | `/jobs/:id/toggle-status` | Admin | Toggle active/inactive |

**Query Params for `GET /jobs`:**
```
search, category, experience_level, job_type, location,
is_featured, is_active, sort_by, sort_order, page, limit
```

### Categories
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/categories` | — | All categories with job counts |
| GET | `/categories/:id` | — | Single category |
| POST | `/categories` | Admin | Create category |
| PUT | `/categories/:id` | Admin | Update category |
| DELETE | `/categories/:id` | Admin | Delete category |

### Applications
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/applications/jobs/:job_id/apply` | User | Apply for a job |
| GET | `/applications/jobs/:job_id/check` | User | Check if already applied |
| GET | `/applications/my` | User | My applications |
| DELETE | `/applications/:id` | User | Withdraw application |
| GET | `/applications/jobs/:job_id/applications` | Admin | Applications for a job |
| GET | `/applications/all` | Admin | All applications |
| PATCH | `/applications/:id/status` | Admin | Update application status |

### Admin Dashboard
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/admin/stats` | Admin | Dashboard stats & analytics |
| GET | `/admin/users` | Admin | All users with pagination |

---

## Features

### User Portal
- 🏠 **Landing page** — Hero search, featured jobs, category grid, stats, CTA
- 🔍 **Job listings** — Advanced filters (category, experience, type), search, sorting, pagination
- 📋 **Job details** — Full description, requirements, responsibilities, skills, apply modal
- 🔐 **Auth** — Register (with password strength meter), login (with demo creds display)
- 📬 **My Applications** — Track application status (pending → hired)
- 🗂 **Categories** — All categories with job counts

### Admin Portal
- 📊 **Animated Dashboard** — Overview stats, monthly applications bar chart, applications by status, top jobs, jobs by category
- 💼 **Job Management** — Full CRUD table with search/filter, toggle active/inactive, featured flag
- ✏️ **Job Form** — Rich form with array fields (requirements, responsibilities, skills), salary range, deadline, featured toggle
- 📥 **Applications** — View all applications, inline status update dropdown, detail modal with cover letter
- 👥 **Users** — Paginated user table with search and role filter
- 🏷 **Categories** — Card grid with create/delete, emoji icon support

### Technical Highlights
- ♻️ **Auto token refresh** — Axios interceptor silently refreshes expired access tokens
- 🔒 **Route protection** — `ProtectedRoute` for auth + `adminOnly` guard
- 🎯 **Global error toasts** — All API errors display as toast notifications
- ⚡ **Debounced search** — 400ms debounce on all search inputs
- 💀 **Skeleton loaders** — Shimmer skeletons for all loading states
- 📱 **Fully responsive** — Mobile-first, works on all screen sizes
- 🎨 **Custom design system** — Brand colors, animations, component classes in Tailwind

---

## Database Schema

```
users               categories
  id (uuid)           id (uuid)
  name                name
  email (unique)      slug (unique)
  password_hash       icon
  role                description
  avatar_url          is_active
  phone               created_at
  resume_url
  refresh_token     jobs
  is_active           id (uuid)
  created_at          title
  updated_at          company
                      company_logo
applications          location
  id (uuid)           job_type
  job_id → jobs       experience_level
  user_id → users     category_id → categories
  cover_letter        description
  resume_url          requirements (text[])
  status              responsibilities (text[])
  notes               skills (text[])
  created_at          salary_min / salary_max
  updated_at          is_featured / is_active
                      deadline
                      view_count
                      created_by → users
                      created_at / updated_at
```


---

## 🚀 Deployment

### Backend → Render

1. Go to [render.com](https://render.com) → **New** → **Web Service**
2. Connect your GitHub repo (`mohammedirfad/jobbie`)
3. Settings:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Environment**: Node
4. Add a **PostgreSQL** database on Render (free tier)
5. Set environment variables (copy from `backend/.env.example`, use the DB connection values Render provides)
6. After first deploy, open the Render **Shell** tab and run:
   ```bash
   npm run migrate
   npm run seed
   ```
7. Your API will be live at: `https://hirenest-api.onrender.com`

### Frontend → Vercel

1. Go to [vercel.com](https://vercel.com) → **New Project** → Import `mohammedirfad/jobbie`
2. Settings:
   - **Root Directory**: `frontend`
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Add environment variable:
   ```
   VITE_API_URL = https://hirenest-api.onrender.com/api
   ```
4. Deploy — your app will be live at: `https://hirenest.vercel.app`

> **Important**: Update `CORS_ORIGIN` in your Render backend env vars to match your Vercel URL.

---

## 🐳 Local PostgreSQL via Docker

If you don't have PostgreSQL installed locally, use Docker:

```bash
docker run --name hirenest-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=hirenest_db \
  -p 5432:5432 \
  -d postgres:16
```

Then run migrations and seed as normal.
