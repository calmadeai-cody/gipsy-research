# IT Division State

## Active Project
- **Project:** GipsyAI (Academic AI Super-App) - REBUILD
- **Location:** ~/gipsyai-project/
- **Last Updated:** 2026-04-30 03:09 UTC

---

## Current Status
- **Phase:** Implementation - Structured error responses added
- **Cron Job ID:** 2f9d176d-8cc2-4c04-a057-71f025105837
- **Cron Schedule:** Every 3 hours (0 */3 * * *)

---

## Iteration 2026-04-30 03:09 UTC ✅

### What Was Done
1. **Structured Error Responses** — Created ApiError class and ErrorCodes in `src/lib/api-error.ts`
   - ApiError class with code, message, details, statusCode, and toJSON()
   - Error codes: UNAUTHORIZED, USER_NOT_FOUND, VALIDATION_ERROR, TIER_ACCESS_DENIED, RATE_LIMIT_EXCEEDED, INTERNAL_ERROR
2. **Updated all 3 API routes** to use structured errors:
   - `generate-title/route.ts` — validation and auth errors
   - `paraphrase/route.ts` — validation, tier access, rate limit errors
   - `generate-references/route.ts` — validation and auth errors
3. **Fixed test** — Updated `generate-title.test.ts` line 87 to use `data.error.message` instead of `data.error` for object format
4. **All 21 tests passing** — 8 AI library + 13 API route tests
5. **Build verified clean** — All routes compiling correctly

### Git Commits
- `b997357` - refactor: add structured error responses to API routes [THIS ITERATION]
- `2dfac22` - docs: update IT Division state after 2026-04-30 00:10 iteration
- `ac188fd` - feat: add API route tests for tool endpoints (13 new tests)
- `eaba96b` - docs: update IT Division state after 2026-04-29 21:06 iteration

---

## Architecture Summary
- **Auth**: NextAuth v5 with Prisma adapter, Email magic link (Resend), Google OAuth optional
- **Payments**: Midtrans Snap (credit card, VA, e-wallet, QRIS, convenience store)
- **Tiers**: BASIC (Rp 19k), PRO (Rp 19k flash), PRO_RESEARCHER (Rp 29k) — unified
- **AI Tools**: 3 tools via direct Anthropic API; 17 tools via iframe to calmade.ai (BLOCKED)
- **Database**: Prisma + PostgreSQL (schema defined, needs real DATABASE_URL)
- **Testing**: Vitest framework with 21 tests passing
- **Error Handling**: Structured ApiError class with error codes

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

## Test Coverage (21 tests passing)
| Test File | Tests | Coverage |
|-----------|-------|----------|
| `tests/lib/ai.test.ts` | 8 | AI library functions |
| `tests/api/tools/generate-title.test.ts` | 5 | Auth, validation, rate limiting |
| `tests/api/tools/paraphrase.test.ts` | 4 | Auth, validation, tier access |
| `tests/api/tools/generate-references.test.ts` | 4 | Auth, validation, style options |
| **Total** | **21** | All passing |

---

## Next Tasks (Priority Order)

### Immediate (No External Dependencies)
1. ✅ **Structured error responses** — Done this iteration
2. **Add usage analytics dashboard** — Dashboard shows tier but no actual usage stats beyond basic counts
3. **Add input sanitization** — Prevent prompt injection in AI tool inputs
4. **Add API response caching** — Cache repeated AI responses for same inputs

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
| Test Framework | ✅ (Vitest, 21 passing) |
| Structured Errors | ✅ |
| Documentation | ✅ |
| Integration Ready | 🔒 Blocked on credentials |
| 17 Tools Working | ❌ Blocked on calmade.ai decision |

---

**Summary:** Added structured error responses via ApiError class. All 21 tests passing. Build verified clean. Next logical step is enhancing the dashboard usage analytics or adding input sanitization.

**Progress since last iteration:** Structured error responses implemented. Test updated to use object format. Committed as b997357.