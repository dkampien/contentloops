# Implementation Plan: Bob Scenario PoC

## Overview
- **Objective:** Prove the ML pipeline works end-to-end: Synthetic Data → Kumo.ai → Multi-head Predictions → Config JSON → Visual Output.
- **Success Criteria:**
  1. Kumo successfully runs predictions on synthetic user/event data.
  2. Model outputs probabilities for Topic (Sleep/Anxiety/BibleStudy) and Purchase.
  3. Bob test case returns expected predictions (Sleep topic, High price sensitivity, Calm vibe).
  4. HTML visualizer renders the predicted config.
- **Key Risks / Assumptions:**
  - Kumo free tier limits may constrain data size or query volume.
  - PQL syntax may require adjustments during implementation.
  - Synthetic correlations are hypotheses — not validated against real behavior.
- **Related Docs:**
  - `@_docs/ml_problem_docs-v2/strategy-v2.md` (Strategy & Technical Decisions)
  - `@_docs/ml_problem_docs/app_event_schema.md` (BCEvents Schema Reference)

---

## Technical Decisions

### Kumo SDK Path
- **Use `KumoRFM` + `LocalGraph`** — works with pandas DataFrames directly, no S3/cloud storage needed.
- **Import pattern:**
  ```python
  from kumoai.experimental.rfm import LocalGraph, KumoRFM
  ```
- **No multi-PREDICT** — run separate queries per prediction head, combine results.
- **No PROB() function** — use `COUNT(...) > 0` for binary classification (outputs probability 0.0-1.0).

### Prediction Heads
| Head | Query Pattern | Output |
|------|---------------|--------|
| Topic (Sleep) | `PREDICT COUNT(events.*, 0, 30, days) > 0 ... WHERE events.event_type = 'ahaBedtimeStories'` | Probability |
| Topic (Anxiety) | `PREDICT COUNT(events.*, 0, 30, days) > 0 ... WHERE events.event_type = 'ahaGuidedBreathing'` | Probability |
| Topic (Bible Study) | `PREDICT COUNT(events.*, 0, 30, days) > 0 ... WHERE events.event_type = 'ahaBibleStudyGuides'` | Probability |
| Purchase | `PREDICT COUNT(events.*, 0, 30, days) > 0 ... WHERE events.event_type = 'purchaseCompleted'` | Probability |

### Derived Attributes
- **Topic:** argmax(sleep_prob, anxiety_prob, biblestudy_prob)
- **Price Sensitivity:** Based on historical purchase price patterns (not just purchase_prob)
- **Vibe:** Derived from Topic (Sleep→Calm, BibleStudy→Traditional, Anxiety→Calm)

---

## Phase 0: Kumo Smoke Test (De-risking)

*Goal: Validate Kumo SDK works before investing in full data generation.*

### Step 0.1: Environment Setup `[ ]`
- **Priority:** Critical
- **Task:** Install Kumo SDK, configure API key, verify basic import works.
- **Deliverables:**
  - `poc/requirements.txt`
  - `.env` with `KUMO_API_KEY` (gitignored)
  - `poc/smoke_test.py`
- **Step Dependencies:** None
- **Validation:**
  ```python
  import kumoai
  from kumoai.experimental.rfm import LocalGraph, KumoRFM
  print("Import successful")
  ```
- **Open Questions:**
  - What's the exact API key format and base URL?
  - Is `kumoai.init()` required for RFM path?
- **Implementation Notes:** Check Kumo dashboard for API key.

### Step 0.2: Tiny DataFrame Test `[ ]`
- **Priority:** Critical
- **Task:** Create minimal 5-user, 20-event DataFrame. Test if `LocalGraph.from_data()` works.
- **Deliverables:**
  - `poc/smoke_test.py` (extended)
