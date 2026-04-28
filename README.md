# GipsyAI - Academic AI Super-App

Academic AI assistant for Indonesian researchers and students.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database:** PostgreSQL with Prisma ORM
- **Auth:** NextAuth.js with Email Magic Link (Resend)
- **Payments:** Midtrans Snap Checkout
- **AI:** Claude API (Anthropic)

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and fill in your keys:

```bash
cp .env.example .env
```

Required environment variables:
- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_SECRET` - Generate with: `openssl rand -base64 32`
- `AUTH_RESEND_KEY` - Resend API key for email
- `MIDTRANS_SERVER_KEY` - Midtrans server key
- `MIDTRANS_CLIENT_KEY` - Midtrans client key
- `ANTHROPIC_API_KEY` - Anthropic Claude API key

### 3. Set Up Database

```bash
# Create PostgreSQL database
createdb gipsyai

# Run Prisma migrations
npx prisma migrate dev --name init

# Generate Prisma client
npx prisma generate
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Features

### Homepage (`/`)
- Hero section with app description
- Features showcase (3 AI tools)
- 3 Pricing tiers: GRATIS (free), LITE (Rp 199.000/mo), PRO (Rp 499.000/mo)

### User Dashboard (`/dashboard`)
- Subscription status display
- Available AI tools based on tier
- Usage statistics
- Recent activity log

### AI Tools
- **Generator Judul Penelitian** (`/tools/generator-judul`) - Generate academic research titles
- **Parafrase Paragraf** (`/tools/paraphrase`) - Paraphrase paragraphs with AI
- **Generator Daftar Pustaka** (`/tools/daftar-pustaka`) - Generate bibliography/references

### Authentication
- Email magic link via NextAuth.js
- Protected routes for dashboard and tools

### Payments
- Midtrans Snap Checkout integration
- Virtual Account (BCA, BNI, BRI, Mandiri)
- E-Wallet (GoPay, ShopeePay)
- Credit Card
- QRIS
- Convenience Store (Indomaret, Alfamart)

## Database Schema

See `prisma/schema.prisma` for full schema with:
- User
- Subscription
- ToolUsage
- Article

## API Routes

- `POST /api/auth/[...nextauth]` - NextAuth handlers
- `POST /api/payment/snap-token` - Create Midtrans Snap token
- `POST /api/webhook/midtrans` - Midtrans payment webhook
- `POST /api/tools/generate-title` - Generator Judul Penelitian
- `POST /api/tools/paraphrase` - Parafrase Paragraf
- `POST /api/tools/generate-references` - Generator Daftar Pustaka

## Pricing Tiers

| Tier | Price | Features |
|------|-------|----------|
| GRATIS | Free | Generator Judul (5x/day) |
| LITE | Rp 199.000/mo | All tools (50x/day) |
| PRO | Rp 499.000/mo | All tools (unlimited) |

## Midtrans Configuration

1. Sign up at [midtrans.com](https://midtrans.com)
2. Get your Server Key and Client Key from dashboard
3. Set webhook URL: `https://your-domain.com/api/webhook/midtrans`
4. Use sandbox for testing: `MIDTRANS_ENV=sandbox`

## License

MIT