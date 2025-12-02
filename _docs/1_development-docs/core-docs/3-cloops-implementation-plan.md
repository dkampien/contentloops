# CLoops Implementation Plan

Based on PRD and Tech Spec. Steps are designed to be atomic and build on each other.

---

## Phase 1: Project Foundation

### Step 1.1: Project Setup `[x]`
- **Task:** Initialize Node.js project with TypeScript configuration, folder structure, and dependencies.
- **Files:**
  - `cloops/package.json`
  - `cloops/tsconfig.json`
  - `cloops/.gitignore`
  - `cloops/src/index.ts` (placeholder entry)
- **Dependencies:** None
- **Validation:** `npm install` completes, `npm run build` compiles without errors.
- **Implementation Notes:**
  - Dependencies: `typescript`, `openai`, `replicate`, `commander` (CLI), `dotenv`
  - Dev dependencies: `@types/node`, `tsx` (for running TS directly during dev)

### Step 1.2: Type Definitions `[x]`
- **Task:** Create all shared TypeScript interfaces from tech spec Section 12.
- **Files:**
  - `cloops/src/types/index.ts`
- **Dependencies:** Step 1.1
- **Validation:** Types compile without errors, can be imported in other files.
- **Implementation Notes:** Copy types from tech spec, export all interfaces.

### Step 1.3: Environment Config `[x]`
- **Task:** Set up environment variable handling for API keys.
- **Files:**
  - `cloops/.env.example`
  - `cloops/src/utils/env.ts`
- **Dependencies:** Step 1.1
- **Validation:** Missing env vars throw clear error on startup.
- **Implementation Notes:** Required vars: `OPENAI_API_KEY`, `REPLICATE_API_TOKEN`

---

## Phase 2: Services

### Step 2.1: LLM Service `[x]`
- **Task:** Implement OpenAI API wrapper with structured output support.
- **Files:**
  - `cloops/src/services/llm.ts`
- **Dependencies:** Step 1.2, Step 1.3
- **Validation:** Can make a test call to OpenAI, returns expected response.
- **Implementation Notes:**
  - Support both plain text and JSON schema responses
  - Use `gpt-5.1` with OpenAI Responses API
  - Per-step `reasoning` and `verbosity` params (GPT-5.1 specific)
  - Handle API errors gracefully

### Step 2.2: Generation Service `[x]`
- **Task:** Implement Replicate API wrapper for image generation.
- **Files:**
  - `cloops/src/services/generation.ts`
- **Dependencies:** Step 1.2, Step 1.3
- **Validation:** Can generate a test image, downloads to local path.
- **Implementation Notes:**
  - Accept model, prompt, and params
  - Download generated image to temp location
  - Return local file path

### Step 2.3: Storage Service `[x]`
- **Task:** Implement file operations for bundle output.
- **Files:**
  - `cloops/src/services/storage.ts`
- **Dependencies:** Step 1.2
- **Validation:** Can create output folder, copy files, write JSON metadata.
- **Implementation Notes:**
  - Create directories recursively
  - Write story-data.json with proper structure
  - Handle file copy operations

---

## Phase 3: Datasource

### Step 3.1: Datasource Interface `[x]`
- **Task:** Define abstract datasource interface and types.
- **Files:**
  - `cloops/src/datasource/types.ts`
- **Dependencies:** Step 1.2
- **Validation:** Interface compiles, can be implemented.
- **Implementation Notes:** Interface with `getNextItem`, `markComplete`, `markFailed`, `markInProgress`

### Step 3.2: Backlog Datasource `[x]`
- **Task:** Implement JSON file backlog datasource.
- **Files:**
  - `cloops/src/datasource/backlog.ts`
- **Dependencies:** Step 3.1
- **Validation:** Can load backlog, get next pending item, update status.
- **Implementation Notes:**
  - Read/write JSON file
  - Find next pending item
  - Update status and timestamps
  - Save after each operation

---

## Phase 4: Template System

### Step 4.1: Config Loader `[x]`
- **Task:** Implement template config loading and variable injection.
- **Files:**
  - `cloops/src/utils/config.ts`
- **Dependencies:** Step 1.2
- **Validation:** Can load config.json, inject variables into template strings.
- **Implementation Notes:**
  - Load and parse config.json
  - `injectVariables` function with `{variable.path}` syntax
  - `getNestedValue` helper for dot notation

### Step 4.2: Template Loader `[x]`
- **Task:** Implement template discovery and loading.
- **Files:**
  - `cloops/src/template/loader.ts`
- **Dependencies:** Step 4.1
- **Validation:** Can list templates, load template with config and prompts.
- **Implementation Notes:**
  - Scan templates folder
  - Load config.json and prompt files
  - Return Template object

---

## Phase 5: Execution Engine

### Step 5.1: Step Runner `[x]`
- **Task:** Implement individual step execution logic.
- **Files:**
  - `cloops/src/engine/steps.ts`
- **Dependencies:** Step 2.1, Step 2.2, Step 2.3, Step 4.1
- **Validation:** Can execute a single step with input state, returns updated state.
- **Implementation Notes:**
  - Each step is a function: `(template, state) => Promise<State>`
  - Steps: narrative, planning, prompts, thumbnail, generation, bundle
  - Use services for LLM and generation calls

