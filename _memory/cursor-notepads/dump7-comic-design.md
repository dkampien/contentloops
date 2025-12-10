# dump7-comic-design

OUTLINE
- Recap
- Notes & Questions + Problems
- Tasks 
- References




----


## RECAP 
- I've been trying to create consistent and high quaity prompts for generating bible stories comicbooks. The goals was to write these prompts automatically by an LLM. This meant that I needed to teach an LLM how to do that. 
- I wrote some docs about a prompting system (framework + guide) and a template doc for the comics. The comic template contained instructions for the LLM, rules and general references. The the LLM can't follow the instructions accurately enough. 
- This was all done for a manual template workflow in a single LLM thread. The goal was to move to a production (automated) template where id had multiple LLM calls (agents), etc. 
- I tried a custom gpt to see if it can follow the instructions better than a core LLM but it had mixed, mainly poor results (including context rot, max 5-10 stories per thread before it would become unusable and buggy). The other main downside of a customGPT is that it can't interact with the file system or other APIs. So its nor scalable or automatable. 
- Then I got to the basics to see if I can nail consistent prompts manually. I referenced seedrea4 model guide. It had good results but I don't know how I can teach an LLM to write like a human. In the meantime, google released nano banana pro (25 nov 2025) and it performs better than seedream. Although slower and pricier. 
- At this point, I realized that the manual template workflow, needed to be split in two "layers". The knowledge layer - which is the info about the prompting system and the application layer - which is, how we apply the prompting system to a use case (eg comics). The knowledge layer became the system prompt v1 and the application layer became the comicbook template v4.  
- Then I needed to figure out the ways I can "plug" all this info into a bigger llm workflow, what are the available LLM api elements I can work with etc. Ex. the system message, user message, variables, etc. (using openai api). 
- I analyed the adloops system to understand it better and to figure out where I can plug my content system (now called contentloops or cloops for short). I realized my system is kinda like an asset supplier to the adloops system. Which does the ads full assembly and pipeline (including posting etc).
- Then I needed to translate the manual template to a production template plan. So then when I implement the cloops system, I move to a production template code implementation. The cloops system will work on a template basis. Eg doing comics is a content template. 
- I created a draft for the production template plan and then I wanted to test the pipeline in openai playground (now called dashboard). To see how multiple llms would work together. I made separate llm calls with system prompts, user messages etc. But the results were very poor. I think mainly because I forgoten to include the knowldge layer in any llm inputs. Or the translation between the manual template and the produciton template plan was incomplete. 
- While I designed the first draft of the produciton template plan, I also made some decisions about the cloops system. Because some were template level functionalities and some were system level. 
- Now I need to go through the production template plan again and fix what is missing there, test the llm pipeline again in the playground. See how I split the knowledge and applicaiton layers in the produciton template plan. There are lots of unkowns here still. I can't remember if I moved the knowledge layer in the cloops system level so I forgot about it when tested the llm pipeline in openai dashboard. 

In any case, there may be some discrepancies between the reference files so don't get biased that everything is correct if you read them. But don't read anything yet without my permission. 

## REFERENCE FILES

Manual Template Workflow
- comic-books_template_v4 - application layer
- system-prompt-v1 - knowledge layer

Production Template Plan
- comic-books_production-template-plan
- openai-api-reference (!)

Cloops info 
- adloops-system-analysis
- cloops_exploration-session
- cloops_system-level-decisions




----

## WORKFLOW & PROCESS REVIEW
  1. For the LLM to generate usable, consistent, production ready prompts we need some files:
    - Knowledge layer:
      - [prompt-generation-guide-v5.md] - Understanding modalities, workflows, prompting approaches
      - [prompt-formula-framework-v2.md] - Block-based system, formulas, assembly rules, LLM usage rules
      - [prompt-blocks.json] - The hierarchical block library structure
    - Workflow/Template layer:
      - [comic-books_template.md] (or TEST version) - The specific step-by-step workflow for comic book generation
      - Defines: Story narrative → Panel planning → Prompt generation process
    - The template tells the llm what do to (workflow steps) and the framework tells the llm how to do it (block prompt methodology)
  2. STEP-1 - STORY NARATIVE
    - Approaches
      - Cover the full arc and miss some details. Do we have these?
      - Make the story naration dynamic. No 150 word constraint.   
  3. STEP-2 - PAGE AND PANEL PLANNING 
  4. STEP-3 - PROMPT GEN
    - Critical Questions
      - How does the LLM decide what blocks to chose - needs some sort of input
      - What source does the LLM uses when chosing blocks - block library exclusively or + creative freedom
    - Needs:
      - Block assembly instructions
      - Other rules and guides ex from best practices and known challenges
    - STEP 3 Responsibilities
      1. Chose blocks (or have the blocks pre-set) - based on an input + source of blocks
        How does the LLM decide what blocks to chose?
      2. Fill block values (block detail level)
        - Rules on filling block values
      3. Assemble blocks into prompt (block depth level)
        - Aseembly rules, language or other rules
      4. Output and output format


