# GipsyAI — Setup Guide

## Prerequisites

- Node.js 20+
- PostgreSQL 14+ (or use a cloud provider like Supabase, Neon, Railway)
- npm or yarn

## 1. Clone & Install

```bash
git clone <repo-url> ~/gipsyai-project
cd ~/gipsyai-project
npm install
```

## 2. Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Then fill in every key:

### Database

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/gipsyai?schema=public"
```

**Supabase (recommended for cloud):**
```env
DATABASE_URL="postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres"
```

**Neon:**
```env
DATABASE_URL="postgresql://USER:PASSWORD@ep-xxx.region.aws.neon.tech/gipsyai?sslmode=require"
```

**Railway:**
```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/gipsyai"
```

### NextAuth

```env
NEXTAUTH_URL="http://localhost:3000"           # Change in production
NEXTAUTH_SECRET="<generate with: openssl rand -base64 32>"
```

### Email (Resend — Magic Link Auth)

```env
AUTH_RESEND_KEY="re_xxxxxxxxxxxx"             # From resend.com API keys
```

**Setup:**
1. Sign up at [resend.com](https://resend.com)
2. Add a domain (or use their test domain `resend.dev` for development)
3. Create an API key
4. Add to `.env`

### Google OAuth (Optional — Alternative Auth)

```env
GOOGLE_CLIENT_ID="xxx.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-xxx"
```

**Setup:**
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a project → APIs & Services → Credentials → OAuth 2.0 Client IDs
3. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`

### Midtrans (Payments)

```env
MIDTRANS_SERVER_KEY="SB-Mid-server-xxx"       # From dashboard.sandbox.midtrans.com
MIDTRANS_CLIENT_KEY="SB-Mid-client-xxx"       # Same page
MIDTRANS_ENV="sandbox"                         # Change to "production" for live
```

**Setup:**
1. Sign up at [midtrans.com](https://midtrans.com) (or sandbox.midtrans.com for testing)
2. Get Server Key and Client Key from Settings → Access Keys
3. For sandbox, use `SB-Mid-server-` and `SB-Mid-client-` prefixes
4. Set webhook URL: `https://your-domain.com/api/webhook/midtrans`
5. Enable payment methods in Snap Preferences

### Anthropic (Claude API — AI Tools)

```env
ANTHROPIC_API_KEY="sk-ant-api03-xxx"
```

**Setup:**
1. Sign up at [anthropic.com](https://anthropic.com)
2. Go to API Keys → Create Key
3. Add credits/billing (Claude Opus 4 is used by default)

### Calmade AI URL (Optional — Tool iframe fallback)

```env
CALMADE_AI_URL="https://calmade.ai/chat"
```

> ⚠️ **NOTE:** The `calmade.ai` domain currently has no DNS records.
> See [ARCHITECTURE-DECISION.md](./ARCHITECTURE-DECISION.md) for the iframe
> replacement plan. Until resolved, only 3 tools work directly:
> `/tools/generator-judul`, `/tools/paraphrase`, `/tools/daftar-pustaka`.

## 3. Database Setup

```bash
# Run Prisma migrations
npx prisma migrate dev --name init

# Generate Prisma client
npx prisma generate
```

**If using Supabase:**
```bash
# Enable UUID extension in Supabase SQL editor first:
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

## 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 5. Production Deployment

### Vercel (Recommended)

```bash
npm i -g vercel
vercel
```

Set all environment variables in Vercel Dashboard → Settings → Environment Variables.

**Required for production:**
- `NEXTAUTH_URL` → Your production domain (e.g., `https://gipsyresearch.id`)
- `NEXTAUTH_SECRET` → Generate with `openssl rand -base64 32`
- `DATABASE_URL` → Production PostgreSQL (Supabase/Neon recommended)
- `AUTH_RESEND_KEY` → Production Resend key with verified domain
- `MIDTRANS_ENV=production` + live Midtrans keys

### Docker

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json .
RUN npm ci --omit=dev
COPY . .
RUN npx prisma generate
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 6. Post-Deployment Checklist

- [ ] `NEXTAUTH_URL` points to production domain
- [ ] `NEXTAUTH_SECRET` is a strong random key (not dev value)
- [ ] `DATABASE_URL` is a production PostgreSQL (not localhost)
- [ ] `AUTH_RESEND_KEY` is a real Resend key with your domain verified
- [ ] `MIDTRANS_ENV=production` + live server/client keys
- [ ] `ANTHROPIC_API_KEY` has billing set up
- [ ] Midtrans webhook URL updated to production domain
- [ ] Google OAuth redirect URI updated to production domain (if using Google auth)
- [ ] DNS A record for `calmade.ai` pointing to Calmade AI deployment (see ARCHITECTURE-DECISION.md)
