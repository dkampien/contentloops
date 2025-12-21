# Implementation Plan v2: Bob Scenario PoC

## Overview
- **Objective:** Prove Tier 2 (Modular) architecture end-to-end: Synthetic Data → Kumo.ai → Multi-head Predictions → Config JSON → Visual Output.
- **Success Criteria:**
  1. Kumo successfully runs predictions on synthetic user/event data.
  2. Model outputs 3 prediction heads: Price Sensitivity, Offer Type, P(conversion).
  3. Bob test case returns expected predictions (High price sensitivity, Monthly offer, ~0.6-0.8 confidence).
  4. Config assembler produces valid JSON combining predictions + ad intent.
  5. HTML visualizer renders abstract paywall based on config.
- **Key Risks / Assumptions:**
  - Kumo free tier limits may constrain data size or query volume.
  - PQL syntax may require adjustments during implementation.
  - Synthetic correlations are hypotheses — not validated against real behavior.
- **Related Docs:**
  - `strategy-v3.md` — Strategy & Architecture (see §7 "Deep Link Reality" for production context)
  - `strategy-v3-funnel.md` — Funnel diagrams & metrics
  - `app_event_schema.md` — BCEvents Schema Reference (synthetic data mimics this)
- **PoC Scope Note:** This PoC uses topic-based ad scenarios ("Sleep Prayers") for demonstration clarity. Production ads are feature-based ("Lockscreen Widget"). ML architecture is identical — only input labels differ.

---

## Key Differences from v1

| Aspect | v1 (Old) | v2 (New) |
|--------|----------|----------|
| Topic | Predicted by ML | Input from ad intent |
| Prediction heads | Topic probabilities | Price Sensitivity, Offer Type, P(conversion) |
| Data schema | Invented events | BCEvents schema |
| Output | Probabilities per paywall | Config JSON with assembled attributes |

---

## Phase 0: Environment Setup (Keep from v1)

*Smoke test already passed. Kumo SDK works.*

### Step 0.1: Verify Environment `[✓]`
- **Status:** Complete
- **Deliverables:**
  - `requirements.txt`
  - `.env` with `KUMO_API_KEY`
  - `smoke_test.py` — passed

---

## Phase 1: Data Generation

### Step 1.1: Define BCEvents-Aligned Schema `[✓]`
- **Priority:** Critical
- **Task:** Define synthetic data schema matching real BCEvents.
- **Deliverables:**
  - `schemas/users_schema.json`
  - `schemas/events_schema.json`
- **Validation:** Schema files match BCEvents structure from `app_event_schema.md`.

**Users Schema:**
```json
{
  "user_id": "string (primary key)",
  "created_at": "datetime",
  "age": "string (13-17, 18-24, etc.)",
  "gender": "string (m/f)",
  "geography": "string (US, MX, BR, etc.)",
  "language": "string",
  "lifeChallenge": "string (anxiety, sleep, faith, etc.)",
  "last_ad_campaign": "string (sleep, anxiety, biblestudy, generic)"
}
```

**Events Schema:**
```json
{
  "event_id": "string (primary key)",
  "user_id": "string (foreign key)",
  "ts": "datetime",
  "event_type": "string (habitDone, askChatGPT, purchaseCompleted, etc.)",
  "category": "string (optional - for askChatGPT)",
  "price": "float (optional - for purchaseCompleted)",
  "offer_type": "string (optional - monthly/annual for purchaseCompleted)"
}
```

---

### Step 1.2: Build Data Generator `[✓]`
- **Priority:** Critical
- **Task:** Python script generating ~1,000 users with BCEvents-style histories.
- **Deliverables:**
  - `data_generator_v2.py`
  - `data/users.csv`
  - `data/events.csv`
- **Validation:**
  - CSVs generated with correct schema.
  - Correlations embedded (see below).

**Event Types to Generate:**
| Event Type | Signal For |
|------------|------------|
| `habitDone` | Engagement level |
| `askChatGPT` (with category) | Topic interest |
| `spiritualMeterDone` | Mood tracking behavior |
| `ahaBedtimeStories` | Sleep content engagement |
| `ahaGuidedBreathing` | Anxiety content engagement |
| `ahaBibleStudyGuides` | Bible study engagement |
| `purchaseCompleted` (with price, offer_type) | Transaction history |
| `paywallShown` | Exposure data |

