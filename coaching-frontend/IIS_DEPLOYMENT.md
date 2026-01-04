# IIS Deployment Guide for Next.js

## Recommended: IIS with Node.js Server (iisnode)

This is the recommended approach for hosting Next.js on IIS. It uses iisnode to run Node.js on IIS.

### Prerequisites

1. **Install Node.js** on the IIS server (v18 or higher)
2. **Install iisnode** from: https://github.com/Azure/iisnode/releases
3. **Install URL Rewrite Module** from: https://www.iis.net/downloads/microsoft/url-rewrite

### Build Steps

1. **Build the project:**
   ```bash
   cd coaching-frontend
   npm install
   npm run build
   ```

2. **Output Location:**
   After build, deploy the entire `coaching-frontend` folder to IIS:
   ```
   coaching-frontend/
   ├── .next/          (build output)
   ├── node_modules/   (production dependencies)
   ├── public/         (static files)
   ├── server.js      (Node.js server file)
   ├── web.config     (IIS configuration)
   ├── package.json
   └── ... (other files)
   ```

### IIS Configuration

1. **Copy entire project folder to IIS server:**
   - Example: `C:\inetpub\wwwroot\coaching-app\`

2. **Install production dependencies on server:**
   ```bash
   cd C:\inetpub\wwwroot\coaching-app
   npm install --production
   ```

3. **Create/Update web.config:**
   The `web.config` file is already included in the project root.

4. **Create IIS Website:**
   - Open IIS Manager
   - Right-click "Sites" → "Add Website"
   - Site name: `CoachingManagementSystem`
   - Physical path: `C:\inetpub\wwwroot\coaching-app`
   - Port: `80` (or your preferred port)
   - Application Pool: Create new or use existing (ensure it has .NET CLR Version = "No Managed Code")

5. **Configure Application Pool:**
   - Right-click your Application Pool → "Advanced Settings"
   - Set "Enable 32-Bit Applications" to `False` (if using 64-bit Node.js)
   - Set "Idle Timeout" to `0` (to keep Node.js running)

### File Location After Build

**Deploy these files/folders to IIS:**
```
coaching-frontend/
├── .next/              (build output - REQUIRED)
├── node_modules/       (production dependencies - REQUIRED)
├── public/             (static assets - REQUIRED)
├── server.js           (Node.js server - REQUIRED)
├── web.config          (IIS config - REQUIRED)
├── package.json        (REQUIRED)
├── .env.production     (Environment variables)
└── package-lock.json   (optional but recommended)
```

**DO NOT deploy:**
- `.env.local`
- `node_modules` (install fresh on server with `npm install --production`)
- `.git` folder
- Source files in `app/` (only needed for development)

---

## Alternative: Static Export (Limited - Not Recommended)

This builds the Next.js app as static files that can be hosted directly on IIS.

### Build Steps

1. **Build the project:**
   ```bash
   cd coaching-frontend
   npm run build
   ```

2. **Output Location:**
   After build, the static files will be in:
   ```
   coaching-frontend/out/
   ```

3. **Deploy to IIS:**
   - Copy the entire contents of the `out/` folder to your IIS website directory
   - Example: `C:\inetpub\wwwroot\coaching-app\`
   - Or create a new IIS website pointing to the `out/` folder

### IIS Configuration

1. **Create a new website in IIS Manager:**
   - Right-click "Sites" → "Add Website"
   - Site name: `CoachingManagementSystem`
   - Physical path: `C:\path\to\coaching-frontend\out`
   - Port: `80` (or your preferred port)

2. **Configure web.config:**
   Create a `web.config` file in the `out/` folder with the following content:

   ```xml
   <?xml version="1.0" encoding="utf-8"?>
   <configuration>
     <system.webServer>
       <rewrite>
         <rules>
           <rule name="Handle Client-Side Routing" stopProcessing="true">
             <match url=".*" />
             <conditions logicalGrouping="MatchAll">
               <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
               <add input="{REQUEST_FILENAME}" matchType="IsDirectory" negate="true" />
             </conditions>
             <action type="Rewrite" url="/index.html" />
           </rule>
         </rules>
       </rewrite>
       <staticContent>
         <mimeMap fileExtension=".json" mimeType="application/json" />
         <mimeMap fileExtension=".woff" mimeType="application/font-woff" />
         <mimeMap fileExtension=".woff2" mimeType="application/font-woff2" />
       </staticContent>
       <httpProtocol>
         <customHeaders>
           <add name="X-Content-Type-Options" value="nosniff" />
           <add name="X-Frame-Options" value="DENY" />
           <add name="X-XSS-Protection" value="1; mode=block" />
         </customHeaders>
       </httpProtocol>
     </system.webServer>
   </configuration>
   ```

3. **Install URL Rewrite Module (if not installed):**
   - Download from: https://www.iis.net/downloads/microsoft/url-rewrite
   - Install on the IIS server

4. **Set Default Document:**
   - In IIS Manager, select your website
   - Double-click "Default Document"
   - Ensure `index.html` is in the list and at the top

### File Location After Build

**Build Output Directory:**
```
coaching-frontend/out/
```

**Contents to deploy:**
- All files and folders inside the `out/` directory
- The `web.config` file (create it as shown above)

**Example structure:**
```
out/
├── _next/
│   ├── static/
│   └── ...
├── admin/
│   ├── courses/
│   ├── batches/
│   └── ...
├── login/
├── index.html
├── web.config (create this)
└── ...
```

---

## Option 2: IIS with iisnode (For Server-Side Features)

If you need server-side rendering or API routes, use iisnode to run Node.js on IIS.

### Prerequisites

1. Install Node.js on the IIS server
2. Install iisnode: https://github.com/Azure/iisnode

### Configuration

1. **Create web.config in project root:**
   ```xml
   <?xml version="1.0" encoding="utf-8"?>
   <configuration>
     <system.webServer>
       <handlers>
         <add name="iisnode" path="server.js" verb="*" modules="iisnode"/>
       </handlers>
       <rewrite>
         <rules>
           <rule name="NodeInspector" patternSyntax="ECMAScript" stopProcessing="true">
             <match url="^server.js\/debug[\/]?" />
           </rule>
           <rule name="StaticContent">
             <action type="Rewrite" url="public{REQUEST_URI}"/>
           </rule>
           <rule name="DynamicContent">
             <conditions>
               <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="True"/>
             </conditions>
             <action type="Rewrite" url="server.js"/>
           </rule>
         </rules>
       </rewrite>
     </system.webServer>
   </configuration>
   ```

2. **Deploy entire project folder to IIS**

---

## Quick Build and Deploy

### Windows PowerShell:

```powershell
# Navigate to project
cd coaching-frontend

