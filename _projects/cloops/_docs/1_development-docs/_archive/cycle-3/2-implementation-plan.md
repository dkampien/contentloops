# Cycle 3: Dry-Run Mode - Implementation Plan

**Date**: October 20, 2025
**Status**: Planning Phase

---

## Overview

This plan details the implementation of dry-run mode for the video generation pipeline. The dry-run mode allows testing prompt generation without incurring Veo 3.1 costs.

---

## Implementation Phases

### Phase 1: CLI Flag Support
### Phase 2: Dry-Run Output Directory Setup
### Phase 3: Pipeline Execution Control
### Phase 4: Console Output Formatting
### Phase 5: Dry-Run File Generation
### Phase 6: Testing & Validation

---

## Files to Modify

### Core Implementation Files
```
src/
├── index.ts                    [MODIFY] Add dry-run logic
├── lib/
│   └── dry-run-assembler.ts   [CREATE] Assemble dry-run output
└── types/
    └── config.types.ts         [MODIFY] Add dry-run flag to options
```

### Configuration (if needed)
```
src/config/
└── config.ts                   [REVIEW] May need path config
```

---

## Phase 1: CLI Flag Support

### File: `src/index.ts`

**Location**: Commander.js command definition (lines 26-34)

**Changes**:

```typescript
program
  .command('generate')
  .description('Run the video generation pipeline')
  .option('-c, --config <path>', 'Path to config file', './config.json')
  .option('--resume', 'Resume from last saved state', false)
  .option('--clean', 'Clean output directory before starting', false)
  .option('--dry-run', 'Generate scripts only without video generation', false)  // ADD THIS
  .option('--limit <number>', 'Limit number of videos to generate', parseInt)    // ADD THIS
  .action(async (options) => {
    await runPipeline(options);
  });
```

**Update function signature**:

```typescript
async function runPipeline(options: {
  config: string;
  resume: boolean;
  clean: boolean;
  dryRun: boolean;      // ADD THIS
  limit?: number;       // ADD THIS
}) {
  // ...
}
```

---

## Phase 2: Dry-Run Output Directory Setup

### File: `src/index.ts`

**Location**: After config loading (around line 48)

**Add dry-run directory creation**:

```typescript
// Load configuration
logger.info('Loading configuration...');
const config = await loadConfig(options.config);
logger.info(`✓ Config loaded: ${config.pipeline.categories.length} categories, ${config.pipeline.templates.length} templates`);

// ADD THIS SECTION
if (options.dryRun) {
  logger.warn('');
  logger.warn('⚠️  DRY RUN MODE - No videos will be generated');
  logger.warn('⚠️  Scripts and prompts will be saved for manual testing');
  logger.warn('');

  // Create dry-run directory
  const dryRunDir = path.join(config.paths.outputDir, 'dry-run');
  await fs.mkdir(dryRunDir, { recursive: true });
  logger.debug(`Dry-run directory created: ${dryRunDir}`);
}
```

**Also skip state management in dry-run**:

```typescript
// Initialize state manager
const stateManager = new StateManager(config.paths.stateFile);
let state = options.resume ? await stateManager.loadState() : null;

// MODIFY THIS SECTION
if (options.dryRun) {
  // Skip state management in dry-run mode
  state = null;
  logger.debug('State management skipped (dry-run mode)');
} else if (state) {
  logger.info(`✓ Resuming from previous state (${stateManager.getProgressPercentage(state)}% complete)`);
} else {
  // Initialize state...
}
```

---

## Phase 3: Pipeline Execution Control

### File: `src/index.ts`

**Location**: Main video generation loop (lines 88-193)

**Add limit support**:

```typescript
// Process CSV data
logger.info('');
logger.info('Processing CSV data...');
const dataProcessor = new DataProcessor(config.paths.csvInput);
const problems = await dataProcessor.extractProblems(config.pipeline.categories);

// ADD THIS - Apply limit if specified
let processProblems = problems;
if (options.limit && options.limit > 0) {
  processProblems = problems.slice(0, options.limit);
  logger.info(`✓ Limiting to ${options.limit} problem(s)`);
}

logger.success(`✓ Extracted ${processProblems.length} problems to process`);
```

