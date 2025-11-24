# Current Status - Multi-Template System Development

**Date**: 2025-10-29
**Branch**: `template-workflows`
**Status**: Manual Testing & Validation Phase

---

## Complete Conversation Evolution Recap

---

### **Phase 1: Project Context & Problem Identification** (Beginning)

**What we did:**
- Ran `/prime` to load project structure and context
- Loaded codebase (Cycle 4 complete: D2C template with frame chaining)
- Reviewed `multi-template-system-exploration.md`

**Problem identified:**
- Current pipeline is **hardcoded for D2C workflow**:
  - Always 3 scenes with frame chaining
  - Always combines scenes
  - Single workflow for all templates
- User shared CTO's production system: UGC videos + text hooks for lockscreen campaigns
- **Main pain point**: CTO's UGC database has emotion mismatch issues (happy videos used for sad content)

**Key decision:** Need plugin architecture to support multiple template workflows

---

### **Phase 2: New Template Concept Design** (Early Exploration)

**What we did:**
- Created git branch: `template-workflows`
- Decided to build UGC-emotion template to test architecture flexibility
- Chose **"Iterate, Don't Predict"** strategy: Manual prototype first, then automate

**Initial template concept:**
- 4-6 second person video
- UGC self-filmed aesthetic
- Person NOT looking at camera
- Generic everyday action (independent of problem)
- Emotion shown naturally
- Text hook overlay for lockscreen

**Workflow designed:**
```
2 parallel LLM calls (video prompt + text hook)
    ↓
Veo generates video
    ↓
Text overlay
    ↓
Final output
```

---

### **Phase 3: OpenAI Playground Experimentation** (Mid Conversation)

**What we did:**
- Started designing system prompts for OpenAI Playground
- Learned about Playground structure: system prompt, user message, variables, JSON schemas
- Discussed structured JSON schema vs. direct string output
- Explored hybrid approach (components + assembled prompt)

**Testing iterations:**
1. **System Prompt V1**: Too detailed, literal problem matching (bills, baby monitors) → **2/6 usable videos (33% success)**
2. **System Prompt V2**: Too simple, lost important details → **0/? usable videos**
3. **System Prompt V3**: Emotions too exaggerated in Veo output → **Still failing**

**Key learnings:**
- LLM tried to match action to problem literally (financial struggles → bills on table)
- Explicit emotion in prompts caused exaggerated Veo output
- Veo output looked too cinematic/polished (not authentic UGC)

---

### **Phase 4: Strategic Pivot** (Realization)

**The insight:** We were doing it backwards!

**Wrong approach:**
```
Guess LLM prompt → Hope Veo works → Fail → Adjust → Repeat
```

**Right approach:**
```
Find what works in Veo manually → Design LLM prompt to match that pattern
```

**Decision:** Manual testing and prototyping before automation

---

### **Phase 5: Manual Testing & Refinement** (Testing Phase)

**What we did:**
- User tested manual assembly in CapCut with successful Veo outputs
- Generated text hook variations for 6-second videos
- Tested overlay combinations

**Critical feedback from user:**
1. **Cohesion problem**: Video showing literal struggle (bills, calculator) felt too heavy and disconnected from hook
2. **Engagement issue**: Person in middle of problem = not catchy for social media
3. **Emotion exaggeration**: Veo overacts when emotion is explicit in prompt
4. **Tool limitation**: Veo output looks too cinematic/polished, not authentic UGC

**Key insights discovered:**
- Action should be **generic** (cooking, walking), NOT tied to problem
- Emotion should be **implied** through context, NOT explicitly stated
- Text hook carries the emotional message, video is just relatable backdrop
- Voiceover needed (ElevenLabs) to read text hook

---

### **Phase 6: Refined Template Concept** (Clarity Emerges)

**New understanding:**

**Emotion Strategy:**
```
❌ NOT in video: No explicit emotion in Veo prompt (causes exaggeration)
❌ NOT in text: No emotion labeling ("anxious", "worried")
✓ IMPLIED: Through situation, context, viewer projection
```

