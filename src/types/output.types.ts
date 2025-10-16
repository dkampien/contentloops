/**
 * Output Types
 * Type definitions for final output JSON structure
 */

// Final output interface
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

// Video output
export interface VideoOutput {
  id: string;
  category: string;
  template: string;
  scriptPath: string;
  clips: ClipOutput[];
}

// Clip output
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
