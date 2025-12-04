import type { TemplateConfig } from '../types/index.js';
import type { Datasource } from './types.js';
import { createStoriesBacklogDatasource } from './ds-stories-backlog.js';

/**
 * Datasource Manager
 *
 * Routes templates to the appropriate datasource type based on
 * what template declares in config.
 */
export function createDatasource(templateName: string, config: TemplateConfig): Datasource {
  switch (config.datasource) {
    case 'ds-stories-backlog':
      return createStoriesBacklogDatasource(templateName);
    default:
      throw new Error(`Unknown datasource type: ${config.datasource}`);
  }
}

// Re-export types
export type { Datasource, DatasourceStatus } from './types.js';
