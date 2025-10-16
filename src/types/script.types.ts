/**
 * Script Types
 * Type definitions for video scripts, scenes, and templates
 */

import { z } from 'zod';

// Problem categories from CSV
export type ProblemCategory =
  | "Anxiety or fear"
  | "Stress or burnout"
  | "Finances or provision"
  | "Purpose or direction"
  | "Loneliness or heartbreak"
  | "Family or relationships"
  | "Addiction or temptation"
  | "Health or healing"
  | "Grief or loss";

// Template types
export type TemplateType = "direct-to-camera" | "text-visuals";

// Scene status
export type SceneStatus = "pending" | "generating" | "completed" | "failed";

// Scene interface
export interface Scene {
  sceneNumber: number;            // 1, 2, or 3
  content: string;                // Scene-specific narrative/text
  prompt: string;                 // Cinematography prompt for Veo 3
  videoClipPath?: string;         // Filled after generation
  predictionId?: string;          // Replicate prediction ID
  status: SceneStatus;
  error?: string;
}

// Video script interface
export interface VideoScript {
  id: string;                     // Unique ID for this script
  category: ProblemCategory;
  template: TemplateType;
  timestamp: string;              // ISO 8601
  overallScript: string;          // Full narrative
  scenes: Scene[];
}

// Template definition
export interface Template {
  id: TemplateType;
  name: string;
  description: string;
  systemPrompt: string;           // LLM system prompt for script gen
  sceneStructure: SceneDefinition[];
}

export interface SceneDefinition {
  sceneNumber: number;
  purpose: string;                // e.g., "Acknowledge struggle"
  guidanceForLLM: string;         // How to generate this scene
}

// Zod schemas for OpenAI structured output

export const SceneSchema = z.object({
  sceneNumber: z.number().int().min(1).max(3),
  content: z.string().min(10),
  prompt: z.string().min(20),
});

export const VideoScriptSchema = z.object({
  category: z.string(),
  template: z.enum(["direct-to-camera", "text-visuals"]),
  overallScript: z.string().min(50),
  scenes: z.array(SceneSchema).length(3),
});

// Type inferred from Zod schema
export type VideoScriptResponse = z.infer<typeof VideoScriptSchema>;
