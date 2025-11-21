# Comic Book Template - Testing Log

**Template:** Comic Book Bible Stories
**Testing Period:** November 2025
**Purpose:** Validate workflow, test models, identify optimal configurations

---

## Testing Methodology

**Statistical Approach:**
- Each test runs 5 generations (not just 1)
- Track success rate (e.g., 4/5 usable = 80%)
- Identifies reliable vs unreliable model capabilities

**Testing Strategy:**
- Start from ideal/complex output
- Work backwards if model can't handle it
- Test what models CAN do, not assumptions

---

## End-to-End Test: David and Goliath (4 Pages)

### Test Configuration
- **Story:** David and Goliath
- **Pages:** 4 pages (3-3-3-1 panel structure)
- **Prompts:** Medium detail level
- **Format:** 3:4 aspect ratio (displays in 9:16 screen with app UI narration below)
- **Models tested:** seedream-4, nano-banana

---

### Results: seedream-4

| Page | Panels | First Try | Retries | Result | Notes |
|------|--------|-----------|---------|--------|-------|
| Page 1 | 3 panels | ✅ | 0 | Usable | Clean first generation |
| Page 2 | 3 panels | ✅ | 0 | Usable | Clean first generation |
| Page 3 | 3 panels | ✅ | 0 | Usable | Clean first generation |
| Page 4 | 1 panel | ✅ | 0 | Usable | Clean first generation |

**Success Rate:** 4/4 pages (100%) first-try success

**Style Consistency:** TBD (not tested yet)

**Overall:** ✅ **Highly reliable** - All pages generated successfully on first attempt

---

### Results: nano-banana

| Page | Panels | First Try | Retries | Result | Notes |
|------|--------|-----------|---------|--------|-------|
| Page 1 | 3 panels | ✅ | 0 | Usable | Clean first generation |
| Page 2 | 3 panels | ✅ | 0 | Usable | Clean first generation |
| Page 3 | 3 panels | ❌ | 2 | Usable | Required 2 retries |
| Page 4 | 1 panel | ❌ | 4 | Usable | Required 4 retries |

**Success Rate:** 2/4 pages (50%) first-try success

**Style Consistency:** ❌ **Problem identified**
- Cannot maintain consistent art style across pages
- Each generation has different color palettes, line styles
- Style drift visible between pages

**Style Reference Test:**
- Used Page 1 as reference image for subsequent pages
- Result: "Kinda worked" (partial improvement)
- Conclusion: Needs dedicated style reference image approach

**Overall:** ⚠️ **Less reliable** - Lower first-try success rate + style consistency issues

---

## Key Findings

### Model Comparison

**seedream-4:**
- ✅ More reliable for first-try success (100% vs 50%)
- ✅ All 4 pages generated cleanly
- ⚠️ Style consistency not yet tested
- **Recommendation:** Primary model for production

**nano-banana:**
- ⚠️ 50% first-try success rate
- ❌ Style consistency problems
- ⚠️ Requires more retries on complex pages
- ✅ Higher quality potential when it works
- **Recommendation:** Needs style reference system to be viable

---

### Confirmed Capabilities

**✅ Multi-Panel Generation:**
- 3 panels in one image: CONFIRMED WORKING
- Panel separation/borders: WORKS
- Visual consistency within same page: GOOD
- Quality maintained across panels: YES

**✅ Text & Speech Bubbles:**
- Models CAN generate text in speech bubbles
- Text is legible
- Bubble placement generally correct
- Legibility varies by model

**✅ Grid Layouts:**
- 3 panels vertical (Layout C): CONFIRMED
- 1 panel fullscreen (Layout A): CONFIRMED
- 2 panels vertical (Layout B): Not tested yet
- 4 panels grid (Layout D): Not tested yet

---

### Known Problems

**❌ Character Knowledge:**
- Models don't know biblical characters by name
- Must describe "David" and "Goliath" visually
- Cannot rely on cultural/historical knowledge
- **Solution:** Always use visual descriptions, not names

**❌ Style Consistency Across Pages:**
- Multi-page stories = multiple independent generations
- Models don't "remember" previous pages
- Style drift occurs (especially nano-banana)
- **Solution:** Create dedicated style reference image, apply to ALL pages

**⚠️ Retry Requirements:**
- Complex pages may need retries
- Later pages in sequence seem harder (Page 4 needed 4 retries)
- Model-dependent (seedream-4 more reliable)

---

### Prompt Writing Learnings

