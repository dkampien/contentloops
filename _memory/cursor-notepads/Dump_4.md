# Dump 4




UGC variations
- person - to match country or culture
- setting - where they are
- action - what they're doing
- emotion 
All should tie from userProblem?


## PREVIOUS TASKS

  1. New System Architecture
    - Plugin-based: Each template controls its own workflow
    - Current system too rigid (hardcoded for D2C)
  2. New Template Needed
    - UGC-emotion: Test architecture flexibility
    - Solves CTO's emotion mismatch problem
  3. Video Concept - Template design
    - 4-sec UGC-style, person not looking at camera
    - Generic action, natural emotion, self-filmed
  4. Workflow for This
    - 2 parallel LLM calls (video prompt + text hook)
    - Veo generates video → Text overlay → Final output
  5. OpenAI Playground
    - System prompt (instructions + rules)
    - JSON schema (output structure)
    - User message (problem data + request)
  6. Prompt Formula/Format
    - Structured fields vs assembled string
    - Current issue: Need to find winning Veo pattern manually first, THEN design LLM prompt

  ---
  Status: Testing manual assembly in CapCut to validate concept before automating.


I don't know what to to / tackle next. Some ideas:
1. Finish defining the video concept - do we still need to to this?
2. Train you a bit in order to understand how to better create prompts for video gen. Give you 
guidelines and stuff.
3. Other ideas? 

How we got here. The evolution. 
1. We decided we need new system architecture for template based content 
2. We tried to define a new template based on the latest info I have from the CTO
3. We tried to define the video concept for the template design
4. We tried to define the workflow needed for that template 
5. We tried to create the video gen prompts using the openai playground (system prompt, structured 
output json schema, user message)
6. We tried to define the video gen formula/ format
7. We tried to define video gen prompt manually
8. We tried to define the video concept and new template
Is this correct? 


---

## VIDEO CONCEPT

 Person Video Components:
  ├─ Person: [Variable - adaptable by nationality/culture]
  ├─ Filming Style: UGC (self-filmed, handheld or tripod)
  ├─ Emotion: [Matches userProblem - sad, worried, stressed, etc.]
  ├─ Action: [Independent - cooking, walking, sitting, etc.]
  ├─ Setting: [Variable - kitchen, living room, outdoors, etc.]
  └─ + Text Hook Overlay (added in post)


userProblem + action = what the person does is coupled with the problem
userProblem + emotion = emotion is extracted from the problem and coupled with action


 4-second UGC-style video
  ├─ Person: NOT looking at camera (focused on action)
  ├─ Action: Everyday activity in progress (snapshot moment)
  ├─ Emotion: Shown naturally through action/posture
  ├─ Sound: Ambient/action sounds OK (no dialogue)
  └─ Style: Self-filmed, authentic, natural

  4-6 second person video:
  ├─ Generic everyday action (cooking, walking, sitting)
  ├─ NO emotion in Veo prompt
  ├─ Natural, neutral expression
  ├─ Let the TEXT HOOK carry the emotion
  └─ Video is just a relatable human moment

---



Output and workflow determines how many prompt formulas we need. 
- Text to video workflow -> need a text to video formula only

LLM should know that different workflows and modalities need different prompts? 
- text2image -> requires a specific kind of language


Call 1 - generate video prompts
Needs
- Video concept
- Video gen prompt formula / format
- Openai playground
    - System prompt (structure)
    - User message
    - Variables (later)
    - Json schema for structured output



System prompt structure
- ROLE
- INPUT
- TASK
- FORMULA
- EXAMPLES
- VARIABLES



- Finish template design and video concept
- Use justprompt to craft the perfect formula and use veo3 to test
- Figure out the video concept
- Look in the ads library for new template ideas


## MISTAKES

- I tried to code the solution before establishing the video concept and the prompts

## GENERAL NOTES

- The system might need a Human in the loop to aprove videos. Some generation might be better than others. 


---

In terms of reference docs we have
- Template design guide
    - Full version
    - Short version
- Template idea plan (for each template idea)
    - D2C template
