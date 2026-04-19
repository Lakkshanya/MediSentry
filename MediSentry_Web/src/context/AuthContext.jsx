import React, { createContext, useState, useEffect } from 'react';
import api, { loginUser } from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [userToken, setUserToken] = useState(null);
    const [userInfo, setUserInfo] = useState(null);

    const login = async (username, password) => {
        setIsLoading(true);
        try {
            const data = await loginUser(username, password);
            
            localStorage.setItem('userToken', data.access);
            setUserToken(data.access);

            if (data.user_profile) {
                localStorage.setItem('userInfo', JSON.stringify(data.user_profile));
                setUserInfo(data.user_profile);
            } else {
                const profileRes = await api.get('/users/profile/');
                localStorage.setItem('userInfo', JSON.stringify(profileRes.data));
                setUserInfo(profileRes.data);
            }

            return { success: true };

        } catch (e) {
            console.error('[AUTH] Login Error:', e);
            const msg = e.message || 'Check credentials';

            const isUnverified =
                msg.toLowerCase().includes('not verified') ||
                msg.toLowerCase().includes('verify your email') ||
                msg.toLowerCase().includes('account not verified');

            return { success: false, errorType: isUnverified ? 'UNVERIFIED' : 'OTHER', message: msg };
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        setUserToken(null);
        setUserInfo(null);
        localStorage.removeItem('userToken');
        localStorage.removeItem('userInfo');
    };

    useEffect(() => {
        const initAuth = async () => {
            try {
                const token = localStorage.getItem('userToken');
                const info = localStorage.getItem('userInfo');

                if (token) {
                    setUserToken(token);
                    if (info && info !== "undefined") {
                        try {
                            setUserInfo(JSON.parse(info));
                        } catch (e) {
                            console.error("Failed to parse userInfo", e);
                        }
                    }
                }
            } catch (e) {
                console.error('Auth initialization error:', e);
            } finally {
                setIsLoading(false);
            }
        };

        initAuth();
    }, []);

    return (
        <AuthContext.Provider value={{ login, logout, isLoading, userToken, userInfo, setUserInfo }}>
            {children}
        </AuthContext.Provider>
    );
};
