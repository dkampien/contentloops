## Overview

This framework provides a systematic approach to generating AI prompts using modular, reusable components called **blocks**.

**Purpose:** Enable consistent, high-quality prompt creation across different AI models and use cases - particularly for AI content generation models.

**Key concept:** A Prompt Formula is a structured template that combines specific blocks to generate prompts for a particular task or output type. Each formula is optimized for a specific goal (text generation, image creation, video production, etc.).

## Core Concepts

### What is a Prompt Formula?

A Prompt Formula is a structured template that combines specific **blocks** to generate prompts for a particular task or output type. Each formula is optimized for a specific goal (text generation, image creation, video production, etc.).

### Block Structure

**Blocks** are the atomic units of the system, organized in a hierarchical path structure:

- `[Block]` - Single level block
- `[Category.Block]` - Two level block
- `[Category.Subcategory.Block]` - Three level block

**Hierarchy principles:**
- Use dot notation for clear relationships
- Use camelCase for multi-word blocks (e.g., `[camera.movement]`, `[subject.physicalFeatures]`)
- Allow flexible depth as needed (blocks can have varying hierarchy levels)
- Recommended to keep hierarchies at 4 levels or less for maintainability
- Design blocks for reusability across multiple formulas

**Examples:**

- `[medium] = fashion photography`
- `[scene.subject.age] = young adult`
- `[scene.subject.facial.eyes] = piercing blue eyes`
- `[lighting.type] = golden hour light`

### Block Values

Each block contains **values** - the actual text elements that will appear in the final prompt. Values can be:

- Manually written
- AI-generated suggestions
- Curated lists of options

### Core Blocks

A **core block** is a block that cannot be meaningfully subdivided further. When further breakdown would be:
- Impractical to maintain in a library
- Too granular for reusability
- Better expressed as natural language

Core blocks are the terminal/leaf nodes in a block hierarchy.

**Examples:**
- `[subject.gender]` - core block (atomic values: male, female, non-binary)
- `[action]` - core block (natural language: "stirring pot on autopilot, staring off absently")
- `[lighting.quality]` - core block (atomic values: soft, hard, diffused)

Because core blocks can't be subdivided, they often have **creative freedom** in how their values are expressed - especially when the block represents complex, open-ended concepts like actions or expressions.

## Formula Types

Formulas can be created for any AI modality. Below are representative examples:

> See `prompt-generation-guide-v5.md` for comprehensive coverage of all AI generation modalities (text-to-video, image-to-video, video-to-video, etc.)

### 1. Text Output Formulas

**Purpose:** Generate structured text content using AI content generation models
**Example Use Case:** Character persona creation, content briefs, structured descriptions

**Note:** These formulas generate text content directly, not prompts for other AI models.

```
[character.name] = Kaelan
[character.age] = 27 years old
[character.background] = Barcelona-born digital artist
[character.personality] = analytical, empathetic, quietly humorous
[character.motivation] = understanding human connection through technology

```

### 2. Image Generation Formulas

**Purpose:** Create visual content via text-to-image models
**Example Use Case:** Character appearance

```
[medium] = cinematic photograph
[subject.demographics] = late-20s Mediterranean male
[subject.features] = sharp jawline, hazel eyes, short dark hair
[subject.expression] = thoughtful, slightly melancholic
[technical.camera] = shot on Sony α7S III
[technical.lighting] = soft natural light
[style] = photorealistic, high detail

```

### 3. Video Generation Formulas (Image-to-Video)

**Purpose:** Create motion from static images via image-to-video models
**Example Use Case:** Animating character portraits or scene images

**Note:** For image-to-video, describe only motion and camera movement - the image already contains the visuals.

```
[subject.action] = turns head slowly toward camera, slight smile forming
[camera.movement] = subtle push-in
[motion.style] = smooth, natural, photorealistic
[duration] = 5 seconds
```

**Note:** Different platforms (RunwayML, Kling, Veo, etc.) may have unique requirements, so formulas should be adapted per platform when needed.

## Formula Construction Process

1. **Define Goal:** Determine the intended outcome (e.g., "character portrait") and generation method (e.g., text-to-image)
2. **Select Relevant Blocks:** Choose blocks that serve the specific goal. Use only what's needed - you're not required to use every available block from a category or hierarchy.
3. **Populate Values:** Fill blocks with appropriate content
4. **Arrange Block Order:** Organize blocks for optimal prompt flow and model priority
   - **Natural Flow:** Arrange blocks so the output reads as coherent sentences/paragraphs
   - **Logical Sequence:** Order blocks to create smooth, readable prompt structure
   - **Contextual Grouping:** Place related concepts near each other in the prompt
   - **Model Sensitivity:** AI models assign different priorities to prompt elements based on position - prioritize important elements early
   - **Testing Required:** Experiment with different arrangements to find optimal ordering for your specific use case
