# MediSentry AI Model Documentation

This document explicitly details the five AI/ML modules integrated into the MediSentry backend, specifying their algorithms, architectures, and the real-world datasets powering them.

---

## 1. Drug Interaction Prediction Model
*   **Module**: `MediSentry_AI/modules/interaction_model.py`
*   **Architecture**: **Deep Neural Network (PyTorch)**
    *   **Components**: Embedding Layers (for Drug Vectors), Fully Connected Layers (MLP), ReLU/Sigmoid Activations.
    *   **Hybrid Logic**: Integrates a **Graph-Based Lookup** mechanism for instant verification against known databases.
*   **Datasets Used**: 
    1.  **BioSNAP / ChCh-Miner**: Loaded from `Drug-Drug-Interaction-Pair.csv`.
    2.  **Dataset Size**: ~178,000 confirmed interaction pairs.
*   **Function**: Takes two drug identifiers, converts them to high-dimensional embeddings, and predicts the probability of interaction.

## 2. Clinical Risk Classification Model
*   **Module**: `MediSentry_AI/modules/risk_model.py`
*   **Algorithm**: **Gradient Boosting Classifier (Ensemble Learning)**
    *   **Library**: Scikit-Learn (XGBoost-style implementation).
    *   **Logic**: Decision Trees optimized via gradient descent to classify risk levels.
*   **Datasets Used**:
    1.  **Pharmacodynamic Antagonistic Effects** (from **MecDDI/Clinical DDI** sources).
    2.  **File**: `Pharmacodynamic antagonistic effects.csv`.
    3.  **Training Method**: The system auto-labels "Antagonistic" interactions as `HIGH` risk and "Synergistic" as `MEDIUM` risk to train the classifier dynamically on startup.
*   **Function**: Classification of overall prescription safety into `SAFE`, `MEDIUM`, or `HIGH` categories based on interaction severity features.

## 3. Expert Rule-Based System
*   **Module**: `MediSentry_AI/modules/expert_system.py`
*   **Architecture**: **Deterministic Expert System**
    *   **Logic**: Hard-coded constraint satisfaction and dictionary-based rule enforcement.
*   **Datasets Used**:
    1.  **Clinical DDI Rules**: Loaded from `Pharmacodynamic antagonistic effects.csv`.
*   **Function**: Enforces strict "Contraindications" (e.g., specific drug pairs that are absolutely forbidden regardless of probability), providing a safety layer on top of the probabilistic AI.

## 4. RAG (Retrieval-Augmented Generation) & Explainer
*   **Module**: `MediSentry_AI/modules/rag_model.py`
*   **Architecture**: **Vector Retrieval System**
    *   **Components**: TF-IDF Vectorizer + Cosine Similarity Search.
    *   **Logic**: Converts clinical text into valid vectors to perform semantic search against a query (e.g., "Why do Aspirin and Warfarin interact?").
*   **Datasets Used**:
    1.  **Clinical Knowledge Base**: Constructed dynamically from text descriptions in the **Pharmacodynamic Effects** dataset.
*   **Function**: Retrieves specific "Mechanisms of Action" (e.g., "Pharmacodynamic antagonism") to explain *why* an interaction was flagged to the user.

## 5. Forecasting & Analytics Model
*   **Module**: `MediSentry_AI/modules/forecasting_model.py`
*   **Architecture**: **LSTM (Long Short-Term Memory) RNN**
    *   **Library**: PyTorch.
    *   **Components**: Recurrent Layers designed for time-series sequence processing.
*   **Datasets Used**:
    1.  **Runtime Time-Series Data**: Processes historical risk scores (passed as input tensors) to predict future trends.
*   **Function**: Analyzes a sequence of past events (e.g., "Patient's risk scores over the last 30 days") to predict if their risk trajectory is `STABLE` or `INCREASING`.

---

**Verification Status**: All MOCK data has been removed. Models 1, 2, 3, and 4 now load directly from the CSV files located in `c:/cprogram/MediSentry/Datasets/` upon initialization.
