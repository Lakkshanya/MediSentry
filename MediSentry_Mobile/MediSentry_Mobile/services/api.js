import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Constants from 'expo-constants';

// Determine the base URL dynamically based on the host's IP
const getBaseUrl = () => {
    // 1. Try to get IP from Expo Constants
    const debuggerHost = Constants.expoConfig?.hostUri || Constants.manifest2?.extra?.expoGo?.debuggerHost || Constants.manifest?.debuggerHost;

    if (debuggerHost) {
        const address = debuggerHost.split(':')[0];
        // Only use the detected address if it's NOT localhost/127.0.0.1
        if (address && address !== 'localhost' && address !== '127.0.0.1') {
            const detectedUrl = `http://${address}:8000/api`;
            console.log(`[API] SUCCESS: Automatically detected LAN IP: ${address}. Target: ${detectedUrl}`);
            return detectedUrl;
        }
    }

    // 2. Fallback to host IP and Android Emulator address
    // Android Emulator uses 10.0.2.2 to access the host's localhost
    const LAN_IP = '192.168.1.6'; // Detected host IP
    const fallbackUrl = `http://${LAN_IP}:8000/api`;
    
    console.warn(`[API] WARNING: Could not detect LAN IP. Falling back to ${LAN_IP}.`);
    console.warn(`[API] IMPORTANT: If using a real device, ensure it is on the same WiFi as ${LAN_IP}.`);
    console.warn(`[API] NOTE: If using an Android emulator, you might need to use http://10.0.2.2:8000/api/`);
    
    return fallbackUrl;
};

const BASE_URL = getBaseUrl();

const api = axios.create({
    baseURL: BASE_URL,
    timeout: 30000, // Increased to 30 seconds for AI analysis
});

api.interceptors.request.use(
    async (config) => {
        const token = await AsyncStorage.getItem('userToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        let errorMessage = "An unexpected error occurred";

        if (error.response) {
            // Server responded with a status code outside the 2xx range
            const status = error.response.status;
            const data = error.response.data;

            if (status === 401) {
                // Check if this was a login attempt
                if (error.config?.url?.includes('/token/')) {
                    // First check if the backend gave a specific reason (e.g. email not verified)
                    const rawMsg = data?.detail || data?.error || data?.message || '';
                    const rawLower = rawMsg.toLowerCase();
                    if (
                        rawLower.includes('not verified') ||
                        rawLower.includes('verify your email') ||
                        rawLower.includes('account not verified')
                    ) {
                        // Pass the backend's message through so AuthContext can detect UNVERIFIED
                        errorMessage = rawMsg;
                    } else {
                        errorMessage = "Incorrect email or password.";
                    }
                } else {
                    console.log("[API] 401 Unauthorized detected. Clearing session.");
                    await AsyncStorage.removeItem('userToken');
                    await AsyncStorage.removeItem('userInfo');
                    errorMessage = "Your session has expired. Please log in again.";
                }
            } else if (status === 403) {
                errorMessage = "You do not have permission to perform this action.";
            } else if (status === 404) {
                errorMessage = "The requested resource was not found.";
            } else if (status >= 500) {
                errorMessage = "Server error. Please try again later.";
            } else if (data) {
                // Extract DRF validation errors
                if (typeof data === 'string') {
                    errorMessage = data;
                } else if (data.detail) {
                    errorMessage = data.detail;
                } else if (data.error) {
                    errorMessage = data.error;
                } else {
                    // Combine multiple field errors if present
                    errorMessage = Object.entries(data)
                        .map(([key, val]) => {
                            const msg = Array.isArray(val) ? val.join(', ') : val;
                            // For common fields, just show the message to be friendlier
                            if (['username', 'password', 'detail', 'non_field_errors', 'error', 'message'].includes(key.toLowerCase())) return msg;
                            return `${key}: ${msg}`;
                        })
                        .join('\n');
                }
            }
        } else if (error.request) {
            // The request was made but no response was received
            console.error("[API] Network Error or Timeout:", error.message);
            const attemptedUrl = error.config?.baseURL + (error.config?.url || "");
            errorMessage = "Connection failed. Please check if your server is running and your laptop/phone are on the same WiFi.\n\nTarget: " + attemptedUrl;

            if (error.code === 'ECONNABORTED') {
                errorMessage = "The request timed out. The server might be slow.";
            }
        } else {
            errorMessage = error.message;
        }

        // Create a custom error object that's easier to handle in UI
        const enhancedError = new Error(errorMessage);
        enhancedError.originalError = error;
        enhancedError.status = error.response?.status;
        enhancedError.data = error.response?.data;

        return Promise.reject(enhancedError);
    }
);

export const loginUser = async (username, password) => {
    try {
        const response = await api.post('/token/', { username, password });
        return response.data;
    } catch (error) {
        throw error; // Let the interceptor's enhanced error pass through
    }
};

export const registerUser = async (userData) => {
    try {
        const response = await api.post('/users/register/', userData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export default api;