# Install dependencies (if needed)
npm install

# Build for production
npm run build

# The output will be in: coaching-frontend\out\
# Copy this folder to your IIS website directory
```

### After Build:

1. **Location of files:**
   ```
   D:\Jewel\MySelf\CoachingManagementSystem\coaching-frontend\out\
   ```

2. **Copy to IIS:**
   - Copy all contents of the `out/` folder
   - Paste into your IIS website directory
   - Add `web.config` file (see above)

3. **Access your application:**
   - Open browser and navigate to your IIS website URL
   - Example: `http://localhost` or `http://your-server-ip`

---

## Troubleshooting

### 404 Errors on Routes
- Ensure URL Rewrite module is installed
- Check `web.config` is in the root of the `out/` folder
- Verify the rewrite rule is correct

### API Connection Issues
- Verify `.env.production` has correct API URL: `http://93.127.140.63:4000/api`
- Check CORS settings on API server
- Ensure API server is accessible from IIS server

### Static Files Not Loading
- Check MIME types in `web.config`
- Verify file permissions on IIS folder
- Check IIS static content feature is enabled

---

## Summary

**After running `npm run build`, deploy these files:**
- **Source:** `coaching-frontend/out/` (entire folder contents)
- **Destination:** Your IIS website directory
- **Required:** `web.config` file (create as shown above)

