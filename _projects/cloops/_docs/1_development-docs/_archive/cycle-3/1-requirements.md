# Cycle 3: Dry-Run Mode Implementation - Requirements

**Date**: October 20, 2025
**Status**: Planning Phase

---

## Context

After completing Cycle 2 (script structure redesign), we've identified two critical problems with the video generation pipeline:

1. **Dialogue Duration Mismatch**: Natural dialogue requires 15-30 seconds, but Veo 3.1 max duration is 8 seconds
2. **Character & Scene Consistency**: Multiple clips result in different people/settings across scenes

Before implementing solutions to these problems, we need a way to validate approaches without incurring Veo 3.1 costs (~$3-6 per video).

---

## Problems Identified

### Problem 1: Dialogue Duration Mismatch
**Issue**: Generated dialogue exceeds 8-second video clip duration
- Natural conversational dialogue: ~15-30 seconds
- Veo 3.1 hard limit: 4, 6, or 8 seconds per clip
- Result: Dialogue gets cut off mid-sentence

**Example**:
```
Generated: "I know the fear of losing someone you're falling for feels
            overwhelming, like standing on unstable ground"

Duration: ~10 seconds to speak naturally
Veo Limit: 8 seconds max
Result: ❌ Cut off mid-sentence
```

### Problem 2: Character & Scene Consistency
**Issue**: Each clip generated independently - different person/setting across scenes
- Scene 1: Person A in Living Room 1
- Scene 2: Person B in Living Room 2
- Scene 3: Person C in Different Room
- No scene-to-scene continuity

**Root Cause**: Each Veo 3 generation is independent with no reference to previous clips

### Interrelated Nature
These problems compound:
- Need 3 clips for narrative flow (due to 8s limit)
- But each clip break interrupts dialogue continuity
- And character changes between clips break immersion

---

## Approach Strategy

### Problem Prioritization
**Tackle Problem 2 first (Character Consistency)**

**Reasoning**:
- Higher risk - unknown if `last_frame` chaining maintains consistency
- Potential blocker - if it doesn't work, need different approach
- Easier to validate - can test manually with Veo API
- Problem 1 is lower risk - we KNOW dialogue can be broken into chunks

**Problems are independent**:
- Solving one doesn't solve the other
- Live in different pipeline parts:
  - Problem 1 = script-generator.ts (content generation)
  - Problem 2 = video-generator.ts (video generation)

**Sequential approach**:
1. Validate frame chaining works (Problem 2)
2. If successful → tackle dialogue breaking (Problem 1)
3. If fails → need completely different approach

---

## Proposed Solution: Dry-Run Mode

### Objective
Enable manual validation of Veo 3.1 approaches without incurring video generation costs.

### What It Does
Run the pipeline until the point of calling Replicate API, then output prompts and parameters for manual testing.

### Benefits
1. **Real prompts, not synthetic** - Get exactly what the pipeline generates
2. **Cheap validation** - OpenAI calls (~$0.004) vs Veo calls (~$3-6)
3. **Iterative testing** - Tweak prompt generation, re-run, test on Replicate UI
4. **Complete pipeline test** - Validates CSV → DataProcessor → ScriptGenerator
5. **Manual parameter experimentation** - Test different Veo params on same prompt

---

## Requirements

### Functional Requirements

#### FR1: CLI Flag Support
- Add `--dry-run` flag to generate command
- Combine with existing `--limit` flag
- Example: `npm start generate --dry-run --limit=1`

#### FR2: Pipeline Execution
**Must execute:**
- CSV data processing
- Script generation (CALL 1 and CALL 2)
- Script JSON output to `output/scripts/`

**Must NOT execute:**
- Video generation (`VideoGenerator.generateVideoClip()`)
- State management (no state.json creation/updates)

#### FR3: Console Output
Display clear dry-run information:
```bash
⚠️  DRY RUN MODE - No videos will be generated

=== Video: anxiety-or-fear × direct-to-camera ===
Problem: "Being scared that the guy I'm falling for is going to leave me"

=== Scene 1 ===
Prompt: "Close-up of warm empathetic person in their 30s..."
Veo Parameters:
  duration: 8
  aspect_ratio: "9:16"
  generate_audio: true

=== Scene 2 ===
...
```

#### FR4: File Output
Create dry-run specific output files:

**Directory structure:**
```
output/
├── dry-run/
│   ├── anxiety-or-fear_direct-to-camera.json
│   ├── anxiety-or-fear_text-visuals.json
│   └── stress-or-burnout_direct-to-camera.json
├── scripts/
│   └── (normal script JSONs still generated)
└── videos/
    └── (empty in dry-run mode)
```

**File format (one file per video):**
```json
{
  "videoId": "anxiety-or-fear_direct-to-camera",
  "userProblem": "Being scared that the guy I'm falling for is going to leave me",
  "category": "Anxiety or fear",
  "template": "direct-to-camera",
  "scenes": [
    {
      "sceneNumber": 1,
      "content": "Person in 30s, warm living room...",
      "prompt": "Close-up of warm empathetic person...",
      "veoParams": {
        "prompt": "Close-up of warm empathetic person...",
        "duration": 8,
        "aspect_ratio": "9:16",
        "generate_audio": true
      }
    },
    {
      "sceneNumber": 2,
      "content": "...",
      "prompt": "...",
      "veoParams": { ... }
    },
    {
      "sceneNumber": 3,
      "content": "...",
      "prompt": "...",
      "veoParams": { ... }
    }
  ]
}
```

