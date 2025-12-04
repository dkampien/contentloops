# CLoops

Template-based content generation system.

## Setup

```bash
npm install
cp .env.example .env  # Add API keys
```

## Commands

### Run Templates

```bash
cloops run <template>              # Run next pending item
cloops run <template> --dry        # Skip image generation
cloops run <template> --debug      # Save debug.md with LLM responses
cloops run <template> --replay     # Load from debug.md, skip LLM
cloops run <template> -i <id>      # Run specific item
cloops run <template> -b 20        # Batch: run 20 items
cloops run <template> --all        # Run all pending items
```

### Stories Extraction

Templates using `"datasource": "stories-backlog"` automatically extract stories from the Bible.

```bash
cloops extract                     # Extract 10 stories (default)
cloops extract -c 50               # Extract 50 stories
cloops stories                     # Show extraction status
```

### Management

```bash
cloops templates                   # List available templates
cloops status <template>           # Show backlog status
cloops cleanup                     # Remove temp files
```

## Examples

```bash
# Test LLM calls without generating images
npm run dev -- run comic-books-standard --dry

# Batch generate 20 comics
npm run dev -- run comic-books-standard -b 20

# Full run with debug output
npm run dev -- run comic-books-standard --debug

# Iterate on image prompts
npm run dev -- run comic-books-standard --debug          # Generate + save debug.md
# Edit image prompts in output/.../debug.md
npm run dev -- run comic-books-standard --replay -i id   # Regenerate images only
```

## Datasource Types

| Type | Description |
|------|-------------|
| `backlog` | Manual JSON backlog in `data/backlogs/` |
| `stories-backlog` | Auto-extracted Bible stories via api.bible |

## Docs

- [Tech Spec](_docs/1_development-docs/core-docs/2-cloops-tech-spec.md)
- [Template Authoring Guide](_docs/2_reference-docs/template-authoring-guide.md)
