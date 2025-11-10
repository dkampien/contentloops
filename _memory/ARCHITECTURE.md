# Memory System Architecture

**Version:** 1.1
**Status:** Core system functional, synthesis pending
**Last Updated:** 2025-01-07

---

## Overview

Cross-conversation memory system for Claude Code CLI that preserves project context, decisions, and learnings across isolated conversation sessions. Inspired by Claude web's memory feature but adapted for file-based CLI environment.

### Purpose

- **Problem:** Each Claude Code conversation starts fresh with no memory of previous sessions
- **Solution:** File-based memory system that captures, synthesizes, and recalls project context on demand
- **Scope:** Works for both coding and non-coding projects

---

## Architecture

### Three-Command System

```
/summarize <session-id>  → Capture THIS conversation → save to conversations/
/synthesize              → Consolidate all summaries + scan project → update master.md
/recall                  → Load master.md into context
```

### Information Flow

```
Conversation 1 → /summarize <id-1> → {session-id-1}.md ─┐
Conversation 2 → /summarize <id-2> → {session-id-2}.md ─┤
Conversation 3 → /summarize <id-3> → {session-id-3}.md ─┼→ /synthesize → master.md
                                     _docs/ scan ────────┤                    ↓
                                     git analysis ───────┘      SessionStart hook (optional)
                                                                         ↓
                                                                   /recall loads
```

### File Structure

```
_memory/
├── ARCHITECTURE.md              # This file
├── conversations/               # Individual conversation summaries
│   ├── {session-id-1}.md       # Session ID-based filenames
│   ├── {session-id-2}.md
│   └── ...
└── master.md                    # Synthesized project memory

.claude/
├── commands/
│   ├── summarize.md            # In-context summarization
│   ├── recall.md               # Load master memory
│   └── synthesize.md           # Consolidation (pending)
├── agents/
│   └── summarize.md            # Separate-context summarization
└── hooks/
    └── session-start.sh        # Optional: Notify about new summaries
```

---

## Commands

### `/summarize <session-id>` - Capture Conversation

**Purpose:** Preserve important context from current conversation

**Two Workflows:**

**Option A: Slash Command (In-Context)**
- Fast, immediate analysis
- Uses current conversation context
- Consumes tokens from this conversation
- Best for: Most conversations, quick updates

**Option B: Agent (Separate Context)**
- Invoke: "Use the summarize agent for session X"
- Reads full JSONL transcript from filesystem
- Independent context window (no token impact on main conversation)
- Best for: Very long conversations, token-sensitive scenarios

**How it works:**
1. User runs `/summarize` (no arguments needed!)
2. Command extracts session ID from context (loaded by SessionStart hook)
   - Alternative: User can provide explicit session ID: `/summarize <session-id>`
3. Analyzes conversation for tracking points (decisions, discoveries, learnings, etc.)
4. Generates summary with flexible structure
5. Uses session ID as filename: `{session-id}.md`
6. Checks if file exists → updates OR creates new
7. Presents summary for user review
8. Saves to `_memory/conversations/{session-id}.md`

**When to use:**
- End of conversation (or mid-conversation for major decisions)
- Can run multiple times to update summary (same session ID = same file)

**Example:**
```
# Simple workflow (no manual session ID needed)
/summarize
→ Auto-extracts session ID from context
→ Saves to: 760f230b-763b-4a28-97c8-ecb3babe8c99.md
→ Updates same file if run again in this conversation

# Alternative with explicit session ID (backward compatible)
/status → 760f230b-763b-4a28-97c8-ecb3babe8c99
/summarize 760f230b-763b-4a28-97c8-ecb3babe8c99
→ Saves to: 760f230b-763b-4a28-97c8-ecb3babe8c99.md
```

**Summary Structure:**
```markdown
# [Short descriptive title]

## Context
[1-2 sentences: What was this conversation about?]

## Tracking Points
- [Flexible list with clear labels: Decision:, Discovery:, Status:, etc.]
- [Focus on information valuable for future conversations]
- [Include rationale - the "why" matters]

## Related Files/Artifacts (optional)
[Files created/modified or particularly relevant]
```

### `/synthesize` - Consolidate Memory

**Purpose:** Merge multiple conversation summaries + project state into master memory

**How it works:**
1. Runs in dedicated conversation thread (heavy operation)
2. Scans all sources:
   - All conversation summaries (`_memory/conversations/*.md`)
   - Project documentation (`_docs/` folder)
   - Git commits (if git repo exists - smart detection)
   - Codebase patterns (for coding projects only)
3. Cross-references conversations with actual project state
4. Synthesizes by theme (not chronological)
5. Shows evolution/changes over time
6. Replaces master.md with fresh synthesis
7. Incremental: Only processes summaries newer than master.md

