---
name: ad-watch
description: Reverse-engineer a real, finished AD into a beats.json spec. Takes an ad creative (video OR image, a local file or URL), decomposes it scene-by-scene (ffmpeg scene cuts + a caption/Whisper transcript for video; the image itself for stills), reads the on-screen copy, and writes a beats.json with per-beat visual slots, the real script, measured durations, and an inferred targeting coordinate. Use whenever you have a competitor ad or one of our renders and want to break down HOW it is built, to seed a draft or feed iteration. Triggers: "break down this competitor ad", "decompose / reverse-engineer this video", "what's the hook and structure of this ad", "watch this ad and pull the beats", or a path/URL to an ad creative. Do NOT use for: study notes or summaries of lectures / tutorials / talks (use claude-watch); plain transcription with no decomposition; building a new ad from the result (use ad-draft); or rendering one of our ads to mp4 (use ad-produce).
argument-hint: "<ad video/image path or URL> [namespace: competitor/<advertiser> | ours/<ad-id>]"
allowed-tools: Bash, Read, Write, AskUserQuestion
license: MIT
user-invocable: true
---

# ad-watch — turn a real ad into a beats.json spec

You are reverse-engineering a real ad. The output is a **decomposition**, not a production: a `beats.json` that captures what the ad *did* so a draft can borrow its scaffolding or an iteration can tweak it. The spec is stored under `watch/`; it never ships by itself.

**User input:** $ARGUMENTS

## What you produce
One `beats.json` per ad (`source: "watched"`), following `templates/beats.watched.template.json`. The important idea: each beat carries **two layers**:
- a structured **`visual` slot object** (`setting · activity · camera · light · expression · props · on_screen_text`) , the source of truth for the diegetic variables. The set of keys *is* the vehicle's template, so different vehicles grow different slots over time.
- a **`t2i`/`i2v` reconstruction** , what you would write to regenerate a lookalike shot. This keeps the spec usable by today's produce pipeline, which reads t2i/i2v.

