# CoachingHub Frontend

This is the Next.js frontend application for CoachingHub.

## Getting Started

First, install the dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the home page.

## Important Notes

- The home page (`/`) is at `app/page.tsx` - this is the default landing page
- If you're being redirected to login, try:
  1. Clear your browser cache
  2. Use an incognito/private window
  3. Restart the dev server: Stop it (Ctrl+C) and run `npm run dev` again
  4. Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

## Project Structure

- `app/page.tsx` - Home page (landing page)
- `app/login/page.tsx` - Login page
- `app/register/page.tsx` - Registration page
- `app/admin/dashboard/page.tsx` - Admin dashboard

## Build

To build for production:

```bash
npm run build
```

To start the production server:

```bash
npm start
```

## Production Deployment

For production deployment with the live API URL (`http://93.127.140.63:4000/api`):

### Quick Deploy

**Windows:**
```bash
deploy.bat
```

**Linux/Mac:**
```bash
chmod +x deploy.sh
./deploy.sh
```

### Manual Deploy

1. Ensure `.env.production` exists with:
   ```
   NEXT_PUBLIC_API_URL=http://93.127.140.63:4000/api
   ```

2. Build for production:
   ```bash
   npm run build
   ```

3. Start production server:
   ```bash
   npm start
   ```

### Using PM2 (Recommended)

```bash
pm2 start ecosystem.config.js
pm2 save
```

For detailed deployment instructions, see:
- `QUICK_DEPLOY.md` - Quick reference guide
- `PRODUCTION_DEPLOYMENT.md` - Complete deployment guide
