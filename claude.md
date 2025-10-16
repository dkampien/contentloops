# Project: Bible Content Video Generation POC

## What We're Building
Automated CLI tool that generates AI video content from user problem data using OpenAI (scripts) + Replicate Veo 3 (videos). Outputs video clips + JSON for TheBibleChat.com's platform.

## Current Stage
- [x] Exploration
- [x] PRD
- [x] Technical Specs
- [x] Implementation Plan
- [x] Building ✅ **IMPLEMENTATION COMPLETE - READY FOR TESTING**

## Key Decisions
- **Stack**: TypeScript, Node.js
- **APIs**: OpenAI (gpt-4o-mini), Replicate (Veo 3)
- **Scope**: POC - 2 categories, 2 templates, 3 scenes each = 12 video clips
- **Templates**: Direct-to-camera, Text+Visuals
- **Architecture**: Category + Template → Script (LLM with Zod) → 3 Scene Prompts → Video Clips (Veo 3)

## Docs Location
- **Exploration**: `_docs/1_development-docs/cycle-1/0-exploration.md`
- **PRD**: `_docs/1_development-docs/core-docs/1-product-requirements.md`
- **Tech Specs**: `_docs/1_development-docs/core-docs/3-technical-specs.md`
- **Input Data**: `bquxjob_696709f0_199c894db50.csv` (170 rows, 9 problem categories)

## Workflow
1. Exploration thread (discuss, clarify, make decisions)
2. Draft PRD
3. Draft Technical Specs (with external API docs)
4. Create Implementation Plan
5. Build incrementally

## Important Constraints
- **POC only** - keep it simple, prove the concept
- **No video stitching** - CTO's platform handles that
- **Sequential execution** - parallel is future enhancement
- **Resume capability** - simple state management, don't overcomplicate
- **Clean code** - designed for integration with larger platform

## Pipeline Flow
```
CSV → Extract Categories → For each (Category × Template):
  1. Generate Script (OpenAI)
  2. For each Scene (3):
     - Generate Video Clip (Veo 3)
     - Save to disk
  3. Track progress in state.json
→ Final JSON output + video assets
```

## Problem Categories (9 total)
1. Anxiety or fear
2. Stress or burnout
3. Finances or provision
4. Purpose or direction
5. Loneliness or heartbreak
6. Family or relationships
7. Addiction or temptation
8. Health or healing
9. Grief or loss
