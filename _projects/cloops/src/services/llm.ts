import OpenAI from 'openai';
import type { Response } from 'openai/resources/responses/responses';
import { zodTextFormat } from 'openai/helpers/zod';
import { z } from 'zod';
import { getEnv } from '../utils/env.js';
import type { LLMService, LLMCallParams } from '../types/index.js';

// ===================
// Constants
// ===================

const DEFAULT_MODEL = 'gpt-5.1';

// ===================
// Client
// ===================

let client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!client) {
    const env = getEnv();
    client = new OpenAI({
      apiKey: env.OPENAI_API_KEY,
    });
  }
  return client;
}

// ===================
// Helpers
// ===================

/**
 * Extract text content from an OpenAI Response object
 */
function extractTextFromResponse(response: Response): string {
  const output = response.output;
  if (!output || output.length === 0) {
    throw new Error('LLM returned empty response');
  }

  const messageOutput = output.find(item => item.type === 'message');
  if (!messageOutput || messageOutput.type !== 'message') {
    throw new Error('LLM response missing message output');
  }

  const textContent = messageOutput.content.find(c => c.type === 'output_text');
  if (!textContent || textContent.type !== 'output_text') {
    throw new Error('LLM response missing text content');
  }

  return textContent.text;
}

/**
 * Check if schema is in OpenAI's wrapped format: { name, strict, schema }
 */
function isOpenAISchemaFormat(schema: object): schema is { name: string; strict: boolean; schema: object } {
  return 'name' in schema && 'schema' in schema;
}

/**
 * Check if schema is a raw JSON Schema (has type and properties fields)
 */
function isRawJsonSchema(schema: object): boolean {
  return 'type' in schema && 'properties' in schema;
}

// ===================
// Main Function
// ===================

/**
 * Make an LLM call using the OpenAI Responses API
 *
 * Supports both Zod schemas and JSON schemas for structured output.
 */
async function llmCall<T = string>(params: LLMCallParams): Promise<T> {
  const { systemPrompt, userMessage, schema, reasoning, verbosity } = params;
  const openai = getClient();

  const input = [
    { role: 'system' as const, content: systemPrompt },
    { role: 'user' as const, content: userMessage },
  ];

  // If schema provided, use structured output parsing
  if (schema) {
    // Zod schema - use responses.parse for automatic parsing
    if (schema instanceof z.ZodType) {
      const response = await openai.responses.parse({
        model: DEFAULT_MODEL,
        input,
        ...(reasoning && { reasoning: { effort: reasoning } }),
        text: {
          format: zodTextFormat(schema, 'response'),
          ...(verbosity && { verbosity }),
        },
      });

      if (!response.output_parsed) {
        throw new Error('LLM response could not be parsed');
      }

      return response.output_parsed as T;
    }

    // OpenAI wrapped format: { name, strict, schema }
    if (isOpenAISchemaFormat(schema)) {
      const response = await openai.responses.create({
        model: DEFAULT_MODEL,
        input,
        ...(reasoning && { reasoning: { effort: reasoning } }),
        text: {
          format: {
            type: 'json_schema',
            name: schema.name,
            schema: schema.schema as Record<string, unknown>,
            strict: schema.strict ?? true,
          },
          ...(verbosity && { verbosity }),
        },
      });

      const text = extractTextFromResponse(response);
      return JSON.parse(text) as T;
    }

    // Raw JSON Schema - wrap it
    if (isRawJsonSchema(schema)) {
      const response = await openai.responses.create({
        model: DEFAULT_MODEL,
        input,
        ...(reasoning && { reasoning: { effort: reasoning } }),
        text: {
          format: {
            type: 'json_schema',
            name: 'response',
            schema: schema as Record<string, unknown>,
            strict: true,
          },
          ...(verbosity && { verbosity }),
        },
      });

      const text = extractTextFromResponse(response);
      return JSON.parse(text) as T;
    }

    // Unknown schema type
    throw new Error('Schema must be a Zod schema or JSON Schema object');
  }

  // Plain text response (no schema)
  const response = await openai.responses.create({
    model: DEFAULT_MODEL,
    input,
    ...(reasoning && { reasoning: { effort: reasoning } }),
    ...(verbosity && { text: { verbosity } }),
  });

  return extractTextFromResponse(response) as T;
}

// ===================
// Exports
// ===================

/**
 * Create an LLM service instance
 */
export function createLLMService(): LLMService {
  return {
    call: llmCall,
  };
}

export { llmCall };
