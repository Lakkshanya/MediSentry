from sklearn.ensemble import GradientBoostingClassifier
import numpy as np
import os
from ..data_loader import DataLoader

class RiskClassificationModel:
    def __init__(self):
        self.loader = DataLoader()
        
        # Algorithm: Gradient Boosting (XGBoost substitute)
        self.clf = GradientBoostingClassifier(n_estimators=100, learning_rate=0.1, max_depth=3)
        self.is_trained = False
        
        # REAL Training from Dataset
        X_real, y_real = self.loader.load_risk_training_data()
        
        if X_real is not None and len(X_real) > 10:
             self.clf.fit(X_real, y_real)
             self.is_trained = True
             print(f"[RISK MODEL] Trained on {len(X_real)} samples from Real Dataset.")
        else:
             print("[RISK MODEL] No training data found. Model is untrained.")

    def predict_risk(self, interaction_count, max_severity_score):
        """
        Input: Features (Interaction Results)
        Output: Safe / Medium / High
        """
        if not self.is_trained:
            return "UNKNOWN (Model Untrained)"
            
        # Feature Vector: [count, max_severity_numeric]
        features = np.array([[interaction_count, max_severity_score]])
        prediction = self.clf.predict(features)[0]
        return prediction
