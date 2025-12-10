# AdLoops System Analysis

> Extracted from codebase exploration. Use this as context for ContentLoops integration work.

## Repository Structure

Three repos in `_adloops/`:

| Repo | Purpose | Tech |
|------|---------|------|
| `Adloops-Backend` | Serverless backend functions | Deno, Firebase Functions |
| `Ads_Platform_Web` | Dashboard/UI | Next.js, TypeScript |
| `ads-library-automation` | Core automation engine | Firebase Functions, TypeScript |

---

## Core Concepts (Data Model)

### Components - The Raw Building Blocks
Stored in Firestore collections:

- **`hooks`** - Attention-grabbing openings (first 1-3 seconds)
- **`bodies`** - Main content/story
- **`ctas`** - Call-to-action endings
- **`overlays`** - Visual elements layered on top (text, graphics)
- **`audios`** - Background music, sound effects
- **`scripts`** - Text content for voice generation

Each component has:
- `_firestore_id` - Document ID
- `companyId` - Organization owner
- `language` - Content language
- `preview` - Thumbnail/preview file
- `raw_video` - Actual media files (portrait, square, landscape variants)
- `status` - Processing status
- `used_count` - How many times used in mixes

### Templates - The Blueprints
Two types:

**Manual Templates** (`templates` collection):
```typescript
interface IInfluencerTemplate {
  hooks: IHook[];
  bodies: IBody[];
  ctas: ICta[];
  overlay: IOverlay[];
  audios: IAudio[];
  captions: ICaption;
  name: string;
  language: string;
  hookTimeLimit: number;
  bodyTimeLimit: number;
}
```

**Auto Templates** (`autoMixTemplates` collection):
```typescript
interface IMyVideoMixAutoTemplate {
  groups: MyVideoMixSourceTemplateGroup[];  // Field definitions
  translate: string[];      // Languages to generate
  language: string;         // Base language
  interval: number;         // Hours between runs
  last_generation: Timestamp;
  prompt: string;           // For voice/overlay generation
  voiceName: string;
  dataSource: string;       // Where to pull data from
  tiktokAccounts?: string[];
  facebookPages?: string[];
  outputTargets: string[];
}
```

### Video Mix - One Recipe Execution
When a template runs, creates a `videoMix` document:
```typescript
interface MyVideoMix {
  id: string;
  components: Record<string, string[]>;  // e.g., { hook: ["id1"], body: ["id2", "id3"] }
  overlay: MyVideoMixOverlay[];
  voice?: MyVideoScriptAudioFile[];
  status: MyVideoMixStatus;  // new, running, ready, uploaded, paused, retry
  language?: string;
  templateFormat: string;    // Which template created this
  companyId: string;
  configId: string;
  userId: string;
  affiliate?: boolean;       // Organic vs paid
  tiktokAccountId?: string;
  facebookPageId?: string;
}
```

### Part - One Actual Video Variant
Each Mix generates multiple Parts (subcollection `videoMixes/{id}/parts`):
```typescript
interface MyVideoMixPartDoc {
  name: string;
  videoLayers: MyVideoMixPartLayer[];
  audioLayers: MyVideoMixAudioLayer[];
  overlay: MyVideoMixOverlayObject[];
  resolution: string;
  status: string;
  hook?: string;      // Component IDs used
  body?: string;
  cta?: string;
  script?: string;
  voice?: string;
  video_id?: string;  // Final rendered video ID
  extracted_texts: string[];
  srtFileName?: string;
  captions?: MyVideoMixCaptions;
}
```

Example: 3 hooks × 2 bodies × 2 CTAs = 12 parts

### Video - Final Rendered Asset
```typescript
interface IVideo {
  _firestore_id: string;
  preview: IVideoPreview;
  raw_video: { portrait?: IFile; square?: IFile; landscape?: IFile; };
  facebook: IFacebookVideo;
  tiktok?: ITiktokVideo;
  experiments: string[];
  tags: string[];
  feature: string;
  description: string;
  headlines: string[];
  primary_text: string;
  language: string;
  total_spend: number;
}
```

### Experiment - A/B Test Campaign
```typescript
interface DTOExperiment {
  provider: string;          // facebook, tiktok, snapchat
  campaign_name: string;
  adgroup_name: string;
  budget: number;
  videos: string[];          // Video IDs to test
  status: string;
  objective_type: string;
  target: {
    countries: string[];
    platform: string;        // IOS, ANDROID
    age?: string[];
  };
}
```

---

## Pipeline Flow

```
1. TEMPLATE TRIGGER
   - Scheduled (cron) OR manual
   - MyVideoMixAutoTemplate.build() called

2. MIX CREATION
   - Queries Firestore for components matching conditions
   - Generates voice if needed (TTS from script)
   - Creates videoMix document with status: "new"
   - Location: ads-library-automation/functions/src/videomixes/MyVideoMixAutoTemplate.ts

3. PART GENERATION (Firebase trigger: onCreateMixes)
   - MyVideoMixBuilder.build() creates all part combinations
   - MyVideoMixPreviews.build() generates preview thumbnails
   - Each part = subcollection document
   - Location: ads-library-automation/functions/src/triggers/mixes.ts

4. VIDEO RENDERING (Firebase trigger: onCreateMixPart)
   - Sends task to worker queue (Pub/Sub)
   - Worker downloads components, renders video
   - Uploads to cloud storage
   - Creates video document
   - Location: ads-library-automation/functions/src/triggers/mixes.ts

5. CONTENT TAGGING (generateAdContent)
   - GPT-4o-mini analyzes video transcript
   - Generates: description, tags, headlines, primary_text
   - Tags with app feature (anxiety, relationships, etc.)
   - Location: ads-library-automation/functions/src/content/content.ts

6. EXPERIMENT CREATION
   - Groups videos by language, script, body
   - Creates experiment documents
   - Sets targeting: countries, platform, age, budget

7. AD PLATFORM UPLOAD
   - Uploads videos to Facebook/TikTok via APIs
   - Creates actual ad campaigns/adgroups

8. PERFORMANCE TRACKING
   - BigQuery pulls performance data
   - Tracks spend, installs, conversions
```

