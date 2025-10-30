# AI Content Generation Models: A Model-Agnostic Framework

**Version**: 2.0
**Date**: 2025-10-29

---

## 1. Understanding AI Models

### What Are AI Models?

AI models are trained systems that transform inputs into outputs. In content generation:
- **Input**: Text prompts, images, videos, reference materials
- **Output**: Generated images, videos, 3D models, etc.
- **Training**: Models learn patterns from massive datasets

### Why Model-Agnostic?

**The AI model landscape changes constantly:**
- New models release monthly
- Companies compete aggressively (Stability AI, Runway, Google, OpenAI, etc.)
- "Best model" changes week-to-week
- Specific model names become outdated quickly

**The solution: Think in capabilities, not names**

Instead of learning "Veo 3.1" or "DALL-E 4", focus on:
1. **Modalities** - What can models do?
2. **Workflows** - How do we chain capabilities?
3. **Prompting** - How do we communicate effectively?

This framework works regardless of which specific models exist.

---

## 2. Modalities: Model Capabilities

**Modality = A specific input→output capability**

Modern models often support multiple modalities. Understanding modalities helps you:
- Choose the right tool for each task
- Design effective workflows
- Switch between models easily

### Image Generation Modalities

**text-to-image (t2i)**
- Input: Text description
- Output: Generated image
- Use: Creating visuals from scratch

**image-to-image (i2i)**
- Input: Image + text guidance
- Output: Transformed image
- Use: Style transfer, variations, references

**image-to-image_edit (i2i_edit)**
- Input: Image + text + region selection
- Output: Edited image
- Use: Targeted modifications

**realtime-canvas**
- Input: Live text/image input
- Output: Real-time generation
- Use: Interactive creation

### Video Generation Modalities

**text-to-video (t2v)**
- Input: Text description
- Output: Generated video
- Use: Creating motion from scratch
- Note: Describes both visuals AND motion

**image-to-video (i2v)**
- Input: Single image (or start+end frames) + text
- Output: Animated video
- Use: Bringing still images to life
- Note: Text guides motion only (visuals from image)

**frames-to-video**
- Input: First frame + last frame + text
- Output: Interpolated video between frames
- Use: Smooth transitions, controlled motion

**video-to-video (v2v)**
- Input: Video + text guidance
- Output: Transformed video
- Use: Restyle existing footage

**video-to-video_edit (v2v_edit)**
- Input: Video + text + targeting
- Output: Edited video
- Use: Targeted video modifications

**reference-to-video**
- Input: Text + reference images (characters, products, etc.)
- Output: Video featuring reference elements
- Use: Character consistency, product integration
- Also called: "elements" or "ingredients"

**performance-transfer**
- Input: Performance video + character/target
- Output: Motion/expression transferred to character
- Use: Animation from real performances

### 3D Generation Modalities

**text-to-3d (t2-3d)**
- Input: Text description
- Output: 3D model
- Use: Creating 3D assets from descriptions

**image-to-3d (i2-3d)**
- Input: Image(s)
- Output: 3D model
- Use: Converting 2D to 3D

### Multi-Modal Models

**Important:** Most modern models support multiple modalities.

Example - A model might support:
- t2v (text→video)
- i2v (image→video with first frame)
- frames-to-video (first+last frame→video)

This flexibility allows different workflow approaches with the same model.

---

## 3. AI Generation Workflows

**Workflow = Chaining modalities to achieve a final output**

Think of workflows like ComfyUI node graphs - each step uses a specific modality, feeding outputs to the next step.

### Why Workflows Matter

**Constraints drive workflows:**
- Duration limits (e.g., 8-second max per generation)
- Consistency requirements (same character across scenes)
- Quality goals (more control over specific aspects)
- Creative flexibility (iterate on specific parts)

**Solution: Break into steps**

### Simple Workflow

```
Goal: 8-second video

Workflow:
text → video (t2v)

Steps: 1
Models: 1
```

### Two-Step Workflow

```
Goal: 8-second video with precise visual control

Workflow:
text → image (t2i)
   ↓
image → video (i2v)

Steps: 2
Models: 2
Advantage: Can iterate on image before animating
```

