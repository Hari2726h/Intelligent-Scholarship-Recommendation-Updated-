import React, { useState, useEffect } from 'react';
import { getMyApplications } from '../services/applicationService';
import { toast } from 'react-toastify';
import { Table, Badge, Button } from 'react-bootstrap';
import Loader from '../components/Loader';
import ApplicationTimeline from '../components/ApplicationTimeline';

import { useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaHourglassHalf, FaTimesCircle, FaExternalLinkAlt, FaClock, FaDownload, FaHistory } from 'react-icons/fa';
import { exportApplicationsToCSV, exportApplicationsToPDF } from '../utils/exportUtils';

const MyApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showTimeline, setShowTimeline] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchApplications();
  }, []);

  const filteredApplications =
  filter === 'ALL'
    ? applications
    : applications.filter(app => app.status === filter);

  const fetchApplications = async () => {
    try {
      const res = await getMyApplications();
      if (res.success && res.data) {
        setApplications(res.data);
      }
    } catch (err) {
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const getDaysUntilDeadline = (deadline) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getDeadlineColor = (daysLeft) => {
    if (daysLeft < 0) return 'text-danger';
    if (daysLeft <= 3) return 'text-danger';
    if (daysLeft <= 7) return 'text-warning';
    return 'text-success';
  };

  if (loading) return <Loader />;

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold m-0 gradient-text">
          My Applications
        </h2>
        {applications.length > 0 && (
          <div className="d-flex gap-2">
            <Button variant="outline-success" size="sm" onClick={() => exportApplicationsToCSV(filteredApplications)}>
              <FaDownload className="me-1" /> Export CSV
            </Button>
            <Button variant="outline-primary" size="sm" onClick={() => exportApplicationsToPDF(filteredApplications)}>
              <FaDownload className="me-1" /> Export PDF
            </Button>
          </div>
        )}
      </div>

      <div className="application-filters mb-4">
        {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map(type => (
          <button
            key={type}
            className={`filter-btn ${filter === type ? 'active' : ''}`}
            onClick={() => setFilter(type)}
          >
            {type}
          </button>
        ))}
      </div>

      {applications.length === 0 ? (
        <div className="modern-card text-center py-5">
          <p className="text-muted mb-0">
            You have not applied for any scholarships yet.
          </p>
        </div>
      ) : (
        <div className="applications-grid">
          {filteredApplications.map(app => {
            const daysLeft = getDaysUntilDeadline(app.scholarship?.deadline);
            return (
              <div
                key={app.id}
                className={`application-card status-${app.status.toLowerCase()}`}
              >
                <div className="application-header">
                  <div>
                    <h5 className="mb-1">
                      {app.scholarship?.title}
                    </h5>
                    <small className="text-muted">
                      APP-{app.id}
                    </small>
                  </div>

                  <div className="status-badge d-flex align-items-center gap-1">
                    {app.status === 'APPROVED' && <FaCheckCircle size={14} />}
                    {app.status === 'PENDING' && <FaHourglassHalf size={14} />}
                    {app.status === 'REJECTED' && <FaTimesCircle size={14} />}
                    {app.status}
                  </div>
                </div>

                <div className="application-meta">
                  Applied on: {new Date(app.appliedDate).toLocaleDateString()}
                </div>

                {/* Deadline Information */}
                {app.scholarship?.deadline && (
                  <div className={`application-deadline ${getDeadlineColor(daysLeft)}`}>
                    <FaClock className="me-2" />
                    <span>
                      Deadline: {new Date(app.scholarship.deadline).toLocaleDateString()}
                      {daysLeft >= 0 ? ` (${daysLeft} days left)` : ' (Expired)'}
                    </span>
                  </div>
                )}

                {/* Application Link */}
                {app.scholarship?.applicationLink && (
                  <div className="mt-2">
                    <a
                      href={app.scholarship.applicationLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-sm btn-outline-primary w-100"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <FaExternalLinkAlt className="me-2" />
                      Visit Application Site
                    </a>
                  </div>
                )}

                {/* Timeline Button */}
                <div className="mt-2">
                  <Button
                    variant="outline-info"
                    size="sm"
                    className="w-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedApplication(app);
                      setShowTimeline(true);
                    }}
                  >
                    <FaHistory className="me-2" />
                    View Timeline
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Application Timeline Modal */}
      <ApplicationTimeline
        show={showTimeline}
        onHide={() => setShowTimeline(false)}
        application={selectedApplication}
      />
    </div>
  );
};

export default MyApplications;