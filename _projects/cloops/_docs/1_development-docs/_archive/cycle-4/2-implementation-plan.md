# Cycle 4: Implementation Plan

**Date**: October 24, 2025
**Status**: Ready for implementation

---

## Overview

- **Objective:** Implement redesigned template framework with Veo 3.1 frame chaining, extract all problems from dataset, and update to gpt-5-mini model for POC completion.

- **Key Risks / Assumptions:**
  - gpt-5-mini API assumed compatible with current OpenAI integration
  - Frame extraction via ffmpeg assumed functional (not tested yet)
  - Schema changes may require state file reset (clean start)
  - All problems extraction may reveal data quality issues in CSV

- **Related Docs:**
  - `@_docs/1_development-docs/cycle-4/0-exploration.md` - Discussion and decisions
  - `@_docs/1_development-docs/cycle-4/1-requirements.md` - Formal specifications
  - `@_docs/2_reference-docs/template_direct-to-camera_comfort.md` - Template design with system prompts
  - `@_docs/2_reference-docs/template-design-full.md` - Template framework
  - `@_docs/2_reference-docs/workflow-problems-and-solutions-2.md` - Technical decisions

---

## Completion Status

- **Phase 1:** Schema & Types — ❌ Not started
- **Phase 2:** External Docs & Model Updates — ❌ Not started
- **Phase 3:** Template System Prompts — ❌ Not started
- **Phase 4:** Script Generator Updates — ❌ Not started
- **Phase 5:** Data Processor Updates — ❌ Not started
- **Phase 6:** Video Generation (Veo 3.1 + Frame Chaining) — ❌ Not started
- **Phase 7:** Output Assemblers — ❌ Not started
- **Phase 8:** Integration & Validation — ❌ Not started

---

## Phase 1: Schema & Types Updates

Foundation phase - all other phases depend on correct type definitions.

### Step 1.1: Update VideoScript interface `[ ]`
- **Priority:** Critical
- **Task:** Update `VideoScript` interface to replace `overallScript` with `videoScript`, add `voiceScript` field, remove deprecated scene fields.
- **Files:**
  - `src/types/script.types.ts`
- **Step Dependencies:** None
- **User Instructions / Validation:**
  ```bash
  npm run build
  # Should compile without errors
  ```
- **Implementation Notes:**
  ```typescript
  interface VideoScript {
    id: string;
    category: string;
    template: string;
    timestamp: string;
    videoScript: string;     // renamed from overallScript
    voiceScript: string;     // NEW FIELD
    scenes: Scene[];
  }

  interface Scene {
    sceneNumber: number;
    prompt: string;
    // REMOVED: content, description
  }
  ```

### Step 1.2: Create Manifest types `[ ]`
- **Priority:** Critical
- **Task:** Create new `output.types.ts` file defining flexible manifest structure with universal core and template-specific content.
- **Files:**
  - `src/types/output.types.ts` (create new)
- **Step Dependencies:** Step 1.1
- **User Instructions / Validation:**
  ```bash
  npm run build
  # Check no type errors
  ```
- **Implementation Notes:**
  ```typescript
  interface Manifest {
    videoId: string;
    problemCategory: string;
    contentTemplate: string;
    timestamp: string;
    userProblem: string;
    content: D2CManifestContent;
    scenes: ManifestScene[];
    finalVideoPath: string;
  }

  interface D2CManifestContent {
    videoScript: string;
    voiceScript: string;
  }
  ```

### Step 1.3: Update Prediction types for Veo 3.1 `[ ]`
- **Priority:** High
- **Task:** Add `image` and `last_frame` optional parameters to Veo input type, add `negative_prompt`.
- **Files:**
  - `src/types/prediction.types.ts`
- **Step Dependencies:** None
- **User Instructions / Validation:**
  ```bash
  npm run build
  # Check video-generator.ts compiles
  ```
- **Implementation Notes:**
  ```typescript
  interface VeoInput {
    prompt: string;
    duration: number;
    aspect_ratio: string;
    generate_audio: boolean;
    resolution?: string;
    negative_prompt?: string;  // NEW
    image?: string;            // NEW
    last_frame?: string;       // NEW (not using yet)
    seed?: number;
  }
  ```

