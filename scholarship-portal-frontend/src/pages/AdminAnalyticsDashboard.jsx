import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Spinner } from 'react-bootstrap';
import { 
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { FaUsers, FaGraduationCap, FaFileAlt, FaCheckCircle, FaTimesCircle, FaClock, FaRobot } from 'react-icons/fa';
import { getAnalyticsInsights } from '../services/geminiService';
import { getAnalytics } from '../services/analyticsService';
import Loader from '../components/Loader';
import { toast } from 'react-toastify';

const AdminAnalyticsDashboard = () => {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [aiInsights, setAiInsights] = useState('');
    const [aiInsightsLoading, setAiInsightsLoading] = useState(false);

    const handleGetInsights = async () => {
        setAiInsightsLoading(true);
        setAiInsights('');
        try {
            const insights = await getAnalyticsInsights(analytics);
            setAiInsights(insights);
        } catch {
            // insights failed
        } finally {
            setAiInsightsLoading(false);
        }
    };

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d'];

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            const response = await getAnalytics();
            setAnalytics(response.data);
        } catch (error) {
            toast.error('Failed to load analytics');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <Loader />;
    if (!analytics) return null;

    // Prepare data for charts
    const monthlyData = Object.entries(analytics.monthlyApplicationTrends || {}).map(([month, count]) => ({
        month,
        applications: count
    }));

    const categoryData = Object.entries(analytics.categoryDistribution || {}).map(([category, count]) => ({
        name: category,
        value: count
    }));

    const topScholarshipsData = Object.entries(analytics.applicationsPerScholarship || {})
        .slice(0, 10)
        .map(([name, count]) => ({
            name: name.length > 20 ? name.substring(0, 20) + '...' : name,
            applications: count
        }));

    const applicationStatusData = [
        { name: 'Pending', value: analytics.pendingApplications, color: '#FFBB28' },
        { name: 'Approved', value: analytics.approvedApplications, color: '#00C49F' },
        { name: 'Rejected', value: analytics.rejectedApplications, color: '#FF8042' }
    ];

    return (
        <Container fluid className="py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="gradient-text mb-0">Analytics Dashboard</h2>
                <Button
                    variant="outline-info"
                    onClick={handleGetInsights}
                    disabled={aiInsightsLoading}
                >
                    {aiInsightsLoading ? <><Spinner size="sm" className="me-1" />Analyzing...</> : <><FaRobot className="me-1" />🤖 AI Insights</>}
                </Button>
            </div>

            {/* Stats Cards */}
            <Row className="g-4 mb-4">
                <Col md={3}>
                    <Card className="modern-card stat-card h-100">
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <p className="text-muted mb-1">Total Users</p>
                                    <h2 className="mb-0">{analytics.totalUsers}</h2>
                                    <small className="text-muted">
                                        {analytics.totalStudents} Students, {analytics.totalAdmins} Admins
                                    </small>
                                </div>
                                <FaUsers size={40} className="text-primary opacity-50" />
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={3}>
                    <Card className="modern-card stat-card h-100">
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <p className="text-muted mb-1">Total Scholarships</p>
                                    <h2 className="mb-0">{analytics.totalScholarships}</h2>
                                    <small className="text-success">
                                        {analytics.activeScholarships} Active
                                    </small>
                                </div>
                                <FaGraduationCap size={40} className="text-success opacity-50" />
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={3}>
                    <Card className="modern-card stat-card h-100">
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <p className="text-muted mb-1">Total Applications</p>
                                    <h2 className="mb-0">{analytics.totalApplications}</h2>
                                    <small className="text-warning">
                                        {analytics.pendingApplications} Pending
                                    </small>
                                </div>
                                <FaFileAlt size={40} className="text-warning opacity-50" />
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={3}>
                    <Card className="modern-card stat-card h-100">
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <p className="text-muted mb-1">Approval Rate</p>
                                    <h2 className="mb-0">{analytics.approvalRate}%</h2>
                                    <small className="text-info">
                                        {analytics.approvedApplications} ✓ / {analytics.rejectedApplications} ✗
                                    </small>
                                </div>
                                <FaCheckCircle size={40} className="text-info opacity-50" />
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Application Status Breakdown */}
            <Row className="g-4 mb-4">
                <Col md={4}>
                    <Card className="modern-card stat-card text-center">
                        <Card.Body>
                            <FaClock size={36} className="text-warning mb-2" />
                            <h3>{analytics.pendingApplications}</h3>
                            <p className="text-muted mb-0">Pending Review</p>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card className="modern-card stat-card text-center">
                        <Card.Body>
                            <FaCheckCircle size={36} className="text-success mb-2" />
                            <h3>{analytics.approvedApplications}</h3>
                            <p className="text-muted mb-0">Approved</p>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card className="modern-card stat-card text-center">
                        <Card.Body>
                            <FaTimesCircle size={36} className="text-danger mb-2" />
                            <h3>{analytics.rejectedApplications}</h3>
                            <p className="text-muted mb-0">Rejected</p>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Charts Row 1 */}
            <Row className="g-4 mb-4">
                <Col lg={8}>
                    <Card className="modern-card">
                        <Card.Body>
                            <h5 className="mb-4">Monthly Application Trends (Last 6 Months)</h5>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={monthlyData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line 
                                        type="monotone" 
                                        dataKey="applications" 
                                        stroke="#8884d8" 
                                        activeDot={{ r: 8 }}
                                        strokeWidth={2}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </Card.Body>
                    </Card>
                </Col>

                <Col lg={4}>
                    <Card className="modern-card">
                        <Card.Body>
                            <h5 className="mb-4">Application Status Distribution</h5>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={applicationStatusData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {applicationStatusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Charts Row 2 */}
            <Row className="g-4 mb-4">
                <Col lg={8}>
                    <Card className="modern-card">
                        <Card.Body>
                            <h5 className="mb-4">Top 10 Scholarships by Applications</h5>
                            <ResponsiveContainer width="100%" height={400}>
                                <BarChart data={topScholarshipsData} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis type="number" />
                                    <YAxis dataKey="name" type="category" width={150} />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="applications" fill="#82ca9d" />
                                </BarChart>
                            </ResponsiveContainer>
                        </Card.Body>
                    </Card>
                </Col>

                <Col lg={4}>
                    <Card className="modern-card">
                        <Card.Body>
                            <h5 className="mb-4">Scholarship Categories</h5>
                            <ResponsiveContainer width="100%" height={400}>
                                <PieChart>
                                    <Pie
                                        data={categoryData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                        outerRadius={100}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {categoryData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
            {/* AI Analytics Insights */}
            {(aiInsights || aiInsightsLoading) && (
                <Row className="mt-3">
                    <Col>
                        <Card className="modern-card" style={{ border: '1px solid rgba(59,130,246,0.3)' }}>
                            <Card.Header style={{ background: 'linear-gradient(135deg,#1e3a5f,#312e81)', padding: '14px 20px' }}>
                                <h6 className="mb-0 text-white"><FaRobot className="me-2" />🤖 AI Analytics Insights</h6>
                            </Card.Header>
                            <Card.Body style={{ background: '#0f172a' }}>
                                {aiInsightsLoading ? (
                                    <div className="text-center py-3">
                                        <Spinner animation="border" variant="primary" />
                                        <p className="text-muted mt-2">Gemini is analyzing your data...</p>
                                    </div>
                                ) : (
                                    <div style={{ color: '#e2e8f0', lineHeight: '1.7', whiteSpace: 'pre-wrap', fontSize: '14px' }}>
                                        {aiInsights}
                                    </div>
                                )}
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            )}
        </Container>
    );
};

export default AdminAnalyticsDashboard;
