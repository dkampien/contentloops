# Cycle 4: Exploration

**Date**: October 24, 2025
**Status**: Complete - Ready for requirements phase

---

## Overview

Cycle 4 focuses on implementing the redesigned template framework (documented in `template-design-full.md`) and completing the POC with Veo 3.1 capabilities. This cycle brings the codebase in line with the validated design decisions from October 2025 testing.

**Key goals:**
- Implement all problems extraction (not just one per category)
- Update to gpt-5-mini model
- Implement Veo 3.1 frame chaining (simplified approach)
- Update manifest structure to flexible design
- Update d2c template with tested system prompts
- Simplify dry-run outputs

**Approach:** POC completion using Veo audio (external TTS/lipsync deferred to production)

---

## Discussion Items

### Item 1: Problem Per Category - Extract All Problems

**Current behavior:**
- `data-processor.ts` uses `.find()` to extract ONE problem per category
- Example: 20 "Anxiety or fear" problems in CSV → only 1 used
- Result: 5 categories × 2 templates = 10 videos total

**Desired behavior:**
- Extract ALL problems from CSV using `.filter()`
- Example: 100 problems in CSV → all used
- Result: 100 problems × 2 templates = 200 videos

**Control mechanism:**
- `--limit N` flag controls total videos generated (absolute cap)
- Distribution: limit applies to problems, then multiplied by templates
- Example: `--limit 10 --templates d2c,text-visuals` = 10 problems × 2 templates = 20 videos

**Decision logic:**
```
1. Extract all problems per category (change .find() → .filter())
2. Problems naturally grouped by category (existing loop structure)
3. Apply --limit to cap problem count
4. Generate videos: problems × templates
```

**Impact:**
- File: `src/lib/data-processor.ts` (lines 95-119)
- Change: `.find()` → `.filter()` to get all matching problems
- Main loop structure unchanged (already handles variable-length problem arrays)

**Related:**
- `--limit` flag already exists (index.ts line 109-112)
- No changes needed to main pipeline flow

---

### Item 2: Edge Case - Empty userProblem Field

**Current behavior:**
- When CSV row has category but empty `onboardingV7_lifeChallenge` field
- Fallback generates: `"Struggling with ${category.toLowerCase()}"`
- Example: `"Struggling with health or healing"`
- Logs warning and continues with generated fallback

**Analysis:**
- Fallback already implemented (data-processor.ts lines 112-118)
- LLM receives fallback as normal userProblem
- May produce more generic content (acceptable)

**Considerations discussed:**
- Alternative phrasings considered (more conversational, just category, etc.)
- Current fallback is functional and clear
- LLM can work with generic problems

**Decision:**
- Keep current fallback implementation as-is
- Document this edge case behavior
- Consider testing: Does LLM produce acceptable content with generic problems?

**Impact:**
- No code changes needed
- Document in requirements/implementation notes
- Optional: Test generic problem quality during validation

---

### Item 3: Update to gpt-5-mini

**Current model:**
- Need to verify current model in config

