/**
 * Helper Utilities
 * Utility functions for common operations
 */

import * as path from 'path';
import { ProblemCategory, TemplateType } from '../types/script.types';

/**
 * Sleep for specified milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry a function with exponential or linear backoff
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries: number;
    backoff: 'exponential' | 'linear';
    baseDelay: number;
    onRetry?: (attempt: number, error: Error) => void;
  }
): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt <= options.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (attempt < options.maxRetries) {
        const delay = options.backoff === 'exponential'
          ? options.baseDelay * Math.pow(2, attempt)
          : options.baseDelay * (attempt + 1);

        if (options.onRetry) {
          options.onRetry(attempt + 1, lastError);
        }

        await sleep(delay);
      }
    }
  }

  throw lastError!;
}

/**
 * Generate a slug from a string (lowercase, hyphens)
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Generate a video ID from category and template
 */
export function generateVideoId(category: ProblemCategory, template: TemplateType): string {
  const categorySlug = slugify(category);
  return `${categorySlug}_${template}`;
}

/**
 * Generate a timestamp string (ISO 8601 compact format)
 */
export function generateTimestamp(): string {
  return new Date().toISOString().replace(/[:.]/g, '-').replace('Z', '');
}

/**
 * Generate a script file path
 */
export function generateScriptPath(
  scriptsDir: string,
  category: ProblemCategory,
  template: TemplateType
): string {
  const videoId = generateVideoId(category, template);
  const timestamp = generateTimestamp();
  return path.join(scriptsDir, `${videoId}_${timestamp}.json`);
}

/**
 * Generate a video clip file path
 */
export function generateClipPath(
  videosDir: string,
  videoId: string,
  sceneNumber: number
): string {
  const timestamp = generateTimestamp();
  return path.join(videosDir, `${videoId}_scene${sceneNumber}_${timestamp}.mp4`);
}

/**
 * Ensure a directory exists, create if not
 */
export async function ensureDir(dirPath: string): Promise<void> {
  const fs = await import('fs/promises');
  try {
    await fs.access(dirPath);
  } catch {
    await fs.mkdir(dirPath, { recursive: true });
  }
}

/**
 * Format bytes to human-readable string
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Format duration in milliseconds to human-readable string
 */
export function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
}

/**
 * Safely parse JSON with error handling
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}

/**
 * Truncate string to max length with ellipsis
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength - 3) + '...';
}
