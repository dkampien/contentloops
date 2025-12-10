# Comic Book Bible Stories - Template

**Purpose:** Generate Bible stories as comic book pages for SoulStream in-app content
**Format:** Aspect ratio of 3:4 - displays in 9:16 screen with app UI narration
**Modality:** text-to-image
**Audio:** TBD (for future video ad format)

---

## Hybrid Approach: Generated Images + App UI Text

**Content Split:**

**In Generated Images (AI):**
- Comic page visuals (panels, characters, scenes, composition)
- Dialogue only (speech bubbles)
- Minimal text load (2-3 speech bubbles per page)

**In App UI (Text overlay):**
- Page-specific narration text (extracted from Step 1 [PAGE] sections)
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


## Production Workflow (Page-First Approach)

### Workflow Overview

The comic creation process follows these phases:

**1. STORY SELECTION**
- Choose next story from backlog or define new story
- Confirm story and collection (Main Series, Christmas, etc.)

**2. SETUP (Minimal)**
- Create output folder: `output/comic-books/XX-story-name/`
- Nothing else - keep setup lean

**3. STORY CREATION (Steps 1-5)**
- Step 1: Story Narrative (150 words with [PAGE] sections)
- Step 2: Page & Panel Planning
- Step 3: Panel Story Development
- Step 4: Prompt Generation
- Step 5: Thumbnail Prompt (optional)
- Create story .md file in `_templates/comic-books/stories/`

**4. GENERATION**
- Generate images using prompts
- Save to output folder (page1.png, page2.png, etc.)

**5. POST-GENERATION CLEANUP**
- Create story-data.json (extract narration from Step 1)
- Update stories-index.md (increment numbers only)
- Update story-backlog.md (mark story complete)
- Update story .md file with generation results (optional)

**Note:** Default to full story creation (Steps 1-5 all at once) for Main Series. Use page-by-page approach for experimental/complex stories. **(TBD - pending workflow testing)**

---

### Key Definitions

**Panel:** A single compartment/frame within a comic page (shows one story beat/scene)
**Page:** One comic book page = one image generation (contains 1-4 panels showing multiple scenes)
**Story:** The complete narrative (may span multiple pages)
**Grid Layout:** Predefined panel arrangement

---

### Step 1: Story Narrative

Write the complete Bible story in prose format (~150 words), structured into page sections.

**Reference the story backlog entry** (`stories/story-backlog.md`) for scope guidance - it lists key moments to include.

**Important:**
- Structure the narrative into sections matching your planned page count. Each section becomes the narration for that page in the app UI.
- If the story is part of a larger biblical narrative, ensure this episode has a complete arc (setup, conflict, resolution) even though it's one chapter of a bigger story.

**Example (4-page story):**
```
[PAGE 1]
The Israelite army faced the Philistines across the valley. Every day,
the giant warrior Goliath challenged Israel to send a champion to fight
him. For forty days, no one dared to face him. Young David, a shepherd
boy, arrived at the camp bringing food to his brothers.

[PAGE 2]
When he heard Goliath's mocking challenge, David volunteered to fight.
King Saul offered David his armor, but it was too heavy. David refused
it and went to the stream, choosing five smooth stones for his sling.

[PAGE 3]
Standing before the giant, Goliath laughed at the boy. But David
proclaimed he came in the name of the Lord. David slung a stone with
all his might.

[PAGE 4]
The stone struck Goliath's forehead. The giant fell. David had defeated
Goliath with faith and a single stone.
```

**Tips:**
- Keep to 150 words total for consistency
- Decide how many pages (typically 4 pages for standard stories)
- Structure narrative into [PAGE X] sections - one section per page
- Each section becomes the app UI narration for that page (~30-40 words per section)
- Include key story beats and emotional moments
- Focus on the dramatic arc

---

### Step 2: Page & Panel Planning

Break down each page into specific panel moments. Reference Step 1 narrative to identify key moments.

**For each page, specify:**
1. Grid layout (A/B/C/D)
2. Panel-by-panel moment breakdown - what specific action/dialogue happens in each panel

**Grid Layouts (Predefined):**
- **Layout A:** Single panel (fullscreen splash page)
- **Layout B:** 2 panels vertical (50/50 split)
- **Layout C:** 3 panels vertical (33/33/33 split)
- **Layout D:** 4 panels grid (2x2)

