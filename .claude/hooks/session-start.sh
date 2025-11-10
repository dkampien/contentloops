#!/bin/bash

# SessionStart Hook: Check for new conversation summaries + capture session ID

# Parse JSON stdin to extract session_id
JSON_INPUT=$(cat)
SESSION_ID=$(echo "$JSON_INPUT" | grep -o '"session_id":"[^"]*"' | cut -d'"' -f4)

# Build paths (CLAUDE_PROJECT_DIR is set by hook environment)
MASTER_FILE="${CLAUDE_PROJECT_DIR}/_memory/master.md"
CONVERSATIONS_DIR="${CLAUDE_PROJECT_DIR}/_memory/conversations"

# Check if memory system exists
if [ ! -f "$MASTER_FILE" ] || [ ! -d "$CONVERSATIONS_DIR" ]; then
  exit 0
fi

# Count summaries newer than master.md
NEW_COUNT=$(find "$CONVERSATIONS_DIR" -name "*.md" -newer "$MASTER_FILE" 2>/dev/null | wc -l | tr -d ' ')

# Output session ID (visible to Claude's context)
if [ -n "$SESSION_ID" ]; then
  echo "SESSION_ID: $SESSION_ID"
fi

# Show reminder if there are new summaries
if [ "$NEW_COUNT" -gt 0 ]; then
  echo ""
  echo "💡 Memory System: $NEW_COUNT new conversation summaries since last synthesis."
  echo "   Master memory may be outdated. Consider running /synthesize to update."
  echo ""
fi

exit 0
