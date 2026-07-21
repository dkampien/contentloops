---
name: ad-produce
description: Phase 2 (GENERATE) of the BibleChat ad pipeline. Turn an authored ad (a Renders row on the Airtable board, status idea) into a finished 9:16 mp4 via the one-verb generate engine. Spend is GATED behind a dry-run estimate. Use whenever an ad's script is approved and someone wants the actual video made, phrased as render, produce, generate, realize, build, or "make the video for <slug>". Trigger phrases: "produce the ad", "produce <slug>", "render this ad", "generate the video", "ad-produce". Not for: writing the script (ad-draft) or changing an existing ad (ad-iterate).
argument-hint: <ad slug>
allowed-tools: Bash, Read, Edit
---

# ad-produce: PRODUCE an ad → mp4 (💲 gated)

Make an approved ad real. The engine reads the ad from the Airtable board, and **the planned rows are the work order**: every `planned` row on the ad's sheet gets generated, everything `current` is reused. A fresh ad generates everything; a variant only what its changes re-planned. Same command either way.

**User input (ad slug):** $ARGUMENTS

Run from `_projects/cloops-ads/`. Nothing to start; the board is remote and every finished file is recorded on it the moment it lands.

## 1: Dry-run, the spend gate

```bash
npm run generate -- <slug> --dry-run
```

Prints the work plan (the planned stills/VO/videos/music) and the estimated cost. **Read it to the human in plain words and wait for their go.** This is the only spend gate; nothing after it blocks except the final cut review.

## 2: Generate

```bash
npm run generate -- <slug>
```

Stage order is dependency-driven and automatic: the generator stages make the files the vehicle's lanes and delivery call for (for a narration vehicle: stills + one-pass VO, then each video sized to its beat's measured VO + a breath, then music), then the vehicle's composition module cuts and draws the final: the editor decides the timeline, the template renders it, captions come from transcription. Every finished file fills its sheet row the moment it lands, so **an interrupted or failed run resumes by re-running the same command**; filled rows are never re-spent.

Knobs, when needed:
- `--stop-after=stills` or `--stop-after=videos`: mid-run checkpoint to eyeball assets before continuing (re-run without the flag to continue; nothing regenerates).
- `--only=<orders>`: generate just the named beats, for cheap previews (stops before the edit; a subset cut isn't meaningful).

Generation failures (a flagged still, a model that needs swapping) have their moves in `production.md`'s failure modes; model defaults live in `gen/models.json`, never here.

When an asset exists but is bad, pick the fix by what went wrong:
- **The prompt/line was wrong** (the asset faithfully rendered a bad instruction): fix the instruction. On an unproduced draft, `npm run ads -- update-beat` with the fix (it re-plans the stale rows; the next generate remakes just those); on a produced ad that's a meaning change, so `declare-variant`.
- **The output is defective** (glitched video, mangled hand, mispronounced line; the instruction was fine): `npm run ads -- reroll '{"ad":"<slug>","kind":"still|video|vo|music","order":<n>}'`. Same ad, no variant: the bad take archives (the file renamed `.takeN`, its row and spend stay as history), a fresh planned row appears, and everything built from it re-plans too (the derived video, the final); status drops to idea, and the next generate regenerates just that. Works on idea and produced; refused on posted.
- **Only the cut is wrong** (assets all good, the assembly itself needs redoing): `npm run ads -- reroll '{"ad":"<slug>","kind":"final"}'` (no order). Archives just the final as a take and drops status to idea; the next generate re-assembles for $0, nothing regenerates. Render style (caption position, music volume, fades) is code, not board content: it lives in the vehicle's composition module (`assemble/compositions/<name>/editor.ts`), so a style change is a code edit followed by this reroll or `--redo-final`.

Never hand-delete asset rows, links, or files.

**Use a shelf asset on a beat:** `use-asset` links a reusable library asset (shop with `npm run ads -- shop`) into a beat's still or video position, or the ad's music, before generating; the engine then skips it and the estimate prices it $0. Idea-status only:

```bash
npm run ads -- use-asset '{"ad":"<slug>","order":<n>,"slot":"still|video|music","asset":"<name>"}'
```

(For NEW outside files, `insert-asset` registers them on the shelf first; shelf reuse then goes through use-asset so the guards check type + reusability.)

## 3: Verify the cut

Start with the receipt: `productions/<slug>/final/timeline.json` is the exact timeline that rendered (per-beat placements, durations, caption position, music level); read it first, then eyeball frames.

`productions/<slug>/final.mp4`: 9:16 (1080x1920), length ≈ the VO, captions baked in. To eyeball frames cheaply, extract + downscale before reading:

```bash
ffmpeg -y -v error -ss <t> -i productions/<slug>/final.mp4 -frames:v 1 -vf scale=360:-1 -q:v 12 /tmp/frame.jpg
```

The ad's status is now `produced` (the engine set it when the final landed); `npm run ads -- get-ad <slug>` shows the full ledger, and the operator can see it all on the board.

## 4: STOP for approval (the cut gate)

Hand the mp4 to the human. **Do not auto-proceed.** Posting is a separate human-triggered step (when Meta wiring exists, it ends with `npm run ads -- mark-posted '{"slug":"<slug>","metaAdId":"..."}'`, which refuses without the Meta ad id). Route a bad cut by what's wrong: a defective asset (the concept is fine, one output glitched) = `reroll` + re-generate, same ad; a weak cell (the concept needs a different hook/voice/visual) = `/ad-iterate <slug>`, a variant.

---

**Gotchas:**
- **Delivery decides each beat's clock.** A `narration` beat is VO-first (video sized to measured VO + breath). A `text` beat has no VO: footage leads, the line burns as captions at reading-time pacing. A `dialogue` beat plays the file's own audio: the words are IN the file (a referenced file's transcription is cached beside it; a dialogue beat with only a still generates a talking clip speaking its line). Editing a narration beat's `vo` still re-times its video; editing a text beat's line just re-paces captions.
- **The Never list is law at compose:** the voice is never cut or sped, the video never frozen/slowed/looped. A mismatch (footage shorter than its voice, dialogue on a silent file) REFUSES with the fix named; fix the draft, don't fight the engine.
- **Never bypass the engine to "fix" state.** If the board and disk disagree, the board is the truth; re-run generate. `npm run ads -- lint <slug>` sweeps for structural damage after any hand edits.
- Engine depth (stages, refusals, failure modes, money): `_docs/core-docs/production.md`; prompt fixes: `_docs/skill-reference/prompting-guide-2026.md`.
