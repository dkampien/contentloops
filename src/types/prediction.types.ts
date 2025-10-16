/**
 * Prediction Types
 * Type definitions for Replicate API predictions
 */

// Replicate prediction status
export type PredictionStatus =
  | "starting"
  | "processing"
  | "succeeded"
  | "failed"
  | "canceled"
  | "aborted";

// Replicate prediction interface (from replicate-javascript SDK)
export interface Prediction {
  id: string;
  status: PredictionStatus;
  model: string;
  version: string;
  input: {
    prompt: string;
    aspect_ratio?: string;
    duration?: number;
  };
  output?: string | string[];      // Video URL(s)
  error?: unknown;
  logs?: string;
  metrics?: {
    predict_time?: number;
  };
  created_at: string;
  started_at?: string;
  completed_at?: string;
  urls: {
    get: string;
    cancel: string;
  };
}
