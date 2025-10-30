# AI Content Generation Models: A Model-Agnostic Framework

  **Version**: 1.0 (First Draft)
  **Date**: 2025-10-29

  ---

  ## Core Principle: Think Modalities, Not Models

  **Key insight**: Specific AI models (Veo 3.1, DALL-E, etc.) change monthly.
  The race never stops. Instead of learning specific models, focus on:

  1. **Modalities** - What inputs/outputs a model supports
  2. **Workflows** - How to chain modalities together
  3. **Prompt Formulas** - How to communicate with each modality

  This framework is **model-agnostic** and future-proof.

  ---

  ## Part 1: Modality Taxonomy

  Modalities define what a model can do. Each model supports one or more
  modalities.

  ### Generation Modalities

  #### Image Generation
  - **text-to-image (t2i)** - Generate image from text description
  - **image-to-image (i2i)** - Transform image using another image as
  style/content reference
  - **image-to-image_edit (i2i_edit)** - Targeted editing via text prompts
  - **realtime-canvas** - Live generation with text/image input

  #### Video Generation
  - **text-to-video (t2v)** - Generate video from text description
  - **image-to-video (i2v)** - Animate a single frame or multiple frames
  (start/end)
  - **video-to-video (v2v)** - Transform/restyle existing video
  - **video-to-video_edit (v2v_edit)** - Targeted editing via text prompts
  - **reference-to-video** - Generate video using reference images (products,
  characters, etc.)
    - Also called "elements" or "ingredients" in some models
  - **performance-transfer** - Transfer motion/expressions/voice from one video
   to character
  - **frames-to-video** - Interpolate between first frame + last frame

  #### 3D Generation
  - **text-to-3d (t2-3d)** - Generate 3D models from text
  - **image-to-3d (i2-3d)** - Generate 3D models from images

  ---

  ## Part 2: AI Generation Workflows

  **Workflow = Chaining multiple models/modalities to achieve a final output**

  Think of workflows like ComfyUI nodes - each step uses a different
  model/modality, feeding its output to the next step.

  ### Simple Workflow Example
  Final output: Video (8 seconds)
  Workflow: text → video (single t2v model)

  ### Multi-Step Workflow Example
  Final output: Video (8 seconds)
  Workflow: text → image (t2i) → video (i2v)
  Two models chained together

  ### Complex Workflow Example: Character Consistency
  Final output: 30-40 second video with consistent character

  Workflow:
  1. Character persona (LLM text generation)
  2. Character appearance (t2i - portrait)
  3. Character reference library (i2i - create variations)
  4. Activity breakdown into scenes (LLM)
  5. Scene images (t2i + character references)
  6. Scene animations (i2v for each scene)
  7. Stitch videos together (editing)

  Total: 7 steps, multiple models, 6 different prompt formulas

  ### Key Workflow Principles

  1. **Each node can use different models/modalities**
  2. **Outputs become inputs** for the next step
  3. **Different prompts** are needed at each step
  4. **Character/scene consistency** requires reference workflows
  5. **Duration limits** (e.g., 8-second cap) require multi-scene workflows

  ---

  ## Part 3: Prompts and Modalities

  **Critical insight**: Different modalities require different prompt types.

  ### Text-to-Image (t2i) Prompts
  **What you're doing**: Describing what exists
  **Focus**: Visual description of the scene
  **Structure**: Subject + environment + style + technical details

  **Example**:
  Portrait photograph of a young adult female, striking green eyes,
  long wavy auburn hair, neutral studio backdrop, soft diffused lighting,
  photorealistic, high resolution

  ### Image-to-Video (i2v) Prompts
  **What you're doing**: Describing what happens (motion)
  **Focus**: Action, movement, camera - NOT visuals (image already has that)
  **Structure**: Subject motion + camera movement + duration + motion style

  **Example**:
  Person slowly turns head to look directly at camera, subtle smile forming,
  slight camera push-in, 5 seconds, smooth natural motion

  **Key difference**: i2v guides motion, not appearance. The image provides
  visuals.

  ### Text-to-Video (t2v) Prompts
  **What you're doing**: Describing both visuals AND motion
  **Focus**: Complete scene description + action
  **Structure**: Combines t2i and i2v approaches

  ### Platform Variations
  Different models need slightly different prompting approaches. Always
  consult:
  - Platform-specific prompting guides
  - Model documentation
  - Community best practices

  ---

  ## Part 4: Prompt Language Evolution

  ### Old Models (Legacy)
  - **Format**: Tags separated by commas
  - **Example**: `woman, long hair, smiling, beach, sunset, 4k, photorealistic`

  ### Modern Models (Current)
  - **Format**: Descriptive or narrative text
  - **Example**: `A woman with long flowing hair smiles warmly as she walks
  along the beach during golden hour sunset, photorealistic quality`
  - **Flexibility**: Can be more conversational and natural

  ---

  ## Part 5: Prompt Formula Methodology

  To systematically create effective prompts, we use a **block-based formula system**.

  ### Quick Overview

  **Blocks** are hierarchical prompt components:
  - `[Medium]` - Single level
  - `[Scene.Subject.Age]` - Multi-level with dot notation
  - `[Scene.Subject.Facial.Eyes]` - Deep hierarchy as needed

  **Formulas** combine blocks for specific tasks:
  - Different formulas for different modalities (t2i, i2v, t2v)
  - Each workflow step may need a different formula
  - Block selection and ordering matter

  **Key Principles**:
  1. Blocks are modular and reusable
  2. Formulas are templates for specific tasks
  3. Natural flow and semantic grouping improve results
  4. Testing and iteration refine formulas

  ### Full Documentation

  For complete methodology including:
  - Block library structure
  - Formula construction process
  - Organization principles
  - Output formats
  - Detailed examples

  See: **[Prompt Formula Methodology Documentation](./prompt-formula-methodology.md)**

  ---

  ## Part 6: Complete Workflow Example

  ### Goal: 30-second video of AI influencer at the gym

  **Step 1: Character Persona (LLM - Text Formula)**
  [Character.Name] = Alex
  [Character.Age] = 27
  [Character.Background] = Fitness enthusiast from LA
  [Character.Personality] = Motivated, disciplined, inspiring

  **Step 2: Character Appearance (t2i Formula)**
  [Medium] = portrait photograph
  [Subject.Demographics] = late-20s athletic male
  [Subject.Features] = defined jawline, focused eyes, short hair
  [Environment] = neutral studio backdrop
  [Technical.Camera] = professional photography
  [Technical.Lighting] = soft diffused light
  [Style] = photorealistic, high detail

  **Step 3: Character References (i2i Formula)**
  Generate variations: different angles, expressions, poses

  **Step 4: Activity Breakdown (LLM - Single-use prompt)**
  Input: "Going to the gym"
  Output: 6 filmable scenes

  **Step 5: Scene Images (t2i + character refs Formula)**
  [Medium] = lifestyle photography
  [Scene.Description] = working out at minimalist gym
  [Subject.Outfit] = athletic wear
  [Subject.Action] = bench pressing weights
  [Environment] = concrete gym interior
  [Technical] = natural lighting, high detail

  **Step 6: Scene Animation (i2v Formula)**
  [Motion] = person lifts barbell in controlled motion
  [Duration] = 5 seconds
  [Camera.Movement] = subtle push-in
  [Motion.Style] = smooth, realistic

  **Step 7: Stitch**
  Combine 6 video clips into final 30-second video

  **Total**: 5 reusable formulas + 1 single-use prompt

  ---

  ## Key Advantages of This Framework

  1. **Model-Agnostic** - Works regardless of which specific models exist
  2. **Systematic** - Repeatable, consistent results
  3. **Modular** - Blocks and formulas are reusable
  4. **Scalable** - Easy to add new blocks/formulas as needs evolve
  5. **Optimizable** - Test and refine based on outputs
  6. **Future-Proof** - Principles apply to new models as they emerge

  ---

  ## Framework Applications

  This system works for any systematic AI content generation:

  - Character/avatar creation
  - Product photography
  - Marketing content
  - Architecture visualization
  - Scientific illustration
  - Video production at scale
  - Any multi-step AI workflow

  The key is identifying:
  1. **Your workflow** (which modalities chained together)
  2. **Your formulas** (which prompts needed at each step)
  3. **Your blocks** (what components make up each formula)

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

  - **Modalities** define model capabilities
  - **Workflows** chain modalities together
  - **Formulas** create prompts for each modality
  - **Blocks** are reusable components within formulas
  - **Values** populate blocks with specific content
  - **Testing** refines all levels based on results

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
  Model: t2i generates image
         ↓
  Next Step: Feed image to i2v (Step 6)
  ```

  ---

  ## Next Steps

  To apply this framework:

  1. **Define your output goal** - What's the final deliverable?
  2. **Map the workflow** - Which modalities are needed? In what order?
  3. **Identify formula needs** - What prompts are required at each step?
  4. **Build block libraries** - Create reusable components for your use case
  5. **Test and refine** - Iterate on formulas based on output quality
  6. **Document learnings** - Capture what works for future reuse

  ---

  **End of Framework Documentation v1.0**