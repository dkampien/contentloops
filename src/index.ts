#!/usr/bin/env node
/**
 * CLI Entry Point
 * Main pipeline orchestration
 */

import 'dotenv/config';
import { Command } from 'commander';
import * as fs from 'fs/promises';
import * as path from 'path';
import { loadConfig } from './config/config';
import { getTemplate } from './config/templates';
import { DataProcessor } from './lib/data-processor';
import { ScriptGenerator } from './lib/script-generator';
import { VideoGenerator } from './lib/video-generator';
import { StateManager } from './lib/state-manager';
import { OutputAssembler } from './lib/output-assembler';
import { ManifestCreator } from './lib/manifest-creator';
import { logger } from './utils/logger';
import { generateVideoId } from './utils/helpers';

const program = new Command();

program
  .name('bible-video-gen')
  .description('Generate AI video content from problem categories')
  .version('0.1.0');

program
  .command('generate')
  .description('Run the video generation pipeline')
  .option('-c, --config <path>', 'Path to config file', './config.json')
  .option('--resume', 'Resume from last saved state', false)
  .option('--clean', 'Clean output directory before starting', false)
  .option('--dry-run', 'Generate scripts only without video generation', false)
  .option('--limit <number>', 'Limit absolute number of videos to generate', parseInt)
  .option('--template <template>', 'Filter to specific template (e.g., direct-to-camera)')
  .action(async (options) => {
    await runPipeline(options);
  });