**Embedded Correlations (Hypotheses):**
| Pattern | Expected Prediction |
|---------|---------------------|
| Low avg purchase price (<$15) | High price sensitivity |
| High avg purchase price (>$15) | Low price sensitivity |
| Past monthly purchases | Monthly offer preference |
| Past annual purchases | Annual offer preference |
| High engagement + purchase history | Higher P(conversion) |
| Dormant + no purchases | Lower P(conversion) |

**Test Users (Known Profiles):**
| User | Profile | Expected Predictions |
|------|---------|---------------------|
| Bob | Dormant 6mo, bought $9.99 monthly, sleep ad | High price sens, Monthly, ~0.6 P(conv) |
| Alice | Active, bought $59.99 annual, bible ad | Low price sens, Annual, ~0.8 P(conv) |
| Charlie | Medium activity, no purchases, anxiety ad | High price sens (default), Monthly (default), ~0.4 P(conv) |

---

### Step 1.3: Validate Data Quality `[✓]`
- **Priority:** High
- **Task:** Sanity checks on generated data.
- **Deliverables:**
  - `data_validator_v2.py`
- **Validation:**
  - No null primary keys.
  - Event timestamps within expected range.
  - Correlations detectable via simple analysis.
  - Bob, Alice, Charlie have expected characteristics.

---

## Phase 2: Kumo Prediction

### Step 2.1: Load Data into LocalGraph `[✓]`
- **Priority:** Critical
- **Task:** Load synthetic CSVs into pandas and create LocalGraph.
- **Deliverables:**
  - `kumo_predict_v2.py` (initial)
- **Validation:**
  - Graph created without errors.
  - Tables show correct row counts.

---

### Step 2.2: Define Prediction Queries `[✓]`
- **Priority:** Critical
- **Task:** Write PQL queries for each prediction head.
- **Deliverables:**
  - `kumo_predict_v2.py` (extended)
- **Validation:** Each query runs without error.

**Prediction Heads:**

| Head | Question | Query Approach |
|------|----------|----------------|
| Price Sensitivity | Is user price sensitive? (will only buy cheap) | Predict purchase with price < $15 |
| Offer Type | Will user purchase annual? | Predict purchase with offer_type = 'annual' |
| P(conversion) | Will user purchase at all? | Predict any purchaseCompleted event |

> **Logic check:** High `price_sens_prob` = user IS price sensitive = show LOW price tier. High `annual_prob` = user WILL buy annual = show ANNUAL offer.

> ⚠️ **Note:** Exact PQL syntax must be verified against Kumo documentation during implementation.

---

### Step 2.3: Run Predictions `[✓]`
- **Priority:** Critical
- **Task:** Run all 3 prediction queries and collect results.
- **Deliverables:**
  - `kumo_predict_v2.py` (complete)
  - `output/raw_predictions.csv`
- **Validation:**
  - Each query returns probabilities for all users.
  - Output has columns: `user_id`, `price_sens_prob`, `annual_prob`, `conversion_prob`

---

### Step 2.4: Validate Predictions `[✓]`
- **Priority:** High
- **Task:** Sanity check that predictions align with embedded correlations.
- **Deliverables:**
  - `output/prediction_analysis.md`
- **Validation:**
  - Users with low purchase history prices → higher `price_sens_prob`
  - Users with annual purchases → higher `annual_prob`
  - Bob, Alice, Charlie match expected predictions

---

## Phase 3: Config Assembly

### Step 3.1: Build Config Assembler `[✓]`
- **Priority:** High
- **Task:** Script that takes predictions + ad intent → config JSON.
- **Deliverables:**
  - `config_assembler.py`
- **Validation:**
  - Correct mapping of probabilities to categorical values.

