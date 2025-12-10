# Bible Content Video Generation - Technical Specification

## 1. System Overview

### Core Purpose
Automated CLI tool that processes CSV data of user problems and generates AI-powered video content using OpenAI (script generation) and Replicate Veo 3 (video generation).

### Key Workflows

#### POC Workflow
```
1. Read CSV → Extract 2 problem categories
2. For each category × template (2 × 2 = 4 combinations):
   a. Generate script with LLM (OpenAI)
   b. For each scene (3 per video):
      - Generate video clip (Veo 3)
      - Save to disk
      - Track progress
3. Assemble final JSON output
4. Exit with success/failure status
```

#### System Architecture
```
┌─────────────┐
│   CLI Tool  │
└──────┬──────┘
       │
       ├─> Data Processor ──> CSV Parser
       │
       ├─> Script Generator ──> OpenAI API
       │
       ├─> Video Generator ──> Replicate API (Veo 3)
       │
       ├─> State Manager ──> JSON file
       │
       └─> Output Assembler ──> JSON + video files
```

## 2. Project Structure

```
project-root/
├── src/
│   ├── index.ts                    # CLI entry point
│   ├── config/
│   │   ├── config.ts               # Configuration schema & loader
│   │   └── templates.ts            # Template definitions
│   ├── lib/
│   │   ├── data-processor.ts       # CSV parsing & category extraction
│   │   ├── script-generator.ts     # OpenAI integration
│   │   ├── video-generator.ts      # Replicate integration
│   │   ├── state-manager.ts        # Progress tracking
│   │   └── output-assembler.ts     # Final JSON creation
│   ├── types/
│   │   ├── config.types.ts         # Configuration types
│   │   ├── script.types.ts         # Script data models
│   │   ├── prediction.types.ts     # Replicate prediction types
│   │   └── output.types.ts         # Output JSON types
│   └── utils/
│       ├── logger.ts               # Simple logging utility
│       └── errors.ts               # Error classes
├── data/
│   └── input.csv                   # Input CSV file
├── output/
│   ├── videos/                     # Generated video clips
│   ├── scripts/                    # Generated scripts (JSON)
│   ├── state.json                  # Progress state
│   └── final-output.json           # Final output scaffold
├── config.json                     # User configuration
├── package.json
├── tsconfig.json
└── README.md
```

## 3. Configuration

### Configuration Schema

**File: `config.json`**
```typescript
interface Config {
  // Input/Output paths
  paths: {
    csvInput: string;           // Path to CSV file
    outputDir: string;          // Base output directory
    videosDir: string;          // Video clips directory
    scriptsDir: string;         // Generated scripts directory
    stateFile: string;          // State JSON file
    finalOutput: string;        // Final output JSON
  };

  // Pipeline parameters
  pipeline: {
    categories: string[] | "all";   // Specific categories or "all"
    templates: string[];            // Template IDs to use
    scenesPerVideo: number;         // Number of scenes per video
    variationsPerCombo: number;     // Variations per category+template
    execution: "sequential" | "parallel";
  };

  // API configuration
  apis: {
    openai: {
      apiKey: string;               // From env: OPENAI_API_KEY
      model: string;                // "gpt-4o-mini"
      temperature: number;          // 0.7
      maxTokens: number;            // 2000
    };
    replicate: {
      apiKey: string;               // From env: REPLICATE_API_TOKEN
      model: string;                // "google/veo-3"
      pollingInterval: number;      // 5000 (ms)
      maxRetries: number;           // 3
    };
  };

  // Veo 3 specific parameters
  videoGeneration: {
    aspectRatio: "9:16";            // Vertical video
    duration: number;               // ~10 seconds
  };
}
```

