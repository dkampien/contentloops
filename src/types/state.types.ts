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
  id: string;
  category: ProblemCategory;
  template: TemplateType;
  status: VideoStatus;
  scriptPath?: string;
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