### Multi-Scene Workflow

```
Goal: 30-second video (exceeds single generation limit)

Workflow:
text → scene breakdown (LLM)
   ↓
For each scene:
  text → video (t2v) [8 seconds each]
   ↓
video editing → combined video

Steps: 1 + (N scenes × 1) + 1
Result: 30+ seconds of content
```

### Character Consistency Workflow

```
Goal: 30-second video with same character throughout

Workflow:
1. Character persona (LLM)
2. Character appearance (t2i - portrait)
3. Character reference library (i2i - variations)
4. Activity breakdown (LLM - 6 scenes)
5. Scene images (t2i + character references)
6. Scene animations (i2v × 6)
7. Video stitching (editing)

Steps: 7
Models: Multiple
Prompts needed: 6 different formulas
Result: Consistent character across full video
```

### Key Workflow Principles

1. **Each step can use different models/modalities**
2. **Outputs become inputs** for subsequent steps
3. **Different prompts** required at each step
4. **Consistency** often requires reference workflows
5. **Duration limits** drive multi-step approaches

---

## 4. Prompts & Modalities

**Critical insight: Different modalities require fundamentally different prompts**

### Why Prompts Differ by Modality

Each modality has different information needs:
- **t2i**: No visuals exist → describe everything
- **i2v**: Visuals exist (from image) → describe motion only
- **t2v**: No visuals or motion exist → describe both

Sending the wrong prompt type produces poor results.

### Text-to-Image (t2i) Prompts

**What you're doing:** Describing what exists in the scene

**Information needed:**
- Subject/person description
- Environment/setting
- Composition/framing
- Lighting and atmosphere
- Style and technical details

**Example:**
```
Portrait photograph of a young adult female, striking green eyes,
long wavy auburn hair, wearing minimalist makeup, neutral studio
backdrop, soft diffused lighting, medium format camera, photorealistic,
high resolution
```

**Focus:** Complete visual description

### Image-to-Video (i2v) Prompts

**What you're doing:** Describing what happens (motion)

**Information needed:**
- Subject motion/action
- Camera movement (if any)
- Duration
- Motion style/quality
- Continuity goals

**Example:**
```
Person slowly turns head to look directly at camera, subtle smile forming,
slight camera push-in, 5 seconds, smooth natural motion
```

**Focus:** Motion and action only - NOT appearance (image already provides that)

**Key difference:** If you describe visuals in i2v prompts, the model gets conflicting information (prompt says one thing, image shows another) → poor results

### Text-to-Video (t2v) Prompts

**What you're doing:** Describing both visuals AND motion

**Information needed:**
- Everything from t2i (appearance, setting, etc.)
- Everything from i2v (motion, action, camera)
- How they work together

**Example:**
```
Young adult woman with long auburn hair, wearing casual clothing,
sitting in cozy living room with warm lighting. She looks up from
her book, smiles warmly at camera, slow camera push-in, natural
afternoon light, 5 seconds, photorealistic
```

**Focus:** Complete scene + complete action

### Prompt Type Summary

| Modality | Describe Visuals? | Describe Motion? | Why? |
|----------|-------------------|------------------|------|
| t2i | ✅ Yes | ❌ No | Creating static image |
| i2v | ❌ No | ✅ Yes | Image has visuals, need motion |
| t2v | ✅ Yes | ✅ Yes | Creating everything |

---

## 5. Prompt Formulas

**Formula = A systematic template for creating prompts**

As workflows grow complex, manually writing prompts becomes inconsistent and error-prone. Formulas provide:
- **Structure** - Repeatable template
- **Consistency** - Same quality across generations
- **Scalability** - Easy to create many prompts
- **Optimization** - Test and refine once, apply everywhere

### What Is a Formula?

A formula defines:
1. **Which blocks** to include (components)
2. **In what order** (arrangement)
3. **For which purpose** (specific modality + task)

### Different Formulas for Different Tasks

**Same modality, different tasks = different formulas**

Example - Two t2i formulas:
- **Portrait Formula**: Focus on person, facial features, expression
- **Environment Formula**: Focus on setting, atmosphere, no people

**Different modalities = different formulas**

