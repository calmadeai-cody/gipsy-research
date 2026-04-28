# IT Division — Engineering Operations Manual
## Calmade AI Development System

**Last Updated:** 2026-04-28
**Framework:** Superpowers + IT Division Hybrid
**Iteration Cycle:** Every 3 hours (cron-driven)

---

## Mission

Build production-quality software through iterative improvement every 3 hours until each task is complete, with zero mistakes via mandatory design, TDD, and code review gates.

---

## Core Workflow

```
Client Request
    │
    ▼
┌─────────────┐
│    Cody     │ ← Main Orchestrator
│  (Receive)  │
└─────────────┘
    │ assigns task
    ▼
┌─────────────┐
│ Brainstorming │ ← Superpowers: mandatory design first
│  (Design)    │
└─────────────┘
    │ spec approved
    ▼
┌─────────────┐
│ Writing Plans │ ← Superpowers: break into 2-5 min tasks
│  (Plan)      │
└─────────────┘
    │ plan approved
    ▼
┌──────────────────────────────────────────────────────┐
│           IT DIVISION ITERATION LOOP                  │
│  ┌─────────────┐    ┌─────────────┐    ┌──────────┐ │
│  │ Programmer  │───▶│     QA     │───▶│  Deploy  │ │
│  │ (implement)│◀────│  (review)  │    │  (mark)  │ │
│  └─────────────┘    └─────────────┘    └──────────┘ │
│       ▲               │                          │    │
│       │               fail                       done│
│       └───────────────┘                            │◀──┘
│            (fix loop)                              │
│                                                  ┌──┘
│                              Every 3 hours:       │
│                              iterate from current│
└──────────────────────────────────────────────────┘
    │
    ▼
┌─────────────┐
│  User       │ ← Notify completion
│  (Review)   │
└─────────────┘
```

---

## Phase 1: Design (Superpowers Brainstorming)

**MANDATORY — Do NOT write code until design is approved.**

### Process

1. **Explore context** — Check project files, docs, recent commits
2. **Ask clarifying questions** — One at a time, multiple choice preferred
3. **Propose 2-3 approaches** — With trade-offs + recommendation
4. **Present design in sections** — Get approval after each section
5. **Write design doc** — Save to `docs/superpowers/specs/YYYY-MM-DD-<topic>-design.md`
6. **Spec self-review** — Check for placeholders, contradictions
7. **User reviews spec** — Before proceeding

### Hard Gate

```
⚠️ DO NOT invoke any implementation skill, write any code, 
   scaffold any project, or take any implementation action 
   until design is approved.
```

### Design Document Template

```markdown
# [Feature Name] Design

## Context
## Requirements  
## Architecture
## Components
## Data Flow
## Error Handling
## Testing Strategy
```

---

## Phase 2: Planning (Superpowers Writing Plans)

After design is approved → break into bite-sized tasks.

### Task Requirements

Every task must have:
- **Exact file paths** (no placeholders)
- **Complete code** (show the actual code)
- **Exact commands** with expected output
- **2-5 minutes** each

### Task Structure

```markdown
### Task N: [Component Name]
**Files:**
- Create: `exact/path/to/file.ts`
- Modify: `exact/path/to/existing.ts:123-145`

- [ ] **Step 1: Write failing test**
- [ ] **Step 2: Run test to verify it fails**
- [ ] **Step 3: Write minimal implementation**
- [ ] **Step 4: Run test to verify it passes**
- [ ] **Step 5: Commit**
```

### No Placeholders Allowed

❌ "TBD", "TODO", "implement later"
❌ "Add validation" (without showing how)
❌ "Similar to Task N" (repeat the code)
❌ "Write tests for the above"

---

## Phase 3: Implementation (IT Division)

### IT Division Roles

| Role | Responsibility | Tools |
|------|---------------|-------|
| **Programmer** | Implements tasks using TDD | Code, tests, commits |
| **QA** | Reviews spec compliance + code quality | Tests, lint, type check |
| **Cody** | Orchestrates, assigns, reports to user | Sessions, messages |

### Per-Task Workflow (Subagent-Driven Development)

```
Programmer Subagent
    │
    ├── Reads task from plan
    ├── Writes failing test (RED)
    ├── Verifies test fails
    ├── Writes minimal code (GREEN)
    ├── Verifies test passes
    ├── Refactors (REFACTOR)
    └── Commits
    │
    ▼
QA Spec Reviewer
    │
    ├── Checks code matches spec
    ├── Reports gaps (if any)
    └── Approves or returns to Programmer
    │
    ▼
QA Code Quality Reviewer
    │
    ├── Checks code quality (lint, types, patterns)
    ├── Reports issues (if any)
    └── Approves or returns to Programmer
    │
    ▼
Next Task (repeat until done)
```

### Model Selection

