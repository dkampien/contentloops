# CLoops Backlog

## System Requirements
- **SR1**: Produce 20 kids comics for ads with narration bundled
- **SR2**: Fix bad images without regenerating everything
- **SR3**: System runs automatically without manual triggers
- **SR4**: Output feeds into AdLoops platform

## Next Cycle
- Stories Backlog Service [2]
- Batch Processing [1]

## Backlog

### Core System
1. ~~**Batch Processing** - Run multiple items in one command [SR1]~~ ✓
2. ~~**Stories Backlog Service** - Universal datasource with Bible API extraction [SR1]~~ ✓
3. **Selective Regeneration** - Regenerate specific pages without full re-run [SR2]
   - `cloops regen <template> <story-id> --pages 2,4`
   - Reads prompts from existing debug.md, regenerates only those images
4. **Retry Stuck Items** - Reset in_progress items after crashes
   - `--retry` flag on run command resets in_progress → pending
5. **Improved Failure Tracking** - Better metadata for failed items
   - Add `failedAt` timestamp
   - Add `retryCount` field for "give up after N attempts" logic
   - Consider `--stop-on-failure` flag for batch mode
6. **Scheduling Worker** - Auto-run on schedule [SR3]
7. **AdLoops Integration** - Wire output to AdLoops [SR4]

### Templates
8. **Kids Comic Template** - Kid-friendly art/vocabulary with voiceover [SR1]
9. **Video Comic Template** - Output video instead of images

### Infrastructure
10. **Agents SDK Migration** - Replace manual API calls with SDK

## Project Tasks
- Prompts
  - [x] Add dialogue config/support
  - [x] Review step 2 prompts (planning)
  - [ ] Review step 1 prompts (narrative)
  - [ ] Review step 3 prompts (image prompts)
  - [ ] Review step 4 prompts (thumbnail)
- [ ] Add story metadata - is it useful?
- [x] Review step 1 input source (Bible API)
- [ ] Find good comic style for nano-banana model

## Done
- [x] Implement dry run to check just the response prompts
- [x] Implement replay to start image gen for the same set of prompts
- [x] Make a README with commands
- [x] Implement GPT-5.1 with the required settings
- [x] Add coding workflow to claude.md
