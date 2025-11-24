# AI Content Generation: Prompt Generation Guide

**Version**: 5.0
**Date**: 2025-11-01

---

## Overview

This guide provides a practical framework for generating prompts for AI content generation models. It focuses on understanding model capabilities, designing effective workflows, and applying systematic prompting approaches.

**Purpose:** Help you effectively use AI models for content generation by understanding modalities, workflows, and prompting strategies - regardless of which specific models exist.

**Companion document:** See `prompt-formula-framework-v2.md` for detailed methodology on formulas, blocks, output formats, and LLM usage rules.

---

## 1. Understanding AI Models

### Why Model-Agnostic?

The AI model landscape changes constantly - new models release monthly, "best" models change weekly, specific names become outdated quickly. Instead of learning "Veo 3.1" or "Sora 2", focus on:

1. **Modalities** - What can models do?
2. **Workflows** - How do we chain capabilities?
3. **Prompting** - How do we communicate effectively?

This framework works regardless of which specific models exist.

### Models vs Platforms

**Models = The actual AI tools**
- Each has specific strengths and weaknesses
- Best suited for different purposes
- Think of them like tools in a toolbox
- Choose based on your specific needs

**Platforms = Webapps that host models**
- One platform can provide access to multiple models
- Example: Replicate hosts Veo, Flux, and many others
- Handle API access, billing, infrastructure

**Selection process:**
1. Identify purpose and scope (what you need created)
2. Choose best model for specific purpose
3. Identify modality needed (text-to-image, image-to-video, etc.)
4. Access via appropriate platform

---

## 2. Modalities: Model Capabilities

**Modality = A specific input→output capability**

Understanding modalities helps you choose the right tool, design effective workflows, and switch between models easily.

### Image Generation Modalities

- **text-to-image (t2i)** - Text → generated image
- **image-to-image (i2i)** - Image + text → transformed image (style transfer, variations)
- **image-to-image_edit (i2i_edit)** - text + reference images -> edited image

### Video Generation Modalities

- **text-to-video (t2v)** - Text → generated video (describes both visuals AND motion)
- **image-to-video (i2v)** - Image + text → animated video (text guides motion only)
- **frames-to-video** - First frame + last frame + text → interpolated video
- **video-to-video (v2v)** - Video + text → transformed video
- **video-to-video_edit (v2v_edit)** - Video + text + targeting → edited video
- **reference-to-video** - Text + reference images → video with consistent elements (also called "elements" or "ingredients")
- **performance-transfer** - Performance video + character → motion/expression transferred

### 3D Generation Modalities

- **text-to-3d (t2-3d)** - Text → 3D model
- **image-to-3d (i2-3d)** - Image(s) → 3D model

**Note:** Most modern models support multiple modalities (e.g., t2v + i2v + frames-to-video in one model).

### Emerging Capabilities

**Multishot Video Generation:**
- Some new video models support camera cuts within a single generation
- Multishot prompt structures allow multiple shots/angles in one prompt
- Requires different prompting approach than traditional single-shot
- Capability and structure vary by model (requires model-specific research)

---

## 3. AI Generation Workflows

**Workflow = Chaining modalities to achieve a final output**

Think of workflows like ComfyUI node graphs - each step uses a specific modality, feeding outputs to the next step.

### Why Workflows?

Constraints drive multi-step workflows:
- Duration limits (e.g., 8-second max per generation)
- Consistency requirements (same character across scenes)
- Quality control (iterate on specific parts)

### Simple vs Complex Workflows

**Simple:**
```
text-to-video (t2v)
Result: 8-second video
```

**Complex (Character Consistency):**
```
1. Character persona (LLM)
2. Character appearance (text-to-image - portrait)
3. Reference library (image-to-image - variations)
4. Activity breakdown (LLM → 6 scenes)
5. Scene images (text-to-image + character refs)
6. Scene animations (image-to-video × 6)
7. Stitch videos (editing)

Result: 30-second video, consistent character
Formulas needed: 6 different
```

### Key Principles

- Each step can use different models/modalities
- Outputs become inputs for next step
- Different prompts required at each step
- Consistency requires reference workflows
- Duration limits drive multi-step approaches