- **Step Dependencies:** Step 0.1
- **Validation:**
  ```python
  import pandas as pd
  from kumoai.experimental.rfm import LocalGraph, KumoRFM

  users_df = pd.DataFrame({
      'user_id': [1, 2, 3, 4, 5],
      'created_at': pd.date_range('2024-01-01', periods=5)
  })
  events_df = pd.DataFrame({
      'event_id': range(20),
      'user_id': [1,1,1,2,2,2,3,3,3,3,4,4,4,4,4,5,5,5,5,5],
      'ts': pd.date_range('2024-01-01', periods=20, freq='D'),
      'event_type': ['habitDone']*10 + ['ahaBedtimeStories']*10
  })
  graph = LocalGraph.from_data({'users': users_df, 'events': events_df})
  print("Graph created:", graph)
  ```
- **Open Questions:**
  - Does `LocalGraph.from_data()` auto-infer links via `user_id`?
  - Any errors without API connection?
- **Implementation Notes:** If this fails, pivot to Full SDK with `upload_table()`.

### Step 0.3: Basic PQL Query Test `[ ]`
- **Priority:** Critical
- **Task:** Run a simple binary classification query on the tiny dataset.
- **Deliverables:**
  - `poc/smoke_test.py` (extended)
- **Step Dependencies:** Step 0.2
- **Validation:**
  ```python
  rfm = KumoRFM(graph)
  query = "PREDICT COUNT(events.*, 0, 30, days) > 0 FOR EACH users.user_id"
  result = rfm.predict(query)
  print(result)  # Should show user_id + probability
  ```
- **Open Questions:**
  - Does RFM require API call for predict()?
  - What's the output format (DataFrame? Dict?)?
  - Any rate limits on free tier?
- **Implementation Notes:** This is the critical go/no-go gate.

### Step 0.4: Smoke Test Decision Gate `[ ]`
- **Priority:** Critical
- **Task:** Document findings and decide path forward.
- **Deliverables:**
  - `poc/SMOKE_TEST_RESULTS.md`
- **Step Dependencies:** Steps 0.1-0.3
- **Validation:** Document answers to:
  1. Does KumoRFM work with local DataFrames? (Yes/No)
  2. Is API key required? (Yes/No)
  3. What's the output format?
  4. Any errors or limitations discovered?
- **Open Questions:** None - this step answers them.
- **Implementation Notes:**
  - If RFM works → Proceed with Phase 1-4 as planned
  - If RFM fails → Pivot to Full SDK with `upload_table()` + `FileUploadConnector`
  - If both fail → Escalate / seek Kumo support

---

## Phase 1: Data Generation

### Step 1.1: Define Synthetic Data Schema `[ ]`
- **Priority:** Critical
- **Task:** Define the exact columns and data types for `users.csv` and `events.csv` based on BCEvents schema.
- **Deliverables:**
  - `poc/schemas/users_schema.json`
  - `poc/schemas/events_schema.json`
- **Step Dependencies:** Phase 0 complete
- **Validation:** Schema files exist and match BCEvents structure.
- **Open Questions:** None
- **Implementation Notes:**

  **Users Schema:**
  ```json
  {
    "user_id": "string (primary key)",
    "created_at": "datetime",
    "age": "string (13-17, 18-24, etc.)",
    "gender": "string (m/f)",
    "preferredTopics": "string (comma-separated)",
    "lifeChallenge": "string",
    "longestStreak": "int",
    "dayDone7Days": "int",
    "last_ad_context": "string (sleep/anxiety/biblestudy/generic)"
  }
  ```

  **Events Schema:**
  ```json
  {
    "event_id": "string (primary key)",
    "user_id": "string (foreign key)",
    "ts": "datetime (time column)",
    "event_type": "string",
    "category": "string (optional, for askChatGPT)",
    "price": "float (optional, for purchaseCompleted)"
  }
  ```

### Step 1.2: Build Synthetic Data Generator `[ ]`
- **Priority:** Critical
- **Task:** Python script that generates ~1,000 synthetic users with realistic event histories and embedded correlations.
- **Deliverables:**
  - `poc/data_generator.py`
  - `poc/data/users.csv`
  - `poc/data/events.csv`