### Step 5.2: Template Runner `[x]`
- **Task:** Implement main orchestration loop that runs steps sequentially.
- **Files:**
  - `cloops/src/engine/runner.ts`
- **Dependencies:** Step 5.1
- **Validation:** Can run full template pipeline, state passes between steps correctly.
- **Implementation Notes:**
  - Load template config steps
  - Run each step in order
  - Skip generation step if dry run
  - Log progress, handle errors

---

## Phase 6: CLI

### Step 6.1: CLI Commands `[x]`
- **Task:** Implement CLI with commander: run, templates, status commands.
- **Files:**
  - `cloops/src/cli.ts`
- **Dependencies:** Step 5.2, Step 4.2, Step 3.2
- **Validation:**
  - `cloops run <template>` starts pipeline
  - `cloops run <template> --dry` skips generation
  - `cloops templates` lists available templates
  - `cloops status <template>` shows backlog status
- **Implementation Notes:**
  - Use commander for arg parsing
  - Support `--dry` flag
  - Support `--item <id>` for specific item
  - Add to package.json bin field

### Step 6.2: Logging & Error Handling `[x]`
- **Task:** Add structured logging and error handling throughout.
- **Files:**
  - `cloops/src/utils/logger.ts`
  - Update: `cloops/src/engine/runner.ts`
  - Update: `cloops/src/cli.ts`
- **Dependencies:** Step 6.1
- **Validation:** Clear progress logs, errors show step name and context.
- **Implementation Notes:**
  - Console logging with step prefixes
  - Error messages include context
  - Exit with non-zero code on failure

---

## Phase 7: Template Integration

### Step 7.1: Comic Books Template Setup `[x]`
- **Task:** Create comic-books-standard template folder with config and prompts.
- **Files:**
  - `cloops/templates/comic-books-standard/config.json`
  - `cloops/templates/comic-books-standard/prompts/step1-narrative.txt`
  - `cloops/templates/comic-books-standard/prompts/step2-planning.txt`
  - `cloops/templates/comic-books-standard/prompts/step3-prompts.txt`
  - `cloops/templates/comic-books-standard/prompts/step4-thumbnail.txt`
- **Dependencies:** Step 4.2
- **Validation:** Template loads correctly, config is valid.
- **Implementation Notes:**
  - Copy prompts from production-template-plan.md
  - Configure generation settings for Replicate/Seedream

### Step 7.2: Sample Backlog `[x]`
- **Task:** Create sample backlog with test stories.
- **Files:**
  - `cloops/data/backlogs/comic-books-standard.json`
- **Dependencies:** Step 3.2
- **Validation:** Backlog loads, items are fetchable.
- **Implementation Notes:** Add 2-3 stories from existing stories-meta folder.

---

## Phase 8: Architecture Refactor (Hybrid Template System)

**Context:** Initial implementation used hardcoded steps in the engine. This refactor implements the hybrid architecture where templates have their own workflow.ts files.

### Step 8.1: Update Type Definitions `[x]`
- **Task:** Update types to reflect new architecture (WorkflowFunction, Services, WorkflowContext).
- **Files:**
  - Update: `cloops/src/types/index.ts`
- **Dependencies:** None
- **Validation:** Types compile without errors.
- **Implementation Notes:**
  - Add WorkflowFunction type
  - Add Services interface
  - Add WorkflowContext interface
  - Remove StepName type (no longer needed)
  - Update Template interface

### Step 8.2: Refactor Services Layer `[x]`
- **Task:** Update services to work as injectable building blocks.
- **Files:**
  - Update: `cloops/src/services/llm.ts` (export service factory)
  - Rename: `cloops/src/services/generation.ts` → `cloops/src/services/replicate.ts`
  - Update: `cloops/src/services/storage.ts` (export service factory)
  - New: `cloops/src/services/index.ts` (Services interface, factory)
- **Dependencies:** Step 8.1
- **Validation:** Services can be instantiated and used.
- **Implementation Notes:**
  - Services should be created via factory functions
  - LLM service accepts prompt + schema + variables
  - Replicate service has generateImage and generateImages methods

### Step 8.3: Simplify Engine `[x]`
- **Task:** Remove hardcoded steps, make engine just load and run template workflow.
- **Files:**
  - Delete: `cloops/src/engine/steps.ts`
  - Update: `cloops/src/engine/runner.ts`
- **Dependencies:** Step 8.2
- **Validation:** Engine loads template and calls its workflow function.
- **Implementation Notes:**
  - Engine no longer knows about step types
  - Engine creates services, builds context, calls template.workflow()

### Step 8.4: Update Template Loader `[x]`
- **Task:** Update loader to import workflow.ts and load schemas.
- **Files:**
  - Update: `cloops/src/template/loader.ts`
- **Dependencies:** Step 8.3
- **Validation:** Template loads with workflow function, prompts, and schemas.
- **Implementation Notes:**
  - Dynamic import of workflow.ts
  - Load all .json files from schemas/ folder
  - Validate template has required files

