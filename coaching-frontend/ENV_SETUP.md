# Environment Configuration Guide

This project uses environment variables to configure the API URL for different environments.

## Environment Files

The following environment files are available:

- `.env.local` - Local development (takes precedence over other env files)
- `.env.development` - Development environment (used when `NODE_ENV=development`)
- `.env.production` - Production environment (used when `NODE_ENV=production`)

## Configuration

### Development Environment
- **API URL**: `https://localhost:7286/api`
- **File**: `.env.local` or `.env.development`

### Production Environment
- **API URL**: `http://93.127.140.63:4000/api`
- **File**: `.env.production`

## Usage

### Development
```bash
npm run dev
```
This will use `.env.local` or `.env.development` automatically.

### Production Build
```bash
npm run build
NODE_ENV=production npm start
```
This will use `.env.production` automatically.

## Environment Variable

The API URL is configured via:
```
NEXT_PUBLIC_API_URL=<your-api-url>
```

**Note**: The `NEXT_PUBLIC_` prefix is required for Next.js to expose the variable to the browser.

## Changing API URL

To change the API URL for a specific environment:

1. Open the corresponding `.env` file (`.env.local`, `.env.development`, or `.env.production`)
2. Update the `NEXT_PUBLIC_API_URL` value
3. Restart the development server or rebuild the application

## Important Notes

- `.env.local` takes precedence over other environment files
- Environment files are gitignored and should not be committed to version control
- Always use `NEXT_PUBLIC_` prefix for variables that need to be accessible in the browser
- The API URL should end with `/api` (e.g., `http://example.com/api`)

