# ad-watch

**Forked from `claude-watch`** (MIT, https://github.com/devinilabs/claude-watch) and adapted for the BibleChat ad pipeline.

`claude-watch` turns a video into study notes. `ad-watch` reuses its decompose pipeline (ffmpeg scene detection + frame extraction + Whisper/caption transcript, in `scripts/`, unchanged) but swaps the final synthesis: instead of markdown notes, it writes a `beats.json` spec that reverse-engineers a real ad (competitor or our own).

- **Operational instructions:** see `SKILL.md`.
- **Output schema:** see `templates/beats.watched.template.json`.
- **Where outputs live:** `<repo>/watch/<namespace>/decomposed/<slug>/` (see `watch/README.md`).
- **Also handles images** (single + carousel), which skip the video pipeline entirely.

The Python in `scripts/` is a verbatim fork; only `SKILL.md` + the template are new. If the decompose pipeline needs short-ad tuning baked in (vs passed as flags), edit `scripts/watch.py` here in the fork.
