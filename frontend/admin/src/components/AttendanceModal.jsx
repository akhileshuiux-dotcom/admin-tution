import React, { useState, useEffect } from 'react';
import { FiX, FiCheckCircle, FiMinusCircle } from 'react-icons/fi';
import './NewEnquiryModal.css';

const AttendanceModal = ({ isOpen, onClose, student, onSave }) => {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [status, setStatus] = useState('Present');
    const [remarks, setRemarks] = useState('');

    useEffect(() => {
        if (isOpen) {
            setDate(new Date().toISOString().split('T')[0]);
            setStatus('Present');
            setRemarks('');
        }
    }, [isOpen]);

    if (!isOpen || !student) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ date, status, remarks }, student);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content glass-panel animate-fade-in" style={{ maxWidth: '500px' }}>
                <div className="modal-header">
                    <h2 className="h2">Mark Attendance</h2>
                    <button className="icon-btn" type="button" onClick={onClose}><FiX size={24} /></button>
                </div>
                
                <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Student</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--text-main)' }}>{student.name}</div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{student.grade} • {student.subject}</div>
                </div>

                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="form-group">
                        <label className="form-label">Date</label>
                        <input 
                            type="date" 
                            className="form-input" 
                            value={date} 
                            onChange={(e) => setDate(e.target.value)} 
                            required 
                        />
                    </div>
                    
                    <div className="form-group">
                        <label className="form-label">Status</label>
                        <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                <input 
                                    type="radio" 
                                    name="attendanceStatus" 
                                    value="Present" 
                                    checked={status === 'Present'} 
                                    onChange={(e) => setStatus(e.target.value)} 
                                />
                                <span style={{ color: status === 'Present' ? '#10b981' : 'var(--text-muted)', fontWeight: status === 'Present' ? '600' : 'normal' }}>
                                    <FiCheckCircle style={{ marginRight: '4px', verticalAlign: 'middle' }}/> Present
                                </span>
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                <input 
                                    type="radio" 
                                    name="attendanceStatus" 
                                    value="Absent" 
                                    checked={status === 'Absent'} 
                                    onChange={(e) => setStatus(e.target.value)} 
                                />
                                <span style={{ color: status === 'Absent' ? '#ef4444' : 'var(--text-muted)', fontWeight: status === 'Absent' ? '600' : 'normal' }}>
                                    <FiMinusCircle style={{ marginRight: '4px', verticalAlign: 'middle' }}/> Absent
                                </span>
                            </label>
                        </div>
                    </div>

                    <div className="form-group" style={{ marginTop: '1rem' }}>
                        <label className="form-label">Remarks (Optional)</label>
                        <textarea 
                            className="form-input" 
                            rows="3" 
                            placeholder="Add reason for absence or any notes..."
                            value={remarks}
                            onChange={(e) => setRemarks(e.target.value)}
                        />
                    </div>

                    <div className="modal-actions mt-6">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-primary" style={{ backgroundColor: status === 'Present' ? '#10b981' : '#ef4444', borderColor: status === 'Present' ? '#10b981' : '#ef4444' }}>
                            Save Attendance
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AttendanceModal;
