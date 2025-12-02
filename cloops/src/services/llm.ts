import OpenAI from 'openai';
import { zodTextFormat } from 'openai/helpers/zod';
import { z } from 'zod';
import { getEnv } from '../utils/env.js';
import type { LLMService, LLMCallParams } from '../types/index.js';

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

/**
 * Check if schema is a JSON Schema (has type and properties fields)
 */
function isJsonSchema(schema: object): boolean {
  return 'type' in schema && 'properties' in schema;
}

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
    // Check if it's a Zod schema
    if (schema instanceof z.ZodType) {
      const response = await openai.responses.parse({
        model: 'gpt-5.1',
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

    // Check if it's a JSON Schema (has type and properties)
    if (isJsonSchema(schema)) {
      const response = await openai.responses.create({
        model: 'gpt-5.1',
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

      // Extract and parse JSON from response
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

      return JSON.parse(textContent.text) as T;
    }

    // Fallback: try to use as Zod raw shape (legacy behavior)
    const zodSchema = z.object(schema as z.ZodRawShape);
    const response = await openai.responses.parse({
      model: 'gpt-5.1',
      input,
      ...(reasoning && { reasoning: { effort: reasoning } }),
      text: {
        format: zodTextFormat(zodSchema, 'response'),
        ...(verbosity && { verbosity }),
      },
    });

    if (!response.output_parsed) {
      throw new Error('LLM response could not be parsed');
    }

    return response.output_parsed as T;
  }

  // Plain text response (no schema)
  const response = await openai.responses.create({
    model: 'gpt-5.1',
    input,
    ...(reasoning && { reasoning: { effort: reasoning } }),
    ...(verbosity && { text: { verbosity } }),
  });

  // Extract text from response output
  const output = response.output;
  if (!output || output.length === 0) {
    throw new Error('LLM returned empty response');
  }

  // Find the message output
  const messageOutput = output.find(item => item.type === 'message');
  if (!messageOutput || messageOutput.type !== 'message') {
    throw new Error('LLM response missing message output');
  }

  // Extract text content
  const textContent = messageOutput.content.find(c => c.type === 'output_text');
  if (!textContent || textContent.type !== 'output_text') {
    throw new Error('LLM response missing text content');
  }

  return textContent.text as T;
}

/**
 * Make an LLM call with a Zod schema for structured output
 */
export async function llmCallWithSchema<T extends z.ZodType>(
  systemPrompt: string,
  userMessage: string,
  schema: T,
  options?: { reasoning?: 'none' | 'low' | 'medium' | 'high'; verbosity?: 'low' | 'medium' | 'high' }
): Promise<z.infer<T>> {
  const openai = getClient();
  const { reasoning, verbosity } = options || {};

  const response = await openai.responses.parse({
    model: 'gpt-5.1',
    input: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ],
    ...(reasoning && { reasoning: { effort: reasoning } }),
    text: {
      format: zodTextFormat(schema, 'response'),
      ...(verbosity && { verbosity }),
    },
  });

  if (!response.output_parsed) {
    throw new Error('LLM response could not be parsed');
  }

  return response.output_parsed;
}

/**
 * Create an LLM service instance
 */
export function createLLMService(): LLMService {
  return {
    call: llmCall,
  };
}

// Export the raw function for backwards compatibility during refactor
export { llmCall };
