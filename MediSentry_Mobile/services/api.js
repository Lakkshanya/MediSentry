import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Constants from 'expo-constants';

// 1. SET YOUR TUNNEL URL HERE (e.g., 'https://something.trycloudflare.com' or 'https://itchy-aliens-bake.loca.lt')
const TUNNEL_URL = 'https://wow-criticism-mandatory-pediatric.trycloudflare.com';

// Determine the base URL dynamically based on the host's IP
const getBaseUrl = () => {
    // Priority 1: Use manual tunnel URL if provided
    if (TUNNEL_URL) {
        console.log(`[API] Using manual tunnel URL: ${TUNNEL_URL}`);
        return TUNNEL_URL.endsWith('/api') ? TUNNEL_URL : `${TUNNEL_URL}/api`;
    }

    // Priority 2: Try to get IP from Expo Constants (works for LAN)
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

    // Priority 3: Fallback to host IP and Android Emulator address
    // Android Emulator uses 10.0.2.2 to access the host's localhost
    const LAN_IP = '10.169.248.203'; // Your current local IP
    const fallbackUrl = `http://${LAN_IP}:8000/api`;

    console.warn(`[API] WARNING: Could not detect LAN IP. Falling back to ${LAN_IP}.`);

    return fallbackUrl;
};

const BASE_URL = getBaseUrl();

const api = axios.create({
    baseURL: BASE_URL,
    timeout: 30000, // Increased to 30 seconds for AI analysis
    headers: {
        'Accept': 'application/json',
        'Bypass-Tunnel-Reminder': 'true', // Still here for backward compatibility with localtunnel
    }
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

            console.error(`[API] Error Response (${status}):`, data);

            if (status === 401) {
                // Check if this was a login attempt
                if (error.config?.url?.includes('/token/')) {
                    const rawMsg = data?.detail || data?.error || data?.message || '';
                    const rawLower = rawMsg.toLowerCase();
                    if (
                        rawLower.includes('not verified') ||
                        rawLower.includes('verify your email') ||
                        rawLower.includes('account not verified')
                    ) {
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
                errorMessage = "The requested resource was not found (404).";
            } else if (status >= 500) {
                errorMessage = `Server error (${status}). The tunnel might be timing out or the backend crashed.`;
            } else if (data) {
                // If the data is actually an HTML page (tunnel error), detect it
                if (typeof data === 'string' && data.toLowerCase().includes('<!doctype html>')) {
                    errorMessage = "Tunnel provider returned an HTML error page. Your tunnel might be blocked or inactive.";
                } else if (typeof data === 'string') {
                    errorMessage = data;
                } else if (data.detail) {
                    errorMessage = data.detail;
                } else {
                    errorMessage = Object.entries(data)
                        .map(([key, val]) => {
                            const msg = Array.isArray(val) ? val.join(', ') : val;
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
            errorMessage = `Connection failed to ${attemptedUrl}.\n\nEnsure your tunnel is running in the terminal and your phone has internet access.`;

            if (error.code === 'ECONNABORTED') {
                errorMessage = "The request timed out. The server or tunnel is responding too slowly.";
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
