import React, { useState } from 'react';
import { Card, Form, ProgressBar, Badge, ListGroup } from 'react-bootstrap';
import { FaCheckCircle, FaCircle, FaClipboardCheck } from 'react-icons/fa';

const ApplicationChecklist = ({ scholarship }) => {
    const [checklist, setChecklist] = useState({
        profileComplete: false,
        documentsUploaded: false,
        eligibilityChecked: false,
        applicationLinkVisited: false,
        deadlineNoted: false,
        applicationSubmitted: false
    });

    const checklistItems = [
        {
            key: 'profileComplete',
            label: 'Complete your profile',
            description: 'Ensure all required fields in your profile are filled'
        },
        {
            key: 'documentsUploaded',
            label: 'Upload required documents',
            description: 'Upload transcripts, certificates, and other required documents'
        },
        {
            key: 'eligibilityChecked',
            label: 'Verify eligibility criteria',
            description: `Check CGPA (${scholarship?.minCgpa || 'N/A'}), Income (₹${scholarship?.maxIncome || 'N/A'}), and other requirements`
        },
        {
            key: 'applicationLinkVisited',
            label: 'Visit scholarship website',
            description: 'Read complete details on the official scholarship portal'
        },
        {
            key: 'deadlineNoted',
            label: 'Note the deadline',
            description: `Deadline: ${scholarship?.deadline ? new Date(scholarship.deadline).toLocaleDateString() : 'N/A'}`
        },
        {
            key: 'applicationSubmitted',
            label: 'Submit application',
            description: 'Complete and submit your scholarship application'
        }
    ];

    const handleToggle = (key) => {
        setChecklist(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const completedCount = Object.values(checklist).filter(Boolean).length;
    const totalCount = checklistItems.length;
    const progress = (completedCount / totalCount) * 100;

    return (
        <Card className="modern-card">
            <Card.Body>
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="mb-0">
                        <FaClipboardCheck className="me-2 text-primary" />
                        Application Checklist
                    </h5>
                    <Badge bg={progress === 100 ? 'success' : 'primary'}>
                        {completedCount}/{totalCount}
                    </Badge>
                </div>

                <ProgressBar 
                    now={progress} 
                    variant={progress === 100 ? 'success' : 'primary'}
                    className="mb-3"
                    style={{ height: '8px' }}
                />

                <ListGroup variant="flush">
                    {checklistItems.map((item) => (
                        <ListGroup.Item 
                            key={item.key}
                            className="border-0 px-0"
                        >
                            <Form.Check
                                type="checkbox"
                                id={item.key}
                                checked={checklist[item.key]}
                                onChange={() => handleToggle(item.key)}
                                label={
                                    <div>
                                        <div className="d-flex align-items-center">
                                            {checklist[item.key] ? (
                                                <FaCheckCircle className="text-success me-2" />
                                            ) : (
                                                <FaCircle className="text-muted me-2" style={{ fontSize: '0.8rem' }} />
                                            )}
                                            <strong className={checklist[item.key] ? 'text-decoration-line-through text-muted' : ''}>
                                                {item.label}
                                            </strong>
                                        </div>
                                        <small className="text-muted ms-4 d-block">
                                            {item.description}
                                        </small>
                                    </div>
                                }
                            />
                        </ListGroup.Item>
                    ))}
                </ListGroup>

                {progress === 100 && (
                    <div className="alert alert-success mt-3 mb-0">
                        <strong>Great job! 🎉</strong> You've completed all checklist items. You're ready to apply!
                    </div>
                )}
            </Card.Body>
        </Card>
    );
};

export default ApplicationChecklist;
