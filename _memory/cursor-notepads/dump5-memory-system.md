# dump5-memory-system




Summary
Synthesis

SUMMARY PROMPT

I want to summarize this thread to be used as context or memory for another conversation. 

First, identify the most important summary points (dynamic) that would be most relevant for you to know in a new conversation.

(need process of chosing here)



Project evolution and status?

Then, scan the project folder for documents and reference files that might be relavant to provide an accurate picture of the current state of the project and its evolution. 

---


Feedback
- might not need review. Too time consuming to read and its more for you to read anyway. 
- If the summary action begins later in the project when there are multiple jsons, its not as accurate. maybe use jsons directly? As better summary source. -> complex
- Its not automated. I need to run the pipeline manually. 
- Need to figure out to contain token spending if the conversations are too many and / or master md is too large. 
- When the first summary is triggered it should also synthesise and save to master.md. Because the first time, master.md does not have multiple summaries. 
- Can't use agent as it does not have access to current context window. Only works as synthesiser. 
- Doing review and saving consumes too many tokens. 
- Adding synthesis reminder in prime command.
- Find a way to search across chats
- What happens if i generate a summary, continue working on it then I need to generate again? Summaries needs to be refreshed as well? Conversely, add hook to generate when I close session.

---

The Flow

  1. Summarize (Manual - Keep as-is)

  End of conversation → /summarize <session-id>
  → Saves to conversations/{session-id}.md

  2. Synthesis (Manual, but prompted)

  When you run /recall (or it auto-loads):
  → Check for new summaries since last synthesis
  → If found: Show brief message

  "💡 5 new conversation summaries since last synthesis.
  Master memory may be outdated. Run /synthesize when ready."

  → Then load master.md as-is

  This gives you:
  - ✅ Awareness (you know master is stale)
  - ✅ Control (you decide when to synthesize)
  - ✅ No forced action (recall still works)

  3. Synthesize When It Makes Sense

  You'd naturally run /synthesize when:
  - Starting a big new feature (want full context)
  - Weekly review/planning session
  - After a batch of related conversations
  - When the nudge reminds you

  Why This Works

  1. Not every conversation needs immediate synthesis
    - Some are minor, some are exploratory
    - Batching is more efficient
  2. You maintain control
    - No auto-synthesis surprising you
    - Synthesize when YOU want fresh context
  3. Helpful nudges prevent staleness
    - You won't forget for weeks
    - But not nagging every conversation
  4. Auto-load master.md via claude.md
    - No manual /recall needed
    - Master loads automatically
    - You see the nudge if it's stale

  Concrete Example

  Monday: Work on feature A → /summarize
  Tuesday: Debug issue B → /summarize
  Wednesday: Design feature C → /summarize

  Thursday (new conversation):
  → Master.md auto-loads
  → "💡 3 new summaries since last synthesis"
  → You: "Oh right, let me /synthesize before continuing"
  → Fresh master.md with all 3 conversations





































---

*Notepad ID: b867bc14-b0db-4e76-a5c4-ca78de5e3429*

*Created: 11/4/2025, 12:49:29 AM*

