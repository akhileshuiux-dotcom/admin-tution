import React, { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import './NewEnquiryModal.css';

const NewEnquiryModal = ({ isOpen, onClose, onSubmit, initialData = null }) => {
    const defaultData = {
        studentName: '', grade: '', contactNumber: '', email: '', location: '', country: '', subject: ''
    };

    const [formData, setFormData] = useState(defaultData);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (initialData) {
            setFormData({
                studentName: initialData.studentName || '',
                grade: initialData.grade || '',
                contactNumber: initialData.fullData?.contactNumber || '',
                email: initialData.fullData?.email || '',
                location: initialData.fullData?.location || '',
                country: initialData.fullData?.country || '',
                subject: initialData.subject || ''
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
            console.error("Failed to submit enquiry:", error);
            alert("Failed to save enquiry. Ensure your backend is running.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content glass-panel animate-fade-in">
                <div className="modal-header">
                    <h2 className="h2">{initialData ? 'Edit Enquiry' : 'New Enquiry Request'}</h2>
                    <button className="icon-btn" onClick={onClose}><FiX size={24} /></button>
                </div>
                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Student Name *</label>
                            <input type="text" className="form-input" name="studentName" value={formData.studentName} onChange={handleChange} required placeholder="John Doe" />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Grade *</label>
                            <input type="text" className="form-input" name="grade" value={formData.grade} onChange={handleChange} required placeholder="Grade 10" />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Contact Number *</label>
                            <input type="tel" className="form-input" name="contactNumber" value={formData.contactNumber} onChange={handleChange} required placeholder="+1 123 456 7890" />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Email Address</label>
                            <input type="email" className="form-input" name="email" value={formData.email} onChange={handleChange} placeholder="john@example.com" />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Location *</label>
                            <input type="text" className="form-input" name="location" value={formData.location} onChange={handleChange} required placeholder="City or State" />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Country *</label>
                            <input type="text" className="form-input" name="country" value={formData.country} onChange={handleChange} required placeholder="e.g. USA" />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Subject of Interest</label>
                            <input type="text" className="form-input" name="subject" value={formData.subject} onChange={handleChange} placeholder="e.g., Mathematics, Physics" />
                        </div>
                    </div>
                    <div className="modal-actions">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Saving...' : (initialData ? 'Save Changes' : 'Create Enquiry')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default NewEnquiryModal;