**When to use:**
- After multiple conversations accumulate (5-10+)
- When master.md feels stale
- Weekly or after major work sessions
- Manual trigger only (user control)

**Output structure:**
```markdown
# Project Memory

## Current Status
[Where is the project NOW? Current phase, recent work]

## Key Decisions
[What was decided and why? Organized by theme]

## Learnings & Discoveries
[Patterns, insights, what worked/didn't work]

## Evolution & Changes
[How things changed over time - tracks decision evolution]

## Active Questions
[Open items, blockers, unresolved issues]

---
*Last synthesized: [DATE]*
*Source: [N] conversations, [N] docs*
```

### `/recall` - Load Context

**Purpose:** Load synthesized project memory into current conversation

**How it works:**
1. Reads `_memory/master.md`
2. Acknowledges key status/decisions
3. Makes context available throughout conversation
4. Lightweight, fast operation

**When to use:**
- Start of new conversation (manual trigger)
- Alternative: Auto-load via SessionStart hook or claude.md (see Loading Options below)

---

## Loading Options

### Option 1: Manual `/recall` (Current Default)
- User runs `/recall` when starting new conversation
- Full control over when memory loads
- No automatic behavior

### Option 2: SessionStart Hook (Implemented)
- Hook runs automatically when starting new conversation
- Loads session ID into Claude's context (auto-capture for `/summarize`)
- Loads "N new summaries" message into Claude's context
- **Not visible to user** - only visible to Claude
- Claude can mention synthesis status when relevant
- Enables `/summarize` to work without manual session ID input

**How to use:**
```bash
# Hook is already configured in .claude/settings.json
# Runs automatically at session start
# Enables: /summarize (no arguments needed!)
# Session ID auto-extracted from hook output
```

### Option 3: Auto-load via claude.md (Available Alternative)
```markdown
# CLAUDE.md
@import _memory/master.md
```

**Pros:**
- Auto-loads master.md every conversation
- No manual `/recall` needed
- Simple, one-line setup

**Cons:**
- Always loaded (no control)
- Consumes tokens every conversation

---

## Design Principles

### 1. Simplicity Over Complexity
- Avoid overthinking and overcomplication
- Choose pragmatic over clever solutions
- Automate where reliable, use constraints where not

### 2. Session ID-Based Filenames
- **Decision:** Use session ID from `/status` as filename
- **Rejected:** Title-based generation (non-deterministic, creates duplicates)
- **Rationale:** Guarantees unique filename per conversation, same conversation always updates same file

### 3. Dual Summarization Workflow
- **Decision:** Offer both slash command (fast) and agent (separate context)
- **Rationale:** Users choose based on conversation length and token sensitivity
- **Both save to same format:** Compatible and interchangeable

### 4. Synthesis = Distillation
- Master.md consolidates by theme, not verbatim copies
- "Summary of summaries" approach
- Prevents context bloat, stays within token limits

### 5. Incremental Synthesis
- Only processes summaries newer than master.md
- Uses file timestamps to detect what's new
- Efficient for large projects with many conversations

### 6. Flexibility
- Tracking points adapt to conversation content
- Works for coding and non-coding projects
- Structure is consistent but content is dynamic

### 7. Evolution Tracking
- Show how decisions changed over time
- Track "Decision A → tried B → settled on C"
- Cross-reference with actual codebase state to prevent drift

---

## Integration with Existing Commands

### Complementary, Not Overlapping

**`/prime` + `/prime-suggest`** - Session setup & file discovery
- Purpose: Understand current codebase structure, find relevant files
- Scope: This session only
- Source: Filesystem (current state)

**`/recall` + `/summarize`** - Project memory & continuity
- Purpose: Remember historical decisions, patterns, learnings
- Scope: Cross-session memory
- Source: Conversation summaries + synthesis

### Ideal Workflow

```
1. Session starts → SessionStart hook (silent reminder to Claude)
2. /recall          → Load project memory
3. /prime           → See current project structure
4. /prime-suggest   → Get relevant files for task
5. [do work]
6. /summarize <session-id> → Capture learnings for next time
```

---

## Current Implementation Status

### ✅ Complete & Tested
- `/summarize` command with auto-capture (no session ID needed!)
- `/summarize <session-id>` (backward compatible explicit session ID)
- Summarize agent (separate context workflow)
- `/recall` command (tested and working)
- Session ID-based filenames (deterministic, reliable)
- `_memory/` file structure
- SessionStart hook (captures session ID + memory reminder)
- Session ID auto-extraction from hook context
- ARCHITECTURE.md documentation

### ⏳ Pending Implementation
- `/synthesize` command
- Synthesis agent implementation
- Incremental synthesis logic
- Size management/pruning for master.md

