# GitHub Setup Guide

Your repository has been initialized and the initial commit has been created. Follow these steps to upload to GitHub:

## Step 1: Create a GitHub Repository

1. Go to [GitHub.com](https://github.com) and sign in
2. Click the **"+"** icon in the top right corner
3. Select **"New repository"**
4. Fill in the details:
   - **Repository name**: `CoachingManagementSystem` (or your preferred name)
   - **Description**: "Multi-tenant Coaching Management System with .NET backend and Next.js frontend"
   - **Visibility**: Choose Public or Private
   - **DO NOT** initialize with README, .gitignore, or license (we already have these)
5. Click **"Create repository"**

## Step 2: Connect Local Repository to GitHub

After creating the repository, GitHub will show you commands. Use these commands in your terminal:

```bash
# Add the remote repository (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/CoachingManagementSystem.git

# Rename the default branch to main (if needed)
git branch -M main

# Push your code to GitHub
git push -u origin main
```

## Alternative: Using SSH (if you have SSH keys set up)

```bash
git remote add origin git@github.com:YOUR_USERNAME/CoachingManagementSystem.git
git branch -M main
git push -u origin main
```

## Step 3: Verify Upload

1. Go to your GitHub repository page
2. You should see all your files there
3. Verify that `appsettings.json` is **NOT** visible (it should be ignored)

## Important Notes

### ✅ Files That Are Protected (Not Committed):
- `appsettings.json` - Contains database credentials and JWT secrets
- All `bin/` and `obj/` folders - Build artifacts
- `node_modules/` - Dependencies
- `.next/` - Next.js build files
- All environment files (`.env*`)

### ✅ Files That Are Committed:
- `appsettings.example.json` - Template for configuration
- All source code files
- Project files (`.csproj`, `.sln`)
- Frontend configuration files

## Next Steps After Upload

1. **Update appsettings.json locally**: Copy `appsettings.example.json` to `appsettings.json` and fill in your actual credentials
2. **Add collaborators** (if needed): Go to repository Settings → Collaborators
3. **Set up GitHub Actions** (optional): For CI/CD pipelines
4. **Add branch protection** (optional): Protect the main branch

## Troubleshooting

### If you get authentication errors:
- Use GitHub Personal Access Token instead of password
- Or set up SSH keys for easier authentication

### If you need to update the remote URL:
```bash
git remote set-url origin https://github.com/YOUR_USERNAME/CoachingManagementSystem.git
```

### If you need to remove and re-add remote:
```bash
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/CoachingManagementSystem.git
```