**Default Configuration:**
```json
{
  "paths": {
    "csvInput": "./data/input.csv",
    "outputDir": "./output",
    "videosDir": "./output/videos",
    "scriptsDir": "./output/scripts",
    "stateFile": "./output/state.json",
    "finalOutput": "./output/final-output.json"
  },
  "pipeline": {
    "categories": ["Anxiety or fear", "Finances or provision"],
    "templates": ["direct-to-camera", "text-visuals"],
    "scenesPerVideo": 3,
    "variationsPerCombo": 1,
    "execution": "sequential"
  },
  "apis": {
    "openai": {
      "apiKey": "${OPENAI_API_KEY}",
      "model": "gpt-4o-mini",
      "temperature": 0.7,
      "maxTokens": 2000
    },
    "replicate": {
      "apiKey": "${REPLICATE_API_TOKEN}",
      "model": "google/veo-3",
      "pollingInterval": 5000,
      "maxRetries": 3
    }
  },
  "videoGeneration": {
    "aspectRatio": "9:16",
    "duration": 10
  }
}
```

## 4. Data Models

### CSV Input Schema
```typescript
interface CSVRow {
  denomination: string;
  onboardingV7_lifeChallenge: string;
  age: string;
  gender: string;
  lifeChallengeOption: string;  // The category we extract
}

type ProblemCategory =
  | "Anxiety or fear"
  | "Stress or burnout"
  | "Finances or provision"
  | "Purpose or direction"
  | "Loneliness or heartbreak"
  | "Family or relationships"
  | "Addiction or temptation"
  | "Health or healing"
  | "Grief or loss";
```

### Script Data Model
```typescript
interface VideoScript {
  id: string;                     // Unique ID for this script
  category: ProblemCategory;
  template: TemplateType;
  timestamp: string;              // ISO 8601
  overallScript: string;          // Full narrative
  scenes: Scene[];
}

interface Scene {
  sceneNumber: number;            // 1, 2, or 3
  content: string;                // Scene-specific narrative/text
  prompt: string;                 // Cinematography prompt for Veo 3
  videoClipPath?: string;         // Filled after generation
  predictionId?: string;          // Replicate prediction ID
  status: "pending" | "generating" | "completed" | "failed";
  error?: string;
}

type TemplateType = "direct-to-camera" | "text-visuals";
```

### Template Definition Schema
```typescript
interface Template {
  id: TemplateType;
  name: string;
  description: string;
  systemPrompt: string;           // LLM system prompt for script gen
  sceneStructure: SceneDefinition[];
}

interface SceneDefinition {
  sceneNumber: number;
  purpose: string;                // e.g., "Acknowledge struggle"
  guidanceForLLM: string;         // How to generate this scene
}
```

**Template Definitions:**

```typescript
// direct-to-camera template
{
  id: "direct-to-camera",
  name: "Direct-to-Camera",
  description: "Person speaking directly to viewer with empathetic progression",
  systemPrompt: `You are creating a comforting video script for someone struggling with {category}.

Format: Direct-to-camera speaking style
Tone: Empathetic, conversational, warm
Structure: 3 scenes showing emotional progression

For each scene, provide:
1. Spoken dialogue (conversational, natural)
2. A detailed cinematography prompt for generating the video

Guidelines:
- Use second person ("you") to speak directly to viewer
- Keep dialogue natural and authentic
- Each scene should be ~10 seconds of spoken content
- Cinematography prompts should describe: subject, expression, lighting, framing, mood`,

  sceneStructure: [
    {
      sceneNumber: 1,
      purpose: "Acknowledge the struggle",
      guidanceForLLM: "Show empathy, validate their feelings, use concerned/warm expression"
    },
    {
      sceneNumber: 2,
      purpose: "Offer comfort and hope",
      guidanceForLLM: "Transition to reassurance, gentle smile, warm and encouraging"
    },
    {
      sceneNumber: 3,
      purpose: "Share scripture and closing",
      guidanceForLLM: "Peaceful, uplifting, confident expression with hope"
    }
  ]
}

// text-visuals template
{
  id: "text-visuals",
  name: "Text + Visuals",
  description: "Text overlays on calming background footage",
  systemPrompt: `You are creating a reflective video with text overlays for someone struggling with {category}.

