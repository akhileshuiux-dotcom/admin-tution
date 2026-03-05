import { useState } from 'react';
import {
    FiChevronLeft, FiChevronRight, FiCalendar, FiVideo, FiMapPin,
    FiCheckCircle, FiClock, FiMessageCircle, FiFileText, FiBookOpen, FiX, FiPlus
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

const DEMO_STUDENTS = [
    { id: 'STU001', name: 'Alex Johnson', grade: 'Grade 10' },
    { id: 'STU002', name: 'Sarah Smith', grade: 'Grade 11' },
    { id: 'STU003', name: 'Lucas Martinez', grade: 'Grade 12' },
    { id: 'STU004', name: 'Emma Wilson', grade: 'Grade 9' },
    { id: 'STU005', name: 'Michael Brown', grade: 'Grade 10' },
    { id: 'STU006', name: 'Sophia Davis', grade: 'Grade 11' },
    { id: 'STU007', name: 'Oliver Garcia', grade: 'Grade 8' }
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
    const [activeAction, setActiveAction] = useState(null); // { type, session }
    const [newSessionForm, setNewSessionForm] = useState({
        studentId: '',
        studentName: '',
        grade: '',
        tutor: '',
        date: '',
        time: '',
        topic: ''
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

    // Form Logic
    const handleStudentSelect = (e) => {
        const studentId = e.target.value;
        if (!studentId) {
            setNewSessionForm({ ...newSessionForm, studentId: '', studentName: '', grade: '' });
            return;
        }
        const student = DEMO_STUDENTS.find(s => s.id === studentId);
        setNewSessionForm({
            ...newSessionForm,
            studentId: student.id,
            studentName: student.name,
            grade: student.grade
        });
    };

    const handleFormChange = (e) => {
        setNewSessionForm({ ...newSessionForm, [e.target.name]: e.target.value });
    };

    const handleSaveSession = () => {
        if (!newSessionForm.studentName || !newSessionForm.date || !newSessionForm.tutor) {
            alert('Please fill in exactly the required fields (Student, Tutor, Date, Time, Topic)');
            return;
        }

        const newSession = {
            id: `SESS${Math.floor(Math.random() * 10000)}`,
            date: newSessionForm.date,
            startTime: newSessionForm.time || '00:00',
            endTime: '??:??', // Mock end time
            student: newSessionForm.studentName,
            subject: newSessionForm.topic.split(' - ')[0] || newSessionForm.topic,
            topic: newSessionForm.topic.includes(' - ') ? newSessionForm.topic.split(' - ')[1] : newSessionForm.topic,
            type: 'One-on-One',
            mode: 'Online',
            location: 'TBD',
            tutor: newSessionForm.tutor,
            status: 'Scheduled'
        };

        setSessions([...sessions, newSession]);

        // Reset form
        setNewSessionForm({
            studentId: '', studentName: '', grade: '', tutor: '', date: '', time: '', topic: ''
        });
        setActiveAction(null);
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
                <div className="flex items-center gap-4">
                    <div className="view-toggle glass-panel">
                        <button className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`} onClick={() => setViewMode('list')}>List</button>
                        <button className={`toggle-btn ${viewMode === 'day' ? 'active' : ''}`} onClick={() => setViewMode('day')}>Day</button>
                        <button className={`toggle-btn ${viewMode === 'week' ? 'active' : ''}`} onClick={() => setViewMode('week')}>Week</button>
                    </div>
                    <button className="btn btn-primary" style={{ backgroundColor: '#3b82f6', color: 'white', border: 'none' }} onClick={() => setActiveAction({ type: 'add_session', session: null })}>
                        <FiPlus className="mr-2" /> Add Session
                    </button>
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
                                        <button className="icon-btn-small tooltip-wrap" title="Message Student" onClick={() => setActiveAction({ type: 'message', session: sess })}><FiMessageCircle size={16} /></button>
                                        <button className="icon-btn-small tooltip-wrap" title="Lesson Materials" onClick={() => setActiveAction({ type: 'materials', session: sess })}><FiFileText size={16} /></button>
                                        <button className="icon-btn-small tooltip-wrap" title="Private Notes" onClick={() => setActiveAction({ type: 'notes', session: sess })}><FiBookOpen size={16} /></button>
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
                                        <button className="btn btn-secondary" onClick={() => setActiveAction({ type: 'report', session: sess })}>
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

            {/* Action Modal */}
            {activeAction && (
                <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="modal-content animate-fade-in" style={{ width: '100%', maxWidth: '500px', backgroundColor: '#ffffff', color: '#1e293b', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', borderRadius: '16px', padding: '24px' }}>
                        <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h2 className="h2" style={{ margin: 0, color: '#0f172a', fontSize: '1.5rem', fontWeight: '600' }}>
                                {activeAction.type === 'message' && activeAction.session && `Message ${activeAction.session.student}`}
                                {activeAction.type === 'materials' && activeAction.session && `Materials for ${activeAction.session.topic}`}
                                {activeAction.type === 'notes' && activeAction.session && `Private Notes: ${activeAction.session.student}`}
                                {activeAction.type === 'report' && activeAction.session && `Session Report: ${activeAction.session.student}`}
                                {activeAction.type === 'add_session' && `Add New Session`}
                            </h2>
                            <button className="icon-btn" onClick={() => setActiveAction(null)} style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer' }}><FiX size={24} /></button>
                        </div>
                        <div className="modal-body text-center">
                            {activeAction.type === 'message' && (
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <input type="text" className="form-input" style={{ flex: 1, backgroundColor: '#f8fafc', color: '#334155', border: '1px solid #cbd5e1' }} placeholder="Type a message..." />
                                    <button className="btn btn-primary" style={{ backgroundColor: '#3b82f6', color: 'white', border: 'none' }} onClick={() => { alert('Message sent!'); setActiveAction(null); }}>Send</button>
                                </div>
                            )}
                            {activeAction.type === 'materials' && (
                                <div style={{ border: '2px dashed #cbd5e1', borderRadius: '8px', padding: '32px', backgroundColor: '#f8fafc' }}>
                                    <FiFileText size={32} style={{ color: '#94a3b8', margin: '0 auto 12px' }} />
                                    <p style={{ color: '#64748b', marginBottom: '16px' }}>No materials uploaded yet.</p>
                                    <button className="btn btn-secondary" style={{ backgroundColor: 'white', color: '#334155', border: '1px solid #e2e8f0' }}>Upload File</button>
                                </div>
                            )}
                            {activeAction.type === 'notes' && (
                                <div>
                                    <textarea className="form-input" style={{ width: '100%', height: '120px', resize: 'vertical', marginBottom: '12px', backgroundColor: '#f8fafc', color: '#334155', border: '1px solid #cbd5e1' }} placeholder="Write internal notes here..."></textarea>
                                    <button className="btn btn-primary" style={{ backgroundColor: '#3b82f6', color: 'white', border: 'none' }} onClick={() => { alert('Note saved!'); setActiveAction(null); }}>Save Note</button>
                                </div>
                            )}
                            {activeAction.type === 'report' && activeAction.session && (
                                <div style={{ textAlign: 'left', color: '#334155', fontSize: '0.95rem' }}>
                                    <div style={{ marginBottom: '12px' }}><span style={{ color: '#64748b', fontWeight: 600, display: 'inline-block', width: '100px' }}>Status:</span> <span className={`badge-pill ${getStatusClass(activeAction.session.status)}`}>{activeAction.session.status}</span></div>
                                    <div style={{ marginBottom: '12px' }}><span style={{ color: '#64748b', fontWeight: 600, display: 'inline-block', width: '100px' }}>Attendance:</span> <span style={{ color: '#10b981', fontWeight: 500 }}>Present</span></div>
                                    <div style={{ marginBottom: '16px' }}><span style={{ color: '#64748b', fontWeight: 600, display: 'inline-block', width: '100px' }}>Score:</span> 92% (Excellent)</div>
                                    <div style={{ marginBottom: '24px' }}>
                                        <span style={{ color: '#64748b', fontWeight: 600, display: 'block', marginBottom: '8px' }}>Tutor Notes:</span>
                                        <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', color: '#1e293b', lineHeight: '1.5' }}>
                                            Student demonstrated a strong understanding of the core concepts during the session. Highly engaged and solved the advanced problems efficiently!
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                        <button className="btn btn-primary" style={{ backgroundColor: '#3b82f6', color: 'white', border: 'none' }} onClick={() => setActiveAction(null)}>Done</button>
                                    </div>
                                </div>
                            )}
                            {activeAction.type === 'add_session' && (
                                <div style={{ textAlign: 'left', color: '#334155', fontSize: '0.95rem' }}>
                                    <div style={{ marginBottom: '12px' }}>
                                        <label style={{ display: 'block', marginBottom: '4px', color: '#64748b', fontSize: '0.85rem' }}>Student Name</label>
                                        <select
                                            className="form-input"
                                            style={{ width: '100%', backgroundColor: '#f8fafc', color: '#334155', border: '1px solid #cbd5e1' }}
                                            onChange={handleStudentSelect}
                                            value={newSessionForm.studentId}
                                        >
                                            <option value="">Select a student...</option>
                                            {DEMO_STUDENTS.map(student => (
                                                <option key={student.id} value={student.id}>{student.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div style={{ marginBottom: '12px', display: 'flex', gap: '12px' }}>
                                        <div style={{ flex: 1 }}>
                                            <label style={{ display: 'block', marginBottom: '4px', color: '#64748b', fontSize: '0.85rem' }}>Grade / Class</label>
                                            <input
                                                type="text"
                                                name="grade"
                                                className="form-input"
                                                style={{ width: '100%', backgroundColor: '#f8fafc', color: '#334155', border: '1px solid #cbd5e1' }}
                                                placeholder="e.g. Grade 10"
                                                value={newSessionForm.grade}
                                                onChange={handleFormChange}
                                            />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <label style={{ display: 'block', marginBottom: '4px', color: '#64748b', fontSize: '0.85rem' }}>Assign Tutor</label>
                                            <select
                                                name="tutor"
                                                className="form-input"
                                                style={{ width: '100%', backgroundColor: '#f8fafc', color: '#334155', border: '1px solid #cbd5e1' }}
                                                value={newSessionForm.tutor}
                                                onChange={handleFormChange}
                                            >
                                                <option value="">Select Tutor...</option>
                                                <option value="Dr. Emily Chen">Dr. Emily Chen</option>
                                                <option value="James Wilson">James Wilson</option>
                                                <option value="Priya Sharma">Priya Sharma</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div style={{ marginBottom: '12px', display: 'flex', gap: '12px' }}>
                                        <div style={{ flex: 1 }}>
                                            <label style={{ display: 'block', marginBottom: '4px', color: '#64748b', fontSize: '0.85rem' }}>Date</label>
                                            <input
                                                type="date"
                                                name="date"
                                                className="form-input"
                                                style={{ width: '100%', backgroundColor: '#f8fafc', color: '#334155', border: '1px solid #cbd5e1' }}
                                                value={newSessionForm.date}
                                                onChange={handleFormChange}
                                            />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <label style={{ display: 'block', marginBottom: '4px', color: '#64748b', fontSize: '0.85rem' }}>Time</label>
                                            <input
                                                type="time"
                                                name="time"
                                                className="form-input"
                                                style={{ width: '100%', backgroundColor: '#f8fafc', color: '#334155', border: '1px solid #cbd5e1' }}
                                                value={newSessionForm.time}
                                                onChange={handleFormChange}
                                            />
                                        </div>
                                    </div>
                                    <div style={{ marginBottom: '24px' }}>
                                        <label style={{ display: 'block', marginBottom: '4px', color: '#64748b', fontSize: '0.85rem' }}>Subject / Topic</label>
                                        <input
                                            type="text"
                                            name="topic"
                                            className="form-input"
                                            style={{ width: '100%', backgroundColor: '#f8fafc', color: '#334155', border: '1px solid #cbd5e1' }}
                                            placeholder="e.g. Maths - Algebra"
                                            value={newSessionForm.topic}
                                            onChange={handleFormChange}
                                        />
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                                        <button className="btn btn-secondary" style={{ backgroundColor: 'white', color: '#334155', border: '1px solid #e2e8f0' }} onClick={() => setActiveAction(null)}>Cancel</button>
                                        <button className="btn btn-primary" style={{ backgroundColor: '#3b82f6', color: 'white', border: 'none' }} onClick={handleSaveSession}>Save Session</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Sessions;