---

## Phase 2: External Docs & Model Updates

Research and configure new models before implementing logic changes.

### Step 2.1: Fetch gpt-5-mini documentation `[ ]`
- **Priority:** Critical
- **Task:** Use context7 MCP server to fetch OpenAI Responses API documentation for gpt-5-mini. Document API changes, breaking changes, and pricing.
- **Files:**
  - Create notes file or update exploration.md with findings
- **Step Dependencies:** None
- **User Instructions / Validation:**
  - Use context7 MCP to query OpenAI docs
  - Focus on Responses API (not Chat Completions)
  - Document: endpoint format, authentication, response structure, pricing
- **Implementation Notes:**
  - Look for breaking changes from gpt-4o-mini
  - Verify structured output (Zod) compatibility
  - Note any new parameters or capabilities

### Step 2.2: Update config for gpt-5-mini `[ ]`
- **Priority:** Critical
- **Task:** Update model string in configuration to use gpt-5-mini.
- **Files:**
  - `config.json` or `src/config/config.ts`
- **Step Dependencies:** Step 2.1 (verify model name)
- **User Instructions / Validation:**
  ```bash
  # Check config loads correctly
  npm run generate -- --dry-run --limit 1
  ```
- **Implementation Notes:**
  - Update: `"model": "gpt-5-mini"`
  - Verify API client uses Responses API endpoint
  - May need to update script-generator.ts if API interface changed

### Step 2.3: Update config for Veo 3.1 `[ ]`
- **Priority:** High
- **Task:** Update Veo model string to `google-deepmind/veo-3.1` and add `negative_prompt` to config.
- **Files:**
  - `config.json`
- **Step Dependencies:** None
- **User Instructions / Validation:**
  ```bash
  grep -r "veo-3.1" config.json
  grep -r "negativePrompt" config.json
  ```
- **Implementation Notes:**
  ```json
  {
    "videoGeneration": {
      "model": "google-deepmind/veo-3.1",
      "negativePrompt": "background music"
    }
  }
  ```

### Step 2.4: Add new output directories to config `[ ]`
- **Priority:** Medium
- **Task:** Add `videosDir` and `manifestsDir` paths to configuration.
- **Files:**
  - `config.json`
- **Step Dependencies:** None
- **User Instructions / Validation:**
  ```bash
  # Verify paths added
  cat config.json | grep -A 10 "paths"
  ```
- **Implementation Notes:**
  ```json
  {
    "paths": {
      "videosDir": "./output/videos",
      "manifestsDir": "./output/manifests"
    }
  }
  ```

---

## Phase 3: Template System Prompts

Update d2c template with tested prompts from temp-implementation.md.

### Step 3.1: Update d2c systemPromptCall1 `[ ]`
- **Priority:** Critical
- **Task:** Replace systemPromptCall1 with tested version that generates `videoScript` + `voiceScript`.
- **Files:**
  - `src/config/templates.ts`
- **Step Dependencies:** Phase 1 complete (types updated)
- **User Instructions / Validation:**
  ```bash
  npm run generate -- --dry-run --limit 1
  # Check output has videoScript and voiceScript fields
  ```
- **Implementation Notes:**
  - Copy prompt from `temp-implementation.md` lines 28-48
  - Hardcode template variables for POC (variety_instruction can be omitted or simple)
  - Ensure prompt generates exactly: videoScript, voiceScript

### Step 3.2: Update d2c systemPromptCall2 `[ ]`
- **Priority:** Critical
- **Task:** Replace systemPromptCall2 with tested version implementing Scene 1 full / Scenes 2-3 minimal strategy.
- **Files:**
  - `src/config/templates.ts`
- **Step Dependencies:** Step 3.1
- **User Instructions / Validation:**
  ```bash
  npm run generate -- --dry-run --limit 1
  # Check Scene 1 prompt is detailed (40-80 words)
  # Check Scenes 2-3 prompts are minimal (10-30 words)
  ```
- **Implementation Notes:**
  - Copy prompt from `temp-implementation.md` lines 50-83
  - Ensures Scene 1 has full description, Scenes 2-3 minimal
  - Includes dialogue in all scene prompts

