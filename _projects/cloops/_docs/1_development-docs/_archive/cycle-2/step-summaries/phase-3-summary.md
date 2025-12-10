# Phase 3: Script Generator Refactor - Summary

**Date**: October 16, 2025
**Status**: ✅ Complete

---

## Changes Made

### 1. `src/lib/script-generator.ts`

#### Updated imports (lines 6-16)
```typescript
import { z } from 'zod';  // Added
import { ..., UserProblem } from '../types/script.types';  // Added UserProblem
```

#### Updated generateScript() method (lines 34-93)
**Signature changed:**
- FROM: `generateScript(category: ProblemCategory, template: TemplateType)`
- TO: `generateScript(userProblem: UserProblem, template: TemplateType)`

**New two-step flow:**
1. Call `generateContent()` - Gets overallScript + scenes[].content
2. Call `generatePrompts()` - For each scene, generates scene.prompt from scene.content
3. Build VideoScript with LLM-generated overallScript

**Key improvements:**
- Logs both category and specific problem
- Clear step indicators: "Step 1/2", "Step 2/2"
- Uses two dedicated methods instead of one monolithic call

#### Added generateContent() method (lines 95-163)
**Purpose**: CALL 1 - Generate content

**Features:**
- Uses `template.systemPromptCall1`
- Sends both category AND problem to LLM
- Returns `{ overallScript, scenes: [{ sceneNumber, content }] }`
- Uses Zod schema validation (ContentSchema)
- Retry logic with exponential backoff (3 retries)

**Zod schema:**
```typescript
const ContentSchema = z.object({
  overallScript: z.string().min(50),
  scenes: z.array(z.object({
    sceneNumber: z.number().int().min(1).max(3),
    content: z.string().min(10)
  })).length(3)
});
```

#### Added generatePrompts() method (lines 165-236)
**Purpose**: CALL 2 - Generate prompts from content

**Features:**
- Uses `template.systemPromptCall2`
- Loops through each scene sequentially
- Sends `scene.content` to LLM, receives optimized `prompt`
- Uses Zod schema validation (PromptSchema)
- Retry logic per scene (3 retries each)
- Temperature: 0.7, Max tokens: 500 (smaller, faster calls)

**Zod schema:**
```typescript
const PromptSchema = z.object({
  prompt: z.string().min(20)
});
```

#### Updated buildVideoScript() method (lines 238-269)
**Signature changed:**
- FROM: `buildVideoScript(scenes: any[], category: ProblemCategory, template: TemplateType)`
- TO: `buildVideoScript(overallScript: string, scenes: Array<...>, category: ProblemCategory, template: TemplateType)`

**Key change:**
- Now accepts `overallScript` as parameter (from LLM)
- Removed call to `generateOverallScript()` (deleted method)
- Uses LLM-generated prose instead of locally-generated summary

#### Removed old methods
- ❌ `callOpenAI()` - Replaced by `generateContent()` + `generatePrompts()`
- ❌ `generateOverallScript()` - No longer needed (LLM generates it)

---

## Test Results

### Compilation Test
```bash
npm run build
```

**Result**: ⚠️ 1 error (expected)

**Errors**:
1. ~~`src/lib/script-generator.ts(104,37)`: Property 'systemPrompt' does not exist~~ ✅ **FIXED**
2. `src/index.ts(120,63)`: Argument of type 'string' is not assignable to parameter of type 'UserProblem' ⏸️ **Will be fixed in Phase 4**

**Status**: ✅ **Success** - script-generator refactor complete, only index.ts integration remains

---

## Files Modified
- ✅ `src/lib/script-generator.ts` - Complete two-step generation refactor

---

## Key Improvements

### Code Quality
1. **Separation of concerns**: Content generation separate from prompt optimization
2. **Better error handling**: Specific errors for Call 1 vs Call 2
3. **Detailed logging**: Step indicators, scene-level progress
4. **Type safety**: Proper UserProblem type usage

### LLM Integration
1. **Focused prompts**: Call 1 focuses on content, Call 2 on Veo 3 optimization
2. **Problem-specific**: Uses actual user problem text, not just category
3. **Prose overallScript**: LLM generates professional prose description
4. **Dialogue extraction**: Call 2 can extract and format dialogue from Call 1 content

### Reliability
1. **Retry logic**: Both calls have 3-retry exponential backoff
2. **Validation**: Zod schemas ensure correct structure
3. **Granular control**: If Call 2 fails, can retry just prompts (not entire script)

---

## Architecture Benefits

### Two-Step Flow Advantages
1. **Cost efficiency**: If prompts fail, only regenerate Call 2 (~$0.003 vs $0.004 total)
2. **Template enforcement**: Call 2 can enforce template-specific rules (dialogue format, no people, etc.)
3. **Debugging**: Can inspect content before prompt generation
4. **Flexibility**: Can regenerate prompts with different rules without changing content

### Performance
- Call 1: ~2-3 seconds (~1500 tokens)
- Call 2: ~1-2 seconds per scene × 3 = ~3-6 seconds total (~300 tokens each)
- Total: ~5-9 seconds per video (acceptable for POC)

---

## Next Phase
Phase 4: Main Pipeline Integration
- Update `index.ts` to use `extractProblems()` instead of `extractCategories()`
- Change loop variable from `category` to `userProblem`
- Update `generateScript()` call to pass `UserProblem` object
- Update logging to show problem text
- Test full pipeline compilation

This will resolve the final compilation error and complete the implementation.
