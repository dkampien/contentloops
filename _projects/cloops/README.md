# CLoops

Template-based content generation system for Bible stories.

## Setup

```bash
npm install
cp .env.example .env  # Add API keys (OPENAI_API_KEY, REPLICATE_API_TOKEN, BIBLE_API_KEY)
npm run build
```

## Quick Start

```bash
# Generate next pending comic
npm run dev -- run comic-books-standard

# Batch generate 10 comics
npm run dev -- run comic-books-standard -b 10

# Test LLM calls without generating images
npm run dev -- run comic-books-standard --dry
```

## Commands

### Run Templates

```bash
cloops run <template>              # Run next pending item
cloops run <template> --dry        # Skip image generation (LLM only)
cloops run <template> --replay     # Skip LLM, regenerate images from prompts.md
cloops run <template> -i <id>      # Run specific item by ID
cloops run <template> -b 20        # Batch: run 20 items
cloops run <template> --all        # Run all pending items
```

### Stories Extraction

Templates using `"datasource": "ds-stories-backlog"` automatically extract stories from the Bible.

```bash
cloops extract                     # Extract 10 stories (default)
cloops extract -c 50               # Extract 50 stories
cloops stories                     # Show extraction status
```

### Management

```bash
cloops templates                   # List available templates
cloops status <template>           # Show backlog status
```

## How It Works

1. **Extraction**: Stories are extracted from the Bible via api.bible
2. **LLM Pipeline**: Each story goes through narrative → planning → prompts → thumbnail
3. **Generation**: Image prompts are sent to Replicate (Seedream 4)
4. **Output**: Each story gets a folder with images, prompts.md, and story-data.json

## Output Structure

```
output/comic-books-standard/
├── 001-the-six-days-of-creation/
│   ├── 1.jpg, 2.jpg, 3.jpg, 4.jpg    # Page images
│   ├── thumbnail.jpg                  # Cover image
│   ├── prompts.md                     # LLM outputs (for replay)
│   └── story-data.json                # Final bundle
├── 002-the-day-god-rested/
│   └── ...
```

## Status System

Status is derived from filesystem (no separate tracking):
- **No folder** → pending
- **prompts.md only** → in_progress (LLM done, generation interrupted)
- **story-data.json** → completed

Failed items are automatically retried on next run.

## Iterate on Prompts

```bash
# 1. Run with dry to get prompts without images
npm run dev -- run comic-books-standard --dry

# 2. Edit prompts in output/.../prompts.md

# 3. Replay to regenerate images from edited prompts
npm run dev -- run comic-books-standard --replay -i <story-id>
```

## Datasource Types

| Type | Description |
|------|-------------|
| `ds-stories-backlog` | Auto-extracted Bible stories via api.bible |

## Docs

- [Tech Spec](../_docs/1_development-docs/core-docs/2-cloops-tech-spec.md)
- [Template Authoring Guide](../_docs/2_reference-docs/template-authoring-guide.md)
