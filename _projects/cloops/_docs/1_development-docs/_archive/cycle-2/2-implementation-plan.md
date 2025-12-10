# Script Structure Redesign - Implementation Plan

**Date**: October 16, 2025
**Cycle**: 2
**Status**: Ready for Implementation

---

## Overview

This plan implements the two-step LLM generation strategy to fix content/prompt mismatch and integrate user problems into video generation.

### Key Changes
1. Extract user problems from CSV (not just categories)
2. Split script generation into two LLM calls
3. Add Veo 3 dialogue format for direct-to-camera
4. Update state tracking for two-step generation
5. Create new template systemPrompts for both calls

---

## Files to Modify

### 1. `src/types/script.types.ts`
**Changes:** Add problem field to types

**Location**: Lines 9-18 (ProblemCategory type)

**Add after line 18:**
```typescript
// User problem data
export interface UserProblem {
  category: ProblemCategory;
  problem: string;  // Actual user-written problem text
}
```

**No schema changes needed** - existing VideoScriptSchema is compatible

---

### 2. `src/lib/data-processor.ts`
**Changes:** Extract problems (not just categories)

#### Change 1: Add problem interface import
**Location**: Line 8
```typescript
import { ProblemCategory, UserProblem } from '../types/script.types';
```

#### Change 2: New method - extractProblems()
**Location**: After line 68 (add new method)
```typescript
/**
 * Extract category + sample problem pairs from CSV
 */
async extractProblems(filterList?: string[] | "all"): Promise<UserProblem[]> {
  try {
    logger.debug(`Reading CSV from: ${this.csvPath}`);

    // Read and parse CSV
    const fileContent = await this.readCSV();
    const rows = this.parseCSV(fileContent);

    logger.info(`Parsed ${rows.length} rows from CSV`);

    // Extract unique categories
    const uniqueCategories = this.extractUniqueCategories(rows);
    logger.info(`Found ${uniqueCategories.size} unique categories`);

    // Filter categories
    const filteredCategories = this.filterCategories(
      Array.from(uniqueCategories),
      filterList
    );

    logger.info(`Using ${filteredCategories.length} categories for generation`);

    // For each category, find one sample problem
    const problems: UserProblem[] = [];

    for (const category of filteredCategories) {
      // Find first row with this category that has a problem
      const row = rows.find(r =>
        r.lifeChallengeOption?.replace(/^"+|"+$/g, '').trim() === category &&
        r.onboardingV7_lifeChallenge?.trim()
      );

      if (row && row.onboardingV7_lifeChallenge) {
        problems.push({
          category,
          problem: row.onboardingV7_lifeChallenge.trim()
        });
      } else {
        // Fallback: use category as problem if no specific problem found
        logger.warn(`No specific problem found for category: ${category}, using generic`);
        problems.push({
          category,
          problem: `Struggling with ${category.toLowerCase()}`
        });
      }
    }

    return problems;
  } catch (error) {
    if (error instanceof CSVReadError || error instanceof CSVParseError) {
      throw error;
    }
    throw new CSVReadError(
      `Failed to extract problems: ${error instanceof Error ? error.message : String(error)}`,
      { csvPath: this.csvPath }
    );
  }
}
```

**Keep existing extractCategories() method** - don't delete (backward compatibility)

---

### 3. `src/config/templates.ts`
**Changes:** Add two systemPrompts per template (Call 1 and Call 2), add prompt rules

#### Change 1: Update Template interface import
**Location**: Line 6
```typescript
import { Template, TemplateType, PromptRules } from '../types/script.types';
```

#### Change 2: Define prompt rules type
**Location**: In `src/types/script.types.ts`, add after Template interface (line 60)
```typescript
// Prompt generation rules per template
export interface PromptRules {
  description: string;
  instructions: string[];
  veo3Format?: string;  // Specific Veo 3 format requirements
}
```

#### Change 3: Update Template interface
**Location**: `src/types/script.types.ts`, lines 48-54
```typescript
export interface Template {
  id: TemplateType;
  name: string;
  description: string;
  systemPromptCall1: string;    // For content generation (Call 1)
  systemPromptCall2: string;    // For prompt optimization (Call 2)
  promptRules: PromptRules;     // Template-specific prompt rules
  sceneStructure: SceneDefinition[];
}
```

#### Change 4: Rewrite direct-to-camera template
**Location**: `src/config/templates.ts`, lines 9-49

```typescript
const directToCameraTemplate: Template = {
  id: "direct-to-camera",
  name: "Direct-to-Camera",
  description: "Person speaking directly to viewer with empathetic progression",

  systemPromptCall1: `You are creating a comforting video script for someone struggling with a specific problem.

