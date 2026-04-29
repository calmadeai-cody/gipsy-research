# IT Division State

## Active Project
- **Project:** GipsyAI (Academic AI Super-App) - REBUILD
- **Location:** ~/gipsyai-project/
- **Last Updated:** 2026-04-29 18:03 UTC

## Current Status
- **Phase:** Implementation - Code quality + documentation sync
- **Cron Job ID:** 2f9d176d-8cc2-4c04-a057-71f025105837
- **Cron Schedule:** Every 3 hours (0 */3 * * *)

---

## Iteration 2026-04-29 18:03 UTC ✅

### What Was Done
1. **SPEC.md updated** — Reflects current mixed architecture:
   - 3 tools via direct Anthropic API (working): generator-judul, paraphrase, daftar-pustaka
   - 17 tools via iframe to calmade.ai (BLOCKED: DNS does not exist)
   - Updated tech stack (Next.js 16, NextAuth v5, Resend for email)
   - Updated env vars (removed MAYAR_API_KEY and CALMADE_AI_URL placeholders)
   - Added architecture decision reference
2. **Build verified** — Still passes after SPEC.md update

### Git Commits
- `6f0b375` - docs: update SPEC.md to reflect mixed architecture (3 direct API + 17 iframe blocked) [THIS ITERATION]
- `a564073` - docs: update IT Division state after 2026-04-29 15:03 iteration
- `12b2449` - docs: add SETUP.md and ARCHITECTURE-DECISION.md

### Code Quality Status
| Check | Result |
|-------|--------|
| ESLint | ✅ 0 errors, 0 warnings |
| TypeScript | ✅ Passes |
| Build | ✅ 28 routes, 0 errors |

---

## Iteration History

| Time (UTC) | What Was Done |
|------------|---------------|
| 2026-04-29 18:03 | SPEC.md updated to reflect mixed architecture |
| 2026-04-29 15:03 | Tier naming fixed, SETUP.md + ARCHITECTURE-DECISION.md added |
| 2026-04-29 12:55 | 3 lint warnings resolved, build verified |
| 2026-04-29 12:03 | Pages (konsultasi, artikel, affiliate, faq, olah-data, kontak, komunitas) added |
| Earlier | Core build: 21 pages, 3 API tools, auth, payment |

---

## Architecture Summary
- **Auth**: NextAuth v5 with Prisma adapter, Email magic link (Resend), Google OAuth optional
- **Payments**: Midtrans Snap (credit card, VA, e-wallet, QRIS, convenience store)
- **Tiers**: BASIC (Rp 19k), PRO (Rp 19k flash), PRO_RESEARCHER (Rp 29k) — unified
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

---

## Next Tasks (Priority Order)

### Immediate (No External Dependencies)
1. **Add API tests** — No test framework currently. Could add Vitest or similar for the 3 working API routes
2. **Improve error messages** — API routes return generic errors; could add structured error responses
3. **Add usage analytics** — Dashboard shows tier but no actual usage stats

### Blocked on External Services (Need Credentials)
1. **Database migration** — Run `prisma migrate dev` with real DATABASE_URL
2. **API key acquisition** — AUTH_RESEND_KEY (Resend), ANTHROPIC_API_KEY (real key with credits)
3. **Midtrans sandbox test** — Verify payment flow with real sandbox keys
4. **Auth flow test** — Verify magic link email sends via Resend

### Blocked on User Decision (Architecture)
1. **ARCHITECTURAL DECISION** — calmade.ai iframe blocker
   - Read ARCHITECTURE-DECISION.md and decide: Option A, B, or C
   - Option A: Deploy calmade.ai (iframe approach)
   - Option B: Replace iframe with direct Anthropic API (recommended)
   - Option C: Hybrid (minimal Calmade AI for iframe)

### If Option B Chosen (Direct API)
- Implement remaining 17 tools using direct Anthropic API
- Pattern established by 3 working tools

---

## Blockers
1. **🔴 CRITICAL: calmade.ai DNS does not exist** — 17 iframe-based tools broken
   - See ARCHITECTURE-DECISION.md for resolution options
2. **DATABASE_URL** — PostgreSQL connection needed (currently localhost placeholder)
3. **External API keys** — AUTH_RESEND_KEY, ANTHROPIC_API_KEY are placeholders

---

## Project Status

| Aspect | Status |
|--------|--------|
| Code Complete | ✅ |
| Tier System Unified | ✅ |
| Build Verified | ✅ |
| Documentation | ✅ (SETUP.md, ARCHITECTURE-DECISION.md, SPEC.md current) |
| Integration Ready | 🔒 Blocked on credentials |
| 17 Tools Working | ❌ Blocked on calmade.ai decision |

---

**Summary:** Code and documentation are solid. The codebase is production-ready structurally. Remaining work requires external service credentials and/or architectural decision about the iframe approach.

**Progress since last iteration:** SPEC.md synced with reality. All docs now consistent.
