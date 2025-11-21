# Comic Book Bible Stories - Template v3

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

## Production Workflow

The comic creation process follows these phases:

**1. STORY SELECTION (Step 0)**
- Choose next story from backlog

**2. SETUP (Minimal)**
- Create output folder: `output/comic-books/XX-story-name/`

**3. STORY CREATION (Steps 1-4)**
- Step 1: Story Narrative (150 words with [PAGE] sections)
- Step 2: Page & Panel Planning (with character definitions)
- Step 3: Prompt Generation
- Step 4: Thumbnail Prompt (optional)
- Create story .md file in `_templates/comic-books/stories/`

**4. GENERATION**
- Generate images using prompts
- Save to output folder (page1.png, page2.png, etc.)

**5. POST-GENERATION CLEANUP**
- Create story-data.json (extract narration from Step 1)
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

**Process:**
1. Define characters once (upfront)
2. Define story-wide style blocks once (upfront)
3. For each page: generate prompts using blocks from library

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

### Part 3: Generate Prompts Per Page

Use blocks from the library to build prompts. Follow these examples:

---

#### Example 1: PAGE 1 (Establishing Shot)

**Step 2 Input:**
```
PAGE 1: SETUP
Narration: "The Israelite army faced the Philistines across the valley. Every day,
the giant warrior Goliath challenged Israel to send a champion. Young David, a
shepherd boy, arrived bringing food to his brothers."

Grid Layout: Layout C (3 panels vertical)

Panel 1: Two armies face each other across valley, tense standoff atmosphere
Panel 2: Goliath challenges the Israelites to send a champion
Panel 3: David arrives at camp bringing food to his brothers
```

**Page-level blocks (from Step 2):**
```
[layout.panelCount] = 3 panels
[layout.panelArrangement] = vertical strip layout
```

---

**PANEL 1 (top third)**

Panel moment: "Two armies face each other across valley, tense standoff atmosphere"

Visual thinking: "Establishing shot showing both armies and the valley. Wide shot to show scope. Eye level to show both sides equally."

Blocks chosen from library:
```
[scene.subjects.details.overallSubjectFeatures] = Two groups of soldiers in armor
[scene.subjects.actionAndPosture.action] = standing in formation facing each other
[scene.environment.setting] = wide valley with rocky terrain
[scene.environment.locationDetails] = tents and military camps on opposite hillsides, sparse vegetation, sheep grazing
[composition.shot.type] = wide establishing shot
[composition.shot.angle] = eye level
[composition.framing.arrangement] = both armies visible with valley space between them
[lighting.lightType] = natural daylight
[lighting.lightQuality] = bright, clear
```

---

**PANEL 2 (middle third)**

Panel moment: "Goliath challenges the Israelites to send a champion"

Visual thinking: "Introduce Goliath. Low angle makes him look larger and more imposing. Medium shot focuses on him while keeping context."

Blocks chosen from library:
```
[scene.subjects.details.overallSubjectFeatures] = Massive armored warrior with bronze helmet and plume, holding large spear
[scene.subjects.details.bodyType] = tall, broad-shouldered, muscular build
[scene.subjects.actionAndPosture.action] = raising spear overhead, mouth open shouting
[scene.subjects.actionAndPosture.expression] = sneering face, furrowed brow
[scene.subjects.actionAndPosture.bodyPose] = chest out, shoulders back, standing tall
[scene.environment.background] = valley with distant soldiers
[composition.shot.type] = medium shot
[composition.shot.angle] = low angle looking up
[lighting.lightType] = natural daylight
```

---

**PANEL 3 (bottom third)**

Panel moment: "David arrives at camp bringing food to his brothers"

Visual thinking: "Introduce David - contrast to Goliath's size. Medium shot, slightly elevated angle."

