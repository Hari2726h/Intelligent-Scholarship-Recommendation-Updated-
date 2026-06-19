import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllScholarships, createScholarship, deleteScholarship } from '../services/scholarshipService';
import { applyForScholarship } from '../services/applicationService';
import { toast } from 'react-toastify';
import { Button, Form, Modal, Row, Col, Badge, Card, Spinner } from 'react-bootstrap';
import { FaCalendar, FaMoneyBillWave, FaGraduationCap, FaTrash, FaPlus, FaArrowRight, FaExternalLinkAlt, FaRobot } from 'react-icons/fa';
import { parseNaturalLanguageSearch } from '../services/geminiService';
import Loader from '../components/Loader';

import { enrichScholarshipCollection } from '../utils/scholarshipUtils';

const Scholarships = ({ isAdminView }) => {
  const navigate = useNavigate();
  const [scholarships, setScholarships] = useState([]);
  const [filteredScholarships, setFilteredScholarships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [aiSearchQuery, setAiSearchQuery] = useState('');
  const [aiSearchLoading, setAiSearchLoading] = useState(false);

  // States for Admin logic (Create)
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '', description: '', minCgpa: '', maxIncome: '',
    category: '', amount: '', deadline: ''
  });

  useEffect(() => {
    fetchScholarships(page);
  }, [page]);



  useEffect(() => {
    setFilteredScholarships(scholarships);
  }, [scholarships]);

  const fetchScholarships = async (p) => {
    try {
      setLoading(true);
      const res = await getAllScholarships(p, 10);
      if (res.success && res.data) {
        const items = enrichScholarshipCollection(res.data.content || []);
        setScholarships(items);
        setFilteredScholarships(items);
        setTotalPages(res.data.totalPages || 0);
      }
    } catch (err) {
      toast.error('Failed to load scholarships');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filters) => {
    let filtered = [...scholarships];

    if (filters.category) {
      filtered = filtered.filter(s => s.category === filters.category);
    }
    if (filters.minAmount) {
      filtered = filtered.filter(s => parseFloat(s.amount) >= parseFloat(filters.minAmount));
    }
    if (filters.maxAmount) {
      filtered = filtered.filter(s => parseFloat(s.amount) <= parseFloat(filters.maxAmount));
    }
    if (filters.minCgpa) {
      filtered = filtered.filter(s => parseFloat(s.minCgpa) <= parseFloat(filters.minCgpa));
    }
    if (filters.maxIncome) {
      filtered = filtered.filter(s => !s.maxIncome || parseFloat(s.maxIncome) >= parseFloat(filters.maxIncome));
    }
    if (filters.deadline) {
      filtered = filtered.filter(s => new Date(s.deadline) <= new Date(filters.deadline));
    }
    if (filters.provider) {
      filtered = filtered.filter(s => s.provider?.toLowerCase().includes(filters.provider.toLowerCase()));
    }
    if (filters.keywords) {
      const keywords = filters.keywords.toLowerCase();
      filtered = filtered.filter(s =>
        s.title?.toLowerCase().includes(keywords) ||
        s.description?.toLowerCase().includes(keywords)
      );
    }

    setFilteredScholarships(filtered);
  };

  const handleAISearch = async () => {
    if (!aiSearchQuery.trim()) return;
    setAiSearchLoading(true);
    try {
      const parsedFilters = await parseNaturalLanguageSearch(aiSearchQuery);
      if (!parsedFilters || typeof parsedFilters !== 'object') {
        toast.warning('AI could not parse your search. Try a more specific query.');
        return;
      }

      const normalizedFilters = {
        ...parsedFilters,
        keywords: parsedFilters.keyword || parsedFilters.keywords || '',
      };

      handleFilterChange(normalizedFilters);
      toast.success('AI search applied!');
    } catch {
      toast.error('AI search failed. Try the manual filters.');
    } finally {
      setAiSearchLoading(false);
    }
  };



  const handleApply = async (id) => {
    try {
      await applyForScholarship(id);
      toast.success('Application submitted successfully!');
      fetchScholarships(page);
    } catch (err) {
      toast.error('Failed to apply for scholarship');
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createScholarship(formData);
      toast.success("Scholarship created!");
      setShowModal(false);
      fetchScholarships(0);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create scholarship");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this scholarship?")) {
      try {
        await deleteScholarship(id);
        toast.success("Scholarship deleted!");
        fetchScholarships(0);
      } catch (err) {
        toast.error("Failed to delete scholarship");
      }
    }
  };

  const getProviderBadge = (provider) => {
    const badges = {
      'BUDDY4STUDY': <Badge className="badge-primary-modern ms-2">Buddy4Study</Badge>,
      'NSP': <Badge className="badge-info-modern ms-2">NSP</Badge>,
      'VIDYALAKSHMI': <Badge style={{ backgroundColor: '#9333ea' }} className="badge-warning-modern ms-2">Vidya Lakshmi</Badge>,
      'PMRF': <Badge className="badge-success-modern ms-2">PMRF</Badge>,
      'AICTE': <Badge className="badge-warning-modern ms-2">AICTE</Badge>,
      'UGC': <Badge className="badge-info-modern ms-2">UGC</Badge>,
      'DST': <Badge className="badge-primary-modern ms-2">DST</Badge>,
      'MHRD': <Badge className="badge-success-modern ms-2">MHRD</Badge>,
      'System Admin': null
    };
    return badges[provider] || null;
  };

  const handleCardClick = (scholarshipId) => {
    navigate(`/scholarships/${scholarshipId}`);
  };



  if (loading && page === 0) return <Loader />;

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold m-0 gradient-text">{isAdminView ? 'Manage Scholarships' : 'All Scholarships'}</h2>
        {isAdminView && (
          <Button className="btn-primary-modern" onClick={() => setShowModal(true)}>
            <FaPlus className="me-2" /> Add New
          </Button>
        )}
      </div>

      {/* AI Natural Language Search */}
      {!isAdminView && (
        <div className="modern-card mb-4 p-3" style={{ border: '1px solid rgba(59,130,246,0.3)' }}>
          <div className="d-flex gap-2 align-items-center ai-search-wrapper">
            <FaRobot className="text-primary flex-shrink-0" size={16} />
            <Form.Control
              className="ai-search-input"
              value={aiSearchQuery}
              onChange={e => setAiSearchQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAISearch()}
              placeholder="AI Search: describe what you need (e.g. 'engineering scholarship for low income students')"
            />
            <Button
              variant="outline-primary"
              size="sm"
              onClick={handleAISearch}
              disabled={aiSearchLoading}
              style={{ whiteSpace: 'nowrap' }}
            >
              {aiSearchLoading ? <Spinner size="sm" /> : 'AI Search'}
            </Button>
          </div>
        </div>
      )}

      {scholarships.length === 0 ? (
        <div className="modern-card text-center py-5">
          <p className="text-muted">No scholarships available.</p>
        </div>
      ) : (
        <Row className="g-4">
          {filteredScholarships.map(s => (
            <Col xs={12} md={6} xl={4} key={s.id}>
              <Card
                className="modern-card scholarship-card h-100"
                style={{ cursor: 'pointer' }}
                onClick={() => handleCardClick(s.id)}
              >
                <Card.Body className="d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <h5 className="card-title mb-0 fw-semibold">{s.title}</h5>
                    {s.provider && getProviderBadge(s.provider)}
                  </div>

                  <div className="mb-3">
                    <Badge className="badge-primary-modern">{s.category}</Badge>
                  </div>

                  <div className="mb-3">
                    <div className="d-flex align-items-center mb-2">
                      <FaMoneyBillWave className="me-2" />
                      <h4 className="mb-0 fw-bold text-primary">${s.amount}</h4>
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="d-flex align-items-center text-muted mb-2">
                      <FaGraduationCap className="me-2" />
                      <small>Min CGPA: {s.minCgpa}</small>
                    </div>
                    <div className="d-flex align-items-center text-muted mb-2">
                      <FaCalendar className="me-2" />
                      <small>Deadline: {new Date(s.deadline).toLocaleDateString()}</small>
                    </div>
                  </div>

                  <p className="mb-3" style={{
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    fontSize: '0.9rem',
                    color: '#94a3b8'
                  }}>
                    {s.description || 'No description available.'}
                  </p>

                  {/* Application Link */}
                  {s.applicationLink && (
                    <div className="mb-3 p-2 external-link-box">
                      <div className="d-flex align-items-center justify-content-between">
                        <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                          <FaExternalLinkAlt className="me-1" />
                          Direct Link Available
                        </small>
                        <Button
                          variant="link"
                          size="sm"
                          className="p-0 text-primary"
                          style={{ fontSize: '0.75rem' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(s.applicationLink, '_blank', 'noopener,noreferrer');
                          }}
                        >
                          Visit Site
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="mt-auto">
                    {isAdminView ? (
                      <Button
                        variant="outline-danger"
                        size="sm"
                        className="w-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(s.id);
                        }}
                      >
                        <FaTrash className="me-2" /> Delete
                      </Button>
                    ) : (
                      <div className="d-flex gap-2">
                        <Button
                          variant="outline-primary"
                          className="w-100"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/scholarships/${s.id}`);
                          }}
                        >
                          View Details
                        </Button>
                        <Button
                          className="btn-primary-modern w-100"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleApply(s.id);
                          }}
                        >
                          Apply Now <FaArrowRight className="ms-2" />
                        </Button>
                      </div>
                    )}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {totalPages > 1 && (
        <div className="d-flex justify-content-center align-items-center gap-3 mt-4">
          <Button
            className="btn-outline-modern"
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
          >
            Previous
          </Button>
          <span className="text-muted">Page {page + 1} of {totalPages}</span>
          <Button
            className="btn-outline-modern"
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={page === totalPages - 1}
          >
            Next
          </Button>
        </div>
      )}

      {/* Admin Create Modal */}
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        centered
        size="lg"
        className="admin-modern-modal"
      >
        <Form onSubmit={handleCreate}>
          <Modal.Header closeButton className="admin-modal-header">
            <Modal.Title>Create Scholarship</Modal.Title>
          </Modal.Header>

          <Modal.Body className="admin-modal-body">

            {/* Title */}
            <Form.Group className="mb-4">
              <Form.Label>Title</Form.Label>
              <Form.Control
                className="form-control-modern"
                required
                onChange={e => setFormData({ ...formData, title: e.target.value })}
              />
            </Form.Group>

            {/* Category + Amount */}
            <Row>
              <Col md={6}>
                <Form.Group className="mb-4">
                  <Form.Label>Category</Form.Label>
                  <Form.Control
                    className="form-control-modern"
                    required
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-4">
                  <Form.Label>Amount ($)</Form.Label>
                  <Form.Control
                    type="number"
                    className="form-control-modern"
                    required
                    onChange={e => setFormData({ ...formData, amount: e.target.value })}
                  />
                </Form.Group>
              </Col>
            </Row>

            {/* Min CGPA + Max Income */}
            <Row>
              <Col md={6}>
                <Form.Group className="mb-4">
                  <Form.Label>Min CGPA</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.1"
                    className="form-control-modern"
                    required
                    onChange={e => setFormData({ ...formData, minCgpa: e.target.value })}
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-4">
                  <Form.Label>Max Income</Form.Label>
                  <Form.Control
                    type="number"
                    className="form-control-modern"
                    required
                    onChange={e => setFormData({ ...formData, maxIncome: e.target.value })}
                  />
                </Form.Group>
              </Col>
            </Row>

            {/* Deadline */}
            <Form.Group className="mb-4">
              <Form.Label>Deadline</Form.Label>
              <Form.Control
                type="date"
                className="form-control-modern"
                required
                onChange={e => setFormData({ ...formData, deadline: e.target.value })}
              />
            </Form.Group>

            {/* Description */}
            <Form.Group className="mb-4">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                className="form-control-modern"
                required
                onChange={e => setFormData({ ...formData, description: e.target.value })}
              />
            </Form.Group>

          </Modal.Body>

          <Modal.Footer className="admin-modal-footer">
            <Button
              className="btn-outline-modern"
              onClick={() => setShowModal(false)}
            >
              Cancel
            </Button>
            <Button
              className="btn-primary-modern"
              type="submit"
            >
              Create Scholarship
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

    </div>
  );
};

export default Scholarships;