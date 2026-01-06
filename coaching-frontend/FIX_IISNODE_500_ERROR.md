# 🚨 Fix iisnode 500.1001 Error - Permissions Issue

## ❌ Error Message:
```
iisnode encountered an error when processing the request.
HRESULT: 0x2
HTTP status: 500
HTTP subStatus: 1001
The node.exe process has not written any information to stderr
```

## ✅ Solution: Fix Application Pool Permissions

### Step 1: Find Your Application Pool Name

In IIS Manager:
1. Go to **Application Pools**
2. Find the pool used by your site
3. **Note the name** (e.g., "DefaultAppPool" or "CoachingManagementSystem")

### Step 2: Give FULL CONTROL to Application Pool

On IIS Server, right-click your folder:
```
C:\inetpub\wwwroot\coaching-app\
```

**Properties → Security Tab:**

1. Click **"Edit"** button
2. Click **"Add"** button
3. Type: `IIS AppPool\YourPoolName`
   - Replace `YourPoolName` with your actual pool name
   - Example: `IIS AppPool\DefaultAppPool`
4. Click **"Check Names"** → OK
5. Select the user you just added
6. Check **"Full Control"** ✅ (or at least "Modify")
7. Click **OK** to save

### Step 3: Also Add IIS_IUSRS

Same folder → Properties → Security:

1. Click **"Edit"** → **"Add"**
2. Type: `IIS_IUSRS`
3. Click **"Check Names"** → OK
4. Give **"Full Control"** ✅
5. Click **OK**

### Step 4: Create iisnode Folder Manually (Optional)

Create the log folder manually:
```
C:\inetpub\wwwroot\coaching-app\iisnode\
```

Right-click → Properties → Security:
- Give **"IIS AppPool\YourPoolName"** → **Full Control**
- Give **"IIS_IUSRS"** → **Full Control**

### Step 5: Restart Application Pool

In IIS Manager:
1. **Application Pools** → Your Pool
2. Right-click → **Recycle** (or **Stop** then **Start**)

### Step 6: Test Again

Open in browser:
```
http://93.127.140.63:5000/server.js
```

Should now work! ✅

## 🔍 If Still Not Working:

### Check These:

1. **Application Pool Identity:**
   - IIS Manager → Application Pools → Your Pool
   - Advanced Settings → Identity
   - Should be: `ApplicationPoolIdentity` (default)

2. **Verify Permissions:**
   ```powershell
   # Run as Administrator
   icacls "C:\inetpub\wwwroot\coaching-app" /grant "IIS AppPool\YourPoolName:(OI)(CI)F"
   icacls "C:\inetpub\wwwroot\coaching-app" /grant "IIS_IUSRS:(OI)(CI)F"
   ```

3. **Check Node.js:**
   ```powershell
   node --version
   ```
   Should show v18 or higher

4. **Check server.js exists:**
   ```
   C:\inetpub\wwwroot\coaching-app\server.js
   ```

## 💡 Quick PowerShell Fix:

Run this in PowerShell (as Administrator):
```powershell
$folder = "C:\inetpub\wwwroot\coaching-app"
$poolName = "YourPoolName"  # Replace with your actual pool name

# Grant Full Control
icacls $folder /grant "IIS AppPool\$poolName:(OI)(CI)F" /T
icacls $folder /grant "IIS_IUSRS:(OI)(CI)F" /T
```

Replace `YourPoolName` with your actual Application Pool name!

