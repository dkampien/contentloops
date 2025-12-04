# Step 2.1: Define Types

## Status: Complete

## Changes Made
Added to `src/types/index.ts`:

### Story (universal pool)
```typescript
interface Story {
  id: string;           // e.g., "GEN.1.1-creation"
  title: string;
  summary: string;
  keyMoments: string[];
  source: {
    book: string;
    chapter: number;
    section?: string;
  };
}
```

### TemplateBacklogItem (per-template)
```typescript
interface TemplateBacklogItem {
  storyId: string;      // References Story.id
  status: ItemStatus;
  completedAt?: string;
  error?: string;
}
```

### ExtractionState
```typescript
interface ExtractionState {
  bibleId: string;
  currentBook: string;
  currentChapter: number;
  completedBooks: string[];
  totalExtracted: number;
}
```

### Updated Datasource Interface
Made all methods async (return Promises) for file I/O operations.

## Files Modified
- `cloops/src/types/index.ts`

## Validation
- `npm run build` passes
