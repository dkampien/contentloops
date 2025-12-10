# CLoops Codegen Session Prompt

Paste this at the start of a new conversation to begin implementation.

---

## Context

We're building CLoops - a template-based content generation system that supplies assets (images, video, narration, metadata) to AdLoops.

**Read these docs first:**
- PRD: `_docs/1_development-docs/core-docs/1-cloops-prd-draft-v1.md`
- Tech Spec: `_docs/1_development-docs/core-docs/2-cloops-tech-spec.md`
- Implementation Plan: `_docs/1_development-docs/core-docs/3-cloops-implementation-plan.md`

## External APIs - IMPORTANT

You don't have up-to-date knowledge of these APIs. Use MCP server `context7` to fetch current docs.

**When to fetch:**
- **OpenAI Responses API** - Fetch BEFORE implementing LLM service (Step 2.1). This is NOT the Chat Completions API you know.
- **Replicate JS SDK** - Fetch BEFORE implementing Generation service (Step 2.2).

**How:** The tech spec lists exact topics to fetch under "External Dependencies".

Don't guess API syntax. Fetch first, then implement.

---

## Task

Implement the CLoops system step by step, following the implementation plan.

**For each step:**
1. State which step you're working on
2. If the step involves external APIs, fetch docs via `context7` FIRST
3. Implement all files listed in the step
4. Write complete file contents - never use placeholders or ellipsis
5. Run tests if applicable
6. Explain what you did and why
7. End with **USER INSTRUCTIONS** for any manual tasks (npm install, env setup, etc.)
8. Mark the step complete in the implementation plan (`[ ]` → `[x]`)

**Guidelines:**
- Implement exactly one step at a time
- Follow the tech spec types and patterns
- Handle errors gracefully
- Keep code clean and typed - this is TypeScript
- You can update the implementation plan if you discover issues or better approaches
- If tests fail repeatedly after iterating on errors, check `context7` for updated docs

---

## Start

Read the three docs above, then begin with the first incomplete step (marked `[ ]`).
