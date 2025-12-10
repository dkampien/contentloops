# Phase 4: Batch Processing

## Status: Complete

## Features Added

### `--batch N` / `-b N` Flag
Run N pending items sequentially.

```bash
cloops run comic-books-standard --batch 20
cloops run comic-books-standard -b 5
```

### `--all` / `-a` Flag
Run all pending items in backlog.

```bash
cloops run comic-books-standard --all
cloops run comic-books-standard -a
```

### Progress Reporting
- Shows `[1/20]`, `[2/20]`, etc. during batch
- Summary at end: "Batch complete: 18 succeeded, 2 failed"

### Error Handling
- Batch/all mode: continues on failure, reports at end
- Single item mode: stops on failure (original behavior)

## Example Output
```
Loaded template: comic-books-standard
Batch mode: up to 5 items

[1/5] Processing: story-1 (David and Goliath)
...
[2/5] Processing: story-2 (Noah's Ark)
...

========================================
Batch complete: 5 succeeded, 0 failed
========================================
```

## Files Modified
- `src/cli.ts` - Added batch/all options and processing loop

## Validation
- `npm run build` passes
- `--help` shows new options
