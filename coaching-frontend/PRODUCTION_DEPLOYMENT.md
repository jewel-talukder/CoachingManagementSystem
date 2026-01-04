# Production Deployment Guide

This guide will help you build and deploy the Coaching Management System frontend to production.

## Prerequisites

1. Node.js (v18 or higher) installed
2. Production API URL configured: `http://93.127.140.63:4000/api`
3. All dependencies installed

## Step 1: Verify Production Environment

Ensure the `.env.production` file exists and contains:

```env
NEXT_PUBLIC_API_URL=http://93.127.140.63:4000/api
```

## Step 2: Install Dependencies

```bash
cd coaching-frontend
npm install
```

## Step 3: Build for Production

Build the production-optimized bundle:

```bash
npm run build
```

This will:
- Optimize all assets
- Generate static pages where possible
- Create production-ready bundles
- Output to `.next` directory

**Expected Output:**
```
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Collecting page data
✓ Generating static pages
✓ Finalizing page optimization
```

## Step 4: Test Production Build Locally (Optional)

Before deploying, test the production build locally:

```bash
npm start
```

This starts the production server on `http://localhost:3000`

## Step 5: Deploy to Production Server

### Option A: Deploy to Server with Node.js

1. **Copy files to server:**
   ```bash
   # Copy the entire coaching-frontend directory to your server
   # Make sure to include:
   # - .next/ (build output)
   # - node_modules/
   # - package.json
   # - .env.production
   # - public/
   # - All other necessary files
   ```

2. **On the server, install production dependencies:**
   ```bash
   npm install --production
   ```

3. **Start the production server:**
   ```bash
   npm start
   ```

4. **Or use PM2 for process management:**
   ```bash
   npm install -g pm2
   pm2 start npm --name "coaching-frontend" -- start
   pm2 save
   pm2 startup
   ```

### Option B: Deploy as Static Export (Alternative)

If you want to deploy as static files:

1. Update `next.config.ts` to enable static export:
   ```typescript
   const nextConfig: NextConfig = {
     output: 'export',
   };
   ```

2. Build:
   ```bash
   npm run build
   ```

3. Deploy the `out/` directory to your web server (Nginx, Apache, etc.)

## Step 6: Configure Web Server (Nginx Example)

If using Nginx as a reverse proxy:

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
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Step 7: Environment Variables on Server

Make sure your production server has the `.env.production` file:

```env
NEXT_PUBLIC_API_URL=http://93.127.140.63:4000/api
```

Or set it as an environment variable:

```bash
export NEXT_PUBLIC_API_URL=http://93.127.140.63:4000/api
```

## Troubleshooting

### Build Fails
- Check for TypeScript errors: `npm run lint`
- Ensure all dependencies are installed: `npm install`
- Check Node.js version: `node --version` (should be 18+)

### API Connection Issues
- Verify `.env.production` has correct API URL
- Check if API server is accessible from production server
- Verify CORS settings on API server allow your frontend domain

### Performance Issues
- Enable production optimizations in `next.config.ts`
- Use CDN for static assets
- Enable compression on web server

## Production Checklist

- [ ] `.env.production` file exists with correct API URL
- [ ] All dependencies installed (`npm install`)
- [ ] Production build successful (`npm run build`)
- [ ] Production server started (`npm start`)
- [ ] API server is accessible from production server
- [ ] CORS configured on API server
- [ ] Web server (Nginx/Apache) configured if using reverse proxy
- [ ] SSL certificate installed (for HTTPS)
- [ ] Domain name configured
- [ ] Monitoring/logging set up

## Quick Deploy Script

Create a `deploy.sh` script:

```bash
#!/bin/bash
echo "Building for production..."
npm run build

echo "Starting production server..."
npm start
```

Make it executable:
```bash
chmod +x deploy.sh
```

Run it:
```bash
./deploy.sh
```

## PM2 Configuration (Recommended for Production)

Create `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'coaching-frontend',
    script: 'npm',
    args: 'start',
    cwd: './coaching-frontend',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      NEXT_PUBLIC_API_URL: 'http://93.127.140.63:4000/api'
    }
  }]
};
```

Start with PM2:
```bash
pm2 start ecosystem.config.js
pm2 save
```

## Support

For issues or questions, check:
- Next.js Documentation: https://nextjs.org/docs
- Deployment Documentation: https://nextjs.org/docs/deployment

