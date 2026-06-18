import React, { useState } from 'react';
import { Card, Row, Col, Form, Button, Badge } from 'react-bootstrap';
import { FaFilter, FaTimes, FaSave } from 'react-icons/fa';
import '../styles/AdvancedFilters.css';

/**
 * Advanced Filters Component
 * Reusable filter panel with save/load functionality
 */
const AdvancedFilters = ({ onFilterChange, savedFilters = [], onSaveFilter }) => {
    const [filters, setFilters] = useState({
        category: '',
        minAmount: '',
        maxAmount: '',
        minCgpa: '',
        maxIncome: '',
        deadline: '',
        provider: '',
        keywords: ''
    });

    const [showFilters, setShowFilters] = useState(false);
    const [filterName, setFilterName] = useState('');

    const categories = [
        'Merit-Based',
        'Need-Based',
        'Sports',
        'Arts',
        'Research',
        'Minority',
        'Women',
        'SC/ST/OBC',
        'Differently Abled',
        'Other'
    ];

    const handleFilterChange = (field, value) => {
        const newFilters = { ...filters, [field]: value };
        setFilters(newFilters);
        onFilterChange(newFilters);
    };

    const handleClearFilters = () => {
        const emptyFilters = {
            category: '',
            minAmount: '',
            maxAmount: '',
            minCgpa: '',
            maxIncome: '',
            deadline: '',
            provider: '',
            keywords: ''
        };
        setFilters(emptyFilters);
        onFilterChange(emptyFilters);
    };

    const handleSaveFilter = () => {
        if (!filterName.trim()) {
            alert('Please enter a filter name');
            return;
        }
        const activeFilters = Object.entries(filters).filter(([_, value]) => value);
        if (activeFilters.length === 0) {
            alert('Please set at least one filter before saving');
            return;
        }
        onSaveFilter({ name: filterName, filters: { ...filters } });
        setFilterName('');
    };

    const handleLoadFilter = (savedFilter) => {
        setFilters(savedFilter.filters);
        onFilterChange(savedFilter.filters);
    };

    const getActiveFilterCount = () => {
        return Object.values(filters).filter(v => v).length;
    };

    return (
        <Card className="advanced-filters-card mb-4">
            <Card.Header className="d-flex justify-content-between align-items-center">
                <div>
                    <FaFilter className="me-2" />
                    <strong>Advanced Filters</strong>
                    {getActiveFilterCount() > 0 && (
                        <Badge bg="primary" className="ms-2">
                            {getActiveFilterCount()} active
                        </Badge>
                    )}
                </div>
                <div>
                    {getActiveFilterCount() > 0 && (
                        <Button 
                            size="sm" 
                            variant="outline-danger" 
                            onClick={handleClearFilters}
                            className="me-2"
                        >
                            <FaTimes /> Clear All
                        </Button>
                    )}
                    <Button
                        size="sm"
                        variant="outline-primary"
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        {showFilters ? 'Hide' : 'Show'} Filters
                    </Button>
                </div>
            </Card.Header>

            {showFilters && (
                <Card.Body>
                    {/* Saved Filters Quick Access */}
                    {savedFilters.length > 0 && (
                        <div className="mb-4">
                            <Form.Label><strong>Quick Load:</strong></Form.Label>
                            <div className="saved-filters-list">
                                {savedFilters.map((saved, idx) => (
                                    <Badge
                                        key={idx}
                                        bg="info"
                                        className="saved-filter-badge"
                                        onClick={() => handleLoadFilter(saved)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        {saved.name}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}

                    <Row>
                        <Col md={6} lg={4}>
                            <Form.Group className="mb-3">
                                <Form.Label>Category</Form.Label>
                                <Form.Select
                                    value={filters.category}
                                    onChange={(e) => handleFilterChange('category', e.target.value)}
                                >
                                    <option value="">All Categories</option>
                                    {categories.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        </Col>

                        <Col md={6} lg={4}>
                            <Form.Group className="mb-3">
                                <Form.Label>Minimum Amount (₹)</Form.Label>
                                <Form.Control
                                    type="number"
                                    placeholder="e.g., 10000"
                                    value={filters.minAmount}
                                    onChange={(e) => handleFilterChange('minAmount', e.target.value)}
                                />
                            </Form.Group>
                        </Col>

                        <Col md={6} lg={4}>
                            <Form.Group className="mb-3">
                                <Form.Label>Maximum Amount (₹)</Form.Label>
                                <Form.Control
                                    type="number"
                                    placeholder="e.g., 100000"
                                    value={filters.maxAmount}
                                    onChange={(e) => handleFilterChange('maxAmount', e.target.value)}
                                />
                            </Form.Group>
                        </Col>

                        <Col md={6} lg={4}>
                            <Form.Group className="mb-3">
                                <Form.Label>Minimum CGPA</Form.Label>
                                <Form.Control
                                    type="number"
                                    step="0.1"
                                    placeholder="e.g., 7.5"
                                    value={filters.minCgpa}
                                    onChange={(e) => handleFilterChange('minCgpa', e.target.value)}
                                />
                            </Form.Group>
                        </Col>

                        <Col md={6} lg={4}>
                            <Form.Group className="mb-3">
                                <Form.Label>Maximum Income (₹)</Form.Label>
                                <Form.Control
                                    type="number"
                                    placeholder="e.g., 500000"
                                    value={filters.maxIncome}
                                    onChange={(e) => handleFilterChange('maxIncome', e.target.value)}
                                />
                            </Form.Group>
                        </Col>

                        <Col md={6} lg={4}>
                            <Form.Group className="mb-3">
                                <Form.Label>Deadline Before</Form.Label>
                                <Form.Control
                                    type="date"
                                    value={filters.deadline}
                                    onChange={(e) => handleFilterChange('deadline', e.target.value)}
                                />
                            </Form.Group>
                        </Col>

                        <Col md={6} lg={4}>
                            <Form.Group className="mb-3">
                                <Form.Label>Provider</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="e.g., Government of India"
                                    value={filters.provider}
                                    onChange={(e) => handleFilterChange('provider', e.target.value)}
                                />
                            </Form.Group>
                        </Col>

                        <Col md={12} lg={8}>
                            <Form.Group className="mb-3">
                                <Form.Label>Keywords</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Search in title and description..."
                                    value={filters.keywords}
                                    onChange={(e) => handleFilterChange('keywords', e.target.value)}
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    {/* Save Filter Section */}
                    {getActiveFilterCount() > 0 && (
                        <div className="save-filter-section">
                            <hr />
                            <Row className="align-items-end">
                                <Col md={8}>
                                    <Form.Group>
                                        <Form.Label>Save these filters for later:</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="Enter filter name (e.g., High Value Scholarships)"
                                            value={filterName}
                                            onChange={(e) => setFilterName(e.target.value)}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={4}>
                                    <Button
                                        variant="success"
                                        className="w-100"
                                        onClick={handleSaveFilter}
                                    >
                                        <FaSave className="me-2" />
                                        Save Filter
                                    </Button>
                                </Col>
                            </Row>
                        </div>
                    )}
                </Card.Body>
            )}
        </Card>
    );
};

export default AdvancedFilters;
