import React, { useState, useEffect } from 'react';
import { getBookmarkedScholarships, removeBookmark } from '../services/recommendationService';
import { Container, Row, Col, Card, Badge, Button, Alert, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FaExternalLinkAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { applyForScholarship } from '../services/applicationService';
import { enrichScholarshipCollection } from '../utils/scholarshipUtils';

const BookmarkedScholarships = () => {
    const [scholarships, setScholarships] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchBookmarks();
    }, []);

    const fetchBookmarks = async () => {
        try {
            const result = await getBookmarkedScholarships();
            if (result.success) {
                setScholarships(enrichScholarshipCollection(result.data));
            }
        } catch (error) {
            console.error('Failed to load bookmarks:', error);
            toast.error(error.response?.data?.message || 'Failed to load saved scholarships');
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveBookmark = async (scholarshipId) => {
        try {
            await removeBookmark(scholarshipId);
            setScholarships(prev => prev.filter(s => s.id !== scholarshipId));
            toast.success('Removed from saved scholarships');
        } catch (error) {
            console.error('Failed to remove bookmark:', error);
            toast.error(error.response?.data?.message || 'Failed to remove saved scholarship');
        }
    };

    const handleApply = async (scholarshipId) => {
        try {
            await applyForScholarship(scholarshipId);
            toast.success('Application submitted successfully');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to apply for scholarship');
        }
    };

    if (loading) {
        return (
            <Container className="py-4">
                <div className="text-center">
                    <Spinner animation="border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </Spinner>
                </div>
            </Container>
        );
    }

    return (
        <Container className="py-4">
            <div className="mb-4">
                <h2>⭐ Saved Scholarships</h2>
                <p className="text-muted">
                    Scholarships you've bookmarked for later
                </p>
            </div>

            {scholarships.length === 0 ? (
                <Alert variant="info">
                    <Alert.Heading>No Saved Scholarships</Alert.Heading>
                    <p>You haven't saved any scholarships yet. Browse and bookmark scholarships to keep track of them!</p>
                    <Button variant="primary" onClick={() => navigate('/scholarships')}>
                        Browse Scholarships
                    </Button>
                </Alert>
            ) : (
                <Row>
                    {scholarships.map((scholarship) => (
                        <Col md={6} lg={4} key={scholarship.id} className="mb-4">
                            <Card className="h-100 shadow-sm">
                                <Card.Body>
                                    <div className="d-flex justify-content-between align-items-start mb-2">
                                        <Card.Title>{scholarship.title}</Card.Title>
                                        <Button
                                            variant="outline-danger"
                                            size="sm"
                                            onClick={() => handleRemoveBookmark(scholarship.id)}
                                            title="Remove bookmark"
                                        >
                                            ✕
                                        </Button>
                                    </div>
                                    
                                    <div className="mb-3">
                                        <Badge bg="primary" className="me-2">{scholarship.category}</Badge>
                                        <Badge bg="success">₹{scholarship.amount?.toLocaleString()}</Badge>
                                    </div>

                                    <Card.Text className="text-muted">
                                        {scholarship.description?.substring(0, 120)}...
                                    </Card.Text>

                                    {scholarship.deadline && (
                                        <p className="small text-muted">
                                            <strong>Deadline:</strong> {new Date(scholarship.deadline).toLocaleDateString()}
                                        </p>
                                    )}

                                    {/* Application Link */}
                                    {scholarship.applicationLink && (
                                        <div className="mb-3">
                                            <Button
                                                variant="outline-primary"
                                                size="sm"
                                                className="w-100"
                                                onClick={() => window.open(scholarship.applicationLink, '_blank', 'noopener,noreferrer')}
                                            >
                                                <FaExternalLinkAlt className="me-2" />
                                                Visit Official Site
                                            </Button>
                                        </div>
                                    )}

                                    <div className="d-flex gap-2">
                                        <Button 
                                            variant="primary"
                                            size="sm"
                                            className="flex-grow-1"
                                            onClick={() => navigate(`/scholarships/${scholarship.id}`)}
                                        >
                                            View Details
                                        </Button>
                                        <Button 
                                            variant="outline-primary"
                                            size="sm"
                                            onClick={() => handleApply(scholarship.id)}
                                        >
                                            Apply
                                        </Button>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            )}
        </Container>
    );
};

export default BookmarkedScholarships;
