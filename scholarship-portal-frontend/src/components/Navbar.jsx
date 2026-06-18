import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { FaBell, FaSearch } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { getMyNotifications } from '../services/notificationService';

const CustomNavbar = () => {
  const { user, isAuthenticated, role } = useContext(AuthContext);
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const isAdmin = role === 'ROLE_ADMIN' || role === 'ADMIN';
  const isCollege = role === 'ROLE_COLLEGE' || role === 'COLLEGE';
  const profileTarget = isAdmin ? '/admin/analytics' : isCollege ? '/college/dashboard' : '/profile';

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
    }
  }, [isAuthenticated]);

  const fetchNotifications = async () => {
    try {
      const res = await getMyNotifications();
      if (res.success && res.data) {
        const unread = res.data.filter(n => !n.isRead).length;
        setUnreadCount(unread);
      }
    } catch (error) {
      console.error("Failed to fetch notifications");
    }
  };

  // Get user initials for avatar
  const getUserInitials = (username) => {
    if (!username) return 'U';
    const names = username.trim().split(' ');
    if (names.length >= 2) {
      return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    }
    return username.substring(0, 2).toUpperCase();
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    // Add search functionality here if needed
  };

  if (!isAuthenticated) return null;

  return (
    <div className="navbar-modern">
      <div className="navbar-left">
        {/* Search Bar */}
        <div className="navbar-search">
          <FaSearch className="navbar-search-icon" />
          <input
            type="text"
            placeholder="Search scholarships, applications..."
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>
      </div>

      <div className="navbar-right">
        {/* Notification Bell */}
        {!isAdmin && (
          <Link to="/notifications" className="navbar-icon-btn">
            <FaBell size={18} />
            {unreadCount > 0 && (
              <span className="navbar-badge">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </Link>
        )}

        {/* User Avatar - Simple Link without overlay */}
        <Link to={profileTarget} className="navbar-avatar" title={`Go to ${isAdmin ? 'Analytics' : isCollege ? 'College Dashboard' : 'Profile'}`}>
          {getUserInitials(user)}
        </Link>
      </div>
    </div>
  );
};

export default CustomNavbar;