Format: Short text snippets displayed over calming visuals
Tone: Peaceful, inspirational, contemplative
Structure: 3 scenes with text progression

For each scene, provide:
1. Text content (short, punchy, impactful - max 2 sentences)
2. A detailed visual prompt for the background footage

Guidelines:
- Text should be brief and powerful
- No dialogue, pure visual + text experience
- Each visual should be ~10 seconds
- Visual prompts should describe: setting, mood, lighting, movement, atmosphere`,

  sceneStructure: [
    {
      sceneNumber: 1,
      purpose: "Opening acknowledgment",
      guidanceForLLM: "Acknowledge struggle with short, empathetic text. Calming natural visual."
    },
    {
      sceneNumber: 2,
      purpose: "Scripture/comfort text",
      guidanceForLLM: "Biblical verse or comfort message. Serene, peaceful visual."
    },
    {
      sceneNumber: 3,
      purpose: "Closing message",
      guidanceForLLM: "Hopeful, uplifting closing text. Inspiring, bright visual."
    }
  ]
}
```

### OpenAI Response Schema (Zod)

```typescript
import { z } from 'zod';

const SceneSchema = z.object({
  sceneNumber: z.number().int().min(1).max(3),
  content: z.string().min(10),
  prompt: z.string().min(20),
});

const VideoScriptSchema = z.object({
  category: z.string(),
  template: z.enum(["direct-to-camera", "text-visuals"]),
  overallScript: z.string().min(50),
  scenes: z.array(SceneSchema).length(3),
});

type VideoScriptResponse = z.infer<typeof VideoScriptSchema>;
```

### Replicate Prediction Schema

```typescript
// From replicate-javascript SDK
interface Prediction {
  id: string;
  status: "starting" | "processing" | "succeeded" | "failed" | "canceled";
  model: string;
  version: string;
  input: {
    prompt: string;
    aspect_ratio?: string;
    duration?: number;
  };
  output?: string | string[];      // Video URL(s)
  error?: unknown;
  logs?: string;
  metrics?: {
    predict_time?: number;
  };
  created_at: string;
  started_at?: string;
  completed_at?: string;
  urls: {
    get: string;
    cancel: string;
  };
}
```

### State Management Schema

```typescript
interface PipelineState {
  startedAt: string;
  lastUpdated: string;
  status: "initializing" | "processing" | "completed" | "failed";
  currentStep: string;
  progress: {
    totalVideos: number;
    completedVideos: number;
    totalClips: number;
    completedClips: number;
  };
  videos: VideoState[];
  errors: ErrorLog[];
}

interface VideoState {
  id: string;
  category: ProblemCategory;
  template: TemplateType;
  status: "pending" | "script-generation" | "video-generation" | "completed" | "failed";
  scriptPath?: string;
  scenes: SceneState[];
  error?: string;
}

interface SceneState {
  sceneNumber: number;
  status: "pending" | "queued" | "generating" | "completed" | "failed";
  predictionId?: string;
  videoPath?: string;
  attempts: number;
  error?: string;
}

interface ErrorLog {
  timestamp: string;
  stage: string;
  error: string;
  context: Record<string, unknown>;
}
```

### Final Output Schema

```typescript
interface FinalOutput {
  generatedAt: string;
  summary: {
    totalVideos: number;
    totalClips: number;
    successfulClips: number;
    failedClips: number;
  };
  videos: VideoOutput[];
}

interface VideoOutput {
  id: string;
  category: string;
  template: string;
  scriptPath: string;
  clips: ClipOutput[];
}

interface ClipOutput {
  sceneNumber: number;
  videoPath: string;
  prompt: string;
  duration: number;
  metadata: {
    predictionId: string;
    generatedAt: string;
    predictTime?: number;
  };
}
```

## 5. Module Specifications

### 5.1 Data Processor

**File: `src/lib/data-processor.ts`**

