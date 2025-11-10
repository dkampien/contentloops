# David & Goliath - Page 1 Caption Test

**Purpose:** Test if models can generate legible caption boxes with narration text
**Date:** 2025-01-06
**Model:** TBD

---

## Original Page 1 Prompt (No Captions)

```
A 3-panel comic book page, vertical strip layout, children's book illustration style with bold ink lines and flat colors, vibrant and accessible.

PANEL 1 (top): Two armies facing each other across a wide valley. Israelite tents on one side, Philistine tents on the other, rocky terrain with sparse vegetation and sheep grazing. Wide establishing shot from eye level showing both sides with space between them.

PANEL 2 (middle): Massive armored warrior with bronze helmet and plume, bronze chest plate and arm guards, layered skirt armor, towering muscular build with beard, holding large spear. Valley and small soldier figures in background. Low angle shot looking up making him imposing. Speech bubble: "Send me a champion to fight!"

PANEL 3 (bottom): Young boy in simple beige shepherd's tunic with rope belt and leather sandals, carrying woven basket filled with bread, walking into military camp with soldiers and tents in background, dusty ground. Medium shot from slightly elevated angle showing the boy among the camp.
```

---

## Updated Page 1 Prompt (With Captions)

**Blocks Added:**
- textIntegration.captionStyle = "rectangular caption box"
- textIntegration.captionPosition = "top of panel"

**Final Prompt:**

```
A 3-panel comic book page, vertical strip layout, children's book illustration style with bold ink lines and flat colors, vibrant and accessible.

PANEL 1 (top): Two armies facing each other across a wide valley. Israelite tents on one side, Philistine tents on the other, rocky terrain with sparse vegetation and sheep grazing. Wide establishing shot from eye level showing both sides with space between them. Caption box at top: "The Israelite army faced the Philistines across the valley."

PANEL 2 (middle): Massive armored warrior with bronze helmet and plume, bronze chest plate and arm guards, layered skirt armor, towering muscular build with beard, holding large spear. Valley and small soldier figures in background. Low angle shot looking up making him imposing. Caption box at top: "Every day, the giant warrior Goliath challenged Israel to send a champion." Speech bubble from Goliath: "Send me a champion to fight!"

PANEL 3 (bottom): Young boy in simple beige shepherd's tunic with rope belt and leather sandals, carrying woven basket filled with bread, walking into military camp with soldiers and tents in background, dusty ground. Medium shot from slightly elevated angle showing the boy among the camp. Caption box at top: "Young David, a shepherd boy, arrived bringing food to his brothers."
```

---

## Test Goals

**Testing for:**
1. ✅ Can model generate caption boxes?
2. ✅ Is caption text legible?
3. ✅ Can it handle caption + speech bubble in same panel? (Panel 2)
4. ✅ Caption box visual style (rectangular vs rounded)
5. ✅ Caption positioning (top of panel)

**Success criteria:**
- All 3 panels have visible caption boxes
- Text in captions is readable
- Caption boxes visually distinct from speech bubbles
- Panel 2 shows BOTH caption and speech bubble clearly

---

## Generation Results

**Model:** -
**Date:** -
**Success:** -

**Notes:**
-

---

**Next steps after test:**
- If captions work → Update template workflow to include captions in all prompts
- If captions fail → Investigate alternative text overlay approaches
- If partial success → Refine caption instructions in prompts
