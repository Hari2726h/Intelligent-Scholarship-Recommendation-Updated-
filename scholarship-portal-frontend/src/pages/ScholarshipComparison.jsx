import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Container, Row, Col, Table, Button, Badge, Card, Spinner } from 'react-bootstrap';
import { FaCheckCircle, FaTimesCircle, FaArrowLeft, FaPrint, FaDownload, FaRobot } from 'react-icons/fa';
import API from '../services/api';
import { toast } from 'react-toastify';
import '../styles/ScholarshipComparison.css';
import { compareScholarshipsAI } from '../services/geminiService';

/**
 * Scholarship Comparison Tool
 * Compare multiple scholarships side-by-side
 */
const ScholarshipComparison = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [scholarships, setScholarships] = useState([]);
    const [loading, setLoading] = useState(true);
    const [aiSummary, setAiSummary] = useState('');
    const [aiLoading, setAiLoading] = useState(false);

    const handleAICompare = async () => {
        if (scholarships.length < 2) {
            toast.error('Need at least 2 scholarships to compare');
            return;
        }
        setAiLoading(true);
        setAiSummary('');
        try {
            const result = await compareScholarshipsAI(scholarships);
            setAiSummary(result);
        } catch {
            toast.error('AI comparison failed. Please try again.');
        } finally {
            setAiLoading(false);
        }
    };

    useEffect(() => {
        // Get scholarship IDs from URL params
        const params = new URLSearchParams(location.search);
        const ids = params.get('ids')?.split(',') || [];
        
        if (ids.length === 0) {
            toast.error('No scholarships selected for comparison');
            navigate('/scholarships');
            return;
        }

        fetchScholarships(ids);
    }, [location]);

    const fetchScholarships = async (ids) => {
        try {
            const promises = ids.map(id => API.get(`/scholarships/${id}`));
            const responses = await Promise.all(promises);
            const data = responses.map(res => res.data?.data || res.data);
            setScholarships(data);
        } catch (error) {
            toast.error('Failed to load scholarships for comparison');
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const handleExportCSV = () => {
        if (scholarships.length === 0) return;

        const headers = ['Feature', ...scholarships.map(s => s.title)];
        const rows = [
            ['Amount', ...scholarships.map(s => `₹${parseInt(s.amount).toLocaleString()}`)],
            ['Deadline', ...scholarships.map(s => new Date(s.deadline).toLocaleDateString())],
            ['Category', ...scholarships.map(s => s.category)],
            ['Provider', ...scholarships.map(s => s.provider)],
            ['Min CGPA', ...scholarships.map(s => s.minCgpa || 'N/A')],
            ['Max Income', ...scholarships.map(s => s.maxIncome ? `₹${parseInt(s.maxIncome).toLocaleString()}` : 'N/A')],
            ['Awards', ...scholarships.map(s => s.awardCount || 'N/A')],
        ];

        const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'scholarship-comparison.csv';
        a.click();
    };

    const ComparisonRow = ({ label, values, isHighlight = false }) => (
        <tr className={isHighlight ? 'highlight-row' : ''}>
            <td className="feature-label"><strong>{label}</strong></td>
            {values.map((value, idx) => (
                <td key={idx} className="comparison-value">{value}</td>
            ))}
        </tr>
    );

    if (loading) {
        return (
            <Container className="py-5 text-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </Container>
        );
    }

    return (
        <Container fluid className="comparison-container py-4">
            <div className="d-flex justify-content-between align-items-center mb-4 no-print">
                <div>
                    <Button variant="link" onClick={() => navigate(-1)} className="p-0 me-3">
                        <FaArrowLeft /> Back
                    </Button>
                    <h2 className="d-inline">Scholarship Comparison</h2>
                </div>
                <div className="d-flex gap-2">
                    <Button
                        variant="outline-info"
                        onClick={handleAICompare}
                        disabled={aiLoading || scholarships.length < 2}
                    >
                        {aiLoading ? <><Spinner size="sm" className="me-1" />Analyzing...</> : <><FaRobot className="me-1" />AI Summary</>}
                    </Button>
                    <Button variant="outline-primary" onClick={handlePrint} className="me-2">
                        <FaPrint /> Print
                    </Button>
                    <Button variant="outline-success" onClick={handleExportCSV}>
                        <FaDownload /> Export CSV
                    </Button>
                </div>
            </div>

            {/* AI Comparison Summary */}
            {(aiSummary || aiLoading) && (
                <Card className="modern-card mb-4" style={{ border: '1px solid rgba(59,130,246,0.3)' }}>
                    <Card.Header style={{ background: 'linear-gradient(135deg,#1e3a5f,#312e81)', padding: '14px 20px' }}>
                        <h6 className="mb-0 text-white"><FaRobot className="me-2" />🤖 AI Comparison Analysis</h6>
                    </Card.Header>
                    <Card.Body style={{ background: '#0f172a' }}>
                        {aiLoading ? (
                            <div className="text-center py-3">
                                <Spinner animation="border" variant="primary" />
                                <p className="text-muted mt-2">Gemini is analyzing scholarships...</p>
                            </div>
                        ) : (
                            <div style={{ color: '#e2e8f0', lineHeight: '1.7', whiteSpace: 'pre-wrap', fontSize: '14px' }}>
                                {aiSummary}
                            </div>
                        )}
                    </Card.Body>
                </Card>
            )}

            {scholarships.length > 0 ? (
                <div className="comparison-table-wrapper">
                    <Table bordered hover responsive className="comparison-table">
                        <thead>
                            <tr>
                                <th className="feature-column">Feature</th>
                                {scholarships.map(scholarship => (
                                    <th key={scholarship.id} className="scholarship-column">
                                        <div className="scholarship-header">
                                            <h5>{scholarship.title}</h5>
                                            <Badge bg="primary">{scholarship.category}</Badge>
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            <ComparisonRow 
                                label="💰 Scholarship Amount" 
                                values={scholarships.map(s => `₹${parseInt(s.amount).toLocaleString()}`)}
                                isHighlight={true}
                            />
                            <ComparisonRow 
                                label="📅 Application Deadline" 
                                values={scholarships.map(s => {
                                    const deadline = new Date(s.deadline);
                                    const daysLeft = Math.ceil((deadline - new Date()) / (1000 * 60 * 60 * 24));
                                    return (
                                        <>
                                            {deadline.toLocaleDateString()}
                                            <br />
                                            <Badge bg={daysLeft < 7 ? 'danger' : daysLeft < 30 ? 'warning' : 'success'}>
                                                {daysLeft} days left
                                            </Badge>
                                        </>
                                    );
                                })}
                            />
                            <ComparisonRow 
                                label="🏢 Provider" 
                                values={scholarships.map(s => s.provider)}
                            />
                            <ComparisonRow 
                                label="📊 Minimum CGPA" 
                                values={scholarships.map(s => s.minCgpa || 'No minimum')}
                            />
                            <ComparisonRow 
                                label="💵 Maximum Income" 
                                values={scholarships.map(s => 
                                    s.maxIncome ? `₹${parseInt(s.maxIncome).toLocaleString()}` : 'No limit'
                                )}
                            />
                            <ComparisonRow 
                                label="🎯 Category" 
                                values={scholarships.map(s => s.category)}
                            />
                            <ComparisonRow 
                                label="🏆 Number of Awards" 
                                values={scholarships.map(s => s.awardCount || 'Not specified')}
                            />
                            <ComparisonRow 
                                label="📝 Description" 
                                values={scholarships.map(s => (
                                    <div className="description-cell">
                                        {s.description?.substring(0, 150)}...
                                    </div>
                                ))}
                            />
                            <ComparisonRow 
                                label="🔗 Application Link" 
                                values={scholarships.map(s => 
                                    s.applicationLink ? (
                                        <a href={s.applicationLink} target="_blank" rel="noopener noreferrer">
                                            <FaCheckCircle className="text-success" /> Available
                                        </a>
                                    ) : (
                                        <><FaTimesCircle className="text-danger" /> Not available</>
                                    )
                                )}
                            />
                            <tr className="no-print">
                                <td className="feature-label"><strong>Actions</strong></td>
                                {scholarships.map(s => (
                                    <td key={s.id}>
                                        <Button 
                                            variant="primary" 
                                            size="sm" 
                                            className="w-100 mb-2"
                                            onClick={() => navigate(`/scholarships/${s.id}`)}
                                        >
                                            View Details
                                        </Button>
                                        {s.applicationLink && (
                                            <Button 
                                                variant="outline-success" 
                                                size="sm" 
                                                className="w-100"
                                                onClick={() => window.open(s.applicationLink, '_blank')}
                                            >
                                                Apply Now
                                            </Button>
                                        )}
                                    </td>
                                ))}
                            </tr>
                        </tbody>
                    </Table>
                </div>
            ) : (
                <div className="text-center py-5">
                    <h4>No scholarships to compare</h4>
                    <Button variant="primary" onClick={() => navigate('/scholarships')}>
                        Browse Scholarships
                    </Button>
                </div>
            )}
        </Container>
    );
};

export default ScholarshipComparison;
