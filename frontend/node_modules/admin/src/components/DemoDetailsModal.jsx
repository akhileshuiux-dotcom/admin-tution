import React from 'react';
import { FiX, FiCalendar, FiClock, FiVideo, FiUser } from 'react-icons/fi';
import './NewEnquiryModal.css';

const DemoDetailsModal = ({ isOpen, onClose, demo }) => {
    if (!isOpen || !demo) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content glass-panel animate-fade-in" style={{ maxWidth: '450px' }}>
                <div className="modal-header">
                    <h2 className="h2" style={{ fontSize: '1.25rem' }}>Demo Session Details</h2>
                    <button className="icon-btn" type="button" onClick={onClose}>
                        <FiX size={20} />
                    </button>
                </div>

                <div className="modal-body" style={{ padding: '1.5rem 0 0.5rem' }}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                            <div style={{ background: 'rgba(176, 133, 245, 0.1)', padding: '8px', borderRadius: '50%' }}>
                                <FiUser className="text-primary" size={20} />
                            </div>
                            <h3 className="h3" style={{ margin: 0 }}>{demo.studentName}</h3>
                        </div>
                        <p className="text-muted" style={{ marginLeft: '44px', fontWeight: 500 }}>{demo.grade} • {demo.subject}</p>
                    </div>

                    <div className="glass-panel" style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', marginBottom: '1.5rem', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                            <FiCalendar className="text-muted" />
                            <span style={{ fontWeight: 500 }}>{demo.date}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                            <FiClock className="text-muted" />
                            <span style={{ fontWeight: 500 }}>{demo.time}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <FiVideo className="text-primary" />
                            <a href={demo.meetLink} target="_blank" rel="noreferrer" style={{ color: '#b085f5', textDecoration: 'none', fontWeight: 600 }}>
                                Join Google Meet Link
                            </a>
                        </div>
                    </div>

                    <div style={{ marginLeft: '0.25rem' }}>
                        <h4 className="text-muted text-sm uppercase" style={{ fontWeight: 600, letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Assigned Tutor</h4>
                        <p style={{ fontWeight: 500 }}>{demo.tutor}</p>
                    </div>
                </div>

                <div className="modal-actions mt-6">
                    <button type="button" className="btn btn-secondary w-full" onClick={onClose} style={{ width: '100%', justifyContent: 'center' }}>
                        Close Window
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DemoDetailsModal;
