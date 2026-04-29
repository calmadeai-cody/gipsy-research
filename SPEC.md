# GipsyAI - Academic AI Super-App (v2)

## Overview

**GipsyAI** is an Indonesian academic AI platform at gipsyresearch.id that helps researchers, students, and academics finish research 10x faster with 40+ AI-powered tools. Built as a standalone Next.js app (no Framer).

## Architecture

### Core Approach (MIXED)
- **3 tools** use direct Anthropic API via `lib/ai.ts` → ✅ WORKING
  - Generator Judul Penelitian (`/tools/generator-judul`)
  - Parafrase Paragraf (`/tools/paraphrase`)
  - Pembuatan Daftar Pustaka (`/tools/daftar-pustaka`)
- **17 tools** use iframe to `calmade.ai` → ❌ BLOCKED (DNS does not exist)
  - All remaining tools in `/tools/[slug]`
- **Architecture decision pending** — see ARCHITECTURE-DECISION.md
  - Option A: Deploy calmade.ai (iframe approach)
  - Option B: Replace iframe with direct Anthropic API (recommended)
  - Option C: Hybrid (minimal Calmade AI for iframe)

### Tech Stack
- **Frontend:** Next.js 16 (App Router), TypeScript, Tailwind CSS v4
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** NextAuth v5 with Email Magic Link (via Resend), Google OAuth optional
- **Payments:** Midtrans Snap Checkout
- **AI:** Anthropic Claude API (direct) for 3 tools; iframe to calmade.ai (BLOCKED) for 17 tools

## Pages & Features

### Homepage (`/`)
- Hero: "Selesaikan Riset & Lulus 10x Lebih Cepat" - Rp 19ribu started
- Stats: 40+ AI apps, 250jt+ articles, 10+ certified classes, 20+ materials
- Pain Points: No prompting needed, structured input
- AI Tools Categories (40+ tools) displayed as cards
- How to Use: 3 steps
- Comparison Table: GipsyAI vs others
- Pricing section with 3 tiers
- Testimonials: 4.8/5.0 rating, 70+ reviews

### AI Tools (40+ total)
All implemented as iframe containers pointing to Calmade AI:

**Perencanaan & Ide Penelitian:**
1. Diagram Kerangka Berpikir (Beta) [PRO]
2. Generator Judul Penelitian
3. Generator Proposal Penelitian [PRO]
4. Pemilihan Metode Penelitian [PRO]

**Asistensi Penulisan Akademik:**
5. Asisten Pengembang Teks [PRO]
6. Generator Latar Belakang [PRO]
7. Generator Landasan Teori [PRO]
8. Parafrase Paragraf

**Literatur & Referensi:**
9. Generator Research Gap & Novelty [PRO]
10. Generator Tinjauan Pustaka [PRO]
11. Pembuatan Daftar Pustaka [PRO]
12. Pencari Artikel Ilmiah [PRO]

**Pengolahan & Visualisasi Data:**
13. Analisis Teks Transkrip [PRO]
14. Asisten Visualisasi Data [PRO]
15. Asisten Analisis Statistik [PRO]
16. Generator Deskripsi Gambar [PRO]

**Finalisasi Standar Akademik:**
17. AI to Human
18. Generator Abstrak Penelitian [PRO]
19. Generator Pertanyaan Sidang [PRO]
20. Konversi ke Artikel Ilmiah [PRO]

### Login (`/auth/signin`)
- Email magic link via Resend
- Google OAuth (optional)
- Session managed via NextAuth v5

### Pricing (`/pricing`)
- BASIC: Rp 19.000/mo - 7 AI tools (free trial)
- PRO: Rp 39.000 → Rp 19.000/mo - 40+ tools (FLASH SALE 50%)
- PRO Researcher: Rp 49.000 → Rp 29.000/mo - 40+ tools + 10+ classes

### About (`/about`)
- Vision, team, partners, achievements

### Classes (`/classes`)
- 9.6/10 rating, categories, features

### Dashboard (`/dashboard`)
- Protected user dashboard
- Shows subscription status, usage stats

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
  tier                  String   // BASIC, PRO, PRO_RESEARCHER
  status                String   // active, inactive, pending, cancelled
  midtransOrderId       String?
  midtransTransactionId String?
  period                String   // MONTHLY
  currentPeriodEnd      DateTime?
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
}

model ToolUsage {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  toolSlug  String
  createdAt DateTime @default(now())
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

## Environment Variables

```
DATABASE_URL=postgresql://user:password@host:5432/gipsyai
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-here
GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=xxx
AUTH_RESEND_KEY=re_xxxxx
MIDTRANS_SERVER_KEY=SB-Mid-server-xxxxx
MIDTRANS_CLIENT_KEY=SB-Mid-client-xxxxx
MIDTRANS_ENV=sandbox
ANTHROPIC_API_KEY=sk-ant-xxxxx
```

## Implementation Notes

1. Tools marked [PRO] require PRO tier or higher
2. Free/BASIC tier gets 7 tools (5 daily limit)
3. PRO/PRO_RESEARCHER get unlimited access to all working tools
4. Tier naming: `BASIC` (Rp 19k), `PRO` (Rp 19k flash), `PRO_RESEARCHER` (Rp 29k)
5. Direct API tools use rate limiting via `prisma.toolUsage` count per day
6. iframe tools blocked — see ARCHITECTURE-DECISION.md for resolution path