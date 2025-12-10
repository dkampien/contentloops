# Comic Book - Production Template Plan

## Overview
Production-ready specification for the comic book content template. Converts the manual workflow (v4) into an automatable plan with defined inputs, outputs, and API configurations for each step.

## Template Input
- **Source:** Backlog (managed at CLoops system level, not by this template)
- **Format:** Structured story object
- **Model:** Target image generation model (e.g., seedream4, nanobanana) - determines prompt constraints in Step 3, called in Step 5

```
{
  title: "David and Goliath",
  summary: "Boy defeats giant warrior with sling",
  keyMoments: ["battle", "stone throw", "giant falling"]
}
```

---

## Steps

### Step 0: Receive Story Input
**Type:** System input (no processing)

**Input:** Structured story object from backlog (title, summary, keyMoments)
**Output:** Story object passed to Step 1

**Notes:** 
- Backlog generation and management is a separate CLoops system concern. This template receives a structured story object and runs. The summary and keyMoments act as guardrails for consistent LLM output.
- Can add some sort of bible api as a better input / story validation?

---

### Step 1: Story Narrative
**Type:** LLM Call

**Input:**
- Story object (title, summary, keyMoments)

**Output:**
- Prose narrative (plain text)

**Constraints/Rules:**
- Ensure complete story arc (setup, conflict, resolution)
- If story is part of larger biblical narrative, this episode must have its own complete arc
- Target ~150 words (flexible - completeness over word count)
- Simple vocabulary

<!-- TEST PROMPTS - Remove after validation -->
**System Prompt:**
```
<role>
You are a biblical storyteller creating narratives for comic book adaptation.
</role>

<task>
Write a complete story narrative based on the provided story details.
</task>

<constraints>
- The narrative must have a complete story arc: setup, conflict, and resolution.
- Aim for approximately 150 words, prioritizing completeness over strict word count.
- If the story is part of a larger biblical narrative, this episode must still have its own complete arc.
- Use simple vocabulary.
- Do not use em dashes.
</constraints>

<output_format>
Output the narrative as continuous prose.
</output_format>
```

**User Message Template:**
```
Write the Bible story narrative for:

Title: {title}
Summary: {summary}
Key moments to include: {keyMoments}
```
<!-- END TEST PROMPTS -->

**API Config:**
- Basic chat completion
- No structured output needed

**Validation:** None required

---

### Step 2: Page & Panel Planning
**Type:** LLM Call

**Input:**
- Prose narrative from Step 1

**Output:**
- Structured JSON: array of pages, each with narration and panels (including visual anchors)

```
{
  pages: [
    {
      pageNumber: 1,
      title: "Setup",
      narration: "The Israelite army faced the Philistines...",
      panels: [
        { panel: 1, moment: "Two armies facing across valley", visualAnchor: "Scale of confrontation, tension between sides" },
        { panel: 2, moment: "Goliath challenging Israelites", visualAnchor: "Goliath's intimidating presence, dominance" },
        { panel: 3, moment: "David arriving at camp", visualAnchor: "David's youth/simplicity against military setting" }
      ]
    },
    ...
  ]
}
```

**Constraints/Rules:**
- 3-5 pages based on natural story beats
- Narration: ~30-40 words per page, extracted from Step 1 prose (not rewritten)
- 3 panels per page
- Each panel describes one visual moment/action in detail (gives Step 3 more to work with)
- Panels must advance the story
- Visual anchor: emphasis/intent hint that guides Step 3's visual decisions (scale, emotion, contrast, etc.)


<!-- TEST PROMPTS - Remove after validation -->
**System Prompt:**

<role>
You are a comic book page planner. You break narratives into visual pages and panels.
</role>

<task>
Break the narrative into pages and define panels.

1. Identify major story moments (beats) where the narrative naturally segments
2. Divide into pages based on these moments
3. For each page:
- Extract the sentences from the narrative covering that segment as narration
- For each panel, describe the visual moment/action shown in detail
- For each panel, add a visual anchor: emphasis or intent hint that guides image generation
</task>

<constraints>
- 3-5 pages total (flexible based on story needs)
- 3 panels per page
- Page narration: ~30-40 words extracted from the narrative (do not rewrite)
- Each panel description: one visual moment/action, described in detail
- Panels must advance the story
- Visual anchor: what should be emphasized visually (scale, emotion, contrast, etc.)
</constraints>

<output_format>
Return structured JSON matching the example format.
</output_format>


**User Message Template:**
```
Break this narrative into comic book pages and panels:

{narrative}
```

**JSON Schema (for API structured output):**
```json
{
  "type": "object",
  "properties": {
    "pages": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "pageNumber": { "type": "integer" },
          "title": { "type": "string" },
          "narration": { "type": "string" },
          "panels": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "panel": { "type": "integer" },
                "moment": { "type": "string" },
                "visualAnchor": { "type": "string" }
              },
              "required": ["panel", "moment", "visualAnchor"],
              "additionalProperties": false
            }
          }
        },
        "required": ["pageNumber", "title", "narration", "panels"],
        "additionalProperties": false
      }
    }
  },
  "required": ["pages"],
  "additionalProperties": false
}
```
<!-- END TEST PROMPTS -->

