# MediSentry AI - Test Inputs & Scenarios

Use these inputs to test the various AI models and flows in the Mobile Application.

## 1. Login Credentials ANDROID EMULATOR / WEB
Use this account (created by the verification script) or register a new one.

- **Username**: `doc_test`
- **Password**: `password123`
- **Role**: Doctor

---

## 2. Test Scenarios for AI Models

### Scenario A: High Risk Interaction (Model 1 & 2)
Test the **Interaction Prediction** and **Risk Classification** models.

*   **Patient Name**: Alice Risk
*   **Drugs to Enter**:
    1.  `Aspirin`
    2.  `Warfarin`
*   **Expected Result**:
    -   **Risk Level**: `HIGH` (or similar warning)
    -   **Interaction**: "Major bleeding risk"
    -   **Explanation**: "Aspirin enhances the anticoagulant effect of Warfarin..."

### Scenario B: Medium Risk Interaction
Test subtler interactions.

*   **Patient Name**: Bob Pain
*   **Drugs to Enter**:
    1.  `Ibuprofen`
    2.  `Aspirin`
*   **Expected Result**:
    -   **Risk Level**: `MEDIUM`
    -   **Interaction**: "Ibuprofen may reduce antiplatelet effect..."

### Scenario C: Safe Prescription
Test baseline safety.

*   **Patient Name**: Charlie Safe
*   **Drugs to Enter**:
    1.  `Paracetamol` (or `Acetaminophen`)
*   **Expected Result**:
    -   **Risk Level**: `SAFE`
    -   **No critical interactions.**

### Scenario D: Contraindication (Model 4 - Expert System)
Test the Rule-Based Expert System.

*   **Patient Condition**: `Kidney Failure` (Enter this in patient details if available, or assume implied context)
*   **Drugs to Enter**:
    1.  `Metformin`
    2.  `NSAIDs` (or `Ibuprofen`)
*   **Expected Result**:
    -   **Alert**: "Contraindicated for Kidney Failure."

---

## 3. How to Input
1.  Open the Mobile App.
2.  Login with `doc_test` / `password123`.
3.  Tap **"New Prescription"**.
4.  Enter the **Drug Names** listed above in the "Medication List" section.
5.  Tap **"Analyze Risk"**.
6.  View the results on the **Risk Analysis Screen**.
