# 🚨 HTTP 500 Error - Quick Fix

## ✅ **FIRST: Check iisnode Logs**

On your IIS server, go to:
```
C:\inetpub\wwwroot\JewelTestFront\iisnode\
```

Look for log files - they will tell you EXACTLY what's wrong!

## 🔍 **Most Common Causes:**

### 1. **Node.js Not Found**
**Check:** Can iisnode find Node.js?
**Fix:** Make sure Node.js is installed and in PATH

### 2. **Missing Dependencies**
**Check:** Are all node_modules installed?
**Fix:** Run on server:
```powershell
cd C:\inetpub\wwwroot\JewelTestFront
npm install --production
```

### 3. **Permission Issues**
**Fix:** 
- Right-click `JewelTestFront` folder
- Properties → Security
- Add "IIS_IUSRS" with "Full Control"
- Add "IIS AppPool\YourPoolName" with "Full Control"

### 4. **API Connection Failed**
**Check:** Can server reach `http://93.127.140.63:4000/api`?
**Test:** Open PowerShell on server:
```powershell
Invoke-WebRequest http://93.127.140.63:4000/api
```

### 5. **Application Pool Settings**
**Fix:**
- IIS Manager → Application Pools
- Your pool → Advanced Settings
- Set ".NET CLR Version" to **"No Managed Code"**

## 📋 **Quick Checklist:**

- [ ] Check iisnode logs in `iisnode\` folder
- [ ] Verify Node.js is installed: `node --version`
- [ ] Verify iisnode is installed
- [ ] Check file permissions
- [ ] Verify `.env.production` exists with correct API URL
- [ ] Restart Application Pool in IIS Manager
- [ ] Restart IIS: `iisreset`

## 🎯 **The logs will tell you exactly what's wrong!**