**Example:**
```
PAGE 1: SETUP
Grid Layout: Layout C (3 panels vertical)

Panel 1: Two armies face each other across valley, tense standoff atmosphere
Panel 2: Giant warrior Goliath challenges the Israelites to send a champion
Panel 3: Young shepherd boy David arrives at camp bringing food to his brothers

PAGE 2: PREPARATION
Grid Layout: Layout C (3 panels vertical)

Panel 1: David hears Goliath's challenge and volunteers to fight
Panel 2: King Saul offers David his armor, but David refuses it as too heavy
Panel 3: David goes to stream and selects five smooth stones for his sling
[...]
```

**Best practices:**
- Each panel = one clear moment/action
- Sequence panels to create narrative flow
- Use 3-panel pages (Layout C) for standard pacing
- Save 1-panel pages (Layout A) for dramatic moments
- Ensure each panel moment is distinct (avoid redundancy)

---

### Step 3: Panel Story Development

Develop the narrative and context for each panel. This step provides interpretive context that will guide block selection in Step 4.

**Use interpretive language here** - describe emotions, motivations, atmosphere, and story context. This is planning language for choosing blocks, not camera-ready descriptions.

**For each panel, specify:**
- **SCENE:** What's happening narratively - emotions, atmosphere, story context
- **DIALOGUE:** Speech in bubbles (will be included in generated image)

**Note on narration:** Page narration comes directly from Step 1 page sections (already written). No need to duplicate it here.

**Example:**
```
PAGE 1 - SETUP
Grid Layout: Layout C (3 panels vertical)
Page Narration: [Use PAGE 1 section from Step 1]

PANEL 1 (top third)
- SCENE: Two opposing armies in tense standoff across valley.
  Atmosphere is anxious, uncertain. Ancient battlefield setting with
  military camps. Sense of scale and conflict.
- DIALOGUE: None

PANEL 2 (middle third)
- SCENE: Imposing, intimidating warrior issuing challenge. He's
  confident, mocking. The setting reinforces his dominance - he towers
  over the scene. Ancient armor and weapons.
- DIALOGUE: Goliath: "Send me a champion to fight!"

PANEL 3 (bottom third)
- SCENE: Young shepherd boy arriving at military camp, unexpected
  presence. Contrast between innocent youth and war context. He's
  bringing supplies, unaware of the larger conflict.
- DIALOGUE: None
```

**Best practices:**
- Focus on emotions, atmosphere, and narrative intent
- Describe character roles and emotional states, not specific visual features
- Include historical/cultural context (ancient Egypt, Biblical era, etc.)
- Note the mood and feeling you want to convey
- **Page narration** comes from Step 1 sections (goes to app UI)
- **DIALOGUE goes to image** - only dialogue included in Step 4 prompts
- **Step 4 will translate this interpretive context into camera-visible details and blocks**

---

### Step 4: Prompt Generation

Translate interpretive context from Step 3 into camera-visible descriptions using the block-based formula system.

Image models only understand what a camera could capture. Translate interpretive context into camera-visible elements.

**Approach:** Think like a director of photography - how would you visually capture this scene? Use that thinking to choose and fill blocks from the library.

**Reference docs:** `prompt-blocks.json` (block library - check first for available blocks), `prompt-formula-framework-v2.md`, `prompt-generation-guide-v5.md`

---

**Standard Formula for Comic Book Pages**

This fixed formula covers most comic pages. Add blocks as needed if your scene requires additional elements (flag as NEW).

**Page-level blocks (apply once):**
- [medium.type]
- [layout.panelCount]
- [layout.panelArrangement]
- [comicStyle.artStyle]
- [comicStyle.inkStyle]
- [comicStyle.colorTreatment]
- [style.imageStyle]

**Panel-level blocks (per panel):**
- [scene.subjects.details]
- [scene.subjects.action]
- [scene.environment.setting]
- [composition.shot.type]
- [composition.shot.angle]
- [lighting.type]
- [textIntegration.dialogue]

**How to use the standard formula:**
- Use these blocks as a starting point - add or skip based on scene needs
- Fill block values from Step 3 interpretive context (library provides structure, you provide values)
- Flag any new blocks not in library as (NEW)
- Always use "Output Detailed with Sub-blocks" format

---

**Complete Example (Output Detailed with Sub-blocks format)**

**Step 3 interpretive input (Panel 1):**
"Two opposing armies in tense standoff across valley. Atmosphere is anxious, uncertain. Ancient battlefield setting with military camps. Sense of scale and conflict."

**Step 4 blocks → prompt:**

