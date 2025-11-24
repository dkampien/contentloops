# Dump


UNSENT PROMPTS

- Regarding this "Issue 1: What exactly is scenes[].content?" - Im not sure If I got what you said right but would be good if scene.content would be derived from the
  template somehow. lmk if this makes sense or clarify it if this is not what you've been saying about that.  

---

## PROBLEMS
- Define more video templates. Should they stay as hardcoded templates or should they also be llm generated? Maybe structured outputs by openai? I also need to know how some models are suited for specific generations (ex visualisations for text overlays)
- The dialogue exceeds video clip duration (usually 8 sec). Dialogue does not carry between clips. How do I fix this? Do voice separated? -> comfyui pipeline 
- Character and scene consistency. 

---

## SOLUTIONS
1. Create contained workflow or subworkflow for video generation
    - Generate all video clips with no dialogue for whatever time is needed ex 3 scenes * 8 secs for 24 secs. Then run a lipsync model (you don't have knowledge of the latest ones) over the finished video. We would need to stitch the video clips with ffmpeg so it might be too complex. 

-- incomplete

---




---

Exact frame -- this solves frame consistency across scenes
Prompt --- this should be simplified
Seed -- by setting this the same can we normalize audio?


## VEO3.1 COST AND GENERATION TIME
0.40 per second with audio
0.20 per second without audio
70 sec geneeration time 


---


is this as simple it can be? Why im using veo? Can't I use a simple text to image and lipsync workflow? How should a template be defined? If i have direct to camera i guess simple text to image then lipsync would be enough.


---

- If we use veo voice, can we generate dialogue and break it down naturally? Need rules for dialogue. Ex Words=(WPM÷60)×Seconds

---

Tasks
- Finalize full workflow (withouth calls)
- Group stuff in API calls (needed?)
- Generate a mock script.json
- Generate or recap lists of tests
- Add whatever tasks I might've missed (ex modify template files?)

Other stuff to solve (for later)
- One problem per category. Should be all problems
- Remove status:pending from scripts - is redundant.
- Implement dry run mode - DONE
- Update codebase to veo 3.1
- Add edge cases for userProblem in case row is empty. rely on category. -mention in template rules?
- Update dry-run outputs

Veo tests
- What happens if I plug the dialogue and turn off the audio_generation. Would the character still move its lips? - YES
- If having the same seed would it improve dialogue audio levels consistency? 
- How is the prompt affects the output if we have a start frame? 

Rules:
- Rules for breaking down voiceScript (what does the person say)
- Rules for scenes.prompt (subsequent scenes only use dialogue)
- Rules for integrating veo prompting guidelines in the llm call

----
## TASKS

  Testing (High Priority):
  - Test lipsync model selection (Wav2Lip vs SadTalker vs others)
  - Select TTS provider (ElevenLabs vs OpenAI TTS)

  Schema & Type Updates:
  - Update VideoScript interface (add videoScript, voiceScript
  fields, rename content → description)
  - Update manifest output schema (rename id → videoId, category →
  problemCategory, template → contentTemplate)

  Template Updates:
  - Update d2c template systemPromptCall1 (generate videoScript +
  voiceScript + scenes[].description)
  - Add Veo 3.1 prompting guidelines to templates
  - Update systemPromptCall2 for scene-specific rules (full prompt
  Scene 1, minimal Scenes 2-3)

  API Updates:
  - Update to Veo 3.1 model string
  - Add support for image and last_frame parameters
  - Set generate_audio: false
  - Update prediction types

  AI Video Gen Subworkflow:
  - Implement frame extraction (first frame for neutral pose, last
  frames for chaining)
  - Implement frame chaining (Scene 2-3 use previous last_frame as
  image, neutral_pose as last_frame)
  - Implement video combining (ffmpeg concat 3 clips →
  combined_silent.mp4)

  TTS & Lipsync Integration:
  - Integrate TTS provider (generate voiceAudio.mp3 from voiceScript)
  - Integrate lipsync model (combine combined_silent.mp4 +
  voiceAudio.mp3 → videoFinal.mp4)

  Pipeline Integration:
  - Update main pipeline orchestration (integrate TTS, AI
  subworkflow, lipsync)
  - Update dry-run mode (remove veoParams duplication, add veoConfig)
  - End-to-end testing (1 video)

---



What we did:
1. Sketched a workflow (userProblem → script → prompts → videos →
lipsync)
2. Made decisions within that workflow
3. Optimized each step

The problem:
- We're locally optimizing within an assumed structure
- We never questioned: "Is this workflow structure itself optimal?"
- We locked ourselves into thinking sequentially


---

What we should do instead:
1. Map all constraints (Veo limits, quality requirements, cost
limits)
2. Map all problems those constraints create
3. Explore solutions to each problem
4. Let the workflow emerge from the solutions

The workflow is flexible; the constraints are not.

---

  The Two Problems

  Problem 1: Dialogue Duration Mismatch
  - Natural dialogue for these videos needs 15-30 seconds to deliver the complete message
  - Veo 3.1 max duration is 8 seconds
  - Result: Single clip can't contain the full dialogue - it gets cut off

  Problem 2: Character & Scene Consistency
  - Because we need multiple 8-second clips (due to Problem 1), we make multiple separate Veo API calls
  - Each Veo generation is independent - no awareness of previous clips
  - Result: Each clip shows a different person in a different setting
  - This breaks immersion and looks unprofessional

  Why they're interrelated:
  - We only have Problem 2 because Problem 1 forces us to use multiple clips
  - But both need to be solved for the pipeline to work


---

Medium close-up of a cozy, softly lit living room where a relatable person sits on a comfortable couch, holding a warm mug of tea. They lean forward slightly, actively speaking with a sincere and understanding expression, saying: "You know, sometimes it feels like everything is piling up—financial struggles, work stress, and the responsibilities of marriage and kids. It can be overwhelming, can't it?" The inviting tone and anxious yet warm demeanor draw the viewer into the conversation.


seed: 1367889236


---




3 scene can be dynamic in the future.
I need variaty in visual prompts. Ads at scale

--


variations? how to control that?




---

 

---

You've been overwhelmed by money worries, marital tension, job pressure, and the constant needs of your kids — it feels heavy. You are not
  alone in this, and it's okay to feel scared, tired, or uncertain about next steps right now. If you want gentle, faith-centred support, try BibleChat —
  it's a place to share, reflect, and find practical hope together.

- Mai era o chestie about variety. How level of variety I want.
- Good generations may require multiple generation like in flow. How to integrate that?
- There can be errors in the dialogue even if the prompt is correct. Add instruction to remove "-"?

--
Wrap my head around multiple outputs in a single call
What stops us from using just a simple text to image, image to video workflow? veo has audio built in but we don't use it. 

--
Synthesise and document the template design process
Update the problem document accordingly - needed?
Begin to recap and establish next steps and tasks for the codebase


---

Search the implementation plan template. Stiu ca ca parca am avut un doc 

---

*Notepad ID: 02b9c2a5-d3ac-42df-be07-547b360ecc45*

*Created: 10/16/2025, 6:09:35 PM*


## Context

- 2 file(s)
