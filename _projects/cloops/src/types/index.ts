// ===================
// Template Types
// ===================

export interface Template {
  name: string;
  config: TemplateConfig;
  workflow: WorkflowFunction;
  prompts: Record<string, string>;
  schemas: Record<string, object>;
}

export type WorkflowFunction = (
  input: StoryInput,
  config: TemplateConfig,
  services: Services,
  context: WorkflowContext
) => Promise<void>;

export interface WorkflowContext {
  prompts: Record<string, string>;
  schemas: Record<string, object>;
  templatePath: string;
  dry: boolean;
  replay: boolean;
  storyId: string;
}

export interface TemplateConfig {
  name: string;
  datasource: 'ds-stories-backlog' | 'ds-csv';
  settings: TemplateSettings;
  style: StyleConfig;
  generation: GenerationConfig;
}

// Note: StepName type removed - steps are defined in workflow.ts, not config

export interface TemplateSettings {
  pageCount: { min: number; max: number };
  panelsPerPage: number;
}

export interface StyleConfig {
  artStyle: string;
  inkStyle: string;
  colorTreatment?: string;
}

export interface GenerationConfig {
  service: 'replicate' | 'comfyui';
  model: string;
  params: Record<string, unknown>;
}

// ===================
// Datasource Types
// ===================

export interface Datasource {
  getNextItem(): Promise<BacklogItem | null>;
  markInProgress(itemId: string): Promise<void>;
  markComplete(itemId: string): Promise<void>;
  markFailed(itemId: string, error: string): Promise<void>;
}

// ===================
// Stories Backlog Types
// ===================

/** Story in the universal pool (extracted from Bible) */
export interface Story {
  id: string;                    // e.g., "GEN.1.1-creation"
  title: string;                 // e.g., "The Creation"
  summary: string;
  keyMoments: string[];
  source: {
    book: string;
    chapter: number;
    section?: string;            // Section ID from api.bible
  };
}

/** Item in a template's backlog (references a Story) */
export interface TemplateBacklogItem {
  storyId: string;               // References Story.id in universal pool
  title: string;                 // Story title (for folder naming)
  error?: string;                // Last error (for debugging failed runs)
}

/** Tracks extraction position in Bible */
export interface ExtractionState {
  bibleId: string;               // Bible version being used
  currentBook: string;           // Current book being processed
  currentChapter: number;        // Current chapter in that book
  completedBooks: string[];      // Books fully processed
  totalExtracted: number;        // Total stories extracted
}

export interface Backlog {
  templateId: string;
  items: BacklogItem[];
}

export interface BacklogItem {
  id: string;
  status: ItemStatus;
  input: StoryInput;
  completedAt: string | null;
  error?: string;
}

export type ItemStatus = 'pending' | 'in_progress' | 'completed' | 'failed';

// ===================
// Story/Content Types
// ===================

export interface StoryInput {
  title: string;
  summary: string;
  keyMoments: string[];
}

export interface Page {
  pageNumber: number;
  title: string;
  narration: string;
  panels: Panel[];
}

export interface Panel {
  panel: number;
  moment: string;
  visualAnchor: string;
}

export interface PagePrompt {
  pageNumber: number;
  prompt: string;
}

// ===================
// Execution Types
// ===================

export interface RunOptions {
  dry: boolean;
  item?: string; // Specific item ID to run
  replay?: boolean; // Replay from prompts.md (skip LLM calls)
}

export interface State {
  input: StoryInput;
  narrative?: string;
  pages?: Page[];
  prompts?: PagePrompt[];
  thumbnailPrompt?: string;
  images?: string[];
  thumbnailImage?: string;
}

// ===================
// Service Types
// ===================

export interface Services {
  llm: LLMService;
  replicate: ReplicateService;
  comfyui?: ComfyUIService; // Optional, future
  storage: StorageService;
}

export interface LLMService {
  call<T = string>(params: LLMCallParams): Promise<T>;
}

export interface ReplicateService {
  generateImage(prompt: string, config: GenerationConfig, outputPath: string): Promise<string>;
  generateImages(prompts: string[], config: GenerationConfig, outputDir: string): Promise<string[]>;
}

export interface ComfyUIService {
  // Future implementation
  generateImage(prompt: string, params: Record<string, unknown>): Promise<string>;
}

export interface StorageService {
  writeBundle(storyId: string, data: BundleData): void;
}

// GPT-5 specific types
export type ReasoningEffort = 'none' | 'low' | 'medium' | 'high';
export type Verbosity = 'low' | 'medium' | 'high';

export interface LLMCallParams {
  systemPrompt: string;
  userMessage: string;
  schema?: object;
  variables?: Record<string, unknown>;
  reasoning?: ReasoningEffort;  // GPT-5.1 param
  verbosity?: Verbosity;        // GPT-5.1 param
}

export interface GenerateImageParams {
  model: string;
  prompt: string;
  params: Record<string, unknown>;
}

// ===================
// Output Types
// ===================

export interface BundleData {
  title: string;
  images: string[];
  pages: Page[];
  thumbnailImage?: string;
}

export interface StoryDataJson {
  storyId: string;
  title: string;
  thumbnailFile?: string;
  totalPages: number;
  pages: {
    pageNumber: number;
    imageFile: string;
    narration: string;
  }[];
}

// ===================
// Prompts Types
// ===================

/** Data written to prompts.md (all LLM responses) */
export interface PromptsMdData {
  storyId: string;
  title: string;
  narrative: string;
  pages: Page[];
  imagePrompts: string[];
  thumbnailPrompt: string;
}

/** Data needed for --replay (subset of prompts) */
export interface ReplayData {
  pages: Page[];
  imagePrompts: string[];
  thumbnailPrompt: string;
}
