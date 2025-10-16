# Script Structure Redesign - Problem & Solution

**Date**: October 16, 2025
**Status**: 🔴 NEEDS REDESIGN

---

## The Problem

### Current Implementation (Broken)

The script generation creates **disconnected** content and prompts:

**Example from Generated Script:**

```json
{
  "sceneNumber": 1,
  "content": "Hey there, I just want you to take a moment and breathe. I know that anxiety can feel overwhelming, like a heavy blanket that just won't lift. But I want you to know that it's okay to feel this way. You're not alone in this, and it's perfectly okay to reach out for support.",
  "prompt": "The camera focuses on a warm, inviting living room setting. The subject, a relatable person in their 30s, sits comfortably on a couch. They have a gentle smile, their eyes warm and understanding. Soft, natural light filters in from a nearby window, creating a cozy atmosphere. The framing is close-up, emphasizing the subject's sincere expression. The mood is calm and inviting."
}
```

**❌ The Mismatch:**
- **Content**: Describes active speaking ("I just want you to take a moment...")
- **Prompt**: Describes someone sitting quietly with a smile
- **Result**: The video shows a person sitting peacefully, but the content implies they're actively delivering dialogue

### Why This Happens

OpenAI generates **both** `content` and `prompt` as **siblings** (independently) in a single call:

```
Template systemPrompt tells OpenAI:
"For each scene, provide:
1. Spoken dialogue (conversational, natural)
2. A detailed cinematography prompt for generating the video"
    ↓
OpenAI generates BOTH independently
    ↓
content = dialogue to be spoken
prompt = how the video should look

❌ No connection between them!
```

---

## Proposed Solution

### New Structure: Parent → Child Relationship

```
overallScript: "General video concept/idea"
    ↓
scene.content: "DOP instructions - WHAT HAPPENS in the scene"
    ↓
scene.prompt: "Veo 3-optimized text-to-video prompt" (DERIVED from content)
```

### Example of New Structure

**Overall Script:**
> "A comforting direct-to-camera message addressing anxiety, showing emotional progression from acknowledgment (empathetic) → comfort (reassuring) → hope (uplifting)"

**Scene 1 Content (DOP Master Instructions):**
> "A warm, empathetic person in their 30s sits in a cozy living room facing the camera. They speak directly to the viewer with a concerned yet warm expression, delivering comforting words about anxiety. Their body language is open and inviting. Soft natural light from a window creates an intimate atmosphere. Close-up framing emphasizes their sincere facial expressions as they acknowledge the viewer's struggle."

