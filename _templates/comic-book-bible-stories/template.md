# Comic Book Bible Stories - Template

**Purpose:** Generate Bible stories as comic book pages for SoulStream in-app content
**Format:** Variable aspect ratio (testing 3:4, 2:3, 4:5) - displays in 9:16 screen with app UI narration
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
- Page-specific narration text (extracted from Step 3 scripts)
- Displayed below comic page in remaining vertical space
- 100% reliable, translatable, updatable

**Layout in 9:16 screen:**
```
┌─────────────────┐
│                 │
│   Comic Page    │ ← Generated image (dialogue only)
│   3:4 ratio     │   Example ratios: 3:4, 2:3, or 4:5
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

## Template Blocks

### Layout
- **layout.panelCount** - Number of panels in the composition (1-4)
- **layout.panelArrangement** - How panels are arranged (vertical strip, grid, fullscreen)
- **layout.gutterStyle** - Space/border between panels

### Text Integration
- **textIntegration.textType** - Type of text elements (speech bubbles, captions, none)
- **textIntegration.bubbleStyle** - Visual style of speech/thought bubbles
- **textIntegration.captionStyle** - Style of caption boxes

### Comic Style
- **comicStyle.artStyle** - Overall comic art aesthetic (children's book, superhero, manga, etc.)
- **comicStyle.inkStyle** - Line work and inking technique (bold lines, fine lines, brushwork)
- **comicStyle.colorTreatment** - Color application method (flat colors, cel shading, painted)

### Grid Layouts (Predefined)
- **Layout A:** Single panel (fullscreen splash page)
- **Layout B:** 2 panels vertical (50/50 split)
- **Layout C:** 3 panels vertical (33/33/33 split)
- **Layout D:** 4 panels grid (2x2)

---

## Production Workflow (Page-First Approach)

### Key Definitions

**Panel:** A single compartment/frame within a comic page (shows one story beat/scene)
**Page:** One comic book page = one image generation (contains 1-4 panels showing multiple scenes)
**Story:** The complete narrative (may span multiple pages)
**Grid Layout:** Predefined panel arrangement

---

### Step 1: Story Narrative

Write the complete Bible story in prose format (~150 words), structured into page sections.

**Important:** Structure the narrative into sections matching your planned page count. Each section becomes the narration for that page in the app UI.

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
- Structure into sections matching Step 2 page plan (typically 4 sections for 4 pages)
- Each section should relate to the story beats on that page
- Include key story beats and emotional moments
- Write in narrative voice suitable for children
- Focus on the dramatic arc
- These sections will be extracted directly for app UI narration

---

### Step 2: Page & Panel Planning

Decide the page structure before detailed scripting.

**Planning elements:**
- How many pages total?
- Which story beats go on each page?
- Grid layout per page (A/B/C/D)
- Purpose of each page (setup, conflict, resolution, etc.)

**Example:**
```
PAGE 1: SETUP
- Story beats: Armies face off, Goliath's challenge, David arrives
- Panel count: 3 panels
- Grid layout: Layout C (3 panels vertical)
- Purpose: Establish conflict and introduce David

PAGE 2: PREPARATION
- Story beats: David volunteers, refuses armor, collects stones
[...]
```

**Best practices:**
- Distribute story beats evenly across pages
- Use 3-panel pages (Layout C) for standard pacing
- Save 1-panel pages (Layout A) for dramatic moments
- Plan page turns for suspense/reveals

---

### Step 3: Page Scripts

Detail each panel within each page.

**For each panel, specify:**
- **VISUAL:** What's in the scene (characters, objects, environment, actions)
- **COMPOSITION:** Shot type, angle, framing
- **DIALOGUE:** Speech in bubbles (will be included in generated image)

**Note on narration:** Page narration comes directly from Step 1 page sections (already written). No need to duplicate it here.

**Example:**
```
PAGE 1 - SETUP
Grid Layout: Layout C (3 panels vertical)
Page Narration: [Use PAGE 1 section from Step 1]

PANEL 1 (top third)
- VISUAL: Two armies facing each other across wide valley.
  Israelite tents on one side, Philistine tents on other.
  Rocky terrain, sparse vegetation, sheep grazing. Blue sky.
- COMPOSITION: Wide establishing shot, eye level, showing
  both sides with space between.
- DIALOGUE: None

PANEL 2 (middle third)
- VISUAL: Massive armored warrior...
- COMPOSITION: Low angle shot...
- DIALOGUE: Goliath: "Send me a champion to fight!"
```

**Best practices:**
- Be specific about visual details (colors, clothing, environment)
- Describe characters without using proper names (models don't know "David")
- Include composition notes for visual variety
- **Page narration** comes from Step 1 sections (goes to app UI)
- **DIALOGUE goes to image** - only dialogue included in Step 4 prompts

---

### Step 4: Prompt Generation

Transform page scripts into text-to-image prompts (dialogue only).

**Process:**

1. **Identify blocks from scripts**
2. **Apply formula structure**
3. **Generate natural language prompt**
4. **Add speech bubbles for dialogue only** (narration goes to app UI, not in image)

**Formula structure:**
```
[aspect ratio] [medium.type] [layout.panelCount] [layout.panelArrangement]
[comicStyle.artStyle] [comicStyle.inkStyle] [comicStyle.colorTreatment]