**Modify main loop**:

```typescript
// Generate videos for each category × template
logger.info('');
logger.info('='.repeat(60));
logger.info(options.dryRun ? 'Starting Script Generation (Dry-Run)' : 'Starting Content Generation');
logger.info('='.repeat(60));
logger.info('');

for (const userProblem of processProblems) {  // CHANGE from 'problems' to 'processProblems'
  for (const templateId of config.pipeline.templates) {
    const videoId = generateVideoId(userProblem.category, templateId as any);

    // MODIFY: Skip completion check in dry-run mode
    if (!options.dryRun && stateManager.isVideoCompleted(state, videoId)) {
      logger.info(`⏭️  Skipping completed video: ${userProblem.category} × ${templateId}`);
      continue;
    }

    logger.info('');
    logger.info(`📹 Processing: ${userProblem.category} × ${templateId}`);
    logger.info(`   Problem: "${userProblem.problem}"`);
    logger.info(`   Video ID: ${videoId}`);

    // MODIFY: Skip state updates in dry-run mode
    if (!options.dryRun) {
      // Add video to state if not exists
      if (!state.videos.find(v => v.id === videoId)) {
        stateManager.addVideo(state, userProblem.category, templateId as any, videoId, config.pipeline.scenesPerVideo);
      }
    }

    try {
      // MODIFY: Skip state updates in dry-run mode
      if (!options.dryRun) {
        stateManager.updateVideoStatus(state, videoId, 'script-generation');
        await stateManager.saveState(state);
      }

      // Generate script (ALWAYS run this, even in dry-run)
      logger.info('   Step 1/2: Generating script...');
      const script = await scriptGenerator.generateScript(userProblem, templateId as any);

      if (!options.dryRun) {
        stateManager.updateVideoStatus(state, videoId, 'video-generation', script.id);
        await stateManager.saveState(state);
      }
      logger.success(`   ✓ Script generated`);

      // ADD THIS: Handle dry-run vs normal execution
      if (options.dryRun) {
        // Dry-run: Output prompts and params
        await outputDryRunData(script, userProblem, config, options);
      } else {
        // Normal: Generate videos for each scene
        logger.info(`   Step 2/2: Generating ${script.scenes.length} video clips...`);

        // ... existing video generation loop ...
      }

      // MODIFY: Skip state updates in dry-run mode
      if (!options.dryRun) {
        // Mark video as completed
        stateManager.updateVideoStatus(state, videoId, 'completed');
        await stateManager.saveState(state, true);
        logger.success(`   ✓ Video complete: ${videoId}`);
      } else {
        logger.success(`   ✓ Dry-run complete: ${videoId}`);
      }

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      logger.error(`   ✗ ${options.dryRun ? 'Script generation' : 'Video'} failed: ${errorMsg}`);

      if (!options.dryRun) {
        stateManager.updateVideoStatus(state, videoId, 'failed', undefined, errorMsg);
        stateManager.logError(state, 'script-generation', errorMsg, { videoId });
        await stateManager.saveState(state);
      }
    }
  }
}
```

**Skip final output assembly in dry-run**:

