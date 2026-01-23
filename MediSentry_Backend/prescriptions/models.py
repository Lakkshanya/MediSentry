from django.db import models
from django.conf import settings

class Patient(models.Model):
    name = models.CharField(max_length=255)
    age = models.IntegerField()
    gender = models.CharField(max_length=20)
    medical_conditions = models.JSONField(default=list)  # List of strings
    allergies = models.JSONField(default=list)  # List of strings
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.age})"

class Drug(models.Model):
    name = models.CharField(max_length=255, unique=True)
    description = models.TextField(blank=True, null=True)
    
    def __str__(self):
        return self.name

class Prescription(models.Model):
    class Status(models.TextChoices):
        DRAFT = 'DRAFT', 'Draft'
        PENDING = 'PENDING', 'Pending Verification'
        UNDER_REVIEW = 'UNDER_REVIEW', 'Under Pharmacist Review'
        FLAGGED = 'FLAGGED', 'Flagged'
        APPROVED = 'APPROVED', 'Approved'
        REJECTED = 'REJECTED', 'Rejected'
    
    class RiskLevel(models.TextChoices):
        SAFE = 'SAFE', 'Safe'
        MEDIUM = 'MEDIUM', 'Medium Risk'
        HIGH = 'HIGH', 'High Risk'
        UNKNOWN = 'UNKNOWN', 'Unknown'

    doctor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='prescriptions')
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE)
    status = models.CharField(max_length=30, choices=Status.choices, default=Status.PENDING)
    risk_level = models.CharField(max_length=20, choices=RiskLevel.choices, default=RiskLevel.UNKNOWN)
    risk_analysis_result = models.JSONField(null=True, blank=True)
    pharmacist_comment = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    # [NEW] Advanced Safety Fields
    is_high_risk_acknowledged = models.BooleanField(default=False)
    clinical_justification = models.TextField(blank=True, null=True)
    is_emergency_override = models.BooleanField(default=False)
    emergency_reason = models.TextField(blank=True, null=True)
    chosen_alternative = models.CharField(max_length=255, blank=True, null=True)
    doctor_response = models.TextField(blank=True, null=True)
    image = models.ImageField(upload_to='prescriptions/', null=True, blank=True)

    def __str__(self):
        return f"Rx #{self.id} for {self.patient.name}"

class AuditLog(models.Model):
    actor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    action = models.CharField(max_length=100)
    prescription = models.ForeignKey(Prescription, on_delete=models.CASCADE, related_name='audit_logs')
    timestamp = models.DateTimeField(auto_now_add=True)
    details = models.JSONField(default=dict)

    def __str__(self):
        return f"{self.actor.username} {self.action} on Rx #{self.prescription.id}"

class PrescriptionDrug(models.Model):
    prescription = models.ForeignKey(Prescription, on_delete=models.CASCADE, related_name='drugs')
    drug = models.ForeignKey(Drug, on_delete=models.CASCADE)
    dosage = models.CharField(max_length=100)
    frequency = models.CharField(max_length=100)
    
    def __str__(self):
        return f"{self.drug.name} ({self.dosage})"
