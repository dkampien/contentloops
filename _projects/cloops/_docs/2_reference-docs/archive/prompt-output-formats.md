# Prompt Output Formats

  ## Overview

  When generating prompts using formulas and blocks, there are different ways to display the information depending on
  whether you're showing a template structure or an actual generated output.

  This document defines the standard formats for displaying prompts.

  ---

  ## Understanding the Structure

  All formats consist of three sections:

  **Section 1: Metadata**
  - Modality = Which capability (text-to-image, image-to-video, etc.)
  - Formula = Block structure and order

  **Section 2: Blocks**
  - [Block] = String value assigned to each block
  - Variables `{}` = Informal markers showing "fill this spot"

  **Section 3: Final Prompt**
  - Prompt: The assembled prompt string sent to the model

  ### How Variables Work

  Variables are informal placeholders within block strings:

  [Setting] = {position} at {location}

  **Variables:**
  - Are NOT sub-blocks
  - Are NOT formal structure
  - Are just guidance labels for parts of the string
  - "at" is literal text that stays

  **When filled:**
  [Setting] = standing at kitchen stove

  Variables disappear - they were just placeholders showing where to put what.

  ---

  ## Working with Block Libraries

  When using a **block library** (a structured collection of reusable, organized blocks), you can use hierarchical sub-blocks to provide more structure and traceability.

  ### How Sub-blocks Work

  Sub-blocks use hierarchical paths from the library:

  [Scene.Subjects.Age] = 30s
  [Scene.Subjects.Gender] = male

  **Sub-blocks vs Variables - Different Levels:**
  - **Variables `{}`** = Placeholders within VALUES (guidance for what to write)
  - **Sub-blocks `[Block.SubBlock]`** = Structural paths (where in the hierarchy)

  **They can work together:**
  [Subject.Description] = {age} {gender} person
                           ↑ variables guide the content
  ↑ sub-block shows library path

  Variables operate at the **content level**, sub-blocks at the **structural level**.

  **Simple/Core blocks** = Leaf nodes in the library that can't be broken down further
  - These have **creative freedom** - you write natural language values
  - Examples guide you, but you're not constrained
  - Example: `[Scene.Subjects.Action] = stirring pot on autopilot`

  **Hybrid Approach:**
  When using a block library, you can mix:
  - **Hierarchical blocks** for atomic control (age, gender, lighting type)
  - **Flat creative blocks** for open-ended descriptions (action, expression)

  **LLM Assembly:**
  When generating prompts with sub-blocks, an LLM can assemble atomic sub-block values into natural descriptive language:
  - **Sub-blocks** = Atomic values (data structure)
  - **Main block** = LLM-assembled natural language (resolves phrasing conflicts)

  Example:
  [Subject] = Person in their 30s
    [Subject.Age] = 30s
    [Subject.Gender] = male

  The LLM takes `30s` and `male` and creates "Person in their 30s" (not "30s male" or "male in 30s").

  This resolves phrasing conflicts - how do you naturally combine "soft", "natural", and "front-lit" into a lighting description? The LLM handles grammar, word order, and natural flow.

  **Assembly Rule:**
  When using sub-blocks, assemble atomic values into natural descriptive language at the parent block level. Only concatenate when the combination reads naturally.

  Examples:
  - ✅ [Subject.Age]=30s + [Subject.Gender]=male → [Subject] = "Man in his 30s"
  - ❌ [Subject] = "30s, male" (doesn't read naturally)
  - ✅ [Lighting.Quality]=soft + [Lighting.Type]=natural → [Lighting] = "soft natural lighting"
  - ✅ Also acceptable: [Lighting] = "natural soft lighting" (both read naturally)

  ---

  ## Format Types

  **Note:** Formats 1-3 use variables `{}` as content placeholders. Format 4 adds sub-block hierarchy from a structured library (can also include variables).

  ### 1. Template

  Shows the structure with `{variables}` as placeholders.

  **Use for:** Documenting reusable formula patterns

  Modality = {modality name}
  Formula = [Block1] [Block2] [Block3]

  [Block1] = {variable1} {variable2}
  [Block2] = {variable1} at {variable2}
  [Block3] = fixed value

  Prompt: "{Block1} {Block2}, {Block3}"

  ### 2. Output Compact

  Shows filled values without variable breakdown.

  **Use for:** Clean, scannable output

  Modality = text-to-video
  Formula = [Subject] [Setting] [Action]

  [Subject] = Person in their 30s
  [Setting] = standing at kitchen stove
  [Action] = stirring pot on autopilot, staring off absently

  Prompt: "Person in their 30s standing at kitchen stove, stirring pot on autopilot, staring off absently"

  ### 3. Output Detailed

  Shows filled values WITH variable breakdown under each block.

  **Use for:** Debugging, analysis, documentation with clear component mapping

  Modality = text-to-video
  Formula = [Subject] [Setting] [Action]

  [Subject] = Person in their 30s
    {person description} = Person in their 30s

  [Setting] = standing at kitchen stove
    {position} = standing
    {location} = kitchen stove

  [Action] = stirring pot on autopilot, staring off absently
    {activity} = stirring pot
    (descriptor chosen: "on autopilot")
    {pause} = staring off absently

  Prompt: "Person in their 30s standing at kitchen stove, stirring pot on autopilot, staring off absently"

  ### 4. Output Detailed - Sub-blocks

  Shows filled values WITH sub-block hierarchy from block library.

  **Use for:** Structured generation, showing library hierarchy, traceability to block sources

  Modality = text-to-video
  Formula = [Subject] [Setting] [Action] [Lighting]

  [Subject] = Person in their 30s
    [Subject.Age] = 30s
    [Subject.Gender] = unspecified

  [Setting] = standing at kitchen stove
    [Setting.Position] = standing
    [Setting.Location] = kitchen stove

  [Action] = stirring pot on autopilot, staring off absently
    [Action.Activity] = stirring pot
    (simple block - creative freedom)

  [Lighting] = soft natural front lighting
    [Lighting.Quality] = soft
    [Lighting.Type] = natural
    [Lighting.Direction] = front-lit
    (LLM assembled into natural phrasing)

  Prompt: "Person in their 30s standing at kitchen stove, stirring pot on autopilot, staring off absently, soft natural front lighting"

  **Key differences from Format 3:**
  - Shows library paths `[Block.SubBlock]` instead of variables `{variable}`
  - Simple blocks marked as having creative freedom
  - LLM assembles sub-blocks into natural language for main block (see Lighting example above)

  ---

  ## Complete Example

  **Template:**
  Modality = text-to-video
  Formula = [Subject] [Setting] [Action] [Camera.Style]

  [Subject] = {person description with age/gender}
  [Setting] = {position} at {location}
  [Action] = {activity} on autopilot/mechanically, {pause}, {micro-action}
  [Camera.Style] = fixed camera, observational, natural lighting, unpolished

  Prompt: "{Subject} {Setting}, {Action}, {Camera.Style}"

  **Output Compact:**
  Modality = text-to-video
  Formula = [Subject] [Setting] [Action] [Camera.Style]

  [Subject] = Person in their 30s
  [Setting] = standing at kitchen stove
  [Action] = stirring pot on autopilot, staring off absently, wiping forehead
  [Camera.Style] = fixed camera, observational, natural lighting, unpolished

  Prompt: "Person in their 30s standing at kitchen stove, stirring pot on autopilot, staring off absently, wiping
  forehead, fixed camera, observational, natural lighting, unpolished"

  **Output Detailed:**
  Modality = text-to-video
  Formula = [Subject] [Setting] [Action] [Camera.Style]

  [Subject] = Person in their 30s
    {person description with age/gender} = Person in their 30s

  [Setting] = standing at kitchen stove
    {position} = standing
    {location} = kitchen stove

  [Action] = stirring pot on autopilot, staring off absently, wiping forehead
    {activity} = stirring pot
    (descriptor chosen: "on autopilot")
    {pause} = staring off absently
    {micro-action} = wiping forehead

  [Camera.Style] = fixed camera, observational, natural lighting, unpolished
    (fixed value - no variables)

  Prompt: "Person in their 30s standing at kitchen stove, stirring pot on autopilot, staring off absently, wiping
  forehead, fixed camera, observational, natural lighting, unpolished"

  **Output Detailed - Sub-blocks:**
  Modality = text-to-video
  Formula = [Subject] [Setting] [Action] [Camera.Style]

  [Subject] = Person in their 30s
    [Subject.Age] = 30s
    [Subject.Gender] = unspecified

  [Setting] = standing at kitchen stove
    [Setting.Position] = standing
    [Setting.Location] = kitchen stove

  [Action] = stirring pot on autopilot, staring off absently, wiping forehead
    [Action.Activity] = stirring pot
    (simple block - creative freedom)

  [Camera.Style] = fixed camera, observational, natural lighting, unpolished
    (fixed value - no sub-blocks)

  Prompt: "Person in their 30s standing at kitchen stove, stirring pot on autopilot, staring off absently, wiping
  forehead, fixed camera, observational, natural lighting, unpolished"

  ---

  **End of Documentation**