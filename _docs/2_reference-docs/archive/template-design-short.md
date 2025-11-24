# Video Template Design Cheat Sheet

**Quick reference for template design process**

---

## Design Flow

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

**Each step builds on the previous.**

---

## 5-Step Template Design Process

### 1. Define Purpose
**Question**: What should the viewer feel after watching?

**Answer format**: "[Emotion/outcome] + [action]"

**Example**: "Comforted and validated + prompted to explore BibleChat"

---

### 2. Define Emotional Arc
**Question**: What's the progression across scenes?

**Structure**: [Scene count] × [Duration] = [Total]

**For each scene**:
- Purpose: What this scene accomplishes
- Word count: ~X words

**Example**:
```
3 scenes × 8s = 24s total
Scene 1 (~20w): Recognition/validation
Scene 2 (~20w): Reassurance/comfort
Scene 3 (~20w): Call-to-action
```

---

### 3. Define Visual Format
**Question**: What does the viewer see?

**Specify**:
- Format type: direct-to-camera | text-visuals | b-roll
- Stays constant: [list]
- Changes between scenes: [list]

**Example**:
```
Type: Direct-to-camera
Constant: Person, setting, framing
Changes: Expression, posture, mood
```

---

### 4. Define Content Fields
**Question**: What must the LLM generate?

**For each field**:
- Name: [fieldName]
- Purpose: Why it exists
- Constraints: Generation rules

**Example**:
```
videoScript: Scene 1 visual baseline, simple language
voiceScript: 50-60 words, conversational, follows arc
```

---

### 5. Define Variables
**Question**: What should vary for scale/diversity?

**Common variables**:
- `variety_instruction`: Setting/person diversity
- `dialogue_instruction`: Include/exclude dialogue
- `[custom]`: Template-specific needs

---

## Quick Mapping

| Level | What | How Defined |
|-------|------|-------------|
| **Template** | Intent, arc, format | Hardcoded |
| **Generated** | videoScript, voiceScript | LLM per video |
| **Variable** | Diversity, options | Configurable |

---

## Workflow Design

**Step 1**: Count required LLM calls
```
CALL 1: What? [fields]
CALL 2: What? [fields]
```

**Step 2**: Define system prompts
```
CALL 1 prompt: Generate [fields] with [constraints]
CALL 2 prompt: Transform [input] → [output]
```

**Step 3**: Test in playground
- Use variety of userProblems
- Verify output quality
- Validate across problem categories

---

## Template Checklist

- [ ] Purpose works across ALL problem categories
- [ ] Arc has clear emotional progression
- [ ] Visual format is consistent yet flexible
- [ ] Content fields serve distinct purposes
- [ ] Variables enable scale without repetition
- [ ] System prompts tested in playground
- [ ] Workflow validated with real data

---

**One-liner**: Template = Purpose + Arc + Format | Generate = Content | Scale = Variables

---

**Full documentation**: See `template-design-full.md`
