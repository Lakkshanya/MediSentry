import requests
import json

BASE_URL = 'http://localhost:8000/api'

def run_test():
    # 1. Register User
    print("Registering User...")
    register_data = {
        "username": "doc_test",
        "email": "doc@test.com",
        "password": "password123",
        "role": "DOCTOR",
        "hospital_id": "HOSP123"
    }
    try:
        r = requests.post(f"{BASE_URL}/users/register/", json=register_data)
        if r.status_code == 201:
            print("User Registered.")
        elif r.status_code == 400 and "username" in r.text:
            print("User already exists.")
        else:
            print(f"Register Failed: {r.text}")
            return
    except Exception as e:
        print(f"Connection failed: {e}")
        return

    # 2. Login (Get Token)
    print("Logging in...")
    login_data = {
        "username": "doc_test",
        "password": "password123"
    }
    r = requests.post(f"{BASE_URL}/token/", json=login_data)
    if r.status_code != 200:
        print(f"Login failed: {r.text}")
        return
    token = r.json()['access']
    print("Login Successful.")
    headers = {'Authorization': f'Bearer {token}'}

    # 3. Create Patient
    print("Creating Patient...")
    patient_data = {
        "name": "John Doe",
        "age": 45,
        "gender": "Male",
        "medical_conditions": ["Hypertension"],
        "allergies": ["Peanuts"]
    }
    r = requests.post(f"{BASE_URL}/patients/", json=patient_data, headers=headers)
    if r.status_code != 201 and r.status_code != 200:
        print(f"Create Patient Failed: {r.text}")
        return
    patient_id = r.json()['id']
    print(f"Patient Created (ID: {patient_id})")

    # 4. Create Prescription
    print("Creating Prescription...")
    prescription_data = {
        "patient": patient_id,
        "drugs": [
            {"drug_name": "Aspirin", "dosage": "100mg", "frequency": "Once daily"},
            {"drug_name": "Warfarin", "dosage": "5mg", "frequency": "Once daily"}
        ]
    }
    r = requests.post(f"{BASE_URL}/prescriptions/", json=prescription_data, headers=headers)
    if r.status_code == 201:
        print("Prescription Created Successfully.")
        print(json.dumps(r.json(), indent=2))
    else:
        print(f"Create Prescription Failed: {r.text}")

    # 5. Test AI Analysis
    print("Testing AI Analysis...")
    ai_data = {
        "drugs": ["Aspirin", "Warfarin"]
    }
    r = requests.post(f"{BASE_URL}/analytics/predict/", json=ai_data, headers=headers)
    if r.status_code == 200:
        print("AI Analysis Successful.")
        print(json.dumps(r.json(), indent=2))
    else:
        print(f"AI Analysis Failed: {r.text}")

if __name__ == "__main__":
    run_test()