**Scene 1 Prompt (Generated FOR Veo 3 FROM content above):**
> [Optimized version derived from the content, tailored to Veo 3's capabilities and constraints]

---

## Current Data Flow

```mermaid
User runs CLI
    ↓
Load categories from CSV ("Anxiety or fear", "Finances or provision")
    ↓
Load template IDs from config ("direct-to-camera", "text-visuals")
    ↓
Load pre-defined templates from templates.ts (NOT generated, hardcoded)
    ↓
Loop: For each (category × template):
    ↓
    ScriptGenerator.generateScript(category, templateId)
        ↓
        Build OpenAI prompt:
        - System: template.systemPrompt (with {category} replaced)
        - User: "Generate a 3-scene video script for '{category}'"
        ↓
        OpenAI returns (Zod schema):
        {
          category: string,
          template: string,
          overallScript: string,
          scenes: [
            { sceneNumber: 1, content: string, prompt: string },
            { sceneNumber: 2, content: string, prompt: string },
            { sceneNumber: 3, content: string, prompt: string }
          ]
        }
        ↓
        Save to output/scripts/{id}.json
    ↓
    VideoGenerator.generateVideoClip(scene, videoId)
        ↓
        Sends scene.prompt to Veo 3 API
        ↓
        Downloads generated video
```

---

## Key Questions to Resolve

### 1. Content Field Purpose

**Current**: Mixed purpose (dialogue OR visual description)
- For "direct-to-camera": dialogue to be spoken
- For "text-visuals": text to display

**Proposed**: DOP instructions (what happens in the scene)
- Describes the ACTION, not just dialogue
- Master description that drives the Veo 3 prompt

### 2. Prompt Generation Strategy

**Current**: OpenAI generates prompt directly

**Options:**
- **A**: OpenAI still generates both, but with better instructions linking them
- **B**: OpenAI generates content → separate LLM call to generate Veo 3 prompt FROM content
- **C**: OpenAI generates content → programmatic transformation to Veo 3 prompt

### 3. Category vs. Problem Data

**CSV Contains:**
1. `lifeChallengeOption`: Category ("Anxiety or fear") ← **currently used**
2. `onboardingV7_lifeChallenge`: Actual user problem text ("Being scared that the guy I'm falling for is going to leave me") ← **currently ignored**

**Options:**
- **A**: Category only (current) - generic, broader appeal
- **B**: Category + sample problems - more personalized, relatable
- **C**: Generate multiple variations per category using different problems

**Current Choice**: A (category only)

---

## Files Involved

### Configuration
- `src/config/templates.ts` - Template definitions (systemPrompt, sceneStructure)
- `config.json` - Which categories and templates to use

### Generation
- `src/lib/script-generator.ts` - OpenAI integration, calls API with template
- `src/lib/video-generator.ts` - Sends scene.prompt to Veo 3

### Types
- `src/types/script.types.ts` - VideoScriptSchema (Zod), Scene interface
- `src/types/config.types.ts` - Template interface

### Current Template (Direct-to-Camera)

**Location**: `src/config/templates.ts:14-30`

```typescript
systemPrompt: `You are creating a comforting video script for someone struggling with {category}.

Format: Direct-to-camera speaking style
Tone: Empathetic, conversational, warm
Structure: 3 scenes showing emotional progression

For each scene, provide:
1. Spoken dialogue (conversational, natural)
2. A detailed cinematography prompt for generating the video

Guidelines:
- Use second person ("you") to speak directly to viewer
- Keep dialogue natural and authentic
- Each scene should be ~10 seconds of spoken content
- Cinematography prompts should describe: subject, expression, lighting, framing, mood
- Ensure the cinematography prompts create a consistent person across all 3 scenes (same person, same setting)
- The person should be warm, relatable, and compassionate`
```

**Problem**: Instructions don't connect dialogue to visual action!

---

## Next Steps

1. **Decide on structure:**
   - What should `content` contain?
   - What should `prompt` contain?
   - Parent-child or sibling relationship?

2. **Decide on generation strategy:**
   - Single LLM call or two-step?
   - OpenAI generates prompts or programmatic?

3. **Decide on data input:**
   - Category only or include user problems?

4. **Update implementation:**
   - Modify template systemPrompts
   - Update Zod schemas if needed
   - Adjust script-generator.ts logic
   - Test with real APIs

---

## Example Test Case

**Input:**
- Category: "Anxiety or fear"
- Template: "direct-to-camera"

**Desired Output:**
```json
{
  "overallScript": "Direct-to-camera message addressing anxiety with 3-scene progression: acknowledge struggle → offer comfort → share hope",
  "scenes": [
    {
      "sceneNumber": 1,
      "content": "Person in 30s, warm living room, sits facing camera. Speaks with empathetic expression: 'I know anxiety feels overwhelming...' Body language open. Window light. Close-up. Concerned but warm.",
      "prompt": "[Veo 3 optimized version - person ACTIVELY SPEAKING with mouth moving, delivering dialogue]"
    }
  ]
}
```

**Key**: The prompt should describe someone **actively delivering the dialogue**, not sitting quietly!

---

## Current Status

- ✅ Pipeline built and working
- ✅ APIs integrated (OpenAI, Veo 3)
- ✅ Generated 1 test video successfully
- ❌ Content/prompt mismatch discovered
- ⏸️ Paused for redesign

## Files to Modify (Likely)

1. `src/config/templates.ts` - Rewrite systemPrompts
2. `src/types/script.types.ts` - Possibly update Scene interface/schema
3. `src/lib/script-generator.ts` - Possibly change generation logic
4. Test and validate with real API calls
