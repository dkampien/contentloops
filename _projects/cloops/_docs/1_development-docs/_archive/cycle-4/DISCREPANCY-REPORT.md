# Cycle 4: Document Discrepancy Report

**Date**: October 24, 2025
**Purpose**: Identify and correct misalignments between exploration, requirements, implementation plan, and actual codebase

---

## Critical Architecture Discrepancies

### 🔴 CRITICAL: Scene Loop Location

**What the docs say:**
- Implementation plan Step 6.4 shows frame chaining logic inside `video-generator.ts`
- Pseudocode shows `for (const scene of script.scenes)` loop in video-generator

**What the code actually does:**
- **Scene loop lives in `index.ts` lines 187-234**
- video-generator.ts only handles ONE scene at a time via `generateVideoClip(scene, videoId)`
- index.ts controls the scene iteration and state updates

**Impact:** ❌ BLOCKING - Implementation plan Phase 6 is fundamentally wrong

**Correction needed:**
- Phase 6 must update **index.ts** to handle frame passing between scenes
- video-generator.ts needs updated signature: `generateVideoClip(scene, videoId, previousFramePath?)`
- Frame extraction happens in video-generator, but called from index.ts loop

---

### 🔴 CRITICAL: Video Combining Integration Point

**What the docs say:**
- Implementation plan Step 6.5 implements `combineScenes()` method
- Unclear who calls it or when

**What the code actually does:**
- index.ts controls the entire scene generation flow
- After scenes complete, video combining must be called from index.ts
- State manager tracks individual scenes, not combined videos

**Impact:** ❌ BLOCKING - Missing integration point

**Correction needed:**
```typescript
// index.ts - AFTER scene loop completes
const finalVideoPath = await videoGenerator.combineScenes(videoId);

// Update state with combined video
stateManager.updateVideoFinalPath(state, videoId, finalVideoPath);

// Create manifest
await createManifest(script, finalVideoPath, userProblem);
```

---

### 🔴 CRITICAL: Manifest Creation Timing & Location

**What the docs say:**
- Implementation plan Step 7.1: "Update OutputAssembler for new manifest structure"
- Implies OutputAssembler creates manifests

**What the code actually does:**
- **OutputAssembler runs at END of entire pipeline** (index.ts line 263)
- Creates aggregate FinalOutput JSON with all videos
- NOT per-video manifests

**Impact:** ❌ BLOCKING - Wrong component, wrong timing

**Correction needed:**
- Manifests created PER VIDEO immediately after combining
- New method/class needed (not OutputAssembler)
- Called from index.ts after `combineScenes()`
- Saves to `manifestsDir/{videoId}.json`

---

### 🔴 CRITICAL: State Management Updates Missing

**What the docs say:**
- Requirements mentions state-manager "possibly affected"
- No concrete changes specified

**What's actually needed:**
```typescript
// src/types/state.types.ts
interface VideoState {
  // ... existing fields
  finalVideoPath?: string;  // NEW - path to combined video
}

// src/lib/state-manager.ts
updateVideoFinalPath(
  state: PipelineState,
  videoId: string,
  finalVideoPath: string
): void {
  const video = state.videos.find(v => v.id === videoId);
  if (!video) throw new StateError(...);
  video.finalVideoPath = finalVideoPath;
}
```

**Impact:** ❌ BLOCKING - State tracking incomplete

**Correction needed:**
- Add VideoState.finalVideoPath field
- Add state-manager method
- Call from index.ts after combining

---

## Configuration Discrepancies

### ⚠️ MEDIUM: videosDir already exists in config

**What the docs say:**
- Requirements Step 2.4: "Add videosDir and manifestsDir paths to configuration"
- Implies videosDir doesn't exist

**What the code has:**
```json
// config.json line 5
"videosDir": "./output/videos"  // Already exists!
```

**Impact:** Minor - just documentation accuracy

**Correction needed:**
- Update requirements to say "Add manifestsDir" only
- Note that videosDir already exists

---

### ⚠️ MEDIUM: Helper functions already exist

**What the docs say:**
- Implementation plan creates frame extraction from scratch

