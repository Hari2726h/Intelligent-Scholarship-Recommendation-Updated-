import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Button, Badge, Spinner, Modal } from 'react-bootstrap';
import {
  FaArrowLeft,
  FaCalendar,
  FaUsers,
  FaCheckCircle,
  FaMoneyBillWave,
  FaExternalLinkAlt,
  FaBookmark,
  FaRegBookmark,
  FaRobot,
  FaClipboardCheck
} from 'react-icons/fa';
import API from '../services/api';
import { toast } from 'react-toastify';
import ApplicationChecklist from '../components/ApplicationChecklist';
import { bookmarkScholarship, removeBookmark, isScholarshipBookmarked } from '../services/recommendationService';
import { applyForScholarship } from '../services/applicationService';
import { enrichScholarship } from '../utils/scholarshipUtils';
import { explainEligibility, reviewApplicationBeforeSubmit } from '../services/geminiService';

const ScholarshipDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [scholarship, setScholarship] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarking, setBookmarking] = useState(false);

  // AI state
  const [aiModal, setAiModal] = useState({ show: false, title: '', content: '', loading: false });

  const showAiModal = (title) => setAiModal({ show: true, title, content: '', loading: true });
  const closeAiModal = () => setAiModal({ show: false, title: '', content: '', loading: false });

  const handleEligibilityExplainer = async () => {
    showAiModal('🤖 AI Eligibility Analysis');
    try {
      // Try to get student profile from localStorage/context
      const studentProfile = JSON.parse(localStorage.getItem('studentProfile') || 'null');
      const result = await explainEligibility(scholarship, studentProfile);
      setAiModal({ show: true, title: '🤖 AI Eligibility Analysis', content: result, loading: false });
    } catch {
      setAiModal({ show: true, title: '🤖 AI Eligibility Analysis', content: '⚠️ Unable to analyze eligibility. Please try again.', loading: false });
    }
  };

  const handlePreSubmitReview = async () => {
    showAiModal('✅ AI Pre-Submission Review');
    try {
      const studentProfile = JSON.parse(localStorage.getItem('studentProfile') || 'null');
      const result = await reviewApplicationBeforeSubmit(scholarship, studentProfile);
      setAiModal({ show: true, title: '✅ AI Pre-Submission Review', content: result, loading: false });
    } catch {
      setAiModal({ show: true, title: '✅ AI Pre-Submission Review', content: '⚠️ Unable to complete review. Please try again.', loading: false });
    }
  };

  useEffect(() => {
    fetchDetails();
    checkApplication();
    checkBookmarkStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchDetails = async () => {
    try {
      const res = await API.get(`/scholarships/${id}`);
      setScholarship(enrichScholarship(res.data?.data || res.data));
    } catch {
      toast.error("Failed to load scholarship");
      navigate("/scholarships");
    } finally {
      setLoading(false);
    }
  };

  const checkApplication = async () => {
    try {
      const res = await API.get('/applications/my');
      const apps = Array.isArray(res.data)
        ? res.data
        : (res.data?.data || []);
      setHasApplied(apps.some(a => a.scholarship?.id === parseInt(id)));
    } catch { }
  };

  const checkBookmarkStatus = async () => {
    try {
      const response = await isScholarshipBookmarked(id);
      setIsBookmarked(response.data || false);
    } catch (error) {
      console.error('Failed to check bookmark status:', error);
    }
  };

  const handleBookmark = async () => {
    setBookmarking(true);
    try {
      if (isBookmarked) {
        await removeBookmark(id);
        toast.success("Removed from saved scholarships");
        setIsBookmarked(false);
      } else {
        await bookmarkScholarship(id);
        toast.success("Added to saved scholarships");
        setIsBookmarked(true);
      }
    } catch (error) {
      toast.error("Failed to update bookmark");
    } finally {
      setBookmarking(false);
    }
  };

  const handleApply = async () => {
    setApplying(true);
    try {
      await applyForScholarship(id);
      toast.success("Application submitted!");
      setHasApplied(true);
    } catch (e) {
      toast.error(e.response?.data?.message || "Application failed");
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="center-loader">
        <Spinner animation="border" />
      </div>
    );
  }

  const isExpired = new Date(scholarship.deadline) < new Date();
  const daysLeft = Math.ceil(
    (new Date(scholarship.deadline) - new Date()) / (1000 * 60 * 60 * 24)
  );

  return (
    <>
    <Container fluid className="details-wrapper">

      <button
        className="back-link-minimal"
        onClick={() => navigate(-1)}
      >
        <FaArrowLeft className="back-link-icon" />
        Back
      </button>

      <Row>

        {/* MAIN CONTENT */}
        <Col lg={8}>

          <div className="details-main-card">

            <h1 className="details-title">
              {scholarship.title}
            </h1>

            <div className="details-badges">
              <Badge className="badge-primary-modern">
                {scholarship.category}
              </Badge>
              <Badge className="badge-info-modern">
                {scholarship.provider}
              </Badge>
              {isExpired && (
                <Badge className="badge-danger-modern">Expired</Badge>
              )}
            </div>

            <div className="details-section">
              <h5>Description</h5>
              <p>{scholarship.description}</p>
            </div>

            <div className="details-section">
              <h5>Scholarship Overview</h5>
              <div className="eligibility-grid">
                <div className="eligibility-item">
                  <FaUsers />
                  <div>
                    <div className="label">Provider</div>
                    <div className="value">{scholarship.provider || 'Not specified'}</div>
                  </div>
                </div>

                <div className="eligibility-item">
                  <FaCheckCircle />
                  <div>
                    <div className="label">Awards Available</div>
                    <div className="value">{scholarship.awardCount || 'Not specified'}</div>
                  </div>
                </div>

                <div className="eligibility-item">
                  <FaCalendar />
                  <div>
                    <div className="label">Application Start</div>
                    <div className="value">
                      {scholarship.applicationStartDate ? new Date(scholarship.applicationStartDate).toLocaleDateString('en-IN') : 'Open now'}
                    </div>
                  </div>
                </div>

                <div className="eligibility-item">
                  <FaCalendar />
                  <div>
                    <div className="label">Application Deadline</div>
                    <div className="value">
                      {scholarship.applicationDeadline ? new Date(scholarship.applicationDeadline).toLocaleDateString('en-IN') : new Date(scholarship.deadline).toLocaleDateString('en-IN')}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="details-section">
              <h5>Eligibility</h5>

              <div className="eligibility-grid">

                {scholarship.minCgpa && (
                  <div className="eligibility-item">
                    <FaCheckCircle />
                    <div>
                      <div className="label">Minimum CGPA</div>
                      <div className="value">{scholarship.minCgpa}</div>
                    </div>
                  </div>
                )}

                {scholarship.maxIncome && (
                  <div className="eligibility-item">
                    <FaMoneyBillWave />
                    <div>
                      <div className="label">Max Family Income</div>
                      <div className="value">
                        ₹{parseInt(scholarship.maxIncome).toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>
                )}

                <div className="eligibility-item">
                  <FaCheckCircle />
                  <div>
                    <div className="label">Status</div>
                    <div className="value">{scholarship.isActive ? 'Active' : 'Inactive'}</div>
                  </div>
                </div>

                <div className="eligibility-item">
                  <FaUsers />
                  <div>
                    <div className="label">Created By</div>
                    <div className="value">{scholarship.createdBy || 'Platform Admin'}</div>
                  </div>
                </div>

              </div>
            </div>

          </div>

        </Col>

        {/* STICKY SIDEBAR */}
        <Col lg={4}>

          <div className="details-sidebar">

            <div className="amount-box">
              ₹{parseInt(scholarship.amount).toLocaleString('en-IN')}
              <span>Scholarship Amount</span>
            </div>

            <div className="sidebar-info">
              <FaCalendar />
              <div>
                <div>
                  {new Date(scholarship.deadline).toLocaleDateString('en-IN')}
                </div>
                {!isExpired && (
                  <small>{daysLeft} days remaining</small>
                )}
              </div>
            </div>

            <div className="sidebar-info">
              <FaUsers />
              <div>
                {scholarship.awardCount || "Not specified"}
                <small>Awards Available</small>
              </div>
            </div>

            {/* AI Features */}
            <div className="mb-3 d-flex gap-2">
              <Button
                variant="outline-info"
                className="flex-fill"
                onClick={handleEligibilityExplainer}
                style={{ borderRadius: '10px', fontSize: '12px' }}
              >
                <FaRobot className="me-1" />
                AI Eligibility Check
              </Button>
              <Button
                variant="outline-success"
                className="flex-fill"
                onClick={handlePreSubmitReview}
                style={{ borderRadius: '10px', fontSize: '12px' }}
              >
                <FaClipboardCheck className="me-1" />
                AI Review
              </Button>
            </div>

            <Button
              variant={isBookmarked ? "warning" : "outline-warning"}
              className="w-100 mb-3"
              onClick={handleBookmark}
              disabled={bookmarking}
            >
              {isBookmarked ? <FaBookmark className="me-2" /> : <FaRegBookmark className="me-2" />}
              {isBookmarked ? "Saved" : "Save for Later"}
            </Button>

            {scholarship.applicationLink && (
              <Button
                className="btn btn-outline-primary w-100 mb-3"
                onClick={() => window.open(scholarship.applicationLink, '_blank')}
              >
                <FaExternalLinkAlt className="me-2" />
                Visit Application Site
              </Button>
            )}

            {!hasApplied && !isExpired ? (
              <Button
                className="apply-button-pro"
                onClick={handleApply}
                disabled={applying}
              >
                {applying ? "Applying..." : "Apply Now"}
              </Button>
            ) : hasApplied ? (
              <div className="status-box success">
                Application Submitted
              </div>
            ) : (
              <div className="status-box danger">
                Application Closed
              </div>
            )}

          </div>

          {/* Application Checklist */}
          {!hasApplied && !isExpired && (
            <div className="mt-3">
              <ApplicationChecklist scholarship={scholarship} />
            </div>
          )}

        </Col>

      </Row>
    </Container>

      {/* AI Result Modal */}
      <Modal show={aiModal.show} onHide={closeAiModal} size="lg" centered>
        <Modal.Header closeButton style={{ background: '#111827', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <Modal.Title style={{ color: '#f8fafc', fontSize: '18px' }}>{aiModal.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ background: '#0f172a', color: '#e2e8f0', padding: '24px', maxHeight: '60vh', overflowY: 'auto' }}>
          {aiModal.loading ? (
            <div className="text-center py-4">
              <Spinner animation="border" variant="primary" />
              <p className="text-muted mt-3">🤖 AI is analyzing... please wait</p>
            </div>
          ) : (
            <div style={{ lineHeight: '1.7', whiteSpace: 'pre-wrap', fontSize: '14px' }}>
              {aiModal.content}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer style={{ background: '#111827', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <Button variant="secondary" onClick={closeAiModal}>Close</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ScholarshipDetails;