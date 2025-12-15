# Funnel & User Journey Diagram

Reference diagram for strategy-v3. Shows the conversion funnel with user type branches.

---

## The Funnel (With Context Gap)

```mermaid
flowchart TD
    subgraph ACQUISITION["ACQUISITION"]
        AD[Ad Impression]
        AD --> CLICK[Ad Click]
        CLICK --> STORE[App Store]
        STORE --> INSTALL[Install]
    end

    subgraph CONTEXT_GAP["⚠️ CONTEXT GAP"]
        INSTALL --> OPEN[App Open]
        OPEN -.->|"Deep link stripped?"| LOST[Context Lost]
        OPEN -->|"Deep link survived"| CONTEXT[Context Preserved]
    end

    subgraph ACTIVATION["ACTIVATION"]
        LOST --> GENERIC[Generic Experience]
        CONTEXT --> PERSONALIZED[Personalized Experience]

        GENERIC --> ONBOARD_G[Onboarding]
        PERSONALIZED --> ONBOARD_P[Contextual Onboarding]
    end

    subgraph MONETIZATION["MONETIZATION"]
        ONBOARD_G --> PAYWALL_G[Generic Paywall]
        ONBOARD_P --> PAYWALL_P[Matched Paywall]

        PAYWALL_G --> TRIAL_G[Trial Start]
        PAYWALL_P --> TRIAL_P[Trial Start]

        TRIAL_G --> CONVERT_G[Convert?]
        TRIAL_P --> CONVERT_P[Convert?]
    end

    subgraph OUTCOME["OUTCOME"]
        CONVERT_G -->|"~60%"| CHURN_G[Churn]
        CONVERT_G -->|"~40% US"| PAID_G[Paid User]

        CONVERT_P -->|"~55%?"| CHURN_P[Churn]
        CONVERT_P -->|"~45%?"| PAID_P[Paid User]
    end

    style LOST fill:#ff6b6b
    style GENERIC fill:#ff6b6b
    style PAYWALL_G fill:#ff6b6b
    style CONTEXT fill:#51cf66
    style PERSONALIZED fill:#51cf66
    style PAYWALL_P fill:#51cf66
```

---

## User Type Branches

```mermaid
flowchart TD
    OPEN[App Open] --> CHECK{Known User?}

    CHECK -->|No| NEW[New User]
    CHECK -->|Yes| RETURNING[Returning User]

    subgraph NEW_PATH["NEW USER PATH"]
        NEW --> DL_CHECK{Deep Link?}
        DL_CHECK -->|Survived| RULES[Rules Engine]
        DL_CHECK -->|Stripped| BANDIT[Contextual Bandit]
        RULES --> FTUE[FTUE Onboarding]
        BANDIT --> FTUE
        FTUE --> PAYWALL_NEW[Paywall]
    end

    subgraph RETURN_PATH["RETURNING USER PATH"]
        RETURNING --> DATA[Fetch User Data]
        DATA --> HOT{Ad Intent?}
        HOT -->|Yes| FUSION[Fuse Hot + Cold]
        HOT -->|No| COLD_ONLY[Cold Data Only]
        FUSION --> ML[ML Prediction]
        COLD_ONLY --> ML
        ML --> WELCOME[Welcome Back]
        WELCOME --> PAYWALL_RET[Personalized Paywall]
    end

    PAYWALL_NEW --> TRIAL[Trial]
    PAYWALL_RET --> TRIAL
    TRIAL --> OUTCOME{Convert?}
    OUTCOME -->|Yes| PAID[Paid User]
    OUTCOME -->|No| CHURN[Churn / Retry]
```

---

## Drop-off Points (The Problem)

| Stage | What Happens | Drop-off Risk |
|-------|--------------|---------------|
| Ad → Click | User sees ad | Low intent clicks |
| Click → Install | App Store visit | Store friction, reviews |
| Install → Open | First launch | Never opens, forgets |
| **Open → Onboarding** | **Context gap** | **Wrong experience shown** |
| Onboarding → Paywall | Value prop | Not convinced |
| Paywall → Trial | Pricing decision | Price mismatch |
| Trial → Paid | 7-day experience | Didn't find value |

**Our focus:** The Open → Paywall segment. This is where personalization has highest leverage.

---

## The ML Intervention Point

```mermaid
flowchart LR
    subgraph BEFORE["WITHOUT ML"]
        B1[User Opens] --> B2[Generic Screen] --> B3["X% Start Trial"]
    end

    subgraph AFTER["WITH ML"]
        A1[User Opens] --> A2[ML Prediction] --> A3[Matched Screen] --> A4["Higher % Start Trial"]
    end
```

**The goal:** Insert ML prediction between App Open and Screen Render to increase **Paywall → Trial** conversion.

> **Note:** Trial → Paid is already ~40% (US). The leverage point is getting more users to START trials, not converting trials to paid.

---

## Funnel Metrics

### Known Data (Dec 2025)

| Metric | Value | Source |
|--------|-------|--------|
| **Trial → Paid** | **~40%** | Team (US only) |
| Global Trial → Paid | TBD | Need from team |

> **Key Insight:** Trial → Paid is much higher than typical assumptions (~40% US vs assumed ~12%). The bottleneck is earlier in funnel: **Paywall → Trial**, not Trial → Paid.

### Estimated Full Funnel (Needs Validation)

| Stage | Current | With ML | Notes |
|-------|---------|---------|-------|
| Open → Onboarding Complete | ~60%? | ~75%? | Estimate |
| Onboarding → Trial Start | **?** | **?** | **Key bottleneck — need real data** |
| Trial → Paid | ~40% (US) | ~45%? | Already high, less room to improve |
| **Overall: Open → Paid** | **?** | **?** | Depends on Paywall → Trial |

> ⚠️ Most numbers above are illustrative. The 40% Trial → Paid (US) is real. Other metrics needed from team.
