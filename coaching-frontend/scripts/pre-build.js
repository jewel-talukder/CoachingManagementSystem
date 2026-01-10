const fs = require('fs');
const path = require('path');

console.log('🔧 Pre-build: Ensuring production environment configuration...');

const projectRoot = path.resolve(__dirname, '..');
const envProdPath = path.join(projectRoot, '.env.production');

// Production API URL (default)
const productionApiUrl = 'http://93.127.140.63:4000/api';

// Check if we're building for production
const isProduction = process.env.NODE_ENV === 'production' || 
                     process.argv.includes('--production') ||
                     !process.argv.includes('dev');

if (isProduction) {
  console.log('📦 Production build detected - ensuring production API URL...');
  
  // Read existing .env.production if it exists
  let envContent = '';
  if (fs.existsSync(envProdPath)) {
    envContent = fs.readFileSync(envProdPath, 'utf8');
  }
  
  // Check if NEXT_PUBLIC_API_URL exists
  if (envContent.includes('NEXT_PUBLIC_API_URL')) {
    // Check if it contains localhost (should not in production)
    if (envContent.includes('localhost')) {
      console.warn('⚠️  Warning: .env.production contains localhost! Updating to production URL...');
      // Replace localhost URL with production URL
      envContent = envContent.replace(
        /NEXT_PUBLIC_API_URL=.*/g,
        `NEXT_PUBLIC_API_URL=${productionApiUrl}`
      );
      fs.writeFileSync(envProdPath, envContent);
      console.log('✅ Updated .env.production with production API URL');
    } else {
      console.log('✅ .env.production already has production API URL');
    }
  } else {
    // Add production API URL if not present
    envContent = envContent.trim() + (envContent ? '\n' : '') + `NEXT_PUBLIC_API_URL=${productionApiUrl}\n`;
    fs.writeFileSync(envProdPath, envContent);
    console.log('✅ Created/Updated .env.production with production API URL');
  }
  
  // Also set it as environment variable for this build
  process.env.NEXT_PUBLIC_API_URL = productionApiUrl;
  console.log(`✅ Set NEXT_PUBLIC_API_URL=${productionApiUrl} for build`);
} else {
  console.log('🔧 Development build - using development configuration');
}

console.log('✅ Pre-build complete!');

