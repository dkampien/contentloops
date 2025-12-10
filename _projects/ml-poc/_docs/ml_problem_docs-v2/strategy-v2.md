# Builder's Dossier v2: The $40M ARR Intelligence Strategy
**Project:** "The Mind-Reading Engine" (Real-Time Contextual Personalization)
**Target Date:** December 31, 2025
**Goal:** +$9M ARR / Optimization of $3M Ad Spend

---

## 1. The Mission & The Gap

We have 30 days to close a $9M ARR gap. We have the budget ($3M ad spend), but we lack the **Efficiency**.

### The Core Problem (The "Blind Spot")
*   **The Context Gap (PRIMARY):** Users click specific ads (e.g., "Anxiety Relief"), but the app context is stripped during install. They land on a generic "Home" screen, leading to high bounce rates.
*   **Attribution Delay (SECONDARY):** Due to iOS privacy (ATT) and Apple's 24+ hour SKAdNetwork postback delays, we cannot attribute ad spend to high-value users fast enough to optimize campaigns.
*   **The Opportunity:** We have millions of users with rich behavioral history in BigQuery, but this data is "cold" and disconnected from the real-time app experience.

### The Objective
Build a system that bridges **User History** (BigQuery) and **Real-Time Intent** (Ads) to deliver the optimal Paywall/Onboarding configuration instantly.

---

## 2. Inventory of References (Assets & Knowledge)

We are not starting from zero. We have validated the following assets:

*   **The Sensor Map (`_docs/app_event_schema.md`):** A complete extract of the `BCEvents` schema. We know exactly what data points (e.g., `spiritualMeterDone`, `bibleCapture`) are available for training.
*   **The "Kumo.ai" Accelerator:** Confirmed via documentation that KumoRFM allows "Zero-Training" predictions on relational data. We have a free API key (1k queries/day) ready for the PoC.
*   **The "Adapty" Delivery Mechanism:** **CRITICAL FINDING.** Validated that Adapty supports server-side `updateProfile` API and `Remote Config JSON`. This acts as our "Feature Store," eliminating the need for Redis. Adapty's "Visual Builder" allows designers to build modular templates without code.
*   **The "pLTV" Industry Validation:** Perplexity research confirmed that **Synthetic Events (Predicted LTV)** are the standard 2025 solution for iOS attribution delays.
*   **Architecture Blueprints:** Reference patterns from Instacart and DoorDash confirming the "BigQuery $\rightarrow$ Feature Store $\rightarrow$ Inference" architecture.

---

## 3. The "Something" Discovered (The Solution)

The CTO's vision of a "Novel ML Problem" is solvable via a **Two-Pronged Strategy**:

1.  **The "Synthetic Signal" (Marketing Hack):**
    *   *Concept:* Don't wait 7 days for a trial to convert. Predict the user's value at **Minute 5**.
    *   *Action:* Send a "High Value" event to Facebook CAPI immediately if the ML model predicts a high pLTV. This "tricks" the ad algorithm into optimizing faster.

2.  **The "Contextual Router" (Product Experience):**
    *   *Concept:* Stop showing generic screens.
    *   *Action:* Use the ML model (or Rules) to select one of 5-10 pre-made "Golden Path" experiences (e.g., Anxiety Flow, Bible Study Flow) that matches the user's predicted intent.

---

## 4. The Architecture Plan (Tiers)

We cannot build the "Dream" in 30 days. We will execute in tiers.

### Tier 1: The "Cluster Strategy" (Target: Immediate / War Room)
*   **Goal:** Stop the bleeding. Maximize December revenue.
*   **Method:**
    *   **New Users:** **Hard-coded Rules.** (`IF DeepLink == 'Anxiety' THEN Show 'Anxiety_Paywall'`).
    *   **Returning Users:** **Offline Clustering.** Run a script on BigQuery to tag users as "Cluster A/B/C." Push these tags to Firebase/Adapty.
*   **ML Role:** Batch clustering (K-Means/XGBoost) running nightly.

### Tier 2: The "Modular Strategy" (Target: Jan / Q1)
*   **Goal:** Scale and automate.
*   **Method:**
    *   **Architecture:** Implement **Adapty Profile Sync** (BigQuery Script $\rightarrow$ Adapty API). No Redis needed.
    *   **Logic:** **Real-Time Router.** The app queries Adapty SDK at launch to get the latest pre-synced segment.
    *   **UX:** App assembles screens dynamically using **Modular Templates** designed in Adapty's Visual Builder.
*   **ML Role:** Real-time Inference (ML Engine) + Contextual Bandits for cold start.

### Tier 3: The "Generative Strategy" (Target: Future Vision)
*   **Goal:** Infinite personalization.
*   **Method:** Fully bespoke UI generated on the fly by LLMs and Design Agents.

