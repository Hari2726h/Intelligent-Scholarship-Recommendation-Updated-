import React from 'react';
import { Container, Row, Col, Card, Accordion } from 'react-bootstrap';
import { FaQuestionCircle, FaBook, FaVideo, FaEnvelope } from 'react-icons/fa';

const HelpCenter = () => {
    const faqs = [
        {
            question: "How do I apply for a scholarship?",
            answer: "Navigate to the Scholarships page, find a scholarship you're eligible for, click on it to view details, and click the 'Apply' button. Make sure your profile is complete before applying."
        },
        {
            question: "How can I check my application status?",
            answer: "Go to 'My Applications' from the sidebar. You can view all your applications and their current status. Click 'View Timeline' to see the complete application history."
        },
        {
            question: "What documents do I need to upload?",
            answer: "Common documents include: Academic transcripts, ID proof, Income certificate, Caste certificate (if applicable), and Recommendation letters. Upload them in the 'My Documents' section."
        },
        {
            question: "How do I know which scholarships I'm eligible for?",
            answer: "Visit the 'Eligible Scholarships' page to see scholarships matched to your profile. You can also use the 'Aid Calculator' to estimate your eligibility."
        },
        {
            question: "Can I apply to multiple scholarships?",
            answer: "Yes! You can apply to as many scholarships as you're eligible for. Some scholarships can be combined, while others may have restrictions."
        },
        {
            question: "What happens after I submit an application?",
            answer: "Your application will be reviewed by administrators. You'll receive notifications about any status changes. Check the 'My Applications' page regularly for updates."
        },
        {
            question: "How can I track deadlines?",
            answer: "Use the 'Deadline Calendar' to view all upcoming deadlines in a visual timeline. You'll also receive notifications for approaching deadlines."
        },
        {
            question: "What is Profile Strength?",
            answer: "Profile Strength shows how complete your profile is. A stronger profile increases your visibility to scholarship providers and improves your chances of approval."
        },
        {
            question: "How do I save scholarships for later?",
            answer: "Click the bookmark icon on any scholarship card to save it. View all your saved scholarships in the 'Saved Scholarships' page."
        },
        {
            question: "Can I compare different scholarships?",
            answer: "Open any scholarship from the Scholarships page to review the full details, eligibility rules, amount, deadline, and the official application link before you apply."
        }
    ];

    const tutorials = [
        {
            title: "Getting Started Guide",
            description: "Learn the basics of using the scholarship portal",
            icon: <FaBook size={30} className="text-primary" />
        },
        {
            title: "How to Complete Your Profile",
            description: "Step-by-step guide to create a strong profile",
            icon: <FaVideo size={30} className="text-danger" />
        },
        {
            title: "Application Process Tutorial",
            description: "Walkthrough of the scholarship application process",
            icon: <FaVideo size={30} className="text-success" />
        },
        {
            title: "Document Upload Guide",
            description: "Learn how to upload and manage your documents",
            icon: <FaBook size={30} className="text-info" />
        }
    ];

    return (
        <Container fluid className="py-4">
            <Row className="mb-4">
                <Col>
                    <h2 className="gradient-text mb-2">
                        <FaQuestionCircle className="me-2" />
                        Help Center
                    </h2>
                    <p className="text-muted">
                        Find answers to common questions and learn how to use the platform
                    </p>
                </Col>
            </Row>

            {/* Quick Links */}
            <Row className="g-4 mb-4">
                <Col md={6} lg={3}>
                    <Card className="modern-card text-center h-100">
                        <Card.Body>
                            <FaBook size={40} className="text-primary mb-3" />
                            <h5>User Guide</h5>
                            <p className="text-muted small">
                                Complete documentation on all features
                            </p>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={6} lg={3}>
                    <Card className="modern-card text-center h-100">
                        <Card.Body>
                            <FaVideo size={40} className="text-danger mb-3" />
                            <h5>Video Tutorials</h5>
                            <p className="text-muted small">
                                Watch step-by-step video guides
                            </p>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={6} lg={3}>
                    <Card className="modern-card text-center h-100">
                        <Card.Body>
                            <FaQuestionCircle size={40} className="text-info mb-3" />
                            <h5>FAQs</h5>
                            <p className="text-muted small">
                                Answers to frequently asked questions
                            </p>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={6} lg={3}>
                    <Card className="modern-card text-center h-100">
                        <Card.Body>
                            <FaEnvelope size={40} className="text-success mb-3" />
                            <h5>Contact Support</h5>
                            <p className="text-muted small">
                                Get help from our support team
                            </p>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>



            <Row className="g-4">
                {/* FAQs */}
                <Col lg={8}>
                    <Card className="modern-card">
                        <Card.Body>
                            <h4 className="mb-4">Frequently Asked Questions</h4>
                            <Accordion>
                                {faqs.map((faq, index) => (
                                    <Accordion.Item key={index} eventKey={index.toString()} className="mb-2 border-0 overflow-hidden rounded-3">
                                        <Accordion.Header>{faq.question}</Accordion.Header>
                                        <Accordion.Body style={{ backgroundColor: '#0f172a', color: '#f8fafc' }}>{faq.answer}</Accordion.Body>
                                    </Accordion.Item>
                                ))}
                            </Accordion>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Tutorials */}
                <Col lg={4}>
                    <Card className="modern-card mb-3">
                        <Card.Body>
                            <h5 className="mb-3">Video Tutorials</h5>
                            {tutorials.map((tutorial, index) => (
                                <div key={index} className="tutorial-card">
                                    <div className="d-flex align-items-start">
                                        <div className="me-3">{tutorial.icon}</div>
                                        <div>
                                            <h6 className="mb-1">{tutorial.title}</h6>
                                            <p className="text-muted small mb-0">
                                                {tutorial.description}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </Card.Body>
                    </Card>

                    <Card className="modern-card">
                        <Card.Body>
                            <h5 className="mb-3">Contact Support</h5>
                            <p className="text-muted">
                                Can't find what you're looking for? Our support team is here to help!
                            </p>
                            <div className="mb-2">
                                <strong>Email:</strong>
                                <br />
                                <a href="mailto:support@scholartech.com">support@scholartech.com</a>
                            </div>
                            <div className="mb-2">
                                <strong>Phone:</strong>
                                <br />
                                +91 1800-123-4567
                            </div>
                            <div>
                                <strong>Hours:</strong>
                                <br />
                                Mon-Fri: 9:00 AM - 6:00 PM IST
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default HelpCenter;