### Step 3.3: Update promptRules and sceneStructure `[ ]`
- **Priority:** Low
- **Task:** Update template metadata to reflect new prompt strategy.
- **Files:**
  - `src/config/templates.ts`
- **Step Dependencies:** Steps 3.1, 3.2
- **User Instructions / Validation:**
  - Code review - check metadata matches implementation
- **Implementation Notes:**
  - Update `promptRules` to mention simplified scenes 2-3
  - `sceneStructure` can stay as-is (general guidance)

---

## Phase 4: Script Generator Updates

Update LLM call logic to generate and validate new schema.

### Step 4.1: Update CALL 1 Zod schema `[ ]`
- **Priority:** Critical
- **Task:** Update Zod schema for CALL 1 to expect `videoScript` and `voiceScript` instead of `overallScript`.
- **Files:**
  - `src/lib/script-generator.ts`
- **Step Dependencies:** Phase 1 complete, Step 3.1 complete
- **User Instructions / Validation:**
  ```bash
  npm run generate -- --dry-run --limit 1
  # Should parse successfully, no validation errors
  ```
- **Implementation Notes:**
  ```typescript
  const Call1Schema = z.object({
    videoScript: z.string().min(50),
    voiceScript: z.string().min(40).max(100),
  });
  ```
  - Remove `overallScript` from schema
  - Remove `scenes[].content` validation if present

### Step 4.2: Update CALL 2 user prompt `[ ]`
- **Priority:** Critical
- **Task:** Pass both `videoScript` and `voiceScript` to CALL 2 for prompt generation.
- **Files:**
  - `src/lib/script-generator.ts`
- **Step Dependencies:** Step 4.1
- **User Instructions / Validation:**
  ```bash
  npm run generate -- --dry-run --limit 1
  # Check generated prompts use both fields appropriately
  ```
- **Implementation Notes:**
  ```typescript
  const userPrompt = `videoScript: ${contentResponse.videoScript}

  voiceScript: ${contentResponse.voiceScript}

  Generate 3 Veo-optimized scene prompts following the strategy above.`;
  ```

### Step 4.3: Update CALL 2 Zod schema `[ ]`
- **Priority:** High
- **Task:** Update CALL 2 schema to remove `content`/`description` fields, keep only `prompt`.
- **Files:**
  - `src/lib/script-generator.ts`
- **Step Dependencies:** Phase 1 complete
- **User Instructions / Validation:**
  ```bash
  npm run generate -- --dry-run --limit 1
  # Validation should pass with just prompt field
  ```
- **Implementation Notes:**
  ```typescript
  const Call2Schema = z.object({
    scenes: z.array(z.object({
      sceneNumber: z.number().int().min(1).max(3),
      prompt: z.string().min(10)
    })).length(3)
  });
  ```

### Step 4.4: Update VideoScript assembly `[ ]`
- **Priority:** High
- **Task:** Assemble final VideoScript object with new field names before returning.
- **Files:**
  - `src/lib/script-generator.ts`
- **Step Dependencies:** Steps 4.1, 4.2, 4.3
- **User Instructions / Validation:**
  ```bash
  npm run generate -- --dry-run --limit 1
  # Check output/dry-run JSON has correct structure
  ```
- **Implementation Notes:**
  - Combine CALL 1 response (videoScript, voiceScript) with CALL 2 response (scenes)
  - Ensure no deprecated fields included
  - Return properly typed VideoScript object

---

## Phase 5: Data Processor Updates

Enable all problems extraction with proper fallback handling.

### Step 5.1: Update extractProblems to use filter `[ ]`
- **Priority:** High
- **Task:** Change `.find()` to `.filter()` to extract all matching problems per category, not just first.
- **Files:**
  - `src/lib/data-processor.ts`
- **Step Dependencies:** None
- **User Instructions / Validation:**
  ```bash
  npm run generate -- --dry-run --limit 5
  # Should process multiple problems, not just 1 per category
  # Check console logs show correct problem count
  ```
