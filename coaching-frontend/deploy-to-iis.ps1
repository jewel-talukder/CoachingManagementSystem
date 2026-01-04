# IIS Deployment Script
Write-Host "🚀 Building Next.js app..." -ForegroundColor Yellow
npm run build

Write-Host "📋 Copying web.config to standalone folder..." -ForegroundColor Yellow
Copy-Item "web.config" ".next\standalone\web.config" -Force

Write-Host "📦 Creating deployment package..." -ForegroundColor Yellow
$deployPath = "deploy-package"
if (Test-Path $deployPath) {
    Remove-Item -Recurse -Force $deployPath
}
New-Item -ItemType Directory -Path $deployPath | Out-Null

# Copy all files from standalone
Copy-Item -Path ".next\standalone\*" -Destination $deployPath -Recurse -Force

Write-Host ""
Write-Host "✅ Deployment package ready!" -ForegroundColor Green
Write-Host ""
Write-Host "📦 Location: $deployPath\" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Yellow
Write-Host "   1. Zip the '$deployPath' folder" -ForegroundColor White
Write-Host "   2. Extract to: C:\inetpub\wwwroot\JewelTestFront\" -ForegroundColor White
Write-Host "   3. Make sure iisnode is installed on IIS server" -ForegroundColor White
Write-Host "   4. Make sure Node.js is installed on IIS server" -ForegroundColor White
Write-Host "   5. Open: http://localhost:5000/" -ForegroundColor White
Write-Host ""

