# 🔧 Install iisnode on IIS Server

## ❌ Problem Confirmed: iisnode is NOT installed

That's why you're getting HTTP 500 errors!

## ✅ Step-by-Step Installation:

### Step 1: Download iisnode

**Download from:**
https://github.com/Azure/iisnode/releases

**Download file:**
- `iisnode-full-v0.2.26-x64.msi` (or latest version)
- For 32-bit: `iisnode-full-v0.2.26-x86.msi`

### Step 2: Install iisnode

1. **Run the .msi file** on your IIS server
2. **Follow the installation wizard**
3. **Make sure IIS is selected** during installation
4. **Complete the installation**

### Step 3: Verify Installation

After installation, run:
```powershell
Get-ItemProperty HKLM:\SOFTWARE\Microsoft\IISNode
```

**Should show iisnode information** (not error)

### Step 4: Restart IIS

```powershell
iisreset
```

Or restart in IIS Manager:
- Right-click server → "Restart"

### Step 5: Verify in IIS Manager

1. Open **IIS Manager**
2. Click on your **SERVER** (top level, not site)
3. Double-click **"Modules"**
4. Look for **"iisnode"** in the list

**Should see "iisnode" module!**

### Step 6: Test Your Site

After installation:
1. Restart your Application Pool
2. Open: `http://93.127.140.63/`
3. Should work now!

### Step 7: Check Logs

After installation, logs will appear in:
```
C:\inetpub\wwwroot\JewelTestFront\iisnode\
```

## 📋 Quick Checklist:

- [ ] Download iisnode from GitHub
- [ ] Install the .msi file
- [ ] Restart IIS
- [ ] Verify in IIS Manager → Modules
- [ ] Restart Application Pool
- [ ] Test your site

## ⚠️ Important Notes:

1. **Must install on the IIS server** (not your dev machine)
2. **Must restart IIS** after installation
3. **Must have Node.js installed first** (v18+)
4. **Must have URL Rewrite Module** installed

## 🎯 After Installation:

Once iisnode is installed, your HTTP 500 error should be fixed!

If you still get errors, check:
- Windows Event Viewer
- iisnode logs (will now exist!)
- Application Pool settings


