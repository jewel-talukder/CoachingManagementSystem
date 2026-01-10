# 🔧 HTTP 500 Error Fix Guide

## ❌ Error: HTTP ERROR 500
This means the server is running but something is crashing.

## ✅ Step-by-Step Fix:

### Step 1: Check iisnode Logs (MOST IMPORTANT!)

On your IIS server, check the logs:
```
C:\inetpub\wwwroot\JewelTestFront\iisnode\
```

Look for files like:
- `iisnode-*.log`
- `stderr-*.txt`
- `stdout-*.txt`

**These logs will tell you EXACTLY what's wrong!**

### Step 2: Check Environment Variables

Make sure `.env.production` exists in your deployed folder with:
```
NEXT_PUBLIC_API_URL=http://93.127.140.63:4000/api
```

### Step 3: Common Issues & Fixes

#### Issue 1: Node.js Not Found
**Error in logs:** "Node.js is not installed"
**Fix:** Install Node.js v18+ on server

#### Issue 2: Missing Dependencies
**Error in logs:** "Cannot find module"
**Fix:** 
```powershell
cd C:\inetpub\wwwroot\JewelTestFront
npm install --production
```

#### Issue 3: Port Already in Use
**Error in logs:** "EADDRINUSE"
**Fix:** Change port in web.config or stop other Node.js apps

#### Issue 4: Permission Issues
**Error in logs:** "EACCES" or "Permission denied"
**Fix:** 
- Right-click folder → Properties → Security
- Give "IIS_IUSRS" full control
- Give "IIS AppPool\YourPoolName" full control

#### Issue 5: API Connection Failed
**Error in logs:** "ECONNREFUSED" or API errors
**Fix:** 
- Check if API server is running: `http://93.127.140.63:4000/api`
- Check firewall allows connection
- Verify API URL in `.env.production`

### Step 4: Test server.js Directly

Open in browser:
```
http://93.127.140.63/server.js
```

Should show Node.js info. If 404, web.config is wrong.

### Step 5: Enable Detailed Errors

In `web.config`, change:
```xml
<httpErrors existingResponse="PassThrough" />
```
to:
```xml
<httpErrors errorMode="Detailed" />
```

**⚠️ Only for debugging! Remove after fixing!**

### Step 6: Check Application Pool

In IIS Manager:
1. Go to Application Pools
2. Find your pool
3. Right-click → Advanced Settings
4. Set:
   - **.NET CLR Version:** "No Managed Code"
   - **Start Mode:** "AlwaysRunning"
   - **Idle Timeout:** "00:00:00" (disabled)

### Step 7: Restart Everything

```powershell
# Restart IIS
iisreset

# Or restart Application Pool in IIS Manager
```

## 🔍 Quick Diagnostic Commands

Run these on your IIS server:

```powershell
# Check Node.js
node --version

# Check if iisnode is installed
Get-ItemProperty HKLM:\SOFTWARE\Microsoft\IISNode

# Check if server.js exists
Test-Path C:\inetpub\wwwroot\JewelTestFront\server.js

# Check if web.config exists
Test-Path C:\inetpub\wwwroot\JewelTestFront\web.config

# Check file permissions
icacls C:\inetpub\wwwroot\JewelTestFront
```

## 📋 Most Likely Causes (in order):

1. **Missing .env.production** - API URL not set
2. **Node.js not in PATH** - iisnode can't find Node.js
3. **Permission issues** - Can't read/write files
4. **API server down** - Can't connect to backend
5. **Missing dependencies** - node_modules incomplete

## 🎯 First Thing to Do:

**Check the iisnode logs!** They will tell you exactly what's wrong.


