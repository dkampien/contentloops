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

// User problem data
export interface UserProblem {
  category: ProblemCategory;
  problem: string;  // Actual user-written problem text
}

// Template types
export type TemplateType = "direct-to-camera" | "text-visuals";

// Scene status
export type SceneStatus = "pending" | "generating" | "completed" | "failed";

// Scene interface
export interface Scene {
  sceneNumber: number;            // 1, 2, or 3
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
  videoScript: string;            // Scene 1 visual baseline (renamed from overallScript)
  voiceScript: string;            // Full dialogue for all scenes (NEW FIELD)
  scenes: Scene[];
}

// Template definition
export interface Template {
  id: TemplateType;
  name: string;
  description: string;
  systemPromptCall1: string;    // For content generation (Call 1)
  systemPromptCall2: string;    // For prompt optimization (Call 2)
  promptRules: PromptRules;     // Template-specific prompt rules
  sceneStructure: SceneDefinition[];
}

export interface SceneDefinition {
  sceneNumber: number;
  purpose: string;                // e.g., "Acknowledge struggle"
  guidanceForLLM: string;         // How to generate this scene
}

// Prompt generation rules per template
export interface PromptRules {
  description: string;
  instructions: string[];
  veo3Format?: string;  // Specific Veo 3 format requirements
}

// Zod schemas for OpenAI structured output

export const SceneSchema = z.object({
  sceneNumber: z.number().int(),
  prompt: z.string(),
});

export const VideoScriptSchema = z.object({
  category: z.string(),
  template: z.enum(["direct-to-camera", "text-visuals"]),
  videoScript: z.string().describe("Full visual description of Scene 1 - the baseline"),
  voiceScript: z.string().describe("50-60 words of dialogue"),
  scenes: z.array(SceneSchema).length(3),
});

// Type inferred from Zod schema
export type VideoScriptResponse = z.infer<typeof VideoScriptSchema>;