```
Modality: text-to-image
Formula: [medium.type] [layout.panelCount] [layout.panelArrangement] [comicStyle.artStyle] [comicStyle.inkStyle] [comicStyle.colorTreatment] [style.imageStyle] + per-panel blocks

Page-level blocks:

[medium.type] = comic book page
[layout.panelCount] = 3 panels
[layout.panelArrangement] = vertical strip layout
[comicStyle.artStyle] = children's book illustration
[comicStyle.inkStyle] = bold ink lines
[comicStyle.colorTreatment] = flat colors
[style.imageStyle] = vibrant, accessible

PANEL 1 (top):

[scene.subjects.details] = Two armies
  [scene.subjects.count] = multiple groups
  [scene.subjects.type] = soldiers
[scene.subjects.action] = facing each other in standoff
  [scene.subjects.motion] = static, tense positioning
[scene.environment.setting] = wide valley battlefield with military camps
  [scene.environment.location] = valley
  [scene.environment.details] = Israelite tents on one side, Philistine tents on other, rocky terrain, sparse vegetation, sheep grazing
  [scene.environment.era] = ancient
[composition.shot.type] = wide establishing shot
  [composition.framing] = showing both sides with space between
[composition.shot.angle] = eye level
[lighting.type] = natural daylight
  [lighting.quality] = clear, bright
[textIntegration.dialogue] = None

PANEL 2 (middle):

[scene.subjects.details] = Massive armored warrior
  [scene.subjects.physical] = imposing, large stature
  [scene.subjects.outfit] = bronze helmet with plume, armor, holding large spear
[scene.subjects.action] = issuing challenge, mocking
  [scene.subjects.expression] = confident, intimidating
[scene.environment.setting] = battlefield with valley and soldiers in background
  [scene.environment.era] = ancient
[composition.shot.type] = medium shot focused on warrior
[composition.shot.angle] = low angle looking up
  (emphasizes dominance and size)
[lighting.type] = natural daylight
[textIntegration.dialogue] = Massive warrior on left shouting to soldiers on right: "Send me a champion to fight!"

PANEL 3 (bottom):

[scene.subjects.details] = Young shepherd boy
  [scene.subjects.age] = youth
  [scene.subjects.outfit] = shepherd tunic, carrying basket
[scene.subjects.action] = walking into military camp
  [scene.subjects.demeanor] = innocent, bringing supplies
[scene.environment.setting] = military camp
  [scene.environment.era] = ancient
[composition.shot.type] = medium shot
[composition.shot.angle] = slightly elevated angle
[lighting.type] = natural daylight
[textIntegration.dialogue] = None

Prompt: "A 3-panel comic book page, vertical strip layout, children's book illustration style with bold ink lines and flat colors, vibrant and accessible.

PANEL 1 (top): Two armies facing each other across a wide valley. Israelite tents on one side, Philistine tents on the other, rocky terrain with sparse vegetation and sheep grazing. Wide establishing shot from eye level showing both sides with space between them.

PANEL 2 (middle): Massive armored warrior with bronze helmet and plume, holding large spear. Valley and soldiers in background. Low angle shot looking up. Massive warrior on left shouting to soldiers on right: 'Send me a champion to fight!'

PANEL 3 (bottom): Young shepherd boy in shepherd tunic carrying basket, walking into military camp. Medium shot from slightly elevated angle."
```

**Note on detail level:** Block values shown here are medium detail. Values can be more concise or more enriched based on testing results. See Prompt Generation Guide v5, section 6 (Detail Levels) for guidance on adjusting detail.

---

**Text Integration (Dialogue Only)**

**Speech Bubbles:**
- Format: `[Character on position] [action] [to character on position]: "dialogue text"`
- Example: `Massive warrior on left shouting to soldiers on right: "Send me a champion!"`
- Purpose: Character dialogue, exclamations
- Spatial positioning (left/right/center) is critical for bubble pointer direction
- Minimal text load (2-3 bubbles per page maximum)

**Important:**
- ONLY include dialogue in prompts (speech bubbles)
- Do NOT include narration in prompts (narration becomes app UI text)
- Always specify spatial positions for speaker and listener (left/right/center)
- Describe dialogue as directional action ("shouting to," "calling to," "asking")

---

**App UI Text (extracted from Step 1 narration):**
```
The Israelite army faced the Philistines across the valley. Every day,
the giant warrior Goliath challenged Israel to send a champion. Young
David, a shepherd boy, arrived bringing food to his brothers.
```

---

### Step 5: Thumbnail Generation

