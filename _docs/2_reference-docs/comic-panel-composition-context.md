# Comic Panel Composition - Context Export

**Date:** 2025-01-19
**Topic:** Separate panel generation + programmatic composition workflow

---

## Summary

After extensive testing with CustomGPT prompt generation and image models, determined that:

1. **3-panel-in-one generation** has issues:
   - Character consistency failures across panels
   - Keyword bleeding between panels
   - Complex multi-panel interdependency problems
   - LLM struggles to generate correct prompts

2. **Separate panel generation** works better:
   - Better character consistency
   - Cleaner prompts (one scene at a time)
   - Can regenerate individual panels if one fails
   - Tested successfully with Good Samaritan story

3. **AI composition (NanoBanana) doesn't work**:
   - Models modify/redraw images instead of simple stitching
   - Can't preserve original images unchanged

4. **Solution: Programmatic composition**
   - Generate 3 panels separately
   - Stitch them together with code (no AI)
   - Simple, predictable, clean results

---

## Panel Layout Specifications

**Target format:** 3:4 aspect ratio comic page

**Layout:** 2-over-1 (also called "2-1 grid" or "T-layout")
```
┌──────────┬──────────┐
│          │          │
│ PANEL 1  │ PANEL 2  │  (both 3:4 portrait)
│   3:4    │   3:4    │
│          │          │
└──────────┴──────────┘
┌─────────────────────┐
│     PANEL 3 3:2     │  (landscape, full width)
└─────────────────────┘
```

**Panel aspect ratios:**
- Panel 1: 3:4 (portrait)
- Panel 2: 3:4 (portrait)
- Panel 3: 3:2 (landscape)

**Math verification:**
- Top row: Two 3:4 panels side by side = width 6, height 4
- Bottom: One 3:2 panel = width 6, height 4
- **Total page: width 6, height 8 = 3:4** ✓

---

## Prompt Format That Works

**Successful prompt structure for individual panels:**

```
Playful cartoon children's illustration with chunky rounded ink lines and bright flat colors.

[Composite elements in single sentence]. [Helper action]. [Context]. [Camera specs].
```

**Example (Panel 1):**
```
Playful cartoon children's illustration with chunky rounded ink lines and bright flat colors.

A small brown donkey carries an injured man with torn sleeve and bandaged arm on its back. A helper in a light brown robe with short hair leads the donkey by a rope. They walk toward a small roadside inn. An innkeeper with gray beard and tan robe stands in the doorway. Wide shot, eye level, warm afternoon light, desert landscape with plants.
```

**Key principles:**
- Composite elements (rider + mount) in ONE sentence as single unit
- Clear subject-verb-object structure
- Camera specs at end (shot type, angle, lighting)
- Natural flowing sentences, not attribute lists
- Simplified descriptions, reused consistently

---

## Test Results

**Separate panel generation (Good Samaritan story):**
- ✅ Character consistency across 3 separate generations
- ✅ Helper, injured man, innkeeper all recognizable
- ✅ Art style perfectly consistent
- ✅ Clean, clear panels

**Success rate:** Very good (visual evidence shows strong consistency)

---

## Python Code Example

Simple Pillow-based composition (20 lines):

```python
from PIL import Image

def create_comic_page(panel1_path, panel2_path, panel3_path, output_path):
    # Load panels
    panel1 = Image.open(panel1_path)  # 3:4
    panel2 = Image.open(panel2_path)  # 3:4
    panel3 = Image.open(panel3_path)  # 3:2

    # Get dimensions
    p1_width, p1_height = panel1.size

    # Calculate final page size
    page_width = p1_width * 2
    page_height = p1_height + (page_width * 2 // 3)

    # Create blank canvas
    page = Image.new('RGB', (page_width, page_height), 'white')

    # Paste panels
    page.paste(panel1, (0, 0))  # Top left
    page.paste(panel2, (p1_width, 0))  # Top right
    panel3_resized = panel3.resize((page_width, page_width * 2 // 3))
    page.paste(panel3_resized, (0, p1_height))  # Bottom

    # Save
    page.save(output_path)

# Usage
create_comic_page('panel1.jpg', 'panel2.jpg', 'panel3.jpg', 'comic_page.jpg')
```

**Enhancements needed:**
- Panel borders/gutters
- Error handling
- Batch processing

**Estimated effort:** 30 minutes to build complete solution

---

## Workflow Architecture

**Current setup:**
- CustomGPT generates prompts
- Manual generation via Seedream 4
- Manual composition

**Future automated workflow:**

1. **CustomGPT Step 3:** Generate 3 separate panel prompts (not single 3-panel prompt)
   - Panel 1 prompt (3:4)
   - Panel 2 prompt (3:4)
   - Panel 3 prompt (3:2)

2. **API calls:** 3 separate Replicate API calls
   - Generate panel1.jpg
   - Generate panel2.jpg
   - Generate panel3.jpg

3. **Programmatic composition:** Python script
   - Load 3 panels
   - Composite into 3:4 page
   - Save final comic page

4. **Output:** Single 3:4 comic page ready for app

**Benefits:**
- Better quality (character consistency)
- Individual panel retry on failure
- Clean, predictable results
- Simple code (no AI composition)

**Tradeoffs:**
- 3x API cost per page
- 3x latency (unless parallel)
- Requires automation infrastructure

---

## Next Steps

**To build this:**

1. Update CustomGPT system prompt to output 3 separate panel prompts instead of 1 combined prompt
2. Build Python composition script with:
   - Panel loading
   - Layout composition (2-over-1)
   - Panel borders/gutters
   - Batch processing for multiple stories
3. Integrate with Replicate API for automated generation
4. Test end-to-end pipeline

**Files to reference:**
- CustomGPT system prompt: `_memory/cursor-notepads/dump8-gpt-system-prompt.md`
- Story backlog: `_templates/comic-books-kids/story-backlog.md`
- Output folders: `output/comic-books-kids/01-david-and-goliath/` etc.

---

## Key Insights from Testing

1. **Composite elements must be in single sentence**
   - ✅ "Donkey carries injured man on its back"
   - ❌ "Man walks. Injured man sits on donkey." (creates 2 donkeys)

2. **Character tags/glossary approach didn't work well**
   - Model confused "Helper" and "Injured man" tags
   - Role swapping occurred

3. **Simplified prompts work better than verbose ones**
   - Natural flowing sentences
   - One clear descriptor per character
   - Not attribute lists

4. **AI composition models always modify images**
   - Can't do simple stitching
   - Need programmatic composition instead

---

**Status:** Ready to build programmatic composition solution in next conversation.
