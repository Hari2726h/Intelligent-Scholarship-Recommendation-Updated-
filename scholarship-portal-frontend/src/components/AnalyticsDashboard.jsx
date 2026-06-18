import React, { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  CartesianGrid,
  XAxis,
  YAxis,
  BarChart,
  Bar,
  Legend
} from "recharts";
import { FaUsers, FaMoneyBillWave, FaCheckCircle, FaClock } from "react-icons/fa";
import API from "../services/api";

const COLORS = ["#3B82F6", "#10B981", "#F59E0B"];

const AnalyticsDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalApplications: 0,
    approved: 0,
    rejected: 0,
    pending: 0,
    students: 0,
    admins: 0,
  });

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await API.get("/admin/analytics");
      if (res.data) {
        setStats(res.data);
      }
    } catch (err) {
      console.error("Analytics fetch failed");
    }
  };

  const pieData = [
    { name: "Approved", value: stats.approved },
    { name: "Rejected", value: stats.rejected },
    { name: "Pending", value: stats.pending },
  ];

  const userData = [
    { role: "Students", value: stats.students },
    { role: "Admins", value: stats.admins },
  ];

  return (
    <div className="container-fluid py-4">
      <h2 className="fw-bold mb-4">Admin Analytics Dashboard</h2>

      {/* ===== TOP STATS ===== */}
      <div className="row g-4 mb-4">
        <div className="col-md-3">
          <div className="analytics-card text-center">
            <FaUsers className="analytics-icon mb-2" />
            <div className="analytics-title">Total Users</div>
            <div className="analytics-value">{stats.totalUsers}</div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="analytics-card text-center">
            <FaMoneyBillWave className="analytics-icon mb-2" />
            <div className="analytics-title">Total Applications</div>
            <div className="analytics-value">{stats.totalApplications}</div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="analytics-card text-center">
            <FaCheckCircle className="analytics-icon mb-2" />
            <div className="analytics-title">Approved</div>
            <div className="analytics-value">{stats.approved}</div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="analytics-card text-center">
            <FaClock className="analytics-icon mb-2" />
            <div className="analytics-title">Pending</div>
            <div className="analytics-value">{stats.pending}</div>
          </div>
        </div>
      </div>

      {/* ===== CHARTS SECTION ===== */}
      <div className="row g-4">
        {/* Pie Chart */}
        <div className="col-md-6">
          <div className="analytics-card">
            <div className="analytics-section-title mb-3">
              Application Status Distribution
            </div>

            {stats.totalApplications === 0 ? (
              <div className="text-center text-muted py-5">
                No analytics data yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#111c2f",
                      border: "1px solid rgba(255,255,255,0.1)"
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Bar Chart */}
        <div className="col-md-6">
          <div className="analytics-card">
            <div className="analytics-section-title mb-3">
              User Distribution
            </div>

            {stats.totalUsers === 0 ? (
              <div className="text-center text-muted py-5">
                No user data yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={userData}>
                  <CartesianGrid stroke="rgba(255,255,255,0.08)" strokeDasharray="3 3" />
                  <XAxis stroke="rgba(255,255,255,0.6)" dataKey="role" />
                  <YAxis stroke="rgba(255,255,255,0.6)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#111c2f",
                      border: "1px solid rgba(255,255,255,0.1)"
                    }}
                  />
                  <Bar dataKey="value" fill="#3B82F6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;