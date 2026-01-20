---
description: How to verify the CI/CD pipeline and deployments
---

Follow these steps to ensure your application is being tested and deployed correctly.

### 1. Verify GitHub Actions (Continuous Integration)
GitHub Actions automatically runs your tests and build checks whenever you push code.

- **Go to your repository**: `https://github.com/ChuksHill/Hillshop`
- **Click on the "Actions" tab**: This is located in the top menu bar of your repo.
- **Find the latest run**: You should see a workflow run (likely named "CI Pipeline" once we add the file).
- **Check the status**:
    - 🟢 **Green**: All checks passed (linting, types, build).
    - 🔴 **Red**: Something failed. Click on the run to see the specific error logs.

### 2. Verify Vercel Deployment (Continuous Deployment)
Vercel handles the actual hosting and deployment of your site.

- **Go to the Vercel Dashboard**: `https://vercel.com/dashboard`
- **Select your "Hillshop" project**.
- **Check the "Deployments" tab**:
    - **Status "Ready"**: The latest version is live.
    - **Status "Building"**: Vercel is currently compiling your code.
    - **Status "Error"**: The build failed. Check the "Build Logs" for the reason.
- **Visit the Production URL**: Click the "Visit" button on the latest deployment to see your changes live on the web.

### 3. Verify Environment Variables
If the site loads but database features (like Login or Shop) aren't working, check your keys.

- **In Vercel**: Go to **Settings > Environment Variables**.
- **Compare with local `.env`**: Ensure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` match your local development environment.

### 4. Manual Pre-flight (Local)
Before pushing, you can run these commands locally to catch errors early:

// turbo
```powershell
npm run lint
npm run build
```
If these pass locally, they are 99% likely to pass in the CI/CD as well.
