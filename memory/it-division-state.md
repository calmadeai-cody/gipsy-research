# IT Division State

## Active Project
- **Project:** GipsyAI (Academic AI Super-App) - REBUILD
- **Location:** ~/gipsyai-project/
- **Last Updated:** 2026-04-30 09:10 UTC

---

## Current Status
- **Phase:** Implementation - Caching added
- **Cron Job ID:** 2f9d176d-8cc2-4c04-a057-71f025105837
- **Cron Schedule:** Every 3 hours (0 */3 * * *)

---

## Iteration 2026-04-30 09:10 UTC ✅

### What Was Done
1. **API Response Caching** — Created `src/lib/cache.ts` with:
   - SHA-256 hashed cache keys (tool + normalized input)
   - TTL support (default 1 hour)
   - LRU eviction at 500 entries max
   - `generateCacheKey()`, `getCache()`, `setCache()`, `clearCache()`
2. **Updated all 3 API routes** with caching:
   - `generate-title/route.ts` — checks cache before AI call, includes `cached: true` in response
   - `paraphrase/route.ts` — same pattern
   - `generate-references/route.ts` — same pattern (key includes style)
3. **Added 18 new tests** in `tests/lib/cache.test.ts`
4. **All 49 tests passing** — 18 cache + 10 sanitize + 8 AI lib + 13 API route tests
5. **Build verified clean** — All routes compiling correctly

### Git Commit
- `e554f71` - feat: add in-memory caching for AI API responses [THIS ITERATION]

---

## Architecture Summary
- **Auth**: NextAuth v5 with Prisma adapter, Email magic link (Resend), Google OAuth optional
- **Payments**: Midtrans Snap (credit card, VA, e-wallet, QRIS, convenience store)
- **Tiers**: BASIC (Rp 19k), PRO (Rp 19k flash), PRO_RESEARCHER (Rp 29k) — unified
- **AI Tools**: 3 tools via direct Anthropic API; 17 tools via iframe to calmade.ai (BLOCKED)
- **Database**: Prisma + PostgreSQL (schema defined, needs real DATABASE_URL)
- **Testing**: Vitest framework with 31 tests passing
- **Error Handling**: Structured ApiError class with error codes
- **Input Sanitization**: sanitizeInput() + validateAIInput() in src/lib/sanitize.ts
- **Response Caching**: In-memory cache with SHA-256 keys, TTL, LRU in src/lib/cache.ts

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
| `/api/tools/generate-title`, `/api/tools/paraphrase`, `/api/tools/generate-references` | ✅ (with sanitization + caching) |

---

## Test Coverage (49 tests passing)
| Test File | Tests | Coverage |
|-----------|-------|----------|
| `tests/lib/cache.test.ts` | 18 | Cache key generation, TTL, LRU eviction |
| `tests/lib/sanitize.test.ts` | 10 | Input sanitization functions |
| `tests/lib/ai.test.ts` | 8 | AI library functions |
| `tests/api/tools/generate-title.test.ts` | 5 | Auth, validation, rate limiting |
| `tests/api/tools/paraphrase.test.ts` | 4 | Auth, validation, tier access |
| `tests/api/tools/generate-references.test.ts` | 4 | Auth, validation, style options |
| **Total** | **49** | All passing |

---

## Next Tasks (Priority Order)

### Completed ✅
1. ✅ Structured error responses — ApiError class with codes
2. ✅ Input sanitization — sanitizeInput + validateAIInput
3. ✅ API response caching — in-memory cache with TTL and LRU eviction

### Immediate (No External Dependencies)
4. **Add usage analytics dashboard** — Dashboard shows tier but no actual usage stats beyond basic counts

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
- Pattern established by 3 working tools + sanitization

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
| Test Framework | ✅ (Vitest, 49 passing) |
| Structured Errors | ✅ |
| Input Sanitization | ✅ |
| Response Caching | ✅ |
| Documentation | ✅ |
| Integration Ready | 🔒 Blocked on credentials |
| 17 Tools Working | ❌ Blocked on calmade.ai decision |

---

**Summary:** Added in-memory response caching with SHA-256 hashed keys, TTL, and LRU eviction. All 49 tests passing. Build verified clean. Next logical step is usage analytics dashboard.

**Progress since last iteration:** Added cache.ts with generateCacheKey/getCache/setCache/clearCache. Updated all 3 API routes with cache checks. Added 18 new tests. Committed as e554f71.