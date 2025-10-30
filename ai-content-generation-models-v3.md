# AI Content Generation Models: A Model-Agnostic Framework

**Version**: 3.0
**Date**: 2025-10-29

---

## 1. Understanding AI Models

### Why Model-Agnostic?

The AI model landscape changes constantly - new models release monthly, "best" models change weekly, specific names become outdated quickly. Instead of learning "Veo 3.1" or "DALL-E 4", focus on:

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
1. Identify modality needed (text-to-image, image-to-video, etc.)
2. Choose best model for specific purpose
3. Access via appropriate platform

---

## 2. Modalities: Model Capabilities

**Modality = A specific input→output capability**

Modern models often support multiple modalities. Understanding modalities helps you choose the right tool, design effective workflows, and switch between models easily.

### Image Generation Modalities

- **text-to-image (t2i)** - Text → generated image
- **image-to-image (i2i)** - Image + text → transformed image (style transfer, variations)
- **image-to-image_edit (i2i_edit)** - Image + text + region → edited image
- **realtime-canvas** - Live text/image input → real-time generation

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
While this framework focuses on generation modalities, real-world workflows can also include:
- Upscaling (enhance resolution)
- Lip sync (dialogue synchronization)
- Audio processing (mixing, effects)
- Color grading
- Background removal
- Other utilities and post-processing

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

**Note:** The D2C (direct-to-camera) template in your project uses this technique for character consistency across 3 scenes.

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

### Why Prompts Differ

Each modality has different information needs:
- **text-to-image**: No visuals exist → describe everything
- **image-to-video**: Visuals exist (from image) → describe motion only
- **text-to-video**: Nothing exists → describe both visuals and motion

### The Selection Flow

**How to choose blocks for your prompt:**

```
1. MODALITY
   What capability are you using?
   (text-to-image, image-to-video, text-to-video, etc.)

2. APPROACH
   What's the prompting strategy for this modality?
   - text-to-image: Describe what exists (visuals)
   - image-to-video: Describe what happens (motion only)
   - text-to-video: Describe both (visuals + motion)

3. BLOCK SETS
   Which blocks do you select based on the approach?
   - For visuals: [Medium] [Subject] [Environment] [Lighting] [Style]
   - For motion: [Motion.Action] [Camera.Movement] [Duration]
   - For both: Combine visual and motion blocks
```

**Example:**
- Modality: image-to-video
- Approach: Describe motion only (image has visuals)
- Block sets: Select motion, camera, duration blocks (NOT visual description blocks)

### Text-to-Image

**What:** Describing what exists
**Focus:** Subject + environment + composition + lighting + style

**Example:**
```
Portrait of young adult female, striking green eyes, long auburn hair,
neutral studio backdrop, soft diffused lighting, photorealistic
```

### Image-to-Video

**What:** Describing what happens (motion)
**Focus:** Action + camera movement + duration + motion style

**Example:**
```
Person slowly turns head toward camera, subtle smile forming,
slight camera push-in, 5 seconds, smooth natural motion
```

**Key:** Do NOT describe visuals (image already has them). Describing visuals creates conflict → poor results.

### Text-to-Video

**What:** Describing visuals AND motion
**Focus:** Complete scene + action

**Example:**
```
Young woman with auburn hair in cozy living room, warm lighting,
looks up from book, smiles at camera, slow push-in, 5 seconds,
photorealistic
```

### Modality Prompt Summary

| Modality | Visuals? | Motion? | Why? |
|----------|----------|---------|------|
| text-to-image | ✅ | ❌ | Static image |
| image-to-video | ❌ | ✅ | Image has visuals |
| text-to-video | ✅ | ✅ | Creating everything |

---

## 5. Prompt Formulas

**Formula = A systematic template for creating prompts**

Formulas provide structure, consistency, scalability, and optimize-ability.

### What Is a Formula?

A formula defines:
1. Which blocks to include
2. In what order
3. For which purpose (specific modality + task)

### Formula Examples

For the character consistency workflow (Part 3), we need 6 different formulas:

