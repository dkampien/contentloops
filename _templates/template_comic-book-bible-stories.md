# Comic Book Bible Stories Template (Testing)

**Status:** Testing
**Modality:** text-to-image
**Purpose:** In-app content - Bible stories in comic book format (9:16 vertical)
**Duration:** Min 10s, variable based on story length
**Audio:** Voice narrator

---

## Proposed Blocks

### Layout
- layout.panelCount - Number of panels in the composition
- layout.panelArrangement - How panels are arranged spatially (horizontal strip, vertical strip, grid, etc.)
- layout.gutterStyle - Space/border between panels

### Text Integration
- textIntegration.textType - Type of text elements (speech bubbles, captions, none, etc.)
- textIntegration.bubbleStyle - Visual style of speech/thought bubbles
- textIntegration.captionStyle - Style of caption boxes

### Comic Style
- comicStyle.artStyle - Overall comic art aesthetic (American superhero, manga, European BD, etc.)
- comicStyle.inkStyle - Line work and inking technique (bold lines, fine lines, brushwork, etc.)
- comicStyle.colorTreatment - Color application method (flat colors, cel shading, painted, etc.)

---

## Formula (text-to-image)

```
[medium.type] [layout.panelCount] [layout.panelArrangement]
[scene.environment.setting] [scene.subjects.details]
[textIntegration.textType] [textIntegration.bubbleStyle]
[comicStyle.artStyle] [comicStyle.inkStyle] [comicStyle.colorTreatment]
[style.imageStyle]
```

---

## Production Workflow (Page-First Approach)

### Overview

This workflow produces complete comic book stories by working page-first, planning story structure and visual layout together.

**Steps:**
1. **Story Narrative** - Write full Bible story (150 words)
2. **Page & Panel Planning** - Decide page count, distribute story beats, assign grid layouts
3. **Individual Page Scripts** - Detail each panel (VISUAL, COMPOSITION, NARRATION, DIALOGUE)
4. **Prompt Generation** - Identify blocks, apply formula, create final prompts per page

---

### Key Definitions

**Panel:** A single compartment/frame within a comic page (shows one story beat/scene)
**Page:** One comic book page = one image generation (contains 1-4 panels showing multiple scenes)
**Story:** The complete narrative (may span multiple pages)
**Grid Layout:** Predefined panel arrangement (e.g., 3 panels vertical, 2 panels vertical, single fullscreen)

---

### Testing Methodology

**Statistical Approach:**
- Each test runs **5 generations** (not just 1)
- Track success rate (e.g., 4/5 usable = 80%)
- Identifies reliable vs unreliable model capabilities
- More accurate than single pass/fail

**Testing Strategy:**
- Start from ideal/complex output
- Work backwards if model can't handle it
- Test what models CAN do, not what we assume they can't

---

### Testing Variables

**1. Panels per Page (Layout Capability)**
- 1 panel (fullscreen)
- 2 panels (2 compartments)
- 3 panels (3 compartments)
- 4 panels (4 compartments)

**2. Prompt Detail Level**
- **Minimal:** Basic panel description only
  - Example: "Panel 1: Boy with sling. Panel 2: Giant warrior."
- **Medium:** Some visual details per panel
  - Example: "Panel 1: Young boy in tunic holding sling, valley setting."
- **High:** Detailed visual descriptions
  - Example: "Panel 1: Young shepherd boy in beige tunic, holding leather sling, standing in rocky valley with sheep in background, dramatic lighting."

**3. Grid Layout Templates (Predefined)**
- **Layout A:** Single panel (fullscreen)
- **Layout B:** 2 panels vertical (50/50 split)
- **Layout C:** 3 panels vertical (33/33/33 split)
- **Layout D:** 4 panels grid (2x2)
- **Benefit:** Consistency, reduces prompt complexity

**4. Layering Approach** (if single prompt fails)
- **Single layer:** Everything in one prompt (preferred)
- **Two layer:** 1) Generate page layout, 2) Add content
- **Three layer:** 1) Layout, 2) Content, 3) Text/bubbles

**5. Text Integration**
- None (narrator voiceover only)
- Speech bubbles with dialogue
- Caption boxes with narration
- Mixed (bubbles + captions)

**6. Art Style**
- Children's book illustration
- American superhero comic
- European BD (Bande Dessinée)
- Realistic painted
- Manga/anime style