- **Step Dependencies:** Step 1.1
- **Validation:**
  - CSVs generated with correct schema.
  - Correlations are visible (e.g., users with nighttime habits have more `ahaBedtimeStories` events).
- **Open Questions:** None
- **Implementation Notes:**

  **Embedded Correlations (Hypotheses):**
  - Nighttime `habitDone` events + high `spiritualMeterDone` → more `ahaBedtimeStories` events (Sleep topic)
  - `askChatGPT` with category="anxiety" → more `ahaGuidedBreathing` events (Anxiety topic)
  - `askChatGPT` with category="bible" → more `ahaBibleStudyGuides` events (Bible Study topic)
  - Low historical `price` on `purchaseCompleted` events → High price sensitivity
  - High historical `price` on `purchaseCompleted` events → Low price sensitivity

  **Ad Context Signal:**
  - Include `last_ad_context` column in users table to simulate deep link intent
  - Bob's `last_ad_context` = "sleep" (simulating he clicked a Sleep Prayers ad)

  **Special Test Users:**
  - **Bob:** Dormant 6 months, nighttime reader, mood tracker, `last_ad_context`="sleep" → Expected: Sleep topic, High price sensitivity
  - **Alice:** Active, Bible study heavy, `last_ad_context`="biblestudy" → Expected: Bible Study topic, Low price sensitivity
  - **Charlie:** Anxiety chat patterns, `last_ad_context`="anxiety" → Expected: Anxiety topic

### Step 1.3: Validate Data Quality `[ ]`
- **Priority:** High
- **Task:** Quick sanity checks on generated data before sending to Kumo.
- **Deliverables:**
  - `poc/data_validator.py` (or notebook)
- **Step Dependencies:** Step 1.2
- **Validation:**
  - No null primary keys.
  - Event timestamps are within expected range.
  - Distribution of event types looks reasonable.
  - Correlations are detectable via simple analysis.
  - Bob, Alice, Charlie have expected characteristics.
- **Open Questions:** None
- **Implementation Notes:** Can be a simple script or Jupyter notebook.

---

## Phase 2: Kumo Integration

### Step 2.1: Load Data into LocalGraph `[ ]`
- **Priority:** Critical
- **Task:** Load synthetic CSVs into pandas and create LocalGraph.
- **Deliverables:**
  - `poc/kumo_graph.py`
- **Step Dependencies:** Step 1.2
- **Validation:**
  - Graph created without errors.
  - Tables show correct row counts.
- **Open Questions:** None
- **Implementation Notes:**
  ```python
  import pandas as pd
  from kumoai.experimental.rfm import LocalGraph, KumoRFM

  users_df = pd.read_csv('data/users.csv')
  events_df = pd.read_csv('data/events.csv')

  # Ensure datetime columns are parsed
  users_df['created_at'] = pd.to_datetime(users_df['created_at'])
  events_df['ts'] = pd.to_datetime(events_df['ts'])

  graph = LocalGraph.from_data({
      'users': users_df,
      'events': events_df
  })
  ```

### Step 2.2: Define Predictive Queries (PQL) `[ ]`
- **Priority:** Critical
- **Task:** Write separate PQL queries for each prediction head.
- **Deliverables:**
  - `poc/kumo_queries.py`
- **Step Dependencies:** Step 2.1
- **Validation:** Each query validates successfully via `rfm.predict()`.
- **Open Questions:**
  - Exact WHERE clause syntax for filtering by event_type.
- **Implementation Notes:**

  **Queries to implement:**
  ```python
  # Query 1: Sleep propensity
  q_sleep = """
  PREDICT COUNT(events.*, 0, 30, days) > 0
  FOR EACH users.user_id
  WHERE events.event_type = 'ahaBedtimeStories'
  """

  # Query 2: Anxiety propensity
  q_anxiety = """
  PREDICT COUNT(events.*, 0, 30, days) > 0
  FOR EACH users.user_id
  WHERE events.event_type = 'ahaGuidedBreathing'
  """

  # Query 3: Bible Study propensity
  q_biblestudy = """
  PREDICT COUNT(events.*, 0, 30, days) > 0
  FOR EACH users.user_id
  WHERE events.event_type = 'ahaBibleStudyGuides'
  """

  # Query 4: Purchase propensity
  q_purchase = """
  PREDICT COUNT(events.*, 0, 30, days) > 0
  FOR EACH users.user_id
  WHERE events.event_type = 'purchaseCompleted'
  """
  ```

