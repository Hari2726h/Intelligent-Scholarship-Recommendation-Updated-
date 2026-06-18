import React from 'react';
import { Link } from 'react-router-dom';
import { FaExclamationTriangle } from 'react-icons/fa';

const NotFound = () => {
    return (
        <div className="d-flex flex-column align-items-center justify-content-center pt-5 mt-5">
            <FaExclamationTriangle size={80} className="text-warning mb-4" />
            <h1 className="fw-bold display-4">404</h1>
            <h3 className="text-muted mb-4">Page Not Found</h3>
            <p className="text-center text-secondary mb-4">
                The page you are looking for doesn't exist or you don't have access to it.
            </p>
            <Link to="/" className="btn btn-primary-gradient px-4 py-2">Return to Dashboard</Link>
        </div>
    );
};

export default NotFound;
