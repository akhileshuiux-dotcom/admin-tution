import { useState } from 'react';
import {
    FiChevronLeft, FiChevronRight, FiCalendar, FiVideo, FiMapPin,
    FiCheckCircle, FiClock, FiMessageCircle, FiFileText, FiBookOpen
} from 'react-icons/fi';
import './Sessions.css';

const MOCK_SESSIONS = [
    {
        id: 'SESS01',
        date: new Date().toISOString().split('T')[0],
        startTime: '16:00',
        endTime: '17:30',
        student: 'Alex Johnson',
        subject: 'Maths Grade 10',
        topic: 'Quadratic Equations & Roots',
        type: 'One-on-One',
        mode: 'Online',
        location: 'Zoom (ID: 948 238 102)',
        tutor: 'Dr. Emily Chen',
        status: 'Scheduled'
    },
    {
        id: 'SESS02',
        date: new Date().toISOString().split('T')[0],
        startTime: '10:00',
        endTime: '11:30',
        student: 'Sarah Smith',
        subject: 'Physics',
        topic: 'Kinematics Revision',
        type: 'Revision Batch',
        mode: 'In-Person',
        location: 'Room 3B',
        tutor: 'James Wilson',
        status: 'Live'
    },
    {
        id: 'SESS03',
        date: new Date().toISOString().split('T')[0],
        startTime: '08:00',
        endTime: '09:00',
        student: 'Lucas Martinez',
        subject: 'Chemistry',
        topic: 'Organic Chemistry Basics',
        type: 'One-on-One',
        mode: 'Online',
        location: 'Google Meet',
        tutor: 'Priya Sharma',
        status: 'Completed'
    },
    {
        id: 'SESS04',
        date: new Date().toISOString().split('T')[0],
        startTime: '18:00',
        endTime: '19:00',
        student: 'Emma Wilson',
        subject: 'Biology',
        topic: 'Cell Structure',
        type: 'Group',
        mode: 'In-Person',
        location: 'Room 1A',
        tutor: 'Priya Sharma',
        status: 'Cancelled'
    }
];

