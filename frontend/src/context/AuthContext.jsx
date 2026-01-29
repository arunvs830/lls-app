import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        try {
            const storedUser = localStorage.getItem('user');
            return storedUser ? JSON.parse(storedUser) : null;
        } catch (error) {
            console.error('Failed to parse user data:', error);
            localStorage.removeItem('user');
            return null;
        }
    });

    const [token, setToken] = useState(() => localStorage.getItem('token'));

    const login = (userData, authToken) => {
        setUser(userData);
        setToken(authToken);

        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', authToken);
        localStorage.setItem('userId', userData.id);
        localStorage.setItem('userRole', userData.role);
    };

    const logout = () => {
        setUser(null);
        setToken(null);

        localStorage.removeItem('user');
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('userRole');

        // Optional: clear other potentially stale data
        localStorage.clear();
    };

    const value = {
        user,
        token,
        login,
        logout,
        isAuthenticated: !!user && !!token,
        loading: false
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
