# Script Structure Redesign - Requirements

**Date**: October 16, 2025
**Cycle**: 2
**Status**: Planning

---

## Problem Statement

### Current Implementation Issues

The current script generation creates **disconnected content and prompts**:

**Example:**
```json
{
  "sceneNumber": 1,
  "content": "Hey there, I just want you to take a moment and breathe. I know that anxiety can feel overwhelming...",
  "prompt": "The camera focuses on a warm, inviting living room. The subject sits comfortably on a couch with a gentle smile..."
}
```

**❌ The Mismatch:**
- `content`: Describes active speaking and dialogue delivery
- `prompt`: Describes someone sitting quietly with a smile
- **Result**: Video shows a person sitting peacefully, but the content implies they're actively speaking

### Root Cause

OpenAI generates `content` and `prompt` as **independent siblings** in a single call. The template systemPrompt doesn't enforce a connection between them:

```
Template tells OpenAI:
"For each scene, provide:
1. Spoken dialogue (conversational, natural)
2. A detailed cinematography prompt"
    ↓
OpenAI generates BOTH independently
    ↓
❌ No parent→child relationship!
```

### Additional Issues

1. **Generic content**: Uses only category ("Anxiety or fear"), not actual user problems
2. **No template-specific prompt rules**: Direct-to-camera should enforce "person speaking" but doesn't
3. **Discarded LLM output**: OpenAI generates `overallScript` but it's thrown away and replaced

---

## Solution Design

### Design Decisions

#### Decision 1: Input Data
**Use Category + Sample Problem** (not just category)

**Current:**
```
Input: "Anxiety or fear"
```

**New:**
```
Input: {
  category: "Anxiety or fear",
  problem: "Being scared that the guy I'm falling for is going to leave me"
}
```

**Rationale:** More specific, relatable, personalized content

---

#### Decision 2: Hierarchy Structure
**Enforce parent→child relationship**

```
Problem + Template
  ↓
overallScript (high-level video idea)
  ↓
scenes[].content (DOP instructions - WHAT HAPPENS)
  ↓
scenes[].prompt (Veo 3 optimized - DERIVED from content)
```

**Field Definitions:**

- **`overallScript`**: High-level video concept/idea (prose format)
  - Example: "A video addressing relationship anxiety and fear of abandonment. Opens with validation of the viewer's fears about losing someone they're falling for. Transitions to reassurance that these feelings are normal and they're not alone in experiencing them. Concludes with an uplifting message about God's constant love and presence, even in uncertainty."
  - Must NOT include template implementation details (e.g., "direct-to-camera")
  - Must be written as clear, professional prose (no arrows, shorthand, or technical notation)

- **`scenes[].content`**: DOP-style instructions (short, comprehensive)
  - Includes: Visual description + dialogue/text + action
  - Example: "Person in 30s, warm living room, facing camera. Speaks with concerned expression: 'I know the fear of losing someone feels overwhelming...' Body language open. Window light. Close-up."

- **`scenes[].prompt`**: Veo 3-optimized prompt (derived from content)
  - Optimized for text-to-video generation
  - Includes template-specific rules
  - **For direct-to-camera**: Must include dialogue in quotes using Veo 3's dialogue format: `person saying "exact dialogue"`
  - **For text-visuals**: No people, calming environments only
  - Example (direct-to-camera): "Close-up of warm, empathetic person in their 30s sitting in cozy living room, facing camera, saying: 'I know the fear of losing someone you're falling for feels overwhelming, like standing on unstable ground.' Concerned but warm expression, natural window light, intimate framing."
  - Example (text-visuals): "Slow tracking shot of ocean waves gently rolling onto sandy beach at sunset, golden hour lighting, peaceful and serene atmosphere, soft focus."

**Rationale:** Clear hierarchy ensures prompt is derived from content, not a sibling

---

#### Decision 3: Generation Strategy
**Two LLM Calls** (control over hierarchy)

**Call 1: Content Generation**
```
Input: problem + template + category
Output: overallScript + scenes[].content

Focus: Generate natural video concept and DOP-style scene descriptions
Cost: ~$0.001
```

**Call 2: Prompt Optimization (for each scene)**
```
Input: scene.content + template-specific rules
Output: scene.prompt

Focus: Optimize for Veo 3 text-to-video with template rules
Cost: ~$0.001 × 3 scenes = ~$0.003
Total per video: ~$0.004
```

**Template-Specific Rules:**
- **Direct-to-camera**:
  - Subject actively speaking with mouth moving
  - Include dialogue in quotes using Veo 3 format: `person saying "exact dialogue"`
  - Extract dialogue from scene.content and embed in prompt
