import { useState } from 'react';
import { FiPlus, FiFilter, FiMoreVertical, FiStar, FiEdit2, FiTrash2 } from 'react-icons/fi';
import './Tutors.css';
import TutorProfileModal from '../components/TutorProfileModal';
import NewTutorModal from '../components/NewTutorModal';

const MOCK_TUTORS = [
    { id: 'TUT001', name: 'Dr. Emily Chen', subjects: 'Physics, Maths', experience: '5 Years', status: 'Active', rating: 4.8 },
    { id: 'TUT002', name: 'James Wilson', subjects: 'English Literature', experience: '3 Years', status: 'Scheduled Leave', rating: 4.5 },
    { id: 'TUT003', name: 'Priya Sharma', subjects: 'Chemistry, Biology', experience: '7 Years', status: 'Active', rating: 4.9 },
];

const Tutors = () => {
    const [tutors, setTutors] = useState(MOCK_TUTORS);
    const [selectedTutor, setSelectedTutor] = useState(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState(null);
    const [editingTutor, setEditingTutor] = useState(null);

    const handleAddTutor = (formData) => {
        if (editingTutor) {
            setTutors(tutors.map(t => t.id === editingTutor.id ? { ...t, ...formData } : t));
            setEditingTutor(null);
        } else {
            const newTutor = {
                id: `TUT00${Math.floor(Math.random() * 1000)}`,
                name: formData.name,
                subjects: formData.subjects,
                experience: formData.experience,
                status: formData.status,
                rating: 5.0 // Default rating for new tutors
            };
            setTutors([newTutor, ...tutors]);
        }
    };

    const handleDeleteTutor = (id) => {
        setTutors(tutors.filter(t => t.id !== id));
        setActiveDropdown(null);
    };

    const handleEditClick = (tutor) => {
        setEditingTutor(tutor);
        setIsAddModalOpen(true);
        setActiveDropdown(null);
    };

    const toggleDropdown = (id) => {
        setActiveDropdown(activeDropdown === id ? null : id);
    };

    return (
        <div className="tutors-page animate-fade-in" onClick={() => setActiveDropdown(null)}>
            <div className="page-header">
                <div>
                    <h1 className="h1">Tutors</h1>
                    <p className="text-muted">Manage teaching staff, subjects, and availability.</p>
                </div>
                <div className="page-actions flex gap-4">
                    <button className="btn btn-secondary">
                        <FiFilter /> Filter
                    </button>
                    <button className="btn btn-primary" onClick={() => setIsAddModalOpen(true)}>
                        <FiPlus /> Add New Tutor
                    </button>
                </div>
            </div>

            <div className="tutors-grid">
                {tutors.map((tutor) => (
                    <div key={tutor.id} className="tutor-card glass-panel">
                        <div className="tutor-card-header">
                            <div className="tutor-avatar">{tutor.name.charAt(0)}</div>
                            <div className="tutor-actions" style={{ position: 'relative' }}>
                                <button className="icon-btn text-muted" onClick={(e) => { e.stopPropagation(); toggleDropdown(tutor.id); }}>
                                    <FiMoreVertical />
                                </button>
                                {activeDropdown === tutor.id && (
                                    <div className="dropdown-menu glass-panel animate-fade-in" style={{ position: 'absolute', right: 0, top: '100%', minWidth: '130px', zIndex: 10, padding: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', borderRadius: '8px', boxShadow: 'var(--shadow-lg)' }} onClick={(e) => e.stopPropagation()}>
                                        <button className="btn btn-sm" style={{ justifyContent: 'flex-start', background: 'transparent', border: 'none', color: 'var(--text-main)', padding: '0.5rem 0.75rem', width: '100%' }} onClick={() => handleEditClick(tutor)}>
                                            <FiEdit2 size={14} style={{ marginRight: '0.75rem' }} /> Edit
                                        </button>
                                        <button className="btn btn-sm" style={{ justifyContent: 'flex-start', background: 'transparent', border: 'none', color: 'var(--danger-color)', padding: '0.5rem 0.75rem', width: '100%' }} onClick={() => handleDeleteTutor(tutor.id)}>
                                            <FiTrash2 size={14} style={{ marginRight: '0.75rem' }} /> Remove
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="tutor-card-body">
                            <h3 className="tutor-name font-semibold">{tutor.name}</h3>
                            <p className="tutor-subjects text-muted">{tutor.subjects}</p>

                            <div className="tutor-stats">
                                <div className="stat-pill">
                                    <FiStar style={{ color: 'var(--warning-color)' }} /> {tutor.rating}
                                </div>
                                <div className="stat-pill">
                                    {tutor.experience}
                                </div>
                            </div>

                            <div className="tutor-footer flex justify-between mt-4 items-center">
                                <span className={`status-badge ${tutor.status === 'Active' ? 'status-badge-open' : 'status-badge-draft'}`}>
                                    {tutor.status}
                                </span>
                                <button className="btn btn-secondary btn-sm" onClick={() => setSelectedTutor(tutor)}>View Profile</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <TutorProfileModal
                isOpen={!!selectedTutor}
                onClose={() => setSelectedTutor(null)}
                tutor={selectedTutor}
            />

            <NewTutorModal
                isOpen={isAddModalOpen}
                initialData={editingTutor}
                onClose={() => {
                    setIsAddModalOpen(false);
                    setEditingTutor(null);
                }}
                onSubmit={handleAddTutor}
            />
        </div>
    );
};

export default Tutors;
