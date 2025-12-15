"""
Synthetic Data Generator for Bob Scenario PoC (v2)
===================================================
Generates users with paywall exposure + conversion data.

The key insight: We predict "If I show Bob Sleep Paywall, will he buy?"
NOT "Does Bob like sleep content?"

Run: python data_generator.py
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import random
import uuid

# Configuration
NUM_USERS = 1000
DATA_START = datetime(2024, 1, 1)
DATA_END = datetime(2024, 6, 30)
OUTPUT_DIR = "data"

# Paywall types (what we're predicting conversion for)
PAYWALL_TYPES = ['sleep', 'anxiety', 'biblestudy', 'generic']

# User archetypes (hidden - determines conversion probability)
ARCHETYPES = ['sleep_focused', 'anxiety_focused', 'bible_focused', 'general']


def generate_user_id():
    return f"u_{uuid.uuid4().hex[:12]}"


def get_conversion_probability(archetype: str, paywall_type: str) -> float:
    """
    Core logic: Users convert better on paywalls matching their archetype.
    This is the pattern we want Kumo to learn.
    """
    # Base conversion rates (low - realistic for paywalls)
    base_rate = 0.05

    # Boost when paywall matches archetype
    if archetype == 'sleep_focused' and paywall_type == 'sleep':
        return 0.25  # 5x boost
    elif archetype == 'anxiety_focused' and paywall_type == 'anxiety':
        return 0.25
    elif archetype == 'bible_focused' and paywall_type == 'biblestudy':
        return 0.25
    elif archetype == 'general':
        return 0.08  # Slightly above base for generic users
    else:
        # Mismatched paywall - low conversion
        return base_rate


def generate_users(n: int) -> pd.DataFrame:
    """Generate n synthetic users."""
    users = []

    for i in range(n):
        archetype = random.choices(ARCHETYPES, weights=[0.25, 0.25, 0.25, 0.25])[0]

        # Created date
        days_offset = random.randint(0, 90)
        created_at = DATA_START + timedelta(days=days_offset)

        # Activity level
        activity_level = random.choices(
            ['high', 'medium', 'low', 'dormant'],
            weights=[0.2, 0.3, 0.3, 0.2]
        )[0]

        # Last ad context (what ad they clicked to return)
        if archetype == 'sleep_focused':
            ad_context = random.choices(PAYWALL_TYPES, weights=[0.6, 0.15, 0.1, 0.15])[0]
        elif archetype == 'anxiety_focused':
            ad_context = random.choices(PAYWALL_TYPES, weights=[0.15, 0.6, 0.1, 0.15])[0]
        elif archetype == 'bible_focused':
            ad_context = random.choices(PAYWALL_TYPES, weights=[0.1, 0.1, 0.6, 0.2])[0]
        else:
            ad_context = random.choices(PAYWALL_TYPES, weights=[0.2, 0.2, 0.2, 0.4])[0]

        users.append({
            'user_id': generate_user_id(),
            'created_at': created_at,
            '_archetype': archetype,
            '_activity_level': activity_level,
            'last_ad_context': ad_context
        })

    return pd.DataFrame(users)


def generate_paywall_events(users_df: pd.DataFrame) -> pd.DataFrame:
    """
    Generate paywallShown + purchaseCompleted events.

    Each user sees multiple paywalls over time.
    Conversion depends on archetype + paywall_type match.
    """
    events = []

    for _, user in users_df.iterrows():
        user_id = user['user_id']
        created_at = user['created_at']
        archetype = user['_archetype']
        activity_level = user['_activity_level']

        # Number of paywall exposures based on activity
        if activity_level == 'high':
            num_exposures = random.randint(10, 25)
        elif activity_level == 'medium':
            num_exposures = random.randint(5, 12)
        elif activity_level == 'low':
            num_exposures = random.randint(2, 6)
        else:  # dormant
            num_exposures = random.randint(1, 3)

        # Active period
        if activity_level == 'dormant':
            active_end = created_at + timedelta(weeks=random.randint(2, 6))
        else:
            active_end = DATA_END

        # Generate paywall exposures
        for _ in range(num_exposures):
            # Random timestamp
            max_days = (min(active_end, DATA_END) - created_at).days
            if max_days <= 0:
                continue

            event_time = created_at + timedelta(
                days=random.randint(0, max_days),
                hours=random.randint(8, 22),
                minutes=random.randint(0, 59)
            )

            # Which paywall was shown (somewhat random, but biased by ad context)
            if random.random() < 0.4:
                # 40% chance: show paywall matching their ad context
                paywall_type = user['last_ad_context']
            else:
                # 60% chance: random paywall (A/B testing simulation)
                paywall_type = random.choice(PAYWALL_TYPES)

            # Create paywallShown event
            paywall_event_id = f"e_{uuid.uuid4().hex[:16]}"
            events.append({
                'event_id': paywall_event_id,
                'user_id': user_id,
                'ts': event_time,
                'event_type': 'paywallShown',
                'paywall_type': paywall_type,
                'converted': False  # Will update if purchase happens
            })

            # Did they convert? Based on archetype + paywall match
            conversion_prob = get_conversion_probability(archetype, paywall_type)

            if random.random() < conversion_prob:
                # Purchase event (shortly after paywall)
                purchase_time = event_time + timedelta(minutes=random.randint(1, 30))

                # Price based on paywall type
                if paywall_type in ['sleep', 'anxiety']:
                    price = random.choice([9.99, 14.99])
                elif paywall_type == 'biblestudy':
                    price = random.choice([19.99, 29.99, 59.99])
                else:
                    price = random.choice([9.99, 19.99])

                events.append({
                    'event_id': f"e_{uuid.uuid4().hex[:16]}",
                    'user_id': user_id,
                    'ts': purchase_time,
                    'event_type': 'purchaseCompleted',
                    'paywall_type': paywall_type,  # Which paywall led to this purchase
                    'price': price
                })

                # Mark the paywall event as converted
                events[-2]['converted'] = True

    return pd.DataFrame(events)


def generate_behavior_events(users_df: pd.DataFrame) -> pd.DataFrame:
    """
    Generate behavioral events that signal user archetype.
    These are the features Kumo will use to learn patterns.
    """
    events = []

    for _, user in users_df.iterrows():
        user_id = user['user_id']
        created_at = user['created_at']
        archetype = user['_archetype']
        activity_level = user['_activity_level']

        # Number of behavior events
        if activity_level == 'high':
            num_events = random.randint(50, 150)
        elif activity_level == 'medium':
            num_events = random.randint(20, 60)
        elif activity_level == 'low':
            num_events = random.randint(5, 25)
        else:
            num_events = random.randint(3, 15)

        # Active period
        if activity_level == 'dormant':
            active_end = created_at + timedelta(weeks=random.randint(2, 6))
        else:
            active_end = DATA_END

        for _ in range(num_events):
            max_days = (min(active_end, DATA_END) - created_at).days
            if max_days <= 0:
                continue

            event_time = created_at + timedelta(
                days=random.randint(0, max_days),
                hours=random.randint(0, 23),
                minutes=random.randint(0, 59)
            )

            # Event type based on archetype (these signal preferences)
            if archetype == 'sleep_focused':
                event_type = random.choices(
                    ['habitDone', 'contentViewed_sleep', 'contentViewed_other', 'appOpen'],
                    weights=[0.3, 0.4, 0.1, 0.2]
                )[0]
            elif archetype == 'anxiety_focused':
                event_type = random.choices(
                    ['habitDone', 'contentViewed_anxiety', 'contentViewed_other', 'appOpen'],
                    weights=[0.3, 0.4, 0.1, 0.2]
                )[0]
            elif archetype == 'bible_focused':
                event_type = random.choices(
                    ['habitDone', 'contentViewed_bible', 'contentViewed_other', 'appOpen'],
                    weights=[0.3, 0.4, 0.1, 0.2]
                )[0]
            else:
                event_type = random.choices(
                    ['habitDone', 'contentViewed_other', 'appOpen'],
                    weights=[0.3, 0.3, 0.4]
                )[0]

            events.append({
                'event_id': f"e_{uuid.uuid4().hex[:16]}",
                'user_id': user_id,
                'ts': event_time,
                'event_type': event_type,
                'paywall_type': None,
                'price': None
            })

    return pd.DataFrame(events)


def create_test_users() -> pd.DataFrame:
    """Create Bob, Alice, Charlie with known archetypes."""
    test_users = [
        {
            'user_id': 'bob',
            'created_at': DATA_START,
            '_archetype': 'sleep_focused',
            '_activity_level': 'dormant',
            'last_ad_context': 'sleep'
        },
        {
            'user_id': 'alice',
            'created_at': DATA_START + timedelta(days=30),
            '_archetype': 'bible_focused',
            '_activity_level': 'high',
            'last_ad_context': 'biblestudy'
        },
        {
            'user_id': 'charlie',
            'created_at': DATA_START + timedelta(days=15),
            '_archetype': 'anxiety_focused',
            '_activity_level': 'medium',
            'last_ad_context': 'anxiety'
        }
    ]
    return pd.DataFrame(test_users)


def main():
    print("=" * 50)
    print("Synthetic Data Generator v2")
    print("(Paywall Conversion Focus)")
    print("=" * 50)

    random.seed(42)
    np.random.seed(42)

    # Generate users
    print("\nGenerating users...")
    users_df = generate_users(NUM_USERS)
    test_users_df = create_test_users()
    users_df = pd.concat([test_users_df, users_df], ignore_index=True)
    print(f"  Total users: {len(users_df)}")

    # Generate paywall + purchase events
    print("\nGenerating paywall/purchase events...")
    paywall_events = generate_paywall_events(users_df)
    print(f"  Paywall events: {len(paywall_events)}")

    # Generate behavior events
    print("\nGenerating behavior events...")
    behavior_events = generate_behavior_events(users_df)
    print(f"  Behavior events: {len(behavior_events)}")

    # Combine all events
    all_events = pd.concat([paywall_events, behavior_events], ignore_index=True)
    all_events = all_events.sort_values('ts').reset_index(drop=True)

    # Clean up users df (remove internal columns)
    users_output = users_df.drop(columns=['_archetype', '_activity_level'])

    # Save
    print(f"\nSaving to {OUTPUT_DIR}/...")
    users_output.to_csv(f"{OUTPUT_DIR}/users.csv", index=False)
    all_events.to_csv(f"{OUTPUT_DIR}/events.csv", index=False)

    # Stats
    print("\n" + "=" * 50)
    print("Summary")
    print("=" * 50)

    print("\nPaywall exposures by type:")
    paywall_shown = all_events[all_events['event_type'] == 'paywallShown']
    print(paywall_shown['paywall_type'].value_counts())

    print("\nPurchases by paywall type:")
    purchases = all_events[all_events['event_type'] == 'purchaseCompleted']
    print(purchases['paywall_type'].value_counts())

    print("\nConversion rates by paywall type:")
    for pt in PAYWALL_TYPES:
        shown = len(paywall_shown[paywall_shown['paywall_type'] == pt])
        bought = len(purchases[purchases['paywall_type'] == pt])
        rate = bought / shown * 100 if shown > 0 else 0
        print(f"  {pt}: {bought}/{shown} = {rate:.1f}%")

    print("\nTest users:")
    for user_id in ['bob', 'alice', 'charlie']:
        user_events = all_events[all_events['user_id'] == user_id]
        user_paywalls = user_events[user_events['event_type'] == 'paywallShown']
        user_purchases = user_events[user_events['event_type'] == 'purchaseCompleted']
        print(f"\n  {user_id}:")
        print(f"    Paywall exposures: {len(user_paywalls)}")
        print(f"    Purchases: {len(user_purchases)}")
        if len(user_purchases) > 0:
            print(f"    Purchased on: {user_purchases['paywall_type'].tolist()}")

    print("\n✓ Data generation complete!")


if __name__ == "__main__":
    main()
