# Video Template Design Framework

**Purpose**: Guide for defining video templates that drive content generation workflow

**Date**: October 23, 2025

---

## Design Flow

The template design follows a sequential process where each step builds on the previous:

```
1. Intent & Purpose → (why this template exists)
2. Emotional Arc → (structure across scenes)
3. Visual Format → (what viewer sees)
4. Content Fields → (what LLM generates)
5. Variables → (how to create variety)
6. Mapping → (putting it all together)
```

**Sequential dependencies**:
- Purpose informs Arc
- Arc + Format determine Content Fields needed
- Content Fields + Scale needs = Variables
- Mapping shows the relationships

Each step is foundational to the next, ensuring a coherent template design.

---

## Template Definition Process

### Step 1: Define Template Purpose
**Question**: What emotion or outcome should the viewer feel after watching?

**Key considerations**:
- Must work across ALL problem categories the template will serve
- Should be specific enough to guide content creation
- Should be measurable/observable

**d2c example**: "Viewer feels comforted, validated, and prompted to explore BibleChat"

---

### Step 2: Define Emotional Arc
**Question**: What is the progression of emotion/message across scenes?

**Structure**:
- Fixed number of scenes (for POC: 3 scenes × 8 seconds)
- Each scene serves a specific purpose
- Arc should build toward the template purpose

**d2c example**:
- Scene 1: Recognition/validation of struggle (~20 words)
- Scene 2: Reassurance/comfort, you're not alone (~20 words)
- Scene 3: Gentle invitation to BibleChat (~20 words)

**Arc pattern**: Recognition → Reassurance → Resource

---

### Step 3: Define Visual Format
**Question**: What does the viewer see? What stays constant vs. what changes?

**Key decisions**:
- Format type (direct-to-camera, text-on-visuals, b-roll, etc.)
- What elements stay consistent across scenes
- What elements change to show progression

**d2c example**:
- Format: Person speaking directly to camera
- Consistent: Same person, same setting, same framing
- Changes: Expression, posture, mood (tired → reassured → hopeful)

---

### Step 4: Define Content Requirements
**Question**: What content needs to be generated to execute this template?

**Mapping**:
```
Template level (hardcoded):
├─ Overall intent/purpose
├─ Message arc structure
└─ Visual format rules

Generated per video (variable):
├─ videoScript (Scene 1 visual baseline)
└─ voiceScript (dialogue following arc)
```

**d2c example**:
- **videoScript**: Full description of Scene 1 (person, setting, expression, mood)
- **voiceScript**: 50-60 words continuous dialogue following 3-part arc
- Scenes 2-3: Derived from videoScript baseline (expression changes only)

---

### Step 5: Define Flexibility Points
**Question**: What should vary between videos to create diversity at scale?

**Variables to consider**:
- Setting variations
- Person characteristics (age, gender, ethnicity)
- Dialogue phrasing
- Specific props/details

**d2c example variables**:
- `variety_instruction`: Controls setting/person diversity
- `dialogue_instruction`: Controls whether dialogue appears in Veo prompts

---

## Template Specification Schema

```typescript
interface TemplateDefinition {
  // Identity
  id: string;
  name: string;

  // Purpose & Structure (hardcoded)
  purpose: string;
  emotionalArc: SceneArc[];
  visualFormat: VisualFormat;

  // Content Generation (what LLM generates)
  contentFields: ContentField[];

  // Workflow (how many calls, what they do)
  workflow: WorkflowStep[];

  // Flexibility (what varies per video)
  variables: TemplateVariable[];
}

interface SceneArc {
  sceneNumber: number;
  purpose: string;           // e.g., "Recognition of struggle"
  wordCount: number;          // e.g., ~20 words
}

interface VisualFormat {
  type: "direct-to-camera" | "text-visuals" | "b-roll";
  consistent: string[];       // What stays same
  varies: string[];           // What changes
}

interface ContentField {
  name: string;               // e.g., "videoScript"
  purpose: string;            // Why this field exists
  constraints: string;        // Generation rules
}

interface WorkflowStep {
  callNumber: number;
  generates: string[];        // Field names
  systemPrompt: string;
}

interface TemplateVariable {
  name: string;
  purpose: string;
  options: string[];
}
```