Example:
- **t2i Formula**: Describe complete scene
- **i2v Formula**: Describe motion only

### Formula Types in a Workflow

For the character consistency workflow (Part 3), we needed **6 different formulas**:

1. **Character Persona Formula** (LLM output)
   - Purpose: Generate background, personality, motivation
   - Output: Text description

2. **Character Appearance Formula** (t2i)
   - Purpose: Create main reference portrait
   - Output: Single image

3. **Character Consistency Formula** (i2i)
   - Purpose: Generate variations (angles, expressions)
   - Output: Reference library (multiple images)

4. **Activity Scene Breakdown** (LLM output)
   - Purpose: Break activity into filmable scenes
   - Output: List of scene descriptions

5. **Lifestyle T2I Formula** (t2i + refs)
   - Purpose: Generate scene images with character
   - Output: Image for each scene

6. **Lifestyle I2V Formula** (i2v)
   - Purpose: Animate scene images
   - Output: Video clips

### Formula Construction Principles

1. **Purpose-driven**: Each formula serves specific goal
2. **Modality-aware**: Respects input/output requirements
3. **Reusable**: Same formula across similar tasks
4. **Testable**: Can iterate and optimize
5. **Documented**: Captured for future use

---

## 6. Prompt Blocks

**Blocks = The atomic components that formulas are built from**

If formulas are sentences, blocks are words. Blocks provide:
- **Modularity** - Mix and match components
- **Reusability** - Same block in multiple formulas
- **Flexibility** - Add/remove/reorder as needed
- **Organization** - Hierarchical structure

### Block Structure

Blocks use **hierarchical dot notation**:

```
[Block]                              Single level
[Category.Block]                     Two levels
[Category.Subcategory.Block]         Three levels
[Category.Sub.Detail.Block]          Four+ levels
```

**Examples:**
```
[Medium] = fashion photography
[Scene.Subject.Age] = young adult
[Scene.Subject.Facial.Eyes] = piercing blue eyes
[Scene.Environment.Lighting.Type] = golden hour light
```

### Block Hierarchy Rationale

**Why use dot notation?**
- **Clear relationships**: `Scene.Subject.Age` shows Age belongs to Subject belongs to Scene
- **Organized libraries**: Group related blocks together
- **Flexible depth**: Use as many levels as needed
- **Easy navigation**: Find blocks by category

### Block Components

**Each block has:**
1. **Path** - Its hierarchical location `[Category.Subcategory.Block]`
2. **Values** - The actual content that goes in the prompt
3. **Purpose** - What role it serves in the formula

**Example block:**
```
Path: [Scene.Subject.Demographics.Age]
Values: [young adult, middle-aged, mature, elderly]
Purpose: Specify person's age range in scene
```

### How Blocks Build Formulas

**Example Formula: Portrait Photography**

**Blocks used:**
```
[Medium]
[Scene.Subject.Demographics.Age]
[Scene.Subject.Demographics.Gender]
[Scene.Subject.Physical.Eyes]
[Scene.Subject.Physical.Hair]
[Scene.Environment.Setting]
[Technical.Lighting]
[Technical.Camera]
[Style]
```

**Populated with values:**
```
[Medium] = portrait photograph
[Scene.Subject.Demographics.Age] = young adult
[Scene.Subject.Demographics.Gender] = female
[Scene.Subject.Physical.Eyes] = striking green eyes
[Scene.Subject.Physical.Hair] = long wavy auburn hair
[Scene.Environment.Setting] = neutral studio backdrop
[Technical.Lighting] = soft diffused lighting
[Technical.Camera] = medium format camera
[Style] = photorealistic, high resolution
```

**Generated prompt:**
```
Portrait photograph of a young adult female with striking green eyes
and long wavy auburn hair, neutral studio backdrop, soft diffused
lighting, shot on medium format camera, photorealistic, high resolution
```

### Block Selection Principles

**You don't need to use all blocks:**
- Choose blocks relevant to your specific goal
- More blocks = more detailed prompt (not always better)
- Some models work better with concise prompts
- Test to find optimal block set

### Block Libraries

**Block Library = Curated collection of blocks for your use case**