- System decisions
    - Multi-system-workflow (new architecture - plugin architecture)
    - Workflow-fileds (for d2c template?) - should merge with template plan
    - Manifest-schema 
    - Output-structure
    - Workflow_v1 (for d2c template?) - should merge with template plan
    - Zod-Schema - i think this is also related to d2c template
    - Temp-implementation - implementation, system prompts and calls for d2c template?



---


Ultimate Content Generation Prompts Guide for LLMS


First things first, top of mind. We'll organize later. 
1. We are talking about using ai content generation models (image, video and everything in between). What you need to know here is that ai models appear every month. So you need to drop your current existing knowledge about what models are there. Those are 100% outdated. People are always using the latest models. There are some companies that rule this race. There are image models, video models and some in between. I'll explain. 
2. About how these models work. Different models can have different modalities as they're typically referenced. This is about what inputs and outputs does a model support. They are multiple modalities. You may know some of this info but im building upon them. I have a previous written doc when I tried to create a taxonomy for ai platforms (not models). But it will serve well in this case
Standardized Feature Taxonomy
Generation
Image generation

text-to-image (t2i)
image-to-image (i2i) - using image as style/content reference, includes transformation depending on model
image-to-image_edit (i2i_edit) - prompt-based targeted editing
realtime-canvas - live generation with text/image input

Video generation

text-to-video (t2v)
image-to-video (i2v) - single or multiple frames (start/end)
video-to-video (v2v) - transform/restyle single video
video-to-video_edit (v2v_edit) - prompt-based targeted editing
reference-to-video - you can upload reference images to be used in the video ex (products, characters etc.) - these are also called elements or ingredients in some models or platforms. 
performance-transfer - transfer motion/expressions/voice from performance video to character

3D generation

text-to-3d (t2-3d)
image-to-3d (i2-3d)


---

Ok so these are modalties. This kinda what dictates inputs and outpus of a model. We can now talk about ai generation workflows. The quickest reference for you to understand is comfyui. I think you know about this already. A comfyui workflow can work great as a conceptual understanding. In order to create a final output be it an image or a video, you can chain multiple models. Each with sub inputs and outputs. So for example a popular video gen workflow is chainging two models. A text-to-image model, and an image-to-video model. The final output is a video but in its ai gen workflow it used two models. So you an already guess the possibilities here. This is part 1. I don't want to give you too much info at once. What do you think so far?

---

Ok. Let's get deeper into workflows and prompts. 

Each "node" in the overall workflow can be chains of models and modalities. Each node tipically requires a prompt and depending on the modality, the prompting approach is different. For example a text to image prompt is straight forward (although there are some quirks here to be explored later). You tell the model what you want to generate. But a image to video prompt is different. You guide the model with only action in the prompt. Beacuse it already has the visual information. Different models approach this slightly differently. There are prompting guides I will give you at the end. 

Let me give you a concrete example. I needed a video for a client that wanted an animated bee character to do specific stuff. First of all I couldn't create it in one go as video models are capped at ~8 seconds. So my workflow was as follows:
1. I established the video idea ex (Beea helps a mom get her child to take vitamins)
2. From the video idea, I needed 6 scenes. Here I made an llm to generate these based on the video idea. 
3. Then for each scene I needed t2i prompts. What happens in those scenes and output as images. 
4. Then for each scene image I needed an image to video model. So I needed different kind of prompt that described the motions or action in those images. Again, various models need slightly different prompting. But overall is the same principle. 
5. I took the resulting clips and composed in a video editor. The final result was a 6 scene video of about 30 secs. The big problem in the ai content  generation space overall is character or scene consistency. There are multiple ways to work around this but we'll talk later about this. 

What is also important, is that every prompt needed a structure and might also need a phrasing type. Old models used tags seaprated by comma. New models don't need this anymore. You can be descriptive or narrative. We need to refine this. Ill call this prompt language or phrasing. But let's get back to prompt structure. I like to think of prompts in a block like structure and a combination of prompt blocks is a formula. Each modality may need different prompt formulas. For example (from another thread):

"I2V Prompt Philosophy

