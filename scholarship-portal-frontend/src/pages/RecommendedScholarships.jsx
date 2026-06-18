import React, { useState, useEffect } from 'react';
import { getRecommendations, bookmarkScholarship, removeBookmark } from '../services/recommendationService';
import { Container, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FaExternalLinkAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { enrichScholarshipCollection, paginateItems } from '../utils/scholarshipUtils';

const RecommendedScholarships = () => {
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const navigate = useNavigate();
    const pageSize = 6;

    useEffect(() => {
        fetchRecommendations();
    }, []);

    const fetchRecommendations = async () => {
        try {
            const result = await getRecommendations();
            if (result.success) {
                setRecommendations(enrichScholarshipCollection(result.data));
                setPage(0);
            }
        } catch (error) {
            console.error('Failed to load recommendations:', error);
            toast.error(error.response?.data?.message || 'Failed to load recommendations');
        } finally {
            setLoading(false);
        }
    };

    const handleBookmark = async (scholarshipId, isBookmarked) => {
        try {
            if (isBookmarked) {
                await removeBookmark(scholarshipId);
            } else {
                await bookmarkScholarship(scholarshipId);
            }

            // Update local state
            setRecommendations(prev => prev.map(rec =>
                rec.scholarshipId === scholarshipId
                    ? { ...rec, isBookmarked: !isBookmarked }
                    : rec
            ));
            toast.success(isBookmarked ? 'Removed from saved scholarships' : 'Saved scholarship successfully');
        } catch (error) {
            console.error('Failed to update bookmark:', error);
            toast.error(error.response?.data?.message || 'Failed to update saved scholarships');
        }
    };

    const visibleRecommendations = paginateItems(recommendations, page, pageSize);
    const totalPages = Math.ceil(recommendations.length / pageSize);

    if (loading) {
        return (
            <Container className="py-4">
                <div className="text-center">
                    <Spinner animation="border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </Spinner>
                    <p className="mt-2">Analyzing your profile and finding the best scholarships...</p>
                </div>
            </Container>
        );
    }

    return (
        <div className="container-fluid py-4">

            <div className="mb-4">
                <h2 className="fw-bold gradient-text">
                    Recommended Scholarships
                </h2>
                <p style={{ color: "#94a3b8" }}>
                    Based on your profile, here are personalized recommendations
                </p>
            </div>

            {recommendations.length === 0 ? (
                <div className="modern-empty-card">
                    <h5>No Recommendations Yet</h5>
                    <p className="text-muted">
                        Complete your profile to unlock AI-powered suggestions.
                    </p>
                    <button
                        className="btn-primary-modern"
                        onClick={() => navigate('/profile')}
                    >
                        Complete Profile
                    </button>
                </div>
            ) : (
                <div className="recommendations-grid">
                    {visibleRecommendations.map((rec) => (
                        <div
                            key={rec.scholarshipId}
                            className="recommend-card-v2"
                            onClick={() => navigate(`/scholarships/${rec.scholarshipId}`)}
                            style={{ cursor: 'pointer' }}
                        >

                            {/* LEFT SIDE */}
                            <div className="rec-v2-left">

                                <h4 className="rec-v2-title">{rec.title}</h4>

                                <div className="rec-v2-meta">
                                    <span className="meta-pill">{rec.category}</span>
                                    <span className="meta-pill amount">
                                        ₹{rec.amount?.toLocaleString()}
                                    </span>
                                </div>

                                <p className="rec-v2-desc">
                                    {rec.description?.substring(0, 140)}...
                                </p>

                                <div className="rec-v2-breakdown">
                                    <span>CGPA {rec.cgpaScore?.toFixed(0)}%</span>
                                    <span>Income {rec.incomeScore?.toFixed(0)}%</span>
                                    <span>Category {rec.categoryScore?.toFixed(0)}%</span>
                                </div>

                                <div className={`rec-v2-eligibility ${rec.isEligible ? 'yes' : 'no'}`}>
                                    {rec.eligibilityMessage}
                                </div>

                            </div>

                            {/* RIGHT SIDE */}
                            <div className="rec-v2-right">

                                <div className="rec-v2-score">
                                    {rec.matchScore.toFixed(0)}%
                                    <span>Match</span>
                                </div>

                                <button
                                    className={`bookmark-v2 ${rec.isBookmarked ? 'active' : ''}`}
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        handleBookmark(rec.scholarshipId, rec.isBookmarked);
                                    }}
                                >
                                    {rec.isBookmarked ? '★ Saved' : '☆ Save'}
                                </button>

                                {rec.applicationLink && (
                                    <button
                                        className="btn-outline-primary w-100 mb-2"
                                        onClick={(event) => {
                                            event.stopPropagation();
                                            window.open(rec.applicationLink, '_blank', 'noopener,noreferrer');
                                        }}
                                    >
                                        <FaExternalLinkAlt className="me-2" />
                                        Visit Application Site
                                    </button>
                                )}

                                <button
                                    className="btn-primary-modern w-100"
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        navigate(`/scholarships/${rec.scholarshipId}`);
                                    }}
                                >
                                    View Details
                                </button>

                            </div>

                        </div>
                    ))}

                    {totalPages > 1 && (
                        <div className="d-flex justify-content-center align-items-center gap-3 mt-4">
                            <button className="btn-outline-modern" disabled={page === 0} onClick={() => setPage((current) => current - 1)}>
                                Previous
                            </button>
                            <span className="text-muted">Page {page + 1} of {totalPages}</span>
                            <button className="btn-outline-modern" disabled={page >= totalPages - 1} onClick={() => setPage((current) => current + 1)}>
                                Next
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default RecommendedScholarships;
