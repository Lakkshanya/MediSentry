import axios from 'axios';

const BASE_URL = 'http://127.0.0.1:8000/api';

const api = axios.create({
    baseURL: BASE_URL,
    timeout: 30000,
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('userToken');
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
            const status = error.response.status;
            const data = error.response.data;

            if (status === 401) {
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
                    localStorage.removeItem('userToken');
                    localStorage.removeItem('userInfo');
                    window.location.href = '/login';
                    errorMessage = "Your session has expired. Please log in again.";
                }
            } else if (status === 403) {
                errorMessage = "You do not have permission to perform this action.";
            } else if (status === 404) {
                errorMessage = "The requested resource was not found.";
            } else if (status >= 500) {
                errorMessage = "Server error. Please try again later.";
            } else if (data) {
                if (typeof data === 'string') {
                    errorMessage = data;
                } else if (data.detail) {
                    errorMessage = data.detail;
                } else if (data.error) {
                    errorMessage = data.error;
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
            errorMessage = "Connection failed. Please check if your server is running.";
            if (error.code === 'ECONNABORTED') {
                errorMessage = "The request timed out.";
            }
        } else {
            errorMessage = error.message;
        }

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
        throw error;
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

export const verifyEmail = async (email, otp) => {
    try {
        const response = await api.post('/users/verify-email/', { email, otp });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export default api;
