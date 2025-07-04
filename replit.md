# MarketHub - E-commerce Listing Management Platform

## Overview

MarketHub is a full-stack e-commerce application that allows users to create, manage, and sell product listings. The platform supports image uploads, payment processing via Stripe, and provides both public and private listing visibility options. Built with React on the frontend and Express.js on the backend, it uses a modern tech stack optimized for performance and user experience.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query for server state management
- **UI Framework**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **Build Tool**: Vite with custom configuration for development and production

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **API Pattern**: RESTful API with structured error handling
- **File Uploads**: Multer middleware for image processing
- **Session Management**: Express sessions with PostgreSQL store

### Data Architecture
- **Database**: PostgreSQL (configured via Drizzle ORM)
- **ORM**: Drizzle with schema-first approach
- **Storage**: In-memory storage implementation with interface for future database integration
- **File Storage**: Local file system for uploaded images

## Key Components

### Core Features
1. **Listing Management**: Create, edit, delete, and view product listings
2. **Image Upload**: Multiple image support with drag-and-drop interface
3. **Payment Processing**: Stripe integration for secure transactions
4. **Sharing System**: Generate shareable links for private listings
5. **Search & Filtering**: Search by title, category, and visibility status
6. **Activity Tracking**: Monitor user actions and sales activities

### Authentication & Authorization
- Currently uses mock authentication (Alex Johnson as default user)
- Session-based architecture ready for full authentication implementation
- Role-based access controls prepared for multi-user scenarios

### UI Components
- Comprehensive component library using shadcn/ui
- Responsive design with mobile-first approach
- Dark mode support through CSS variables
- Accessibility-focused with proper ARIA attributes

## Data Flow

### Listing Creation Flow
1. User opens Add Listing Modal
2. Form validation using React Hook Form + Zod schemas
3. Image files uploaded via drag-and-drop interface
4. Form data and images sent to `/api/listings` endpoint
5. Server processes images, creates listing record
6. Client refreshes listing data via TanStack Query

### Payment Processing Flow
1. User navigates to checkout page for specific listing
2. Stripe Payment Element renders for secure card input
3. Payment intent created on server with listing details
4. Client confirms payment through Stripe
5. On success, listing marked as sold and activity logged

### Share Link Generation
1. User requests share link for private listing
2. Server generates unique share token
3. Share URL allows anonymous access to specific listing
4. Share activities tracked for analytics

## External Dependencies

### Payment Processing
- **Stripe**: Payment processing and checkout flows
- Environment variables required: `STRIPE_SECRET_KEY`, `VITE_STRIPE_PUBLIC_KEY`

### Database
- **PostgreSQL**: Primary data storage
- **Neon Database**: Serverless PostgreSQL provider
- Environment variable required: `DATABASE_URL`

### File Storage
- Local file system for development
- Upload directory auto-created at startup
- Images served statically via Express

### Development Tools
- **Replit**: Development environment with custom tooling
- **Vite**: Development server with HMR and error overlay
- **ESBuild**: Production bundling for server code

## Deployment Strategy

### Development Environment
- Vite dev server for frontend with proxy to Express backend
- Hot module replacement for rapid development
- TypeScript compilation and type checking
- Automatic database migration via Drizzle

### Production Build
1. Frontend built via Vite to `dist/public`
2. Backend bundled via ESBuild to `dist/index.js`
3. Static file serving for frontend assets
4. Database migrations run via `drizzle-kit push`

### Environment Configuration
- Development: `NODE_ENV=development` with file watching
- Production: `NODE_ENV=production` with optimized builds
- Database URL required for PostgreSQL connection
- Stripe keys required for payment processing

## Changelog

```
Changelog:
- July 04, 2025. Initial setup
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```