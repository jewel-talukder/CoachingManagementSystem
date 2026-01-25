# 🚨 No iisnode Logs = iisnode Not Running

## ❌ Problem: No log files means iisnode isn't working

If there are NO log files, it means:
- iisnode is NOT installed, OR
- iisnode is NOT being invoked, OR
- web.config is wrong

## ✅ Step-by-Step Fix:

### Step 1: Verify iisnode is Installed

On your IIS server, run in PowerShell (as Administrator):
```powershell
Get-ItemProperty HKLM:\SOFTWARE\Microsoft\IISNode
```

**If this fails → iisnode is NOT installed!**

**Download and install:**
- https://github.com/Azure/iisnode/releases
- Install: `iisnode-full-v0.2.26-x64.msi`
- **RESTART IIS** after installation

### Step 2: Check if iisnode Module is Loaded

In IIS Manager:
1. Click on your **SERVER** (not site)
2. Double-click **"Modules"**
3. Look for **"iisnode"** in the list

**If NOT there → iisnode not installed properly!**

### Step 3: Check Windows Event Viewer

1. Open **Event Viewer** (Windows key + R → `eventvwr.msc`)
2. Go to: **Windows Logs → Application**
3. Look for errors related to:
   - "iisnode"
   - "Node.js"
   - "server.js"
   - "HTTP Error 500"

**These will show you the real error!**

### Step 4: Test if server.js is Accessible

Open in browser:
```
http://93.127.140.63/server.js
```

**Expected:**
- ✅ Shows Node.js info → iisnode is working
- ❌ 404 Not Found → web.config is wrong
- ❌ 500 Error → Check Event Viewer

### Step 5: Check Application Pool

In IIS Manager:
1. **Application Pools** → Your Pool
2. **Advanced Settings:**
   - **.NET CLR Version:** "No Managed Code" ✅
   - **Managed Pipeline Mode:** "Integrated" ✅
   - **Start Mode:** "AlwaysRunning" ✅

### Step 6: Verify web.config Location

Make sure `web.config` is in:
```
C:\inetpub\wwwroot\JewelTestFront\web.config
```

**Same folder as `server.js`!**

### Step 7: Check File Permissions

Right-click `C:\inetpub\wwwroot\JewelTestFront`:
- Properties → Security
- **IIS_IUSRS** → Full Control ✅
- **IIS AppPool\YourPoolName** → Full Control ✅

### Step 8: Enable Detailed Errors (Temporary)

In `web.config`, change:
```xml
<httpErrors existingResponse="PassThrough" />
```
to:
```xml
<httpErrors errorMode="Detailed" />
```

**This will show the actual error in browser!**

⚠️ **Remove after debugging!**

## 🔍 Quick Diagnostic Commands

Run these on your IIS server:

```powershell
# 1. Check iisnode installation
Get-ItemProperty HKLM:\SOFTWARE\Microsoft\IISNode

# 2. Check Node.js
node --version

# 3. Check if files exist
Test-Path C:\inetpub\wwwroot\JewelTestFront\server.js
Test-Path C:\inetpub\wwwroot\JewelTestFront\web.config

# 4. Check IIS modules
Get-WebGlobalModule | Where-Object {$_.Name -like "*node*"}

# 5. Check Application Pool
Get-WebAppPoolState -Name "YourPoolName"
```

## 🎯 Most Likely Issue:

**iisnode is NOT installed or NOT enabled!**

Install it and restart IIS!



