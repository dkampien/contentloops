---
name: ad-iterate
description: Phase 5 (ITERATE) of the BibleChat ad pipeline. Change an EXISTING ad without redrafting it: co-edit an unproduced draft in place (the operator edits board cells, you rewrite through the verbs), or derive copy-on-write variants: a new hook, a different voice or music, a restyled look, one beat's visual, a different angle or vehicle on the same story. Zero spend; realization routes through ad-produce. Use when an ad already exists (ours by slug, or an outside mp4 decomposed by ad-watch) and the user wants edits, another version, a variant, a batch of hooks, or to act on metrics. Triggers: "iterate on", "make a variant", "change the hook/voice/music/angle", "swap the look", "another cut of <slug>", "batch of hooks", "I edited the board". Not for: inventing a new ad from an idea (ad-draft), rendering (ad-produce), or restructuring the script arc (a new draft).
argument-hint: <an existing ad slug, or an outside mp4 path/URL> [what to change]
allowed-tools: Read, Write, Edit, Bash
---

# ad-iterate — change an existing ad (NO spend)

Two modes, picked by the ad's status:
- **Status `idea` (not yet produced): edit in place.** `update-ad` / `update-beat` rewrite the draft directly; no variant needed. Any stale assets blank automatically.
- **Status `produced`/`posted`: declare children.** Same ad, one or a few cells changed, via `declare-variant`. Declaring is free and instant; the child copies its parent's beats and **keeps the parent's produced assets wherever nothing changed**, so realizing it later spends only on the changed cells.

This skill edits, declares, and routes; all spend happens in `ad-produce` behind its gate.

**User input:** $ARGUMENTS

Run from `_projects/cloops-ads/`; every read/write goes through `npm run ads -- <command>` (never the raw API or MCP).

## The co-edit loop (the operator is on the board)

The Airtable base is a live board the operator watches and edits by hand. When they say they changed something (or you suspect it): `npm run ads -- look` lists everything edited since your last look. Read the changed rows, respond to the *content* (better line? gender mismatch? cascade cost?), and write back through the verbs. **Never write from remembered state; read fresh first.** After any hand-edit session, `npm run ads -- lint <slug>` sweeps for broken structure the board could not block.

## Variation vs iteration (you reason in it; the operator never hears it)

