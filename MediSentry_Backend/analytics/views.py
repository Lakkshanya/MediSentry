from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from MediSentry_AI.analyzer import get_analyzer

class AnalyzeRiskView(APIView):
    def post(self, request):
        drugs = request.data.get('drugs', [])
        patient_conditions = request.data.get('medical_conditions', [])
        allergies = request.data.get('allergies', [])
        
        # Combine conditions and allergies for the expert system
        all_conditions = list(set(patient_conditions + allergies))
        
        if not drugs:
            return Response({'error': 'No drugs provided'}, status=status.HTTP_400_BAD_REQUEST)
            
        analyzer = get_analyzer()
        
        # 1. Comprehensive Analysis (Interactions + Clinical Alerts)
        results = analyzer.comprehensive_analyze(drugs, all_conditions)
        
        interactions = results['interactions']
        clinical_alerts = results['clinical_alerts']
        risk_level = results['risk_level']
        
        # 3. Get Explanations (RAG)
        explanations = analyzer.get_explanations(risk_level, interactions, clinical_alerts)
        
        return Response({
            'interactions': interactions,
            'clinical_alerts': clinical_alerts,
            'risk_level': risk_level,
            'analysis_summary': f"Found {len(interactions)} drug interactions and {len(clinical_alerts)} clinical alerts.",
            'explanations': explanations
        })

class AlternativesView(APIView):
    def get(self, request, drug_name):
        # Extract other drugs from query params to check for secondary interactions
        # Format: /api/analytics/alternatives/Aspirin/?others=Warfarin,Metformin
        others_str = request.query_params.get('others', '')
        other_drugs = [d.strip() for d in others_str.split(',')] if others_str else []
        
        analyzer = get_analyzer()
        
        # Call AI for real recommendations
        alts = analyzer.get_safer_alternatives(drug_name, other_drugs)
        
        if not alts:
            return Response({
                'original_drug': drug_name,
                'alternatives': [],
                'reason': 'No safer alternative found in the same therapeutic class.'
            })
        
        return Response({
            'original_drug': drug_name,
            'alternatives': alts,
            'reason': 'Data-driven alternatives from the same therapeutic class with no detected interactions.'
        })
