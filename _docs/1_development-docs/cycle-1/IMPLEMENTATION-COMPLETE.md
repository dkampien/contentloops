# Cycle 1: Implementation Complete

## Summary
Cycle 1 added the Stories Backlog datasource and batch processing to CLoops.

## What Was Built (NEW)

### 1. api.bible Integration
- `src/services/bible-api.ts` - Bible API client
- Fetches books, chapters, sections from Berean Standard Bible
- API key stored in `.env`

### 2. Stories Backlog Datasource
- `src/datasource/stories-backlog.ts` - New datasource type
- Universal pool: `data/stories-backlog/universal.json`
- Extraction state: `data/stories-backlog/extraction-state.json`
- Per-template backlogs: `data/stories-backlog/template-backlogs/`
- LLM-based story extraction with filtering

### 3. CLI Commands
- `cloops extract --count N` - Extract N stories from Bible
- `cloops stories` - Show extraction status

### 4. Batch Processing
- `--batch N` / `-b N` - Run N pending items
- `--all` / `-a` - Run all pending items
- Progress reporting and error summary

### 5. Datasource Routing
- Template config `"datasource": "stories-backlog"`
- CLI routes to correct datasource based on config

## Files

### New Files
- `src/services/bible-api.ts`
- `src/datasource/stories-backlog.ts`

### Modified Files (pre-existing)
- `src/types/index.ts` - Added Story, TemplateBacklogItem, ExtractionState types
- `src/datasource/types.ts` - Made Datasource interface async
- `src/datasource/backlog.ts` - Made methods async to match interface
- `src/cli.ts` - Added extract, stories, batch commands + datasource router
- `src/utils/env.ts` - Added BIBLE_API_KEY
- `templates/comic-books-standard/config.json` - Changed to stories-backlog
- `README.md` - Updated docs
- `.env` - Added BIBLE_API_KEY

## Pre-Existing (Not Part of Cycle 1)
- `src/datasource/backlog.ts` - Manual backlog datasource (reads from `data/backlogs/`)
- `data/backlogs/*.json` - Manually curated story backlogs

## Validation
- [x] `npm run build` passes
- [x] `cloops extract --count 3` extracts stories
- [x] `cloops stories` shows status
- [x] Stories persist in universal pool
- [x] Template backlog tracks status
- [x] Batch processing works

## Known Issues
- Template workflow has a pre-existing schema issue (not Cycle 1 related)
- Full Bible extraction deferred until production ready

## Next Steps
1. Fix template workflow schema issue
2. Run full Bible extraction when ready
3. Cancel api.bible subscription after extraction

---

## Post-Cycle 1 Refinements

Refinements made after initial implementation during first end-to-end testing.

### 1. Eliminated Temp Directory
- Replicate service now writes images directly to output folder
- Removed `cleanupTemp()` and `cleanup` CLI command
- **Why:** Unnecessary intermediate step, leftover files on failure

### 2. Always Save prompts.md
- Renamed `debug.md` → `prompts.md`
- Removed `--debug` flag - always saved now
- Backwards compatible with old debug.md for replay
- **Why:** Prompts are reference data, not debug info

### 3. Sequenced Folder Names
- Output folders now prefixed: `001-story-slug/`, `002-story-slug/`
- Auto-increments based on existing folders
- **Why:** Easier sorting and organization

### 4. Filesystem as Source of Truth
- Status derived from output folder, not stored in backlog JSON
- No folder → pending, prompts.md only → in_progress, story-data.json → completed
- Self-healing: delete folder = auto re-process
- **Why:** Backlog status got out of sync (dry runs stuck as in_progress)

### 5. Simplified Template Backlog
- Now only stores: `storyId`, `title`, `error`
- Removed `status`, `completedAt` fields
- Title used for folder slug lookup
- **Why:** Status was redundant with filesystem

### 6. Renamed Datasource
- `stories-backlog` → `ds-stories-backlog` (file, folder, config)
- Convention ready for future datasources
- **Why:** Clear naming convention

### 7. Smart Extraction
- Added `ensureAvailable(count)` method
- Extracts only the stories needed, not fixed batch of 10
- **Why:** Efficient resource usage

### 8. Reset Extraction State
- Cleared to Genesis chapter 1
- Previous state had Genesis marked complete but no stories extracted
- **Why:** Start fresh with proper extraction

### 9. Save prompts.md Before Generation
- Moved `writePromptsMd()` to run after LLM steps, before image generation
- Previously saved at the very end, after images
- **Why:** If process cuts during generation, replay mode now works (LLM work not lost)

### 10. Auto-Retry Failed Items
- Removed `failed` status distinction - items with errors stay `pending`
- Failed count still tracked for display (subset of pending)
- **Why:** Failed items were skipped forever, requiring manual JSON editing