**Responsibilities:**
- Read and parse CSV file
- Extract unique problem categories
- Filter categories based on configuration
- Validate data structure

**Interface:**
```typescript
class DataProcessor {
  constructor(private csvPath: string) {}

  async extractCategories(): Promise<ProblemCategory[]>;
  async validateCSV(): Promise<boolean>;
}
```

**Implementation Details:**
- Use `csv-parse` library for CSV parsing
- Extract unique values from `lifeChallengeOption` column
- Filter to match configured categories
- Handle malformed CSV gracefully

**Error Handling:**
- Throw `CSVReadError` if file doesn't exist
- Throw `CSVParseError` if CSV is malformed
- Log warning if no valid categories found

---

### 5.2 Script Generator

**File: `src/lib/script-generator.ts`**

**Responsibilities:**
- Interface with OpenAI API
- Generate structured scripts using Zod schemas
- Apply template-specific prompts
- Handle API errors and retries

**Interface:**
```typescript
class ScriptGenerator {
  constructor(
    private openaiClient: OpenAI,
    private templates: Map<TemplateType, Template>
  ) {}

  async generateScript(
    category: ProblemCategory,
    template: TemplateType
  ): Promise<VideoScript>;
}
```

**Implementation Details:**

1. **OpenAI Client Setup:**
```typescript
import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: config.apis.openai.apiKey
});
```

2. **Structured Output with Zod:**
```typescript
import { zodResponseFormat } from 'openai/helpers/zod';

const completion = await client.chat.completions.parse({
  model: config.apis.openai.model,
  messages: [
    {
      role: 'system',
      content: templateSystemPrompt.replace('{category}', category)
    },
    {
      role: 'user',
      content: `Generate a 3-scene video script for someone struggling with "${category}".`
    }
  ],
  response_format: zodResponseFormat(VideoScriptSchema, 'video_script'),
  temperature: config.apis.openai.temperature,
  max_tokens: config.apis.openai.maxTokens,
});

const message = completion.choices[0]?.message;
if (message?.parsed) {
  return message.parsed;
}
```

3. **Script Saving:**
- Save generated script to `output/scripts/{videoId}.json`
- Include timestamp and metadata

**Error Handling:**
- Catch `OpenAI.APIError` and retry with exponential backoff
- Handle `LengthFinishReasonError` (increase max_tokens)
- Handle `ContentFilterFinishReasonError` (log and skip)
- Max 3 retry attempts

---

### 5.3 Video Generator

**File: `src/lib/video-generator.ts`**

**Responsibilities:**
- Interface with Replicate API (Veo 3)
- Create predictions for each scene prompt
- Poll for completion
- Download video files
- Handle retries and errors

**Interface:**
```typescript
class VideoGenerator {
  constructor(
    private replicateClient: Replicate,
    private config: Config
  ) {}

  async generateVideoClip(
    scene: Scene,
    outputPath: string
  ): Promise<{ videoPath: string; predictionId: string }>;

  private async pollPrediction(predictionId: string): Promise<Prediction>;
  private async downloadVideo(url: string, path: string): Promise<void>;
}
```

**Implementation Details:**

1. **Replicate Client Setup:**
```typescript
import Replicate from 'replicate';

const replicate = new Replicate({
  auth: config.apis.replicate.apiKey
});
```

2. **Create Prediction:**
```typescript
const prediction = await replicate.predictions.create({
  model: config.apis.replicate.model,
  input: {
    prompt: scene.prompt,
    aspect_ratio: config.videoGeneration.aspectRatio,
    duration: config.videoGeneration.duration,
  }
});
```

3. **Polling for Completion:**
```typescript
const completed = await replicate.wait(prediction, {
  interval: config.apis.replicate.pollingInterval
});

if (completed.status === "succeeded") {
  const videoUrl = completed.output as string;
  await this.downloadVideo(videoUrl, outputPath);
  return { videoPath: outputPath, predictionId: completed.id };
} else if (completed.status === "failed") {
  throw new Error(`Prediction failed: ${completed.error}`);
}
```

