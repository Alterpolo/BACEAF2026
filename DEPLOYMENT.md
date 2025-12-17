# Deployment Guide - Bac Français 2026

This guide covers deploying the application to Coolify on a Hostinger VPS.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Hostinger VPS (Coolify)                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────┐    ┌─────────────────┐                │
│  │  app.neodromes  │    │  api.neodromes  │                │
│  │  (Static Site)  │───▶│  (Node.js API)  │                │
│  │  Port: 80/443   │    │  Port: 3001     │                │
│  └─────────────────┘    └────────┬────────┘                │
│                                  │                          │
│                                  ▼                          │
│                         ┌─────────────────┐                │
│                         │     Redis       │                │
│                         │  (Rate Limit)   │                │
│                         └─────────────────┘                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
           │                       │
           ▼                       ▼
    ┌─────────────┐        ┌─────────────┐
    │  Supabase   │        │  DeepSeek   │
    │  (Database) │        │  (AI API)   │
    └─────────────┘        └─────────────┘
```

## Prerequisites

1. **Coolify** installed on your Hostinger VPS
2. **Domain** configured: `neodromes.eu` with subdomains:
   - `app.neodromes.eu` → Frontend
   - `api.neodromes.eu` → Backend
3. **External services** configured:
   - Supabase project with migrations applied
   - Stripe account with products/prices created
   - DeepSeek API key

## Step 1: Configure DNS

Add A records in your DNS provider (Hostinger/Cloudflare):

```
app.neodromes.eu    A    → [VPS IP]
api.neodromes.eu    A    → [VPS IP]
```

Wait for DNS propagation (5-30 minutes).

## Step 2: Deploy Redis (Optional)

Redis is used for rate limiting. If not deployed, falls back to in-memory (not recommended for production).

1. In Coolify, go to **Projects** → **New Service**
2. Select **Redis** from the service catalog
3. Configure:
   - **Name:** `bacfrancais-redis`
   - **Network:** Internal only (no public access)
4. Deploy and note the internal URL: `redis://bacfrancais-redis:6379`

## Step 3: Deploy Backend API

### Option A: From GitHub (Recommended)

1. In Coolify, go to **Projects** → **New Resource** → **Application**
2. Select your GitHub repository
3. Configure:
   - **Name:** `bacfrancais-api`
   - **Branch:** `main`
   - **Build Pack:** Dockerfile
   - **Dockerfile Location:** `server/Dockerfile`
   - **Port:** `3001`

### Option B: Manual Docker

1. SSH into your VPS
2. Clone the repository
3. Build and run:
   ```bash
   cd server
   docker build -t bacfrancais-api .
   docker run -d -p 3001:3001 --env-file .env bacfrancais-api
   ```

### Environment Variables

Set these in Coolify's **Environment Variables** section:

```env
# Required
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://app.neodromes.eu

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# DeepSeek AI
DEEPSEEK_API_KEY=your-deepseek-key

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_STUDENT_PREMIUM_MONTHLY=price_...
STRIPE_PRICE_STUDENT_PREMIUM_YEARLY=price_...
STRIPE_PRICE_STUDENT_TUTORING_MONTHLY=price_...
STRIPE_PRICE_STUDENT_TUTORING_YEARLY=price_...
STRIPE_PRICE_TEACHER_PRO_MONTHLY=price_...
STRIPE_PRICE_TEACHER_PRO_YEARLY=price_...
```

### Domain Configuration

1. In Coolify, go to **Domains** tab
2. Add domain: `api.neodromes.eu`
3. Enable **HTTPS** (Let's Encrypt)
4. Save and wait for certificate provisioning

### Health Check

Coolify will automatically use the `/health` endpoint for health checks.

## Step 4: Deploy Frontend

### Option A: Static Site (Recommended)

1. In Coolify, go to **Projects** → **New Resource** → **Static Site**
2. Select your GitHub repository
3. Configure:
   - **Name:** `bacfrancais-app`
   - **Branch:** `main`
   - **Build Command:** `npm ci && npm run build`
   - **Publish Directory:** `dist`
   - **Base Directory:** `/` (root)

### Build-time Environment Variables

Set these in Coolify (they're embedded during build):

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_URL=https://api.neodromes.eu
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

### Domain Configuration

1. In Coolify, go to **Domains** tab
2. Add domain: `app.neodromes.eu`
3. Enable **HTTPS** (Let's Encrypt)

## Step 5: Configure Stripe Webhook

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
2. Add endpoint:
   - **URL:** `https://api.neodromes.eu/api/payments/webhook`
   - **Events:**
     - `checkout.session.completed`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`
3. Copy the webhook secret to your backend environment variables

## Step 6: Apply Supabase Migrations

If not already done, apply all migrations:

```bash
# Using Supabase CLI
supabase db push

# Or manually via SQL Editor in Supabase Dashboard
# Apply migrations 001-007 in order
```

## Step 7: Verify Deployment

### Backend Health Check

```bash
curl https://api.neodromes.eu/health
# Expected: {"status":"ok","timestamp":"..."}
```

### Frontend

1. Open `https://app.neodromes.eu`
2. Verify the app loads
3. Test login flow
4. Test subscription flow with Stripe test card

### Stripe Webhook

```bash
# Using Stripe CLI locally
stripe listen --forward-to https://api.neodromes.eu/api/payments/webhook
stripe trigger checkout.session.completed
```

## Monitoring

### Logs

In Coolify, view logs for each service:
- **Backend logs:** Check for errors, request IDs
- **Frontend:** Static site, no server logs

### Health Checks

Coolify automatically monitors:
- Container health status
- Response time
- Resource usage

### Recommended: Add Sentry

For production error tracking, add Sentry:

1. Create Sentry project at sentry.io
2. Add to backend:
   ```bash
   npm install @sentry/node
   ```
3. Initialize in `server/src/index.ts`

## Troubleshooting

### CORS Errors

- Verify `FRONTEND_URL` matches exactly (including https://)
- Check for trailing slashes

### Webhook 400/401 Errors

- Verify `STRIPE_WEBHOOK_SECRET` is correct
- Ensure webhook is configured for correct events

### Build Failures

- Check Node.js version (requires 20+)
- Verify all environment variables are set

### Database Connection Errors

- Verify `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`
- Check Supabase project is active (not paused)

## Rollback

To rollback to a previous version:

1. In Coolify, go to **Deployments** tab
2. Find the previous successful deployment
3. Click **Rollback**

## Cost Estimation

| Service | Monthly Cost |
|---------|-------------|
| Hostinger VPS | Already paid |
| Supabase (Pro) | €25 |
| DeepSeek API | €30-50 (usage-based) |
| Stripe | 2.9% + €0.25 per transaction |
| **Total** | ~€55-75 + transaction fees |
