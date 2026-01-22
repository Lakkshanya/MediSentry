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
            const data = await loginUser(username, password);
            setUserToken(data.access);
            await AsyncStorage.setItem('userToken', data.access);

            // Fetch user profile to get Role
            const profile = await api.get('/users/profile/');
            setUserInfo(profile.data);
            await AsyncStorage.setItem('userInfo', JSON.stringify(profile.data));

        } catch (e) {
            console.log(e);
            let msg = 'Check credentials';
            if (e.message && e.message.includes('Network Error')) {
                msg = 'Network Error - Cannot connect to backend. Check IP.';
            } else if (e.detail) {
                msg = e.detail;
            }
            alert('Login Failed: ' + msg);
        }
        setIsLoading(false);
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
            setIsLoading(false);
        } catch (e) {
            console.log(`isLogged in error ${e}`);
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
