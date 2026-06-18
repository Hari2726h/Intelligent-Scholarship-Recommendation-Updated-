import React, { useState, useMemo } from 'react';
import { Form, Row, Col, Button } from 'react-bootstrap';
import { FaSearch, FaFilter, FaTimes } from 'react-icons/fa';

/**
 * Advanced Search and Filter Component for Scholarships
 */
const SearchFilter = ({ data, onFilter }) => {
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    minAmount: '',
    maxAmount: '',
    sortBy: 'deadline'
  });

  const [showFilters, setShowFilters] = useState(false);

  // Get unique categories from data
  const categories = useMemo(() => {
    if (!data || data.length === 0) return [];
    return [...new Set(data.map(item => item.category).filter(Boolean))];
  }, [data]);

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const applyFilters = () => {
    let filtered = [...data];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(item =>
        item.title?.toLowerCase().includes(searchLower) ||
        item.description?.toLowerCase().includes(searchLower)
      );
    }

    // Category filter
    if (filters.category) {
      filtered = filtered.filter(item => item.category === filters.category);
    }

    // Amount range filter
    if (filters.minAmount) {
      filtered = filtered.filter(item => parseFloat(item.amount) >= parseFloat(filters.minAmount));
    }
    if (filters.maxAmount) {
      filtered = filtered.filter(item => parseFloat(item.amount) <= parseFloat(filters.maxAmount));
    }

    // Sorting
    filtered.sort((a, b) => {
      if (filters.sortBy === 'deadline') {
        return new Date(a.deadline) - new Date(b.deadline);
      } else if (filters.sortBy === 'amount-high') {
        return parseFloat(b.amount) - parseFloat(a.amount);
      } else if (filters.sortBy === 'amount-low') {
        return parseFloat(a.amount) - parseFloat(b.amount);
      }
      return 0;
    });

    onFilter(filtered);
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      category: '',
      minAmount: '',
      maxAmount: '',
      sortBy: 'deadline'
    });
    onFilter(data);
  };

  React.useEffect(() => {
    applyFilters();
  }, [filters, data]);

  return (
    <div className="search-filter-container mb-4">
      {/* Search Bar */}
      <Row className="mb-3">
        <Col md={8}>
          <div className="search-box">
            <FaSearch className="search-icon" />
            <Form.Control
              type="text"
              placeholder="Search scholarships by title or description..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="search-input"
            />
            {filters.search && (
              <FaTimes 
                className="clear-search" 
                onClick={() => handleFilterChange('search', '')}
              />
            )}
          </div>
        </Col>
        <Col md={4}>
          <Button 
            variant="outline-primary" 
            onClick={() => setShowFilters(!showFilters)}
            className="w-100"
          >
            <FaFilter /> {showFilters ? 'Hide Filters' : 'Show Filters'}
          </Button>
        </Col>
      </Row>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="filter-panel p-3 border rounded bg-light">
          <Row>
            <Col md={3}>
              <Form.Group>
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
            <Col md={3}>
              <Form.Group>
                <Form.Label>Min Amount ($)</Form.Label>
                <Form.Control
                  type="number"
                  placeholder="0"
                  value={filters.minAmount}
                  onChange={(e) => handleFilterChange('minAmount', e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Max Amount ($)</Form.Label>
                <Form.Control
                  type="number"
                  placeholder="Any"
                  value={filters.maxAmount}
                  onChange={(e) => handleFilterChange('maxAmount', e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Sort By</Form.Label>
                <Form.Select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                >
                  <option value="deadline">Deadline (Earliest)</option>
                  <option value="amount-high">Amount (High to Low)</option>
                  <option value="amount-low">Amount (Low to High)</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
          <Row className="mt-3">
            <Col>
              <Button variant="danger" size="sm" onClick={clearFilters}>
                Clear All Filters
              </Button>
            </Col>
          </Row>
        </div>
      )}
    </div>
  );
};

export default SearchFilter;
