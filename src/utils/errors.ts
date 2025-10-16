/**
 * Error Classes
 * Custom error types for different pipeline stages
 */

/**
 * Base pipeline error
 */
export class PipelineError extends Error {
  constructor(
    message: string,
    public stage: string,
    public context?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'PipelineError';
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      stage: this.stage,
      context: this.context,
      stack: this.stack
    };
  }
}

/**
 * CSV reading/parsing errors
 */
export class CSVReadError extends PipelineError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'csv-read', context);
    this.name = 'CSVReadError';
  }
}

export class CSVParseError extends PipelineError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'csv-parse', context);
    this.name = 'CSVParseError';
  }
}

/**
 * Script generation errors
 */
export class ScriptGenerationError extends PipelineError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'script-generation', context);
    this.name = 'ScriptGenerationError';
  }
}

/**
 * Video generation errors
 */
export class VideoGenerationError extends PipelineError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'video-generation', context);
    this.name = 'VideoGenerationError';
  }
}

/**
 * State management errors
 */
export class StateError extends PipelineError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'state-management', context);
    this.name = 'StateError';
  }
}

/**
 * Configuration errors
 */
export class ConfigError extends PipelineError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'configuration', context);
    this.name = 'ConfigError';
  }
}

/**
 * Check if error is a pipeline error
 */
export function isPipelineError(error: unknown): error is PipelineError {
  return error instanceof PipelineError;
}
