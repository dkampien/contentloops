# Tool Stack & Cross-Repo Connections

Complete map of SDKs, services, and how the three repos interconnect.

*Generated: 2025-12-17 via codebase scan*

---

## Overview Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    EXTERNAL AD NETWORKS                          │
│         Facebook    TikTok    Instagram    Singular              │
└──────────┬────────────┬──────────┬────────────┬─────────────────┘
           │            │          │            │
           ▼            ▼          ▼            ▼
┌─────────────────────────────────────────────────────────────────┐
│                      ADLOOPS PLATFORM                            │
│  ┌─────────────────┐         ┌─────────────────────────────┐    │
│  │ Web (Next.js)   │◄───────►│ Backend (Supabase Edge)     │    │
│  │ • Campaign mgmt │         │ • TikTok/IG OAuth           │    │
│  │ • Influencer UI │         │ • Stripe/PayPal webhooks    │    │
│  │ • Deep link gen │         │ • Email notifications       │    │
│  └────────┬────────┘         └──────────────────────────────┘    │
│           │                                                       │
│           │ /get-config-features                                  │
│           │ /assign-onboarding-to-config-feature                  │
│           ▼                                                       │
│  ┌─────────────────┐                                             │
│  │ ONBOARDING      │                                             │
│  │ BUILDER         │                                             │
│  │ • Visual CMS    │                                             │
│  │ • JSON configs  │                                             │
│  │ • Multi-lang    │                                             │
│  └────────┬────────┘                                             │
└───────────┼──────────────────────────────────────────────────────┘
            │
            │ Configs assigned to features
            ▼
┌─────────────────────────────────────────────────────────────────┐
│                      BIBLECHAT iOS APP                           │
│                                                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│  │ Adapty   │  │ Firebase │  │ Singular │  │ TikTok   │        │
│  │ Paywall  │  │ Config   │  │ Attrib.  │  │ SDK      │        │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘        │
│       │             │             │             │                │
│       ▼             ▼             ▼             ▼                │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              User Experience Flow                         │   │
│  │  Ad Click → Deep Link → Onboarding → Paywall → Home      │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
            │
            │ Events
            ▼
┌─────────────────────────────────────────────────────────────────┐
│  Analytics: MixPanel, Firebase Analytics, Singular, Clarity      │
└─────────────────────────────────────────────────────────────────┘
```

---

## SDKs & Services by Repo

### BibleChat iOS App
| Service | Purpose |
|---------|---------|
| Adapty | Paywall, monetization, onboarding UI |
| Firebase | Auth, Firestore, Remote Config, FCM, App Check |
| Singular | Attribution, deep links |
| TikTok SDK | Deferred deep links, attribution |
| Facebook SDK | Social, analytics |
| MixPanel | Event analytics |
| Clarity | Session recording |
| OpenAI | AI chat features |

### AdLoops Platform
| Service | Purpose |
|---------|---------|
| Supabase | DB, edge functions, auth |
| Firebase | Auth, realtime data |
| Singular API | Deep link generation |
| TikTok/Instagram/Facebook APIs | Ad management, OAuth |
| Stripe | Payouts |
| PayPal | Payouts |
| DeepL | Translation |
| Apify | Web scraping |

### Onboarding Builder
| Service | Purpose |
|---------|---------|
| Supabase | Onboarding config storage |
| Firebase | Config feature listener |
| Cloudflare | Image CDN |
| DeepL | Translation |
| OpenAI | Text generation |

---

## Cross-Repo API Connections

### Onboarding Builder → AdLoops
```
GET  ${ADLOOPS_API_ENDPOINT}/get-config-features
POST ${ADLOOPS_API_ENDPOINT}/assign-onboarding-to-config-feature
```

### AdLoops → External
```
TikTok OAuth: https://frygjjkhiotnuxsbmrrh.supabase.co/functions/v1/tiktok-callback
Stripe Webhooks: stripe-webhook edge function
PayPal Webhooks: paypal-webhook edge function
```

### BibleChat → Services
```
Adapty: Adapty.getPaywall(placementId)
Firebase: Remote Config fetch
Singular: Deep link handling, attribution
```

---

## Key Integration Flows

### Flow 1: Ad → Install → Onboarding
```
Ad Click (Facebook/TikTok)
    ↓
Singular/TikTok captures attribution
    ↓
App Store → Install
    ↓
App Launch → Deep link parsed
    ↓
Firebase Remote Config → onboarding_type
    ↓
Adapty.getOnboarding() → Config from Onboarding Builder
    ↓
Onboarding screens shown
    ↓
Adapty.getPaywall() → Paywall displayed
```

### Flow 2: Onboarding Config Creation
```
Onboarding Builder: Create config
    ↓
Save to Supabase
    ↓
POST /assign-onboarding-to-config-feature
    ↓
AdLoops stores assignment
    ↓
BibleChat fetches via Adapty/Firebase
```

### Flow 3: Attribution & SKAN
```
User installs from ad
    ↓
Singular SDK initialized
    ↓
SKAN conversion value set (by Singular)
    ↓
Apple sends postback to ad networks (24-48h delay)
    ↓
CAPI events sent via AdLoops (~30 min)
```

---

## Key Insight

**Onboarding Builder connects to AdLoops, not directly to BibleChat.**

The flow is:
1. Onboarding Builder creates JSON configs
2. Assigns them to features via AdLoops API
3. BibleChat fetches configs via Adapty/Firebase (which pull from the assignments)

**Firebase + Adapty are the bridge** between the backend config systems and the iOS app.
