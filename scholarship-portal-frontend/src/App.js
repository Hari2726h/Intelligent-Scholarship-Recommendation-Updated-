import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';

// Enterprise Components
import ErrorBoundary from './components/ErrorBoundary';
import ToastNotification from './components/ToastNotification';

// Layout components
import CustomNavbar from './components/Navbar';
import Sidebar from './components/Sidebar';

// Route wrappers
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import StudentRoute from './components/StudentRoute';
import CollegeRoute from './components/CollegeRoute';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/EnhancedDashboard';
import Profile from './pages/Profile';
import Scholarships from './pages/Scholarships';
import EligibleScholarships from './pages/EligibleScholarships';
import MyApplications from './pages/MyApplications';
import ApplicationsManagement from './pages/ApplicationsManagement';
import Notifications from './pages/Notifications';
import NotFound from './pages/NotFound';
import RecommendedScholarships from './pages/RecommendedScholarships';
import BookmarkedScholarships from './pages/BookmarkedScholarships';
import ScholarshipDetails from './pages/ScholarshipDetails';
import ScholarshipComparison from './pages/ScholarshipComparison';
import DeadlineCalendar from './pages/DeadlineCalendar';
import DocumentManagement from './pages/DocumentManagement';
import AdminAnalyticsDashboard from './pages/AdminAnalyticsDashboard';
import FinancialAidCalculator from './pages/FinancialAidCalculator';
import HelpCenter from './pages/HelpCenter';
import EssayAssistant from './pages/EssayAssistant';
import CollegeManagementDashboard from './pages/CollegeManagementDashboard';

// Student Components  
import ProfileStrengthMeter from './components/ProfileStrengthMeter';

import { useLocation } from 'react-router-dom';

const Layout = ({ children }) => {
  const location = useLocation();

  const noLayoutRoutes = ['/login', '/register'];

  const isAuthPage = noLayoutRoutes.includes(location.pathname);

  if (isAuthPage) {
    return children;
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-area">
        <CustomNavbar />
        <div className="content-area page-transition">
          {children}
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <Router>
            {/* React Toastify Container */}
            <ToastContainer position="top-right" autoClose={3000} hideProgressBar theme="colored" />

            {/* Custom Toast Notification Component */}
            <ToastNotification />

            <Layout>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                <Route path="/" element={<Navigate to="/dashboard" replace />} />

                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />

                {/* College Routes */}
                <Route path="/college/dashboard" element={<CollegeRoute><CollegeManagementDashboard /></CollegeRoute>} />

                {/* Student Routes */}
                <Route path="/profile" element={<StudentRoute><Profile /></StudentRoute>} />
                <Route path="/profile/strength" element={<StudentRoute><ProfileStrengthMeter /></StudentRoute>} />
                <Route path="/scholarships" element={<StudentRoute><Scholarships /></StudentRoute>} />
                <Route path="/scholarships/eligible" element={<StudentRoute><EligibleScholarships /></StudentRoute>} />
                <Route path="/scholarships/recommended" element={<StudentRoute><RecommendedScholarships /></StudentRoute>} />
                <Route path="/scholarships/saved" element={<StudentRoute><BookmarkedScholarships /></StudentRoute>} />
                <Route path="/scholarships/compare" element={<StudentRoute><ScholarshipComparison /></StudentRoute>} />
                <Route path="/scholarships/:id" element={<StudentRoute><ScholarshipDetails /></StudentRoute>} />
                <Route path="/applications/my" element={<StudentRoute><MyApplications /></StudentRoute>} />
                <Route path="/deadlines" element={<StudentRoute><DeadlineCalendar /></StudentRoute>} />
                <Route path="/documents" element={<StudentRoute><DocumentManagement /></StudentRoute>} />
                <Route path="/calculator" element={<StudentRoute><FinancialAidCalculator /></StudentRoute>} />
                  <Route path="/essay-assistant" element={<StudentRoute><EssayAssistant /></StudentRoute>} />
                <Route path="/help" element={<ProtectedRoute><HelpCenter /></ProtectedRoute>} />

                {/* Admin Routes */}
                <Route path="/admin/scholarships" element={<AdminRoute><Scholarships isAdminView={true} /></AdminRoute>} />
                <Route path="/admin/applications" element={<AdminRoute><ApplicationsManagement /></AdminRoute>} />
                <Route path="/admin/analytics" element={<AdminRoute><AdminAnalyticsDashboard /></AdminRoute>} />
                <Route path="/admin/analytics-dashboard" element={<AdminRoute><AdminAnalyticsDashboard /></AdminRoute>} />

                <Route path="*" element={<NotFound />} />
              </Routes>
            </Layout>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;