---

## 5. Deep Dive: The Tech Stack (Tier 1 & 2 Focus)

### The Brain (Logic Layer)
*   **PoC:** **Kumo.ai** (Relational Deep Learning). Handles the graph of "User $\rightarrow$ Events" automatically.
*   **Production:** **ML Engine (Kumo/XGBoost)**. Hosted on Vertex AI/AWS or using Kumo Enterprise.
*   **Prediction Schema (Modular Attributes):**
    1.  **Topic** (Sleep vs Anxiety vs Bible Study) — Predicted via `aha*` event probabilities.
    2.  **Price** (High vs Low Sensitivity) — Predicted via purchase behavior patterns.
    3.  **Vibe** (Calm vs Vibrant vs Traditional) — *Derived* from Topic, not independently predicted.

### The Bridge (Transport Layer)
*   **Mechanism:** **Adapty Profile Sync**.
*   **Flow:**
    1.  Brain calculates `segment: "high_value_sleep"`.
    2.  Backend Script calls Adapty API (`updateProfile`) nightly.
    3.  App queries Adapty SDK at launch (fast cache) to get the specific Paywall Object (JSON) mapped to that segment.

### The Data (Fuel Layer)
*   **History:** **BigQuery**. (The "Cold" Truth).
*   **Intent:** **Deep Links**. (The "Hot" Signal).
*   **Fusion:** The model combines *History Vector* + *Intent Tags* to make the decision.

---

## 6. Proof of Concept: "The Bob Scenario"

We will validate the math before building the infrastructure.

**The Scenario:**
"Bob" is a dormant user (inactive 6 months) who clicks a "Sleep Prayers" ad. Can we predict his perfect paywall?

**PoC Focus:** Returning users only. New user flow (cold start / contextual bandits) is out of scope.

**PoC Purpose:** Technical validation — prove the pipeline works end-to-end. Business validation comes when real BigQuery data is connected.

**The PoC Scope:**
1.  **Data Generation:** A Python script will generate `synthetic_users.csv` + `synthetic_events.csv` mimicking the actual `BCEvents` schema (~1,000 users with varying histories). Embedded correlations simulate hypothesized real patterns. Includes `last_ad_context` column to simulate deep link intent.
2.  **The Brain:** A Python script using **KumoRFM + LocalGraph** (works with pandas DataFrames, no cloud storage needed).
    *   *Input:* The synthetic CSVs loaded via `LocalGraph.from_data()`.
    *   *Query (PQL):* Separate queries per prediction head (no multi-PREDICT support):
        ```python
        # No PROB() function - use COUNT(...) > 0 for binary classification
        q_sleep = "PREDICT COUNT(events.*, 0, 30, days) > 0 FOR EACH users.user_id WHERE events.event_type = 'ahaBedtimeStories'"
        q_anxiety = "PREDICT COUNT(events.*, 0, 30, days) > 0 FOR EACH users.user_id WHERE events.event_type = 'ahaGuidedBreathing'"
        q_biblestudy = "PREDICT COUNT(events.*, 0, 30, days) > 0 FOR EACH users.user_id WHERE events.event_type = 'ahaBibleStudyGuides'"
        q_purchase = "PREDICT COUNT(events.*, 0, 30, days) > 0 FOR EACH users.user_id WHERE events.event_type = 'purchaseCompleted'"
        ```
    *   *Note:* Kumo outputs **probabilities** (0.0-1.0) for binary classification. We run 4 queries, combine results, pick highest as the label.
3.  **The Output:** A JSON blob with multi-head predictions + ad context:
    ```json
    {
      "user_id": "bob",
      "predictions": {
        "topic": { "value": "sleep", "confidence": 0.89, "uncertain": false },
        "price_sensitivity": { "value": "high", "source": "no_purchase_history" },
        "vibe": { "value": "calm", "derived_from": "topic" }
      },
      "ad_context": {
        "last_ad": "sleep",
        "alignment": "matched"
      },
      "recommended_config": {
        "headline": "Rest in God's Peace",
        "background": "night_sky",
        "offer": "monthly_discounted",
        "price": "$9.99/month"
      }
    }
    ```
4.  **The Visualization (Abstract):** A simple HTML/CSS Viewer. It reads the JSON and displays a mock paywall with the predicted config. This proves the *logic* without needing design assets.

---

## 7. Next Steps (Monday Morning)

1.  **Validation:** Review this Dossier with the CTO. Confirm the "Synthetic Event" strategy is approved.
2.  **PoC Execution:** Open a new thread to build the **"Bob Scenario" scripts** (Data Gen + Kumo).
3.  **War Room Activation:** Hand the "Top 5 Ad Campaigns" list to the Design/Onboarding team to start building the hard-coded "Tier 1" flows in Adapty's Visual Builder.

