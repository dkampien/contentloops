import * as fs from 'node:fs';
import * as path from 'node:path';
import type { TemplateConfig } from '../types/index.js';

/**
 * Get a nested value from an object using dot notation
 *
 * @param obj - Object to traverse
 * @param path - Dot-separated path (e.g., "style.artStyle")
 * @returns The value at the path, or undefined if not found
 */
export function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  const keys = path.split('.');
  let current: unknown = obj;

  for (const key of keys) {
    if (current === null || current === undefined) {
      return undefined;
    }
    if (typeof current !== 'object') {
      return undefined;
    }
    current = (current as Record<string, unknown>)[key];
  }

  return current;
}

/**
 * Inject variables into a template string
 *
 * Replaces {variable} or {nested.path} placeholders with values from the variables object.
 * Unmatched placeholders are left as-is.
 *
 * @param template - String with {variable} placeholders
 * @param variables - Object containing values to inject
 * @returns String with placeholders replaced
 *
 * @example
 * injectVariables("Style: {style.artStyle}", { style: { artStyle: "watercolor" } })
 * // Returns: "Style: watercolor"
 */
export function injectVariables(
  template: string,
  variables: Record<string, unknown>
): string {
  return template.replace(/\{(\w+(?:\.\w+)*)\}/g, (match, path) => {
    const value = getNestedValue(variables, path);
    if (value === undefined || value === null) {
      return match; // Keep original placeholder if value not found
    }
    return String(value);
  });
}

/**
 * Load a template config from a JSON file
 *
 * @param templatePath - Path to the template directory
 * @returns Parsed template config
 */
export function loadConfig(templatePath: string): TemplateConfig {
  const configPath = path.join(templatePath, 'config.json');

  if (!fs.existsSync(configPath)) {
    throw new Error(`Template config not found: ${configPath}`);
  }

  const content = fs.readFileSync(configPath, 'utf-8');
  const config = JSON.parse(content) as TemplateConfig;

  return config;
}

/**
 * Merge runtime overrides into a config
 *
 * @param config - Base config
 * @param overrides - Runtime overrides from CLI flags
 * @returns Merged config
 */
export function mergeConfig(
  config: TemplateConfig,
  overrides: Partial<TemplateConfig>
): TemplateConfig {
  return {
    ...config,
    ...overrides,
    settings: {
      ...config.settings,
      ...(overrides.settings || {}),
    },
    style: {
      ...config.style,
      ...(overrides.style || {}),
    },
    generation: {
      ...config.generation,
      ...(overrides.generation || {}),
      params: {
        ...config.generation.params,
        ...(overrides.generation?.params || {}),
      },
    },
  };
}

/**
 * Get the templates directory path
 */
export function getTemplatesDir(): string {
  return path.join(process.cwd(), 'templates');
}

/**
 * Get the path to a specific template
 */
export function getTemplatePath(templateName: string): string {
  return path.join(getTemplatesDir(), templateName);
}
