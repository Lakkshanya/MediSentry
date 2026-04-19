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
                     # Correct Column Indexing for Expert Rules (using names)
                     d1 = str(row['A_Drug_Name']).strip().lower() 
                     d2 = str(row['B_Drug_Name']).strip().lower()
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
             'liver_failure': ['paracetamol'],
             'asthma': ['aspirin', 'ibuprofen']
        }

        # 1b. Allergy Class Mapping (Critical for safety)
        allergy_map = {
            'penicillin': ['amoxicillin', 'ampicillin', 'penicillin v', 'cloxacillin', 'piperacillin'],
            'nsaid': ['aspirin', 'ibuprofen', 'naproxen', 'diclofenac'],
            'sulfa': ['sulfamethoxazole', 'sulfasalazine'],
            'statin': ['simvastatin', 'atorvastatin', 'rosuvastatin']
        }
        
        # Check against conditions (Contraindications)
        for condition in patient_conditions:
            cond_key = condition.lower().strip().replace(" ", "_")
            
            # Check for Disease Contraindications
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
            
            # Check for Allergic Reactions (Class-based)
            # We check the condition list because allergies are often passed as conditions
            # OR we check a dedicated 'allergies' field if provided in the future
            for allergy_class, drugs_in_class in allergy_map.items():
                if allergy_class in cond_key: # e.g. "Penicillin Allergy" contains "penicillin"
                    for drug in drugs_lower:
                        # Check if drug is in the class or starts with class name (e.g. "penicillin v")
                        if any(d in drug for d in drugs_in_class) or drug in drugs_in_class:
                            alerts.append({
                                'type': 'ALLERGY',
                                'severity': 'HIGH',
                                'drug': drug,
                                'reason': f"CRITICAL: Patient has a {allergy_class.capitalize()} allergy. Prescribing '{drug}' (a {allergy_class.capitalize()} derivative) is highly dangerous."
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
