# Cycle 4: Requirements

**Date**: October 24, 2025
**Status**: Draft
**Based on**: `0-exploration.md`

---

## Formal Specifications

### 1. Schema Definitions

#### VideoScript Interface (Updated)
```typescript
// src/types/script.types.ts

interface VideoScript {
  id: string;
  category: string;
  template: string;
  timestamp: string;

  // d2c template content
  videoScript: string;     // min 50 chars - Scene 1 visual baseline
  voiceScript: string;     // 40-100 chars - Full dialogue for all scenes

  scenes: Scene[];
}

interface Scene {
  sceneNumber: number;     // 1-3
  prompt: string;          // min 10 chars - Veo-optimized prompt
  // REMOVED: content, description fields
}
```

#### Manifest Structure
```typescript
// src/types/output.types.ts

interface Manifest {
  // Universal metadata
  videoId: string;              // format: {category}_{template}_{timestamp}
  problemCategory: string;      // renamed from "category"
  contentTemplate: string;      // renamed from "template"
  timestamp: string;            // ISO 8601
  userProblem: string;

  // Template-specific content (nested)
  content: D2CManifestContent;  // or Record<string, any> for flexibility

  // Universal scenes
  scenes: ManifestScene[];

  // Output paths
  finalVideoPath: string;       // path to combined video
}

interface D2CManifestContent {
  videoScript: string;
  voiceScript: string;
}

interface ManifestScene {
  sceneNumber: number;
  prompt: string;
}
```

#### Dry-Run Output (Aligned with Manifest)
```typescript
// src/lib/dry-run-assembler.ts

interface DryRunOutput {
  videoId: string;
  userProblem: string;
  category: string;           // Note: not renamed in dry-run for clarity
  template: string;           // Note: not renamed in dry-run for clarity

  scenes: Array<{
    sceneNumber: number;
    prompt: string;
  }>;

  // REMOVED: veoParams, content fields
}
```

#### Prediction Types (Veo 3.1)
```typescript
// src/types/prediction.types.ts

interface VeoInput {
  prompt: string;
  duration: number;              // 4 | 6 | 8
  aspect_ratio: string;          // "9:16" | "16:9"
  generate_audio: boolean;
  resolution?: string;           // "720p" | "1080p"
  negative_prompt?: string;      // NEW: "background music"
  image?: string;                // NEW: path or URL to starting frame
  last_frame?: string;           // NEW (optional): path or URL to ending frame
  seed?: number;
}
```

---

### 2. Output Folder Structure

```
output/
├── scripts/                              # Existing: Script generation outputs
│   └── {category}_{template}_{timestamp}.json
│
├── dry-run/                              # Existing: Dry-run outputs
│   └── {category}_{template}.json
│
├── manifests/                            # NEW: Final manifests
│   └── {category}_{template}_{timestamp}.json
│
└── videos/                               # NEW: Video outputs
    └── {category}_{template}_{timestamp}/
        ├── scenes/
        │   ├── scene1.mp4
        │   ├── scene2.mp4
        │   └── scene3.mp4
        ├── frames/
        │   ├── scene1_last.jpg
        │   └── scene2_last.jpg
        └── final.mp4
```

**Naming convention:**
- Format: `{problemCategory}_{contentTemplate}_{timestamp}`
- Example: `anxiety-or-fear_direct-to-camera_2025-10-24T15-30-00`
- Timestamp: ISO 8601, sanitized for filesystem (`:` → `-`)

**Path references in manifest:**
```json
{
  "finalVideoPath": "output/videos/anxiety-or-fear_direct-to-camera_2025-10-24T15-30-00/final.mp4"
}
```

---

### 3. Configuration Updates

#### config.json additions
```json
{
  "llm": {
    "provider": "openai",
    "model": "gpt-5-mini",              // UPDATED
    "temperature": 0.7
  },
  "videoGeneration": {
    "model": "google-deepmind/veo-3.1", // UPDATED
    "duration": 8,
    "aspectRatio": "9:16",
    "generateAudio": true,               // POC: true
    "resolution": "720p",
    "negativePrompt": "background music" // NEW
  },
  "paths": {
    "csvInput": "./data/bquxjob_696709f0_199c894db50.csv",
    "outputDir": "./output",
    "scriptsDir": "./output/scripts",
    "videosDir": "./output/videos",      // Already exists
    "manifestsDir": "./output/manifests", // NEW
    "stateFile": "./output/state.json",
    "finalOutput": "./output/final-output.json"
  }
}
```

