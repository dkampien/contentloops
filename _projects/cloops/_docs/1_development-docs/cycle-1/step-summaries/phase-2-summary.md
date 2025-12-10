# Phase 2: Stories Backlog Datasource

## Status: Complete

## What Was Built

### Stories Backlog Datasource (`src/datasource/stories-backlog.ts`) - NEW
A new datasource type that:
1. Extracts stories from the Bible via api.bible
2. Uses LLM to filter "story-worthy" content
3. Stores stories in a universal pool
4. Manages per-template backlogs

### Data Structure
```
data/stories-backlog/
├── universal.json           # All extracted stories
├── extraction-state.json    # Current position in Bible
└── template-backlogs/
    └── {template}.json      # Per-template status
```

### Key Functions
- `extractStories(count)` - Extract N stories from Bible
- `loadUniversalPool()` / `saveUniversalPool()` - Universal pool storage
- `loadExtractionState()` / `saveExtractionState()` - Extraction state tracking
- `loadTemplateBacklog()` / `saveTemplateBacklog()` - Template backlog management
- `StoriesBacklogDatasource` class - Implements Datasource interface

### Extraction Flow
1. Fetch sections from api.bible (Berean Standard Bible)
2. LLM evaluates each section for "story-worthiness"
3. Story-worthy content gets title, summary, and keyMoments extracted
4. Stored in universal pool with source reference
5. Extraction state tracks position to resume later

### Changes to Pre-Existing Code
- Made `Datasource` interface async (methods return Promises)
- Updated pre-existing `backlog.ts` to match async interface
- Updated `cli.ts` to await datasource methods

## Validation
- Extracted 3 test stories from Exodus 2
- Stories include rich visual descriptions for comic panels
- Universal pool persists between runs
- Extraction state resumes from correct position

## Files Created/Modified
- `src/datasource/stories-backlog.ts` (NEW)
- `src/datasource/types.ts` (async interface)
- `src/datasource/backlog.ts` (async methods - pre-existing file)
- `src/types/index.ts` (new types)
- `src/cli.ts` (await calls)
