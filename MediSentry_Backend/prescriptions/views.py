from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import Prescription, Patient, Drug
from .serializers import PrescriptionSerializer, PatientSerializer

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
            # Pharmacists see all or specific logic
            return Prescription.objects.all()
        return Prescription.objects.all()

    def perform_create(self, serializer):
        serializer.save(doctor=self.request.user)

    @action(detail=True, methods=['post'])
    def verify(self, request, pk=None):
        prescription = self.get_object()
        # Only Pharmacist can verify
        if request.user.role != 'PHARMACIST':
            return Response({'error': 'Only pharmacists can verify'}, status=status.HTTP_403_FORBIDDEN)
            
        action = request.data.get('action') # 'APPROVE', 'FLAG', 'REJECT'
        comment = request.data.get('comment', '')
        
        if action == 'APPROVE':
            prescription.status = 'APPROVED'
        elif action == 'FLAG':
            prescription.status = 'FLAGGED'
        elif action == 'REJECT':
            prescription.status = 'REJECTED'
        else:
            return Response({'error': 'Invalid action'}, status=status.HTTP_400_BAD_REQUEST)
        
        prescription.pharmacist_comment = comment
        prescription.save()
        return Response({'status': prescription.status})