Libraries contain:
- Block hierarchies (paths)
- Suggested values for common scenarios
- Platform-specific considerations
- Best practice examples

Libraries are maintained separately from this framework.

**For complete block methodology, see:** [Prompt Formula Methodology Documentation](./prompt-formula-methodology.md)

---

## 7. Prompting Best Practices

### Prompt Language Evolution

**Old models (legacy):**
- Format: Tags separated by commas
- Example: `woman, long hair, smiling, beach, sunset, 4k, photorealistic`
- Why: Early models trained on tagged datasets

**Modern models (current):**
- Format: Descriptive, narrative, conversational text
- Example: `A woman with long flowing hair smiles warmly as she walks along the beach during golden hour sunset, photorealistic quality`
- Why: Trained on natural language

**Use natural, descriptive language with modern models**

### How Modalities Affect Formulas

Different modalities have different formula requirements:

#### T2I Formula Structure
```
[Medium]
[Subject]
[Subject.Details]
[Environment]
[Environment.Details]
[Lighting]
[Composition]
[Technical]
[Style]
```
**Focus:** Complete visual description

#### I2V Formula Structure
```
[Motion.Subject]
[Motion.Action]
[Camera.Movement]
[Duration]
[Motion.Style]
[Continuity.Goal]
```
**Focus:** Motion and timing only

#### T2V Formula Structure
```
[Medium]
[Subject]
[Subject.Action]
[Environment]
[Lighting]
[Camera.Movement]
[Duration]
[Style]
```
**Focus:** Visuals + motion combined

### Block Order Matters

**AI models prioritize different parts of prompts:**
- Earlier elements often weighted more heavily
- Order affects interpretation
- Platform-specific variations exist

**Best practice:**
1. Test different orderings
2. Document what works
3. Adjust per platform/model
4. Prioritize most important elements early

### Token Limits

**Most models have token/character limits:**
- Respect platform limits
- Concise > verbose (usually)
- Test if longer prompts improve results
- Remove redundancy

**Balance detail with brevity**

### Natural Flow

**Prompts should read coherently:**
- Use complete sentences (modern models)
- Logical progression of information
- Related concepts grouped together
- Avoid jarring transitions

**Good flow:**
```
Young woman with auburn hair sits in cozy living room, warm afternoon
light streaming through window, reading a book, looking up with gentle
smile, natural and relaxed
```

**Poor flow:**
```
Auburn hair, book, smile, woman, young, cozy, living room, window,
afternoon, warm light, natural, relaxed
```

### Modality-Specific Tips

**For t2i:**
- Be specific about composition
- Describe lighting clearly
- Include style/mood references
- Technical details (camera, lens) can help

**For i2v:**
- Focus on verbs (action words)
- Avoid describing what's already in image
- Specify timing/duration
- Camera movement optional but can enhance

**For t2v:**
- Combine t2i and i2v approaches
- Ensure visual and motion descriptions align
- Don't contradict yourself (visuals vs motion)
- Test if breaking into t2i→i2v gives better control

### Platform-Specific Considerations

**Always consult:**
- Official model documentation
- Platform prompting guides
- Community best practices
- Recent updates/changes

**Models differ in:**
- Preferred prompt structure
- Keyword sensitivity
- Technical term understanding
- Negative prompts (what NOT to generate)

---

## 8. Complete Workflow Examples

### Example 1: Simple Video (8 seconds)

**Goal:** Quick promotional video

**Workflow:**
```
text → video (t2v)
```

**Formula:** Basic T2V Formula

**Blocks:**
```
[Medium] = cinematic video
[Scene.Subject] = product showcase
[Scene.Action] = rotating slowly on pedestal
[Scene.Environment] = minimalist white studio
[Lighting] = soft professional lighting
[Duration] = 8 seconds
[Style] = clean, professional
```

**Prompt:**
```
Cinematic video of product slowly rotating on pedestal in minimalist
white studio, soft professional lighting, 8 seconds, clean professional
style
```

**Result:** Single 8-second video clip

---

### Example 2: Controlled Video (8 seconds)

**Goal:** More control over exact visuals before animation

