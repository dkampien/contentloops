---
name: ad-draft
description: Phase 1 (PLAN) of the BibleChat ad pipeline. Turn a rough idea into a fully authored ad on the Airtable board (the single source of truth), ready for production. ZERO spend; the board is written only on the operator's approval. Use whenever the user wants to start a NEW ad, plan an ad, write an ad script, or turn an idea/insight/pain-point into an ad concept, even if they don't say "draft". Trigger phrases: "draft an ad", "new ad", "write an ad for", "ad about", "ad-draft". Not for: changing an existing ad (ad-iterate), rendering to mp4 (ad-produce), decomposing an outside ad (ad-watch).
argument-hint: <a rough idea, an audience, a pain point, or an existing ad's slug to sibling from>
allowed-tools: Read, Write, Edit, Bash
---

# ad-draft: idea → an authored ad on the board (NO spend)

Draft ONE ad: pick who it's for, the pain, the feature, the angle, and the form; write the script; then land it on the board in one sweep. No money is spent in this phase. If the user asks for several ads, run the flow once per ad.

**User input:** $ARGUMENTS

## How this skill runs (read first)

- **Decide, then land.** Steps 0 to 7 are conversation: read the board, propose, the operator picks. The board gets written only at the LAND step, after the operator approves what you proposed. Drafts iterate in the conversation, not on the board.
- **One pick at a time.** Each step ends with a proposal and a recommendation, then stops for the operator's pick. Skip a step's question only when the operator's input already answered it.
- **One vehicle per session.** A drafting session works one vehicle (several ads on it is fine). When a different vehicle comes up mid-session, land the current work and recommend a fresh session: an agent holding two vehicles' variable sets cross-contaminates them.

## Where things live

- Run every command from `_projects/cloops-ads/` (the repo root).
- **The ad lives on the Airtable board** (base "cloops-ads"), which the operator watches and may hand-edit live. Read and write ONLY through the guarded client: `npm run ads -- <command> '<json>'`. The raw Airtable API and the Airtable MCP bypass the guards; the client carries them, and its errors are written for you to self-correct.
- Preflight: `npm run ads -- pools`. A failure usually means `AIRTABLE_TOKEN` is missing from `.env.local`.
- **Read fresh before you act.** The operator may have edited cells since you last looked; `npm run ads -- look` lists what changed. Propose from live state, not remembered state.
- **Command shapes:** link commands take `<entity>Slug` keys (`personaSlug`, `painSlug`, ...). A bare `npm run ads` lists every command, and a wrong call errors with the expected shape.
- **Big payloads:** ad copy contains apostrophes, which break single-quoted shell JSON. Write the payload to a file and pass it as `@<path>`: `npm run ads -- create-ad @/path/to/payload.json`.
- **Real rows only:** rows prefixed `smoke-` are test fixtures with made-up data; link ads to real rows.

## The contract with the operator

**The machinery stays invisible; the craft language is shared.** The operator is a creative strategist: talk persona, pain, angle, hook, look, voice. The system's internal logic (variation vs iteration, cost classes, changeSets, guards) is yours to reason with and never theirs to operate: they make creative calls, you translate to mechanics and report back only the consequences that matter (what it costs, what gets remade). When a pick is on the table, remind the operator what the thing means in one line (context = the circumstance, pain = the felt symptom, angle = the lens).

## Load the craft (it is not re-derived, it is loaded)

All under `_projects/cloops-ads/`:
1. `_docs/skill-reference/ad-copy-playbook.md`: how to write the copy (Path A, the hook, the rules).
2. `_docs/skill-reference/audience-product-brief.md`: who we sell to, and the worldview the copy speaks from.
3. `_docs/skill-reference/prompting-guide-2026.md`: how to write t2i/i2v prompts (the {LOCK}/{STYLE} pattern and the prompt rules).

The product truth for features is the **Mechanisms table on the board**: a feature exists only if it is a row there, or the operator explicitly approves adding one.

## The shape of an ad (the vocabulary you author with)

- **Slot**: a named setting the VEHICLE declares; the ad fills it by writing a value (character, treatment, voice, music).
- **Socket**: a per-role position a TEMPLATE constrains; filled by plugging footage in (generated, or referenced from the library).
- **Shelf**: the reusable asset library (`productions/library/`); what sockets browse.

In one line: the vehicle declares the slots, the template (when the framework × vehicle pair has one) constrains the sockets, and the beats fill everything.

---

## The flow

