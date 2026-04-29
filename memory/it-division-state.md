# IT Division State

## Active Project
- **Project:** GipsyAI (Academic AI Super-App) - REBUILD
- **Location:** ~/gipsyai-project/
- **Last Updated:** 2026-04-29 15:03 UTC

## Current Status
- **Phase:** Implementation - Code quality + preparation for external integrations
- **Cron Job ID:** 2f9d176d-8cc2-4c04-a057-71f025105837
- **Cron Schedule:** Every 3 hours (0 */3 * * *)

## Iteration 2026-04-29 15:03 UTC ✅

### What Was Done
1. **Tier naming consistency fix** — The codebase had mixed tier systems:
   - `FREE`/`LITE`/`PRO` in API routes, auth, midtrans
   - `BASIC`/`PRO`/`PRO_RESEARCHER` in pricing page and SPEC.md
   - Prices mismatched: pricing page showed Rp 19.000 but midtrans.ts had Rp 199.000
   - Fixed across 8 files: `lib/midtrans.ts`, `app/payment/page.tsx`, `api/payment/snap-token/route.ts`, `api/tools/generate-title/route.ts`, `api/tools/paraphrase/route.ts`, `api/tools/generate-references/route.ts`, `lib/auth.ts`, `app/dashboard/page.tsx`
   - Canonical tiers now: `BASIC` (Rp 19.000), `PRO` (Rp 19.000 flash), `PRO_RESEARCHER` (Rp 29.000)
2. **SETUP.md created** — Complete setup guide with all env vars, local dev, Vercel deployment, post-deploy checklist
3. **ARCHITECTURE-DECISION.md created** — Documents the calmade.ai iframe blocker, 3 options (deploy calmade.ai / direct API / hybrid), recommendation (Option B: direct API), and decision needed
4. **Build verified** — 28 routes, 0 errors, ESLint clean, TypeScript clean

### Git Commits (in order)
- `ad7201e` - fix: align tier naming across codebase (FREE/LITE→BASIC/PRO/PRO_RESEARCHER) [THIS ITERATION]
- `12b2449` - docs: add SETUP.md and ARCHITECTURE-DECISION.md [THIS ITERATION]
- `ad00f60` - docs: flag critical blocker - calmade.ai domain does not exist
- `6144521` - fix: resolve 3 lint warnings

### Code Quality Status
| Check | Result |
|-------|--------|
| ESLint | ✅ 0 errors, 0 warnings |
| TypeScript | ✅ Passes |
| Build | ✅ 28 routes, 0 errors |

### Architecture Summary
- **Auth**: NextAuth v5 with Prisma adapter, Email magic link (Resend), Google OAuth optional
- **Payments**: Midtrans Snap (credit card, VA, e-wallet, QRIS, convenience store)
- **Tiers**: BASIC (Rp 19k), PRO (Rp 19k flash), PRO_RESEARCHER (Rp 29k) — unified across all code
- **AI Tools**: 3 tools via direct Anthropic API; 17 tools via iframe to calmade.ai (BLOCKED)
- **Database**: Prisma + PostgreSQL (schema defined, needs real DATABASE_URL)

### Current Pages (21 total)
All routes verified in build:
| Route | Status |
|-------|--------|
| `/` (homepage) | ✅ |
| `/about`, `/classes`, `/pricing` | ✅ |
| `/auth/signin`, `/auth/error`, `/auth/verify-request` | ✅ |
| `/dashboard` | ✅ (protected) |
| `/payment` | ✅ (supports BASIC, PRO, PRO_RESEARCHER) |
| `/konsultasi`, `/artikel`, `/affiliate`, `/faq`, `/olah-data`, `/kontak`, `/komunitas` | ✅ |
| `/tools` | ✅ (20 tool cards) |
| `/tools/[slug]` | ✅ (iframe — BLOCKED: calmade.ai down) |
| `/tools/generator-judul`, `/tools/paraphrase`, `/tools/daftar-pustaka` | ✅ (direct API) |
| `/api/payment/snap-token`, `/api/webhook/midtrans` | ✅ |
| `/api/tools/generate-title`, `/api/tools/paraphrase`, `/api/tools/generate-references` | ✅ |

### Next Tasks (Priority Order)
1. **🔴 ARCHITECTURAL DECISION NEEDED** — calmade.ai iframe blocker:
   - Read ARCHITECTURE-DECISION.md and decide: Option A (deploy calmade.ai), B (direct API), or C (hybrid)
   - User must decide before Option B implementation can proceed
2. **Database migration** — Run `prisma migrate dev` with real DATABASE_URL
3. **API key acquisition** — AUTH_RESEND_KEY (Resend), ANTHROPIC_API_KEY (real key with credits)
4. **Midtrans sandbox test** — Verify payment flow with real sandbox keys
5. **Auth flow test** — Verify magic link email sends via Resend
6. **If Option B chosen** — Implement remaining 17 tools using direct Anthropic API

### Blockers
1. **🔴 CRITICAL: calmade.ai DNS does not exist** — All iframe-based tools broken
   - See ARCHITECTURE-DECISION.md for options and recommendation
2. **DATABASE_URL** — PostgreSQL connection needed (currently localhost placeholder)
3. **External API keys** — AUTH_RESEND_KEY (placeholder), ANTHROPIC_API_KEY (placeholder with no credits)

### Project Status: Code Complete ✅ | Integration Blocked 🔒 | ARCHITECTURAL DECISION NEEDED ⚠️
The codebase is fully built and quality-checked. Tier system unified. Two new docs (SETUP.md, ARCHITECTURE-DECISION.md) added.

**Remaining work requires:**
1. User decision on the iframe architecture (5 min read)
2. External service credentials (API keys, database)
3. If Option B chosen: implement 17 tools with direct API calls
