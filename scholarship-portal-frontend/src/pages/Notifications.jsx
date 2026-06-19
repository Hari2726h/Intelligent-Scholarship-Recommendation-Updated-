import React, { useState, useEffect, useContext } from 'react';
import { getMyNotifications, markAllNotificationsAsRead, deleteNotification } from '../services/notificationService';
import { toast } from 'react-toastify';
import { FaBell, FaCheckCircle, FaClock, FaGraduationCap, FaInfoCircle, FaExternalLinkAlt, FaTrash, FaRobot } from 'react-icons/fa';
import { getNotificationDigest } from '../services/geminiService';
import Loader from '../components/Loader';
import '../styles/Notifications.css';
import { AuthContext } from '../context/AuthContext';
import { getGroupedCollegeNotifications } from '../services/collegeService';

const Notifications = () => {
    const { role } = useContext(AuthContext);
    const [notifications, setNotifications] = useState([]);
    const [groupedNotifications, setGroupedNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedGroups, setExpandedGroups] = useState({});
    const [aiDigest, setAiDigest] = useState('');
    const [aiDigestLoading, setAiDigestLoading] = useState(false);
    const isCollege = role === 'ROLE_COLLEGE' || role === 'COLLEGE';

    const handleGetDigest = async () => {
        setAiDigestLoading(true);
        setAiDigest('');
        try {
            const digest = await getNotificationDigest(notifications);
            setAiDigest(digest);
        } catch {
            // digest failed silently
        } finally {
            setAiDigestLoading(false);
        }
    };



    const fetchNotifications = React.useCallback(async () => {
        try {
            if (isCollege) {
                const res = await getGroupedCollegeNotifications();
                if (res.success && res.data) {
                    setGroupedNotifications(res.data);
                }
                return;
            }

            const res = await getMyNotifications();
            if (res.success && res.data) {
                setNotifications(res.data);
            }
        } catch (err) {
            toast.error('Failed to load notifications');
        } finally {
            setLoading(false);
        }
    }, [isCollege]);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);



    const handleMarkAllAsRead = async () => {
        try {
            await markAllNotificationsAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            toast.success("All notifications marked as read");
        } catch (err) {
            toast.error("Failed to mark all as read");
        }
    };

    const handleDelete = async (id, event) => {
        event.stopPropagation();
        if (window.confirm('Are you sure you want to delete this notification?')) {
            try {
                await deleteNotification(id);
                setNotifications(prev => prev.filter(n => n.id !== id));
                toast.success("Notification deleted");
            } catch (err) {
                toast.error("Failed to delete notification");
            }
        }
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'DEADLINE_REMINDER':
                return <FaClock className="notification-icon deadline" />;
            case 'ELIGIBILITY_ALERT':
                return <FaGraduationCap className="notification-icon eligibility" />;
            case 'APPLICATION_SUBMITTED':
                return <FaCheckCircle className="notification-icon success" />;
            default:
                return <FaInfoCircle className="notification-icon info" />;
        }
    };

    const getNotificationClass = (type) => {
        switch (type) {
            case 'DEADLINE_REMINDER':
                return 'notification-deadline';
            case 'ELIGIBILITY_ALERT':
                return 'notification-eligibility';
            case 'APPLICATION_SUBMITTED':
                return 'notification-success';
            default:
                return 'notification-info';
        }
    };

    if (loading) return <Loader />;

    if (isCollege) {
        return (
            <div className="container-fluid py-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div className="d-flex align-items-center">
                        <FaBell className="me-3 text-primary" size={28} />
                        <h2 className="fw-bold m-0">Notifications Grouped By Student</h2>
                    </div>
                </div>

                {groupedNotifications.length === 0 ? (
                    <div className="notification-empty-state">
                        <div className="empty-bell-wrapper">
                            <FaBell size={60} />
                        </div>
                        <h4>No grouped notifications yet</h4>
                        <p>Run an eligibility scan from the college dashboard to populate student-wise scholarship alerts.</p>
                    </div>
                ) : (
                    <div className="d-flex flex-column gap-3">
                        {groupedNotifications.map((group, index) => {
                            const groupKey = `${group.studentId || 'student'}-${index}`;
                            const isExpanded = Boolean(expandedGroups[groupKey]);
                            return (
                                <div key={groupKey} className="modern-card p-4">
                                    <div className="d-flex justify-content-between align-items-start gap-3 flex-wrap">
                                        <div>
                                            <h5 className="mb-1">{group.studentName || 'Unknown Student'}</h5>
                                            <div className="text-muted small mb-2">Student Email: {group.studentEmail || 'Not available'}</div>
                                            <div className="d-flex gap-2 flex-wrap">
                                                <span className="badge bg-primary">{group.totalNotifications} scholarships</span>
                                                <span className="badge bg-warning text-dark">{group.unreadNotifications} unread</span>
                                            </div>
                                        </div>
                                        <button
                                            className="btn btn-primary btn-sm fw-semibold"
                                            onClick={() => setExpandedGroups((current) => ({ ...current, [groupKey]: !isExpanded }))}
                                        >
                                            {isExpanded ? 'Hide Eligible Scholarships' : 'View Eligible Scholarships'}
                                        </button>
                                    </div>

                                    {isExpanded && (
                                        <div className="table-responsive mt-3">
                                            <table className="table table-sm align-middle mb-0">
                                                <thead>
                                                    <tr>
                                                        <th>Scholarship</th>
                                                        <th>Latest Update</th>
                                                        <th>Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {(group.notifications || []).map((item) => (
                                                        <tr key={item.id || `${item.scholarshipId}-${item.scholarshipTitle}`}>
                                                            <td>{item.scholarshipTitle || item.message}</td>
                                                            <td>{item.createdAt ? new Date(item.createdAt).toLocaleString() : '-'}</td>
                                                            <td>{item.isRead ? 'Read' : 'Unread'}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        );
    }

    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
        <div className="container-fluid py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="d-flex align-items-center">
                    <FaBell className="me-3 text-primary" size={28} />
                    <h2 className="fw-bold m-0">Notifications</h2>
                    {unreadCount > 0 && (
                        <span className="badge bg-primary ms-3">{unreadCount} unread</span>
                    )}
                </div>

                <div className="d-flex gap-2 align-items-center">
                    {notifications.length > 0 && (
                        <button
                            className="btn btn-outline-info btn-sm"
                            onClick={handleGetDigest}
                            disabled={aiDigestLoading}
                        >
                            {aiDigestLoading ?
                                <><span className="spinner-border spinner-border-sm me-1" role="status"></span>Analyzing...</> :
                                <><FaRobot className="me-1" />AI Digest</>
                            }
                        </button>
                    )}
                    {unreadCount > 0 && (
                        <button
                            className="btn btn-outline-primary btn-sm"
                            onClick={handleMarkAllAsRead}
                        >
                            Mark All as Read
                        </button>
                    )}
                </div>
            </div>

            {aiDigest && (
                <div className="modern-card p-4 mb-4" style={{ border: '1px solid rgba(59,130,246,0.3)' }}>
                    <h6 className="mb-3"><FaRobot className="me-2 text-primary" />🤖 AI Notification Digest</h6>
                    <div style={{ color: '#e2e8f0', lineHeight: '1.7', whiteSpace: 'pre-wrap', fontSize: '14px' }}>
                        {aiDigest}
                    </div>
                </div>
            )}

            {notifications.length === 0 ? (
                <div className="notification-empty-state">
                    <div className="empty-bell-wrapper">
                        <FaBell size={60} />
                    </div>
                    <h4>You're all caught up!</h4>
                    <p>No notifications at the moment. Apply for scholarships to receive deadline reminders!</p>
                </div>
            ) : (
                <div className="notification-list">
                    {notifications.map((n) => (
                        <div
                            className={`notification-card ${getNotificationClass(n.notificationType)} ${!n.isRead ? 'unread' : ''}`}
                        >
                            <div className="notification-icon-wrapper">
                                {getNotificationIcon(n.notificationType)}
                            </div>

                            <div className="notification-content">
                                <div className="notification-message">{n.message}</div>
                                <div className="notification-time">
                                    {new Date(n.createdAt).toLocaleString()}
                                </div>
                                {n.actionLink && (
                                    <a
                                        href={n.actionLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="notification-action-link"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        Apply Now <FaExternalLinkAlt size={12} />
                                    </a>
                                )}
                            </div>

                            <div className="notification-actions">
                                {!n.isRead && (
                                    <div className="notification-unread-indicator">
                                        <div className="unread-dot"></div>
                                    </div>
                                )}
                                <button
                                    className="btn-delete-notification"
                                    onClick={(e) => handleDelete(n.id, e)}
                                    title="Delete notification"
                                >
                                    <FaTrash />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Notifications;
