# Cycle 1: Exploration

## Goal
Enable batch generation of comics from Bible content without manual backlog population.

## Key Questions Explored

### How do we get stories at scale?
- Manual curation doesn't scale (need thousands, not dozens)
- Bible API (api.bible) provides structured access to content
- $30/month but can extract once and store locally (Option 2)

### What's the extraction unit?
- Bible structure: Books → Chapters → Verses
- api.bible has "Sections" - thematic groupings with titles like "David and Goliath"
- Sections are ideal extraction units (pre-identified story boundaries)
- **Alternative approach (if sections don't work):** use chapters as extraction units instead. This is a design decision, not runtime fallback code.

### How does extraction work?
- Tracks progress: stores current position (book/chapter) in state file
- On-demand: extracts more stories only when a template exhausts available pool
- LLM filters: decides "story-worthy?" for each section/chapter
- Stores locally: after extraction, no ongoing API dependency

## Architecture

### Datasource Manager
Routes templates to the appropriate datasource type based on what template declares in config.

```
Datasource Manager
      ↓
├── stories-backlog (universal Bible stories)
│     ├── comic-books-standard
│     ├── comic-books-kids
│     └── future Bible templates...
│
├── csv (future)
│     └── user-testimonials-template
│
└── ...future datasource types
```

### stories-backlog Datasource Type
- **Universal pool**: `universal.json` holds all extracted stories
- **Template backlogs**: Each template has its own backlog for status tracking
- **References, not copies**: Template backlog references story IDs, actual data lives in universal
- **Reusable stories**: Same story can be used by multiple templates (different outputs)

### File Structure
```
data/
└── stories-backlog/
    ├── universal.json           # all extracted stories
    ├── extraction-state.json    # cursor position
    └── template-backlogs/
        ├── comic-books-standard.json
        └── comic-books-kids.json
```

### Template declares datasource
```json
{
  "name": "comic-books-standard",
  "datasource": "stories-backlog"
}
```

### Flow Example
```
t0: comic-books-standard needs 20 stories
    → universal empty
    → extract 20 from Bible (cursor moves to position 20)
    → universal has 20 stories
    → template backlog references 20 story IDs

t1: comic-books-kids needs 30 stories
    → universal has 20
    → pick 20 from universal, need 10 more
    → extract 10 more (cursor moves to position 30)
    → universal has 30 stories
    → template backlog references 30 story IDs

t2: new-template needs 15 stories
    → universal has 30
    → pick 15 from universal (no extraction needed)
    → cursor stays at 30
    → template backlog references 15 story IDs
```

### Extraction Trigger
Extraction only happens when a **specific template** needs more stories than available in universal. The cursor (extraction position) only advances when new content is needed.

## Decisions Made
1. Use api.bible with sections (paid, but better data)
2. Extract once, store locally, cancel subscription
3. Try sections first; if API sections are unreliable, switch to chapter-based approach
4. stories-backlog as universal datasource type
5. Template backlogs in `data/backlogs/` (runtime state, not config)
6. Same story reusable across templates
7. Batch processing via `--batch N` flag

## Out of Scope
- Kids Template (use standard for now)
- Selective Regeneration
- Scheduling Worker
