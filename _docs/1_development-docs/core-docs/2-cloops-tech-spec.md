# CLoops Technical Specification

---

## Tech Stack

- **Language:** TypeScript
- **Runtime:** Node.js

---

## External Dependencies

Use MCP server `context7` to fetch latest docs for these services.

### LLM Service
- **API:** OpenAI Responses API (not Chat Completions)
- **Model:** GPT 5.1
- **Docs:** `context7` → `openai responses api`

### Image Generation (Replicate)
- **Models:**
  - Seedream 4: `bytedance/seedream-4`
  - Nano-banana-pro: `google/nano-banana-pro` (TODO: add schema)
- **Docs:** `context7` → `replicate javascript api`

**Seedream 4 Input Schema:**
```typescript
interface Seedream4Input {
  prompt: string;                    // Required - text prompt
  size?: "1K" | "2K" | "4K" | "custom";  // Default: "2K"
  aspect_ratio?: "match_input_image" | "1:1" | "4:3" | "3:4" | "16:9" | "9:16" | "3:2" | "2:3" | "21:9";
  width?: number;                    // 1024-4096, only when size="custom"
  height?: number;                   // 1024-4096, only when size="custom"
  enhance_prompt?: boolean;          // Default: true
  image_input?: string[];            // URLs for img2img
  sequential_image_generation?: "disabled" | "auto";  // Default: "disabled"
  max_images?: number;               // 1-15, used with sequential_image_generation="auto"
}
```

### CLI
- **Library:** Commander.js

---

## Decisions

1. **Execution runtime** - Custom scripts. No SDK for MVP.
2. **Backlog format** - JSON file.
3. **Config injection** - Simple string replace with `{variable}` syntax.
4. **Image gen parallelization** - Sequential for MVP. Parallel is a later optimization.
5. **Error handling** - Log error and fail. No automatic retries for MVP.

## Future Considerations

### Cloud Deployment
MVP writes bundles to local disk. For cloud deployment (e.g., Firebase Functions):
- No persistent local filesystem in serverless
- Bundle output goes directly to cloud storage
- Consider function timeout limits (9-60 min depending on generation)
- Parallel generation could leverage multiple function instances

---

## 1. System Architecture

### 1.1 Core Principle: Hybrid Template System

Templates are self-contained units with their own workflow logic. The system provides shared services as building blocks.

**Three layers:**
1. **Services (shared)** - LLM, Replicate, ComfyUI, Storage - reusable building blocks
2. **Workflow (per-template)** - `workflow.ts` defines the logic, uses services
3. **Config (per-template)** - `config.json` defines settings, parameters, variations

**Why this architecture:**
- Templates can have variable LLM calls (1, 2, 5, or more)
- Templates can have complex generation chains (text→image→video)
- Templates can use different backends (Replicate, ComfyUI)
- New templates don't require engine changes
- Settings are easy to tweak (config), logic is flexible (code)

### 1.2 System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                          CLI                                │
│                    cloops run <template>                    │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                   Execution Engine                          │
│  - Loads template (config + workflow)                       │
│  - Fetches input from datasource                            │
│  - Runs template workflow                                   │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                  Template Workflow                          │
│            (workflow.ts - per template)                     │
│  - Defines steps and order                                  │
│  - Uses services as building blocks                         │
│  - Reads config for settings                                │
└──────┬──────────────┬──────────────┬───────────────────────┘
       │              │              │
       ▼              ▼              ▼