Blocks chosen from library:
```
[scene.subjects.details.ageGroup] = young boy
[scene.subjects.details.hair] = dark curly hair
[scene.subjects.details.outfit.v1] = simple earth-tone tunic
[scene.subjects.actionAndPosture.action] = walking forward carrying woven basket
[scene.subjects.actionAndPosture.expression] = soft eyes, gentle smile
[scene.environment.setting] = military camp with tents
[composition.shot.type] = medium shot
[composition.shot.angle] = slightly elevated
[lighting.lightType] = natural daylight
```

---

**Final Assembled Prompt:**
```
Modality: text-to-image

A 3-panel comic book page, vertical strip layout, children's book illustration style
with bold ink lines and flat colors, vibrant and accessible.

PANEL 1 (top): Two groups of soldiers in armor standing in formation facing each
other across a wide valley with rocky terrain. Tents and military camps on opposite
hillsides, sparse vegetation, sheep grazing. Wide establishing shot from eye level
showing both armies with valley space between them. Bright, clear natural daylight.

PANEL 2 (middle): Massive armored warrior with bronze helmet and plume holding large
spear. Tall, broad-shouldered, muscular build, chest out and shoulders back. Raising
spear overhead with mouth open shouting, sneering face and furrowed brow. Valley with
distant soldiers in background. Medium shot from low angle looking up. Massive warrior
on left shouting to soldiers on right: 'Send me a champion to fight!'

PANEL 3 (bottom): Young boy with dark curly hair in simple earth-tone tunic, walking
forward carrying woven basket. Soft eyes, gentle smile. Military camp with tents.
Medium shot from slightly elevated angle. Natural daylight.
```

#### Example 2: PAGE 3 (Character Focus/Dialogue)

**Step 2 Input:**
```
PAGE 3: CONFRONTATION
Narration: "Standing before the giant, Goliath laughed at the boy. But David
proclaimed he came in the name of the Lord. David slung a stone with all his might."

Grid Layout: Layout C (3 panels vertical)

Panel 1: Goliath and David face each other, size contrast dramatic
Panel 2: David proclaims he comes in the name of the Lord
Panel 3: David releases stone from sling toward Goliath
```

**Page-level blocks (from Step 2):**
```
[layout.panelCount] = 3 panels
[layout.panelArrangement] = vertical strip layout
```

---

**PANEL 1 (top third)**

Panel moment: "Goliath and David face each other, size contrast dramatic"

Visual thinking: "Show size contrast between them. Medium-wide shot to fit both in frame. Eye level between them (camera at David's height makes Goliath tower). Need both characters clearly visible."

Blocks chosen from library:
```
[scene.subjects.details.overallSubjectFeatures] = Massive armored warrior with bronze helmet and plume facing young boy with dark curly hair in simple tunic
[scene.subjects.details.bodyType] = warrior: tall, broad, muscular / boy: small, slender
[scene.subjects.actionAndPosture.action] = standing facing each other
[scene.subjects.actionAndPosture.bodyPose] = warrior: standing tall, arms crossed / boy: feet planted, chin up
[scene.subjects.actionAndPosture.expression] = warrior: head thrown back laughing, mouth wide open / boy: set jaw, focused eyes
[scene.environment.setting] = open battlefield
[composition.shot.type] = medium-wide shot
[composition.shot.angle] = eye level
[composition.framing.arrangement] = both subjects in frame, Goliath on left, David on right
[lighting.lightType] = natural daylight
```

---

**PANEL 2 (middle third)**

Panel moment: "David proclaims he comes in the name of the Lord"

Visual thinking: "Focus on David speaking. Medium-close shot on David to show his expression and conviction. Slight low angle to show his courage despite his size. Goliath visible in background for context."

Blocks chosen from library:
```
[scene.subjects.details.overallSubjectFeatures] = Young boy with dark curly hair in simple tunic
[scene.subjects.actionAndPosture.action] = speaking with right arm raised, pointing upward
[scene.subjects.actionAndPosture.bodyPose] = chest forward, shoulders back
[scene.subjects.actionAndPosture.expression] = determined eyes, mouth open speaking
[scene.environment.background] = massive warrior looming in background
[composition.shot.type] = medium-close shot
[composition.shot.angle] = slightly low angle
[composition.framing.perspective] = David in foreground, Goliath behind
[lighting.lightType] = natural daylight
```

