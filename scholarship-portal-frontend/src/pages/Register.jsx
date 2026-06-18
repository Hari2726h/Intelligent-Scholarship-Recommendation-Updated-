import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../services/authService';
import { toast } from 'react-toastify';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'STUDENT'
  });

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await registerUser(formData);
      if (res.success) {
        toast.success("Registration successful! Please login.");
        navigate('/login');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-container-box">

        <div className="auth-left-section">
          <div className="auth-left-inner">
            <h1>Join ScholarTech</h1>
            <p>
              Create your account to explore scholarships,
              track applications, and unlock personalized
              recommendations.
            </p>

            <div className="auth-illustration">
              <div className="illustration-box"></div>
            </div>
          </div>
        </div>

        <div className="auth-right-section">
          <div className="auth-form-card-modern">
            <h2>Create Account</h2>
            <p className="auth-form-sub">
              Fill in the details below to register
            </p>

            <form onSubmit={handleSubmit}>

              <div className="auth-input-group">
                <label>Username</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="auth-input-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="auth-input-group">
                <label>Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="auth-input-group">
                <label>Role</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                >
                  <option value="STUDENT">Student</option>
                  <option value="ADMIN">Admin</option>
                  <option value="COLLEGE">College Management</option>
                </select>
              </div>

              <button className="auth-btn-modern" disabled={loading}>
                {loading ? "Creating account..." : "Register"}
              </button>
            </form>

            <div className="auth-bottom-text">
              Already have an account? <Link to="/login">Sign in</Link>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default Register;