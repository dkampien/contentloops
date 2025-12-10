import type { Services } from '../types/index.js';
import { createLLMService } from './llm.js';
import { createReplicateService } from './replicate.js';
import { createStorageService } from './storage.js';

/**
 * Create all services for a template execution
 *
 * @param templateName - Name of the template (used for storage paths)
 * @returns Services object with all available services
 */
export function createServices(templateName: string): Services {
  return {
    llm: createLLMService(),
    replicate: createReplicateService(),
    storage: createStorageService(templateName),
  };
}

// Re-export individual service factories
export { createLLMService } from './llm.js';
export { createReplicateService } from './replicate.js';
export { createStorageService } from './storage.js';