```typescript
// MODIFY: Skip final assembly in dry-run mode
if (!options.dryRun) {
  // Assemble final output
  logger.info('');
  logger.info('='.repeat(60));
  logger.info('Assembling Final Output');
  logger.info('='.repeat(60));

  const assembler = new OutputAssembler(config, state);
  const finalOutput = await assembler.assembleFinalOutput();

  // Update pipeline status
  stateManager.updatePipelineStatus(state, 'completed', 'Pipeline complete');
  await stateManager.saveState(state, true);

  // Summary
  const duration = ((Date.now() - startTime) / 1000).toFixed(1);
  logger.info('');
  logger.info('='.repeat(60));
  logger.success('✓ PIPELINE COMPLETE');
  logger.info('='.repeat(60));
  logger.info('');
  logger.info(`Summary:`);
  logger.info(`  Total Videos: ${finalOutput.summary.totalVideos}`);
  logger.info(`  Total Clips: ${finalOutput.summary.totalClips}`);
  logger.info(`  Successful: ${finalOutput.summary.successfulClips}`);
  logger.info(`  Failed: ${finalOutput.summary.failedClips}`);
  logger.info(`  Duration: ${duration}s`);
  logger.info(`  Errors: ${state.errors.length}`);
  logger.info('');
  logger.info(`Output: ${config.paths.finalOutput}`);
  logger.info('');
} else {
  // Dry-run summary
  const duration = ((Date.now() - startTime) / 1000).toFixed(1);
  logger.info('');
  logger.info('='.repeat(60));
  logger.success('✓ DRY RUN COMPLETE');
  logger.info('='.repeat(60));
  logger.info('');
  logger.info(`Duration: ${duration}s`);
  logger.info('');
  logger.info(`Dry-run outputs saved to: output/dry-run/`);
  logger.info('Copy prompts to Replicate UI for manual testing');
  logger.info('');
}
```

---

## Phase 4: Console Output Formatting

### File: `src/index.ts`

**Create helper function for dry-run console output**:

```typescript
/**
 * Output dry-run data to console
 */
async function outputDryRunConsole(
  script: VideoScript,
  userProblem: UserProblem,
  config: Config
): Promise<void> {
  logger.info('');
  logger.info('   ' + '-'.repeat(56));
  logger.info('   DRY RUN OUTPUT');
  logger.info('   ' + '-'.repeat(56));

  for (const scene of script.scenes) {
    logger.info('');
    logger.info(`   === Scene ${scene.sceneNumber} ===`);
    logger.info('');
    logger.info(`   Content:`);
    logger.info(`   "${scene.content}"`);
    logger.info('');
    logger.info(`   Prompt:`);
    logger.info(`   "${scene.prompt}"`);
    logger.info('');
    logger.info(`   Veo Parameters:`);
    logger.info(`     duration: ${config.videoGeneration.duration}`);
    logger.info(`     aspect_ratio: "${config.videoGeneration.aspectRatio}"`);
    logger.info(`     generate_audio: ${config.videoGeneration.generateAudio}`);
    if (config.videoGeneration.resolution) {
      logger.info(`     resolution: "${config.videoGeneration.resolution}"`);
    }
  }

  logger.info('');
  logger.info('   ' + '-'.repeat(56));
}
```

---

## Phase 5: Dry-Run File Generation

### File: `src/lib/dry-run-assembler.ts` (NEW)

**Create new file for dry-run output assembly**:

```typescript
/**
 * Dry-Run Assembler
 * Assembles dry-run output files for manual Veo testing
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { VideoScript, UserProblem } from '../types/script.types';
import { Config } from '../types/config.types';
import { logger } from '../utils/logger';

/**
 * Dry-run output format
 */
interface DryRunOutput {
  videoId: string;
  userProblem: string;
  category: string;
  template: string;
  scenes: Array<{
    sceneNumber: number;
    content: string;
    prompt: string;
    veoParams: {
      prompt: string;
      duration: number;
      aspect_ratio: string;
      generate_audio: boolean;
      resolution?: string;
    };
  }>;
}

/**
 * DryRunAssembler class
 */
export class DryRunAssembler {
  private config: Config;

  constructor(config: Config) {
    this.config = config;
  }

  /**
   * Assemble and save dry-run output for a video
   */
  async assembleDryRunOutput(
    script: VideoScript,
    userProblem: UserProblem
  ): Promise<void> {
    try {
      // Build dry-run output
      const dryRunOutput: DryRunOutput = {
        videoId: script.id,
        userProblem: userProblem.problem,
        category: script.category,
        template: script.template,
        scenes: script.scenes.map(scene => ({
          sceneNumber: scene.sceneNumber,
          content: scene.content,
          prompt: scene.prompt,
          veoParams: {
            prompt: scene.prompt,
            duration: this.config.videoGeneration.duration,
            aspect_ratio: this.config.videoGeneration.aspectRatio,
            generate_audio: this.config.videoGeneration.generateAudio ?? true,
            ...(this.config.videoGeneration.resolution && {
              resolution: this.config.videoGeneration.resolution
            })
          }
        }))
      };

      // Save to file
      const dryRunDir = path.join(this.config.paths.outputDir, 'dry-run');
      await fs.mkdir(dryRunDir, { recursive: true });

      const filename = `${script.id}.json`;
      const filepath = path.join(dryRunDir, filename);

      const content = JSON.stringify(dryRunOutput, null, 2);
      await fs.writeFile(filepath, content, 'utf-8');

      logger.debug(`Dry-run output saved: ${filename}`);
    } catch (error) {
      logger.error('Failed to save dry-run output:', error);
      throw error;
    }
  }
}
```

