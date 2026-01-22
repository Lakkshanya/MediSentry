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
        PENDING = 'PENDING', 'Pending Verification'
        APPROVED = 'APPROVED', 'Approved'
        FLAGGED = 'FLAGGED', 'Flagged'
        REJECTED = 'REJECTED', 'Rejected'
    
    class RiskLevel(models.TextChoices):
        SAFE = 'SAFE', 'Safe'
        MEDIUM = 'MEDIUM', 'Medium Risk'
        HIGH = 'HIGH', 'High Risk'
        UNKNOWN = 'UNKNOWN', 'Unknown'

    doctor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='prescriptions')
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    risk_level = models.CharField(max_length=20, choices=RiskLevel.choices, default=RiskLevel.UNKNOWN) # Logic will set this
    risk_analysis_result = models.JSONField(null=True, blank=True) # Full AI output
    pharmacist_comment = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    image = models.ImageField(upload_to='prescriptions/', null=True, blank=True)

    def __str__(self):
        return f"Rx #{self.id} for {self.patient.name}"

class PrescriptionDrug(models.Model):
    prescription = models.ForeignKey(Prescription, on_delete=models.CASCADE, related_name='drugs')
    drug = models.ForeignKey(Drug, on_delete=models.CASCADE)
    dosage = models.CharField(max_length=100)
    frequency = models.CharField(max_length=100)
    
    def __str__(self):
        return f"{self.drug.name} ({self.dosage})"