**✅ What Works:**
- Describe characters visually (appearance, clothing, size)
- Specify panel layout clearly ("3-panel vertical strip")
- Use concrete visual details (not abstract concepts)
- Medium detail level (not too sparse, not overwhelming)
- Natural language flow in prompts

**❌ What Doesn't Work:**
- Character names expecting model knowledge ("David", "Goliath")
- Model parameters in prompt ("9:16 format", "aspect ratio")
- Redundant instructions ("thin white gutters separate")
- Assuming cultural/historical knowledge
- Overly sparse or overly detailed descriptions

**📝 Effective Prompt Template:**
```
A [N]-panel comic book page, [layout arrangement], [art style].

PANEL 1 ([position]): [Visual description with concrete details].
[Composition notes].

PANEL 2 ([position]): [Visual description]. [Composition notes].

[Optional: Speech bubble instructions]
```

---

## Still Unknown (Need Testing)

- **4+ panels per page** - Maximum reliable panel count? (Layout D not tested yet)
- **2-panel pages** - Does Layout B work well?
- **seedream-4 style consistency** - Better than nano-banana? (Needs multi-page generation test)
- **Style reference effectiveness** - Does dedicated reference solve consistency?
- **Different art styles** - Beyond children's book illustration?
- **Prompt detail levels** - Minimal vs Medium vs High comparison?
- **Batch generation** - Workflow for generating multiple stories efficiently

---

## Next Testing Priorities

1. **Generate remaining stories** - Birth of Jesus, The Wise Men, Noah's Ark with seedream-4
2. **Test seedream-4 style consistency** - Compare pages across newly generated multi-page stories
3. **Style reference system** - Test with dedicated reference image if consistency issues found
4. **4-panel pages** - Test Layout D (grid layout)
5. **2-panel pages** - Test Layout B
6. **Batch generation workflow** - Process for efficiently generating multiple stories
7. **Statistical testing** - Run 5 generations per configuration for success rates (if needed)

---

## Recommendations for Production

**Confirmed for use:**
- ✅ Use seedream-4 as primary model
- ✅ 3-panel pages (Layout C) as standard
- ✅ 1-panel splash (Layout A) for dramatic moments
- ✅ Medium detail level in prompts
- ✅ Speech bubbles for dialogue in images
- ✅ Narration in app UI (not in generated images)
- ✅ 3:4 aspect ratio for comic pages
- ✅ story-data.json for app integration

**Before scaling to 30 stories:**
- ⚠️ Generate 2-3 more stories to test style consistency with seedream-4
- ⚠️ Implement style reference system if consistency issues appear
- ⚠️ Test batch generation workflow for efficiency

---

---

## Caption Box Testing (November 2025)

### Test Configuration
- **Purpose:** Test caption boxes for narration (in-app slides need both narration + dialogue)
- **Story:** David and Goliath Page 1-4
- **Model:** seedream-4
- **Text elements tested:** Rectangular caption boxes + speech bubbles

### Results: Caption Boxes

**✅ Caption boxes work reliably:**
- Models CAN generate rectangular caption boxes
- Text is legible in caption boxes
- Can handle both caption + speech bubble in same panel
- Caption boxes visually distinct from speech bubbles

**⚠️ Known Issues:**
- Speech bubble pointers sometimes misplaced (pointing to wrong character)
- Text can be garbled with 5+ text elements per page (Panel 2 example: "I come in the you come name of the Lord")
- Caption box style inconsistency when not explicitly specified (rounded vs rectangular)

**✅ Solution Found:**
- Use explicit format: "Rectangular caption box with straight edges and corners at [position]"
- Models have text rendering limits (~5 text elements per page)
- Speech bubble misplacement likely unfixable via prompt (model limitation)

### Two-Step Text Generation Test

**Approach tested:**
1. Generate images without text (text-to-image)
2. Add text via image-to-image with nano-banana

**Result: ❌ DOES NOT WORK**
- Cannot reliably add text to existing images via i2i
- Tested multiple prompt variations for text placement
- No winning prompt formula found

**Recommendation:**
- Single-step generation (visuals + text together) is most reliable
- Manual text overlay in post-production as fallback for critical deliverables
- Accept some text errors and regenerate as needed

---

## Thumbnail Testing (November 2025)

### Test Configuration
- **Purpose:** Generate cover/thumbnail images for app grid view
- **Story:** David and Goliath
- **Requirements:** Portrait orientation, composite scene, title text on image
- **Model:** seedream-4