---

### 4. System Prompt Specifications

#### Template: direct-to-camera

**systemPromptCall1:**
```
You are creating a comfort video. A person speaks directly to camera in a warm home setting.

Generate TWO fields:

1. videoScript - Describe Scene 1 visuals in simple terms:
   - The person (age, clothing, expression)
   - The setting (home basics)
   - Body language and mood
   Keep it natural and simple. No technical camera/lighting jargon.

2. voiceScript - 50-60 words of dialogue with this structure:
   - First ~20 words: Acknowledge their specific struggle
   - Next ~20 words: Reassure them they're not alone, it's okay to feel this way
   - Final ~20 words: Gently invite them to try BibleChat for support

Tone: Warm, conversational, empathetic. Speak directly to "you."
```

**Validation (Zod schema):**
```typescript
const Call1Schema = z.object({
  videoScript: z.string().min(50),
  voiceScript: z.string().min(40).max(100),
});
```

**systemPromptCall2:**
```
You are optimizing visual descriptions for Veo 3.1 video generation.

Input:
- videoScript (Scene 1 baseline description)
- voiceScript (50-60 words continuous dialogue)

Generate 3 scene prompts following this strategy:

Scene 1 - Full descriptive prompt:
- Use videoScript as foundation
- Simplify: Remove overly specific props (no "wedding photo" or "spreadsheet on laptop")
- Keep: Person, setting type, mood, expression, body language, lighting quality
- Add: "actively speaking to camera"
- Add first ~20 words from voiceScript in format 'saying: "[dialogue]"'
- Format for Veo: Natural language, 40-80 words

Scene 2 - Minimal continuation:
- Do NOT describe setting (image parameter handles this)
- Only: Expression/emotion shift from Scene 1
- Add middle ~20 words from voiceScript
- Format: "Person continues speaking with [expression change], saying: '[dialogue]'"
- 10-30 words maximum

Scene 3 - Minimal continuation:
- Same as Scene 2 rules
- Add final ~20 words from voiceScript
- Focus on final emotional shift

Remember: Scenes 2-3 use frame chaining - the image parameter provides visual context, so verbose descriptions cause conflicts.
```

**Validation (Zod schema):**
```typescript
const Call2Schema = z.object({
  scenes: z.array(z.object({
    sceneNumber: z.number().int().min(1).max(3),
    prompt: z.string().min(10)
  })).length(3)
});
```

---

### 5. Data Processing Requirements

#### Problem Extraction Logic
```typescript
// src/lib/data-processor.ts

async extractProblems(filterList?: string[] | "all"): Promise<UserProblem[]> {
  // For each category, find ALL problems (not just first)
  for (const category of filteredCategories) {
    const rows = allRows.filter(r =>  // CHANGED: .find() → .filter()
      r.lifeChallengeOption?.replace(/^"+|"+$/g, '').trim() === category &&
      r.onboardingV7_lifeChallenge?.trim()
    );

    // Add all matching problems
    for (const row of rows) {
      if (row.onboardingV7_lifeChallenge) {
        problems.push({
          category,
          problem: row.onboardingV7_lifeChallenge.trim()
        });
      }
    }

    // Fallback: if NO problems found for category
    if (rows.length === 0) {
      problems.push({
        category,
        problem: `Struggling with ${category.toLowerCase()}`
      });
    }
  }

  return problems;
}
```

