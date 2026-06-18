import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getAllScholarships } from '../services/scholarshipService';
import { getAllApplications, getMyApplications } from '../services/applicationService';
import { getProfile } from '../services/studentService';
import { getRecommendations, getBookmarkedScholarships } from '../services/recommendationService';
import { getProfileStrength } from '../services/profileService';
import { getCollegeDashboard } from '../services/collegeService';
import QuickStats from '../components/QuickStats';

import {
  FaGraduationCap,
  FaTasks,
  FaCheckCircle,
  FaHourglassHalf,
  FaTimesCircle,
  FaUserCheck,
  FaRobot,
  FaBookmark,
  FaArrowRight,
  FaChartLine,
  FaUniversity,
  FaUserGraduate
} from 'react-icons/fa';

const EnhancedDashboard = () => {
  const { role, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const isAdmin = role === 'ROLE_ADMIN' || role === 'ADMIN';
  const isCollege = role === 'ROLE_COLLEGE' || role === 'COLLEGE';

  const [stats, setStats] = useState({
    totalScholarships: 0,
    totalApplications: 0,
    pendingApplications: 0,
    approvedApplications: 0,
    rejectedApplications: 0,
    profileComplete: false
  });

  const [recommendations, setRecommendations] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [profileStrength, setProfileStrength] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState([]);
  const [scholarships, setScholarships] = useState([]);
  const [collegeStats, setCollegeStats] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, [isAdmin]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      if (isAdmin) {
        const schRes = await getAllScholarships();
        const appRes = await getAllApplications();

        const totalSch = schRes.data?.totalElements || 0;
        const allApps = appRes.data?.content || [];

        setStats({
          totalScholarships: totalSch,
          totalApplications: allApps.length,
          pendingApplications: allApps.filter(a => a.status === 'PENDING').length,
          approvedApplications: allApps.filter(a => a.status === 'APPROVED').length,
          rejectedApplications: allApps.filter(a => a.status === 'REJECTED').length
        });
      } else if (!isCollege) {
        try {
          const profRes = await getProfile();
          setStats(prev => ({ ...prev, profileComplete: profRes.success }));
        } catch (e) { }

        const myApps = await getMyApplications();
        if (myApps.success) {
          const apps = myApps.data || [];
          setApplications(apps); // Store for QuickStats
          setStats(prev => ({
            ...prev,
            totalApplications: apps.length,
            pendingApplications: apps.filter(a => a.status === 'PENDING').length,
            approvedApplications: apps.filter(a => a.status === 'APPROVED').length,
            rejectedApplications: apps.filter(a => a.status === 'REJECTED').length
          }));
        }

        // Fetch scholarships for QuickStats
        try {
          const schRes = await getAllScholarships();
          if (schRes.success) {
            setScholarships(schRes.data?.content || []);
          }
        } catch (e) { }

        try {
          const recRes = await getRecommendations();
          if (recRes.success) setRecommendations(recRes.data.slice(0, 3));
        } catch (e) { }

        try {
          const bookRes = await getBookmarkedScholarships();
          if (bookRes.success && Array.isArray(bookRes.data)) {
            setBookmarks(bookRes.data.slice(0, 3));
          }
        } catch (e) { }

        try {
          const strengthRes = await getProfileStrength();
          if (strengthRes.success) setProfileStrength(strengthRes.data);
        } catch (e) { }
      } else {
        const collegeRes = await getCollegeDashboard();
        if (collegeRes.success) {
          setCollegeStats(collegeRes.data);
        }

        setStats({
          totalScholarships: 0,
          totalApplications: 0,
          pendingApplications: 0,
          approvedApplications: 0,
          rejectedApplications: 0,
          profileComplete: true
        });
      }
    } catch (error) {
      console.error("Dashboard fetch error", error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, count, icon, gradientClass, onClick }) => {
    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
      let start = 0;
      const duration = 600;
      const increment = count / (duration / 16);

      const counter = setInterval(() => {
        start += increment;
        if (start >= count) {
          setDisplayValue(count);
          clearInterval(counter);
        } else {
          setDisplayValue(Math.floor(start));
        }
      }, 16);

      return () => clearInterval(counter);
    }, [count]);

    return (
      <div
        className="dashboard-card stat-card-clean"
        onClick={onClick}
        style={{ cursor: onClick ? 'pointer' : 'default' }}
      >
        <div className="stat-left">
          <div className={`stat-icon-clean ${gradientClass}`}>
            {icon}
          </div>
          <div>
            <div className="stat-label-clean">{title}</div>
            <div className="stat-value-clean">{displayValue}</div>
          </div>
        </div>
        {onClick && <FaArrowRight className="stat-arrow-clean" />}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="content-area d-flex align-items-center justify-content-center">
        <div className="spinner-border text-primary" role="status" />
      </div>
    );
  }

  return (
    <div className="enhanced-dashboard">

      {/* Header */}
      <div className="dashboard-hero">
        <div>
          <div className="hero-title">
            {isCollege ? 'College Dashboard' : isAdmin ? 'Admin Dashboard' : 'Student Dashboard'}
          </div>
          <div className="hero-subtitle">
            Welcome back, <strong>{user}</strong>
          </div>
        </div>

        {!isAdmin && !isCollege && profileStrength && (
          <div className="hero-strength-card">
            <div>Profile Strength</div>
            <h3>{profileStrength.overallScore}%</h3>
          </div>
        )}
      </div>

      {/* Profile Warning */}
      {!isAdmin && !isCollege && !stats.profileComplete && (
        <div className="dashboard-card mb-4">
          <FaUserCheck className="me-2 text-warning" />
          Complete your profile to unlock personalized recommendations.
          <button
            className="btn-primary-modern btn-sm ms-3"
            onClick={() => navigate('/profile')}
          >
            Complete Now
          </button>
        </div>
      )}

      {/* Quick Stats Widget (Student View) */}
      {!isAdmin && !isCollege && applications.length > 0 && (
        <QuickStats applications={applications} scholarships={scholarships} />
      )}

      {/* Stats Grid */}
      <div className="stats-grid-enhanced">

        {isAdmin && (
          <StatCard
            title="Total Scholarships"
            count={stats.totalScholarships}
            icon={<FaGraduationCap />}
            onClick={() => navigate('/admin/scholarships')}
          />
        )}

        {isCollege && (
          <StatCard
            title="Managed Students"
            count={collegeStats?.totalManagedStudents || 0}
            icon={<FaUserGraduate />}
            gradientClass="stat-gradient-1"
            onClick={() => navigate('/college/dashboard')}
          />
        )}

        {isCollege && (
          <StatCard
            title="College Workspace"
            count={1}
            icon={<FaUniversity />}
            gradientClass="stat-gradient-2"
            onClick={() => navigate('/college/dashboard')}
          />
        )}

        {!isCollege && (
          <StatCard
            title="Total Applications"
            count={stats.totalApplications}
            icon={<FaTasks />}
            gradientClass="stat-gradient-1"
          />
        )}

        {!isCollege && (
          <StatCard
            title="Approved"
            count={stats.approvedApplications}
            icon={<FaCheckCircle />}
            gradientClass="stat-gradient-2"
          />
        )}

        {!isCollege && (
          <StatCard
            title="Pending"
            count={stats.pendingApplications}
            icon={<FaHourglassHalf />}
            gradientClass="stat-gradient-3"
          />
        )}

        {!isCollege && (
          <StatCard
            title="Rejected"
            count={stats.rejectedApplications}
            icon={<FaTimesCircle />}
            gradientClass="stat-gradient-4"
          />
        )}
      </div>

      {isCollege && (
        <div className="dashboard-card mt-4">
          <h5 className="mb-2">College Overview</h5>
          <p className="mb-2 text-muted">
            Students with verified email: <strong>{collegeStats?.studentsWithEmail || 0}</strong>
          </p>
          <button className="btn-primary-modern" onClick={() => navigate('/college/dashboard')}>
            Open Student Management
          </button>
        </div>
      )}

      {/* Student Sections */}
      {!isAdmin && !isCollege && (
        <>
          {/* Recommendations */}
          <div className="dashboard-card mt-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5>Recommended Scholarships</h5>
              <button
                className="btn-modern-outline"
                onClick={() => navigate('/scholarships/recommended')}
              >
                View All
              </button>
            </div>

            {recommendations.length === 0 ? (
              <p className="text-muted">
                Complete your profile to receive recommendations.
              </p>
            ) : (
              <div className="recommendations-grid">
                {recommendations.map(rec => (
                  <div
                    key={rec.scholarshipId}
                    className="recommended-compact-card"
                    onClick={() => navigate(`/scholarships/${rec.scholarshipId}`)}
                  >
                    <div className="rec-left">
                      <h6 className="rec-title">{rec.title}</h6>

                      <div className="rec-progress">
                        <div
                          className="rec-progress-fill"
                          style={{ width: `${rec.matchScore}%` }}
                        />
                      </div>

                      <div className="rec-footer">
                        <span className="rec-match-text">
                          {rec.matchScore}% Match
                        </span>

                        <span
                          className="rec-link"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/scholarships/${rec.scholarshipId}`);
                          }}
                        >
                          Explore →
                        </span>
                      </div>
                    </div>

                    <div className="rec-score-circle">
                      {rec.matchScore}%
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bookmarks */}
          <div className="dashboard-card mt-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5>Saved Scholarships</h5>
              <button
                className="btn-modern-outline"
                onClick={() => navigate('/scholarships/saved')}
              >
                View All
              </button>
            </div>

            {bookmarks.length === 0 ? (
              <p className="text-muted">
                No saved scholarships yet.
              </p>
            ) : (
              bookmarks.map(bookmark => {
                const scholarshipTitle = bookmark.scholarship?.title || bookmark.title;
                const scholarshipId = bookmark.scholarship?.id || bookmark.id;
                const scholarshipAmount = bookmark.scholarship?.amount || bookmark.amount;
                return (
                  <div
                    key={scholarshipId}
                    className="dashboard-card mb-3"
                    style={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/scholarships/${scholarshipId}`)}
                  >
                    <h6>{scholarshipTitle}</h6>
                    {scholarshipAmount && <p className="text-muted small">Amount: ${scholarshipAmount}</p>}
                    <button
                      className="btn-primary-modern btn-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/scholarships/${scholarshipId}`);
                      }}
                    >
                      View Details
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Profile Strength */}
          {profileStrength && (
            <div className="dashboard-card mt-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5>
                  <FaChartLine className="me-2" />
                  Profile Strength
                </h5>
                <button
                  className="btn-modern-outline"
                  onClick={() => navigate('/profile/strength')}
                >
                  Improve
                </button>
              </div>

              <p>
                Overall Completion: <strong>{profileStrength.overallScore}%</strong>
              </p>

              <div className="progress mt-2" style={{ height: '8px' }}>
                <div
                  className="progress-bar bg-primary"
                  role="progressbar"
                  style={{ width: `${profileStrength.overallScore}%` }}
                />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default EnhancedDashboard;