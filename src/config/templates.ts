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

  systemPromptCall1: `You are creating a comfort video. A person speaks directly to camera in a warm home setting.

Generate TWO fields:

1. videoScript - Describe Scene 1 visuals in simple terms:
   - The person (age, clothing, expression)
   - The setting (home basics)
   - Body language and mood
   Keep it natural and simple. No technical camera/lighting jargon.

2. voiceScript - 50-60 words of dialogue with this structure:
   - First ~20 words: Acknowledge their specific struggle
   - Next ~20 words: Reassure them they're not alone, it's okay to feel this way
   - Final ~20 words: Gently invite them to try BibleChat for support

Tone: Warm, conversational, empathetic. Speak directly to "you."`,

  systemPromptCall2: `You are optimizing visual descriptions for Veo 3.1 video generation.

Input:
- videoScript (Scene 1 baseline description)
- voiceScript (50-60 words continuous dialogue)

Generate 3 scene prompts following this strategy:

Scene 1 - Full descriptive prompt:
- Use videoScript as foundation
- Simplify: Remove overly specific props (no "wedding photo" or "spreadsheet on laptop")
- Keep: Person, setting type, mood, expression, body language, lighting quality
- Add: "actively speaking to camera"
- Add first ~20 words from voiceScript in format 'saying: "[dialogue]"'
- Format for Veo: Natural language, 40-80 words

Scene 2 - Minimal continuation:
- Do NOT describe setting (image parameter handles this)
- Only: Expression/emotion shift from Scene 1
- Add middle ~20 words from voiceScript
- Format: "Person continues speaking with [expression change], saying: '[dialogue]'"
- 10-30 words maximum

Scene 3 - Minimal continuation:
- Same as Scene 2 rules
- Add final ~20 words from voiceScript
- Focus on final emotional shift

Remember: Scenes 2-3 use frame chaining - the image parameter provides visual context, so verbose descriptions cause conflicts.`,

  promptRules: {
    description: "Direct-to-camera with frame chaining: Scene 1 full, Scenes 2-3 minimal",
    instructions: [
      "Scene 1: Full description using videoScript baseline",
      "Scenes 2-3: Minimal (expression shift only)",
      "Include dialogue from voiceScript in all scenes",
      "Use Veo 3.1 format: person saying \"dialogue\"",
      "Frame chaining handles visual continuity"
    ],
    veo3Format: "person saying \"exact dialogue\""
  },

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

  systemPromptCall1: `You are creating a reflective video script with text overlays for someone struggling with a specific problem.

Format: Short text snippets displayed over calming visuals
Tone: Peaceful, inspirational, contemplative
Structure: 3 scenes with text progression

You will receive:
- Category: The general problem area
- Problem: A specific user problem

Your task:
1. Generate an "overallScript" - a prose description of the video concept
   - Write in clear, professional prose
   - Describe the message and visual journey
   - 2-4 sentences

2. Generate 3 scenes with "content" field (DOP-style instructions)
   - Each scene should include:
     * The text to display (in quotes, max 2 sentences)
     * Visual description (natural setting, mood, movement)
     * Lighting and atmosphere details
   - No people or faces
   - Focus on serene, calming environments

Guidelines:
- Text should be brief and powerful (1-2 sentences max)
- Visuals should be nature, peaceful settings, soft focus
- Each visual should be ~10 seconds
- Show emotional progression through text + visual pairing`,

  systemPromptCall2: `You are optimizing scene descriptions for Veo 3 text-to-video generation.

Your task:
Given a scene description (text + visual details), create a Veo 3-optimized prompt.

Requirements:
1. Focus on the VISUAL ONLY (no text - platform handles text overlay)
2. Describe natural, calming environments
3. NO people, NO faces in frame
4. Include: setting, movement, lighting, atmosphere, mood
5. Keep it concise but vivid (40-80 words)
6. Emphasize peaceful, serene qualities

Example:
Input content: "Text: 'You are not alone in this.' Visual: Ocean waves at sunset, golden light, peaceful."

Output prompt: "Slow tracking shot of gentle ocean waves rolling onto sandy beach at golden hour sunset, warm amber and pink sky reflecting on water surface, peaceful and serene atmosphere, soft focus on foreground, calming natural movement."

Focus on creating calming, beautiful visuals without any people.`,

  promptRules: {
    description: "Text-visuals requires no people, calming natural environments",
    instructions: [
      "NO people or faces in frame",
      "Focus on natural, calming environments",
      "Describe movement, lighting, atmosphere",
      "Platform handles text overlay separately",
      "Keep concise (40-80 words)"
    ]
  },

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
