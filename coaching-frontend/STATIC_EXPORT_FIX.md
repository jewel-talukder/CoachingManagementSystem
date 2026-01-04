# ⚠️ Next.js 16.1.0 Static Export Bug

## Problem
Next.js 16.1.0 with Turbopack has a bug where it doesn't detect `generateStaticParams()` even though the function exists in the files.

## ✅ Solution Options

### Option 1: Downgrade to Next.js 15 (Recommended for Static Export)

```bash
npm install next@15 react@latest react-dom@latest
npm run build
```

This will create the `out/` folder with `index.html` files.

### Option 2: Use Standalone (Current Working Solution)

Keep `output: 'standalone'` in `next.config.ts` - this works but requires Node.js on IIS.

**Location:** `.next/standalone/`

### Option 3: Wait for Next.js Fix

This is a known issue in Next.js 16.1.0. You can:
- Wait for Next.js 16.1.1 or 16.2.0
- Or use Option 1 (downgrade to 15)

## 🎯 Recommended Action

**For pure static HTML files (like Angular dist):**
1. Downgrade to Next.js 15
2. Run `npm run build`
3. Get `out/` folder with `index.html`
4. Copy `out/` to IIS

**For IIS with Node.js:**
1. Keep Next.js 16.1.0
2. Use `output: 'standalone'`
3. Copy `.next/standalone/` to IIS
4. Configure IIS with iisnode

