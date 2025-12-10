import * as fs from 'node:fs';
import * as path from 'node:path';
import { pathToFileURL } from 'node:url';
import type { Template, TemplateConfig, WorkflowFunction } from '../types/index.js';
import { loadConfig, getTemplatesDir, getTemplatePath } from '../utils/config.js';

/**
 * List all available templates
 *
 * Scans the templates directory and returns names of all valid templates
 * (directories containing both config.json AND workflow.ts).
 */
export function listTemplates(): string[] {
  const templatesDir = getTemplatesDir();

  if (!fs.existsSync(templatesDir)) {
    return [];
  }

  const entries = fs.readdirSync(templatesDir, { withFileTypes: true });
  const templates: string[] = [];

  for (const entry of entries) {
    if (entry.isDirectory()) {
      const configPath = path.join(templatesDir, entry.name, 'config.json');
      const workflowPath = path.join(templatesDir, entry.name, 'workflow.ts');

      // Valid template requires both config.json and workflow.ts
      if (fs.existsSync(configPath) && fs.existsSync(workflowPath)) {
        templates.push(entry.name);
      }
    }
  }

  return templates;
}

/**
 * Check if a template exists and is valid
 */
export function templateExists(templateName: string): boolean {
  const templatePath = getTemplatePath(templateName);
  const configPath = path.join(templatePath, 'config.json');
  const workflowPath = path.join(templatePath, 'workflow.ts');

  return fs.existsSync(configPath) && fs.existsSync(workflowPath);
}

/**
 * Load system prompts from a template's system-prompts directory
 *
 * Reads all .md files from the system-prompts folder and returns them
 * keyed by their filename (without extension).
 */
function loadPrompts(templatePath: string): Record<string, string> {
  const promptsDir = path.join(templatePath, 'system-prompts');
  const prompts: Record<string, string> = {};

  if (!fs.existsSync(promptsDir)) {
    return prompts;
  }

  const files = fs.readdirSync(promptsDir);

  for (const file of files) {
    if (file.endsWith('.md')) {
      const name = path.basename(file, '.md');
      const content = fs.readFileSync(path.join(promptsDir, file), 'utf-8');
      prompts[name] = content;
    }
  }

  return prompts;
}

/**
 * Load schemas from a template's schemas directory
 *
 * Reads all .json files from the schemas folder and returns them
 * keyed by their filename (without extension).
 */
function loadSchemas(templatePath: string): Record<string, object> {
  const schemasDir = path.join(templatePath, 'schemas');
  const schemas: Record<string, object> = {};

  if (!fs.existsSync(schemasDir)) {
    return schemas;
  }

  const files = fs.readdirSync(schemasDir);

  for (const file of files) {
    if (file.endsWith('.json')) {
      const name = path.basename(file, '.json');
      const content = fs.readFileSync(path.join(schemasDir, file), 'utf-8');
      schemas[name] = JSON.parse(content);
    }
  }

  return schemas;
}

/**
 * Load a template's workflow function
 *
 * Dynamically imports the workflow.ts file from the template directory.
 */
async function loadWorkflow(templatePath: string): Promise<WorkflowFunction> {
  const workflowPath = path.join(templatePath, 'workflow.ts');

  if (!fs.existsSync(workflowPath)) {
    throw new Error(`Workflow file not found: ${workflowPath}`);
  }

  // Convert to file URL for dynamic import
  const workflowUrl = pathToFileURL(workflowPath).href;

  try {
    const workflowModule = await import(workflowUrl);

    if (!workflowModule.run || typeof workflowModule.run !== 'function') {
      throw new Error(`Workflow must export a 'run' function: ${workflowPath}`);
    }

    return workflowModule.run;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to load workflow: ${errorMessage}`);
  }
}

/**
 * Load a template by name
 *
 * Loads the config.json, workflow.ts, prompts, and schemas from the template directory.
 *
 * @param templateName - Name of the template folder
 * @returns Template object with config, workflow, prompts, and schemas
 */
export async function loadTemplate(templateName: string): Promise<Template> {
  const templatePath = getTemplatePath(templateName);

  if (!templateExists(templateName)) {
    throw new Error(`Template not found: ${templateName}`);
  }

  const config = loadConfig(templatePath);
  const workflow = await loadWorkflow(templatePath);
  const prompts = loadPrompts(templatePath);
  const schemas = loadSchemas(templatePath);

  return {
    name: templateName,
    config,
    workflow,
    prompts,
    schemas,
  };
}

/**
 * Get template info for display
 */
export function getTemplateInfo(templateName: string): {
  name: string;
  datasource: string;
  model: string;
  hasWorkflow: boolean;
} {
  const templatePath = getTemplatePath(templateName);
  const config = loadConfig(templatePath);
  const workflowPath = path.join(templatePath, 'workflow.ts');

  return {
    name: templateName,
    datasource: config.datasource,
    model: config.generation.model,
    hasWorkflow: fs.existsSync(workflowPath),
  };
}
