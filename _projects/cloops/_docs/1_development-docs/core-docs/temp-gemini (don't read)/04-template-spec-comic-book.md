# Comic Book Template Specification

**Template ID:** `comic-book`
**Version:** 1.0.0
**Based on:** Manual Template v4.0

## 1. Overview
The `ComicBookTemplate` generates a multi-page visual story. It transforms a loose topic (e.g., "David and Goliath") into a structured sequence of images with associated narration text.

**Core Output:**
- A series of 3-5 images (Pages), each containing a grid of panels.
- A structured JSON containing the story narrative and narration text per page.
- A "Thumbnail" or "Cover" image.

---

## 2. Configuration Profiles

The behavior of the template is controlled by a configuration object. This allows the same logic to serve different downstream needs (e.g., the Kids App vs. an Ad Campaign).

### Config Schema (`ComicBookConfig`)

```typescript
type OutputTarget = 'app' | 'adloop';

interface ComicBookConfig {
  // Structure
  targetLength: 'short' | 'medium' | 'long'; // short=3 pages, medium=5 pages, long=8 pages
  panelsPerPage: number; // usually 3 or 4
  
  // Content
  includeNarration: boolean; // If true, generates voiceover scripts
  targetAudience: 'kids' | 'adults' | 'general';
  
  // Visuals
  artStyle: string; // e.g., "Disney-style 3D", "Golden Age Comic", "Watercolor"
  aspectRatio: string; // "9:16" (vertical mobile) or "1:1" (square)
  
  // Output
  outputTargets: OutputTarget[]; // Defines which packagers to run
}
```

### Standard Profiles

**Profile: `kids-app`**
- `targetLength`: "medium" (5 pages)
- `panelsPerPage`: 3
- `includeNarration`: true
- `targetAudience`: "kids"
- `artStyle`: "3D Pixar-style, bright colors, soft lighting, expressive characters"
- `aspectRatio`: "9:16"
- `outputTargets`: ["app"]

**Profile: `ad-campaign-hook`**
- `targetLength`: "short" (3 pages)
- `panelsPerPage`: 1 (Full screen visuals for impact)
- `includeNarration`: true (for text overlays)
- `targetAudience`: "general"
- `artStyle`: "Epic cinematic, high contrast, dramatic lighting"
- `aspectRatio`: "9:16"
- `outputTargets`: ["adloop"]

---

## 3. Workflow Steps & Prompts

### Phase 1: Planning (`plan(topic)`)

**Goal:** Turn a simple topic into a concrete story arc and pagination structure.

**Input:** `topic` (string)
**LLM:** `gpt-5.1`
**Tools:** None (Pure completion)

**Prompt Strategy:**
1.  **Role:** "Expert Storyteller and Comic Book Editor."
2.  **Task:** "Write a coherent story based on the TOPIC. Then, break it down into a visual script."
3.  **Constraints:**
    *   Story must have a clear beginning, middle, and end.
    *   Tone must match `config.targetAudience`.
    *   Total pages must match `config.targetLength`.
    *   Narration must be concise (max 40 words per page).

**Output Schema (`ComicBookPlan`):**

```typescript
const PlanSchema = z.object({
  title: z.string(),
  synopsis: z.string(),
  characters: z.array(z.object({
    name: z.string(),
    description: z.string().describe("Physical visual traits only (hair, clothes, size). No personality traits.")
  })),
  pages: z.array(z.object({
    pageNumber: z.number(),
    narration: z.string(),
    visualIntent: z.string().describe("High-level description of what happens on this page visually.")
  }))
});
```

---

### Phase 2: Scripting (`script(plan)`)

**Goal:** Translate the high-level plan into specific image generation prompts.

**Input:** `plan` (ComicBookPlan), `config` (ComicBookConfig)
**LLM:** `gpt-5.1`

**Prompt Strategy:**
1.  **Role:** "Prompt Engineering Specialist for Image Generation."
2.  **Context:** Provide the `plan.characters` and `config.artStyle` as global constants.
3.  **Task:** "For each page in the plan, generate a single, highly detailed image prompt that will create a comic book page layout."
4.  **Technique (The "Block" Replacement):**
    *   Instead of manually assembling blocks, the System Prompt will define the "Style String" based on the config.
    *   The LLM focuses on the *Subject* and *Action* within that style.
    *   **Crucial:** The prompt must specify the *layout* (e.g., "A comic book page split into 3 vertical panels...").

**Output Schema (`ComicBookScript`):**

```typescript
const ScriptSchema = z.object({
  cover: z.object({
    prompt: z.string().describe("Prompt for the thumbnail/cover image"),
    negative_prompt: z.string().optional()
  }),
  pages: z.array(z.object({
    pageNumber: z.number(),
    narration: z.string(), // Carried over from Plan, potentially refined
    image_prompt: z.string().describe("The full prompt sent to the image generator"),
    negative_prompt: z.string().describe("Standard negative prompt for this style"),
    panel_descriptions: z.array(z.string()).describe("Metadata: what is happening in each panel (for overlays)")
  }))
});
```

---

### Phase 3: Generation (`generate(script)`)

**Goal:** Execute the prompts against the Image Gen API.

**Provider:** Replicate / Fal.ai
**Model:** `flux-pro` or similar high-coherence model.

**Logic:**
1.  **Iterate:** Loop through `script.pages`.
2.  **Call:** Send `image_prompt` + `aspect_ratio` to API.
3.  **Store:** Save resulting URL/Image to local temp.
4.  **Cover:** Generate `script.cover.prompt`.

**Output (`Assets`):**
```typescript
interface Assets {
  cover: string; // Path to cover image
  pages: Array<{
    pageNumber: number;
    filePath: string; // Path to page image
    narration: string;
    panelMetadata: string[];
  }>;
}
```

---

### Phase 4: Packaging (`package(assets, config)`)

**Goal:** Create the final delivery bundle(s).

**Logic:**
1.  Check `config.outputTargets`.
2.  **If 'app':**
    *   Create `story-data.json`:
        ```json
        {
          "id": "UUID",
          "title": "Plan.title",
          "pages": [ { "image": "page1.png", "text": "..." } ]
        }
        ```
    *   Copy images to `output/app-bundle/`.
3.  **If 'adloop':**
    *   Create `manifest.json`:
        ```json
        {
          "type": "body",
          "source": "content-loops",
          "assets": [ "page1.png", "page2.png" ]
        }
        ```
    *   Create `overlays.json` (The "Self DataSources"):
        ```json
        {
          "narration_lines": [ "Page 1 text...", "Page 2 text..." ]
        }
        ```

## 4. Migration from Manual V4

| Feature | Manual V4 | New V2 Spec (Automated) |
| :--- | :--- | :--- |
| **Story Choice** | Manual selection from backlog | Passed as `topic` argument to CLI |
| **Narrative** | Human writes 150 words | `plan()` step generates `PlanSchema` |
| **Paneling** | Human segments text | `plan()` step generates `pages` array |
| **Prompting** | Human assembles "Blocks" | `script()` step generates `image_prompt` using Config + Plan |
| **Metadata** | Human edits JSON | `package()` step auto-generates JSON |

