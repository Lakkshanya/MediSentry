import torch
import torch.nn as nn
import torch.optim as optim

class DDI_Network(nn.Module):
    def __init__(self, num_drugs, embedding_dim=64):
        super(DDI_Network, self).__init__()
        # Drug Embeddings
        self.embedding = nn.Embedding(num_drugs, embedding_dim)
        
        # Fully Connected Layers (MLP)
        self.fc1 = nn.Linear(embedding_dim * 2, 128)
        self.fc2 = nn.Linear(128, 64)
        self.fc3 = nn.Linear(64, 1)
        self.sigmoid = nn.Sigmoid()
        self.relu = nn.ReLU()

    def forward(self, drug_a_idx, drug_b_idx):
        emb_a = self.embedding(drug_a_idx)
        emb_b = self.embedding(drug_b_idx)
        
        # Concatenate Pairwise Features
        x = torch.cat([emb_a, emb_b], dim=1)
        
        # MLP
        x = self.relu(self.fc1(x))
        x = self.relu(self.fc2(x))
        x = self.sigmoid(self.fc3(x))
        return x

from ..data_loader import DataLoader

class InteractionModel:
    def __init__(self):
        # Load Real Dataset
        self.loader = DataLoader()
        self.real_interaction_pairs = self.loader.load_interaction_pairs()
        
        # Initialize Architecture (Keep NN structure for hybrid usage if trained later)
        self.model = DDI_Network(num_drugs=1000)
        
    def predict(self, drugs):
        """
        Predict interactions using REAL DATASET lookup first.
        """
        interactions = []
        if len(drugs) < 2:
            return interactions

        # Pairwise check
        for i in range(len(drugs)):
            for j in range(i + 1, len(drugs)):
                d1 = drugs[i].lower()
                d2 = drugs[j].lower()
                
                # Check Real Dataset
                pair = tuple(sorted((d1, d2)))
                is_known_interaction = pair in self.real_interaction_pairs
                
                # [NEW] Clinical Fallback for Critical Pairs (Ensures safety even if dataset is missing them)
                clinical_fallbacks = {
                    tuple(sorted(('warfarin', 'aspirin'))): "HIGH RISK: Combining Warfarin and Aspirin significantly increases the risk of major internal bleeding.",
                    tuple(sorted(('warfarin', 'ibuprofen'))): "HIGH RISK: NSAIDs like Ibuprofen increase gastrointestinal bleeding risk when taken with Warfarin.",
                    tuple(sorted(('simvastatin', 'amiodarone'))): "HIGH RISK: Amiodarone increases simvastatin levels, raising the risk of rhabdomyolysis.",
                }
                
                fallback_desc = clinical_fallbacks.get(pair)

                if is_known_interaction or fallback_desc:
                    interactions.append({
                        'drug_a': d1,
                        'drug_b': d2,
                        'severity': 'HIGH',
                        'probability': 0.99,
                        'description': fallback_desc or f"CONFIRMED INTERACTION: {d1} + {d2}. This interaction is clinically documented."
                    })
                
        return interactions
