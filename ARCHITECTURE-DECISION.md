# Architecture Decision — GipsyAI Tool Backend

**Date:** 2026-04-29
**Status:** OPEN — Needs Decision
**Deciders:** Bro

---

## Context

GipsyAI uses two approaches for AI tools:

1. **Direct API** — 3 tools call `lib/ai.ts` → Anthropic Claude API directly
2. **iframe** — 17 tools embed `https://calmade.ai/chat?tool={slug}&mode=iframe`

The iframe approach has a critical blocker: **`calmade.ai` has no DNS records.**

```bash
$ nslookup calmade.ai
** server can't find calmade.ai: NXDOMAIN
```

This was flagged in commit `ad00f60` (2026-04-28) but remains unresolved.

---

## Why This Matters

The entire 20-tool architecture depends on the iframe approach. Until `calmade.ai` is live, only 3 tools work.

---

## Options

### Option A: Deploy Calmade AI to `calmade.ai` (iframe approach)

**What:** Host Calmade AI at `calmade.ai` and keep the iframe architecture.

**Pros:**
- Separates concerns: GipsyAI (frontend/payments/auth) vs Calmade AI (AI logic)
- Changes to AI behavior don't require redeploying GipsyAI
- Single source of truth for AI prompts/behavior

**Cons:**
- Requires another deployment pipeline
- Another service to monitor/maintain
- `calmade.ai` domain needs to be purchased + DNS configured
- iframe communication adds complexity (postMessage between frames)
- Calmade AI source code needs to exist and be deployable

**Effort:** Unknown (depends on whether Calmade AI codebase exists)

---

### Option B: Replace iframe with Direct Anthropic API (recommended)

**What:** Build out all 17 remaining tools using the same pattern as the 3 existing ones.

Each tool gets:
- `src/lib/ai/{tool-name}.ts` — Anthropic prompt + response parsing
- `src/app/api/tools/{tool-name}/route.ts` — Auth, rate limiting, usage logging
- `src/app/tools/{tool-name}/page.tsx` — UI form + results display

**Pros:**
- Self-contained: GipsyAI needs nothing external except `ANTHROPIC_API_KEY`
- Easier to debug and test (no iframe cross-origin issues)
- Consistent with 3 existing tools
- Faster cold starts (no iframe load)
- Full control over AI behavior

**Cons:**
- More API routes to maintain (17 additional)
- Anthropic API costs per tool call
- Would need to write/adjust prompts for 17 tools
- If Calmade AI had specialized prompts/behaviors, those need recreating

**Effort:** ~2-3 iterations (build 4-5 tools per iteration)

---

### Option C: Hybrid — Deploy a Minimal Calmade AI for iframe

**What:** Deploy the simplest possible Calmade AI endpoint that accepts iframe requests.

A single Express/Next.js route at `calmade.ai/chat` that:
- Reads `?tool=slug&mode=iframe`
- Calls Anthropic API with the right prompt
- Returns HTML page that embeds result (or postMessage back to parent)

**Pros:**
- Preserves iframe architecture
- Minimal deployment (single endpoint)
- `calmade.ai` domain would work as the AI "backend"

**Cons:**
- Still needs a deployment for Calmade AI
- DNS must be configured
- Two services to maintain long-term

**Effort:** ~1 iteration (if Calmade AI codebase exists)

---

## Recommendation

**Option B** is the most practical path forward given current information.

The codebase already has the foundation (3 working tools, `lib/ai.ts` with Anthropic SDK, rate limiting, usage logging). The 17 remaining tools follow a clear pattern that can be replicated.

**Next step:** Request prompt specifications from Calmade AI (if they exist) to seed the 17 tool implementations.

---

## Decision Needed

Before the next iteration, please decide:

1. Should we pursue Option A, B, or C?
2. If Option A/C — does Calmade AI source code exist? Where?
3. If Option B — should we prioritize specific tools first?

---

## Files Affected

| File | Current State |
|------|--------------|
| `src/app/tools/[slug]/page.tsx` | iframe to `calmade.ai` (broken) |
| `src/lib/ai.ts` | 3 functions: generateResearchTitle, paraphraseParagraph, generateBibliography |
| `src/app/tools/generator-judul/page.tsx` | ✅ Works |
| `src/app/tools/paraphrase/page.tsx` | ✅ Works |
| `src/app/tools/daftar-pustaka/page.tsx` | ✅ Works |
| `src/app/tools/[slug]/page.tsx` (17 slugs) | ❌ iframe broken |

---

## Tool Priority (if Option B)

| Priority | Tools | Reason |
|----------|-------|--------|
| P1 | ai-to-human, generator-judul (already done) | Free tier tools |
| P2 | Generator Abstrak, Generator Pertanyaan Sidang | High-demand thesis tools |
| P3 | Parafrase (done), Research Gap, Tinjauan Pustaka | Common academic tasks |
| P4 | All remaining PRO tools | Full coverage |
