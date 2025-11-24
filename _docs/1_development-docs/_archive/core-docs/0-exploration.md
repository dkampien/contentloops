# Exploration Summary - Video Generation POC

## Initial Context

**Project Goal**: Build an MVP for TheBibleChat.com that automatically generates video content from a dataset of user problems. The output needs to integrate with their existing internal distribution and marketing platform.

**Starting Point**:
- CSV dataset with ~170 rows of user problems
- Need to generate video clips (assets only, no stitching)
- Output: Video files + JSON scaffold for CTO to integrate
- Focus: Proof of concept, not production system

## Key Decisions

### 1. Data Processing Approach

**Decision**: Use existing `lifeChallengeOption` categories from CSV as-is

**Rationale**:
- 9 pre-categorized problem types already exist in the data
- No need for LLM clustering or re-processing
- Faster, simpler for POC
- Categories are well-defined and cover the problem space

**Categories**:
1. Anxiety or fear
2. Stress or burnout
3. Finances or provision
4. Purpose or direction
5. Loneliness or heartbreak
6. Family or relationships
7. Addiction or temptation
8. Health or healing
9. Grief or loss

### 2. Template Architecture

**Decision**: Template defines script type and format

**Key Insight**: Different video formats require fundamentally different script types
- Direct-to-camera needs conversational dialogue
- Text+Visuals needs short, punchy text snippets

**Architecture Flow**:
```
Category + Template → Generate Script (template-specific) → Break into Scenes → Generate Prompts → Videos
```

**POC Templates**:

**Template 1: Direct-to-Camera**
- Person speaking to viewer
- Empathetic, conversational tone
- 3-scene emotional progression: acknowledge → comfort → hope
- Script: Spoken dialogue format

**Template 2: Text + Visuals**
- Text overlays on calming footage
- Reflective, inspirational tone
- 3-scene text progression: opening → scripture → closing
- Script: Short visual text snippets

### 3. Pipeline Flow

**Final Established Pipeline**:
```
1. Data Processing
   CSV Input → Extract 9 Categories

2. Content Generation (for each Category × Template)
   Category + Template → LLM generates:
   ├── Overall video script/narrative
   ├── 3 scene-specific content pieces
   └── Cinematography prompts per scene

3. Video Generation (for each scene)
   Prompt → Veo 3 API → 10-second video clip

4. Output Assembly
   Collect all clips + metadata → JSON scaffold + video files
```

### 4. Script Generation Structure

**Decision**: LLM generates complete structured output per category+template

**Output Format**:
```json
{
  "category": "Anxiety or fear",
  "template": "Direct-to-camera",
  "overallScript": "Full narrative theme...",
  "scenes": [
    {
      "sceneNumber": 1,
      "content": "Scene-specific narrative/dialogue",
      "prompt": "Cinematography prompt for Veo 3"
    },
    // ... scenes 2 and 3
  ]
}
```

**Prompt Style**: "Director of photography" prompts describing:
- Visual composition and framing
- Lighting and mood
- Subject/setting details
- Emotional tone
- Action/movement

### 5. Configuration & Scale

**POC Parameters**:
- **Categories**: 2 (for initial testing)
- **Templates**: 2 (Direct-to-camera, Text+Visuals)
- **Scenes per video**: 3
- **Variations**: 1 per category+template combo
- **Execution**: Sequential (configurable for parallel)

**Math**: 2 categories × 2 templates × 3 scenes = **12 video clips total**

**Design Principle**: All parameters configurable for easy scaling
- Expand to all 9 categories
- Add more templates
- Generate multiple variations
- Switch to parallel execution

### 6. Technical Stack

**Core Technologies**:
- **Language**: TypeScript
- **Runtime**: Node.js
- **Script Generation**: OpenAI API (gpt-4o-mini)
- **Video Generation**: Replicate API (Veo 3)

**Why These Choices**:
- TypeScript: Type safety, maintainability, CTO's platform likely uses it
- OpenAI gpt-4o-mini: Cost-effective, fast, sufficient for script generation
- Veo 3: Current best text-to-video model available on Replicate, direct workflow (no multi-step)

**Workflow**: Direct text-to-video (not text→image→video)
- Simpler for POC
- Veo 3 handles quality well
- Fewer API calls

### 7. Video Specifications

**Format**:
- Duration: ~10 seconds per clip
- Aspect ratio: Vertical (9:16)
- One clip per scene (no stitching)

**Generation Approach**:
- Sequential execution (one at a time)
- Polling/waiting for completion
- Error handling and retries
- Rate limit awareness

### 8. State Management

**Decision**: Simple resume capability without overcomplication

**Approach**:
- Track generation progress
- Save intermediate outputs
- Resume from last successful step if interrupted
- Don't build complex orchestration system

## Alternatives Considered & Rejected

### Data Processing
- ❌ **LLM clustering of free-text problems**: Too complex, unnecessary when categories exist
- ❌ **Using individual user stories**: Not needed for POC, focus on category-level content
- ❌ **Demographics-based personalization**: Out of scope for POC

### Video Generation Workflow
- ❌ **Text→Image→Video pipeline**: More complex, more API calls, not needed with Veo 3
- ❌ **Multiple video models**: Stick with Veo 3 for consistency
- ❌ **Custom model fine-tuning**: Way out of scope for POC

### Script Generation
- ❌ **Pre-written template scripts**: Less flexible, harder to scale
- ❌ **Script before template selection**: Wrong order - template defines script type
- ❌ **Single universal script format**: Doesn't work across different template types

### Execution
- ❌ **Parallel execution initially**: Sequential simpler for POC, can add later
- ❌ **Webhooks for async**: Polling sufficient for POC scale
- ❌ **Complex error recovery**: Keep it simple

## Open Questions / Deferred to Later Stages

### For Technical Specs Phase:
- Exact JSON schema structure
- File naming conventions
- Directory organization for outputs
- Error handling specifics
- Retry logic details
- State file format
- Config file structure

### For Implementation Phase:
- Specific OpenAI prompt templates
- Veo 3 parameter tuning (if any)
- Logging strategy
- Testing approach

### Post-POC:
- Cost tracking and optimization
- Performance optimization
- Production deployment
- Integration testing with CTO's platform
- Scaling to all 9 categories
- Multiple variations per category
- Actual user story incorporation

## Success Criteria

**POC is successful if**:
1. Generates 4 videos (2 categories × 2 templates) with 3 clips each = 12 clips
2. Videos are relevant to their problem categories
3. Template styles are visually distinct and appropriate
4. JSON output is clean and well-structured
5. Pipeline is repeatable and configurable
6. Code is clean and maintainable

## Key Insights from Exploration

1. **Template = Format**: The most important architectural insight. Templates aren't just visual styles, they fundamentally define what kind of content gets generated.

2. **Category-level is sufficient**: Don't need individual user stories for POC. Category-level content proves the concept.

3. **POC scope discipline**: Resist temptation to build production features. 2 categories × 2 templates is enough to validate the approach.

4. **Configuration-first design**: Build configurability from the start so scaling up is trivial.

5. **LLM does the heavy lifting**: Use LLM for script + prompt generation. Don't try to template everything manually.

6. **Simple > Complex**: Sequential execution, polling (not webhooks), simple state management. Keep it straightforward.
