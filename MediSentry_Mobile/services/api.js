import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Using LAN IP to support both Emulator and Physical Device
// const BASE_URL = 'http://10.0.2.2:8000/api'; // Old Emulator-only
const BASE_URL = 'http://192.168.1.6:8000/api';

const api = axios.create({
    baseURL: BASE_URL,
    timeout: 10000, // 10 seconds timeout
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
        if (error.response && error.response.status === 401) {
            // If we get a 401, the token is invalid (likely due to DB wipe or expiry)
            console.log("[API] 401 Unauthorized detected. Clearing session.");
            await AsyncStorage.removeItem('userToken');
            await AsyncStorage.removeItem('userInfo');
            // Note: In a real app, we'd trigger a logout/redirect here.
            // For now, clearing storage ensures on next reload/action the app prompts for login.
        }
        return Promise.reject(error);
    }
);

export const loginUser = async (username, password) => {
    try {
        const response = await api.post('/token/', { username, password });
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : error;
    }
};

export const registerUser = async (userData) => {
    try {
        const response = await api.post('/users/register/', userData);
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : error;
    }
};

export default api;
