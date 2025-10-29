# Vercel Deployment Guide

Complete guide for deploying the Better Auth IDP monorepo to Vercel.

## Prerequisites

- GitHub repository set up at `a11yplan/idp`
- Vercel account connected to your GitHub organization
- PostgreSQL database (Vercel Postgres or Neon recommended)
- Resend account for email functionality

## Step 1: Configure Vercel Project Settings

### Import Project

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..." → Project**
3. Import `a11yplan/idp` repository
4. Vercel will auto-detect Next.js and monorepo structure

### Project Settings

Configure these settings in the Vercel project:

| Setting | Value |
|---------|-------|
| **Framework Preset** | Next.js |
| **Root Directory** | Leave empty (monorepo root) |
| **Build Command** | `cd apps/web && bun run build` |
| **Output Directory** | `apps/web/.next` |
| **Install Command** | `bun install` |
| **Node.js Version** | 18.x or 20.x |

> **Note**: The `vercel.json` file at the root already configures these settings. Vercel should auto-detect them, but you can override in the dashboard if needed.

## Step 2: Setup PostgreSQL Database

Choose one of the following options:

### Option A: Vercel Postgres (Recommended)

1. In your Vercel project dashboard, go to **Storage** tab
2. Click **Create Database** → **Postgres**
3. Follow the setup wizard
4. Once created, Vercel will automatically add `DATABASE_URL` to your environment variables
5. Copy the connection string for local development

### Option B: Neon PostgreSQL

