import type { Template, StoryInput, RunOptions, WorkflowContext } from '../types/index.js';
import { createServices } from '../services/index.js';

/**
 * Generate a story ID from the title
 */
function generateStoryId(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Run a template workflow with the given input
 *
 * The engine is thin - it just:
 * 1. Creates services
 * 2. Builds context
 * 3. Calls the template's workflow function
 *
 * All step logic lives in the template's workflow.ts
 *
 * @param template - Loaded template with config, workflow, prompts, and schemas
 * @param input - Story input data
 * @param options - Run options (dry run, debug, replay, etc.)
 */
export async function runTemplate(
  template: Template,
  input: StoryInput,
  options: RunOptions
): Promise<void> {
  const storyId = generateStoryId(input.title);

  // Determine mode for display
  let mode = 'FULL RUN';
  if (options.dry) mode = 'DRY RUN';
  else if (options.replay) mode = 'REPLAY (from prompts.md)';

  console.log(`\n========================================`);
  console.log(`Running template: ${template.name}`);
  console.log(`Story: ${input.title}`);
  console.log(`Mode: ${mode}`);
  console.log(`========================================\n`);

  // Create services
  const services = createServices(template.name);

  // Build workflow context
  const context: WorkflowContext = {
    prompts: template.prompts,
    schemas: template.schemas,
    templatePath: `templates/${template.name}`,
    dry: options.dry,
    replay: options.replay ?? false,
    storyId,
  };

  try {
    const startTime = Date.now();

    // Execute the template's workflow
    await template.workflow(input, template.config, services, context);

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`\n========================================`);
    console.log(`Template run completed successfully (${duration}s)`);
    console.log(`========================================\n`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`\n✗ Template workflow failed: ${errorMessage}`);
    throw error;
  }
}