┌────────────┐ ┌────────────┐ ┌────────────┐
│ LLM Service│ │ Gen Service│ │Storage Svc │
│  (OpenAI)  │ │(Replicate) │ │  (Files)   │
│            │ │ (ComfyUI)  │ │            │
└────────────┘ └────────────┘ └────────────┘
```

**Data flow:** CLI → Load template → Fetch input → Execute workflow.ts → (workflow uses services) → Output bundle

---

## 2. Project Structure

```
cloops/
├── src/
│   ├── cli.ts                # Entry point
│   ├── engine/
│   │   └── runner.ts         # Loads template, executes workflow
│   ├── services/             # SHARED building blocks
│   │   ├── llm.ts            # OpenAI API calls
│   │   ├── replicate.ts      # Replicate API calls
│   │   ├── comfyui.ts        # ComfyUI API calls (future)
│   │   └── storage.ts        # File operations
│   ├── datasource/
│   │   ├── backlog.ts        # JSON backlog
│   │   └── csv.ts            # CSV datasource (future)
│   ├── utils/
│   │   └── config.ts         # Config loading, variable injection
│   └── types/
│       └── index.ts          # Shared type definitions
├── templates/
│   └── comic-books-standard/
│       ├── config.json       # Settings, parameters, variations
│       ├── workflow.ts       # Workflow logic (uses services)
│       ├── system-prompts/   # LLM system prompts (.md files)
│       │   ├── step1-narrative.md
│       │   ├── step2-planning.md
│       │   ├── step3-prompts.md
│       │   └── step4-thumbnail.md
│       └── schemas/          # JSON schemas for structured LLM responses
│           ├── narrative.json
│           ├── planning.json
│           ├── prompts.json
│           └── thumbnail.json
├── data/
│   └── backlogs/
│       └── comic-books-standard.json
├── output/
│   └── comic-books/
│       └── {story-id}/
│           ├── 1.jpg
│           ├── story-data.json
│           └── ...
├── package.json
└── tsconfig.json
```

---

## 3. CLI Implementation

**Commands:**
```bash
cloops run <template>              # Full run (default)
cloops run <template> --dry        # Dry run (LLM only, skip image generation)
cloops run <template> --debug      # Save debug.md with all LLM responses
cloops run <template> --replay     # Load from debug.md, skip LLM, regenerate images
cloops run <template> -i <id>      # Run specific item by ID
cloops templates                   # List available templates
cloops status <template>           # Show backlog status
cloops cleanup                     # Clean up temporary files
```

**Flags can be combined:**
```bash
cloops run comic-books-standard --dry --debug   # Dry run + save debug.md
cloops run comic-books-standard --replay -i noah-s-ark  # Replay specific item
```

**Implementation:**
- Use `commander` for arg parsing
- Output: console logs for progress, errors to stderr

---

## 4. Template System

**Template discovery:**
- Scan `templates/` folder
- Each subfolder with `config.json` AND `workflow.ts` is a valid template

**Template structure:**
```
templates/my-template/
├── config.json       # Settings, parameters (no step definitions)
├── workflow.ts       # Workflow logic (the "brain" of the template)
├── system-prompts/   # LLM system prompts (loaded by workflow)
│   └── *.md
└── schemas/          # JSON schemas for structured outputs
    └── *.json
```

**Template loading:**
```typescript
interface Template {
  name: string;
  config: TemplateConfig;
  workflow: WorkflowFunction;
  prompts: Record<string, string>;
  schemas: Record<string, object>;
}

async function loadTemplate(name: string): Promise<Template> {
  const basePath = `templates/${name}`;

  // Import workflow function
  const workflowModule = await import(`${basePath}/workflow.ts`);

  return {
    name,
    config: JSON.parse(readFileSync(`${basePath}/config.json`, 'utf-8')),
    workflow: workflowModule.run,
    prompts: loadAllPrompts(`${basePath}/prompts`),
    schemas: loadAllSchemas(`${basePath}/schemas`),
  };
}
```

**Workflow function interface:**
```typescript
type WorkflowFunction = (
  input: StoryInput,
  config: TemplateConfig,
  services: Services,
  context: WorkflowContext
) => Promise<void>;

interface WorkflowContext {
  prompts: Record<string, string>;
  schemas: Record<string, object>;
  templatePath: string;
  dry: boolean;
}
```

**Example workflow.ts:**
```typescript
import type { WorkflowFunction } from 'cloops/types';

export const run: WorkflowFunction = async (input, config, services, ctx) => {
  // Step 1: Generate narrative
  const narrative = await services.llm.call({
    prompt: ctx.prompts['narrative'],
    schema: ctx.schemas['narrative'],
    variables: { ...input, wordCount: config.settings.wordCount }
  });

  // Step 2: Plan pages
  const pages = await services.llm.call({
    prompt: ctx.prompts['planning'],
    schema: ctx.schemas['planning'],
    variables: { narrative, ...config.settings }
  });

  // Step 3: Generate images (skip in dry run)
  if (!ctx.dry) {
    const images = await services.replicate.generateImages(
      pages.prompts,
      config.generation
    );

    // Step 4: Write bundle
    await services.storage.writeBundle(input.title, images, pages);
  }
};
```

---

## 5. Config System

Config defines **settings and parameters** only. Workflow logic is in `workflow.ts`.

**Config structure (config.json):**
```json
{
  "name": "comic-books-standard",
  "datasource": "backlog",
  "settings": {
    "wordCount": 150,
    "pageCount": { "min": 3, "max": 5 },
    "panelsPerPage": 3
  },
  "style": {
    "artStyle": "children's book illustration",
    "inkStyle": "bold ink lines",
    "colorTreatment": "flat colors"
  },
  "generation": {
    "service": "replicate",
    "model": "bytedance/seedream-4",
    "params": {
      "size": "2K",
      "aspect_ratio": "9:16"
    }
  }
}
```

**Note:** No `steps` array. The workflow.ts determines what steps run and in what order.

**Variable injection:**
```typescript
function injectVariables(template: string, variables: Record<string, unknown>): string {
  return template.replace(/\{(\w+(?:\.\w+)*)\}/g, (match, path) => {
    return getNestedValue(variables, path) ?? match;
  });
}