Format: Direct-to-camera speaking style
Tone: Empathetic, conversational, warm
Structure: 3 scenes showing emotional progression

You will receive:
- Category: The general problem area (e.g., "Anxiety or fear")
- Problem: A specific user problem (e.g., "Being scared that the guy I'm falling for is going to leave me")

Your task:
1. Generate an "overallScript" - a prose description of the video concept
   - Write in clear, professional prose (no arrows, no shorthand)
   - Describe the emotional journey: what the video will say and how it progresses
   - Do NOT include template names or technical details
   - 2-4 sentences

2. Generate 3 scenes with "content" field (DOP-style instructions)
   - Each scene should include:
     * Visual description (setting, subject, framing, lighting)
     * The dialogue the person speaks (in quotes)
     * Body language and expression
     * Camera details (close-up, framing, etc.)
   - Keep it short but comprehensive (2-3 sentences)
   - Make sure dialogue is natural, conversational, and speaks directly to the viewer

Guidelines:
- Use second person ("you") in dialogue
- Each scene should be ~10 seconds of spoken content
- Show emotional progression across the 3 scenes
- Ensure consistent person and setting across all scenes
- The person should be warm, relatable, and compassionate`,

  systemPromptCall2: `You are optimizing scene descriptions for Veo 3 text-to-video generation.

Your task:
Given a scene description (DOP-style instructions), create a Veo 3-optimized prompt.

Requirements:
1. Extract the dialogue from the scene description
2. Format it using Veo 3's dialogue syntax: person saying "exact dialogue here"
3. Include visual details: setting, lighting, framing, expression
4. Emphasize that the person is ACTIVELY SPEAKING with mouth moving
5. Keep it concise but vivid (50-100 words)
6. Ensure the dialogue in the prompt matches the dialogue in the content (do not invent or modify)

Example:
Input content: "Person in 30s, warm living room, facing camera. Speaks with concerned expression: 'I know the fear of losing someone feels overwhelming.' Body language open. Window light. Close-up."

Output prompt: "Close-up of warm, empathetic person in their 30s sitting in cozy living room, facing camera, saying: 'I know the fear of losing someone feels overwhelming.' Concerned but warm expression, open body language, natural window light, intimate framing."

Focus on making the video show someone actively delivering comforting dialogue.`,

  promptRules: {
    description: "Direct-to-camera requires person actively speaking dialogue",
    instructions: [
      "Extract dialogue from scene content",
      "Use Veo 3 format: person saying \"dialogue\"",
      "Emphasize mouth moving, active speaking",
      "Include expression, setting, lighting",
      "Keep concise (50-100 words)"
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
```

#### Change 5: Rewrite text-visuals template
**Location**: `src/config/templates.ts`, lines 52-92

```typescript
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
```

---

### 4. `src/lib/script-generator.ts`
**Changes:** Split into two methods (generateContent, generatePrompts)

#### Change 1: Update imports
**Location**: Line 10
```typescript
import { ProblemCategory, TemplateType, VideoScript, VideoScriptSchema, Scene, SceneStatus, UserProblem } from '../types/script.types';
```

#### Change 2: Update generateScript() signature
**Location**: Lines 36-39

**From:**
```typescript
async generateScript(
  category: ProblemCategory,
  template: TemplateType
): Promise<VideoScript>
```

**To:**
```typescript
async generateScript(
  userProblem: UserProblem,
  template: TemplateType
): Promise<VideoScript>
```

#### Change 3: Refactor generateScript() to use two-step flow
**Location**: Lines 36-92 (replace entire method)

```typescript
/**
 * Generate a video script for a problem and template (two-step process)
 */
async generateScript(
  userProblem: UserProblem,
  template: TemplateType
): Promise<VideoScript> {
  try {
    logger.info(`Generating script: ${userProblem.category} × ${template}`);
    logger.debug(`Problem: "${userProblem.problem}"`);

    // Get template
    const templateDef = this.templates.get(template);
    if (!templateDef) {
      throw new ScriptGenerationError(
        `Template not found: ${template}`,
        { category: userProblem.category, template }
      );
    }

    // CALL 1: Generate content (overallScript + scenes[].content)
    logger.info('  Step 1/2: Generating content...');
    const contentResponse = await this.generateContent(userProblem, templateDef);

    // CALL 2: Generate prompts (scenes[].prompt from scenes[].content)
    logger.info('  Step 2/2: Generating prompts...');
    const scenesWithPrompts = await this.generatePrompts(
      contentResponse.scenes,
      templateDef
    );

    // Build VideoScript object
    const videoScript = this.buildVideoScript(
      contentResponse.overallScript,
      scenesWithPrompts,
      userProblem.category,
      template
    );

    // Save script to disk
    const scriptPath = generateScriptPath(
      this.config.paths.scriptsDir,
      userProblem.category,
      template
    );
    await this.saveScript(videoScript, scriptPath);

    logger.success(`Script generated and saved: ${path.basename(scriptPath)}`);

    return videoScript;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`Script generation failed for ${userProblem.category} × ${template}:`, errorMessage);

    throw new ScriptGenerationError(
      `Failed to generate script: ${errorMessage}`,
      { category: userProblem.category, template }
    );
  }
}
```

