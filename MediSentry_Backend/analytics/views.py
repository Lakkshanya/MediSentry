from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from MediSentry_AI.analyzer import DrugInteractionAnalyzer

# Initialize Analyzer (Singleton-ish)
analyzer = DrugInteractionAnalyzer()

class AnalyzeRiskView(APIView):
    def post(self, request):
        drugs = request.data.get('drugs', [])
        if not drugs:
            return Response({'error': 'No drugs provided'}, status=status.HTTP_400_BAD_REQUEST)
            
        # 1. Detect Interactions
        interactions = analyzer.analyze(drugs)
        
        # 2. Assess Risk
        risk_level = analyzer.assess_risk(interactions)
        
        # 3. Get Explanations (RAG)
        explanations = analyzer.get_explanations(risk_level, interactions)
        
        return Response({
            'interactions': interactions,
            'risk_level': risk_level,
            'analysis_summary': f"Found {len(interactions)} interactions.",
            'explanations': explanations
        })

class AlternativesView(APIView):
    def get(self, request, drug_name):
        # Mock logic for alternatives (Real world would use Knowledge Graph)
        alternatives_db = {
            'aspirin': ['Clopidogrel', 'Ticlopidine'],
            'warfarin': ['Apixaban', 'Rivaroxaban', 'Dabigatran'],
            'ibuprofen': ['Paracetamol', 'Celecoxib'],
            'ciprofloxacin': ['Azithromycin', 'Levofloxacin']
        }
        
        drug_key = drug_name.lower()
        alts = alternatives_db.get(drug_key, ['No specific alternative found. Consult Pharmacist.'])
        
        return Response({
            'original_drug': drug_name,
            'alternatives': alts,
            'reason': 'Safer profile for detected interaction.'
        })
