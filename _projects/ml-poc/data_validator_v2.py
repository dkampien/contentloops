"""
Data Validator v2 for Bob Scenario PoC
======================================
Validates synthetic data quality and embedded correlations.

Run: python data_validator_v2.py
"""

import pandas as pd
import numpy as np
from datetime import datetime

DATA_DIR = "data"


def load_data():
    """Load generated CSVs."""
    users = pd.read_csv(f"{DATA_DIR}/users.csv", parse_dates=['created_at'])
    events = pd.read_csv(f"{DATA_DIR}/events.csv", parse_dates=['ts'])
    return users, events


def validate_schema(users: pd.DataFrame, events: pd.DataFrame) -> bool:
    """Validate schema matches expected structure."""
    print("\n1. Schema Validation")
    print("-" * 40)

    # Expected columns
    expected_users = ['user_id', 'created_at', 'age', 'gender', 'geography', 'language', 'lifeChallenge', 'last_ad_intent']
    expected_events = ['event_id', 'user_id', 'ts', 'event_type', 'category', 'price', 'offer_type']

    users_ok = all(col in users.columns for col in expected_users)
    events_ok = all(col in events.columns for col in expected_events)

    print(f"  Users schema: {'PASS' if users_ok else 'FAIL'}")
    if not users_ok:
        print(f"    Missing: {set(expected_users) - set(users.columns)}")

    print(f"  Events schema: {'PASS' if events_ok else 'FAIL'}")
    if not events_ok:
        print(f"    Missing: {set(expected_events) - set(events.columns)}")

    return users_ok and events_ok


def validate_primary_keys(users: pd.DataFrame, events: pd.DataFrame) -> bool:
    """Validate no null primary keys."""
    print("\n2. Primary Key Validation")
    print("-" * 40)

    users_null = users['user_id'].isnull().sum()
    events_null = events['event_id'].isnull().sum()

    users_ok = users_null == 0
    events_ok = events_null == 0

    print(f"  Users null IDs: {users_null} {'PASS' if users_ok else 'FAIL'}")
    print(f"  Events null IDs: {events_null} {'PASS' if events_ok else 'FAIL'}")

    # Check uniqueness
    users_unique = users['user_id'].nunique() == len(users)
    events_unique = events['event_id'].nunique() == len(events)

    print(f"  Users unique IDs: {'PASS' if users_unique else 'FAIL'}")
    print(f"  Events unique IDs: {'PASS' if events_unique else 'FAIL'}")

    return users_ok and events_ok and users_unique and events_unique


def validate_foreign_keys(users: pd.DataFrame, events: pd.DataFrame) -> bool:
    """Validate event user_ids reference valid users."""
    print("\n3. Foreign Key Validation")
    print("-" * 40)

    valid_users = set(users['user_id'])
    event_users = set(events['user_id'].unique())
    orphans = event_users - valid_users

    ok = len(orphans) == 0
    print(f"  Orphan events (no user): {len(orphans)} {'PASS' if ok else 'FAIL'}")
    if not ok:
        print(f"    Orphan user_ids: {list(orphans)[:5]}...")

    return ok


def validate_timestamps(users: pd.DataFrame, events: pd.DataFrame) -> bool:
    """Validate timestamps are in expected range."""
    print("\n4. Timestamp Validation")
    print("-" * 40)

    # Expected range
    min_date = datetime(2024, 1, 1)
    max_date = datetime(2024, 12, 31)

    users_min = users['created_at'].min()
    users_max = users['created_at'].max()
    events_min = events['ts'].min()
    events_max = events['ts'].max()

    users_ok = users_min >= min_date and users_max <= max_date
    events_ok = events_min >= min_date and events_max <= max_date

    print(f"  Users created_at range: {users_min.date()} to {users_max.date()} {'PASS' if users_ok else 'FAIL'}")
    print(f"  Events ts range: {events_min.date()} to {events_max.date()} {'PASS' if events_ok else 'FAIL'}")

    return users_ok and events_ok


