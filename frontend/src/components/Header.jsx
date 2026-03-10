import { useState, useRef, useEffect } from 'react';
import { FiBell, FiSearch, FiUser, FiX, FiSettings, FiLogOut, FiInfo, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import './Header.css';
import { useSearch } from '../context/SearchContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Header = () => {
    const { searchQuery, setSearchQuery } = useSearch();
    const { user, signOut } = useAuth();
    const navigate = useNavigate();

    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const [notifications, setNotifications] = useState([
        { id: 1, text: 'New student registered for Math', type: 'info', read: false, time: '2 mins ago' },
        { id: 2, text: 'Payment received: #INV-001', type: 'success', read: false, time: '1 hour ago' },
        { id: 3, text: 'Session cancelled by Tutor', type: 'warning', read: true, time: '3 hours ago' },
    ]);




    const inputRef = useRef(null);
    const profileRef = useRef(null);
    const notifRef = useRef(null);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setIsProfileOpen(false);
            }
            if (notifRef.current && !notifRef.current.contains(event.target)) {
                setIsNotifOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = async () => {
        if (window.confirm('Are you sure you want to log out?')) {
            await signOut();
            navigate('/login');
        }
    };

    const markAsRead = (id) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    };

    const toggleReadStatus = (e, id) => {
        e.stopPropagation();
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: !n.read } : n));
    };

    const deleteNotification = (e, id) => {
        e.stopPropagation();
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    const clearAllNotifications = () => {
        if (window.confirm('Are you sure you want to clear all notifications?')) {
            setNotifications([]);
        }
    };

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    const getNotifIcon = (type) => {
        switch (type) {
            case 'info': return <FiInfo size={14} />;
            case 'success': return <FiCheckCircle size={14} />;
            case 'warning': return <FiAlertCircle size={14} />;
            default: return <FiBell size={14} />;
        }
    };




    const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
            setSearchQuery('');
            inputRef.current?.blur();
        }
    };

    return (
        <header className="header">
            <div className="header-left">
                <div className="search-bar">
                    <FiSearch className="search-icon" />
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Search students, enquiries, tutors, sessions..."
                        className="search-input"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                    {searchQuery && (
                        <button
                            className="search-clear-btn"
                            onClick={() => { setSearchQuery(''); inputRef.current?.focus(); }}
                            title="Clear search (Esc)"
                        >
                            <FiX size={14} />
                        </button>
                    )}
                </div>
            </div>

            <div className="header-right">
                <div className="header-dropdown-container" ref={notifRef}>
                    <button className="icon-btn" onClick={() => setIsNotifOpen(!isNotifOpen)}>
                        <FiBell />
                        {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
                    </button>

                    {isNotifOpen && (
                        <div className="header-dropdown notifications-dropdown simple-notif animate-fade-in">
                            <div className="dropdown-header">
                                <div className="flex justify-between items-center w-full">
                                    <h4 className="m-0">Notifications</h4>
                                    <button className="text-btn" onClick={markAllAsRead}>Mark as read</button>
                                </div>
                            </div>
                            <div className="dropdown-body">
                                {notifications.length === 0 ? (
                                    <div className="empty-notif py-8 text-center text-muted text-sm">
                                        No new notifications
                                    </div>
                                ) : (
                                    notifications.slice(0, 5).map(notif => (
                                        <div
                                            key={notif.id}
                                            className={`notif-item-simple ${notif.read ? 'read' : 'unread'}`}
                                            onClick={() => markAsRead(notif.id)}
                                        >
                                            <div className={`notif-indicator ${notif.type}`}></div>
                                            <div className="notif-content-simple">
                                                <p className="notif-text-simple">{notif.text}</p>
                                                <span className="notif-time-simple">{notif.time}</span>
                                            </div>
                                            <button
                                                className="notif-delete-simple"
                                                onClick={(e) => deleteNotification(e, notif.id)}
                                            >
                                                <FiX size={12} />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                            <button className="dropdown-footer-btn" onClick={() => navigate('/notifications')}>
                                View All Notifications
                            </button>
                        </div>
                    )}


                </div>

                <div className="header-dropdown-container" ref={profileRef}>
                    <div className="user-profile" onClick={() => setIsProfileOpen(!isProfileOpen)}>
                        <div className="avatar">
                            <FiUser />
                        </div>
                        <div className="user-info">
                            <span className="user-name">{user?.name || 'Administrator'}</span>
                            <span className="user-role">{user?.role || 'Manager'}</span>
                        </div>
                    </div>

                    {isProfileOpen && (
                        <div className="header-dropdown profile-dropdown animate-fade-in">
                            <div className="dropdown-header profile-header">
                                <div className="avatar-large">
                                    <FiUser />
                                </div>
                                <div className="profile-details">
                                    <h4>{user?.name || 'Administrator'}</h4>
                                    <span className="text-muted">{user?.email || 'admin@guardiantutoring.com'}</span>
                                </div>
                            </div>
                            <div className="dropdown-body">
                                <button className="dropdown-action-btn" onClick={() => { setIsProfileOpen(false); navigate('/settings'); }}>
                                    <FiSettings /> Account Settings
                                </button>
                                <button className="dropdown-action-btn text-danger" onClick={handleLogout}>
                                    <FiLogOut /> Log Out
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
