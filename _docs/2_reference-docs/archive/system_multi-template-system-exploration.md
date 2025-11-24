# Multi-Template System Architecture Exploration

**Date**: 2025-10-27
**Status**: Brainstorming / Architecture Design
**Context**: Realized current system is D2C-centric, need true multi-template support

---

## The Realization

### Current System Limitations

The system **claims** to support multiple templates but is actually **hardcoded for direct-to-camera**:

**What's Hardcoded in `index.ts`:**
```
1. Generate videoScript + voiceScript  (d2c specific)
2. For each scene:
   - Generate video
   - Extract last frame              (only needed for d2c!)
   - Pass to next scene               (frame chaining - d2c only!)
3. Combine all 3 scenes                (assumes 3 scenes)
```

**Problems:**
- ❌ Assumes 3 scenes always
- ❌ Assumes frame chaining always needed
- ❌ Assumes scenes always combine
- ❌ One workflow for all templates

**Reality:**
- Text-visuals template is defined but **won't work** with current pipeline
- Any new template with different requirements will break

---

## Product Insight: Templates = Different Workflows

**Key realization**: A template doesn't just define content structure, it defines an **entire workflow**.

### What Makes Templates Different?

#### Direct-to-Camera
- **Content**: videoScript + voiceScript (person talking)
- **Scenes**: 3 scenes with same person
- **Frame chaining**: YES (keep person consistent)
- **Combination**: YES (3 scenes → 1 video)
- **LLM calls**: 2 calls (content → prompts)
- **Video workflow**: Text → Video (Veo)

#### Text-Visuals (Conceptual)
- **Content**: headlines + bodyText (text overlays)
- **Scenes**: 3 independent nature scenes
- **Frame chaining**: NO (each scene is independent)
- **Combination**: YES (3 scenes → 1 video)
- **LLM calls**: 2 calls (content → prompts)
- **Video workflow**: Text → Video (Veo)

#### Future Template (Mentioned by User)
- **Scene count**: Unknown (could be 5)
- **Frame chaining**: Probably NO
- **Combination**: Unknown (might NOT combine)
- **Video workflow**: Possibly **Text → Image → Video** (different from current!)

---

## Product Requirements (From User)

### Confirmed Needs:
1. **Variable scene counts** - Not always 3 scenes
2. **Optional scene combining** - Some templates might output separate clips
3. **Optional frame chaining** - Only when needed for character consistency
4. **Different generation workflows** - e.g., text→image→video vs direct text→video
5. **All templates output videos** (for now)
6. **All templates use LLM** for script generation
7. **All templates use video generation** (but workflow may vary)

### Unknown:
- How many different templates will there be?
- What workflows will they need?
- Will they always have sequential scenes or could be independent?

**User's stance**: "I can't know at this point. Depends on the template idea."

---

## Architecture Discussion

### The Core Question

**Can we design the right architecture without knowing more template ideas?**

**Answer**: No, you can't design the perfect architecture yet.

**Strategy**: **Iterate, Don't Predict**
- Build templates as needed
- See what breaks
- Fix only what's broken
- Learn the right abstractions organically

---

## Two Architecture Approaches

### Approach 1: Configuration-Driven (Flexible POC)

**Concept**: Templates declare **what they need**, pipeline **adapts**.

**Template Config Example:**
```typescript
template: {
  workflow: {
    sceneCount: 3,
    needsFrameChaining: true,
    combineScenes: true,
    outputFormat: "single-video"
  }
}
```

**Pipeline Adapts:**
```typescript
const sceneCount = template.workflow.sceneCount;

for (let i = 1; i <= sceneCount; i++) {
  generate scene

  if (template.workflow.needsFrameChaining && i < sceneCount) {
    extract frame for next scene
  }
}

if (template.workflow.combineScenes) {
  combine all scenes
}
```

**Pros:**
- ✅ Easy to add templates (just config)
- ✅ POC-friendly
- ✅ Smaller initial investment

**Cons:**
- ❌ Limited to what flags can express
- ❌ Can't handle complex workflows (e.g., text→image→video)
- ❌ Pipeline gets messy with many conditionals

**Best for**: Templates with similar workflows, just different parameters

---

### Approach 2: Template-As-Plugin (Fully Extensible)

**Concept**: Each template is **self-contained** with its own logic.

