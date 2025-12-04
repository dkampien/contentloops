# Phase 3: CLI Commands

## Status: Complete

## Commands Added

### `cloops extract`
Extract stories from Bible into universal pool.

```bash
cloops extract              # Extract 10 stories (default)
cloops extract --count 20   # Extract 20 stories
cloops extract -c 5         # Extract 5 stories
```

### `cloops stories`
Show stories extraction status.

```bash
cloops stories
```

Output:
```
📚 Stories Backlog Status

Universal Pool: 3 stories
Current Position: EXO chapter 3
Completed Books: 1
Total Extracted: 3

Recent stories:
  • Drawn from the Nile: The Birth and Adoption of Moses (Exodus 2)
  • Moses the Fugitive: From Prince of Egypt to Stranger in Midian (Exodus 2)
  • When God Heard Israel's Cry (Exodus 2)
```

## Files Modified
- `src/cli.ts` - Added extract and stories commands

## Validation
- `cloops extract --count 3` works
- `cloops stories` shows correct status
- `npm run build` passes
