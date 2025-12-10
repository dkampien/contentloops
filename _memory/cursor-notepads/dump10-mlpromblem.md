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

Gradient Boosted Decision Trees - works with tabular data, needs "feature" engineering
Neural Networks (deep learning)
Graph Neural Networks - graph connections, designed for relationships
Revommender System Frameworks - toolbox, Nvidia Merlin

----

## STATUS

1. Problem defined
2. Solutions explored
3. Landscape mapped
4. Questions answered (context given)
5. Ideal vision given
5. Structure and synthesis (all possible options) doc + diagrams for everything + lowest hanging fruit if no ml model solution is implemented
6. POC viability and solution plan (approach tiers etc.)
7. POC building

Future threads

Inventory of references
- Adapty docs 
- XGBoost docs (if needed)
- Kumo Ai docs 
- Log events in the app (need these exported)
- Articles on how other big companies tackled this problem
- pLTV synthetic 
- Figma research


-----

Approaches
- Cluster
- Modular
- Generative

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

- Need extracted the logs events from the app. - done
- What should we do about the responses from perplexity? Paste them again in the new context window? - included conclusions
- Inform the next llm about the perplexity bit and the workflow and thread management bit - add this to agents md? - done



What should go into the next thread? 
- Prompt 
- Docs
- Other references? 

---

Cold start latency problem
- Splash screen (config)
- does it need config push



----



We are executing **Phase 1: The Bob Scenario PoC** as defined in the Strategy document.

Our goal in this thread is to build the "Brain" scripts using Python.

1. **Data Generation:** Write a script to generate a synthetic `events.csv` based on the schema in `app_event_schema.md`. It should include "Bob" (a dorma user with sleep interest) and 1,000 other random users.
P
2. **Kumo Logic:** Write a script (mocking the Kumo.ai SDK for now, or using real API if I provide the key) that ingests this CSV and predicts the `optimal_paywall` for Bob.

3. **Output:** The script should print a JSON config representing the decision.


---

We need more data
- actual price points
- How does a screen is made up from in adapty? - done - figma? 
- Have a llm between brain and adapty? So it can make jsons on hte fly?
- The jsons are rendered by the builder? 
- Does it supports just paywalls but also onbaordings? aha moments?
- Let's create a new set of docs and diagrams. 

- Accounts and apis needed


----

