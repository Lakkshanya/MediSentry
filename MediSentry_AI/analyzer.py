import pandas as pd
import os
from .modules.interaction_model import InteractionModel
from .modules.risk_model import RiskClassificationModel
from .modules.forecasting_model import ForecastingModel
from .modules.expert_system import ExpertSystem
from .modules.rag_model import RAGExplanation

class DrugInteractionAnalyzer:
    def __init__(self, dataset_path=None):
        self.interactions = {}
        # Initialize sub-models
        self.interaction_model = InteractionModel()
        self.risk_model = RiskClassificationModel()
        self.forecasting_model = ForecastingModel()
        self.expert_system = ExpertSystem()
        self.rag = RAGExplanation()

    def analyze(self, drugs):
        # 1. Prediction (Model 1)
        # Returns list of dicts
        interactions = self.interaction_model.predict(drugs)
        return interactions

    def assess_risk(self, interactions):
        # 2. Risk Classification (Model 2)
        if not interactions:
            return 'SAFE'

        count = len(interactions)
        # Convert severity to numeric for model: HIGH=10, MEDIUM=5, SAFE=0, OTHERS=2
        max_sev = 0
        for i in interactions:
            s = 0
            sev_str = str(i.get('severity', '')).upper()
            if sev_str == 'HIGH': s = 10
            elif sev_str == 'MEDIUM': s = 5
            elif sev_str == 'LOW': s = 2
            
            if s > max_sev: max_sev = s
            
        risk_label = self.risk_model.predict_risk(count, max_sev)
        return risk_label

    def get_explanations(self, risk_level, interactions):
        # Model 5 (RAG)
        return self.rag.generate_explanation(risk_level, interactions)