**7. Model Testing**
Working models identified (ordered by quality):
1. nano-banana
2. seedream-4
3. hunyuan-image-3
4. imagen-4
5. qwen-image

---

## Testing Results

### Initial Findings (Manual Testing)

**✅ P1.3: Three Panels Vertical - SUCCESS**
- **Model:** Multiple (nano-banana, seedream-4, hunyuan-image-3, imagen-4, qwen-image)
- **Configuration:** 3 panels vertical, medium detail, no text
- **Result:** Models CAN render 3 panels with good quality
- **Success indicators:**
  - Clean panel separation with borders
  - Visual consistency across panels
  - Story flow works (confrontation → action → victory)
  - No quality degradation
- **Best model:** nano-banana (highest quality)

**🔄 P1.5: Speech Bubbles - TESTING**
- **Model:** Multiple models tested
- **Configuration:** 2 panels vertical, medium detail, speech bubbles
- **Result:** Models CAN generate text in speech bubbles
- **Notes:** Text legibility varies by model

---

### Prompt Writing Learnings

**✅ What Works:**
- Describe characters visually (appearance, clothing, size)
- Specify panel layout clearly ("3-panel vertical strip")
- Use concrete visual details (not names/concepts)
- Medium detail level (not too sparse, not overwhelming)

**❌ What Doesn't Work:**
- Character names expecting model knowledge ("David", "Goliath")
- Model parameters in prompt ("9:16 format", "aspect ratio")
- Redundant instructions ("thin white gutters separate" - panels handle this)
- Assuming cultural/historical knowledge

**📝 Prompt Template (Effective):**
```
A [N]-panel comic book page, [layout arrangement], [art style].

PANEL 1 ([position]): [Visual description with concrete details]. [Composition notes].

PANEL 2 ([position]): [Visual description]. [Composition notes].

[Optional: Speech bubble instructions]
[Optional: Panel border/gutter notes if needed]
```

---

## Systematic Testing Plan

### Phase 1: Panel Layout Capability
**Goal:** Statistical testing of panel count limits across models

| Test ID | Model | Panels | Detail | Text | Gens | Success Rate | Notes |
|---------|-------|--------|--------|------|------|--------------|-------|
| P1.1 | nano-banana | 1 | Medium | None | 5 | _/5 (\_%) | Baseline |
| P1.2 | nano-banana | 2 | Medium | None | 5 | _/5 (\_%) | - |
| P1.3 | nano-banana | 3 | Medium | None | 5 | 5/5 (100%) | ✅ Confirmed working |
| P1.4 | nano-banana | 4 | Medium | None | 5 | _/5 (\_%) | Test panel limit |
| P1.5 | nano-banana | 2 | Medium | Bubbles | 5 | _/5 (\_%) | Text capability |
| P1.6 | seedream-4 | 3 | Medium | None | 5 | _/5 (\_%) | Compare models |
| P1.7 | hunyuan-3 | 3 | Medium | None | 5 | _/5 (\_%) | Compare models |

**Phase 1 Questions:**
- Maximum reliable panel count per model?
- Which model has best success rate?
- Does text integration reduce success rate?

---

### Phase 2: Prompt Detail Optimization
**Goal:** Test if more/less detail improves success rate

| Test ID | Model | Panels | Detail Level | Gens | Success Rate | Notes |
|---------|-------|--------|--------------|------|--------------|-------|
| P2.1 | nano-banana | 3 | Minimal | 5 | _/5 (\_%) | Sparse prompts |
| P2.2 | nano-banana | 3 | Medium | 5 | 5/5 (100%) | ✅ Baseline |
| P2.3 | nano-banana | 3 | High | 5 | _/5 (\_%) | Detailed prompts |

**Phase 2 Questions:**
- Does more detail = better results?
- Is there a detail sweet spot?
- Does minimal detail work surprisingly well?

---

### Phase 3: Multi-Page Consistency
**Goal:** Test character consistency across pages

| Test ID | Pages | Panels/Page | Consistency Method | Gens | Success Rate | Notes |
|---------|-------|-------------|-------------------|------|--------------|-------|
| P3.1 | 2 | 3 | Detailed char description | 5 | _/5 (\_%) | Baseline |
| P3.2 | 2 | 3 | Simple char design | 5 | _/5 (\_%) | Test if simplicity helps |
| P3.3 | 3 | 3 | Reference image (if available) | 5 | _/5 (\_%) | Advanced technique |

