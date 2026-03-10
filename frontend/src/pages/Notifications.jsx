import { useState } from 'react';
import { FiBell, FiTrash2, FiX, FiCheck } from 'react-icons/fi';
import './Notifications.css';

const Notifications = () => {
    const [notifications, setNotifications] = useState([
        { id: 1, text: 'New student registered for Math', type: 'info', read: false, time: '2 mins ago', date: 'March 7, 2026' },
        { id: 2, text: 'Payment received: #INV-001', type: 'success', read: false, time: '1 hour ago', date: 'March 7, 2026' },
        { id: 3, text: 'Session cancelled by Tutor', type: 'warning', read: true, time: '3 hours ago', date: 'March 7, 2026' },
        { id: 4, text: 'New enquiry for Science Grade 8', type: 'info', read: true, time: '1 day ago', date: 'March 6, 2026' },
        { id: 5, text: 'Tutor application approved: James Wilson', type: 'success', read: true, time: '2 days ago', date: 'March 5, 2026' },
    ]);

    const [filter, setFilter] = useState('all');

    const markAsRead = (id) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    };

    const toggleReadStatus = (id) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: !n.read } : n));
    };

    const deleteNotif = (id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    const markAllRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const clearAll = () => {
        if (window.confirm('Clear all notifications?')) {
            setNotifications([]);
        }
    };

    const filteredNotifs = filter === 'all'
        ? notifications
        : notifications.filter(n => !n.read);

    return (
        <div className="notifications-page animate-fade-in">
            <div className="page-header">
                <h1 className="h1">Notifications</h1>
                <div className="header-actions">
                    <button className="btn btn-secondary btn-sm" onClick={markAllRead}>Mark as read</button>
                    <button className="btn btn-secondary btn-sm text-danger" onClick={clearAll}>Clear all</button>
                </div>
            </div>

            <div className="notif-filters-simple">
                <button
                    className={`nav-tab ${filter === 'all' ? 'active' : ''}`}
                    onClick={() => setFilter('all')}
                >
                    All Notifications
                </button>
                <button
                    className={`nav-tab ${filter === 'unread' ? 'active' : ''}`}
                    onClick={() => setFilter('unread')}
                >
                    Unread ({notifications.filter(n => !n.read).length})
                </button>
            </div>

            <div className="notif-list-simple">
                {filteredNotifs.length === 0 ? (
                    <div className="empty-state-simple">
                        <p className="text-muted">No notifications to show</p>
                    </div>
                ) : (
                    filteredNotifs.map(notif => (
                        <div key={notif.id} className={`notif-row ${notif.read ? 'read' : 'unread'}`} onClick={() => markAsRead(notif.id)}>
                            <div className={`type-bar ${notif.type}`}></div>
                            <div className="notif-main-simple">
                                <p className="notif-text-primary">{notif.text}</p>
                                <div className="notif-meta">
                                    <span>{notif.time}</span>
                                    <span className="dot-separator">•</span>
                                    <span>{notif.date}</span>
                                </div>
                            </div>
                            <div className="notif-row-actions">
                                <button
                                    className="action-icon-btn"
                                    onClick={(e) => { e.stopPropagation(); toggleReadStatus(notif.id); }}
                                    title={notif.read ? "Mark as unread" : "Mark as read"}
                                >
                                    <div className={`status-circle ${notif.read ? 'inactive' : 'active'}`}></div>
                                </button>
                                <button
                                    className="action-icon-btn delete"
                                    onClick={(e) => { e.stopPropagation(); deleteNotif(notif.id); }}
                                >
                                    <FiTrash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Notifications;