5. **Generate Prompt:** Combine blocks into final prompt text
   - When using hierarchical blocks: Assemble atomic sub-block values into natural descriptive language at the parent block level
   - Only concatenate when the combination reads naturally
   - Examples:
     - ✅ [subject.age]=30s + [subject.gender]=male → [subject] = "Man in his 30s"
     - ❌ [subject] = "30s, male" (doesn't read naturally)
     - ✅ [lighting.quality]=soft + [lighting.type]=natural → [lighting] = "soft natural lighting"
6. **Test & Refine:** Adjust blocks based on output quality

## Block Library

This framework relies on a **Block Library** - a curated collection of blocks organized by category and use case. The library contains:

- Predefined block paths and categories
- Suggested values for common scenarios
- Platform-specific considerations
- Best practice examples

*Note: Block library content is maintained separately from this framework documentation.*

### Example Block Library Structure

Category - Group - Core Block

```markdown
Scene (Block Category)
├── Subjects (Block Group)
│   ├── Demographics (Block Group)
│   │   ├── Gender (Core Block)
│   │   │   └── Values: [male, female, non-binary]
│   │   ├── Age Group (Core Block)
│   │   │   └── Values: [young adult, middle-aged, mature]
│   │   ├── Ethnicity (Core Block)
│   │   │   └── Values: [caucasian, east asian, african, etc.]
│   ├── Physical Features (Block Group)
│   │   ├── Face Shape (Core Block)
│   │   │   └── Values: [oval, heart-shaped, square, round]
│   │   ├── Body Type (Core Block)
│   │   │   └── Values: [slim, athletic, curvy, plus-size]
├── Environment (Block Group)
│   ├── Setting Type (Core Block)
│   │   └── Values: [photo studio, indoor location, outdoor location]
│   ├── Location Style (Core Block)
│   │   └── Values: [minimalist, industrial, rustic, modern]
```

## Output Formats

When documenting prompts using formulas and blocks, there are different ways to display the information depending on whether you're showing a template structure or an actual generated output.

### Understanding the Structure

All formats consist of three sections:

**Section 1: Metadata**
- Modality = Which capability (text-to-image, image-to-video, etc.)
- Formula = Block structure and order

**Section 2: Blocks**
- [Block] = String value assigned to each block
- Variables `{}` = Informal markers showing "fill this spot"

**Section 3: Final Prompt**
- Prompt: The assembled prompt string sent to the model

#### How Variables Work

Variables are informal placeholders within block strings:

[setting] = {position} at {location}

**Variables:**
- Are NOT sub-blocks
- Are NOT formal structure
- Are just guidance labels for parts of the string
- "at" is literal text that stays

**When filled:**
[setting] = standing at kitchen stove

Variables disappear - they were just placeholders showing where to put what.

#### Working with Sub-blocks

When using a block library, you can use hierarchical sub-blocks to provide more structure and traceability.

Sub-blocks use hierarchical paths from the library:

[scene.subjects.age] = 30s
[scene.subjects.gender] = male

**Sub-blocks vs Variables - Different Levels:**
- **Variables `{}`** = Placeholders within VALUES (guidance for what to write)
- **Sub-blocks `[block.subBlock]`** = Structural paths (where in the hierarchy)

**They can work together:**
[subject.description] = {age} {gender} person
                         ↑ variables guide the content
↑ sub-block shows library path

Variables operate at the **content level**, sub-blocks at the **structural level**.

### Format Types

**Note:** Formats 1-3 use variables `{}` as content placeholders. Format 4 adds sub-block hierarchy from a structured library. Format 5 provides machine-readable JSON structure.

#### 1. Template

Shows the structure with `{variables}` as placeholders.

**Use for:** Documenting reusable formula patterns

```
Modality = {modality name}
Formula = [Block1] [Block2] [Block3]

[Block1] = {variable1} {variable2}
[Block2] = {variable1} at {variable2}
[Block3] = fixed value

Prompt: "{Block1} {Block2}, {Block3}"
```

#### 2. Output Compact

Shows filled values without variable breakdown.

**Use for:** Clean, scannable output

```
Modality = text-to-video
Formula = [subject] [setting] [action]

[subject] = Person in their 30s
[setting] = standing at kitchen stove
[action] = stirring pot on autopilot, staring off absently

Prompt: "Person in their 30s standing at kitchen stove, stirring pot on autopilot, staring off absently"
```

#### 3. Output Detailed

Shows filled values WITH variable breakdown under each block.

**Use for:** Debugging, analysis, documentation with clear component mapping

```
Modality = text-to-video
Formula = [subject] [setting] [action]

[subject] = Person in their 30s
  {person description} = Person in their 30s

[setting] = standing at kitchen stove
  {position} = standing
  {location} = kitchen stove

[action] = stirring pot on autopilot, staring off absently
  {activity} = stirring pot
  (descriptor chosen: "on autopilot")
  {pause} = staring off absently

Prompt: "Person in their 30s standing at kitchen stove, stirring pot on autopilot, staring off absently"
```

#### 4. Output Detailed - Sub-blocks

Shows filled values WITH sub-block hierarchy from block library.

**Use for:** Structured generation, showing library hierarchy, traceability to block sources

```
Modality = text-to-video
Formula = [subject] [setting] [action] [lighting]

[subject] = Person in their 30s
  [subject.age] = 30s
  [subject.gender] = unspecified

[setting] = standing at kitchen stove
  [setting.position] = standing
  [setting.location] = kitchen stove

[action] = stirring pot on autopilot, staring off absently
  [action.activity] = stirring pot
  (core block - creative freedom)

[lighting] = soft natural front lighting
  [lighting.quality] = soft
  [lighting.type] = natural
  [lighting.direction] = front-lit
  (LLM assembled into natural phrasing)

Prompt: "Person in their 30s standing at kitchen stove, stirring pot on autopilot, staring off absently, soft natural front lighting"
```

**Key differences from Format 3:**
- Shows library paths `[block.subBlock]` instead of variables `{variable}`
- Core blocks marked as having creative freedom
- LLM assembles sub-blocks into natural language for main block (see lighting example above)

#### 5. JSON (Nested)

Shows hierarchical block structure in machine-readable JSON format.

**Use for:** API integrations, database storage, programmatic generation, easy copy-paste for LLM consumption

```json
{
  "subject": {
    "age": "30s",
    "gender": "unspecified"
  },
  "setting": {
    "position": "standing",
    "location": "kitchen stove"
  },
  "action": {
    "activity": "stirring pot"
  },
  "lighting": {
    "quality": "soft",
    "type": "natural",
    "direction": "front-lit"
  }
}
```

**Key features:**
- Pure JSON representation of hierarchical block structure
- Machine-readable format ready for programmatic use
- Easy to copy-paste for LLM processing

## LLM Usage Rules

These rules guide AI systems (like LLMs) when using this framework to generate prompts.

### Assembly Rules

When using sub-blocks, an LLM should assemble atomic sub-block values into natural descriptive language:
- **Sub-blocks** = Atomic values (data structure)
- **Main block** = LLM-assembled natural language (resolves phrasing conflicts)

**Example:**
```
[subject] = Man in his 30s
  [subject.age] = 30s
  [subject.gender] = male
```

The LLM takes `30s` and `male` and creates "Man in his 30s" (not "30s male" or "male in 30s").

This resolves phrasing conflicts - how do you naturally combine "soft", "natural", and "front-lit" into a lighting description? The LLM handles grammar, word order, and natural flow.

**Assembly Rule:**
When using sub-blocks, assemble atomic values into natural descriptive language at the parent block level. Only concatenate when the combination reads naturally.

**Examples:**
- ✅ [subject.age]=30s + [subject.gender]=male → [subject] = "Man in his 30s"
- ❌ [subject] = "30s, male" (doesn't read naturally)
- ✅ [lighting.quality]=soft + [lighting.type]=natural → [lighting] = "soft natural lighting"
- ✅ Also acceptable: [lighting] = "natural soft lighting" (both read naturally)

### Generation Rules

When generating prompts:

1. **Block subdivision:** Stop subdividing when further breakdown becomes impractical to maintain or too granular for reusability. A block that can't be meaningfully subdivided is a "core block" and has creative freedom in its values. When in doubt, keep it as a core block with natural language values.

2. **Contextual awareness:** When modifying one block in an existing prompt, ensure other blocks remain coherent with the change. For example, if changing [action], verify [camera.movement] still makes sense.

3. **Prompt independence:** Each prompt generation is separate unless explicitly instructed to carry over variations. Don't automatically apply changes from one prompt to the next.

4. **Library gaps:** When using a block library, if needed blocks don't exist in the library, generate appropriate blocks as needed. Flag new blocks inline with (NEW) notation so they can be evaluated for library inclusion.

## Example Formula

**Character Appearance (Text-to-Image):**

```
[medium] = portrait photograph
[subject.demographics] = young adult female
[subject.physical.face] = oval face with high cheekbones
[subject.physical.eyes] = striking green eyes
[subject.physical.hair] = long wavy auburn hair
[subject.style] = minimalist makeup, natural look
[environment] = neutral studio backdrop
[technical.camera] = medium format camera
[technical.lighting] = soft diffused lighting
[style] = photorealistic, high resolution

```

**Generated Prompt:**

"Portrait photograph of a young adult female with oval face and high cheekbones, striking green eyes, long wavy auburn hair, minimalist makeup and natural look, neutral studio backdrop, medium format camera, soft diffused lighting, photorealistic, high resolution"

## Key Advantages

- **Consistency:** Same blocks produce similar quality across generations
- **Efficiency:** Reusable components reduce prompt creation time
- **Scalability:** Easy to add new blocks and formulas as needs grow
- **Modularity:** Mix and match blocks for different requirements
- **Model Agnostic:** Works with any text-based AI system
- **Optimizable:** Block order can be adjusted for different model priorities

## Framework Applications

This system can be adapted for any prompt-driven AI task:

- Character creation for games/stories
- Product photography
- Architecture visualization
- Marketing content
- Scientific illustration
- And any other systematic prompt generation need

The key is identifying the core blocks relevant to your specific use case and organizing them in logical, reusable hierarchies that produce natural-flowing prompts.

---

**End of Framework Documentation v2.0**