Workflow Variables
- Story narative word count - currently is 150 words (dynamic?)
- Number of pages extracted from narative - was fixed 4, now its 3-5 (dynamic pages per narative)
- Number of panels per page - currently fixed 3 (dynamic panels per page)


Workflow variations
- Step 3 with one-time setup or without (eg define characters and story-wide blocks
- Workflow for seedream4 (more constrictive prompting rules in step 3) OR nanobanana pro


----

## ALL NOTES & QUESTIONS
- Some models may have a problem with these kinds of notations PANEL:1(TOP). Instead we can use descriptive language. Eg - "in the first top panel.."
- Translation layer problem?
- About the block library and block usage
  - How to handle temporary suggested new blocks? Where they live before getting promoted to the block library json?
  - On the template doc there are some standard blocks list (are not in library) and then I say to suggest blocks around it -> Needs to change, the flexibility hurts the generation
- You made the template insturctions too general?
- The block library suggestion is not working properly -> make follow only the blocks in library or standard blocks? I have standard blocks defined already but where did those come from?
- General whats working and best practices should be on their respective steps?
- In theory, the prompting methodology should also be referenced in a system prompt
- Does the block approach helps or hurts the prompt gen? 
- What I should've done first
  1. Test content gen model limits. Manually try all kinds of prompts using the same story


### Problems With The Prompt Step (these were mostly fixed in the template documentation)
- Location and overall scene continuity 
- Speech buble pointing problem
  - Generate just the bubbles without text?
  - No bubbles at all?
- Generation failures - too many elements
  - When given "puddles + muddy ground + ark" it can't do the boat, it focuses on the ground and people entering a house.
  - Simplify complex panels
  - Define characters specifically (don't need consistency guide)
- Note: Give the guide the example with cold and scarf from matteo


### Problems with the LLM following the template -> CURRENT PROBLEM
- The template has all the rules but the LLM are not applying them DURING generation. 
  - Can this be solved with a system prompt? 
  - It learns patterns from examples and past generations in the same context window
- When the LLM converts to step 4 prompts, he's carrying over the screenplay language from step 3 because he's just reformatting, not rethinking. -> We merged step 3 and 4. 
- The natural language instructions are inherently ambigous for the precision needed -> a more constrained format for the intermediate steps?
[more update info in notion]


----


## TASKS
- [x] Review translation layer in the template. Too many steps between narative and prompt?
- [ ] Mention somewhere that the overall production system might need a human in the loop and some content gen outputs need multiple generations. 
- Rethink the new production system architecture 
- [x] Test new template - think backwards, stress test -> still not producing produciton level results
- [ ] Include fal.ai workflows in the system -> To do after we get a good template working consistently
- [x] Research the automated system architecture. How to design multiple LLM calls.
- [ ] Research if having a claude code subagent could help the semi-manual production.
- [ ] Change backlog story format to a more natural language summary (TBD)
- [ ] Make the output format (detailed with sublocks) only as a debugging step. Takes too many tokens
- [ ] Update step 2 format and move character definitions to prompt gen step?
- [x] Do a full WORKFLOW REVIEW? 



----

## REFERENCES

### Block Library Format
```json
  If you wanted to store block values (but you said you don't):
  {
    "scene": {
      "subjects": {
        "age": "30 years old"  // Block value as string
      }
    }
  }

  Or with metadata:
  {
    "scene": {
      "subjects": {
        "age": {
          "modality": ["text-to-image"],
          "exampleValue": "30 years old"  // Example, not actual value
        }
      }
    }
  }

```

### Comic Book Bible Stories Template (Testing)

#### Proposed Blocks

##### Layout
- layout.panelCount - Number of panels in the composition
- layout.panelArrangement - How panels are arranged spatially
- layout.gutterStyle - Space/border between panels

##### Text Integration
- textIntegration.textType - Type of text elements (speech bubbles,
captions, etc.)
- textIntegration.bubbleStyle - Visual style of speech/thought bubbles

##### Comic Style
- comicStyle.artStyle - Overall comic art aesthetic
- comicStyle.inkStyle - Line work and inking technique
- comicStyle.colorTreatment - Color application method

##### Formula (text-to-image)

[medium.type] [layout.panelCount] [layout.panelArrangement]
[scene.environment.setting] [scene.subjects.details]
[textIntegration.textType] [textIntegration.bubbleStyle]
[comicStyle.artStyle] [comicStyle.inkStyle] [comicStyle.colorTreatment]
[style.imageStyle]



----


1. Step 1: Narrative (150 words) → Creates story + narration for app UI
2. Step 2: Planning → Decides page count, panel layouts, story beats
3. Step 3: Scripts → Detailed visual descriptions per panel
4. Step 4: Prompts → Reformats scripts with block structure


----

## Step 2: Page & Panel Planning

**Total Pages:** 4 pages

### PAGE 1: THE STORM
- **Story beats:** Jonah boards ship, sailing across sea, God sends storm, sailors fighting waves
- **Panel count:** 3 panels
- **Grid layout:** Layout C (3 panels vertical)
- **Purpose:** Establish Jonah's disobedience and the consequence

### PAGE 2: THE CONFESSION
- **Story beats:** Sailors throwing cargo, finding Jonah below deck, Jonah confesses, sailors prepare to throw him overboard
- **Panel count:** 3 panels
- **Grid layout:** Layout C (3 panels vertical)
- **Purpose:** Build tension and Jonah's sacrifice

### PAGE 3: SWALLOWED
- **Story beats:** Jonah thrown into sea, great fish approaches, fish swallows Jonah
- **Panel count:** 3 panels
- **Grid layout:** Layout C (3 panels vertical)
- **Purpose:** The dramatic turning point

### PAGE 4: DELIVERED
- **Story beat:** Fish spits Jonah onto shore, Jonah alive and grateful
- **Panel count:** 1 panel (splash page)
- **Grid layout:** Layout A (1 panel fullscreen)
- **Purpose:** Resolution showing God's mercy and Jonah's obedience


----

  Header:
  - Title: Comic Book Bible Stories - Template v3.1
  - Purpose, Format, Modality
  - Development Approach (Option 1B - Examples + Minimal Rules)

  Context:
  - Hybrid Approach: Generated Images + App UI Text
  - Production Workflow Overview
  - Key Definitions (Panel, Page, Story, Grid Layouts)

  Steps:

  Step 0: Story Selection
  - Choose from backlog
  - Verify not already created

  Step 1: Story Narrative
  - Continuous prose (~150 words)
  - Complete story arc
  - Example: David and Goliath narrative

  Step 2: Page & Panel Planning
  - Page narration (extract from Step 1)
  - Grid layout
  - Panel moments
  - Example: 2 pages with panels

  Step 3: Prompt Generation ⭐ (New structure)
  - Settings: Block Depth (Top/Parent/Deep) + Detail Level (Low/Medium/High)
  - Part 1: Character Definitions
  - Part 2: Story-wide Style Blocks
  - Part 3: Settings (with recommended defaults)
  - Part 4: Generate Prompts (4-Step Process)
    - Step 1: Choose Blocks
    - Step 2: Fill Block Values
    - Step 3: Assemble Blocks
    - Step 4: Output Final Prompt
  - Part 5: Core Prompting Rules (8 rules)
  - Part 6: Available Blocks Reference
  - Part 7: Examples [PENDING]

  Step 4: Thumbnail Generation (Optional)
  - Requirements
  - Prompt structure
  - Example
  - Best practices

  Post-Generation Cleanup:
  1. Create story-data.json (from Step 2 narrations)
  2. Update stories-index.md
  3. Update story-backlog.md
  4. Update story file (optional)


## PROMPTS


[]


----


Framework Outline

- Overview
- Core Concepts
    - Prompt formula
    - Block structure
    - Block values
    - Core blocks
- Formula types
    - Text
    - Image gen
    - video gen
- Formula construction process
- Block library
- Output formats
- LLM usage rules - assembly rules

Guide Outline

- Understanding AI models - not needed
- Modalities - model capabilities
- Ai generation workflows
- Prompts and modalities (how to prompt for each modality)
- Formulas and blocks
- Detail levels
- Prompting best practices
- Examples and system hierarchy



----


OPTIONS moving forward
- separate panels with seedream then stitch with comfyui api or programatic stitcher 0.03 * 3 = 0.09 per page = 0.39 per comic
- generate with nano banana pro 0.14 per page (image) = 0.7 per comic



----


<claude-read-here>
Decisonal flow tree when building produciton workflow plan
- Made step 1 continuous (cloud chunk from the start) so step 2 has better input. 
- Panel moments alone were too minimal for Step 3. Added visual anchor (one key compositional/emphasis hint)
   to guide visual interpretation without being redundant with prompt generation.

</claude-read-here>





Remember to also do final workflow assembly. Does the format of the production template plan matter?
Add cliffhangers.


Step 3 design note -> YOU ARE HERE
- Step 3 needs to first go through some steps - Discussed
- Best input format from step 2 - solved by introducing visual anchors in step 2. But this introduces another fail point. The non-deterministic nature of llms.
- Model otpmization - ex character definitions are no longer needed that much for nano bana
  - Step 3 pulls rules based on which model is configured. Model specific rules live in a config not the template.



----


## NOTES AND IDEAS

### Notes for future dennis wanting to design templates
- If you don't know, find a way to test
- Have patience with writing responses. Think about the llm answers
- Tell the llm to think from simple to complex and your personal context - current system prompt
- Tell the llm to list its thought process when you don't think its answer was good

### Feedback and ideas for future features
- The current step 1 does not make consistent stories. 
- Add edge cases and error handling for each step. eg Regenerate step x only. 
- There is a story accuracy issue. This can be handled somehow with bible api somehow
- There is a variance problem but i forgot where (key moments to guide step 1 generaiton accurately?)
- No blocks inserted in the pipeline
- Decide if you still include story metadata output somewhere. Is is still needed?
- Tweaking params
  - step 1 cunking
  - step 2 panel format (best for step 3)
  - step 3 model specific instructions set (ex for nano it requries less rules)

### OPENAI API structure and where to place differnt types of information
- Available elements in dashboard 
  - model-settings (model, reasoning lvl, verbosity-lvl)
  - system-prompt (instructions, developer message)
  - user-message
  - variables
  - response-format (json, text)
  - tools (web_search, file_search, 
- Other api elements


----


- Production template plan
- Testing and evals the prompts in agent builder
- Production template code implementation - workflow.ts
- Production template config


When im planning the code I plan the content gen steps? What if I want to add another step like a character reference model? I dont' have comfyui at this point?

What else should the production plan contain?
Does it have a fixed structure? 

When we plug into adloops should I be aware of the asset types that adloops it needs? Eg overlayed, just body, just hook etc? 


What should a production plan contain? - workflow steps?


----


The STEP 1 problem
- Step 1 needs to generate naration within a word constraint but its hit and miss and it varies how much of a story includes. It might miss important narative parts and/or it can make mistakes. It needs a story validation anchor. 
- Defapt is a backlog problem for step 0. The backloog needs story validation?





----



OUTLINE - STEP 3 
#system prompt
<role>
<task>
<constraints>
<knowledge>
<output_format>

#user message 1
<blocks>

#user message 2
Generate image prompts from these panels

{{page2-output}}


-------

PAGE 1 In a children's book illustration style with bold ink lines and flat colors, this comic book page featuring three vertically arranged panels shows: First, a scene where from a high angle, divine light illuminates Noah, a bearded man with a flowing robe, amidst the darkness of a chaotic world. Next, in a medium shot, Noah’s focused face reflects determination as he listens intently, highlighted by soft ambient light. Finally, Noah stands with his family, their expressions unified and supportive, framed in a warm indoor setting from a waist-level angle.


-------