**Assembly Logic:**
```
# Price Sensitivity
IF price_sens_prob > 0.5 → price_tier = "low"
ELSE → price_tier = "high"

# Offer Type
IF annual_prob > 0.5 → offer = "annual"
ELSE → offer = "monthly"

# Topic (from ad intent, NOT predicted)
topic = user.last_ad_campaign

# Confidence
confidence = conversion_prob
```

---

### Step 3.2: Generate Test Configs `[✓]`
- **Priority:** High
- **Task:** Run assembler for Bob, Alice, Charlie.
- **Deliverables:**
  - `output/configs/bob.json`
  - `output/configs/alice.json`
  - `output/configs/charlie.json`
- **Validation:**
  - JSON structure matches expected schema.
  - Values align with test user expectations.

**Expected Output (Bob):**
```json
{
  "user_id": "bob",
  "topic": "sleep",
  "price_tier": "low",
  "offer": "monthly",
  "confidence": 0.65
}
```

**Expected Output (Alice):**
```json
{
  "user_id": "alice",
  "topic": "biblestudy",
  "price_tier": "high",
  "offer": "annual",
  "confidence": 0.82
}
```

---

## Phase 4: Visualizer

### Step 4.1: Build Abstract Visualizer `[✓]`
- **Priority:** Medium
- **Task:** HTML/CSS page that renders paywall from config JSON.
- **Deliverables:**
  - `visualizer/index.html`
  - `visualizer/styles.css`
  - `visualizer/app.js`
- **Validation:**
  - Page loads without errors.
  - Displays correct visual based on config values.

**Visual Mapping:**
| Config Value | Visual |
|--------------|--------|
| `topic: sleep` | Purple/night background, "Rest in Peace" header |
| `topic: anxiety` | Blue/calm background, "Find Your Peace" header |
| `topic: biblestudy` | Brown/warm background, "Deepen Your Faith" header |
| `price_tier: low` | Shows "$9.99/month" |
| `price_tier: high` | Shows "$59.99/year" |
| `offer: monthly` | "Monthly" badge |
| `offer: annual` | "Annual" badge + "Save 50%" |

**Abstract Design:**
- Colored rectangles (not real images)
- Text labels showing config values
- Phone mockup frame (optional)

---

### Step 4.2: Multi-User Comparison View `[✓]`
- **Priority:** Low
- **Task:** Extend visualizer to show Bob vs Alice vs Charlie side-by-side.
- **Deliverables:**
  - Updated `visualizer/` files
- **Validation:**
  - Can compare 3 different configs visually.

---

## Demo Script

**How to run the Bob Scenario end-to-end:**

```bash
cd _projects/ml-poc

# 1. Generate synthetic data
python data_generator_v2.py

# 2. Validate data
python data_validator_v2.py

# 3. Run Kumo predictions
python kumo_predict_v2.py

# 4. Assemble configs
python config_assembler.py

# 5. View results
open visualizer/index.html
```

**Expected Results:**

| User | Topic (Input) | Price Tier | Offer | Confidence |
|------|---------------|------------|-------|------------|
| Bob | sleep | low | monthly | ~0.6 |
| Alice | biblestudy | high | annual | ~0.8 |
| Charlie | anxiety | low | monthly | ~0.4 |

---

## Completion Status

- **Phase 0 (Environment):** ✅ Complete
- **Phase 1 (Data Generation):** ✅ Complete
- **Phase 2 (Kumo Prediction):** ✅ Complete
- **Phase 3 (Config Assembly):** ✅ Complete
- **Phase 4 (Visualizer):** ✅ Complete

---

## Files to Create

| File | Phase | Purpose |
|------|-------|---------|
| `data_generator_v2.py` | 1 | Generate BCEvents-aligned synthetic data |
| `data_validator_v2.py` | 1 | Validate data quality |
| `kumo_predict_v2.py` | 2 | Run multi-head predictions |
| `config_assembler.py` | 3 | Combine predictions + intent → config |
| `visualizer/index.html` | 4 | Render abstract paywall |
| `visualizer/styles.css` | 4 | Styling |
| `visualizer/app.js` | 4 | Load config, render UI |

---

## Progress Updates

*(To be updated as work progresses)*
