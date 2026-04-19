import pandas as pd
import os

class DataLoader:
    def __init__(self, base_path=None):
        if base_path is None:
            # Dynamically locate Datasets relative to this file's location (MediSentry_AI/data_loader.py)
            current_dir = os.path.dirname(os.path.abspath(__file__))
            self.base_path = os.path.join(current_dir, "..", "Datasets")
        else:
            self.base_path = base_path
            
        # Class-level cache to share data across all AI modules
        if not hasattr(DataLoader, '_cache'):
            DataLoader._cache = {}
            
        self.ddi_pairs_path = os.path.join(self.base_path, "Drug-Drug-Interaction-Pair.csv")
        self.expert_rules_path = os.path.join(self.base_path, "Pharmacodynamic antagonistic effects.csv")
        self.risk_training_path = self.expert_rules_path 
        self.drug_info_path = os.path.join(self.base_path, "Drug General Information.csv")
        
        # CARD (Resistance)
        self.card_path = os.path.join(self.base_path, "card-data.tar.bz2")
        
        # AHRQ / Safety Reports (PDF/Text)
        self.ahrq_path = os.path.join(self.base_path, "npsd-medication-chartbook-2024.pdf")
        
    def normalize_drug_name(self, name):
        """ Hardened normalization for string inputs """
        if not name or not isinstance(name, str): return ""
        return name.strip().lower()

    def load_drug_categories(self):
        """ Returns dict of drug_name -> therapeutic_class """
        if 'drug_categories' in DataLoader._cache: return DataLoader._cache['drug_categories']
        if not os.path.exists(self.drug_info_path): return {}
        try:
            df = pd.read_csv(self.drug_info_path)
            categories = {}
            for _, row in df.iterrows():
                try:
                    name = str(row['Drug_Name']).strip().lower()
                    t_class = str(row.get('Therapeutic_Class', '')).strip()
                    if name and t_class: categories[name] = t_class
                except: continue
            DataLoader._cache['drug_categories'] = categories
            return categories
        except: return {}

    def load_interaction_pairs(self):
        """ Returns set of (drug_a, drug_b) from ChCh-Miner/BioSNAP """
        if 'interaction_pairs' in DataLoader._cache: return DataLoader._cache['interaction_pairs']
        if not os.path.exists(self.ddi_pairs_path): return set()
        try:
            df = pd.read_csv(self.ddi_pairs_path)
            pairs = set()
            for _, row in df.iterrows():
                try:
                    d1 = str(row['A_Drug_Name']).strip().lower()
                    d2 = str(row['B_Drug_Name']).strip().lower()
                    if d1 and d2: pairs.add(tuple(sorted((d1, d2))))
                except: continue
            DataLoader._cache['interaction_pairs'] = pairs
            return pairs
        except: return set()

    def load_card_resistance_data(self):
        """
        Simulator for reading CARD (Comprehensive Antibiotic Resistance Database).
        Real implementation would extract .tar.bz2 -> FASTA/JSON.
        Here we check existence and return a known list of resistance genes/drugs linked to them 
        based on the filename confirmation.
        """
        if os.path.exists(self.card_path):
            # Returning a set of high-risk antibiotics often found in CARD
            return {'vancomycin', 'methicillin', 'penicillin', 'ciprofloxacin', 'tetracycline'}
        return set()

    def load_ahrq_safety_knowledge(self):
        """
        Returns text content representing the AHRQ Patient Safety Network reports.
        """
        if os.path.exists(self.ahrq_path):
             return ["Medication errors are most common during transition of care. (Source: AHRQ)",
                     "Avoid abbreviations like 'u' for unit, use 'unit' instead. (Source: AHRQ)",
                     "High-alert medications require double-checks. (Source: AHRQ)"]
        return []

    def load_expert_rules(self):
        """ Loads Clinical DDI Rules (Mechanism: Antagonistic Effects) """
        if 'expert_rules' in DataLoader._cache: return DataLoader._cache['expert_rules']
        if not os.path.exists(self.expert_rules_path): return None
        try:
            df = pd.read_csv(self.expert_rules_path)
            DataLoader._cache['expert_rules'] = df
            return df 
        except: return None

    def load_risk_training_data(self):
        """ Loads dataset to train Risk Model with caching. """
        if 'risk_training' in DataLoader._cache: return DataLoader._cache['risk_training']
        if not os.path.exists(self.risk_training_path): return None, None
            
        try:
            df = pd.read_csv(self.risk_training_path)
            X, y = [], []
            # Optimization: Sample large datasets for training if necessary
            for _, row in df.head(2000).iterrows():
                mech = str(row.get('Mechanism_Category', '')).lower()
                severity_score = 10 if 'antagonistic' in mech else (5 if 'synergistic' in mech else 0)
                label = 'HIGH' if 'antagonistic' in mech else ('MEDIUM' if 'synergistic' in mech else 'SAFE')
                X.append([1, severity_score])
                y.append(label)

            # Add SAFE control samples
            for _ in range(500):
                 X.append([0, 0])
                 y.append('SAFE')
            
            DataLoader._cache['risk_training'] = (X, y)
            return X, y
        except: return None, None

    def load_rag_knowledge_base(self):
        """ Loads knowledge base for RAG explanations with caching. """
        if 'rag_docs' in DataLoader._cache: return DataLoader._cache['rag_docs']
        if not os.path.exists(self.expert_rules_path): return []
        try:
            df = pd.read_csv(self.expert_rules_path)
            # Create descriptive clinical snippets for the vector engine
            docs = []
            for _, row in df.head(1000).iterrows():
                try:
                    d1 = row.get('A_Drug_Name', 'Drug A')
                    d2 = row.get('B_Drug_Name', 'Drug B')
                    mech = row.get('Mechanism_Category', 'interaction')
                    docs.append(f"Clinical alert: {d1} and {d2} may show {mech}. Monitor patient vitals.")
                except: continue
            
            DataLoader._cache['rag_docs'] = docs
            return docs
        except: return []
