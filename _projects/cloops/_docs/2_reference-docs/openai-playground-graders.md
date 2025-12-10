# OpenAI Playground Graders

Quick reference for setting up evals in OpenAI Playground.

## Grader Types

| Type | Use When |
|------|----------|
| **Model labeler** | Pass/Fail or categorical judgment |
| **Model scorer** | Numeric score (1-10 range) |
| **String check** | Exact/partial text match |
| **Text similarity** | BLEU, cosine, fuzzy match |

## Model Labeler Setup

Most common grader. Uses an LLM (gpt-5.1) to evaluate outputs.
**System prompt:** Use the default "Criteria match" preset - it handles reasoning and Pass/Fail logic.


**User prompt template:**
```
**Input**
{{item.input}}

**Final Response**
{{sample.output_json}}

**Criteria**
[Your criteria here]
```

**Variables:**
- `{{item.input}}` - Your test input (imported data)
- `{{sample.output_json}}` - JSON output from structured responses
- `{{sample.output_text}}` - Plain text output

**Labels:** Pass / Fail (default, can customize)

## Example Graders (Step 2 - Planning)

### Panel count
```
**Final Response**
{{sample.output_json}}

**Criteria**
Each page must have exactly 3 panels. No more, no less.
```

### Page count
```
**Final Response**
{{sample.output_json}}

**Criteria**
The output must have between 3 and 5 pages (inclusive).
```

### Narration extracted (not rewritten)
```
**Input Narrative**
{{item.input}}

**Final Response**
{{sample.output_json}}

**Criteria**
The narration field for each page must be extracted directly from the input narrative. It should use the original sentences, not rewritten or paraphrased versions.
```

### Panels advance story
```
**Final Response**
{{sample.output_json}}

**Criteria**
Each panel must show a distinct story moment that moves the narrative forward. Panels should not repeat the same action or be static/redundant.
```

### Concrete visual anchors
```
**Final Response**
{{sample.output_json}}

**Criteria**
Visual anchors must describe physical, camera-visible elements only. They should not use abstract or emotional language like "intimidating presence", "sense of hope", "confused", "worried". Instead, they should describe visible things like "towering figure with furrowed brow", "advisers shrugging with raised palms".
```

## Tips

- Start with objective criteria (panel count) before subjective ones
- Check failing outputs to understand what's slipping through
- Add specific bad/good examples to criteria when edge cases appear
- If grader fails, fix the source prompt (not the grader)