4. **Download Video:**
```typescript
private async downloadVideo(url: string, path: string): Promise<void> {
  const response = await fetch(url);
  const buffer = await response.arrayBuffer();
  await fs.writeFile(path, Buffer.from(buffer));
}
```

5. **File Naming Convention:**
```
{videoId}_scene{sceneNumber}_{timestamp}.mp4
```

**Error Handling:**
- Retry failed predictions up to `maxRetries` times
- Handle rate limiting (429 status)
- Handle timeout scenarios
- Save partial progress to state

---

### 5.4 State Manager

**File: `src/lib/state-manager.ts`**

**Responsibilities:**
- Track pipeline progress
- Save/load state from JSON
- Enable resume capability
- Provide progress updates

**Interface:**
```typescript
class StateManager {
  constructor(private statePath: string) {}

  async loadState(): Promise<PipelineState | null>;
  async saveState(state: PipelineState): Promise<void>;
  async updateVideoStatus(videoId: string, status: VideoState): Promise<void>;
  async updateSceneStatus(videoId: string, sceneNumber: number, status: SceneState): Promise<void>;
  async logError(error: ErrorLog): Promise<void>;
}
```

**Implementation Details:**
- Read/write JSON atomically using temp file + rename pattern
- Update `lastUpdated` timestamp on every save
- Debounce saves to avoid excessive I/O (max 1 save per second)

**State Persistence:**
- Save after each major step completion
- Save before and after API calls
- Save on process exit (graceful shutdown)

---

### 5.5 Output Assembler

**File: `src/lib/output-assembler.ts`**

**Responsibilities:**
- Collect all generated assets
- Build final JSON output
- Validate completeness
- Generate summary statistics

**Interface:**
```typescript
class OutputAssembler {
  constructor(
    private config: Config,
    private state: PipelineState
  ) {}

  async assembleFinalOutput(): Promise<FinalOutput>;
  private async validateAssets(): Promise<boolean>;
}
```

**Implementation Details:**
- Iterate through state.videos
- Collect clip paths and metadata
- Verify all files exist
- Generate summary statistics
- Save to `final-output.json`

---

## 6. CLI Interface

### Entry Point

**File: `src/index.ts`**

```typescript
#!/usr/bin/env node
import { Command } from 'commander';

const program = new Command();

program
  .name('bible-video-gen')
  .description('Generate AI video content from problem categories')
  .version('0.1.0');

program
  .command('generate')
  .description('Run the video generation pipeline')
  .option('-c, --config <path>', 'Path to config file', './config.json')
  .option('--resume', 'Resume from last saved state', false)
  .option('--clean', 'Clean output directory before starting', false)
  .action(async (options) => {
    await runPipeline(options);
  });

program.parse();
```

### Pipeline Execution

```typescript
async function runPipeline(options: CLIOptions): Promise<void> {
  const logger = new Logger();

  try {
    // Load configuration
    const config = await loadConfig(options.config);

    // Initialize state
    const stateManager = new StateManager(config.paths.stateFile);
    let state = options.resume ? await stateManager.loadState() : null;

    if (!state) {
      state = initializeState(config);
    }

    // Process data
    logger.info('Processing CSV data...');
    const dataProcessor = new DataProcessor(config.paths.csvInput);
    const categories = await dataProcessor.extractCategories();

    // Generate scripts and videos
    const scriptGenerator = new ScriptGenerator(/*...*/);
    const videoGenerator = new VideoGenerator(/*...*/);

    for (const category of categories) {
      for (const templateId of config.pipeline.templates) {
        const videoId = generateVideoId(category, templateId);

        // Skip if already completed
        if (isVideoCompleted(state, videoId)) continue;

        logger.info(`Processing: ${category} × ${templateId}`);

        // Generate script
        const script = await scriptGenerator.generateScript(category, templateId);
        await stateManager.saveState(state);

        // Generate videos for each scene
        for (const scene of script.scenes) {
          const clipPath = generateClipPath(videoId, scene.sceneNumber);
          const result = await videoGenerator.generateVideoClip(scene, clipPath);

          scene.videoClipPath = result.videoPath;
          scene.predictionId = result.predictionId;
          scene.status = "completed";

          await stateManager.saveState(state);
        }
      }
    }

    // Assemble final output
    logger.info('Assembling final output...');
    const assembler = new OutputAssembler(config, state);
    const finalOutput = await assembler.assembleFinalOutput();

    logger.success(`✓ Pipeline completed! Output: ${config.paths.finalOutput}`);

  } catch (error) {
    logger.error('Pipeline failed:', error);
    process.exit(1);
  }
}
```

