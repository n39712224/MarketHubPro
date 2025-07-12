# MarketHub - Technical Architecture Document

## System Overview

MarketHub is a full-stack TypeScript marketplace application built with modern web technologies, focusing on private sales and secure transactions.

## High-Level Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (React)       │◄──►│   (Express)     │◄──►│   (PostgreSQL)  │
│                 │    │                 │    │                 │
│ • React 18      │    │ • Node.js       │    │ • Drizzle ORM   │
│ • TypeScript    │    │ • Express.js    │    │ • Neon DB       │
│ • Wouter        │    │ • TypeScript    │    │ • Session Store │
│ • TanStack      │    │ • Multer        │    │                 │
│ • shadcn/ui     │    │ • OpenAI API    │    │                 │
│ • Tailwind CSS  │    │ • Stripe API    │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Frontend Architecture

### Component Structure
```
client/src/
├── components/           # Reusable UI components
│   ├── ui/              # shadcn/ui base components
│   ├── AddListingModal  # Listing creation form
│   ├── ListingsGrid     # Product display grid
│   ├── ImageUpload      # File upload component
│   └── Header           # Navigation component
├── pages/               # Route-based page components
│   ├── landing.tsx      # Public landing page
│   ├── dashboard.tsx    # Main authenticated view
│   ├── login.tsx        # Authentication page
│   └── checkout.tsx     # Payment processing
├── hooks/               # Custom React hooks
│   ├── useAuth.ts       # Authentication state
│   └── use-toast.ts     # Toast notifications
└── lib/                 # Utility functions
    └── queryClient.ts   # API client configuration
```

### State Management
- **Server State**: TanStack Query for API data caching and synchronization
- **Local State**: React useState for component-level state
- **Authentication**: Custom useAuth hook with session-based authentication
- **Form State**: React Hook Form with Zod validation

### Routing Strategy
- **Client-Side Routing**: Wouter for lightweight routing
- **Route Protection**: Authentication-based route guards
- **Public Routes**: Landing page, login
- **Protected Routes**: Dashboard, checkout, profile

## Backend Architecture

### API Structure
```
server/
├── routes.ts            # Express route definitions
├── storage.ts           # Data access layer (IStorage interface)
├── auth/               # Authentication modules
│   ├── simpleAuth.ts   # Session-based auth
│   └── replitAuth.ts   # OpenID Connect (optional)
├── ai.ts               # OpenAI integration
├── email.ts            # Email notification system
└── db.ts               # Database connection setup
```

### Data Access Pattern
- **Interface-Based**: IStorage interface for data operations
- **Implementation Flexibility**: MemStorage (dev) / DatabaseStorage (prod)
- **Type Safety**: Full TypeScript types from schema definitions
- **Validation**: Zod schemas for request/response validation

### API Endpoints
```
Authentication:
POST   /api/auth/login     # User login
POST   /api/auth/logout    # User logout
GET    /api/auth/user      # Current user info

Listings:
GET    /api/listings       # List all listings
POST   /api/listings       # Create new listing
PUT    /api/listings/:id   # Update listing
DELETE /api/listings/:id   # Delete listing

Payments:
POST   /api/create-payment-intent  # Stripe payment processing

AI Features:
POST   /api/ai/description         # Generate descriptions
POST   /api/ai/enhance-image       # Image enhancement
```

## Database Schema

### Core Tables
```sql
-- User management
users (
  id VARCHAR PRIMARY KEY,
  email VARCHAR UNIQUE,
  first_name VARCHAR,
  last_name VARCHAR,
  profile_image_url VARCHAR,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)

-- Product listings
listings (
  id VARCHAR PRIMARY KEY,
  title VARCHAR NOT NULL,
  description TEXT,
  price DECIMAL NOT NULL,
  category VARCHAR,
  condition VARCHAR,
  visibility VARCHAR, -- 'public', 'private', 'shared'
  images TEXT[],
  status VARCHAR,     -- 'active', 'sold', 'archived'
  invited_emails TEXT[],
  share_link VARCHAR,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)

-- Activity tracking
activities (
  id VARCHAR PRIMARY KEY,
  type VARCHAR,       -- 'sale', 'listing_added', 'view'
  description TEXT,
  listing_id VARCHAR,
  amount DECIMAL,
  timestamp TIMESTAMP
)

-- Session management (required for auth)
sessions (
  sid VARCHAR PRIMARY KEY,
  sess JSONB NOT NULL,
  expire TIMESTAMP NOT NULL
)
```

### Relationships
- Users → Listings (one-to-many)
- Listings → Activities (one-to-many)
- Users → Sessions (one-to-many)

## Security Architecture

