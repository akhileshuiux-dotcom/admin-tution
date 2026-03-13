import { useState, useEffect } from 'react';
import { FiPlus, FiFilter, FiMoreVertical, FiStar, FiEdit2, FiTrash2, FiAward } from 'react-icons/fi';
import './Tutors.css';
import TutorProfileModal from '../components/TutorProfileModal';
import NewTutorModal from '../components/NewTutorModal';
import { useSearch } from '../context/SearchContext';
import api from '../api';

const Tutors = () => {
    const [tutors, setTutors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTutor, setSelectedTutor] = useState(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState(null);
    const [editingTutor, setEditingTutor] = useState(null);
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({ name: '', subjects: '', status: '' });
    const { searchQuery } = useSearch();

    const fetchTutors = async () => {
        setLoading(true);
        try {
            const res = await api.get('tutors/');
            const mapped = res.data.map(t => {
                const formatArray = (val) => {
                    if (!val) return 'N/A';
                    if (Array.isArray(val)) {
                        return val.map(item => typeof item === 'object' ? (item.subject || item.degree || JSON.stringify(item)) : item).join(', ');
                    }
                    return val;
                };

                return {
                    id: (t.id || t._id || '').toString().startsWith('TUT') ? (t.id || t._id).toString() : `TUT${(t.id || t._id || '0').toString().padStart(3, '0')}`,
                    name: t.name || 'Unknown',
                    subjects: formatArray(t.subjects),
                    classes: formatArray(t.assignedClasses),
                    experience: `${t.teachingExperienceMonths || 0} Mo`,
                    education: formatArray(t.education),
                    status: t.status || 'Inactive',
                    fullData: t
                };
            });
            setTutors(mapped);
        } catch (err) {
            console.error("Failed to fetch tutors:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTutors();
    }, []);

    const handleAddTutor = async (formData) => {
        const payload = {
            user: {
                name: formData.name,
                email: formData.email || `${formData.name.toLowerCase().replace(' ', '.')}@example.com`,
                role: 'Tutor',
                password: 'password123' // Set a default password if creating user
            },
            contact_number: formData.contactNumber || '0000000000',
            status: formData.status,
            subject_expertise: formData.subjects,
            classes_can_teach: formData.assignedClasses,
            teaching_experience_months: parseInt(formData.experience) || 0
        };

        try {
            if (editingTutor) {
                const tutorId = editingTutor.fullData?.id || editingTutor.id;
                await api.patch(`/tutors/${tutorId}/`, payload);
                fetchTutors();
            } else {
                await api.post('tutors/', payload);
                fetchTutors();
            }
            setIsAddModalOpen(false);
            setEditingTutor(null);
        } catch (err) {
            console.error("Error saving tutor:", err);
            alert("Failed to save tutor. Check console for details.");
        }
    };

    const handleDeleteTutor = async (id, dbId) => {
        if (!window.confirm("Are you sure you want to delete this tutor?")) return;
        try {
            await api.delete(`/tutors/${dbId || id}/`);
            setTutors(tutors.filter(t => t.id !== id));
        } catch (err) {
            console.error("Delete failed:", err);
        }
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

    const filteredTutors = tutors.filter(tutor => {
        const q = searchQuery.toLowerCase();
        const matchesGlobalSearch = q === '' ||
            (tutor.name && tutor.name.toLowerCase().includes(q)) ||
            (tutor.subjects && tutor.subjects.toLowerCase().includes(q)) ||
            (tutor.id && tutor.id.toString().toLowerCase().includes(q));

        return matchesGlobalSearch &&
            (filters.name === '' || (tutor.name && tutor.name.toLowerCase().includes(filters.name.toLowerCase()))) &&
            (filters.subjects === '' || (tutor.subjects && tutor.subjects.toLowerCase().includes(filters.subjects.toLowerCase()))) &&
            (filters.status === '' || tutor.status === filters.status);
    });

    return (
        <div className="tutors-page animate-fade-in" onClick={() => setActiveDropdown(null)}>
            <div className="page-header">
                <div>
                    <h1 className="h1">Tutors</h1>
                    <p className="text-muted">Manage teaching staff, subjects, and availability.</p>
                </div>
                <div className="page-actions flex gap-4">
                    <button className={`btn ${showFilters ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setShowFilters(!showFilters)}>
                        <FiFilter /> Filter
                    </button>
                    <button className="btn btn-primary" onClick={() => setIsAddModalOpen(true)}>
                        <FiPlus /> Add New Tutor
                    </button>
                </div>
            </div>

            {showFilters && (
                <div className="glass-panel animate-fade-in" style={{ marginBottom: '1.5rem', padding: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', borderRadius: 'var(--radius-lg)' }}>
                    <input type="text" className="form-input" placeholder="Filter by Name" value={filters.name} onChange={e => setFilters({ ...filters, name: e.target.value })} style={{ flex: 1, minWidth: '200px' }} />
                    <input type="text" className="form-input" placeholder="Filter by Subject" value={filters.subjects} onChange={e => setFilters({ ...filters, subjects: e.target.value })} style={{ flex: 1, minWidth: '150px' }} />
                    <select className="form-input" value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value })} style={{ flex: 1, minWidth: '150px' }}>
                        <option value="">All Statuses</option>
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                        <option value="Scheduled Leave">Scheduled Leave</option>
                        <option value="Leave">Leave</option>
                        <option value="Resigned">Resigned</option>
                    </select>
                    <button className="btn btn-secondary" onClick={() => setFilters({ name: '', subjects: '', status: '' })}>Clear</button>
                </div>
            )}

            {loading ? (
                <div className="flex flex-col items-center justify-center p-20">
                    <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full mb-4"></div>
                    <p className="text-muted">Loading tutors from database...</p>
                </div>
            ) : (
                <div className="tutors-grid">
                    {filteredTutors.map((tutor) => (
                        <div key={tutor.id || Math.random()} className="tutor-card glass-panel">
                            <div className="tutor-card-header">
                                <div className="tutor-avatar">{(tutor.name || 'U').charAt(0)}</div>
                                <div className="tutor-actions" style={{ position: 'relative' }}>
                                    <button className="icon-btn text-muted" onClick={(e) => { e.stopPropagation(); toggleDropdown(tutor.id); }}>
                                        <FiMoreVertical />
                                    </button>
                                    {activeDropdown === tutor.id && (
                                        <div className="dropdown-menu glass-panel animate-fade-in" style={{ position: 'absolute', right: 0, top: '100%', minWidth: '130px', zIndex: 10, padding: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', borderRadius: '8px', boxShadow: 'var(--shadow-lg)' }} onClick={(e) => e.stopPropagation()}>
                                            <button className="btn btn-sm" style={{ justifyContent: 'flex-start', background: 'transparent', border: 'none', color: 'var(--text-main)', padding: '0.5rem 0.75rem', width: '100%' }} onClick={() => handleEditClick(tutor)}>
                                                <FiEdit2 size={14} style={{ marginRight: '0.75rem' }} /> Edit
                                            </button>
                                            <button className="btn btn-sm" style={{ justifyContent: 'flex-start', background: 'transparent', border: 'none', color: 'var(--danger-color)', padding: '0.5rem 0.75rem', width: '100%' }} onClick={() => handleDeleteTutor(tutor.id, tutor.fullData?.id)}>
                                                <FiTrash2 size={14} style={{ marginRight: '0.75rem' }} /> Remove
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="tutor-card-body">
                                <h3 className="tutor-name font-semibold">{tutor.name}</h3>
                                <p className="tutor-subjects text-muted">{typeof tutor.subjects === 'string' ? tutor.subjects : JSON.stringify(tutor.subjects)}</p>

                                <div className="tutor-stats">
                                    <div className="stat-pill" title="Qualification">
                                        <FiAward style={{ color: 'var(--primary-color)' }} /> {tutor.education}
                                    </div>
                                    <div className="stat-pill">
                                        {tutor.experience}
                                    </div>
                                </div>

                                <div className="tutor-footer flex justify-between mt-4 items-center">
                                    <span className={`status-badge ${
                                        tutor.status === 'Active' ? 'status-badge-open' : 
                                        tutor.status === 'Resigned' ? 'status-badge-closed-red' : 
                                        'status-badge-draft'
                                    }`}>
                                        {tutor.status || 'Inactive'}
                                    </span>
                                    <button className="btn btn-secondary btn-sm" onClick={() => setSelectedTutor(tutor)}>View Profile</button>
                                </div>
                            </div>
                        </div>
                    ))}
                    {filteredTutors.length === 0 && (
                        <div className="col-span-full py-10 text-center text-muted">No tutors found.</div>
                    )}
                </div>
            )}

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
