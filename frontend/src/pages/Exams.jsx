import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiCalendar, FiBook, FiCheckCircle, FiClock, FiAlertCircle, FiEdit3, FiPlay } from 'react-icons/fi';
import api from '../api';
import PaperBuilder from '../components/Exams/PaperBuilder';
import './Exams.css';

const CATEGORY_COLORS = {
    'Internal': 'blue',
    'Mock': 'purple',
    'School/Board': 'orange'
};

const STATUS_COLORS = {
    'Scheduled': 'status-scheduled',
    'Ongoing': 'status-ongoing',
    'Completed': 'status-completed',
    'Evaluated': 'status-evaluated',
    'Postponed': 'status-postponed'
};

const Exams = () => {
    const navigate = useNavigate();
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');
    const [selectedExam, setSelectedExam] = useState(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isBuilderOpen, setIsBuilderOpen] = useState(false);
    const [activeExamForBuilder, setActiveExamForBuilder] = useState(null);
    const [newExam, setNewExam] = useState({
        name: '', category: 'Internal', date: '', time: '', syllabus: '',
        studentRef: '', tutorRef: '', durationMinutes: 60, bufferTime: 5,
        autoSubmit: true, timerExpiryAction: 'AUTO_SUBMIT'
    });
    const [resultData, setResultData] = useState({ marksObtained: '', totalMarks: '', feedback: '' });
    const [students, setStudents] = useState([]);
    const [tutors, setTutors] = useState([]);
    const [conflict, setConflict] = useState(null);

    useEffect(() => {
        fetchExams();
        fetchInitialData();
    }, []);

    const fetchExams = async () => {
        try {
            const response = await api.get('/exams/');
            setExams(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching exams:', error);
            setLoading(false);
        }
    };

    const fetchInitialData = async () => {
        try {
            const [stdRes, tutRes] = await Promise.all([
                api.get('/students/'),
                api.get('/tutors/')
            ]);
            setStudents(stdRes.data);
            setTutors(tutRes.data);
        } catch (error) {
            console.error('Error fetching initial data:', error);
        }
    };

    const handleCheckConflict = async (date, time, studentId) => {
        if (!date || !time || !studentId) return;
        try {
            const response = await api.get(`/exams/check-conflicts/?date=${date}&time=${time}&studentId=${studentId}`);
            if (response.data.hasConflict) {
                setConflict(response.data.message);
            } else {
                setConflict(null);
            }
        } catch (error) {
            console.error('Conflict check error:', error);
        }
    };

    const handleCreateExam = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                name: newExam.name,
                category: newExam.category,
                date: newExam.date,
                time: newExam.time,
                syllabus: newExam.syllabus,
                student: newExam.studentRef || null,
                tutor: newExam.tutorRef || null,
                duration: newExam.durationMinutes,
                buffer_time: newExam.bufferTime,
                auto_submit: newExam.autoSubmit,
                timer_expiry_action: newExam.timerExpiryAction
            };
            await api.post('/exams/', payload);
            setIsCreateModalOpen(false);
            setNewExam({
                name: '', category: 'Internal', date: '', time: '', syllabus: '',
                studentRef: '', tutorRef: '', durationMinutes: 60, bufferTime: 5,
                autoSubmit: true, timerExpiryAction: 'AUTO_SUBMIT'
            });
            fetchExams();
        } catch (error) {
            console.error('Error creating exam:', error);
            alert('Failed to create exam. Please check all fields.');
        }
    };

    const handleRecordResult = async (e) => {
        e.preventDefault();
        try {
            await api.patch(`/exams/${selectedExam.id}/record-result/`, resultData);
            setSelectedExam(null);
            setResultData({ marksObtained: '', totalMarks: '', feedback: '' });
            fetchExams();
        } catch (error) {
            console.error('Error recording result:', error);
        }
    };

    const handleSavePaper = async (questions) => {
        try {
            await api.post(`/exams/${activeExamForBuilder.id}/add-questions/`, { questions });
            setIsBuilderOpen(false);
            setActiveExamForBuilder(null);
            fetchExams();
        } catch (error) {
            console.error('Error saving paper:', error);
            alert('Failed to save paper structure.');
        }
    };

    const filteredExams = filter === 'All'
        ? exams
        : exams.filter(e => e.category === filter);

    return (
        <div className="exams-page animate-fade-in">
            <div className="page-header">
                <div className="header-info">
                    <h1 className="h1">Exam Schedule</h1>
                    <p className="text-muted">Manage internal assessments and track school exams.</p>
                </div>
                <button className="btn btn-primary" onClick={() => setIsCreateModalOpen(true)}>
                    <FiPlus /> New Exam
                </button>
            </div>

            <div className="filters-bar glass-panel">
                <div className="filter-tabs">
                    {['All', 'Internal', 'Mock', 'School/Board'].map(cat => (
                        <button
                            key={cat}
                            className={`filter-tab ${filter === cat ? 'active' : ''}`}
                            onClick={() => setFilter(cat)}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="loading-state">Loading exams...</div>
            ) : (
                <div className="exams-grid">
                    {filteredExams.length > 0 ? (
                        filteredExams.map(exam => (
                            <div key={exam.id} className="exam-card glass-panel">
                                <div className={`category-tag ${CATEGORY_COLORS[exam.category]}`}>
                                    {exam.category}
                                </div>
                                <div className="exam-card-header">
                                    <h3 className="h3">{exam.examName}</h3>
                                    <span className={`status-badge ${STATUS_COLORS[exam.status]}`}>
                                        {exam.status}
                                    </span>
                                </div>

                                <div className="exam-details">
                                    <div className="detail-item">
                                        <FiCalendar className="icon" />
                                        <span>{exam.date}</span>
                                    </div>
                                    <div className="detail-item">
                                        <FiClock className="icon" />
                                        <span>{exam.time}</span>
                                    </div>
                                    <div className="detail-item">
                                        <FiBook className="icon" />
                                        <span className="truncate">{exam.syllabus || 'No syllabus specified'}</span>
                                    </div>
                                    {exam.status === 'Evaluated' && (
                                        <div className="detail-item result-preview">
                                            <FiCheckCircle className="icon success" />
                                            <span>Score: <strong>{exam.marksObtained}/{exam.totalMarks}</strong></span>
                                        </div>
                                    )}
                                </div>

                                <div className="exam-footer">
                                    <div className="proctor-info">
                                        <div className="avatar-xs">
                                            {exam.tutorRef ? 'T' : 'N'}
                                        </div>
                                        <span className="text-muted">Proctor Assigned</span>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button
                                            className="btn btn-secondary btn-sm"
                                            onClick={() => {
                                                setActiveExamForBuilder(exam);
                                                setIsBuilderOpen(true);
                                            }}
                                        >
                                            <FiBook /> Paper
                                        </button>
                                        <button
                                            className="btn btn-primary btn-sm"
                                            onClick={() => {
                                                setSelectedExam(exam);
                                                if (exam.status === 'Evaluated') {
                                                    setResultData({
                                                        marksObtained: exam.marksObtained,
                                                        totalMarks: exam.totalMarks,
                                                        feedback: exam.feedback
                                                    });
                                                }
                                            }}
                                        >
                                            <FiEdit3 /> {exam.status === 'Evaluated' ? 'View Result' : 'Update'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="empty-state glass-panel">
                            <FiAlertCircle size={48} className="text-muted" />
                            <h3 className="h3">No exams found</h3>
                            <p className="text-muted">Try changing the filter or create a new exam schedule.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Create Exam Modal */}
            {isCreateModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content glass-panel animate-fade-in">
                        <h2 className="h2">Schedule New Exam</h2>
                        <form onSubmit={handleCreateExam} className="multi-step-form">
                            <div className="form-grid">
                                <div className="form-group">
                                    <label className="form-label">Exam Name</label>
                                    <input
                                        type="text" className="form-input" required
                                        placeholder="e.g. Unit Test 1 - Physics"
                                        value={newExam.name}
                                        onChange={e => setNewExam({ ...newExam, name: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Category</label>
                                    <select
                                        className="form-select"
                                        value={newExam.category}
                                        onChange={e => setNewExam({ ...newExam, category: e.target.value })}
                                    >
                                        <option value="Internal">Internal</option>
                                        <option value="Mock">Mock</option>
                                        <option value="School/Board">School/Board</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Date</label>
                                    <input
                                        type="date" className="form-input" required
                                        value={newExam.date}
                                        onChange={e => {
                                            setNewExam({ ...newExam, date: e.target.value });
                                            handleCheckConflict(e.target.value, newExam.time, newExam.studentRef);
                                        }}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Time</label>
                                    <input
                                        type="time" className="form-input" required
                                        value={newExam.time}
                                        onChange={e => {
                                            setNewExam({ ...newExam, time: e.target.value });
                                            handleCheckConflict(newExam.date, e.target.value, newExam.studentRef);
                                        }}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Student</label>
                                    <select
                                        className="form-select"
                                        value={newExam.studentRef}
                                        onChange={e => {
                                            setNewExam({ ...newExam, studentRef: e.target.value });
                                            handleCheckConflict(newExam.date, newExam.time, e.target.value);
                                        }}
                                    >
                                        <option value="">Select Student (Optional)</option>
                                        {students.map(s => <option key={s.id} value={s.id}>{s.fullName}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Proctor (Tutor)</label>
                                    <select
                                        className="form-select"
                                        value={newExam.tutorRef}
                                        onChange={e => setNewExam({ ...newExam, tutorRef: e.target.value })}
                                    >
                                        <option value="">Assign Proctor (Optional)</option>
                                        {tutors.map(t => <option key={t.id} value={t.id}>{t.user || 'Unknown Tutor'}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Duration (Mins)</label>
                                    <input
                                        type="number" className="form-input" required
                                        value={newExam.durationMinutes}
                                        onChange={e => setNewExam({ ...newExam, durationMinutes: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Timer Expiry</label>
                                    <select
                                        className="form-select"
                                        value={newExam.timerExpiryAction}
                                        onChange={e => setNewExam({ ...newExam, timerExpiryAction: e.target.value })}
                                    >
                                        <option value="AUTO_SUBMIT">Auto-submit</option>
                                        <option value="ALLOW_OVERTIME">Allow Overtime</option>
                                    </select>
                                </div>
                                <div className="form-group full-width">
                                    <label className="form-label">Syllabus Details</label>
                                    <textarea
                                        className="form-input" rows="3"
                                        placeholder="Specific chapters or topics covered..."
                                        value={newExam.syllabus}
                                        onChange={e => setNewExam({ ...newExam, syllabus: e.target.value })}
                                    />
                                </div>
                            </div>

                            {conflict && (
                                <div className="conflict-warning">
                                    <FiAlertCircle /> <span>{conflict}</span>
                                </div>
                            )}

                            <div className="modal-actions">
                                <button type="button" className="btn btn-secondary" onClick={() => setIsCreateModalOpen(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Create Schedule</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Update Result Modal */}
            {selectedExam && (
                <div className="modal-overlay">
                    <div className="modal-content glass-panel animate-fade-in">
                        <h2 className="h2">{selectedExam.status === 'Evaluated' ? 'View Result' : 'Enter Exam Results'}</h2>
                        <form onSubmit={handleRecordResult} className="multi-step-form">
                            <div className="form-grid">
                                <div className="form-group">
                                    <label className="form-label">Marks Obtained</label>
                                    <input
                                        type="number" className="form-input" required
                                        value={resultData.marksObtained}
                                        readOnly={selectedExam.status === 'Evaluated'}
                                        onChange={e => setResultData({ ...resultData, marksObtained: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Total Marks</label>
                                    <input
                                        type="number" className="form-input" required
                                        value={resultData.totalMarks}
                                        readOnly={selectedExam.status === 'Evaluated'}
                                        onChange={e => setResultData({ ...resultData, totalMarks: e.target.value })}
                                    />
                                </div>
                                <div className="form-group full-width">
                                    <label className="form-label">Feedback & Observations</label>
                                    <textarea
                                        className="form-input" rows="4"
                                        placeholder="Tutor's feedback on performance..."
                                        value={resultData.feedback}
                                        readOnly={selectedExam.status === 'Evaluated'}
                                        onChange={e => setResultData({ ...resultData, feedback: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="btn btn-secondary" onClick={() => setSelectedExam(null)}>Close</button>
                                {selectedExam.status !== 'Evaluated' && (
                                    <button type="submit" className="btn btn-primary">Save Evaluation</button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Paper Builder Modal */}
            {isBuilderOpen && (
                <div className="modal-overlay">
                    <div className="modal-content builder-modal glass-panel">
                        <PaperBuilder
                            exam={activeExamForBuilder}
                            onSave={handleSavePaper}
                            onCancel={() => {
                                setIsBuilderOpen(false);
                                setActiveExamForBuilder(null);
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default Exams;
