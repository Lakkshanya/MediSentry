# MediSentry AI - Project Documentation

## 1. Abstract
MediSentry AI is a Web and Mobile-based Clinical Decision Support System (CDSS) designed to reduce medication errors in healthcare environments. By leveraging Artificial Intelligence and Machine Learning, the system assists healthcare professionals in detecting drug-drug interactions, predicting medication risks, and providing explainable evidence-backed insights. The system serves as a supportive tool for Doctors, Pharmacists, and Administrators to ensure patient safety.

## 2. System Architecture
The system follows a microservices-inspired architecture with a centralized Backend serving multiple clients (Mobile, Web).

### 2.1 Technology Stack
- **Backend**: Django REST Framework (Python)
- **Database**: PostgreSQL (Relational Data), Redis (Caching/Queues)
- **Mobile App**: React Native (Expo)
- **AI Engine**: Python (Pandas/Scikit-learn/PyTorch)
- **Authentication**: JWT (JSON Web Tokens)

### 2.2 Architecture Diagram
[Mobile/Web UI] <--> [REST API (Django)] <--> [PostgreSQL]
                                       |
                                    [AI Engine] <--> [Datasets/Vector DB]

## 3. Module Descriptions

### 3.1 Backend (Django)
The backend acts as the central brain of the system.
- **Users App**: Manages authentication, roles (Doctor, Pharmacist, Admin), and profiles.
- **Prescriptions App**: Handles prescription creation, drug linking, and status management (Pending -> Approved/Flagged).
- **Analytics App**: Interfaces with the AI Engine to analyzing prescriptions for risks interaction.

### 3.2 Mobile Application (React Native)
A distinct mobile interface for doctors to working on-the-go.
- **Doctor Dashboard**: View recent patients and quick actions.
- **Prescription Upload**: Form to input patient details and prescribed drugs.
- **Risk Analysis**: Displays AI-generated risk alerts with severity levels and explanations.

### 3.3 AI Engine
The intelligence layer that processes drug data.
- **Interaction Model**: Detects pairwise interactions using medical datasets.
- **Risk Classifier**: Determines overall prescription risk (Low/Medium/High).

## 4. Database Design (Schema)
- **User**: `id`, `username`, `email`, `role`, `hospital_id`
- **Patient**: `id`, `name`, `age`, `medical_conditions` (JSON), `allergies` (JSON)
- **Prescription**: `id`, `patient_fk`, `doctor_fk`, `status`, `risk_level`, `created_at`
- **Drug**: `id`, `name`, `description`
- **PrescriptionDrug**: `id`, `prescription_fk`, `drug_fk`, `dosage`, `frequency`

## 5. Workflow
1. **Login**: Doctor logs in via Mobile App.
2. **Input**: Doctor enters patient details and drugs.
3. **Processing**: Backend receives data and triggers AI analysis.
4. **Analysis**: AI Engine checks for interactions using the Knowledge Base.
5. **Output**: System returns risk level and specific alerts.
6. **Decision**: Doctor reviews alerts and submits or modifies the prescription.

## 6. Future Enhancements
- Integration with Hospital EMR systems (HL7/FHIR).
- Advanced RAG (Retrieval-Augmented Generation) for detailed clinical explanations.
- Pharmacist verification workflow on Mobile.
