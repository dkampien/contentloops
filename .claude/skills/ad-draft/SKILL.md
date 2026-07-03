---
name: ad-draft
description: Phase 1 (PLAN) of the BibleChat ad pipeline. Turn a rough idea into a fully authored ad on the Airtable board (the single source of truth), ready for production. ZERO spend; ends at the script approval gate. Use whenever the user wants to start a NEW ad, plan an ad, write an ad script, or turn an idea/insight/pain-point into an ad concept, even if they don't say "draft". Trigger phrases: "draft an ad", "new ad", "write an ad for", "ad about", "ad-draft". Not for: changing an existing ad (ad-iterate), rendering to mp4 (ad-produce), decomposing an outside ad (ad-watch).
argument-hint: <a rough idea, an audience, a pain point, or an existing ad's slug to sibling from>
allowed-tools: Read, Write, Edit, Bash
---

# ad-draft — PLAN: idea → an authored ad on the board (NO spend)

Draft ONE ad: pick the coordinate (who it's for, the pain, the feature, the angle, the form) and write the script, then land it on the board with one `create-ad` call. **Zero paid generation happens here.** Bulk planning = run the flow once per ad.

**User input:** $ARGUMENTS

## Where things live

- Run every command from `_projects/cloops-ads/` (the repo root).
- **Airtable is the single source of truth.** The base ("cloops-ads") is a live board the operator watches and hand-edits. There is no beats.json and no local backend. You read and write ONLY through the guarded client: `npm run ads -- <command> '<json>'`. Never the raw Airtable API and never the Airtable MCP; the client carries the guards.
- Preflight: `npm run ads -- pools`. Nothing to start; a failure usually means `AIRTABLE_TOKEN` is missing from `.env.local`.
- **Read fresh before you write.** The operator may have edited cells on the board since you last looked. `npm run ads -- look` lists what changed since your last look; a verb's read is always live. Never write from remembered state.
- **Command shapes:** link commands take `<entity>Slug` keys (`personaSlug`, `painSlug`, `mechanismSlug`). A bare `npm run ads` lists every command, and a wrong call errors with the expected shape.
- **Big payloads (create-ad):** copy contains apostrophes, which break single-quoted shell JSON. Write the payload to a file and pass it as `@<path>`: `npm run ads -- create-ad @/path/to/payload.json`.
- **Fixture data:** rows with a `smoke-` prefix are test fixtures, fake data for pipeline tests. Real values and real ads live on real rows; an ad linked to a fixture sits on made-up targeting.

## Invisible contract (how to talk to the operator, read this first)

The operator never needs to know the model. You reason with the full model internally (coordinate, variation/iteration, diegetic, the flow); what reaches the operator is plain.

- **Plain words only.** Say it in their words: who it's for · the angle · how it's told · a few versions · a tweak for later. The model's own vocabulary ("coordinate / targeting / variation / iteration / diegetic / changeSet / vehicle / slot fill") stays internal, in your reasoning.
- **Pick together.** Go through the elements one at a time: propose options with a recommendation, the operator picks. Skip an element only when the operator already gave it.
- **Print plainly.** At the approval gate, show the spoken lines + a one-line plain summary (who it's for · the angle · how it's told), not field names.

## Load context first (these carry the craft, do not re-derive it)

All under `_projects/cloops-ads/`:
1. `_docs/skill-reference/ad-copy-playbook.md`, CRAFT: Path A, the hook, the copy rules.
2. `_docs/skill-reference/audience-product-brief.md`, AUDIENCE: the worldview the copy speaks from.
3. `_docs/skill-reference/prompting-guide-2026.md`, PROMPTING: how to write t2i/i2v prompts (carries the {LOCK}/{STYLE} pattern).
4. `_docs/skill-reference/biblechat-features.md`, ONLY when reaching past the default mechanism or unsure a feature exists. **It is the product truth: a feature exists only if it's in there.**

The data shape needs no doc: the registries themselves are the checklists (read them, next section).

---

## The flow — run in order

> **Curator guardrail, applies to every pick-or-define step (persona · pain · mechanism · angle).** Before you create a new value: (1) **merge-check**: a flavor of an existing one (same felt thing / same demoable feature) → reuse or merge the existing one; (2) **distinctness**: keep it only if it would show on screen visibly differently from its siblings; (3) **glanceable handle**: name it for what it is in plain everyday words (`daily-plan`), plus a one-line definition. The database blocks duplicates by slug, but only YOU can catch a duplicate by meaning.

### 0. Read the box

```bash
npm run ads -- pools
```

Everything that exists: personas, pains, mechanisms, angles, vehicles, frameworks. You need to know what's there before you propose. Registries start sparse by design; growing them well is part of this skill.

### 1. PERSONA — pick or define

Show the existing personas + propose the fit (or one new). New personas must be **grounded in real evidence** (user research, reviews, the audience brief), and the `evidence` field cites the source: every audience traces back to something someone actually observed.

```bash
npm run ads -- upsert-persona '{"slug":"overwhelmed-mom","gender":"woman","age":"late 20s to early 40s","context":"...","awareness":"problem-aware","evidence":"audience-product-brief.md: ..."}'
```

### 2. PAIN — pick or define (keep it RAW)

Read this persona's pains and propose (to the operator, in plain words, per the invisible contract; "show" never means dumping table rows):

```bash
npm run ads -- pains-for-persona overwhelmed-mom
npm run ads -- link-persona-pain '{"personaSlug":"overwhelmed-mom","painSlug":"morning-overwhelm"}'
```

**Classify the pain: `universal` vs `faith-native`.** Keep universal pains raw (no faith line; that's the angle's job). A pain is the symptom she feels, never the resolution.

### 3. MECHANISM — default it (it's near-constant)

Mechanism is near-determined by the pain: default to the **habit-formation / daily-return feature** (daily plan, streak, journey); it's what M12 rewards. Reach past the default only when the moment itself is the story (panic-button, chat, bedtime stories for a nighttime pain). The honest test: **would the daily plan feel dishonest in the moment shown on screen?** If yes, pick the moment's feature, and read `biblechat-features.md` first. **Sell the outcome, prove with the feature**: copy leads with the benefit ("a calm two-minute start"); the feature is the on-screen proof. Link it: `npm run ads -- link-pain-mechanism '{"painSlug":"...","mechanismSlug":"..."}'`.

### 4. ANGLE — the lens (skip for faith-native pains)

**If the pain is faith-native, skip this step entirely**: the pain is its own angle, and `createAd` will reject an angle on it. For universal pains an angle is required. The angle is not a separate scene: **it renders as the hook**. Beat 1's copy IS the angle expressed.

**EXPLODE? (angle, the main fan-out point).** Offer plainly: try this pain from several angles? Each extra angle = a **variant of the first ad** (declared after step 8 via `declare-variant` with the new angle + a rewritten hook; see ad-iterate). Curate the angle records centrally first (no dupes by meaning).

### 5. FORM — vehicle · framework · format · length

```bash
npm run ads -- get-vehicle char-3p-drama
npm run ads -- get-framework classic
```

- **Vehicle** (how it's told): read its row BEFORE authoring; the `slots` array is your checklist and `perBeatSubSlots` your per-beat vocabulary. `char-3p-drama` = a character living the problem; `faceless-world` = reusable no-character visuals (each beat keeps the line's NOUNS + EMOTION, drops the narrative action; faceless people only); `parts-mix` = assembled from swappable parts (a real inserted hook + library beds + a generated close; no character, no narration).
- **Framework** (the copy arc): its `roles` are the only legal beat roles. Default `classic` (hook · symptom · solution · result · cta).
- **Template (check for one!):** `pools` lists templates; if the framework × vehicle pair you picked has one (e.g. `parts-mix-v1` = `hook-body-cta` × `parts-mix`), run `npm run ads -- get-template <slug>` and follow its `socketPolicy`, it says PER ROLE how the visual is filled (`generate` = write a t2i · `library` = reference a shelf asset · `insert` = reference a real inserted clip) and which word-home the line uses. The guards enforce it; a non-conforming create-ad is refused with the policy quoted.
- **Format** `video` (default) / `image` / `image-carousel`. **Length band** `micro`/`short`/`mid`/`long`: a creative form band, never a seconds target; exact timing is derived from the measured VO at production.

**EXPLODE? (vehicle).** Offer: tell this same story as other vehicles? Each = a variant declared after step 8 (new vehicle + rewritten visuals).

### 6. FILLS — the whole-ad slots the vehicle declares

For each slot in the vehicle's checklist, author the value:
- `character`: the one-sentence character lock (PROMPTING guide pattern). **Only if the vehicle declares it.**
- `treatment`: the one-sentence style bible (default claymation).
- `voice`: an ElevenLabs voice name (default `Rachel`; common male: `Adam`). **Must gender-match the character.**
- `music`: the music-bed prompt.
- `per-beat-visual` is on the checklist but is **never a slotFill**: it is satisfied by the beats themselves (every beat's `t2i` non-empty). `caption` is optional and auto-derives from the VO; skip it.

In beat prompts, write `{LOCK}` and `{STYLE}` where the character and treatment belong; production expands them from these fills, so a later swap changes every prompt at once.

### 7. BEATS — write the script (Path A)

**SHOP BEFORE YOU GENERATE.** Run `npm run ads -- shop` (filter: `'{"type":"clip","tags":["bed"]}'` or `'{"query":"..."}'`). If a shelf asset fits a beat, reference it with the beat's `"asset": "<its name>"` key instead of writing a t2i, a referenced beat costs $0 at production. Generate only what the shelf can't supply (and consider `promote-asset` afterward if the new clip passes the reuse test).

**Word-homes (per-beat `delivery` subSlot, in plain words):** how the line reaches the viewer. `voiced` = a narrator speaks it (today's default on voiced vehicles) · `text` = nobody speaks; the line appears as on-screen captions and the footage sets the timing · `sync` = the person IN the clip says it (real or generated talking head); the `vo` field then holds the transcript of what the file says. Only set the subSlot when deviating from the vehicle's default (or when a template's policy requires it).

Write the copy per CRAFT: raw pain in the hook (the angle expressed), symptom → solution on the real feature, talk like a real person. One beat per framework role (repeat a role for a longer band when the visuals genuinely differ). Each beat: `role`, `vo` (the spoken line), `t2i` (film still prompt; NEVER the word "storyboard", and no aspect words like "vertical", format is a generation parameter), `i2v` (motion only), `subSlots` (shape `[{"slot":"...","value":"..."}]`; only the per-beat vocabulary the vehicle declares, plus `title-card` on the CTA if wanted), optional `asset` (a shelf reference, above). **Never write a duration**; production sizes everything from the measured VO (voiced), the reading time (text), or the file itself (sync).

### 8. CREATE — one call, all or nothing

```bash
npm run ads -- create-ad '{
  "slug": "calm-morning-1",
  "persona": "overwhelmed-mom", "pain": "morning-overwhelm", "mechanism": "daily-plan",
  "angle": "permission-to-pause",
  "vehicle": "char-3p-drama", "framework": "classic", "format": "video", "length": "short",
  "slotFills": [
    {"slot": "character", "value": "Maria, an early-30s mother with ..."},
    {"slot": "treatment", "value": "Stop-motion claymation: ..."},
    {"slot": "voice", "value": "Rachel"},
    {"slot": "music", "value": "soft warm piano, hopeful"}
  ],
  "beats": [
    {"role": "hook", "vo": "...", "t2i": "Cinematic film still: {LOCK} ... {STYLE}", "i2v": "...", "subSlots": []},
    {"role": "cta", "vo": "...", "t2i": "...", "i2v": "...", "subSlots": [{"slot": "title-card", "value": "BibleChat"}]}
  ]
}'
```

The slug is kebab-case, human-glanceable, and permanent. Either the whole ad lands or nothing does. **Guard errors are written for you**: they name the missing slot, the illegal role, the unresolved slug, and what IS valid. Read the error, fix the call, retry; do not work around a guard.

**EXPLODE? (hooks).** Offer: bank several openers on this ad? Each = `declare-variant` with `changeSet: ["copy"]` and a hook `vo` edit (see ad-iterate for the shape). Declared variants cost nothing and wait as `idea`. **Seam rule:** each opener must hand cleanly into the fixed symptom line.

### 9. FEEDBACK GATE — stop for approval

Print the VO arc (the ordered spoken lines) + the plain summary (who it's for · the angle · how it's told · the look · the voice). **This is the no-spend approval gate.** Offer a redirect (whole arc / one line / a beat's visual / tone). Edits before production: fix in place with `update-beat` / `update-ad` (they work while the ad is still an idea and blank any stale assets), or `delete-ad` + re-create for a full redo. The operator may also just edit cells on the board; run `look`, read what changed, and carry on from the live state.

---

## VALIDATE before createAd (the guards catch structure; you catch sense)

- Pain classified universal vs faith-native; angle present only for universal (the guard enforces it, but know WHY: faith-native pains are their own angle).
- Voice gender-matches the character.
- Every beat prompt uses `{LOCK}`/`{STYLE}` rather than repeating the character/style text.
- The copy reads like a person talking, written for the band, never to a seconds target.

## Gotchas (learned the hard way, do not relearn)

- **NEVER faith-flavor a universal pain.** Path A: raw pain; faith lives in the angle and lands in the hook.
- **NEVER write "storyboard" in a t2i prompt**: the image model renders a literal multi-panel sheet. Say "film still".
- **A default female voice over a male protagonist sinks the ad.** Gender-match, always.
- **You are the curator.** The database blocks duplicate slugs; only you block duplicates by meaning (merge-check, distinctness, glanceable handle).
- **faceless-world discipline:** no identifiable faces (hands, silhouettes, from-behind); run the reuse test per beat (with the VO muted, would this clip sit under 5 other scripts' same-role lines?).
- **Shelf references are never invalidated by edits** (only re-referenced via `use-asset` or a new `asset` key on a variant); a voice or character change re-generates generated assets but leaves references alone.
- **Music can be referenced too:** `npm run ads -- use-asset '{"ad":"<slug>","slot":"musicAsset","asset":"<shelf track>"}'` after create; the music slotFill text is then just the fallback prompt.

## The hard gate

**NEVER start production yourself. Nothing auto-proceeds.** On human approval, print the literal next command:

```
/ad-produce <slug>
```
