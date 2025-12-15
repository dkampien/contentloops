"""
Kumo Prediction Script for Bob Scenario PoC (v2)
=================================================
Predicts: "If I show user X paywall type Y, will they convert?"

Strategy:
- Create separate graphs per paywall type
- Each graph contains only paywallShown events of that type
- Predict purchaseCompleted for users who saw that paywall

Run: python kumo_predict.py
"""

import os
import pandas as pd
from dotenv import load_dotenv

load_dotenv()

DATA_DIR = "data"
OUTPUT_DIR = "output"
TEST_USERS = ['bob', 'alice', 'charlie']
PAYWALL_TYPES = ['sleep', 'anxiety', 'biblestudy', 'generic']


def main():
    print("=" * 50)
    print("Kumo Prediction Pipeline v2")
    print("(Paywall Conversion Propensity)")
    print("=" * 50)

    # Initialize Kumo
    print("\nInitializing Kumo SDK...")
    import kumoai
    from kumoai.experimental.rfm import LocalGraph, KumoRFM

    api_key = os.getenv('KUMO_API_KEY')
    api_url = os.getenv('KUMO_API_URL', 'https://kumorfm.ai/api')

    if not api_key:
        print("Error: KUMO_API_KEY not set")
        return

    kumoai.init(url=api_url, api_key=api_key)
    print("✓ Kumo initialized")

    # Load data
    print("\nLoading data...")
    users_df = pd.read_csv(f"{DATA_DIR}/users.csv")
    events_df = pd.read_csv(f"{DATA_DIR}/events.csv")

    users_df['created_at'] = pd.to_datetime(users_df['created_at'])
    events_df['ts'] = pd.to_datetime(events_df['ts'])

    print(f"  Users: {len(users_df)}")
    print(f"  Events: {len(events_df)}")

    # For each paywall type, predict conversion probability
    print("\n" + "=" * 50)
    print("Running conversion predictions per paywall type...")
    print("=" * 50)

    results = {}

    for paywall_type in PAYWALL_TYPES:
        print(f"\n  {paywall_type} paywall...")

        # Get purchase events for this paywall type
        purchases = events_df[
            (events_df['event_type'] == 'purchaseCompleted') &
            (events_df['paywall_type'] == paywall_type)
        ][['event_id', 'user_id', 'ts']].copy()

        print(f"    Purchases: {len(purchases)}")

        if len(purchases) < 10:
            print(f"    ✗ Not enough purchase data")
            results[paywall_type] = None
            continue

        # Get all behavior events (features for prediction)
        behavior_events = events_df[
            events_df['event_type'].isin([
                'habitDone', 'appOpen',
                'contentViewed_sleep', 'contentViewed_anxiety',
                'contentViewed_bible', 'contentViewed_other'
            ])
        ][['event_id', 'user_id', 'ts', 'event_type']].copy()

        print(f"    Behavior events: {len(behavior_events)}")

        try:
            # Create graph: users -> behavior events + purchase events
            graph = LocalGraph.from_data({
                'users': users_df[['user_id', 'created_at']],
                'behaviors': behavior_events,
                'purchases': purchases
            })

            rfm = KumoRFM(graph)

            # Predict: will user make a purchase (of this paywall type)?
            query = "PREDICT COUNT(purchases.*, 0, 30, days) > 0 FOR EACH users.user_id"

            result = rfm.predict(query, indices=TEST_USERS)
            results[paywall_type] = result
            print(f"    ✓ Done")

        except Exception as e:
            print(f"    ✗ Failed: {e}")
            results[paywall_type] = None

    # Combine results
    print("\n" + "=" * 50)
    print("Results: P(purchase | paywall_type)")
    print("=" * 50)

    combined = pd.DataFrame({'user_id': TEST_USERS})

    for paywall_type, result in results.items():
        if result is not None:
            col = f"p_{paywall_type}"
            result_subset = result[['ENTITY', 'True_PROB']].rename(
                columns={'ENTITY': 'user_id', 'True_PROB': col}
            )
            combined = combined.merge(result_subset, on='user_id', how='left')

    print("\nConversion probabilities:")
    print(combined.to_string(index=False))

    # Save
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    combined.to_csv(f"{OUTPUT_DIR}/raw_predictions.csv", index=False)

    # Pick best paywall per user
    print("\n" + "-" * 50)
    print("Recommended Paywall (argmax)")
    print("-" * 50)

    prob_cols = [f"p_{pt}" for pt in PAYWALL_TYPES]

    for _, row in combined.iterrows():
        user = row['user_id']
        probs = {}
        for pt in PAYWALL_TYPES:
            col = f"p_{pt}"
            if col in row and pd.notna(row[col]):
                probs[pt] = row[col]

        if probs:
            best = max(probs, key=probs.get)
            conf = probs[best]
            print(f"\n  {user}:")
            print(f"    Best paywall: {best} ({conf:.1%})")
            print(f"    All: " + ", ".join(f"{k}={v:.1%}" for k, v in probs.items()))

    print("\n✓ Complete!")


if __name__ == "__main__":
    main()
