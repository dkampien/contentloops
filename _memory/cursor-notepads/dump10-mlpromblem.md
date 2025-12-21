## INITIAL PROBLEM DATA

- predictive conversion model (pLTV) 
- Ad network signal delay (7 days delay before fb knows the ad worked)
- Predictive intent modeling
- ML model that infers user intent and dynamically assembles the app experience
- Take data from user events in bigquery and predict app experience. 
- We can't track where they came from (iOS/Mapping issue), so we will use ML to GUESS what they want based on their first few seconds of behavior, and change the app to fit them."

- Goal: 40 mil ARR.
- How does the ARR gets calculated?
- Trials, Subscriptions, Offers, Offer price 


Flow from ads

I know we can't map all the flows but can we have a conceptual flow, user journey, or sales funnel?
- Incepand de la adloops. Reclamele sa fac pe app feature. 
- User sees, lockscreen, installs app, lockscreen onboarding and customized paywall
- When a user clicks an ad and goes to the appstore the context is lost. privacy, att framework. Acum noi avem funnales deeplinks care duc in app



----

## QUESTIONS AFTER FIRST RESEARCH THREAD

These are in order based on the conversation flow. 
1. What does it mean to focus on re-engagement? Is it related to the concept of sales funnels and journey? Is re-engagement a sales funnel concept or user journey concept? 
2. Where would the ML model "live" in this overall pipeline? Hosted somewhere and exposed via API? note that we have not settled on the actual solution yet. Is the ML model used only for the re-engagement purpose? (for new users we use context bandit?) 
3. Are "vectors" the most efficient way to "condense" data? 
4. XGBoost vs Kumo. (i know you don't have much info about kumo yet.) But do they do the same "type" of thing?
5. Is the pLTV synthetic event sproblem still a thing? Thats why I asked about the ios version because facebook fixed the 7-day delay problem from ios 14 onwards. 
6. In bigQuery we deal mostly with tabular data right? 
7. Whats the difference bwetween XGBoost and Neural Networks? Are GNN a type of neural network? Where do nvidia merlin fit into the picture for example? 
8. The new users vs existing user problem segmentation. The ML model is for exisitng users only? How would context bandit help with with new users? 
9. I don't think its just an IOs problem that breaks attribution. Can the deep links be the core problem? 
10. You also mentioned AUTOML, where does this stand in the big picture, how its different than the other proposed solutions and what is the difference between automl and kumo? 
11. A bit vague at this point but how would a proof of concept look like? Can it be defined at this point or just after we choose the approach or techstack?


----

1. I was thinking we need some flows defined. Like the sales funnel flows and user journey flows to give me a better high level understanding. Thats why I asked. Diagram types?

The ideal system flow? The actual solution diagram? -> POC scope


----

## RESEARCH STATUS

1. Problem defined
2. Solutions explored
3. Landscape mapped
4. Questions answered (context given)
5. Ideal vision given
5. Structure and synthesis (all possible options) doc + diagrams for everything + lowest hanging fruit if no ml model solution is implemented
6. POC viability and solution plan (approach tiers etc.)
7. POC building

Inventory of reference info and docs
- Adapty docs 
- XGBoost docs (if needed)
- Kumo Ai docs 
- Log events in the app (need these exported)
- Articles on how other big companies tackled this problem
- pLTV synthetic 
- Figma research

-----


## DOC STRUCTURE

Revised Hybrid Structure:
1. The Mission & The Gap
2. The Inventory (Technical References)
3. The "Something" Discovered (The Solution)
4. The Architecture Plan (Tiers)
5. Deep Dive: The Tech Stack
6. PoC: "The Bob Scenario"
7. Next Steps


-----

## TASKS

[x] Need extracted the logs events from the app.
[x] What should we do about the responses from perplexity? Paste them again in the new context window? - included conclusions
[x] Inform the next llm about the perplexity bit and the workflow and thread management bit - add this to agents md?
[x] Research how a screen is made up from in adapty
[ ] Research if having a llm between brain and adapty so it can make jsons on the fly
[x] The JSONS are rendered by the adapty builder?
[x] Does adapty support paywalls only or also onboardings? What are aha moments?
[x] Create a new set of docs and diagrams (v2)


---

## NOTES

Gradient Boosted Decision Trees - works with tabular data, needs "feature" engineering
Neural Networks (deep learning)
Graph Neural Networks - graph connections, designed for relationships
Revommender System Frameworks - toolbox, Nvidia Merlin


Approaches (solutions tiers)
- Tier 1 Cluster
- Tier 2 Modular
- Tier 3 Generative

Cold start latency problem
- Splash screen (config)
- does it need config push


Goal
- $40M ARR goal until end of year. Need +$9M ARR 
- 300k trials in 30 days
- 60k paid subs on a $12.99 premium

Plan (to get to goal)
- Increase ad spend to $3M in one month with 120% return (1.2 ROAS)
- 10$ CPA for trials (3mil / 300k)


--- 




## GEMINI RECAP


"Why this is "Make or Break" for the $40M Goal: This isn't just about showing nice screens; it's about making your $3M/month ad spend massively more efficient. Every percentage point increase in conversion (Trial $\to$ Paid) at this scale translates into millions of dollars. If generic flows convert at 5% and personalized flows convert at 15%, that's a 3x boost in effective ad spend."


The "Bob Scenario" PoC

The Goal:
Demonstrate that we can take a user like Bob (who is dormant and clicking a specific ad) and predict the exact
Paywall/Onboarding configuration that will make him subscribe.

The "Bob" Profile (The Input):
* Status: Inactive for 6 months (Churned/Dormant).
* History: Read "Psalm 23" 5 times. Hated "Quizzes".
* Ad Context: Clicked "Sleep Prayers" ad on Facebook.
* Device: iPhone 15 Pro (High value).

The Challenge:
A generic app shows him a "Welcome to BibleChat!" screen (boring).
Our Model must output: "Show Sleep Paywall at $29.99."



KW - "slot"
KW - "aggresive monetization"


The solution - Context problem - Tiered approaches
Tier 0 - Manual contextualization (fallback - no ML)
Tier 1 - User clustering and segmentation
    - Run an unsupervised ML algo on bigquery data. 80/20 rule on where the revenue comes. 3-4 user types.
    - The algo finds hidden groups.
    - Design premade paywalls and onboarding screens for more clusters
    - When bob arrives, model asks which cluster is bob in and gives cluster A -> paywall A. Might need to scale to onboardings and other app experience as well
Tier 2 - Modular assembly. 
    A. Prebuild components in the app code (backgrounds, headlines, pricepoints). Ml sends config. The app assembles instantly
    B. 


The fallback (noML) - Manual contextualization
    - 



So basically we identified two solution to the efficiency problem the pltv and the dynamic contextualization via ml.



The data layer (the fuel)
- Raw data: big query tables
- "Features": clean data columns, vectors representing complex history (refined fuel)
- Infrastructure: BigQuery (the warehouse), Redis / Feature Store (the gasstation - fast access for the app)
The algorithm layer (the engine block)
- 



The data (fuel layer)
The brain (logic layer)
The bridge (transport layer)


-----




## What I need to know (what info would help)
[x] Premium pricing tiers - found
[x] Deep link structure and what info does it contain - given
[x] Conversion rate form  to paid (avg) - found for us, given 
[ ] Attribution broken from apple ad network - this is still unclear in my mind but confirmed capi 30 min - 1 hr delay


## Need to figure out (open questions)
<old notes>
 Need to figure out
 - The rendering engine (adapty is limited for onboarding) - What are the actual app experiences we can dynamically customzie
 - More granular details about the prediction types (need to figure out the most valuable predicitons types). And also what output can a prediction have? Only confidence lvl?
</old notes>


## References for POC 
- strategy-v3
- implementation-plan-v2
- strategy-v3-funnel
- app_event_schema
---
- Poc-complete


## General notes & questions
- What other features does bible chat have that could be exploited?
- Would be cool a diagram with the tech stack the app uses (and how they work together)
    - Adapty
    - Signal
    - Adloops
    - Facebook related sdks and tools
    - Apple related sdks and tools 
- What is the real funnel problem?
- How many places (slots) are there where we can insert dynamic app experience? (besides paywall and onboardings)


## Next
[ ] Fix the inline pql filter syntax in poc (fix poc)
[ ] Strengthed understanding and update docs - YOU ARE HERE
    [ ] Research open questions 
    [ ] Strategy v4
[x] Diagram mapping the app tool stack 

Approaches to close the info gaps
    Go through the previous threads
    Go through the info hierarchy
    Go through the docs 