**Template Interface:**
```typescript
interface TemplateWorkflow {
  generateScript(userProblem): Promise<Script>;
  generateVideos(script): Promise<Videos>;
  postProcess(): Promise<FinalOutput>;
}
```

**Each Template = Class:**
```typescript
class DirectToCameraTemplate implements TemplateWorkflow {

  async generateScript(userProblem) {
    // D2C-specific LLM calls
    // Call 1: videoScript + voiceScript
    // Call 2: 3 scene prompts
  }

  async generateVideos(script) {
    // D2C-specific: Frame chaining for 3 scenes
    for each scene:
      generate video
      extract last frame
      pass to next scene
  }

  async postProcess() {
    // D2C-specific: Combine scenes
    ffmpeg concat all scenes
  }
}

class YourNewTemplate implements TemplateWorkflow {

  async generateScript(userProblem) {
    // Your custom LLM calls
  }

  async generateVideos(script) {
    // Your custom workflow:
    // Text → Image (DALL-E)
    // Image → Video (Veo)
    // 5 scenes, no frame chaining
  }

  async postProcess() {
    // Maybe don't combine - return 5 separate videos
  }
}
```

**Pipeline (index.ts) Becomes Simple:**
```typescript
// Load template
const template = getTemplate("direct-to-camera");

// Template handles everything
const script = await template.generateScript(userProblem);
const assets = await template.generateVideos(script);
const output = await template.postProcess();

// Save manifest
saveManifest(output);
```

**Pros:**
- ✅ Fully flexible - templates can be wildly different
- ✅ Clean separation - templates are independent
- ✅ Easy to add templates - just implement interface
- ✅ Pipeline stays clean and simple

**Cons:**
- ❌ More code upfront per template
- ❌ Each template duplicates some logic
- ❌ Bigger initial investment

**Best for**: Templates with very different workflows

---

## Architecture Option Comparison

