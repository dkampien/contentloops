# Cycle 1: Requirements

## Scope
- Stories Backlog Service [backlog #2]
- Batch Processing [backlog #1]

## Stories Backlog Datasource

### Overview
A new datasource type that provides Bible stories to templates. Consists of:
- **Universal pool** (`stories-universal.json`) - all extracted stories
- **Extraction state** (`extraction-state.json`) - current position in Bible
- **Template backlogs** (`data/backlogs/*.json`) - per-template status tracking

### Functional Requirements

#### Extraction
1. Connect to api.bible and fetch content
2. Extract stories from sections (or chapters as fallback)
3. LLM determines if content is "story-worthy"
4. Store extracted stories in universal pool
5. Track extraction position (resume from where left off)

#### Datasource Interface
1. Template declares `"datasource": "stories-backlog"` in config
2. When template requests items:
   - Check template backlog for pending items
   - If none, pick available stories from universal (not yet in template backlog)
   - If universal exhausted, extract more from Bible
   - Return items via standard Datasource interface
3. Template marks items complete/failed in its own backlog
4. Same story can be used by multiple templates independently

### Data Structures

#### Story (universal pool)
```typescript
interface Story {
  id: string;           // e.g., "genesis-1-1"
  title: string;        // e.g., "The Creation"
  summary: string;
  keyMoments: string[];
  source: {
    book: string;
    chapter: number;
    section?: string;
  };
}
```

#### Template Backlog Item (per-template)
```typescript
interface TemplateBacklogItem {
  storyId: string;      // references Story.id in universal
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  completedAt?: string;
  error?: string;
}
```

#### Extraction State
```typescript
interface ExtractionState {
  currentBook: string;
  currentChapter: number;
  completedBooks: string[];
  totalExtracted: number;
}
```

### File Structure
```
data/
└── stories-backlog/
    ├── universal.json           # all extracted stories
    ├── extraction-state.json    # current position in Bible
    └── template-backlogs/
        ├── comic-books-standard.json   # template status tracking
        └── comic-books-kids.json       # template status tracking
```

### Commands
```bash
cloops extract --count 20    # manually extract 20 more stories
cloops stories status        # show extraction progress + pool size
```

Note: Manual extraction command is optional - extraction happens automatically when templates need more stories.

## Batch Processing

### Functional Requirements
1. `--batch N` flag runs N pending items sequentially
2. `--all` flag runs all pending items
3. Stops on error (or continue with `--continue-on-error`?)
4. Reports progress during batch

### Commands
```bash
cloops run comic-books-standard --batch 20
cloops run comic-books-standard --all
```

## Success Criteria
- Can extract stories from Bible (manually or on-demand)
- Can generate 20 comics with one command
- Stories stored locally and reusable across templates
- Template backlogs track status independently
