# ML-PoC Project Context

## What
ML-powered paywall personalization for BibleChat. Predict optimal paywall config for returning users.

## Goal
$40M ARR by scaling ad spend to $3M/month efficiently.

## Status
PoC phase — validating Tier 2 (multi-head ML) architecture with synthetic data.

## Core Insight
**Topic is INPUT (from ad intent), not predicted.** ML predicts:
- Price Sensitivity (High/Low)
- Offer Type (Monthly/Annual)
- P(conversion) (0-1)

## Tech Stack
- **ML Engine:** Kumo.ai (GNN for relational data)
- **Data:** BigQuery (user history, events)
- **Delivery:** Adapty (paywall configs)
