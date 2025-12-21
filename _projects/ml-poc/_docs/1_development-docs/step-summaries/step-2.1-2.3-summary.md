# Steps 2.1-2.3: Kumo Prediction

**Status:** Complete
**Date:** 2025-12-16

## What Was Done

### Step 2.1: Load Data into LocalGraph
- Created `kumo_predict_v2.py`
- Successfully loaded users (1,003) and events (89,496) into Kumo LocalGraph
- Graph materialized with 90,499 nodes and 178,992 edges

### Step 2.2: Define Prediction Queries

**Strategy Implemented:**
| Head | Approach | Rationale |
|------|----------|-----------|
| P(conversion) | Kumo GNN | Leverages graph patterns for future engagement prediction |
| Price Sensitivity | Historical Analysis | Derived from actual purchase price history |
| Offer Type | Historical Analysis | Derived from actual offer type preferences |

**Kumo GNN Query:**
```pql
PREDICT COUNT(events.*, 0, 30, days) > 0 FOR EACH users.user_id
```

**PQL Learning:**
- WHERE clause filters context data, not prediction targets
- For inline filters: `COUNT(events.* WHERE events.price < 15, 0, 30, days)`
- Kumo returns columns: `ENTITY`, `ANCHOR_TIMESTAMP`, `TARGET_PRED`, `False_PROB`, `True_PROB`

### Step 2.3: Run Predictions

**Results:**
- Batch processing implemented (999 users/batch due to 1,000 limit)
- All 1,003 users processed successfully
- Results saved to `output/raw_predictions.csv`

## Test User Results

| User | conversion_prob | price_sens_prob | annual_prob | Recommendation |
|------|-----------------|-----------------|-------------|----------------|
| Bob | 0.113 | 1.0 | 0.0 | low price, monthly |
| Alice | 1.0 | 0.0 | 1.0 | high price, annual |
| Charlie | 1.0 | 0.6 | 0.35 | low price, monthly |

**All match expected predictions from implementation plan!**

## Architecture Notes

**Kumo GNN Analysis:**
- Identified temporal binary classification task
- Derived anchor time: 2024-12-15 23:57:00
- Collected 1,000 in-context examples with 80.60% positive cases
- Processing time: ~4.5s for 999 users, ~1.2s for small batches

**Historical Analysis Benefits:**
- Price Sensitivity and Offer Type are behavioral signals, not predictions
- Historical data directly indicates user preferences
- No cold-start problem for users with purchase history
- Default values (0.6 price sens, 0.35 annual) for users without purchases

## Files

- `kumo_predict_v2.py` - Main prediction script
- `output/raw_predictions.csv` - Full prediction results

## Summary Statistics

```
conversion_prob: Mean=0.809, Std=0.378
price_sens_prob: Mean=0.594, Std=0.313
annual_prob:     Mean=0.362, Std=0.309
```

## Future Optimizations

**Inline PQL Filters (not implemented, documented for reference):**
```pql
PREDICT COUNT(events.* WHERE events.price < 15, 0, 30, days) > 0 FOR EACH users.user_id
PREDICT COUNT(events.* WHERE events.offer_type = 'annual', 0, 30, days) > 0 FOR EACH users.user_id
```

This would enable Kumo to learn price/offer patterns from graph structure, potentially better than simple historical averages.
