import React, { useState, useEffect } from 'react';
import { getProfileStrength } from '../services/profileService';
import { Container, Card, ProgressBar, Badge, Alert, ListGroup, Button, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { getAIProfileTips } from '../services/geminiService';

const ProfileStrengthMeter = () => {
    const [strength, setStrength] = useState(null);
    const [loading, setLoading] = useState(true);
    const [aiTips, setAiTips] = useState('');
    const [aiTipsLoading, setAiTipsLoading] = useState(false);

    const handleGetAITips = async () => {
        setAiTipsLoading(true);
        setAiTips('');
        try {
            const tips = await getAIProfileTips(strength);
            setAiTips(tips);
        } catch {
            console.error('Failed to get AI tips');
        } finally {
            setAiTipsLoading(false);
        }
    };

    const navigate = useNavigate();

    useEffect(() => {
        fetchProfileStrength();
    }, []);

    const fetchProfileStrength = async () => {
        try {
            const result = await getProfileStrength();
            if (result.success) {
                setStrength(result.data);
            }
        } catch (error) {
            console.error('Failed to load profile strength:', error);
        } finally {
            setLoading(false);
        }
    };

    const getProgressBarVariant = (level) => {
        switch (level) {
            case 'EXCELLENT':
                return 'success';
            case 'STRONG':
                return 'info';
            case 'MEDIUM':
                return 'warning';
            case 'WEAK':
                return 'danger';
            default:
                return 'secondary';
        }
    };

    const getStrengthIcon = (level) => {
        switch (level) {
            case 'EXCELLENT':
                return '🌟';
            case 'STRONG':
                return '✅';
            case 'MEDIUM':
                return '⚠️';
            case 'WEAK':
                return '❌';
            default:
                return '📊';
        }
    };

    if (loading) {
        return (
            <Container className="py-4">
                <div className="text-center">
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            </Container>
        );
    }

    if (!strength) {
        return null;
    }

    return (
        <Container className="py-4">
            <Card className="shadow-sm">
                <Card.Header className="bg-primary text-white">
                    <h5 className="mb-0">
                        {getStrengthIcon(strength.strengthLevel)} Profile Strength
                    </h5>
                </Card.Header>
                <Card.Body>
                    {/* Overall Score */}
                    <div className="mb-4">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                            <h6>Overall Score</h6>
                            <Badge bg={getProgressBarVariant(strength.strengthLevel)} className="fs-6">
                                {strength.overallScore}/100
                            </Badge>
                        </div>
                        <ProgressBar 
                            now={strength.overallScore} 
                            variant={getProgressBarVariant(strength.strengthLevel)}
                            label={`${strength.strengthLevel}`}
                            style={{ height: '30px', fontSize: '14px' }}
                        />
                    </div>

                    {/* Completeness Percentage */}
                    <div className="mb-4">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                            <h6>Profile Completeness</h6>
                            <span className="text-muted">
                                {strength.completedFields}/{strength.totalFields} fields
                            </span>
                        </div>
                        <ProgressBar 
                            now={strength.completenessPercentage} 
                            label={`${strength.completenessPercentage}%`}
                            variant="success"
                            style={{ height: '25px' }}
                        />
                    </div>

                    {/* Overall Message */}
                    <Alert variant={strength.strengthLevel === 'EXCELLENT' || strength.strengthLevel === 'STRONG' ? 'success' : 'warning'}>
                        {strength.overallMessage}
                    </Alert>

                    {/* Section Checklist */}
                    <div className="mb-4">
                        <h6 className="mb-3">Profile Sections</h6>
                        <ListGroup>
                            <ListGroup.Item className="d-flex justify-content-between align-items-center">
                                <span>
                                    {strength.hasBasicInfo ? '✅' : '❌'} Basic Information
                                </span>
                                <Badge bg={strength.hasBasicInfo ? 'success' : 'danger'}>
                                    {strength.hasBasicInfo ? 'Complete' : 'Incomplete'}
                                </Badge>
                            </ListGroup.Item>
                            <ListGroup.Item className="d-flex justify-content-between align-items-center">
                                <span>
                                    {strength.hasContactInfo ? '✅' : '❌'} Contact Information
                                </span>
                                <Badge bg={strength.hasContactInfo ? 'success' : 'danger'}>
                                    {strength.hasContactInfo ? 'Complete' : 'Incomplete'}
                                </Badge>
                            </ListGroup.Item>
                            <ListGroup.Item className="d-flex justify-content-between align-items-center">
                                <span>
                                    {strength.hasAcademicInfo ? '✅' : '❌'} Academic Information
                                </span>
                                <Badge bg={strength.hasAcademicInfo ? 'success' : 'danger'}>
                                    {strength.hasAcademicInfo ? 'Complete' : 'Incomplete'}
                                </Badge>
                            </ListGroup.Item>
                            <ListGroup.Item className="d-flex justify-content-between align-items-center">
                                <span>
                                    {strength.hasFinancialInfo ? '✅' : '❌'} Financial Information
                                </span>
                                <Badge bg={strength.hasFinancialInfo ? 'success' : 'danger'}>
                                    {strength.hasFinancialInfo ? 'Complete' : 'Incomplete'}
                                </Badge>
                            </ListGroup.Item>
                            <ListGroup.Item className="d-flex justify-content-between align-items-center">
                                <span>
                                    {strength.hasDocuments ? '✅' : '❌'} Documents Uploaded
                                </span>
                                <Badge bg={strength.hasDocuments ? 'success' : 'danger'}>
                                    {strength.hasDocuments ? 'Complete' : 'Incomplete'}
                                </Badge>
                            </ListGroup.Item>
                        </ListGroup>
                    </div>

                    {/* Suggestions */}
                    {strength.suggestions && strength.suggestions.length > 0 && (
                        <div>
                            <h6 className="mb-3">📝 Suggestions to Improve</h6>
                            <ListGroup>
                                {strength.suggestions.map((suggestion, index) => (
                                    <ListGroup.Item key={index} className="d-flex align-items-center">
                                        <span className="me-2">💡</span>
                                        {suggestion}
                                    </ListGroup.Item>
                                ))}
                            </ListGroup>
                        </div>
                    )}

                    {/* Action Button */}
                    <div className="mt-4">
                        <button
                            className="btn btn-primary w-100 mb-3"
                            onClick={() => navigate('/profile')}
                        >
                            Update Profile
                        </button>
                        <Button
                            variant="outline-info"
                            className="w-100"
                            onClick={handleGetAITips}
                            disabled={aiTipsLoading}
                        >
                            {aiTipsLoading ? <><Spinner size="sm" className="me-1" />Getting Tips...</> : '✨ Get AI Profile Tips'}
                        </Button>
                    </div>

                    {/* AI Tips */}
                    {aiTips && (
                        <div className="mt-4 p-3" style={{ background: 'rgba(59,130,246,0.1)', borderRadius: '8px', border: '1px solid rgba(59,130,246,0.3)' }}>
                            <h6 className="mb-3" style={{ color: '#3b82f6' }}>
                                🤖 AI Profile Improvement Tips
                            </h6>
                            <div style={{ lineHeight: '1.7', whiteSpace: 'pre-wrap', fontSize: '14px' }}>
                                {aiTips}
                            </div>
                        </div>
                    )}
                </Card.Body>
            </Card>
        </Container>
    );
};

export default ProfileStrengthMeter;
