import React from 'react';
import { Card, Row, Col, ProgressBar, Badge } from 'react-bootstrap';
import { 
    FaTrophy, FaPercentage, FaDollarSign, FaClock, 
    FaCheckCircle, FaTimesCircle, FaSpinner 
} from 'react-icons/fa';
import '../styles/QuickStats.css';

/**
 * Quick Stats Widget Component
 * Displays key metrics and statistics at a glance
 */
const QuickStats = ({ applications = [], scholarships = [] }) => {
    
    // Calculate statistics
    const totalApplications = applications.length;
    const pendingCount = applications.filter(app => app.status === 'PENDING').length;
    const approvedCount = applications.filter(app => app.status === 'APPROVED').length;
    const rejectedCount = applications.filter(app => app.status === 'REJECTED').length;
    
    const successRate = totalApplications > 0 
        ? ((approvedCount / totalApplications) * 100).toFixed(1) 
        : 0;
    
    const totalScholarshipValue = applications
        .filter(app => app.scholarship?.amount)
        .reduce((sum, app) => sum + parseFloat(app.scholarship.amount), 0);
    
    const approvedValue = applications
        .filter(app => app.status === 'APPROVED' && app.scholarship?.amount)
        .reduce((sum, app) => sum + parseFloat(app.scholarship.amount), 0);
    
    const nearestDeadline = applications
        .filter(app => app.scholarship?.deadline && new Date(app.scholarship.deadline) > new Date())
        .sort((a, b) => new Date(a.scholarship.deadline) - new Date(b.scholarship.deadline))[0];
    
    const daysUntilDeadline = nearestDeadline 
        ? Math.ceil((new Date(nearestDeadline.scholarship.deadline) - new Date()) / (1000 * 60 * 60 * 24))
        : null;
    
    return (
        <div className="quick-stats-container mb-4">
            <Row>
                {/* Applications Overview */}
                <Col md={6} lg={3}>
                    <Card className="stat-card total-apps">
                        <Card.Body>
                            <div className="stat-icon">
                                <FaTrophy size={30} />
                            </div>
                            <div className="stat-content">
                                <h3>{totalApplications}</h3>
                                <p>Total Applications</p>
                            </div>
                            <div className="stat-breakdown">
                                <Badge bg="warning" className="me-1">
                                    <FaSpinner className="me-1" />
                                    {pendingCount} Pending
                                </Badge>
                                <Badge bg="success" className="me-1">
                                    <FaCheckCircle className="me-1" />
                                    {approvedCount} Approved
                                </Badge>
                                {rejectedCount > 0 && (
                                    <Badge bg="danger">
                                        <FaTimesCircle className="me-1" />
                                        {rejectedCount} Rejected
                                    </Badge>
                                )}
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Success Rate */}
                <Col md={6} lg={3}>
                    <Card className="stat-card success-rate">
                        <Card.Body>
                            <div className="stat-icon">
                                <FaPercentage size={30} />
                            </div>
                            <div className="stat-content">
                                <h3>{successRate}%</h3>
                                <p>Success Rate</p>
                            </div>
                            <ProgressBar 
                                now={successRate} 
                                variant={successRate > 50 ? 'success' : successRate > 25 ? 'warning' : 'danger'}
                                className="mt-2"
                            />
                            <small className="text-muted mt-1 d-block">
                                {approvedCount} out of {totalApplications} approved
                            </small>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Total Value */}
                <Col md={6} lg={3}>
                    <Card className="stat-card total-value">
                        <Card.Body>
                            <div className="stat-icon">
                                <FaDollarSign size={30} />
                            </div>
                            <div className="stat-content">
                                <h3>₹{(approvedValue / 1000).toFixed(0)}K</h3>
                                <p>Approved Value</p>
                            </div>
                            <small className="text-muted">
                                Total applied: ₹{(totalScholarshipValue / 1000).toFixed(0)}K
                            </small>
                            <ProgressBar 
                                now={totalScholarshipValue > 0 ? (approvedValue / totalScholarshipValue) * 100 : 0}
                                variant="info"
                                className="mt-2"
                            />
                        </Card.Body>
                    </Card>
                </Col>

                {/* Nearest Deadline */}
                <Col md={6} lg={3}>
                    <Card className="stat-card nearest-deadline">
                        <Card.Body>
                            <div className="stat-icon">
                                <FaClock size={30} />
                            </div>
                            <div className="stat-content">
                                {nearestDeadline ? (
                                    <>
                                        <h3>{daysUntilDeadline}</h3>
                                        <p>Days to Nearest Deadline</p>
                                        <small className="text-muted">
                                            {nearestDeadline.scholarship?.title?.substring(0, 30)}...
                                        </small>
                                    </>
                                ) : (
                                    <>
                                        <h3>-</h3>
                                        <p>No Pending Deadlines</p>
                                    </>
                                )}
                            </div>
                            {daysUntilDeadline && (
                                <Badge 
                                    bg={daysUntilDeadline <= 3 ? 'danger' : daysUntilDeadline <= 7 ? 'warning' : 'success'}
                                    className="w-100 mt-2"
                                >
                                    {daysUntilDeadline <= 3 ? '🔴 Urgent' : daysUntilDeadline <= 7 ? '⚠️ Soon' : '✅ On Track'}
                                </Badge>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Additional Insights */}
            <Row className="mt-3">
                <Col>
                    <Card className="insights-card">
                        <Card.Body>
                            <h6 className="mb-3">📊 Quick Insights</h6>
                            <Row>
                                <Col md={3} className="text-center">
                                    <strong className="d-block text-primary" style={{ fontSize: '1.5rem' }}>
                                        {scholarships.length}
                                    </strong>
                                    <small className="text-muted">Available Scholarships</small>
                                </Col>
                                <Col md={3} className="text-center">
                                    <strong className="d-block text-success" style={{ fontSize: '1.5rem' }}>
                                        {totalApplications > 0 ? ((approvedCount / totalApplications) * 100).toFixed(0) : 0}%
                                    </strong>
                                    <small className="text-muted">Approval Rate</small>
                                </Col>
                                <Col md={3} className="text-center">
                                    <strong className="d-block text-warning" style={{ fontSize: '1.5rem' }}>
                                        ₹{approvedValue > 0 ? (approvedValue / approvedCount).toFixed(0) : 0}
                                    </strong>
                                    <small className="text-muted">Avg. Award Value</small>
                                </Col>
                                <Col md={3} className="text-center">
                                    <strong className="d-block text-info" style={{ fontSize: '1.5rem' }}>
                                        {pendingCount}
                                    </strong>
                                    <small className="text-muted">Awaiting Decision</small>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default QuickStats;
