# BibleChat App - Analytics Event Schema
*Extracted from `Bible Chat/Utils/Events/BCEventsTypes.swift` and `BCEvents+Config.swift`*

## 1. User Identity & Attributes
*Attributes set directly on the user profile via `setAttribute` / `setAttributes`.*

*   `age` (String: "13-17", "18-24", etc.)
*   `gender` (String: "m", "f")
*   `language` (String)
*   `topic` (String)
*   `onboarding_topic` (String)
*   `preferredTopics` (List)
*   `denomination` (String)
*   `church` (String)
*   `myGoal` (String)
*   `whyUseBibleChat` (String)
*   `howToStudy` (String)
*   `lifeChallenge` (String)
*   `affiliate_campaign` (String - Acquisition Source)
*   `longestStreak` (Int)
*   `dayDone7Days` (Int - Rolling activity count)
*   `askChatGPT7Days` (Int - Rolling AI usage count)
*   `notification_permission` (Bool)
*   `onboarding_passed_at` (Date)

## 2. Deep Link & Acquisition (Intent)
*   **Event:** `deepLinkOpen`
    *   `deepLink` (String - The full URL/Path)
    *   `type` (String - e.g., "campaign", "onboarding", "show_paywall")
    *   `source` (String - e.g., "facebook")
*   **Event:** `campaignDisplayed`
    *   `campaign_id` (String)

## 3. Purchase & Paywall (Conversion)
*   **Event:** `paywallShown` / `paywallBannerShown`
    *   `paywall_type` (String)
    *   `offeringId` (String - Adapty Offering ID)
    *   `placementId` (String - Adapty Placement)
    *   `trigger` (String - e.g., "app_launch", "content_lock")
    *   `source` (String)
*   **Event:** `onboardingPaywall`
    *   `paywall` (String - Offering ID)
*   **Event:** `purchaseStarted` / `purchaseCancelled`
    *   `product` (String - Product ID)
    *   `price` (Double)
    *   `currency` (String)
    *   `offeringId` (String)
    *   `paywall_type` (String)
    *   `trial` (Bool)
    *   `discount` (String)
*   **Event:** `purchaseCompleted`
    *   `product` (String)
    *   `price` (Double)
    *   `conversionPrice` (Double - Actual revenue)
    *   `currency` (String)
    *   **Note:** Triggers S2S tracking (`AnalyticsS2STrackerService`).
*   **Event:** `purchaseError`
    *   `error` (String)
    *   `errorCode` (Int)

## 4. Onboarding Flow
*   **Event:** `firstOpen`
*   **Event:** `onboardingFetch`
    *   `onboarding` (Config ID)
    *   `uimode` (String)
    *   `remoteConfig` (Bool)
*   **Event:** `onboardingShown` / `inAppOnboardingShown`
    *   `type` (String - Flow Variant)
*   **Event:** `onboardingLogin`
*   **Event:** `startLogin` / `login` / `loginFailed` / `loginCanceled`
    *   `provider` (String - "apple", "google", "email")
    *   `source` (String)
*   **Event:** `register`
    *   `source` (String)
*   **Event:** `onboardingPassed`
    *   `purchase` (Bool)

## 5. Content Engagement (History)
*   **Event:** `bibleScreen`
    *   `book` (String)
    *   `chapter` (String)
    *   `bible` (String - Version)
*   **Event:** `studyScreen`
    *   `studyId` (String)
    *   `dayId` (String)
    *   `itemId` (String)
*   **Event:** `dailyVerseShown` / `dailyVerseUpdates`
    *   `verse` (String)
    *   `days` (String - Streak?)
    *   `devotionalLength` (Int)
*   **Event:** `audioListenStart` / `audioListenEnd`
    *   `value` (String - Content Title)
    *   `progress` / `duration` (Int)
*   **Event:** `habitStart` / `habitDone`
    *   `title` (String)
    *   `type` (String)
    *   `tag` (String)
    *   `location` (String)
    *   `dateStatus` (String - "today", "past")
    *   `value` (Bool - e.g., isPast)
*   **Event:** `studyItemStart` / `studyItemDone`
    *   `title` (String)
    *   `type` (String)
    *   `location` (String)
    *   `dateStatus` (String)
*   **Event:** `dayDone`
    *   `tag` (String)
    *   `dateStatus` (String)
*   **Event:** `spiritualMeterDisplay` / `spiritualMeterDone` / `spiritualMeterClose`
    *   `value` (String/Int - Mood/Rating)
    *   `location` (String)
    *   `interaction` (String)
    *   `action` (String)
*   **Event:** `componentView`
    *   `component` (String - e.g., "header", "popup")
*   **Event:** `screen`
    *   `scr` (String - Screen Name)
    *   `scr_content` (String - Context)
    *   `onboardingConfigId` (String)

## 6. AI Chat Interaction
*   **Event:** `NewChat` / `startChatGPT`
    *   `category` (String)
    *   `subcategory` (String)
    *   `model` (String)
*   **Event:** `askChatGPT` / `replyChatGPT` / `refreshChatGPT`
    *   `category` (String)
    *   `subcategory` (String)
    *   `model` (String)
    *   `type` (String - "text" vs "voice")
*   **Event:** `suggestGPT`
    *   `beta` (String)
*   **Event:** `copyMessage` / `likeMessage` / `dislikeMessage`
    *   `message` (String - Message ID)
*   **Event:** `voiceChatStart` ... `voiceChatEnd`
    *   `model` (String)
    *   `isSubscribed` (Bool)

## 7. Social & Community
*   **Event:** `shareCompleted` / `shareFailed` / `shareCanceled`
    *   `content` (String)
    *   `location` (String)
    *   `social_app` (String)
*   **Event:** `recents...` (Search, Delete, Favorite chats)
*   **Event:** `sendEmail` (Support/Feedback)

## 8. "Aha" Moments (High Value Signals)
*   `ahaBibleStudyGuides`
*   `ahaKidsAudioStories`
*   `ahaBibleReadingPlans`
*   `ahaBedtimeStories`
*   `ahaBibleStories`
*   `ahaRealLifeStories`
*   `ahaLivePrayers`
*   `ahaWorldEventsPrayers`
*   `ahaFavoritingVerses`
*   `ahaSharingVersesImages`
*   `ahaHighlightingVerses`
*   `ahaGuidedBreathing`
*   `ahaDailyStreakPlan`
*   `ahaNewChat`
*   `ahaSendBlessing`
*   `ahaPartnerBlessing`
