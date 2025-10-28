# Zod Schemas & OpenAI Structured Output

**Version**: 1.0
**Last Updated**: 2025-10-27

---

## Overview

This project uses **Zod schemas** with OpenAI's **Structured Output** feature to ensure the LLM returns valid, parseable JSON responses. This approach combines:

1. **Schema validation** - Zod enforces structure at runtime
2. **LLM guidance** - JSON Schema sent to OpenAI guides generation
3. **Type safety** - TypeScript types derived from Zod schemas

---

## Why Zod + Structured Output?

### Without Structured Output
```typescript
// Pray the LLM returns valid JSON 🙏
const response = await openai.chat.completions.create({
  messages: [...]
});

const parsed = JSON.parse(response.choices[0].message.content); // Might fail!
```

### With Structured Output
```typescript
// OpenAI guarantees valid JSON matching schema ✅
const response = await openai.chat.completions.create({
  messages: [...],
  response_format: zodResponseFormat(MySchema, 'my_response')
});

const parsed = MySchema.parse(JSON.parse(response.choices[0].message.content)); // Safe!
```

---

## The Two-Call Process

### Call 1: Content Generation
**Purpose**: Generate `videoScript` and `voiceScript`

**Zod Schema** (`script-generator.ts` line 105-108):
```typescript
const ContentSchema = z.object({
  videoScript: z.string().describe("Full visual description of Scene 1 - the baseline"),
  voiceScript: z.string().describe("50-60 words of dialogue")
});
```

**What OpenAI Receives** (JSON Schema):
```json
{
  "name": "content_generation",
  "strict": true,
  "schema": {
    "type": "object",
    "properties": {
      "videoScript": {
        "type": "string",
        "description": "Full visual description of Scene 1 - the baseline"
      },
      "voiceScript": {
        "type": "string",
        "description": "50-60 words of dialogue"
      }
    },
    "required": ["videoScript", "voiceScript"],
    "additionalProperties": false
  }
}
```

**Example Response**:
```json
{
  "videoScript": "Person in their 40s wearing casual clothing sits in a cozy living room...",
  "voiceScript": "I know the weight you're carrying—money worries, marriage tensions..."
}
```

---

### Call 2: Prompt Optimization
**Purpose**: Generate 3 Veo-optimized scene prompts

**Zod Schema** (`script-generator.ts` line 179-184):
```typescript
const PromptsSchema = z.object({
  scenes: z.array(z.object({
    sceneNumber: z.number().int(),
    prompt: z.string()
  })).length(3)  // Exactly 3 scenes required
});
```

**What OpenAI Receives** (JSON Schema):
```json
{
  "name": "prompt_generation",
  "strict": true,
  "schema": {
    "type": "object",
    "properties": {
      "scenes": {
        "type": "array",
        "minItems": 3,
        "maxItems": 3,
        "items": {
          "type": "object",
          "properties": {
            "sceneNumber": {
              "type": "integer"
            },
            "prompt": {
              "type": "string"
            }
          },
          "required": ["sceneNumber", "prompt"],
          "additionalProperties": false
        }
      }
    },
    "required": ["scenes"],
    "additionalProperties": false
  }
}
```

**Example Response**:
```json
{
  "scenes": [
    {
      "sceneNumber": 1,
      "prompt": "Person in their 40s, warm living room, concerned expression, actively speaking to camera..."
    },
    {
      "sceneNumber": 2,
      "prompt": "Person continues speaking with softening expression, saying: 'You're not alone...'"
    },
    {
      "sceneNumber": 3,
      "prompt": "Peaceful expression, saying: 'Try BibleChat...'"
    }
  ]
}
```

---

## Design Philosophy

### Trust OpenAI, Guide with Descriptions

**We removed arbitrary constraints** like:
```typescript
// OLD (too restrictive)
videoScript: z.string().min(50)
voiceScript: z.string().min(40).max(400)
sceneNumber: z.number().int().min(1).max(3)
prompt: z.string().min(10)
```

**We now use descriptions** to guide naturally:
```typescript
// NEW (trusts OpenAI)
videoScript: z.string().describe("Full visual description...")
voiceScript: z.string().describe("50-60 words of dialogue")
sceneNumber: z.number().int()
prompt: z.string()
```

### Why This Approach?

1. **System prompts provide detailed instructions** - No need for hard limits
2. **LLM knows best** - Let OpenAI decide appropriate lengths
3. **Matches playground testing** - This is what worked in testing
4. **More flexible** - No arbitrary failures

### What We Keep