## 7. Error Handling Strategy

### Error Classes

```typescript
class PipelineError extends Error {
  constructor(
    message: string,
    public stage: string,
    public context?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'PipelineError';
  }
}

class CSVReadError extends PipelineError {}
class CSVParseError extends PipelineError {}
class ScriptGenerationError extends PipelineError {}
class VideoGenerationError extends PipelineError {}
class StateError extends PipelineError {}
```

### Retry Logic

```typescript
async function withRetry<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries: number;
    backoff: 'exponential' | 'linear';
    baseDelay: number;
  }
): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt <= options.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (attempt < options.maxRetries) {
        const delay = options.backoff === 'exponential'
          ? options.baseDelay * Math.pow(2, attempt)
          : options.baseDelay * (attempt + 1);

        await sleep(delay);
      }
    }
  }

  throw lastError!;
}
```

### Graceful Shutdown

```typescript
process.on('SIGINT', async () => {
  logger.warn('Received SIGINT, saving state...');
  await stateManager.saveState(currentState);
  logger.info('State saved. Exiting.');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.warn('Received SIGTERM, saving state...');
  await stateManager.saveState(currentState);
  logger.info('State saved. Exiting.');
  process.exit(0);
});
```

## 8. Dependencies

### Production Dependencies

```json
{
  "dependencies": {
    "openai": "^4.0.0",
    "replicate": "^1.3.0",
    "zod": "^3.22.0",
    "csv-parse": "^5.5.0",
    "commander": "^11.0.0"
  }
}
```

### Development Dependencies

```json
{
  "devDependencies": {
    "typescript": "^5.0.0",
    "@types/node": "^20.0.0",
    "tsx": "^4.0.0"
  }
}
```

## 9. Environment Variables

```bash
# Required
OPENAI_API_KEY=sk-...
REPLICATE_API_TOKEN=r8_...

# Optional (for debugging)
LOG_LEVEL=info
```

## 10. Testing Strategy

### Manual Testing (POC)
- Validate CSV parsing with sample data
- Test script generation for each template
- Test video generation with single scene
- Test state save/resume functionality
- End-to-end test with 1 category, 1 template

### Edge Cases to Handle
- Empty CSV
- Malformed CSV
- OpenAI API rate limits
- Replicate API failures
- Network interruptions
- Disk space issues
- Invalid predictions

## 11. Future Enhancements (Post-POC)

### Parallel Execution
```typescript
// Generate all scripts in parallel
const scriptPromises = combinations.map(combo =>
  scriptGenerator.generateScript(combo.category, combo.template)
);
const scripts = await Promise.all(scriptPromises);

// Generate videos with concurrency limit
const clipQueue = new PQueue({ concurrency: 3 });
await clipQueue.addAll(
  scenes.map(scene => () => videoGenerator.generateVideoClip(scene, path))
);
```

### Webhooks Instead of Polling
```typescript
const prediction = await replicate.predictions.create({
  //...
  webhook: `${WEBHOOK_SERVER}/predictions/${videoId}`,
  webhook_events_filter: ['completed']
});
```