### File: `src/index.ts`

**Import and use DryRunAssembler**:

```typescript
// ADD IMPORT
import { DryRunAssembler } from './lib/dry-run-assembler';

// ... in runPipeline function ...

// Initialize generators
const templates = new Map();
for (const templateId of config.pipeline.templates) {
  templates.set(templateId, getTemplate(templateId as any));
}
const scriptGenerator = new ScriptGenerator(config, templates);
const videoGenerator = new VideoGenerator(config);

// ADD THIS - Initialize dry-run assembler if in dry-run mode
const dryRunAssembler = options.dryRun ? new DryRunAssembler(config) : null;
```

**Update outputDryRunData function**:

```typescript
/**
 * Output dry-run data (console + file)
 */
async function outputDryRunData(
  script: VideoScript,
  userProblem: UserProblem,
  config: Config,
  dryRunAssembler: DryRunAssembler | null
): Promise<void> {
  // Console output
  await outputDryRunConsole(script, userProblem, config);

  // File output
  if (dryRunAssembler) {
    await dryRunAssembler.assembleDryRunOutput(script, userProblem);
  }
}
```

**Update the call in main loop**:

```typescript
if (options.dryRun) {
  // Dry-run: Output prompts and params
  await outputDryRunData(script, userProblem, config, dryRunAssembler);
}
```

---

## Phase 6: Testing & Validation

### Manual Testing Checklist

#### Test 1: Basic Dry-Run
```bash
npm start generate --dry-run --limit=1
```

**Expected**:
- ✅ Warning message displayed
- ✅ Script generated and saved to `output/scripts/`
- ✅ Console shows prompts and Veo params
- ✅ Dry-run file created in `output/dry-run/`
- ✅ No videos generated
- ✅ No state.json created

#### Test 2: Multiple Videos
```bash
npm start generate --dry-run --limit=2
```

**Expected**:
- ✅ Two scripts generated
- ✅ Two dry-run files created
- ✅ Each file has correct format
- ✅ No videos generated

#### Test 3: Normal Mode Still Works
```bash
npm start generate --limit=1
```

**Expected**:
- ✅ Normal pipeline runs
- ✅ Video generation occurs
- ✅ State.json created
- ✅ No dry-run files created

#### Test 4: Limit Flag Works
```bash
npm start generate --dry-run
```

**Expected**:
- ✅ Processes all categories × templates (default behavior)

#### Test 5: File Format Validation
```bash
cat output/dry-run/anxiety-or-fear_direct-to-camera.json
```

**Expected structure**:
```json
{
  "videoId": "anxiety-or-fear_direct-to-camera_...",
  "userProblem": "...",
  "category": "Anxiety or fear",
  "template": "direct-to-camera",
  "scenes": [
    {
      "sceneNumber": 1,
      "content": "...",
      "prompt": "...",
      "veoParams": {
        "prompt": "...",
        "duration": 8,
        "aspect_ratio": "9:16",
        "generate_audio": true
      }
    }
  ]
}
```

