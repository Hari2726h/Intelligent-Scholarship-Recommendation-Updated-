import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser } from '../services/authService';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { decodeToken } from '../utils/jwtDecode';

const Login = () => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [selectedRole, setSelectedRole] = useState('ROLE_STUDENT');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) =>
    setCredentials({ ...credentials, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await loginUser(credentials);

      if (res.success && res.data) {
        const dec = decodeToken(res.data);

        let role = 'ROLE_STUDENT';
        if (dec?.role) role = dec.role;
        else if (dec?.authorities?.[0]?.authority)
          role = dec.authorities[0].authority;

        if (selectedRole && selectedRole !== role) {
          toast.error('Selected role does not match account role.');
          return;
        }

        login(res.data, role);
        toast.success("Successfully logged in!");
        navigate('/dashboard');
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message || 'Login failed. Invalid credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-container-box">

        <div className="auth-left-section">
          <div className="auth-left-inner">
            <h1>ScholarTech</h1>
            <p>
              Discover scholarships, manage applications,
              and track your academic growth in one unified platform.
            </p>

            <div className="auth-illustration">
              <div className="illustration-box"></div>
            </div>
          </div>
        </div>

        <div className="auth-right-section">
          <div className="auth-form-card-modern">
            <h2>Login</h2>
            <p className="auth-form-sub">
              Enter your credentials to continue
            </p>

            <form onSubmit={handleSubmit}>
              <div className="auth-input-group">
                <label>Username</label>
                <input
                  type="text"
                  name="username"
                  value={credentials.username}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="auth-input-group">
                <label>Login As</label>
                <select
                  name="loginRole"
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                >
                  <option value="ROLE_STUDENT">Student</option>
                  <option value="ROLE_ADMIN">Admin</option>
                  <option value="ROLE_COLLEGE">College Management</option>
                </select>
              </div>

              <div className="auth-input-group">
                <label>Password</label>
                <input
                  type="password"
                  name="password"
                  value={credentials.password}
                  onChange={handleChange}
                  required
                />
              </div>

              <button className="auth-btn-modern" disabled={loading}>
                {loading ? "Signing in..." : "Login"}
              </button>
            </form>

            <div className="auth-bottom-text">
              Don’t have an account? <Link to="/register">Create one</Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;