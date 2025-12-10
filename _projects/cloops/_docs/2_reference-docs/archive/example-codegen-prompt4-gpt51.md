# CLoops: Integrate GPT-5.1

---

## Context

CLoops is a template-based content generation system. It currently uses OpenAI's Responses API with `gpt-4o`. We need to upgrade to `gpt-5.1`.

## Docs to Read First

1. **Tech Spec** - `_docs/1_development-docs/core-docs/2-cloops-tech-spec.md`
   - Section 8.1 covers LLM Service implementation
   - Section 16 mentions GPT 5.1 as the target model

2. **Current LLM Service** - `cloops/src/services/llm.ts`
   - This is the file to modify
   - Currently hardcoded to `gpt-4o` in 5 places
   - Uses OpenAI Responses API with `openai.responses.parse()` and `openai.responses.create()`

## Task

1. Update the LLM service to use `gpt-5.1` instead of `gpt-4o`
2. Check if gpt-5.1 requires different API parameters or structure
3. Verify the Responses API works with gpt-5.1 (or if we need Chat Completions)
4. Use `context7` MCP to fetch latest OpenAI API docs if needed
5. Test with a dry run: `npm run dev -- run comic-books-standard --dry`

## Notes

- The model string should be `gpt-5.1` (confirmed by user)
- OpenAI Responses API is preferred if it supports gpt-5.1
- If API structure changes significantly, update types in `cloops/src/types/index.ts`

---

## Start

Read the tech spec (Section 8.1 for LLM Service), then read `cloops/src/services/llm.ts` and make the necessary changes.
