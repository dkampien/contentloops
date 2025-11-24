# Problem/Solution Flow Map - Teaching LLM to Write Image Gen Prompts

**Created:** 2025-01-21
**Status:** Active exploration
**Context:** Manual workflow branch (single LLM thread)

---

## Overview

This diagram maps the problem identification, architectural decisions, and solution design for teaching an LLM to generate high-quality image generation prompts for comic books.

---

## Flow Diagram

```
PROBLEM/SOLUTION FLOW MAP - TEACHING LLM TO WRITE IMAGE GEN PROMPTS
═══════════════════════════════════════════════════════════════════════

POINT 1: THE TEACHING PROBLEM
┌───────────────────────────────────────────────────────────────────┐
│ Goal: Teach LLM to write image gen prompts                        │
│ Method: Created docs → delivered as files in context              │
│ Result: LLM can't follow instructions consistently                │
└───────────────────────────────────────────────────────────────────┘
                                │
                                ↓
POINT 2: WORKFLOW TYPE (BRANCH POINT)
                                │
                  ┌─────────────┴─────────────┐
                  │                           │
                  ↓                           ↓
           MANUAL WORKFLOW            PRODUCTION WORKFLOW
      ┌────────────────────┐     ┌────────────────────────┐
      │ - Single LLM thread│     │ - TypeScript app       │
      │ - Human-in-loop    │     │ - Multiple LLM calls   │
      │ - Test/iterate     │     │ - Automated            │
      └────────────────────┘     └────────────────────────┘
                  │                           │
                  ↓                           ↓

POINT 3: CONTENT STRUCTURE
      ┌────────────────────┐     ┌────────────────────────┐
      │ Separate into:     │     │ Separate into:         │
      │                    │     │                        │
      │ KNOWLEDGE LAYER    │     │ KNOWLEDGE LAYER        │
      │ - Universal        │     │ - Universal            │
      │ - How to write     │     │ - How to write         │
      │   prompts          │     │   prompts              │
      │ - Framework/guide  │     │ - Framework/guide      │
      │                    │     │                        │
      │ APPLICATION LAYER  │     │ APPLICATION LAYER      │
      │ - Task-specific    │     │ - Task-specific        │
      │ - Comic book       │     │ - Comic book           │
      │   workflow         │     │   workflow             │
      │ - Templates        │     │ - Templates            │
      └────────────────────┘     └────────────────────────┘
                  │                           │
                  ↓                           ↓

POINT 4: DELIVERY METHOD
      ┌────────────────────┐     ┌────────────────────────┐
      │ KNOWLEDGE LAYER:   │     │ KNOWLEDGE LAYER:       │
      │ - System prompt    │     │ - System prompts       │
      │   (CLAUDE.md)      │     │ - API structured       │
      │                    │     │                        │
      │ APPLICATION LAYER: │     │ APPLICATION LAYER:     │
      │ - Template file    │     │ - Multiple API calls   │
      │ - Context window   │     │ - Structured inputs    │
      └────────────────────┘     └────────────────────────┘
                  │                           │
                  ↓                           ↓

POINT 5: TEMPLATE CONTENT/WORKFLOW
      ┌────────────────────┐     ┌────────────────────────┐
      │ Design v4 template │     │ Design production      │
      │ with clear         │     │ workflow with          │
      │ structure:         │     │ structured calls:      │
      │                    │     │                        │
      │ Each step has:     │     │ Each step has:         │
      │ - Role/Context     │     │ - API call structure   │
      │ - Task             │     │ - Input/output schema  │
      │ - Rules            │     │ - Error handling       │
      │ - Examples         │     │ - Validation           │
      │ - Output format    │     │ - State management     │
      │ - Stop conditions  │     │                        │
      │                    │     │                        │
      │ Workflow steps:    │     │ Workflow steps:        │
      │ - Story narrative  │     │ - Automated pipeline   │
      │ - Page planning    │     │ - Multi-call chain     │
      │ - Prompt gen       │     │ - Batch processing     │
      │ - Post-processing  │     │ - Quality checks       │
      └────────────────────┘     └────────────────────────┘
```

---

## Key Decisions

### Architecture (Point 3)
- **Knowledge Layer**: Universal prompting system (shared across all templates)
- **Application Layer**: Task-specific implementation (one per template type)
- **Rationale**: Avoid repeating framework in every template, maintain single source of truth for core concepts

### Delivery Method (Point 4)

**Manual Workflow:**
- Knowledge Layer → System prompt (CLAUDE.md)
- Application Layer → Template file uploaded to context
- Constraint: Limited to these two delivery methods

**Production Workflow:**
- Knowledge Layer → System prompts / API structured inputs
- Application Layer → Multiple API calls with structured schemas
- Flexibility: Can structure calls, manage state, validate outputs

### Template Structure (Point 5)

**Clear Section Format:**
Each workflow step follows predictable structure:
1. **Role/Context** - What you are doing
2. **Task** - What to do
3. **Rules/Constraints** - Must/must-not
4. **Examples** - Worked demonstrations
5. **Output Format** - Expected structure
6. **Stop Conditions** - When to move on

---

## Info Type Definitions

**Knowledge** - Information/facts about the domain ("What something is")
**Instructions** - Step-by-step directives ("How to do something")
**Rules** - Constraints, requirements ("What you can/cannot do")
**References** - Supporting material ("Where to find more detail")
**Examples** - Concrete instances ("What good output looks like")

---

## Current Focus

**Working on:** Point 5 (Manual Workflow branch)
**Next steps:**
1. Design v4 template structure
2. Optimize system prompt (knowledge layer)
3. Test with real comic book generation

---

## Related Files

- Knowledge Layer: `_docs/2_reference-docs/prompt-formula-framework-v2.md`, `prompt-generation-guide-v5.md`, `prompt-blocks.json`
- Application Layer (v3.2): `_templates/comic-books/comic-books_template_v3.2.md`
- Application Layer (v4): TBD
- System Prompt: `claude.md` (to be updated)

---

**Last Updated:** 2025-01-21
