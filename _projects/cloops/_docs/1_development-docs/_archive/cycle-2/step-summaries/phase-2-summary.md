# Phase 2: Template Updates - Summary

**Date**: October 16, 2025
**Status**: ✅ Complete

---

## Changes Made

### 1. `src/config/templates.ts`

#### Updated directToCameraTemplate (lines 8-96)
Replaced `systemPrompt` with three new fields:

**systemPromptCall1** (lines 14-45):
- For content generation (Call 1)
- Instructs LLM to generate `overallScript` in prose format
- Generates `scenes[].content` with DOP-style instructions including:
  - Visual description
  - Dialogue (in quotes)
  - Body language and expression
  - Camera details

**systemPromptCall2** (lines 47-65):
- For prompt optimization (Call 2)
- Extracts dialogue from scene description
- Formats using Veo 3 dialogue syntax: `person saying "exact dialogue"`
- Emphasizes active speaking with mouth moving
- Includes example input/output

**promptRules** (lines 67-77):
- Description of template requirements
- 5 instruction steps
- Veo 3 format specification: `person saying "exact dialogue"`

#### Updated textVisualsTemplate (lines 98-182)
Replaced `systemPrompt` with three new fields:

**systemPromptCall1** (lines 104-132):
- For content generation (Call 1)
- Generates `overallScript` in prose format
- Generates `scenes[].content` with:
  - Text to display (max 2 sentences)
  - Visual description (NO people)
  - Lighting and atmosphere

**systemPromptCall2** (lines 134-152):
- For prompt optimization (Call 2)
- Focuses on VISUAL ONLY (text handled by platform)
- NO people or faces
- Describes natural, calming environments
- Includes example input/output

**promptRules** (lines 154-163):
- Description: no people, calming environments
- 5 instruction steps
- No veo3Format (not needed for text-visuals)

---

## Test Results

### Compilation Test
```bash
npm run build
```

**Result**: ⚠️ 1 remaining error (expected)

**Errors**:
1. ~~`src/config/templates.ts(14,3)`: Property 'systemPrompt' does not exist~~ ✅ **FIXED**
2. ~~`src/config/templates.ts(57,3)`: Property 'systemPrompt' does not exist~~ ✅ **FIXED**
3. `src/lib/script-generator.ts(104,37)`: Property 'systemPrompt' does not exist ⏸️ **Will be fixed in Phase 3**

**Status**: ✅ **Success** - Template errors resolved, only script-generator remains

---

## Files Modified
- ✅ `src/config/templates.ts` - Updated both templates with new structure

---

## Key Improvements

### Template Quality
1. **Better prompting**: Call 1 and Call 2 have focused, specific instructions
2. **Prose requirement**: `overallScript` must be professional prose (no arrows, shorthand)
3. **Veo 3 integration**: Call 2 explicitly formats dialogue for Veo 3
4. **Examples included**: Both Call 2 prompts include input/output examples
5. **Template rules**: Codified requirements for each template type

### Direct-to-Camera
- Dialogue extraction and formatting
- Active speaking emphasis
- Veo 3 dialogue syntax

### Text-Visuals
- Visual-only focus (text separate)
- NO people enforcement
- Calming environment emphasis

---

## Next Phase
Phase 3: Script Generator Refactor
- Update `generateScript()` to use two-step flow
- Add `generateContent()` method (Call 1)
- Add `generatePrompts()` method (Call 2)
- Update `buildVideoScript()` signature
- Remove old methods: `callOpenAI()`, `generateOverallScript()`

This will resolve the final compilation error.
