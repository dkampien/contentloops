TASKS
- [ ] Understand current adloops structure and the diagram
- [ ] Convert the existing template to production template
- [ ] Finish exploring and designing the contentloops system 
    - [ ] Datasources, databases, storage buckets, interactivity, 



## GENERAL
- System interactivity by CLI, flags. Or interactive CLI?



## ADLOOPS
- No mixing constraints. I can have a hook with a baked overlay and a body with a manual overlay.



        
Legend
- Components
    - hooks
    - bodies
    - ctas
    - overlays
    - audios
    - voices
- Video mixes
- Templates

ADLOOPS FLOW
1. The template triggers mix creation
2. Mix creation assembels components into parts
3. Part generation
4. Video rendergin
5. Content tagging
6. Experiment creation


TEMPLATES
- ADLOOPS template
- CONTENTLOOPS template



----

Content type - comicsbooks from bible stories

Content purpose
- in-app content
- adloops feed 

Output bundle
- generated assets

Content variant
- standard comics
- kids comics



TEMPLATES
- Content type (ex comics)
    - manual template plan (v4) - I need to rewrite this into a production ready variant, multiple llm calls, and other workflow details
    - production template plan - the produciton ready variant
    - production template implementation - the code implementation


Production template plan
    - Workflow steps
        - Generation step subworkflow (replicate, comfyui)


COMPLETE MENTAL MODEL HIEARCHY OF THE ENTIRE THING
- ADLOOPS (FINAL AD DELIVERABLE)
    - COMPONENTS (EG HOOKS, BODIES)
        - CLOOPS (COMPONENT SUPPLIER?)
            - TEMPLATE PLAN
                - eg WORKFLOW STEPS
                    - eg PROMPT GEN STEP (has substeps)
                        - eg step 3 fill block values, assemble prompt, format output properly
                    - eg GEENRATION STEP SUBWORKFLOW (REPLICATE, COMFYUI)
            - TEMPLATE CODE IMPLEMENTATION


Start from the simplest to complex - added to system prompt. 


----


cloops_exploration-session
cloops_system-level-decisions


----



Notes (post-implementation)
- How would I explain this system to the CTO?
- What happened to the scheduling part? How would it work?
- What happened about the firestore storage?  
- Adloops manifest 
- How it would behave with another input source eg the csv parsing data?


----


User Story
- I want a batch of 20 comics for kids to use in ads. Full naration bundled 

Notes
- Should the system also work outside adloops?
- Can the system manage ads variants and in-app variants? What info is packaged? Different steps? 
- How can the system manage already made stories? Can it redo existing story?
- Need fal api key


----

- Validate againht user story. 
    - Add: I want to see the prompt that was used for a specific image. This means adding naming conventions to the files?

- How does the system choses how many stories to extract?
- Does the system, take books and stories in an order? So the cursor concept works?
- Datasource conflict 


How does the system analyzez the story? It extracts the full text or based on the summary and key moments?
