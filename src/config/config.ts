/**
 * Configuration Loader
 * Loads and validates application configuration
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { Config } from '../types/config.types';

/**
 * Load configuration from file
 */
export async function loadConfig(configPath: string): Promise<Config> {
  try {
    const absolutePath = path.resolve(configPath);
    const fileContent = await fs.readFile(absolutePath, 'utf-8');
    const rawConfig = JSON.parse(fileContent);

    // Resolve environment variables
    const config = resolveEnvironmentVariables(rawConfig);

    // Validate configuration
    validateConfig(config);

    return config;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to load config from ${configPath}: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Resolve environment variables in config (${VAR_NAME} syntax)
 */
function resolveEnvironmentVariables(obj: any): any {
  if (typeof obj === 'string') {
    const envVarPattern = /\$\{([^}]+)\}/g;
    return obj.replace(envVarPattern, (_, varName) => {
      const value = process.env[varName];
      if (!value) {
        throw new Error(`Environment variable not found: ${varName}`);
      }
      return value;
    });
  }

  if (Array.isArray(obj)) {
    return obj.map(item => resolveEnvironmentVariables(item));
  }

  if (obj !== null && typeof obj === 'object') {
    const resolved: any = {};
    for (const [key, value] of Object.entries(obj)) {
      resolved[key] = resolveEnvironmentVariables(value);
    }
    return resolved;
  }

  return obj;
}

/**
 * Validate configuration structure
 */
function validateConfig(config: any): asserts config is Config {
  // Validate required top-level keys
  const requiredKeys = ['paths', 'pipeline', 'apis', 'videoGeneration'];
  for (const key of requiredKeys) {
    if (!(key in config)) {
      throw new Error(`Missing required config key: ${key}`);
    }
  }

  // Validate paths
  if (!config.paths.csvInput) {
    throw new Error('Missing required config: paths.csvInput');
  }
  if (!config.paths.outputDir) {
    throw new Error('Missing required config: paths.outputDir');
  }

  // Validate pipeline
  if (!config.pipeline.categories) {
    throw new Error('Missing required config: pipeline.categories');
  }
  if (!Array.isArray(config.pipeline.templates) || config.pipeline.templates.length === 0) {
    throw new Error('pipeline.templates must be a non-empty array');
  }
  if (typeof config.pipeline.scenesPerVideo !== 'number' || config.pipeline.scenesPerVideo < 1) {
    throw new Error('pipeline.scenesPerVideo must be a positive number');
  }

  // Validate APIs
  if (!config.apis.openai?.apiKey) {
    throw new Error('Missing required config: apis.openai.apiKey');
  }
  if (!config.apis.replicate?.apiKey) {
    throw new Error('Missing required config: apis.replicate.apiKey');
  }

  // Validate execution mode
  if (!['sequential', 'parallel'].includes(config.pipeline.execution)) {
    throw new Error('pipeline.execution must be "sequential" or "parallel"');
  }
}

/**
 * Create default configuration
 */
export function createDefaultConfig(): Config {
  return {
    paths: {
      csvInput: './data/bquxjob_696709f0_199c894db50.csv',
      outputDir: './output',
      videosDir: './output/videos',
      manifestsDir: './output/manifests',
      stateFile: './output/state.json',
      finalOutput: './output/final-output.json'
    },
    pipeline: {
      categories: ["Anxiety or fear", "Finances or provision"],
      templates: ["direct-to-camera", "text-visuals"],
      scenesPerVideo: 3,
      variationsPerCombo: 1,
      execution: "sequential"
    },
    apis: {
      openai: {
        apiKey: process.env.OPENAI_API_KEY || '',
        model: 'gpt-4o-mini',
        temperature: 0.7,
        maxTokens: 2000
      },
      replicate: {
        apiKey: process.env.REPLICATE_API_TOKEN || '',
        model: 'google/veo-3',
        pollingInterval: 5000,
        maxRetries: 3
      }
    },
    videoGeneration: {
      aspectRatio: '9:16',
      duration: 8,
      resolution: '720p',
      generateAudio: true
    }
  };
}
