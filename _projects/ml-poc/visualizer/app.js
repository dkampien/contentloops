/**
 * Paywall Visualizer - Bob Scenario PoC
 * Renders abstract paywall based on config JSON
 *
 * Run with local server: python -m http.server 8000
 * Then open: http://localhost:8000
 */

// Intent configuration (feature-based)
const INTENT_CONFIG = {
    lockscreen: {
        title: "Lockscreen Widget",
        icon: "\uD83D\uDD12",
        className: "lockscreen"
    },
    widget: {
        title: "Daily Widget",
        icon: "\uD83D\uDCF1",
        className: "widget"
    },
    dailyverse: {
        title: "Daily Verse",
        icon: "\uD83D\uDCD6",
        className: "dailyverse"
    },
    generic: {
        title: "Unlock Premium",
        icon: "\u2B50",
        className: "generic"
    }
};

// Price configuration
const PRICE_CONFIG = {
    low: {
        price: "$9.99",
        period: "/month"
    },
    high: {
        price: "$59.99",
        period: "/year"
    }
};

// Config cache
const configCache = {};

/**
 * Load config from JSON file
 */
async function loadConfig(userId) {
    // Check cache first
    if (configCache[userId]) {
        renderPaywall(configCache[userId]);
        renderConfigPanel(configCache[userId]);
        return;
    }

    // Show loading state
    document.getElementById('paywall-title').textContent = 'Loading...';
    document.getElementById('config-json').textContent = 'Loading...';

    try {
        const response = await fetch(`../output/configs/${userId}.json`);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        const config = await response.json();

        // Cache it
        configCache[userId] = config;

        renderPaywall(config);
        renderConfigPanel(config);

        console.log(`Loaded config for ${userId}:`, config);
    } catch (error) {
        console.error(`Failed to load config for ${userId}:`, error);
        showError(userId, error.message);
    }
}

/**
 * Show error state
 */
function showError(userId, message) {
    document.getElementById('paywall-title').textContent = 'Error Loading';
    document.getElementById('config-json').textContent = JSON.stringify({
        error: message,
        hint: "Run: python -m http.server 8000 from visualizer folder",
        user: userId
    }, null, 2);
}

/**
 * Render the paywall UI based on config
 */
function renderPaywall(config) {
    const { intent, price_tier, offer, confidence } = config;

    // Intent-based header
    const intentConfig = INTENT_CONFIG[intent] || INTENT_CONFIG.generic;
    const header = document.getElementById('paywall-header');
    const topicIcon = document.getElementById('topic-icon');
    const title = document.getElementById('paywall-title');

    // Reset classes
    header.className = 'paywall-header ' + intentConfig.className;
    topicIcon.className = 'topic-icon ' + intentConfig.className;
    topicIcon.textContent = intentConfig.icon;
    title.textContent = intentConfig.title;

    // Price display
    const priceConfig = PRICE_CONFIG[price_tier] || PRICE_CONFIG.low;
    document.getElementById('price').textContent = priceConfig.price;
    document.getElementById('period').textContent = priceConfig.period;

    // Offer badge
    const badge = document.getElementById('offer-badge');
    const badgeText = document.getElementById('badge-text');

    badge.className = 'offer-badge ' + offer;
    if (offer === 'annual') {
        badgeText.textContent = 'Annual - Save 50%';
    } else {
        badgeText.textContent = 'Monthly';
    }

    // Confidence meter
    const confidenceFill = document.getElementById('confidence-fill');
    const confidenceValue = document.getElementById('confidence-value');

    confidenceFill.style.width = (confidence * 100) + '%';
    confidenceValue.textContent = (confidence * 100).toFixed(0) + '%';
}

/**
 * Render the config panel with JSON and raw predictions
 */
function renderConfigPanel(config) {
    // Config JSON (without _raw for cleaner display)
    const cleanConfig = {
        user_id: config.user_id,
        intent: config.intent,
        price_tier: config.price_tier,
        offer: config.offer,
        confidence: config.confidence
    };
    document.getElementById('config-json').textContent = JSON.stringify(cleanConfig, null, 2);

    // Raw predictions
    if (config._raw) {
        document.getElementById('raw-price').textContent = config._raw.price_sens_prob.toFixed(3);
        document.getElementById('raw-annual').textContent = config._raw.annual_prob.toFixed(3);
        document.getElementById('raw-conversion').textContent = config._raw.conversion_prob.toFixed(3);
    }

    // Assembly logic
    const priceLogic = `price_sens_prob (${config._raw?.price_sens_prob.toFixed(2)}) > 0.5 => "${config.price_tier}"`;
    const offerLogic = `annual_prob (${config._raw?.annual_prob.toFixed(2)}) > 0.5 => "${config.offer}"`;
    const intentLogic = `last_ad_intent => "${config.intent}"`;

    document.getElementById('logic-price').textContent = priceLogic;
    document.getElementById('logic-offer').textContent = offerLogic;
    document.getElementById('logic-topic').textContent = intentLogic;
}

/**
 * Load manifest and populate dropdown
 */
async function loadManifest() {
    const userSelect = document.getElementById('user-select');

    try {
        const response = await fetch('../output/configs/manifest.json');
        if (!response.ok) throw new Error('Manifest not found');

        const manifest = await response.json();

        // Clear dropdown
        userSelect.innerHTML = '';

        // Add test users
        manifest.test_users.forEach(userId => {
            const option = document.createElement('option');
            option.value = userId;
            option.textContent = `${userId} (test user)`;
            userSelect.appendChild(option);
        });

        // Add sample users
        manifest.sample_users.forEach(userId => {
            const option = document.createElement('option');
            option.value = userId;
            option.textContent = userId;
            userSelect.appendChild(option);
        });

        // Load first user
        if (manifest.test_users.length > 0) {
            loadConfig(manifest.test_users[0]);
        }

    } catch (error) {
        console.error('Failed to load manifest:', error);
        userSelect.innerHTML = '<option value="bob">bob (test user)</option>';
        loadConfig('bob');
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    const userSelect = document.getElementById('user-select');
    const loadBtn = document.getElementById('load-btn');

    // Load manifest and populate dropdown
    loadManifest();

    // Load button click
    loadBtn.addEventListener('click', () => {
        loadConfig(userSelect.value);
    });

    // Also load on select change for convenience
    userSelect.addEventListener('change', () => {
        loadConfig(userSelect.value);
    });
});
