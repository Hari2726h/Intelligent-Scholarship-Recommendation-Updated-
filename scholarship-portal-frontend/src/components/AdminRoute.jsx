import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const AdminRoute = ({ children }) => {
    const { isAuthenticated, role, loading } = useContext(AuthContext);

    if (loading) return <div>Loading...</div>;

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Assuming role mapped to ROLE_ADMIN or ADMIN
    if (role !== 'ROLE_ADMIN' && role !== 'ADMIN') {
        return <Navigate to="/not-found" replace />;
    }

    return children;
};

export default AdminRoute;
