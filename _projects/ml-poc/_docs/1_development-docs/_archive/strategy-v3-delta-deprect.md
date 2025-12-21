# Strategy v3 — Delta (Dec 2025)

Updates and gaps identified after PoC completion.

---

## New Info (from team)

### Ad Strategy Shift
- **Was:** Topic-based ads ("Sleep Prayers", "Anxiety Relief")
- **Now:** Feature-based ads ("Lockscreen Widget")
- Lockscreen is current top performer
- No fixed December strategy — team is experimenting, revisiting old ads

### Pricing Reality
Strategy doc assumed binary High/Low. Reality is more complex:

| Product Tier | Weekly | Monthly | Yearly | One-time |
|--------------|--------|---------|--------|----------|
| Lite | - | $6.85 | - | - |
| Standard | $3.42 | - | - | - |
| Premium | $2.28-$6.85 | $4.57 | $34.24 | - |
| Elite | - | $22.85 | - | - |
| One-time | - | - | - | $18.28 |

Implications: "price_tier: high/low" in PoC is oversimplified.

### App Experience Control
Not just Adapty. Fragmented across:
- **Adapty** — paywall configs, placements
- **Firebase** — remote config, A/B tests
- **Hardcoded** — in-app logic
- **AdLoops** — App Store custom pages, deep link builder

### Deep Link Structure
Deep links are **task queues**, not simple metadata:

```json
{
  "tasks": [
    {"type": "webOnboarding", "match": ["uuid"]},
    {"type": "launchInAppOnboardingPlacement", "match": ["ios_lock_screen_widget_in_app"]},
    {"type": "onboarding", "match": ["chapters.widget.promoting.onboarding.v9_12"]},
    {"type": "trackCampaign", "match": ["campaign-name"]}
  ]
}
```

- Uses Singular (sng.link) for attribution/deep linking
- Same payload in `_dl`, `_ddl`, `_p` params (direct, deferred, passthrough)
- **This IS Tier 0** — deep link already dictates onboarding flow and placement

### Confirmed
- CAPI delay: ~30 min via AdLoops
- Trial → Paid: ~40% (US)

---

## Gaps Identified

### 1. Prediction Heads
**Current PoC heads:**
- Price Sensitivity (High/Low)
- Offer Type (Monthly/Annual)
- P(conversion)

**Missing:**
- What heads are actually most valuable?
- Given 7+ SKUs, is binary price_tier useful?
- What's actionable given real pricing complexity?

**Status:** Needs research

### 2. Synthetic Signal / pLTV
**In strategy doc:** Listed as "Prong 1" alongside Contextual Router

**Unclear:**
- Is pLTV still in scope or separate workstream?
- SKAN not well understood (vs CAPI)
- How does this relate to Contextual Router?

**Needed:** System diagram (App ↔ AdLoops ↔ CAPI ↔ Meta ↔ SKAN)

**Status:** Needs clarification

### 3. App Experience "Slots"
**Strategy doc mentions:** Paywall, onboarding

**Reality:** 21 placements defined in BibleChat codebase

**Missing:**
- What components can vary per placement?
- What's the "slot" model?
- How does Adapty placement concept map to this?

**Status:** Needs exploration

---

## Clarifications

### Deep Link is INPUT, Not Competitor
I overcomplicated this initially. The model is simple:

```
Ad Intent (deep link) ───┐
                         ├──→ ML ──→ Predictions ──→ Config
User History (BigQuery) ─┘
```

- **Tier 0:** Deep link alone drives experience
- **Tier 2:** Deep link + user history → ML → better predictions

Deep link provides the "hot" signal (what ad they clicked). ML combines it with "cold" signal (user history) to predict optimal config.

---

## Open Questions

1. Which placement(s) should ML target first?
2. How do Adapty/Firebase/hardcoded/AdLoops interact?
3. What parameters can actually vary per placement?
4. Is pLTV a separate workstream or integrated?
5. What prediction heads would move the needle on Paywall→Trial?

---

## Next Steps

- [ ] Review with team: Which gaps are highest priority?
- [ ] Decide: Update strategy-v3 or create v4?
- [ ] Research: Most valuable prediction heads
- [ ] Map: 21 placements and what can vary
