# Deployment Guide

## Pre-Deployment Checklist

### ✅ Code Ready
- [ ] All features tested locally
- [ ] No console errors
- [ ] Environment variables documented
- [ ] Database migrations applied
- [ ] API keys secured

### ✅ External Services
- [ ] Stripe account verified (for production)
- [ ] Google Maps billing enabled
- [ ] Database hosted (PlanetScale, Railway, or AWS RDS)
- [ ] Email service configured (optional)

---

## Deployment Options

### Option 1: Vercel (Recommended) ⭐

**Pros:**
- Free tier available
- Automatic deployments from Git
- Built-in SSL
- WebSocket support
- Edge functions

**Steps:**

1. **Push to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin your-repo-url
   git push -u origin main
   ```

2. **Deploy to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Connect your GitHub repo
   - Configure environment variables
   - Deploy!

3. **Add Environment Variables:**
   In Vercel dashboard → Settings → Environment Variables:
   ```
   DATABASE_URL
   STRIPE_SECRET_KEY
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
   NEXTAUTH_SECRET
   NEXTAUTH_URL (your-domain.vercel.app)
   ```

4. **Configure Domain:**
   - Settings → Domains
   - Add custom domain (optional)

---

### Option 2: Railway

**Pros:**
- Easy database hosting
- Free tier
- Simple deployment

**Steps:**

1. **Create Railway account:** [railway.app](https://railway.app)

2. **Create new project:**
   - New Project → Deploy from GitHub
   - Select your repo

3. **Add MySQL database:**
   - New → Database → MySQL
   - Copy connection string

4. **Add environment variables:**
   - Variables tab
   - Add all env vars

5. **Deploy:**
   - Automatic on git push

---

### Option 3: Self-Hosted (VPS)

**For:** AWS EC2, DigitalOcean, Linode

**Steps:**

1. **Set up server:**
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y
   
   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt install -y nodejs
   
   # Install PM2
   sudo npm install -g pm2
   ```

2. **Clone and build:**
   ```bash
   git clone your-repo-url
   cd Antigravity
   npm install
   npm run build
   ```

3. **Set up environment:**
   ```bash
   nano .env.local
   # Add all environment variables
   ```

4. **Start with PM2:**
   ```bash
   pm2 start npm --name "carpooling-app" -- start
   pm2 save
   pm2 startup
   ```

5. **Set up Nginx:**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

6. **SSL with Let's Encrypt:**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com
   ```

---

## Database Hosting

### Option 1: PlanetScale (Recommended)

**Pros:**
- MySQL compatible
- Free tier (5GB)
- Automatic backups
- Branching

**Steps:**
1. Create account at [planetscale.com](https://planetscale.com)
2. Create database
3. Get connection string
4. Update `DATABASE_URL` in env vars
5. Run migrations: `npx prisma migrate deploy`

---

### Option 2: Railway MySQL

**Included with Railway deployment**

---

### Option 3: AWS RDS

**For production scale**

---

## Post-Deployment

### 1. Test Production

- [ ] Sign up new user
- [ ] Create ride
- [ ] Book ride
- [ ] Make payment (use test mode first!)
- [ ] Send chat message
- [ ] Check all pages load

### 2. Switch to Production Keys

**Stripe:**
- Replace `sk_test_` with `sk_live_`
- Replace `pk_test_` with `pk_live_`
- Set up webhooks for production URL

**Google Maps:**
- Update API restrictions to production domain

### 3. Set Up Monitoring

**Recommended tools:**
- [Sentry](https://sentry.io) - Error tracking
- [LogRocket](https://logrocket.com) - Session replay
- [Vercel Analytics](https://vercel.com/analytics) - Performance

### 4. Configure Webhooks

**Stripe Webhooks:**
1. Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://your-domain.com/api/payments/webhook`
3. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
4. Copy webhook secret to env vars

---

## Performance Optimization

### 1. Enable Caching

```typescript
// next.config.js
module.exports = {
  images: {
    domains: ['your-domain.com'],
  },
  headers: async () => [
    {
      source: '/:all*(svg|jpg|png)',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=31536000, immutable',
        },
      ],
    },
  ],
};
```

### 2. Optimize Images

- Use Next.js Image component
- Compress images before upload
- Use WebP format

### 3. Database Indexing

Already done in Prisma schema! ✅

---

## Security Checklist

- [ ] All API keys in environment variables
- [ ] HTTPS enabled (SSL certificate)
- [ ] CORS configured properly
- [ ] Rate limiting enabled (add if needed)
- [ ] SQL injection prevented (Prisma handles this)
- [ ] XSS protection (React handles this)
- [ ] Passwords hashed (bcrypt ✅)
- [ ] Sensitive data not in logs

---

## Backup Strategy

### Database Backups

**PlanetScale:** Automatic daily backups

**Railway:** Manual backups via dashboard

**Self-hosted:**
```bash
# Create backup script
#!/bin/bash
mysqldump -u user -p database > backup_$(date +%Y%m%d).sql

# Add to crontab (daily at 2 AM)
0 2 * * * /path/to/backup.sh
```

### File Backups

- Profile images in `/public/uploads`
- Use cloud storage (AWS S3, Cloudflare R2)

---

## Scaling Considerations

### When to scale:

- **100+ concurrent users:** Add Redis caching
- **1000+ rides/day:** Consider read replicas
- **10,000+ users:** Microservices architecture

### Quick wins:

1. **CDN for static assets** (Cloudflare)
2. **Database connection pooling** (Prisma handles this)
3. **Image optimization** (Next.js Image)
4. **API rate limiting**

---

## Troubleshooting

### "Database connection failed"
- Check `DATABASE_URL` is correct
- Verify database is accessible
- Check firewall rules

### "Stripe payment not working"
- Verify API keys are correct
- Check webhook is configured
- Test with test card first

### "Maps not loading"
- Verify API key is correct
- Check billing is enabled
- Verify domain restrictions

### "Chat not working"
- Ensure WebSocket support on host
- Check Socket.IO connection
- Verify CORS settings

---

## Support & Resources

- **Next.js Docs:** https://nextjs.org/docs
- **Prisma Docs:** https://www.prisma.io/docs
- **Stripe Docs:** https://stripe.com/docs
- **Vercel Support:** https://vercel.com/support

---

## Cost Estimate (Monthly)

**Free Tier:**
- Vercel: Free
- PlanetScale: Free (5GB)
- Stripe: Pay per transaction
- Google Maps: $200 credit

**Total: $0-50/month** for small scale

**Production Scale (1000+ users):**
- Hosting: $20-50
- Database: $10-30
- Maps API: $50-100
- Monitoring: $20-50

**Total: $100-230/month**

---

**Ready to deploy!** 🚀

Choose your platform and follow the steps above. Start with Vercel for the easiest deployment.