### Non-Functional Requirements

#### NFR1: Safety
- Must not accidentally trigger video generation
- Clear visual warnings in console
- Separate output directory prevents confusion

#### NFR2: Usability
- Easy to copy/paste prompts to Replicate UI
- JSON format for programmatic access if needed
- Console output for quick review

#### NFR3: Compatibility
- Works with existing `--limit` flag
- Does not interfere with normal pipeline operation
- Does not modify existing output structures

---

## Design Decisions

### Decision 1: Stop Point
**Chosen**: Stop right before `videoGenerator.generateVideoClip()`

**Alternatives considered**:
- Stop before Replicate API call but run rest of logic ❌ (unnecessary complexity)

### Decision 2: Output Format
**Chosen**: Both console and file output

**Rationale**:
- Console: Quick review, immediate feedback
- File: Manual testing, reproducibility

### Decision 3: File Structure
**Chosen**: Separate `dry-run/` directory, one file per video

**Alternatives considered**:
- Single file with all videos ❌ (harder to copy individual prompts)
- Timestamped files ❌ (harder to find specific videos)

### Decision 4: State Management
**Chosen**: Skip state.json entirely in dry-run mode

**Rationale**:
- Dry-run is for testing, not production
- State tracking adds no value
- Prevents pollution of actual pipeline state

### Decision 5: Script Generation
**Chosen**: Still generate and save script JSONs to `output/scripts/`

**Rationale**:
- Scripts are cheap (OpenAI ~$0.004)
- Useful for debugging
- Shows complete pipeline up to video generation

---

## Scope

### In Scope
- CLI flag implementation (`--dry-run`)
- Console output formatting
- Dry-run file generation
- Integration with existing `--limit` flag
- Documentation updates

### Out of Scope
- Solving Problem 1 (Dialogue Duration) - Future cycle
- Solving Problem 2 (Character Consistency) - Future cycle
- Modifying script generation logic
- Modifying video generation logic
- Automated Veo API testing

---

## Success Criteria

### Implementation Success
- [ ] `--dry-run` flag works with generate command
- [ ] Pipeline stops before video generation
- [ ] Console output displays prompts and parameters clearly
- [ ] Dry-run files created in `output/dry-run/`
- [ ] One file per video with correct format
- [ ] Works with `--limit` flag
- [ ] No state.json created/modified
- [ ] Normal scripts still saved to `output/scripts/`

### Validation Success
- [ ] User can copy prompt from dry-run output
- [ ] User can paste into Replicate UI successfully
- [ ] User can test different Veo parameters manually
- [ ] User can test frame chaining approach
- [ ] Cost to generate test data: ~$0.004 (not ~$3-6)

---

## Use Cases

### Use Case 1: Test Current Prompts
```bash
npm start generate --dry-run --limit=1
# Review output/dry-run/anxiety-or-fear_direct-to-camera.json
# Copy Scene 1 prompt to Replicate UI
# Test video generation manually
```

### Use Case 2: Test Frame Chaining
```bash
npm start generate --dry-run --limit=1
# Generate Scene 1 on Replicate
# Download last frame
# Use Scene 2 prompt + last frame on Replicate
# Evaluate character consistency
```

### Use Case 3: Iterate on Prompts
```bash
# Modify templates.ts systemPromptCall2
npm start generate --dry-run --limit=1
# Review new prompts
# Test on Replicate
# Repeat until satisfied
```

---

## Constraints

### Hard Constraints
- Must not break existing pipeline functionality
- Must not generate videos in dry-run mode
- Must work with current codebase structure

### Soft Constraints
- Minimize code changes
- Reuse existing logic where possible
- Keep implementation simple

---

## Risks

### Risk 1: Accidental Video Generation
**Mitigation**:
- Clear console warnings
- Add guard conditions
- Test thoroughly before use

### Risk 2: Output Format Changes
**Mitigation**:
- Keep dry-run format separate from production
- Document format clearly
- Version control

### Risk 3: Incomplete Testing
**Mitigation**:
- Dry-run provides exact pipeline prompts
- User validates manually on Replicate
- Cheap iteration

---

## Dependencies

### Technical Dependencies
- Existing pipeline (index.ts, script-generator.ts)
- Commander.js (CLI parsing)
- Config system
- File system operations

### External Dependencies
- OpenAI API (script generation)
- Replicate UI (manual testing)

---

## Next Steps

1. Create implementation plan (2-implementation-plan.md)
2. Implement dry-run mode
3. Test dry-run functionality
4. Use dry-run to validate frame chaining approach
5. Based on validation results, plan Problem 2 solution

---

## Related Documents

- **Cycle 2 Implementation**: `_docs/1_development-docs/cycle-2/IMPLEMENTATION-COMPLETE.md`
- **Workflow Problems**: `_docs/2_reference-docs/workflow-problems-and-solutions.md`
- **Veo 3.1 Schema**: `_docs/2_reference-docs/veo3.1-schema.json`
- **Current Templates**: `src/config/templates.ts`

---

## Estimated Costs

### Development
- Planning: ~1 hour
- Implementation: ~2-3 hours
- Testing: ~1 hour
- Total: ~4-5 hours

### Usage
- Per dry-run: ~$0.004 (OpenAI only)
- Manual Veo testing: ~$1-2 per test video
- Total validation budget: ~$10-20
