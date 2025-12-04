# Cycle 1: Implementation Plan

## Overview
- **Objective:** Enable batch generation of comics from Bible content via Stories Backlog datasource
- **Key Risks / Assumptions:**
  - api.bible sections API works as documented
  - $30/month subscription, extract once then cancel
- **Related Docs:**
  - `@_docs/1_development-docs/cycle-1/1-exploration.md`
  - `@_docs/1_development-docs/cycle-1/2-requirements.md`

## Completion Status
- **Phase 1:** ❌ — api.bible integration
- **Phase 2:** ❌ — Stories Backlog datasource
- **Phase 3:** ❌ — CLI commands
- **Phase 4:** ❌ — Batch processing
- **Phase 5:** ❌ — Integration testing
- **Phase 6:** ❌ — Cleanup

---

## Phase 1: api.bible Integration

### Step 1.1: Get API Key `[ ]`
- **Priority:** Critical
- **Task:** Sign up for api.bible, get API key, add to `.env`
- **Files:** `.env`, `src/utils/env.ts`
- **Step Dependencies:** None
- **Validation:** API key stored and accessible via `getEnv()`

### Step 1.2: Create Bible API Service `[ ]`
- **Priority:** Critical
- **Task:** Create service to interact with api.bible endpoints
- **Files:** `src/services/bible-api.ts`
- **Step Dependencies:** Step 1.1
- **Validation:** Can fetch list of books from API

### Step 1.3: Implement Core Endpoints `[ ]`
- **Priority:** Critical
- **Task:** Implement fetch functions for books, chapters, sections
- **Files:** `src/services/bible-api.ts`
- **Step Dependencies:** Step 1.2
- **Validation:** Can fetch sections for a given chapter, understand response structure

---

## Phase 2: Stories Backlog Datasource

### Step 2.1: Define Types `[ ]`
- **Priority:** High
- **Task:** Define Story, TemplateBacklogItem, ExtractionState types
- **Files:** `src/types/index.ts`
- **Step Dependencies:** Phase 1 complete
- **Validation:** Types compile

### Step 2.2: Implement Universal Pool Storage `[ ]`
- **Priority:** High
- **Task:** Read/write stories to `data/stories-backlog/universal.json`
- **Files:** `src/datasource/stories-backlog.ts`
- **Step Dependencies:** Step 2.1
- **Validation:** Can save and load stories from universal pool

### Step 2.3: Implement Extraction State `[ ]`
- **Priority:** High
- **Task:** Track extraction position (current book/chapter) in `data/stories-backlog/extraction-state.json`
- **Files:** `src/datasource/stories-backlog.ts`
- **Step Dependencies:** Step 2.1
- **Validation:** State persists between runs, resumes from correct position

### Step 2.4: Implement Extraction Loop `[ ]`
- **Priority:** Critical
- **Task:** Fetch content from Bible API → LLM filters story-worthy → store in universal
- **Files:** `src/datasource/stories-backlog.ts`
- **Step Dependencies:** Step 2.2, Step 2.3
- **Validation:** Can extract N stories, stored in universal pool

### Step 2.5: Create Extraction Prompt `[ ]`
- **Priority:** High
- **Task:** Write prompt for LLM to decide story-worthiness and extract title/summary/keyMoments
- **Files:** `src/datasource/extraction-prompt.ts` or inline
- **Step Dependencies:** Step 2.4
- **Validation:** LLM returns consistent, usable output

### Step 2.6: Implement Template Backlog Management `[ ]`
- **Priority:** Critical
- **Task:** Create/read/update template backlogs in `data/stories-backlog/template-backlogs/`. Track status per template.
- **Files:** `src/datasource/stories-backlog.ts`
- **Step Dependencies:** Step 2.2
- **Validation:** Template backlog stores story references + status

### Step 2.7: Implement Datasource Interface `[ ]`
- **Priority:** Critical
- **Task:** Implement `getNextItem()`, `markComplete()`, `markFailed()` for stories-backlog datasource
- **Files:** `src/datasource/stories-backlog.ts`
- **Step Dependencies:** Step 2.6
- **Validation:** Returns items from template backlog, updates status correctly

### Step 2.8: Implement On-Demand Extraction `[ ]`
- **Priority:** High
- **Task:** When template backlog exhausted, auto-pick from universal. When universal exhausted, auto-extract more.
- **Files:** `src/datasource/stories-backlog.ts`
- **Step Dependencies:** Step 2.4, Step 2.7
- **Validation:** Template can request N items even if backlog/universal is empty