> **Curator guardrail, wherever a NEW registry value is proposed (persona, pain, mechanism, angle).** The guards refuse incomplete rows and duplicate slugs; only you can catch a duplicate by MEANING. Merge-check against the existing rows first (same felt thing, same feature: reuse or merge), and name the value in plain everyday words with a one-line definition. Know the trap: upserting an existing slug silently edits that row for every ad linking to it, so send an existing slug only when you mean to edit it.

### 0. Read the board

```bash
npm run ads -- pools
```

Every registry that exists: personas, pains, mechanisms, angles, vehicles, frameworks, templates. Know what is there before you propose. Growing the registries well is part of this skill.

### 1. PERSONA: pick

Show the existing personas and propose the fit. **Picking is the normal path**: personas are defined upfront, grounded in evidence, and locked. Defining a new one mid-draft is the rare exception; it needs real evidence (user research, reviews, the audience brief) cited in its `evidence` field, and the operator's explicit go-ahead. Stop; the operator picks.

### 2. PAIN: pick, or distill from evidence

Read this persona's pains (`npm run ads -- pains-for-persona <slug>`) and propose plainly.

- **A pain is the felt symptom**: what it feels like from the inside on a bad Tuesday, written the way the person would say it. Source material (quiz answers, reviews) usually describes a SITUATION ("my marriage is broken"); distill the feelings inside it (the guilt, the fear, the loneliness): each is a pain candidate, and the verbatim quote is its `evidence`.
- **Classify, with your reasoning shown:** `universal` (anyone could feel it; keep the wording raw, the faith lens arrives later via the angle) or `faith-native` (the pain itself is faith-shaped and is its own angle).
- **EXPLODE offer:** a persona usually carries several pains; offer running more than one, each as its own ad.

Stop; the operator picks.

### 3. MECHANISM: default it

Default to the **habit-formation feature** (daily plan / personalized plans); the default stands without a stop. Reach past the default only when the moment itself is the story (a panic moment, a sleepless night). The honest test: **would the daily plan feel dishonest in the moment shown on screen?** If yes, pick the moment's feature from the Mechanisms table. Stop only when proposing a mechanism that is not yet on the board; the operator decides. **Sell the outcome, prove with the feature**: the copy leads with the benefit ("a calm two-minute start"); the feature is the on-screen proof.

### 4. ANGLE: the lens (universal pains only)

A faith-native pain is its own angle: skip this step, and know the guard refuses an angle on it. For a universal pain an angle is required, and it is not a separate scene: **the angle renders as the hook; beat 1's copy IS the angle expressed.**

Angle rows are the shared lens pool, written **persona-neutral**: define the move without a persona's pronouns baked in ("permission to stop, instead of another demand"), plus one example hook line so the row is navigable (an expression of the lens, not the expression). Let reuse emerge; merge duplicates on contact.

**EXPLODE offer:** try this pain from several angles? Each extra angle = a variant of this ad, declared after landing (see ad-iterate).

Stop; the operator picks.

### 5. FORM: vehicle · framework · format · length

The vehicles ON THE BOARD are the menu; the skill carries no catalog. Read the picked vehicle's row before authoring anything:

```bash
npm run ads -- get-vehicle <slug>
npm run ads -- get-framework <slug>
```

Its `description` is the form's own guidance, its `slots` array is your fills checklist, `perBeatSubSlots` your per-beat vocabulary, `delivery` the words' default home.

- **Vehicle** (how the story is told): match the operator's ask against the existing vehicles' descriptions. When nothing fits, say so plainly: that is a NEW form, and defining a vehicle is its own explicit, operator-gated move (`upsert-vehicle`), never a silent side effect of drafting.
- **Framework** (the copy arc): its `roles` are the only legal beat roles.
- **Template:** some framework × vehicle pairs have a template row that dictates, per role, how the visual is filled (`generate` / `library` / `insert`) and how the words are delivered. If your pair has one (`pools` lists them; `npm run ads -- get-template <slug>`), author to it: the guards enforce it and refuse a non-conforming ad with the policy quoted.
- **Format:** `video` / `image` / `image-carousel`. Only `video` has an engine path today; an image ad can be drafted but not yet produced.
- **Length band:** `micro`/`short`/`mid`/`long`. A creative form band, never a seconds target (real timing derives from the words at production). The band decides the beat structure: a longer band repeats roles.

Stop; the operator picks the form.

### 6. FILLS: author what the vehicle declares

For each slot on the vehicle's checklist, author a value with the operator. **There are no house defaults**: every fill is authored for this ad (look at sibling ads when the operator wants continuity). The craft that holds across vehicles:

