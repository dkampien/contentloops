# Documentation Folder Template

## Standard Cycle Structure

```
_docs/
├── 1_development-docs/          # Active development docs tied to product lifecycle
│   ├── core-docs/               # Foundational "source of truth" documents
│   │   ├── 1-product-requirements.md
│   │   ├─
│   │   └── 3-technical-specs.md
│   └── cycle-{N}/               # Iterative development cycles
│       ├── 1-exploration.md
│       ├── 2-requirements.md
│       └── 3-implementation-plan.md
├── 2_reference-docs/            # Timeless reference materials (schemas, patterns, learnings)
├── 3_external-reference-docs/   # Third-party library documentation
```

## Claude Code Configuration Structure

```
.claude/
├── agents/                      # Custom agents for specialized tasks
│   └── {agent-name}.md
├── commands/                    # Custom slash commands
│   └── {command-name}.md
└── settings.local.json          # Local project settings
```

## Create New Cycle

Replace `{N}` with the cycle number (e.g., `cycle-6`):

```bash
mkdir -p "_docs/1_development-docs/cycle-{N}"
touch "_docs/1_development-docs/cycle-{N}/1-exploration.md"
touch "_docs/1_development-docs/cycle-{N}/2-requirements.md"
touch "_docs/1_development-docs/cycle-{N}/3-implementation-plan.md"
```
