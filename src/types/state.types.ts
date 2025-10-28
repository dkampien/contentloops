/**
 * State Types
 * Type definitions for pipeline state management
 */

import { ProblemCategory, TemplateType } from './script.types';

// Pipeline status
export type PipelineStatus =
  | "initializing"
  | "processing"
  | "completed"
  | "failed";

// Video status
export type VideoStatus =
  | "pending"
  | "script-generation"
  | "video-generation"
  | "completed"
  | "failed";

// Scene status for state
export type SceneStateStatus =
  | "pending"
  | "queued"
  | "generating"
  | "completed"
  | "failed";

// Pipeline state
export interface PipelineState {
  startedAt: string;
  lastUpdated: string;
  status: PipelineStatus;
  currentStep: string;
  progress: {
    totalVideos: number;
    completedVideos: number;
    totalClips: number;
    completedClips: number;
  };
  videos: VideoState[];
  errors: ErrorLog[];
}

// Video state
export interface VideoState {
  id: string;                // Logical ID (e.g., "anxiety-or-fear_direct-to-camera")
  videoFolderName: string;   // Timestamped folder name (e.g., "anxiety-or-fear_direct-to-camera_2025-10-24...")
  category: ProblemCategory;
  template: TemplateType;
  status: VideoStatus;
  manifestPath?: string;     // Path to manifest file (timestamped)
  finalVideoPath?: string;   // Path to combined video
  scenes: SceneState[];
  error?: string;
}

// Scene state
export interface SceneState {
  sceneNumber: number;
  status: SceneStateStatus;
  predictionId?: string;
  videoPath?: string;
  attempts: number;
  error?: string;
}

// Error log
export interface ErrorLog {
  timestamp: string;
  stage: string;
  error: string;
  context: Record<string, unknown>;
}
