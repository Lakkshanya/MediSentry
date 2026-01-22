import os
import django
import sys

# Setup Django Environment (Mocking minimal setup to allow imports if needed, 
# but mostly we test the AI classes directly which are pure Python)
sys.path.append('c:/cprogram/MediSentry/MediSentry_Backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'medisentry_backend.settings')

try:
    django.setup()
except:
    pass

sys.path.append('c:/cprogram/MediSentry') # Add Root to Path
from MediSentry_AI.analyzer import DrugInteractionAnalyzer

def test_real_world_scenario():
    print("=================================================================")
    print("   MEDISENTRY AI VERIFICATION - REAL DATASETS MODE")
    print("=================================================================")
    
    analyzer = DrugInteractionAnalyzer()
    
    drugs = ['Warfarin', 'Ibuprofen', 'Vancomycin'] 
    patient_data = {'conditions': ['Pregnant']} 
    
    print(f"\n[INPUT] Drugs: {drugs}")
    print(f"[INPUT] Condition: {patient_data['conditions']}")
    
    # 1. Prediction
    interactions = analyzer.analyze(drugs)
    
    # 2. Risk
    risk = analyzer.assess_risk(interactions)
    
    # 3. Expert System (Manually called here as it's not in main analyze yet)
    alerts = analyzer.expert_system.check_contraindications(patient_data['conditions'], drugs)
    
    # 4. RAG
    explanations = analyzer.get_explanations(risk, interactions)
    
    print("\n------------------- ANALYSIS RESULTS -------------------")
    
    print(f"\n1. RISK LEVEL: {risk}")
    
    print(f"\n2. INTERACTIONS DETECTED:")
    for interaction in interactions:
        print(f"   - {interaction['description']}")
        
    print(f"\n3. ALERTS (Expert System & CARD):")
    for alert in alerts:
        print(f"   - [{alert['type']}] {alert['drug']} -> {alert.get('reason')}")
        
    print(f"\n4. RAG EXPLANATION:")
    for expl in explanations:
        print(f"   - {expl['mechanism']}")

if __name__ == "__main__":
    test_real_world_scenario()
