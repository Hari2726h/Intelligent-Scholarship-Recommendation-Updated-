import React from 'react';
import { Spinner } from 'react-bootstrap';

const Loader = ({ fullScreen }) => {
    return (
        <div
            className={`d-flex justify-content-center align-items-center ${fullScreen ? 'vh-100' : 'p-5'}`}
        >
            <Spinner animation="border" role="status" variant="primary">
                <span className="visually-hidden">Loading...</span>
            </Spinner>
        </div>
    );
};

export default Loader;
