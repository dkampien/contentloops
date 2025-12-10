```mermaid
graph LR
    %% Inputs
    subgraph "Input Data"
    Users[User Table]
    Events[Event Stream]
    Context[Ad Context]
    end
    
    %% The Engine
    subgraph "Kumo.ai (GNN Engine)"
    Graph[Graph Construction]
    Encoder[Graph Encoder]
    Predictor[Prediction Heads]
    end
    
    %% Outputs
    subgraph "Modular Predictions"
    Head1[1. Topic (Sleep/Anxiety)]
    Head2[2. Price (High/Low)]
    Head3[3. Vibe (Calm/Vibrant)]
    Head4[4. pLTV ($)]
    end
    
    %% Logic
    Users & Events --> Graph
    Graph -->|Node Embeddings| Encoder
    Context -->|Real-time Feature| Encoder
    Encoder --> Predictor
    
    Predictor -->|Multi-Class| Head1
    Predictor -->|Binary| Head2
    Predictor -->|Multi-Class| Head3
    Predictor -->|Regression| Head4
    
    %% Usage
    Head1 & Head2 & Head3 -.->|Config Assembly| Adapty[Adapty Segment]
    Head4 -.->|Optimization| CAPI[Signal]
```
