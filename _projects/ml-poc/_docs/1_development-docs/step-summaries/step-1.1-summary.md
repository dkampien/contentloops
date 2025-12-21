# Step 1.1: Define BCEvents-Aligned Schema

**Status:** Complete
**Date:** 2025-12-16

## What Was Done

Updated schema files to match implementation plan requirements:

### Users Schema (`schemas/users_schema.json`)
- Added `geography` field (US, MX, BR, etc.)
- Added `language` field (en, es, pt, etc.)
- Renamed `last_ad_context` → `last_ad_campaign` for clarity
- Removed deprecated fields (`preferredTopics`, `longestStreak`, `dayDone7Days`)

### Events Schema (`schemas/events_schema.json`)
- Added `offer_type` field (monthly/annual) for purchaseCompleted events
- Updated event_type list to match BCEvents schema

## Schema Summary

**Users (8 fields):**
| Field | Type | Notes |
|-------|------|-------|
| user_id | string | Primary key |
| created_at | datetime | Account creation |
| age | string | Age bracket |
| gender | string | m/f |
| geography | string | Country code |
| language | string | Language code |
| lifeChallenge | string | Primary challenge |
| last_ad_campaign | string | Topic from ad intent (INPUT to ML) |

**Events (7 fields):**
| Field | Type | Notes |
|-------|------|-------|
| event_id | string | Primary key |
| user_id | string | Foreign key |
| ts | datetime | Event timestamp |
| event_type | string | BCEvents type |
| category | string | Optional (askChatGPT) |
| price | float | Optional (purchaseCompleted) |
| offer_type | string | Optional (monthly/annual) |

## Validation

- Schema files are valid JSON
- Fields align with implementation plan spec
- Ready for data generator (Step 1.2)
