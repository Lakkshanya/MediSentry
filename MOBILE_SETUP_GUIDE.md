# How to Run MediSentry on Your Phone (Expo Go)

Since the "Creating..." spinner was stuck, I have optimized the backend to send emails in the background. This should fix the delay. 
Here are the steps to view the app on your phone:

### 1. Connect to Same WiFi
*   Make sure your **Laptop/PC** and your **Phone** are connected to the exact same WiFi network: `Wi-Fi`.
*   Your PC IP is: `192.168.1.6`.

### 2. Verify Backend is Accessible
*   I have already updated `MediSentry_Mobile/services/api.js` to point to `http://192.168.1.6:8000`.
*   I have opened the Firewall Port 8000 for you.
*   **Test**: Open Chrome on your **Phone** and type `http://192.168.1.6:8000`. 
    *   If you see a Django page (or error), it works!
    *   If it times out, your firewall is still blocking it or the WiFi has "Client Isolation".

### 3. Clear Mobile Cache & Start
Run these commands in your PC terminal to reset the mobile packager:

```powershell
cd MediSentry_Mobile
npx expo start --clear
```

### 4. Scan the QR Code
*   Open **Expo Go** on your Android phone.
*   Scan the QR code shown in the terminal.
*   The app should load much faster now.

### 5. Troubleshooting "Stuck Creating"
*   I moved the Email Sending to a **Background Thread**. 
*   Now, when you click "Create Account", it should instantly move to the Verification Screen.
*   The email will arrive 5-10 seconds later depending on Google's speed.

**Note**: Since I reset the database, please Create a New Account.
