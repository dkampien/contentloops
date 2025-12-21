"""
Config Assembler for Bob Scenario PoC
=====================================
Takes ML predictions + ad intent → paywall config JSON.

Run: python config_assembler.py
"""

import os
import json
import pandas as pd

DATA_DIR = "data"
OUTPUT_DIR = "output"
CONFIGS_DIR = f"{OUTPUT_DIR}/configs"


def load_data():
    """Load predictions and user data."""
    predictions = pd.read_csv(f"{OUTPUT_DIR}/raw_predictions.csv")
    users = pd.read_csv(f"{DATA_DIR}/users.csv")
    return predictions, users


def assemble_config(user_id: str, predictions_df: pd.DataFrame, users_df: pd.DataFrame) -> dict:
    """
    Assemble paywall config from predictions + ad intent.

    Assembly Logic:
    - price_tier: "low" if price_sens_prob > 0.5, else "high"
    - offer: "annual" if annual_prob > 0.5, else "monthly"
    - intent: from user's last_ad_intent (INPUT, not predicted)
    - confidence: conversion_prob
    """
    # Get prediction row
    pred = predictions_df[predictions_df['user_id'] == user_id]
    if len(pred) == 0:
        raise ValueError(f"User {user_id} not found in predictions")
    pred = pred.iloc[0]

    # Get user row for ad intent
    user = users_df[users_df['user_id'] == user_id]
    if len(user) == 0:
        raise ValueError(f"User {user_id} not found in users")
    user = user.iloc[0]

    # Assembly logic
    price_sens_prob = pred['price_sens_prob']
    annual_prob = pred['annual_prob']
    conversion_prob = pred['conversion_prob']
    intent = user['last_ad_intent']

    config = {
        "user_id": user_id,
        "intent": intent,
        "price_tier": "low" if price_sens_prob > 0.5 else "high",
        "offer": "annual" if annual_prob > 0.5 else "monthly",
        "confidence": round(conversion_prob, 3),
        # Include raw probabilities for debugging
        "_raw": {
            "price_sens_prob": round(price_sens_prob, 3),
            "annual_prob": round(annual_prob, 3),
            "conversion_prob": round(conversion_prob, 3)
        }
    }

    return config


def save_config(config: dict, user_id: str):
    """Save config to JSON file."""
    path = f"{CONFIGS_DIR}/{user_id}.json"
    with open(path, 'w') as f:
        json.dump(config, f, indent=2)
    return path


def main():
    print("=" * 60)
    print("Config Assembler")
    print("=" * 60)

    # Load data
    print("\nLoading data...")
    predictions, users = load_data()
    print(f"  Predictions: {len(predictions)} users")
    print(f"  Users: {len(users)} users")

    # Ensure configs directory exists
    os.makedirs(CONFIGS_DIR, exist_ok=True)

    # Test users
    test_users = ['bob', 'alice', 'charlie']

    print("\n" + "=" * 60)
    print("Assembling Test User Configs")
    print("=" * 60)

    for user_id in test_users:
        print(f"\n--- {user_id.upper()} ---")

        try:
            config = assemble_config(user_id, predictions, users)
            path = save_config(config, user_id)

            print(f"  Intent (from ad): {config['intent']}")
            print(f"  Price Tier: {config['price_tier']}")
            print(f"  Offer: {config['offer']}")
            print(f"  Confidence: {config['confidence']}")
            print(f"  Saved to: {path}")

            # Pretty print JSON
            print(f"\n  Config JSON:")
            config_clean = {k: v for k, v in config.items() if not k.startswith('_')}
            print(f"  {json.dumps(config_clean, indent=2).replace(chr(10), chr(10) + '  ')}")

        except Exception as e:
            print(f"  Error: {e}")

    # Generate configs for all users (optional)
    print("\n" + "=" * 60)
    print("Generating All User Configs")
    print("=" * 60)

    success_count = 0
    error_count = 0

    for _, row in predictions.iterrows():
        user_id = row['user_id']
        try:
            config = assemble_config(user_id, predictions, users)
            save_config(config, user_id)
            success_count += 1
        except Exception as e:
            error_count += 1

    print(f"  Generated: {success_count} configs")
    print(f"  Errors: {error_count}")

    # Summary statistics
    print("\n" + "=" * 60)
    print("Config Distribution")
    print("=" * 60)

    all_configs = []
    for user_id in predictions['user_id']:
        try:
            config = assemble_config(user_id, predictions, users)
            all_configs.append(config)
        except:
            pass

    configs_df = pd.DataFrame(all_configs)

    print(f"\nPrice Tier:")
    print(configs_df['price_tier'].value_counts().to_string())

    print(f"\nOffer Type:")
    print(configs_df['offer'].value_counts().to_string())

    print(f"\nIntent (from ad):")
    print(configs_df['intent'].value_counts().to_string())

    # Generate manifest for visualizer
    test_users = ['bob', 'alice', 'charlie']
    random_users = [uid for uid in predictions['user_id'] if uid not in test_users][:7]

    manifest = {
        "test_users": test_users,
        "sample_users": random_users
    }

    manifest_path = f"{CONFIGS_DIR}/manifest.json"
    with open(manifest_path, 'w') as f:
        json.dump(manifest, f, indent=2)

    print(f"\nManifest saved to: {manifest_path}")

    print("\n" + "=" * 60)
    print("Config Assembly Complete!")
    print("=" * 60)
    print(f"\nConfigs saved to: {CONFIGS_DIR}/")


if __name__ == "__main__":
    main()
