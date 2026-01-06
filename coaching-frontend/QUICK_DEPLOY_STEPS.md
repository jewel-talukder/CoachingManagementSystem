# ⚡ Quick Deploy Steps for IIS

## 🎯 The Problem
Your Next.js app is not loading on IIS because:
- Wrong files are being deployed
- `web.config` is not in the right location
- Missing prerequisites on IIS server

## ✅ The Solution (3 Steps)

### Step 1: Build and Prepare (On Your Development Machine)

```powershell
# Navigate to project
cd D:\Jewel\MySelf\CoachingManagementSystem\coaching-frontend

# Run deployment script
.\deploy-to-iis.ps1
```

This creates a `deploy-package` folder ready for IIS.

### Step 2: Copy to IIS Server

Copy **ALL contents** from `deploy-package\` folder to:
```
C:\inetpub\wwwroot\coaching-app\
```

### Step 3: Configure IIS

1. **Open IIS Manager**
2. **Create Website:**
   - Sites → Add Website
   - Name: `CoachingManagementSystem`
   - Path: `C:\inetpub\wwwroot\coaching-app`
   - Port: `80` or `5000`
3. **Set Application Pool:**
   - .NET CLR Version: `No Managed Code`
   - Idle Timeout: `0`

### Step 4: Test

Open: `http://localhost:5000/`

---

## ⚠️ Prerequisites (MUST HAVE on IIS Server)

1. **Node.js v18+** - https://nodejs.org/
2. **iisnode** - https://github.com/Azure/iisnode/releases
3. **URL Rewrite Module** - https://www.iis.net/downloads/microsoft/url-rewrite

---

## 🔍 If It Still Doesn't Work

1. Check `web.config` is in: `C:\inetpub\wwwroot\coaching-app\web.config`
2. Check `server.js` exists in: `C:\inetpub\wwwroot\coaching-app\server.js`
3. Test iisnode: `http://localhost:5000/server.js` (should show Node.js info)
4. Check logs: `C:\inetpub\wwwroot\coaching-app\iisnode\`

See `IIS_DEPLOYMENT_GUIDE.md` for detailed troubleshooting.