- **Implementation Notes:**
  ```typescript
  for (const category of filteredCategories) {
    const rows = allRows.filter(r =>  // CHANGED: find → filter
      r.lifeChallengeOption?.replace(/^"+|"+$/g, '').trim() === category &&
      r.onboardingV7_lifeChallenge?.trim()
    );

    for (const row of rows) {
      if (row.onboardingV7_lifeChallenge) {
        problems.push({
          category,
          problem: row.onboardingV7_lifeChallenge.trim()
        });
      }
    }

    // Fallback if NO problems for category
    if (rows.length === 0) {
      logger.warn(`No problems found for category: ${category}, using generic`);
      problems.push({
        category,
        problem: `Struggling with ${category.toLowerCase()}`
      });
    }
  }
  ```

### Step 5.2: Test with different --limit values `[ ]`
- **Priority:** Medium
- **Task:** Validate that --limit correctly caps total videos across all problems and templates.
- **Files:**
  - No changes, testing only
- **Step Dependencies:** Step 5.1
- **User Instructions / Validation:**
  ```bash
  # Test various limits
  npm run generate -- --dry-run --limit 1
  npm run generate -- --dry-run --limit 5
  npm run generate -- --dry-run --limit 10

  # Verify correct number of videos generated
  # Formula: min(limit, problems.length) videos per template
  ```
- **Implementation Notes:**
  - Check main loop applies limit correctly
  - Verify distribution across templates works as expected

---

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

### Step 6.4: Update generateClipPath helper `[ ]`
- **Priority:** Critical
- **Task:** Update generateClipPath helper to use nested directory structure.
- **Files:**
  - `src/utils/helpers.ts`
- **Step Dependencies:** None
- **User Instructions / Validation:**
  ```bash
  npm run build
  # Should compile without errors
  ```
- **Implementation Notes:**
  ```typescript
  // CURRENT (line 94-101)
  export function generateClipPath(
    videosDir: string,
    videoId: string,
    sceneNumber: number
  ): string {
    const timestamp = generateTimestamp();
    return path.join(videosDir, `${videoId}_scene${sceneNumber}_${timestamp}.mp4`);
  }

  // UPDATE TO
  export function generateClipPath(
    videosDir: string,
    videoId: string,
    sceneNumber: number
  ): string {
    const scenesDir = path.join(videosDir, videoId, 'scenes');
    return path.join(scenesDir, `scene${sceneNumber}.mp4`);
  }
  ```
  **Why:** Requirements specify nested folder structure (videos/{videoId}/scenes/) not flat structure

### Step 6.5: Implement combineScenes method `[ ]`
- **Priority:** Critical
- **Task:** Add method to concatenate 3 scene videos into single 24-second video.
- **Files:**
  - `src/lib/video-generator.ts`
- **Step Dependencies:** Step 6.4 (helper updated)
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
    const concatFile = path.join(videoDir, 'concat.txt');
    const outputPath = path.join(videoDir, 'final.mp4');

    // Find scene files (use updated helper: generateClipPath)
    const scenePaths = [1, 2, 3].map(n =>
      generateClipPath(this.config.paths.videosDir, videoId, n)
    );

    // Create concat.txt with relative paths
    const concatContent = scenePaths
      .map(p => `file '${path.relative(videoDir, p)}'`)
      .join('\n');
    await fs.writeFile(concatFile, concatContent);

    // Run ffmpeg using child_process
    const { exec } = require('child_process');
    const { promisify } = require('util');
    const execAsync = promisify(exec);

    try {
      await execAsync(`ffmpeg -f concat -safe 0 -i "${concatFile}" -c copy "${outputPath}"`);
    } catch (error) {
      // Retry once
      await execAsync(`ffmpeg -f concat -safe 0 -i "${concatFile}" -c copy "${outputPath}"`);
    }

    return outputPath;
  }
  ```
  **Note:** Use child_process.exec for ffmpeg commands

### Step 6.6: Update index.ts scene loop for frame chaining `[ ]`
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
  // Scene loop: lines 187-235
  // ADD before loop (around line 186):
  let previousFramePath: string | undefined;

  // MODIFY generateVideoClip call (line 205):
  // CURRENT:
  const result = await videoGenerator.generateVideoClip(scene, videoId);

  // UPDATE TO:
  const result = await videoGenerator.generateVideoClip(
    scene,
    videoId,
    previousFramePath  // NEW PARAMETER
  );

  // ADD after line 213 (after stateManager.updateSceneStatus completion):
  if (scene.sceneNumber < 3) {
    previousFramePath = await videoGenerator.extractLastFrame(
      result.videoPath,
      videoId,
      scene.sceneNumber
    );
  }
  ```
  **Exact location:** Inside the scene loop, after state update (line 208-213), before success log (line 215)