- Where the vehicle declares a `character`: write the one-sentence character lock, and pick a `voice` that **gender-matches it**. Where it declares a `treatment`: the one-sentence style bible.
- In beat prompts, write `{LOCK}` and `{STYLE}` where the character and treatment belong; production expands them from the fills, so one swap restyles every prompt at once.
- `per-beat-visual` is satisfied by the beats themselves, never authored as a fill. `caption` auto-derives from the words; skip it unless the operator wants a style override.

### 7. BEATS: write the script

**The beats are the script: the framework's roles instantiated.** One beat per role, in order (classic = hook · symptom · solution · result · cta); a longer band repeats roles where the visuals genuinely differ.

Write the copy per the playbook: the raw pain in the hook (the angle expressed), symptom to solution on the real feature, talk like a real person, written for the band. Each beat carries:

- `role`: one of the framework's roles.
- `vo`: THE WORDS, always, whatever their delivery.
- `t2i`: the image prompt, per the prompting guide, with `{LOCK}`/`{STYLE}` placeholders.
- `i2v`: motion only.
- `subSlots`: only from the vehicle's per-beat vocabulary, plus `delivery` (the word-home override), which every vehicle accepts.
- **Never author a duration.** Production sizes everything from the words' home: the measured VO when voiced, the reading time when text, the file itself when sync.

**Word-homes** (the per-beat `delivery` subSlot), when a template or the operator calls for a deviation from the vehicle's default: `voiced` = a narrator speaks the line · `text` = the line appears as on-screen captions · `sync` = the person in the clip says it (the `vo` then holds the transcript).

**Referenced footage:** where the template's policy says `library` or `insert` for a role, the beat references a file instead of generating: `npm run ads -- shop` browses the shelf, and the beat's `"asset": "<name>"` key links it (a reference costs $0 at production, and later edits never invalidate it).

### 8. THE GATE: validate, print, stop

First validate (the guards catch structure; you catch sense):
- The pain classification is actually right: universal wording stays raw; a faith-native pain carries no angle.
- **The angle is audible in beat 1**: read the hook against the angle's definition.
- Where a character exists: the voice gender-matches it, and every beat prompt carries `{LOCK}`/`{STYLE}` instead of repeating the text.
- The copy reads like a person talking, written for the band.

Then print the script for the operator: the ordered lines, each with how it reaches the viewer (spoken / on-screen / said in the clip), plus the plain summary: who it is for · the angle · how it is told · the look · the voice.

**STOP. This is the approval gate. Nothing is written and nothing proceeds without the operator's explicit yes.** Offer a redirect: the whole arc, one line, a beat's visual, the tone.

### 9. LAND: one sweep, all the writes

Only after approval does the board get touched, in one sweep:

1. The registry upserts and links the settled picks need: `upsert-persona` / `upsert-pain` / `upsert-angle` / `upsert-mechanism`, then `link-persona-pain`, `link-pain-mechanism`.
2. `create-ad`: the whole ad in one call; either everything lands or nothing does.

Registry writes land one by one; `create-ad` is the atomic call. If `create-ad` fails after the upserts, nothing needs undoing: the rows are settled, approved values, and the fixed retry links straight to them.

```json
{
  "slug": "<kebab-case, human-glanceable, permanent>",
  "persona": "<persona slug>", "pain": "<pain slug>", "mechanism": "<mechanism slug>",
  "angle": "<angle slug; universal pains only>",
  "vehicle": "<vehicle slug>", "framework": "<framework slug>",
  "format": "video", "length": "<band>",
  "slotFills": [
    {"slot": "<a slot the vehicle declares>", "value": "<the authored fill>"}
  ],
  "beats": [
    {"role": "<a framework role>", "vo": "<the line>", "t2i": "<prompt with {LOCK}/{STYLE}>", "i2v": "<motion>", "subSlots": []},
    {"role": "<the cta role>", "vo": "<the line>", "t2i": "<...>", "i2v": "<...>", "subSlots": []}
  ]
}
```

**Guard errors are written for you**: they name the missing slot, the illegal role, the unresolved slug, and what IS valid. Read the error, fix the call, retry; never work around a guard.

**EXPLODE offer (hooks):** bank several openers on the landed ad? Each is a `declare-variant` with `changeSet: ["copy"]` and a new hook `vo` (see ad-iterate); each opener must hand cleanly into the fixed symptom line. Declared variants cost nothing and wait as ideas.

After landing, edits while the ad is still an `idea` go through `update-ad` / `update-beat` (they blank stale work automatically and report it). The operator may also edit board cells directly: run `look`, read what changed, and carry on from live state.

**Production never starts from this skill.** On approval and landing, print the literal next command for the human:

```
/ad-produce <slug>
```