const Sessions = () => {
    // State Management
    const [sessions, setSessions] = useState(MOCK_SESSIONS);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [viewMode, setViewMode] = useState('list'); // 'list', 'day', 'week'
    const [filters, setFilters] = useState({
        tutor: 'All',
        subject: 'All',
        mode: 'All',
        status: 'All'
    });

    // Date Navigation
    const handlePrevDay = () => {
        const prev = new Date(currentDate);
        prev.setDate(prev.getDate() - 1);
        setCurrentDate(prev);
    };

    const handleNextDay = () => {
        const next = new Date(currentDate);
        next.setDate(next.getDate() + 1);
        setCurrentDate(next);
    };

    const handleToday = () => {
        setCurrentDate(new Date());
    };

    const formatDate = (date) => {
        return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    };

    const formatISODate = (date) => {
        return date.toISOString().split('T')[0];
    };

    // Filter Logic
    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const handleMarkAttendance = (sessionId) => {
        setSessions(prev => prev.map(s =>
            s.id === sessionId ? { ...s, status: 'Completed' } : s
        ));
        // Note: In a real app, this would be an API call
    };

    const filteredSessions = sessions.filter(session => {
        const isoCurrentDate = formatISODate(currentDate);
        // Only show matching date for Day/List view initially
        if (session.date !== isoCurrentDate) return false;

        if (filters.tutor !== 'All' && session.tutor !== filters.tutor) return false;
        if (filters.subject !== 'All' && !session.subject.includes(filters.subject)) return false;
        if (filters.mode !== 'All' && session.mode !== filters.mode) return false;
        if (filters.status !== 'All' && session.status !== filters.status) return false;
        return true;
    });

    // Helper to determine status color class
    const getStatusClass = (status) => {
        switch (status) {
            case 'Live': return 'status-live';
            case 'Completed': return 'status-completed';
            case 'Cancelled': return 'status-cancelled';
            default: return 'status-scheduled'; // Scheduled
        }
    };

    return (
        <div className="sessions-page animate-fade-in">
            {/* Header & View Toggle */}
            <div className="page-header flex justify-between items-center mb-0">
                <div>
                    <h1 className="h1 mb-0">Session Calendar</h1>
                    <p className="text-muted">Manage your upcoming classes and mark attendance.</p>
                </div>
                <div className="view-toggle glass-panel">
                    <button className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`} onClick={() => setViewMode('list')}>List</button>
                    <button className={`toggle-btn ${viewMode === 'day' ? 'active' : ''}`} onClick={() => setViewMode('day')}>Day</button>
                    <button className={`toggle-btn ${viewMode === 'week' ? 'active' : ''}`} onClick={() => setViewMode('week')}>Week</button>
                </div>
            </div>

            {/* Date Navigation & Filters */}
            <div className="sessions-toolbar glass-panel mb-6">
                <div className="date-navigator">
                    <button className="icon-btn" onClick={handlePrevDay}><FiChevronLeft size={20} /></button>
                    <button className="btn btn-secondary date-btn" onClick={handleToday}>
                        <FiCalendar className="mr-2" /> {formatDate(currentDate)}
                    </button>
                    <button className="icon-btn" onClick={handleNextDay}><FiChevronRight size={20} /></button>
                </div>

                <div className="filter-bar">
                    <select className="form-select filter-select" name="tutor" value={filters.tutor} onChange={handleFilterChange}>
                        <option value="All">All Tutors</option>
                        <option value="Dr. Emily Chen">Dr. Emily Chen</option>
                        <option value="James Wilson">James Wilson</option>
                        <option value="Priya Sharma">Priya Sharma</option>
                    </select>
                    <select className="form-select filter-select" name="subject" value={filters.subject} onChange={handleFilterChange}>
                        <option value="All">All Subjects</option>
                        <option value="Maths">Maths</option>
                        <option value="Physics">Physics</option>
                        <option value="Chemistry">Chemistry</option>
                        <option value="Biology">Biology</option>
                    </select>
                    <select className="form-select filter-select" name="mode" value={filters.mode} onChange={handleFilterChange}>
                        <option value="All">All Modes</option>
                        <option value="Online">Online</option>
                        <option value="In-Person">In-Person</option>
                    </select>
                    <select className="form-select filter-select" name="status" value={filters.status} onChange={handleFilterChange}>
                        <option value="All">All Statuses</option>
                        <option value="Scheduled">Scheduled</option>
                        <option value="Live">Live</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                    </select>
                </div>
            </div>

            {/* Sessions List */}
            <div className="sessions-list">
                {filteredSessions.length === 0 ? (
                    <div className="empty-state glass-panel text-center p-8">
                        <FiCalendar size={48} className="text-muted mx-auto mb-4" opacity={0.5} />
                        <h3 className="h3">No Sessions Scheduled</h3>
                        <p className="text-muted">There are no classes scheduled for this date matching your filters.</p>
                    </div>
                ) : (
                    filteredSessions.map((sess) => (
                        <div key={sess.id} className="session-card glass-panel">
                            {/* Left Edge Status Indicator line via CSS border or absolute div */}
                            <div className={`session-status-edge ${getStatusClass(sess.status)}`}></div>

                            <div className="session-card-content flex justify-between items-center gap-6">

                                {/* Time & Basic Info */}
                                <div className="session-info flex gap-5 items-center flex-1">
                                    <div className="time-col flex flex-col items-center justify-center">
                                        <div className="time-primary font-bold text-lg">{sess.startTime}</div>
                                        <div className="time-secondary text-muted text-sm">— {sess.endTime}</div>
                                        {sess.status === 'Scheduled' && (
                                            <div className="time-countdown text-xs mt-1 text-primary">Starts soon</div>
                                        )}
                                    </div>

                                    <div className="details-col flex-1 pl-4" style={{ borderLeft: '1px solid rgba(255,255,255,0.1)' }}>
                                        <div className="flex items-center gap-3 mb-1">
                                            <h3 className="h3 mb-0" style={{ fontSize: '1.2rem' }}>{sess.student}</h3>
                                            <span className={`badge-pill ${getStatusClass(sess.status)}`}>
                                                {sess.status === 'Live' && <span className="pulse-dot"></span>}
                                                {sess.status}
                                            </span>
                                        </div>
                                        <div className="topic-line font-medium mb-1 text-sm color-text-main">
                                            {sess.subject} • {sess.topic}
                                        </div>
                                        <div className="meta-line flex gap-4 text-muted text-sm items-center mt-2">
                                            <span className="flex items-center gap-1">
                                                <div className="micro-avatar">{sess.tutor.charAt(0)}</div>
                                                {sess.tutor}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                {sess.mode === 'Online' ? <FiVideo size={14} /> : <FiMapPin size={14} />}
                                                {sess.location}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="session-actions flex gap-3 items-center shrink-0">
                                    <div className="secondary-actions flex gap-2 mr-2 border-r pr-4 border-white-10">
                                        <button className="icon-btn-small tooltip-wrap" title="Message Student" onClick={() => alert(`Messaging ${sess.student}...`)}><FiMessageCircle size={16} /></button>
                                        <button className="icon-btn-small tooltip-wrap" title="Lesson Materials" onClick={() => alert(`Opening materials for ${sess.topic}...`)}><FiFileText size={16} /></button>
                                        <button className="icon-btn-small tooltip-wrap" title="Private Notes" onClick={() => alert(`Opening private notes for ${sess.student}...`)}><FiBookOpen size={16} /></button>
                                    </div>

                                    {sess.status === 'Scheduled' || sess.status === 'Live' ? (
                                        <button
                                            className="btn btn-primary bg-success"
                                            style={{ backgroundColor: 'var(--success-color)', borderColor: 'var(--success-color)' }}
                                            onClick={() => handleMarkAttendance(sess.id)}
                                        >
                                            <FiCheckCircle className="mr-2" /> Mark Attendance
                                        </button>
                                    ) : sess.status === 'Completed' ? (
                                        <button className="btn btn-secondary" onClick={() => alert(`Viewing report for ${sess.student}'s session.`)}>
                                            <FiFileText className="mr-2" /> View Report
                                        </button>
                                    ) : (
                                        <button className="btn btn-secondary opacity-50" disabled>
                                            Cancelled
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Sessions;
