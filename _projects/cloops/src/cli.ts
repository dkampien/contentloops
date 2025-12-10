#!/usr/bin/env node

import { Command } from 'commander';
import { loadTemplate, listTemplates, templateExists, getTemplateInfo } from './template/loader.js';
import { createDatasource } from './datasource/index.js';
import { extractStories, loadUniversalPool, loadExtractionState } from './datasource/ds-stories-backlog.js';
import { runTemplate } from './engine/runner.js';
import type { RunOptions } from './types/index.js';

const program = new Command();

program
  .name('cloops')
  .description('Template-based content generation system for AdLoops')
  .version('1.0.0');

// ===== RUN Command =====

program
  .command('run <template>')
  .description('Run a template to generate content')
  .option('-d, --dry', 'Dry run (skip image generation)', false)
  .option('-i, --item <id>', 'Run a specific item by ID')
  .option('-b, --batch <count>', 'Run N pending items')
  .option('-a, --all', 'Run all pending items', false)
  .option('--replay', 'Replay from prompts.md (skip LLM calls, regenerate images)', false)
  .action(async (templateName: string, options: { dry: boolean; item?: string; batch?: string; all: boolean; replay: boolean }) => {
    try {
      // Validate template exists
      if (!templateExists(templateName)) {
        console.error(`Error: Template "${templateName}" not found.`);
        console.error(`Available templates: ${listTemplates().join(', ') || 'none'}`);
        process.exit(1);
      }

      // Load template (async - loads workflow.ts dynamically)
      const template = await loadTemplate(templateName);
      console.log(`Loaded template: ${template.name}`);

      // Create datasource based on template config
      const datasource = createDatasource(templateName, template.config);

      // Determine how many items to process
      let itemsToProcess: number;
      if (options.item) {
        itemsToProcess = 1; // Specific item
      } else if (options.all) {
        const status = datasource.getStatus();
        itemsToProcess = status.pending + status.inProgress;  // Include in_progress (incomplete)
        if (itemsToProcess === 0) {
          console.log('No pending items in backlog.');
          process.exit(0);
        }
        console.log(`Processing all ${itemsToProcess} pending items...\n`);
      } else if (options.batch) {
        itemsToProcess = parseInt(options.batch, 10);
        if (isNaN(itemsToProcess) || itemsToProcess < 1) {
          console.error('Error: Batch count must be a positive number');
          process.exit(1);
        }
        console.log(`Batch mode: up to ${itemsToProcess} items\n`);
      } else {
        itemsToProcess = 1; // Default: single item
      }

      // Ensure enough items are available (extracts from source if needed)
      if (!options.item && datasource.ensureAvailable) {
        await datasource.ensureAvailable(itemsToProcess);
      }

      // Process items
      let processed = 0;
      let failed = 0;

      for (let i = 0; i < itemsToProcess; i++) {
        // Get next item
        let item;
        if (options.item && i === 0) {
          item = datasource.getItem(options.item);
          if (!item) {
            console.error(`Error: Item "${options.item}" not found in backlog.`);
            process.exit(1);
          }
        } else {
          item = await datasource.getNextItem();
          if (!item) {
            if (processed === 0) {
              console.log('No pending items in backlog.');
            }
            break;
          }
        }

        const progress = itemsToProcess > 1 ? `[${i + 1}/${itemsToProcess}] ` : '';
        console.log(`${progress}Processing: ${item.id} (${item.input.title})`);

        // Mark as in progress
        await datasource.markInProgress(item.id);

        // Run the template
        const runOptions: RunOptions = {
          dry: options.dry,
          item: item.id,
          replay: options.replay,
        };

        try {
          await runTemplate(template, item.input, runOptions);

          // Mark complete if not dry run
          if (!options.dry) {
            await datasource.markComplete(item.id);
          }
          processed++;
        } catch (error) {
          // Mark as failed
          const errorMessage = error instanceof Error ? error.message : String(error);
          await datasource.markFailed(item.id, errorMessage);
          failed++;
          console.error(`\n✗ Failed: ${errorMessage}\n`);

          // Stop on first failure unless in batch mode
          if (!options.batch && !options.all) {
            throw error;
          }
        }
      }

      // Summary
      if (itemsToProcess > 1) {
        console.log(`\n========================================`);
        console.log(`Batch complete: ${processed} succeeded, ${failed} failed`);
        console.log(`========================================`);
      } else if (processed > 0) {
        console.log('\nDone!');
      }
    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

// ===== TEMPLATES Command =====

program
  .command('templates')
  .description('List available templates')
  .action(() => {
    const templates = listTemplates();

    if (templates.length === 0) {
      console.log('No templates found.');
      console.log('Create a template in the templates/ directory with config.json and workflow.ts files.');
      return;
    }

    console.log('Available templates:\n');
    templates.forEach((name) => {
      try {
        const info = getTemplateInfo(name);
        console.log(`  ${name}`);
        console.log(`    Datasource: ${info.datasource}`);
        console.log(`    Model: ${info.model}`);
        console.log(`    Workflow: ${info.hasWorkflow ? '✓' : '✗'}`);
        console.log('');
      } catch {
        console.log(`  ${name} (error loading info)`);
      }
    });
  });

// ===== STATUS Command =====

program
  .command('status <template>')
  .description('Show backlog status for a template')
  .action(async (templateName: string) => {
    try {
      if (!templateExists(templateName)) {
        console.error(`Error: Template "${templateName}" not found.`);
        process.exit(1);
      }

      // Load template to get config
      const template = await loadTemplate(templateName);
      const datasource = createDatasource(templateName, template.config);
      const status = datasource.getStatus();
      const items = datasource.getAllItems();

      console.log(`\nBacklog status for: ${templateName}`);
      console.log(`Datasource: ${template.config.datasource}\n`);
      console.log(`  Total:       ${status.total}`);
      console.log(`  Pending:     ${status.pending}`);
      console.log(`  In Progress: ${status.inProgress}`);
      console.log(`  Completed:   ${status.completed}`);
      console.log(`  Failed:      ${status.failed}`);

      if (items.length > 0) {
        console.log('\nItems:');
        items.forEach((item) => {
          const statusIcon =
            item.status === 'completed' ? '✓' :
            item.status === 'failed' ? '✗' :
            item.status === 'in_progress' ? '⋯' : '○';
          console.log(`  ${statusIcon} ${item.id}: ${item.input.title} [${item.status}]`);
          if (item.error) {
            console.log(`      Error: ${item.error}`);
          }
        });
      }

      console.log('');
    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

// ===== EXTRACT Command =====

program
  .command('extract')
  .description('Extract stories from Bible into universal pool')
  .option('-c, --count <number>', 'Number of stories to extract', '10')
  .action(async (options: { count: string }) => {
    try {
      const count = parseInt(options.count, 10);
      if (isNaN(count) || count < 1) {
        console.error('Error: Count must be a positive number');
        process.exit(1);
      }

      await extractStories(count);
    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

// ===== STORIES STATUS Command =====

program
  .command('stories')
  .description('Show stories extraction status')
  .action(() => {
    try {
      const pool = loadUniversalPool();
      const state = loadExtractionState();

      console.log('\n📚 Stories Backlog Status\n');
      console.log(`Universal Pool: ${pool.length} stories`);
      console.log(`Current Position: ${state.currentBook} chapter ${state.currentChapter}`);
      console.log(`Completed Books: ${state.completedBooks.length}`);
      console.log(`Total Extracted: ${state.totalExtracted}`);

      if (pool.length > 0) {
        console.log('\nRecent stories:');
        pool.slice(-5).forEach((story) => {
          console.log(`  • ${story.title} (${story.source.book} ${story.source.chapter})`);
        });
      }

      console.log('');
    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

// Parse and execute
program.parse();
