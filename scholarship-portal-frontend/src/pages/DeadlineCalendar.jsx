import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Button } from 'react-bootstrap';
import { FaCalendarAlt, FaClock, FaExternalLinkAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { getMyApplications } from '../services/applicationService';
import { getAllScholarships } from '../services/scholarshipService';
import { toast } from 'react-toastify';
import '../styles/DeadlineCalendar.css';

/**
 * Deadline Calendar View
 * Visual timeline of upcoming scholarship deadlines
 */
const DeadlineCalendar = () => {
    const navigate = useNavigate();
    const [deadlines, setDeadlines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    useEffect(() => {
        fetchDeadlines();
    }, []);

    const fetchDeadlines = async () => {
        try {
            const [appsRes, scholRes] = await Promise.all([
                getMyApplications(),
                getAllScholarships(0, 100) // Fetch more scholarships for better coverage
            ]);

            // Extract data from response
            const applications = Array.isArray(appsRes.data) 
                ? appsRes.data 
                : (appsRes.data?.data || []);
            
            const scholarships = scholRes.data?.content || scholRes.data || [];

            // Combine deadlines from both sources
            const allDeadlines = [
                ...applications
                    .filter(app => app.scholarship?.deadline) // Only include with valid deadlines
                    .map(app => ({
                        id: app.scholarship?.id || app.id,
                        title: app.scholarship?.title || 'Unknown',
                        deadline: new Date(app.scholarship?.deadline),
                        type: 'application',
                        status: app.status,
                        applicationLink: app.scholarship?.applicationLink
                    })),
                ...scholarships
                    .filter(s => s.deadline && !applications.some(app => app.scholarship?.id === s.id))
                    .map(s => ({
                        id: s.id,
                        title: s.title,
                        deadline: new Date(s.deadline),
                        type: 'scholarship',
                        applicationLink: s.applicationLink
                    }))
            ];

            // Sort by nearest deadline first
            const sorted = allDeadlines
                .filter(d => !isNaN(d.deadline.getTime()) && d.deadline >= new Date())
                .sort((a, b) => a.deadline - b.deadline);

            setDeadlines(sorted);
        } catch (error) {
            console.error('Error fetching deadlines:', error);
            toast.error('Failed to load deadlines');
        } finally {
            setLoading(false);
        }
    };

    const getDaysUntil = (deadline) => {
        const today = new Date();
        const diff = deadline - today;
        return Math.ceil(diff / (1000 * 60 * 60 * 24));
    };

    const getUrgencyClass = (days) => {
        if (days < 0) return 'expired';
        if (days <= 3) return 'urgent';
        if (days <= 7) return 'warning';
        if (days <= 30) return 'normal';
        return 'future';
    };

    const getUrgencyBadge = (days) => {
        if (days < 0) return <Badge bg="dark">Expired</Badge>;
        if (days <= 3) return <Badge bg="danger">🔴 Urgent</Badge>;
        if (days <= 7) return <Badge bg="warning" text="dark">⚠️ This Week</Badge>;
        if (days <= 30) return <Badge bg="info">📅 This Month</Badge>;
        return <Badge bg="secondary">📆 Future</Badge>;
    };

    const groupByMonth = () => {
        const grouped = {};
        deadlines.forEach(deadline => {
            const monthYear = `${deadline.deadline.toLocaleString('default', { month: 'long' })} ${deadline.deadline.getFullYear()}`;
            if (!grouped[monthYear]) {
                grouped[monthYear] = [];
            }
            grouped[monthYear].push(deadline);
        });
        return grouped;
    };

    if (loading) {
        return (
            <Container className="py-5 text-center">
                <div className="spinner-border text-primary" role="status"></div>
            </Container>
        );
    }

    const groupedDeadlines = groupByMonth();

    return (
        <Container fluid className="deadline-calendar-container py-4">
            <div className="mb-4">
                <h2 className="gradient-text">
                    <FaCalendarAlt className="me-2" />
                    Deadline Calendar
                </h2>
                <p className="text-muted">Track all upcoming scholarship deadlines in one place</p>
            </div>

            {deadlines.length === 0 ? (
                <Card className="text-center py-5">
                    <Card.Body>
                        <FaCalendarAlt size={60} className="text-muted mb-3" />
                        <h4>No upcoming deadlines</h4>
                        <p className="text-muted">Browse scholarships to see their deadlines</p>
                        <Button variant="primary" onClick={() => navigate('/scholarships')}>
                            Browse Scholarships
                        </Button>
                    </Card.Body>
                </Card>
            ) : (
                <>
                    {/* Timeline View */}
                    <div className="deadline-timeline">
                        {Object.entries(groupedDeadlines).map(([monthYear, items]) => (
                            <div key={monthYear} className="month-section">
                                <h4 className="month-header">{monthYear}</h4>
                                <div className="deadline-items">
                                    {items.map((item, idx) => {
                                        const daysUntil = getDaysUntil(item.deadline);
                                        return (
                                            <Card 
                                                key={`${item.type}-${item.id}-${idx}`} 
                                                className={`deadline-card ${getUrgencyClass(daysUntil)}`}
                                            >
                                                <Card.Body>
                                                    <div className="d-flex justify-content-between align-items-start">
                                                        <div className="flex-grow-1">
                                                            <div className="d-flex align-items-center mb-2">
                                                                {getUrgencyBadge(daysUntil)}
                                                                {item.type === 'application' && (
                                                                    <Badge bg="success" className="ms-2">
                                                                        Applied
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            <h5 className="mb-2">{item.title}</h5>
                                                            <div className="deadline-info">
                                                                <FaClock className="me-2" />
                                                                <strong>{item.deadline.toLocaleDateString()}</strong>
                                                                <span className="ms-2 text-muted">
                                                                    ({daysUntil} {daysUntil === 1 ? 'day' : 'days'} left)
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="deadline-actions">
                                                            {item.applicationLink && (
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline-primary"
                                                                    onClick={() => window.open(item.applicationLink, '_blank')}
                                                                    className="me-2"
                                                                >
                                                                    <FaExternalLinkAlt className="me-1" />
                                                                    Apply
                                                                </Button>
                                                            )}
                                                            <Button
                                                                size="sm"
                                                                variant="outline-secondary"
                                                                onClick={() => navigate(`/scholarships/${item.id}`)}
                                                            >
                                                                Details
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </Card.Body>
                                            </Card>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Summary Stats */}
                    <Row className="mt-4">
                        <Col md={3}>
                            <Card className="stat-card urgent-stat">
                                <Card.Body className="text-center">
                                    <h2>{deadlines.filter(d => getDaysUntil(d.deadline) <= 3).length}</h2>
                                    <p>Urgent (≤3 days)</p>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={3}>
                            <Card className="stat-card warning-stat">
                                <Card.Body className="text-center">
                                    <h2>{deadlines.filter(d => getDaysUntil(d.deadline) <= 7 && getDaysUntil(d.deadline) > 3).length}</h2>
                                    <p>This Week</p>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={3}>
                            <Card className="stat-card normal-stat">
                                <Card.Body className="text-center">
                                    <h2>{deadlines.filter(d => getDaysUntil(d.deadline) <= 30 && getDaysUntil(d.deadline) > 7).length}</h2>
                                    <p>This Month</p>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={3}>
                            <Card className="stat-card future-stat">
                                <Card.Body className="text-center">
                                    <h2>{deadlines.filter(d => getDaysUntil(d.deadline) > 30).length}</h2>
                                    <p>Later</p>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </>
            )}
        </Container>
    );
};

export default DeadlineCalendar;