✅ **Structural constraints**:
- `.length(3)` - Must have exactly 3 scenes
- `.int()` - Scene numbers must be integers
- `required` fields - Fields must exist

❌ **Arbitrary length constraints**:
- No `.min()` on strings
- No `.max()` on strings (except where truly needed)
- No `.min()/.max()` on numbers (unless structural)

---

## How Descriptions Work

The `.describe()` method adds a `description` field to the JSON Schema sent to OpenAI.

### Example: voiceScript

**Zod**:
```typescript
voiceScript: z.string().describe("50-60 words of dialogue")
```

**JSON Schema sent to OpenAI**:
```json
{
  "voiceScript": {
    "type": "string",
    "description": "50-60 words of dialogue"
  }
}
```

**What OpenAI sees**:
- Field name: `voiceScript`
- Type: string
- Guidance: "50-60 words of dialogue"

**Result**: OpenAI generates dialogue with approximately 50-60 words, without hard enforcement.

---

## Comparison: System Prompt vs Descriptions

### System Prompt
Provides **overall task** and **detailed instructions**:
```
You are creating a comfort video...

Generate TWO fields:
1. videoScript - Describe Scene 1 visuals...
2. voiceScript - 50-60 words of dialogue with this structure:
   - First ~20 words: Acknowledge struggle
   - Next ~20 words: Reassure them
   - Final ~20 words: Invite to BibleChat
```

### Schema Descriptions
Provide **field-level hints** that complement the system prompt:
```typescript
{
  videoScript: z.string().describe("Full visual description of Scene 1"),
  voiceScript: z.string().describe("50-60 words of dialogue")
}
```

### Relationship

```
System Prompt (WHY and HOW)
    ↓
JSON Schema (WHAT structure)
    ↓
Descriptions (WHAT each field should contain)
    ↓
OpenAI generates response
    ↓
Zod validates response
    ↓
Success!
```

---

## Error Handling

### Validation Failure

```typescript
try {
  const parsed = ContentSchema.parse(JSON.parse(message.content));
} catch (error) {
  // Zod validation failed
  logger.error('OpenAI API returned invalid structure');
  throw new ScriptGenerationError('No response from OpenAI (Call 1)', {
    category: userProblem.category,
    template: template.id
  });
}
```

### Why This Rarely Happens

OpenAI's Structured Output feature **guarantees** the response matches the schema, so validation failures are extremely rare. They only occur if:
- Network corruption
- Unexpected API changes
- Programming errors in our schema

---

## Complete Flow Example

### Call 1 Flow

```
1. Define Zod Schema
   ↓
const ContentSchema = z.object({
  videoScript: z.string().describe("Full visual description..."),
  voiceScript: z.string().describe("50-60 words of dialogue")
});

2. Convert to JSON Schema (zodResponseFormat)
   ↓
{
  "name": "content_generation",
  "schema": { ... }
}

3. Send to OpenAI
   ↓
await openai.chat.completions.create({
  model: "gpt-5-mini",
  messages: [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt }
  ],
  response_format: zodResponseFormat(ContentSchema, 'content_generation')
});

4. OpenAI Returns Valid JSON
   ↓
{
  "videoScript": "...",
  "voiceScript": "..."
}

5. Validate with Zod
   ↓
const result = ContentSchema.parse(JSON.parse(response.content));

6. Use in Application
   ↓
return result; // TypeScript knows the types!
```

---

## Benefits of This Approach

✅ **Type-safe** - TypeScript knows exact structure
✅ **Guaranteed valid** - OpenAI respects the schema
✅ **Runtime validation** - Zod catches edge cases
✅ **Self-documenting** - Schema shows expected structure
✅ **Flexible** - Easy to add new fields
✅ **Matches playground** - Same approach that worked in testing

---

## Testing in OpenAI Playground

You can test these schemas directly in the playground:

1. Go to https://platform.openai.com/playground
2. Select model: `gpt-5-mini`
3. Enable **Structured Output**
4. Paste the JSON Schema (from examples above)
5. Add your system prompt
6. Add your user message
7. Generate → See structured response

---

## Related Files

**Schema Definitions**:
- `src/lib/script-generator.ts` - Where schemas are defined and used
- `src/types/script.types.ts` - Additional Zod schemas

**Templates (System Prompts)**:
- `src/config/templates.ts` - System prompts for Call 1 and Call 2

**Related Documentation**:
- [Manifest Schema](./manifest-schema.md) - Output format
- [Technical Specs](../1_development-docs/core-docs/3-technical-specs.md) - System architecture