**What the code has:**
```typescript
// video-generator.ts line 55-59
import { generateClipPath } from '../utils/helpers';

const clipPath = generateClipPath(
  this.config.paths.videosDir,
  videoId,
  scene.sceneNumber
);
```

**Impact:** Minor - don't reinvent existing helpers

**Correction needed:**
- Reference existing helpers in implementation plan
- May have other helpers for video ID, timestamp generation

---

## Schema Discrepancies

### ⚠️ LOW: Field naming inconsistency

**Exploration doc:**
- Sometimes uses `id`, sometimes `videoId`

**Requirements doc:**
```typescript
interface Manifest {
  videoId: string;  // Clear
  ...
}
```

**Current code:**
```typescript
interface VideoScript {
  id: string;  // Still uses "id"
  ...
}
```

**Correction needed:**
- VideoScript keeps `id` internally
- Gets mapped to `videoId` in manifest
- Docs should clarify this transformation

---

### ✅ CORRECT: Scene structure change

**All docs agree:**
- Remove: `overallScript`, `scenes[].content`, `scenes[].description`
- Add: `videoScript`, `voiceScript`
- Keep: `scenes[].prompt` only

**Code currently has:**
```typescript
// script-generator.ts line 266
overallScript,  // To be replaced
scenes: { content, prompt }  // content to be removed
```

**Status:** Docs are correct, code needs updating

---

## Integration Flow Discrepancies

### 🔴 CRITICAL: Complete flow correction needed

**Current documented flow is WRONG:**
```
❌ video-generator.ts loops scenes
❌ video-generator.ts extracts frames internally
❌ video-generator.ts chains automatically
❌ OutputAssembler creates manifests
```

**Actual flow must be:**
```
✅ index.ts loops scenes
✅ index.ts passes previousFramePath to video-generator
✅ video-generator.generateVideoClip() uses image param if provided
✅ video-generator.extractLastFrame() called by index.ts after each scene
✅ index.ts calls video-generator.combineScenes() after loop
✅ New manifest creator called by index.ts after combining
✅ index.ts updates state with final video path
✅ OutputAssembler runs at END for aggregate output (unchanged)
```

---

## Detailed Corrections by Document

### Exploration.md Corrections

**Item 4c (Frame Chaining):**
```markdown
**Impact:**
- File: `src/lib/video-generator.ts` - Add image parameter support
- File: `src/index.ts` - Update scene loop to pass frames between scenes  // ADD THIS
- Conditional logic: if (sceneNumber > 1) add image parameter
- File path management for extracted frames
```

**Item 4d (Video Combining):**
```markdown
**Impact:**
- File: `src/lib/video-generator.ts` - Add combineScenes() method
- File: `src/index.ts` - Call combineScenes() after all scenes complete  // ADD THIS
- File: `src/lib/state-manager.ts` - Add updateVideoFinalPath() method  // ADD THIS
- Create concat file programmatically
- Execute ffmpeg command
- Return path to combined video
```

**Items 6-7 (Manifest):**
```markdown
**Impact:**
- File: `src/types/output.types.ts` - Define Manifest interface
- File: `src/lib/manifest-creator.ts` - NEW FILE for per-video manifests  // ADD THIS
- File: `src/index.ts` - Call manifest creator after video combining  // ADD THIS
- File: `src/lib/output-assembler.ts` - Unchanged (runs at pipeline END)
```

---

### Requirements.md Corrections

**Section 2: Output Folder Structure**
- ✅ Correct as-is

**Section 3: Configuration Updates**
```json
// CHANGE THIS SECTION
{
  "paths": {
    "manifestsDir": "./output/manifests"  // ONLY add this (videosDir exists)
  }
}
```

**Section 6: Video Generation Requirements**

**ADD NEW SUBSECTION:**
```markdown
#### Integration with index.ts

**Scene loop changes:**
```typescript
// index.ts main scene loop
let previousFramePath: string | undefined;