| Task Type | Model | Example |
|-----------|-------|---------|
| **Mechanical** (1-2 files, clear spec) | Fast/cheap | Simple components, utilities |
| **Integration** (multi-file) | Standard | API routes, DB operations |
| **Architecture** (design decisions) | Most capable | System design, reviews |

---

## Phase 4: Iteration Loop (Every 3 Hours)

### Cron Setup

```json
{
  "cron": {
    "it-division-iterate": {
      "pattern": "0 */3 * * *",
      "task": "it-division-iterate",
      "description": "IT Division 3-hour iteration check"
    }
  }
}
```

### What Happens Every 3 Hours

1. **Check active task status** — Where did we leave off?
2. **Resume from last incomplete task** — No restarts, no reprocessing
3. **Run QA review** — Verify nothing broke
4. **Continue next task** — Programmer continues
5. **Report progress** — Brief update to user

### Iteration State

Store in `memory/it-division-state.md`:

```markdown
## Current Iteration State

**Active Project:** gipsyai-project
**Current Phase:** implementation
**Current Task:** Task 7 - Generator Judul Penelitian API
**Last Updated:** 2026-04-28 16:45 UTC
**Completed Tasks:** 1-6
**Pending Tasks:** 7-15
**Blockers:** None
```

---

## Phase 5: Completion

### Finishing a Development Branch

When all tasks complete:

1. **Final QA review** — Full spec compliance check
2. **Test verification** — All tests pass
3. **Present options:**
   - Merge to dev branch
   - Create PR for user review
   - Keep working
4. **Clean up** — Archive completed worktree

---

## Superpowers Skills Reference

| Skill | When to Use | File |
|-------|-------------|------|
| `brainstorming` | Before any creative work | `skills/superpowers/brainstorming/SKILL.md` |
| `writing-plans` | After design approved | `skills/superpowers/writing-plans/SKILL.md` |
| `subagent-driven-development` | Executing implementation plan | `skills/superpowers/subagent-driven-development/SKILL.md` |
| `test-driven-development` | Any implementation | `skills/superpowers/test-driven-development/SKILL.md` |
| `systematic-debugging` | Bug fixes | `skills/superpowers/systematic-debugging/SKILL.md` |
| `verification-before-completion` | Fix verification | `skills/superpowers/verification-before-completion/SKILL.md` |
| `requesting-code-review` | Pre-review checklist | `skills/superpowers/requesting-code-review/SKILL.md` |
| `receiving-code-review` | Respond to feedback | `skills/superpowers/receiving-code-review/SKILL.md` |
| `finishing-a-development-branch` | Task completion | `skills/superpowers/finishing-a-development-branch/SKILL.md` |
| `using-git-worktrees` | Isolated workspace | `skills/superpowers/using-git-worktrees/SKILL.md` |

---

## Red Lines (Never Violate)

1. **No code without design** — Brainstorming is mandatory
2. **No code without tests** — TDD enforced everywhere
3. **No skipping reviews** — QA approval required
4. **No unfixed issues** — Bugs must have failing test first
5. **No starting on main branch** — Use worktrees

---

## Example: GipsyAI Title Generator Task

```markdown
### Task 7: Generator Judul Penelitian API

**Files:**
- Create: `src/app/api/tools/generate-title/route.ts`
- Create: `src/lib/ai/title-generator.ts`
- Create: `tests/api/tools/generate-title.test.ts`

**Task:** Implement title generation API endpoint

- [ ] **Step 1: Write failing test**
```typescript
// tests/api/tools/generate-title.test.ts
test('POST /api/tools/generate-title returns 3 title suggestions', async () => {
  const response = await fetch('/api/tools/generate-title', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ keywords: 'machine learning academic' })
  });
  
  expect(response.status).toBe(200);
  const data = await response.json();
  expect(data.titles).toHaveLength(3);
  expect(data.titles[0]).toContain('Machine Learning');
});
```

- [ ] **Step 2: Run test to verify it fails**
```bash
npm test tests/api/tools/generate-title.test.ts
# Expected: FAIL (route not defined)
```

- [ ] **Step 3: Write minimal implementation**

```typescript
// src/app/api/tools/generate-title/route.ts
export async function POST(request: Request) {
  const { keywords } = await request.json();
  const titles = await generateAcademicTitles(keywords);
  return Response.json({ titles });
}
```

- [ ] **Step 4: Run test to verify it passes**

- [ ] **Step 5: Commit**
```bash
git add src/app/api/tools/generate-title/route.ts
git commit -m "feat: add title generation API endpoint"
```

---

## Notes

- **Every task = one PR-ready unit of work**
- **Tests must fail before code passes**
- **Reviews catch issues before they compound**
- **3-hour iteration = progress without pressure**

---

*This document is the operating manual for Calmade's IT Division*
