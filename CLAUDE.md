# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a full-stack React Router v7 application template with authentication, database integration, and admin panel. The project uses:

- **React Router v7** with SSR enabled
- **Drizzle ORM** with PostgreSQL
- **Better Auth** for authentication with role-based access control
- **TailwindCSS** for styling with shadcn/ui components
- **i18n** for internationalization (en, ja, ko, zh)
- **Docker** for containerized deployment

## Architecture

### Directory Structure

```
app/
├── routes/                    # React Router routes (file-based routing)
│   ├── _layout.tsx           # Main application layout
│   ├── _bo-layout.tsx        # Admin panel layout (requires auth)
│   ├── _layout.login.tsx     # Authentication routes
│   └── _bo-layout.bo.*       # Admin-specific routes
├── components/
│   ├── ui/                   # shadcn/ui components
│   ├── admin/                # Admin panel components
│   ├── bo/                   # Back-office user management
│   └── layout/               # Shared layout components
├── db/
│   ├── schemas/              # Drizzle ORM schemas
│   └── index.ts              # Database connection
├── lib/
│   ├── auth.ts               # Better Auth configuration
│   ├── admin-permissions.ts  # Role-based access control
│   ├── theme.tsx             # Next-themes configuration
│   └── i18n.ts               # Internationalization setup
├── middlewares/
│   └── auth.ts               # Authentication middleware
└── locales/                  # Translation files
```

### Key Files

- **Database Schema**: `app/db/schemas/auth-schema.ts` - User, session, account tables
- **Authentication**: `app/lib/auth.ts` - Better Auth configuration with roles
- **Permissions**: `app/lib/admin-permissions.ts` - Role-based access control (admin, userManager, userReader, customer)
- **Routes**: Auto-generated from `app/routes/` using flatRoutes()

## Development Commands

### Local Development
```bash
npm install          # Install dependencies
npm run dev          # Start development server (localhost:5173)
npm run typecheck    # Type checking
```

### Database Operations
```bash
npm run db:generate         # Generate migrations
npm run db:dev:migrate      # Run migrations in dev
npm run db:prod:migrate     # Run migrations in production
```

### Authentication
```bash
npm run auth:generate       # Generate auth client types
```

### Docker Development
```bash
make dev            # Start development environment with Docker
make dev-down       # Stop development environment
make migrate-dev    # Run migrations in dev Docker
make logs-dev       # View development logs
```

### Production Deployment
```bash
make build          # Build Docker image
make deploy         # Deploy to production
make migrate        # Run production migrations
make logs          # View production logs
make status        # Check service status
```

### Quick Start
```bash
make quick-start    # Setup local development
make quick-start-dev # Setup Docker development
```

## Environment Setup

Required environment files:
- `.env.dev` - Development environment variables
- `.env.prod` - Production environment variables

Key environment variables:
- `DATABASE_URL` - PostgreSQL connection string
- `RESEND_API_KEY` - Email service API key
- `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` - OAuth providers
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` - OAuth providers

## Key Features

### Authentication & Authorization
- **Better Auth** with email/password and OAuth (GitHub, Google)
- **Role-based access control** with 4 roles: admin, userManager, userReader, customer
- **Admin panel** at `/bo` routes with permission-based sidebar navigation

### Database
- **Drizzle ORM** with PostgreSQL
- **Migration system** with drizzle-kit
- **Schema**: User management with ban/role functionality

### UI Components
- **shadcn/ui** component system with TailwindCSS
- **Responsive design** with mobile-first approach
- **Theme support** (light/dark mode)
- **Internationalization** support for 4 languages

### Deployment
- **Multi-stage Docker builds** for optimized production images
- **Docker Compose** for development and production environments
- **Makefile** with comprehensive commands for development and deployment
- **Health checks** and monitoring built-in