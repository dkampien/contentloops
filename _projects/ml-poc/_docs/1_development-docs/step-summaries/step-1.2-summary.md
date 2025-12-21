# Step 1.2: Build Data Generator

**Status:** Complete
**Date:** 2025-12-16

## What Was Done

Created `data_generator_v2.py` that generates BCEvents-aligned synthetic data with embedded correlations for ML prediction.

## Key Features

### User Generation (1,003 users)
- 3 test users (Bob, Alice, Charlie) with known profiles
- 1,000 random users with varied characteristics
- Fields: user_id, created_at, age, gender, geography, language, lifeChallenge, last_ad_campaign

### Event Generation (~89,000 events)
- **Engagement:** habitDone, spiritualMeterDone
- **Content:** ahaBedtimeStories, ahaGuidedBreathing, ahaBibleStudyGuides
- **Chat:** askChatGPT (with category)
- **Conversion:** paywallShown, purchaseCompleted (with price, offer_type)

### Embedded Correlations
| Pattern | ML Signal |
|---------|-----------|
| Price < $15 | High price sensitivity |
| Price >= $15 | Low price sensitivity |
| offer_type = monthly | Monthly preference |
| offer_type = annual | Annual preference |
| High engagement + purchases | Higher P(conversion) |
| Dormant + no purchases | Lower P(conversion) |

## Test User Validation

| User | Profile | Purchase Data | Expected Predictions |
|------|---------|---------------|---------------------|
| Bob | Dormant, sleep ad | $4.99 monthly | High price sens, Monthly, ~0.6 |
| Alice | Active, bible ad | $49.99 annual | Low price sens, Annual, ~0.8 |
| Charlie | Medium, anxiety ad | No purchases | High (default), Monthly (default), ~0.4 |

## Output Files

- `data/users.csv` - 1,003 rows
- `data/events.csv` - 89,496 rows

## Data Distribution

```
Event types:
- habitDone: 25,744
- spiritualMeterDone: 25,624
- askChatGPT: 22,769
- paywallShown: 4,912
- aha* events: ~9,700
- purchaseCompleted: 696

Purchase breakdown:
- Low price (<$15): 413 (59%)
- High price (>=$15): 283 (41%)
- Monthly: 430 (62%)
- Annual: 266 (38%)
```

## Next Steps

Ready for Step 1.3: Validate Data Quality