| Aspect | Config-Driven | Plugin-Based |
|--------|---------------|--------------|
| **Template is** | Data/config | Class with logic |
| **Logic location** | Centralized in pipeline | Scattered in each template |
| **Pipeline knows** | All possible variations | Nothing (just calls interface) |
| **Adding template** | Add config object | Write new class |
| **Flexibility** | Limited to flags | Unlimited |
| **Best for** | Similar workflows | Different workflows |
| **POC-friendly** | Yes | Medium |
| **Handles text→image→video** | No (can't express with flags) | Yes (full control) |

---

## Ideal Plugin Architecture Details

### Directory Structure
```
src/
├── templates/
│   ├── base/
│   │   └── template.interface.ts      # The contract
│   ├── direct-to-camera/
│   │   ├── template.ts                # D2C implementation
│   │   ├── prompts.ts                 # System prompts
│   │   └── config.ts                  # D2C config
│   ├── your-new-template/
│   │   ├── template.ts                # Implementation
│   │   ├── prompts.ts                 # Prompts
│   │   └── config.ts                  # Config
│   └── registry.ts                    # Maps IDs → Template classes
```

### Template Registry Pattern
```typescript
// templates/registry.ts
const TEMPLATES = {
  "direct-to-camera": DirectToCameraTemplate,
  "your-new-template": YourNewTemplate,
};

export function getTemplate(id: string): TemplateWorkflow {
  const TemplateClass = TEMPLATES[id];
  return new TemplateClass();
}
```

### What's Shared vs Template-Specific

**Shared (Used by All Templates):**
- ManifestCreator
- StateManager
- Logger
- Config loading
- CLI argument parsing

**Template-Specific (Each Template Decides):**
- LLM prompts and call structure
- Video generation workflow
- Number of scenes
- Frame chaining or not
- Combining or not
- Output format

---

## Implementation Strategy: Three Phases

### Phase 1: Fix Rigidity (Small Investment)
**Goal**: Make current system configurable (not flexible, just less rigid)

**Changes:**
1. Add template configuration fields:
   - `sceneCount: number`
   - `needsFrameChaining: boolean`
   - `combineScenes: boolean`
   - `outputFormat: string`
   - `contentFields: string[]`

2. Make pipeline read config and adapt:
   - Use `template.sceneCount` in loops
   - Check `needsFrameChaining` before extracting frames
   - Check `combineScenes` before combining

3. Test with d2c (should work same as before)

**Outcome**: Can handle templates with different parameters, but same workflow

---

### Phase 2: Build Real Templates (Learn & Iterate)
**Goal**: Try to implement new template, see what breaks

**Process:**
1. User provides new template idea
2. Try to implement with current system
3. Identify what breaks/doesn't fit
4. Make targeted fixes (minimal changes)
5. Learn where real abstraction is needed

**Key insight**: Don't predict what's needed, discover it through building

---

### Phase 3: Refactor to Plugin System (Informed Decision)
**Goal**: Extract proper abstractions based on real learnings

**When to do this:**
- After building 2-3 different templates
- When you see clear patterns
- When config-driven becomes too messy

**Outcome**: Clean plugin architecture based on actual needs

---

## The "Iterate, Don't Predict" Strategy

### Famous Engineering Principle:
> "The first time you build something, you learn what to build.
> The second time, you build it right."

### The Approach:
```
1. Try to build new template
   ↓
2. See where it breaks
   ↓
3. Fix only what's broken (targeted changes)
   ↓
4. Learn what architecture you actually need
   ↓
5. Repeat
```

### vs "Predict" Strategy:
```
1. Think about all possible templates
   ↓
2. Design flexible architecture upfront
   ↓
3. Hope you guessed right
   ↓
4. Build template and... maybe it fits? Maybe not?
```

**Risk**: Build flexibility you don't need, miss flexibility you do need.

---

## Three Options Moving Forward

### Option A: Implement New Template NOW (Iterate)
- Try to build your new template idea with current system
- See what breaks, fix only what's broken
- Fast feedback loop
- Might be messy, but learn quickly

### Option B: Make System Configurable FIRST (Predict)
- Add template configuration fields
- Make pipeline adapt to config
- Then try new template
- More methodical, might over-engineer

### Option C: Document Limitation, Move On
- Mark current system as "d2c only" for POC
- Focus on other POC goals first
- Revisit multi-template later
- Fastest to market

**User leaning toward**: Option A (Iterate, Don't Predict)

---

## Current State Summary

### What We Have:
- ✅ Template system that defines prompts and content structure
- ✅ Working d2c template with frame chaining
- ✅ Manifest system that's flexible (supports any content structure)
- ❌ Execution pipeline hardcoded for d2c workflow

### What We Need:
- Variable scene counts (not always 3)
- Optional frame chaining
- Optional scene combining
- Support for different video generation workflows (text→image→video)

### What We Don't Know Yet:
- How many templates will there be?
- What workflows will they need?
- What varies between templates vs what stays the same?

---

## Next Steps

1. **User shares new template idea** (the one that might not fit current system)

2. **Analyze what it needs:**
   - How many scenes?
   - What's the generation workflow?
   - Frame chaining needed?
   - Combine scenes or keep separate?

3. **Try to implement with current system:**
   - See what breaks
   - Identify specific gaps

4. **Make targeted fixes:**
   - Add only what's needed for this template
   - Don't over-generalize yet

5. **Learn from the process:**
   - What patterns emerge?
   - What's common vs different?
   - What abstraction makes sense?

6. **Repeat with next template idea**

7. **Refactor when patterns are clear** (after 2-3 templates)

---

## Key Architectural Questions to Answer

Through building templates, we'll discover:

1. **Content Structure**: Do all templates need LLM-generated content? Same format?
2. **Scene Independence**: Are scenes always sequential or can be independent?
3. **Video Workflows**: Just text→video, or text→image→video, or others?
4. **Scene Count**: Fixed per template or dynamic?
5. **Combining Logic**: Always ffmpeg concat, or different approaches?
6. **State Tracking**: Do we need template-specific state fields?
7. **Manifest Structure**: Does current flexibility work for all templates?

---

## Decision: Ready to Start Option A

**User wants to**: Try implementing new template with current system (Iterate, Don't Predict)

**Next**: User will share the new template idea that might not fit current architecture.

---

## Related Documentation

- [Cycle 4 Implementation Complete](./cycle-4/IMPLEMENTATION-COMPLETE.md) - Current system
- [Technical Specs](./core-docs/2-technical-specs.md) - System architecture
- [Manifest Schema](../2_reference-docs/manifest-schema.md) - Current manifest design
- [Output Structure](../2_reference-docs/output-structure.md) - Current outputs

---

**Status**: Ready for next conversation - awaiting new template idea from user to begin iteration process.
