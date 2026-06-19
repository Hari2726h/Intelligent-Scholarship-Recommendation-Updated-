import React from 'react';
import { Modal } from 'react-bootstrap';
import { FaCheckCircle, FaClock, FaTimesCircle, FaCircle } from 'react-icons/fa';
import '../styles/ApplicationTimeline.css';

const ApplicationTimeline = ({ show, onHide, application }) => {
    if (!application) return null;

    // Mock status history (in real app, this would come from backend)
    const statusHistory = [
        {
            status: 'SUBMITTED',
            changedAt: application.appliedDate || new Date().toISOString(),
            changedBy: 'Student',
            remarks: 'Application submitted successfully'
        },
        {
            status: 'UNDER_REVIEW',
            changedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            changedBy: 'Admin',
            remarks: 'Application is under review'
        }
    ];

    // Add current status if different
    if (application.status !== 'SUBMITTED' && application.status !== 'UNDER_REVIEW') {
        statusHistory.push({
            status: application.status,
            changedAt: new Date().toISOString(),
            changedBy: 'Admin',
            remarks: application.status === 'APPROVED' ? 'Congratulations! Your application has been approved' : 'Unfortunately, your application was not successful this time'
        });
    }

    const getStatusIcon = (status) => {
        switch(status) {
            case 'APPROVED':
                return <FaCheckCircle size={24} className="text-success" />;
            case 'REJECTED':
                return <FaTimesCircle size={24} className="text-danger" />;
            case 'PENDING':
            case 'SUBMITTED':
                return <FaClock size={24} className="text-warning" />;
            case 'UNDER_REVIEW':
                return <FaClock size={24} className="text-info" />;
            default:
                return <FaCircle size={24} className="text-secondary" />;
        }
    };

    const getStatusClass = (status) => {
        switch(status) {
            case 'APPROVED':
                return 'timeline-success';
            case 'REJECTED':
                return 'timeline-danger';
            case 'PENDING':
            case 'SUBMITTED':
                return 'timeline-warning';
            case 'UNDER_REVIEW':
                return 'timeline-info';
            default:
                return 'timeline-secondary';
        }
    };

    const formatStatus = (status) => {
        return status.replace(/_/g, ' ').toUpperCase();
    };

    return (
        <Modal show={show} onHide={onHide} size="lg" centered>
            <Modal.Header closeButton>
                <Modal.Title>Application Timeline</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <h5 className="mb-3">{application.scholarship?.title}</h5>
                <p className="text-muted">Track your application progress</p>

                <div className="application-timeline mt-4">
                    {statusHistory.map((item, index) => (
                        <div key={index} className={`timeline-item ${getStatusClass(item.status)}`}>
                            <div className="timeline-marker">
                                {getStatusIcon(item.status)}
                            </div>
                            <div className="timeline-content">
                                <div className="d-flex justify-content-between align-items-start mb-2">
                                    <h6 className="mb-0">{formatStatus(item.status)}</h6>
                                    <small className="text-muted">
                                        {new Date(item.changedAt).toLocaleString()}
                                    </small>
                                </div>
                                <p className="mb-1">{item.remarks}</p>
                                <small className="text-muted">By: {item.changedBy}</small>
                            </div>
                        </div>
                    ))}
                </div>

                {application.status === 'PENDING' && (
                    <div className="alert alert-info mt-4">
                        <strong>What's Next?</strong>
                        <p className="mb-0 mt-2">
                            Your application is being reviewed. You will be notified once a decision is made.
                            This process may take 5-10 business days.
                        </p>
                    </div>
                )}

                {application.status === 'APPROVED' && (
                    <div className="alert alert-success mt-4">
                        <strong>Congratulations! 🎉</strong>
                        <p className="mb-0 mt-2">
                            Your application has been approved. You will receive further instructions via email.
                        </p>
                    </div>
                )}
            </Modal.Body>
        </Modal>
    );
};

export default ApplicationTimeline;
