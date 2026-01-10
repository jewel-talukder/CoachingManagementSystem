# 🔧 Fix "Cannot find module 'next/dist/compiled/webpack/webpack-lib'" Error

## ❌ Error:
```
Unhandled Rejection: Error: Cannot find module 'next/dist/compiled/webpack/webpack-lib'
```

## 🔍 Root Cause:
The standalone build's `node_modules` folder is **incomplete** or **corrupted**. Next.js standalone builds should include all dependencies, but sometimes they don't.

---

## ✅ Solution 1: Rebuild from Scratch (RECOMMENDED)

### On Your Development Machine:

1. **Clean everything:**
   ```bash
   cd coaching-frontend
   rm -rf .next
   rm -rf node_modules
   rm package-lock.json
   ```

2. **Reinstall dependencies:**
   ```bash
   npm install
   ```

3. **Rebuild:**
   ```bash
   npm run build
   ```

4. **Verify the standalone folder:**
   ```bash
   # Check if node_modules/next exists
   dir .next\standalone\node_modules\next
   ```

5. **Deploy the NEW standalone folder to IIS**

---

## ✅ Solution 2: Fix on IIS Server (If rebuild not possible)

### On Your IIS Server:

1. **Navigate to your deployment folder:**
   ```
   C:\inetpub\wwwroot\JewelTestFront\
   ```

2. **Delete node_modules:**
   ```powershell
   Remove-Item -Recurse -Force node_modules
   ```

3. **Reinstall dependencies:**
   ```powershell
   npm install --production
   ```

4. **Restart IIS:**
   ```powershell
   iisreset
   ```

5. **Test again:**
   ```
   http://93.127.140.63:3000/server.js
   ```

---

## ✅ Solution 3: Copy Complete node_modules (Alternative)

If the standalone build's node_modules is incomplete:

### On Development Machine:

1. **After building, check if node_modules is complete:**
   ```bash
   # Check Next.js is in standalone node_modules
   dir .next\standalone\node_modules\next\dist\compiled\webpack
   ```

2. **If missing, copy from main node_modules:**
   ```powershell
   # Copy Next.js completely
   Copy-Item -Path "node_modules\next" -Destination ".next\standalone\node_modules\next" -Recurse -Force
   ```

3. **Deploy the updated standalone folder**

---

## ✅ Solution 4: Use Full node_modules (Last Resort)

If standalone build keeps having issues:

### On IIS Server:

1. **Copy the ENTIRE node_modules from development:**
   ```powershell
   # On development machine, zip node_modules
   # Then on IIS server, extract it to:
   C:\inetpub\wwwroot\JewelTestFront\node_modules\
   ```

2. **Make sure it includes:**
   - `next/dist/compiled/webpack/webpack-lib`
   - All Next.js internal files
   - All dependencies

---

## 🔍 Verification Steps:

### Check if Next.js is Complete:

**On IIS Server:**
```powershell
# Check if webpack-lib exists
Test-Path "C:\inetpub\wwwroot\JewelTestFront\node_modules\next\dist\compiled\webpack\webpack-lib"
```

**Should return:** `True`

### Check node_modules Size:

**On IIS Server:**
```powershell
$size = (Get-ChildItem "C:\inetpub\wwwroot\JewelTestFront\node_modules" -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
Write-Host "node_modules size: $([math]::Round($size, 2)) MB"
```

**Expected:** Should be at least 200-300 MB (for Next.js 15)

---

## 🎯 Recommended Action:

**Start with Solution 1** (rebuild from scratch) - this is the most reliable fix.

If that doesn't work, try **Solution 2** (reinstall on server).

---

## 📋 Checklist:

- [ ] Deleted `.next` folder before rebuild
- [ ] Deleted `node_modules` before rebuild  
- [ ] Ran `npm install` fresh
- [ ] Ran `npm run build` successfully
- [ ] Verified `node_modules/next` exists in standalone folder
- [ ] Verified `next/dist/compiled/webpack` exists
- [ ] Deployed complete standalone folder to IIS
- [ ] Restarted IIS after deployment
- [ ] Tested `http://93.127.140.63:3000/server.js`

---

## ⚠️ Important Notes:

1. **Standalone builds should be self-contained** - if node_modules is incomplete, the build process had an issue
2. **Always rebuild from scratch** if you see module errors
3. **Don't mix development and production node_modules** - they can conflict
4. **The standalone folder should work independently** - if it doesn't, the build is incomplete

---

## 🔗 Related Issues:

- Next.js standalone build missing dependencies
- Incomplete node_modules in standalone output
- Module resolution errors in production

