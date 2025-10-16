/**
 * Template Definitions
 * Defines video templates with system prompts for script generation
 */

import { Template, TemplateType } from '../types/script.types';

// Direct-to-Camera Template
const directToCameraTemplate: Template = {
  id: "direct-to-camera",
  name: "Direct-to-Camera",
  description: "Person speaking directly to viewer with empathetic progression",

  systemPrompt: `You are creating a comforting video script for someone struggling with {category}.

Format: Direct-to-camera speaking style
Tone: Empathetic, conversational, warm
Structure: 3 scenes showing emotional progression

For each scene, provide:
1. Spoken dialogue (conversational, natural)
2. A detailed cinematography prompt for generating the video

Guidelines:
- Use second person ("you") to speak directly to viewer
- Keep dialogue natural and authentic
- Each scene should be ~10 seconds of spoken content
- Cinematography prompts should describe: subject, expression, lighting, framing, mood
- Ensure the cinematography prompts create a consistent person across all 3 scenes (same person, same setting)
- The person should be warm, relatable, and compassionate`,

  sceneStructure: [
    {
      sceneNumber: 1,
      purpose: "Acknowledge the struggle",
      guidanceForLLM: "Show empathy, validate their feelings, use concerned/warm expression"
    },
    {
      sceneNumber: 2,
      purpose: "Offer comfort and hope",
      guidanceForLLM: "Transition to reassurance, gentle smile, warm and encouraging"
    },
    {
      sceneNumber: 3,
      purpose: "Share scripture and closing",
      guidanceForLLM: "Peaceful, uplifting, confident expression with hope"
    }
  ]
};

// Text + Visuals Template
const textVisualsTemplate: Template = {
  id: "text-visuals",
  name: "Text + Visuals",
  description: "Text overlays on calming background footage",

  systemPrompt: `You are creating a reflective video with text overlays for someone struggling with {category}.

Format: Short text snippets displayed over calming visuals
Tone: Peaceful, inspirational, contemplative
Structure: 3 scenes with text progression

For each scene, provide:
1. Text content (short, punchy, impactful - max 2 sentences)
2. A detailed visual prompt for the background footage

Guidelines:
- Text should be brief and powerful
- No dialogue, pure visual + text experience
- Each visual should be ~10 seconds
- Visual prompts should describe: setting, mood, lighting, movement, atmosphere
- Visuals should be calming and contemplative (nature, peaceful settings, soft focus)
- Avoid people or faces - focus on serene environments`,

  sceneStructure: [
    {
      sceneNumber: 1,
      purpose: "Opening acknowledgment",
      guidanceForLLM: "Acknowledge struggle with short, empathetic text. Calming natural visual."
    },
    {
      sceneNumber: 2,
      purpose: "Scripture/comfort text",
      guidanceForLLM: "Biblical verse or comfort message. Serene, peaceful visual."
    },
    {
      sceneNumber: 3,
      purpose: "Closing message",
      guidanceForLLM: "Hopeful, uplifting closing text. Inspiring, bright visual."
    }
  ]
};

// Template registry
const templates = new Map<TemplateType, Template>([
  ["direct-to-camera", directToCameraTemplate],
  ["text-visuals", textVisualsTemplate]
]);

/**
 * Get template by ID
 */
export function getTemplate(id: TemplateType): Template {
  const template = templates.get(id);
  if (!template) {
    throw new Error(`Template not found: ${id}`);
  }
  return template;
}

/**
 * Get all templates
 */
export function getAllTemplates(): Template[] {
  return Array.from(templates.values());
}

/**
 * Check if template exists
 */
export function hasTemplate(id: string): boolean {
  return templates.has(id as TemplateType);
}

export { templates };
