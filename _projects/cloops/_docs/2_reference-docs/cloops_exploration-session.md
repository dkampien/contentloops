# ContentLoops (CLoops) Exploration Session Summary

> Session date: 2025-11-25
> Purpose: Establish architectural direction for ContentLoops system

---

## What is ContentLoops?

**ContentLoops is a template-based execution engine that supplies assets to AdLoops.**

It is NOT an ad maker. It's a **supplier** of raw ingredients (images, videos, overlay data) that AdLoops' Mixer combines into final ads.

---

## Mental Model Hierarchy

```
ADLOOPS (Final Ad Delivery)
    ↑
COMPONENTS (hooks, bodies, overlays)
    ↑
CLOOPS (Component Supplier)
    ↑
TEMPLATE PLAN → TEMPLATE CODE IMPLEMENTATION
    ↑
WORKFLOW STEPS
    ↑
GENERATION SUBWORKFLOWS (Replicate, ComfyUI, ElevenLabs, etc.)
```

---

## Key Decisions

### 1. Separate Templates Per Variant

**Decision:** Each content variant gets its own template (not profiles within one template).

**Examples:**
- `comic-books-standard` - Standard style for ads
- `comic-books-kids` - Kids style with voice generation
- `comic-books-ads` - Ad-optimized format

**Rationale:**
- Variants have genuinely different workflow steps (kids needs voice generation)
- Clarity over cleverness - look at one template, see exactly what it does
- Easier to maintain with AI assistance
- Duplication is manageable - shared logic lives in services, templates just orchestrate

### 2. Bottom-Up Development Approach

**Decision:** Start with production template plan, derive system requirements from it.

**Approach:**
1. Take manual template v4 (proven workflow)
2. Convert to production template plan (automation-ready spec)
3. Let the template reveal what CLoops engine needs to support
4. Then design system architecture based on real requirements

**Rationale:**
- Manual workflow already exists and works
- Avoids designing abstractions in a vacuum
- Template becomes the forcing function for system design

### 3. Output Destination is a Packaging Concern

**Decision:** Variants based on *what gets generated*, not *where it goes*.

- `comic-books-kids` template generates kids-style content
- Output target (app vs AdLoops) is a flag/config on the run
- Same generation, different packagers at the end

**Rationale:**
- Generation steps are expensive (images, voice)
- Packaging is cheap (assembling JSON, uploading)
- Avoids duplicating templates just for different destinations

---

## Template Structure (Per Content Type)

```
templates/
  comic-books-standard/
    manual-template.md          ← Reference (how it was done manually)
    production-template-plan.md ← Automation-ready spec
    implementation/             ← Code that runs it

  comic-books-kids/
    manual-template.md
    production-template-plan.md
    implementation/

  comic-books-ads/
    ...
```

---

## Template Lifecycle

For each content type:

1. **Manual template** - Figure out the workflow by doing it manually with AI assistance
2. **Production template plan** - Rewrite into automation-ready spec:
   - Discrete steps with clear inputs/outputs
   - Which steps are LLM calls vs API calls vs file operations
   - Error handling, retries
   - Output format specifications
3. **Production template implementation** - Code that executes the plan

---

## What a Production Template Plan Should Define

- **Input:** What triggers the template (topic, story ID, etc.)
- **Steps:** Ordered workflow with:
  - Step name
  - Input (from previous step or external)
  - Operation type (LLM call, API call, file operation)
  - Output schema
  - Error handling
- **Services used:** Which external APIs (OpenAI, Replicate, ElevenLabs)
- **Output bundle:** What files/data are produced
- **AdLoops integration:** How output maps to Firestore collections

---

## Next Steps

1. Create production template plan for `comic-books-standard` (or whichever variant first)
2. Use v4 manual template as reference
3. Identify external API docs needed (OpenAI structured outputs, image gen API, etc.)
4. Define step-by-step workflow with inputs/outputs
5. This will reveal CLoops engine requirements

---

## Open Questions

- How should comic panels map to AdLoops components? (Individual bodies? Sequences?)
- What metadata does AdLoops need for comic content?
- Voice generation for kids - batch or per-panel?
- Error handling strategy - retry? Skip? Alert?

---

## Reference Documents (ask permission to read)

- `_docs/2_reference-docs/adloops-system-analysis.md` - AdLoops system deep dive
- `_docs/1_development-docs/core-docs/01-system-architecture.md` - Draft CLoops architecture
- `_templates/comic-books/comic-books_template_v4.md` - Manual workflow reference
