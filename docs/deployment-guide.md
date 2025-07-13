# MarketHub Deployment Guide

## Quick Answer: Platform Options

**✅ EASIEST: Platform-as-a-Service (PaaS)**
- **Vercel**: Best for this stack - built for Node.js/React
- **Railway**: Simple deployment with PostgreSQL included  
- **Render**: Free tier available, easy setup
- **Heroku**: Classic choice, good documentation

**✅ FLEXIBLE: Cloud Servers**
- **DigitalOcean Droplets**: $5/month, full control
- **Linode**: Similar to DigitalOcean, good performance
- **AWS EC2**: More complex but scalable
- **Google Cloud Platform**: Good integration options

**⚡ CURRENT: Replit Deployments**
- Already configured and ready to deploy
- Custom domain support (markethubpro.com)
- Zero configuration needed

## Data Persistence Explained

**Current Status: MemStorage (Non-Persistent)**
```javascript
// server/storage.ts - Line 620
export const storage = new MemStorage(); // ❌ Resets on restart
```

**To Make Data Persistent:**
```javascript
export const storage = new DatabaseStorage(); // ✅ Saves to PostgreSQL
```

## 1. Enable Real Email Sending

**Current Issue:** Using mock email system instead of SendGrid

**Fix Required:**
```javascript
// In server/routes.ts - Change import
import { sendMultipleInvitations } from "./email"; // ✅ Real SendGrid
// Instead of:
// import { sendMultipleInvitations } from "./notifications"; // ❌ Mock
```

## 2. Facebook Sharing Integration

**Current:** Manual link sharing only  
**Upgrade Needed:** Facebook SDK integration for auto-posting

## Platform Migration Instructions

### Option 1: Vercel (Recommended for React/Node.js)

**Steps:**
1. **Prepare Code**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Vercel Setup**
   - Connect GitHub repo to Vercel
   - Add environment variables:
     ```
     DATABASE_URL=your_postgres_url
     SENDGRID_API_KEY=your_sendgrid_key
     SESSION_SECRET=your_session_secret
     OPENAI_API_KEY=your_openai_key
     ```

3. **Database Options**
   - **Neon**: Serverless PostgreSQL (recommended)
   - **Supabase**: PostgreSQL with additional features
   - **PlanetScale**: MySQL alternative

**Cost:** Free tier covers most personal use

### Option 2: DigitalOcean Droplet

**Monthly Cost:** $5-10/month  
**Control Level:** Full server access

**Setup Steps:**
1. **Create Droplet**
   ```bash
   # Ubuntu 22.04 LTS
   # $5/month - 1GB RAM, 1 vCPU
   ```

2. **Install Dependencies**
   ```bash
   # SSH into server
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs postgresql postgresql-contrib nginx
   ```

3. **Setup Application**
   ```bash
   git clone your-repo
   cd markethub
   npm install
   npm run build
   ```

4. **Configure Database**
   ```bash
   sudo -u postgres createdb markethub
   sudo -u postgres createuser markethub
   # Set up DATABASE_URL environment variable
   ```

5. **Setup Nginx Reverse Proxy**
   ```nginx
   server {
       listen 80;
       server_name markethubpro.com;
       
       location / {
           proxy_pass http://localhost:5000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```

6. **Process Management**
   ```bash
   # Install PM2 for process management
   npm install -g pm2
   pm2 start npm --name "markethub" -- start
   pm2 startup
   pm2 save
   ```

### Option 3: Railway (Balanced Option)

**Why Railway:**
- Built-in PostgreSQL
- Simple deployment
- Custom domains included
- $5/month pricing

**Setup:**
1. Connect GitHub repo
2. Railway auto-detects Node.js
3. Add PostgreSQL addon
4. Set environment variables
5. Deploy automatically

### Option 4: AWS EC2 (Enterprise Scale)

**Best For:** High traffic, need AWS services  
**Complexity:** High  
**Cost:** Variable ($10-100+/month)

**Quick Setup:**
1. Launch EC2 instance (t3.micro for start)
2. Use RDS for PostgreSQL database
3. Setup Load Balancer for scaling
4. CloudFront for CDN

## Database Migration

**If Moving from Replit to External:**

1. **Export Current Data** (if using DatabaseStorage)
   ```bash
   npm run db:export # Custom script needed
   ```

2. **Setup New Database**
   ```bash
   # On new platform
   npm run db:push
   npm run db:import # Import old data
   ```

## Custom Domain Setup

**For Any Platform:**

1. **Buy Domain** (markethubpro.com)
   - GoDaddy: ~$15/year
   - Namecheap: ~$12/year

2. **Configure DNS**
   ```
   Type: A Record
   Name: @ (root domain)
   Value: Your_Server_IP
   
   Type: CNAME
   Name: www
   Value: markethubpro.com
   ```

3. **SSL Certificate**
   - Most platforms provide free SSL
   - Manual setup: Let's Encrypt (certbot)

## Environment Variables Required

**Essential for All Platforms:**
```env
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@host:5432/db
SESSION_SECRET=your-32-char-secret
SENDGRID_API_KEY=SG.your_sendgrid_key
OPENAI_API_KEY=sk-your_openai_key

# Optional
STRIPE_SECRET_KEY=sk_your_stripe_key
VITE_STRIPE_PUBLIC_KEY=pk_your_stripe_key
```

## Migration Checklist

**Before Moving:**
- [ ] Test app locally with production build
- [ ] Export any existing data
- [ ] Gather all API keys and secrets
- [ ] Choose domain name
- [ ] Select hosting platform

**During Migration:**
- [ ] Setup database first
- [ ] Configure environment variables
- [ ] Deploy application code
- [ ] Test email functionality
- [ ] Configure custom domain
- [ ] Setup SSL certificate

**After Migration:**
- [ ] Test all features work
- [ ] Setup monitoring/logging
- [ ] Configure backups
- [ ] Update DNS if needed

## Cost Comparison

| Platform | Monthly Cost | Setup Difficulty | Control Level |
|----------|-------------|------------------|---------------|
| **Replit** | $7-20 | ⭐ Easy | Medium |
| **Vercel** | $0-20 | ⭐⭐ Easy | Medium |
| **Railway** | $5-15 | ⭐⭐ Easy | Medium |
| **DigitalOcean** | $5-20 | ⭐⭐⭐ Medium | High |
| **AWS** | $10-50+ | ⭐⭐⭐⭐ Hard | Very High |

## Recommendation

**For Your Use Case:**
1. **Start:** Deploy on Replit (easiest, already setup)
2. **Scale:** Move to Railway or Vercel when you need more
3. **Enterprise:** Consider DigitalOcean or AWS for high traffic

**Best Migration Path:**
Replit → Railway → DigitalOcean → AWS (as you grow)

---

*All platforms can handle your current application architecture without code changes*