**Phase 3 Questions:**
- Character consistency success rate across pages?
- Does simpler character design = better consistency?
- What techniques improve multi-page consistency?

---

**Status key:** ⬜ Not started | 🔄 Testing | ✅ Complete | ❌ Failed

---

---

## Complete Example: David and Goliath

### Step 1: Story Narrative (150 words)

"The Israelite army faced the Philistines across the valley. Every day, the giant warrior Goliath challenged Israel to send a champion to fight him. For forty days, no one dared to face him. Young David, a shepherd boy, arrived at the camp bringing food to his brothers. When he heard Goliath's mocking challenge, David volunteered to fight. King Saul offered David his armor, but it was too heavy. David refused it and went to the stream, choosing five smooth stones for his sling. Standing before the giant, Goliath laughed at the boy. But David proclaimed he came in the name of the Lord. David slung a stone that struck Goliath's forehead. The giant fell. David had defeated Goliath with faith and a single stone."

---

### Step 2: Page & Panel Planning

**Total Pages:** 4 pages

**PAGE 1: SETUP**
- Story beats: Armies face off, Goliath's challenge, David arrives at camp
- Panel count: 3 panels
- Grid layout: Layout C (3 panels vertical)
- Purpose: Establish conflict and introduce David

**PAGE 2: PREPARATION**
- Story beats: David volunteers, refuses Saul's armor, collects stones
- Panel count: 3 panels
- Grid layout: Layout C (3 panels vertical)
- Purpose: David's decision and preparation

**PAGE 3: CONFRONTATION**
- Story beats: David vs Goliath stand-off, David's declaration, stone slung
- Panel count: 3 panels
- Grid layout: Layout C (3 panels vertical)
- Purpose: Build tension to climax

**PAGE 4: VICTORY**
- Story beat: Goliath falls, David victorious
- Panel count: 1 panel (splash page)
- Grid layout: Layout A (1 panel fullscreen)
- Purpose: Dramatic resolution

---

### Step 3: Page Scripts

#### PAGE 1 - SETUP

**Grid Layout:** Layout C (3 panels vertical)

**PANEL 1 (top third)**
- VISUAL: Two armies facing each other across wide valley. Israelite tents on one side, Philistine tents on other. Rocky terrain, sparse vegetation, sheep grazing. Blue sky with clouds.
- COMPOSITION: Wide establishing shot, eye level, showing both sides with space between.
- NARRATION: "The Israelite army faced the Philistines across the valley."
- DIALOGUE: None

**PANEL 2 (middle third)**
- VISUAL: Massive armored warrior Goliath in foreground. Bronze helmet with plume, chest plate, arm guards, layered skirt armor. Towering, muscular, beard visible. Holding large spear. Valley and small soldier figures in background.
- COMPOSITION: Low angle looking up at Goliath, making him imposing. Close enough for armor details, valley context behind.
- NARRATION: "Every day, the giant warrior Goliath challenged Israel to send a champion."
- DIALOGUE: Goliath: "Send me a champion to fight!"

**PANEL 3 (bottom third)**
- VISUAL: Young boy David walking into military camp carrying woven basket with bread. Simple beige shepherd's tunic, rope belt, leather sandals. Short dark hair. Soldiers and tents in background. Dusty ground.
- COMPOSITION: Medium shot, slightly elevated angle showing David among camp. Shows youth and simplicity against military setting.
- NARRATION: "Young David, a shepherd boy, arrived bringing food to his brothers."
- DIALOGUE: None

---

#### PAGE 2 - PREPARATION

**Grid Layout:** Layout C (3 panels vertical)

**PANEL 1 (top third)**
- VISUAL: Young boy David standing among soldiers in military camp, one arm raised, determined expression. Soldiers around looking surprised, skeptical expressions. Camp tents and equipment in background.
- COMPOSITION: Medium shot focusing on David with soldiers around. Eye level showing David's courage despite youth.
- NARRATION: "When David heard Goliath's challenge, he volunteered to fight."
- DIALOGUE: David: "I will fight the giant!"

**PANEL 2 (middle third)**
- VISUAL: King Saul (older bearded man in royal robes and crown) standing next to David wearing oversized metal armor that doesn't fit - helmet tilted, chest plate too large, struggling to stand. Saul's tent interior, royal furnishings in background.
- COMPOSITION: Medium shot showing both figures. Saul taller, David small under armor. Slight high angle emphasizing ill-fitting armor.
- NARRATION: "King Saul offered David his armor, but it was too heavy."
- DIALOGUE: David: "I cannot wear this armor."

