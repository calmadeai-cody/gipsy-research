# IT Division State

## Active Project
- **Project:** GipsyAI (Academic AI Super-App) - REBUILD
- **Location:** ~/gipsyai-project/
- **Last Updated:** 2026-04-29 21:06 UTC

---

## Current Status
- **Phase:** Implementation - Testing infrastructure complete
- **Cron Job ID:** 2f9d176d-8cc2-4c04-a057-71f025105837
- **Cron Schedule:** Every 3 hours (0 */3 * * *)

---

## Iteration 2026-04-29 21:06 UTC ✅

### What Was Done
1. **Added Vitest test framework** — Testing infrastructure now in place
   - Installed: vitest, @vitest/coverage-v8
   - Config: vitest.config.ts with @ alias support
   - Scripts: `npm test`, `npm run test:run`, `npm run test:coverage`
2. **Made AI library testable** — Refactored src/lib/ai.ts:
   - Lazy Anthropic client initialization via `getAnthropicClient()`
   - `resetAnthropicClient()` for test isolation
3. **Added 8 unit tests** — All passing:
   - `generateResearchTitle`: 4 tests
   - `paraphraseParagraph`: 2 tests
   - `generateBibliography`: 2 tests
4. **Verified** — Lint clean, build passes (28 routes)

### Git Commits
- `767bbb6` - feat: add Vitest test framework and AI library tests (8 passing) [THIS ITERATION]
- `d7cf849` - docs: update IT Division state after 2026-04-29 18:03 iteration

---

## Architecture Summary
- **Auth**: NextAuth v5 with Prisma adapter, Email magic link (Resend), Google OAuth optional
- **Payments**: Midtrans Snap (credit card, VA, e-wallet, QRIS, convenience store)
- **Tiers**: BASIC (Rp 19k), PRO (Rp 19k flash), PRO_RESEARCHER (Rp 29k) — unified
- **AI Tools**: 3 tools via direct Anthropic API; 17 tools via iframe to calmade.ai (BLOCKED)
- **Database**: Prisma + PostgreSQL (schema defined, needs real DATABASE_URL)
- **Testing**: Vitest framework added, 8 tests passing

---

## Current Pages (21 total)
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
1. **Add API route tests** — Test the 3 API routes (generate-title, paraphrase, generate-references)
2. **Improve error messages** — API routes return generic errors; add structured error responses
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
- Pattern established by 3 working tools + tests

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
| Lint Clean | ✅ |
| Test Framework | ✅ (Vitest, 8 passing) |
| Documentation | ✅ (SETUP.md, ARCHITECTURE-DECISION.md, SPEC.md current) |
| Integration Ready | 🔒 Blocked on credentials |
| 17 Tools Working | ❌ Blocked on calmade.ai decision |

---

**Summary:** Testing infrastructure added. AI library refactored for testability. 8 unit tests now passing. Build and lint verified clean. Next logical step is API route tests, then remaining tasks are blocked on external services/credentials.

**Progress since last iteration:** Added complete Vitest testing infrastructure with 8 passing tests.