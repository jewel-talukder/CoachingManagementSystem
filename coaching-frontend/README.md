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
