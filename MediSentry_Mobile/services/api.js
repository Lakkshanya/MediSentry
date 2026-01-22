import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Using LAN IP to support both Emulator and Physical Device
// const BASE_URL = 'http://10.0.2.2:8000/api'; // Old Emulator-only
const BASE_URL = 'http://192.168.1.6:8000/api';

const api = axios.create({
    baseURL: BASE_URL,
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
