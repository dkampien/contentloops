/**
 * Script Generator
 * OpenAI integration for generating video scripts
 */

import { z } from 'zod';
import OpenAI from 'openai';
import { zodResponseFormat } from 'openai/helpers/zod';
import { ProblemCategory, TemplateType, VideoScript, Scene, SceneStatus, UserProblem } from '../types/script.types';
import { Template } from '../types/script.types';
import { Config } from '../types/config.types';
import { ScriptGenerationError } from '../utils/errors';
import { logger } from '../utils/logger';
import { withRetry, generateVideoId } from '../utils/helpers';

/**
 * ScriptGenerator class for LLM-based script generation
 */
export class ScriptGenerator {
  private client: OpenAI;
  private templates: Map<TemplateType, Template>;
  private config: Config;

  constructor(config: Config, templates: Map<TemplateType, Template>) {
    this.config = config;
    this.templates = templates;
    this.client = new OpenAI({
      apiKey: config.apis.openai.apiKey
    });
  }

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

      // CALL 1: Generate content (videoScript + voiceScript)
      logger.info('  Step 1/2: Generating content...');
      const contentResponse = await this.generateContent(userProblem, templateDef);

      // CALL 2: Generate prompts (3 scene prompts from videoScript + voiceScript)
      logger.info('  Step 2/2: Generating prompts...');
      const scenes = await this.generatePrompts(
        contentResponse.videoScript,
        contentResponse.voiceScript,
        templateDef
      );

      // Build VideoScript object
      const videoScript = this.buildVideoScript(
        contentResponse.videoScript,
        contentResponse.voiceScript,
        scenes,
        userProblem.category,
        template
      );

      logger.success(`Script generated`);

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

  /**
   * CALL 1: Generate content (videoScript + voiceScript)
   */
  private async generateContent(
    userProblem: UserProblem,
    template: Template
  ): Promise<{ videoScript: string; voiceScript: string }> {
    try {
      const systemPrompt = template.systemPromptCall1;

      const userPrompt = `Category: ${userProblem.category}
Problem: ${userProblem.problem}

Generate a 3-scene video script addressing this specific problem.`;

      logger.debug(`Calling OpenAI API (Call 1) - model: ${this.config.apis.openai.model}`);

      // Define Zod schema for Call 1 response
      const ContentSchema = z.object({
        videoScript: z.string().describe("Full visual description of Scene 1 - the baseline"),
        voiceScript: z.string().describe("50-60 words of dialogue")
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
            max_completion_tokens: this.config.apis.openai.maxTokens
            // Note: gpt-5-mini does not support temperature, top_p, or other sampling parameters
          });

          const message = completion.choices[0]?.message;
          if (!message?.content) {
            logger.error('OpenAI API returned no content');
            logger.error('Full response:', JSON.stringify(completion, null, 2));
            throw new ScriptGenerationError('No response from OpenAI (Call 1)', {
              category: userProblem.category,
              template: template.id,
              finishReason: completion.choices[0]?.finish_reason,
              refusal: (message as any)?.refusal
            });
          }

          logger.debug('Raw API response:', message.content.substring(0, 200));
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

      logger.debug('Content generated: videoScript and voiceScript');
      return response;
    } catch (error) {
      throw new ScriptGenerationError(
        `Content generation failed (Call 1): ${error instanceof Error ? error.message : String(error)}`,
        { category: userProblem.category, template: template.id }
      );
    }
  }

  /**
   * CALL 2: Generate prompts from videoScript and voiceScript
   */
  private async generatePrompts(
    videoScript: string,
    voiceScript: string,
    template: Template
  ): Promise<Array<{ sceneNumber: number; prompt: string }>> {
    try {
      const systemPrompt = template.systemPromptCall2;

      const userPrompt = `videoScript: ${videoScript}

voiceScript: ${voiceScript}

Generate 3 Veo-optimized scene prompts following the strategy above.`;

      logger.debug('Generating scene prompts...');

      // Define Zod schema for Call 2 response
      const PromptsSchema = z.object({
        scenes: z.array(z.object({
          sceneNumber: z.number().int(),
          prompt: z.string()
        })).length(3)  // Exactly 3 scenes required
      });

      const response = await withRetry(
        async () => {
          const completion = await this.client.chat.completions.create({
            model: this.config.apis.openai.model,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt }
            ],
            response_format: zodResponseFormat(PromptsSchema, 'prompt_generation'),
            max_completion_tokens: 4000  // gpt-5-mini uses ~2000 for reasoning + ~1000 for output
            // Note: gpt-5-mini does not support temperature, top_p, or other sampling parameters
          });

          const message = completion.choices[0]?.message;
          if (!message?.content) {
            logger.error('OpenAI API returned no content (Call 2)');
            logger.error('Full response:', JSON.stringify(completion, null, 2));
            throw new ScriptGenerationError('No response from OpenAI (Call 2)', {
              template: template.id,
              finishReason: completion.choices[0]?.finish_reason,
              refusal: (message as any)?.refusal
            });
          }

          logger.debug('Raw API response (Call 2):', message.content.substring(0, 200));
          return PromptsSchema.parse(JSON.parse(message.content));
        },
        {
          maxRetries: 3,
          backoff: 'exponential',
          baseDelay: 1000,
          onRetry: (attempt, error) => {
            logger.warn(`Prompt generation retry ${attempt}:`, error.message);
          }
        }
      );

      logger.debug(`Generated ${response.scenes.length} scene prompts`);
      return response.scenes;
    } catch (error) {
      throw new ScriptGenerationError(
        `Prompt generation failed (Call 2): ${error instanceof Error ? error.message : String(error)}`,
        { template: template.id }
      );
    }
  }

  /**
   * Build VideoScript object from generated content
   */
  private buildVideoScript(
    videoScript: string,
    voiceScript: string,
    scenes: Array<{ sceneNumber: number; prompt: string }>,
    category: ProblemCategory,
    template: TemplateType
  ): VideoScript {
    const videoId = generateVideoId(category, template);
    const timestamp = new Date().toISOString();

    // Convert scenes to proper Scene objects
    const processedScenes: Scene[] = scenes.map(scene => ({
      sceneNumber: scene.sceneNumber,
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
      videoScript,
      voiceScript,
      scenes: processedScenes
    };
  }

}
