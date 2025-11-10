# Comic Book Template - Testing Log

**Template:** Comic Book Bible Stories
**Testing Period:** January 2025
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
- **Format:** 9:16 vertical
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

- **4+ panels per page** - Maximum reliable panel count?
- **2-panel pages** - Does Layout B work well?
- **Caption boxes** - Alternative to speech bubbles?
- **seedream-4 style consistency** - Better than nano-banana?
- **Style reference effectiveness** - Does dedicated reference solve consistency?
- **Different art styles** - Beyond children's book illustration?
- **Prompt detail levels** - Minimal vs Medium vs High comparison?

---

## Next Testing Priorities

1. **Test seedream-4 style consistency** - Generate multi-page story, compare pages
2. **Style reference system** - Test with dedicated reference image for both models
3. **4-panel pages** - Test Layout D (grid layout)
4. **2-panel pages** - Test Layout B
5. **Caption boxes** - Test alternative to speech bubbles
6. **Statistical testing** - Run 5 generations per configuration for success rates

---

## Recommendations for Production

**Immediate use:**
- ✅ Use seedream-4 as primary model
- ✅ 3-panel pages (Layout C) as standard
- ✅ 1-panel splash (Layout A) for dramatic moments
- ✅ Medium detail level in prompts
- ✅ Speech bubbles work, use them

**Before scale:**
- ⚠️ Test style consistency with seedream-4
- ⚠️ Implement style reference system if needed
- ⚠️ Create standard style reference image
- ⚠️ Test batch generation workflow

---

---

## Caption Box Testing (January 2025)

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

## Thumbnail Testing (January 2025)

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

**Last updated:** 2025-01-06