### Results: Thumbnail Generation

**✅ Visual quality:**
- Composite scenes work well (David + Goliath size contrast)
- Children's book illustration style consistent with pages
- Dramatic composition successful
- AI can generate cover-style layouts effectively

**⚠️ Text Generation:**
- Title text can be generated by AI
- Font style achieved: blocky sans-serif, white with black outline
- **Problem:** Font consistency unpredictable across multiple generations
- Text styling can vary (thickness, outline weight, exact font)

**Solutions if font consistency needed:**
1. Generate thumbnails without text + programmatic text overlay (Python/PIL, ImageMagick, Node.js)
2. More specific font styling in prompts + regenerate outliers
3. Manual text overlay in post-production

**Recommendation:**
- Test thumbnail generation for 2-3 more stories to assess consistency
- If font varies significantly, implement programmatic text overlay for all 30 stories
- Keep AI-generated text if variance is acceptable

---

---

## Workflow Efficiency Analysis

### Step-by-Step vs All-At-Once Generation

**Question:** Can LLM generate all workflow steps (1-6) in a single call, or is step-by-step better?

**Technical Feasibility:** ✅ YES
- Full story generation (all steps) is technically possible in one LLM call
- Token usage: ~4,000 output tokens per story (well within limits)
- Generation time: Seconds for all steps

**Quality Considerations:**

**PROS (All-At-Once):**
- ✅ Faster - One call instead of 6 interactions
- ✅ More consistent - All decisions made in same context
- ✅ Efficient - No waiting for approval between steps
- ✅ Better context retention - No forgetting between steps

**CONS (All-At-Once):**
- ❌ No checkpoints - Can't course-correct if Step 1 goes wrong
- ❌ Cascade errors - Wrong narrative choice → affects all downstream steps
- ❌ All-or-nothing review - Either approve everything or regenerate everything
- ❌ Harder to give feedback - Can't adjust individual steps without regenerating

**Risk Assessment:**

**Cascade Error Example:**
```
Step 1 (Wrong): "Moses raises staff at sea..."
    ↓ (Everything builds on this)
Step 2: Plans pages around staff-raising moment
Step 3: Scripts detailed staff visuals
Step 4: Prompts emphasize staff imagery
Result: Entire story needs regeneration if narrative was wrong
```

**With Step-by-Step:** Catch error at Step 1, fix, continue with correct foundation.

**When All-At-Once Works Best:**

**GOOD scenarios:**
- Story picked from backlog with clear expected beats
- Similar to previously generated stories (established pattern)
- Minimal review needed (trust LLM choices)
- Batch generation of many stories for efficiency
- Straightforward, well-known stories (Noah's Ark, Moses parting sea)

**BAD scenarios:**
- Experimental or complex story structure
- First time trying new approach/layout
- Specific vision not yet communicated
- Testing new layout configurations
- Stories requiring careful theological accuracy

**Recommendation:**

**For stories 1-5:** Step-by-step (learn patterns, establish quality baseline)
**For stories 6-30:** All-at-once (efficiency, established patterns, batch generation)

**Trade-off:** Speed/efficiency vs control/review checkpoints

The all-at-once approach is viable for production but best used after establishing quality patterns with step-by-step generation.

---

## Current Status (as of 2025-11-11)

**Stories Created:**
- ✅ 01-david-and-goliath (Complete & Generated)
- ✅ 02-noahs-ark (Scripts/Prompts Ready - Not Generated)
- ✅ 03-birth-of-jesus (Scripts/Prompts Ready - Not Generated)
- ✅ 04-the-wise-men (Scripts/Prompts Ready - Not Generated)

**Workflow Implementation:**
- ✅ 6-step workflow finalized (Narrative → Planning → Scripts → Prompts → Thumbnail → Organization)
- ✅ Numbering convention implemented (01-, 02-, 03-)
- ✅ story-data.json structure established for app integration
- ✅ Reference files documented in template

**Confirmed Decisions:**
- ✅ Hybrid approach: Speech bubbles in image + narration in app UI (caption boxes tested but not adopted)
- ✅ 3:4 aspect ratio for comic pages (displays in 9:16 screen)
- ✅ seedream-4 as primary model (100% first-try success rate)
- ✅ ~30 word narration per page for app UI
- ✅ 2-3 speech bubbles max per page (5 text elements hard limit before garbling)

---

**Last updated:** 2025-11-11