Both are one verb here (`declare-variant`); the database derives the kind from what changed:
- **Iteration**: realization-only changes (a hook line, voice, music, one beat's visual). Cheap laps on the same concept.
- **Variation**: a coordinate pick changes (angle, persona, pain, mechanism, vehicle, format, length). A sibling concept, bigger reach.

**What does NOT fit a variant** (route to a fresh `ad-draft` instead): a different **framework** (the arc's roles change, which rewrites the script) or restructuring the beats (adding/removing/reordering). **The seam test decides edge cases:** if the new opener flows into the existing body, it's a hook variant; if the body must be rewritten to fit, it's a new draft.

## Talk to the operator plainly

Not "diegetic / changeSet / cell". Say: a new hook · a different voice · swap the music · change how beat 2 looks · same story told without the character. **Name the cost in plain terms before declaring**: the verb's response tells you exactly what will be regenerated (below), and `npm run ads -- estimate <slug>` prices it; read those out, never guess.

## The flow

### 1. Get the base

- **Ours:** `npm run ads -- get-ad <slug>`. Note its status (`idea` = edit in place; `produced`/`posted` = declare a child) and its beats (order + role + vo).
- **Outside mp4/URL:** invoke the **ad-watch** skill first to decompose it into a spec, then draft OUR version of it via ad-draft (an outside ad has no board row to child from). Iterate only works on our rows.

### 2. Pick the change; know its cost class

The cost is mechanical, by what kind of slot changes:

| change | class | what regenerates |
|---|---|---|
| voice | execution, whole-ad | all VO + all clips (clips are sized to the VO) |
| music | execution, whole-ad | the music bed only |
| a beat's vo line | copy | that beat's VO + its clip |
| a beat's visual (t2i/i2v/subSlots) | diegetic, per-beat | that beat's still + clip |
| **swap a PART (re-reference a shelf asset)** | diegetic, per-beat | **nothing, a relink is $0** |
| character / treatment / anchor | diegetic, whole-ad | every GENERATED still + clip (the cascade) |
| angle / persona / pain / mechanism | concept | whatever copy/visual edits express it |
| vehicle / format / length | concept | every GENERATED still + clip |

Gender rule survives every change: **voice and character must stay gender-matched**.

**The parts exception (load-bearing):** shelf REFERENCES (assets linked from the library) are never blanked by any cascade, blanking means "regenerate", and references were never generated. They change only by explicit re-reference. So on a parts-mix ad, "try a different hook" or "different bed under beat 2" is a $0 swap: in place via `use-asset` (idea status), or on a child via the beat edit's `"asset": "<shelf name>"` key with `changeSet: ["per-beat-visual"]`. `shop` lists what's on the shelf.

### 3a. Edit in place (status `idea` only)

```bash
npm run ads -- update-beat '{"ad":"calm-morning-1","order":0,"vo":"the new opener line"}'
npm run ads -- update-ad '{"slug":"calm-morning-1","voice":"Adam"}'
```

`update-beat` takes `vo`/`t2i`/`i2v`/`subSlots`; `update-ad` takes the whole-ad fills (`character`/`treatment`/`voice`/`music`/`caption`) plus `anchor`/`notes`. Both blank any stale assets and report what they blanked. Coordinate picks (persona/pain/vehicle/...) are NOT editable in place: that is a different concept, so it is `declare-variant` or `delete-ad` + re-draft.

### 3b. Declare a child (produced/posted parents, or banking options)

```bash
npm run ads -- declare-variant '{
  "parent": "calm-morning-1",
  "slug": "calm-morning-1-hook2",
  "changeSet": ["copy"],
  "edits": { "beats": [ {"order": 0, "vo": "the new opener line"} ] }
}'
```

- `edits` shapes: `picks` (any coordinate dim, by slug), `slotFills` (merged by slot name), `anchor`, `beats` (sparse, addressed by `order`; each may change `vo`, `t2i`, `i2v`, `subSlots`).
- **`changeSet` must declare exactly what actually differs**, from the vocabulary the error lists (the 8 coordinate dims, the slot names, `anchor`, `copy`). Structural fallout counts: switching to a faith-native pain auto-drops the angle, so declare `["pain","angle"]`. If you mis-declare, the guard error lists the true diff set; copy it and retry.
- The response returns `blanked` counts (stills/clips/voAssets/music), your cost readout. Follow with `npm run ads -- estimate <child-slug>` for dollars.
- Declared children sit at `status: idea` costing nothing. **Batching is the point**: declare several hooks at once (each its own child; hold everything else fixed so the batch tests ONE cell), but keep the batch divergent, near-identical variants cannibalize each other's reach.

### 4. Plan, or realize now?

- **Plan:** stop here. The variants wait as ideas. This is how you bank a hook batch before committing.
- **Realize:** needs the parent **produced** (assets to reuse) and crosses the spend gate. Print the plain summary (what changes, what it re-makes, the estimate) and the literal command for the human:

```
/ad-produce <child-slug>
```

**Metrics-driven picks (when Meta data exists):** weak 2s/6s views → the hook; weak mid-watch → the body beats; weak CTR → the cta. Read the metric, point at the cell, declare the batch.

## Gotchas

- **Never generate, never write files, never start ad-produce yourself.** Declare and route.
- **A posted ad is immutable**; its children are the way forward.
- **Don't re-send unchanged values** in edits: the guard treats declared-but-identical as a lie ("nothing actually differs"). Send only the deltas.
- **A vehicle switch auto-drops fills the new vehicle doesn't declare, but NOT per-beat subSlots**; if the guard rejects a beat's subSlots against the new vehicle, edit those beats in the same call.
- Depth on the why-split and batch thinking: `_docs/core-docs/03_variation-and-iteration.md` (mind any drift banners).