// Usage:
// "Style: {style.artStyle}" → "Style: children's book illustration"
```

**Runtime overrides:** CLI flags merge into config before execution.

---

## 6. Execution Engine

The engine is thin. It loads the template and executes its workflow.

**Runner:**
```typescript
interface RunOptions {
  dry: boolean;
  item?: string;
}

async function runTemplate(
  template: Template,
  input: StoryInput,
  options: RunOptions
): Promise<void> {
  // Build services object
  const services: Services = {
    llm: createLLMService(),
    replicate: createReplicateService(),
    storage: createStorageService(template.name),
  };

  // Build context
  const context: WorkflowContext = {
    prompts: template.prompts,
    schemas: template.schemas,
    templatePath: `templates/${template.name}`,
    dry: options.dry,
  };

  // Execute the template's workflow
  await template.workflow(input, template.config, services, context);
}
```

**Key points:**
- Engine doesn't know what steps exist
- Engine doesn't define step logic
- Template workflow has full control
- Services are injected, not imported directly (easier testing)

**Error handling:** Workflow can handle errors however it wants. Engine catches unhandled errors and marks item as failed.

---

## 7. Datasource Manager

**Backlog schema (JSON file):**
```json
{
  "templateId": "comic-books-standard",
  "items": [
    {
      "id": "david-and-goliath",
      "status": "pending",
      "input": {
        "title": "David and Goliath",
        "summary": "Boy defeats giant warrior with sling",
        "keyMoments": ["battle", "stone throw", "giant falling"]
      },
      "completedAt": null
    }
  ]
}
```

**Status values:** `pending`, `in_progress`, `completed`, `failed`

**Operations:**
```typescript
// Fetch next pending item
function getNextItem(backlog: Backlog): BacklogItem | undefined {
  return backlog.items.find(i => i.status === 'pending');
}

// Mark complete
function markComplete(backlog: Backlog, itemId: string): void {
  const item = backlog.items.find(i => i.id === itemId);
  if (item) {
    item.status = 'completed';
    item.completedAt = new Date().toISOString();
    saveBacklog(backlog);
  }
}
```

**Modular architecture:** Datasource interface:
```typescript
interface Datasource {
  getNextItem(): BacklogItem | null;
  markComplete(itemId: string): void;
  markFailed(itemId: string, error: string): void;
}
```
Backlog and CSV implement this interface. New datasources can be added.

---

## 8. Services (Shared Building Blocks)

Services are **shared** across all templates. They handle API calls and common operations.
Templates use services via the `services` object passed to their workflow.

```typescript
interface Services {
  llm: LLMService;
  replicate: ReplicateService;
  comfyui?: ComfyUIService;  // Optional, future
  storage: StorageService;
}
```

### 8.1 LLM Service

**OpenAI Responses API with GPT-5.1:**
```typescript
// GPT-5 specific types
type ReasoningEffort = 'none' | 'low' | 'medium' | 'high';
type Verbosity = 'low' | 'medium' | 'high';

interface LLMCallParams {
  systemPrompt: string;
  userMessage: string;
  schema?: object;
  reasoning?: ReasoningEffort;  // GPT-5.1 param
  verbosity?: Verbosity;        // GPT-5.1 param
}

async function llmCall<T = string>(params: LLMCallParams): Promise<T> {
  const { systemPrompt, userMessage, schema, reasoning, verbosity } = params;

  const input = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userMessage }
  ];

  // With schema: use responses.parse() or responses.create() with json_schema
  if (schema) {
    const response = await openai.responses.create({
      model: 'gpt-5.1',
      input,
      ...(reasoning && { reasoning: { effort: reasoning } }),
      text: {
        format: { type: 'json_schema', name: 'response', schema, strict: true },
        ...(verbosity && { verbosity }),
      },
    });
    // Extract and parse JSON from response
    return JSON.parse(response.output[0].content[0].text) as T;
  }

  // Plain text response
  const response = await openai.responses.create({
    model: 'gpt-5.1',
    input,
    ...(reasoning && { reasoning: { effort: reasoning } }),
    ...(verbosity && { text: { verbosity } }),
  });
  return response.output_text as T;
}
```

**GPT-5.1 Parameters:**
- `reasoning.effort`: Controls reasoning depth (`none`, `low`, `medium`, `high`)
- `text.verbosity`: Controls output detail (`low`, `medium`, `high`)
- NOT supported: `temperature`, `top_p`, `logprobs`

### 8.2 Generation Service

**Replicate integration:**
```typescript
interface GenerateImageParams {
  model: string;
  prompt: string;
  params: Record<string, unknown>;
}

