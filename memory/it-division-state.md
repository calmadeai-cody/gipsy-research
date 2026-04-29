# IT Division State

## Active Project
- **Project:** GipsyAI (Academic AI Super-App) - REBUILD
- **Location:** ~/gipsyai-project/
- **Last Updated:** 2026-04-29 09:03 UTC

## Current Status
- **Phase:** Implementation - Build stabilization
- **Cron Job ID:** 2f9d176d-8cc2-4c04-a057-71f025105837
- **Cron Schedule:** Every 3 hours (0 */3 * * *)

## Iteration 2026-04-29 09:03 UTC ✅

### What Was Done
1. **Verified build status** - Build passes cleanly (24 routes)
2. **Ran dev server check** - Homepage renders HTML correctly at localhost:3000
3. **Identified 14 ESLint `@typescript-eslint/no-explicit-any` errors** across 7 files
4. **Dispatched Programmer subagent** to fix all TypeScript any-type errors
5. **Fixes applied:**
   - `generate-references/route.ts` - replaced `any` with typed interface
   - `generate-title/route.ts` - same fix
   - `paraphrase/route.ts` - same fix
   - `webhook/midtrans/route.ts` - `Record<string, any>` → `Record<string, string>`, removed unused `payment_type`
   - `dashboard/page.tsx` - typed tier/subscriptionStatus via proper interface
   - `payment/page.tsx` - defined `SnapResult`, `SnapCallbacks`, `SnapWindow` interfaces
   - `lib/auth.ts` - defined `ExtendedUser` interface, removed unused `provider` param
6. **Build verified** - `npm run lint` → 0 errors (3 warnings only), `npm run build` → succeeds ✅

### Git Commit
`a4c5f8b` - fix: resolve all @typescript-eslint/no-explicit-any errors

## New Instructions from User (2026-04-29 05:45 UTC)
- AI tools will be embedded as **iframe using Calmade AI**
- Rebuild gipsy.ai WITHOUT any Framer dependencies
- Keep: login authentication, all existing features
- **Scrape ALL pages/features from gipsyresearch.id**
- **UI check with image interpretation**
- Goal: Complete duplicate/rebuild of gipsyresearch.id functionality

## Scraped Pages So Far
| Page | URL | Status |
|------|-----|--------|
| Homepage | https://gipsyresearch.id/gipsyai | ✅ Done |
| Login | https://gipsyresearch.id/gipsyai/login | ✅ Done |
| About | https://gipsyresearch.id/about | ✅ Done |
| Kelas | https://gipsyresearch.id/kelas | ✅ Done |

## Pending Scrapes
- [ ] Portal/Member area
- [ ] Konsultasi page
- [ ] Olah Data page
- [ ] Artikel page
- [ ] Affiliate page
- [ ] FAQ page
- [ ] Contact page
- [ ] All AI tool pages (40+ tools)

## AI Tools Architecture (iframe-based)
- Each tool = page at `/tools/[slug]` with iframe to `https://calmade.ai/chat?tool={slug}&mode=iframe`
- No direct AI API calls from GipsyAI
- GipsyAI = frontend + auth + payment + iframe container
- 20 tools defined in SPEC.md and tools page

## Next Tasks (Priority Order)
1. **UI screenshot check** - Homepage renders correctly (verified via curl HTML)
2. **Scrape remaining gipsyresearch.id pages** - Need more pages/features
3. **Add missing AI tool pages** - Ensure all 20+ defined tools have proper slug routing
4. **Verify Calmade AI iframe URL** - `CALMADE_AI_URL` needs to be set in .env
5. **Set up database** - PostgreSQL migration needed
6. **Test auth flow** - Verify email magic link + Google OAuth
7. **Test payment flow** - Verify Midtrans Snap integration

## Blockers
- Need Calmade AI endpoint/URL for iframes (currently `https://calmade.ai/chat`)
- Need actual DATABASE_URL for PostgreSQL (currently localhost)
- Need real API keys: AUTH_RESEND_KEY, GOOGLE_CLIENT_ID/SECRET, MIDTRANS keys
