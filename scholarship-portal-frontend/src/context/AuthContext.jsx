import React, { createContext, useState, useEffect } from 'react';
import { isTokenValid, decodeToken } from '../utils/jwtDecode';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [role, setRole] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token && isTokenValid(token)) {
            const decoded = decodeToken(token);
            setUser(decoded.sub);
            const storedRole = localStorage.getItem('role') || decoded?.role || decoded?.authorities?.[0]?.authority || 'ROLE_STUDENT';
            setRole(storedRole);
            setIsAuthenticated(true);
        } else {
            localStorage.removeItem('token');
            localStorage.removeItem('role');
        }
        setLoading(false);
    }, []);

    const login = (token, userRole) => {
        localStorage.setItem('token', token);
        const normalizedRole = userRole || 'ROLE_STUDENT';
        localStorage.setItem('role', normalizedRole);
        const decoded = decodeToken(token);
        setUser(decoded?.sub);
        setRole(normalizedRole);
        setIsAuthenticated(true);
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        setUser(null);
        setRole(null);
        setIsAuthenticated(false);
    };

    return (
        <AuthContext.Provider value={{ user, role, isAuthenticated, login, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
