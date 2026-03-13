import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiClock, FiAlertCircle, FiCheckCircle, FiChevronLeft, FiChevronRight, FiUpload } from 'react-icons/fi';
import api from '../api';
import './LiveExam.css';

const LiveExam = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [exam, setExam] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
    const [answers, setAnswers] = useState({});
    const [timeLeft, setTimeLeft] = useState(0);
    const [showConfirm, setShowConfirm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const timerRef = useRef(null);

    useEffect(() => {
        fetchExam();
        return () => clearInterval(timerRef.current);
    }, [id]);

    const fetchExam = async () => {
        try {
            const response = await api.get(`/exams/${id}/`);
            setExam(response.data);
            setTimeLeft(response.data.durationMinutes * 60);
            startTimer();
            setLoading(false);
        } catch (error) {
            console.error('Error fetching exam:', error);
            navigate('/exams');
        }
    };

    const startTimer = () => {
        timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timerRef.current);
                    handleAutoSubmit();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const handleAutoSubmit = () => {
        if (exam?.autoSubmit) {
            submitExam();
        } else {
            alert('Time is up! Please submit your exam.');
        }
    };

    const submitExam = async () => {
        setSubmitting(true);
        try {
            await api.post(`/exams/${id}/submit-exam/`, { answers });
            navigate(`/exams`);
        } catch (error) {
            console.error('Error submitting exam:', error);
            alert('Failed to submit exam. Please try again.');
        } finally {
            setSubmitting(false);
            setShowConfirm(false);
        }
    };

    const formatTime = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    if (loading) return <div className="loading-state">Loading Exam...</div>;

    if (!exam.questions || exam.questions.length === 0) {
        return (
            <div className="live-exam-page animate-fade-in">
                <div className="exam-header glass-panel sticky-top">
                    <h2 className="h2">{exam.examName}</h2>
                    <button className="btn btn-secondary" onClick={() => navigate('/exams')}>Exit</button>
                </div>
                <div className="exam-main">
                    <div className="question-card glass-panel empty-state">
                        <FiAlertCircle size={48} className="text-warning" />
                        <h3 className="h3">No questions found for this exam.</h3>
                        <p className="text-muted">Please contact your manager to set up the questions.</p>
                    </div>
                </div>
            </div>
        );
    }

    const currentQ = exam.questions[currentQuestionIdx];

    return (
        <div className="live-exam-page animate-fade-in">
            <div className="exam-header glass-panel sticky-top">
                <div className="exam-info">
                    <h2 className="h2">{exam.examName}</h2>
                    <span className="text-muted">Question {currentQuestionIdx + 1} of {exam.questions.length}</span>
                </div>
                <div className={`timer-box ${timeLeft < 300 ? 'timer-warning' : ''}`}>
                    <FiClock />
                    <span className="timer-text">{formatTime(timeLeft)}</span>
                </div>
                <button className="btn btn-primary" onClick={() => setShowConfirm(true)}>
                    Submit Exam
                </button>
            </div>

            <div className="exam-main">
                <div className="question-card glass-panel">
                    <div className="question-text-area">
                        <span className="question-number">Q{currentQuestionIdx + 1}.</span>
                        <div className="question-text">{currentQ.text}</div>
                        {currentQ.marks && <span className="marks-badge">{currentQ.marks} Marks</span>}
                    </div>

                    <div className="answer-area">
                        {currentQ.question_type === 'MCQ' && (
                            <div className="mcq-input-group">
                                {currentQ.payload.options.map((opt, idx) => (
                                    <label key={idx} className={`mcq-option ${answers[currentQ.id] === idx.toString() ? 'selected' : ''}`}>
                                        <input
                                            type="radio"
                                            name={`q-${currentQ.id}`}
                                            value={idx}
                                            checked={answers[currentQ.id] === idx.toString()}
                                            onChange={e => setAnswers({ ...answers, [currentQ.id]: e.target.value })}
                                        />
                                        <span className="option-label">{String.fromCharCode(65 + idx)}</span>
                                        <span className="option-text">{opt}</span>
                                    </label>
                                ))}
                            </div>
                        )}

                        {currentQ.question_type === 'SHORT' && (
                            <textarea
                                className="form-input"
                                rows="4"
                                maxLength="250"
                                placeholder="Enter your answer (max 250 characters)..."
                                value={answers[currentQ.id] || ''}
                                onChange={e => setAnswers({ ...answers, [currentQ.id]: e.target.value })}
                            />
                        )}

                        {currentQ.question_type === 'LONG' && (
                            <div className="long-test-input">
                                <textarea
                                    className="form-input"
                                    rows="10"
                                    placeholder="Type your detailed answer or upload a file..."
                                    value={answers[currentQ.id] || ''}
                                    onChange={e => setAnswers({ ...answers, [currentQ.id]: e.target.value })}
                                />
                                <div className="file-upload-zone">
                                    <FiUpload /> <span>Upload Answer Sheet (PDF/Image)</span>
                                </div>
                            </div>
                        )}

                        {currentQ.question_type === 'YES_NO' && (
                            <div className="yes-no-group">
                                <button
                                    className={`btn ${answers[currentQ.id] === 'YES' ? 'btn-primary' : 'btn-outline'}`}
                                    onClick={() => setAnswers({ ...answers, [currentQ.id]: 'YES' })}
                                >
                                    Yes
                                </button>
                                <button
                                    className={`btn ${answers[currentQ.id] === 'NO' ? 'btn-primary' : 'btn-outline'}`}
                                    onClick={() => setAnswers({ ...answers, [currentQ.id]: 'NO' })}
                                >
                                    No
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="exam-navigation glass-panel sticky-bottom">
                <button
                    className="btn btn-secondary"
                    disabled={currentQuestionIdx === 0}
                    onClick={() => setCurrentQuestionIdx(prev => prev - 1)}
                >
                    <FiChevronLeft /> Previous
                </button>

                <div className="question-nav-dots">
                    {exam.questions.map((_, idx) => (
                        <div
                            key={idx}
                            className={`nav-dot ${idx === currentQuestionIdx ? 'active' : ''} ${answers[exam.questions[idx].id] ? 'answered' : ''}`}
                            onClick={() => setCurrentQuestionIdx(idx)}
                        />
                    ))}
                </div>

                {currentQuestionIdx === exam.questions.length - 1 ? (
                    <button
                        className="btn btn-primary"
                        style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                        onClick={() => setShowConfirm(true)}
                    >
                        Submit Exam <FiCheckCircle />
                    </button>
                ) : (
                    <button
                        className="btn btn-secondary"
                        onClick={() => setCurrentQuestionIdx(prev => prev + 1)}
                    >
                        Next <FiChevronRight />
                    </button>
                )}
            </div>

            {/* Custom Confirm Modal */}
            {showConfirm && (
                <div className="modal-overlay" style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
                    <div className="animate-fade-in" style={{ background: 'white', padding: '30px', borderRadius: '15px', maxWidth: '400px', width: '90%', textAlign: 'center', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
                        <FiAlertCircle size={48} color="#eab308" style={{ marginBottom: '15px' }} />
                        <h3 style={{ margin: '0 0 10px 0', fontSize: '1.25rem', color: '#1e293b' }}>Submit Exam?</h3>
                        <p style={{ margin: '0 0 24px 0', color: '#64748b' }}>Are you sure you want to finish and submit the exam? You will not be able to change your answers.</p>
                        <div style={{ display: 'flex', gap: '15px' }}>
                            <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowConfirm(false)} disabled={submitting}>Cancel</button>
                            <button className="btn btn-primary" style={{ flex: 1, background: '#2563eb', color: 'white' }} onClick={submitExam} disabled={submitting}>
                                {submitting ? 'Submitting...' : 'Yes, Submit'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LiveExam;