#### Change 4: Add generateContent() method (CALL 1)
**Location**: After generateScript() (line 93)

```typescript
/**
 * CALL 1: Generate content (overallScript + scenes[].content)
 */
private async generateContent(
  userProblem: UserProblem,
  template: Template
): Promise<{ overallScript: string; scenes: Array<{ sceneNumber: number; content: string }> }> {
  try {
    const systemPrompt = template.systemPromptCall1;

    const userPrompt = `Category: ${userProblem.category}
Problem: ${userProblem.problem}

Generate a 3-scene video script addressing this specific problem.`;

    logger.debug(`Calling OpenAI API (Call 1) - model: ${this.config.apis.openai.model}`);

    // Define Zod schema for Call 1 response
    const ContentSchema = z.object({
      overallScript: z.string().min(50),
      scenes: z.array(z.object({
        sceneNumber: z.number().int().min(1).max(3),
        content: z.string().min(10)
      })).length(3)
    });

    // Make API call with retry
    const response = await withRetry(
      async () => {
        const completion = await this.client.chat.completions.create({
          model: this.config.apis.openai.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          response_format: zodResponseFormat(ContentSchema, 'content_generation'),
          temperature: this.config.apis.openai.temperature,
          max_tokens: this.config.apis.openai.maxTokens
        });

        const message = completion.choices[0]?.message;
        if (!message?.content) {
          throw new ScriptGenerationError('No response from OpenAI (Call 1)', {
            category: userProblem.category,
            template: template.id
          });
        }

        return ContentSchema.parse(JSON.parse(message.content));
      },
      {
        maxRetries: 3,
        backoff: 'exponential',
        baseDelay: 1000,
        onRetry: (attempt, error) => {
          logger.warn(`Content generation retry ${attempt}:`, error.message);
        }
      }
    );

    logger.debug(`Content generated: ${response.scenes.length} scenes`);
    return response;
  } catch (error) {
    throw new ScriptGenerationError(
      `Content generation failed (Call 1): ${error instanceof Error ? error.message : String(error)}`,
      { category: userProblem.category, template: template.id }
    );
  }
}
```

#### Change 5: Add generatePrompts() method (CALL 2)
**Location**: After generateContent()

```typescript
/**
 * CALL 2: Generate prompts from content
 */
private async generatePrompts(
  scenes: Array<{ sceneNumber: number; content: string }>,
  template: Template
): Promise<Array<{ sceneNumber: number; content: string; prompt: string }>> {
  try {
    const systemPrompt = template.systemPromptCall2;

    const scenesWithPrompts = [];

    for (const scene of scenes) {
      const userPrompt = `Scene ${scene.sceneNumber} content:\n${scene.content}\n\nGenerate an optimized Veo 3 prompt for this scene.`;

      logger.debug(`Generating prompt for scene ${scene.sceneNumber}...`);

      // Define Zod schema for Call 2 response
      const PromptSchema = z.object({
        prompt: z.string().min(20)
      });

      const response = await withRetry(
        async () => {
          const completion = await this.client.chat.completions.create({
            model: this.config.apis.openai.model,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt }
            ],
            response_format: zodResponseFormat(PromptSchema, 'prompt_generation'),
            temperature: 0.7,
            max_tokens: 500
          });

          const message = completion.choices[0]?.message;
          if (!message?.content) {
            throw new ScriptGenerationError('No response from OpenAI (Call 2)', {
              sceneNumber: scene.sceneNumber,
              template: template.id
            });
          }

          return PromptSchema.parse(JSON.parse(message.content));
        },
        {
          maxRetries: 3,
          backoff: 'exponential',
          baseDelay: 1000,
          onRetry: (attempt, error) => {
            logger.warn(`Prompt generation retry ${attempt} (scene ${scene.sceneNumber}):`, error.message);
          }
        }
      );

      scenesWithPrompts.push({
        sceneNumber: scene.sceneNumber,
        content: scene.content,
        prompt: response.prompt
      });

      logger.debug(`Prompt generated for scene ${scene.sceneNumber}`);
    }

    return scenesWithPrompts;
  } catch (error) {
    throw new ScriptGenerationError(
      `Prompt generation failed (Call 2): ${error instanceof Error ? error.message : String(error)}`,
      { template: template.id }
    );
  }
}
```

