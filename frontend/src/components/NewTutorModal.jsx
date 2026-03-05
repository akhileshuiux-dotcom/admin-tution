import React, { useState, useEffect } from 'react';
import { FiX, FiUploadCloud } from 'react-icons/fi';
import './NewEnquiryModal.css';

const NewTutorModal = ({ isOpen, onClose, onSubmit, initialData = null }) => {
    const defaultData = {
        name: '', email: '', phone: '',
        education: '', educationCertificate: null,
        subjects: '', assignedClasses: '',
        experience: '', experienceCertificate: null,
    };

    const [formData, setFormData] = useState(defaultData);

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setFormData({ ...defaultData, ...initialData });
            } else {
                setFormData(defaultData);
            }
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value, type, files } = e.target;
        if (type === 'file') {
            setFormData(prev => ({ ...prev, [name]: files[0] }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({ ...formData, status: initialData?.status || 'Active' });
        setFormData(defaultData);
        onClose();
    };

    return (
        <div className="modal-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', boxSizing: 'border-box' }}>
            <div className="modal-content glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '750px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', margin: '0 auto', overflow: 'hidden', boxSizing: 'border-box' }}>

                <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
                    <h2 className="h2" style={{ fontSize: '1.25rem', margin: 0 }}>{initialData ? 'Edit Tutor Details' : 'Add New Tutor'}</h2>
                    <button className="icon-btn" type="button" onClick={onClose}><FiX size={20} /></button>
                </div>

                <form id="tutor-registration-form" onSubmit={handleSubmit} style={{ overflowY: 'auto', padding: '1.25rem 1.5rem', overflowX: 'hidden' }}>

                    <h3 className="h3" style={{ fontSize: '1rem', marginBottom: '0.75rem', color: 'var(--primary-color)' }}>Personal Details</h3>
                    <div className="form-group" style={{ marginBottom: '1rem' }}>
                        <label className="form-label" style={{ fontSize: '0.85rem' }}>Full Name</label>
                        <input type="text" className="form-input" name="name" value={formData.name} onChange={handleChange} placeholder="e.g. Dr. Emily Chen" required />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label" style={{ fontSize: '0.85rem' }}>Email Address</label>
                            <input type="email" className="form-input" name="email" value={formData.email} onChange={handleChange} placeholder="emily@example.com" required />
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label" style={{ fontSize: '0.85rem' }}>Phone Number</label>
                            <input type="tel" className="form-input" name="phone" value={formData.phone} onChange={handleChange} placeholder="+1 234 567 890" required />
                        </div>
                    </div>

                    <h3 className="h3" style={{ fontSize: '1rem', marginBottom: '0.75rem', color: 'var(--primary-color)', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>Education & Qualifications</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label" style={{ fontSize: '0.85rem' }}>Highest Education Degree</label>
                            <input type="text" className="form-input" name="education" value={formData.education} onChange={handleChange} placeholder="e.g. Ph.D. in Physics" required />
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label" style={{ fontSize: '0.85rem' }}>Upload Degree Document</label>
                            <div style={{ position: 'relative' }}>
                                <input type="file" className="form-input" name="educationCertificate" onChange={handleChange} style={{ padding: '8px', cursor: 'pointer', width: '100%', boxSizing: 'border-box' }} accept=".pdf,.jpg,.jpeg,.png" />
                                <FiUploadCloud style={{ position: 'absolute', right: '12px', top: '12px', color: 'var(--text-muted)' }} size={18} />
                            </div>
                        </div>
                    </div>

                    <h3 className="h3" style={{ fontSize: '1rem', marginBottom: '0.75rem', color: 'var(--primary-color)', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>Professional Experience</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label" style={{ fontSize: '0.85rem' }}>Years of Experience</label>
                            <input type="text" className="form-input" name="experience" value={formData.experience} onChange={handleChange} placeholder="e.g. 5 Years" required />
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label" style={{ fontSize: '0.85rem' }}>Upload Experience Certificate</label>
                            <div style={{ position: 'relative' }}>
                                <input type="file" className="form-input" name="experienceCertificate" onChange={handleChange} style={{ padding: '8px', cursor: 'pointer', width: '100%', boxSizing: 'border-box' }} accept=".pdf,.jpg,.jpeg,.png" />
                                <FiUploadCloud style={{ position: 'absolute', right: '12px', top: '12px', color: 'var(--text-muted)' }} size={18} />
                            </div>
                        </div>
                    </div>

                    <h3 className="h3" style={{ fontSize: '1rem', marginBottom: '0.75rem', color: 'var(--primary-color)', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>Teaching Assignments</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '0.5rem' }}>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label" style={{ fontSize: '0.85rem' }}>Assigned Classes/Grades</label>
                            <input type="text" className="form-input" name="assignedClasses" value={formData.assignedClasses} onChange={handleChange} placeholder="e.g. Grade 10, Grade 11" required />
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label" style={{ fontSize: '0.85rem' }}>Subjects Supported (Comma Separated)</label>
                            <input type="text" className="form-input" name="subjects" value={formData.subjects} onChange={handleChange} placeholder="e.g. Physics, Maths" required />
                        </div>
                    </div>
                </form>

                <div className="modal-actions" style={{ padding: '1.25rem 1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: '1rem', flexShrink: 0 }}>
                    <button type="button" className="btn btn-secondary" onClick={onClose} style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
                    <button type="submit" form="tutor-registration-form" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                        {initialData ? 'Save Changes' : 'Complete Registration'}
                    </button>
                </div>

            </div>
        </div>
    );
};

export default NewTutorModal;