### 🗑️ Rejected/Removed
- Title-based filename generation (non-deterministic)
- Fuzzy keyword matching (too complex)
- Auto-synthesis on schedule (want manual control)
- SessionEnd auto-summary (prefer manual control)

---

## Technical Decisions Log

### Why Session IDs?
**Problem:** Title-based filenames create duplicates (same conversation, different titles)
**Solution:** Use session ID from `/status` as filename
**Result:** Deterministic, guaranteed unique per conversation, reliable updates

### Why Dual Workflow (Command + Agent)?
**Problem:** Long conversations consume many tokens for in-context summarization
**Solution:** Offer agent option that reads JSONL transcript in separate context
**Result:** Users choose based on conversation length and token sensitivity

### Why File-Based?
CLI Claude can't access past conversation history like web Claude. Must explicitly capture current conversation before it's lost. Web Claude has backend database + automatic synthesis; we need manual triggers and file storage.

### Why SessionStart Hook Loads to Claude, Not UI?
**Behavior:** SessionStart hook stdout goes to Claude's context, not displayed to user
**Design:** Claude Code intentional - SessionStart is for setup/context injection, not UI notifications
**Workaround:** User can ask Claude "Any new summaries?" and Claude will know from hook context
**Alternative:** Auto-load master.md via claude.md for always-available context

### Why Separate Summaries + Master?
**Couldn't we just update master.md directly?**
- Individual summaries = audit trail, can review/refine later
- Master.md = working memory, stays concise
- Separation allows for re-synthesis if master.md structure changes

### Token Management Strategy
- Loading master.md (single file) vs. reading all conversations (many files) = huge difference
- Master memory must stay concise to avoid context window bloat
- Synthesis happens in dedicated thread, so its token usage doesn't affect working conversations

---

## User Preferences

- **Minimize manual decisions** - automate where reliable, use constraints when automation fails
- **Simplicity over complexity** - call out overthinking when it happens
- **Flexible but structured** - consistent patterns that adapt to content
- **Multi-project compatible** - must work for coding and non-coding projects
- **User control** - manual triggers preferred over automatic (especially for heavy operations)

---

## Established Workflows

### Workflow 1: Summarize (In-Context)
```
1. /summarize → Auto-extracts session ID from context
2. Analyze, generate, review
3. Approve → Saves to <session-id>.md
4. Later in same conversation: /summarize → Updates same file

# Alternative (backward compatible):
1. /status → Copy session ID
2. /summarize <session-id> → Analyze, generate, review
3. Approve → Saves to <session-id>.md
```

### Workflow 2: Summarize (Agent)
```
1. /status → Copy session ID
2. "Use the summarize agent for session <session-id>"
3. Agent reads JSONL, analyzes in separate context
4. Returns summary for review
5. Approve → Saves to <session-id>.md
```

### Workflow 3: Recall
```
1. Start new conversation
2. /recall → Loads master.md into context
3. Ask questions, get answers with full project memory
```

### Workflow 4: Full Cycle
```
/recall → /prime → /prime-suggest → [work] → /summarize <session-id>
Later: /synthesize (when master.md needs updating)
```

---

## Future Enhancements

### Considered for Future Versions

**Dynamic Master.md Structure**
- Currently: Fixed structure (Status, Decisions, Learnings, Evolution, Questions)
- Future: Synthesis agent creates structure dynamically based on content
- Value: Adapts to project type automatically

**Auto-triggered Synthesis**
- Currently: Manual `/synthesize` only
- Future: Auto-run after N conversations or on schedule
- Note: User prefers manual control, but option exists for automation

**Synthesis Diff View**
- Show what changed in master.md after synthesis runs
- Helps track "what's new" since last synthesis
- Value: Medium - useful for understanding updates

**Project-Specific Memory Scopes**
- Separate memories for sub-projects or domains
- Example: `_memory/frontend/`, `_memory/backend/`
- Value: High for large multi-domain projects

**Memory Search/Query**
- Search across summaries and master memory
- Example: "When did we decide about X?"
- Value: Medium - can manually read files for now

**Memory Export/Import**
- Transfer memory between projects or share with team
- Portable memory for project templates
- Value: Medium - useful for team collaboration

**"Last Synthesized" Tracking**
- Currently: Check master.md file timestamp
- Future: Explicit tracking with age warnings
- Value: Low - current approach sufficient

---

## Notes

- Inspired by Claude web's automatic memory feature, adapted for CLI constraints
- Designed to be project-agnostic (works in any folder with any project type)
- Memory is scoped to project folder (each project has its own `_memory/`)
- System is manual-trigger by design (user controls when to capture/synthesize/recall)
- SessionStart hook provides awareness to Claude without UI notifications
- Alternative auto-load via claude.md available for always-on memory
