# Manifest Schema Reference

**Version**: 1.0
**Last Updated**: 2025-10-27

---

## Overview

Manifests are JSON files that capture all metadata for each video generation. They serve as the integration point with the parent platform and provide a complete record of both dry-runs and full video generations.

---

## File Naming Convention

### Full Runs
```
manifests/{videoId}_{timestamp}.json
```
**Example**: `anxiety-or-fear_direct-to-camera_2025-10-27T14-32-15-123Z.json`

### Dry-Runs
```
manifests/dry-run_{videoId}_{timestamp}.json
```
**Example**: `dry-run_anxiety-or-fear_direct-to-camera_2025-10-27T14-32-15-123Z.json`

**Benefits**:
- ✅ No overwrites (history preserved)
- ✅ Clear distinction (dry-run prefix)
- ✅ Sortable by time
- ✅ Unique per generation

---

## Manifest Status Values

```typescript
type ManifestStatus =
  | "dry-run"           // Script only, no videos generated
  | "script-generated"  // Script done, videos pending
  | "completed"         // All videos generated successfully
  | "failed";           // Video generation failed
```

### Status Lifecycle

**Dry-Run**:
```
"dry-run" → (stays dry-run forever)
```

**Full Run (Success)**:
```
"script-generated" → "completed"
```

**Full Run (Failure)**:
```
"script-generated" → "failed"
```

---

## Complete Schema

```typescript
interface Manifest {
  // Universal metadata
  videoId: string;              // Logical ID (e.g., "anxiety-or-fear_direct-to-camera")
  problemCategory: string;      // User problem category
  contentTemplate: string;      // Template used ("direct-to-camera", "text-visuals")
  timestamp: string;            // ISO 8601 timestamp
  userProblem: string;          // Original user problem text
  status: ManifestStatus;       // Current state (see above)

  // Template-specific content
  content: D2CManifestContent | TextVisualsManifestContent | Record<string, any>;

  // Scene prompts (all templates use Veo)
  scenes: ManifestScene[];

  // Output paths
  finalVideoPath: string | null;  // Path to final video (null for dry-runs)
}
```

---

## Template-Specific Content

### Direct-to-Camera

```typescript
interface D2CManifestContent {
  videoScript: string;  // Visual description of Scene 1 baseline
  voiceScript: string;  // 50-60 words of continuous dialogue
}
```

**Example**:
```json
{
  "content": {
    "videoScript": "A person in their early 40s sits in a cozy living room...",
    "voiceScript": "I know the weight you're carrying—money worries, marriage tensions..."
  }
}
```

### Text-Visuals (Future)

```typescript
interface TextVisualsManifestContent {
  headlines?: string[];  // Text overlays
  bodyText?: string;     // Supporting text
}
```

---

## Scene Structure

```typescript
interface ManifestScene {
  sceneNumber: number;  // 1, 2, or 3
  prompt: string;       // Veo-optimized cinematography prompt
}
```

**Example**:
```json
{
  "scenes": [
    {
      "sceneNumber": 1,
      "prompt": "Person in their 40s, warm living room setting, concerned expression..."
    },
    {
      "sceneNumber": 2,
      "prompt": "Same person, expression softens to gentle smile, saying: 'You're not alone...'"
    },
    {
      "sceneNumber": 3,
      "prompt": "Peaceful, confident expression, saying: 'Try BibleChat...'"
    }
  ]
}
```

---

## Complete Examples

### Dry-Run Manifest

```json
{
  "videoId": "anxiety-or-fear_direct-to-camera",
  "problemCategory": "Anxiety or fear",
  "contentTemplate": "direct-to-camera",
  "timestamp": "2025-10-27T14:32:15.123Z",
  "userProblem": "Financial struggles, marriage, work, children",
  "status": "dry-run",
  "content": {
    "videoScript": "Person in their 40s wearing casual clothing sits in a cozy living room...",
    "voiceScript": "I know the weight you're carrying—money worries, marriage tensions, work stress..."
  },
  "scenes": [
    {
      "sceneNumber": 1,
      "prompt": "Person in their 40s, warm living room, concerned expression, actively speaking to camera..."
    },
    {
      "sceneNumber": 2,
      "prompt": "Person continues speaking with softening expression, saying: 'You're not alone in this...'"
    },
    {
      "sceneNumber": 3,
      "prompt": "Peaceful expression, saying: 'Try BibleChat for support...'"
    }
  ],
  "finalVideoPath": null
}
```

### Completed Full-Run Manifest

```json
{
  "videoId": "anxiety-or-fear_direct-to-camera",
  "problemCategory": "Anxiety or fear",
  "contentTemplate": "direct-to-camera",
  "timestamp": "2025-10-27T14:32:15.123Z",
  "userProblem": "Financial struggles, marriage, work, children",
  "status": "completed",
  "content": {
    "videoScript": "Person in their 40s wearing casual clothing sits in a cozy living room...",
    "voiceScript": "I know the weight you're carrying—money worries, marriage tensions, work stress..."
  },
  "scenes": [
    {
      "sceneNumber": 1,
      "prompt": "Person in their 40s, warm living room, concerned expression, actively speaking to camera..."
    },
    {
      "sceneNumber": 2,
      "prompt": "Person continues speaking with softening expression, saying: 'You're not alone in this...'"
    },
    {
      "sceneNumber": 3,
      "prompt": "Peaceful expression, saying: 'Try BibleChat for support...'"
    }
  ],
  "finalVideoPath": "output/videos/anxiety-or-fear_direct-to-camera_2025-10-27T14-32-15-123Z/final.mp4"
}
```

---

## When Manifests Are Created

### Dry-Run Mode
```bash
npm start generate -- --dry-run --template direct-to-camera --limit 1
```

**Flow**:
1. Generate script (LLM calls)
2. ✅ Create manifest with `status: "dry-run"`, `finalVideoPath: null`
3. Done (no videos)

### Full Run
```bash
npm start generate -- --template direct-to-camera --limit 1
```

**Flow**:
1. Generate script (LLM calls)
2. ✅ Create manifest with `status: "script-generated"`, `finalVideoPath: null`
3. Generate 3 video scenes
4. Combine scenes into final video
5. ✅ Update manifest with `status: "completed"`, `finalVideoPath: "{path}"`

---

## Integration Points

### Parent Platform Usage

The parent platform can:

1. **Filter manifests**:
   ```bash
   # Only completed videos
   ls manifests/*.json | grep -v "dry-run"

   # Only dry-runs
   ls manifests/dry-run_*.json
   ```

2. **Parse manifest**:
   ```javascript
   const manifest = JSON.parse(fs.readFileSync(manifestPath));

   if (manifest.status === 'completed') {
     // Use manifest.finalVideoPath
     // Use manifest.scenes for metadata
     // Use manifest.content.voiceScript for captions
   }
   ```

3. **Track status**:
   ```javascript
   // Check if video is ready
   const isReady = manifest.status === 'completed' && manifest.finalVideoPath;
   ```

---

## Benefits of This Design

✅ **Single source of truth** - All video metadata in one place
✅ **History preserved** - Timestamped filenames prevent overwrites
✅ **Clear distinction** - Prefix makes dry-runs obvious
✅ **Status tracking** - Lifecycle clearly indicated
✅ **Template flexibility** - Content structure adapts per template
✅ **Platform ready** - Clean API for parent system integration

---

## Related Documentation

- [Output Structure](./output-structure.md) - Complete output directory layout
- [Zod Schemas](./zod-schemas.md) - LLM response validation
- [Technical Specs](../1_development-docs/core-docs/3-technical-specs.md) - System architecture
