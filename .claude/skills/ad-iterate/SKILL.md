---
name: ad-iterate
description: Phase 5 (ITERATE) of the BibleChat ad pipeline. Change an EXISTING ad without redrafting it: co-edit an unproduced draft in place (the operator edits board cells, you rewrite through the verbs), or derive copy-on-write variants: a new hook, a different voice or music, a restyled look, one beat's visual, a shelf-file swap. A concept change (new angle, persona, pain, or vehicle on the same story) is triaged here too: the script work runs draft-style, then lands here as a child of the parent. Zero spend; realization routes through ad-produce. Use when an ad already exists (ours by slug, or an outside mp4 decomposed by ad-watch) and the user wants edits, another version, a variant, a batch of hooks, or to act on metrics. Triggers: "iterate on", "make a variant", "change the hook/voice/music/angle", "swap the look", "another cut of <slug>", "batch of hooks", "I edited the board". Not for: inventing a new ad from an idea (ad-draft) or rendering (ad-produce).
argument-hint: <an existing ad slug, or an outside mp4 path/URL> [what to change]
allowed-tools: Read, Write, Edit, Bash
---

# ad-iterate: change an existing ad (NO spend)

Two modes, picked by the ad's status:
- **Status `idea` (not yet produced): edit in place.** `update-ad` / `update-beat` rewrite the draft directly; no variant needed. Stale rows re-plan automatically (superseded takes archive, fresh planned rows appear, the verb reports them).
- **Status `produced`/`posted`: declare children.** Same ad, one or a few cells changed, via `declare-variant`. Declaring is free and instant; the child copies its parent's beats and **keeps the parent's produced assets wherever nothing changed**, so realizing it later spends only on what changed. A child can also be declared on an `idea` parent, to bank options without touching it.

This skill edits, declares, and routes; all spend happens in `ad-produce` behind its gate.

**User input:** $ARGUMENTS

Run from `_projects/cloops-ads/`; every read/write goes through `npm run ads -- <command>` (never the raw API or MCP).

## The co-edit loop (the operator is on the board)

The Airtable base is a live board the operator watches and edits by hand. When they say they changed something (or you suspect it): `npm run ads -- look` lists everything edited since your last look. Read the changed rows, respond to the *content* (better line? gender mismatch? cascade cost?), and write back through the verbs (a hand-edited cell doesn't re-plan its files; re-sending it through the verb does). **Never write from remembered state; read fresh first.** After any hand-edit session, `npm run ads -- lint <slug>` sweeps for broken structure the board could not block.

## Variation vs iteration (the routing rule)

Both kinds of child land through one verb (`declare-variant`); the database derives the kind from the changeSet:

- **Iteration**: the concept untouched; execution changes (a hook line, voice, music, one beat's visual, a shelf-file swap). This skill handles it end to end.
- **Variation**: a concept pick changes. A new pick rewrites the script through its new lens, and script work is draft's craft: run the script conversation draft-style (ad-draft's steps and its approval gate), then land it here as a child of the parent.

**The structural line (mechanical, from the verb itself):** a variant keeps the parent's beat structure; the verb patches beats one-for-one and cannot add, remove, or re-role them. Any change that breaks the structure (a different framework, a longer band that adds beats, restructuring the arc) is a fresh `ad-draft`, not a variant: when an ask crosses that line, say so in plain words and propose the fresh draft yourself. Winning footage still carries over: `promote-asset` puts it on the shelf, and the new draft references it at $0. **The seam test decides the hook edge:** a new opener that flows into the existing body is a hook iteration; one that forces the body to be rewritten is a new draft.

## Talk to the operator plainly

Not "changeSet / in-the-pixels / re-plan". Say: a new hook · a different voice · swap the music · change how beat 2 looks · same story told without the character. **Name the cost in plain terms before declaring**: the verb's response splits the child's sheet into `inherited` (free, reused from the parent) and `planned` (to buy), and `npm run ads -- estimate <child-slug>` prices the planned; read those out, never guess.

## The flow

### 1. Get the base

- **Ours:** `npm run ads -- get-ad <slug>`. Note its status (`idea` = edit in place; `produced`/`posted` = declare a child) and its beats (order + role + vo + visual).
- **Outside mp4/URL:** invoke **ad-watch** first: it decomposes the ad and lands it on the board like any authored ad (borrowed files as sheet rows, inferred picks). Changes then route through this skill normally. Decompose first, then offer changes; never offer a change menu for an ad that isn't decomposed yet.

### 2. Pick the change; know its cost

The cost is mechanical, by what kind of cell changes (this is the iteration side; a concept change is a variation and routes per the rule above):

| change | stamp | what re-plans |
|---|---|---|
| voice | on-top, whole-ad | all VO + the videos sized to it |
| music | on-top, whole-ad | the music bed only |
| a beat's `vo` line | copy, per-beat | that beat's VO + its video |
| a beat's `visual` | in-the-pixels, per-beat | that beat's still + video |
| **swap a shelf reference** | reference, per-beat | **nothing; a relink is $0** |
| character / treatment / anchor | in-the-pixels, whole-ad | every GENERATED still + video (the cascade) |

The gender rule survives every change: **voice and character must stay gender-matched**.

**A defect is a reroll, never a variant.** When an asset came out wrong (a glitched video, a mangled hand, a mispronounced line) and nothing about the ad's meaning changes, `declare-variant` will refuse it (nothing differs, and the guard calls a no-diff declaration a lie). Route to `npm run ads -- reroll '{"ad":"<slug>","kind":"still|video|vo|music","order":<n>}'` (a bad FINAL cut is ad-produce's redo, not an asset defect): the bad take archives (the file renamed `.takeN`, its row and spend stay as history), a fresh planned row appears, everything built from it re-plans too, and re-producing regenerates just that. Same ad, same slug, no child.

