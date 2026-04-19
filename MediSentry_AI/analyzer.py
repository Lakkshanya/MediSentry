import pandas as pd
import os
from .modules.interaction_model import InteractionModel
from .modules.risk_model import RiskClassificationModel
from .modules.forecasting_model import ForecastingModel
from .modules.expert_system import ExpertSystem
from .modules.rag_model import RAGExplanation
from .data_loader import DataLoader

class DrugInteractionAnalyzer:
    def __init__(self, dataset_path=None):
        self.loader = DataLoader() # Initialize loader here
        self.interactions = {}
        # Initialize sub-models
        self.interaction_model = InteractionModel()
        self.risk_model = RiskClassificationModel()
        self.forecasting_model = ForecastingModel()
        self.expert_system = ExpertSystem()
        self.rag = RAGExplanation()
        
        # Load drug category mappings for recommendations
        self.drug_categories = self.loader.load_drug_categories()
        # Reverse mapping: class -> [drugs]
        self.category_to_drugs = {}
        for drug, cat in self.drug_categories.items():
            if cat not in self.category_to_drugs:
                self.category_to_drugs[cat] = []
            self.category_to_drugs[cat].append(drug)

    def get_safer_alternatives(self, target_drug, other_drugs):
        """
        Finds drugs in the same therapeutic class that don't interact with other_drugs.
        """
        target_clean = self.normalize_drug_name(target_drug)
        target_class = self.drug_categories.get(target_clean)
        
        if not target_class:
            return []
            
        # Get all drugs in the same class
        potential_alts = self.category_to_drugs.get(target_class, [])
        recommendations = []
        
        for alt in potential_alts:
            if alt == target_clean: continue
            
            # Check if this alternative interacts with any of the other drugs
            test_prescription = [alt] + [self.normalize_drug_name(d) for d in other_drugs]
            interactions = self.analyze(test_prescription)
            
            if not interactions:
                recommendations.append({
                    'name': alt.capitalize(),
                    'reason': f"Same therapeutic class ({target_class}) with no detected interactions."
                })
                
            if len(recommendations) >= 3: break # Return top 3
            
        return recommendations

    def normalize_drug_name(self, name):
        """ Strips suffixes like '(Blood thinner)' or '10mg' to get core drug name. """
        if not name or not isinstance(name, str): return ""
        import re
        # Remove everything in parentheses
        name = re.sub(r'\(.*?\)', '', name)
        # Remove digits and common dosage units
        name = re.sub(r'\d+\s*(mg|ml|mcg|g)\b', '', name, flags=re.IGNORECASE)
        # Keep only alphabetic chars and space, trim
        name = re.sub(r'[^a-zA-Z\s]', '', name)
        return name.strip().lower()

    def analyze(self, drugs):
        # 1. Normalize
        clean_drugs = [self.normalize_drug_name(d) for d in drugs]
        
        # 2. Prediction (Model 1)
        interactions = self.interaction_model.predict(clean_drugs)
        return interactions

    def comprehensive_analyze(self, drugs, patient_conditions=[]):
        """
        Runs both Interaction Model and Expert System checks.
        """
        # 1. Base Interactions (DDI)
        interactions = self.analyze(drugs)
        
        # 2. Clinical Alerts (Drug-Disease, Resistance, etc)
        clinical_alerts = self.expert_system.check_contraindications(patient_conditions, drugs)
        
        # 3. Assess overall risk combining both sources
        risk_level = self.assess_risk(interactions, clinical_alerts)
        
        return {
            'interactions': interactions,
            'clinical_alerts': clinical_alerts,
            'risk_level': risk_level
        }

    def assess_risk(self, interactions, clinical_alerts=[]):
        # Check clinical alerts first - if any HIGH severity alert exists, it's HIGH risk
        for alert in clinical_alerts:
            if alert.get('severity') == 'HIGH':
                return 'HIGH'
        
        if not interactions:
            # Check for medium severity alerts if no interactions
            for alert in clinical_alerts:
                if alert.get('severity') == 'MEDIUM':
                    return 'MEDIUM'
            return 'SAFE'

        count = len(interactions)
        max_sev = 0
        for i in interactions:
            s = 0
            sev_str = str(i.get('severity', '')).upper()
            if sev_str == 'HIGH': s = 10
            elif sev_str == 'MEDIUM': s = 5
            elif sev_str == 'LOW': s = 2
            
            if s > max_sev: max_sev = s
            
        risk_label = self.risk_model.predict_risk(count, max_sev)
        
        # Double check: if model says safe but we have medium alerts, override
        if risk_label == 'SAFE' and any(a.get('severity') == 'MEDIUM' for a in clinical_alerts):
            return 'MEDIUM'
            
        return risk_label

    def get_explanations(self, risk_level, interactions, clinical_alerts=[]):
        # Model 5 (RAG)
        # Combine interactions and alerts for explanation context
        context = interactions + clinical_alerts
        return self.rag.generate_explanation(risk_level, context)

_analyzer = None

def get_analyzer():
    global _analyzer
    if _analyzer is None:
        _analyzer = DrugInteractionAnalyzer()
    return _analyzer
