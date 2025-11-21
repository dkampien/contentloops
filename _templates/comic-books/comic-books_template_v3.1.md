# Comic Book Bible Stories - Template v3.1

**Purpose:** Generate Bible stories as comic book pages for SoulStream in-app content
**Format:** Aspect ratio of 3:4 - displays in 9:16 screen with app UI narration
**Modality:** text-to-image

---

## Development Approach

**Architecture:** Option 1B - Examples + Minimal Rules
- Self-contained template with complete worked examples
- Minimal inline rules derived from framework
- No external methodology references required
- LLM learns by pattern-matching examples

**Philosophy:** Show, don't tell. Examples demonstrate exact format expected.

---

## Hybrid Approach: Generated Images + App UI Text

**Content Split:**

**In Generated Images (AI):**
- Comic page visuals (panels, characters, scenes, composition)
- Dialogue only (speech bubbles)
- Minimal text load (2-3 speech bubbles per page)

**In App UI (Text overlay):**
- Page-specific narration text (extracted from Step 2 page narrations)
- Displayed below comic page in remaining vertical space. Recommended word count of ~30.
- 100% reliable, translatable, updatable

**Layout in 9:16 screen:**
```
┌─────────────────┐
│                 │
│   Comic Page    │ ← Generated image (dialogue only)
│   3:4 ratio     │
│                 │
│─────────────────│
│ Page narration  │ ← App UI text (not in image)
│ text for panels │   Specific to this page
│ on this page    │
└─────────────────┘
```

**Benefits:**
- Reduced AI text generation errors (fewer text elements)
- Narration 100% reliable and legible
- Easy to translate and update narration
- Comic visuals remain clean and focused

---

## Production Workflow

The comic creation process follows these phases:

**1. STORY SELECTION (Step 0)**
- Choose next story from backlog

**2. SETUP (Minimal)**
- Create output folder: `output/comic-books/XX-story-name/`

**3. STORY CREATION (Steps 1-4)**
- Step 1: Story Narrative (continuous prose, ~150 words)
- Step 2: Page & Panel Planning (narrations + panel moments)
- Step 3: Prompt Generation (with character definitions + block-based prompts)
- Step 4: Thumbnail Prompt (optional)
- Create story .md file in `_templates/comic-books/stories/`

**4. GENERATION**
- Generate images using prompts
- Save to output folder (page1.png, page2.png, etc.)

**5. POST-GENERATION CLEANUP**
- Create story-data.json (extract narration from Step 2)
- Update stories-index.md (increment numbers only)
- Update story-backlog.md (mark story complete)

---

## Key Definitions

**Panel:** A single compartment/frame within a comic page (shows one story beat/scene)
**Page:** One comic book page = one image generation (contains 1-4 panels showing multiple scenes)
**Story:** The complete narrative (may span multiple pages)
**Grid Layout:** Predefined panel arrangement

**Grid Layouts (Predefined):**
- **Layout A:** Single panel (fullscreen splash page)
- **Layout B:** 2 panels vertical (50/50 split)
- **Layout C:** 3 panels vertical (33/33/33 split)
- **Layout D:** 4 panels grid (2x2)

---

## Step 0: Story Selection

Select next story from backlog.

**Location:** `_templates/comic-books/stories/story-backlog.md`

**Tasks:**
- Choose available story
- Verify not already created (check `stories-index.md`)


---

## Step 1: Story Narrative

Write the complete Bible story in continuous prose format (~150 words).

**Important:**
- Write as natural narrative prose (no page sections)
- Ensure complete story arc (setup, conflict, resolution)
- If story is part of larger biblical narrative, ensure this episode has a complete arc even though it's one chapter of a bigger story
- Keep to ~150 words for consistency

**Example:**

The Israelite army faced the Philistines across the valley. Every day, the giant warrior Goliath challenged Israel to send a champion to fight him. For forty days, no one dared to face him. Young David, a shepherd boy, arrived at the camp bringing food to his brothers. When he heard Goliath's mocking challenge, David volunteered to fight. King Saul offered David his armor, but it was too heavy. David refused it and went to the stream, choosing five smooth stones for his sling. Standing before the giant, Goliath laughed at the boy. But David proclaimed he came in the name of the Lord. David slung a stone with all his might. The stone struck Goliath's forehead. The giant fell. David had defeated Goliath with faith and a single stone.

---

## Step 2: Page & Panel Planning

Break down the story into pages and panels. Reference Step 1 narrative.

**For each page, specify:**
1. **Page narration** - Extract/summarize from Step 1 narrative (~30-40 words, becomes app UI text)
2. **Grid layout** - Choose layout (A/B/C/D)
3. **Panel moments** - What specific action/dialogue happens in each panel