async function generateImage({ model, prompt, params }: GenerateImageParams): Promise<string> {
  const prediction = await replicate.run(model, {
    input: { prompt, ...params }
  });

  // prediction is URL or array of URLs
  const imageUrl = Array.isArray(prediction) ? prediction[0] : prediction;

  // Download and return local path
  return downloadFile(imageUrl as string);
}
```

**Sequential generation:**
```typescript
async function generatePages(prompts: string[], config: TemplateConfig): Promise<string[]> {
  const results: string[] = [];
  for (let i = 0; i < prompts.length; i++) {
    console.log(`Generating page ${i + 1}/${prompts.length}...`);
    const path = await generateImage({
      model: config.generation.model,
      prompt: prompts[i],
      params: config.generation.params
    });
    results.push(path);
  }
  return results;
}
```

### 8.3 Storage Service

**Bundle output:**
```typescript
interface BundleData {
  title: string;
  images: string[];
  pages: Page[];
}

function writeBundle(storyId: string, templateName: string, data: BundleData): void {
  const outputDir = `output/${templateName}/${storyId}`;
  mkdirSync(outputDir, { recursive: true });

  // Copy images
  data.images.forEach((img, i) => {
    copyFileSync(img, `${outputDir}/${i + 1}.jpg`);
  });

  // Write metadata
  writeFileSync(`${outputDir}/story-data.json`, JSON.stringify({
    storyId,
    title: data.title,
    totalPages: data.pages.length,
    pages: data.pages.map((p, i) => ({
      pageNumber: i + 1,
      imageFile: `${i + 1}.jpg`,
      narration: p.narration
    }))
  }, null, 2));
}
```

---

## 9. Knowledge Layer

**Location:** `src/knowledge/` or inline in template prompts.

**Contents:**
- Block system definitions
- Assembly rules
- Visual-only principle

**Injection:** Appended to Step 3 system prompt:
```typescript
function buildStep3Prompt(template: Template): string {
  const basePrompt = template.prompts.step3;
  const knowledge = readFileSync('src/knowledge/prompting.md', 'utf-8');
  return `${basePrompt}\n\n<knowledge>\n${knowledge}\n</knowledge>`;
}
```

**For MVP:** Keep knowledge inline in step3 prompt file. Extract to shared file later if multiple templates need it.

---

## 10. Post-Processing

**MVP:** Not implemented. Bundles written to local disk.

**Future:**
```typescript
async function postProcess(bundlePath: string, config: TemplateConfig): Promise<void> {
  // 1. Upload to cloud storage
  const urls = await uploadToStorage(bundlePath);

  // 2. Transform to AdLoops format
  const manifest = transformToAdLoops(bundlePath, urls);

  // 3. Write to Firestore
  await firestore.collection('bodies').add(manifest);
}
```

---

## 11. Testing Strategy

**Dry run as primary validation:**
- Run `cloops run comic-books-standard --dry`
- Validates: config loading, datasource, LLM calls, prompt assembly
- Outputs generated prompts for review

**Manual end-to-end:**
- Run full pipeline on one story
- Verify output bundle structure
- Check image quality

**Unit tests (later):**
- Config loading
- Variable injection
- Datasource operations

---

## 12. Debug & Replay System

Debug and replay features enable prompt iteration without re-running expensive LLM calls.

### 12.1 Debug Mode (`--debug`)

Saves all LLM responses to a human-readable `debug.md` file in the output folder.

**Usage:**
```bash
cloops run comic-books-standard --debug
```

**Output location:** `output/{template}/{story-id}/debug.md`

**debug.md format:**
```markdown
# Debug: Story Title

## Step 1: Narrative
```
The narrative response text...
```

## Step 2: Pages
```json
[{ "pageNumber": 1, "title": "...", ... }]
```

## Step 3: Image Prompts

### Page 1
```
Full image prompt for page 1...
```

### Page 2
```
Full image prompt for page 2...
```