---

**PANEL 3 (bottom third)**

Panel moment: "David releases stone from sling toward Goliath"

Visual thinking: "Action moment - show motion. Medium shot to capture David's full body in sling motion. Slight low angle adds drama. Need to show the sling in motion and stone trajectory."

Blocks chosen from library:
```
[scene.subjects.details.overallSubjectFeatures] = Young boy with dark curly hair in simple tunic
[scene.subjects.actionAndPosture.action] = swinging leather sling overhead, releasing stone
[scene.subjects.actionAndPosture.bodyPose] = body twisted, arm extended forward, weight on front foot
[scene.subjects.actionAndPosture.expression] = eyes locked forward, gritted teeth
[scene.subjects.motion.direction] = stone flying from right to left toward target
[scene.environment.props] = leather sling, small stone in motion
[scene.environment.background] = Goliath visible on left side of panel
[composition.shot.type] = medium shot
[composition.shot.angle] = slightly low angle
[lighting.lightType] = natural daylight
```

---

**Final Assembled Prompt:**
```
Modality: text-to-image

A 3-panel comic book page, vertical strip layout, children's book illustration style
with bold ink lines and flat colors, vibrant and accessible.

PANEL 1 (top): Massive armored warrior with bronze helmet and plume facing young boy
with dark curly hair in simple tunic. Warrior is tall, broad, and muscular, boy is
small and slender. Standing facing each other - warrior standing tall with arms crossed
and head thrown back laughing with mouth wide open, boy with feet planted and chin up,
set jaw and focused eyes. Open battlefield. Medium-wide shot from eye level showing
both subjects in frame, Goliath on left, David on right. Natural daylight.

PANEL 2 (middle): Young boy with dark curly hair in simple tunic speaking with right
arm raised pointing upward. Chest forward, shoulders back, determined eyes and mouth
open speaking. Massive warrior looming in background. Medium-close shot from slightly
low angle showing David in foreground, Goliath behind. David on right speaking to
Goliath on left: "I come in the name of the Lord!" Natural daylight.

PANEL 3 (bottom): Young boy with dark curly hair in simple tunic swinging leather sling
overhead, releasing small stone. Body twisted, arm extended forward, weight on front
foot. Eyes locked forward, gritted teeth. Stone flying from right to left toward
Goliath visible on left side of panel. Medium shot from slightly low angle. Natural
daylight.
```

---

### Part 4: Core Prompting Rules

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
- Define characters once at start
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

### Part 5: Available Blocks Reference

**Core blocks (required every panel):**
- `scene.subjects.details.*` - Character/subject appearance
- `scene.subjects.actionAndPosture.action` - What subjects are doing
- `composition.shot.type` - Shot framing (wide, medium, close-up, etc.)
- `composition.shot.angle` - Camera angle (eye level, low angle, elevated, etc.)
- `lighting.lightType` - Type of lighting

**Variable blocks (add as needed based on panel moment):**

Reference `_docs/2_reference-docs/prompt-blocks.json` for the complete block library.

**Common variable blocks for comic pages:**
- `scene.subjects.actionAndPosture.expression` - Facial expressions
- `scene.subjects.actionAndPosture.bodyPose` - Body positioning
- `scene.subjects.actionAndPosture.mood` - Visual mood indicators
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
1. **`_templates/comic-books/comic-books_template_v3.md`** (this file)

**Story Management:**
2. **`_templates/comic-books/stories/stories-index.md`**
3. **`_templates/comic-books/stories/story-backlog.md`**

---

**Template Version:** v3
**Last Updated:** 2025-11-17
**Approach:** Option 1B - Examples + Minimal Rules (self-contained, pattern-matching)
