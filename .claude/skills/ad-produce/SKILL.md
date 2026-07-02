---
name: ad-produce
description: Phase 2 (GENERATE) of the BibleChat ad pipeline. Turn an authored ad (a Renders row on the Airtable board, status idea) into a finished 9:16 mp4 via the one-verb realize engine. Spend is GATED behind a dry-run estimate. Use whenever an ad's script is approved and someone wants the actual video made, phrased as render, produce, generate, realize, build, or "make the video for <slug>". Trigger phrases: "produce the ad", "realize <slug>", "render this ad", "generate the video", "ad-produce". Not for: writing the script (ad-draft) or changing an existing ad (ad-iterate).
argument-hint: <ad slug>
allowed-tools: Bash, Read, Edit
---

# ad-produce — GENERATE: realize an ad → mp4 (💲 gated)

Make an approved ad real. The engine reads the ad from the Airtable board, and **the blanks are the work order**: whatever assets are missing get generated, whatever exists is reused. A fresh ad generates everything; a variant generates only its changed cells. Same command either way.

**User input (ad slug):** $ARGUMENTS

Run from `_projects/cloops-ads/`. Nothing to start; the board is remote and every finished file is recorded on it the moment it lands.

## 1 — Dry-run: the spend gate

```bash
npm run realize -- <slug> --dry-run
```

Prints the work plan (which stills/VO/clips/music are missing) and the estimated cost. **Read it to the human in plain words and wait for their go.** This is the only spend gate; nothing after it blocks except the final cut review.

## 2 — Realize

```bash
npm run realize -- <slug>
```

Stage order is dependency-driven and automatic: stills + one-pass VO first, then each clip sized to its beat's measured VO + a breath, then music, then compose (gapped VO + auto-captions) and the Remotion assemble. Every finished file is recorded on the board immediately, so **an interrupted or failed run resumes by re-running the same command**, already-recorded assets are never re-spent.

Knobs, when needed:
- `--stop-after=stills` or `--stop-after=clips`: mid-run checkpoint to eyeball assets before continuing (re-run without the flag to continue; nothing regenerates).
- `FALLBACK=1 npm run realize -- <slug>`: photoreal treatments; the default i2v model blocks realistic-face input stills (E005), the fallback model accepts them. Claymation needs no flag.
- `T2V=1`: text-to-video, no input stills at all (last resort for blocked content; fixed SEED for rough consistency).

To force-regenerate a specific asset that exists but is bad: on an UNPRODUCED draft, `npm run ads -- update-beat` with the fixed prompt (it blanks the stale asset, and the next realize remakes just that); on a produced ad, `declare-variant` (a new cut, the honest path). Never hand-delete asset rows or links.

**App bridge (show the real app on a beat):** record the bridge clip as that beat's clip BEFORE realizing; realize then skips generating it:

```bash
npm run ads -- record-beat-asset '{"ad":"<slug>","order":<n>,"kind":"clip","location":"productions/app-bridges/<asset>.mp4"}'
```

## 3 — Verify the cut

`productions/<slug>/final.mp4`: 9:16 (1080x1920), length ≈ the VO, captions baked in. To eyeball frames cheaply, extract + downscale before reading:

```bash
ffmpeg -y -v error -ss <t> -i productions/<slug>/final.mp4 -frames:v 1 -vf scale=360:-1 -q:v 12 /tmp/frame.jpg
```

The ad's status is now `produced` (the engine set it when the final landed); `npm run ads -- get-ad <slug>` shows the full ledger, and the operator can see it all on the board.

## 4 — STOP for approval (the cut gate)

Hand the mp4 to the human. **Do not auto-proceed.** Posting is a separate human-triggered step (when Meta wiring exists, it ends with `npm run ads -- mark-posted '{"slug":"<slug>","metaAdId":"..."}'`, which refuses without the Meta ad id). A bad cut routes to `/ad-iterate <slug>` (swap the weak cell as a variant).

---

**Gotchas:**
- **VO-first, end to end.** There are no authored durations anywhere; clips and the cut are sized from the measured VO + breath. That is why VO exists before clips and why editing a beat's VO always re-times its clip.
- **Never bypass the engine to "fix" state.** If the board and disk disagree, the board is the truth; re-run realize. `npm run ads -- lint <slug>` sweeps for structural damage after any hand edits.
- **Voiceless beats are not composable yet** (compose will say so); every beat needs a VO line today.
- Engine depth (models, params, failure modes): `_docs/core-docs/04_pipeline-engine.md` (mind its drift banner); prompt fixes: `_docs/skill-reference/prompting-guide-2026.md`.