**Note on Workflow Components:**
While this framework focuses on generation modalities (text-to-image, image-to-video, text-to-video), workflows are built by combining reusable techniques to achieve larger outcomes.

**Techniques** are subworkflows that accomplish specific tasks such as:
- Character consistency
- Relighting images
- Inpainting
- Lip syncing
- Product placement
- LoRA training
- Upscaling

Each technique may use:
- Generation modalities (text-to-image, image-to-video, etc.)
- Specialized models and tools
- Multiple internal steps/nodes

**Workflow hierarchy:**
- Workflow = Overall outcome (e.g., "Generate final video")
- Techniques = Reusable subworkflows for specific tasks (e.g., upscaling, character consistency)
- Steps = Individual operations within each technique

Workflows chain techniques together, where each technique's output becomes the next technique's input.

### Frame Chaining for Continuity

**Technique:** Use the last frame of one scene as the first frame of the next

**How it works:**
1. Generate Scene 1 video (t2v or i2v)
2. Extract last frame from Scene 1
3. Use extracted frame as input for Scene 2 (i2v)
4. Repeat for subsequent scenes

**Benefits:**
- Visual continuity between scenes
- Maintains lighting, setting, character appearance
- Extends beyond single generation duration limits
- Smoother transitions

**Example:**
```
Scene 1: text-to-video → 8-second video
   ↓ (extract last frame)
Scene 2: image-to-video (with frame) → 8-second video
   ↓ (extract last frame)
Scene 3: image-to-video (with frame) → 8-second video

Result: 24 seconds with visual continuity
```

### Multi-Scene Content & Storytelling

**Planning scenes with model constraints:**

**Duration Limits:**
- Most models cap at 5-10 seconds per generation
- Break longer content into scenes
- Each scene = one generation
- Use frame chaining or editing to combine

**Extending a Scene:**
- Option 1: Extract last frame → generate continuation (image-to-video)
- Option 2: Use first+last frame approach (frames-to-video)
- Option 3: Generate multiple takes and edit best parts

**Scene Structure:**
- Keep scenes focused (one main action/moment)
- Plan transitions (cut, frame chain, or edit)
- Consider pacing (fast cuts vs slow progression)
- Match emotional arc to story goal

**Example Scene Breakdown:**
```
30-second video → 6 scenes × 5 seconds

Scene planning:
1. Establish setting (wide shot)
2. Introduce subject (medium shot)
3. Main action begins (close-up)
4. Action continues (different angle)
5. Resolution (pull back)
6. Closing (final moment)

Technique: Frame chaining between scenes 2-5 for continuity
```

**Key Considerations:**
- Plan before generating (saves cost)
- Account for model duration limits
- Design transitions in advance
- Test frame chaining early (visual continuity check)

---

## 4. Prompts & Modalities

**Critical insight: Different modalities require fundamentally different prompts**

### Prompting Approach

For each modality, your prompting approach consists of three components:

**1. FOCUS** - What to describe (determined by modality)
- text-to-image: Describe what exists (visuals)
- image-to-video: Describe what happens (motion only)
- text-to-video: Describe both (visuals + motion)

**2. PHRASING STYLE** - How to write block values
- **Descriptive**: Lists what exists (compact, direct)
  - Example: "A man cleaning a car engine, wiping sweat from his brow, exhausted expression"
  - Within descriptive, two writing styles exist:
    - **Direct/Compact**: "blue sports car", "person in blood-splattered jacket"
    - **Verbose/Predicative**: "the car is blue and sporty", "the person has blood streaming"
    - Note: Direct style is generally more efficient; worth testing which works better for your model

- **Narrative**: Tells what happens (sequential, story-like)
  - Example: "A man leans over the hood, wipes his brow, then looks at the camera and says 'This is hard work'"

**Both phrasing styles work with block-based formulas** - the difference is how you write the block values, not the structure itself.

**3. FORMULA** - Which structure to use
- Block structure (which blocks)
- Block order (arrangement)
- Block level of detail (depth)

> See `prompt-formula-framework-v2.md` for detailed methodology on formulas and blocks.