Plus the **real copy** , the spoken VO if the ad speaks, or the burned-in captions if it does not (you decide which; never invent a line), the **measured `duration`** (from the timestamps), a best-effort **`role`**, and an **inferred, partial `coordinate`** (we are guessing the advertiser's targeting from the outside, so leave a field empty rather than fabricate).

**Do not assume every ad has a voiceover.** A large share of social ads carry the whole script in **burned-in captions** over a music bed, with no spoken narration. The skill decides the copy source from the evidence; it never assumes.

## Why partial and inferred
We cannot know a competitor's real persona/pain/angle. We can only read off what is observable: the vehicle, the look, the length, the beat arc, the hook technique, the rough audience. Mark `coordinate._inferred: true` and leave anything you are guessing at empty rather than dressing up a guess as fact. The honest scaffolding is what a draft actually reuses.

---

## Step 1 , figure out the input type and namespace

**Input type** decides the path:
- **video** (`.mp4 .mov .webm`, or a URL) , run the decompose pipeline (Step 2A).
- **image** (`.jpg .png .webp`) , skip the pipeline; read the image directly (Step 2B).
- **image-carousel** (several images) , Step 2B, one beat per image.

**Namespace** decides where the output lands. If the user gave one (`competitor/<advertiser>` or `ours/<ad-id>`), use it. If not, infer from the source path (a file already under `watch/competitor/deepstash/source/` belongs to `competitor/deepstash`) or ask once with `AskUserQuestion`. Output goes to:
```
watch/<namespace>/decomposed/<slug>/
```

## Step 2A , VIDEO: run the decompose pipeline

Preflight once (silent on success; installs ffmpeg/yt-dlp, scaffolds the Whisper key):
```bash
python3 "${CLAUDE_SKILL_DIR}/scripts/setup.py" --check || python3 "${CLAUDE_SKILL_DIR}/scripts/setup.py"
```
If a Whisper key is still missing, use `AskUserQuestion` (Groq preferred, cheaper/faster; OpenAI fallback). Without one, run `--no-whisper`; an ad with no captions comes back frames-only and you transcribe the VO yourself from the frames if you can.

Run the pipeline, **tuned for short ads** (they cut fast and run short, so we want dense coverage):
```bash
python3 "${CLAUDE_SKILL_DIR}/scripts/watch.py" "<source>" \
  --out-dir "<abs path to watch/<namespace>/decomposed>" \
  --max-gap 4 --scene-threshold 0.25
```
- `--max-gap 4` , a coverage frame at least every 4s, so even a single-take ad yields several frames (the default 45 is built for lectures).
- `--scene-threshold 0.25` , a touch more sensitive than the 0.30 default, to catch softer ad cuts. Raise it if you get too many near-duplicate frames.

The script prints a `=== frames ===` block (paths + timestamps) and points at `transcript.json`. **Read every frame in parallel** (they render as images) and **read the transcript**. These two are your evidence.

## Step 2B , IMAGE: read it directly

No ffmpeg, no transcript. **Read the image file(s).** For a single image, that is one beat. For a carousel, one beat per image, in order. The on-image text (headline, CTA, captions) goes into `visual.on_screen_text` and stands in for VO (`vo: null`). `duration: null` , a still has no runtime.

## Step 3 , write the beats.json (the synthesis)

Scaffold then fill:
```bash
cp "${CLAUDE_SKILL_DIR}/templates/beats.watched.template.json" "<out-dir>/<slug>/beats.json"
```

**First, decide the copy source (do NOT assume VO).** Weigh both the transcript and the frames:
- **Validate the transcript.** A real VO transcript tracks the runtime with actual sentences. A lone generic line over many seconds (a single `"Thanks for watching!"` across a 16s ad, or a repeated `"you"`) is a **Whisper hallucination** on non-speech audio , discard it; the ad has no VO.
- **Read the burned-in captions off the frames.** In UGC and social ads the script is text on screen (TikTok-style captions), invisible to Whisper. Read it from the frames in order.
- Set `coordinate.copy_source`: `vo` (genuine narration), `captions` (text-on-screen carries the message), `both` (spoken + captions, often mirrored), or `none` (pure visual/music). This decides where each beat's copy goes.

Fill it from the evidence:
- **One beat per scene** (video) or per image (carousel). Map each to a `role` on our arc (hook/symptom/solution/result/cta) when it fits; use `shot-1`, `shot-2` when it does not. Keep roles unique. For caption-driven ads, let the **caption changes** drive the beat boundaries (a new caption is usually a new beat), not just the visual cuts.
- **`visual` slots** , describe what is actually on screen, slot by slot. Add a slot key the vehicle clearly needs and the template lacks (this is how vehicle templates grow); do not force content into a slot that does not fit.
- **`t2i` / `i2v`** , write the reconstruction prompts as if briefing produce to remake this shot. Follow the prompting guide: "film still" never "storyboard"; i2v describes motion only. For an image, leave `i2v` empty.
- **copy** , for a VO ad, put the spoken line in `vo`; for a caption ad, put the on-screen text in `visual.on_screen_text` and leave `vo` null; for both, fill both (note if the caption mirrors the VO). Lightly clean; never invent a line that is not actually spoken or shown.
- **`duration`** , the measured seconds this beat spans (next scene's start minus this scene's start; the last beat runs to the end).
- **`coordinate`** , read off vehicle, format, length (from total duration), treatment/look, voice, music. Infer persona/pain/mechanism/angle only if the ad makes them obvious; otherwise leave empty. Keep `_inferred: true`.

## Step 4 , report

Print a short summary to chat:
1. The ad (title/source) + the slug + namespace.
2. Vehicle · length · beat count · transcript source (captions / whisper / none).
3. The path to the `beats.json`.
4. One line on what is reusable here (the proven scaffolding a draft could borrow).

Do **not** delete the decomposition directory , it is the artifact.

---

## The boundary (do not cross)
- **This is research, not a production.** Never write into `productions/` and never touch Convex's content tables. A watched spec becomes a real ad only when a human runs `ad-draft`, which reads this file and authors the ad in Convex (`ads:createAd`), citing this decomposition's path in the ad's `notes` as provenance.
- **Discovered templates may grow the registry.** If the decomposition reveals a genuinely new vehicle (a telling-structure none of the `vehicles` rows cover), propose it to the human; on approval, add it with `registry:upsertVehicle` (slots from the slot library, per-beat sub-slots from what you observed). Merge-check first: a flavor of an existing vehicle is not a new vehicle.
- **Never invent VO or targeting.** An empty field is an honest gap; a fabricated line poisons the learning loop.

## Failure modes
- **Setup preflight non-zero** , run `setup.py`, then ask for a Whisper key via `AskUserQuestion`.
- **No transcript** (script prints `transcript_source: none`) , decompose frames-only; the copy is almost certainly in the captions, read it off the frames.
- **Whisper hallucination** (a short, generic transcript over a long ad, e.g. a lone "Thanks for watching!") , treat as no VO; set `copy_source` to `captions` and read the script from the burned-in text. Common for music-bed social ads.
- **Too many near-duplicate frames** , re-run with a higher `--scene-threshold` (0.35+).
- **Sparse coverage on a long-take ad** , lower `--max-gap` (2-3).
- **Whisper failure** , retry with `--whisper openai` (if Groq failed) or vice versa.

## Re-runs
The pipeline caches the download, transcript, and scenes by source hash; only frames + the synthesis regenerate. To force a full re-run, delete `<out-dir>/<slug>/meta.json` first.

## Notes for later (not built yet)
- **Schema-discovery / aggregate mode:** watching many winners should crystallize the per-vehicle `visual` slot templates. For now each watch fills slots ad-hoc; revisit once we have a batch of decompositions.
- **Short-ad Python defaults:** the tuned flags above live in the invocation, not the script. If every ad uses the same values, fold them into `watch.py` defaults in this fork.