### Cost Tracking
```typescript
interface CostTracking {
  openai: {
    totalTokens: number;
    estimatedCost: number;
  };
  replicate: {
    totalPredictions: number;
    totalPredictTime: number;
    estimatedCost: number;
  };
}
```

---

## Appendix A: Example OpenAI Prompt

**For "Anxiety or fear" × "Direct-to-camera":**

```
System: You are creating a comforting video script for someone struggling with Anxiety or fear.

Format: Direct-to-camera speaking style
Tone: Empathetic, conversational, warm
Structure: 3 scenes showing emotional progression

For each scene, provide:
1. Spoken dialogue (conversational, natural)
2. A detailed cinematography prompt for generating the video

Guidelines:
- Use second person ("you") to speak directly to viewer
- Keep dialogue natural and authentic
- Each scene should be ~10 seconds of spoken content
- Cinematography prompts should describe: subject, expression, lighting, framing, mood

User: Generate a 3-scene video script for someone struggling with "Anxiety or fear".
```

**Expected Response (parsed with Zod):**
```json
{
  "category": "Anxiety or fear",
  "template": "direct-to-camera",
  "overallScript": "A message of comfort for those battling anxiety...",
  "scenes": [
    {
      "sceneNumber": 1,
      "content": "I know what it's like when anxiety feels overwhelming. When your mind races and your heart won't slow down. When fear whispers lies that feel so real.",
      "prompt": "Medium close-up of a compassionate woman in her 30s, soft natural window lighting from the left, warm and concerned expression, looking directly at camera, cozy living room background slightly blurred, gentle and empathetic mood, vertical 9:16 format"
    },
    {
      "sceneNumber": 2,
      "content": "But here's the truth: you're not alone in this battle. God sees every anxious thought, every sleepless night. And He hasn't forgotten you.",
      "prompt": "Same woman, soft smile emerging, lighting slightly brighter, reassuring and warm expression, leaning slightly forward showing engagement, background unchanged, hopeful and comforting mood, vertical 9:16 format"
    },
    {
      "sceneNumber": 3,
      "content": "Cast all your anxiety on Him, because He cares for you. First Peter 5:7. You don't have to carry this weight alone.",
      "prompt": "Woman with peaceful, confident expression, natural smile, warm golden lighting, relaxed posture, direct eye contact with camera, same cozy background, uplifting and hopeful mood, vertical 9:16 format"
    }
  ]
}
```

---

## Appendix B: File Naming Conventions

### Script Files
```
{category-slug}_{template-id}_{timestamp}.json

Examples:
anxiety-or-fear_direct-to-camera_20250115T143022Z.json
finances-or-provision_text-visuals_20250115T143045Z.json
```

### Video Clip Files
```
{video-id}_scene{num}_{timestamp}.mp4

Examples:
anxiety-or-fear_direct-to-camera_scene1_20250115T143234Z.mp4
anxiety-or-fear_direct-to-camera_scene2_20250115T143456Z.mp4
```

### Video ID Format
```
{category-slug}_{template-id}

Example:
anxiety-or-fear_direct-to-camera
```

---

## Appendix C: Cycle 4 Updates & Enhancements

### Frame Chaining (Character Consistency)

**Implementation**: Base64 data URLs for image parameter

**Flow**:
1. Scene 1 generates fresh (no image parameter)
2. Extract last frame (frame 191 @ 24fps) from Scene 1
3. Convert JPEG to base64 data URL: `data:image/jpeg;base64,{base64string}`
4. Pass data URL to Scene 2's `image` parameter
5. Extract last frame from Scene 2, convert to data URL
6. Pass to Scene 3's `image` parameter

**Technical Details**:
- Frame extraction: `ffmpeg -i "{video}" -vf "select='eq(n,191)'" -frames:v 1 "{output}"`
- Frame size: ~50-150KB (well within 256KB data URL limit)
- Storage: Frames saved to `videos/{videoId}_{timestamp}/frames/`

**Files**: `src/lib/video-generator.ts` - `extractLastFrame()` method

