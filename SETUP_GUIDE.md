# MediSentry Team Setup & Operations Guide

This guide provides everything a new developer or tester needs to run the complete MediSentry AI suite.

## 1. Prerequisites
- **Python 3.10+**
- **Node.js 18+ & npm**
- **Expo Go App** (installed on a physical Android/iOS device)
- **PostgreSQL** (Optional, default is SQLite for local dev)

---

## 2. Backend Setup (Django)
```bash
cd MediSentry_Backend

# 1. Install dependencies
pip install -r requirements.txt

# 2. Database Migrations
python manage.py makemigrations
python manage.py migrate

# 3. Create a Superuser
python manage.py createsuperuser

# 4. Run the server
# Use 0.0.0.0 to allow mobile device connection via LAN
python manage.py runserver 0.0.0.0:8000
```

---

## 3. Frontend Setup (React Native / Expo)
```bash
cd MediSentry_Mobile

# 1. Install dependencies
npm install

# 2. Configure Backend IP
# Open services/api.js and update 'BASE_URL' to your laptop's Local IP
# Example: const BASE_URL = 'http://192.168.1.15:8000/api';

# 3. Start Expo
# Use --host lan to expose server to your phone via WiFi
npx expo start --host lan
```

---

## 4. Mobile Device Connection Guide
1. Connect your phone to the **Same WiFi** as your laptop.
2. Open the **Expo Go** app.
3. Scan the QR code generated in your terminal.
4. If it fails to connect:
   - Check your laptop's firewall (allow port 8000 and 8081).
   - Verify the IP in `services/api.js` matches your terminal output.

---

## 5. User Roles & Flow
| Role | Dashboard Access | Core Task |
| :--- | :--- | :--- |
| **DOCTOR** | Doctor Dashboard | Entry -> Analysis -> Explain -> Suggest Alternatives |
| **PHARMACIST** | Pharmacy Portal | View Queue -> Verify -> Approve/Flag |
| **ADMIN** | Hospital Analytics | Monitor statistics and risk trends |

---

## 6. AI Model Structure
The AI logic resides in `MediSentry_AI/`.
- `analyzer.py`: Main entry point.
- `modules/interaction_model.py`: DDI Prediction using Knowledge Graph/Lookups.
- `modules/rag_model.py`: Clinical explanation generator.
- `modules/risk_model.py`: Multi-factor risk assessment.