---

## Phase 3: CLI Commands

### Step 3.1: Add Extract Command `[ ]`
- **Priority:** High
- **Task:** Add `cloops extract --count N` command for manual extraction
- **Files:** `src/cli.ts`
- **Step Dependencies:** Phase 2 complete
- **Validation:** `cloops extract --count 5` extracts 5 stories

### Step 3.2: Add Stories Status Command `[ ]`
- **Priority:** Medium
- **Task:** Add `cloops stories status` to show extraction progress and pool size
- **Files:** `src/cli.ts`
- **Step Dependencies:** Step 3.1
- **Validation:** Shows current position, total extracted, pool size

---

## Phase 4: Batch Processing

### Step 4.1: Add Batch Flag `[ ]`
- **Priority:** High
- **Task:** Add `--batch N` flag to run command
- **Files:** `src/cli.ts`, `src/engine/runner.ts`
- **Step Dependencies:** None (parallel to Phase 2-3)
- **Validation:** `cloops run template --batch 5` runs 5 items

### Step 4.2: Add All Flag `[ ]`
- **Priority:** Medium
- **Task:** Add `--all` flag to run all pending items
- **Files:** `src/cli.ts`
- **Step Dependencies:** Step 4.1
- **Validation:** `cloops run template --all` processes entire backlog

### Step 4.3: Progress Reporting `[ ]`
- **Priority:** Medium
- **Task:** Show progress during batch (e.g., "Processing 3/20...")
- **Files:** `src/engine/runner.ts`
- **Step Dependencies:** Step 4.1
- **Validation:** Console shows progress updates

---

## Phase 5: Integration

### Step 5.1: Update Template Config `[ ]`
- **Priority:** Critical
- **Task:** Update comic-books-standard config to use `"datasource": "stories-backlog"`
- **Files:** `templates/comic-books-standard/config.json`
- **Step Dependencies:** Phase 2 complete
- **Validation:** Config has correct datasource type

### Step 5.2: Wire Datasource Manager `[ ]`
- **Priority:** Critical
- **Task:** Datasource manager routes to stories-backlog based on template config
- **Files:** `src/datasource/index.ts`, `src/engine/runner.ts`
- **Step Dependencies:** Step 5.1
- **Validation:** Template uses stories-backlog datasource when configured

### Step 5.3: End-to-End Test `[ ]`
- **Priority:** Critical
- **Task:** Extract stories → run batch → verify output
- **Files:** None (testing)
- **Step Dependencies:** Step 5.2, Phase 4 complete
- **Validation:** Can generate 20 comics in batch from Bible content

---

## Phase 6: Cleanup

### Step 6.1: Error Handling `[ ]`
- **Priority:** High
- **Task:** Handle API errors, LLM failures, partial extraction gracefully
- **Files:** `src/services/bible-api.ts`, `src/datasource/stories-backlog.ts`
- **Step Dependencies:** Phase 5 complete
- **Validation:** Errors logged, state preserved on failure

### Step 6.2: Update Documentation `[ ]`
- **Priority:** Medium
- **Task:** Update README with new commands and datasource type
- **Files:** `cloops/README.md`
- **Step Dependencies:** Step 6.1
- **Validation:** README documents extract, batch, and stories-backlog

### Step 6.3: Full Bible Extraction `[ ]`
- **Priority:** Low
- **Task:** Run full extraction of story-worthy Bible content
- **Files:** `data/stories-universal.json`
- **Step Dependencies:** Step 6.1
- **Validation:** All story-worthy content extracted locally

### Step 6.4: Cancel Subscription `[ ]`
- **Priority:** Low
- **Task:** Cancel api.bible subscription after extraction complete
- **Files:** None
- **Step Dependencies:** Step 6.3
- **Validation:** No ongoing API cost

---

## Post-Implementation Checklist
- [ ] `npm run build` passes
- [ ] Test: `cloops extract --count 5`
- [ ] Test: `cloops stories status`
- [ ] Test: `cloops run comic-books-standard --batch 5`
- [ ] Stories persist in `data/stories-backlog/universal.json`
- [ ] Template backlog tracks status in `data/stories-backlog/template-backlogs/`
- [ ] Same story can be used by different templates
- [ ] Update backlog.md - mark items complete