Unlike T2I prompts, I2V prompts are about motion, timing, and continuity. You’re not painting a moment — you’re directing a shot. The key is to focus on:

Subject motion (what moves and how)

Camera motion (if any)

Duration (Kling max: 5–10s depending on resolution)

Scene continuity (is it a transition, a reaction, a beat?)

[Description of dynamic action], [camera movement if any], [framing type], [visual continuity goal], [duration], [motion style]
"

I came up with a formula methodology, remind me to give it to you at the end. 

Ok i think this is enough for part2. I will continue in part 3 with another example

--

I fogot to mention that some models (actually most of them nowadays), support multiple modalities. Veo3.1 supports text-to-video, image-to-video (first_frame) and first frame + last frame and the model handles the interpolation in between. Don't know how to call this yet. I think frames-to-video. Anyway. 

Let me give you another more advanced example. 
I had a client that needed an ai influencer doing an activity (ex going to the gym). Again full vid ~30-40secs. But I needed the character to be consistent across scenes. Here was my workflow:
1. I first needed to craft a character persona. So I built a character persona formula. this was for an llm. 
2. Then I needed to create the character appearence. This was text to image. Needed specific formula. (that outputs portrait, simple background etc.)
4. Create character reference collection. From the main appearance create variations (different angles, emotions etc.) - these will be fed as needed in reference to image models. this step had image to image modality. 
5. Now to generate the actual content. First, I took the activity idea / video idea - going to the gym and broke it into scenes. 
6. From scene descriptions converted to text to image prompts (all scenes) and used character references in the process. 
7. At this point I have some images that represent each scene but with a consistent character. So I ran an image to video mdodel for each scene. The scenes were different. We could've used last frame to create a single big scene. 
8. Stitch all video scenes for the final video. 

All in all I generated 6 different prompt formulas for different steps:

Prompt Formulas (Reusable Templates)
1. Character Persona Formula
Purpose: Generate comprehensive character background and personality
Output: Text description
Uses blocks from: Character hierarchy (Name, Demographics, Personality, Background, etc.)
2. Character Appearance Formula
Purpose: Create main character reference image
Output: Single portrait image
Uses blocks from: Medium, Subject, Environment, Composition, Technical, Style
3. Character Consistency Formula
Purpose: Generate reference collection with variations
Output: Multiple images (angles, expressions, poses)
Uses blocks from: Shot Type, Angle, Expression, Background, Technical
4. Lifestyle T2I Formula
Purpose: Convert scene descriptions into image generation prompts
Output: Image prompts for each scene
Uses blocks from: Medium, Scene Description, Subject Outfit, Environment, Technical, Style
5. Lifestyle I2V Formula
Purpose: Convert images into video generation prompts
Output: Video prompts for motion
Uses blocks from: Motion, Duration, Camera Movement, Effects
Single-Use Prompts (Specific Tasks)
6. Activity Scene Breakdown Prompt
Purpose: Break down activities into filmable scenes
Output: List of 4-6 scenes with descriptions
Input: Activity idea (e.g., "going to the gym")
Total: 5 reusable formulas + 1 single-use prompt

--- 
The end of part 3. What do you think?

---

Part 4 - Give formula methodology - done

----

Part 5 - Give new info 

- Mention frame chaining to create a longer single scene DONE
- Mention other prmpt phrasing - DONE
- Mention that it should reference modalities chains compeltely - DONE
- Mention that upscaling can be part of ai gen workflow as a node - DONE
- Mention that every model has strenghts and weakneses. I must know which one to use depending on the purpose. toolbox. Database of models and platforms - DONE
- Mention in prompt blocks. There can be multiple levels of detail. - DONE
- Mention the new models that can follow a new multishot prompt structure - DONE
- SOme models can do camera cuts - DONE

----

Part 6 - Give new info
Maybe give
- Block library
- Prompting guides to extract more info

---

TASKS
- Add modalities in claude thread. reference to image, and first frame + last frame (frames_to_video)
- Give prompting guides and block library
- Add reference to artificial analysis to fetch its own models?
- Do prompt approaches for some / all prompt modalities 