**API Config:**
- Chat completion with structured output (JSON mode or response_format)
- Schema enforced for consistent parsing

**Validation:**
- Verify page count within range (3-5)
- Verify each page has panels

---

### Step 3: Prompt Generation
**Type:** LLM Call

**Input:**
- Page/panel structure from Step 2 (moments + visual anchors)
- Story context (title, characters) ??

**System Context Required:**
- Knowledge layer: prompting methodology, block library (CLoops system-level concern - TBD how this is provided)

**Output:**
- One image prompt per page (natural language, assembled from blocks)

```
{
  characterDefinitions: [
    { name: "David", appearance: "young boy, shepherd clothing, sling..." },
    { name: "Goliath", appearance: "giant warrior, bronze armor..." }
  ],
  storyStyle: {
    artStyle: "...",
    inkStyle: "...",
    colorTreatment: "..."
  },
  pagePrompts: [
    { pageNumber: 1, prompt: "A comic book page with 3 vertical panels..." },
    ...
  ]
}
```

**Sub-steps:**
1. Fill block values (guided by panel moments + visual anchors)
2. Assemble blocks into natural language prompt
3. Format output

**Configurable Parameters (TBD - likely system-level):**
- Block detail level (how descriptive)
- Block depth level (granularity in assembly)
- Assembly rules
- Output format options

**Model Config:**
- Template supports multiple image generation models (e.g., seedream4, nanobanana)
- Each model has a separate constraint set defined in the template
- At runtime, model is specified as input parameter
- Step 3 LLM call includes the selected model's constraints in the system prompt
- Constraints affect prompt generation rules (character consistency, panel complexity, etc.)

Example constraint differences:
- seedream4: strict character description copying, 3-5 elements per panel
- nanobanana: model handles consistency, more elements allowed per panel

Example implementation pattern (use current OpenAI API - responses API):
```
// Get constraints for chosen model
const constraints = template.modelConfig[modelId];

// Build system prompt with knowledge layer + model constraints
const systemPrompt = buildSystemPrompt(knowledgeLayer, constraints);

// LLM call with structured output
const response = await openai.responses.create({
  model: "gpt-4o",
  input: panelData,
  instructions: systemPrompt,
  text: { format: { type: "json_object" } }
});
```

