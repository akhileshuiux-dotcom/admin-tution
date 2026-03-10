import { useState, useEffect } from 'react';
import {
    FiChevronLeft, FiChevronRight, FiCalendar, FiVideo, FiMapPin,
    FiCheckCircle, FiClock, FiMessageCircle, FiFileText, FiBookOpen, FiX, FiPlus, FiLink
} from 'react-icons/fi';
import './Sessions.css';
import { useSearch } from '../context/SearchContext';
import api from '../api';


const Sessions = () => {
    // State Management
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tutorsList, setTutorsList] = useState([]);
    const [studentsList, setStudentsList] = useState([]);
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
    const [rescheduleData, setRescheduleData] = useState({ date: '', time: '' });
    const { searchQuery } = useSearch();

    const fetchData = async () => {
        setLoading(true);
        try {
            const [sessRes, tutorsRes, studentsRes] = await Promise.all([
                api.get('/sessions/'),
                api.get('/tutors/'),
                api.get('/students/')
            ]);

            setTutorsList(tutorsRes.data);
            setStudentsList(studentsRes.data);

            const mapped = sessRes.data.map(s => ({
                id: s.id || s._id,
                date: s.scheduledDate,
                startTime: s.scheduledTime,
                endTime: s.endTime || '??:??',
                student: s.studentName,
                subject: s.subject || 'N/A',
                topic: s.topic || 'N/A',
                type: s.type || 'One-on-One',
                mode: s.mode || 'Online',
                location: s.location || (s.mode === 'Online' ? 'Zoom/Meet' : 'Room TBD'),
                tutor: s.tutorName,
                status: s.status,
                googleMeetLink: s.googleMeetLink,
                fullData: s
            }));

            setSessions(mapped);
        } catch (err) {
            console.error("Failed to fetch sessions data:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);


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
        return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
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
        const student = studentsList.find(s => (s.id || s._id).toString() === studentId.toString());
        setNewSessionForm({
            ...newSessionForm,
            studentId: studentId,
            studentName: student.name,
            grade: student.grade || 'N/A'
        });
    };

    const handleFormChange = (e) => {
        setNewSessionForm({ ...newSessionForm, [e.target.name]: e.target.value });
    };

    const handleSaveSession = async () => {
        if (!newSessionForm.studentName || !newSessionForm.date || !newSessionForm.time || !newSessionForm.tutor) {
            alert('Please fill out all the required fields: Student Name, Date, Time, and Assign Tutor.');
            return;
        }

        const payload = {
            student_id: newSessionForm.studentId,
            tutor_id: newSessionForm.tutor, // This should be the ID
            date: newSessionForm.date,
            start_time: newSessionForm.time,
            topic: newSessionForm.topic,
            subject: newSessionForm.topic ? newSessionForm.topic.split(' - ')[0] : 'General',
            status: 'Scheduled',
            mode: 'Online'
        };

        try {
            await api.post('/sessions/', payload);
            fetchData();

            // Auto-navigate
            const [year, month, day] = newSessionForm.date.split('-');
            setCurrentDate(new Date(year, month - 1, day));

            // Reset form
            setNewSessionForm({
                studentId: '', studentName: '', grade: '', tutor: '', date: '', time: '', topic: ''
            });
            setActiveAction(null);
        } catch (err) {
            console.error("Error creating session:", err);
            alert("Failed to save session.");
        }
    };

    // Filter Logic
    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const handleMarkAttendance = async (sessionId) => {
        try {
            await api.patch(`/sessions/${sessionId}/`, { status: 'Completed' });
            setSessions(prev => prev.map(s =>
                s.id === sessionId ? { ...s, status: 'Completed' } : s
            ));
        } catch (err) {
            console.error("Attendance failed:", err);
        }
    };

    const handleCancelSession = async (sessionId) => {
        if (window.confirm('Are you sure you want to cancel this meeting?')) {
            try {
                await api.patch(`/sessions/${sessionId}/`, { status: 'Cancelled' });
                setSessions(prev => prev.map(s =>
                    s.id === sessionId ? { ...s, status: 'Cancelled' } : s
                ));
            } catch (err) {
                console.error("Cancel failed:", err);
            }
        }
    };

    const handleCopyLink = async (link, e) => {
        e.preventDefault();
        e.stopPropagation();
        try {
            if (navigator?.clipboard?.writeText) {
                await navigator.clipboard.writeText(link);
                alert('Meeting link copied to clipboard!');
                return;
            }
            throw new Error('Clipboard API unavailable');
        } catch (err) {
            // Fallback
            const textArea = document.createElement("textarea");
            textArea.value = link;
            textArea.style.position = "fixed";
            textArea.style.top = "0";
            textArea.style.left = "0";
            textArea.style.opacity = "0";
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            try {
                const successful = document.execCommand('copy');
                if (successful) {
                    alert('Meeting link copied to clipboard!');
                } else {
                    alert('Could not copy automatically. Link: ' + link);
                }
            } catch (e) {
                alert('Could not copy automatically. Link: ' + link);
            }
            document.body.removeChild(textArea);
        }
    };

    const handleRescheduleClick = (session) => {
        setRescheduleData({ date: session.date, time: session.startTime });
        setActiveAction({ type: 'reschedule', session });
    };

    const handleSaveReschedule = async () => {
        if (!rescheduleData.date || !rescheduleData.time) {
            alert('Please select both date and time.');
            return;
        }

        try {
            const sessId = activeAction.session.id;
            await api.patch(`/sessions/${sessId}/`, {
                date: rescheduleData.date,
                start_time: rescheduleData.time
            });

            fetchData();

            // Navigate to the new date
            const [year, month, day] = rescheduleData.date.split('-');
            setCurrentDate(new Date(year, month - 1, day));

            setActiveAction(null);
        } catch (err) {
            console.error("Reschedule failed:", err);
        }
    };

    const filteredSessions = sessions.filter(session => {
        const isoCurrentDate = formatISODate(currentDate);
        // Only show matching date for Day/List view initially
        if (session.date !== isoCurrentDate) return false;

        if (filters.tutor !== 'All' && session.tutor !== filters.tutor) return false;
        if (filters.subject !== 'All' && !session.subject.includes(filters.subject)) return false;
        if (filters.mode !== 'All' && session.mode !== filters.mode) return false;
        if (filters.status !== 'All' && session.status !== filters.status) return false;

        // Global search bar
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            const match =
                session.student?.toLowerCase().includes(q) ||
                session.tutor?.toLowerCase().includes(q) ||
                session.subject?.toLowerCase().includes(q) ||
                session.topic?.toLowerCase().includes(q) ||
                session.location?.toLowerCase().includes(q) ||
                session.type?.toLowerCase().includes(q) ||
                session.id?.toString().toLowerCase().includes(q);
            if (!match) return false;
        }

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
                        {tutorsList.map(t => (
                            <option key={t.id} value={t.name}>{t.name}</option>
                        ))}
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
                {loading ? (
                    <div className="flex flex-col items-center justify-center p-20 glass-panel">
                        <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full mb-4"></div>
                        <p className="text-muted">Loading sessions...</p>
                    </div>
                ) : filteredSessions.length === 0 ? (
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
                                            <h3 className="h3 mb-0" style={{ fontSize: '1.2rem' }}>{sess.student || 'Unknown Student'}</h3>
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
                                                <div className="micro-avatar">{(sess.tutor || 'T').charAt(0)}</div>
                                                {sess.tutor || 'Unassigned'}
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
                                        <button className="icon-btn-small tooltip-wrap" title="Reschedule" onClick={() => handleRescheduleClick(sess)}><FiClock size={16} /></button>
                                        <button className="icon-btn-small tooltip-wrap" title="Message Student" onClick={() => setActiveAction({ type: 'message', session: sess })}><FiMessageCircle size={16} /></button>
                                        <button className="icon-btn-small tooltip-wrap" title="Lesson Materials" onClick={() => setActiveAction({ type: 'materials', session: sess })}><FiFileText size={16} /></button>
                                        <button className="icon-btn-small tooltip-wrap" title="Private Notes" onClick={() => setActiveAction({ type: 'notes', session: sess })}><FiBookOpen size={16} /></button>
                                    </div>


                                    {sess.status === 'Scheduled' || sess.status === 'Live' || sess.status === 'Ongoing' ? (
                                        <div className="flex gap-2">
                                            {sess.googleMeetLink && (
                                                <button
                                                    className="btn btn-secondary"
                                                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.875rem' }}
                                                    onClick={(e) => handleCopyLink(sess.googleMeetLink, e)}
                                                >
                                                    <FiLink className="mr-1" /> Copy Link
                                                </button>
                                            )}
                                            <button
                                                className="btn btn-secondary"
                                                style={{ borderColor: 'var(--danger-color)', color: 'var(--danger-color)', padding: '0.4rem 0.8rem', fontSize: '0.875rem' }}
                                                onClick={() => handleCancelSession(sess.id)}
                                            >
                                                <FiX className="mr-1" /> Cancel
                                            </button>
                                            <button
                                                className="btn btn-primary bg-success"
                                                style={{ backgroundColor: 'var(--success-color)', borderColor: 'var(--success-color)' }}
                                                onClick={() => handleMarkAttendance(sess.id)}
                                            >
                                                <FiCheckCircle className="mr-2" /> Mark Attendance
                                            </button>
                                        </div>
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
                                {activeAction.type === 'reschedule' && activeAction.session && `Reschedule: ${activeAction.session.student}`}
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
                            {activeAction.type === 'reschedule' && (
                                <div style={{ textAlign: 'left', color: '#334155', fontSize: '0.95rem' }}>
                                    <div style={{ marginBottom: '16px' }}>
                                        <label style={{ display: 'block', marginBottom: '8px', color: '#64748b', fontSize: '0.85rem' }}>New Date</label>
                                        <input
                                            type="date"
                                            className="form-input"
                                            style={{ width: '100%', backgroundColor: '#f8fafc', color: '#334155', border: '1px solid #cbd5e1' }}
                                            value={rescheduleData.date}
                                            onChange={(e) => setRescheduleData({ ...rescheduleData, date: e.target.value })}
                                        />
                                    </div>
                                    <div style={{ marginBottom: '24px' }}>
                                        <label style={{ display: 'block', marginBottom: '8px', color: '#64748b', fontSize: '0.85rem' }}>New Time</label>
                                        <input
                                            type="time"
                                            className="form-input"
                                            style={{ width: '100%', backgroundColor: '#f8fafc', color: '#334155', border: '1px solid #cbd5e1' }}
                                            value={rescheduleData.time}
                                            onChange={(e) => setRescheduleData({ ...rescheduleData, time: e.target.value })}
                                        />
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                                        <button className="btn btn-secondary" style={{ backgroundColor: 'white', color: '#334155', border: '1px solid #e2e8f0' }} onClick={() => setActiveAction(null)}>Cancel</button>
                                        <button className="btn btn-primary" style={{ backgroundColor: '#3b82f6', color: 'white', border: 'none' }} onClick={handleSaveReschedule}>Update Schedule</button>
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
                                            {studentsList.map(student => (
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
                                                {tutorsList.map(t => (
                                                    <option key={t.id} value={t.id}>{t.name}</option>
                                                ))}
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
