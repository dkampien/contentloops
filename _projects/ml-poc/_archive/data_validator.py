"""
Data Validator for Bob Scenario PoC
====================================
Validates synthetic data quality before sending to Kumo.

Run: python data_validator.py
"""

import pandas as pd
import sys

DATA_DIR = "data"


def validate_users(df: pd.DataFrame) -> list:
    """Validate users.csv"""
    errors = []

    # Check for null primary keys
    null_ids = df['user_id'].isnull().sum()
    if null_ids > 0:
        errors.append(f"Found {null_ids} null user_ids")

    # Check for duplicates
    dupes = df['user_id'].duplicated().sum()
    if dupes > 0:
        errors.append(f"Found {dupes} duplicate user_ids")

    # Check required columns exist
    required = ['user_id', 'created_at', 'last_ad_context']
    missing = [c for c in required if c not in df.columns]
    if missing:
        errors.append(f"Missing columns: {missing}")

    # Check ad_context values
    valid_contexts = {'sleep', 'anxiety', 'biblestudy', 'generic'}
    invalid = set(df['last_ad_context'].unique()) - valid_contexts
    if invalid:
        errors.append(f"Invalid ad_context values: {invalid}")

    return errors


def validate_events(df: pd.DataFrame, users_df: pd.DataFrame) -> list:
    """Validate events.csv"""
    errors = []

    # Check for null primary keys
    null_ids = df['event_id'].isnull().sum()
    if null_ids > 0:
        errors.append(f"Found {null_ids} null event_ids")

    # Check for duplicates
    dupes = df['event_id'].duplicated().sum()
    if dupes > 0:
        errors.append(f"Found {dupes} duplicate event_ids")

    # Check foreign key integrity
    orphan_events = ~df['user_id'].isin(users_df['user_id'])
    if orphan_events.sum() > 0:
        errors.append(f"Found {orphan_events.sum()} events with invalid user_id")

    # Check required columns
    required = ['event_id', 'user_id', 'ts', 'event_type']
    missing = [c for c in required if c not in df.columns]
    if missing:
        errors.append(f"Missing columns: {missing}")

    # Check event_type values
    valid_types = {
        'habitDone', 'askChatGPT', 'spiritualMeterDone',
        'ahaBedtimeStories', 'ahaGuidedBreathing', 'ahaBibleStudyGuides',
        'purchaseCompleted', 'paywallShown'
    }
    invalid = set(df['event_type'].unique()) - valid_types
    if invalid:
        errors.append(f"Invalid event_type values: {invalid}")

    # Check timestamp range
    df['ts'] = pd.to_datetime(df['ts'])
    min_ts = df['ts'].min()
    max_ts = df['ts'].max()
    if min_ts.year < 2024:
        errors.append(f"Timestamps too early: min={min_ts}")
    if max_ts.year > 2024:
        errors.append(f"Timestamps too late: max={max_ts}")

    return errors


def validate_correlations(users_df: pd.DataFrame, events_df: pd.DataFrame) -> dict:
    """Check that embedded correlations are detectable."""
    results = {}

    # Merge to get user archetype info via ad_context proxy
    events_with_context = events_df.merge(
        users_df[['user_id', 'last_ad_context']],
        on='user_id'
    )

    # Check: sleep ad context users should have more ahaBedtimeStories
    for context in ['sleep', 'anxiety', 'biblestudy']:
        context_users = events_with_context[events_with_context['last_ad_context'] == context]
        other_users = events_with_context[events_with_context['last_ad_context'] != context]

        if context == 'sleep':
            target_event = 'ahaBedtimeStories'
        elif context == 'anxiety':
            target_event = 'ahaGuidedBreathing'
        else:
            target_event = 'ahaBibleStudyGuides'

        context_rate = (context_users['event_type'] == target_event).mean()
        other_rate = (other_users['event_type'] == target_event).mean()

        results[f'{context}_correlation'] = {
            'target_event': target_event,
            'context_rate': round(context_rate * 100, 2),
            'other_rate': round(other_rate * 100, 2),
            'ratio': round(context_rate / other_rate, 2) if other_rate > 0 else 'inf'
        }

    return results