### Step 6.7: Add video combining call to index.ts `[ ]`
- **Priority:** Critical
- **Task:** Call combineScenes after all scenes complete.
- **Files:**
  - `src/index.ts`
- **Step Dependencies:** Steps 6.5, 6.6
- **User Instructions / Validation:**
  ```bash
  npm run generate -- --limit 1
  # Check final.mp4 exists in videos/{videoId}/
  ```
- **Implementation Notes:**
  ```typescript
  // INSERT after line 235 (after scene loop closes), before line 237 (empty line before "Mark video as completed")
  // ADD:

  // Combine all scenes into final video
  logger.info('   Combining scenes...');
  const finalVideoPath = await videoGenerator.combineScenes(videoId);
  logger.success(`   ✓ Final video created: ${path.basename(finalVideoPath)}`);

  // Update state with combined video path
  // (requires Step 7.0 - state manager update)
  stateManager.updateVideoFinalPath(state, videoId, finalVideoPath);
  await stateManager.saveState(state);

  // EXISTING line 237-239 stays:
  // Mark video as completed
  stateManager.updateVideoStatus(state, videoId, 'completed');
  await stateManager.saveState(state, true);
  logger.success(`   ✓ Video complete: ${videoId}`);
  ```
  **Exact location:** Between line 235 (scene loop end) and line 237 (Mark video as completed comment)

### Step 6.8: Add ffmpeg execution helper `[ ]`
- **Priority:** High
- **Task:** Implement ffmpeg command execution with error handling.
- **Files:**
  - `src/lib/video-generator.ts` (or `src/utils/ffmpeg.ts` if extracting)
- **Step Dependencies:** Steps 6.3, 6.5
- **User Instructions / Validation:**
  ```bash
  # Check ffmpeg available
  ffmpeg -version
  ```
- **Implementation Notes:**
  ```typescript
  import { exec } from 'child_process';
  import { promisify } from 'util';

  const execAsync = promisify(exec);

  async executeFFmpeg(command: string, retries: number = 1): Promise<void> {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const { stdout, stderr } = await execAsync(command);
        if (stderr && !stderr.includes('frame=')) {
          logger.debug(`ffmpeg stderr: ${stderr}`);
        }
        return;
      } catch (error) {
        if (attempt === retries) {
          throw new VideoGenerationError(
            `ffmpeg command failed: ${error instanceof Error ? error.message : String(error)}`,
            { command }
          );
        }
        logger.warn(`ffmpeg attempt ${attempt + 1} failed, retrying...`);
        await sleep(1000);
      }
    }
  }
  ```
  **Note:** Use this helper in both extractLastFrame and combineScenes methods

---

## Phase 7: Output Assemblers

Update state management, create per-video manifests, and update dry-run outputs.

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

### Step 7.3: Update DryRunAssembler to match manifest structure `[ ]`
- **Priority:** Medium
- **Task:** Simplify dry-run output to remove veoParams and deprecated fields, align with manifest structure.
- **Files:**
  - `src/lib/dry-run-assembler.ts`
- **Step Dependencies:** Phase 1 (types defined), Step 7.1 (manifest structure defined)
- **User Instructions / Validation:**
  ```bash
  npm run generate -- --dry-run --limit 1
  # Check output/dry-run/{videoId}.json
  # Should be clean: just metadata + scenes[].prompt
  ```
- **Implementation Notes:**
  ```typescript
  const dryRunOutput = {
    videoId: script.id,
    userProblem: userProblem.problem,
    category: script.category,
    template: script.template,
    scenes: script.scenes.map(s => ({
      sceneNumber: s.sceneNumber,
      prompt: s.prompt
    }))
  };
  // REMOVED: veoParams, content fields
  ```

---

## Phase 8: Integration & Validation

End-to-end testing and validation of full pipeline.

