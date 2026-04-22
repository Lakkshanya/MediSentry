# MediSentry Team Setup & Operations Guide

This guide provides everything a new developer or tester needs to run the complete MediSentry AI suite.

## 1. Tech Stack Overview

### Backend (MediSentry_Backend)
| Component | Technology | Description |
| :--- | :--- | :--- |
| **Framework** | **Django REST Framework** | Robust python-based API server. |
| **Database** | **SQLite** (Dev) / PostgreSQL | Relational DB for users, prescriptions, and history. |
| **Auth** | **JWT (SimpleJWT)** | Secure token-based authentication. |
| **Async Tasks** | **Threading** | Background email sending and AI processing. |

### Frontend (MediSentry_Mobile)
| Component | Technology | Description |
| :--- | :--- | :--- |
| **Framework** | **React Native (Expo)** | Cross-platform mobile development. |
| **Navigation** | **React Navigation 7** | Stack and Tab-based routing. |
| **State** | **Context API** | Lightweight global state for Auth. |
| **Networking** | **Axios** | API client with interceptors for auth. |

### Artificial Intelligence (MediSentry_AI)
| Model Name | Type / Algorithm | File | Description |
| :--- | :--- | :--- | :--- |
| **Interaction Predictor** | **Deep Learning (PyTorch)** | `interaction_model.py` | Neural Network (`DDI_Network`) + Knowledge Graph lookup to predict high-risk Drug-Drug Interactions. |
| **Risk Classifier** | **Gradient Boosting** | `risk_model.py` | `GradientBoostingClassifier` (sklearn) that assesses overall prescription risk (Low/Medium/High) based on interaction count and severity. |
| **Safety Expert System** | **Rule-Based Engine** | `expert_system.py` | Deterministic logic for **Contraindications** (Drug-Disease), **Allergies**, and Antimicrobial Resistance checks. |
| **Clinical Explainer** | **RAG (TF-IDF/Cosine)** | `rag_model.py` | Retrieval-Augmented Generation system that fetches clinical evidence documents to explain *why* an interaction is dangerous. |
| **Trend Forecaster** | **LSTM (Time-Series)** | `forecasting_model.py` | Long Short-Term Memory network to predict future risk trends for hospital departments based on historical data. |

---

## 2. Installation & Setup

### A. Backend Setup (Django)
**Prerequisites**: Python 3.10+

1.  Navigate to the backend directory:
    ```bash
    cd MediSentry_Backend
    ```

2.  **Install Python Dependencies:**
    (If `requirements.txt` is missing, install these core packages)
    ```bash
    pip install django djangorestframework djangorestframework-simplejwt django-cors-headers torch numpy pandas scikit-learn requests
    ```

3.  **Initialize Database:**
    ```bash
    python manage.py makemigrations
    python manage.py migrate
    ```

4.  **Create Admin User:**
    ```bash
    python manage.py createsuperuser
    ```

5.  **Run Server:**
    ```bash
    python manage.py runserver 0.0.0.0:8000
    ```

### B. Frontend Setup (React Native)
**Prerequisites**: Node.js 18+

1.  Navigate to the mobile directory:
    ```bash
    cd MediSentry_Mobile
    ```

2.  **Install Node Dependencies:**
    ```bash
    npm install
    ```
    *Core dependencies include: `expo`, `react-native`, `@react-navigation/native`, `axios`, `jwt-decode`.*

3.  **Start the Mobile App:**
    Connect your Android device via USB (Recommended for stability).
    ```bash
    npx expo start --host lan
    ```

---

## 3. Connection Guide (Accessing local server)

### Option 1: USB / ADB Reverse (Recommended)
This method bypasses WiFi isolation issues.
1.  Connect phone via USB.
2.  Enable **USB Debugging** on phone.
3.  Run: `adb reverse tcp:8000 tcp:8000`
4.  App will connect to `localhost:8000`.

### Option 2: WiFi LAN
1.  Ensure Laptop and Phone are on the **Same WiFi**.
2.  Update `MediSentry_Mobile/services/api.js`:
    ```javascript
    const LAN_IP = 'YOUR_LAPTOP_IP'; // e.g., 192.168.1.5
    ```

### Option 3: Remote / Hotspot Testing (Universal - Recommended)
Use this if the phone and laptop are on different networks (e.g., Mobile Data).
1.  **Start a Public Tunnel (Cloudflare):**
    ```bash
    npx cloudflared tunnel --url http://localhost:8000
    ```
2.  **Get the URL:** Copy the `https://...trycloudflare.com` address it provides.
3.  **Configure App:** Paste the URL into `MediSentry_Mobile/services/api.js` at the top:
    ```javascript
    const TUNNEL_URL = 'https://your-url.trycloudflare.com';
    ```
4.  **Restart Expo:** Press `r` in the expo terminal.

### Option 4: ngrok (Most Stable)
If `localtunnel` is slow or failing:
1.  **Install & Setup:** [ngrok.com](https://ngrok.com) (requires a free account and token).
2.  **Run:**
    ```bash
    ngrok http 8000
    ```
3.  **Configure App:** Paste the `Forwarding` URL into `api.js`'s `TUNNEL_URL`.

---

## 4. Troubleshooting
-   **"Network Error"**: Use Option 1 (USB) above. Check if backend is running on port 8000.
-   **"Profile Save Failed"**: Ensure `Hospital ID` is either valid or empty (app handles this now).

---

## 5. Development Workflow
1.  **Doctor Flow**: Login -> Dashboard -> "New Rx" -> Add Patient/Drugs -> "Analyze Risk" -> Submit.
2.  **Pharmacist Flow**: Login -> Dashboard (See "Pending/Under Review") -> Approve or Flag.
3.  **Admin Flow**: View `AdminSummary` for AI-driven insights.
