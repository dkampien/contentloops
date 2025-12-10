# ContentLoops (CLoops) - PRD Draft v1

## Overview

CLoops is a template-based content generation system that supplies assets to AdLoops. It is NOT an ad maker - it's a supplier of raw ingredients (images, video, narration, metadata) that AdLoops' Mixer combines into final ads.

---

## System Flow

```
1. TRIGGER
   - Manual: CLI command
   - Scheduled: cron (later)

2. TEMPLATE SELECTION
   - Operator specifies which template to run
   - Template determines everything downstream

3. CONFIG LOADING
   - Load template defaults
   - Apply any runtime overrides

4. INPUT
   - Datasource determined by template
   - Fetch next item(s) from datasource

5. TEMPLATE EXECUTION
   - Run template steps in order
   - Dry run: LLM steps only (skip image gen)
   - Full run: all steps

6. BUNDLE OUTPUT
   - Write output files to disk
   - Template defines output structure

7. POST-PROCESSING
   - Upload to cloud storage
   - Transform to AdLoops format (if needed)

8. ADLOOPS DELIVERY
   - Write to Firestore collections (manifest format TBD - clarify with SoulStream)
   - Mark datasource item complete
```

---

## Core Concepts

### Template
A self-contained content generation workflow. Contains:
- **Production plan** - step-by-step spec (steps can have substeps)
- **Config** - all parameters (template settings, style, generation service/model/params)
- **Prompts** - system prompts and user message templates per step

Templates are separate per variant:
- `comic-books-standard`
- `comic-books-kids` (later)
- `comic-books-ads` (later)

### Datasource
Where input comes from. Initial types:
- **Backlog** - queue with completion tracking
- **CSV** - batch data file

Architecture is modular - new datasource types can be added. Template defines expected input shape, doesn't care which datasource type provides it.

### Output Types
Templates can output different asset types depending on their generation config (static images, video, etc.). The template defines what it outputs; post-processing handles delivery to AdLoops accordingly.

### Bundle
Output of a template run. For comic-books:
```
output/comic-books/{story-id}/
├── 1.jpg
├── 2.jpg
├── 3.jpg
├── thumbnail.jpg
└── story-data.json
```

---

## Template Structure

```
templates/
  comic-books-standard/
    production-plan.md      # Step-by-step spec
    config.json             # All parameters (settings, style, generation)
    prompts/                # Or inline in plan
      step1-system.txt
      step2-system.txt
      ...
```

### Config Example
```json
{
  "pageCount": { "min": 3, "max": 5 },
  "panelsPerPage": 3,
  "style": {
    "artStyle": "children's book illustration",
    "inkStyle": "bold ink lines",
    "colorTreatment": "flat colors"
  },
  "generation": {
    "service": "replicate",
    "model": "seedream4",
    "params": {
      "aspect_ratio": "9:16",
      "output_format": "jpg"
    }
  }
}
```

### Model Configs
Separate config per image generation model (not base + override):
- Each model (seedream, nanobanana) has its own constraint set
- Template specifies which model to use
- Model config affects prompt generation rules (character consistency, panel complexity, etc.)

---

## CLI Interface (MVP)

```bash
# Run a template (full run)
cloops run comic-books-standard

# Dry run (LLM steps only, no image gen)
cloops run comic-books-standard --dry

# Override config
cloops run comic-books-standard --pages 3 --model seedream

# List available templates
cloops templates

# Check datasource status
cloops status comic-books-standard
```

---

## Execution Modes

### Full Run (default)
- Runs all steps
- Generates images/video via API
- Writes final bundle

### Dry Run (`--dry` flag)
- Runs LLM steps only (skips generation)
- Outputs prompt text, validates pipeline
- Cheap and fast for iteration/testing

---

## Services (System-Level)

Shared infrastructure that templates invoke:

### LLM Service
- Executes OpenAI API calls
- Handles structured output parsing
- Template provides: model, prompts, schema

### Generation Service
- Executes image/video generation calls
- Supports: Replicate, ComfyUI (future)
- Template provides: service, model, parameters, prompts
- Service handles: API calls, retries, file download

### Storage Service
- Writes bundles to output folder
- Uploads to cloud storage (post-processing)

### Knowledge Layer
- Prompting methodology shared across templates
- Block system, assembly rules, visual-only principle
- Injected into prompt generation steps

---

## Tech Stack

- **Language:** TypeScript
- **Runtime:** Node.js

---

## MVP Scope

**In scope:**
- CLI with manual trigger
- One template: `comic-books-standard`
- Dry run and full run modes
- Local backlog (JSON file or simple DB)
- Local output (files on disk)
- Basic logging (step status, errors)

**Out of scope (later):**
- Scheduled runs
- Multiple template variants (kids, ads)
- AdLoops Firestore integration
- Cloud deployment
- Resume from checkpoint

---

## Next Steps

1. Finalize this PRD based on feedback
2. Define technical spec (implementation details)
3. Build MVP: CLI + one template + local execution
4. Test end-to-end with comic-books-standard
5. Add AdLoops integration
6. Add more templates

---

*Draft v1 - 2025-11-28*
