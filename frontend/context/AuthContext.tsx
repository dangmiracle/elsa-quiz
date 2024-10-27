// context/AuthContext.tsx
'use client';

import React, { createContext, useState, useEffect, useContext } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import api from '../lib/api';

interface AuthContextProps {
    isAuthenticated: boolean;
    login: (username: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const router = useRouter();

    // Check authentication status on mount
    useEffect(() => {
        const token = Cookies.get('token');
        setIsAuthenticated(!!token);
    }, []);

    // Login function
    const login = async (username: string) => {
        try {
            const response = await api.post('/auth/login', { username });
            Cookies.set('token', response.data.data.token);
            Cookies.set('username', username);
            setIsAuthenticated(true);
            router.push('/quizzes');
        } catch (error) {
            console.error('Login failed:', error);
        }
    };

    // Logout function
    const logout = () => {
        Cookies.remove('token');
        Cookies.remove('username');
        setIsAuthenticated(false);
        router.push('/login');
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextProps => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
