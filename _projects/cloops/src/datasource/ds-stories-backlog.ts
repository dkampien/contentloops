import * as fs from 'node:fs';
import * as path from 'node:path';
import type {
  Story,
  TemplateBacklogItem,
  ExtractionState,
  BacklogItem,
  StoryInput,
  ItemStatus,
} from '../types/index.js';
import type { Datasource, DatasourceStatus } from './types.js';
import { createBibleApiService } from '../services/bible-api.js';
import { createLLMService } from '../services/llm.js';
import { bundleExists, findBundleDir, promptsMdExists } from '../services/storage.js';

// Default Bible version: Berean Standard Bible
const DEFAULT_BIBLE_ID = 'bba9f40183526463-01';

/**
 * Generate a slug from title (for folder naming)
 */
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// Paths
const DATA_DIR = path.join(process.cwd(), 'data', 'ds-stories-backlog');
const UNIVERSAL_PATH = path.join(DATA_DIR, 'universal.json');
const STATE_PATH = path.join(DATA_DIR, 'extraction-state.json');
const TEMPLATE_BACKLOGS_DIR = path.join(DATA_DIR, 'template-backlogs');

// ===================
// Storage Helpers
// ===================

function ensureDir(dir: string): void {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function readJson<T>(filePath: string, defaultValue: T): T {
  if (!fs.existsSync(filePath)) {
    return defaultValue;
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

function writeJson(filePath: string, data: unknown): void {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// ===================
// Universal Pool
// ===================

export function loadUniversalPool(): Story[] {
  return readJson<Story[]>(UNIVERSAL_PATH, []);
}

export function saveUniversalPool(stories: Story[]): void {
  writeJson(UNIVERSAL_PATH, stories);
}

export function addToUniversalPool(story: Story): void {
  const pool = loadUniversalPool();
  pool.push(story);
  saveUniversalPool(pool);
}

export function getStoryById(storyId: string): Story | undefined {
  const pool = loadUniversalPool();
  return pool.find((s) => s.id === storyId);
}

// ===================
// Extraction State
// ===================

function getDefaultState(): ExtractionState {
  return {
    bibleId: DEFAULT_BIBLE_ID,
    currentBook: 'GEN',
    currentChapter: 1,
    completedBooks: [],
    totalExtracted: 0,
  };
}

export function loadExtractionState(): ExtractionState {
  return readJson<ExtractionState>(STATE_PATH, getDefaultState());
}

export function saveExtractionState(state: ExtractionState): void {
  writeJson(STATE_PATH, state);
}

// ===================
// Template Backlog
// ===================

function getTemplateBacklogPath(templateId: string): string {
  return path.join(TEMPLATE_BACKLOGS_DIR, `${templateId}.json`);
}

export function loadTemplateBacklog(templateId: string): TemplateBacklogItem[] {
  return readJson<TemplateBacklogItem[]>(getTemplateBacklogPath(templateId), []);
}

export function saveTemplateBacklog(templateId: string, items: TemplateBacklogItem[]): void {
  writeJson(getTemplateBacklogPath(templateId), items);
}

// ===================
// Extraction Logic
// ===================

const EXTRACTION_PROMPT = `You are analyzing a Bible passage to determine if it contains a compelling visual story suitable for a comic book illustration.

A "story-worthy" passage should have:
1. Clear characters (people, God, angels, etc.)
2. Visible action or dramatic moments
3. Emotional stakes or conflict
4. Scenes that can be illustrated

NOT story-worthy:
- Genealogies (lists of names)
- Laws and regulations
- Poetry/psalms without narrative
- Prophetic visions that are abstract

If the passage IS story-worthy, extract:
- A clear title
- A concise summary (2-3 sentences)
- 4-6 key visual moments that could become comic panels

If the passage is NOT story-worthy, indicate that clearly.`;

interface ExtractionResult {
  isStoryWorthy: boolean;
  title?: string;
  summary?: string;
  keyMoments?: string[];
}

const extractionSchema = {
  type: 'object',
  properties: {
    isStoryWorthy: { type: 'boolean' },
    title: { type: 'string' },
    summary: { type: 'string' },
    keyMoments: { type: 'array', items: { type: 'string' } },
  },
  required: ['isStoryWorthy', 'title', 'summary', 'keyMoments'],
  additionalProperties: false,
};

/**
 * Extract stories from Bible starting from current position
 */
export async function extractStories(count: number): Promise<Story[]> {
  const api = createBibleApiService();
  const llm = createLLMService();
  const state = loadExtractionState();
  const extracted: Story[] = [];

  console.log(`\nStarting extraction from ${state.currentBook} chapter ${state.currentChapter}...`);
  console.log(`Target: ${count} stories\n`);

  // Get all books
  const books = await api.getBooks(state.bibleId);
  let bookIndex = books.findIndex((b) => b.id === state.currentBook);
  if (bookIndex === -1) bookIndex = 0;

  while (extracted.length < count && bookIndex < books.length) {
    const book = books[bookIndex];
    const chapters = await api.getChapters(state.bibleId, book.id);

    // Start from current chapter or 1 (skip intro at index 0)
    let chapterIndex = state.currentBook === book.id ? state.currentChapter : 1;

    while (extracted.length < count && chapterIndex < chapters.length) {
      const chapter = chapters[chapterIndex];
      console.log(`Processing ${chapter.reference}...`);

      try {
        // Get sections for this chapter
        const sections = await api.getSections(state.bibleId, chapter.id);

        for (const section of sections) {
          if (extracted.length >= count) break;

          try {
            // Get full section content
            const fullSection = await api.getSection(state.bibleId, section.id);
            console.log(`  Analyzing: ${section.title}`);

            // LLM determines if story-worthy
            const result = await llm.call<ExtractionResult>({
              systemPrompt: EXTRACTION_PROMPT,
              userMessage: `Passage Title: ${section.title}\n\nContent:\n${fullSection.content}`,
              schema: extractionSchema,
              reasoning: 'low',
            });

            if (result.isStoryWorthy && result.title && result.summary && result.keyMoments) {
              const storyId = `${book.id}.${chapterIndex}.${section.id.split('.').pop()}`;
              const story: Story = {
                id: storyId,
                title: result.title,
                summary: result.summary,
                keyMoments: result.keyMoments,
                source: {
                  book: book.name,
                  chapter: chapterIndex,
                  section: section.id,
                },
              };

              addToUniversalPool(story);
              extracted.push(story);
              console.log(`  ✓ Extracted: ${result.title}`);
            } else {
              console.log(`  ✗ Not story-worthy`);
            }
          } catch (sectionError) {
            const msg = sectionError instanceof Error ? sectionError.message : String(sectionError);
            console.log(`  ✗ Error processing section: ${msg.slice(0, 100)}`);
          }
        }
      } catch (error) {
        // Chapter has no sections
        console.log(`  Skipped (no sections available)`);
      }

      chapterIndex++;
      state.currentChapter = chapterIndex;
      saveExtractionState(state);
    }

    // Move to next book
    if (chapterIndex >= (await api.getChapters(state.bibleId, book.id)).length) {
      state.completedBooks.push(book.id);
      bookIndex++;
      if (bookIndex < books.length) {
        state.currentBook = books[bookIndex].id;
        state.currentChapter = 1;
      }
      saveExtractionState(state);
    }
  }

  state.totalExtracted += extracted.length;
  saveExtractionState(state);

  console.log(`\nExtraction complete: ${extracted.length} stories extracted`);
  console.log(`Total in universal pool: ${loadUniversalPool().length}`);

  return extracted;
}

// ===================
// Datasource Implementation
// ===================

export class StoriesBacklogDatasource implements Datasource {
  private templateId: string;

  constructor(templateId: string) {
    this.templateId = templateId;
    ensureDir(TEMPLATE_BACKLOGS_DIR);
  }

  /**
   * Derive status from filesystem (output folder is source of truth)
   * Uses slug derived from title for folder lookup
   */
  private deriveStatus(title: string): ItemStatus {
    const slug = generateSlug(title);
    // Check if complete bundle exists (story-data.json)
    if (bundleExists(this.templateId, slug)) {
      return 'completed';
    }
    // Check if prompts.md exists (LLM done, images pending)
    if (promptsMdExists(this.templateId, slug)) {
      return 'in_progress';
    }
    return 'pending';
  }

  /**
   * Get next item that needs processing (no complete output)
   */
  async getNextItem(): Promise<BacklogItem | null> {
    const backlog = loadTemplateBacklog(this.templateId);

    // Find item without complete output (use title to derive slug for lookup)
    for (const item of backlog) {
      const slug = generateSlug(item.title);
      if (!bundleExists(this.templateId, slug)) {
        return this.toBacklogItem(item);
      }
    }

    // All items have output - try to get more from universal pool
    const story = await this.getNextFromUniversal();
    if (!story) {
      return null;
    }

    // Add to template backlog with title
    const newItem: TemplateBacklogItem = {
      storyId: story.id,
      title: story.title,
    };
    backlog.push(newItem);
    saveTemplateBacklog(this.templateId, backlog);

    return this.toBacklogItem(newItem);
  }

  /**
   * Get a specific item by ID
   */
  getItem(itemId: string): BacklogItem | null {
    const backlog = loadTemplateBacklog(this.templateId);
    const item = backlog.find((i) => i.storyId === itemId);
    if (!item) return null;
    return this.toBacklogItem(item);
  }

  /**
   * Mark item as in progress (no-op - filesystem is source of truth)
   */
  async markInProgress(itemId: string): Promise<void> {
    // Status derived from filesystem - this is just for logging
    console.log(`[StoriesBacklog] Processing ${itemId}...`);
  }

  /**
   * Mark item as completed (no-op - filesystem is source of truth)
   */
  async markComplete(itemId: string): Promise<void> {
    // Status derived from filesystem - output folder existence = completed
    // Clear any previous error
    const backlog = loadTemplateBacklog(this.templateId);
    const item = backlog.find((i) => i.storyId === itemId);
    if (item && item.error) {
      delete item.error;
      saveTemplateBacklog(this.templateId, backlog);
    }
  }

  /**
   * Mark item as failed (stores error for debugging)
   */
  async markFailed(itemId: string, error: string): Promise<void> {
    const backlog = loadTemplateBacklog(this.templateId);
    const item = backlog.find((i) => i.storyId === itemId);
    if (item) {
      item.error = error;
      saveTemplateBacklog(this.templateId, backlog);
    }
    console.log(`[StoriesBacklog] Item ${itemId} failed: ${error}`);
  }

  /**
   * Get all items in template backlog (status derived from filesystem)
   */
  getAllItems(): BacklogItem[] {
    const backlog = loadTemplateBacklog(this.templateId);
    return backlog.map((item) => this.toBacklogItem(item)).filter((i): i is BacklogItem => i !== null);
  }

  /**
   * Get status counts (derived from filesystem)
   */
  getStatus(): DatasourceStatus {
    const backlog = loadTemplateBacklog(this.templateId);
    let pending = 0, inProgress = 0, completed = 0, failed = 0;

    for (const item of backlog) {
      const status = this.deriveStatus(item.title);
      if (status === 'completed') completed++;
      else if (status === 'in_progress') inProgress++;
      else {
        pending++;  // Pending items are always retryable
        if (item.error) failed++;  // Track failed for display (subset of pending)
      }
    }

    return { total: backlog.length, pending, inProgress, completed, failed };
  }

  /**
   * Ensure at least N items are available for processing
   * Extracts from Bible if needed
   */
  async ensureAvailable(count: number): Promise<void> {
    const status = this.getStatus();
    const available = status.pending + status.inProgress;  // Items that can be processed

    if (available >= count) {
      return;  // Already have enough
    }

    const needed = count - available;

    // Check universal pool first
    const pool = loadUniversalPool();
    const backlog = loadTemplateBacklog(this.templateId);
    const usedIds = new Set(backlog.map((i) => i.storyId));
    const unusedInPool = pool.filter((story) => !usedIds.has(story.id));

    if (unusedInPool.length >= needed) {
      // Add from existing pool
      for (let i = 0; i < needed; i++) {
        const story = unusedInPool[i];
        backlog.push({ storyId: story.id, title: story.title });
      }
      saveTemplateBacklog(this.templateId, backlog);
      console.log(`[StoriesBacklog] Added ${needed} stories from universal pool`);
      return;
    }

    // Need to extract more from Bible
    const fromPool = unusedInPool.length;
    const toExtract = needed - fromPool;

    // Add what we have from pool first
    for (const story of unusedInPool) {
      backlog.push({ storyId: story.id, title: story.title });
    }
    if (fromPool > 0) {
      saveTemplateBacklog(this.templateId, backlog);
      console.log(`[StoriesBacklog] Added ${fromPool} stories from universal pool`);
    }

    // Extract the rest
    if (toExtract > 0) {
      console.log(`[StoriesBacklog] Extracting ${toExtract} more stories from Bible...`);
      const newStories = await extractStories(toExtract);

      // Add newly extracted to backlog
      for (const story of newStories) {
        backlog.push({ storyId: story.id, title: story.title });
      }
      saveTemplateBacklog(this.templateId, backlog);
    }
  }

  // ===== Private Helpers =====

  private async getNextFromUniversal(): Promise<Story | null> {
    const pool = loadUniversalPool();
    const backlog = loadTemplateBacklog(this.templateId);
    const usedIds = new Set(backlog.map((i) => i.storyId));

    // Find story not yet in this template's backlog
    const available = pool.find((story) => !usedIds.has(story.id));

    if (available) {
      return available;
    }

    // Universal pool exhausted for this template - extract more
    console.log(`[StoriesBacklog] Universal pool exhausted, extracting more...`);
    const newStories = await extractStories(10); // Extract 10 at a time
    return newStories[0] || null;
  }

  private toBacklogItem(item: TemplateBacklogItem): BacklogItem | null {
    const story = getStoryById(item.storyId);
    if (!story) return null;

    // Derive status from filesystem only - errors don't block retry
    const status = this.deriveStatus(item.title);

    return {
      id: item.storyId,
      status,
      input: {
        title: item.title,  // Use title from backlog (source of truth for folder naming)
        summary: story.summary,
        keyMoments: story.keyMoments,
      },
      completedAt: null,  // Not tracked anymore
      error: item.error,
    };
  }
}

/**
 * Create a stories-backlog datasource for a template
 */
export function createStoriesBacklogDatasource(templateId: string): StoriesBacklogDatasource {
  return new StoriesBacklogDatasource(templateId);
}
