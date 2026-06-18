import React, { useContext } from 'react';
import { Nav } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import {
    FaHome,
    FaGraduationCap,
    FaUser,
    FaClipboardList,
    FaBell,
    FaSignOutAlt,
    FaTasks,
    FaChartLine,
    FaCalendarAlt,
    FaFileAlt,
    FaCalculator,
    FaQuestionCircle,
    FaBookmark,
    FaUniversity
} from 'react-icons/fa';
import { FaRobot } from 'react-icons/fa';

const Sidebar = () => {
    const { role, logout } = useContext(AuthContext);

    const isAdmin = role === 'ROLE_ADMIN' || role === 'ADMIN';
    const isCollege = role === 'ROLE_COLLEGE' || role === 'COLLEGE';

    const CustomNavLink = ({ to, icon, label, end = false }) => (
        <Nav.Item>
            <NavLink
                to={to}
                end={end}
                className={({ isActive }) =>
                    `sidebar-menu-link ${isActive ? 'active' : ''}`
                }
            >
                {icon}
                <span>{label}</span>
            </NavLink>
        </Nav.Item>
    );

    return (
        <div className="sidebar">
            {/* Brand */}
            <div className="sidebar-header">
                <h2 className="gradient-text">ScholarTech</h2>
            </div>

            <Nav className="sidebar-menu flex-column">
                <CustomNavLink to="/dashboard" icon={<FaHome />} label="Dashboard" />

                {!isAdmin && !isCollege ? (
                    <>
                        <CustomNavLink to="/profile" icon={<FaUser />} label="My Profile" />
                        <CustomNavLink
                            to="/scholarships"
                            icon={<FaGraduationCap />}
                            label="Scholarships"
                            end
                        />
                        <CustomNavLink to="/scholarships/eligible" icon={<FaClipboardList />} label="Eligible Scholarships" />
                        <CustomNavLink to="/scholarships/saved" icon={<FaBookmark />} label="Saved Scholarships" />
                        <CustomNavLink to="/applications/my" icon={<FaTasks />} label="My Applications" />
                        <CustomNavLink to="/deadlines" icon={<FaCalendarAlt />} label="Deadline Calendar" />
                        <CustomNavLink to="/documents" icon={<FaFileAlt />} label="My Documents" />
                        <CustomNavLink to="/calculator" icon={<FaCalculator />} label="Aid Calculator" />
                        <CustomNavLink to="/essay-assistant" icon={<FaRobot />} label="Essay Assistant" />
                    </>
                ) : isAdmin ? (
                    <>
                        <CustomNavLink to="/admin/scholarships" icon={<FaGraduationCap />} label="Manage Scholarships" />
                        <CustomNavLink to="/admin/applications" icon={<FaTasks />} label="Manage Applications" />
                        <CustomNavLink to="/admin/analytics" icon={<FaChartLine />} label="Analytics" />
                    </>
                ) : (
                    <>
                        <CustomNavLink to="/college/dashboard" icon={<FaUniversity />} label="College Dashboard" />
                    </>
                )}

                {!isAdmin && <CustomNavLink to="/notifications" icon={<FaBell />} label="Notifications" />}
                {!isAdmin && <CustomNavLink to="/help" icon={<FaQuestionCircle />} label="Help Center" />}
            </Nav>

            <div className="sidebar-footer">
                <button onClick={logout} className="btn-logout-modern w-100">
                    <FaSignOutAlt className="me-2" />
                    Logout
                </button>
            </div>
        </div>
    );
};

export default Sidebar;