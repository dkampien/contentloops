# dump7-comic-design

OUTLINE
- Recap
- Notes & Questions + Problems
- Tasks 
- References


## RECAP 
- Tried to create the comics template but relized I need to work on the block library. How to organize library and which blocks to include and when to add new blocks. Explored various block lib designs. And what to do with testing blocks. 
- I realized the template is not produciton ready and that the LLM (ex claude) can't follow the template precisely and I can't fix this currently. 
[more info in notion]

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

API structure and where to place differnt types of information



OPTIONS moving forward
- separate panels with seedream then stitch with comfyui api or programatic stitcher 0.03 * 3 = 0.09 per page = 0.39 per comic
- generate with nano banana pro 0.14 per page (image) = 0.7 per comic