---

## Key Technical Patterns

### Event-Driven Architecture
Everything runs on Firestore triggers:
```typescript
// ads-library-automation/functions/src/triggers/mixes.ts
export const onCreateMixes = onDocumentCreated("videoMixes/{mix_id}", async (event) => {
  // Triggers when new videoMix created
});

export const onCreateMixPart = onDocumentCreated("videoMixes/{mix_id}/parts/{part_id}", async (event) => {
  // Triggers when new part created
});

export const onUpdateMixes = onDocumentUpdated("videoMixes/{mix_id}", async (event) => {
  // Handles status changes
});
```

**Key insight:** Write a document = trigger a pipeline step.

### Status Machine
Documents use `status` field to control flow:
- `new` → ready to process
- `running` → currently processing
- `ready` → done, waiting for next step
- `uploaded` → sent to ad platform
- `paused` → temporarily stopped
- `retry` → reprocess from scratch

### Worker Queue Pattern
Heavy work (video rendering) goes to Pub/Sub worker:
```typescript
await createTaskForWorker({
  type: WorkerTaskType.ProcessVideoMix,
  data: { path: doc.ref.path },
});
```

### Overlay System
Overlays can get their data from:
- **Given overlay** - Pre-defined text/graphics
- **Generated overlay** - LLM generates text
- **Self datasource** - Content provides its own overlay data (e.g., narration)
- **Overall datasource** - External CSV/data feed

```typescript
interface MyVideoMixOverlay {
  overlayId: string;
  compositionId?: string;
  params?: MyVideoMixOverlayParam[];  // e.g., { key: "text", value: "..." }
  layers: string[];
  language?: string;
  type?: "customizable" | "static";
  prompt?: string;
  generationType?: "manual" | "auto";
}
```

### Template Field System
Templates define fields with conditions:
```typescript
interface MyVideoMixSourceTemplateField {
  name: string;
  type: "video" | "audio" | "text" | "image" | "overlay";
  collection: string;           // Firestore collection to pull from
  conditions?: MyVideoMixSourceTemplateFieldCondition[];
  numberOfFields?: number;      // How many to pull
  dataSource?: string;          // For overlays
  layers?: string[];
  editable?: boolean;
}

interface MyVideoMixSourceTemplateFieldCondition {
  search_field: string;
  condition: WhereFilterOp;     // "==", "in", "array-contains", etc.
  equal_with: string | number | boolean;
}
```

---

## ContentLoops Integration Points

### What ContentLoops Needs to Output

**For AdLoops to consume comic book content:**

1. **Upload assets to Cloud Storage** (images, videos)

2. **Write to Firestore collections:**
   - `bodies` collection for comic pages/panels
   - `hooks` collection if generating hook content
   - `overlays` collection for text overlays

3. **Required fields for a body:**
```typescript
{
  _firestore_id: string,
  companyId: string,
  language: string,
  preview: {
    fileName: string,
    fileURL: string,
    format: string,
  },
  raw_video: {
    portrait: { fileName: string, fileURL: string },
    // square, landscape if needed
  },
  status: "approved",
  uploaded_by: string,
  userId: string,
  duration?: number,
}
```

4. **Overlay data** (if providing narration/text):
```typescript
{
  overlayId: string,
  params: [{ key: "text", value: "narration text here" }],
  layers: ["body"],  // Which component this applies to
  language: string,
}
```

### DataSource Integration
ContentLoops can register as a datasource that AdLoops templates reference:
- Templates can have `dataSource: "contentloops-comics"`
- CLoops provides overlay text via `getOverlays()` interface

---

## Key Files Reference

| File | Purpose |
|------|---------|
| `ads-library-automation/functions/src/videomixes/models.ts` | All mix-related TypeScript interfaces |
| `ads-library-automation/functions/src/videomixes/MyVideoMixAutoTemplate.ts` | Auto template execution logic |
| `ads-library-automation/functions/src/videomixes/MyVideoMixBuilder.ts` | Part combination generation |
| `ads-library-automation/functions/src/triggers/mixes.ts` | Firestore triggers for mix lifecycle |
| `ads-library-automation/functions/src/content/content.ts` | GPT content tagging |
| `Ads_Platform_Web/models/videos.ts` | Video/Hook/Body/CTA interfaces |
| `Ads_Platform_Web/models/templates.ts` | Template interfaces |
| `Ads_Platform_Web/models/experiments.ts` | Experiment interfaces |

---

## Questions for SoulStream Team

Things to clarify for integration:
1. Which Firestore collections should ContentLoops write to?
2. What's the expected `companyId` and `configId` for Bible Chat content?
3. Should ContentLoops create its own templates in `autoMixTemplates`, or just supply components?
4. File storage: Which GCS bucket? Naming conventions?
5. How should comic panels be structured - as individual bodies, or as a sequence?
