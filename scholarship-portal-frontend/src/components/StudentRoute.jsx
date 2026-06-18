import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const StudentRoute = ({ children }) => {
    const { isAuthenticated, role, loading } = useContext(AuthContext);

    if (loading) return <div>Loading...</div>;

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (role !== 'ROLE_STUDENT' && role !== 'STUDENT') {
        return <Navigate to="/not-found" replace />;
    }

    return children;
};

export default StudentRoute;
