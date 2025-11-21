## Overview

A **Prompt Formula** is a systematic approach to generating AI prompts using modular, reusable components called blocks. This framework enables consistent, high-quality prompt creation across different AI models and use cases.

## Core Concepts

### What is a Prompt Formula?

A Prompt Formula is a structured template that combines specific **blocks** to generate prompts for a particular task or output type. Each formula is optimized for a specific goal (text generation, image creation, video production, etc.).

### Block Structure

**Blocks** are the atomic units of the system, organized in a hierarchical path structure:

- `[Block]` - Single level block
- `[Category.Block]` - Two level block
- `[Category.Subcategory.Block]` - Three level block
- `[Category.Subcategory.Detail.Block]` - Four+ level block

**Examples:**

- `[Medium] = fashion photography`
- `[Scene.Subject.Age] = young adult`
- `[Scene.Subject.Facial.Eyes] = piercing blue eyes`
- `[Lighting.Type] = golden hour light`

### Block Values

Each block contains **values** - the actual text elements that will appear in the final prompt. Values can be:

- Manually written
- LLM-generated suggestions (the default typically)
- Curated lists of options

## Formula Types

### 1. Text Output Formulas

**Purpose:** Generate descriptive text content
**Example Use Case:** Character persona creation

```
[Character.Name] = Kaelan
[Character.Age] = 27 years old
[Character.Background] = Barcelona-born digital artist
[Character.Personality] = analytical, empathetic, quietly humorous
[Character.Motivation] = understanding human connection through technology

```

### 2. Image Generation Formulas

**Purpose:** Create visual content via text-to-image models
**Example Use Case:** Character appearance

```
[Medium] = cinematic photograph
[Subject.Demographics] = late-20s Mediterranean male
[Subject.Features] = sharp jawline, hazel eyes, short dark hair
[Subject.Expression] = thoughtful, slightly melancholic
[Technical.Camera] = shot on Sony α7S III
[Technical.Lighting] = soft natural light
[Style] = photorealistic, high detail

```

### 3. Video Generation Formulas

**Purpose:** Create motion content via image-to-video models
**Example Use Case:** Character lifestyle scenes

```
[Scene.Activity] = working out at the gym
[Scene.Setting] = minimalist concrete gym
[Subject.Action] = bench pressing weights
[Subject.Mood] = focused and determined
[Camera.Movement] = subtle push-in
[Duration] = 5 seconds
[Technical] = 24fps, photorealistic

```

**Note:** Video models often require specialized blocks and prompt structures compared to image models. Different platforms (RunwayML, Kling, etc.) may have unique requirements, so formulas should be adapted per platform when needed.

## Formula Construction Process

1. **Define Goal:** Determine the intended output (text, image, video)
2. **Select Relevant Blocks:** Choose blocks that serve the specific goal
3. **Populate Values:** Fill blocks with appropriate content
4. **Arrange Block Order:** Organize blocks for optimal prompt flow and model priority
5. **Generate Prompt:** Combine blocks into final prompt text
6. **Test & Refine:** Adjust blocks based on output quality

## Block Organization Principles

### Semantic Grouping

- **Natural Flow:** Arrange blocks so the output reads as coherent sentences/paragraphs
- **Logical Sequence:** Order blocks to create smooth, readable prompt structure
- **Contextual Grouping:** Place related concepts near each other in the prompt

### Block Priority & Order

- **Model Sensitivity:** AI models assign different priorities to prompt elements based on position
- **Flexible Arrangement:** Block order should be adjustable to optimize for specific models
- **Testing Required:** Experiment with different arrangements to find optimal ordering for each use case

### Hierarchy Design

- **Hierarchical Paths:** Use dot notation for clear relationships
- **Flexible Depth:** Allow blocks to have varying hierarchy levels as needed
- **Reusability:** Design blocks to work across multiple formulas

## Block Library

This framework relies on a **Block Library** - a curated collection of blocks organized by category and use case. The library contains:

- Predefined block paths and categories
- Suggested values for common scenarios
- Platform-specific considerations
- Best practice examples

*Note: Block library content is maintained separately from this framework documentation.*

## Example Complete Workflow

### Character Appearance Formula:

```
[Medium] = portrait photograph
[Subject.Demographics] = young adult female
[Subject.Physical.Face] = oval face with high cheekbones
[Subject.Physical.Eyes] = striking green eyes
[Subject.Physical.Hair] = long wavy auburn hair
[Subject.Style] = minimalist makeup, natural look
[Environment] = neutral studio backdrop
[Technical.Camera] = medium format camera
[Technical.Lighting] = soft diffused lighting
[Style] = photorealistic, high resolution

```

### Generated Prompt:

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

IMPORTANT RULE

- You can use one or multiple blocks from the same category. You don’t have to use all.

---

Example block library → Category - Group - Core Block

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