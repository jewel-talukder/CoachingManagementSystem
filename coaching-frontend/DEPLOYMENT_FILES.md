# 📦 Build Output Location

## ✅ Your Published Files Location:

```
D:\Jewel\MySelf\CoachingManagementSystem\coaching-frontend\.next\standalone\
```

## 📋 What's Inside:

The `.next\standalone\` folder contains:
- ✅ `.next` - Next.js build files
- ✅ `node_modules` - Required dependencies
- ✅ `package.json` - Package configuration
- ✅ `server.js` - Node.js server entry point
- ✅ `.env.production` - Production environment variables

## 🚀 For IIS Deployment:

### Step 1: Copy These Files to IIS

Copy the **ENTIRE** `.next\standalone\` folder to your IIS website directory.

**Full Path:**
```
D:\Jewel\MySelf\CoachingManagementSystem\coaching-frontend\.next\standalone\
```

### Step 2: Also Copy These Files (from project root):

1. **`web.config`** - IIS configuration (if you have one)
2. **`package.json`** - (already in standalone, but keep a backup)
3. **`.env.production`** - (already in standalone)

### Step 3: IIS Setup

1. Point IIS website to the `standalone` folder
2. Make sure `web.config` is in the root
3. Ensure Node.js and iisnode are installed on IIS server
4. Set up URL Rewrite rules (in `web.config`)

## 📍 Quick Reference:

**Build Output:** `.next\standalone\`  
**Full Path:** `D:\Jewel\MySelf\CoachingManagementSystem\coaching-frontend\.next\standalone\`

**To Deploy:** Copy the entire `standalone` folder to your IIS server!

