import { useState } from 'react';
import { FiPlus, FiTrash2, FiImage, FiCheck, FiX, FiMove } from 'react-icons/fi';
import './PaperBuilder.css';

const PaperBuilder = ({ exam, onSave, onCancel }) => {
    const [questions, setQuestions] = useState(exam.questions || []);

    const addQuestion = (type) => {
        const newQ = {
            id: Date.now(), // Temp local ID
            question_type: type,
            text: '',
            marks: 1,
            order: questions.length,
            payload: type === 'MCQ' ? { options: ['', '', '', ''], correct_answer: '' } :
                type === 'YES_NO' ? { correct_answer: 'Yes' } : {}
        };
        setQuestions([...questions, newQ]);
    };

    const removeQuestion = (index) => {
        const updated = questions.filter((_, i) => i !== index);
        setQuestions(updated.map((q, i) => ({ ...q, order: i })));
    };

    const updateQuestion = (index, field, value) => {
        const updated = [...questions];
        updated[index] = { ...updated[index], [field]: value };
        setQuestions(updated);
    };

    const updatePayload = (index, field, value) => {
        const updated = [...questions];
        updated[index].payload = { ...updated[index].payload, [field]: value };
        setQuestions(updated);
    };

    const handleSave = () => {
        onSave(questions);
    };

    return (
        <div className="paper-builder-container">
            <div className="builder-header">
                <h2 className="h2">Paper Builder: {exam.examName}</h2>
                <div className="total-marks-badge">
                    Total Marks: {questions.reduce((sum, q) => sum + parseInt(q.marks || 0), 0)}
                </div>
            </div>

            <div className="questions-list">
                {questions.map((q, index) => (
                    <div key={q.id || index} className="question-item glass-panel">
                        <div className="question-type-indicator">
                            <FiMove className="drag-handle" />
                            <span className={`type-tag ${q.question_type.toLowerCase()}`}>
                                {q.question_type}
                            </span>
                        </div>

                        <div className="question-content">
                            <textarea
                                className="form-input"
                                placeholder="Enter question text..."
                                value={q.text}
                                onChange={e => updateQuestion(index, 'text', e.target.value)}
                            />

                            <div className="question-meta">
                                <div className="form-group-inline">
                                    <label>Marks</label>
                                    <input
                                        type="number" className="form-input-sm"
                                        value={q.marks}
                                        onChange={e => updateQuestion(index, 'marks', e.target.value)}
                                    />
                                </div>
                                <button className="btn-icon text-muted"> <FiImage /> </button>
                            </div>

                            {/* Type Specific Fields */}
                            {q.question_type === 'MCQ' && (
                                <div className="mcq-options">
                                    {q.payload.options.map((opt, optIdx) => (
                                        <div key={optIdx} className="mcq-option-row">
                                            <input
                                                type="radio"
                                                name={`correct-${index}`}
                                                checked={q.payload.correct_answer === optIdx.toString()}
                                                onChange={() => updatePayload(index, 'correct_answer', optIdx.toString())}
                                            />
                                            <input
                                                type="text" className="form-input-sm"
                                                placeholder={`Option ${String.fromCharCode(65 + optIdx)}`}
                                                value={opt}
                                                onChange={e => {
                                                    const newOpts = [...q.payload.options];
                                                    newOpts[optIdx] = e.target.value;
                                                    updatePayload(index, 'options', newOpts);
                                                }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}

                            {q.question_type === 'SHORT' && (
                                <div className="type-meta text-muted italic">Student will see a 250-character text box.</div>
                            )}

                            {q.question_type === 'LONG' && (
                                <div className="type-meta text-muted italic">Student will be able to upload a file (PDF/Image) or enter detailed text.</div>
                            )}

                            {q.question_type === 'YES_NO' && (
                                <div className="yes-no-options">
                                    <span className="text-muted">Correct Answer:</span>
                                    <div className="btn-group">
                                        <button
                                            className={`btn btn-sm ${q.payload.correct_answer === 'Yes' ? 'btn-primary' : 'btn-outline'}`}
                                            onClick={() => updatePayload(index, 'correct_answer', 'Yes')}
                                        >
                                            <FiCheck /> Yes
                                        </button>
                                        <button
                                            className={`btn btn-sm ${q.payload.correct_answer === 'No' ? 'btn-primary' : 'btn-outline'}`}
                                            onClick={() => updatePayload(index, 'correct_answer', 'No')}
                                        >
                                            <FiX /> No
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <button className="btn-icon text-danger" onClick={() => removeQuestion(index)}>
                            <FiTrash2 />
                        </button>
                    </div>
                ))}
            </div>

            <div className="builder-actions">
                <div className="add-question-menu">
                    <span className="text-muted">Add Question:</span>
                    <button className="btn btn-sm btn-outline" onClick={() => addQuestion('MCQ')}>MCQ</button>
                    <button className="btn btn-sm btn-outline" onClick={() => addQuestion('SHORT')}>Short</button>
                    <button className="btn btn-sm btn-outline" onClick={() => addQuestion('LONG')}>Long</button>
                    <button className="btn btn-sm btn-outline" onClick={() => addQuestion('YES_NO')}>Yes/No</button>
                </div>
                <div className="footer-btns">
                    <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
                    <button className="btn btn-primary" onClick={handleSave}>Save Paper</button>
                </div>
            </div>
        </div>
    );
};

export default PaperBuilder;
