import React, { useState, useEffect } from 'react';
import { FiX, FiCheckCircle, FiMinusCircle } from 'react-icons/fi';
import './NewEnquiryModal.css';

const BulkAttendanceModal = ({ isOpen, onClose, selectedStudents, onSave }) => {
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

    if (!isOpen || selectedStudents.length === 0) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ date, status, remarks }, selectedStudents);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content glass-panel animate-fade-in" style={{ maxWidth: '600px' }}>
                <div className="modal-header">
                    <h2 className="h2">Mark Bulk Attendance</h2>
                    <button className="icon-btn" type="button" onClick={onClose}><FiX size={24} /></button>
                </div>
                
                <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Selected Students ({selectedStudents.length})</div>
                    <div style={{ maxHeight: '100px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        {selectedStudents.map(student => (
                            <div key={student.id} style={{ fontSize: '0.95rem', display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ fontWeight: '500', color: 'var(--text-main)' }}>{student.name}</span>
                                <span style={{ color: 'var(--text-muted)' }}>{student.grade}</span>
                            </div>
                        ))}
                    </div>
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
                        <label className="form-label">Mark all selected as:</label>
                        <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                <input 
                                    type="radio" 
                                    name="bulkAttendanceStatus" 
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
                                    name="bulkAttendanceStatus" 
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
                        <label className="form-label">Universal Remarks (Optional)</label>
                        <textarea 
                            className="form-input" 
                            rows="2" 
                            placeholder="Add reason or notes applying to all selected..."
                            value={remarks}
                            onChange={(e) => setRemarks(e.target.value)}
                        />
                    </div>

                    <div className="modal-actions mt-6">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-primary" style={{ backgroundColor: status === 'Present' ? '#10b981' : '#ef4444', borderColor: status === 'Present' ? '#10b981' : '#ef4444' }}>
                            Apply to {selectedStudents.length} Students
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BulkAttendanceModal;