**Example:**

```
PAGE 1: SETUP
Narration: "The Israelite army faced the Philistines across the valley. Every day, the giant warrior Goliath challenged Israel to send a champion. Young David, a shepherd boy, arrived bringing food to his brothers."

Grid Layout: Layout C (3 panels vertical)

Panel 1: Two armies face each other across valley, tense standoff atmosphere
Panel 2: Goliath challenges the Israelites to send a champion
Panel 3: David arrives at camp bringing food to his brothers

PAGE 2: PREPARATION
Narration: "When he heard Goliath's mocking challenge, David volunteered to fight. King Saul offered David his armor, but it was too heavy. David refused it and went to the stream, choosing five smooth stones for his sling."

Grid Layout: Layout C (3 panels vertical)

Panel 1: David hears Goliath's challenge and volunteers to fight
Panel 2: King Saul offers David his armor, but David refuses it as too heavy
Panel 3: David goes to stream and selects five smooth stones for his sling

[Continue for remaining pages...]
```

**Best practices:**
- Decide page count first (typically 4 pages)
- Narration should cover story beats shown in that page's panels
- Each panel should advance the story through action or dialogue

---

## Step 3: Prompt Generation

Generate prompts for all pages using the block-based system. Reference Step 2 panel moments.

**Settings for this story:**
- **Block Depth:** Parent-level *(recommended for comics)*
- **Block Detail Level:** Medium *(recommended for comics)*

**Process:**
1. Define characters once (upfront)
2. Define story-wide style blocks once (upfront)
3. For each page, generate prompts using the 4-step process below

**Think like a director of photography:** Translate panel moments (narrative) into camera-visible descriptions. Choose blocks that capture what a camera would see.

---

### Part 1: Character Definitions

Define all recurring characters upfront. Include physical appearance (10-15 words: hair, facial features, clothing).

**These descriptions will be repeated exactly in every panel for consistency.**

**Example:**
```
Character Definitions:
- Goliath: Massive armored warrior with bronze helmet and plume, holding large spear
- David: Young shepherd boy with dark curly hair, simple tunic, carrying basket
- Saul: King with short dark beard, wearing royal robes and crown
```

---

### Part 2: Story-wide Style Blocks

Define visual style once (applies to all pages).

**Blocks:**
```
[medium.type] = comic book page
[style.artStyle] = children's book illustration
[comicStyle.inkStyle] = bold ink lines
[comicStyle.colorTreatment] = flat colors
[style.imageStyle] = vibrant, accessible
```

---

### Part 3: Settings

**Block Depth Setting:** Parent-level *(recommended)*

Choose which hierarchical level of blocks to use:
- **Top-level** - Maximum creativity (scene, composition, lighting)
- **Parent-level** - Balanced structure (scene.subjects.details, composition.shot.type) *← Recommended for comics*
- **Deep/Hierarchical** - Maximum structure (scene.subjects.details.hair, scene.subjects.details.outfit, etc.)

**Block Detail Level:** Medium *(recommended)*

Choose how much detail to include in block values:
- **Low** - Minimal description (essential info only)
- **Medium** - Moderate description (balanced detail) *← Recommended for comics*
- **High** - Rich description (comprehensive detail)

---

### Part 4: Generate Prompts (4-Step Process)

For each page, follow these steps:

#### **Step 1: Choose Blocks**

**Input:** Step 2 panel moments
**Source:** Block library (`prompt-blocks.json`)
**Think like a director of photography:** "How do I visually capture this moment?" Choose blocks that serve the visual needs.

**Core blocks (required every panel):**
- `scene.subjects.details` - Character/subject appearance
- `scene.subjects.actionAndPosture.action` - What subjects are doing
- `composition.shot.type` - Shot framing
- `composition.shot.angle` - Camera angle
- `lighting.lightType` - Lighting

**Variable blocks (add as needed):**
- `scene.subjects.actionAndPosture.expression` - Facial expressions
- `scene.subjects.actionAndPosture.bodyPose` - Body positioning
- `scene.environment.setting` - Location/environment
- `scene.environment.locationDetails` - Environment specifics
- `scene.environment.background` - Background elements
- `composition.framing.arrangement` - Positioning in frame
- *(Reference full library for additional blocks)*

---

#### **Step 2: Fill Block Values**

Fill chosen blocks with camera-visible descriptions. Respect the Block Detail Level setting.

**Rules:**
- ✅ Use only camera-visible descriptions ("sneering face, furrowed brow")
- ❌ Not interpretive language ("intimidating expression")
- **Copy exact character descriptions from Part 1 in every panel** - Do not paraphrase, shorten, or modify. Use the complete description every time.
- Include historical context for biblical stories ("ancient")

