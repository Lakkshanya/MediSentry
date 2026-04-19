from users.models import User
from prescriptions.models import Patient, Prescription, PrescriptionDrug

print("\n========== DATABASE REPORT ==========")

print(f"\n[USERS] Total: {User.objects.count()}")
for u in User.objects.all().order_by('-date_joined')[:5]:
    print(f" - {u.username} | Role: {u.role} | Verified: {u.is_verified} | Email: {u.email}")

print(f"\n[PATIENTS] Total: {Patient.objects.count()}")
for p in Patient.objects.all().order_by('-created_at')[:5]:
    print(f" - {p.name} (Age: {p.age})")

print(f"\n[PRESCRIPTIONS] Total: {Prescription.objects.count()}")
for p in Prescription.objects.all().order_by('-created_at')[:5]:
    drugs = PrescriptionDrug.objects.filter(prescription=p)
    drug_names = ", ".join([d.drug_details.name for d in drugs])
    print(f" - Rx #{p.id} for Patient {p.patient.name}")
    print(f"   Drugs: {drug_names}")
    print(f"   Risk Level: {p.risk_level}")
    print(f"   Status: {p.status}")

print("\n=====================================")
