# 🚨 HTTP 403 Error Fix - Step by Step

## ❌ Error: "Access to localhost was denied - HTTP ERROR 403"

## ✅ Quick Fix Steps:

### Step 1: Check File Permissions (MOST IMPORTANT!)

On IIS Server, right-click your folder:
```
C:\inetpub\wwwroot\coaching-app\
```

**Properties → Security Tab:**

1. Click **"Edit"** button
2. Click **"Add"** button
3. Type: `IIS_IUSRS`
4. Click **"Check Names"** → OK
5. Give **"Read & Execute"** permissions ✅
6. Click **"Add"** again
7. Type: `IIS AppPool\YourAppPoolName` (replace YourAppPoolName with your actual pool name)
8. Click **"Check Names"** → OK
9. Give **"Read & Execute"** permissions ✅
10. Click **OK** to save

### Step 2: Verify iisnode is Installed

Open PowerShell (as Administrator) on IIS server:
```powershell
Get-ItemProperty HKLM:\SOFTWARE\Microsoft\IISNode
```

**If error → iisnode NOT installed!**

Download and install:
- https://github.com/Azure/iisnode/releases
- Install: `iisnode-full-v0.2.26-x64.msi`
- **RESTART IIS** after installation

### Step 3: Check Application Pool Settings

In IIS Manager:
1. **Application Pools** → Find your pool
2. Right-click → **Advanced Settings**
3. Set these:
   - **.NET CLR Version:** `No Managed Code` ✅
   - **Managed Pipeline Mode:** `Integrated` ✅
   - **Start Mode:** `AlwaysRunning` ✅
   - **Idle Timeout:** `0` ✅

### Step 4: Verify Files are in Right Place

Check these files exist:
```
C:\inetpub\wwwroot\coaching-app\
├── server.js          ✅ MUST EXIST
├── web.config         ✅ MUST EXIST
├── package.json       ✅ MUST EXIST
├── .next\             ✅ MUST EXIST
└── node_modules\      ✅ MUST EXIST
```

### Step 5: Test server.js Directly

Open in browser:
```
http://your-server/server.js
```

**Expected:**
- ✅ Shows Node.js info → iisnode working!
- ❌ 404 → web.config wrong
- ❌ 403 → Permission issue (go back to Step 1)

### Step 6: Restart Everything

1. **IIS Manager:**
   - Right-click your site → **Restart**
   - Or restart Application Pool

2. **Or use PowerShell:**
   ```powershell
   iisreset
   ```

### Step 7: Check Windows Event Viewer

1. Press **Windows + R**
2. Type: `eventvwr.msc`
3. Go to: **Windows Logs → Application**
4. Look for errors about:
   - "iisnode"
   - "server.js"
   - "403"
   - "Permission denied"

**These logs will tell you EXACTLY what's wrong!**

## 🔍 Still Not Working?

### Check These:

1. **Node.js installed?**
   ```powershell
   node --version
   ```
   Should show v18 or higher

2. **URL Rewrite Module installed?**
   - Download: https://www.iis.net/downloads/microsoft/url-rewrite
   - Install and restart IIS

3. **web.config syntax correct?**
   - Open web.config in Notepad
   - Check for any XML errors
   - Make sure it's valid XML

4. **Firewall blocking?**
   - Check Windows Firewall
   - Allow port 80/5000

## ✅ Most Common Fix:

**90% of 403 errors = File Permissions!**

Just do Step 1 properly and it will work!