**The flow:**
```
Modality → Focus (what to describe) → Phrasing Style (how to write)
→ Formula (structure) → Blocks → Detail Level → Final Prompt
```

### Text-to-Image

**Focus:** Describing what exists
**Phrasing:** Descriptive (typically)
**Blocks:** Subject + environment + composition + lighting + style

**Example:**
```
Portrait of young adult female, striking green eyes, long auburn hair,
neutral studio backdrop, soft diffused lighting, photorealistic
```

### Image-to-Video

**Focus:** Describing what happens (motion)
**Phrasing:** Descriptive (typically)
**Blocks:** Motion/Action + camera movement + motion style

**Example:**
```
Person slowly turns head toward camera, subtle smile forming,
slight camera push-in, smooth natural motion
```

**Key:** Do NOT describe visuals (image already has them). Describing visuals creates conflict → poor results.

**Prompting Techniques:**

**Insinuated motion** (implicit):
```
"The subject runs across the dusty desert"
(Implies dust will move/trail)
```

**Described motion** (explicit):
```
"The subject runs across the desert. Dust trails behind them as they move."
(Explicitly states the dust behavior)
```

**When to use:**
- Insinuating creates more natural results
- Describing creates emphasis on specific elements
- Combine both approaches for stronger effect
- Test which works better for your specific model/scene

### Text-to-Video

**Focus:** Describing visuals AND motion
**Phrasing:** Descriptive (typically)
**Blocks:** Complete scene + action

**Example:**
```
Young woman with auburn hair in cozy living room, warm lighting,
looks up from book, smiles at camera, slow push-in, 5 seconds,
photorealistic
```

### Modality Prompt Summary

| Modality | Visuals? | Motion? | Phrasing | Why? |
|----------|----------|---------|----------|------|
| text-to-image | ✅ | ❌ | Descriptive | Static image |
| image-to-video | ❌ | ✅ | Descriptive | Image has visuals |
| text-to-video | ✅ | ✅ | Descriptive | Creating everything |

---

## 5. Formulas & Blocks

> See `prompt-formula-framework-v2.md` for complete methodology on formulas, blocks, block libraries, and output formats.

**Quick overview:**

A **formula** is a systematic template for creating prompts. It defines:
1. Which blocks to include
2. In what order
3. For which purpose (specific modality + task)

**Blocks** are the atomic components that formulas are built from. They use hierarchical dot notation:
- `[Medium] = fashion photography`
- `[Scene.Subject.Age] = young adult`
- `[Lighting.Type] = golden hour light`

**Core blocks** are leaf nodes that can't be meaningfully subdivided further and have creative freedom in their values.

**Block libraries** are curated collections of blocks organized by category and use case.

---

## 6. Detail Levels

**The same formula can produce prompts with different detail levels:**

**Formula:** `[art style] [subject] [scene] [lighting] [color]`

**Low Detail:**
```
A cinematic photo of a peacock in the water. The lighting is even,
creating subtle shadows, with a muted natural color palette.
```

**High Detail:**
```
A cinematic photo of a peacock diving under turquoise water leaving
a stream of bubbles behind it. The composition is close-up and centered
with a shallow depth of field, creating a soft blur in the background
and foreground water. Natural sunlight creates intricate caustic patterns
across the peacock's body and onto the submerged feathers. The color
palette consists of deep blues and teals in the water, contrasting with
the peacock's rich colors.
```

**Key insight:**
- Formula = Structure (which blocks to include)
- Detail level = Depth (how much you populate each block)
- More detail ≠ always better
- Test to find optimal detail level for your model and use case

**How to control detail level:**
- **Add more blocks** - Include additional aspects (lighting, camera angle, texture)
- **Enrich existing blocks** - Add more descriptive content within each block
- **Combine both** - More blocks + richer descriptions = maximum control

**Important caveats:**
- More detail = more control, but diminishing returns exist
- Even perfect detailed prompts are limited by model prompt adherence (see below)
- Test to find the optimal detail level for your specific model

The goal is finding the balance: enough detail to guide the model, not so much that you exceed its adherence capabilities.

---

## 7. Prompting Best Practices

