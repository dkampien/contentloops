# CLoops System-Level Decisions

Summary of system-level decisions made during comic book template planning session.

---

## Datasource Manager
- Datasources are system-level, not template-level
- Backlog is one type of datasource (queue with completion tracking)
- CSV is another type (batch data)
- Templates receive input in expected shape, don't care about source type
- Datasource manager marks items complete after template finishes

## Knowledge Layer
- Prompting methodology and block library live at system level
- Shared across templates (comic books, future templates)
- Provided to Step 3 (prompt generation) as system context
- TBD: How much methodology to include, how it's delivered

## Generation Service
- System-level service handles image generation API calls (Replicate, ComfyUI)
- Template defines requirements (model, parameters), system executes
- Handles retries, file storage
- Model-specific parameters must align with model's API schema

## Post-Template Processing (System Handles)
- Upload images to cloud storage
- Register metadata in Firestore (for AdLoops)
- Transform story-data.json to AdLoops manifest format if needed
- Update index (auto-generated, optional)

## Naming Conventions (System-Level)
- Output folder structure: `output/{template-name}/{item-id}/`
- Item ID format: kebab-case
- Each bundle has a metadata file

## Key Decisions
- Separate templates per variant (standard, kids, ads) - not base + override
- Separate model configs per image gen model (seedream, nanobanana) - not base + override
- Template ends at bundle output (Step 6), system handles distribution
- Error handling: simple retry on step failure for now

---

## Next Session Topics
1. Dynamic language content (translation flow)
2. Cliffhangers for ads (where defined, how packaged)
3. Full system architecture spec based on these decisions
