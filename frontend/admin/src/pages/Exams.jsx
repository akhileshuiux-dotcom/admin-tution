import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiCalendar, FiBook, FiCheckCircle, FiClock, FiAlertCircle, FiEdit3, FiPlay, FiSearch, FiLayers, FiTrendingUp, FiAward, FiActivity } from 'react-icons/fi';
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
    'Cancelled': 'status-cancelled',
    'Postponed': 'status-postponed'
};

const Exams = () => {
    const navigate = useNavigate();
    const [viewMode, setViewMode] = useState('schedules'); // 'schedules' or 'results'
    const [groupBy, setGroupBy] = useState('none'); // 'none', 'class', 'exam'
    const [searchQuery, setSearchQuery] = useState('');
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');
    const [selectedExam, setSelectedExam] = useState(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isBuilderOpen, setIsBuilderOpen] = useState(false);
    const [activeExamForBuilder, setActiveExamForBuilder] = useState(null);
    const [newExam, setNewExam] = useState({
        name: '', className: '', category: 'Internal', date: '', time: '', syllabus: '',
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
            const response = await api.get('exams/');
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
                api.get('students/'),
                api.get('tutors/')
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
                class_name: newExam.className,
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
            await api.post('exams/', payload);
            setIsCreateModalOpen(false);
            setNewExam({
                name: '', className: '', category: 'Internal', date: '', time: '', syllabus: '',
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

    const handleAutoAllocate = () => {
        // Simple logic: pick the first available tutor for simplicity
        if (tutors.length > 0 && !newExam.tutorRef) {
            setNewExam(prev => ({ ...prev, tutorRef: tutors[0].id }));
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

    const [resultView, setResultView] = useState('list'); // 'list' or 'students'
    const [classFilter, setClassFilter] = useState('All');
    const [categoryFilter, setCategoryFilter] = useState('All');

    useEffect(() => {
        fetchExams();
        fetchInitialData();
    }, []);

    // ... (fetch logic remains same)

    const filteredExams = exams.filter(e => {
        const catMatch = categoryFilter === 'All' || e.category === categoryFilter;
        const classMatch = classFilter === 'All' || e.className === classFilter;
        return catMatch && classMatch;
    });

    const searchedResults = filteredExams.filter(exam => {
        const student = students.find(s => s.id === exam.studentRef);
        const searchText = `${exam.name || exam.examName} ${student?.fullName || 'All Class'} ${exam.className}`.toLowerCase();
        return searchText.includes(searchQuery.toLowerCase());
    });

    const getPerformanceStats = () => {
        const evaluated = exams.filter(e => e.status === 'Evaluated');
        if (evaluated.length === 0) return { avg: 0, count: 0, top: 'N/A', passRate: 0 };
        
        const totalPct = evaluated.reduce((acc, curr) => acc + (curr.marksObtained / curr.totalMarks), 0);
        const avg = (totalPct / evaluated.length) * 100;
        
        const passes = evaluated.filter(e => (e.marksObtained / e.totalMarks) >= 0.4).length;
        const passRate = (passes / evaluated.length) * 100;

        // Simple top performer logic
        const studentScores = {};
        evaluated.forEach(e => {
            if (e.studentRef) {
                studentScores[e.studentRef] = (studentScores[e.studentRef] || 0) + (e.marksObtained / e.totalMarks);
            }
        });
        
        let topStudent = 'N/A';
        let maxScore = -1;
        Object.entries(studentScores).forEach(([id, score]) => {
            if (score > maxScore) {
                maxScore = score;
                topStudent = students.find(s => s.id === id)?.fullName || 'N/A';
            }
        });

        return { 
            avg: avg.toFixed(1), 
            count: evaluated.length, 
            top: topStudent,
            passRate: passRate.toFixed(1)
        };
    };

    const stats = getPerformanceStats();

    const getStudentCentricResults = () => {
        const studentMap = {};
        searchedResults.forEach(exam => {
            if (!exam.studentRef) return;
            if (!studentMap[exam.studentRef]) {
                const s = students.find(std => std.id === exam.studentRef);
                studentMap[exam.studentRef] = {
                    student: s,
                    exams: [],
                    totalMarks: 0,
                    earnedMarks: 0
                };
            }
            studentMap[exam.studentRef].exams.push(exam);
            if (exam.status === 'Evaluated') {
                studentMap[exam.studentRef].totalMarks += Number(exam.totalMarks);
                studentMap[exam.studentRef].earnedMarks += Number(exam.marksObtained);
            }
        });
        return Object.values(studentMap);
    };

    const getGroupedResults = () => {
        if (groupBy === 'none') return searchedResults;
        
        const groups = {};
        searchedResults.forEach(exam => {
            const key = groupBy === 'class' ? (exam.className || 'No Class') : (exam.name || exam.examName);
            if (!groups[key]) groups[key] = [];
            groups[key].push(exam);
        });
        return groups;
    };

    const availableClasses = [...new Set(exams.map(e => e.className).filter(Boolean))];

    return (
        <div className="exams-page animate-fade-in">
            <div className="page-header">
                <div className="header-info">
                    <h1 className="h1">Exam Protocol</h1>
                    <p className="text-muted">Intelligence dashboard for assessment and evaluation.</p>
                </div>
                <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
                    <div className="view-toggle glass-panel">
                        <button 
                            className={`toggle-btn ${viewMode === 'schedules' ? 'active' : ''}`}
                            onClick={() => setViewMode('schedules')}
                        >
                            Schedules
                        </button>
                        <button 
                            className={`toggle-btn ${viewMode === 'results' ? 'active' : ''}`}
                            onClick={() => setViewMode('results')}
                        >
                            Results
                        </button>
                    </div>
                    <button className="btn btn-primary" onClick={() => setIsCreateModalOpen(true)}>
                        <FiPlus /> New Exam
                    </button>
                </div>
            </div>

            <div className="filters-bar glass-panel">
                <div className="filter-group">
                    <label className="filter-label">Category</label>
                    <select 
                        className="futuristic-select" 
                        value={categoryFilter} 
                        onChange={(e) => setCategoryFilter(e.target.value)}
                    >
                        <option value="All">All Categories</option>
                        <option value="Internal">Internal</option>
                        <option value="Mock">Mock</option>
                        <option value="School/Board">School/Board</option>
                    </select>
                </div>
                <div className="filter-group">
                    <label className="filter-label">Class</label>
                    <select 
                        className="futuristic-select" 
                        value={classFilter} 
                        onChange={(e) => setClassFilter(e.target.value)}
                    >
                        <option value="All">All Classes</option>
                        {availableClasses.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="loading-state futuristic-loader">
                    <div className="orbit-spinner">
                        <div className="orbit"></div>
                        <div className="orbit"></div>
                        <div className="orbit"></div>
                    </div>
                    <span>Initializing Exam Protocol...</span>
                </div>
            ) : viewMode === 'schedules' ? (
                <div className="exams-grid futuristic-grid">
                    {filteredExams.length > 0 ? (
                        filteredExams.map(exam => (
                            <div key={exam.id} className="exam-card-futuristic glass-panel animate-slide-up">
                                <div className={`category-aura ${CATEGORY_COLORS[exam.category]}`}>
                                    {exam.category}
                                </div>
                                <div className="card-header-v2">
                                    <h3 className="h3-glamour">{exam.examName}</h3>
                                    {exam.className && <span className="class-tag-v2">{exam.className}</span>}
                                </div>

                                <div className="exam-details-v2">
                                    <div className="detail-item-v2">
                                        <FiCalendar className="icon-glow" />
                                        <span>{exam.date}</span>
                                    </div>
                                    <div className="detail-item-v2">
                                        <FiClock className="icon-glow" />
                                        <span>{exam.time}</span>
                                    </div>
                                    {exam.status === 'Evaluated' && (
                                        <div className="score-preview-aura">
                                            <FiActivity className="icon-glow" />
                                            <span>Score: <strong>{exam.marksObtained}/{exam.totalMarks}</strong></span>
                                        </div>
                                    )}
                                </div>

                                <div className="exam-footer-v2">
                                    <div className="status-pill-aura">
                                        <span className={`status-dot ${STATUS_COLORS[exam.status].replace('status-', '')}`}></span>
                                        <span className="text-xs uppercase font-bold">{exam.status}</span>
                                    </div>
                                    <div className="action-hub">
                                        <button
                                            className="btn-glow btn-sm"
                                            onClick={() => {
                                                setActiveExamForBuilder(exam);
                                                setIsBuilderOpen(true);
                                            }}
                                        >
                                            <FiBook /> Paper
                                        </button>
                                        <button
                                            className="btn-primary-glow btn-sm"
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
                                            <FiEdit3 /> {exam.status === 'Evaluated' ? 'Review' : 'Update'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="empty-state-futuristic glass-panel">
                            <FiActivity size={64} className="pulse-icon" />
                            <h3 className="h2">Database Inert</h3>
                            <p className="text-dim">No transmission records found for this category.</p>
                        </div>
                    )}
                </div>
            ) : (
                <div className="results-container futuristic-aura animate-fade-in">
                    <div className="stats-dashboard">
                        <div className="futuristic-card stats-glance">
                            <div className="stat-icon-aura blue">
                                <FiActivity />
                            </div>
                            <div className="stat-info">
                                <span className="stat-label">Evaluated</span>
                                <span className="stat-value">{stats.count}</span>
                            </div>
                        </div>
                        <div className="futuristic-card stats-glance">
                            <div className="stat-icon-aura purple">
                                <FiAward />
                            </div>
                            <div className="stat-info">
                                <span className="stat-label">Avg Accuracy</span>
                                <span className="stat-value">{stats.avg}%</span>
                            </div>
                            <div className="stat-progress-glow" style={{ width: `${stats.avg}%` }}></div>
                        </div>
                        <div className="futuristic-card stats-glance">
                            <div className="stat-icon-aura green">
                                <FiCheckCircle />
                            </div>
                            <div className="stat-info">
                                <span className="stat-label">Pass Rate</span>
                                <span className="stat-value">{stats.passRate}%</span>
                            </div>
                        </div>
                        <div className="futuristic-card stats-glance">
                            <div className="stat-icon-aura orange">
                                <FiTrendingUp />
                            </div>
                            <div className="stat-info">
                                <span className="stat-label">Top Performer</span>
                                <span className="stat-value truncate-stat">{stats.top}</span>
                            </div>
                        </div>
                    </div>

                    <div className="modern-controls glass-panel">
                        <div className="view-switcher-pill">
                            <button 
                                className={`switch-btn ${resultView === 'list' ? 'active' : ''}`}
                                onClick={() => setResultView('list')}
                            >
                                Exam List
                            </button>
                            <button 
                                className={`switch-btn ${resultView === 'students' ? 'active' : ''}`}
                                onClick={() => setResultView('students')}
                            >
                                Students
                            </button>
                        </div>

                        <div className="glow-search">
                            <FiSearch className="search-icon" />
                            <input 
                                type="text" 
                                placeholder={resultView === 'list' ? "Search student or exam..." : "Search student..."}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="futuristic-input"
                            />
                        </div>

                        {resultView === 'list' && (
                            <div className="segmented-control">
                                <FiLayers className="control-icon" />
                                <div className="segments">
                                    {['none', 'class', 'exam'].map(mode => (
                                        <button 
                                            key={mode}
                                            className={`segment-btn ${groupBy === mode ? 'active' : ''}`}
                                            onClick={() => setGroupBy(mode)}
                                        >
                                            {mode.charAt(0).toUpperCase() + mode.slice(1)}
                                        </button>
                                    ))}
                                    <div className={`segment-slider ${groupBy}`} />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="results-canvas glass-panel">
                        {resultView === 'list' ? (
                            groupBy === 'none' ? (
                                <div className="table-responsive">
                                    <table className="futuristic-table">
                                        <thead>
                                            <tr>
                                                <th>Subject Identity</th>
                                                <th>Examination</th>
                                                <th>Timestamp</th>
                                                <th>Grade</th>
                                                <th>Performance</th>
                                                <th>Status</th>
                                                <th className="text-right">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {searchedResults.map(exam => {
                                                const student = students.find(s => s.id === exam.studentRef);
                                                const scorePct = exam.status === 'Evaluated' ? (exam.marksObtained / exam.totalMarks) * 100 : 0;
                                                const scoreTone = scorePct >= 80 ? 'vibrant-success' : scorePct >= 50 ? 'vibrant-warning' : 'vibrant-danger';

                                                return (
                                                    <tr key={exam.id} className="futuristic-row">
                                                        <td>
                                                            <div className="identity-block">
                                                                <div className="avatar-aura">
                                                                    {student ? student.fullName.charAt(0) : '?'}
                                                                </div>
                                                                <div className="identity-meta">
                                                                    <span className="name-glamour">{student ? student.fullName : 'All Class'}</span>
                                                                    <span className="id-sub">{exam.category}</span>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td><span className="exam-glamour">{exam.name || exam.examName || 'Standard Exam'}</span></td>
                                                        <td className="text-dim">{exam.date}</td>
                                                        <td><span className="grade-badge">{exam.className || 'N/A'}</span></td>
                                                        <td>
                                                            {exam.status === 'Evaluated' ? (
                                                                <div className={`score-glow-pill ${scoreTone}`}>
                                                                    {exam.marksObtained} / {exam.totalMarks}
                                                                </div>
                                                            ) : (
                                                                <span className="text-dim italic">Awaiting</span>
                                                            )}
                                                        </td>
                                                        <td>
                                                            <span className={`futuristic-badge-v2 ${STATUS_COLORS[exam.status].replace('status-', '')}`}>
                                                                {exam.status}
                                                            </span>
                                                        </td>
                                                        <td className="text-right">
                                                            <button 
                                                                className="btn-glow-icon"
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
                                                                <FiEdit3 />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="grouped-canvas">
                                    {Object.entries(getGroupedResults()).map(([groupName, items]) => (
                                        <div key={groupName} className="canvas-group animate-slide-up">
                                            <div className="canvas-group-header">
                                                <h4 className="h4-futuristic">{groupName}</h4>
                                                <span className="group-count">{items.length} Entries</span>
                                            </div>
                                            <div className="canvas-group-grid">
                                                {items.map(exam => {
                                                    const student = students.find(s => s.id === exam.studentRef);
                                                    return (
                                                        <div key={exam.id} className="futuristic-compact-card glass-panel" onClick={() => setSelectedExam(exam)}>
                                                            <div className="compact-aura" />
                                                            <div className="compact-info">
                                                                <span className="compact-title">{student ? student.fullName : 'All Class'}</span>
                                                                <span className="compact-sub">{exam.date}</span>
                                                            </div>
                                                            <div className="compact-metric">
                                                                {exam.status === 'Evaluated' ? (
                                                                    <span className="metric-value">{exam.marksObtained}/{exam.totalMarks}</span>
                                                                ) : (
                                                                    <span className="metric-pending">Pending</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )
                        ) : (
                            <div className="student-centric-canvas">
                                <div className="table-responsive">
                                    <table className="futuristic-table">
                                        <thead>
                                            <tr>
                                                <th>Student</th>
                                                <th>Class</th>
                                                <th>Assessed Exams</th>
                                                <th>Total Progress</th>
                                                <th>Performance Score</th>
                                                <th className="text-right">Overall Rank</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {getStudentCentricResults().map((data, idx) => {
                                                const avgPct = data.totalMarks > 0 ? (data.earnedMarks / data.totalMarks) * 100 : 0;
                                                const tone = avgPct >= 80 ? 'vibrant-success' : avgPct >= 50 ? 'vibrant-warning' : 'vibrant-danger';
                                                return (
                                                    <tr key={data.student?.id || idx} className="futuristic-row">
                                                        <td>
                                                            <div className="identity-block">
                                                                <div className="avatar-aura">
                                                                    {data.student?.fullName?.charAt(0) || '?'}
                                                                </div>
                                                                <div className="identity-meta">
                                                                    <span className="name-glamour">{data.student?.fullName || 'Unknown Student'}</span>
                                                                    <span className="id-sub">{data.exams.length} Exams Recorded</span>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td><span className="grade-badge">{data.student?.className || 'N/A'}</span></td>
                                                        <td>
                                                            <div className="mini-exam-tags">
                                                                {data.exams.slice(0, 3).map(ex => (
                                                                    <span key={ex.id} className="mini-tag">{ex.name || ex.examName}</span>
                                                                ))}
                                                                {data.exams.length > 3 && <span className="mini-tag">+{data.exams.length - 3} more</span>}
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <div className="progress-bar-aura">
                                                                <div className={`progress-fill ${tone}`} style={{ width: `${avgPct}%` }} />
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <div className={`score-glow-pill ${tone}`}>
                                                                {avgPct.toFixed(1)}%
                                                            </div>
                                                        </td>
                                                        <td className="text-right">
                                                            <span className="rank-badge">#{idx + 1}</span>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
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
                                    <label className="form-label">Class</label>
                                    <input
                                        type="text" className="form-input"
                                        placeholder="e.g. 10-A"
                                        value={newExam.className}
                                        onChange={e => setNewExam({ ...newExam, className: e.target.value })}
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
