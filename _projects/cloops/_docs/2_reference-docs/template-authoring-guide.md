# Template Authoring Guide

How to create new CLoops templates.

---

## Development Process

1. **Create a Production Plan** - Design and test prompts before coding
2. **Implement the template** - Build config, workflow, system-prompts, schemas
3. **Test with dry run** - Validate LLM outputs
4. **Test with debug** - Review full prompt chain
5. **Full run** - Generate images and verify output

---

## Production Plan

Before implementing a template, create a production plan document to design and validate prompts.

**Location:** `_templates/{template-name}/{template-name}_production-template-plan.md`

**Purpose:**
- Define each step's inputs, outputs, and constraints
- Write and test system prompts + user messages in OpenAI Playground
- Document JSON schemas for structured outputs
- Validate prompt quality before implementing in code

**Reference:** See `_templates/comic-books/comic-books_production-template-plan.md` for the expected format.

Once prompts are validated in the production plan, transfer them to the template's `system-prompts/` folder and implement the workflow.

---

## Folder Structure

```
templates/my-template/
├── config.json        # Settings, parameters, generation config
├── workflow.ts        # Workflow logic (the brain)
├── system-prompts/    # LLM system prompts as .md files
│   └── *.md
└── schemas/           # JSON schemas for structured LLM outputs
    └── *.json
```

---

## config.json

Settings only. No step definitions (workflow.ts handles that).

```json
{
  "name": "my-template",
  "datasource": "backlog",
  "settings": {
    "exampleSetting": 123
  },
  "style": {
    "artStyle": "..."
  },
  "generation": {
    "service": "replicate",
    "model": "owner/model-name",
    "params": {
      "aspect_ratio": "9:16"
    }
  }
}
```

---

## workflow.ts

Must export a `run` function with this signature:

```typescript
import type {
  StoryInput,
  TemplateConfig,
  Services,
  WorkflowContext,
} from '../../src/types/index.js';

export async function run(
  input: StoryInput,
  config: TemplateConfig,
  services: Services,
  ctx: WorkflowContext
): Promise<void> {
  // Your workflow logic here
}
```

### Parameters

| Param | Description |
|-------|-------------|
| `input` | Story input from datasource (`title`, `summary`, `keyMoments`) |
| `config` | Template config from config.json |
| `services` | Injected services (`llm`, `replicate`, `storage`) |
| `ctx` | Context (`prompts`, `schemas`, `dry`, `debug`, `replay`, `storyId`, `templatePath`) |

### Using Services

**LLM call with JSON schema:**
```typescript
const result = await services.llm.call<{ fieldName: string }>({
  systemPrompt: ctx.prompts['my-prompt'],
  userMessage: 'User input here',
  schema: ctx.schemas['my-schema'],
});
console.log(result.fieldName);
```

**Image generation:**
```typescript
const imagePath = await services.replicate.generateImage(prompt, config.generation);
const imagePaths = await services.replicate.generateImages(prompts, config.generation);
```

**Write bundle:**
```typescript
services.storage.writeBundle(ctx.storyId, {
  title: input.title,
  images: imagePaths,
  pages: pagesData,
  thumbnailImage: thumbnailPath,
});
```

### Dry Run Handling

Skip generation steps when `ctx.dry` is true:

```typescript
if (ctx.dry) {
  console.log('[DRY RUN] Skipping generation');
  return;
}

// Generation code here
```

### Variable Injection

Use `injectVariables` to replace `{variable}` placeholders in prompts:

```typescript
import { injectVariables } from '../../src/utils/config.js';

let prompt = ctx.prompts['my-prompt'];
prompt = injectVariables(prompt, {
  artStyle: config.style.artStyle,
  setting: 'custom value',
});
```

---

## system-prompts/*.md

Markdown files containing system prompts. Access via `ctx.prompts['filename']` (without .md extension).

Example `system-prompts/step1-narrative.md`:
```markdown
<role>
You are a storyteller creating narratives.
</role>

<task>
Write a narrative for the given story.
</task>

<constraints>
- Style: {artStyle}
- Keep it under {wordCount} words
</constraints>
```

---

## schemas/*.json

JSON Schema format. Access via `ctx.schemas['filename']` (without .json extension).

Example `schemas/narrative.json`:
```json
{
  "type": "object",
  "properties": {
    "narrative": {
      "type": "string",
      "description": "The story narrative"
    }
  },
  "required": ["narrative"],
  "additionalProperties": false
}
```

---

## Backlog

Create `data/backlogs/my-template.json`:

```json
{
  "templateId": "my-template",
  "items": [
    {
      "id": "item-1",
      "status": "pending",
      "input": {
        "title": "Example Title",
        "summary": "Example summary",
        "keyMoments": ["moment 1", "moment 2"]
      },
      "completedAt": null
    }
  ]
}
```

---

## Running

```bash
# Basic commands
cloops run my-template --dry    # Test without generation
cloops run my-template          # Full run
cloops status my-template       # Check backlog status

# Debug & replay (for prompt iteration)
cloops run my-template --debug           # Save debug.md with all LLM responses
cloops run my-template --replay -i id    # Load from debug.md, skip LLM, regenerate images

# Combined
cloops run my-template --dry --debug     # Dry run + save debug.md
```

---

## Debug & Replay Workflow

For iterating on image prompts without re-running LLM calls:

1. **Run with debug:** `cloops run my-template --debug`
2. **Review output:** Check images and `output/{template}/{story-id}/debug.md`
3. **Edit prompts:** Modify image prompts in debug.md
4. **Replay:** `cloops run my-template --replay -i story-id`
5. **Repeat** until satisfied
6. **Update system prompts** with learnings

---

## Reference

See `templates/comic-books-standard/` for a complete working example.
