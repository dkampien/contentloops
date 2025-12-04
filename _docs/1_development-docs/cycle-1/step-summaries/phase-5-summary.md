# Phase 5: Integration

## Status: Complete

## What Was Done

### Step 5.1: Update Template Config
Changed `comic-books-standard/config.json`:
```json
"datasource": "stories-backlog"
```

### Step 5.2: Wire Datasource Router
Added `createDatasource()` function in `cli.ts` that routes to the correct datasource based on template config:
- `"stories-backlog"` → `createStoriesBacklogDatasource()` (NEW in Cycle 1)
- `"backlog"` → `createBacklogDatasource()` (pre-existing)

Updated `TemplateConfig.datasource` type to include `"stories-backlog"`.

### Step 5.3: End-to-End Test
Verified integration works:
1. Template loads with `datasource: "stories-backlog"`
2. CLI creates `StoriesBacklogDatasource`
3. Datasource returns story from universal pool
4. Template backlog tracks status correctly

**Note:** Template workflow has a pre-existing schema issue (not related to Cycle 1). The stories-backlog integration itself is working correctly.

## Files Modified
- `templates/comic-books-standard/config.json` - Changed datasource
- `src/types/index.ts` - Added `"stories-backlog"` to datasource union
- `src/cli.ts` - Added `createDatasource()` router function

## Validation
```bash
npm run dev -- run comic-books-standard --dry
# Output shows:
# - Story loaded from universal pool (EXO.2.S3)
# - Template backlog updated correctly
```
