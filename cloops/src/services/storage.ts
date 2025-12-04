import * as fs from 'node:fs';
import * as path from 'node:path';
import type { BundleData, StoryDataJson, StorageService, PromptsMdData, ReplayData, Page } from '../types/index.js';

/**
 * Ensure a directory exists, creating it recursively if needed
 */
export function ensureDir(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Write JSON data to a file
 */
export function writeJson(filePath: string, data: unknown): void {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

/**
 * Read JSON data from a file
 */
export function readJson<T>(filePath: string): T {
  const content = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(content) as T;
}

/**
 * Get the output directory for a template
 */
export function getOutputDir(templateName: string): string {
  return path.join(process.cwd(), 'output', templateName);
}

/**
 * Get the next sequence number for a template
 */
export function getNextSequence(templateName: string): number {
  const outputDir = getOutputDir(templateName);
  if (!fs.existsSync(outputDir)) {
    return 1;
  }

  const entries = fs.readdirSync(outputDir, { withFileTypes: true });
  const folders = entries.filter(e => e.isDirectory());

  // Find highest existing sequence number
  let maxSeq = 0;
  for (const folder of folders) {
    const match = folder.name.match(/^(\d{3})-/);
    if (match) {
      const seq = parseInt(match[1], 10);
      if (seq > maxSeq) maxSeq = seq;
    }
  }

  return maxSeq + 1;
}

/**
 * Find existing bundle folder for a storyId (with or without sequence prefix)
 */
export function findBundleDir(templateName: string, storyId: string): string | null {
  const outputDir = getOutputDir(templateName);
  if (!fs.existsSync(outputDir)) {
    return null;
  }

  const entries = fs.readdirSync(outputDir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) {
      // Match "001-story-id" or just "story-id"
      if (entry.name === storyId || entry.name.match(new RegExp(`^\\d{3}-${storyId}$`))) {
        return path.join(outputDir, entry.name);
      }
    }
  }
  return null;
}

/**
 * Get the bundle directory for a specific story (creates sequenced folder name)
 */
export function getBundleDir(templateName: string, storyId: string): string {
  // Check if folder already exists
  const existing = findBundleDir(templateName, storyId);
  if (existing) {
    return existing;
  }

  // Create new sequenced folder name
  const seq = getNextSequence(templateName);
  const seqStr = seq.toString().padStart(3, '0');
  return path.join(getOutputDir(templateName), `${seqStr}-${storyId}`);
}

/**
 * Write story-data.json to the output directory
 *
 * Images are already written directly by the replicate service.
 *
 * @param storyId - Unique identifier for the story
 * @param templateName - Name of the template (e.g., "comic-books-standard")
 * @param data - Bundle data containing metadata
 */
export function writeBundle(
  storyId: string,
  templateName: string,
  data: BundleData
): string {
  const bundleDir = getBundleDir(templateName, storyId);
  ensureDir(bundleDir);

  // Create story-data.json (images already written by replicate service)
  const storyData: StoryDataJson = {
    storyId,
    title: data.title,
    thumbnailFile: data.thumbnailImage ? 'thumbnail.jpg' : undefined,
    totalPages: data.pages.length,
    pages: data.pages.map((page, index) => ({
      pageNumber: index + 1,
      imageFile: `${index + 1}.jpg`,
      narration: page.narration,
    })),
  };

  writeJson(path.join(bundleDir, 'story-data.json'), storyData);

  console.log(`Bundle written to: ${bundleDir}`);
  return bundleDir;
}

/**
 * Check if a complete bundle exists for a story (has story-data.json)
 */
export function bundleExists(templateName: string, storyId: string): boolean {
  const bundleDir = findBundleDir(templateName, storyId);
  if (!bundleDir) return false;
  const storyDataPath = path.join(bundleDir, 'story-data.json');
  return fs.existsSync(storyDataPath);
}

/**
 * Write prompts.md to the bundle directory
 */
export function writePromptsMd(
  templateName: string,
  storyId: string,
  data: PromptsMdData
): void {
  const bundleDir = getBundleDir(templateName, storyId);
  ensureDir(bundleDir);
  const promptsPath = path.join(bundleDir, 'prompts.md');

  // Build markdown content
  const lines: string[] = [
    `# ${data.title}`,
    '',
    '## Narrative',
    '```',
    data.narrative,
    '```',
    '',
    '## Pages',
    '```json',
    JSON.stringify(data.pages, null, 2),
    '```',
    '',
    '## Image Prompts',
    '',
  ];

  // Add each image prompt
  data.imagePrompts.forEach((prompt, i) => {
    lines.push(`### Page ${i + 1}`);
    lines.push('```');
    lines.push(prompt);
    lines.push('```');
    lines.push('');
  });

  lines.push('## Thumbnail');
  lines.push('```');
  lines.push(data.thumbnailPrompt);
  lines.push('```');

  fs.writeFileSync(promptsPath, lines.join('\n'));
  console.log(`Prompts written to: ${promptsPath}`);
}

/**
 * Read prompts.md and parse replay data
 */
export function readPromptsMd(
  templateName: string,
  storyId: string
): ReplayData | null {
  const bundleDir = getBundleDir(templateName, storyId);

  // Try new format first, fall back to old debug.md for backwards compatibility
  let promptsPath = path.join(bundleDir, 'prompts.md');
  let isNewFormat = true;

  if (!fs.existsSync(promptsPath)) {
    promptsPath = path.join(bundleDir, 'debug.md');
    isNewFormat = false;
    if (!fs.existsSync(promptsPath)) {
      return null;
    }
  }

  const content = fs.readFileSync(promptsPath, 'utf-8');

  // Parse Pages (JSON) - handle both old and new format
  const pagesRegex = isNewFormat
    ? /## Pages\s*```json\s*([\s\S]*?)\s*```/
    : /## Step 2: Pages\s*```json\s*([\s\S]*?)\s*```/;
  const pagesMatch = content.match(pagesRegex);
  if (!pagesMatch) {
    throw new Error('Could not parse pages from prompts file');
  }
  const pages: Page[] = JSON.parse(pagesMatch[1]);

  // Parse Image Prompts
  const imagePrompts: string[] = [];
  const promptRegex = /### Page \d+\s*```\s*([\s\S]*?)\s*```/g;
  let match;
  while ((match = promptRegex.exec(content)) !== null) {
    imagePrompts.push(match[1].trim());
  }

  // Parse Thumbnail - handle both old and new format
  const thumbRegex = isNewFormat
    ? /## Thumbnail\s*```\s*([\s\S]*?)\s*```/
    : /## Step 4: Thumbnail\s*```\s*([\s\S]*?)\s*```/;
  const thumbMatch = content.match(thumbRegex);
  if (!thumbMatch) {
    throw new Error('Could not parse thumbnail from prompts file');
  }
  const thumbnailPrompt = thumbMatch[1].trim();

  return { pages, imagePrompts, thumbnailPrompt };
}

/**
 * Check if prompts.md exists for a story
 */
export function promptsMdExists(templateName: string, storyId: string): boolean {
  const bundleDir = getBundleDir(templateName, storyId);
  const promptsPath = path.join(bundleDir, 'prompts.md');
  const debugPath = path.join(bundleDir, 'debug.md');
  return fs.existsSync(promptsPath) || fs.existsSync(debugPath);
}

/**
 * Create a storage service instance for a specific template
 */
export function createStorageService(templateName: string): StorageService {
  return {
    writeBundle: (storyId: string, data: BundleData) => {
      writeBundle(storyId, templateName, data);
    },
  };
}
