import React, { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import './NewEnquiryModal.css';
import axios from 'axios';

const CompleteEnrollmentModal = ({ isOpen, onClose, enquiry, onComplete }) => {
    const [formData, setFormData] = useState({
        studentName: '',
        grade: '',
        subject: '',
        tutor: '',
        parentName: '',
        phoneNumber: '',
        email: ''
    });
    const [tutors, setTutors] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (enquiry) {
            setFormData({
                studentName: enquiry.studentName || '',
                grade: enquiry.grade || '',
                subject: enquiry.subject !== 'N/A' ? enquiry.subject : '',
                tutor: '',
                parentName: '',
                phoneNumber: enquiry.fullData?.contactNumber || '',
                email: enquiry.fullData?.email || ''
            });
        }
    }, [enquiry]);

    useEffect(() => {
        const fetchTutors = async () => {
            const mockTutors = [
                { _id: '1', fullName: 'Sarah Jenkins' },
                { _id: '2', fullName: 'David Lee' },
                { _id: '3', fullName: 'Robert Fox' },
                { _id: '4', fullName: 'Michael Chen' }
            ];
            try {
                const res = await axios.get('http://localhost:5000/api/tutors');
                if (res.data && res.data.length > 0) {
                    setTutors(res.data);
                } else {
                    setTutors(mockTutors);
                }
            } catch (err) {
                setTutors(mockTutors);
            }
        };
        fetchTutors();
    }, []);

    if (!isOpen || !enquiry) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onComplete(formData, enquiry);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content glass-panel animate-fade-in" style={{ maxWidth: '600px' }}>
                <div className="modal-header">
                    <h2 className="h2">Complete Enrollment</h2>
                    <button className="icon-btn" type="button" onClick={onClose}><FiX size={24} /></button>
                </div>
                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="section-title text-sm font-semibold text-primary mb-2 mt-4 uppercase tracking-wider">Student Details</div>
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Student Name</label>
                            <input type="text" className="form-input" name="studentName" value={formData.studentName} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Grade</label>
                            <input type="text" className="form-input" name="grade" value={formData.grade} onChange={handleChange} required />
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Subjects</label>
                        <input type="text" className="form-input" name="subject" value={formData.subject} onChange={handleChange} />
                    </div>

                    <div className="section-title text-sm font-semibold text-primary mb-2 mt-4 uppercase tracking-wider">Assignment</div>
                    <div className="form-group">
                        <label className="form-label">Assigned Tutor</label>
                        <select className="form-input" name="tutor" value={formData.tutor} onChange={handleChange} required>
                            <option value="" disabled>Select a Tutor...</option>
                            {tutors.map(t => (
                                <option key={t._id} value={t.fullName}>{t.fullName}</option>
                            ))}
                        </select>
                    </div>

                    <div className="section-title text-sm font-semibold text-primary mb-2 mt-4 uppercase tracking-wider">Parent/Guardian Details</div>
                    <div className="form-group">
                        <label className="form-label">Parent Name</label>
                        <input type="text" className="form-input" name="parentName" value={formData.parentName} onChange={handleChange} required />
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Phone Number</label>
                            <input type="tel" className="form-input" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Email</label>
                            <input type="email" className="form-input" name="email" value={formData.email} onChange={handleChange} required />
                        </div>
                    </div>

                    <div className="modal-actions mt-6">
                        <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>Cancel</button>
                        <button type="submit" className="btn btn-primary" style={{ backgroundColor: '#10b981', borderColor: '#10b981' }} disabled={loading}>
                            {loading ? 'Processing...' : 'Complete Enrollment'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CompleteEnrollmentModal;