---

### Unified Manifest System

**Purpose**: Single JSON format for dry-runs and full runs

**Naming Convention**:
- Full runs: `{videoId}_{timestamp}.json`
- Dry-runs: `dry-run_{videoId}_{timestamp}.json`

**Example**:
```
manifests/anxiety-or-fear_direct-to-camera_2025-10-27T14-32-15-123Z.json
manifests/dry-run_anxiety-or-fear_direct-to-camera_2025-10-27T14-32-15-123Z.json
```

**Status Field**:
```typescript
type ManifestStatus =
  | "dry-run"           // Script only
  | "script-generated"  // Videos pending
  | "completed"         // Videos done
  | "failed";           // Generation failed
```

**Lifecycle**:
1. Create manifest after script generation (status: "script-generated" or "dry-run")
2. Generate videos (if not dry-run)
3. Update manifest after videos complete (status: "completed", add finalVideoPath)

**Files**: See [Manifest Schema](../../2_reference-docs/manifest-schema.md)

---

### Timestamped Output Structure

**Updated Directory Structure**:
```
output/
├── manifests/
│   ├── dry-run_{videoId}_{timestamp}.json
│   └── {videoId}_{timestamp}.json
└── videos/
    └── {videoId}_{timestamp}/
        ├── scenes/
        │   ├── scene1.mp4
        │   ├── scene2.mp4
        │   └── scene3.mp4
        ├── frames/
        │   ├── scene1_last.jpg
        │   └── scene2_last.jpg
        └── final.mp4
```

**Benefits**:
- No overwrites (each generation preserved)
- Clear history tracking
- Easy to identify which generation
- Matches manifest timestamps

**Files**: See [Output Structure](../../2_reference-docs/output-structure.md)

---

### Zod Schema Approach

**Philosophy**: Trust OpenAI, guide with descriptions (not hard constraints)

**Call 1 Schema** (Content Generation):
```typescript
const ContentSchema = z.object({
  videoScript: z.string().describe("Full visual description of Scene 1 - the baseline"),
  voiceScript: z.string().describe("50-60 words of dialogue")
});
```

**Call 2 Schema** (Prompt Optimization):
```typescript
const PromptsSchema = z.object({
  scenes: z.array(z.object({
    sceneNumber: z.number().int(),
    prompt: z.string()
  })).length(3)
});
```

**Key Changes**:
- Removed arbitrary `.min()` and `.max()` constraints
- Added `.describe()` for natural LLM guidance
- Trust OpenAI to determine appropriate lengths
- Matches successful playground testing

**Files**: See [Zod Schemas](../../2_reference-docs/zod-schemas.md)

---

### State Tracking Enhancements

**New Fields in VideoState**:
```typescript
interface VideoState {
  id: string;                // Logical ID
  videoFolderName: string;   // Timestamped folder name
  manifestPath?: string;     // Path to manifest file
  finalVideoPath?: string;   // Path to combined video
  // ... other fields
}
```

**Purpose**:
- Track timestamped folder names separately from logical IDs
- Link state to specific manifest files
- Support resume functionality with timestamped outputs

---

### Model Upgrades

**LLM**: gpt-5-mini
- Better reasoning capabilities
- Uses ~2000 reasoning tokens + ~1000 output tokens
- `max_completion_tokens: 4000` to accommodate reasoning

**Video**: Veo 3.1
- Frame chaining support via `image` parameter
- `negative_prompt` support: "background music"
- Improved character consistency

---

### Removed Components

**DryRunAssembler**: Merged into ManifestCreator
- Dry-runs now create manifests (not separate JSON)
- Single format for all outputs

**"generating" Status**: Removed from ManifestStatus
- Never used in actual implementation
- Simplified to: dry-run → script-generated → completed/failed

**Arbitrary Zod Constraints**: Removed
- No more `.min(50)`, `.max(400)`, etc.
- Trust LLM with description-based guidance
