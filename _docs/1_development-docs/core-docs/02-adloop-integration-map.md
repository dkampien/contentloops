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
*   **ContentLoops's Role:** This is the primary artifact your system generates (e.g., the Comic Book slideshow).

### Layer 2: Overlays (Dynamic Text/Graphics)
*   **Definition:** Elements placed *on top* of the Video Base.
*   **Mechanism:** `MyVideoMixOverlay` objects.
*   **Dynamic Data:** AdLoop uses `dynamicOverlayParams` to inject text at runtime.
    *   *Example:* A "Caption" overlay expecting a `{{narration}}` key.
*   **ContentLoops's Role:** Your system generates the **Data Payload** (the narration text strings) that AdLoop injects into these overlays.

### Layer 3: Audio
*   **Voiceover:** TTS aligned with the script.
*   **Music:** Background track.

## 3. Integration Point: "DataSources" & "Asset Ingestion"
AdLoop templates (`MyVideoMixAutoTemplate`) can be powered by a **DataSource**. The **ContentLoops** system generates bundles of assets and metadata that are then ingested into AdLoop's data model.

*   **The Workflow (from AdLoop's perspective, post-ContentLoops generation):**
    1.  **Ingestion:** A post-processing script (part of ContentLoops) performs the "Handshake":
        *   Uploads images/videos to the AdLoop bucket.
        *   Creates documents in the `bodies` collection (for stories) or `hooks` collection (for clips).
        *   Injects the `overlays.json` data into the `extracted_texts` or `metadata` fields of the Firestore document.
    2.  **Mixing:** The AdLoop Builder sees the new documents and includes them in the next "Auto Mix" batch.

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
Since `Hooks` and `Bodies` share the same technical structure, the **Content Asset Factory (ContentLoops)** should be a unified **Asset Factory**.
*   It generates a video file.
*   It outputs a Manifest.
*   **Configurable Destination:** The Manifest tells the Ingestion Script: *"Put this in the `hooks` bucket"* or *"Put this in the `bodies` bucket"*.
