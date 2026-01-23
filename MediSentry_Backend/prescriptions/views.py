from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import Prescription, Patient, Drug, AuditLog
from .serializers import PrescriptionSerializer, PatientSerializer
from MediSentry_AI.analyzer import get_analyzer
from django.db.models import Count, Q
from django.utils import timezone

class PatientViewSet(viewsets.ModelViewSet):
    queryset = Patient.objects.all()
    serializer_class = PatientSerializer
    permission_classes = [permissions.IsAuthenticated]

class PrescriptionViewSet(viewsets.ModelViewSet):
    serializer_class = PrescriptionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'DOCTOR':
            return Prescription.objects.filter(doctor=user)
        elif user.role == 'PHARMACIST':
            return Prescription.objects.all()
        return Prescription.objects.all()

    def perform_create(self, serializer):
        prescription = serializer.save(doctor=self.request.user)
        
        # Auto-run AI Analysis
        drugs_list = [d.drug.name for d in prescription.drugs.all()]
        if drugs_list:
            analyzer = get_analyzer()
            interactions = analyzer.analyze(drugs_list)
            risk_level = analyzer.assess_risk(interactions)
            
            # Update Prescription with AI results
            analysis_result = {
                'interactions': interactions,
                'explanations': analyzer.get_explanations(risk_level, interactions)
            }
            
            prescription.risk_level = risk_level
            prescription.risk_analysis_result = analysis_result
            
            # Initial Status: If high risk, it needs refinement/acknowledgement in the next step (UI)
            # But here we set it to PENDING initially.
            prescription.save()

            # Create Initial Audit Log
            AuditLog.objects.create(
                actor=self.request.user,
                action="PRESCRIPTION_SUBMITTED",
                prescription=prescription,
                details={'risk_level': risk_level}
            )

    @action(detail=False, methods=['get'])
    def summary(self, request):
        """ Returns counts for the Doctor Dashboard """
        user = request.user
        high_risk = Prescription.objects.filter(doctor=user, risk_level='HIGH').count()
        pending = Prescription.objects.filter(doctor=user, status='PENDING').count()
        return Response({
            'high_risk': high_risk,
            'pending': pending
        })

    @action(detail=True, methods=['post'])
    def verify(self, request, pk=None):
        prescription = self.get_object()
        if request.user.role != 'PHARMACIST':
            return Response({'error': 'Only pharmacists can verify'}, status=status.HTTP_403_FORBIDDEN)
            
        action_type = request.data.get('action') # 'APPROVE', 'FLAG', 'REJECT', 'HOLD', 'SUGGEST'
        comment = request.data.get('comment', '')
        reason = request.data.get('reason', '') # E.g., 'Drug-drug interaction'
        
        old_status = prescription.status
        
        if action_type == 'APPROVE':
            prescription.status = 'APPROVED'
        elif action_type == 'FLAG':
            prescription.status = 'FLAGGED'
        elif action_type == 'REJECT':
            prescription.status = 'REJECTED'
        elif action_type == 'HOLD':
            prescription.status = 'UNDER_REVIEW'
        elif action_type == 'SUGGEST':
            prescription.status = 'UNDER_REVIEW'
        else:
            return Response({'error': 'Invalid action'}, status=status.HTTP_400_BAD_REQUEST)
        
        prescription.pharmacist_comment = comment
        prescription.save()

        # Audit Log
        AuditLog.objects.create(
            actor=request.user,
            action=f"PHARMACIST_{action_type}",
            prescription=prescription,
            details={
                'old_status': old_status,
                'new_status': prescription.status,
                'comment': comment,
                'flag_reason': reason
            }
        )
        
        return Response({'status': prescription.status})

    @action(detail=False, methods=['get'])
    def audit(self, request):
        """ Returns hospital-wide audit logs (Admin only) """
        if not request.user.is_superuser and str(request.user.role).upper() != 'ADMIN':
            return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
        
        logs = AuditLog.objects.select_related('actor', 'prescription').all().order_by('-timestamp')[:100]
        data = [{
            'id': l.id,
            'actor': l.actor.username,
            'action': l.action,
            'timestamp': l.timestamp,
            'details': l.details,
            'rx_id': l.prescription.id if l.prescription else None
        } for l in logs]
        return Response(data)

    @action(detail=False, methods=['get'])
    def analytics(self, request):
        """ Returns high-level governance analytics """
        if not request.user.is_superuser and str(request.user.role).upper() != 'ADMIN':
            return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
        
        total_rx = Prescription.objects.count()
        high_risk_count = Prescription.objects.filter(risk_level='HIGH').count()
        emergency_overrides = Prescription.objects.filter(is_emergency_override=True).count()
        
        # Risk per doctor
        docs = Prescription.objects.values('doctor__username').annotate(
            total=Count('id'),
            high_risk=Count('id', filter=Q(risk_level='HIGH'))
        )

        return Response({
            'total_prescriptions': total_rx,
            'high_risk_rate': (high_risk_count / total_rx * 100) if total_rx > 0 else 0,
            'emergency_frequency': emergency_overrides,
            'doctor_breakdown': docs
        })
