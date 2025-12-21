"""
Kumo Prediction Script v2 for Bob Scenario PoC
===============================================
Loads synthetic data into KumoRFM and runs multi-head predictions:
- Price Sensitivity: Will user buy at low price (<$15)?
- Offer Type: Will user buy annual?
- P(conversion): Will user buy at all?

Run: python kumo_predict_v2.py
"""

import os
import pandas as pd
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

DATA_DIR = "data"
OUTPUT_DIR = "output"


def load_data():
    """Load generated CSVs."""
    print("Loading data...")
    users = pd.read_csv(f"{DATA_DIR}/users.csv", parse_dates=['created_at'])
    events = pd.read_csv(f"{DATA_DIR}/events.csv", parse_dates=['ts'])
    print(f"  Users: {len(users)} rows")
    print(f"  Events: {len(events)} rows")
    return users, events


def setup_kumo():
    """Initialize Kumo SDK."""
    import kumoai
    from kumoai.experimental.rfm import LocalGraph, KumoRFM

    api_key = os.getenv('KUMO_API_KEY')
    api_url = os.getenv('KUMO_API_URL', 'https://kumorfm.ai/api')

    if not api_key:
        raise ValueError("KUMO_API_KEY not set in environment")

    print(f"\nInitializing Kumo...")
    print(f"  API URL: {api_url}")
    kumoai.init(url=api_url, api_key=api_key)
    print("  Kumo initialized")

    return LocalGraph, KumoRFM


def create_graph(LocalGraph, users_df: pd.DataFrame, events_df: pd.DataFrame):
    """Create LocalGraph from DataFrames."""
    print("\nCreating LocalGraph...")

    graph = LocalGraph.from_data({
        'users': users_df,
        'events': events_df
    })

    print(f"  Graph created successfully")
    return graph


def run_predictions(KumoRFM, graph, user_ids: list) -> pd.DataFrame:
    """Run all prediction heads and combine results.

    Strategy:
    - P(conversion): Use Kumo GNN to predict purchase likelihood (purchaseCompleted events)
    - Price Sensitivity: Derive from historical purchase prices (behavioral signal)
    - Offer Type: Derive from historical offer preferences (behavioral signal)

    Note: P(conversion) uses inline WHERE filter to predict purchases specifically,
    not just any future engagement.
    """
    print("\nInitializing KumoRFM...")
    rfm = KumoRFM(graph)
    print("  KumoRFM ready")

    results = pd.DataFrame({'user_id': user_ids})
    BATCH_SIZE = 999

    # =========================================================================
    # Prediction Head 1: P(conversion) - Will user purchase in next 30 days?
    # Uses Kumo GNN with inline WHERE filter to predict purchase likelihood
    # =========================================================================
    print("\n--- Prediction Head 1: P(conversion) via Kumo GNN ---")
    query_conversion = "PREDICT COUNT(events.* WHERE events.event_type = 'purchaseCompleted', 0, 30, days) > 0 FOR EACH users.user_id"
    print(f"  Query: {query_conversion}")

    try:
        # Batch predictions to handle 1000 entity limit
        all_predictions = []
        for i in range(0, len(user_ids), BATCH_SIZE):
            batch = user_ids[i:i + BATCH_SIZE]
            print(f"  Processing batch {i // BATCH_SIZE + 1} ({len(batch)} users)...")
            result = rfm.predict(query_conversion, indices=batch)
            all_predictions.append(result)

        # Combine results
        combined = pd.concat(all_predictions, ignore_index=True)
        print(f"  Combined result shape: {combined.shape}")
        print(f"  Result columns: {combined.columns.tolist()}")

        # Kumo returns columns: ENTITY, ANCHOR_TIMESTAMP, TARGET_PRED, False_PROB, True_PROB
        # True_PROB is the probability of having future events
        combined = combined.rename(columns={'ENTITY': 'user_id', 'True_PROB': 'conversion_prob'})
        results = results.merge(
            combined[['user_id', 'conversion_prob']],
            on='user_id',
            how='left'
        )
        results['conversion_prob'] = results['conversion_prob'].fillna(0.5)
        print(f"  Kumo prediction successful!")

    except Exception as e:
        print(f"  Kumo prediction failed: {e}")
        print("  Using fallback: activity-based heuristic...")

        # Fallback: estimate conversion from event count
        events = pd.read_csv(f"{DATA_DIR}/events.csv")
        user_activity = events.groupby('user_id').size().reset_index(name='event_count')

        # Normalize to 0-1 probability (higher activity = higher conversion prob)
        max_events = user_activity['event_count'].max()
        user_activity['conversion_prob'] = (user_activity['event_count'] / max_events * 0.6 + 0.2).clip(0.1, 0.9)

        results = results.merge(user_activity[['user_id', 'conversion_prob']], on='user_id', how='left')
        results['conversion_prob'] = results['conversion_prob'].fillna(0.5)

    # =========================================================================
    # Prediction Head 2: Price Sensitivity - Historical behavioral signal
    # High prob = user IS price sensitive (buys cheap)
    # =========================================================================
    print("\n--- Prediction Head 2: Price Sensitivity (Historical Analysis) ---")

    events = pd.read_csv(f"{DATA_DIR}/events.csv")
    purchases = events[events['event_type'] == 'purchaseCompleted'].copy()

    if len(purchases) > 0:
        # Calculate average purchase price per user
        user_price = purchases.groupby('user_id').agg({'price': 'mean'}).reset_index()

        # Price sensitive if avg price < $15 (threshold from plan)
        user_price['price_sens_prob'] = (user_price['price'] < 15).astype(float)

        # For users with no purchases, default to price sensitive (0.6)
        results = results.merge(user_price[['user_id', 'price_sens_prob']], on='user_id', how='left')
        results['price_sens_prob'] = results['price_sens_prob'].fillna(0.6)

        users_with_purchase = len(user_price)
        price_sens_users = (user_price['price_sens_prob'] == 1.0).sum()
        print(f"  Users with purchases: {users_with_purchase}")
        print(f"  Price sensitive users: {price_sens_users} ({price_sens_users/users_with_purchase*100:.1f}%)")
    else:
        results['price_sens_prob'] = 0.6
        print("  No purchases found, defaulting to 0.6")

    # =========================================================================
    # Prediction Head 3: Offer Type - Historical behavioral signal
    # High prob = user prefers annual offers
    # =========================================================================
    print("\n--- Prediction Head 3: Offer Type (Historical Analysis) ---")

    if len(purchases) > 0:
        # Calculate proportion of annual purchases per user
        user_offer = purchases.groupby('user_id').agg({
            'offer_type': lambda x: (x == 'annual').mean()
        }).reset_index()
        user_offer.columns = ['user_id', 'annual_prob']

        # For users with no purchases, default to monthly preference (0.35)
        results = results.merge(user_offer, on='user_id', how='left')
        results['annual_prob'] = results['annual_prob'].fillna(0.35)

        annual_pref_users = (user_offer['annual_prob'] > 0.5).sum()
        print(f"  Users preferring annual: {annual_pref_users} ({annual_pref_users/len(user_offer)*100:.1f}%)")
    else:
        results['annual_prob'] = 0.35
        print("  No purchases found, defaulting to 0.35")

    return results


