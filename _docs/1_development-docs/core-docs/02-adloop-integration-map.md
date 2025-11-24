# AdLoop System Architecture Analysis

**Based on:** Codebase analysis of `Adloops-Backend`, `ads-library-automation`, and `Ads_Platform_Web`.

## 1. Core Concept: The "Mix"
An AdLoop Ad (or "Mix") is a timeline sequence composed of three distinct component types.

```text
[ HOOK (0-3s) ]  +  [ BODY (15-60s) ]  +  [ CTA (3-5s) ]  =  Final Ad
```

### 1.1. The Component Model
All components (Hooks, Bodies, CTAs) share the same underlying data structure (`MyVideoMixPart`).
*   **Storage:** They are video files stored in Cloud Storage.
*   **Database:** They are tracked in Firestore collections (`hooks`, `bodies`, `ctas`).
*   **Distinction:** The distinction is primarily semantic (which bucket it lives in) and functional (its position in the timeline).

## 2. The Rendering Stack (Layers)
AdLoop constructs videos using a "Layer" approach.

### Layer 1: The Video Base
*   The raw MP4 or Image sequence.
*   **Your Role:** This is the primary artifact your system generates (e.g., the Comic Book slideshow).

### Layer 2: Overlays (Dynamic Text/Graphics)
*   **Definition:** Elements placed *on top* of the Video Base.
*   **Mechanism:** `MyVideoMixOverlay` objects.
*   **Dynamic Data:** AdLoop uses `dynamicOverlayParams` to inject text at runtime.
    *   *Example:* A "Caption" overlay expecting a `{{narration}}` key.
*   **Your Role:** Your system generates the **Data Payload** (the narration text strings) that AdLoop injects into these overlays.

### Layer 3: Audio
*   **Voiceover:** TTS aligned with the script.
*   **Music:** Background track.

## 3. Integration Point: "DataSources" & "Asset Ingestion"
AdLoop templates (`MyVideoMixAutoTemplate`) can be powered by a **DataSource**.

*   **The Workflow:**
    1.  **Ingestion:** You upload assets (Hooks/Bodies) to Cloud Storage.
    2.  **Registration:** You create Firestore documents in the `hooks`/`bodies` collections referencing these files.
    3.  **Metadata:** You attach `extracted_texts` or specific metadata fields to these documents.
    4.  **Mixing:** The AdLoop Builder sees the new documents and includes them in the next "Auto Mix" batch.

## 4. Key Terminology Mapping

| Your Diagram Term | AdLoop Code Equivalent | Definition |
| :--- | :--- | :--- |
| **Generated Body** | `bodies` Collection Document | The main visual asset (MP4/Images) you create. |
| **Hook** | `hooks` Collection Document | A short video file played at the start. |
| **Self Overlay** | Burned-in Graphics | Text/Visuals you render directly into your MP4/Images (e.g., Comic Speech Bubbles). |
| **Overlay** | `MyVideoMixOverlay` | Dynamic layers AdLoop adds later (e.g., Subtitles, App UI Mockups). |
| **Overlay Data** | `dynamicOverlayParams` | The text strings you provide for the Overlays. |
| **Mix** | `MyVideoMix` | The final permutation of Hook + Body + CTA. |

## 5. Strategic Insight: Unified Asset Generation
Since `Hooks` and `Bodies` share the same technical structure, your **Content Generation System** should be a unified **Asset Factory**.
*   It generates a video file.
*   It outputs a Manifest.
*   **Configurable Destination:** The Manifest tells the Ingestion Script: *"Put this in the `hooks` bucket"* or *"Put this in the `bodies` bucket"*.
