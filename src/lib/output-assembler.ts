/**
 * Output Assembler
 * Generates final JSON output with metadata
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { FinalOutput, VideoOutput, ClipOutput } from '../types/output.types';
import { PipelineState } from '../types/state.types';
import { Config } from '../types/config.types';
import { PipelineError } from '../utils/errors';
import { logger } from '../utils/logger';

/**
 * OutputAssembler class for final output generation
 */
export class OutputAssembler {
  private config: Config;
  private state: PipelineState;

  constructor(config: Config, state: PipelineState) {
    this.config = config;
    this.state = state;
  }

  /**
   * Assemble final output JSON
   */
  async assembleFinalOutput(): Promise<FinalOutput> {
    try {
      logger.info('Assembling final output...');

      // Validate assets exist
      await this.validateAssets();

      // Build video outputs
      const videos: VideoOutput[] = [];

      for (const videoState of this.state.videos) {
        // Skip incomplete videos
        if (videoState.status !== 'completed') {
          logger.warn(`Skipping incomplete video: ${videoState.id}`);
          continue;
        }

        // Build clips
        const clips: ClipOutput[] = [];

        for (const sceneState of videoState.scenes) {
          if (sceneState.status === 'completed' && sceneState.videoPath) {
            // Get video duration (default to config)
            const duration = this.config.videoGeneration.duration;

            // Find prediction time if available
            const predictTime = await this.getVideoMetadata(sceneState.videoPath);

            clips.push({
              sceneNumber: sceneState.sceneNumber,
              videoPath: sceneState.videoPath,
              prompt: await this.getScenePrompt(videoState.manifestPath, sceneState.sceneNumber),
              duration,
              metadata: {
                predictionId: sceneState.predictionId || 'unknown',
                generatedAt: this.state.lastUpdated,
                predictTime
              }
            });
          }
        }

        // Add video output
        videos.push({
          id: videoState.id,
          category: videoState.category,
          template: videoState.template,
          clips
        });
      }

      // Calculate summary statistics
      const summary = {
        totalVideos: this.state.progress.totalVideos,
        totalClips: this.state.progress.totalClips,
        successfulClips: this.state.progress.completedClips,
        failedClips: this.state.progress.totalClips - this.state.progress.completedClips
      };

      const finalOutput: FinalOutput = {
        generatedAt: new Date().toISOString(),
        summary,
        videos
      };

      // Save to disk
      await this.saveFinalOutput(finalOutput);

      logger.success(`Final output assembled: ${videos.length} videos, ${summary.successfulClips} clips`);

      return finalOutput;
    } catch (error) {
      throw new PipelineError(
        `Failed to assemble final output: ${error instanceof Error ? error.message : String(error)}`,
        'output-assembly'
      );
    }
  }

  /**
   * Validate that all assets exist
   */
  private async validateAssets(): Promise<void> {
    logger.debug('Validating assets...');

    for (const video of this.state.videos) {
      // Check manifest file
      if (video.manifestPath) {
        try {
          await fs.access(video.manifestPath);
        } catch {
          logger.warn(`Manifest file missing: ${video.id}`);
        }
      }

      // Check video clips
      for (const scene of video.scenes) {
        if (scene.videoPath) {
          try {
            await fs.access(scene.videoPath);
          } catch {
            logger.warn(`Video file missing: ${scene.videoPath}`);
          }
        }
      }
    }

    logger.debug('Asset validation complete');
  }

  /**
   * Get video file metadata
   */
  private async getVideoMetadata(videoPath: string): Promise<number | undefined> {
    try {
      const stats = await fs.stat(videoPath);
      // Return file size as a simple metadata (in bytes)
      // In a real implementation, you might extract duration from video metadata
      return stats.size;
    } catch {
      return undefined;
    }
  }

  /**
   * Get scene prompt from manifest file
   */
  private async getScenePrompt(manifestPath: string | undefined, sceneNumber: number): Promise<string> {
    if (!manifestPath) {
      return '';
    }

    try {
      const content = await fs.readFile(manifestPath, 'utf-8');
      const manifest = JSON.parse(content);

      const scene = manifest.scenes?.find((s: any) => s.sceneNumber === sceneNumber);
      return scene?.prompt || '';
    } catch {
      return '';
    }
  }

  /**
   * Save final output to disk
   */
  private async saveFinalOutput(output: FinalOutput): Promise<void> {
    try {
      const outputPath = this.config.paths.finalOutput;

      // Ensure directory exists
      const dir = path.dirname(outputPath);
      await fs.mkdir(dir, { recursive: true });

      // Write JSON file
      const content = JSON.stringify(output, null, 2);
      await fs.writeFile(outputPath, content, 'utf-8');

      logger.info(`Final output saved to: ${outputPath}`);
    } catch (error) {
      throw new PipelineError(
        `Failed to save final output: ${error instanceof Error ? error.message : String(error)}`,
        'output-save',
        { outputPath: this.config.paths.finalOutput }
      );
    }
  }
}
