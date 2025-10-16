/**
 * State Manager
 * Progress tracking and state persistence for pipeline resumability
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { PipelineState, VideoState, SceneState } from '../types/state.types';
import { ProblemCategory, TemplateType } from '../types/script.types';
import { StateError } from '../utils/errors';
import { logger } from '../utils/logger';

/**
 * StateManager class for pipeline state management
 */
export class StateManager {
  private statePath: string;
  private lastSaveTime: number = 0;
  private saveDebounceMs: number = 1000; // Min 1 second between saves

  constructor(statePath: string) {
    this.statePath = statePath;
  }

  /**
   * Initialize a new pipeline state
   */
  initializeState(totalVideos: number, totalClips: number): PipelineState {
    return {
      startedAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      status: 'initializing',
      currentStep: 'Starting pipeline',
      progress: {
        totalVideos,
        completedVideos: 0,
        totalClips,
        completedClips: 0
      },
      videos: [],
      errors: []
    };
  }

  /**
   * Load state from disk
   */
  async loadState(): Promise<PipelineState | null> {
    try {
      const content = await fs.readFile(this.statePath, 'utf-8');
      const state = JSON.parse(content) as PipelineState;

      logger.info('State loaded from disk');
      logger.debug(`State: ${state.status}, Progress: ${state.progress.completedClips}/${state.progress.totalClips} clips`);

      return state;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        logger.debug('No existing state file found');
        return null;
      }
      throw new StateError(
        `Failed to load state: ${error instanceof Error ? error.message : String(error)}`,
        { statePath: this.statePath }
      );
    }
  }

  /**
   * Save state to disk (with debouncing)
   */
  async saveState(state: PipelineState, force: boolean = false): Promise<void> {
    try {
      // Debounce saves unless forced
      const now = Date.now();
      if (!force && (now - this.lastSaveTime) < this.saveDebounceMs) {
        logger.debug('Save debounced');
        return;
      }

      // Update timestamp
      state.lastUpdated = new Date().toISOString();

      // Ensure directory exists
      const dir = path.dirname(this.statePath);
      await fs.mkdir(dir, { recursive: true });

      // Atomic write using temp file + rename
      const tempPath = `${this.statePath}.tmp`;
      const content = JSON.stringify(state, null, 2);

      await fs.writeFile(tempPath, content, 'utf-8');
      await fs.rename(tempPath, this.statePath);

      this.lastSaveTime = now;
      logger.debug('State saved to disk');
    } catch (error) {
      throw new StateError(
        `Failed to save state: ${error instanceof Error ? error.message : String(error)}`,
        { statePath: this.statePath }
      );
    }
  }

  /**
   * Add a video to the state
   */
  addVideo(
    state: PipelineState,
    category: ProblemCategory,
    template: TemplateType,
    videoId: string,
    scenesCount: number
  ): void {
    const videoState: VideoState = {
      id: videoId,
      category,
      template,
      status: 'pending',
      scenes: Array.from({ length: scenesCount }, (_, i) => ({
        sceneNumber: i + 1,
        status: 'pending',
        attempts: 0
      }))
    };

    state.videos.push(videoState);
  }

  /**
   * Update video status
   */
  updateVideoStatus(
    state: PipelineState,
    videoId: string,
    status: VideoState['status'],
    scriptPath?: string,
    error?: string
  ): void {
    const video = state.videos.find(v => v.id === videoId);
    if (!video) {
      throw new StateError(`Video not found: ${videoId}`, { videoId });
    }

    video.status = status;
    if (scriptPath) video.scriptPath = scriptPath;
    if (error) video.error = error;

    // Update progress
    if (status === 'completed') {
      state.progress.completedVideos++;
    }
  }

  /**
   * Update scene status
   */
  updateSceneStatus(
    state: PipelineState,
    videoId: string,
    sceneNumber: number,
    sceneUpdate: Partial<SceneState>
  ): void {
    const video = state.videos.find(v => v.id === videoId);
    if (!video) {
      throw new StateError(`Video not found: ${videoId}`, { videoId });
    }

    const scene = video.scenes.find(s => s.sceneNumber === sceneNumber);
    if (!scene) {
      throw new StateError(
        `Scene not found: ${sceneNumber}`,
        { videoId, sceneNumber }
      );
    }

    // Update scene properties
    Object.assign(scene, sceneUpdate);

    // Update progress if completed
    if (sceneUpdate.status === 'completed' && scene.status !== 'completed') {
      state.progress.completedClips++;
    }
  }

  /**
   * Log an error
   */
  logError(
    state: PipelineState,
    stage: string,
    error: string,
    context: Record<string, unknown>
  ): void {
    state.errors.push({
      timestamp: new Date().toISOString(),
      stage,
      error,
      context
    });
  }

  /**
   * Update pipeline status and current step
   */
  updatePipelineStatus(
    state: PipelineState,
    status: PipelineState['status'],
    currentStep: string
  ): void {
    state.status = status;
    state.currentStep = currentStep;
  }

  /**
   * Check if a video is completed
   */
  isVideoCompleted(state: PipelineState, videoId: string): boolean {
    const video = state.videos.find(v => v.id === videoId);
    return video?.status === 'completed';
  }

  /**
   * Check if a scene is completed
   */
  isSceneCompleted(state: PipelineState, videoId: string, sceneNumber: number): boolean {
    const video = state.videos.find(v => v.id === videoId);
    const scene = video?.scenes.find(s => s.sceneNumber === sceneNumber);
    return scene?.status === 'completed';
  }

  /**
   * Get incomplete videos
   */
  getIncompleteVideos(state: PipelineState): VideoState[] {
    return state.videos.filter(v => v.status !== 'completed');
  }

  /**
   * Get incomplete scenes for a video
   */
  getIncompleteScenes(state: PipelineState, videoId: string): SceneState[] {
    const video = state.videos.find(v => v.id === videoId);
    if (!video) return [];
    return video.scenes.filter(s => s.status !== 'completed');
  }

  /**
   * Calculate progress percentage
   */
  getProgressPercentage(state: PipelineState): number {
    if (state.progress.totalClips === 0) return 0;
    return Math.round((state.progress.completedClips / state.progress.totalClips) * 100);
  }

  /**
   * Get summary statistics
   */
  getSummary(state: PipelineState): string {
    const percentage = this.getProgressPercentage(state);
    const { completedVideos, totalVideos, completedClips, totalClips } = state.progress;

    return [
      `Status: ${state.status}`,
      `Progress: ${percentage}%`,
      `Videos: ${completedVideos}/${totalVideos}`,
      `Clips: ${completedClips}/${totalClips}`,
      `Errors: ${state.errors.length}`
    ].join(' | ');
  }
}