**Workflow:**
```
Step 1: text → image (t2i)
   ↓
Step 2: image → video (i2v)
```

**Step 1 Formula:** Product T2I Formula

**Step 1 Blocks:**
```
[Medium] = product photography
[Subject] = elegant perfume bottle
[Subject.Details] = gold accents, clear glass
[Environment] = minimalist pedestal, white backdrop
[Lighting] = soft diffused studio lighting
[Composition] = centered, slightly elevated angle
[Style] = high-end commercial photography
```

**Step 1 Prompt:**
```
Product photography of elegant perfume bottle with gold accents and
clear glass, on minimalist pedestal against white backdrop, soft
diffused studio lighting, centered composition from slightly elevated
angle, high-end commercial style
```

**Step 2 Formula:** Product I2V Formula

**Step 2 Blocks:**
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

**Result:** 8-second video with precise visual control

---

### Example 3: Character Consistency (30 seconds)

**Goal:** AI influencer gym video with consistent character

**Workflow:**
```
1. Character persona (LLM)
2. Character appearance (t2i)
3. Character reference library (i2i)
4. Activity breakdown (LLM)
5. Scene images (t2i + refs)
6. Scene animations (i2v)
7. Video stitching
```

**Formula 1: Character Persona (LLM)**
```
[Character.Name] = Alex Rivera
[Character.Age] = 27
[Character.Background] = Fitness enthusiast from LA
[Character.Personality] = Motivated, disciplined, inspiring
[Character.Style] = Authentic, relatable, encouraging
```

**Formula 2: Character Appearance (t2i)**
```
[Medium] = portrait photograph
[Subject.Demographics] = late-20s athletic male
[Subject.Physical.Face] = defined jawline, focused eyes
[Subject.Physical.Hair] = short dark hair, neat
[Subject.Physical.Build] = athletic, fit
[Subject.Style] = casual athletic wear
[Environment] = neutral studio backdrop
[Technical.Camera] = professional portrait lens
[Technical.Lighting] = soft natural light
[Style] = photorealistic, high detail
```

**Prompt:**
```
Portrait photograph of late-20s athletic male with defined jawline,
focused eyes, short neat dark hair, athletic fit build, wearing casual
athletic wear, neutral studio backdrop, professional portrait lens,
soft natural lighting, photorealistic high detail
```

**Formula 3: Character References (i2i)**
- Generate multiple angles (front, 3/4, side, back)
- Generate multiple expressions (neutral, smiling, focused)
- Generate multiple poses (standing, seated, action)
- These become reference images for consistency

**Formula 4: Activity Breakdown (LLM - Single-Use Prompt)**
```
Activity: Going to the gym
Output: 6 filmable scenes
1. Arriving at gym entrance
2. Warm-up stretching
3. Bench press workout
4. Treadmill cardio
5. Cooldown water break
6. Leaving satisfied
```

**Formula 5: Lifestyle T2I (with character refs)**
```
[Medium] = lifestyle photography
[Scene.Description] = working out at minimalist gym
[Subject] = (use character references)
[Subject.Action] = bench pressing weights
[Subject.Outfit] = athletic tank top, gym shorts
[Environment] = concrete gym interior, minimal equipment
[Lighting] = natural light from windows
[Technical] = handheld camera feel, high detail
[Style] = authentic, energetic
```

**Prompt (Scene 3 - Bench Press):**
```
Lifestyle photography of athletic man bench pressing weights at
minimalist concrete gym, wearing athletic tank top and gym shorts,
natural light from windows, handheld camera feel, authentic energetic
style, high detail
```
*(Plus reference images passed to model)*

**Formula 6: Lifestyle I2V**
```
[Motion] = person lifts barbell in controlled motion
[Motion.Detail] = chest to extended arms, steady form
[Camera.Movement] = subtle push-in
[Duration] = 5 seconds
[Motion.Style] = smooth, powerful, realistic
```

**Prompt (Scene 3 - Bench Press):**
```
Person lifts barbell in controlled motion from chest to extended arms
with steady form, subtle camera push-in, 5 seconds, smooth powerful
realistic motion
```

