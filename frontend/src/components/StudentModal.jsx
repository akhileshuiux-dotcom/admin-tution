import React, { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import './NewEnquiryModal.css'; // Reusing generic modal styles

const StudentModal = ({ isOpen, onClose, onSubmit, initialData = null }) => {
    const defaultData = {
        name: '', grade: '', subject: '', tutor: '', status: 'Active'
    };

    const [formData, setFormData] = useState(defaultData);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name || '',
                grade: initialData.grade || '',
                subject: initialData.subject || '',
                tutor: initialData.tutor || 'Unassigned',
                status: initialData.status || 'Active'
            });
        } else {
            setFormData(defaultData);
        }
    }, [initialData]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onSubmit(formData, initialData ? (initialData.fullData?._id || initialData.id) : null);
            setFormData(defaultData);
            onClose();
        } catch (error) {
            console.error("Failed to submit student:", error);
            alert("Failed to save student details.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content glass-panel animate-fade-in">
                <div className="modal-header">
                    <h2 className="h2">{initialData ? 'Edit Student' : 'New Student'}</h2>
                    <button type="button" className="icon-btn" onClick={onClose}><FiX size={24} /></button>
                </div>
                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Student Name *</label>
                            <input type="text" className="form-input" name="name" value={formData.name} onChange={handleChange} required placeholder="John Doe" />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Grade *</label>
                            <input type="text" className="form-input" name="grade" value={formData.grade} onChange={handleChange} required placeholder="Grade 10" />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Subject(s) *</label>
                            <input type="text" className="form-input" name="subject" value={formData.subject} onChange={handleChange} required placeholder="Mathematics, Physics" />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Tutor</label>
                            <input type="text" className="form-input" name="tutor" value={formData.tutor} onChange={handleChange} placeholder="Sarah Jenkins" />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Status *</label>
                            <select className="form-input" name="status" value={formData.status} onChange={handleChange} required>
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                                <option value="Graduated">Graduated</option>
                            </select>
                        </div>
                    </div>
                    <div className="modal-actions">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Saving...' : (initialData ? 'Save Changes' : 'Create Student')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default StudentModal;
