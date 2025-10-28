/**
 * Output Types
 * Type definitions for manifest and output structures
 */

import { ProblemCategory, TemplateType } from './script.types';

// Manifest scene structure (simplified from VideoScript Scene)
export interface ManifestScene {
  sceneNumber: number;
  prompt: string;
}

// Template-specific content structures

// Direct-to-camera template content
export interface D2CManifestContent {
  videoScript: string;
  voiceScript: string;
}

// Text-visuals template content (placeholder for future)
export interface TextVisualsManifestContent {
  headlines?: string[];
  bodyText?: string;
}

// Manifest status
export type ManifestStatus =
  | "dry-run"           // Dry-run mode (script only, no videos)
  | "script-generated"  // Script done, videos not started
  | "completed"         // All videos done
  | "failed";           // Video generation failed

// Main manifest structure
export interface Manifest {
  // Universal metadata
  videoId: string;
  problemCategory: string;       // renamed from "category"
  contentTemplate: string;        // renamed from "template"
  timestamp: string;              // ISO 8601
  userProblem: string;
  status: ManifestStatus;         // Current state of this manifest

  // Template-specific content (flexible)
  content: D2CManifestContent | TextVisualsManifestContent | Record<string, any>;

  // Universal scenes (all templates use Veo)
  scenes: ManifestScene[];

  // Output paths
  finalVideoPath: string | null;  // null until videos complete
}

// Legacy types for OutputAssembler (aggregate final output, not per-video manifest)

export interface ClipOutput {
  sceneNumber: number;
  videoPath: string;
  prompt: string;
  duration: number;
  metadata: {
    predictionId: string;
    generatedAt: string;
    predictTime?: number;
  };
}

export interface VideoOutput {
  id: string;
  category: ProblemCategory;
  template: TemplateType;
  clips: ClipOutput[];
}

export interface FinalOutput {
  generatedAt: string;
  summary: {
    totalVideos: number;
    totalClips: number;
    successfulClips: number;
    failedClips: number;
  };
  videos: VideoOutput[];
}
