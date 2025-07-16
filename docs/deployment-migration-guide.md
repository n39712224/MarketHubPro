# MarketHub Migration & Hosting Guide

## Overview
Complete guide for migrating your MarketHub application from Replit to production hosting with minimal cost.

## Prerequisites
- Domain name (optional, around $10-15/year)
- GitHub account (free)
- Basic knowledge of environment variables

## Low-Cost Hosting Options

### 1. **Vercel (Recommended - $0/month)**
**Best for:** Frontend + API routes, automatic deployments
**Cost:** Free tier includes 100GB bandwidth, 1000 serverless function invocations
**Database:** Requires external PostgreSQL (see database options below)

#### Setup Steps:
1. Push code to GitHub repository
2. Connect Vercel to your GitHub account
3. Import your repository
4. Set environment variables in Vercel dashboard
5. Deploy automatically

#### Configuration:
```json
// vercel.json
{
  "builds": [
    { "src": "server/index.ts", "use": "@vercel/node" },
    { "src": "client/**/*", "use": "@vercel/static-build" }
  ],
  "routes": [
    { "src": "/api/(.*)", "dest": "/server/index.ts" },
    { "src": "/(.*)", "dest": "/client/dist/$1" }
  ]
}
```

### 2. **Railway ($5/month)**
**Best for:** Full-stack applications with database included
**Cost:** $5/month hobby plan with 500 hours runtime
**Database:** PostgreSQL included

#### Setup Steps:
1. Create Railway account
2. Connect GitHub repository
3. Deploy with one click
4. Add PostgreSQL service
5. Set environment variables

### 3. **Render ($7/month)**
**Best for:** Simple deployment with managed database
**Cost:** $7/month for web service + $7/month for PostgreSQL
**Database:** Managed PostgreSQL available

#### Setup Steps:
1. Create Render account
2. Connect GitHub repository
3. Create web service
4. Add PostgreSQL database
5. Configure environment variables

### 4. **DigitalOcean App Platform ($5/month)**
**Best for:** Scalable deployment with multiple services
**Cost:** $5/month basic plan
**Database:** Managed PostgreSQL available ($15/month)

## Database Options (if not included)

### 1. **Neon (Recommended - Free)**
- PostgreSQL compatible
- 500MB storage free
- Serverless scaling
- Easy connection string setup

### 2. **Supabase (Free)**
- PostgreSQL with 500MB storage
- Built-in authentication (optional)
- Real-time subscriptions

### 3. **PlanetScale (Free)**
- MySQL compatible (requires schema changes)
- 5GB storage free
- Branching for database schemas

## Pre-Migration Checklist

### 1. **Environment Variables Setup**
```bash
# Required for production
DATABASE_URL=postgresql://...
SESSION_SECRET=your-secure-random-string
SENDGRID_API_KEY=your-sendgrid-key (if using email)
OPENAI_API_KEY=your-openai-key (if using AI features)

# Optional
STRIPE_SECRET_KEY=your-stripe-key (for payments)
VITE_STRIPE_PUBLIC_KEY=your-stripe-public-key
```

### 2. **Database Migration**
```bash
# Export data from current database
npm run db:export

# Import to new database
npm run db:import
```

### 3. **Build Configuration**
Ensure your `package.json` has correct build scripts:
```json
{
  "scripts": {
    "build": "vite build && tsx build.ts",
    "start": "node dist/index.js",
    "db:push": "drizzle-kit push"
  }
}
```

## Step-by-Step Migration (Vercel + Neon)

### Step 1: Database Setup (5 minutes)
1. Go to [neon.tech](https://neon.tech) and create account
2. Create new PostgreSQL database
3. Copy connection string
4. Run database migration: `npm run db:push`

### Step 2: Code Repository (2 minutes)
1. Create GitHub repository
2. Push your MarketHub code
3. Ensure `.env` files are in `.gitignore`

### Step 3: Vercel Deployment (3 minutes)
1. Go to [vercel.com](https://vercel.com) and sign up with GitHub
2. Click "Import Project" and select your repository
3. Add environment variables in project settings
4. Deploy automatically

### Step 4: Custom Domain (Optional)
1. Purchase domain from Namecheap, GoDaddy, or Cloudflare
2. Add custom domain in Vercel dashboard
3. Update DNS records as instructed

## Production Optimizations

### 1. **Performance**
```typescript
// Enable compression
app.use(compression());

// Add security headers
app.use(helmet());

// Enable CORS for your domain
app.use(cors({
  origin: 'https://yourdomain.com',
  credentials: true
}));
```

### 2. **Database Connection Pooling**
```typescript
// For high traffic, use connection pooling
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

### 3. **Environment-Specific Settings**
```typescript
const isProduction = process.env.NODE_ENV === 'production';

app.use(session({
  secret: process.env.SESSION_SECRET,
  secure: isProduction, // HTTPS only in production
  sameSite: isProduction ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000 // 1 week
}));
```

## Cost Breakdown (Monthly)

### Budget Option ($0-5/month)
- **Hosting:** Vercel (Free)
- **Database:** Neon (Free)
- **Domain:** $1-2/month (optional)
- **Total:** $0-2/month

### Professional Option ($12-20/month)
- **Hosting:** Railway ($5) or Render ($7)
- **Database:** Included or separate ($7)
- **Domain:** $1-2/month
- **CDN:** Cloudflare (Free)
- **Total:** $12-20/month

## Monitoring & Analytics

### Free Options:
- **Vercel Analytics:** Built-in performance monitoring
- **Google Analytics:** Website traffic tracking
- **Sentry:** Error tracking (free tier)
- **Uptime Robot:** Website monitoring

## Security Considerations

1. **HTTPS:** Enabled by default on all platforms
2. **Environment Variables:** Never commit secrets to code
3. **Database Security:** Use connection strings with SSL
4. **Rate Limiting:** Implement for API endpoints
5. **Input Validation:** Validate all user inputs

## Backup Strategy

1. **Database Backups:** Most services include automatic backups
2. **Code Backups:** GitHub serves as version control
3. **File Uploads:** Consider cloud storage (AWS S3, Cloudinary)

## Support Resources

- **Vercel Documentation:** [vercel.com/docs](https://vercel.com/docs)
- **Railway Guides:** [docs.railway.app](https://docs.railway.app)
- **Neon Documentation:** [neon.tech/docs](https://neon.tech/docs)
- **Community Support:** Discord servers for each platform

## Migration Timeline

- **Planning:** 30 minutes (choose platform, domain)
- **Database Setup:** 15 minutes
- **Deployment:** 30 minutes
- **Testing:** 1 hour
- **DNS Propagation:** 24-48 hours (if using custom domain)

## Next Steps After Migration

1. Test all functionality thoroughly
2. Set up monitoring and alerts
3. Configure automated backups
4. Plan scaling strategy as user base grows
5. Consider CDN for faster global access

---

**Need Help?** Each hosting platform provides excellent documentation and support for common migration scenarios.