**Edge case behavior:**
- Empty `onboardingV7_lifeChallenge`: Use fallback `"Struggling with {category}"`
- Log warning when fallback is used
- Continue processing (don't fail)

---

### 6. Video Generation Requirements

#### Frame Extraction Specifications

**Last frame extraction:**
- Tool: ffmpeg
- Command: `ffmpeg -i {scene}.mp4 -vf "select='eq(n,191)'" -frames:v 1 {output}.jpg`
- Frame: 191 of 192 (8 seconds @ 24fps, last frame)
- Format: JPEG
- Quality: Default (should match video frame quality)

**Frame storage:**
- Location: `output/videos/{videoId}/frames/scene{N}_last.jpg`
- Retention: Keep for debugging (don't auto-delete)
- Size: ~100-200KB per frame

#### Frame Chaining Logic

**Scene 1:**
```typescript
{
  prompt: scenes[0].prompt,
  duration: 8,
  aspect_ratio: "9:16",
  generate_audio: true,
  resolution: "720p",
  negative_prompt: "background music"
  // No image parameter
}
```

**Scene 2:**
```typescript
{
  prompt: scenes[1].prompt,
  image: "path/to/scene1_last.jpg",  // NEW
  duration: 8,
  aspect_ratio: "9:16",
  generate_audio: true,
  resolution: "720p",
  negative_prompt: "background music"
}
```

**Scene 3:**
```typescript
{
  prompt: scenes[2].prompt,
  image: "path/to/scene2_last.jpg",  // NEW
  duration: 8,
  aspect_ratio: "9:16",
  generate_audio: true,
  resolution: "720p",
  negative_prompt: "background music"
}
```

#### Video Combining Specifications

**Concatenation method:**
- Tool: ffmpeg concat demuxer
- Concat file format:
  ```
  file 'scenes/scene1.mp4'
  file 'scenes/scene2.mp4'
  file 'scenes/scene3.mp4'
  ```
- Command: `ffmpeg -f concat -safe 0 -i concat.txt -c copy final.mp4`
- Output: `output/videos/{videoId}/final.mp4`
- Duration: 24 seconds (3 × 8s)

**Concat file location:**
- Temporary: `output/videos/{videoId}/concat.txt`
- Can be retained for debugging or deleted after use

#### Integration with index.ts

**Scene loop changes:**
The main scene loop in `index.ts` (currently lines 187-234) orchestrates frame extraction and chaining.

```typescript
// index.ts main scene loop
let previousFramePath: string | undefined;

for (const scene of script.scenes) {
  // Pass frame to generator
  const result = await videoGenerator.generateVideoClip(
    scene,
    videoId,
    previousFramePath  // NEW PARAMETER
  );

  // Extract frame for next scene
  if (scene.sceneNumber < 3) {
    previousFramePath = await videoGenerator.extractLastFrame(
      result.videoPath,
      videoId,
      scene.sceneNumber
    );
  }

  // Update state (existing logic)
  stateManager.updateSceneStatus(...);
}

// After all scenes complete
const finalVideoPath = await videoGenerator.combineScenes(videoId);
stateManager.updateVideoFinalPath(state, videoId, finalVideoPath);

// Create manifest
await manifestCreator.create(script, userProblem, finalVideoPath);
```

**video-generator.ts interface:**
```typescript
// Updated signature
async generateVideoClip(
  scene: Scene,
  videoId: string,
  previousFramePath?: string
): Promise<{ videoPath: string; predictionId: string; predictTime?: number }>

// New methods
async extractLastFrame(
  videoPath: string,
  videoId: string,
  sceneNumber: number
): Promise<string>

async combineScenes(videoId: string): Promise<string>
```

**state-manager.ts additions:**
```typescript
// src/types/state.types.ts
interface VideoState {
  // ... existing fields
  finalVideoPath?: string;  // NEW
}

// src/lib/state-manager.ts
updateVideoFinalPath(
  state: PipelineState,
  videoId: string,
  finalVideoPath: string
): void
```

**manifest-creator.ts (new file):**
```typescript
// src/lib/manifest-creator.ts
export class ManifestCreator {
  async create(
    script: VideoScript,
    userProblem: UserProblem,
    finalVideoPath: string
  ): Promise<void> {
    const manifest: Manifest = {
      videoId: script.id,
      problemCategory: script.category,
      contentTemplate: script.template,
      timestamp: script.timestamp,
      userProblem: userProblem.problem,
      content: {
        videoScript: script.videoScript,
        voiceScript: script.voiceScript
      },
      scenes: script.scenes.map(s => ({
        sceneNumber: s.sceneNumber,
        prompt: s.prompt
      })),
      finalVideoPath
    };

    // Save to manifestsDir/{videoId}.json
  }
}
```

---

### 7. Error Handling

#### Frame Extraction Failures
- **Behavior**: Retry once
- **On retry failure**: Log error, continue to next scene without frame chaining
- **Logging**: Include videoId, sceneNumber, error message
- **Impact**: Scene will generate without `image` parameter (character may change)

#### Video Combining Failures
- **Behavior**: Retry once
- **On retry failure**: Log error, mark video as failed in state
- **Logging**: Include videoId, scene paths, error message
- **Impact**: Video marked incomplete, scenes remain in scenes/ folder

#### Empty Problem Fallback
- **Behavior**: Generate fallback problem text
- **Logging**: Warn level, include category
- **Impact**: LLM generates content based on generic problem

---

### 8. Acceptance Criteria

#### Schema Updates
- [ ] VideoScript interface updated with videoScript, voiceScript fields
- [ ] Scene interface removes content, description fields
- [ ] Manifest interface defined with flexible content structure
- [ ] Field renames applied: category → problemCategory, template → contentTemplate
- [ ] All TypeScript files compile without errors

#### Data Processing
- [ ] extractProblems() returns all matching problems (not just first)
- [ ] Empty userProblem generates fallback text
- [ ] --limit flag correctly caps total videos

#### Template Updates
- [ ] d2c systemPromptCall1 generates videoScript + voiceScript
- [ ] d2c systemPromptCall2 generates 3 scene prompts (Scene 1 full, 2-3 minimal)
- [ ] Zod validation passes for both calls
- [ ] Dialogue included in all scene prompts

#### Video Generation
- [ ] Model updated to google-deepmind/veo-3.1
- [ ] negative_prompt parameter added to all scenes
- [ ] Frame extraction works for scenes 1-2
- [ ] Frame chaining: Scene 2 uses scene1_last.jpg, Scene 3 uses scene2_last.jpg
- [ ] Video combining produces 24-second final.mp4

#### Output Structure
- [ ] Folder structure matches specification
- [ ] Manifest saved to manifests/ directory
- [ ] Videos saved to videos/{videoId}/ directory
- [ ] Dry-run output simplified (no veoParams)
- [ ] Dry-run structure matches manifest structure

#### Model Updates
- [ ] gpt-5-mini configured (after fetching docs via context7)
- [ ] OpenAI Responses API used (not Chat Completions)
- [ ] Script generation works with new model

---

## External Dependencies

### 1. OpenAI gpt-5-mini Documentation
- **Source**: context7 MCP server
- **Required docs**: Responses API (not Chat Completions)
- **Info needed**:
  - API endpoint and request format
  - Authentication changes (if any)
  - Response structure
  - Pricing
  - Rate limits
  - Breaking changes from gpt-4o-mini

### 2. FFmpeg
- **Assumed**: Already installed
- **Required commands**:
  - Frame extraction: `-vf "select='eq(n,N)'"`
  - Concat demuxer: `-f concat`
- **Version**: Any recent version supporting these features

---

## Migration Notes

### Breaking Changes from Previous Cycles

**Script output structure:**
- OLD: `overallScript` field
- NEW: `videoScript` field
- Action: Update any code reading old scripts

**Scene structure:**
- OLD: `scenes[].content` field
- NEW: `scenes[].prompt` only
- Action: Remove references to content field

**State management:**
- Field renames may require state file updates
- Consider state migration or clean start

**Output paths:**
- NEW: videos/ and manifests/ directories
- Action: Create new directories, update path references

---

## Notes

**POC constraints:**
- Fixed 3 scenes (no dynamic scene count)
- Veo audio enabled (generate_audio: true)
- Simplified frame chaining (no last_frame parameter)
- Sequential processing (no parallelization)

**Future enhancements deferred:**
- External TTS integration
- Lipsync processing
- Neutral pose control (last_frame parameter)
- Dynamic scene count
- Template variable configuration

**Testing approach:**
- Start with --limit 1 for validation
- Expand to --limit 5-10 for confidence
- Full dataset when ready

---

## References

- **Exploration**: `0-exploration.md`
- **Template design**: `../../2_reference-docs/template-design-full.md`
- **Tested prompts**: `../temp-implementation.md`
- **Workflow decisions**: `../../2_reference-docs/workflow-problems-and-solutions-2.md`
- **Veo 3.1 schema**: `../../2_reference-docs/veo3.1-schema.json`