### Authentication
- **Session-Based**: Express sessions with PostgreSQL store
- **Password Handling**: Bcrypt hashing (production ready)
- **Session Management**: 7-day expiration, httpOnly cookies
- **CSRF Protection**: Same-origin policy enforcement

### Data Protection
- **Input Validation**: Zod schemas on all endpoints
- **File Upload Security**: Multer with size/type restrictions
- **SQL Injection Prevention**: Drizzle ORM parameterized queries
- **Environment Variables**: Sensitive data in environment secrets

### API Security
- **Rate Limiting**: Built-in Express rate limiting
- **CORS Configuration**: Controlled cross-origin requests
- **Authentication Middleware**: Route-level protection
- **Error Handling**: Sanitized error responses

## External Integrations

### OpenAI API
- **Purpose**: AI-powered product descriptions and image analysis
- **Implementation**: Server-side API calls with error handling
- **Features**: 
  - Description generation from product details
  - Image quality analysis and suggestions
  - Text enhancement and optimization

### Stripe Payment Processing
- **Purpose**: Secure payment processing for sales
- **Implementation**: Stripe Elements for PCI compliance
- **Flow**: Payment Intent → Client confirmation → Webhook processing

### Email System
- **Current**: Console-based invitation system for development
- **Production Ready**: SendGrid integration available
- **Features**: HTML email templates, invitation tracking

## File Storage

### Image Handling
- **Upload**: Multer middleware for multipart form data
- **Storage**: Local filesystem (development) / Cloud storage (production)
- **Processing**: Image optimization and resizing
- **Security**: File type validation, size limits

### Static Assets
- **Frontend Build**: Vite production build to dist/public
- **Static Serving**: Express static middleware
- **Caching**: Browser caching headers for optimization

## Development Workflow

### Build Process
```bash
# Development
npm run dev          # Concurrent frontend/backend development

# Production
npm run build        # Build frontend assets
npm run start        # Start production server
```

### Database Operations
```bash
npm run db:push      # Push schema changes to database
npm run db:studio    # Open Drizzle Studio for data management
```

### Environment Configuration
```env
# Database
DATABASE_URL=postgresql://...

# Authentication
SESSION_SECRET=your-secret-key

# External APIs
OPENAI_API_KEY=sk-...
STRIPE_SECRET_KEY=sk_...
SENDGRID_API_KEY=SG...
```

## Performance Considerations

### Frontend Optimization
- **Code Splitting**: Vite automatic code splitting
- **Image Optimization**: WebP format, lazy loading
- **Caching**: TanStack Query for intelligent data caching
- **Bundle Size**: Tree shaking and minification

### Backend Optimization
- **Database Indexing**: Proper indexes on frequently queried columns
- **Connection Pooling**: PostgreSQL connection pool management
- **Caching Strategy**: In-memory caching for frequently accessed data
- **API Response Time**: Optimized queries and minimal data transfer

### Scalability Features
- **Stateless Architecture**: Session data in database, not memory
- **Horizontal Scaling**: No server-side state dependencies
- **Database Scaling**: PostgreSQL with read replicas capability
- **CDN Ready**: Static assets can be served from CDN

## Deployment Architecture

### Development Environment
- **Replit**: Integrated development environment
- **Hot Reload**: Vite HMR for rapid development
- **Database**: Neon PostgreSQL serverless

### Production Deployment
- **Platform**: Replit Deployments or cloud providers
- **Database**: Production PostgreSQL with SSL
- **Environment**: Production environment variables
- **Monitoring**: Application logging and error tracking

## Error Handling Strategy

### Frontend Error Boundaries
- **React Error Boundaries**: Component-level error catching
- **Toast Notifications**: User-friendly error messages
- **Retry Logic**: Automatic retry for transient failures

### Backend Error Handling
- **Centralized Error Middleware**: Express error handler
- **Structured Logging**: Consistent error logging format
- **Error Codes**: HTTP status codes with descriptive messages
- **Graceful Degradation**: Fallback behavior for service failures

## Testing Strategy

### Unit Testing
- **Component Testing**: React Testing Library
- **API Testing**: Supertest for endpoint testing
- **Database Testing**: In-memory database for tests

### Integration Testing
- **End-to-End**: Playwright for user workflow testing
- **API Integration**: Full request/response cycle testing
- **Database Integration**: Real database interaction testing

## Monitoring and Analytics

### Application Monitoring
- **Performance Metrics**: Response time, throughput
- **Error Tracking**: Error rates and stack traces
- **User Analytics**: Feature usage and conversion tracking

### Business Metrics
- **Sales Analytics**: Revenue, conversion rates
- **User Behavior**: Listing views, search patterns
- **System Health**: Uptime, database performance

---

*Last Updated: July 12, 2025*
*Version: 1.0*