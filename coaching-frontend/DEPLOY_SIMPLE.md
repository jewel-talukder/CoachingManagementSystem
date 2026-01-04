# Simple Deployment Guide - Like Angular's dist folder

## ✅ Build for Static Export

Just run:
```bash
cd coaching-frontend
npm run build
```

## 📁 Output Location (Like Angular's dist folder)

After build, you'll get:
```
coaching-frontend/out/
```

**This is your "dist" folder - just copy this entire folder to IIS!**

## 🚀 Deploy to IIS

1. **Copy the `out` folder** to your IIS server
2. **Create a website** in IIS pointing to the `out` folder
3. **Add web.config** (see below)
4. **Done!**

### web.config for IIS (put in the `out` folder)

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
    </staticContent>
  </system.webServer>
</configuration>
```

## 📍 Summary

- **Build:** `npm run build`
- **Output:** `coaching-frontend/out/` folder
- **Deploy:** Copy `out` folder to IIS
- **That's it!** Just like Angular's dist folder!

