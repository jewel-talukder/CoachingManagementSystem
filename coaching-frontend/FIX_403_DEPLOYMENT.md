# 🚨 Fix HTTP 403 Error After Deployment

## ❌ Error: "Access to 93.127.140.63 was denied - HTTP ERROR 403"

This is a **server-side configuration issue**. Follow these steps on your IIS server:

---

## ✅ Step-by-Step Fix:

### Step 1: Check File Permissions (MOST CRITICAL!)

**On your IIS server:**

1. Navigate to your deployment folder (e.g., `C:\inetpub\wwwroot\YourSiteName\`)
2. **Right-click the folder** → **Properties** → **Security** tab
3. Click **"Edit"** button
4. Click **"Add"** button
5. Type: `IIS_IUSRS`
6. Click **"Check Names"** → Click **OK**
7. Select **"IIS_IUSRS"** → Check **"Read & Execute"** ✅
8. Click **"Add"** again
9. Type: `IIS AppPool\YourAppPoolName` (replace with your actual app pool name)
10. Click **"Check Names"** → Click **OK**
11. Select the App Pool → Check **"Read & Execute"** ✅
12. Click **OK** to save

**Apply to subfolders:**
- Check **"Replace all child object permissions"** ✅
- Click **OK**

---

### Step 2: Verify iisnode is Installed

**Open PowerShell (as Administrator) on IIS server:**

```powershell
Get-ItemProperty HKLM:\SOFTWARE\Microsoft\IISNode
```

**If this fails → iisnode is NOT installed!**

**Download and install:**
1. Go to: https://github.com/Azure/iisnode/releases
2. Download: `iisnode-full-v0.2.26-x64.msi` (or latest version)
3. Install it
4. **RESTART IIS** after installation:
   ```powershell
   iisreset
   ```

---

### Step 3: Check Application Pool Settings

**In IIS Manager:**

1. Open **IIS Manager**
2. Click **Application Pools**
3. Find your application pool (or create one)
4. **Right-click** → **Advanced Settings**
5. Set these values:
   - **.NET CLR Version:** `No Managed Code` ✅
   - **Managed Pipeline Mode:** `Integrated` ✅
   - **Start Mode:** `AlwaysRunning` ✅
   - **Idle Timeout:** `0` (zero) ✅
6. Click **OK**

---

### Step 4: Verify Files are Deployed Correctly

**Check these files exist in your deployment folder:**

```
C:\inetpub\wwwroot\YourSiteName\
├── server.js          ✅ MUST EXIST
├── web.config         ✅ MUST EXIST (updated version)
├── package.json       ✅ MUST EXIST
├── .env.production    ✅ MUST EXIST
├── .next\             ✅ MUST EXIST
│   ├── static\        ✅ MUST EXIST (for CSS/JS)
│   └── server\        ✅ MUST EXIST
└── node_modules\      ✅ MUST EXIST
```

---

### Step 5: Test server.js Directly

**Open in browser:**
```
http://93.127.140.63/server.js
```

**Expected results:**
- ✅ Shows Node.js info → iisnode is working!
- ❌ 404 Not Found → web.config is wrong or missing
- ❌ 403 Forbidden → Go back to Step 1 (Permissions)
- ❌ 500 Error → Check Event Viewer for details

---

### Step 6: Check IIS Authentication

**In IIS Manager:**

1. Click on your **Website**
2. Double-click **"Authentication"**
3. **Enable:** "Anonymous Authentication" ✅
4. **Disable:** All other authentication methods (if not needed)

---

### Step 7: Verify web.config is in Root

**Make sure `web.config` is in the same folder as `server.js`:**

```
C:\inetpub\wwwroot\YourSiteName\web.config  ✅
C:\inetpub\wwwroot\YourSiteName\server.js    ✅
```

**They must be in the SAME folder!**

---

### Step 8: Check Windows Event Viewer

**If still not working:**

1. Open **Event Viewer** (Windows key + R → `eventvwr.msc`)
2. Go to: **Windows Logs → Application**
3. Look for errors related to:
   - "iisnode"
   - "Node.js"
   - "server.js"
   - "403"
   - "Permission denied"

**These will show you the exact error!**

---

### Step 9: Restart Everything

**On IIS server:**

1. **Restart Application Pool:**
   - IIS Manager → Application Pools
   - Right-click your pool → **Recycle**

2. **Restart IIS:**
   ```powershell
   iisreset
   ```

3. **Test again:**
   ```
   http://93.127.140.63/
   ```

---

## 🔍 Common Issues:

### Issue 1: "403.14 - Directory listing denied"
**Fix:** Make sure `web.config` exists and `server.js` is in the root folder

### Issue 2: "403 - Forbidden"
**Fix:** Check file permissions (Step 1) - This is the #1 cause!

### Issue 3: "iisnode not found"
**Fix:** Install iisnode (Step 2)

### Issue 4: "Node.js not found"
**Fix:** Install Node.js v18+ on the server

---

## ✅ Verification Checklist:

- [ ] File permissions set (IIS_IUSRS + App Pool)
- [ ] iisnode installed and verified
- [ ] Application Pool set to "No Managed Code"
- [ ] web.config exists in root folder
- [ ] server.js exists in root folder
- [ ] .next/static folder exists
- [ ] Anonymous Authentication enabled
- [ ] Application Pool restarted
- [ ] IIS restarted
- [ ] Tested server.js directly

---

## 📞 Still Not Working?

**Check these logs:**

1. **iisnode logs:**
   ```
   C:\inetpub\wwwroot\YourSiteName\iisnode\
   ```

2. **Windows Event Viewer:**
   - Application logs
   - System logs

3. **IIS Failed Request Tracing:**
   - Enable in IIS Manager for detailed errors

---

**90% of 403 errors = File Permissions Issue!**

Start with Step 1 and work through each step carefully.

