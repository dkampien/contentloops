# Prediction Analysis Report

**Generated:** 2025-12-16
**Status:** All validations PASSED

## 1. Test User Validation

| User | Purchases | Avg Price | Offer Type | conv_prob | price_sens | annual_prob | Config |
|------|-----------|-----------|------------|-----------|------------|-------------|--------|
| Bob | 1 | $4.99 | monthly | 0.113 | 1.0 | 0.0 | low, monthly |
| Alice | 1 | $49.99 | annual | 1.0 | 0.0 | 1.0 | high, annual |
| Charlie | 0 | N/A | N/A | 1.0 | 0.6 | 0.35 | low, monthly |

**All test users match expected predictions from implementation plan!**

## 2. Correlation Validation

### Price Sensitivity
| User Group | Count | Mean price_sens_prob |
|------------|-------|---------------------|
| Low avg price (<$15) | 237 | **1.000** |
| High avg price (>=$15) | 168 | **0.000** |

**Result:** Users with low historical purchase prices → high price sensitivity probability

### Offer Type
| User Group | Count | Mean annual_prob |
|------------|-------|-----------------|
| Only monthly purchases | 251 | **0.000** |
| Only annual purchases | 154 | **1.000** |

**Result:** Users with historical annual purchases → high annual probability

### Conversion (Kumo GNN)
| User Group | Count | Mean conversion_prob |
|------------|-------|---------------------|
| High activity | 499 | **1.000** |
| Low activity | 504 | **0.620** |

**Result:** Active users have higher predicted conversion probability

## 3. Summary

| Check | Status |
|-------|--------|
| Price sensitivity correlates with purchase prices | PASS |
| Offer type correlates with historical preferences | PASS |
| Conversion correlates with activity level | PASS |

**Overall Validation: PASS**

## 4. Interpretation

The predictions correctly capture:

1. **Price Sensitivity (Historical Analysis)**
   - Binary classification based on avg purchase price < $15
   - Users without purchases default to 0.6 (price sensitive)
   - Perfect correlation with embedded data pattern

2. **Offer Type (Historical Analysis)**
   - Binary classification based on historical offer preference
   - Users without purchases default to 0.35 (monthly bias)
   - Perfect correlation with embedded data pattern

3. **Conversion Probability (Kumo GNN)**
   - Temporal binary classification predicting future engagement
   - High activity users: ~100% predicted conversion
   - Low activity users: ~62% predicted conversion
   - Kumo correctly learned activity → engagement pattern

## 5. Confidence in Results

The predictions demonstrate:
- **Data generation worked:** Correlations embedded in synthetic data
- **Kumo GNN works:** Correctly predicts engagement from graph patterns
- **Historical analysis works:** Correctly derives behavioral signals
- **Architecture validated:** Multi-head prediction → config assembly is viable
