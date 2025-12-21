"""
Synthetic Data Generator v2 for Bob Scenario PoC
=================================================
Generates BCEvents-aligned synthetic data with embedded correlations for:
- Price Sensitivity (High = buys cheap, Low = willing to pay more)
- Offer Type (Monthly vs Annual preference)
- P(conversion) (likelihood of any purchase)

Key insight: Intent (feature) comes from ad (INPUT), ML predicts the other attributes.

Run: python data_generator_v2.py
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import random
import uuid
import os

# Configuration
NUM_USERS = 1000
DATA_START = datetime(2024, 1, 1)
DATA_END = datetime(2024, 12, 15)  # ~1 year of data
OUTPUT_DIR = "data"

# Domain values
AD_INTENTS = ['lockscreen', 'widget', 'dailyverse', 'generic']
GEOGRAPHIES = ['US', 'MX', 'BR', 'DE', 'GB']
LANGUAGES = ['en', 'es', 'pt', 'de']
AGES = ['13-17', '18-24', '25-34', '35-44', '45-54', '55+']
GENDERS = ['m', 'f']
LIFE_CHALLENGES = ['anxiety', 'sleep', 'faith', 'relationships', 'grief', 'purpose']

# Event types (BCEvents-aligned)
ENGAGEMENT_EVENTS = ['habitDone', 'spiritualMeterDone']
CONTENT_EVENTS = ['ahaBedtimeStories', 'ahaGuidedBreathing', 'ahaBibleStudyGuides']
CHAT_CATEGORIES = ['anxiety', 'bible', 'relationships', 'general', 'sleep', 'gratitude']


def generate_user_id():
    return f"u_{uuid.uuid4().hex[:12]}"


def generate_event_id():
    return f"e_{uuid.uuid4().hex[:16]}"


def generate_users(n: int) -> pd.DataFrame:
    """Generate n synthetic users with embedded behavioral profiles."""
    users = []

    for i in range(n):
        # Hidden profile attributes (drive correlations, not in output)
        price_sensitive = random.random() < 0.6  # 60% are price sensitive
        prefers_annual = random.random() < 0.35  # 35% prefer annual
        activity_level = random.choices(
            ['high', 'medium', 'low', 'dormant'],
            weights=[0.2, 0.35, 0.25, 0.2]
        )[0]

        # Geography affects language
        geography = random.choices(
            GEOGRAPHIES,
            weights=[0.4, 0.15, 0.15, 0.15, 0.15]  # US-heavy
        )[0]

        language = {
            'US': 'en', 'GB': 'en',
            'MX': 'es', 'BR': 'pt', 'DE': 'de'
        }.get(geography, 'en')

        # Created date
        days_offset = random.randint(0, 180)
        created_at = DATA_START + timedelta(days=days_offset)

        # Ad intent (feature - this is INPUT, not predicted)
        ad_intent = random.choice(AD_INTENTS)

        users.append({
            'user_id': generate_user_id(),
            'created_at': created_at,
            'age': random.choice(AGES),
            'gender': random.choice(GENDERS),
            'geography': geography,
            'language': language,
            'lifeChallenge': random.choice(LIFE_CHALLENGES),
            'last_ad_intent': ad_intent,
            # Hidden attributes (will be dropped before saving)
            '_price_sensitive': price_sensitive,
            '_prefers_annual': prefers_annual,
            '_activity_level': activity_level,
        })

    return pd.DataFrame(users)


def create_test_users() -> pd.DataFrame:
    """Create Bob, Alice, Charlie with known profiles for validation."""
    test_users = [
        {
            'user_id': 'bob',
            'created_at': DATA_START,
            'age': '35-44',
            'gender': 'm',
            'geography': 'US',
            'language': 'en',
            'lifeChallenge': 'sleep',
            'last_ad_intent': 'lockscreen',
            # Bob: Dormant 6mo, bought $9.99 monthly before
            # Expected: High price sens, Monthly, low P(conv) - dormant
            '_price_sensitive': True,
            '_prefers_annual': False,
            '_activity_level': 'dormant',
        },
        {
            'user_id': 'alice',
            'created_at': DATA_START + timedelta(days=30),
            'age': '25-34',
            'gender': 'f',
            'geography': 'US',
            'language': 'en',
            'lifeChallenge': 'faith',
            'last_ad_intent': 'widget',
            # Alice: Active, bought $59.99 annual
            # Expected: Low price sens, Annual, high P(conv)
            '_price_sensitive': False,
            '_prefers_annual': True,
            '_activity_level': 'high',
        },
        {
            'user_id': 'charlie',
            'created_at': DATA_START + timedelta(days=60),
            'age': '18-24',
            'gender': 'm',
            'geography': 'MX',
            'language': 'es',
            'lifeChallenge': 'anxiety',
            'last_ad_intent': 'dailyverse',
            # Charlie: Medium activity, no purchases
            # Expected: High price sens (default), Monthly (default), low P(conv) - no purchases
            '_price_sensitive': True,  # Default for no purchase history
            '_prefers_annual': False,  # Default for no purchase history
            '_activity_level': 'medium',
        },
    ]
    return pd.DataFrame(test_users)


def generate_events(users_df: pd.DataFrame) -> pd.DataFrame:
    """Generate BCEvents-style events with embedded correlations."""
    events = []

    for _, user in users_df.iterrows():
        user_id = user['user_id']
        created_at = user['created_at']
        price_sensitive = user['_price_sensitive']
        prefers_annual = user['_prefers_annual']
        activity_level = user['_activity_level']

        # Determine active window based on activity level
        if activity_level == 'dormant':
            # Dormant users were active for a short period, then stopped
            active_end = created_at + timedelta(weeks=random.randint(4, 10))
        else:
            active_end = DATA_END

        # Number of engagement events based on activity
        num_engagement = {
            'high': random.randint(80, 150),
            'medium': random.randint(30, 80),
            'low': random.randint(10, 35),
            'dormant': random.randint(5, 20),
        }[activity_level]

        # Generate engagement events (habitDone, spiritualMeterDone)
        for _ in range(num_engagement):
            max_days = (min(active_end, DATA_END) - created_at).days
            if max_days <= 0:
                continue

            event_time = created_at + timedelta(
                days=random.randint(0, max_days),
                hours=random.randint(6, 23),
                minutes=random.randint(0, 59)
            )

            events.append({
                'event_id': generate_event_id(),
                'user_id': user_id,
                'ts': event_time,
                'event_type': random.choice(ENGAGEMENT_EVENTS),
                'category': None,
                'price': None,
                'offer_type': None,
            })

        # Generate askChatGPT events with category
        num_chat = int(num_engagement * random.uniform(0.3, 0.6))
        for _ in range(num_chat):
            max_days = (min(active_end, DATA_END) - created_at).days
            if max_days <= 0:
                continue

            event_time = created_at + timedelta(
                days=random.randint(0, max_days),
                hours=random.randint(6, 23),
                minutes=random.randint(0, 59)
            )

            # Category biased by lifeChallenge
            if random.random() < 0.6:
                category = user['lifeChallenge'] if user['lifeChallenge'] in CHAT_CATEGORIES else 'general'
            else:
                category = random.choice(CHAT_CATEGORIES)

            events.append({
                'event_id': generate_event_id(),
                'user_id': user_id,
                'ts': event_time,
                'event_type': 'askChatGPT',
                'category': category,
                'price': None,
                'offer_type': None,
            })

        # Generate "aha" content events
        num_aha = int(num_engagement * random.uniform(0.1, 0.3))
        for _ in range(num_aha):
            max_days = (min(active_end, DATA_END) - created_at).days
            if max_days <= 0:
                continue

            event_time = created_at + timedelta(
                days=random.randint(0, max_days),
                hours=random.randint(6, 23),
                minutes=random.randint(0, 59)
            )

            events.append({
                'event_id': generate_event_id(),
                'user_id': user_id,
                'ts': event_time,
                'event_type': random.choice(CONTENT_EVENTS),
                'category': None,
                'price': None,
                'offer_type': None,
            })

        # Generate paywallShown events
        num_paywalls = random.randint(2, 8)
        for _ in range(num_paywalls):
            max_days = (min(active_end, DATA_END) - created_at).days
            if max_days <= 0:
                continue

            event_time = created_at + timedelta(
                days=random.randint(0, max_days),
                hours=random.randint(8, 22),
                minutes=random.randint(0, 59)
            )

            events.append({
                'event_id': generate_event_id(),
                'user_id': user_id,
                'ts': event_time,
                'event_type': 'paywallShown',
                'category': None,
                'price': None,
                'offer_type': None,
            })

        # Generate purchaseCompleted events (based on profile)
        # Key correlations:
        # - price_sensitive → buys at low price (<$15)
        # - prefers_annual → buys annual offer
        # - high activity → more likely to have purchases

        # Probability of having made a purchase
        purchase_prob = {
            'high': 0.7,
            'medium': 0.4,
            'low': 0.2,
            'dormant': 0.3,  # Dormant users may have purchased before going dormant
        }[activity_level]

        # Test user overrides
        if user_id == 'charlie':
            # Charlie: No purchases (to test default behavior)
            continue
        elif user_id == 'bob':
            # Bob: Must have purchase history ($9.99 monthly)
            pass  # Force purchase below
        elif user_id == 'alice':
            # Alice: Must have purchase history ($59.99 annual)
            pass  # Force purchase below
        elif random.random() >= purchase_prob:
            # Random users: skip if didn't pass probability check
            continue

        # Generate purchases (test users always reach here)
        # Determine price based on price sensitivity
        if price_sensitive:
            price = random.choice([4.99, 9.99, 12.99])  # Low prices (<$15)
        else:
            price = random.choice([19.99, 29.99, 49.99, 59.99])  # High prices (>$15)

        # Determine offer type
        if prefers_annual:
            offer_type = 'annual'
        else:
            offer_type = 'monthly'

        # Number of purchases (returning users may have multiple)
        num_purchases = 1 if activity_level in ['low', 'dormant'] else random.randint(1, 3)

        for _ in range(num_purchases):
            max_days = (min(active_end, DATA_END) - created_at).days
            if max_days <= 0:
                continue

            event_time = created_at + timedelta(
                days=random.randint(0, max_days),
                hours=random.randint(8, 22),
                minutes=random.randint(0, 59)
            )

            events.append({
                'event_id': generate_event_id(),
                'user_id': user_id,
                'ts': event_time,
                'event_type': 'purchaseCompleted',
                'category': None,
                'price': price,
                'offer_type': offer_type,
            })

    return pd.DataFrame(events)


def main():
    print("=" * 60)
    print("Synthetic Data Generator v2 (BCEvents-Aligned)")
    print("=" * 60)

    # Set seeds for reproducibility
    random.seed(42)
    np.random.seed(42)

    # Ensure output directory exists
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    # Generate users
    print("\nGenerating users...")
    users_df = generate_users(NUM_USERS)
    test_users_df = create_test_users()
    users_df = pd.concat([test_users_df, users_df], ignore_index=True)
    print(f"  Total users: {len(users_df)}")

    # Generate events
    print("\nGenerating events...")
    events_df = generate_events(users_df)
    events_df = events_df.sort_values('ts').reset_index(drop=True)
    print(f"  Total events: {len(events_df)}")

    # Remove hidden columns from users before saving
    users_output = users_df.drop(columns=['_price_sensitive', '_prefers_annual', '_activity_level'])

    # Save CSVs
    print(f"\nSaving to {OUTPUT_DIR}/...")
    users_output.to_csv(f"{OUTPUT_DIR}/users.csv", index=False)
    events_df.to_csv(f"{OUTPUT_DIR}/events.csv", index=False)

    # Print statistics
    print("\n" + "=" * 60)
    print("Data Summary")
    print("=" * 60)

    print("\nEvent type distribution:")
    print(events_df['event_type'].value_counts().to_string())

    purchases = events_df[events_df['event_type'] == 'purchaseCompleted']
    print(f"\nTotal purchases: {len(purchases)}")

    if len(purchases) > 0:
        print("\nPurchase price distribution:")
        print(purchases['price'].describe())

        print("\nOffer type distribution:")
        print(purchases['offer_type'].value_counts().to_string())

        # Check correlations
        low_price = purchases[purchases['price'] < 15]
        high_price = purchases[purchases['price'] >= 15]
        print(f"\nPrice correlation check:")
        print(f"  Low price purchases (<$15): {len(low_price)}")
        print(f"  High price purchases (>=$15): {len(high_price)}")

    # Test user details
    print("\n" + "=" * 60)
    print("Test User Profiles")
    print("=" * 60)

    for user_id in ['bob', 'alice', 'charlie']:
        user_events = events_df[events_df['user_id'] == user_id]
        user_purchases = user_events[user_events['event_type'] == 'purchaseCompleted']

        print(f"\n{user_id.upper()}:")
        print(f"  Total events: {len(user_events)}")
        print(f"  Purchases: {len(user_purchases)}")

        if len(user_purchases) > 0:
            avg_price = user_purchases['price'].mean()
            offer_types = user_purchases['offer_type'].unique()
            print(f"  Avg purchase price: ${avg_price:.2f}")
            print(f"  Offer types: {list(offer_types)}")
            print(f"  → Expected: {'High' if avg_price < 15 else 'Low'} price sensitivity")
            print(f"  → Expected: {'Annual' if 'annual' in offer_types else 'Monthly'} preference")
        else:
            print(f"  → No purchases (default: High price sens, Monthly)")

    print("\n" + "=" * 60)
    print("Data generation complete!")
    print("=" * 60)
    print(f"\nFiles created:")
    print(f"  - {OUTPUT_DIR}/users.csv ({len(users_output)} rows)")
    print(f"  - {OUTPUT_DIR}/events.csv ({len(events_df)} rows)")


if __name__ == "__main__":
    main()
