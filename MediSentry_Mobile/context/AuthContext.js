import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loginUser } from '../services/api';
// jwt-decode removed as we fetch profile from API

// Workaround without jwt-decode for now: fetch profile after login
// OR assume role is returned in login? No, standard SIMPLE_JWT only returns access/refresh.
// Helper to parse token manually if needed, but let's fetch profile.
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [userToken, setUserToken] = useState(null);
    const [userInfo, setUserInfo] = useState(null);

    const login = async (username, password) => {
        setIsLoading(true);
        try {
            console.log(`[AUTH] Attempting login for: ${username}`);
            const data = await loginUser(username, password);
            console.log(`[AUTH] Login Success, fetching profile...`);

            setUserToken(data.access);
            await AsyncStorage.setItem('userToken', data.access);

            // Fetch user profile to get Role
            const profile = await api.get('/users/profile/');
            console.log(`[AUTH] Profile fetched for role: ${profile.data.role}`);

            setUserInfo(profile.data);
            await AsyncStorage.setItem('userInfo', JSON.stringify(profile.data));

        } catch (e) {
            console.log(`[AUTH] Login Error:`, e);
            if (e.response?.status === 401) {
                logout(); // Clear state if token fetch failed
            }

            let msg = 'Check credentials';
            const data = e.response?.data;

            if (data) {
                if (typeof data === 'string') {
                    msg = data;
                } else if (data.non_field_errors) {
                    msg = data.non_field_errors.join('\n');
                } else if (data.detail) {
                    msg = data.detail;
                } else {
                    // Collect field-specific errors
                    const fieldErrors = Object.entries(data)
                        .map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`)
                        .join('\n');
                    if (fieldErrors) msg = fieldErrors;
                }
            } else if (e.message && e.message.includes('Network Error')) {
                msg = 'Server Unreachable. Ensure your laptop and phone are on the same WiFi and update the IP in services/api.js';
            }

            alert('Login Failed\n\n' + msg);
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        setIsLoading(true);
        setUserToken(null);
        setUserInfo(null);
        await AsyncStorage.removeItem('userToken');
        await AsyncStorage.removeItem('userInfo');
        setIsLoading(false);
    };

    const isLoggedIn = async () => {
        try {
            setIsLoading(true);
            let userToken = await AsyncStorage.getItem('userToken');
            let userInfo = await AsyncStorage.getItem('userInfo');

            if (userToken) {
                setUserToken(userToken);
                if (userInfo) setUserInfo(JSON.parse(userInfo));
            }
        } catch (e) {
            console.log(`isLogged in error ${e}`);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        isLoggedIn();
    }, []);

    return (
        <AuthContext.Provider value={{ login, logout, isLoading, userToken, userInfo }}>
            {children}
        </AuthContext.Provider>
    );
};