### Step 8.1: Test dry-run mode end-to-end `[ ]`
- **Priority:** High
- **Task:** Run full dry-run with limit 5, validate all outputs correct.
- **Files:**
  - No changes, testing only
- **Step Dependencies:** All previous phases complete
- **User Instructions / Validation:**
  ```bash
  npm run generate -- --dry-run --limit 5

  # Check:
  # 1. Script generation works (output/scripts/)
  # 2. Dry-run outputs correct (output/dry-run/)
  # 3. videoScript + voiceScript present
  # 4. Scene 1 prompts detailed, 2-3 minimal
  # 5. No errors in console
  ```
- **Implementation Notes:**
  - Validate JSON structure matches requirements
  - Check prompt quality manually
  - Verify dialogue breakdown across scenes

### Step 8.2: Test single video generation `[ ]`
- **Priority:** Critical
- **Task:** Generate one complete video, validate all features working.
- **Files:**
  - No changes, testing only
- **Step Dependencies:** Step 8.1 passes
- **User Instructions / Validation:**
  ```bash
  npm run generate -- --limit 1

  # Check:
  # 1. All 3 scenes generate successfully
  # 2. Frames extracted (output/videos/{videoId}/frames/)
  # 3. Scenes saved (output/videos/{videoId}/scenes/)
  # 4. Final video combined (output/videos/{videoId}/final.mp4)
  # 5. Manifest saved (output/manifests/{videoId}.json)
  # 6. No background music in video
  # 7. Visual continuity between scenes (manual review)
  # 8. Video is 24 seconds
  ```
- **Implementation Notes:**
  - Watch for frame extraction errors
  - Verify frame chaining by checking character consistency
  - Check audio quality and voice changes (acceptable for POC)
  - Time the generation (~4-5 minutes expected)

### Step 8.3: Test with multiple problems `[ ]`
- **Priority:** High
- **Task:** Generate 5-10 videos to test stability and data handling.
- **Files:**
  - No changes, testing only
- **Step Dependencies:** Step 8.2 passes
- **User Instructions / Validation:**
  ```bash
  npm run generate -- --limit 10

  # Check:
  # 1. All videos generate (or failures logged properly)
  # 2. Different userProblems processed
  # 3. File organization correct
  # 4. No memory leaks or crashes
  # 5. State management working if interrupted
  ```
- **Implementation Notes:**
  - Monitor for any edge cases in problem text
  - Check if fallback problems generate acceptable content
  - Verify cost tracking aligns with expectations (~$5 per video)

### Step 8.4: Clean start test `[ ]`
- **Priority:** Medium
- **Task:** Delete state.json and run fresh generation to ensure clean start works.
- **Files:**
  - No changes, testing only
- **Step Dependencies:** Step 8.3
- **User Instructions / Validation:**
  ```bash
  rm output/state.json
  npm run generate -- --limit 2

  # Should initialize fresh, no errors referencing old state
  ```
- **Implementation Notes:**
  - Schema changes may make old state incompatible
  - Document need for clean start in cycle notes

### Step 8.5: Resume test `[ ]`
- **Priority:** Low
- **Task:** Test --resume flag works with new schema.
- **Files:**
  - No changes, testing only
- **Step Dependencies:** Step 8.4
- **User Instructions / Validation:**
  ```bash
  npm run generate -- --limit 5
  # Interrupt with Ctrl+C after 2 videos

  npm run generate -- --resume
  # Should continue from where it stopped
  ```
- **Implementation Notes:**
  - If resume doesn't work due to schema changes, document as known issue
  - Can be fixed in future cycle if needed

---

## Post-Implementation Checklist

- [ ] `npm run build` - No TypeScript errors
- [ ] `npm run lint` - Code style passes
- [ ] Dry-run with --limit 1 produces valid output
- [ ] Full generation with --limit 1 completes successfully
- [ ] Frame chaining visually verified (character consistency)
- [ ] Manifest structure matches specification
- [ ] No background music in generated videos
- [ ] Output folder structure matches requirements
- [ ] Documentation updated if needed (CLAUDE.md, README)

---

## Retro Notes

*(To be filled in after implementation)*

**Wins:**
-

**Pitfalls:**
-

**Ideas for next cycle:**
-