def main():
    print("=" * 60)
    print("Kumo Prediction Script v2")
    print("=" * 60)

    # Load data
    users_df, events_df = load_data()

    # Setup Kumo
    LocalGraph, KumoRFM = setup_kumo()

    # Create graph
    graph = create_graph(LocalGraph, users_df, events_df)

    # Get all user IDs (focus on test users for validation)
    all_user_ids = users_df['user_id'].tolist()
    test_user_ids = ['bob', 'alice', 'charlie']

    print(f"\nTotal users: {len(all_user_ids)}")
    print(f"Test users: {test_user_ids}")

    # Run predictions for all users
    print("\n" + "=" * 60)
    print("Running Predictions")
    print("=" * 60)

    results = run_predictions(KumoRFM, graph, all_user_ids)

    # Ensure output directory exists
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    # Save results
    output_path = f"{OUTPUT_DIR}/raw_predictions.csv"
    results.to_csv(output_path, index=False)
    print(f"\n\nResults saved to: {output_path}")

    # Show test user results
    print("\n" + "=" * 60)
    print("Test User Predictions")
    print("=" * 60)

    for user_id in test_user_ids:
        user_result = results[results['user_id'] == user_id]
        if len(user_result) > 0:
            row = user_result.iloc[0]
            print(f"\n{user_id.upper()}:")
            print(f"  conversion_prob: {row.get('conversion_prob', 'N/A'):.3f}")
            print(f"  price_sens_prob: {row.get('price_sens_prob', 'N/A'):.3f}")
            print(f"  annual_prob: {row.get('annual_prob', 'N/A'):.3f}")

            # Interpret
            price_tier = "low" if row.get('price_sens_prob', 0.5) > 0.5 else "high"
            offer = "annual" if row.get('annual_prob', 0.5) > 0.5 else "monthly"
            print(f"  → Recommendation: {price_tier} price, {offer} offer")
        else:
            print(f"\n{user_id.upper()}: Not found in results")

    # Summary statistics
    print("\n" + "=" * 60)
    print("Summary Statistics")
    print("=" * 60)

    for col in ['conversion_prob', 'price_sens_prob', 'annual_prob']:
        if col in results.columns:
            print(f"\n{col}:")
            print(f"  Mean: {results[col].mean():.3f}")
            print(f"  Std:  {results[col].std():.3f}")
            print(f"  Min:  {results[col].min():.3f}")
            print(f"  Max:  {results[col].max():.3f}")

    print("\n" + "=" * 60)
    print("Prediction Complete!")
    print("=" * 60)


if __name__ == "__main__":
    main()
