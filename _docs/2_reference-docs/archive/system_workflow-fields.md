# Workflow Fields Reference

**Date**: October 20, 2025
**Status**: Draft

---

## Field Terminology

Throughout this workflow, we refer to data elements as **"fields"** (or "properties" in TypeScript context).

---

## Workflow Fields by Stage

### Inputs
- `userProblem` - User's problem data from CSV (object with category + problem text)
- `contentTemplate` - Template type (e.g., "direct-to-camera")

### Script Generation (CALL 1)
- `videoScript` - Overall video concept/synopsis (prose description)
- `voiceScript` - Full dialogue (20-24 seconds)
- `scenes[].description` - Visual scene descriptions (x3, DOP-style)

### Prompt Generation (CALL 2)
- `scenes[].prompt` - Veo-optimized prompts (x3)

### TTS Generation
- `voiceAudio.mp3` - Generated audio file from voiceScript

### AI Video Gen Subworkflow - Scene 1
- `scene1.mp4` - First video clip (8s, silent)
- `neutral_pose.jpg` - First frame extraction (for neutral pose)
- `scene1_last_frame.jpg` - Last frame extraction (for Scene 2)

### AI Video Gen Subworkflow - Scene 2
- `scene2.mp4` - Second video clip (8s, silent)
- `scene2_last_frame.jpg` - Last frame extraction (for Scene 3)

### AI Video Gen Subworkflow - Scene 3
- `scene3.mp4` - Third video clip (8s, silent)

### Video Assembly
- `combined_silent.mp4` - All 3 clips combined (24s, no audio)

### Lipsync
- `videoFinal.mp4` - Final video with synced audio

---

## Output Manifest Structure

The **Video Manifest** is the final JSON output that describes the generated video and its components.

### Manifest Fields

```typescript
{
  // Identity
  "videoId": string,              // Unique identifier for this video
  "problemCategory": string,       // Problem category (e.g., "Anxiety or fear")
  "contentTemplate": string,       // Template used (e.g., "direct-to-camera")
  "timestamp": string,             // ISO 8601 timestamp

  // Source
  "userProblem": string,           // Original user problem text

  // Generated Content
  "videoScript": string,           // Overall video concept (prose)
  "voiceScript": string,           // Full dialogue script
  "scenes": [                      // Array of 3 scenes
    {
      "sceneNumber": number,       // 1, 2, or 3
      "description": string,       // Visual description (DOP-style)
      "prompt": string             // Veo-optimized prompt
    }
  ],

  // Output
  "finalVideoPath": string         // Path to final video file
}
```

### Example Manifest

```json
{
  "videoId": "anxiety-or-fear_direct-to-camera_abc123",
  "problemCategory": "Anxiety or fear",
  "contentTemplate": "direct-to-camera",
  "timestamp": "2025-10-20T15:30:00.000Z",

  "userProblem": "Financial struggles, marriage, work, children",

  "videoScript": "This video offers comfort to someone overwhelmed by financial struggles, work stress, and family responsibilities. It begins by acknowledging their anxiety, transitions to reassurance that they're not alone, and concludes with practical encouragement.",

  "voiceScript": "You know, sometimes it feels like everything is piling up—financial struggles, work stress, and the responsibilities of marriage and kids. It can be overwhelming, can't it? I want you to know that it's okay to feel scared or anxious about these things. Many people are in the same boat as you, and you're not alone in this struggle. Remember, it's okay to take small steps towards managing those worries.",

  "scenes": [
    {
      "sceneNumber": 1,
      "description": "Person in their 30s sitting on comfortable couch in cozy, softly lit living room. Holding warm mug of tea. Speaking with anxious yet warm demeanor.",
      "prompt": "Medium close-up of relatable person in their 30s sitting on comfortable couch in softly lit living room, holding warm mug, actively speaking with sincere expression."
    },
    {
      "sceneNumber": 2,
      "description": "Same setting with slightly brighter lighting. Person smiles gently with reassuring expression. Open body language.",
      "prompt": "Person continues speaking with gentle smile and warm expression, open body language with soft hand gestures."
    },
    {
      "sceneNumber": 3,
      "description": "Person seated with confident posture. Brighter lighting suggesting hope. Smiling warmly with calm expression.",
      "prompt": "Person continues with confident posture, smiling warmly with calm expression, encouraging tone."
    }
  ],

  "finalVideoPath": "output/videos/anxiety-or-fear_direct-to-camera_abc123/final.mp4"
}
```

---


## Intermediate vs Final Fields

### Intermediate Fields (Not in Manifest)
These are generated during the workflow but not included in the final manifest:
- Individual scene video clips (`scene1.mp4`, `scene2.mp4`, `scene3.mp4`)
- Frame extractions (`neutral_pose.jpg`, `scene1_last_frame.jpg`, etc.)
- Combined silent video (`combined_silent.mp4`)
- Voice audio file (`voiceAudio.mp3`)

**Why excluded:** These are intermediate artifacts. Only the final video (`finalVideoPath`) is needed for delivery.

### Final Fields (In Manifest)
These are the essential outputs:
- Content fields: `videoScript`, `voiceScript`, scenes data
- Final output: `finalVideoPath`
- Metadata: `videoId`, `problemCategory`, `contentTemplate`, `timestamp`

---

## Field Types

### String Fields
- `videoId`, `problemCategory`, `contentTemplate`, `timestamp`
- `userProblem`, `videoScript`, `voiceScript`
- `scenes[].description`, `scenes[].prompt`
- `finalVideoPath`

### Number Fields
- `scenes[].sceneNumber` (integer, 1-3)

### Array Fields
- `scenes` (array of scene objects, length: 3)

---

## Related Documents

- **Workflow Diagram**: `workflow_v1.md`
- **Solution Decision Tree**: `solution-decision-tree.md`
- **Veo 3.1 Schema**: `veo3.1-schema.json`