**Cohesion Strategy:**
```
Part 1 (Video): Universal relatability
├─ Generic everyday action
└─ Viewer: "That's like me"

Part 2 (Text Hook): Specific context
├─ Names the struggle situationally
└─ Viewer: "That's my situation"

Part 3 (Lockscreen): Solution
├─ BibleChat widget
└─ Viewer: "I can try that"

Flow: Relatability → Context → Action
```

**Audio design added:**
- Layer 1: Ambient/action sounds from Veo (20-30% volume)
- Layer 2: ElevenLabs voiceover reading text hook (100% volume)
- Layer 3: Background music optional (10-15% volume)

---

### **Phase 7: Template Naming Convention** (Organization)

**What we did:**
- Discussed template naming patterns
- Established convention: `[visual-format]_[feature/campaign]`

**Templates renamed:**
- Old: `ugc-emotion`
- New: `ugc-action_lockscreen`
  - `ugc-action` = visual format (action-focused UGC)
  - `lockscreen` = feature being promoted (lockscreen widget)

---

### **Phase 8: Documentation Organization** (Current Phase)

**What we accomplished:**

1. **Created template plans:**
   - ✅ `template_ugc-action_lockscreen.md` - UGC-Action template design
   - ✅ `template_direct-to-camera_comfort.md` - D2C template design

2. **Organized documentation structure:**
   ```
   _docs/2_reference-docs/
   ├── template-design-full.md               # General framework
   ├── template_direct-to-camera_comfort.md  # D2C specific
   └── template_ugc-action_lockscreen.md     # UGC-Action specific
   ```

3. **Cleaned up:**
   - ✅ Deleted `temp-implementation.md` (content distributed to proper locations)
   - ✅ Updated references in cycle-4 implementation plan

---

## **Current Status: Where You Are Now**

### ✅ **Completed:**
1. UGC-Action Lockscreen template fully designed
2. Template naming convention established
3. Documentation properly organized
4. D2C template retroactively documented
5. Branch created: `template-workflows`

### ⏳ **Pending (Next Steps):**
1. **Test Veo with action-focused, no-emotion prompts**
   - Find winning manual Veo prompt pattern
   - Validate cohesion (video + hook + lockscreen flow)

2. **Develop prompt methodology**
   - Systematic approach to writing effective Veo prompts
   - Learn how to get authentic UGC aesthetic from Veo

3. **Validate tool capability**
   - Can Veo produce authentic UGC look?
   - Or need to pivot strategy?

4. **Design LLM system prompts** (after Veo validation)
   - Call 1: Generate video prompt for Veo
   - Call 2: Generate text hook for overlay

5. **Build plugin architecture**
   - Refactor D2C into plugin pattern
   - Implement UGC-Action as second template
   - Prove multi-template system works

---

## **Key Unresolved Questions:**

1. **Tool Capability**: Can Veo produce authentic UGC look with better prompting?
2. **Prompt Formula**: What exact structure/detail level works for action-focused, no-emotion prompts?
3. **Cohesion Validation**: Does generic action + situational text hook flow work in practice?

---

## **The Journey So Far:**

```
1. Identified problem (D2C-hardcoded architecture)
2. Designed new template concept (UGC-emotion)
3. Tried to automate too early (LLM prompts failed)
4. Pivoted to manual testing (learned what works)
5. Refined concept based on testing (emotion strategy, cohesion)
6. Organized documentation (template plans, naming)
7. → NOW: Ready for next phase of validation
```

---

## **Key Documents to Reference:**

- **Template Design**: `_docs/2_reference-docs/template_ugc-action_lockscreen.md`
- **D2C Template**: `_docs/2_reference-docs/template_direct-to-camera_comfort.md`
- **Template Framework**: `_docs/2_reference-docs/template-design-full.md`
- **Multi-Template Exploration**: `_docs/1_development-docs/multi-template-system-exploration.md`

---

## **Next Session Starting Point:**

**You are here:** Documentation complete, ready to continue manual Veo testing to find winning prompt pattern before building automation.

**Next concrete action:** Test more Veo prompts with action-focused, no-emotion approach to validate the refined concept works.

**Testing approach:**
1. Write 5-10 manual Veo prompts (action-focused, no emotion words)
2. Test in Veo web UI
3. Document what works vs. what doesn't
4. Identify winning pattern
5. Design LLM system prompt to generate that pattern

---

**End of Status Document**
