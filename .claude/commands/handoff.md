---
description: Create or update a handoff document for carrying context across threads
argument-hint: <path-to-handoff-file>
allowed-tools: Read, Write, Edit, Glob, Grep
---

# Handoff Command

You are creating or updating a **handoff document** — a living working document that carries context across conversation threads within a larger initiative. A handoff is NOT a summary. A summary is retrospective and static. A handoff is forward-looking and dynamic — it carries only what the next thread needs to continue the work.

## Step 1 — Detect Mode

**If `$ARGUMENTS` is provided:** use it as the handoff file path.
**If `$ARGUMENTS` is empty:** check if you've already read a handoff file earlier in this conversation. If yes, use that path. If no, ask the user for the path.

Check if the file exists at the resolved path:
- **File exists** → UPDATE mode
- **File does not exist** → CREATE mode

---

## Step 2 — Structured Inventory

Scan the full conversation and compile the following. Be thorough — go through the entire conversation, not just recent messages.

### 2a. Files Read/Loaded
List every file that was read or loaded during this session, with its full path.

### 2b. Files Created/Changed
List every file that was created, modified, or deleted during this session, with its full path and a short note on what changed.

### 2c. Decisions Made
Identify all decisions made during this session. Look for:
- Explicit choices ("let's go with B", "we'll use X")
- Implicit decisions (approaches adopted through discussion without a formal choice moment)
- Rejected alternatives (what was considered and discarded)

For each decision, capture:
- **Question:** What was being decided?
- **Options:** What was considered?
- **Chosen:** What was picked?
- **Why:** The reasoning
- **Discarded:** What was rejected and why (if applicable)

### 2d. Things Noted/Remembered
Scan for anything the user explicitly asked you to "remember", "note down", "keep track of", or similar phrasing.

### 2e. Current State
Based on the full conversation, determine:
- What is the overall goal/initiative?
- What was accomplished this session?
- What is the current state of the work?
- What are the immediate next steps?
- Are there any blockers or open questions?

---

## Step 3 — Print Inventory & Update Plan (HARD PAUSE)

Print the full inventory from Step 2, organized clearly.

Then print the **update plan**:

### For the handoff file:
- **CREATE mode:** List the sections that will be generated and a brief note on what each will contain.
- **UPDATE mode:** List which sections will be updated, what will change, and note that a new Progress Log entry will be appended.

### Other docs that may need updating:
Review the files read/loaded (from 2a). For any documentation files where this session's work may have made their content stale or incomplete, list them with:
- File path
- What needs updating and why

This is informational only — the handoff command will NOT update these files. They are flagged for the user to handle separately.

### Decision check:
After printing the inventory, ask: **"Did I miss any decisions?"**

**STOP HERE. Wait for the user to confirm, adjust, or add before proceeding.**

---

## Step 4 — Write the Handoff

### CREATE Mode

Build the handoff document from the inventory. Use this as a starting structure, but adapt based on what the conversation contains. Not all sections are required — only include what's relevant:

```markdown
# [Initiative/Goal Title]

## Quick Reference

### Goal
[What we're doing and why — derived from conversation context]

### Key Files
[Files central to this initiative — paths and brief descriptions]

### Key Decisions
[Rolled-up summary of the most important decisions. Short form — the detailed format lives in the Progress Log]

### Reference Docs
[Links to related planning docs, specs, requirements — if applicable]

---

## [Overview Section — title adapts to initiative type]
[Could be: Pipeline Overview, Architecture, Integration Strategy, Context, etc.]
[Include diagrams, flowcharts, or structural descriptions if the conversation produced them]
[Skip this section entirely if the conversation doesn't warrant it]

---

## Current State

**Phase:** [Where things stand]

**What's done:**
- [Completed items]

**What's next:**
- [Immediate next steps]

---

## Progress Log

### Session 1 — [Date]

**Focus:** [One-line summary of this session's focus]

**Decisions:**

#### 1. [Decision Title]
**Question:** [What was being decided?]
**Options:**
- A) [Option A]
- B) [Option B]
**Chosen:** [Which option]
**Why:** [Reasoning]
**Discarded:** [What was rejected and why]

**Actions:**
- [What was done, as bullet points]

**Files Changed:**
- [List of files created/modified]

**Key Findings:**
- [Important discoveries, insights, learnings — if any]

---

## [Supporting Sections — add only if relevant]
[Open Questions, Task List, Backlog, Known Issues, Gotchas, Notes, etc.]
[These appear organically based on conversation content — do not force them]
```

### UPDATE Mode

1. **Read** the existing handoff file completely.
2. **Understand** its current structure and sections.
3. **Update** sections where the inventory shows new information:
   - Quick Reference: update Key Files if new ones are relevant, roll up Key Decisions from all Progress Log entries (including the new one)
   - Overview: update if the session changed the architecture/pipeline/context
   - Current State: **replace** with the latest state from the inventory
   - Supporting sections: update as needed (add items, ~~strikethrough~~ resolved items — never remove sections)
4. **Append** a new Progress Log entry using the session format above.
5. **Add** new sections if the conversation introduced something that doesn't fit existing sections.
6. **Preserve** everything else as-is.

Write the updated file.

---

## Step 5 — Print Result

After writing, print a short summary:
- File path written
- Mode (created / updated)
- Sections created, updated, or appended
- Reminder of other docs flagged for updating (if any)
