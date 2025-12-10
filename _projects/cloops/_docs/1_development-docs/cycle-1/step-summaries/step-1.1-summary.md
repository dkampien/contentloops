# Step 1.1: Add API Key to .env

## Status: Complete

## Changes Made
1. Added `BIBLE_API_KEY` to `.env`
2. Updated `src/utils/env.ts`:
   - Added `BIBLE_API_KEY` to `EnvConfig` interface
   - Added to `loadEnv()` function

## Files Modified
- `cloops/.env`
- `cloops/src/utils/env.ts`

## Validation
- `npm run build` passes
- API key accessible via `getEnv().BIBLE_API_KEY`
