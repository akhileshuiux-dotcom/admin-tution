import React from 'react';
import { FiAlertTriangle, FiX } from 'react-icons/fi';
import './NewEnquiryModal.css'; // Reusing modal styles

const ConfirmDeleteModal = ({ isOpen, onClose, onConfirm, itemName }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content glass-panel animate-fade-in" style={{ maxWidth: '400px' }}>
                <div className="modal-header">
                    <h2 className="h2 flex items-center gap-2 text-danger">
                        <FiAlertTriangle className="text-red-500" />
                        Confirm Deletion
                    </h2>
                    <button type="button" className="icon-btn" onClick={onClose}><FiX size={24} /></button>
                </div>
                <div className="modal-body" style={{ padding: '1.5rem', textAlign: 'center' }}>
                    <p style={{ marginBottom: '1.5rem', color: 'var(--text-main)' }}>
                        Are you sure you want to delete <strong>{itemName || 'this item'}</strong>? This action cannot be undone.
                    </p>
                    <div className="modal-actions" style={{ justifyContent: 'center' }}>
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="button" className="btn" style={{ backgroundColor: 'var(--danger-color)', color: 'white' }} onClick={onConfirm}>
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDeleteModal;