**PANEL 3 (bottom third)**
- VISUAL: David kneeling by clear stream, hand reaching into water selecting smooth round stones. Several stones in other hand or on ground nearby. Rocky streambed visible under water, vegetation along banks, peaceful natural setting.
- COMPOSITION: Medium shot from side angle showing David's action of selecting stones. Water and stones clearly visible.
- NARRATION: "David went to the stream and chose five smooth stones for his sling."
- DIALOGUE: None

---

#### PAGE 3 - CONFRONTATION

**Grid Layout:** Layout C (3 panels vertical)

**PANEL 1 (top third)**
- VISUAL: Young shepherd boy David (small, simple tunic, holding leather sling) standing in valley facing massive armored warrior Goliath (towering, bronze armor, helmet with plume, large spear). Dramatic size contrast. Rocky valley ground, both armies as small figures in far background on opposite sides.
- COMPOSITION: Wide shot from low angle emphasizing dramatic size difference. Both figures visible with space between.
- NARRATION: "David stood before the giant Goliath in the valley."
- DIALOGUE: Goliath: "Am I a dog that you come at me with sticks?"

**PANEL 2 (middle third)**
- VISUAL: Close-up of David's face showing confident, determined expression. Eyes focused, slight smile, sunlight on face. Background blurred valley setting.
- COMPOSITION: Close-up shot, eye level, focused on David's expression and confidence.
- NARRATION: None
- DIALOGUE: David: "I come in the name of the Lord!"

**PANEL 3 (bottom third)**
- VISUAL: David in dynamic action pose, arm extended back with sling spinning overhead, stone visible mid-flight toward Goliath. Motion lines showing sling movement and stone trajectory. David's body twisted with throwing motion, tunic flowing. Goliath partially visible in background, large and imposing.
- COMPOSITION: Dynamic angle showing motion, medium shot capturing David's full throwing action. Motion lines emphasize speed and power.
- NARRATION: "David slung a stone with all his might."
- DIALOGUE: None

---

#### PAGE 4 - VICTORY

**Grid Layout:** Layout A (1 panel fullscreen - splash page)

**PANEL 1 (fullscreen)**
- VISUAL: Massive armored warrior Goliath falling forward, body tilted at dramatic angle mid-fall. Stone embedded in forehead, visible impact point. Bronze armor and helmet catching light, face showing shock. In background, young shepherd boy David standing victorious with sling in hand, small but triumphant. Rocky valley ground, dust kicking up from Goliath's fall. Far background shows armies on hillsides reacting.
- COMPOSITION: Wide dramatic shot showing full scene. Goliath dominates foreground falling toward viewer, David visible in middle ground standing victorious, armies in far background. Slightly low angle emphasizing drama of giant's fall.
- NARRATION: "The giant fell. David had defeated Goliath with faith and a single stone."
- DIALOGUE: None

---

### Step 4: Prompts

#### PAGE 1 PROMPT

```
A 3-panel comic book page, vertical strip layout, children's book illustration style with bold ink lines and flat colors, vibrant and accessible.

PANEL 1 (top): Two armies facing each other across a wide valley. Israelite tents on one side, Philistine tents on the other, rocky terrain with sparse vegetation and sheep grazing. Wide establishing shot from eye level showing both sides with space between them.

PANEL 2 (middle): Massive armored warrior with bronze helmet and plume, bronze chest plate and arm guards, layered skirt armor, towering muscular build with beard, holding large spear. Valley and small soldier figures in background. Low angle shot looking up making him imposing. Speech bubble: "Send me a champion to fight!"

PANEL 3 (bottom): Young boy in simple beige shepherd's tunic with rope belt and leather sandals, carrying woven basket filled with bread, walking into military camp with soldiers and tents in background, dusty ground. Medium shot from slightly elevated angle showing the boy among the camp.
```

---

#### PAGE 2 PROMPT

```
A 3-panel comic book page, vertical strip layout, children's book illustration style with bold ink lines and flat colors, vibrant and accessible.

PANEL 1 (top): Young boy David standing among soldiers in military camp, one arm raised with determined expression. Soldiers around him looking surprised and skeptical. Camp tents and equipment in background. Medium shot from eye level. Speech bubble from David: "I will fight the giant!"

PANEL 2 (middle): King Saul, older bearded man in royal robes and crown, standing next to David who wears oversized metal armor that doesn't fit - helmet tilted, chest plate too large, struggling to stand. Royal tent interior with furnishings in background. Medium shot showing both figures from slight high angle. Speech bubble from David: "I cannot wear this armor."

PANEL 3 (bottom): David kneeling by clear stream, hand reaching into water selecting smooth round stones. Several stones in his other hand or on ground nearby. Rocky streambed visible under water, vegetation along banks, peaceful natural setting. Medium shot from side angle showing his action.
```