**Constraints/Rules:**
- Character descriptions: physical appearance only (camera-visible)
- Assemble blocks into natural flowing sentences
- Consistent style across all pages
- Block structure is pre-defined by template (LLM fills values, doesn't choose blocks)

**API Config:**
- Chat completion with structured output
- System prompt includes knowledge layer

**Validation:**
- Verify prompt exists for each page from Step 2

**Notes:**
- Prompt generation is likely a shared CLoops system capability used by multiple templates
- Visual anchor gives emphasis/intent, Step 3 decides composition to achieve it
- Implementation details TBD

<!-- TEST PROMPTS - Remove after validation -->
System Prompt:
<role>
You are an expert visual prompt engineer specializing in comic book image generation.
</role>

<task>
Generate image prompts for comic book pages based on the provided page/panel structure.
1. Define character appearances 
2. For each page, fill the panel blocks (provided in user message) and assemble into one natural language prompt
</task>

<constraints>
- When defining characters appearances, keep it to physical appearance only (hair, clothing, features) and ~10-20 words max
- Keep panels simple (3-5 core visual elements)
- Assemble blocks into natural flowing sentences
</constraints>

<knowledge>
BLOCK SYSTEM:
Prompts are built from modular blocks representing scene aspects:
- Subjects: characters, appearance, actions
- Environment: setting, location
- Composition: shot type, camera angle
- Lighting: light type, quality

ASSEMBLY RULE:
Combine block values into natural, flowing sentences. Don't list blocks separately.
- ❌ "Young boy, dark hair, tunic, basket, camp"
- ✅ "A young boy with dark hair in a simple tunic carries a basket into the camp"

VISUAL-ONLY PRINCIPLE:
Describe only physical, camera-visible elements. Avoid abstract interpretations.
- ❌ "intimidating presence" (abstract)
- ✅ "towering figure with furrowed brow" (visible)
</knowledge>

<output_format>
Output only page prompts, no character definitions.
PAGE [N]
[assembled prompt with page-level blocks followed by panel descriptions]
</output_format>


<!-- USER MESSAGE 1-->
Use these blocks for prompt generation:
<blocks>
PAGE-LEVEL BLOCKS (apply to each page)
- medium.type = "comic book page"
- layout.panelCount = "3"
- layout.panelArrangement = "vertical"
- comicStyle.artStyle = "children's book illustration"
- comicStyle.inkStyle = "bold ink lines"
- comicStyle.colorTreatment = "flat colors"
- style.imageStyle = "vibrand and accesible"

PANEL-LEVEL BLOCKS (fill for each panel):
- scene.subjects.details = "[character description]"
- scene.subjects.action = "[what doing]"
- scene.environment.setting = "[where]"
- composition.shot.type = "[framing]"
- composition.shot.angle = "[angle]"
- lighting.lightType = "[lighting]"
</blocks>


<!-- USER MESSAGE 2-->

Generate image prompts from these panels using the blocks provided. 

{{step2_output}}




---

### Step 4: Thumbnail Prompt (Optional)
**Type:** LLM Call

**Input:**
- Story context (title, characters from Step 3)
- Key story moment (from Step 2)

**Output:**
- Single image prompt for cover/thumbnail

**Constraints/Rules:**
- Composite scene representing the story (main characters + key moment)
- Include title text on image
- Same visual style as pages
- Clear visual hierarchy (characters foreground, background elements behind)

**API Config:**
- Chat completion with structured output
- Uses same knowledge layer as Step 3

**Optional:**
- Step can be skipped based on template config
- Some variants may not require thumbnail

<!-- SYSTEM PROMPT -->
<role>
You are a comic book cover designer creating thumbnail images for Bible story comics.
</role>

<task>
1. Create a composite scene featuring main characters and a key story moment.
2. Generate a cover/thumbnail image prompt based on the story title and page content.
</task>

<constraints>
- Composite scene: one paragraph, no line breaks
- Focus on one key moment, not the whole story
</constraints>

<output_format>
Output in this exact order:

A vertical portrait comic book cover, children's book illustration style with bold ink lines and flat colors, vibrant and dramatic.

 [Composite scene description]

Bold text at top: "[STORY_TITLE]" in thick blocky sans-serif font, white letters with heavy black outline stroke, comic book title style, all caps.

Epic, storybook cover aesthetic.
</output_format>


<!-- USER MESSAGE -->
Create a thumbnail prompt for this comic:
Title: {Title} -- needs better input


---

### Step 5: Image Generation
**Type:** Generation Service Call (Replicate/ComfyUI)

**Input:**
- Page prompts from Step 3
- Thumbnail prompt from Step 4 (if generated)
- Model config (which image gen model to use)

**Output:**
- Generated images (pages + thumbnail)
- Stored in output folder

**Generation Requirements (template-defined):**
- Image model (seedream4, nanobanana, etc.)
- Model-specific parameters (aspect ratio, size, etc.) - must align with model's API schema
- ComfyUI workflow (if applicable, future iteration)

**Execution:**
- Can batch or parallelize generation calls
- System-level service handles API calls, retries, file storage
- Template defines requirements, system executes

**Validation:**
- Verify image generated for each page
- Verify thumbnail generated (if Step 4 ran)

---

### Step 6: Bundle Output
**Type:** File operations

**Input:**
- Generated images from Step 5
- Narration data from Step 2
- Story metadata (title, page count)

**Output:**
- `story-data.json` in output folder

```
{
  "storyId": "david-and-goliath",
  "title": "David and Goliath",
  "thumbnailFile": "thumbnail.jpg",
  "totalPages": 4,
  "pages": [
    {
      "pageNumber": 1,
      "imageFile": "1.jpg",
      "narration": "The Israelite army faced the Philistines..."
    }
  ]
}
```

**Constraints/Rules:**
- Use exact narration text from Step 2 (do not rephrase)
- File paths relative to output folder

**Notes:**
- Index/registry updates handled at system level (not template)
- Datasource manager marks item complete after bundle output

---

## Error Handling

- On step failure: retry the step
- Keep it simple for initial implementation
- More sophisticated handling (checkpoints, resume) can be added later

---

## AdLoops Integration

- After template completes, system handles:
  - Upload images to cloud storage
  - Register metadata in Firestore
- AdLoops manifest format: TBD (check AdLoops Firestore schema for exact format)
- Template outputs story-data.json; system transforms to AdLoops format if needed

---

## Naming Conventions

**System-level (consistent across templates):**
- Output folder structure: `output/{template-name}/{item-id}/`
- Item ID format: kebab-case (e.g., `david-and-goliath`)
- Each bundle has a metadata file (e.g., `story-data.json`)

**Template-level (this template):**
- Pages: `1.jpg`, `2.jpg`, `3.jpg`, etc.
- Thumbnail: `thumbnail.jpg`
- Metadata: `story-data.json`

---

## Open Items (Next Session)

1. **Dynamic language content** - Comics should support any language. Text on image is minimal, but narration may need translation. Where does language config live? How does translation flow work?

2. **Cliffhangers for ads** - Ads should show partial comic and cut at a cliffhanger to drive app installs. Where does this get defined? Is it a separate step, a variant, or ad-specific packaging?