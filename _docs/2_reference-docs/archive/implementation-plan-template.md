# Implementation Plan Template

Use this template when drafting or updating cycle implementation plans. Keep sections that add clarity, and drop the ones that are irrelevant for the scope.

---

## Overview
- **Objective:** High-level goal for the cycle or project slice.
- **Key Risks / Assumptions:** Optional bullets that shape priorities.
- **Related Docs:** Link to exploration, requirements, or spec docs (`@_docs/...`).

## Completion Status *(optional summary table)*
- **Phase 1:** ✅ / ❌ — short description of what shipped or slipped
- **Phase 2:** …
- **Unplanned Work:** Note surprises so the record stays honest.

## Progress Updates *(optional journal)*
### {Date}
- ✅ Major highlight or fix
- 🚧 In-flight task and current blocker (if any)

Repeat per working session when narrative context is useful.

---

## Phase {N}: {Phase Name}
Provide phase context if grouping steps is helpful. Otherwise skip the phase wrapper and list steps directly.

### Step {number}: {Title} `[ ] / [x]`
- **Priority:** Critical / High / Medium / Low
- **Status:** Optional timestamped note when completed (e.g., `Completed on Feb 3, 2025`).
- **Task:** One or two sentences describing the expected outcome.
- **Files:**
  - `frontend/...`
  - `backend/...`
- **Step Dependencies:** Previous steps, external approvals, or “None”.
- **User Instructions / Validation:** How to verify the work (manual flow, command, acceptance criteria).
- **Implementation Notes:** Decisions, shortcuts, or follow-ups that future you should know.

Repeat the step block for each planned deliverable. Keep checkboxes in sync (`- [ ]` / `- [x]`) so status is glanceable.

---

## Post-Implementation Checklist *(optional)*
- [ ] `npm run lint`
- [ ] Regression walkthrough (list critical flows)
- [ ] Update docs/screenshots as needed

## Retro Notes *(optional)*
Capture quick bullets on wins, pitfalls, or ideas to carry into the next cycle.