---

## Design Considerations

### The Redundancy Problem

**Issue identified**: Previous implementation had multiple fields describing the same information:
- `overallScript`: Meta-description of video concept
- `scenes[].content`: Scene descriptions with dialogue embedded
- `scenes[].prompt`: Reworded version of scene content

**Result**: 3-4 fields saying essentially the same thing, just rephrased differently.

**Solution**: Streamlined to two functional fields:
- `videoScript`: Scene 1 visual baseline (functional, not meta)
- `voiceScript`: Dialogue separate from visuals

### Translation Layers

**Question**: How many steps from userProblem to Veo prompt?

**Considered approaches**:
1. **Direct (1 layer)**: userProblem → scenes[].prompt
   - Pro: Fast, simple
   - Con: Mixing creative + technical in one call

2. **Two-step (current)**: userProblem → videoScript/voiceScript → scenes[].prompt
   - Pro: Separates creative (narrative) from technical (Veo formatting)
   - Pro: Easier to debug and refine
   - Con: Two LLM calls

3. **Multi-step (rejected)**: userProblem → overallScript → scenes.content → scenes.prompt
   - Con: Too many redundant translations

**Decision**: Two-step approach balances clarity with efficiency.

---

## Design Decisions & Changes

### Decision 1: videoScript Repurposed as Visual Baseline
**Date**: October 23, 2025

**Previous approach**:
- videoScript: Meta-description ("how this problem fits the arc")
- Separate scenes[].description for visuals

**New approach**:
- videoScript: Scene 1 full visual description (functional baseline)
- Scenes 2-3: Derived from videoScript (expression changes only)

**Reasoning**:
- Eliminates redundancy (was describing same thing multiple ways)
- videoScript becomes functional instead of meta-commentary
- Aligns with frame chaining strategy (Scene 1 full, 2-3 minimal)

**Impact**: CALL 1 generates videoScript differently; CALL 2 uses it as baseline

---

## Example: Direct-to-Camera Template

**Template ID**: `direct-to-camera`

**Purpose**: Viewer feels comforted, validated, and prompted to explore BibleChat

**Emotional Arc**:
1. Scene 1 (8s, ~20 words): Recognition/validation of struggle
2. Scene 2 (8s, ~20 words): Reassurance/comfort, not alone
3. Scene 3 (8s, ~20 words): Gentle BibleChat invitation

**Visual Format**:
- Type: Direct-to-camera
- Consistent: Person, setting, framing
- Varies: Expression, posture, mood

**Content Fields**:
```
videoScript:
  Purpose: Scene 1 visual baseline
  Constraints: Simple description, no jargon, person/setting/expression/mood

voiceScript:
  Purpose: Full dialogue for all 3 scenes
  Constraints: 50-60 words total, conversational tone, follows arc
```

**Workflow**:
```
CALL 1:
  Input: userProblem, variety_instruction
  Generates: videoScript, voiceScript

CALL 2:
  Input: videoScript, voiceScript, dialogue_instruction
  Generates: scenes[].prompt
    - Scene 1: Full (from videoScript + dialogue)
    - Scenes 2-3: Minimal (expression change + dialogue)
```

**Variables**:
```
variety_instruction:
  Purpose: Control setting/person diversity
  Options: ["low variety", "medium variety", "high variety"]

dialogue_instruction:
  Purpose: Toggle dialogue in Veo prompts
  Options: ["include dialogue", "exclude dialogue"]
```

---

## Key Learnings

**Template drives workflow**:
- Template structure determines number of LLM calls needed
- Template requirements define what fields to generate
- Template format dictates prompt strategies (full vs. minimal)

**Separation of concerns**:
- Template = structure/intent (hardcoded)
- Content = specific execution (generated per video)
- Variables = controlled flexibility (configurable)

**Design for scale**:
- Use variables for controlled variety
- Keep constraints flexible enough for diversity
- Test with multiple problem categories to ensure universality

---

## Related Documents

- **Cheat Sheet**: `template-design-short.md` - Quick reference
- **d2c Implementation**: `../1_development-docs/cycle-X/` - Actual implementation
- **Workflow Doc**: `workflow-problems-and-solutions-2.md` - Technical decisions
