import os
import django

# Setup Django Environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'medisentry_backend.settings')
django.setup()

from prescriptions.models import Prescription, Patient
from MediSentry_AI.analyzer import get_analyzer

def heal_prescription_data():
    print("🚀 Starting Retroactive Risk Analysis (Data Healing)...")
    prescriptions = Prescription.objects.all()
    analyzer = get_analyzer()
    updated_count = 0

    for rx in prescriptions:
        print(f"🔍 Analyzing Rx #{rx.id} for {rx.patient.name}...")
        
        # 1. Gather Clinical Context
        drugs = [d.drug.name for d in rx.drugs.all()]
        patient_conditions = rx.patient.medical_conditions or []
        allergies = rx.patient.allergies or []
        
        # Combine conditions and allergies for the expert system
        all_conditions = list(set(patient_conditions + allergies))
        
        if not drugs:
            print(f"⚠️  Rx #{rx.id} has no drugs. Skipping.")
            continue
            
        try:
            # 2. Re-Analyze using the Trained AI Model
            results = analyzer.comprehensive_analyze(drugs, all_conditions)
            
            # 3. Update the database record
            old_level = rx.risk_level
            rx.risk_level = results['risk_level']
            rx.risk_analysis_result = results
            rx.save()
            
            print(f"✅ Rx #{rx.id} Updated: {old_level} -> {rx.risk_level}")
            updated_count += 1
        except Exception as e:
            print(f"❌ Error analyzing Rx #{rx.id}: {e}")

    print(f"\n✨ Data Healing Complete! Updated {updated_count} prescriptions.")

if __name__ == "__main__":
    heal_prescription_data()
