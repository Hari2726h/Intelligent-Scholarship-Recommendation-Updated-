import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { getAllScholarships } from '../services/scholarshipService';
import { getAllApplications, getMyApplications } from '../services/applicationService';
import { getProfile } from '../services/studentService';
import {
  FaGraduationCap,
  FaTasks,
  FaCheckCircle,
  FaHourglassHalf,
  FaTimesCircle,
  FaUserCheck
} from 'react-icons/fa';

const Dashboard = () => {
  const { role, user } = useContext(AuthContext);
  const isAdmin = role === 'ROLE_ADMIN' || role === 'ADMIN';

  const [stats, setStats] = useState({
    totalScholarships: 0,
    totalApplications: 0,
    pendingApplications: 0,
    approvedApplications: 0,
    rejectedApplications: 0,
    profileComplete: false
  });

  const [savedScholarships, setSavedScholarships] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, [isAdmin]);

  const loadDashboardData = async () => {
    try {
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
      } else {
        try {
          const profRes = await getProfile();
          setStats(prev => ({ ...prev, profileComplete: profRes.success }));
        } catch (e) { }

        // Fetch scholarships and filter saved ones
        try {
          const schRes = await getAllScholarships();
          if (schRes.data?.content) {
            const saved = schRes.data.content.filter(s => s.saved);
            setSavedScholarships(saved);
          }
        } catch (e) {
          console.error("Failed to load saved scholarships");
        }

        const myApps = await getMyApplications();
        if (myApps.success) {
          const apps = myApps.data || [];
          setStats(prev => ({
            ...prev,
            totalApplications: apps.length,
            pendingApplications: apps.filter(a => a.status === 'PENDING').length,
            approvedApplications: apps.filter(a => a.status === 'APPROVED').length,
            rejectedApplications: apps.filter(a => a.status === 'REJECTED').length
          }));
        }
      }
    } catch (error) {
      console.error("Dashboard fetch error", error);
    }
  };

  const StatCard = ({ title, count, icon, accent }) => (
    <div className="stat-card-modern">
      <div className="stat-icon-modern" style={{ background: accent }}>
        {icon}
      </div>
      <div className="stat-details">
        <div className="stat-label-modern">{title}</div>
        <div className="stat-value-modern">{count}</div>
      </div>
    </div>
  );

  return (
    <div>
      <div className="dashboard-header">
        <h2>Dashboard</h2>
        <p>Welcome back, <strong>{user}</strong></p>
      </div>

      {!isAdmin && !stats.profileComplete && (
        <div className="profile-warning">
          <FaUserCheck className="me-2" />
          Your profile is incomplete. Complete it to apply for scholarships.
        </div>
      )}

      <div className="stats-grid">
        {isAdmin && (
          <StatCard
            title="Total Scholarships"
            count={stats.totalScholarships}
            icon={<FaGraduationCap />}
            accent="#6366f1"
          />
        )}

        <StatCard
          title="Total Applications"
          count={stats.totalApplications}
          icon={<FaTasks />}
          accent="#0ea5e9"
        />

        <StatCard
          title="Approved"
          count={stats.approvedApplications}
          icon={<FaCheckCircle />}
          accent="#22c55e"
        />

        <StatCard
          title="Pending"
          count={stats.pendingApplications}
          icon={<FaHourglassHalf />}
          accent="#f59e0b"
        />

        <StatCard
          title="Rejected"
          count={stats.rejectedApplications}
          icon={<FaTimesCircle />}
          accent="#ef4444"
        />
      </div>
    </div>
  );
};

export default Dashboard;