for (const scene of script.scenes) {
  // Pass frame to generator
  const result = await videoGenerator.generateVideoClip(
    scene,
    videoId,
    previousFramePath
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
```

**Section 7: Error Handling**

**ADD:**
```markdown
#### State Updates
- **Behavior**: Add finalVideoPath after combining
- **On failure**: Video marked incomplete, scenes remain
- **Logging**: Include videoId, error message
```

---

### Implementation-Plan.md Corrections

**Phase 6: Complete restructure needed**

**REPLACE Phase 6 with:**

```markdown
## Phase 6: Video Generation (Veo 3.1 + Frame Chaining)

Integration requires changes across video-generator.ts, index.ts, and state-manager.ts.

### Step 6.1: Add negative_prompt to Veo calls `[ ]`
- **Priority:** High
- **Task:** Add `negative_prompt` parameter to all Veo API calls.
- **Files:**
  - `src/lib/video-generator.ts`
- **Step Dependencies:** Step 2.3 (config updated)
- **User Instructions / Validation:**
  ```bash
  npm run generate -- --limit 1
  # Listen for background music - should be absent
  ```
- **Implementation Notes:**
  ```typescript
  const input: any = {
    prompt: scene.prompt,
    aspect_ratio: this.config.videoGeneration.aspectRatio,
    duration: this.config.videoGeneration.duration,
    negative_prompt: this.config.videoGeneration.negativePrompt,
    // ... other params
  };
  ```

### Step 6.2: Update generateVideoClip signature `[ ]`
- **Priority:** Critical
- **Task:** Add optional previousFramePath parameter to generateVideoClip method.
- **Files:**
  - `src/lib/video-generator.ts`
- **Step Dependencies:** None
- **User Instructions / Validation:**
  ```bash
  npm run build
  # Should compile without errors
  ```
- **Implementation Notes:**
  ```typescript
  // CURRENT signature
  async generateVideoClip(scene: Scene, videoId: string)

  // NEW signature
  async generateVideoClip(
    scene: Scene,
    videoId: string,
    previousFramePath?: string
  ): Promise<{ videoPath: string; predictionId: string; predictTime?: number }>

  // Inside method: Add image parameter if frame provided
  if (previousFramePath && scene.sceneNumber > 1) {
    input.image = previousFramePath;
  }
  ```

### Step 6.3: Implement extractLastFrame method `[ ]`
- **Priority:** Critical
- **Task:** Add method to extract last frame from video using ffmpeg.
- **Files:**
  - `src/lib/video-generator.ts` or `src/utils/ffmpeg.ts`
- **Step Dependencies:** None
- **User Instructions / Validation:**
  ```bash
  # Test extraction standalone
  ffmpeg -i test.mp4 -vf "select='eq(n,191)'" -frames:v 1 test_last.jpg
  ls -lh test_last.jpg  # Should exist
  ```
- **Implementation Notes:**
  ```typescript
  async extractLastFrame(
    videoPath: string,
    videoId: string,
    sceneNumber: number
  ): Promise<string> {
    const framesDir = path.join(
      this.config.paths.videosDir,
      videoId,
      'frames'
    );
    await fs.mkdir(framesDir, { recursive: true });

    const outputPath = path.join(framesDir, `scene${sceneNumber}_last.jpg`);
    const command = `ffmpeg -i "${videoPath}" -vf "select='eq(n,191)'" -frames:v 1 "${outputPath}"`;

    // Execute command with error handling
    // Retry once on failure
    // Return outputPath
  }
  ```
  - Frame 191 = last frame of 8s @ 24fps video
  - Use child_process.exec or similar
  - Store in `videos/{videoId}/frames/` directory

### Step 6.4: Implement combineScenes method `[ ]`
- **Priority:** Critical
- **Task:** Add method to concatenate 3 scene videos into single 24-second video.
- **Files:**
  - `src/lib/video-generator.ts`
- **Step Dependencies:** None (can be parallel)
- **User Instructions / Validation:**
  ```bash
  npm run generate -- --limit 1
  # Check final.mp4 exists and is 24 seconds
  ffprobe output/videos/{videoId}/final.mp4
  ```
- **Implementation Notes:**
  ```typescript
  async combineScenes(videoId: string): Promise<string> {
    const videoDir = path.join(this.config.paths.videosDir, videoId);
    const scenesDir = path.join(videoDir, 'scenes');
    const concatFile = path.join(videoDir, 'concat.txt');
    const outputPath = path.join(videoDir, 'final.mp4');

    // Find scene files (use helper: generateClipPath)
    const scenePaths = [1, 2, 3].map(n =>
      generateClipPath(this.config.paths.videosDir, videoId, n)
    );

    // Create concat.txt
    const concatContent = scenePaths
      .map(p => `file '${path.relative(videoDir, p)}'`)
      .join('\n');
    await fs.writeFile(concatFile, concatContent);

    // Run ffmpeg
    const command = `ffmpeg -f concat -safe 0 -i "${concatFile}" -c copy "${outputPath}"`;
    // Execute, handle errors, retry once on failure

    return outputPath;
  }
  ```

### Step 6.5: Update index.ts scene loop for frame chaining `[ ]`
- **Priority:** Critical
- **Task:** Modify main scene loop to pass frames between scenes.
- **Files:**
  - `src/index.ts`
- **Step Dependencies:** Steps 6.2, 6.3
- **User Instructions / Validation:**
  ```bash
  npm run generate -- --limit 1
  # Check frames directory exists
  # Check visual continuity manually
  ```
- **Implementation Notes:**
  ```typescript
  // Find the scene loop around line 187-234
  // ADD before loop:
  let previousFramePath: string | undefined;

  // INSIDE loop, AFTER generateVideoClip:
  const result = await videoGenerator.generateVideoClip(
    scene,
    videoId,
    previousFramePath  // ADD THIS PARAMETER
  );

  // AFTER state update, ADD:
  if (scene.sceneNumber < 3) {
    previousFramePath = await videoGenerator.extractLastFrame(
      result.videoPath,
      videoId,
      scene.sceneNumber
    );
  }
  ```

### Step 6.6: Add video combining call to index.ts `[ ]`
- **Priority:** Critical
- **Task:** Call combineScenes after all scenes complete.
- **Files:**
  - `src/index.ts`
- **Step Dependencies:** Steps 6.4, 6.5
- **User Instructions / Validation:**
  ```bash
  npm run generate -- --limit 1
  # Check final.mp4 exists in videos/{videoId}/
  ```
- **Implementation Notes:**
  ```typescript
  // AFTER scene loop completes (around line 235)
  // ADD:

  // Combine all scenes into final video
  logger.info('   Combining scenes...');
  const finalVideoPath = await videoGenerator.combineScenes(videoId);
  logger.success(`   ✓ Final video created: ${path.basename(finalVideoPath)}`);

  // Update state with combined video path
  // (requires Step 7.1 - state manager update)
  stateManager.updateVideoFinalPath(state, videoId, finalVideoPath);
  await stateManager.saveState(state);

  // Mark video as completed (existing logic - around line 238)
  stateManager.updateVideoStatus(state, videoId, 'completed');
  ```

### Step 6.7: Create directories for frames `[ ]`
- **Priority:** Medium
- **Task:** Ensure frames directory exists before extraction.
- **Files:**
  - `src/lib/video-generator.ts` (in extractLastFrame method)
- **Step Dependencies:** Step 6.3
- **User Instructions / Validation:**
  ```bash
  npm run generate -- --limit 1
  # Check output/videos/{videoId}/frames/ exists
  ```
- **Implementation Notes:**
  - Already handled in Step 6.3 implementation notes
  - Use `await fs.mkdir(framesDir, { recursive: true })`
```

**Phase 7: Add state management step FIRST**

**INSERT NEW STEP 7.0:**

```markdown
### Step 7.0: Update state-manager for final video path `[ ]`
- **Priority:** Critical
- **Task:** Add field and method to track combined video path.
- **Files:**
  - `src/types/state.types.ts`
  - `src/lib/state-manager.ts`
- **Step Dependencies:** None
- **User Instructions / Validation:**
  ```bash
  npm run build
  # Should compile without errors
  ```
- **Implementation Notes:**
  ```typescript
  // src/types/state.types.ts
  export interface VideoState {
    id: string;
    category: ProblemCategory;
    template: TemplateType;
    status: 'pending' | 'script-generation' | 'video-generation' | 'completed' | 'failed';
    scriptPath?: string;
    finalVideoPath?: string;  // NEW FIELD
    error?: string;
    scenes: SceneState[];
  }

  // src/lib/state-manager.ts
  updateVideoFinalPath(
    state: PipelineState,
    videoId: string,
    finalVideoPath: string
  ): void {
    const video = state.videos.find(v => v.id === videoId);
    if (!video) {
      throw new StateError(`Video not found: ${videoId}`, { videoId });
    }
    video.finalVideoPath = finalVideoPath;
  }
  ```
```

**UPDATE Step 7.1:**

```markdown
### Step 7.1: Create ManifestCreator class `[ ]`
- **Priority:** High
- **Task:** Create new class for per-video manifest generation (NOT OutputAssembler).
- **Files:**
  - `src/lib/manifest-creator.ts` (NEW FILE)
- **Step Dependencies:** Phase 1 (types defined), Step 7.0 (state updated)
- **User Instructions / Validation:**
  ```bash
  npm run generate -- --limit 1
  # Check output/manifests/{videoId}.json exists
  # Validate structure matches requirements
  ```
- **Implementation Notes:**
  ```typescript
  // New file: src/lib/manifest-creator.ts
  export class ManifestCreator {
    constructor(private config: Config) {}

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

      // Save to manifestsDir
      const manifestsDir = this.config.paths.manifestsDir;
      await fs.mkdir(manifestsDir, { recursive: true });

      const manifestPath = path.join(manifestsDir, `${script.id}.json`);
      await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2));

      logger.debug(`Manifest saved: ${manifestPath}`);
    }
  }
  ```
  **Note:** OutputAssembler stays unchanged - it runs at pipeline END for aggregate output
```

**UPDATE Step 7.2:**

```markdown
### Step 7.2: Integrate ManifestCreator in index.ts `[ ]`
- **Priority:** High
- **Task:** Call ManifestCreator after video combining completes.
- **Files:**
  - `src/index.ts`
- **Step Dependencies:** Step 7.1, Step 6.6
- **User Instructions / Validation:**
  ```bash
  npm run generate -- --limit 1
  ls output/manifests/
  # Should see {videoId}.json file
  ```
- **Implementation Notes:**
  ```typescript
  // At top of index.ts
  import { ManifestCreator } from './lib/manifest-creator';

  // After config load (around line 58)
  const manifestCreator = new ManifestCreator(config);

  // In video generation loop, AFTER combining (Step 6.6)
  // AFTER stateManager.updateVideoFinalPath(...)
  // ADD:
  await manifestCreator.create(script, userProblem, finalVideoPath);
  logger.success(`   ✓ Manifest created: ${videoId}.json`);
  ```
```

**RENAME Step 7.2 → Step 7.3, Step 7.3 → Step 7.4**

---

## Summary of Required Changes

### 🔴 Critical (Blocking)

1. **index.ts** - Add frame passing in scene loop
2. **index.ts** - Add combineScenes call after loop
3. **index.ts** - Add manifest creation after combining
4. **video-generator.ts** - Update generateVideoClip signature
5. **video-generator.ts** - Add extractLastFrame method
6. **video-generator.ts** - Add combineScenes method
7. **state-manager.ts** - Add finalVideoPath field and method
8. **manifest-creator.ts** - NEW FILE for per-video manifests
9. **Implementation plan Phase 6** - Complete restructure

### ⚠️ Medium (Important)

10. **Requirements doc** - Add index.ts integration section
11. **Exploration doc** - Clarify file responsibilities
12. **Implementation plan Phase 7** - Add state-manager step first

### ✅ Minor (Documentation)

13. **Requirements** - Note videosDir already exists
14. **All docs** - Reference existing helpers
15. **All docs** - Clarify id → videoId transformation

---

## Next Steps

1. **Review this report** - Confirm corrections are accurate
2. **Update exploration.md** - Add index.ts responsibilities
3. **Update requirements.md** - Add integration section
4. **Rewrite implementation-plan.md Phase 6-7** - Correct architecture
5. **Proceed with implementation** - Using corrected plan

---

## Files Requiring Updates

**Documentation:**
- `0-exploration.md` (Items 4c, 4d, 6-7)
- `1-requirements.md` (Section 6, add integration subsection)
- `2-implementation-plan.md` (Phase 6 complete rewrite, Phase 7 restructure)

**New documentation needed:**
- None (this report serves as correction reference)

---

**Status**: Ready for review and doc updates
