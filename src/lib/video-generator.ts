/**
 * Video Generator
 * Replicate API integration for Veo 3 video generation
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import Replicate from 'replicate';
import { Scene } from '../types/script.types';
import { Prediction } from '../types/prediction.types';
import { Config } from '../types/config.types';
import { VideoGenerationError } from '../utils/errors';
import { logger } from '../utils/logger';
import { withRetry, generateClipPath } from '../utils/helpers';

/**
 * VideoGenerator class for Veo 3 video generation
 */
export class VideoGenerator {
  private client: Replicate;
  private config: Config;

  constructor(config: Config) {
    this.config = config;
    this.client = new Replicate({
      auth: config.apis.replicate.apiKey
    });
  }

  /**
   * Generate a video clip for a scene
   */
  async generateVideoClip(
    scene: Scene,
    videoId: string
  ): Promise<{ videoPath: string; predictionId: string; predictTime?: number }> {
    try {
      logger.info(`Generating video clip: Scene ${scene.sceneNumber}`);
      logger.debug(`Prompt: ${scene.prompt.substring(0, 100)}...`);

      // Generate with retry logic
      const result = await withRetry(
        async () => await this.createAndWaitForVideo(scene),
        {
          maxRetries: this.config.apis.replicate.maxRetries,
          backoff: 'exponential',
          baseDelay: 5000,
          onRetry: (attempt, error) => {
            logger.warn(`Video generation retry ${attempt}:`, error.message);
          }
        }
      );

      // Generate output path
      const clipPath = generateClipPath(
        this.config.paths.videosDir,
        videoId,
        scene.sceneNumber
      );

      // Download video
      await this.downloadVideo(result.videoUrl, clipPath);

      logger.success(`Video clip generated: ${path.basename(clipPath)}`);

      return {
        videoPath: clipPath,
        predictionId: result.predictionId,
        predictTime: result.predictTime
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`Video generation failed for Scene ${scene.sceneNumber}:`, errorMessage);

      throw new VideoGenerationError(
        `Failed to generate video clip: ${errorMessage}`,
        { sceneNumber: scene.sceneNumber, prompt: scene.prompt }
      );
    }
  }

  /**
   * Create prediction and wait for completion
   */
  private async createAndWaitForVideo(
    scene: Scene
  ): Promise<{ videoUrl: string; predictionId: string; predictTime?: number }> {
    try {
      logger.debug('Creating Replicate prediction...');

      // Create prediction with Veo 3 parameters
      const input: any = {
        prompt: scene.prompt,
        aspect_ratio: this.config.videoGeneration.aspectRatio,
        duration: this.config.videoGeneration.duration
      };

      // Add optional parameters if configured
      if (this.config.videoGeneration.resolution) {
        input.resolution = this.config.videoGeneration.resolution;
      }
      if (this.config.videoGeneration.generateAudio !== undefined) {
        input.generate_audio = this.config.videoGeneration.generateAudio;
      }

      const prediction = await this.client.predictions.create({
        model: this.config.apis.replicate.model,
        input
      });

      logger.debug(`Prediction created: ${prediction.id}`);
      logger.info('Waiting for video generation to complete...');

      // Wait for completion with polling
      const completed = await this.waitForPrediction(prediction);

      // Check status
      if (completed.status === 'succeeded') {
        const videoUrl = this.extractVideoUrl(completed.output);

        return {
          videoUrl,
          predictionId: completed.id,
          predictTime: completed.metrics?.predict_time
        };
      } else if (completed.status === 'failed') {
        throw new VideoGenerationError(
          `Prediction failed: ${JSON.stringify(completed.error)}`,
          { predictionId: completed.id, sceneNumber: scene.sceneNumber }
        );
      } else if (completed.status === 'canceled') {
        throw new VideoGenerationError(
          'Prediction was canceled',
          { predictionId: completed.id, sceneNumber: scene.sceneNumber }
        );
      } else {
        throw new VideoGenerationError(
          `Unexpected prediction status: ${completed.status}`,
          { predictionId: completed.id, sceneNumber: scene.sceneNumber }
        );
      }
    } catch (error) {
      if (error instanceof VideoGenerationError) {
        throw error;
      }
      throw new VideoGenerationError(
        `Replicate API error: ${error instanceof Error ? error.message : String(error)}`,
        { sceneNumber: scene.sceneNumber }
      );
    }
  }

  /**
   * Wait for prediction to complete with polling
   */
  private async waitForPrediction(prediction: any): Promise<Prediction> {
    try {
      // Use Replicate's built-in wait function
      const completed = await this.client.wait(prediction, {
        interval: this.config.apis.replicate.pollingInterval
      });

      return completed as Prediction;
    } catch (error) {
      throw new VideoGenerationError(
        `Failed to wait for prediction: ${error instanceof Error ? error.message : String(error)}`,
        { predictionId: prediction.id }
      );
    }
  }

  /**
   * Extract video URL from prediction output
   */
  private extractVideoUrl(output: unknown): string {
    // Output can be a string URL or an array of URLs
    if (typeof output === 'string') {
      return output;
    } else if (Array.isArray(output) && output.length > 0) {
      return output[0];
    } else {
      throw new VideoGenerationError(
        'Invalid output format from Replicate',
        { output }
      );
    }
  }

  /**
   * Download video from URL to local file
   */
  private async downloadVideo(url: string, filePath: string): Promise<void> {
    try {
      logger.debug(`Downloading video from: ${url}`);

      // Ensure directory exists
      const dir = path.dirname(filePath);
      await fs.mkdir(dir, { recursive: true });

      // Fetch video
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Get content as buffer
      const buffer = await response.arrayBuffer();

      // Write to file
      await fs.writeFile(filePath, Buffer.from(buffer));

      // Log file size
      const stats = await fs.stat(filePath);
      logger.debug(`Video downloaded: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
    } catch (error) {
      throw new VideoGenerationError(
        `Failed to download video: ${error instanceof Error ? error.message : String(error)}`,
        { url, filePath }
      );
    }
  }

  /**
   * Get prediction status (for resuming interrupted jobs)
   */
  async getPredictionStatus(predictionId: string): Promise<Prediction> {
    try {
      const prediction = await this.client.predictions.get(predictionId);
      return prediction as Prediction;
    } catch (error) {
      throw new VideoGenerationError(
        `Failed to get prediction status: ${error instanceof Error ? error.message : String(error)}`,
        { predictionId }
      );
    }
  }

  /**
   * Cancel a prediction
   */
  async cancelPrediction(predictionId: string): Promise<void> {
    try {
      await this.client.predictions.cancel(predictionId);
      logger.info(`Prediction canceled: ${predictionId}`);
    } catch (error) {
      logger.warn(`Failed to cancel prediction ${predictionId}:`, error);
      // Don't throw - cancellation failures are not critical
    }
  }
}
