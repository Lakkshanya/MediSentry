# MediSentry AI - Code & Folder Explanation

## 1. Folder Structure
The project is divided into three main components:

### `MediSentry_Backend/` (Django)
Contains the server-side logic, API, and database management.
- `medisentry_backend/`: Core project settings (`settings.py`, `urls.py`).
- `users/`: Manages User Authentication and Models (`models.py`, `views.py`).
- `prescriptions/`: Manages Patients, Drugs, and Prescriptions (`models.py`, `views.py`).
- `analytics/`: Connects Backend to the AI Engine (`views.py` calls `DrugInteractionAnalyzer`).

### `MediSentry_Mobile/` (React Native)
Contains the mobile application code (Frontend).
- `App.js`: Main entry point and Navigation logic (Stack Navigator).
- `screens/`: UI Screens.
    - `LoginScreen.js`: Authentication form.
    - `DoctorHomeScreen.js`: Dashboard with quick stats.
    - `PrescriptionUploadScreen.js`: Form to enter prescription details.
    - `RiskAnalysisScreen.js`: Displays results from the AI.
- `services/`: API communication logic (`api.js` using Axios).
- `context/`: State management for Authentication (`AuthContext.js`).

### `MediSentry_AI/` (Python/AI)
Contains the intelligent logic.
- `analyzer.py`: Main class `DrugInteractionAnalyzer` that loads the DDI dataset and predicts risks.
- `models/`: Directory to store trained model files (e.g., .pkl, .pt) in the future.

### `Datasets/`
Contains the raw medical data (CSVs) used by the AI Engine.

## 2. Key Code Files Verification

### `Backend/prescriptions/serializers.py`
Defines how Prescription and Patient data is converted to JSON.
- `PrescriptionSerializer`: Handles nested writing of `drugs` so that sending one JSON object creates the Prescription and linked PrescriptionDrugs in one go.

### `Backend/analytics/views.py`
The API Endpoint for AI.
- `AnalyzeRiskView`: Receives a list of drugs, calls `analyzer.analyze()`, and returns the interaction warnings.

### `Mobile/services/api.js`
Centralized API handling.
- Uses `axios` interceptors to automatically attach the JWT Token to every request, ensuring secure communication.

### `Mobile/App.js`
Navigation Logic.
- Uses `AuthContext` to determine if the user is logged in.
- Switches between `LoginScreen` (Auth Stack) and `DoctorHome` (App Stack) automatically.

## 3. How to Run
1. **Backend**:
   ```bash
   cd MediSentry_Backend
   python manage.py runserver
   ```
2. **Mobile**:
   ```bash
   cd MediSentry_Mobile
   npm start
   ```
   (Scan QR code with Expo Go or run on Emulator)