### Integration Testing

#### Test 6: Copy-Paste to Replicate
1. Run dry-run mode
2. Open dry-run JSON file
3. Copy `scenes[0].veoParams.prompt`
4. Navigate to Replicate Veo 3.1 page
5. Paste prompt
6. Verify parameters match

**Expected**:
- ✅ Prompt pastes correctly
- ✅ Can set duration to 8
- ✅ Can set aspect_ratio to 9:16
- ✅ Can enable audio

### Edge Cases

#### Test 7: Empty CSV
```bash
# Modify CSV to have no matching categories
npm start generate --dry-run
```

**Expected**:
- ✅ Graceful handling
- ✅ Clear error message

#### Test 8: Invalid Flags
```bash
npm start generate --dry-run --resume
```

**Expected**:
- ✅ Either works (skips resume logic) or warns user

---

## Code Review Checklist

Before merging:

- [ ] All TypeScript compiles with no errors
- [ ] No unused imports
- [ ] Console output is clear and formatted
- [ ] File paths are correctly constructed
- [ ] Error handling is maintained
- [ ] Dry-run mode doesn't break normal mode
- [ ] State management properly skipped in dry-run
- [ ] Comments added for clarity
- [ ] Code follows existing style

---

## Implementation Order

1. **Phase 1** - CLI flag support (simplest, enables rest)
2. **Phase 2** - Directory setup (needed for file output)
3. **Phase 5** - Dry-run assembler (clean separation of concerns)
4. **Phase 3** - Pipeline control (main logic changes)
5. **Phase 4** - Console output (final polish)
6. **Phase 6** - Testing (validate everything works)

---

## Rollback Plan

If issues arise:

```bash
# Revert to previous commit
git log --oneline
git checkout <commit-before-dry-run>

# Or revert specific files
git checkout HEAD~1 src/index.ts
git checkout HEAD~1 src/lib/dry-run-assembler.ts
```

**Recovery**:
- Dry-run is additive (doesn't modify existing logic)
- Flag check: `if (options.dryRun)` can be removed to disable
- No database or state changes to worry about

---

## Known Limitations

1. **No automated Replicate testing** - Manual copy-paste required
2. **OpenAI costs still apply** - Scripts are still generated (~$0.004)
3. **No frame chaining in dry-run** - Can't test sequential scenes automatically
4. **No video duration validation** - Can't verify dialogue fits in 8s

These are acceptable for POC validation phase.

---

## Future Enhancements

### Not in this cycle, but potential additions:

1. **Automated Replicate testing** - Use Replicate API in dry-run to test actual generation
2. **Dialogue timing estimation** - Calculate expected speech duration
3. **Batch dry-run commands** - Test multiple parameter combinations
4. **Dry-run diff mode** - Compare prompts before/after template changes

---

## Success Metrics

### Implementation Complete When:
- [ ] All phases implemented
- [ ] All tests pass
- [ ] Documentation updated
- [ ] Code reviewed
- [ ] Merged to main

### Validation Complete When:
- [ ] User can generate dry-run output
- [ ] User can copy prompts to Replicate
- [ ] User can validate frame chaining approach
- [ ] Decision made on Problem 2 solution based on results

---

## Timeline Estimate

- Phase 1: 30 minutes
- Phase 2: 30 minutes
- Phase 3: 1.5 hours
- Phase 4: 30 minutes
- Phase 5: 1 hour
- Phase 6: 1 hour

**Total: ~5 hours**

---

## Next Steps

1. Review this implementation plan
2. Confirm approach with stakeholders
3. Begin Phase 1 implementation
4. Test after each phase
5. Complete all phases
6. Validate with manual Replicate testing
7. Use results to plan Problem 2 solution

---

## Related Documents

- **Requirements**: `1-requirements.md`
- **Cycle 2 Complete**: `..//cycle-2/IMPLEMENTATION-COMPLETE.md`
- **Workflow Problems**: `../../2_reference-docs/workflow-problems-and-solutions.md`
