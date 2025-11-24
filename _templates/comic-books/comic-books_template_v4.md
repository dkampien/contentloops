# Comic Book Bible Stories - Template v4

## Architecture Notes

**This template is the APPLICATION LAYER:**
- Focuses on comic book-specific workflow and constraints
- Assumes you understand the block-based prompting system (knowledge layer in system prompt)

**Knowledge Layer (System Prompt):**
- How the block system works
- General prompting principles
- Framework concepts
- Not repeated in this template

---

## Key Definitions

**Panel:** Single compartment/frame showing one story beat
**Page:** One comic book page = one image generation (contains 1-4 panels)
**Story:** Complete narrative (spans multiple pages)
**Grid Layout:** Predefined panel arrangement

---

# WORKFLOW STEPS

---

## Step 0: Story Selection

### Task/Instructions
<instructions>
1. Check story backlog: `_templates/comic-books/stories/story-backlog.md`
2. Identify stories marked as available (not completed)
3. Verify story hasn't been generated: `_templates/comic-books/stories/stories-index.md`
4. Select one available story
</instructions>

### Rules/Constraints
<constraints>
- Must select from backlog
- Cannot select completed stories (marked with ✅)
- Cannot select stories already in registry
</constraints>

---

## Step 1: Story Narrative

### Task/Instructions
<instructions>
For the story selected in Step 0, write the complete Bible story in continuous prose format.
</instructions>

### Rules/Constraints
<constraints>
- Ensure complete story arc (setup, conflict, resolution)
- If story is part of larger biblical narrative, ensure this episode has a complete arc
- Target ~150 words for consistency
</constraints>

---

## Step 2: Page & Panel Planning

### Task/Instructions
<instructions>
Break Step 1 narrative into pages and define panels.

1. Identify major story moments (beats) where the narrative naturally segments
2. Divide into 3-5 pages based on these moments
3. For each page:
   - Extract the sentences from Step 1 covering that segment as narration (~30-40 words)
   - For each panel (typically 3), describe the visual moment/action shown
</instructions>

### Rules/Constraints
<constraints>
- Page narration: ~30-40 words from Step 1
- Each panel description: one visual moment/action
- Panels must advance the story
</constraints>

### Examples
<example>
PAGE 1: SETUP
Narration: "The Israelite army faced the Philistines across the valley. Every day, Goliath challenged Israel to send a champion. Young David arrived bringing food to his brothers."

Panel 1: Two armies facing across valley
Panel 2: Goliath challenging Israelites
Panel 3: David arriving at camp
</example>

### Output Format
<output_format>
PAGE X: [Title]
Narration: "[30-40 words from Step 1]"
Panel 1: [moment]
Panel 2: [moment]
[...]
</output_format>

---

## Step 3: Prompt Generation

### Task/Instructions
<instructions>
Generate prompts for each page using the fixed block template.

1. **Define characters** (physical appearance only - hair, features, clothing)
2. **Set story-wide blocks** (medium, layout, comic style)
3. **For each page** from Step 2:
   - For each panel, fill panel-level blocks based on panel moments (reference Step 1 narrative for additional context if needed)
   - Assemble blocks into natural language
   - Output complete page prompt
</instructions>

### Rules/Constraints
<constraints>
- Character descriptions: physical appearance only (copy exactly in every panel)
- Camera-visible descriptions only ("furrowed brow" not "intimidating")
- Assemble blocks into natural flowing sentences
- Keep panels simple (3-5 core elements)
</constraints>

### Output Format
<output_format>
**Character Definitions:**
- [Name]: [Physical description - hair, features, clothing]

**Story-wide Blocks:**
- medium.type = "comic book page"
- layout.panelCount = "3"
- layout.panelArrangement = "vertical"
- comicStyle.artStyle = "[style]"
- comicStyle.inkStyle = "[ink style]"
- comicStyle.colorTreatment = "[color treatment]"
- style.imageStyle = "[overall style]"

**PAGE X:**

Panel 1:
- scene.subjects.details = "[character description]"
- scene.subjects.actionAndPosture.action = "[what doing]"
- scene.environment.setting = "[where]"
- composition.shot.type = "[framing]"
- composition.shot.angle = "[angle]"
- lighting.lightType = "[lighting]"

Assembled: [Natural language prompt]

[Repeat for Panel 2, 3...]
</output_format>

---

## Step 4: Thumbnail Generation

### Task/Instructions
<instructions>
Create a cover/thumbnail image for the story.

1. Composite scene representing the story (main characters + key moment)
2. Include title text on image
3. Use same visual style as story (from Step 3 story-wide blocks)
</instructions>

### Rules/Constraints
<constraints>
- Clear visual hierarchy (characters foreground, background elements behind)
- Title text in quotes: "STORY TITLE"
- Same comic style as pages (children's book illustration, bold ink lines, flat colors)
</constraints>

### Output Format
<output_format>
A vertical portrait comic book cover, [comic style from Step 3].

[Composite scene description featuring main characters and key story moment]

Bold text at top: "[STORY TITLE]" in thick blocky sans-serif font, white letters with heavy black outline stroke, comic book title style, all caps.

Epic, storybook cover aesthetic.
</output_format>

---

## Step 5: Post-Generation Cleanup

### Task/Instructions
<instructions>
After generating all images, create metadata and update registry files.

1. Create `story-data.json` in output folder
   - Extract narration from Step 2 page sections
   - Include story metadata (title, files, page count)
2. Update `stories-index.md` (increment counts, add story entry)
3. Update `story-backlog.md` (mark story as complete)
</instructions>

### Rules/Constraints
<constraints>
- Use exact narration text from Step 2 (do not rephrase or rewrite)
</constraints>

### Output Format
<output_format>
**story-data.json structure:**
{
  "storyId": "[story-name-kebab-case]",
  "title": "[Story Title]",
  "thumbnailFile": "thumbnail.jpg",
  "totalPages": [number],
  "pages": [
    {
      "pageNumber": 1,
      "imageFile": "1.jpg",
      "narration": "[From Step 2 PAGE 1]"
    }
  ]
}
</output_format>

---

## File Naming Conventions

**Story files:**
- Format: `XX-story-name.md`
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

---

## Reference Files

**Story Management:**
- `_templates/comic-books/stories/stories-index.md`
- `_templates/comic-books/stories/story-backlog.md`

**Block Library:**
- `_docs/2_reference-docs/prompt-blocks.json`

---

**Template Version:** v4.0
**Last Updated:** 2025-01-21
**Architecture:** Application Layer (assumes knowledge from system prompt)
