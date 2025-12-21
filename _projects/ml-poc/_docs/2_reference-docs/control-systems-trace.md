# Control Systems Interaction Trace

Detailed trace of how Adapty, Firebase RemoteConfig, deep links, and hardcoded logic interact in the BibleChat app.

*Generated: 2025-12-17 via codebase scan*

---

## Summary

**The Flow:**
```
App Launch
    → Firebase RemoteConfig + Adapty init
    → SceneDelegate captures deep link URL
    → Deep link tasks parsed (base64 JSON → task array)
    → Tasks execute SEQUENTIALLY
    → Decision: Which onboarding?
        1. Check KeyStore.forceOnboardingPlacementId (override)
        2. Read Firebase RemoteConfig (onboarding_type, age-based keys)
        3. Call Adapty.getOnboarding(placementId)
    → Show onboarding screens
    → Paywall trigger → Adapty.getPaywall(placementId)
    → Display paywall
```

**Control Summary:**

| What | Controlled By |
|------|---------------|
| Task execution order | Hardcoded (always sequential) |
| Which onboarding version | Firebase RemoteConfig (`onboarding_type`) |
| Age-based paywall | Firebase RemoteConfig (`onboarding_paywall_type_[AGE]`) |
| Paywall products/config | Adapty (`getPaywall(placementId)`) |
| Deep link override | Task queue can force specific onboarding |

**Key Insight:** Firebase + Adapty are *layered*. Firebase picks the path, Adapty serves the content. Deep link can override both.

---

## Key Files

| Function | File | Purpose |
|----------|------|---------|
| `DeepLinkHandler.handleJSON()` | DeepLinkRouting/DeepLinkHandler.swift:72 | Parse & execute task array |
| `DeepLinkHandler.handleTasks()` | DeepLinkRouting/DeepLinkHandler.swift:171 | Sequential task execution |
| `LaunchOnboardingCoordinator.getOnboardingCoordinator()` | Scenes/Main/LaunchOnboardingCoordinator.swift:54 | Select onboarding flow |
| `FeatureFlagHelper.onboardingConfigurationPublisher()` | Models/Helpers/FeatureFlagHelper.swift:186 | Get onboarding path |
| `PremiumService.getProductsForPaywall()` | Services/PremiumService.swift:189 | Adapty.getPaywall() call |
| `Navigate.showPaywall()` | Utils/Navigate+Paywall.swift:48 | Display paywall UI |

---

## Firebase RemoteConfig Keys

| Key | Purpose |
|-----|---------|
| `onboarding_type` | Determines onboarding version (v8.1, v9, adapty) |
| `onboarding_configuration` | Path to Firebase document with config |
| `onboarding_paywall_type_[AGE]` | Age-segmented paywall (13, 18, 25, 35, 45, 55) |
| `onboarding_placement` | Adapty placement ID |

---

## Hardcoded vs Config-Driven

**Hardcoded:**
- Deep link task types (30+ enum values)
- Task execution is always sequential
- Paywall placement enum names
- Max 4 JSON decode retries

**Config-Driven:**
- Which onboarding type to show
- Which paywall placement to use
- Age-based paywall selection
- Feature flags (ads, mission, limits)

---

## Visual Flow

```
┌──────────────────┐
│   Ad Click       │
│   (Singular)     │
└────────┬─────────┘
         ↓
┌──────────────────┐
│  Deep Link URL   │
│  with task queue │
└────────┬─────────┘
         ↓
┌──────────────────┐
│  App Launch      │
│  SceneDelegate   │
└────────┬─────────┘
         ↓
┌──────────────────┐
│  Firebase Init   │
│  Adapty Init     │
└────────┬─────────┘
         ↓
┌──────────────────┐
│  Parse Tasks     │
│  (sequential)    │
└────────┬─────────┘
         ↓
┌──────────────────────────────────────┐
│  DECISION: Which Onboarding?         │
│  1. KeyStore override?               │
│  2. Firebase RemoteConfig            │
│  3. Adapty.getOnboarding()           │
└────────┬─────────────────────────────┘
         ↓
┌──────────────────┐
│  Show Onboarding │
│  (v8/v9/adapty)  │
└────────┬─────────┘
         ↓
┌──────────────────┐
│  Paywall Trigger │
│  Adapty.getPaywall()
└────────┬─────────┘
         ↓
┌──────────────────┐
│  Display Paywall │
│  PaywallView     │
└──────────────────┘
```
