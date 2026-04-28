# GipsyAI - Academic AI Super-App

## Overview

**GipsyAI** is an Indonesian academic AI assistant that helps researchers, students, and academics with AI-powered tools for research title generation, paragraph paraphrasing, and bibliography creation.

## Tech Stack

- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** NextAuth.js with Email Magic Link (Resend)
- **Payments:** Midtrans Snap Checkout
- **AI:** Claude API (Anthropic)

## Features

### AI Tools

1. **Generator Judul Penelitian** - Generate academic research titles based on keywords/topics
2. **Parafrase Paragraf** - Paraphrase paragraphs with AI while maintaining meaning
3. **Generator Daftar Pustaka** - Generate bibliography/references from article content

### Pricing Tiers

| Tier | Price | Features |
|------|-------|----------|
| **GRATIS** | Free | Generator Judul (5x/day) |
| **LITE** | Rp 199.000/month | All tools (50x/day) |
| **PRO** | Rp 499.000/month | All tools (unlimited) |

## Database Schema

```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  emailVerified DateTime?
  image         String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  subscription  Subscription?
  toolUsage     ToolUsage[]
}

model Subscription {
  id                    String   @id @default(cuid())
  userId                String   @unique
  user                  User     @relation(fields: [userId], references: [id])
  tier                  String   // FREE, LITE, PRO
  status                String   // active, inactive, pending, cancelled
  midtransOrderId       String?
  midtransTransactionId String?
  period                String   // MONTHLY, YEARLY
  currentPeriodEnd      DateTime?
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
}

model ToolUsage {
  id         String   @id @default(cuid())
  userId     String
  user       User     @relation(fields: [userId], references: [id])
  toolName   String
  inputText  String
  outputText String?
  tokens     Int?
  createdAt  DateTime @default(now())
}

model Article {
  id        String   @id @default(cuid())
  userId    String
  title     String
  content   String
  category  String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

## API Endpoints

### Authentication
- `POST /api/auth/[...nextauth]` - NextAuth handlers

### Payments
- `POST /api/payment/snap-token` - Create Midtrans Snap token
- `POST /api/webhook/midtrans` - Midtrans payment webhook

### AI Tools
- `POST /api/tools/generate-title` - Generate research titles
- `POST /api/tools/paraphrase` - Paraphrase paragraphs
- `POST /api/tools/generate-references` - Generate bibliography

## Environment Variables

```
DATABASE_URL=postgresql://user:password@host:5432/gipsyai
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-here
AUTH_RESEND_KEY=re_xxxxx
MIDTRANS_SERVER_KEY SB-Mid-server-xxxxx
MIDTRANS_CLIENT_KEY SB-Mid-client-xxxxx
MIDTRANS_ENV=sandbox
```

## Pages

- `/` - Homepage (hero, features, pricing)
- `/dashboard` - User dashboard (protected)
- `/tools/generator-judul` - Title generator
- `/tools/paraphrase` - Paragraph paraphraser
- `/tools/daftar-pustaka` - Bibliography generator
- `/payment` - Payment page
- `/auth/signin` - Sign in page

## Midtrans Integration

Using Snap Checkout for payment flow:
1. User selects tier → Frontend requests Snap token
2. Backend calls Midtrans API → Returns token
3. Frontend displays Snap popup
4. User completes payment
5. Midtrans sends webhook to backend
6. Subscription activated