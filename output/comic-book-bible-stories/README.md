# Comic Book Bible Stories - Generated Output

**Purpose:** Storage for generated comic book page images
**Format:** 9:16 vertical PNG images
**Source:** Stories from `_templates/comic-book-bible-stories/stories/`

---

## Folder Structure

```
output/comic-book-bible-stories/
├── david-and-goliath/
│   ├── thumbnail.png
│   ├── page1.png
│   ├── page2.png
│   ├── page3.png
│   ├── page4.png
│   └── story-data.json
├── noahs-ark/
│   ├── thumbnail.png
│   ├── page1.png
│   ├── page2.png
│   ├── page3.png
│   ├── page4.png
│   └── story-data.json
└── [story-name]/
    ├── thumbnail.png
    ├── [pageN].png
    └── story-data.json
```

---

## Naming Convention

**Folder names:** Lowercase with hyphens (matches story file names)
- Example: `david-and-goliath/` (not `David-and-Goliath/`)

**File names:** `page[N].png` where N = page number
- Example: `page1.png`, `page2.png`, `page3.png`, `page4.png`

**Versions/Tests:** Append descriptor with hyphen
- Example: `page1-with-captions.png`, `page1-v2.png`

---

## File Types

**thumbnail.png:**
- Cover/thumbnail image for story
- Used in app grid view (2x2 layout)
- Portrait orientation with title text
- Composite scene representing the story

**pageN.png:**
- Comic book pages for story carousel
- Dialogue only (speech bubbles)
- Variable aspect ratio (3:4, 2:3, or 4:5)

**story-data.json:**
- Metadata and narration text for app
- Includes page-specific narration for app UI overlay
- Reference for thumbnail file

---

## Text Overlay Notes

**Thumbnail text:**
- AI-generated text in thumbnails may vary in style
- If font consistency needed across all stories:
  - Option 1: Generate without text + programmatic overlay (Python/PIL, ImageMagick, Node.js)
  - Option 2: Manual text overlay in post-production
  - Option 3: More specific font styling in prompts + regenerate outliers

---

## Generation Info

Each story folder can optionally include a `generation-info.md` file with:
- Model used
- Generation date
- Prompt version
- Success rate
- Any notes or issues

---

**Last updated:** 2025-01-06
