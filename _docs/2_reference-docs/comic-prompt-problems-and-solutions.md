# Comic Book Prompt Generation - Problems & Solutions

**Date:** 2025-01-19
**Context:** Testing CustomGPT prompt generation for Bible story comic books

---

## Generation Output Issues

### Consistency and Continuity
- **Location/setting changes** (ark on hill → ark in city between panels)
- **Character appearance, scenes or objects appearance change between panels and pages**
- **Elements from one panel can influence other panels** (concepts bleeding in latent space)
- **Critical story elements missing or generated incorrectly** (injured person not on donkey)

### Dialogue
- **Speech bubbles can't be assigned correctly to speakers**
- **Too many speech bubbles per page cause text gen failures**

---

## Prompt Structure Issues

### Character & Object Definitions
- **Undefined characters/objects referenced in prompts** (e.g., "the helper", "the teacher" used without visual description)
- **Character descriptions not repeated exactly**
  - *Note: Too many exact descriptions might overwhelm the model → Second prompting approach with characters defined once at the beginning*
- **Missing object/setting definitions** (similar to character descriptions)

### Language Used (filling block values?)
- **Over-descriptive/verbose language** (attribute lists instead of natural sentences) -???
- **Descriptions not camera-visible enough** (e.g., "intimidating" vs "sneering face, furrowed brow")
- **Lack of specificity in descriptions** (vague references like "family" instead of three sons or wrong quantities cause narrative drift from source material)
- **Too many elements cause generation failures** (When given "puddles + muddy ground + ark" it can't do the boat, it focuses on the ground and people entering a house. Also related to latent bleeding. The model associated muddy ground and puddles with a house)

---

## Problem-Solution Table: Prompt Structure Issues

| Problem | Solution |
|---------|----------|
| **Undefined characters/objects referenced in prompts** (e.g., "the helper", "the teacher" used without visual description) | Define all characters and recurring objects with concrete visual descriptions before use |
| **Character descriptions not repeated exactly** | Repeat exact character descriptions in every panel where they appear (no paraphrasing or shortening) |
| **Missing object/setting definitions** | Define recurring objects and settings with consistent visual descriptions, similar to character definitions |
| **Over-descriptive/verbose language** (attribute lists instead of natural sentences) | Use natural flowing sentences; avoid clustered attribute lists |
| **Descriptions not camera-visible enough** (e.g., "intimidating" vs "sneering face, furrowed brow") | Use concrete, camera-visible descriptions only; avoid interpretive/emotional language |
| **Lack of specificity in descriptions** (vague references like "family" or wrong quantities) | Use specific quantities and details (e.g., "three sons" not "family"; "three wise men" not "the wise man") |
| **Too many elements cause generation failures** | Simplify panels to 3-5 core elements maximum; prioritize critical story elements |

---

## Notes

- **Generation Output Issues** are largely caused by **Prompt Structure Issues**
- Some problems have clear solutions (Prompt Structure), others are model behavior we can't fully control (Generation Output)
- Solutions listed are based on testing and iteration, not guaranteed fixes
- Character definition approach still being refined (exact repetition vs defined once at beginning)

---

**Status:** Active testing and iteration
**Next Steps:** Continue refining prompt structure approach, test separate panel generation workflow