**Example (Parent-level blocks, Medium detail):**
```
[scene.subjects.details] = Young boy with dark curly hair in simple tunic
[scene.subjects.actionAndPosture.action] = walking forward carrying basket
[scene.environment.setting] = military camp with tents
[composition.shot.type] = medium shot
[composition.shot.angle] = slightly elevated
[lighting.lightType] = natural daylight
```

---

#### **Step 3: Assemble Blocks**

**If using Deep blocks:** First assemble sub-blocks into parent blocks, then assemble parents into final prompt.

**If using Parent-level or Top-level:** Assemble blocks directly into final prompt.

**Assembly rules:**
- Combine related blocks into cohesive descriptions (don't list separately)
- Use natural flowing language (not a checklist)
- Follow block order: subjects → action → environment → composition
- Prioritize important elements early

---

#### **Step 4: Output Final Prompt**

Combine all assembled blocks into complete prompt following this structure:

```
Modality: text-to-image

[Page-level info: panel count, layout, style]

PANEL 1 (position): [Assembled description from blocks]

PANEL 2 (position): [Assembled description from blocks]

PANEL 3 (position): [Assembled description from blocks]
```

**Dialogue integration:**
- Format: "[Character on position] [action] [to character on position]: 'dialogue'"
- Example: "Warrior on left shouting to soldiers on right: 'Send me a champion!'"

---

### Part 5: Core Prompting Rules

Follow these rules when generating prompts:

**1. Use only camera-visible descriptions**
- ✅ "sneering face, furrowed brow"
- ❌ "intimidating expression"
- ✅ "walking forward with head down"
- ❌ "sad mood"

**2. Choose blocks only from the library**
- Reference `prompt-blocks.json` for available blocks
- Do not invent new block paths
- If needed block doesn't exist, use closest available block

**3. Repeat exact character descriptions in every panel**
- Define characters once at start in Part 1
- Copy the complete description from Part 1 in every panel - do not paraphrase, shorten, or modify
- Use identical physical descriptions across all panels
- Example: "Young boy with dark curly hair in simple tunic" (same every time)

**4. Specify spatial positioning for dialogue**
- Always state speaker position: "on left", "on right", "in center"
- State listener position: "to soldiers on right"
- Format: "[Character on position] [action] [to character on position]: 'dialogue'"
- Example: "Massive warrior on left shouting to soldiers on right: 'Send me a champion!'"

**5. Keep panels simple (3-5 core elements maximum)**
- Subject + action + environment + composition + lighting
- Don't overload with too many details
- Simplify atmospheric elements

**6. Assemble blocks into natural flowing language**
- Don't list block values separately
- Combine related blocks into cohesive descriptions
- Final prompt should read like natural prose, not a checklist

**7. Include historical context for biblical stories**
- Specify era: "ancient"
- Architecture: "stone buildings", "tents"
- Avoid modern anachronisms

**8. Block order in final prompt**
- Subject details first (who)
- Action/pose next (what they're doing)
- Environment (where)
- Composition/technical last (how it's shot)
- Prioritize important elements early

---

### Part 6: Available Blocks Reference

**Core blocks (required every panel):**
- `scene.subjects.details` - Character/subject appearance
- `scene.subjects.actionAndPosture.action` - What subjects are doing
- `composition.shot.type` - Shot framing (wide, medium, close-up, etc.)
- `composition.shot.angle` - Camera angle (eye level, low angle, elevated, etc.)
- `lighting.lightType` - Type of lighting

**Variable blocks (add as needed based on panel moment):**

Reference `_docs/2_reference-docs/prompt-blocks.json` for the complete block library.

**Common variable blocks for comic pages:**
- `scene.subjects.actionAndPosture.expression` - Facial expressions
- `scene.subjects.actionAndPosture.bodyPose` - Body positioning
- `scene.subjects.details.bodyType` - Physical build
- `scene.subjects.motion.*` - Movement details
- `scene.environment.setting` - Location/environment
- `scene.environment.locationDetails` - Environment specifics
- `scene.environment.background` - Background elements
- `scene.environment.props` - Objects in scene
- `composition.framing.*` - Framing arrangement
- `lighting.lightQuality` - Quality of light

Choose blocks that serve the visual needs of each panel moment.

---

### Part 7: Examples

[Examples to be added - decision pending]

---
## Step 4: Thumbnail Generation (Optional)

Create a cover/thumbnail image for the story (used in app grid view).

**Purpose:** Thumbnail appears in grid layout in app, user taps to open story.

**Requirements:**
- Portrait orientation (same aspect ratio as comic pages - 3:4)
- Composite scene representing the story
- Title text on image (story name)
- Same children's book illustration style

**Prompt Structure:**
```
A vertical portrait comic book cover, children's book illustration style
with bold ink lines and flat colors, vibrant and dramatic.

[Composite scene description featuring main characters/key moment]

Bold text at top: "[STORY TITLE]" in thick blocky sans-serif font,
white letters with heavy black outline stroke, comic book title style,
all caps.

Epic, storybook cover aesthetic.
```

**Example (David and Goliath):**
```
A vertical portrait comic book cover, children's book illustration style
with bold ink lines and flat colors, vibrant and dramatic.

Composite scene showing young shepherd boy David in the foreground holding
a sling, looking up with set jaw and focused eyes. Behind him,
massive armored warrior Goliath looms large with bronze helmet and spear.
Rocky valley landscape in background with two armies on hillsides.

Bold text at top: "DAVID AND GOLIATH" in thick blocky sans-serif font,
white letters with heavy black outline stroke, comic book title style,
all caps, "AND" should be smaller between the names.

Epic, storybook cover aesthetic.
```

**Best Practices:**
- Feature main characters in composition
- Show key story moment or dramatic contrast
- Clear visual hierarchy (characters → background)
- Title text should be highly legible

**⚠️ Known Challenge: Font Consistency**
- AI-generated text styling can vary between generations
- Font style may not be 100% consistent across all thumbnails
- **Solutions if needed:**
  - More specific font styling in prompts
  - Generate thumbnails without text + programmatic text overlay (Python/PIL, ImageMagick, Node.js)
  - Manual text overlay in post-production for critical consistency

## Post-Generation Cleanup

After generating and saving all images, complete these final organization tasks.

---

### 1. Create story-data.json

Extract narration from Step 2 page sections and create metadata file.

**Location:** `output/comic-books/XX-story-name/story-data.json`

**Structure:**
```json
{
  "storyId": "story-name",
  "title": "Story Title",
  "thumbnailFile": "thumbnail.png",
  "totalPages": 4,
  "pages": [
    {
      "pageNumber": 1,
      "imageFile": "page1.png",
      "narration": "Text from Step 2 PAGE 1 narration"
    },
    {
      "pageNumber": 2,
      "imageFile": "page2.png",
      "narration": "Text from Step 2 PAGE 2 narration"
    }
  ]
}
```

**Note:** Narration text comes from Step 2 page narrations and is used for app UI overlay below comic images.

---

### 2. Update stories-index.md

Update the story registry with minimal changes (numbers only).

**Location:** `_templates/comic-books/stories/stories-index.md`

**Tasks:**
- Increment total story count
- Add new row to registry table
- Update summary statistics (increment scripted, generated counts)
- Update collection counts if needed
- Update last modified date

**Important:** Keep changes minimal - only update numbers, don't repeat story names in parentheses.

---

### 3. Update story-backlog.md

Mark the story as complete in the backlog.

**Location:** `_templates/comic-books/stories/story-backlog.md`

**Task:**
- Find story entry in backlog
- Update status: `✅ (Story #XX - Complete & Generated)`
- Update last modified date

---

### 4. Update Story File (Optional)

Add generation results to the story .md file if needed.

**Location:** `_templates/comic-books/stories/XX-story-name.md`

**Updates:**
- Generation results table (success rates, notes)
- Quality observations
- Issues encountered
- Mark status as "Complete" and "Generated: Yes"

---

## File Naming Conventions

**Story files:**
- Format: `XX-story-name.md` (two-digit number)
- Example: `05-moses-red-sea.md`
- Location: `_templates/comic-books/stories/`

**Output folders:**
- Format: `XX-story-name/`
- Example: `05-moses-red-sea/`
- Location: `output/comic-books/`

**Output folder structure:**
```
output/comic-books/XX-story-name/
├── page1.png
├── page2.png
├── page3.png
├── page4.png
├── thumbnail.png (optional)
└── story-data.json
```

**Image files:**
- Pages: `page1.png`, `page2.png`, `page3.png`, `page4.png`
- Thumbnail: `thumbnail.png` (optional cover image)
- Variants: `page1-v2.png`, `page1-test.png` (if testing multiple versions)

---

## Reference Files

**Core Workflow:**
1. **`_templates/comic-books/comic-books_template_v3.1.md`** (this file)

**Story Management:**
2. **`_templates/comic-books/stories/stories-index.md`**
3. **`_templates/comic-books/stories/story-backlog.md`**

---

**Template Version:** v3.1
**Last Updated:** 2025-01-17
**Approach:** Option 1B - Examples + Minimal Rules (self-contained, pattern-matching)



