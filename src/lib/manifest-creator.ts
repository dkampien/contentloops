/**
 * Manifest Creator
 * Creates per-video JSON manifests
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { Manifest, D2CManifestContent, ManifestStatus } from '../types/output.types';
import { VideoScript, UserProblem } from '../types/script.types';
import { Config } from '../types/config.types';
import { logger } from '../utils/logger';
import { generateManifestPath } from '../utils/helpers';

/**
 * ManifestCreator class for per-video manifest generation
 */
export class ManifestCreator {
  private config: Config;

  constructor(config: Config) {
    this.config = config;
  }

  /**
   * Create and save manifest for a video
   * Returns the manifest file path
   */
  async createManifest(
    script: VideoScript,
    userProblem: UserProblem,
    status: ManifestStatus = 'script-generated',
    finalVideoPath: string | null = null
  ): Promise<string> {
    try {
      logger.debug(`Creating manifest for ${script.id}...`);

      // Generate timestamped path (with dry-run prefix if applicable)
      const isDryRun = status === 'dry-run';
      const manifestPath = generateManifestPath(
        this.config.paths.manifestsDir,
        script.category,
        script.template,
        isDryRun
      );

      // Build manifest object
      const manifest: Manifest = {
        // Universal metadata
        videoId: script.id,
        problemCategory: script.category,
        contentTemplate: script.template,
        timestamp: script.timestamp,
        userProblem: userProblem.problem,
        status,

        // Template-specific content
        content: this.buildContentForTemplate(script),

        // Universal scenes (prompts only)
        scenes: script.scenes.map(scene => ({
          sceneNumber: scene.sceneNumber,
          prompt: scene.prompt
        })),

        // Output paths
        finalVideoPath
      };

      // Save manifest to disk
      await this.saveManifest(manifest, manifestPath);

      logger.debug(`Manifest saved: ${path.basename(manifestPath)}`);

      return manifestPath;
    } catch (error) {
      logger.error(`Failed to create manifest for ${script.id}:`, error);
      throw error;
    }
  }

  /**
   * Build template-specific content structure
   */
  private buildContentForTemplate(script: VideoScript): D2CManifestContent | Record<string, any> {
    if (script.template === 'direct-to-camera') {
      return {
        videoScript: script.videoScript,
        voiceScript: script.voiceScript
      } as D2CManifestContent;
    } else if (script.template === 'text-visuals') {
      // Placeholder for future text-visuals template
      return {
        headlines: [],
        bodyText: ''
      };
    } else {
      // Generic fallback
      return {};
    }
  }

  /**
   * Update existing manifest with finalVideoPath and status
   */
  async updateManifest(
    manifestPath: string,
    finalVideoPath: string,
    status: ManifestStatus = 'completed'
  ): Promise<void> {
    try {
      logger.debug(`Updating manifest: ${path.basename(manifestPath)}...`);

      // Read existing manifest
      const content = await fs.readFile(manifestPath, 'utf-8');
      const manifest: Manifest = JSON.parse(content);

      // Update fields
      manifest.finalVideoPath = finalVideoPath;
      manifest.status = status;

      // Save back to disk
      await this.saveManifest(manifest, manifestPath);

      logger.debug(`Manifest updated: ${path.basename(manifestPath)}`);
    } catch (error) {
      logger.error(`Failed to update manifest: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Save manifest to disk
   */
  private async saveManifest(manifest: Manifest, manifestPath: string): Promise<void> {
    try {
      // Ensure directory exists
      await fs.mkdir(this.config.paths.manifestsDir, { recursive: true });

      // Write JSON file
      const content = JSON.stringify(manifest, null, 2);
      await fs.writeFile(manifestPath, content, 'utf-8');

      logger.debug(`Manifest written: ${manifestPath}`);
    } catch (error) {
      throw new Error(
        `Failed to save manifest: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
}
