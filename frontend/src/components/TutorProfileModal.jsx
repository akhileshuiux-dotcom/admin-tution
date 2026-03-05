import React from 'react';
import { FiX, FiStar, FiMail, FiPhone, FiBook, FiAward, FiClock } from 'react-icons/fi';
import './NewEnquiryModal.css';

const TutorProfileModal = ({ isOpen, onClose, tutor }) => {
    if (!isOpen || !tutor) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content glass-panel animate-fade-in" style={{ maxWidth: '600px' }}>
                <div className="modal-header" style={{ borderBottom: 'none', paddingBottom: 0 }}>
                    <h2 className="h2" style={{ visibility: 'hidden' }}>Tutor Profile</h2>
                    <button className="icon-btn" type="button" onClick={onClose} style={{ zIndex: 10 }}>
                        <FiX size={20} />
                    </button>
                </div>

                <div className="modal-body" style={{ padding: '0 1.5rem 1.5rem', marginTop: '-20px' }}>
                    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', marginBottom: '2rem' }}>
                        <div style={{
                            width: '80px', height: '80px', borderRadius: '50%',
                            background: 'linear-gradient(135deg, #4f46e5, #b085f5)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '2rem', fontWeight: 'bold', color: 'white',
                            boxShadow: '0 4px 20px rgba(176, 133, 245, 0.4)'
                        }}>
                            {tutor.name.charAt(0)}
                        </div>
                        <div>
                            <h2 className="h2" style={{ marginBottom: '0.35rem' }}>{tutor.name}</h2>
                            <span className={`status-badge ${tutor.status === 'Active' ? 'status-badge-open' : 'status-badge-draft'}`} style={{ display: 'inline-block' }}>
                                {tutor.status}
                            </span>
                        </div>
                    </div>

                    <div className="glass-panel" style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                        <h4 className="text-muted text-sm uppercase" style={{ fontWeight: 600, letterSpacing: '0.05em', marginBottom: '1.25rem' }}>Professional Details</h4>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ background: 'rgba(176, 133, 245, 0.1)', padding: '10px', borderRadius: '8px' }}>
                                    <FiBook className="text-primary" size={18} />
                                </div>
                                <div>
                                    <p className="text-xs text-muted" style={{ marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Subjects</p>
                                    <p style={{ fontWeight: 500, fontSize: '0.95rem' }}>{tutor.subjects}</p>
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ background: 'rgba(176, 133, 245, 0.1)', padding: '10px', borderRadius: '8px' }}>
                                    <FiAward className="text-primary" size={18} />
                                </div>
                                <div>
                                    <p className="text-xs text-muted" style={{ marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Experience</p>
                                    <p style={{ fontWeight: 500, fontSize: '0.95rem' }}>{tutor.experience}</p>
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ background: 'rgba(234, 179, 8, 0.1)', padding: '10px', borderRadius: '8px' }}>
                                    <FiStar style={{ color: '#eab308' }} size={18} />
                                </div>
                                <div>
                                    <p className="text-xs text-muted" style={{ marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Rating</p>
                                    <p style={{ fontWeight: 500, fontSize: '0.95rem' }}>{tutor.rating} / 5.0</p>
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ background: 'rgba(176, 133, 245, 0.1)', padding: '10px', borderRadius: '8px' }}>
                                    <FiClock className="text-primary" size={18} />
                                </div>
                                <div>
                                    <p className="text-xs text-muted" style={{ marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Classes Taught</p>
                                    <p style={{ fontWeight: 500, fontSize: '0.95rem' }}>142 Total</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="modal-actions" style={{ padding: '1.25rem 1.5rem', background: 'rgba(0,0,0,0.1)', borderTop: '1px solid rgba(255, 255, 255, 0.05)', display: 'flex', gap: '1rem', borderBottomLeftRadius: '12px', borderBottomRightRadius: '12px' }}>
                    <button type="button" className="btn btn-secondary" onClick={onClose} style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: '8px' }}>
                        Close
                    </button>
                    <button type="button" className="btn btn-primary" style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: '8px' }}>
                        <FiMail /> Message Tutor
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TutorProfileModal;