### Step 8.5: Create Template Workflow `[x]`
- **Task:** Create workflow.ts for comic-books-standard template.
- **Files:**
  - New: `cloops/templates/comic-books-standard/workflow.ts`
  - New: `cloops/templates/comic-books-standard/schemas/narrative.json`
  - New: `cloops/templates/comic-books-standard/schemas/planning.json`
  - New: `cloops/templates/comic-books-standard/schemas/prompts.json`
  - Update: `cloops/templates/comic-books-standard/config.json` (remove steps array)
- **Dependencies:** Step 8.4
- **Validation:** Template workflow runs end-to-end.
- **Implementation Notes:**
  - Workflow uses services.llm, services.replicate, services.storage
  - Workflow reads config for settings
  - Workflow handles dry run logic internally

### Step 8.6: Update CLI `[x]`
- **Task:** Update CLI to work with new template/runner structure.
- **Files:**
  - Update: `cloops/src/cli.ts`
- **Dependencies:** Step 8.5
- **Validation:** CLI commands work with refactored code.
- **Implementation Notes:**
  - Minimal changes expected
  - Ensure async template loading works

---

## Phase 9: End-to-End Testing

### Step 9.1: Dry Run Test `[x]`
- **Task:** Run full pipeline in dry mode, verify LLM outputs.
- **Files:** None (manual testing)
- **Dependencies:** All previous steps
- **Validation:**
  - `cloops run comic-books-standard --dry` completes
  - Narrative, pages, and prompts are generated
  - No image generation calls made
- **Implementation Notes:** Review generated prompts for quality.

### Step 9.2: Full Run Test `[x]`
- **Task:** Run full pipeline with image generation.
- **Files:** None (manual testing)
- **Dependencies:** Step 9.1
- **Validation:**
  - `cloops run comic-books-standard` completes
  - Images generated and saved
  - story-data.json created with correct structure
  - Backlog item marked complete
- **Implementation Notes:** Check output folder structure matches spec.

---

## Phase 10: Refinements

### Step 10.1: Production Prompts `[x]`
- **Task:** Update prompts to match production template plan (XML format).
- **Files:**
  - Update: `cloops/templates/comic-books-standard/prompts/*.txt`
- **Validation:** Prompts use `<role>`, `<task>`, `<constraints>`, `<output_format>` structure.
- **Implementation Notes:** Copy from production-template-plan.md test prompts.

### Step 10.2: Rename Prompts Folder `[x]`
- **Task:** Rename prompts/ to system-prompts/ and .txt to .md for better organization.
- **Files:**
  - Rename: `prompts/` → `system-prompts/`
  - Rename: `*.txt` → `*.md`
  - Update: `cloops/src/template/loader.ts`
- **Validation:** Template loader reads .md files from system-prompts/ folder.

### Step 10.3: Debug Feature `[x]`
- **Task:** Add --debug flag to save LLM responses for inspection.
- **Files:**
  - Update: `cloops/src/cli.ts` (add --debug flag)
  - Update: `cloops/src/types/index.ts` (DebugMdData, ReplayData types)
  - Update: `cloops/src/services/storage.ts` (writeDebugMd, readDebugMd)
  - Update: `cloops/templates/comic-books-standard/workflow.ts`
- **Validation:** `--debug` saves debug.md with all LLM responses in readable format.

### Step 10.4: Replay Feature `[x]`
- **Task:** Add --replay flag to skip LLM calls and regenerate images from debug.md.
- **Files:**
  - Update: `cloops/src/cli.ts` (add --replay flag)
  - Update: `cloops/templates/comic-books-standard/workflow.ts`
- **Validation:** `--replay` loads from debug.md, skips LLM, generates images.

### Step 10.5: Replicate URL Fix `[x]`
- **Task:** Fix FileOutput URL extraction from Replicate SDK.
- **Files:**
  - Update: `cloops/src/services/replicate.ts`
- **Validation:** Images download correctly from Replicate.
- **Implementation Notes:** Use `String(output[0])` to convert FileOutput to URL.

---

## Summary

**Total Steps:** 27
**Phases:** 10

**Architecture:**
- **Services (shared):** LLM, Replicate, Storage - reusable building blocks
- **Workflow (per-template):** workflow.ts defines logic, uses services
- **Config (per-template):** config.json defines settings/parameters

**Key Considerations:**
1. Each step is atomic - can be implemented and tested independently
2. Services are built first so templates can use them
3. Templates are self-contained with their own workflow logic
4. Engine is thin - just loads template and runs its workflow

**After MVP:**
- Add CSV datasource
- Add ComfyUI service
- Add parallel image generation
- Add post-processing (cloud upload, AdLoops integration)
- Add more templates

---

## Changelog

- **2025-12-01:** Added Phase 10 (Refinements) - production prompts, debug/replay, Replicate fix
- **2025-12-01:** Completed Phase 9 (End-to-End Testing)
- **2025-12-01:** Added Phase 8 (Architecture Refactor) for hybrid template system
- **2025-12-01:** Initial plan created

---

*Last updated: 2025-12-01*