---

#### PAGE 3 PROMPT

```
A 3-panel comic book page, vertical strip layout, children's book illustration style with bold ink lines and flat colors, vibrant and accessible.

PANEL 1 (top): Young shepherd boy David in simple tunic holding leather sling stands facing massive armored warrior Goliath with bronze helmet, chest plate, and large spear. Dramatic size contrast on rocky valley ground, both armies visible as small figures in far background on opposite sides. Wide shot from low angle emphasizing size difference. Speech bubble from Goliath: "Am I a dog that you come at me with sticks?"

PANEL 2 (middle): Close-up of David's face showing confident, determined expression with focused eyes and slight smile, sunlight on his face, blurred valley background. Eye level shot focused on his expression. Speech bubble from David: "I come in the name of the Lord!"

PANEL 3 (bottom): David in dynamic action pose, arm extended back with sling spinning overhead, stone visible mid-flight toward Goliath. Motion lines showing sling movement and stone trajectory, body twisted with throwing motion, tunic flowing. Goliath partially visible in background. Dynamic angle showing motion, medium shot capturing full throwing action.
```

---

#### PAGE 4 PROMPT

```
A single fullscreen comic book panel (splash page), children's book illustration style with bold ink lines and flat colors, vibrant and dramatic.

Massive armored warrior Goliath falling forward at dramatic angle mid-fall, bronze armor and helmet catching light, stone embedded in his forehead with visible impact point, face showing shock. Young shepherd boy David standing victorious in background with sling still in hand, small but triumphant figure. Rocky valley ground with dust kicking up from Goliath's fall. Far background shows armies on hillsides reacting to the scene. Wide dramatic shot with Goliath dominating foreground falling toward viewer, David in middle ground, armies in distance. Slightly low angle emphasizing the drama of the giant's fall.
```

---

## End-to-End Testing Results

### Test Configuration
- **Story:** David and Goliath (4 pages)
- **Models tested:** seedream-4, nano-banana
- **Prompts:** Medium detail level (as shown in Step 4 above)
- **Generation approach:** Single-shot per page
- **Format:** 9:16 vertical

---

### Results: seedream-4

| Page | Panels | First Try | Retries | Result | Notes |
|------|--------|-----------|---------|--------|-------|
| Page 1 | 3 panels | ✅ | 0 | Usable | Clean first generation |
| Page 2 | 3 panels | ✅ | 0 | Usable | Clean first generation |
| Page 3 | 3 panels | ✅ | 0 | Usable | Clean first generation |
| Page 4 | 1 panel | ✅ | 0 | Usable | Clean first generation |

**Success Rate:** 4/4 pages (100%) first-try success

**Style Consistency:** TBD (not tested yet across pages)

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

**Style Consistency:** ❌ **Problem identified** - Cannot maintain consistent art style across pages. Each generation has different color palettes, line styles, etc.

**Style Reference Test:**
- Used Page 1 as reference image for subsequent pages
- Result: "Kinda worked" (partial improvement)
- Conclusion: Needs dedicated style reference image approach

**Overall:** ⚠️ **Less reliable** - Lower first-try success rate + style consistency issues

---

### Key Findings

**Model Comparison:**
- **seedream-4:** More reliable for first-try success (100% vs 50%)
- **nano-banana:** Higher quality potential but requires retries + style management

**Style Consistency Challenge:**
- Multi-page stories = multiple independent generations
- Models don't "remember" previous pages
- Style drift occurs between pages (especially nano-banana)

**Potential Solution:**
- Create dedicated style reference image
- Apply same reference to ALL page generations
- Ensures consistent look throughout story

---

### Next Testing Priorities

1. **Test seedream-4 style consistency** - Does it maintain style better than nano-banana?
2. **Style reference system** - Test with dedicated reference image for both models
3. **4-panel pages** - Test maximum panel count per page
4. **Caption boxes** - Test alternative to speech bubbles



**Document Status:** Updated with complete end-to-end workflow and initial testing results.
