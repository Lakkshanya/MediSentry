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
            console.log('[AUTH] Login successful, saving token');

            await AsyncStorage.setItem('userToken', data.access);
            setUserToken(data.access);

            // Optimization: Use profile from login response if available
            if (data.user_profile) {
                console.log('[AUTH] Using profile from login response');
                await AsyncStorage.setItem('userInfo', JSON.stringify(data.user_profile));
                setUserInfo(data.user_profile);
            } else {
                console.log('[AUTH] Profile not in response, fetching...');
                // Fallback for backward compatibility
                const profileRes = await api.get('/users/profile/');
                await AsyncStorage.setItem('userInfo', JSON.stringify(profileRes.data));
                setUserInfo(profileRes.data);
            }

            return { success: true };

        } catch (e) {
            console.log(`[AUTH] Login Error:`, e);
            const msg = e.message || 'Check credentials';

            // Detect unverified account error from backend
            const isUnverified =
                msg.toLowerCase().includes('not verified') ||
                msg.toLowerCase().includes('verify your email') ||
                msg.toLowerCase().includes('account not verified');

            return { success: false, errorType: isUnverified ? 'UNVERIFIED' : 'OTHER', message: msg };
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
        <AuthContext.Provider value={{ login, logout, isLoading, userToken, userInfo, setUserInfo }}>
            {children}
        </AuthContext.Provider>
    );
};
