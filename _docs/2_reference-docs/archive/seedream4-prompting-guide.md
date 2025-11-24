# Seedream 4 Prompting Guide for Comics

**Purpose:** Model-specific guidance for generating comic book prompts with Seedream 4
**Use with:** Template v3.2+

---

## Critical Rules

### 1. Natural Flowing Language
✅ Write like natural sentences: "A young man sits against a wall in a dim prison cell"
❌ Not attribute lists: "Young man, wall, prison cell, sitting"

### 2. Loaded Keywords = Use ONCE Only ⭐ CRITICAL

**Problem:** Keywords like "Egyptian", "Hebrew", "ancient" trigger strong visual associations. Repeating them amplifies their influence globally, causing style bleeding.

**Examples of loaded keywords:**
- Cultural/ethnic: "Egyptian", "Hebrew", "Roman", "Greek"
- Historical: "ancient", "medieval", "Victorian"
- Religious: May trigger specific styling

**Rule:**
- ✅ Use in Panel 1 to establish context
- ❌ Remove from later panels - use neutral terms instead

**Example:**
```
Panel 1: "A young Hebrew man sits in an ancient Egyptian prison cell"
Panel 2: "The man approaches the two servants in the prison cell"
Panel 3: "The young man with dark hair leans forward in the dim cell"
```

**What happens if you repeat:**
- "Egyptian" repeated → Panel gets Egyptian jewelry, headbands, different color palette
- "Hebrew" repeated → Character suddenly grows beard
- "ancient" repeated → May over-emphasize historical styling

### 3. Character Consistency = Full Repetition

✅ Repeat COMPLETE physical descriptions every panel
✅ "The young man with dark shoulder-length hair and simple worn prison tunic"
❌ Don't use shorthand alone: "Joseph" or "the man"
❌ Don't paraphrase: Keep exact same wording

**BUT:** Remove loaded cultural keywords after Panel 1
- Panel 1: "young Hebrew man with dark hair"
- Panel 3: "young man with dark hair" (removed "Hebrew")

### 4. Concise Over Verbose

Seedream 4 guide says: "concise and precise > repeatedly stacking ornate and complex vocabulary"

✅ Essential details only
❌ Avoid redundant, flowery descriptors

### 5. Sentence Structure

✅ Break long sentences:
"A young man sits against a wall. He wears a simple tunic."

❌ Avoid front-loading:
"A young man with X and Y sits against a wall wearing Z with A and B"

### 6. Multi-Character Descriptions

When introducing multiple characters in one panel:

✅ Name them first: "The cupbearer and the baker sit across from each other"
✅ Then describe separately: "The cupbearer is a middle-aged man with short hair. The baker is stocky and balding."
❌ Don't say "Two Egyptian servants" then describe them (creates confusion)

---

## How Seedream 4 Processes Multi-Panel Comics

**Not fully independent:** Model processes holistically but with spatial awareness
- Keywords near panel descriptions influence those specific panels
- **Sequential amplification:** Repeating keywords strengthens their global influence
- Panel 1 with "Egyptian" = context established
- Panel 3 also with "Egyptian" = visual associations amplified

---

## Prompt Structure Per Panel

Required elements:
1. Subject with full physical description (minus loaded keywords after Panel 1)
2. Action/pose
3. Setting elements (can be lighter after Panel 1, but mention it)
4. Shot type and lighting (can be minimal)

---

## Example: Good Seedream 4 Prompt

```
Comic book page with 3 vertical panels in a children's book illustration style with bold ink lines and flat colors.

PANEL 1 (top): A young Hebrew man with dark shoulder-length hair sits against a rough stone wall in a dim ancient prison cell, legs crossed and head slightly down. He wears a simple worn prison tunic. A small barred window casts faint light through the shadows.

PANEL 2 (middle): The cupbearer and the baker sit across from each other in the stone prison cell with worried expressions. The cupbearer is a middle-aged man with short dark hair. The baker is a stocky balding man. Both wear simple servant clothing and hold their heads in their hands with furrowed brows, looking troubled.

PANEL 3 (bottom): In the dim prison cell, the young man with dark shoulder-length hair and simple worn prison tunic approaches the two troubled servants with open hands in a reassuring gesture. The middle-aged cupbearer with short dark hair and the stocky balding baker look up toward him. The rough stone walls and barred window frame the scene.
```

**Key points:**
- "Hebrew" and "ancient" only in Panel 1
- Full character descriptions repeated in Panel 3 (but without "Hebrew")
- Natural flowing sentences
- Setting re-established in Panel 3 but neutrally ("the dim prison cell")

---

**Template Version Compatibility:** v3.2+
**Last Updated:** 2025-01-17