def validate_correlations(users: pd.DataFrame, events: pd.DataFrame) -> bool:
    """Validate embedded correlations are detectable."""
    print("\n5. Correlation Validation")
    print("-" * 40)

    purchases = events[events['event_type'] == 'purchaseCompleted'].copy()

    if len(purchases) == 0:
        print("  No purchases found - FAIL")
        return False

    # Price sensitivity correlation
    low_price = purchases[purchases['price'] < 15]
    high_price = purchases[purchases['price'] >= 15]

    low_pct = len(low_price) / len(purchases) * 100
    high_pct = len(high_price) / len(purchases) * 100

    print(f"  Price distribution:")
    print(f"    Low price (<$15): {len(low_price)} ({low_pct:.1f}%)")
    print(f"    High price (>=$15): {len(high_price)} ({high_pct:.1f}%)")

    price_ok = low_pct > 40 and high_pct > 30  # Both segments represented

    # Offer type correlation
    monthly = purchases[purchases['offer_type'] == 'monthly']
    annual = purchases[purchases['offer_type'] == 'annual']

    monthly_pct = len(monthly) / len(purchases) * 100
    annual_pct = len(annual) / len(purchases) * 100

    print(f"  Offer type distribution:")
    print(f"    Monthly: {len(monthly)} ({monthly_pct:.1f}%)")
    print(f"    Annual: {len(annual)} ({annual_pct:.1f}%)")

    offer_ok = monthly_pct > 40 and annual_pct > 20  # Both segments represented

    # Activity level correlation
    user_event_counts = events.groupby('user_id').size().reset_index(name='event_count')
    user_purchase_counts = purchases.groupby('user_id').size().reset_index(name='purchase_count')

    merged = user_event_counts.merge(user_purchase_counts, on='user_id', how='left')
    merged['purchase_count'] = merged['purchase_count'].fillna(0)
    merged['has_purchase'] = merged['purchase_count'] > 0

    # High activity users should have higher purchase rate
    high_activity = merged[merged['event_count'] > merged['event_count'].median()]
    low_activity = merged[merged['event_count'] <= merged['event_count'].median()]

    high_purchase_rate = high_activity['has_purchase'].mean() * 100
    low_purchase_rate = low_activity['has_purchase'].mean() * 100

    print(f"  Activity-Purchase correlation:")
    print(f"    High activity purchase rate: {high_purchase_rate:.1f}%")
    print(f"    Low activity purchase rate: {low_purchase_rate:.1f}%")

    activity_ok = high_purchase_rate > low_purchase_rate

    overall_ok = price_ok and offer_ok and activity_ok
    print(f"\n  Correlation check: {'PASS' if overall_ok else 'FAIL'}")

    return overall_ok


def validate_test_users(users: pd.DataFrame, events: pd.DataFrame) -> bool:
    """Validate Bob, Alice, Charlie have expected characteristics."""
    print("\n6. Test User Validation")
    print("-" * 40)

    test_users = ['bob', 'alice', 'charlie']
    all_ok = True

    for user_id in test_users:
        user = users[users['user_id'] == user_id]
        user_events = events[events['user_id'] == user_id]
        user_purchases = user_events[user_events['event_type'] == 'purchaseCompleted']

        print(f"\n  {user_id.upper()}:")

        if len(user) == 0:
            print(f"    User not found - FAIL")
            all_ok = False
            continue

        print(f"    Events: {len(user_events)}")
        print(f"    Purchases: {len(user_purchases)}")

        if user_id == 'bob':
            # Bob: Dormant, $9.99 monthly, lockscreen intent
            ok = len(user_purchases) > 0 and user_purchases['price'].mean() < 15
            ok = ok and user_purchases['offer_type'].iloc[0] == 'monthly'
            ok = ok and user['last_ad_intent'].iloc[0] == 'lockscreen'
            print(f"    Expected: Low price, monthly, lockscreen intent")
            print(f"    Actual: ${user_purchases['price'].mean():.2f} avg, {user_purchases['offer_type'].iloc[0] if len(user_purchases) > 0 else 'N/A'}, {user['last_ad_intent'].iloc[0]}")
            print(f"    Status: {'PASS' if ok else 'FAIL'}")
            all_ok = all_ok and ok

        elif user_id == 'alice':
            # Alice: Active, $59.99 annual, widget intent
            ok = len(user_purchases) > 0 and user_purchases['price'].mean() >= 15
            ok = ok and user_purchases['offer_type'].iloc[0] == 'annual'
            ok = ok and user['last_ad_intent'].iloc[0] == 'widget'
            print(f"    Expected: High price, annual, widget intent")
            print(f"    Actual: ${user_purchases['price'].mean():.2f} avg, {user_purchases['offer_type'].iloc[0] if len(user_purchases) > 0 else 'N/A'}, {user['last_ad_intent'].iloc[0]}")
            print(f"    Status: {'PASS' if ok else 'FAIL'}")
            all_ok = all_ok and ok

        elif user_id == 'charlie':
            # Charlie: No purchases, dailyverse intent
            ok = len(user_purchases) == 0
            ok = ok and user['last_ad_intent'].iloc[0] == 'dailyverse'
            print(f"    Expected: No purchases, dailyverse intent")
            print(f"    Actual: {len(user_purchases)} purchases, {user['last_ad_intent'].iloc[0]}")
            print(f"    Status: {'PASS' if ok else 'FAIL'}")
            all_ok = all_ok and ok

    return all_ok


def main():
    print("=" * 60)
    print("Data Validator v2")
    print("=" * 60)

    # Load data
    print("\nLoading data...")
    users, events = load_data()
    print(f"  Users: {len(users)} rows")
    print(f"  Events: {len(events)} rows")

    # Run validations
    results = []
    results.append(("Schema", validate_schema(users, events)))
    results.append(("Primary Keys", validate_primary_keys(users, events)))
    results.append(("Foreign Keys", validate_foreign_keys(users, events)))
    results.append(("Timestamps", validate_timestamps(users, events)))
    results.append(("Correlations", validate_correlations(users, events)))
    results.append(("Test Users", validate_test_users(users, events)))

    # Summary
    print("\n" + "=" * 60)
    print("Validation Summary")
    print("=" * 60)

    all_passed = True
    for name, passed in results:
        status = "PASS" if passed else "FAIL"
        print(f"  {name}: {status}")
        all_passed = all_passed and passed

    print("\n" + "=" * 60)
    if all_passed:
        print("All validations PASSED")
    else:
        print("Some validations FAILED - review above for details")
    print("=" * 60)

    return 0 if all_passed else 1


if __name__ == "__main__":
    exit(main())