---

## 8. PoC Technical Decisions

*Decisions made during PoC planning session (Dec 2024).*

### 8.1 Scope Clarification
*   **Focus:** Returning users only. New user flow (rules engine, contextual bandits) is out of scope for PoC.
*   **Purpose:** Technical validation — prove the pipeline works end-to-end.
*   **Business Validation:** Comes later when real BigQuery data is connected and predictions are compared against actual conversion outcomes.

### 8.2 Why Kumo.ai (Not XGBoost)
*   Kumo handles **graph structure** (User → Events relationships) natively via Graph Neural Networks.
*   Multi-task learning built into PQL syntax.
*   "Zero-training" capability for relational data reduces setup time.

### 8.3 Prediction Architecture
*   **Approach:** Propensity Prediction (supervised), NOT Clustering (unsupervised).
*   Clustering groups similar users but doesn't know who buys.
*   Propensity predicts: "If I show Bob Sleep Paywall, what's the probability he buys?"

### 8.4 How Predictions Work
*   Kumo outputs **probabilities** (0.0-1.0), not categorical labels.
*   **No PROB() function** — use `PREDICT COUNT(...) > 0` for binary classification.
*   **No multi-PREDICT** — run separate queries per prediction head, combine results.
*   We pick the highest probability as the winning label (argmax).
*   **Confidence thresholds:** If max probability < 0.4, fall back to "generic" topic.
*   User history is encoded as a **vector** (embedding), enabling fast inference.

### 8.5 Topic Prediction via `aha*` Events
The BCEvents schema has explicit "Aha Moment" events that serve as natural topic labels:

| Event | Topic Signal |
|-------|--------------|
| `ahaBedtimeStories` | Sleep |
| `ahaGuidedBreathing` | Anxiety / Calm |
| `ahaBibleStudyGuides` | Bible Study |
| `ahaKidsAudioStories` | Family / Kids |

We predict the probability of these events occurring → highest probability = predicted topic preference.

### 8.6 Price Sensitivity Prediction
*   **Not based on purchase probability alone** — uses historical purchase price data.
*   Look at average `price` on `purchaseCompleted` events for each user.
*   Users with avg price < $10 = High Sensitivity. Users with avg price >= $10 = Low Sensitivity.
*   Users with no purchase history = Default to High Sensitivity (safer assumption).

### 8.7 Vibe is Derived, Not Predicted
*   Vibe (Calm / Vibrant / Traditional) is **derived from Topic**, not an independent prediction head.
*   Sleep → Calm, Bible Study → Traditional, Kids → Vibrant.
*   This reduces model complexity without losing value.

### 8.8 Synthetic Data Schema
Since BigQuery access is not yet available, PoC uses synthetic data:

**`users.csv`:**
*   `user_id`, `created_at`, `age`, `gender`, `preferredTopics`, `lifeChallenge`, `longestStreak`, `dayDone7Days`
*   **`last_ad_context`** — simulates deep link intent (sleep/anxiety/biblestudy/generic)

**`events.csv`:**
*   `event_id`, `user_id`, `ts`, `event_type`
*   `category` — optional, for `askChatGPT` events
*   `price` — optional, for `purchaseCompleted` events
*   Event types include: `habitDone`, `askChatGPT`, `spiritualMeterDone`, `ahaBedtimeStories`, `ahaGuidedBreathing`, `ahaBibleStudyGuides`, `purchaseCompleted`, `paywallShown`

**Embedded Correlations:**
*   Users with nighttime habits + mood tracking → higher `ahaBedtimeStories` probability.
*   Users with anxiety-related chat categories → higher `ahaGuidedBreathing` probability.
*   Low historical purchase prices → High price sensitivity.
*   These are **hypotheses** — real data will validate or invalidate them.

### 8.9 Ad Context Integration
*   Ad context (`last_ad_context`) is used to boost or override predictions.
*   If ad context aligns with predicted topic → boost confidence.
*   If prediction is weak (< 0.5) and ad context is specific → prefer ad context.
*   This fuses **history** (ML prediction) with **intent** (ad signal).

### 8.10 Future Prediction Attributes (Post-PoC)
*   **Journey Length:** Short (direct to paywall) vs Long (quiz + value prop first).
*   **Additional Topics:** As app content evolves.
*   **Feature Preference:** Which app features to highlight.

### 8.11 Kumo SDK Path
*   **Use `KumoRFM` + `LocalGraph`** — works with pandas DataFrames directly, no S3/cloud storage needed.
*   **Import pattern:**
    ```python
    from kumoai.experimental.rfm import LocalGraph, KumoRFM
    ```
*   **Fallback:** If RFM fails, use Full SDK with `upload_table()` + `FileUploadConnector`.
