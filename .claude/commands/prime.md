---
description: Prime context with project structure scan
---

## Step 1: Show Project Structure
```bash
eza . --tree --git-ignore --ignore-glob="node_modules|__pycache__|.next|dist|build"
```

## Step 2: Display Memory Status
- Look in your context for the "Memory System:" message from SessionStart hook
- If found: Display it to the user (makes hidden context visible)
- If not found: Skip this step

## Step 3: Understand Task
User input: $ARGUMENTS

If no input provided, ask: "What are you working on today?"

Note: If user references files with @ in their response, still proceed to Step 4 to suggest additional relevant files before loading anything.

## Step 4: Initial Context

**If user describes a specific task:**
- Acknowledge the task
- Mention: "Run `/prime-suggest` if you'd like file suggestions for this task"

**If user says "general":**
- Load package.json, and main entry points
- Ask: "Any specific area to explore?"

**If no input or unclear:**
- Wait for clarification

## Next Steps
After initial context is established:
- Use `/prime-suggest` anytime to get file suggestions based on the conversation
- Reference files directly with @ to load them