from ..data_loader import DataLoader

class ExpertSystem:
    def __init__(self):
        self.loader = DataLoader()
        self.rules_df = self.loader.load_expert_rules()
        self.contraindications = {}
        
        if self.rules_df is not None:
             # Process the CSV into specific contraindication dictionary
             # Using 'Pharmacodynamic antagonistic effects.csv' as proxy for "Contraindications"
             for idx, row in self.rules_df.iterrows():
                 try:
                     # Adapting to likely columns based on filename
                     # Usually: Drug1, Drug2, Effect
                     d1 = str(row[0]).lower() 
                     d2 = str(row[1]).lower()
                     if d1 not in self.contraindications: self.contraindications[d1] = []
                     self.contraindications[d1].append(d2)
                 except: continue
        
        # Load CARD Resistance Data
        self.resistance_drug_list = self.loader.load_card_resistance_data()

    def check_contraindications(self, patient_conditions, drugs):
        """
        Input: Patient Conditions (e.g., 'Pregnant'), Drugs List
        """
        alerts = []
        drugs_lower = [d.lower() for d in drugs]
        
        # 0. Check Antimicrobial Resistance (CARD)
        for drug in drugs_lower:
            if drug in self.resistance_drug_list:
                alerts.append({
                    'type': 'RESISTANCE',
                    'severity': 'MEDIUM',
                    'drug': drug,
                    'reason': f"Drug '{drug}' is flagged in CARD Database for potential resistance issues."
                })

        # 1. Drug-Disease (Hardcoded for safety as CSV is Drug-Drug)
        disease_map = {
             'pregnant': ['warfarin', 'ibuprofen'],
             'liver_failure': ['paracetamol']
        }
        
        # Check against conditions
        for condition in patient_conditions:
            cond_key = condition.lower().replace(" ", "_")
            if cond_key in disease_map:
                forbidden = disease_map[cond_key]
                for drug in drugs_lower:
                    if drug in forbidden:
                        alerts.append({
                            'type': 'CONTRAINDICATION',
                            'severity': 'HIGH',
                            'drug': drug,
                            'reason': f"Drug '{drug}' is contraindicated for condition '{condition}'."
                        })
        
        # 2. Check Clinical DDI Rules (CSV Based)
        # Check for antagonistic pairs in the list
        for i in range(len(drugs_lower)):
            for j in range(len(drugs_lower)):
                if i != j:
                    d1 = drugs_lower[i]
                    d2 = drugs_lower[j]
                    if d1 in self.contraindications and d2 in self.contraindications[d1]:
                         alerts.append({
                            'type': 'ANTAGONISM',
                            'severity': 'HIGH',
                            'drug': f"{d1} + {d2}",
                            'reason': f"Clinical Antagonism detected between {d1} and {d2}."
                        })
                        
        return alerts
