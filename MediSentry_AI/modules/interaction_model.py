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
                
                # Check Mock fallback ONLY if not found and highly suspicious (hardcoded demo logic removal requested, 
                # so we rely purely on dataset OR we label it 'Potential')
                
                if is_known_interaction:
                    interactions.append({
                        'drug_a': d1,
                        'drug_b': d2,
                        'severity': 'HIGH', # Default high for known database matches
                        'probability': 0.99,
                        'description': f"CONFIRMED INTERACTION: {d1} + {d2}. This interaction is clinically documented."
                    })
                
        return interactions