#### Change 6: Update buildVideoScript() method
**Location**: Lines 171-198 (update signature and implementation)

**From:**
```typescript
private buildVideoScript(
  scenes: any[],
  category: ProblemCategory,
  template: TemplateType
): VideoScript
```

**To:**
```typescript
private buildVideoScript(
  overallScript: string,
  scenes: Array<{ sceneNumber: number; content: string; prompt: string }>,
  category: ProblemCategory,
  template: TemplateType
): VideoScript {
  const videoId = generateVideoId(category, template);
  const timestamp = new Date().toISOString();

  // Convert scenes to proper Scene objects
  const processedScenes: Scene[] = scenes.map(scene => ({
    sceneNumber: scene.sceneNumber,
    content: scene.content,
    prompt: scene.prompt,
    status: 'pending' as SceneStatus,
    videoClipPath: undefined,
    predictionId: undefined,
    error: undefined
  }));

  return {
    id: videoId,
    category,
    template,
    timestamp,
    overallScript,  // Use LLM-generated overallScript (don't generate locally)
    scenes: processedScenes
  };
}
```

#### Change 7: Remove old generateOverallScript() method
**Location**: Lines 200-207 (delete this method - no longer needed)

#### Change 8: Remove old callOpenAI() method
**Location**: Lines 98-166 (delete this method - replaced by generateContent + generatePrompts)

---

### 5. `src/index.ts`
**Changes:** Use extractProblems() and pass UserProblem to generateScript()

#### Change 1: Update imports
**Location**: Line 11
```typescript
import { UserProblem } from './lib/data-processor';
```

#### Change 2: Update data extraction
**Location**: Lines 69-73

**From:**
```typescript
const dataProcessor = new DataProcessor(config.paths.csvInput);
const categories = await dataProcessor.extractCategories(config.pipeline.categories);
logger.success(`✓ Extracted ${categories.length} categories`);
```

**To:**
```typescript
const dataProcessor = new DataProcessor(config.paths.csvInput);
const problems = await dataProcessor.extractProblems(config.pipeline.categories);
logger.success(`✓ Extracted ${problems.length} problems`);
```

#### Change 3: Update main loop
**Location**: Lines 94-96

**From:**
```typescript
for (const category of categories) {
  for (const templateId of config.pipeline.templates) {
    const videoId = generateVideoId(category, templateId as any);
```

**To:**
```typescript
for (const userProblem of problems) {
  for (const templateId of config.pipeline.templates) {
    const videoId = generateVideoId(userProblem.category, templateId as any);
```

#### Change 4: Update logging and state management
**Location**: Lines 105-111

**From:**
```typescript
logger.info(`📹 Processing: ${category} × ${templateId}`);
logger.info(`   Video ID: ${videoId}`);

// Add video to state if not exists
if (!state.videos.find(v => v.id === videoId)) {
  stateManager.addVideo(state, category, templateId as any, videoId, config.pipeline.scenesPerVideo);
}
```

**To:**
```typescript
logger.info(`📹 Processing: ${userProblem.category} × ${templateId}`);
logger.info(`   Problem: "${userProblem.problem}"`);
logger.info(`   Video ID: ${videoId}`);

// Add video to state if not exists
if (!state.videos.find(v => v.id === videoId)) {
  stateManager.addVideo(state, userProblem.category, templateId as any, videoId, config.pipeline.scenesPerVideo);
}
```

#### Change 5: Update generateScript() call
**Location**: Line 120

**From:**
```typescript
const script = await scriptGenerator.generateScript(category, templateId as any);
```

**To:**
```typescript
const script = await scriptGenerator.generateScript(userProblem, templateId as any);
```

---

## Implementation Steps

### Phase 1: Type and Data Changes (Safe)
1. Add `UserProblem` interface to `script.types.ts`
2. Add `PromptRules` interface to `script.types.ts`
3. Update `Template` interface in `script.types.ts`
4. Add `extractProblems()` method to `data-processor.ts`
5. Test CSV extraction: `npm run build && node dist/index.js` (should compile)

