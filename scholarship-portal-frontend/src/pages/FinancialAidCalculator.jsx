import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Table, Badge, Spinner } from 'react-bootstrap';
import { FaCalculator, FaMoneyBillWave, FaGraduationCap, FaRobot } from 'react-icons/fa';
import { getAllScholarships } from '../services/scholarshipService';
import { toast } from 'react-toastify';
import { enrichScholarshipCollection } from '../utils/scholarshipUtils';
import { getFinancialAidAdvice } from '../services/geminiService';

const FinancialAidCalculator = () => {
    const [scholarships, setScholarships] = useState([]);
    const [formData, setFormData] = useState({
        cgpa: '',
        annualIncome: '',
        category: '',
        disability: false,
        sports: false,
        exService: false
    });
    const [eligibleScholarships, setEligibleScholarships] = useState([]);
    const [totalAid, setTotalAid] = useState(0);
    const [calculated, setCalculated] = useState(false);
    const [aiAdvice, setAiAdvice] = useState('');
    const [aiLoading, setAiLoading] = useState(false);
    const navigate = useNavigate();

    const handleGetAIAdvice = async () => {
        setAiLoading(true);
        setAiAdvice('');
        try {
            const advice = await getFinancialAidAdvice(formData, eligibleScholarships, totalAid);
            setAiAdvice(advice);
        } catch {
            toast.error('Failed to get AI advice. Please try again.');
        } finally {
            setAiLoading(false);
        }
    };

    useEffect(() => {
        fetchScholarships();
    }, []);

    const fetchScholarships = async () => {
        try {
            const response = await getAllScholarships(0, 100);
            const allScholarships = enrichScholarshipCollection(response.data?.content || response.data || []);
            setScholarships(allScholarships);
        } catch (error) {
            toast.error('Failed to load scholarships');
        }
    };

    const handleCalculate = () => {
        if (!formData.cgpa || !formData.annualIncome) {
            toast.error('Please fill in CGPA and Annual Income');
            return;
        }

        const eligible = scholarships.filter(scholarship => {
            // Check CGPA eligibility
            if (scholarship.minCgpa && parseFloat(formData.cgpa) < parseFloat(scholarship.minCgpa)) {
                return false;
            }

            // Check income eligibility
            if (scholarship.maxIncome && parseFloat(formData.annualIncome) > parseFloat(scholarship.maxIncome)) {
                return false;
            }

            // Check category if specified
            if (formData.category && scholarship.category && scholarship.category !== formData.category) {
                return false;
            }

            return scholarship.isActive !== false;
        });

        const total = eligible.reduce((sum, scholarship) => {
            return sum + (parseFloat(scholarship.amount) || 0);
        }, 0);

        setEligibleScholarships(eligible);
        setTotalAid(total);
        setCalculated(true);

        toast.success(`Found ${eligible.length} eligible scholarships!`);
    };

    const handleReset = () => {
        setFormData({
            cgpa: '',
            annualIncome: '',
            category: '',
            disability: false,
            sports: false,
            exService: false
        });
        setEligibleScholarships([]);
        setTotalAid(0);
        setCalculated(false);
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    return (
        <Container fluid className="py-4">
            <Row className="mb-4">
                <Col>
                    <h2 className="fw-bold mb-2">
                        <FaCalculator className="me-2" />
                        Financial Aid Calculator
                    </h2>
                    <p className="text-muted">
                        Calculate your potential scholarship eligibility based on your profile
                    </p>
                </Col>
            </Row>

            <Row className="g-4">
                <Col lg={4}>
                    <Card className="modern-card">
                        <Card.Body>
                            <h5 className="mb-4">Your Information</h5>
                            <Form>
                                <Form.Group className="mb-3">
                                    <Form.Label>CGPA</Form.Label>
                                    <Form.Control
                                        className="form-control-modern"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        max="10"
                                        value={formData.cgpa}
                                        onChange={(e) => setFormData({ ...formData, cgpa: e.target.value })}
                                        placeholder="Enter your CGPA (e.g., 8.5)"
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Annual Family Income (₹)</Form.Label>
                                    <Form.Control
                                        className="form-control-modern"
                                        type="number"
                                        value={formData.annualIncome}
                                        onChange={(e) => setFormData({ ...formData, annualIncome: e.target.value })}
                                        placeholder="Enter annual income"
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Category (Optional)</Form.Label>
                                    <Form.Select
                                        className="form-control-modern"
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    >
                                        <option value="">Any Category</option>
                                        <option value="MERIT">Merit-Based</option>
                                        <option value="NEED">Need-Based</option>
                                        <option value="SPORTS">Sports</option>
                                        <option value="SC_ST">SC/ST</option>
                                        <option value="OBC">OBC</option>
                                        <option value="MINORITY">Minority</option>
                                        <option value="GIRLS">Girls Education</option>
                                    </Form.Select>
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Check
                                        type="checkbox"
                                        label="Person with Disability"
                                        checked={formData.disability}
                                        onChange={(e) => setFormData({ ...formData, disability: e.target.checked })}
                                    />
                                    <Form.Check
                                        type="checkbox"
                                        label="Sports Quota"
                                        checked={formData.sports}
                                        onChange={(e) => setFormData({ ...formData, sports: e.target.checked })}
                                    />
                                    <Form.Check
                                        type="checkbox"
                                        label="Ex-Serviceman Family"
                                        checked={formData.exService}
                                        onChange={(e) => setFormData({ ...formData, exService: e.target.checked })}
                                    />
                                </Form.Group>

                                <div className="d-grid gap-2">
                                    <Button
                                        className="btn-primary-modern"
                                        onClick={handleCalculate}
                                    >
                                        <FaCalculator className="me-2" />
                                        Calculate
                                    </Button>
                                    <Button
                                        className="btn-outline-modern"
                                        onClick={handleReset}
                                    >
                                        Reset
                                    </Button>
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>

                <Col lg={8}>
                    {!calculated ? (
                        <Card className="modern-card text-center py-5">
                            <Card.Body>
                                <FaMoneyBillWave size={80} className="text-muted mb-3" />
                                <h4>Ready to Calculate?</h4>
                                <p className="text-muted">
                                    Fill in your details and click Calculate to see eligible scholarships
                                </p>
                            </Card.Body>
                        </Card>
                    ) : (
                        <>
                            {/* Summary Cards */}
                            <Row className="g-3 mb-4">
                                <Col md={4}>
                                    <Card className="modern-card text-center">
                                        <Card.Body>
                                            <FaGraduationCap size={36} className="text-primary mb-2" />
                                            <h3>{eligibleScholarships.length}</h3>
                                            <p className="text-muted mb-0">Eligible Scholarships</p>
                                        </Card.Body>
                                    </Card>
                                </Col>
                                <Col md={8}>
                                    <Card className="modern-card text-center">
                                        <Card.Body>
                                            <FaMoneyBillWave size={36} className="text-success mb-2" />
                                            <h2 className="text-success">{formatCurrency(totalAid)}</h2>
                                            <p className="text-muted mb-0">Total Potential Aid</p>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            </Row>

                            {/* Eligible Scholarships Table */}
                            <Card className="modern-card">
                                <Card.Body>
                                    <h5 className="mb-3">Eligible Scholarships</h5>
                                    {eligibleScholarships.length === 0 ? (
                                        <p className="text-muted text-center py-4">
                                            No scholarships match your criteria. Try adjusting your filters.
                                        </p>
                                    ) : (
                                        <Table responsive hover className="table-modern align-middle">
                                            <thead>
                                                <tr>
                                                    <th>Scholarship</th>
                                                    <th>Category</th>
                                                    <th>Amount</th>
                                                    <th>Min CGPA</th>
                                                    <th>Max Income</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {eligibleScholarships.map((scholarship) => (
                                                    <tr key={scholarship.id}>
                                                        <td>
                                                            <button
                                                                type="button"
                                                                className="text-primary fw-semibold"
                                                                onClick={() => navigate(`/scholarships/${scholarship.id}`)}
                                                            >
                                                                {scholarship.title}
                                                            </button>
                                                        </td>
                                                        <td>
                                                            <Badge className="badge-primary-modern">{scholarship.category || 'General'}</Badge>
                                                        </td>
                                                        <td>
                                                            <strong className="text-success">
                                                                {formatCurrency(scholarship.amount)}
                                                            </strong>
                                                        </td>
                                                        <td>{scholarship.minCgpa || 'N/A'}</td>
                                                        <td>
                                                            {scholarship.maxIncome
                                                                ? formatCurrency(scholarship.maxIncome)
                                                                : 'No Limit'}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </Table>
                                    )}
                                </Card.Body>
                            </Card>

                            {/* AI Financial Advice */}
                            <Card className="modern-card mt-3" style={{ border: '1px solid rgba(59,130,246,0.3)' }}>
                                <Card.Header style={{
                                    background: '#1e293b',
                                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                                    padding: '14px 20px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <h6 className="mb-0 text-white"><FaRobot className="me-2" />🤖 AI Financial Planning Advice</h6>
                                    {!aiAdvice && (
                                        <Button size="sm" variant="light" onClick={handleGetAIAdvice} disabled={aiLoading} style={{ fontSize: '12px', borderRadius: '8px' }}>
                                            {aiLoading ? <><Spinner size="sm" className="me-1" />Thinking...</> : 'Get AI Advice'}
                                        </Button>
                                    )}
                                </Card.Header>
                                <Card.Body style={{ background: '#0f172a' }}>
                                    {!aiAdvice && !aiLoading && (
                                        <p className="text-muted text-center py-2" style={{ fontSize: '13px' }}>Click "Get AI Advice" for a personalized scholarship strategy from Gemini AI.</p>
                                    )}
                                    {aiLoading && (
                                        <div className="text-center py-3">
                                            <Spinner animation="border" variant="primary" size="sm" />
                                            <p className="text-muted mt-2" style={{ fontSize: '13px' }}>AI is planning your financial strategy...</p>
                                        </div>
                                    )}
                                    {aiAdvice && (
                                        <div style={{ color: '#e2e8f0', lineHeight: '1.7', whiteSpace: 'pre-wrap', fontSize: '13px' }}>
                                            {aiAdvice}
                                        </div>
                                    )}
                                </Card.Body>
                            </Card>
                        </>
                    )}
                </Col>
            </Row>
        </Container>
    );
};

export default FinancialAidCalculator;
