---
description: Summarize conversation for project memory
argument-hint: [session-id]
---

Analyze this conversation and create a summary to preserve important context for future conversations.

## Instructions

1. **Review the conversation** and identify what's worth preserving. Consider:
   - Decisions made (technical, architectural, process)
   - Discoveries and learnings (what worked, what didn't)
   - Status changes (project phase, implementation progress)
   - Blockers or open questions
   - Failed approaches and why they didn't work
   - Patterns or preferences established
   - Important context for future work

2. **Be flexible** - Not every conversation will have all types of tracking points. Focus on what's actually relevant and important.

3. **Create a summary** using this structure:

```markdown
# [Short descriptive title]

## Context
[1-2 sentences: What was this conversation about?]

## Tracking Points
- [Flexible list of important items - use clear labels like "Decision:", "Discovery:", "Blocker:", "Status:", etc.]
- [Focus on information that would be valuable in future conversations]
- [Include rationale where relevant - the "why" matters]

## Related Files/Artifacts (optional)
[If files were created, modified, or are particularly relevant]
```

4. **Determine session ID:**
   - **If $ARGUMENTS is provided:** Use that as session ID (backward compatible)
   - **If $ARGUMENTS is empty:** Extract session ID from your context:
     - Look for "SESSION_ID: [id]" in your context (loaded by SessionStart hook)
     - If found: Use that session ID automatically
     - If not found: Stop and display: "Session ID not available. Run `/status` to get your session ID, then run `/summarize <session-id>`"

5. **Present the summary** to the user for review and approval

6. **Use session ID as filename:**
   - Filename: `[session-id].md`
   - Example with argument: `/summarize 760f230b-763b-4a28-97c8-ecb3babe8c99` → `760f230b-763b-4a28-97c8-ecb3babe8c99.md`
   - Example without argument: `/summarize` → extracts from context → `760f230b-763b-4a28-97c8-ecb3babe8c99.md`

7. **Check if file exists:**
   - Run `ls _memory/conversations/` to list existing files
   - Check if `[session-id].md` exists (using determined session ID from step 4)
   - **If exists:** Update that file
   - **If doesn't exist:** Create new file

8. **Auto-announce action:**
   - "Updating `[session-id].md`" or "Creating new `[session-id].md`"

9. **Save the summary:**
   - Write to `_memory/conversations/[session-id].md`

**Important:**
- This summary is for FUTURE conversations, not a transcript
- Be concise but preserve critical context
- The user may work on both coding and non-coding projects - adapt accordingly
- Focus on what would help you (Claude) provide better assistance in future conversations
- One conversation can have multiple updates - later `/summarize` calls should update the same file
- Session ID auto-extracted from context (loaded by SessionStart hook) when no argument provided
- User can still provide explicit session ID for backward compatibility or troubleshooting
