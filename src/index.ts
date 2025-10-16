#!/usr/bin/env node
/**
 * CLI Entry Point
 * Main pipeline orchestration
 */

import 'dotenv/config';
import { Command } from 'commander';
import { loadConfig } from './config/config';
import { getTemplate } from './config/templates';
import { DataProcessor } from './lib/data-processor';
import { ScriptGenerator } from './lib/script-generator';
import { VideoGenerator } from './lib/video-generator';
import { StateManager } from './lib/state-manager';
import { OutputAssembler } from './lib/output-assembler';
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
  .action(async (options) => {
    await runPipeline(options);
  });

async function runPipeline(options: { config: string; resume: boolean; clean: boolean }) {
  const startTime = Date.now();

  try {
    logger.info('='.repeat(60));
    logger.info('Bible Video Generation Pipeline');
    logger.info('='.repeat(60));
    logger.info('');

    // Load configuration
    logger.info('Loading configuration...');
    const config = await loadConfig(options.config);
    logger.info(`✓ Config loaded: ${config.pipeline.categories.length} categories, ${config.pipeline.templates.length} templates`);

    // Initialize state manager
    const stateManager = new StateManager(config.paths.stateFile);
    let state = options.resume ? await stateManager.loadState() : null;

    if (state) {
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
    const categories = await dataProcessor.extractCategories(config.pipeline.categories);
    logger.success(`✓ Extracted ${categories.length} categories`);

    // Initialize generators
    const templates = new Map();
    for (const templateId of config.pipeline.templates) {
      templates.set(templateId, getTemplate(templateId as any));
    }
    const scriptGenerator = new ScriptGenerator(config, templates);
    const videoGenerator = new VideoGenerator(config);

    // Update state
    stateManager.updatePipelineStatus(state, 'processing', 'Generating content');
    await stateManager.saveState(state);

    // Generate videos for each category × template
    logger.info('');
    logger.info('='.repeat(60));
    logger.info('Starting Content Generation');
    logger.info('='.repeat(60));
    logger.info('');

    for (const category of categories) {
      for (const templateId of config.pipeline.templates) {
        const videoId = generateVideoId(category, templateId as any);

        // Skip if already completed
        if (stateManager.isVideoCompleted(state, videoId)) {
          logger.info(`⏭️  Skipping completed video: ${category} × ${templateId}`);
          continue;
        }

        logger.info('');
        logger.info(`📹 Processing: ${category} × ${templateId}`);
        logger.info(`   Video ID: ${videoId}`);

        // Add video to state if not exists
        if (!state.videos.find(v => v.id === videoId)) {
          stateManager.addVideo(state, category, templateId as any, videoId, config.pipeline.scenesPerVideo);
        }

        try {
          // Update video status
          stateManager.updateVideoStatus(state, videoId, 'script-generation');
          await stateManager.saveState(state);

          // Generate script
          logger.info('   Step 1/2: Generating script...');
          const script = await scriptGenerator.generateScript(category, templateId as any);
          stateManager.updateVideoStatus(state, videoId, 'video-generation', script.id);
          await stateManager.saveState(state);
          logger.success(`   ✓ Script generated`);

          // Generate videos for each scene
          logger.info(`   Step 2/2: Generating ${script.scenes.length} video clips...`);

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

              // Generate video clip
              const result = await videoGenerator.generateVideoClip(scene, videoId);

              // Update scene status
              stateManager.updateSceneStatus(state, videoId, scene.sceneNumber, {
                status: 'completed',
                predictionId: result.predictionId,
                videoPath: result.videoPath
              });
              await stateManager.saveState(state);

              logger.success(`      ✓ Scene ${scene.sceneNumber}: Complete`);

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

          // Mark video as completed
          stateManager.updateVideoStatus(state, videoId, 'completed');
          await stateManager.saveState(state, true);
          logger.success(`   ✓ Video complete: ${videoId}`);

        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : String(error);
          logger.error(`   ✗ Video failed: ${errorMsg}`);

          stateManager.updateVideoStatus(state, videoId, 'failed', undefined, errorMsg);
          stateManager.logError(state, 'script-generation', errorMsg, { videoId });
          await stateManager.saveState(state);
        }
      }
    }

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