**The reference exception (load-bearing):** shelf REFERENCES are never touched by any cascade: re-planning means "regenerate", and references were never generated. They change only by explicit re-reference. So on a reference-mix ad, "try a different hook clip" or "a different bed" is a $0 swap: in place via `use-asset` (idea status), or on a child via the beat edit's `"asset": "<shelf name>"` key (it folds into the `copy` changeSet). `shop` lists what's on the shelf.

### 3a. Edit in place (status `idea` only)

```bash
npm run ads -- update-beat '{"ad":"calm-morning-1","order":0,"vo":"the new opener line"}'
npm run ads -- update-ad '{"slug":"calm-morning-1","voice":"Adam"}'
```

`update-beat` takes `vo`/`visual`/`delivery`/`prompts` (still, motion); `update-ad` takes the whole-ad fills (`character`/`treatment`/`voice`/`music`) plus `anchor`/`notes`. Both re-plan any stale rows and report them. Concept picks (persona/pain/vehicle/...) are NOT editable in place: that is a variation; route per the rule above.

### 3b. Declare a child (any parent status; banking options is normal)

```bash
npm run ads -- declare-variant '{
  "parent": "calm-morning-1",
  "slug": "calm-morning-1-hook2",
  "changeSet": ["copy"],
  "edits": { "beats": [ {"order": 0, "vo": "the new opener line"} ] }
}'
```

- `edits` shapes: `picks` (any concept dim, by slug), `slotFills` (merged by slot name), `anchor`, `beats` (sparse, addressed by `order`; each may change `vo`, `visual`, `delivery`, `prompts`, `asset`).
- **`changeSet` must declare exactly what actually differs**, from the vocabulary the error lists (the 8 concept dims, the four fills `character`/`treatment`/`voice`/`music`, `anchor`, `copy`). Structural fallout counts: switching to a faith-native pain auto-drops the angle, so declare `["pain","angle"]`. If you mis-declare, the guard error lists the true diff set; copy it and retry.
- The response returns the child's `sheet` split: `inherited` (free, reused from the parent) and `planned` (to buy). Follow with `npm run ads -- estimate <child-slug>` for dollars.
- Declared children sit at `status: idea` costing nothing. **Batching is the point**: declare several hooks at once (each its own child; hold everything else fixed so the batch tests ONE cell), but keep the batch divergent, near-identical variants cannibalize each other's reach.

### 4. Plan, or realize now?

- **Plan:** stop here. The variants wait as ideas. This is how you bank a hook batch before committing.
- **Realize:** crosses the spend gate. No precondition on the parent: a child of an unproduced parent simply has nothing to inherit, and the estimate prices accordingly. Print the plain summary (what changes, what it re-makes, the estimate) and the literal command for the human:

```
/ad-produce <child-slug>
```

**Metrics-driven picks (when Meta data exists):** weak 2s/6s views → the hook; weak 25%/50% watch-through → the body beats; weak CTR → the cta. Read the metric, point at the cell, declare the batch.

## Gotchas

- **Never generate, never write files, never start ad-produce yourself.** Declare and route.
- **A posted ad is immutable**; its children are the way forward.
- **Don't re-send unchanged values** in edits: the guard treats declared-but-identical as a lie ("nothing actually differs"). Send only the deltas.
- **A vehicle switch re-checks the fills** against the new vehicle's checklist; the guard names anything missing or illegal, fix the fills in the same call.
