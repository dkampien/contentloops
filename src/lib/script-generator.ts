/**
 * Script Generator
 * OpenAI integration for generating video scripts
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import OpenAI from 'openai';
import { zodResponseFormat } from 'openai/helpers/zod';
import { ProblemCategory, TemplateType, VideoScript, VideoScriptSchema, Scene, SceneStatus } from '../types/script.types';
import { Template } from '../types/script.types';
import { Config } from '../types/config.types';
import { ScriptGenerationError } from '../utils/errors';
import { logger } from '../utils/logger';
import { withRetry, generateVideoId, generateScriptPath } from '../utils/helpers';

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
   * Generate a video script for a category and template
   */
  async generateScript(
    category: ProblemCategory,
    template: TemplateType
  ): Promise<VideoScript> {
    try {
      logger.info(`Generating script: ${category} × ${template}`);

      // Get template
      const templateDef = this.templates.get(template);
      if (!templateDef) {
        throw new ScriptGenerationError(
          `Template not found: ${template}`,
          { category, template }
        );
      }

      // Generate with retry logic
      const scriptResponse = await withRetry(
        async () => await this.callOpenAI(category, templateDef),
        {
          maxRetries: this.config.apis.openai.maxTokens ? 3 : 2,
          backoff: 'exponential',
          baseDelay: 1000,
          onRetry: (attempt, error) => {
            logger.warn(`Script generation retry ${attempt}:`, error.message);
          }
        }
      );

      // Build VideoScript object
      const videoScript = this.buildVideoScript(
        scriptResponse,
        category,
        template
      );

      // Save script to disk
      const scriptPath = generateScriptPath(
        this.config.paths.scriptsDir,
        category,
        template
      );
      await this.saveScript(videoScript, scriptPath);

      logger.success(`Script generated and saved: ${path.basename(scriptPath)}`);

      return videoScript;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`Script generation failed for ${category} × ${template}:`, errorMessage);

      throw new ScriptGenerationError(
        `Failed to generate script: ${errorMessage}`,
        { category, template }
      );
    }
  }

  /**
   * Call OpenAI API with structured output
   * Returns raw scenes from API (without status field)
   */
  private async callOpenAI(
    category: ProblemCategory,
    template: Template
  ): Promise<Array<{ sceneNumber: number; content: string; prompt: string }>> {
    try {
      // Replace category placeholder in system prompt
      const systemPrompt = template.systemPrompt.replace('{category}', category);

      logger.debug(`Calling OpenAI API (model: ${this.config.apis.openai.model})`);

      // Make API call with structured output
      const completion = await this.client.chat.completions.create({
        model: this.config.apis.openai.model,
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: `Generate a 3-scene video script for someone struggling with "${category}".`
          }
        ],
        response_format: zodResponseFormat(VideoScriptSchema, 'video_script'),
        temperature: this.config.apis.openai.temperature,
        max_tokens: this.config.apis.openai.maxTokens
      });

      // Extract and parse response
      const message = completion.choices[0]?.message;

      if (!message) {
        throw new ScriptGenerationError('No response from OpenAI', { category, template: template.id });
      }

      // Check for refusal (if API supports it)
      const refusal = (message as any).refusal;
      if (refusal) {
        throw new ScriptGenerationError(
          `OpenAI refused to generate content: ${refusal}`,
          { category, template: template.id }
        );
      }

      // Parse the JSON content
      const content = message.content;
      if (!content) {
        throw new ScriptGenerationError(
          'No content in OpenAI response',
          { category, template: template.id }
        );
      }

      // Parse and validate with Zod
      const parsed = VideoScriptSchema.parse(JSON.parse(content));

      logger.debug(`OpenAI response received: ${parsed.scenes.length} scenes`);

      return parsed.scenes;
    } catch (error) {
      if (error instanceof OpenAI.APIError) {
        throw new ScriptGenerationError(
          `OpenAI API error: ${error.message}`,
          { category, template: template.id, status: error.status }
        );
      }
      throw error;
    }
  }

  /**
   * Build VideoScript object from API response
   */
  private buildVideoScript(
    scenes: any[],
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
      overallScript: this.generateOverallScript(processedScenes),
      scenes: processedScenes
    };
  }

  /**
   * Generate overall script description from scenes
   */
  private generateOverallScript(scenes: Scene[]): string {
    return scenes.map((scene, i) => {
      return `Scene ${i + 1}: ${scene.content.substring(0, 100)}${scene.content.length > 100 ? '...' : ''}`;
    }).join('\n\n');
  }

  /**
   * Save script to disk as JSON
   */
  private async saveScript(script: VideoScript, scriptPath: string): Promise<void> {
    try {
      // Ensure directory exists
      const dir = path.dirname(scriptPath);
      await fs.mkdir(dir, { recursive: true });

      // Write JSON file
      const content = JSON.stringify(script, null, 2);
      await fs.writeFile(scriptPath, content, 'utf-8');

      logger.debug(`Script saved to: ${scriptPath}`);
    } catch (error) {
      throw new ScriptGenerationError(
        `Failed to save script: ${error instanceof Error ? error.message : String(error)}`,
        { scriptPath }
      );
    }
  }
}
