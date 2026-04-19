from rest_framework import serializers
from .models import Prescription, PrescriptionDrug, Patient, Drug, Notification

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'

class PatientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Patient
        fields = '__all__'

class PrescriptionDrugSerializer(serializers.ModelSerializer):
    drug_name = serializers.CharField(write_only=True)  # Accept name string
    drug_details = serializers.SerializerMethodField()
    
    class Meta:
        model = PrescriptionDrug
        fields = ('id', 'drug_name', 'drug_details', 'dosage', 'frequency')
    
    def get_drug_details(self, obj):
        return {"name": obj.drug.name}

class PrescriptionSerializer(serializers.ModelSerializer):
    drugs = PrescriptionDrugSerializer(many=True)
    patient = serializers.PrimaryKeyRelatedField(queryset=Patient.objects.all(), write_only=True)
    patient_details = PatientSerializer(source='patient', read_only=True)
    patient_name = serializers.CharField(source='patient.name', read_only=True)
    
    doctor_name = serializers.SerializerMethodField()
    doctor_specialization = serializers.SerializerMethodField()
    
    class Meta:
        model = Prescription
        fields = '__all__'
        read_only_fields = ('doctor', 'created_at')

    def get_doctor_name(self, obj):
        # Return full name if available, else username
        if obj.doctor.first_name or obj.doctor.last_name:
            return f"{obj.doctor.first_name} {obj.doctor.last_name}".strip()
        return obj.doctor.username

    def get_doctor_specialization(self, obj):
        return getattr(obj.doctor, 'specialization', '') or ''

    def create(self, validated_data):
        drugs_data = validated_data.pop('drugs')
        # patient is already resolved to an object by PrimaryKeyRelatedField and is in validated_data
        
        prescription = Prescription.objects.create(**validated_data)
        
        for drug_data in drugs_data:
            drug_name = drug_data.pop('drug_name')
            drug, created = Drug.objects.get_or_create(name=drug_name)
            PrescriptionDrug.objects.create(prescription=prescription, drug=drug, **drug_data)
        
        return prescription

    def update(self, instance, validated_data):
        drugs_data = validated_data.pop('drugs', None)
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        if drugs_data is not None:
            instance.drugs.all().delete()
            for drug_data in drugs_data:
                drug_name = drug_data.pop('drug_name')
                drug, created = Drug.objects.get_or_create(name=drug_name)
                PrescriptionDrug.objects.create(prescription=instance, drug=drug, **drug_data)
                
        return instance

