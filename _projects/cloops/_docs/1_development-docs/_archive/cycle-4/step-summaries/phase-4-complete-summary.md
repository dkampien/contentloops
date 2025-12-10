# Phase 4: Script Generator Updates - Complete

**Date**: 2025-10-24
**Status**: ✅ Complete

## All Steps Completed

### Step 4.1: Update CALL 1 Zod schema ✅
- Changed from `overallScript` + `scenes[].content` to `videoScript` + `voiceScript`
- Removed scenes array from CALL 1 response

### Step 4.2: Update CALL 2 user prompt ✅
- Changed signature to accept `videoScript` and `voiceScript` instead of scenes array
- Updated to generate all 3 scene prompts in one call (not per-scene loop)

### Step 4.3: Update CALL 2 Zod schema ✅
- Changed to expect array of 3 scenes with prompts
- Removed per-scene loop logic

### Step 4.4: Update VideoScript assembly ✅
- Updated `buildVideoScript` signature
- Changed to use `videoScript` and `voiceScript` fields
- Scenes now only have `prompt` field (no `content`)

## Changes Made

### File: `src/lib/script-generator.ts`

**CALL 1 (`generateContent`)**:
- Return type: `{ overallScript, scenes[] }` → `{ videoScript, voiceScript }`
- Zod schema: Validates `videoScript` (min 50 chars) and `voiceScript` (40-100 chars)
- No longer generates scenes in CALL 1

**CALL 2 (`generatePrompts`)**:
- Signature: `(scenes[], template)` → `(videoScript, voiceScript, template)`
- Changed from per-scene loop to single call
- Zod schema: Expects array of 3 scenes with `sceneNumber` and `prompt`
- User prompt: Passes both videoScript and voiceScript to LLM

**buildVideoScript**:
- Signature: `(overallScript, scenes[], category, template)` → `(videoScript, voiceScript, scenes[], category, template)`
- Scene objects: No longer include `content` field
- Returns `VideoScript` with new field names

**Main flow (`generateScript`)**:
- CALL 1 generates `videoScript` + `voiceScript`
- CALL 2 uses both to generate 3 scene prompts
- Builds final VideoScript with all new fields

## Validation

**Build test**: `npm run build`
- **Result**: Only 1 remaining expected error (dry-run-assembler.ts:60)
- All script-generator changes compile successfully
- ✅ Type system validates correct field names throughout

## Impact

- ✅ Script generator aligned with new template design
- ✅ Two-call process simplified and more efficient
- ✅ Zod schemas validate correct output structure
- ✅ Scenes no longer carry deprecated `content` field
- ⏳ Dry-run assembler needs update (Phase 7)

## Next Step

Phase 5, Step 5.1: Update data-processor.ts to use `.filter()` instead of `.find()`