## Step 4: Thumbnail
```
Full thumbnail prompt...
```
```

### 12.2 Replay Mode (`--replay`)

Loads from existing `debug.md`, skips all LLM calls, and regenerates images.

**Usage:**
```bash
cloops run comic-books-standard --replay -i story-id
```

**Use case:** Edit image prompts in `debug.md`, then replay to test changes without re-running LLM steps.

**Workflow for prompt iteration:**
1. Run with `--debug` to generate debug.md
2. Review images - if bad, edit prompts in debug.md
3. Run with `--replay` to regenerate images
4. Repeat 2-3 until satisfied
5. Update system prompts with learnings

---

## 13. Type Definitions

All shared types in `src/types/index.ts`:

```typescript
// ===================
// Template Types
// ===================

interface Template {
  name: string;
  config: TemplateConfig;
  workflow: WorkflowFunction;
  prompts: Record<string, string>;
  schemas: Record<string, object>;
}

type WorkflowFunction = (
  input: StoryInput,
  config: TemplateConfig,
  services: Services,
  context: WorkflowContext
) => Promise<void>;

interface WorkflowContext {
  prompts: Record<string, string>;
  schemas: Record<string, object>;
  templatePath: string;
  dry: boolean;
}

interface TemplateConfig {
  name: string;
  datasource: 'backlog' | 'csv';
  settings: TemplateSettings;
  style: StyleConfig;
  generation: GenerationConfig;
}

// Note: No StepName type - steps are defined in workflow.ts, not config

interface TemplateSettings {
  pageCount: { min: number; max: number };
  panelsPerPage: number;
}

interface StyleConfig {
  artStyle: string;
  inkStyle: string;
  colorTreatment?: string;
}

interface GenerationConfig {
  service: 'replicate' | 'comfyui';
  model: string;
  params: Record<string, unknown>;
}

// ===================
// Datasource Types
// ===================

interface Datasource {
  getNextItem(): BacklogItem | null;
  markComplete(itemId: string): void;
  markFailed(itemId: string, error: string): void;
}

interface Backlog {
  templateId: string;
  items: BacklogItem[];
}

interface BacklogItem {
  id: string;
  status: ItemStatus;
  input: StoryInput;
  completedAt: string | null;
  error?: string;
}

type ItemStatus = 'pending' | 'in_progress' | 'completed' | 'failed';

// ===================
// Story/Content Types
// ===================

interface StoryInput {
  title: string;
  summary: string;
  keyMoments: string[];
}

interface Page {
  pageNumber: number;
  title: string;
  narration: string;
  panels: Panel[];
}

interface Panel {
  panel: number;
  moment: string;
  visualAnchor: string;
}

interface PagePrompt {
  pageNumber: number;
  prompt: string;
}

// ===================
// Execution Types
// ===================

interface RunOptions {
  dry: boolean;
  item?: string;  // Specific item ID to run
}

interface State {
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

interface Services {
  llm: LLMService;
  replicate: ReplicateService;
  comfyui?: ComfyUIService;
  storage: StorageService;
}

interface LLMService {
  call<T>(params: LLMCallParams): Promise<T>;
}

interface ReplicateService {
  generateImage(prompt: string, params: GenerationConfig): Promise<string>;
  generateImages(prompts: string[], params: GenerationConfig): Promise<string[]>;
}

interface StorageService {
  writeBundle(storyId: string, data: BundleData): void;
}

// GPT-5 specific types
type ReasoningEffort = 'none' | 'low' | 'medium' | 'high';
type Verbosity = 'low' | 'medium' | 'high';

interface LLMCallParams {
  systemPrompt: string;
  userMessage: string;
  schema?: object;
  variables?: Record<string, unknown>;
  reasoning?: ReasoningEffort;  // GPT-5.1 param
  verbosity?: Verbosity;        // GPT-5.1 param
}

interface GenerateImageParams {
  model: string;
  prompt: string;
  params: Record<string, unknown>;
}

// ===================
// Output Types
// ===================

interface BundleData {
  title: string;
  images: string[];
  pages: Page[];
  thumbnailImage?: string;
}

interface StoryDataJson {
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
```

---

## Changelog

- **v4 (2025-12-02):** Upgraded to GPT-5.1 with Responses API. Added reasoning/verbosity params to LLMCallParams. Per-step configuration in workflow.ts.
- **v3 (2025-12-01):** Added debug/replay system, renamed prompts/ to system-prompts/ with .md extension, added CLI flags (--debug, --replay, cleanup command).
- **v2 (2025-12-01):** Hybrid architecture - templates have workflow.ts for logic, config.json for settings. Services are shared building blocks. No hardcoded steps in engine.
- **v1 (2025-11-28):** Initial spec with hardcoded step registry (superseded).

---

*v4 - 2025-12-02*