### Step 2.3: Run Predictions `[ ]`
- **Priority:** Critical
- **Task:** Run all 4 prediction queries and collect results.
- **Deliverables:**
  - `poc/kumo_predict.py`
  - `poc/output/raw_predictions.csv`
- **Step Dependencies:** Step 2.2
- **Validation:**
  - Each query returns probabilities for all users.
  - Output DataFrame has columns: `user_id`, `sleep_prob`, `anxiety_prob`, `biblestudy_prob`, `purchase_prob`
- **Open Questions:**
  - Does RFM path require explicit training or is it zero-shot?
- **Implementation Notes:**
  ```python
  rfm = KumoRFM(graph)

  results = {}
  for name, query in [('sleep', q_sleep), ('anxiety', q_anxiety),
                      ('biblestudy', q_biblestudy), ('purchase', q_purchase)]:
      results[name] = rfm.predict(query)

  # Merge into single DataFrame
  combined = results['sleep'].rename(columns={'prediction': 'sleep_prob'})
  combined['anxiety_prob'] = results['anxiety']['prediction']
  combined['biblestudy_prob'] = results['biblestudy']['prediction']
  combined['purchase_prob'] = results['purchase']['prediction']

  combined.to_csv('output/raw_predictions.csv', index=False)
  ```

### Step 2.4: Validate Prediction Quality `[ ]`
- **Priority:** High
- **Task:** Sanity check that predictions make sense given synthetic data correlations.
- **Deliverables:**
  - `poc/output/prediction_analysis.md`
- **Step Dependencies:** Step 2.3
- **Validation:**
  - Users with sleep-related history have higher `sleep_prob`.
  - Bob's predictions align with expected values.
  - No all-zeros or all-ones predictions (model learned something).
- **Open Questions:** None
- **Implementation Notes:** Simple analysis — spot check Bob, Alice, Charlie.

---

## Phase 3: Config Assembly

### Step 3.1: Build Prediction Interpreter `[ ]`
- **Priority:** High
- **Task:** Script that takes raw probabilities and converts to categorical predictions + config.
- **Deliverables:**
  - `poc/config_assembler.py`
- **Step Dependencies:** Step 2.4
- **Validation:**
  - Given probabilities `{sleep: 0.89, anxiety: 0.45, biblestudy: 0.32}` → outputs `topic: "sleep"`.
  - Vibe correctly derived from Topic.
  - Confidence thresholds applied correctly.