PANEL 1 ([position]): [scene.subjects.details] [scene.environment.setting].
[composition.shot.type] [composition.shot.angle].
[Speech bubble if dialogue present]

PANEL 2 ([position]): [visual description]. [composition].
[...]
```

**Text Integration (Dialogue Only):**

**Speech Bubbles:**
- Format: `Speech bubble from [character]: "dialogue text"`
- Purpose: Character dialogue, exclamations
- Style: Rounded bubbles with pointer toward speaker
- Minimal text load (2-3 bubbles per page maximum)

**Important:**
- ONLY include dialogue in prompts (speech bubbles)
- Do NOT include narration in prompts (narration becomes app UI text)
- Include character name in speech bubble format for clarity
- Models may have limitations on pointer direction for speech bubbles

**Example blocks to prompt:**

**Blocks identified:**
- aspectRatio = "3:4" (or 2:3, or 4:5 - testing)
- medium.type = "comic book page"
- layout.panelCount = "3 panels"
- layout.panelArrangement = "vertical strip layout"
- comicStyle.artStyle = "children's book illustration"
- comicStyle.inkStyle = "bold ink lines"
- comicStyle.colorTreatment = "flat colors"
- style.imageStyle = "vibrant, accessible"

**Panel 1 blocks:**
- scene.environment.setting = "valley battlefield, two armies, tents"
- composition.shot.type = "wide shot"
- composition.shot.angle = "eye level"
- textIntegration.dialogue = None

**Panel 2 blocks:**
- scene.subjects.details = "massive warrior Goliath"
- textIntegration.dialogue = "Send me a champion to fight!"

**Assembled prompt:**
```
A 3-panel comic book page, vertical strip layout, 3:4 aspect ratio,
children's book illustration style with bold ink lines and flat colors,
vibrant and accessible.

PANEL 1 (top): Two armies facing each other across a wide valley.
Israelite tents on one side, Philistine tents on the other, rocky
terrain with sparse vegetation and sheep grazing. Wide establishing
shot from eye level showing both sides with space between them.

PANEL 2 (middle): Massive armored warrior with bronze helmet and
plume, holding large spear. Valley and soldiers in background. Low
angle shot looking up making him imposing. Speech bubble from Goliath:
"Send me a champion to fight!"

PANEL 3 (bottom): Young boy in shepherd tunic carrying basket, walking
into military camp. Medium shot from slightly elevated angle.
```

**App UI Text (extracted from narration):**
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
a sling, looking up with confident determined expression. Behind him,
massive armored warrior Goliath looms large with bronze helmet and spear,
creating dramatic size contrast. Rocky valley landscape in background with
two armies on hillsides. Dynamic composition emphasizing the epic confrontation.

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

## Best Practices (From Testing)

### ✅ What Works

- **Describe characters visually** - Appearance, clothing, size (not names)
- **Specify panel layout clearly** - "3-panel vertical strip"
- **Use concrete visual details** - Colors, textures, specific objects
- **Medium detail level** - Not too sparse, not overwhelming
- **Natural language flow** - Prompts should read naturally

### ❌ What Doesn't Work

- **Character names** - Don't assume models know "David" or "Goliath"
- **Cultural/historical assumptions** - Describe everything visually
- **Redundant instructions** - Panel borders handle themselves
- **Overly complex prompts** - Keep descriptions clear and direct
- **Too many text elements** - Avoid 5+ text elements per page (stick to 2-3 dialogue bubbles max)

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

---

## Quick Reference

**Grid Layouts:**
- Layout A = 1 panel fullscreen (dramatic splash)
- Layout B = 2 panels vertical (moderate pacing)
- Layout C = 3 panels vertical (standard pacing)
- Layout D = 4 panels grid (dense/fast pacing)

**Standard page structure:**
- 3-4 pages per story typical
- 3 panels per page most common (Layout C)
- Splash page (Layout A) for finale

**Prompt template (dialogue-only):**
```
A [N]-panel comic book page, [layout], [aspect ratio], [art style].

PANEL 1 ([position]): [Visual description]. [Composition].

PANEL 2 ([position]): [Visual description]. [Composition].
Speech bubble from [character]: "dialogue"

PANEL 3 ([position]): [Visual description]. [Composition].

[Repeat for all panels]
```

**Note:**
- Include speech bubbles ONLY for dialogue
- Narration text goes to app UI (extract from Step 3 scripts)
- Aspect ratio: Testing 3:4, 2:3, 4:5 (specify in prompt)

---

**See `stories/` folder for complete examples with all 4 steps demonstrated.**
