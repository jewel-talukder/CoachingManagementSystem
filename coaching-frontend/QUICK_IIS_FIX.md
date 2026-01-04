# 🚨 Quick Fix for IIS 403.14 Error

## ✅ **SOLUTION:**

The error happens because **iisnode is not installed** or **web.config is missing**.

### Step 1: Make Sure web.config is in Your Zip

When you zip `.next\standalone\`, make sure `web.config` is included!

**Files to zip:**
```
.next\standalone\
  ├── server.js          ✅
  ├── package.json        ✅
  ├── web.config          ✅ (MUST HAVE THIS!)
  ├── node_modules\       ✅
  └── .next\              ✅
```

### Step 2: Install iisnode on IIS Server

**Download and install:**
1. Go to: https://github.com/Azure/iisnode/releases
2. Download: `iisnode-full-v0.2.26-x64.msi` (or latest)
3. Install it on your IIS server
4. Restart IIS

### Step 3: Install URL Rewrite Module

**Download and install:**
1. Go to: https://www.iis.net/downloads/microsoft/url-rewrite
2. Download: `rewrite_amd64_en-US.msi`
3. Install it
4. Restart IIS

### Step 4: Verify Installation

On IIS server, run in PowerShell:
```powershell
# Check iisnode
Get-ItemProperty HKLM:\SOFTWARE\Microsoft\IISNode

# Check Node.js
node --version

# Check URL Rewrite
Get-WebGlobalModule | Where-Object {$_.Name -eq "RewriteModule"}
```

### Step 5: Deploy Again

1. **Extract your zip** to: `C:\inetpub\wwwroot\JewelTestFront\`
2. **Verify web.config exists** in that folder
3. **Verify server.js exists** in that folder
4. **Open IIS Manager:**
   - Right-click site → "Restart"
   - Or restart the Application Pool

### Step 6: Test

Open: `http://localhost:5000/`

## 🔍 Still Not Working?

### Check These:

1. **Application Pool Settings:**
   - Open IIS Manager → Application Pools
   - Find your pool → Advanced Settings
   - Set ".NET CLR Version" to **"No Managed Code"**

2. **File Permissions:**
   - Right-click `C:\inetpub\wwwroot\JewelTestFront`
   - Properties → Security
   - Add "IIS_IUSRS" with "Read & Execute" permissions

3. **Check iisnode Logs:**
   - Look in: `C:\inetpub\wwwroot\JewelTestFront\iisnode\`
   - Check for error messages

4. **Test server.js directly:**
   - Open: `http://localhost:5000/server.js`
   - Should show Node.js info (not 404)

## 📦 Use the Deployment Script

Run this in your project:
```powershell
.\deploy-to-iis.ps1
```

This will:
- ✅ Build your app
- ✅ Copy web.config to standalone
- ✅ Create a ready-to-deploy folder