Create a cover/thumbnail image for the story (used in app grid view).

**Purpose:** Thumbnail appears in 2x2 grid layout in app, user taps to open story.

**Requirements:**
- Portrait orientation (same aspect ratio as comic pages)
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

**⚠️ Known Challenge: Font Consistency**
- AI-generated text styling can vary between generations
- Font style may not be 100% consistent across all thumbnails
- **Solutions if needed:**
  - More specific font styling in prompts
  - Generate thumbnails without text + programmatic text overlay (Python/PIL, ImageMagick, Node.js)
  - Manual text overlay in post-production for critical consistency

**Best Practices:**
- Feature main characters in composition
- Show key story moment or dramatic contrast
- Clear visual hierarchy (characters → background)
- Title text should be highly legible
- Test text generation quality before bulk generation

---

### Post-Generation Cleanup

After generating and saving all images, complete these final organization tasks.

**Performed after Phase 4 (Generation) is complete.**

---

#### 1. Create story-data.json

Extract narration from Step 1 [PAGE] sections and create metadata file.

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
      "narration": "Text from Step 1 [PAGE 1] section"
    },
    {
      "pageNumber": 2,
      "imageFile": "page2.png",
      "narration": "Text from Step 1 [PAGE 2] section"
    }
  ]
}
```

**Note:** Narration text comes directly from Step 1 page sections and is used for app UI overlay below comic images.

---

#### 2. Update stories-index.md

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

#### 3. Update story-backlog.md

Mark the story as complete in the backlog.

**Location:** `_templates/comic-books/stories/story-backlog.md`

**Task:**
- Find story entry in backlog
- Update status: `✅ (Story #XX - Complete & Generated)`
- Update last modified date

---

#### 4. Update Story File (Optional)

Add generation results to the story .md file if needed.

**Location:** `_templates/comic-books/stories/XX-story-name.md`

**Updates:**
- Generation results table (success rates, notes)
- Quality observations
- Issues encountered
- Mark status as "Complete" and "Generated: Yes"

---

### File Naming Conventions

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

## Best Practices (From Testing)

### ✅ What Works

- **Describe characters visually** - Appearance, clothing, size (not names)
- **Specify panel layout clearly** - "3-panel vertical strip"
- **Use concrete visual details** - Colors, textures, specific objects
- **Medium detail level** - Not too sparse, not overwhelming
- **Natural language flow** - Prompts should read naturally
- **Directional dialogue with spatial positioning** - Describe speech as action with direction AND specify left/right positions (see Speech Bubbles below)
- **Character specificity** - "three adult sons" not vague "family members"
- **Simplified panels** - 3-5 core elements per panel maximum
- **Consistent character descriptions** - Define character appearance once, use exact same description in every panel (see Character Consistency below)

### ❌ What Doesn't Work

- **Character names** - Don't assume models know "David" or "Goliath"
- **Cultural/historical assumptions** - Describe everything visually
- **Redundant instructions** - Panel borders handle themselves
- **Overly complex prompts** - Keep descriptions clear and direct
- **Too many text elements** - Avoid 5+ text elements per page (stick to 2-3 dialogue bubbles max)
- **Too many elements per panel** - More than 5 elements overwhelms the model (see Panel Complexity below)
- **Vague character references** - "family member" generates random gender/age
- **Location inconsistency** - Ark shouldn't teleport from town to hill between pages
- **Missing historical context** - Biblical stories need "ancient" context or models default to modern (see Historical Setting below)

### ⚠️ Known Challenges

**Style Consistency Across Pages:**
- Each page = independent generation
- Models don't "remember" previous pages
- Style can drift (colors, line work)
- **Solution:** Use style reference image for all pages

**Retry Requirements:**
- Some models need 2-4 retries on complex pages
- Test prompts before bulk generation
- Keep successful generations as references

**Speech Bubble Pointer Direction:**
- Models cannot reliably point speech bubbles to correct speaker
- **Problem:** "Speech bubble from character: 'text'" → points to wrong character
- **Solution:** Describe dialogue as directional action WITH spatial positioning:
  - ✅ `Bearded man on the right shouting to sailors on the left: "Throw me into the sea!"`
  - ⚠️ `Bearded man telling sailors: "Throw me into the sea!"` (better but can still fail)
  - ❌ `Speech bubble from bearded man: "Throw me into the sea!"` (points randomly)
- The model infers speech bubbles from "comic book page" context
- Direction is established through the action itself ("shouting at")
- **Spatial positioning is critical:** Explicitly state "on the right," "on the left," "in center" to separate speaker from listeners
- **Example with positioning:**
  ```
  Man on the left with staff, people on the right looking worried.
  People on the right crying out to man on the left: "We're trapped!"
  ```
- This forces clear spatial separation and improves bubble pointer accuracy

**Panel Complexity and Generation Failures:**
- Too many elements in a single panel → model fails to generate correctly
- **Problem:** 7+ elements (characters + objects + weather + lighting details + atmospheric effects)
- **Rule:** Keep panels to 3-5 core elements maximum
- **Examples of element overload:**
  - ❌ "Rain + storm clouds + puddles + muddy ground + person + ark + doorway + dramatic lighting" (8 elements)
  - ✅ "Heavy rain. Noah entering ark doorway. Dark storm clouds above." (3 elements)
- Simplify atmospheric details (pick ONE: rain OR clouds, not both with effects)
- Reduce redundant descriptions ("dramatic," "powerful," "imposing" are often redundant)

**Location and Scene Continuity:**
- Objects/settings shouldn't teleport between pages
- **Problem:** Ark in town (Page 1) → Ark on hill (Page 2) → Inconsistent!
- **Solution:** Establish consistent location in Page 1, maintain through pages 1-2
- **Example:** Pages 1-2 both show ark in "open countryside," then ark floats (Page 3), lands on mountain (Page 4)
- Review background descriptions across sequential pages before generation

**Character Appearance Consistency:**
- Models don't "remember" character appearance between panels
- **Problem:** Vague descriptions = different-looking person each panel
- **Solution:** Define character appearance once, copy-paste EXACT same description in every panel
  ```
  Define: Main character = "bearded man with dark hair in white robes with brown vest"
  Use everywhere: "Bearded man with dark hair in white robes with brown vest [action]"
  ```
- Include hair, facial features, and clothing details (10-15 words)
- Apply to all recurring characters in the story

**Historical Setting:**
- Models default to modern settings without historical context
- **Problem:** "tower and city" → generates modern skyscrapers
- **Solution:** Always specify historical period for Biblical stories
- **Include in prompts:**
  - Time period markers: "ancient," "Biblical era"
  - Architecture: "stone and mud brick buildings," "ancient brick tower"
  - Clothing: "ancient robes," "simple tunics"
  - Objects: "wooden tools," "clay pots," "oil lamps"
- **Examples:**
  - ❌ "tower in city" → modern city
  - ✅ "ancient brick tower with stone and mud brick buildings, people in ancient robes"
- Apply to all Biblical story prompts to prevent anachronisms

---

## Production Economics

### Cost Analysis (30 Stories)

**Image Generation (seedream-4):**
- Cost per image: $0.03
- Images per story: 5 (4 pages + 1 thumbnail)
- Total images (30 stories): 150 images
- **Image generation cost:** 150 × $0.03 = **$4.50**

**LLM (Claude for planning & prompting):**
- Output tokens per story: ~4,000 tokens
- Total tokens (30 stories): 120,000 tokens
- Output token cost: $15 per million tokens
- **LLM cost:** (120,000 / 1,000,000) × $15 = **$1.80**

**Total Production Cost:**
- **$6.30 for all 30 stories**
- **$0.21 per story** ($0.15 images + $0.06 LLM)

### Generation Time (30 Stories)

**Image Generation:**
- Generation time per image: ~15 seconds
- Total images: 150
- **Total time:** 150 × 15 seconds = **~37.5 minutes**

**LLM Generation:**
- Planning, scripting, and prompting: Nearly instant (seconds per story)

**Total Generation Time:** **~40 minutes for all 30 stories**

**Note:** These are generation costs only. Does not include human review, quality control, or manual adjustments.

---

## Reference Files

This template is part of a complete workflow system. The following files are required to generate proper prompts:

**Core Workflow:**
1. **`_templates/comic-books/comic-books_template.md`** (this file)

**Prompting Methodology:**
2. **`_docs/2_reference-docs/prompt-generation-guide-v5.md`**
3. **`_docs/2_reference-docs/prompt-formula-framework-v2.md`**
4. **`_docs/2_reference-docs/prompt-blocks.json`**

**Story Management:**
6. **`_templates/comic-books/stories/stories-index.md`**
7. **`_templates/comic-books/stories/story-backlog.md`**

These 7 files provide everything needed to understand the workflow, apply the prompting methodology, and generate properly structured stories.