### Language Evolution

**Modern models use natural, descriptive language:**
- Old: `woman, long hair, smiling, beach, sunset, 4k`
- New: `Woman with long hair smiles warmly while walking on beach at sunset`

### Modality-Specific Formulas

**Note:** These are example block structures for common use cases. Block selection should be based on your specific task requirements, not treated as fixed standards.

**Text-to-Image Example:**
`[Medium] [Subject] [Details] [Environment] [Lighting] [Composition] [Style]`

**Image-to-Video Example:**
`[Motion.Action] [Camera.Movement] [Motion.Style]`

**Text-to-Video Example:**
`[Medium] [Subject] [Action] [Environment] [Lighting] [Camera] [Style]`

**Note:** For models with audio generation capabilities (e.g., Veo 3), text-to-video formulas can also include audio blocks:
- `[Dialogue]` - Quoted speech
- `[SFX]` - Sound effects descriptions
- `[Ambient]` - Environmental soundscape

### Block Order Matters

- AI models often weight earlier elements more heavily
- Test different orderings
- Platform-specific variations exist
- Prioritize important elements early

### Natural Flow

Prompts should read coherently:
```
Good: Young woman sits in cozy room, warm light streaming through
      window, reading book, looks up with gentle smile

Poor: Woman, book, smile, young, cozy, room, window, warm, light
```

### Model-Specific Considerations

Different platforms and models may have specific preferences. Common patterns include:

**Negative Prompts:**
Some models (e.g., Veo 3) support a separate `negativePrompt` parameter to specify what you DON'T want in the output:
```
Prompt: "Generate a short animation of a large oak tree with leaves blowing in wind"
Negative Prompt: "urban background, man-made structures, dark, stormy atmosphere"
```
Note: When using negative prompts, describe what to avoid (not instructive language like "no" or "don't").

**Phrasing Preferences:**
- **Use positive phrasing** - Describe what should happen, not what to avoid
  - ❌ "No camera movement. The camera doesn't move."
  - ✅ "Locked camera. The camera remains still."

**Language Style:**
- **Avoid conversational language** - Skip greetings, pleasantries, questions
  - ❌ "Can you please add a dog to the scene?"
  - ✅ "A dog runs into the scene from off-camera"

- **Avoid command-based prompts** - Describe instead of instructing
  - ❌ "Add more lighting" or "Make it brighter"
  - ✅ "Bright natural sunlight fills the room"

**Prompt Complexity:**
- **Keep prompts direct and simple** - Avoid overly conceptual language
  - ❌ "The subject embodies the essence of joyful greeting"
  - ✅ "The woman smiles and waves"

- **Single scene focus** - Consider duration limits (5-10s = one scene)
  - ❌ "Cat transforms into dragon while jumping through forest that changes seasons..."
  - ✅ "Cat transforms into dragon while running through forest"

**Always consult:**
- Platform documentation
- Model-specific prompting guides
- Community best practices
- Recent updates and changes

### Model Prompt Adherence

Different models have varying levels of **prompt adherence** - how accurately they follow your instructions.

**Key points:**
- Even well-crafted prompts may not work equally well across all models
- Some models excel at complex instructions, others work better with simplicity
- Certain elements (specific angles, subtle emotions, precise positioning) are harder for models to follow
- Prompt adherence varies between models and even between model versions

**Testing approach:**
- Test the same prompt across different models to compare results
- Identify which prompt elements the model follows vs. ignores
- Adjust prompting strategy based on model strengths and limitations
- Sometimes simplification improves adherence more than adding detail

**Bottom line:** A "perfect" prompt for one model may fail on another. Testing is essential.

---

## 8. Complete Workflow Examples

> These examples use the format structures from `prompt-formula-framework-v2.md`. Reference that document for detailed format explanations.

### Example 1: Controlled Video (Two-Step)

**Goal:** 8-second video with visual control

**Workflow:**
```
text-to-image → image-to-video
```

**Step 1: Text-to-Image Formula**
```
[Medium] = product photography
[Subject] = elegant perfume bottle, gold accents
[Environment] = minimalist pedestal, white backdrop
[Lighting] = soft diffused studio lighting
[Composition] = centered, slightly elevated
[Style] = high-end commercial
```

