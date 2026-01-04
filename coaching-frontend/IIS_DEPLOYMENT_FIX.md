# 🔧 IIS 403.14 Error Fix

## ❌ Problem
```
HTTP Error 403.14 - Forbidden
The Web server is configured to not list the contents of this directory.
```

## ✅ Solution

### Step 1: Copy web.config to Standalone Folder

After building, copy `web.config` into the `.next\standalone\` folder:

```powershell
Copy-Item "web.config" ".next\standalone\web.config" -Force
```

### Step 2: What to Zip and Deploy

Zip these files from `.next\standalone\`:
- ✅ `server.js` (Node.js entry point)
- ✅ `package.json`
- ✅ `node_modules\` (entire folder)
- ✅ `.next\` (entire folder - contains your app)
- ✅ `web.config` (IIS configuration)
- ✅ `.env.production` (if exists)

### Step 3: IIS Server Requirements

**MUST HAVE on IIS Server:**
1. ✅ **Node.js installed** (v18 or higher)
2. ✅ **iisnode installed** (download from: https://github.com/Azure/iisnode)
3. ✅ **URL Rewrite Module** (for IIS - download from Microsoft)

### Step 4: IIS Configuration

1. **Extract your zip** to: `C:\inetpub\wwwroot\JewelTestFront\`
2. **Make sure `web.config` is in the root** of that folder
3. **In IIS Manager:**
   - Right-click your site → "Manage Application" → "Advanced Settings"
   - Set "Physical Path" to: `C:\inetpub\wwwroot\JewelTestFront`
   - Make sure "Application Pool" is set (create one if needed)

### Step 5: Verify iisnode is Working

Check if `server.js` is accessible:
- Open: `http://localhost:5000/server.js`
- Should show Node.js info (not 404)

### Step 6: Test Your App

Open: `http://localhost:5000/`

## 🔍 Troubleshooting

### Still Getting 403.14?

1. **Check iisnode is installed:**
   ```powershell
   Get-ItemProperty HKLM:\SOFTWARE\Microsoft\IISNode
   ```

2. **Check web.config is in the right place:**
   - Should be in: `C:\inetpub\wwwroot\JewelTestFront\web.config`
   - Same folder as `server.js`

3. **Check Node.js is installed:**
   ```powershell
   node --version
   ```

4. **Check IIS Application Pool:**
   - Open IIS Manager
   - Go to "Application Pools"
   - Make sure your pool is running
   - Set .NET CLR Version to "No Managed Code"

5. **Check file permissions:**
   - Right-click `C:\inetpub\wwwroot\JewelTestFront`
   - Properties → Security
   - Make sure "IIS_IUSRS" has "Read & Execute" permissions

## 📦 Quick Deploy Script

Create a file `deploy-to-iis.ps1`:

```powershell
# Build
npm run build

# Copy web.config to standalone
Copy-Item "web.config" ".next\standalone\web.config" -Force

# Create zip
Compress-Archive -Path ".next\standalone\*" -DestinationPath "deploy.zip" -Force

Write-Host "✅ Deployment package ready: deploy.zip" -ForegroundColor Green
Write-Host "📦 Extract this to: C:\inetpub\wwwroot\JewelTestFront\" -ForegroundColor Yellow
```

