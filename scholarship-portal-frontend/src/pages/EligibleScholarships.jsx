import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getEligibleScholarships } from '../services/scholarshipService';
import { applyForScholarship } from '../services/applicationService';
import { toast } from 'react-toastify';
import { Button } from 'react-bootstrap';
import { FaExternalLinkAlt } from 'react-icons/fa';
import Loader from '../components/Loader';
import { enrichScholarshipCollection, paginateItems } from '../utils/scholarshipUtils';

const EligibleScholarships = () => {
  const [scholarships, setScholarships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const navigate = useNavigate();
  const pageSize = 6;

  useEffect(() => {
    fetchEligible();
  }, []);

  const fetchEligible = async () => {
    try {
      const res = await getEligibleScholarships();
      if (res.success && res.data) {
        setScholarships(enrichScholarshipCollection(res.data));
        setPage(0);
      }
    } catch (err) {
      if (err.response?.status === 404) {
        toast.error("Please complete your profile first.");
      } else {
        toast.error('Failed to check eligibility');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (id) => {
    try {
      await applyForScholarship(id);
      toast.success("Successfully applied!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Application failed");
    }
  };

  const visibleScholarships = paginateItems(scholarships, page, pageSize);
  const totalPages = Math.ceil(scholarships.length / pageSize);

  if (loading) return <Loader />;

  return (
    <div className="container-fluid py-4">
      <h2 className="fw-bold mb-4 gradient-text">Eligible Scholarships</h2>
      <p className="text-muted mb-4">Scholarships tailored for you based on your completed profile.</p>

      {scholarships.length === 0 ? (
        <div className="modern-card text-center py-5">
          <h5 className="mb-2">No Eligible Scholarships Found</h5>
          <p className="text-muted mb-3">
            Complete your profile to unlock personalized opportunities.
          </p>
          <Button
            className="btn-primary-modern"
            onClick={() => navigate('/profile')}
          >
            Go to Profile
          </Button>
        </div>
      ) : (
        <div className="eligible-grid">
          {visibleScholarships.map(s => (
            <div key={s.id} className="eligible-card" onClick={() => navigate(`/scholarships/${s.id}`)} style={{ cursor: 'pointer' }}>

              <div className="eligible-header">
                <h5>{s.title}</h5>
                <span className="eligible-badge">Eligible</span>
              </div>

              <div className="eligible-meta">
                <div><strong>Category:</strong> {s.category}</div>
                <div><strong>Min CGPA:</strong> {s.minCgpa}</div>
                <div><strong>Max Income:</strong> {s.maxIncome}</div>
              </div>

              <div className="eligible-amount">
                ₹{parseInt(s.amount).toLocaleString('en-IN')}
              </div>

              <div className="eligible-footer">
                <div className="deadline">
                  Deadline: {new Date(s.deadline).toLocaleDateString()}
                </div>

                <div className="actions">
                  {s.applicationLink && (
                    <Button
                      variant="link"
                      className="visit-link"
                      onClick={(event) => {
                        event.stopPropagation();
                        window.open(s.applicationLink, '_blank', 'noopener,noreferrer');
                      }}
                    >
                      <FaExternalLinkAlt />
                    </Button>
                  )}

                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={(event) => {
                      event.stopPropagation();
                      navigate(`/scholarships/${s.id}`);
                    }}
                  >
                    View Details
                  </Button>

                  <Button
                    className="btn-primary-modern"
                    size="sm"
                    onClick={(event) => {
                      event.stopPropagation();
                      handleApply(s.id);
                    }}
                  >
                    Apply
                  </Button>
                </div>
              </div>

            </div>
          ))}

          {totalPages > 1 && (
            <div className="d-flex justify-content-center align-items-center gap-3 mt-4">
              <button className="btn-outline-modern" disabled={page === 0} onClick={() => setPage((current) => current - 1)}>
                Previous
              </button>
              <span className="text-muted">Page {page + 1} of {totalPages}</span>
              <button className="btn-outline-modern" disabled={page >= totalPages - 1} onClick={() => setPage((current) => current + 1)}>
                Next
              </button>
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default EligibleScholarships;