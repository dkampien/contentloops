---
name: ad-draft
description: Phase 1 (PLAN) of the BibleChat ad pipeline. Turn a rough idea into a fully authored ad in Convex (the single source of truth), ready for production. ZERO spend; ends at the script approval gate. Use whenever the user wants to start a NEW ad, plan an ad, write an ad script, or turn an idea/insight/pain-point into an ad concept, even if they don't say "draft". Trigger phrases: "draft an ad", "new ad", "write an ad for", "ad about", "ad-draft". Not for: changing an existing ad (ad-iterate), rendering to mp4 (ad-produce), decomposing an outside ad (ad-watch).
argument-hint: <a rough idea, an audience, a pain point, or an existing ad's slug to sibling from>
allowed-tools: Read, Write, Edit, Bash
---

# ad-draft — PLAN: idea → an authored ad in Convex (NO spend)

Draft ONE ad: pick the coordinate (who it's for, the pain, the feature, the angle, the form) and write the script, then land it in Convex with one `createAd` call. **Zero paid generation happens here.** Bulk planning = run the flow once per ad.

**User input:** $ARGUMENTS

## Where things live

- Run every command from `_projects/cloops-ads/` (the Convex backend and repo root).
- **Convex is the single source of truth.** There is no beats.json, no Airtable. You read the registries with queries and write ads with mutations, all via `npx convex run <fn> '<json>'`.
- The local backend must be up. Preflight: `npx convex run registry:pools '{}'`. If the connection is refused, start it: `npx convex dev` (background) and retry.
- **Argument shapes:** upserts take `slug`; link mutations and relationship queries take `<entity>Slug` keys (`personaSlug`, `painSlug`, `mechanismSlug`). Unsure of any function's shape? `npx convex function-spec` lists every function with its validator, and a wrong call errors with the expected shape.
- **Fixture data:** rows with `smoke-` or `t1-` prefixes are test fixtures; never merge real values into them or link real ads to them.

## Invisible contract (how to talk to the operator, read this first)

The operator never needs to know the model. You reason with the full model internally (coordinate, variation/iteration, diegetic, the flow); what reaches the operator is plain.

- **Plain words only.** Never expose "coordinate / targeting / variation / iteration / diegetic / changeSet / vehicle / slot fill" in chat. Say it in their words: who it's for · the angle · how it's told · a few versions · a tweak for later.
- **Propose, don't interrogate.** From the operator's one-liner, infer and propose a full plan (who it's for · the pain · the feature · the angle · the look · the script) and ask them to confirm or redirect. Ask a real question only where it's genuinely ambiguous or high-stakes.
- **Lean on defaults** so most picks are silent: look = claymation, format = video, length = short, framework = classic, voice gender-matched, the habit-formation feature for the pain. Mention a default only when you change it or you're unsure.
- **Print plainly.** At the approval gate, show the spoken lines + a one-line plain summary (who it's for · the angle · how it's told), not field names.

## Load context first (these carry the craft, do not re-derive it)

All under `_projects/cloops-ads/`:
1. `_docs/skill-reference/ad-copy-playbook.md`, CRAFT: Path A, the hook, the copy rules.
2. `_docs/skill-reference/audience-product-brief.md`, AUDIENCE: the worldview the copy speaks from.
3. `_docs/skill-reference/prompting-guide-2026.md`, PROMPTING: how to write t2i/i2v prompts (carries the {LOCK}/{STYLE} pattern).
4. `_docs/skill-reference/biblechat-features.md`, ONLY when reaching past the default mechanism or unsure a feature exists. **Never invent a feature.**

The data shape needs no doc: the registries themselves are the checklists (read them, next section).

---

## The flow — run in order

> **Curator guardrail, applies to every pick-or-define step (persona · pain · mechanism · angle).** Before you create a new value: (1) **merge-check**: a flavor of an existing one (same felt thing / same demoable feature) → reuse or merge, never add; (2) **distinctness**: keep it only if it would show on screen visibly differently from its siblings; (3) **glanceable handle**: name it for what it is (`daily-plan`), not app jargon, plus a one-line definition. The database blocks duplicates by slug, but only YOU can catch a duplicate by meaning.

### 0. Read the box

```bash
npx convex run registry:pools '{}'
```

Everything that exists: personas, pains, mechanisms, angles, vehicles, frameworks. You need to know what's there before you propose. Registries start sparse by design; growing them well is part of this skill.

### 1. PERSONA — pick or define

Show the existing personas + propose the fit (or one new). New personas must be **grounded in real evidence** (user research, reviews, the audience brief), and the `evidence` field cites the source. Never invent an audience.

```bash
npx convex run registry:upsertPersona '{"slug":"overwhelmed-mom","gender":"woman","age":"late 20s to early 40s","context":"...","awareness":"problem-aware","evidence":"audience-product-brief.md: ..."}'
```

### 2. PAIN — pick or define (keep it RAW)

Read this persona's pains and propose (to the operator, in plain words, per the invisible contract; "show" never means dumping table rows):

```bash
npx convex run registry:painsForPersona '{"personaSlug":"overwhelmed-mom"}'
npx convex run registry:linkPersonaPain '{"personaSlug":"overwhelmed-mom","painSlug":"morning-overwhelm"}'
```

**Classify the pain: `universal` vs `faith-native`.** Keep universal pains raw (no faith line; that's the angle's job). A pain is the symptom she feels, never the resolution.

### 3. MECHANISM — default it (it's near-constant)

Mechanism is near-determined by the pain: default to the **habit-formation / daily-return feature** (daily plan, streak, journey); it's what M12 rewards. Reach past the default only when the moment itself is the story (panic-button, chat, bedtime stories for a nighttime pain). The honest test: **would the daily plan feel dishonest in the moment shown on screen?** If yes, pick the moment's feature, and read `biblechat-features.md` first. **Sell the outcome, prove with the feature**: copy leads with the benefit ("a calm two-minute start"); the feature is the on-screen proof. Link it: `registry:linkPainMechanism`.

### 4. ANGLE — the lens (skip for faith-native pains)

**If the pain is faith-native, skip this step entirely**: the pain is its own angle, and `createAd` will reject an angle on it. For universal pains an angle is required. The angle is not a separate scene: **it renders as the hook**. Beat 1's copy IS the angle expressed.

**EXPLODE? (angle, the main fan-out point).** Offer plainly: try this pain from several angles? Each extra angle = a **variant of the first ad** (declared after step 8 via `ads:declareVariant` with the new angle + a rewritten hook). Curate the angle records centrally first (no dupes by meaning).

### 5. FORM — vehicle · framework · format · length

```bash
npx convex run registry:getVehicle '{"slug":"char-3p-drama"}'
npx convex run registry:getFramework '{"slug":"classic"}'
```

- **Vehicle** (how it's told): read its row BEFORE authoring; the `slots` array is your checklist and `perBeatSubSlots` your per-beat vocabulary. `char-3p-drama` = a character living the problem; `faceless-world` = reusable no-character visuals (each beat keeps the line's NOUNS + EMOTION, drops the narrative action; faceless people only).
- **Framework** (the copy arc): its `roles` are the only legal beat roles. Default `classic` (hook · symptom · solution · result · cta).
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

Write the copy per CRAFT: raw pain in the hook (the angle expressed), symptom → solution on the real feature, talk like a real person. One beat per framework role (repeat a role for a longer band when the visuals genuinely differ). Each beat: `role`, `vo` (the spoken line), `t2i` (film still prompt; NEVER the word "storyboard", and no aspect words like "vertical", format is a generation parameter), `i2v` (motion only), `subSlots` (shape `[{"slot":"...","value":"..."}]`; only the per-beat vocabulary the vehicle declares, plus `title-card` on the CTA if wanted). **Never write a duration**; production sizes everything from the measured VO.

### 8. CREATE — one call, all or nothing

```bash
npx convex run ads:createAd '{
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

**EXPLODE? (hooks).** Offer: bank several openers on this ad? Each = `ads:declareVariant` with `changeSet: ["copy"]` and a hook `vo` edit (see ad-iterate for the shape). Declared variants cost nothing and wait as `idea`. **Seam rule:** each opener must hand cleanly into the fixed symptom line.

### 9. FEEDBACK GATE — stop for approval

Print the VO arc (the ordered spoken lines) + the plain summary (who it's for · the angle · how it's told · the look · the voice). **This is the no-spend approval gate.** Offer a redirect (whole arc / one line / a beat's visual / tone). Edits before production = fix and re-create (drop the slug, or use a `-2` slug; unproduced rows are cheap).

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

## The hard gate

**NEVER start production yourself. Nothing auto-proceeds.** On human approval, print the literal next command:

```
/ad-produce <slug>
```