**Target model:**
- `gpt-5-mini` (new release, beyond assistant's knowledge cutoff)

**Action needed:**
- Fetch external documentation for gpt-5-mini during requirements phase
- Check for:
  - API endpoint changes
  - New parameters or capabilities
  - Pricing updates
  - Performance characteristics
  - Breaking changes from previous models

**Decision:**
- Update model string in configuration
- Verify compatibility with existing prompts
- Test script generation with new model

**Impact:**
- File: Config files (likely `config.json` or `src/config/config.ts`)
- Possible: API client updates if interface changed
- Testing: Validate prompt outputs with new model

**Note:** External docs research required before implementation

---

### Item 4: Veo 3.1 + Frame Chaining (Simplified)

**Overview:**
Implement AI Video Gen Subworkflow from `workflow-problems-and-solutions-2.md` with simplified approach (no neutral pose, no `last_frame` parameter).

#### 4a. Update to Veo 3.1 Model

**Current:**
- Model: `google-deepmind/veo-3` (or need to verify)

**Target:**
- Model: `google-deepmind/veo-3.1`
- New capabilities: `image` and `last_frame` parameters

**Decision:**
- Update model string to `veo-3.1`
- Add support for `image` parameter (use it)
- Skip `last_frame` parameter (document for future)

**Impact:**
- File: `src/lib/video-generator.ts`
- Update model reference
- Add `image` parameter to API calls (when scene > 1)

#### 4b. Frame Extraction (Last Frames Only)

**Purpose:**
Extract last frame from each generated scene to use as starting point for next scene (character consistency).

**Implementation:**
- After Scene 1 generates: Extract last frame (frame 191 of 192 for 8s @ 24fps)
- After Scene 2 generates: Extract last frame
- Use ffmpeg: `ffmpeg -i scene.mp4 -vf "select='eq(n,191)'" -frames:v 1 last_frame.jpg`

**What we're NOT doing:**
- ❌ First frame extraction (neutral pose)
- ❌ Using `last_frame` parameter
- ❌ Scene 1 regeneration

**Reasoning:**
- Simplified POC approach
- Character consistency via `image` parameter is core feature
- Neutral pose control is enhancement (defer to future cycle)

**Impact:**
- File: `src/lib/video-generator.ts`
- Add frame extraction logic after each scene generation
- Store frame paths for subsequent scenes
- Requires ffmpeg (assume already available)

#### 4c. Frame Chaining with `image` Parameter

**Strategy:**
- Scene 1: Generate without `image` parameter (fresh start)
- Scene 2: Use Scene 1's last frame as `image` parameter
- Scene 3: Use Scene 2's last frame as `image` parameter

**API structure:**
```
Scene 1: { prompt, duration, aspect_ratio, generate_audio, negative_prompt }
Scene 2: { prompt, image: scene1_last_frame.jpg, duration, ... }
Scene 3: { prompt, image: scene2_last_frame.jpg, duration, ... }
```

**Expected result:**
- Visual continuity between scenes (same character, setting, lighting)
- Validated in testing (workflow doc Test 1, Test 7)

**Impact:**
- File: `src/lib/video-generator.ts` - Update generateVideoClip signature to accept previousFramePath parameter; add image parameter when provided
- File: `src/index.ts` - Update scene loop to pass frames between scenes
- Conditional logic: if (sceneNumber > 1 && previousFramePath) add image parameter
- File path management for extracted frames

#### 4d. Video Combining (ffmpeg Concatenation)

**Purpose:**
Combine 3 scene clips into single 24-second video.

**Implementation:**
1. Create temporary concat list file:
   ```
   file 'scene1.mp4'
   file 'scene2.mp4'
   file 'scene3.mp4'
   ```
2. Run ffmpeg concat: `ffmpeg -f concat -safe 0 -i concat.txt -c copy combined_silent.mp4`
3. Output: `combined_silent.mp4` (24 seconds)

**Note on naming:**
- Named "silent" in workflow doc because production approach adds external audio later
- For POC (Veo audio), this is actually the final video (has audio)
- Consider renaming to `combined_video.mp4` or `final_video.mp4`

**Impact:**
- File: `src/lib/video-generator.ts` - Add combineScenes() method
- File: `src/index.ts` - Call combineScenes() after all scenes complete
- File: `src/lib/state-manager.ts` - Add updateVideoFinalPath() method
- File: `src/types/state.types.ts` - Add finalVideoPath field to VideoState
- Create concat file programmatically
- Execute ffmpeg command
- Return path to combined video

#### 4e. Update Prediction Types

**Purpose:**
Add TypeScript types for new Veo 3.1 parameters.

**Changes needed:**
- Add `image?: string` to prediction input type
- Add `last_frame?: string` (optional, for future use)
- Update any validation logic

**Impact:**
- File: `src/types/prediction.types.ts`
- Update interface definitions
- Ensure type safety for new parameters

**References:**
- Veo 3.1 schema: `_docs/2_reference-docs/veo3.1-schema.json`

#### Summary of Item 4

**In scope:**
- ✅ Update to veo-3.1 model
- ✅ Frame extraction (last frames)
- ✅ Frame chaining with `image` parameter
- ✅ Video combining via ffmpeg
- ✅ Update prediction types

**Out of scope (documented for future):**
- ❌ First frame extraction (neutral pose)
- ❌ `last_frame` parameter usage
- ❌ Scene 1 regeneration with neutral pose

**Files impacted:**
- `src/lib/video-generator.ts` (primary changes - extractLastFrame, combineScenes methods, generateVideoClip signature update)
- `src/index.ts` (scene loop integration - frame passing, combining call, manifest creation)
- `src/lib/state-manager.ts` (add finalVideoPath tracking)
- `src/types/state.types.ts` (add finalVideoPath field)
- `src/types/prediction.types.ts` (type updates for Veo 3.1)

---

### Item 5: Dry-Run Output Simplification

**Current structure:**
```json
{
  "videoId": "...",
  "scenes": [
    {
      "content": "...",
      "prompt": "...",
      "veoParams": {
        "prompt": "...",      // duplicates scene.prompt
        "duration": 8,        // repeated 3 times
        "aspect_ratio": "9:16"
      }
    }
  ]
}
```

**Problems:**
- Redundant `prompt` field (scene level + veoParams)
- Config params repeated for each scene
- User doesn't need params (already knows them)

**Desired structure:**
```json
{
  "videoId": "...",
  "userProblem": "...",
  "category": "...",
  "template": "...",
  "scenes": [
    { "sceneNumber": 1, "prompt": "..." },
    { "sceneNumber": 2, "prompt": "..." },
    { "sceneNumber": 3, "prompt": "..." }
  ]
}
```

**Key insight:**
Dry-run should match the final manifest structure (minus video output paths). This ensures consistency and preview accuracy.

**Decision:**
- Remove `veoParams` entirely
- Remove `content` field (deprecated in new design)
- Keep metadata and scene prompts only
- Structure matches manifest (see Item 6-7)

**Impact:**
- File: `src/lib/dry-run-assembler.ts`
- Simplify output structure
- Remove redundant fields
- Align with manifest schema

**Dependency:**
- Tied to Item 6-7 (manifest design)
- Implement after manifest schema is finalized

---

### Items 6-7: Schema & Manifest Updates

**Context:**
Template redesign (documented in `template-design-full.md`) eliminates redundancy and clarifies content generation.

#### Key Design Changes

**OLD approach:**
- `overallScript`: Meta-description of video concept
- `scenes[].content`: Scene descriptions with dialogue
- `scenes[].prompt`: Veo-optimized version of content
- Result: 3-4 fields describing same thing differently

**NEW approach:**
- `videoScript`: Scene 1 visual baseline (functional, not meta)
- `voiceScript`: Full dialogue separate from visuals
- `scenes[].prompt`: Only field needed (no intermediate descriptions)
- Result: 2 functional fields

**Why the change:**
- Eliminates redundancy
- Separates creative (what to say) from technical (how to prompt Veo)
- Aligns with frame chaining (Scene 1 full, 2-3 minimal)
- Makes content generation clearer

#### Manifest Design: Flexible Core + Template-Specific Content

**Discussion outcome:**
Manifest structure must support multiple templates with different content needs.

**Problem:**
- d2c template generates: `videoScript`, `voiceScript`
- text-visuals template might generate: `headlines[]`, `bodyText`
- Future templates: unknown fields

**Solution: Flexible content model**

**Universal Core (all templates):**
```typescript
{
  videoId: string,
  problemCategory: string,        // renamed from "category"
  contentTemplate: string,        // renamed from "template"
  timestamp: string,
  userProblem: string,
  scenes: Scene[],                // always present (Veo requirement)
  finalVideoPath: string
}
```

**Template-specific content (nested object):**
```typescript
{
  content: {
    // d2c template
    videoScript: string,
    voiceScript: string

    // text-visuals template (different fields)
    headlines: string[],
    bodyText: string

    // future templates: whatever they generate
  }
}
```

**Why `scenes[]` is universal:**
- All templates generate videos via Veo (scene-by-scene requirement)
- State manager tracks scene generation progress
- Resume logic needs uniform scene structure

**Why `content` is flexible:**
- Each template defines its own fields
- Templates document what goes in `content`
- No mixing: d2c manifest only has d2c content fields

**Template defines manifest:**
When designing a template, the template's CALL 1 output defines what goes in `content`. The manifest structure follows from template design.

#### Field Renames

**Metadata fields:**
- `category` → `problemCategory` (clearer, avoids confusion)
- `template` → `contentTemplate` (explicit about what it is)
- `id` → `videoId` (consistent with problemCategory, contentTemplate pattern)

**Content fields (d2c template):**
- `overallScript` → `videoScript` (repurposed as Scene 1 baseline)
- Add: `voiceScript` (new field for full dialogue)
- Remove: `scenes[].content` (eliminated entirely)
- Keep: `scenes[].prompt` (only prompt needed)

#### TypeScript Type Updates

**Files to update:**
- `src/types/script.types.ts` - Core VideoScript interface
- `src/types/output.types.ts` - Manifest output structure
- `src/config/templates.ts` - Template definitions

**Changes needed:**
```typescript
// script.types.ts
interface VideoScript {
  id: string;              // becomes videoId in manifest
  category: string;        // becomes problemCategory in manifest
  template: string;        // becomes contentTemplate in manifest

  // d2c template content
  videoScript: string;     // renamed from overallScript
  voiceScript: string;     // NEW FIELD

  scenes: Scene[];
}

interface Scene {
  sceneNumber: number;
  prompt: string;
  // "content" field removed
  // "description" field removed
}
```

```typescript
// output.types.ts (manifest structure)
interface Manifest {
  // Universal core
  videoId: string;
  problemCategory: string;
  contentTemplate: string;
  timestamp: string;
  userProblem: string;

  // Template-specific (flexible)
  content: Record<string, any>;  // or template-specific types

  // Universal (Veo requirement)
  scenes: Scene[];

  // Output
  finalVideoPath: string;
}

// d2c specific
interface D2CManifestContent {
  videoScript: string;
  voiceScript: string;
}
```

#### Impact Summary

**Files to update:**
- `src/types/script.types.ts` - Interface updates
- `src/types/output.types.ts` - Manifest structure (create if doesn't exist)
- `src/types/state.types.ts` - Add finalVideoPath to VideoState
- `src/lib/script-generator.ts` - Generate new fields
- `src/lib/manifest-creator.ts` - NEW FILE for per-video manifest creation
- `src/index.ts` - Call manifest creator after video combining
- `src/lib/output-assembler.ts` - Unchanged (runs at pipeline END for aggregate output)
- `src/lib/dry-run-assembler.ts` - Align with manifest
- `src/lib/state-manager.ts` - Add updateVideoFinalPath() method

**Dependencies:**
- Item 9 (system prompts) must align with schema changes
- Item 5 (dry-run) depends on manifest design
- Item 4d (video combining) must complete before manifest creation

---

### Item 8: generate_audio Setting (POC Approach)

**Context:**
Workflow doc documents POC vs Production approaches (lines 83-100).

**POC Decision (October 23, 2025):**
- Use Veo audio: `generate_audio: true`
- Add `negative_prompt: "background music"`
- Accept voice changes between scenes (acceptable for POC)
- Reasoning: Simpler, faster iteration, proves concept

**Production Approach (Deferred):**
- External TTS: `generate_audio: false`
- Guarantees consistent voice across scenes
- Requires lipsync integration
- Better audio quality control

**Cycle 4 Decision:**
- ✅ Keep `generate_audio: true` for POC
- ✅ Add `negative_prompt: "background music"` parameter
- 📋 External TTS + lipsync deferred to production (future cycle)

**Impact:**
- File: `src/lib/video-generator.ts`
- Add `negative_prompt` to Veo API calls
- Verify `generate_audio` config setting
- Document POC vs production approach

**Related:** Item 11 (TTS/Lipsync) - deferred as package with this

---

### Item 9: Include Dialogue in Prompts (System Prompt Updates)

**Context:**
Workflow doc Test 5 and Decision 3.1 validated that including dialogue in prompts generates natural mouth movement even with `generate_audio: false`.

**Current state:**
- System prompts in `src/config/templates.ts` are outdated
- Don't match new template design (videoScript + voiceScript)
- Reference Veo 3, not 3.1
- Don't implement simplified prompt strategy

**Tested prompts location:**
- Documented in `_docs/1_development-docs/temp-implementation.md` (lines 28-83)
- Already validated in OpenAI Playground
- Include dialogue in prompts via `dialogue_instruction` variable

**Decision:**
- Update d2c template system prompts using tested versions from temp-implementation.md
- CALL 1: Generate `videoScript` + `voiceScript` (not overallScript + content)
- CALL 2: Implement Scene 1 full / Scenes 2-3 minimal strategy
- Include dialogue in all scene prompts (already in tested prompts)

**Prompt variables (for now):**
- `variety_instruction`: Hardcode for POC
- `dialogue_instruction`: Hardcode to "include dialogue"
- Future: Make these configurable

**Impact:**
- File: `src/config/templates.ts`
- Replace `systemPromptCall1` with tested version
- Replace `systemPromptCall2` with tested version
- Update `promptRules` if needed
- Align with Veo 3.1 guidelines

**Dependency:**
- Must align with Item 6-7 (schema changes)
- Script generator must output new fields

---

### Item 10: Dynamic Scene Count

**Discussion:**
- Workflow doc mentions as future enhancement (Idea 6.3, lines 984-1001)
- Would calculate scene count based on dialogue length
- Adds complexity to script generation

**Current approach:**
- Fixed 3 scenes × 8 seconds = 24 seconds
- Fits 15-20 second dialogue comfortably
- Simple, predictable

**Decision:**
- ❌ Defer to future cycle
- Keep fixed 3 scenes for POC
- Document as potential enhancement

**Reasoning:**
- Not needed for POC validation
- Current approach works for target duration
- Adds unnecessary complexity at this stage

---

### Item 11: TTS & Lipsync Integration

**Context:**
- Workflow doc Tasks 5.11-5.12 (lines 874-897)
- Part of production approach, not POC

**Components:**
1. External TTS generation (voiceScript → voiceAudio.mp3)
2. Lipsync model (combined_silent.mp4 + voiceAudio.mp3 → videoFinal.mp4)

**Relationship to Item 8:**
- POC uses Veo audio → No external TTS needed → No lipsync needed
- Production uses external TTS → Requires lipsync
- They're a package deal

**Decision:**
- ❌ Defer both TTS and lipsync to future cycle (production implementation)
- POC proves concept with Veo audio
- Document as production enhancement

**Future implementation would require:**
- TTS provider selection (ElevenLabs, OpenAI TTS, etc.)
- Lipsync model selection (Wav2Lip, SadTalker, etc.)
- Integration of 2 additional pipeline steps
- Cost/time analysis

---

## Key Decisions Summary

### Architectural Decisions
1. **Manifest Design**: Flexible core + template-specific `content` object
   - Universal: metadata + scenes + output paths
   - Flexible: content nested object with template-specific fields
   - Reasoning: Supports multiple templates with different content needs

2. **Schema Simplification**: Eliminate redundancy
   - Remove `overallScript`, replace with functional `videoScript`
   - Remove `scenes[].content` and `scenes[].description`
   - Add `voiceScript` for full dialogue
   - Keep only `scenes[].prompt` (what Veo needs)

3. **Template-Driven Design**: Template defines manifest
   - CALL 1 output determines content structure
   - Each template documents its content fields
   - Manifest follows from template design

### POC vs Production Approach
1. **Audio Strategy**: Veo audio for POC
   - `generate_audio: true` with `negative_prompt: "background music"`
   - Voice changes acceptable for POC
   - External TTS + lipsync deferred to production

2. **Frame Chaining**: Simplified implementation
   - Use `image` parameter for character consistency
   - Skip `last_frame` parameter (neutral pose control)
   - Document deferred features for future

3. **Scope Focus**: Core features only
   - Fixed 3 scenes (no dynamic scene count)
   - All problems extraction with limit control
   - Tested system prompts from temp-implementation.md

### Technical Decisions
1. **Model Updates**:
   - gpt-5-mini (needs external docs)
   - Veo 3.1 (frame chaining capability)

2. **Problem Extraction**: All problems, not one per category
   - Change `.find()` → `.filter()`
   - Control via `--limit` flag (absolute video count)

3. **Dry-Run Alignment**: Match manifest structure
   - Remove redundant fields
   - Simplify to metadata + prompts only

---

## Scope for Cycle 4

### In Scope (Implementation)

**Data & Input:**
- [x] Extract all problems per category (not just first)
- [x] Document empty userProblem fallback behavior

**Model Updates:**
- [x] Update to gpt-5-mini (fetch external docs first)
- [x] Update to Veo 3.1 model

**Schema & Types:**
- [x] Update VideoScript interface (videoScript, voiceScript fields)
- [x] Rename fields (category → problemCategory, template → contentTemplate)
- [x] Remove deprecated fields (overallScript, scenes.content, scenes.description)
- [x] Define flexible manifest structure
- [x] Update TypeScript types across codebase

**Template Updates:**
- [x] Update d2c system prompts (use tested versions from temp-implementation.md)
- [x] CALL 1: Generate videoScript + voiceScript
- [x] CALL 2: Scene 1 full, Scenes 2-3 minimal strategy
- [x] Include dialogue in prompts

**Video Generation (Veo 3.1):**
- [x] Frame extraction (last frames only, using ffmpeg)
- [x] Frame chaining (image parameter for scenes 2-3)
- [x] Video combining (ffmpeg concatenation)
- [x] Add negative_prompt parameter ("background music")
- [x] Update prediction types (add image parameter)

**Output:**
- [x] Update dry-run output structure
- [x] Update manifest output structure
- [x] Align dry-run with manifest design

### Out of Scope (Deferred)

**Production Features:**
- [ ] External TTS integration (voiceScript → audio file)
- [ ] Lipsync model integration (video + audio sync)
- [ ] `generate_audio: false` approach

**Enhancements:**
- [ ] Neutral pose implementation (first frame extraction)
- [ ] `last_frame` parameter usage
- [ ] Scene 1 regeneration with neutral pose
- [ ] Dynamic scene count based on dialogue length
- [ ] Configurable template variables (variety_instruction, dialogue_instruction)

**Future Considerations:**
- [ ] Additional template development (text-visuals updates, new templates)
- [ ] Parallel video generation (currently sequential)
- [ ] Advanced cost optimization

---

## Dependencies & Order

### Critical Path:
1. **Schema updates first** (Items 6-7)
   - Everything else depends on schema being correct
   - Types must match template design

2. **System prompts second** (Item 9)
   - Must generate fields matching new schema
   - Tested prompts ready to use

3. **Script generator third**
   - Update Zod schemas for validation
   - Generate new fields (videoScript, voiceScript)

4. **Video generation fourth** (Item 4)
   - Frame chaining implementation
   - Veo 3.1 API updates

5. **Output assemblers last** (Item 5)
   - Dry-run and manifest
   - Match new schema structure

### Independent Tasks:
- Item 1 (all problems extraction) - can be done anytime
- Item 2 (empty problem documentation) - no code changes
- Item 3 (gpt-5-mini) - can be done early
- Item 8 (negative_prompt) - can be added to video generator anytime

---

## Questions for Requirements Phase

1. **gpt-5-mini Documentation**:
   - Need external API docs
   - Check for breaking changes
   - Verify pricing and capabilities

2. **Manifest Storage**:
   - Where do we save final manifest files?
   - Naming convention?
   - One manifest per video or combined?

3. **Frame Management**:
   - Where to store extracted frames?
   - Keep or delete after video generation?
   - Naming convention?

4. **Error Handling**:
   - What happens if frame extraction fails?
   - Retry logic for frame chaining?
   - Fallback behavior?

5. **Testing Strategy**:
   - Test with real 100+ problems or use limit?
   - Validate frame chaining quality manually?
   - Cost budget for testing?

---

## References

**Design Documents:**
- `_docs/2_reference-docs/template-design-full.md` - Template framework
- `_docs/2_reference-docs/workflow-problems-and-solutions-2.md` - Technical decisions and testing
- `_docs/1_development-docs/temp-implementation.md` - Tested system prompts

**External References:**
- `_docs/2_reference-docs/veo3.1-schema.json` - Veo 3.1 API schema
- gpt-5-mini documentation (to be fetched)

**Current Codebase:**
- `src/config/templates.ts` - Template definitions
- `src/lib/script-generator.ts` - LLM call logic
- `src/lib/video-generator.ts` - Veo API integration
- `src/lib/data-processor.ts` - CSV and problem extraction
- `src/types/script.types.ts` - Type definitions

---

## Next Steps

1. Review and validate exploration findings
2. Create `1-requirements.md` with formal specifications
3. Craft `2-implementation-plan.md` with phased approach
4. Begin cycle 4 implementation

**Estimated effort:** 2-3 days implementation + 1 day testing