async function runPipeline(options: {
  config: string;
  resume: boolean;
  clean: boolean;
  dryRun: boolean;
  limit?: number;
  template?: string;
}) {
  const startTime = Date.now();

  try {
    logger.info('='.repeat(60));
    logger.info('Bible Video Generation Pipeline');
    logger.info('='.repeat(60));
    logger.info('');

    // Load configuration
    logger.info('Loading configuration...');
    const config = await loadConfig(options.config);

    // Apply CLI template filter to override config
    if (options.template) {
      config.pipeline.templates = [options.template];
      logger.info(`✓ Template filter applied: ${options.template}`);
    }

    logger.info(`✓ Config loaded: ${config.pipeline.categories.length} categories, ${config.pipeline.templates.length} templates`);

    // Dry-run mode setup
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

    // Initialize state manager
    const stateManager = new StateManager(config.paths.stateFile);
    let state = options.resume && !options.dryRun ? await stateManager.loadState() : null;

    if (options.dryRun) {
      // Create dummy state for dry-run mode (won't be saved)
      const categoryCount = Array.isArray(config.pipeline.categories)
        ? config.pipeline.categories.length
        : 0;
      const totalVideos = categoryCount * config.pipeline.templates.length;
      const totalClips = totalVideos * config.pipeline.scenesPerVideo;
      state = stateManager.initializeState(totalVideos, totalClips);
      logger.debug('State management skipped (dry-run mode - using dummy state)');
    } else if (state) {
      logger.info(`✓ Resuming from previous state (${stateManager.getProgressPercentage(state)}% complete)`);
    } else {
      // Calculate totals
      const categoryCount = Array.isArray(config.pipeline.categories)
        ? config.pipeline.categories.length
        : 0;
      const totalVideos = categoryCount * config.pipeline.templates.length;
      const totalClips = totalVideos * config.pipeline.scenesPerVideo;

      state = stateManager.initializeState(totalVideos, totalClips);
      logger.info(`✓ Pipeline initialized: ${totalVideos} videos, ${totalClips} clips`);
    }

    // Process CSV data
    logger.info('');
    logger.info('Processing CSV data...');
    const dataProcessor = new DataProcessor(config.paths.csvInput);
    const problems = await dataProcessor.extractProblems(config.pipeline.categories);
    logger.success(`✓ Extracted ${problems.length} problems from CSV`);

    // Calculate expected video count (problems × templates)
    const expectedVideoCount = problems.length * config.pipeline.templates.length;

    if (options.limit && options.limit > 0) {
      logger.info(`✓ Video limit set: ${options.limit} (will stop after generating ${options.limit} videos)`);
    } else {
      logger.info(`✓ Will generate ${expectedVideoCount} videos (${problems.length} problems × ${config.pipeline.templates.length} templates)`);
    }

    // Initialize generators
    const templates = new Map();
    for (const templateId of config.pipeline.templates) {
      templates.set(templateId, getTemplate(templateId as any));
    }
    const scriptGenerator = new ScriptGenerator(config, templates);
    const videoGenerator = new VideoGenerator(config);
    const manifestCreator = new ManifestCreator(config);

    // Update state (skip in dry-run mode)
    if (!options.dryRun) {
      stateManager.updatePipelineStatus(state, 'processing', 'Generating content');
      await stateManager.saveState(state);
    }

    // Generate videos for each category × template
    logger.info('');
    logger.info('='.repeat(60));
    logger.info(options.dryRun ? 'Starting Script Generation (Dry-Run)' : 'Starting Content Generation');
    logger.info('='.repeat(60));
    logger.info('');

    let videosGenerated = 0;

    outerLoop: for (const userProblem of problems) {
      for (const templateId of config.pipeline.templates) {
        // Check if we've hit the limit
        if (options.limit && videosGenerated >= options.limit) {
          logger.info('');
          logger.info(`✓ Reached video limit (${options.limit}), stopping generation`);
          break outerLoop;
        }

        const videoId = generateVideoId(userProblem.category, templateId as any);

        // Skip if already completed (skip check in dry-run mode)
        if (!options.dryRun && stateManager.isVideoCompleted(state, videoId)) {
          logger.info(`⏭️  Skipping completed video: ${userProblem.category} × ${templateId}`);
          continue;
        }

        logger.info('');
        logger.info(`📹 Processing: ${userProblem.category} × ${templateId}`);
        logger.info(`   Problem: "${userProblem.problem}"`);
        logger.info(`   Video ID: ${videoId}`);

        // Add video to state if not exists (skip in dry-run mode)
        if (!options.dryRun && !state.videos.find(v => v.id === videoId)) {
          stateManager.addVideo(state, userProblem.category, templateId as any, videoId, config.pipeline.scenesPerVideo);
        }

        try {
          // Update video status (skip in dry-run mode)
          if (!options.dryRun) {
            stateManager.updateVideoStatus(state, videoId, 'script-generation');
            await stateManager.saveState(state);
          }

          // Generate script
          logger.info('   Step 1/2: Generating script...');
          const script = await scriptGenerator.generateScript(userProblem, templateId as any);
          logger.success(`   ✓ Script generated`);

          // Create manifest immediately after script generation
          if (!options.dryRun) {
            logger.info('   Creating manifest...');
            const manifestPath = await manifestCreator.createManifest(
              script,
              userProblem,
              'script-generated',
              null  // No finalVideoPath yet
            );
            stateManager.updateVideoManifestPath(state, videoId, manifestPath);
            stateManager.updateVideoStatus(state, videoId, 'video-generation');
            await stateManager.saveState(state);
            logger.success(`   ✓ Manifest created`);
          }

          // Handle dry-run vs normal execution
          if (options.dryRun) {
            // Dry-run: Create manifest with dry-run status
            logger.info('   Creating dry-run manifest...');
            await manifestCreator.createManifest(
              script,
              userProblem,
              'dry-run',
              null  // No finalVideoPath for dry-runs
            );
            logger.success(`   ✓ Dry-run manifest created`);
            logger.success(`   ✓ Dry-run complete: ${videoId}`);
          } else {
            // Normal: Generate videos for each scene
            logger.info(`   Step 2/2: Generating ${script.scenes.length} video clips...`);

            let previousFramePath: string | undefined;

            // Get video folder name from state
            const videoState = state.videos.find(v => v.id === videoId);
            const videoFolderName = videoState?.videoFolderName || videoId;

            for (const scene of script.scenes) {
              // Skip if scene already completed
              if (stateManager.isSceneCompleted(state, videoId, scene.sceneNumber)) {
                logger.info(`      ⏭️  Scene ${scene.sceneNumber}: Already completed`);
                continue;
              }

              try {
                // Update scene status
                stateManager.updateSceneStatus(state, videoId, scene.sceneNumber, {
                  status: 'generating',
                  attempts: (state.videos.find(v => v.id === videoId)?.scenes.find(s => s.sceneNumber === scene.sceneNumber)?.attempts || 0) + 1
                });
                await stateManager.saveState(state);

                logger.info(`      Scene ${scene.sceneNumber}: Generating...`);

                // Generate video clip (with frame chaining for scenes 2-3)
                const result = await videoGenerator.generateVideoClip(scene, videoFolderName, previousFramePath);

                // Update scene status
                stateManager.updateSceneStatus(state, videoId, scene.sceneNumber, {
                  status: 'completed',
                  predictionId: result.predictionId,
                  videoPath: result.videoPath
                });
                await stateManager.saveState(state);

                logger.success(`      ✓ Scene ${scene.sceneNumber}: Complete`);

                // Extract last frame for next scene (scenes 1-2 only)
                if (scene.sceneNumber < 3) {
                  previousFramePath = await videoGenerator.extractLastFrame(
                    result.videoPath,
                    videoFolderName,
                    scene.sceneNumber
                  );
                }

                // Show progress
                const percentage = stateManager.getProgressPercentage(state);
                logger.info(`      Progress: ${percentage}%`);

              } catch (error) {
                const errorMsg = error instanceof Error ? error.message : String(error);
                logger.error(`      ✗ Scene ${scene.sceneNumber} failed: ${errorMsg}`);

                stateManager.updateSceneStatus(state, videoId, scene.sceneNumber, {
                  status: 'failed',
                  error: errorMsg
                });
                stateManager.logError(state, 'video-generation', errorMsg, {
                  videoId,
                  sceneNumber: scene.sceneNumber
                });
                await stateManager.saveState(state);
              }
            }

            // Combine all scenes into final video
            logger.info('   Combining scenes...');
            const finalVideoPath = await videoGenerator.combineScenes(videoFolderName);
            logger.success(`   ✓ Final video created: ${path.basename(finalVideoPath)}`);

            // Update state with combined video path
            stateManager.updateVideoFinalPath(state, videoId, finalVideoPath);
            await stateManager.saveState(state);

            // Update manifest with final video path
            logger.info('   Updating manifest...');
            const video = state.videos.find(v => v.id === videoId);
            if (video?.manifestPath) {
              await manifestCreator.updateManifest(video.manifestPath, finalVideoPath, 'completed');
              logger.success(`   ✓ Manifest updated`);
            }

            // Mark video as completed
            stateManager.updateVideoStatus(state, videoId, 'completed');
            await stateManager.saveState(state, true);
            logger.success(`   ✓ Video complete: ${videoId}`);
          }

        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : String(error);
          logger.error(`   ✗ ${options.dryRun ? 'Script generation' : 'Video'} failed: ${errorMsg}`);

          if (!options.dryRun) {
            stateManager.updateVideoStatus(state, videoId, 'failed', errorMsg);
            stateManager.logError(state, 'script-generation', errorMsg, { videoId });
            await stateManager.saveState(state);
          }
        }

        // Increment video counter (counts both successful and failed videos)
        videosGenerated++;
      }
    }

    // Assemble final output (skip in dry-run mode)
    if (!options.dryRun) {
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
      logger.info(`Dry-run outputs saved to: ${path.join(config.paths.outputDir, 'dry-run')}/`);
      logger.info('Copy prompts to Replicate UI for manual testing');
      logger.info('');
    }

    process.exit(0);

  } catch (error) {
    logger.error('');
    logger.error('='.repeat(60));
    logger.error('✗ PIPELINE FAILED');
    logger.error('='.repeat(60));
    logger.error('');
    logger.error('Error:', error);
    logger.error('');

    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', () => {
  logger.warn('');
  logger.warn('Received SIGINT, saving state and exiting...');
  logger.warn('Run with --resume to continue');
  process.exit(0);
});

process.on('SIGTERM', () => {
  logger.warn('');
  logger.warn('Received SIGTERM, saving state and exiting...');
  logger.warn('Run with --resume to continue');
  process.exit(0);
});

program.parse();