### Phase 2: Template Updates (Non-Breaking)
1. Update `directToCameraTemplate` in `templates.ts`
2. Update `textVisualsTemplate` in `templates.ts`
3. Test compilation: `npm run build`

### Phase 3: Script Generator Refactor (Breaking)
1. Update `script-generator.ts`:
   - Add imports
   - Add `generateContent()` method (Call 1)
   - Add `generatePrompts()` method (Call 2)
   - Update `generateScript()` to use two-step flow
   - Update `buildVideoScript()` signature
   - Remove old `callOpenAI()` and `generateOverallScript()` methods
2. Test compilation: `npm run build`

### Phase 4: Main Pipeline Integration
1. Update `index.ts`:
   - Update imports
   - Change `extractCategories()` to `extractProblems()`
   - Update loop to use `userProblem`
   - Update logging
   - Update `generateScript()` call
2. Test compilation: `npm run build`

### Phase 5: Testing
1. Test with OpenAI API (Call 1 only - stop before video generation)
2. Validate content structure
3. Test with OpenAI API (Call 2 - full flow)
4. Validate prompt format
5. Test resume capability
6. Generate one full video and validate output

---

## Testing Plan

### Unit Testing (Manual)
1. **Data Processor**
   - Run: Extract problems from CSV
   - Verify: Each problem has category + problem text
   - Command: Add temp test in `data-processor.ts` or use node REPL

2. **Script Generator - Call 1**
   - Run: Generate content only (comment out Call 2)
   - Verify: `overallScript` is prose, `scenes[].content` includes dialogue
   - Cost: ~$0.001

3. **Script Generator - Call 2**
   - Run: Generate prompts from sample content
   - Verify: Prompts use Veo 3 dialogue format for direct-to-camera
   - Cost: ~$0.003

### Integration Testing
1. **Full Pipeline (1 problem, 1 template)**
   - Config: Set categories to `["Anxiety or fear"]`, templates to `["direct-to-camera"]`
   - Run: `npm start generate`
   - Verify: 1 video, 3 clips generated
   - Cost: ~$0.004 + video generation

2. **Resume Test**
   - Run: Start pipeline, Ctrl+C after first scene
   - Run: `npm start generate --resume`
   - Verify: Resumes from saved state

3. **Full POC (2 categories, 2 templates)**
   - Config: Default (Anxiety, Finances × 2 templates)
   - Run: `npm start generate`
   - Verify: 4 videos, 12 clips
   - Cost: ~$0.016 + video generation

---

## Validation Checklist

### Code Quality
- [ ] TypeScript compiles with no errors
- [ ] All imports resolve correctly
- [ ] No unused variables or functions
- [ ] Error handling maintained

### Functionality
- [ ] CSV extraction includes problems
- [ ] Call 1 generates `overallScript` (prose format)
- [ ] Call 1 generates `scenes[].content` (DOP instructions with dialogue)
- [ ] Call 2 generates `scenes[].prompt` (Veo 3 optimized)
- [ ] Direct-to-camera prompts include `person saying "dialogue"`
- [ ] Text-visuals prompts exclude people
- [ ] State management tracks both calls
- [ ] Resume works correctly

### Output Quality
- [ ] `overallScript` is clear prose (no arrows, no template details)
- [ ] `scene.content` includes both visual + dialogue
- [ ] `scene.prompt` accurately reflects `scene.content`
- [ ] Dialogue in prompt matches dialogue in content
- [ ] Generated scripts saved correctly
- [ ] Final output JSON includes all fields

---

## Rollback Plan

If issues arise, rollback is straightforward:

1. **Git revert** to cycle-1 commit
2. Restore backup of original files:
   - `templates.ts`
   - `script-generator.ts`
   - `index.ts`
3. Remove new methods in `data-processor.ts`
4. Remove new interfaces in `script.types.ts`

**Note:** State files and generated content are compatible (same VideoScript structure)

---

## Cost Estimate

### Per Video
- Call 1 (content): ~$0.001
- Call 2 (3 prompts): ~$0.003
- Total LLM: ~$0.004
- Video generation: ~$3-6 (Veo 3)

### POC (4 videos)
- LLM: ~$0.016
- Video: ~$12-24
- Total: ~$12-24

### Full (9 categories × 2 templates = 18 videos)
- LLM: ~$0.072
- Video: ~$54-108
- Total: ~$54-108

---

## Next Steps

1. Review and approve this implementation plan
2. Begin Phase 1 (Type and Data Changes)
3. Test incrementally after each phase
4. Validate with real API calls
5. Document results and any issues encountered