**Step 1 Prompt:**
```
Product photography of elegant perfume bottle with gold accents on
minimalist pedestal, white backdrop, soft diffused studio lighting,
centered from slightly elevated angle, high-end commercial style
```

**Step 2: Image-to-Video Formula**
```
[Motion] = bottle rotates slowly clockwise
[Camera.Movement] = subtle dolly-in
[Motion.Style] = smooth, luxurious
```

**Step 2 Prompt:**
```
Bottle rotates slowly clockwise, subtle camera dolly-in,
smooth luxurious motion
```

---

### Example 2: Character Consistency (30 seconds)

**Goal:** AI influencer gym video with consistent character across 6 scenes

**Workflow:** (7 steps as shown in Part 3)

**Formula 1: Character Persona (LLM)**
```
[Character.Name] = Alex Rivera
[Character.Age] = 27
[Character.Background] = LA fitness enthusiast
[Character.Personality] = Motivated, disciplined, inspiring
```

**Formula 2: Character Appearance (text-to-image)**
```
[Medium] = portrait photograph
[Subject.Demographics] = late-20s athletic male
[Subject.Physical] = defined jawline, focused eyes, short dark hair
[Subject.Style] = casual athletic wear
[Environment] = neutral backdrop
[Technical] = professional portrait, soft natural light
[Style] = photorealistic
```

**Formula 3: Character References (image-to-image)**
- Generate angles (front, 3/4, side)
- Generate expressions (neutral, smiling, focused)
- Generate poses (standing, seated, action)

**Formula 4: Activity Breakdown (LLM)**
```
Activity: Going to the gym
Scenes: [gym entrance, stretching, bench press, treadmill, water break, leaving]
```

**Formula 5: Lifestyle Text-to-Image (with character refs)**
```
[Medium] = lifestyle photography
[Scene] = bench press at minimalist gym
[Subject] = (character references)
[Subject.Outfit] = athletic tank, gym shorts
[Environment] = concrete gym, natural window light
[Technical] = handheld feel, high detail
[Style] = authentic, energetic
```

**Formula 6: Lifestyle Image-to-Video**
```
[Motion] = lifts barbell, chest to extended arms, steady form
[Camera.Movement] = subtle push-in
[Motion.Style] = smooth, powerful, realistic
```

**Result:** 6 clips × 5 seconds = 30-second video with consistent character

---

## System Hierarchy

```
GOAL → Final Output
  ↓
WORKFLOW → Chain of modalities
  ↓
FOR EACH STEP:
  MODALITY → text-to-image? image-to-video? text-to-video?
    ↓
  PROMPTING APPROACH
    ├─ Focus (what to describe)
    ├─ Phrasing Style (descriptive or narrative)
    └─ Formula (structure)
      ↓
    BLOCKS → Which components?
      ↓
    DETAIL LEVEL → How much depth?
      ↓
    FINAL PROMPT → Natural text
      ↓
  MODEL → Execute
    ↓
  OUTPUT → Next step input
  ↓
ITERATION → Test & refine
  ↓
FINAL → Combine outputs
```

### Key Relationships

- **Modalities** define capabilities
- **Workflows** chain modalities
- **Prompting Approach** has three components: Focus, Phrasing Style, Formula
- **Formulas** systematize prompts via blocks
- **Blocks** are reusable components
- **Detail levels** control prompt depth
- **Testing** refines everything

---

## Applying This Framework

> See `prompt-formula-framework-v2.md` for LLM usage rules (assembly rules, generation rules, etc.)

1. **Define goal** - Establish concept and final output requirements
2. **Map workflow** - Modalities needed, in order
3. **Choose prompting approach** - Focus, phrasing style, formula structure
4. **Identify and build blocks** - Select blocks for your use case, reference block library if available
5. **Test initial prompts** - Adjust detail level until you get desired look/vibe
6. **Systematic testing** - Vary specific elements to refine results
7. **Refine formula** - Iterate based on learnings
8. **Document** - Capture what works for future use (use output formats from framework)

---

**End of Guide v5.0**