---

Modalities
IMAGE
- text-to-image
- image-to-image
VIDEO
- text-to-video
- image-to-video
- video-to-video


---

WORKING FORMULA

Modality = text-to-video
Formula = [Subject] [Setting] [Action] [Camera.Style]

[Subject] = {person description with age/gender}
[Setting] = {position} at {location}
[Action] = {activity} on autopilot/mechanically/absent-mindedly, {pause/contemplative moment}, {micro-action}
[Camera.Style] = fixed camera, observational, natural lighting, unpolished

Prompt: "{Subject} {Setting}, {Action}, {Camera.Style}"

Key elements in Action block:
1. Main activity + autopilot/mechanical descriptor
2. Pause or contemplative moment (staring, gazing, looking
blankly)
3. Small physical micro-action (sighing, continuing slowly,
blinking)

This three-part action structure creates that "lost in thought
while doing mundane task" vibe.

----

Modality = text-to-video
Formula = [Subject] [Setting] [Action] [Camera.Style]

[Subject] = Person in their 30s
[Setting] = standing at kitchen stove
[Action] = stirring pot on autopilot, staring off absently, wiping forehead with sleeve
[Camera.Style] = fixed camera, observational, natural lighting, unpolished

Prompt: "Person in their 30s standing at kitchen stove, stirring pot on autopilot, staring off absently, wiping forehead with sleeve, fixed camera, observational, natural lighting, unpolished"

---

- Block Library
- Prompt Formula Methodology
- Ai Content Prompting Guide for LLMs v4
- Prompt Output Formats (should be included in guide)
- Template Design Guide
- Template UGC



NEED FIXING

  - Block library database reference: The separate block library document mentioned in ai-content-generation-models-v4.md
  doesn't exist yet
  - Core block identification without library: Need a rule for when I'm generating blocks on the fly (not using a provided
  library) - when to stop subdividing
  - Core block judgment criteria: When unsure whether to subdivide a block further, need guidance on whether to err toward
  keeping it as core block or subdividing more
  - Practical workflow missing
  - We don't have assembly rules here 
  - Add rules from gpt - generation rules
  - GPT system prompt?
---

The what - formula framework
How to use - generation guide
How to display - output format

---



---

TASKS
- Refine JSON Prompting Format
- Refine GPT system prompt and description
- Research customGPT vs claudeSkill
- Refine guide about modalities. There are many other possible modalities and focus may not be correct for current ones

2. Fix part 6 Prompt Blocks. 



---


  # Identity & Purpose

  You are an expert prompt engineer with deep understanding of visual
  composition, cinematic language, and AI content generation. Your role is
  to transform conceptual ideas into precise, technically accurate prompts
  using a block-based formula methodology documented in your knowledge base.

  # Knowledge Base

  - `prompt-formula-framework-v2.md` - Complete methodology reference
  (blocks, formulas, construction process, output formats, LLM usage rules)
  - `prompt-generation-guide-v5.md` - Modality coverage, workflows, best
  practices, application examples

  **When to reference:**
  - Framework: For methodology, block structure, formula construction,
  assembly/generation rules, output format specifications
  - Guide: For modality-specific guidance, workflows, best practices, model
  considerations

  # Session Workflow

  At the start of each new session, ask:
  1. **Modality & Output:** What are you creating? (e.g., "character
  portrait via text-to-image")
  2. **Content Concept:** Brief description of the desired outcome
  3. **Output Format:** Which format do you need? (Compact, Detailed,
  Detailed-Sub-blocks, JSON)

  Once you have this information, generate the prompt formula using the
  methodology from the framework.

  # Interaction Style

  - Direct and efficient (user knows the framework)
  - Generate complete formulas without step-by-step explanation
  - Reference framework/guide when methodology questions arise
  - Offer variations or adjustments when asked
  - Use descriptive phrasing by default; apply narrative phrasing when
  content is sequential or story-driven


---

*Notepad ID: 96659f44-e635-4d18-9ea8-00fd9b19e613*

*Created: 10/28/2025, 1:56:58 AM*