- **Text-visuals**:
  - No people or faces in frame
  - Calming natural environments
  - Space for text overlay (CTO's platform handles text rendering)

**Rationale:** Better control over prompt optimization and template rule enforcement. If prompts fail, only regenerate Call 2 (cheaper).

---

## Requirements

### Functional Requirements

#### FR1: Input Data Enhancement
- [ ] Extract both `lifeChallengeOption` (category) and `onboardingV7_lifeChallenge` (problem) from CSV
- [ ] Pass both category and problem to script generation
- [ ] Select one sample problem per category for POC

#### FR2: Two-Step Generation Flow
- [ ] **Step 1**: Generate `overallScript` + `scenes[].content` from problem + template
- [ ] **Step 2**: For each scene, generate `scene.prompt` from `scene.content` + template rules
- [ ] Maintain proper parent→child relationship

#### FR3: Template-Specific Prompt Rules
- [ ] Define prompt rules per template (direct-to-camera, text-visuals)
- [ ] Enforce rules during prompt generation (Call 2)
- [ ] Ensure visual action matches content intent

#### FR4: Content Structure
- [ ] `scenes[].content` includes both visual description AND dialogue/text
- [ ] DOP-style instructions (short, comprehensive)
- [ ] Clear enough for Call 2 to optimize for Veo 3

#### FR5: Veo 3 Dialogue Integration
- [ ] For **direct-to-camera** template: Extract dialogue from `scene.content` and embed in `scene.prompt` using Veo 3's dialogue format: `person saying "exact dialogue"`
- [ ] For **text-visuals** template: Exclude people/dialogue from prompt, focus on environments
- [ ] Ensure dialogue in prompt matches dialogue in content (no invention or modification)
- [ ] Prompt must describe person actively speaking (not sitting quietly)

---

### Technical Requirements

#### TR1: Schema Updates
- [ ] Update Zod schemas if structure changes
- [ ] Add problem field to input types
- [ ] Ensure backward compatibility for saved state

#### TR2: Script Generator Refactor
- [ ] Split `generateScript()` into two methods:
  - `generateContent()` - Call 1
  - `generatePrompts()` - Call 2
- [ ] Update OpenAI integration for two-step flow
- [ ] Keep `overallScript` from LLM (don't discard)

#### TR3: Template Configuration
- [ ] Add prompt rules to template definitions (including Veo 3 dialogue format instructions)
- [ ] Create systemPrompts for both Call 1 and Call 2
- [ ] Ensure Call 2 systemPrompt instructs LLM to extract and format dialogue correctly
- [ ] Ensure template rules are enforced

#### TR4: Data Processor Updates
- [ ] Extract problems from CSV (not just categories)
- [ ] Return category + sample problem per video
- [ ] Handle problem selection logic

---

### Non-Functional Requirements

#### NFR1: Cost
- Total cost per video: ~$0.004 (acceptable for POC)
- 4x increase from current but necessary for quality

#### NFR2: Performance
- Sequential generation acceptable for POC
- Call 2 can be parallelized in future (not required now)

#### NFR3: Reliability
- Retry logic for both calls
- State management tracks both generation steps
- Resume capability maintained

---

## Success Criteria

### Must Have
1. ✅ `scene.prompt` accurately reflects `scene.content` (no mismatches)
2. ✅ Videos show people actively speaking with dialogue (for direct-to-camera)
3. ✅ Prompts use Veo 3 dialogue format: `person saying "exact dialogue"`
4. ✅ Prompts optimized for Veo 3 text-to-video capabilities
5. ✅ Uses actual user problems (not just generic categories)
6. ✅ Template-specific rules enforced correctly

### Nice to Have
1. Parallel prompt generation (Call 2)
2. Multiple problem variations per category
3. Cost tracking per generation step

---

## Data Flow

### New Pipeline Flow

```
1. CSV File
   ├─ lifeChallengeOption (category)
   └─ onboardingV7_lifeChallenge (problem)

2. DataProcessor.extractProblems()
   └─ Returns: [{ category, problem }]

3. For each (problem × template):

   4. ScriptGenerator.generateContent() [CALL 1]
      Input: { problem, category, template }
      Output: { overallScript, scenes: [{ sceneNumber, content }] }

   5. ScriptGenerator.generatePrompts() [CALL 2]
      For each scene:
        Input: { scene.content, templateRules }
        Output: { scene.prompt }

   6. Assemble VideoScript
      { overallScript, scenes: [{ sceneNumber, content, prompt }] }

   7. VideoGenerator.generateVideoClip()
      Uses scene.prompt → Veo 3
```

---

## Out of Scope (Future Enhancements)

- Parallel prompt generation
- Multiple variations per category
- Cost optimization
- Webhook-based async processing
- Video quality validation
- A/B testing different prompt strategies

---

## Next Steps

1. Create implementation plan (cycle-2/2-implementation-plan.md)
2. Update code based on plan
3. Test with real APIs
4. Validate fix with generated videos