**Step 7: Stitch**
- Combine 6 video clips (5 seconds each = 30 seconds total)
- Add transitions if needed
- Add audio/music
- Final export

**Total:**
- 6 formulas used
- Multiple models/modalities
- Consistent character throughout
- 30-second final video

---

## System Hierarchy: How It All Works Together

```
1. GOAL: Final Output
   └─ What do you need? (video, image, character, etc.)

2. WORKFLOW DESIGN
   └─ Which modalities needed?
   └─ In what order?
   └─ What are the dependencies?

3. FOR EACH WORKFLOW STEP:

   a. MODALITY SELECTION
      └─ t2i? i2v? t2v? reference-to-video?

   b. FORMULA SELECTION
      └─ Which prompt formula for this modality + task?
      └─ Character appearance? Scene generation? Motion?

   c. BLOCK SELECTION
      └─ Which blocks needed for this formula?
      └─ [Medium], [Subject], [Motion], [Technical]?

   d. VALUE POPULATION
      └─ Fill blocks with specific content
      └─ [Medium] = "cinematic photography"

   e. PROMPT GENERATION
      └─ Combine blocks into natural-flowing text
      └─ Output = actual prompt string

   f. MODEL EXECUTION
      └─ Send prompt to model
      └─ Get output (image/video/text)

   g. OUTPUT BECOMES INPUT
      └─ Feed to next workflow step if needed

4. ITERATION
   └─ Test outputs
   └─ Refine blocks/values/ordering
   └─ Document what works

5. FINAL DELIVERABLE
   └─ Combine all workflow outputs
   └─ (e.g., stitch videos, apply effects)
```

### Key Relationships

- **Models** provide modalities
- **Modalities** define capabilities
- **Workflows** chain modalities together
- **Prompts** communicate with each modality
- **Formulas** systematize prompt creation
- **Blocks** are reusable prompt components
- **Values** populate blocks with content
- **Testing** refines everything

### Example Flow

```
Goal: AI influencer gym video (30s)
       ↓
Workflow: persona → appearance → refs → scenes → images → animate → stitch
       ↓
Step 5: Generate scene images (t2i + character refs)
       ↓
Formula: Lifestyle T2I Formula
       ↓
Blocks: [Medium] [Scene.Description] [Subject.Outfit] [Environment] [Technical]
       ↓
Values: lifestyle photo, gym workout, athletic wear, concrete gym, natural light
       ↓
Prompt: "Lifestyle photograph of person in athletic wear working out
        at minimalist concrete gym, natural lighting, high detail"
       ↓
Model: t2i generates image (using character references)
       ↓
Next Step: Feed image to i2v (Step 6)
```

---

## Next Steps: Applying This Framework

To use this framework for your project:

### 1. Define Your Goal
- What's the final output?
- What are the requirements?
- What constraints exist?

### 2. Map Your Workflow
- Which modalities do you need?
- What order makes sense?
- Where are the dependencies?

### 3. Identify Formula Needs
- What prompts are needed at each step?
- Can you reuse existing formulas?
- Do you need to create new ones?

### 4. Build Block Libraries
- What blocks are needed for your formulas?
- What values work for your use case?
- How should blocks be organized?

### 5. Test and Refine
- Generate outputs with initial formulas
- Analyze results
- Adjust blocks, values, ordering
- Document what works

### 6. Scale and Optimize
- Create reusable formula library
- Optimize for cost and quality
- Automate where possible
- Share learnings with team

---

## Key Advantages

1. **Model-Agnostic** - Works regardless of specific models
2. **Systematic** - Repeatable, consistent approach
3. **Modular** - Reusable components at every level
4. **Scalable** - Easy to expand as needs grow
5. **Optimizable** - Test and refine based on results
6. **Future-Proof** - Principles survive model changes
7. **Teachable** - Clear framework to share with others

---

## Framework Applications

This system works for any systematic AI content generation:

- Character/avatar creation
- Product photography and videos
- Marketing content at scale
- Architecture visualization
- Scientific illustration
- Educational content
- Social media content
- Any multi-step AI workflow

The key is identifying your workflow, formulas, and blocks for your specific use case.

---

**End of Framework Documentation v2.0**
