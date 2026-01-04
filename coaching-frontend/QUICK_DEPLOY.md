# Quick Production Deployment Guide

## 🚀 Quick Start (3 Steps)

### Step 1: Verify Production Environment
Ensure `.env.production` exists with:
```
NEXT_PUBLIC_API_URL=http://93.127.140.63:4000/api
```

### Step 2: Build for Production

**Windows:**
```bash
npm run build
```

**Linux/Mac:**
```bash
npm run build
```

Or use the deployment script:
- **Windows:** `deploy.bat`
- **Linux/Mac:** `./deploy.sh` (make executable first: `chmod +x deploy.sh`)

### Step 3: Start Production Server

```bash
npm start
```

The application will be available at `http://localhost:3000`

---

## 📋 Complete Commands

```bash
# 1. Install dependencies (if not already done)
npm install

# 2. Build for production
npm run build

# 3. Start production server
npm start
```

---

## 🔧 Using PM2 (Recommended for Production)

```bash
# Install PM2 globally
npm install -g pm2

# Start with PM2
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# View logs
pm2 logs coaching-frontend

# Restart
pm2 restart coaching-frontend

# Stop
pm2 stop coaching-frontend
```

---

## ✅ Verification Checklist

After deployment, verify:

- [ ] Build completed without errors
- [ ] Production server starts successfully
- [ ] Application accessible at configured port (default: 3000)
- [ ] API connection works (check browser console for API calls)
- [ ] No CORS errors in browser console
- [ ] All pages load correctly

---

## 🐛 Troubleshooting

**Build fails:**
```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

**Port already in use:**
```bash
# Use different port
PORT=3001 npm start
```

**API connection issues:**
- Verify `.env.production` has correct API URL
- Check if API server is running and accessible
- Verify CORS settings on API server

---

## 📚 More Information

See `PRODUCTION_DEPLOYMENT.md` for detailed deployment instructions.