1. Sign up at [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string (it will look like: `postgresql://user:password@host/database`)
4. Add it to Vercel environment variables as `DATABASE_URL`

## Step 3: Configure Environment Variables

Add these environment variables in your Vercel project settings (**Settings → Environment Variables**):

### Required Variables

| Variable | Value | Notes |
|----------|-------|-------|
| `DATABASE_URL` | `postgresql://...` | From Vercel Postgres or Neon |
| `BETTER_AUTH_SECRET` | Generate with: `openssl rand -base64 32` | Must be at least 32 characters |
| `BETTER_AUTH_URL` | `https://your-app.vercel.app` | Your Vercel deployment URL |
| `NEXT_PUBLIC_BETTER_AUTH_URL` | `https://your-app.vercel.app` | Same as BETTER_AUTH_URL |
| `NEXT_PUBLIC_SITE_URL` | `https://your-app.vercel.app` | Same as BETTER_AUTH_URL |
| `RESEND_API_KEY` | `re_...` | From resend.com |
| `EMAIL_FROM` | `noreply@yourdomain.com` | Must be verified in Resend |
| `EMAIL_FROM_NAME` | `a11yplan IDP` | Display name for emails |

### Optional Branding Variables

| Variable | Default Value | Purpose |
|----------|---------------|---------|
| `NEXT_PUBLIC_APP_NAME` | `"a11yplan IDP"` | Application name |
| `NEXT_PUBLIC_APP_DESCRIPTION` | `"Identity Provider for a11yplan"` | App description |
| `NEXT_PUBLIC_DEFAULT_LOCALE` | `"en"` | Default language (en or de) |

### Optional Feature Flags

| Variable | Default | Purpose |
|----------|---------|---------|
| `NEXT_PUBLIC_FEATURE_ORGANIZATIONS` | `"true"` | Enable organizations |
| `NEXT_PUBLIC_FEATURE_ADMIN` | `"true"` | Enable admin panel |
| `NEXT_PUBLIC_FEATURE_BILLING` | `"true"` | Enable billing features |
| `NEXT_PUBLIC_FEATURE_INVITATIONS` | `"true"` | Enable invitations |

### Optional OAuth Providers

If you want to enable OAuth login:

| Variable | Purpose |
|----------|---------|
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `GITHUB_CLIENT_ID` | GitHub OAuth client ID |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth client secret |

### Optional IDP Configuration

| Variable | Purpose | Example |
|----------|---------|---------|
| `IDP_ALLOWED_DOMAINS` | Comma-separated list of allowed OAuth redirect domains | `https://app1.com,https://app2.com` |

## Step 4: Setup Resend Email

1. Sign up at [resend.com](https://resend.com)
2. Add and verify your domain
3. Create an API key
4. Add the API key to `RESEND_API_KEY` in Vercel
5. Set `EMAIL_FROM` to your verified sender email

## Step 5: Initialize Database

After your first deployment, you need to run migrations to create database tables:

### Method 1: Using Vercel CLI (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Link to your project
vercel link

# Pull environment variables
vercel env pull

# Run migrations
cd apps/web
bunx @better-auth/cli migrate
```

### Method 2: Using GitHub Actions

Create `.github/workflows/migrate.yml`:

```yaml
name: Run Database Migrations

on:
  workflow_dispatch:

jobs:
  migrate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v1
      - run: bun install
      - run: cd apps/web && bunx @better-auth/cli migrate
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
```

Then run the workflow manually from GitHub Actions tab.

### Method 3: Local Connection to Production DB

If you have the production `DATABASE_URL`:

```bash
cd apps/web
DATABASE_URL="your-production-url" bunx @better-auth/cli migrate
```

> ⚠️ **Important**: Only run migrations once. Running them multiple times is safe (they're idempotent), but unnecessary.

## Step 6: Deploy

### Initial Deployment

1. Push to the `main` branch:
   ```bash
   git add .
   git commit -m "Configure for Vercel deployment"
   git push origin main
   ```

2. Vercel will automatically deploy
3. Monitor the deployment in Vercel dashboard
4. Once deployed, run database migrations (Step 5)

### Subsequent Deployments

Every push to `main` will automatically trigger a deployment.

## Step 7: Verify Deployment

After deployment, test these features:

### Basic Checks
- [ ] Homepage loads successfully
- [ ] Sign up page is accessible
- [ ] Login page is accessible

### Authentication Flow
- [ ] Create a new account (email/password)
- [ ] Check email for verification link
- [ ] Verify email address
- [ ] Log in with verified account
- [ ] Log out

### Organization Features (if enabled)
- [ ] Create an organization
- [ ] Invite a member
- [ ] Check invitation email
- [ ] Accept invitation

### Admin Features (if enabled)
- [ ] Access admin panel
- [ ] View users list
- [ ] View organizations list

## Troubleshooting

### Build Failures

**Error**: `Could not find package.json`
- **Solution**: Ensure `vercel.json` is properly configured at the root
- Check that `installCommand` is set to `bun install`

**Error**: `Module not found: @repo/emails`
- **Solution**: The monorepo workspace is not resolving correctly
- Verify `bun install` is running at the root level

### Runtime Errors

**Error**: `DATABASE_URL is not defined`
- **Solution**: Add `DATABASE_URL` to Vercel environment variables
- Redeploy after adding the variable

**Error**: `BETTER_AUTH_SECRET is not defined`
- **Solution**: Generate a secret and add to environment variables
  ```bash
  openssl rand -base64 32
  ```

**Error**: Email verification not working
- **Solution**: Check that `RESEND_API_KEY` and `EMAIL_FROM` are correctly set
- Verify your domain in Resend dashboard
- Check Vercel logs for email sending errors

### Database Errors

**Error**: `relation "user" does not exist`
- **Solution**: Run database migrations (see Step 5)

**Error**: Connection timeout
- **Solution**: Check that your database allows connections from Vercel IPs
- For Neon: Enable "IP Allow List" or allow all IPs
- For Vercel Postgres: This should work automatically

## Production Checklist

Before going live:

- [ ] All environment variables configured
- [ ] Database migrations run successfully
- [ ] Email sending tested and working
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate active
- [ ] All authentication flows tested
- [ ] Error monitoring configured (Vercel Analytics)
- [ ] Backup strategy in place for database
- [ ] Security headers configured (handled by Next.js)

## Custom Domain Setup

1. Go to project **Settings → Domains**
2. Add your custom domain
3. Configure DNS records as instructed by Vercel
4. Update environment variables:
   - `BETTER_AUTH_URL`
   - `NEXT_PUBLIC_BETTER_AUTH_URL`
   - `NEXT_PUBLIC_SITE_URL`
5. Redeploy

## Monitoring and Logs

### View Logs
- Go to your project in Vercel dashboard
- Click **Deployments** → Select a deployment → **Logs**

### Enable Analytics
- Go to **Analytics** tab in your Vercel project
- Enable Vercel Analytics for performance monitoring

### Error Tracking
Consider integrating error tracking:
- Sentry
- LogRocket
- Vercel Analytics (built-in)

## Support

- [Vercel Documentation](https://vercel.com/docs)
- [Better Auth Documentation](https://www.better-auth.com/docs)
- [Turborepo Documentation](https://turbo.build/repo/docs)

## Additional Resources

- [Vercel Postgres Documentation](https://vercel.com/docs/storage/vercel-postgres)
- [Neon Documentation](https://neon.tech/docs/introduction)
- [Resend Documentation](https://resend.com/docs)
- [Better Auth Migration Guide](https://www.better-auth.com/docs/concepts/database#migrations)