- **Open Questions:** None
- **Implementation Notes:**

  **Topic Selection (with confidence threshold):**
  ```python
  CONFIDENCE_THRESHOLD = 0.4  # Minimum confidence to make a prediction

  def select_topic(sleep_prob, anxiety_prob, biblestudy_prob):
      probs = {'sleep': sleep_prob, 'anxiety': anxiety_prob, 'biblestudy': biblestudy_prob}
      max_topic = max(probs, key=probs.get)
      max_prob = probs[max_topic]

      if max_prob < CONFIDENCE_THRESHOLD:
          return {'topic': 'generic', 'confidence': max_prob, 'uncertain': True}

      # Check if top two are too close (ambiguous)
      sorted_probs = sorted(probs.values(), reverse=True)
      if sorted_probs[0] - sorted_probs[1] < 0.1:
          return {'topic': max_topic, 'confidence': max_prob, 'uncertain': True}

      return {'topic': max_topic, 'confidence': max_prob, 'uncertain': False}
  ```

  **Price Sensitivity (from historical purchase data):**
  ```python
  def determine_price_sensitivity(user_id, events_df):
      user_purchases = events_df[
          (events_df['user_id'] == user_id) &
          (events_df['event_type'] == 'purchaseCompleted')
      ]

      if len(user_purchases) == 0:
          # No purchase history - assume high sensitivity (safer)
          return 'high'

      avg_price = user_purchases['price'].mean()

      # Threshold based on typical price points
      # < $10 avg = high sensitivity, >= $10 = low sensitivity
      return 'high' if avg_price < 10 else 'low'
  ```

  **Vibe Derivation:**
  ```python
  VIBE_MAP = {
      'sleep': 'calm',
      'anxiety': 'calm',
      'biblestudy': 'traditional',
      'generic': 'neutral'
  }
  ```

  **Ad Context Integration:**
  ```python
  def integrate_ad_context(predicted_topic, ad_context, topic_confidence):
      """
      Boost confidence if ad context aligns with prediction.
      Override prediction if ad context is strong and prediction is weak.
      """
      if ad_context == predicted_topic:
          # Aligned - boost confidence
          return predicted_topic, min(topic_confidence + 0.1, 1.0)

      if topic_confidence < 0.5 and ad_context in ['sleep', 'anxiety', 'biblestudy']:
          # Weak prediction + strong ad intent - prefer ad context
          return ad_context, 0.6  # Moderate confidence from ad signal

      return predicted_topic, topic_confidence
  ```

### Step 3.2: Define Config Templates `[ ]`
- **Priority:** High
- **Task:** Create the mapping from predictions to concrete config values (headlines, backgrounds, offers).
- **Deliverables:**
  - `poc/config_templates.json`
- **Step Dependencies:** None
- **Validation:** JSON is valid and covers all prediction combinations.
- **Open Questions:** None
- **Implementation Notes:**
  ```json
  {
    "sleep_high": {
      "headline": "Rest in God's Peace",
      "subheadline": "Find calm for your restless nights",
      "background": "night_sky",
      "vibe": "calm",
      "offer": "monthly_discounted",
      "price": "$9.99/month"
    },
    "sleep_low": {
      "headline": "Rest in God's Peace",
      "subheadline": "Find calm for your restless nights",
      "background": "night_sky",
      "vibe": "calm",
      "offer": "annual_full",
      "price": "$59.99/year"
    },
    "anxiety_high": {
      "headline": "Find Your Inner Peace",
      "subheadline": "Let go of worry with guided prayers",
      "background": "serene_lake",
      "vibe": "calm",
      "offer": "monthly_discounted",
      "price": "$9.99/month"
    },
    "anxiety_low": {
      "headline": "Find Your Inner Peace",
      "subheadline": "Let go of worry with guided prayers",
      "background": "serene_lake",
      "vibe": "calm",
      "offer": "annual_full",
      "price": "$59.99/year"
    },
    "biblestudy_high": {
      "headline": "Deepen Your Faith",
      "subheadline": "Daily wisdom from Scripture",
      "background": "open_bible",
      "vibe": "traditional",
      "offer": "monthly_discounted",
      "price": "$9.99/month"
    },
    "biblestudy_low": {
      "headline": "Deepen Your Faith",
      "subheadline": "Daily wisdom from Scripture",
      "background": "open_bible",
      "vibe": "traditional",
      "offer": "annual_full",
      "price": "$59.99/year"
    },
    "generic_high": {
      "headline": "Your Spiritual Journey Awaits",
      "subheadline": "Discover peace, purpose, and community",
      "background": "sunrise",
      "vibe": "neutral",
      "offer": "monthly_discounted",
      "price": "$9.99/month"
    },
    "generic_low": {
      "headline": "Your Spiritual Journey Awaits",
      "subheadline": "Discover peace, purpose, and community",
      "background": "sunrise",
      "vibe": "neutral",
      "offer": "annual_full",
      "price": "$59.99/year"
    }
  }
  ```

### Step 3.3: Generate User Configs `[ ]`
- **Priority:** High
- **Task:** Run the full pipeline for Bob (and other test users) and output personalized configs.
- **Deliverables:**
  - `poc/output/bob_config.json`
  - `poc/output/alice_config.json`
  - `poc/output/charlie_config.json`