def validate_test_users(users_df: pd.DataFrame, events_df: pd.DataFrame) -> dict:
    """Validate Bob, Alice, Charlie have expected characteristics."""
    results = {}

    test_cases = {
        'bob': {'expected_topic': 'ahaBedtimeStories', 'expected_activity': 'low'},
        'alice': {'expected_topic': 'ahaBibleStudyGuides', 'expected_activity': 'high'},
        'charlie': {'expected_topic': 'ahaGuidedBreathing', 'expected_activity': 'medium'}
    }

    for user_id, expected in test_cases.items():
        user_events = events_df[events_df['user_id'] == user_id]

        if len(user_events) == 0:
            results[user_id] = {'error': 'No events found'}
            continue

        # Find dominant aha event
        aha_events = user_events[user_events['event_type'].str.startswith('aha')]
        if len(aha_events) > 0:
            top_aha = aha_events['event_type'].value_counts().idxmax()
        else:
            top_aha = None

        # Check activity level
        event_count = len(user_events)
        if event_count > 200:
            activity = 'high'
        elif event_count > 100:
            activity = 'medium'
        else:
            activity = 'low'

        results[user_id] = {
            'total_events': event_count,
            'top_aha_event': top_aha,
            'expected_topic': expected['expected_topic'],
            'topic_match': top_aha == expected['expected_topic'],
            'activity_level': activity,
            'expected_activity': expected['expected_activity'],
            'activity_match': activity == expected['expected_activity']
        }

    return results


def main():
    print("=" * 50)
    print("Data Validator")
    print("=" * 50)

    # Load data
    print("\nLoading data...")
    try:
        users_df = pd.read_csv(f"{DATA_DIR}/users.csv")
        events_df = pd.read_csv(f"{DATA_DIR}/events.csv")
        print(f"  Users: {len(users_df)} rows")
        print(f"  Events: {len(events_df)} rows")
    except FileNotFoundError as e:
        print(f"Error: {e}")
        print("Run data_generator.py first.")
        sys.exit(1)

    # Validate users
    print("\n" + "-" * 50)
    print("Validating users.csv...")
    user_errors = validate_users(users_df)
    if user_errors:
        for e in user_errors:
            print(f"  ✗ {e}")
    else:
        print("  ✓ All checks passed")

    # Validate events
    print("\n" + "-" * 50)
    print("Validating events.csv...")
    event_errors = validate_events(events_df, users_df)
    if event_errors:
        for e in event_errors:
            print(f"  ✗ {e}")
    else:
        print("  ✓ All checks passed")

    # Check correlations
    print("\n" + "-" * 50)
    print("Checking embedded correlations...")
    correlations = validate_correlations(users_df, events_df)
    for name, data in correlations.items():
        ratio = data['ratio']
        status = "✓" if (isinstance(ratio, float) and ratio > 1.2) else "⚠"
        print(f"  {status} {name}: {data['target_event']}")
        print(f"      Context users: {data['context_rate']}% | Others: {data['other_rate']}% | Ratio: {ratio}x")

    # Validate test users
    print("\n" + "-" * 50)
    print("Validating test users (Bob, Alice, Charlie)...")
    test_results = validate_test_users(users_df, events_df)
    for user_id, data in test_results.items():
        if 'error' in data:
            print(f"  ✗ {user_id}: {data['error']}")
        else:
            topic_status = "✓" if data['topic_match'] else "✗"
            activity_status = "✓" if data['activity_match'] else "⚠"
            print(f"  {user_id}:")
            print(f"    {topic_status} Topic: {data['top_aha_event']} (expected: {data['expected_topic']})")
            print(f"    {activity_status} Activity: {data['activity_level']} (expected: {data['expected_activity']})")
            print(f"      Events: {data['total_events']}")

    # Summary
    print("\n" + "=" * 50)
    all_errors = user_errors + event_errors
    if all_errors:
        print(f"VALIDATION FAILED - {len(all_errors)} errors found")
        sys.exit(1)
    else:
        print("VALIDATION PASSED")
        sys.exit(0)


if __name__ == "__main__":
    main()