1. **Character Persona** (LLM) - Background, personality, motivation
2. **Character Appearance** (t2i) - Main reference portrait
3. **Character Consistency** (i2i) - Variations (angles, expressions)
4. **Scene Breakdown** (LLM) - Activity → filmable scenes
5. **Lifestyle T2I** (t2i + refs) - Scene images with character
6. **Lifestyle I2V** (i2v) - Animate scene images

**Same modality, different tasks = different formulas**
- Portrait Formula (text-to-image): Person, facial features, expression
- Environment Formula (text-to-image): Setting, atmosphere, no people

---

## 6. Prompt Blocks

**Blocks = Atomic components that formulas are built from**

Blocks provide modularity, reusability, flexibility, and organization.

### Block Structure

Blocks use hierarchical dot notation:

```
[Block]                           - Single level
[Category.Block]                  - Two levels
[Category.Subcategory.Block]      - Three levels
```

**Examples:**
```
[Medium] = fashion photography
[Scene.Subject.Age] = young adult
[Scene.Subject.Facial.Eyes] = piercing blue eyes
[Lighting.Type] = golden hour light
```

### How Blocks Build Formulas

**Formula: Portrait Photography**

**Blocks:**
```
[Medium] = portrait photograph
[Scene.Subject.Age] = young adult
[Scene.Subject.Gender] = female
[Scene.Subject.Eyes] = striking green eyes
[Scene.Subject.Hair] = long wavy auburn hair
[Scene.Environment] = neutral studio backdrop
[Technical.Lighting] = soft diffused lighting
[Style] = photorealistic
```

**Generated Prompt:**
```
Portrait photograph of young adult female with striking green eyes
and long wavy auburn hair, neutral studio backdrop, soft diffused
lighting, photorealistic
```

### Block Libraries

**Block Library = Curated collection of blocks for your use case**

Libraries contain:
- Block hierarchies (paths)
- Suggested values
- Platform-specific considerations
- Best practices

**For complete block methodology:** See [Prompt Formula Methodology Documentation](./prompt-formula-methodology.md)

**For block library database:** A comprehensive block library database exists as a separate document with organized blocks, categories, and values for various use cases.

### Detail Levels

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

---

## 7. Prompting Best Practices

### Language Evolution

**Modern models use natural, descriptive language:**
- Old: `woman, long hair, smiling, beach, sunset, 4k`
- New: `Woman with long hair smiles warmly while walking on beach at sunset`

### Modality-Specific Formulas

**Text-to-Image Structure:**
`[Medium] [Subject] [Details] [Environment] [Lighting] [Composition] [Style]`

**Image-to-Video Structure:**
`[Motion.Action] [Camera.Movement] [Duration] [Motion.Style]`

**Text-to-Video Structure:**
`[Medium] [Subject] [Action] [Environment] [Lighting] [Camera] [Duration] [Style]`

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

### Key Tips

**For text-to-image:**
- Be specific about composition and lighting
- Include style/mood references

**For image-to-video:**
- Focus on verbs (action words)
- Don't describe what's in the image
- Specify timing/duration

**For text-to-video:**
- Combine text-to-image and image-to-video approaches
- Ensure visual and motion descriptions align

**Always consult:**
- Platform documentation
- Prompting guides
- Community best practices

---

## 8. Complete Workflow Examples

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
[Duration] = 8 seconds
[Motion.Style] = smooth, luxurious
```

**Step 2 Prompt:**
```
Bottle rotates slowly clockwise, subtle camera dolly-in, 8 seconds,
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
[Duration] = 5 seconds
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
  FORMULA → Which template?
    ↓
  BLOCKS → Which components?
    ↓
  VALUES → Fill blocks
    ↓
  PROMPT → Natural text
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
- **Prompts** communicate with modalities
- **Formulas** systematize prompts
- **Blocks** are reusable components
- **Values** populate blocks
- **Testing** refines everything

---

## Applying This Framework

1. **Define goal** - Final output requirements
2. **Map workflow** - Modalities needed, in order
3. **Select formulas** - Prompts for each step
4. **Build/use blocks** - Reference block library database
5. **Test & refine** - Iterate on outputs
6. **Document** - Capture what works

---

**End of Framework Documentation v3.0**