- **Step Dependencies:** Step 3.1, Step 3.2
- **Validation:**
  - JSON matches expected structure from strategy doc.
  - Predictions make sense given synthetic history + ad context.
- **Open Questions:** None
- **Implementation Notes:**

  **Expected Output for Bob:**
  ```json
  {
    "user_id": "bob",
    "predictions": {
      "topic": {"value": "sleep", "confidence": 0.89, "uncertain": false},
      "price_sensitivity": {"value": "high", "source": "no_purchase_history"},
      "vibe": {"value": "calm", "derived_from": "topic"}
    },
    "ad_context": {
      "last_ad": "sleep",
      "alignment": "matched"
    },
    "recommended_config": {
      "headline": "Rest in God's Peace",
      "subheadline": "Find calm for your restless nights",
      "background": "night_sky",
      "vibe": "calm",
      "offer": "monthly_discounted",
      "price": "$9.99/month"
    }
  }
  ```

---

## Phase 4: Visualization

### Step 4.1: Build HTML Visualizer `[ ]`
- **Priority:** Medium
- **Task:** Simple HTML/CSS page that reads config JSON and renders a mock paywall.
- **Deliverables:**
  - `poc/visualizer/index.html`
  - `poc/visualizer/styles.css`
  - `poc/visualizer/app.js`
- **Step Dependencies:** Step 3.3
- **Validation:**
  - Page loads without errors.
  - Displays correct headline, background color, and offer based on JSON.
- **Open Questions:** None
- **Implementation Notes:**
  - Keep it simple: colored div, headline text, price display.
  - No real design assets needed — abstract representation is fine.
  - Color scheme per vibe:
    - `calm` → Dark blue/purple gradient
    - `traditional` → Warm brown/gold
    - `neutral` → Light gray/white

### Step 4.2: Add Multi-User Comparison View `[ ]`
- **Priority:** Low
- **Task:** Extend visualizer to show predictions for multiple users side-by-side.
- **Deliverables:**
  - Updated `poc/visualizer/` files
- **Step Dependencies:** Step 4.1
- **Validation:** Can view Bob vs Alice vs Charlie predictions.
- **Open Questions:** None
- **Implementation Notes:** Nice-to-have for demo. Skip if time-constrained.

---

## Demo Script

**How to run the Bob Scenario end-to-end:**

1. **Run Smoke Test (first time only):**
   ```bash
   cd poc
   python smoke_test.py
   ```
   → Validates Kumo SDK works

2. **Generate Data:**
   ```bash
   python data_generator.py
   ```
   → Outputs `data/users.csv` and `data/events.csv`

3. **Run Predictions:**
   ```bash
   python kumo_predict.py
   ```
   → Outputs `output/raw_predictions.csv`

4. **Assemble Configs:**
   ```bash
   python config_assembler.py
   ```
   → Outputs `output/bob_config.json`, `output/alice_config.json`, `output/charlie_config.json`

5. **Visualize:**
   ```bash
   open visualizer/index.html
   ```
   → Shows personalized paywalls

**Expected Results:**

| User | Ad Context | Expected Topic | Expected Price | Expected Vibe |
|------|------------|----------------|----------------|---------------|
| Bob | sleep | Sleep | High Sensitivity | Calm |
| Alice | biblestudy | Bible Study | Low Sensitivity | Traditional |
| Charlie | anxiety | Anxiety | High Sensitivity | Calm |

---

## Completion Status

- **Phase 0 (Kumo Smoke Test):** ❌ Not started — *Critical de-risking step*
- **Phase 1 (Data Generation):** ❌ Not started
- **Phase 2 (Kumo Integration):** ❌ Not started
- **Phase 3 (Config Assembly):** ❌ Not started
- **Phase 4 (Visualization):** ❌ Not started

---

## Progress Updates

*(To be updated as work progresses)*

### {Date}
- Work notes here
