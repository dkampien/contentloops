# Project Context: SoulStream / Bible Chat

## Client Profile
*   **Client:** SoulStream (Series A, 40M users, 300% YoY growth).
*   **Product:** BibleChat (AI Spiritual Companion).
*   **Goal:** Hit **$40M ARR** by Dec 31, 2025.
*   **Constraint:** Must scale Ad Spend to **$3M/month** efficiently.

## The Mission: "The Mind-Reading Engine"
We are building a **Real-Time Contextual Personalization Engine** to bridge the gap between Ad Intent and App Experience.

### Core Architecture
*   **Logic:** Hybrid System.
    *   *New Users:* Rules-based Routing (Deep Link $\rightarrow$ Config).
    *   *Returning Users:* ML-based Prediction (User History $\rightarrow$ Config).
*   **Tech Stack:**
    *   **Brain:** Kumo.ai (PoC) / XGBoost (Prod).
    *   **Data:** BigQuery (Warehouse).
    *   **Bridge:** Adapty Profile Sync (Feature Store).
    *   **Rendering:** Adapty Visual Builder (Modular Templates).

### Active Initiative: Phase 1 PoC
*   **Status:** Strategy Defined. Moving to Execution.
*   **Current Task:** "The Bob Scenario" (Proof of Concept).
    *   Proving we can predict a dormant user's preferred paywall topic (Sleep vs. Anxiety) using synthetic event data.

## Legacy Context (ContentLoops)
*   *Note: This was the previous phase.*
*   **Project:** ContentLoops (CLoops).
*   **Goal:** Automate content generation (Comics) for AdLoops.
*   **Status:** Foundation built. Currently paused to focus on the $40M ARR personalization goal.
