# Builder's Dossier: The $40M ARR Intelligence Strategy
**Project:** "The Mind-Reading Engine" (Real-Time Contextual Personalization)
**Target Date:** December 31, 2025
**Goal:** +$9M ARR / Optimization of $3M Ad Spend

---

## 1. The Mission & The Gap

We have 30 days to close a $9M ARR gap. We have the budget ($3M ad spend), but we lack the **Efficiency**.

### The Core Problem (The "Blind Spot")
*   **Broken Attribution:** Due to iOS privacy (ATT) and Apple's 24+ hour postback delays, we cannot attribute ad spend to high-value users fast enough.
*   **The Context Gap:** Users click specific ads (e.g., "Anxiety Relief"), but the app context is stripped during install. They land on a generic "Home" screen, leading to high bounce rates.
*   **The Opportunity:** We have millions of users with rich behavioral history in BigQuery, but this data is "cold" and disconnected from the real-time app experience.

### The Objective
Build a system that bridges **User History** (BigQuery) and **Real-Time Intent** (Ads) to deliver the optimal Paywall/Onboarding configuration instantly.

---

## 2. Inventory of References (Assets & Knowledge)

We are not starting from zero. We have validated the following assets:

*   **The Sensor Map (`_docs/app_event_schema.md`):** A complete extract of the `BCEvents` schema. We know exactly what data points (e.g., `spiritualMeterDone`, `bibleCapture`) are available for training.
*   **The "Kumo.ai" Accelerator:** Confirmed via documentation that KumoRFM allows "Zero-Training" predictions on relational data. We have a free API key (1k queries/day) ready for the PoC.
*   **The "Adapty" Delivery Mechanism:** Validated that Adapty supports `updateProfile(customAttributes)` and `JSON Remote Config`. This allows us to push ML decisions to the app without custom backend engineering.
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
    *   **Architecture:** Implement **Adapty Profile Sync** to bridge BigQuery $\rightarrow$ App (No Redis needed).
    *   **Logic:** **Real-Time Router.** The app queries Adapty SDK at launch to get the latest pre-synced segment.
    *   **UX:** App assembles screens dynamically using "Modular Components" (JSON Configs) rather than pre-made screens.
*   **ML Role:** Real-time Inference (ML Engine) + Contextual Bandits for cold start.

### Tier 3: The "Generative Strategy" (Target: Future Vision)
*   **Goal:** Infinite personalization.
*   **Method:** Fully bespoke UI generated on the fly by LLMs and Design Agents.

---

## 5. Deep Dive: The Tech Stack (Tier 1 & 2 Focus)

### The Brain (Logic Layer)
*   **PoC:** **Kumo.ai** (Relational Deep Learning). Handles the graph of "User $\rightarrow$ Events" automatically.
*   **Production:** **ML Engine (Kumo/XGBoost)**. Hosted on Vertex AI/AWS or using Kumo Enterprise.

### The Bridge (Transport Layer)
*   **Mechanism:** **Adapty Profile Sync**.
*   **Flow:**
    1.  Brain calculates `segment: "high_value_sleep"`.
    2.  Backend Script calls Adapty API (`updateProfile`) nightly.
    3.  App queries Adapty SDK at launch (fast cache) to get the specific Paywall Object (JSON).

### The Data (Fuel Layer)
*   **History:** **BigQuery**. (The "Cold" Truth).
*   **Intent:** **Deep Links**. (The "Hot" Signal).
*   **Fusion:** The model combines *History Vector* + *Intent Tags* to make the decision.

---

## 6. Proof of Concept: "The Bob Scenario"

We will validate the math before building the infrastructure.

**The Scenario:**
"Bob" is a dormant user (inactive 6 months) who clicks a "Sleep Prayers" ad. Can we predict his perfect paywall?

**The PoC Scope:**
1.  **Data Generation:** A Python script will generate `synthetic_events.csv` mimicking the actual `BCEvents` schema (e.g., 1,000 users with varying histories).
2.  **The Brain:** A Python script using the **Kumo.ai SDK** (Free Tier).
    *   *Input:* The synthetic CSV.
    *   *Query:* "PREDICT did_purchase GIVEN history + ad_source".
3.  **The Output:** A JSON blob: `{ "user_id": "bob", "recommended_flow": "sleep_v2", "prob": 0.89 }`.
4.  **The Visualization:** A simple HTML/Expo "Viewer" that reads the JSON and displays the corresponding "Sleep Paywall" (vs. a generic one).

---

## 7. Next Steps (Monday Morning)

1.  **Validation:** Review this Dossier with the CTO. Confirm the "Synthetic Event" strategy is approved.
2.  **PoC Execution:** Open a new thread to build the **"Bob Scenario" scripts** (Data Gen + Kumo).
3.  **War Room Activation:** Hand the "Top 5 Ad Campaigns" list to the Design/Onboarding team to start building the hard-coded "Tier 1" flows.
