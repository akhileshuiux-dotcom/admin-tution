import { useState, useEffect } from 'react';
import { FiPlus, FiFilter, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import './Enquiries.css';
import NewEnquiryModal from '../components/NewEnquiryModal';
import CompleteEnrollmentModal from '../components/CompleteEnrollmentModal';
import { useSearch } from '../context/SearchContext';
import api from '../api';

const MOCK_ENQUIRIES = [
    { id: 'ENQ001', studentName: 'Alex Johnson', grade: 'Grade 10', subject: 'Maths', status: 'New', date: '2026-03-01' },
    { id: 'ENQ002', studentName: 'Sarah Smith', grade: 'Grade 12', subject: 'Physics', status: 'Processing', date: '2026-03-02' },
    { id: 'ENQ003', studentName: 'Michael Brown', grade: 'Grade 8', subject: 'English', status: 'Completed', date: '2026-03-03' },
];

const Enquiries = () => {
    const navigate = useNavigate();
    const [enquiries, setEnquiries] = useState(MOCK_ENQUIRIES);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEnquiry, setEditingEnquiry] = useState(null);
    const [enrollmentModalData, setEnrollmentModalData] = useState(null);
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({ studentName: '', grade: '', status: '' });
    const { searchQuery } = useSearch();

    useEffect(() => {
        const fetchEnquiries = async () => {
            try {
                const res = await api.get('/enquiries');
                const fetched = res.data.map(enq => ({
                    id: enq._id.substring(enq._id.length - 6).toUpperCase(),
                    studentName: enq.studentName,
                    grade: enq.grade,
                    subject: enq.syllabus || 'N/A',
                    date: enq.createdAt,
                    status: enq.status,
                    fullData: enq
                }));
                setEnquiries([...MOCK_ENQUIRIES, ...fetched]);
            } catch (err) {
                console.error('Failed to fetch real enquiries', err);
            }
        };
        fetchEnquiries();
    }, []);

    const handleSaveEnquiry = async (formData, editId) => {
        const payload = {
            studentName: formData.studentName,
            grade: formData.grade,
            contactNumber: formData.contactNumber,
            email: formData.email,
            location: formData.location,
            country: formData.country,
            syllabus: formData.subject
        };

        try {
            if (editId) {
                const isMock = editId.startsWith('ENQ');
                if (!isMock) {
                    await api.put(`/enquiries/${editId}`, payload);
                }

                setEnquiries(prev => prev.map(enq => {
                    if (enq.id === editId || enq.fullData?._id === editId) {
                        return {
                            ...enq,
                            studentName: formData.studentName,
                            grade: formData.grade,
                            subject: formData.subject || 'N/A',
                            fullData: { ...(enq.fullData || {}), ...payload }
                        };
                    }
                    return enq;
                }));
            } else {
                const res = await api.post('/enquiries', payload);
                const newTableEntry = {
                    id: res.data._id.substring(res.data._id.length - 6).toUpperCase(),
                    studentName: res.data.studentName,
                    grade: res.data.grade,
                    subject: res.data.syllabus || 'N/A',
                    date: res.data.createdAt,
                    status: res.data.status,
                    fullData: res.data
                };
                setEnquiries(prev => [newTableEntry, ...prev]);
            }
        } catch (error) {
            console.error("Backend unavailable or stale, using local fallback state", error);
            if (editId) {
                setEnquiries(prev => prev.map(enq => {
                    if (enq.id === editId || enq.fullData?._id === editId) {
                        return {
                            ...enq,
                            studentName: formData.studentName,
                            grade: formData.grade,
                            subject: formData.subject || 'N/A',
                            fullData: { ...(enq.fullData || {}), ...payload }
                        };
                    }
                    return enq;
                }));
            } else {
                const fallbackId = 'ENQ' + Math.floor(Math.random() * 1000).toString().padStart(3, '0');
                const fallbackEntry = {
                    id: fallbackId,
                    studentName: formData.studentName,
                    grade: formData.grade,
                    subject: formData.subject || 'N/A',
                    date: new Date().toISOString(),
                    status: 'New',
                    fullData: payload
                };
                setEnquiries(prev => [fallbackEntry, ...prev]);
            }
        }
    };

    const handleDelete = async (id, dbId) => {
        if (!window.confirm("Are you sure you want to delete this enquiry?")) return;

        try {
            if (dbId) {
                await api.delete(`/enquiries/${dbId}`);
            }
            setEnquiries(prev => prev.filter(e => e.id !== id));
        } catch (err) {
            console.error("Backend error, removing locally", err);
            setEnquiries(prev => prev.filter(e => e.id !== id));
        }
    };

    const handleStatusChange = async (enquiry, newStatus) => {
        if (newStatus === 'Completed') {
            setEnrollmentModalData(enquiry);
            return; // Exit early, do not update status in API yet
        }

        try {
            const payload = { status: newStatus };
            if (newStatus === 'Failed') {
                payload.failureReason = 'No reason provided';
            }

            if (enquiry.fullData?._id && !enquiry.id.startsWith('ENQ')) {
                await api.put(`/enquiries/${enquiry.fullData._id}`, payload);
            }

            setEnquiries(prev => prev.map(e =>
                e.id === enquiry.id ? { ...e, status: newStatus, fullData: { ...(e.fullData || {}), ...payload } } : e
            ));

        } catch (error) {
            console.error("Error updating status via API, falling back to local state", error);
            const payload = { status: newStatus };
            if (newStatus === 'Failed') {
                payload.failureReason = 'No reason provided';
            }
            setEnquiries(prev => prev.map(e =>
                e.id === enquiry.id ? { ...e, status: newStatus, fullData: { ...(e.fullData || {}), ...payload } } : e
            ));
        }
    };

    const handleCompleteEnrollment = async (formData, enquiry) => {
        try {
            const studentPayload = {
                fullName: formData.studentName,
                grade: formData.grade,
                location: enquiry.fullData?.location || 'Unknown',
                country: enquiry.fullData?.country || 'Unknown',
                phoneNumber: formData.phoneNumber,
                email: formData.email,
                syllabus: formData.subject,
                status: 'Active',
                parentName: formData.parentName,
                tutor: formData.tutor,
                enquiryRef: enquiry.fullData?._id
            };

            if (enquiry.fullData?._id && !enquiry.id.startsWith('ENQ')) {
                // Post to students module
                await api.post('/students', studentPayload);
                // Update enquiry status to completed
                await api.put(`/enquiries/${enquiry.fullData._id}`, { status: 'Completed', failureReason: '' });
            }

            // Update local state just in case user goes back
            setEnquiries(prev => prev.map(e =>
                e.id === enquiry.id ? { ...e, status: 'Completed', fullData: { ...e.fullData, status: 'Completed', failureReason: '' } } : e
            ));

            const offlineStudent = {
                id: 'STU' + Math.floor(Math.random() * 1000).toString().padStart(3, '0'),
                name: formData.studentName,
                grade: formData.grade,
                subject: formData.subject || 'N/A',
                enrolledDate: new Date().toISOString(),
                status: 'Active',
                tutor: formData.tutor || 'Unassigned',
                fullData: studentPayload
            };
            const preOffline = JSON.parse(localStorage.getItem('offlineStudents') || '[]');
            localStorage.setItem('offlineStudents', JSON.stringify([offlineStudent, ...preOffline]));

            setEnrollmentModalData(null);
            alert("Success! Student automatically enrolled.");
            navigate('/students');

        } catch (error) {
            console.error("Failed enrollment mapping", error);

            const offlineStudent = {
                id: 'STU' + Math.floor(Math.random() * 1000).toString().padStart(3, '0'),
                name: formData.studentName,
                grade: formData.grade,
                subject: formData.subject || 'N/A',
                enrolledDate: new Date().toISOString(),
                status: 'Active',
                tutor: formData.tutor || 'Unassigned',
                fullData: studentPayload
            };
            const preOffline = JSON.parse(localStorage.getItem('offlineStudents') || '[]');
            localStorage.setItem('offlineStudents', JSON.stringify([offlineStudent, ...preOffline]));

            alert("Notice: Enrollment successful locally (Backend unreachable).");
            setEnquiries(prev => prev.map(e =>
                e.id === enquiry.id ? { ...e, status: 'Completed' } : e
            ));
            setEnrollmentModalData(null);
            navigate('/students');
        }
    };

    const getStatusClass = (status) => {
        switch (status) {
            case 'New': return 'status-badge-open';
            case 'Completed': return 'status-badge-converted';
            case 'Processing': return 'status-badge-draft';
            case 'Failed': return 'status-badge-closed-red';
            default: return 'status-badge-open';
        }
    };

    const filteredEnquiries = enquiries.filter(enq => {
        const matchesGlobalSearch = searchQuery === '' ||
            enq.studentName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            enq.grade?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            enq.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            enq.status?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            enq.id?.toLowerCase().includes(searchQuery.toLowerCase());

        return matchesGlobalSearch && (
            (filters.studentName === '' || enq.studentName.toLowerCase().includes(filters.studentName.toLowerCase())) &&
            (filters.grade === '' || (enq.grade && enq.grade.toLowerCase().includes(filters.grade.toLowerCase()))) &&
            (filters.status === '' || enq.status === filters.status)
        );
    });

    return (
        <div className="enquiries-page animate-fade-in">
            <div className="page-header">
                <div>
                    <h1 className="h1">Enquiries</h1>
                    <p className="text-muted">Manage potential student enrollments and demo requests.</p>
                </div>
                <div className="page-actions flex gap-4">
                    <button className={`btn ${showFilters ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setShowFilters(!showFilters)}>
                        <FiFilter /> Filter
                    </button>
                    <button className="btn btn-primary" onClick={() => {
                        setEditingEnquiry(null);
                        setIsModalOpen(true);
                    }}>
                        <FiPlus /> New Enquiry
                    </button>
                </div>
            </div>

            {showFilters && (
                <div className="glass-panel animate-fade-in" style={{ marginBottom: '1.5rem', padding: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', borderRadius: 'var(--radius-lg)' }}>
                    <input type="text" className="form-input" placeholder="Filter by Name" value={filters.studentName} onChange={e => setFilters({ ...filters, studentName: e.target.value })} style={{ flex: 1, minWidth: '200px' }} />
                    <input type="text" className="form-input" placeholder="Filter by Grade" value={filters.grade} onChange={e => setFilters({ ...filters, grade: e.target.value })} style={{ flex: 1, minWidth: '150px' }} />
                    <select className="form-input" value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value })} style={{ flex: 1, minWidth: '150px' }}>
                        <option value="">All Statuses</option>
                        <option value="New">New</option>
                        <option value="Processing">Processing</option>
                        <option value="Completed">Completed</option>
                        <option value="Failed">Failed</option>
                    </select>
                    <button className="btn btn-secondary" onClick={() => setFilters({ studentName: '', grade: '', status: '' })}>Clear</button>
                </div>
            )}

            <div className="glass-panel table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Student Name</th>
                            <th>Grade</th>
                            <th>Subject(s)</th>
                            <th>Date</th>
                            <th>Status (Workflow)</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredEnquiries.map((enq) => (
                            <tr key={enq.id}>
                                <td className="font-medium text-muted">{enq.id}</td>
                                <td className="font-semibold">{enq.studentName}</td>
                                <td>{enq.grade}</td>
                                <td>{enq.subject}</td>
                                <td>{new Date(enq.date).toLocaleDateString()}</td>
                                <td>
                                    <select
                                        className={`status-badge ${getStatusClass(enq.status)}`}
                                        style={{ border: 'none', cursor: 'pointer', outline: 'none', appearance: 'none', WebkitAppearance: 'none', paddingRight: '1.5rem', backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22currentColor%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right .5rem top 50%', backgroundSize: '.65rem auto' }}
                                        value={enq.status}
                                        onChange={(e) => handleStatusChange(enq, e.target.value)}
                                        title={enq.status === 'Failed' && enq.fullData?.failureReason ? `Reason: ${enq.fullData.failureReason}` : 'Update Status'}
                                    >
                                        <option value="New" className="text-slate-900 bg-white">New</option>
                                        <option value="Processing" className="text-slate-900 bg-white">Processing</option>
                                        <option value="Completed" className="text-slate-900 bg-white">Completed</option>
                                        <option value="Failed" className="text-slate-900 bg-white">Failed</option>
                                    </select>
                                </td>
                                <td>
                                    <div className="flex gap-2" style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button
                                            className="icon-btn text-muted transition-colors"
                                            style={{ color: '#8b8e98' }}
                                            onMouseEnter={(e) => e.currentTarget.style.color = '#b085f5'}
                                            onMouseLeave={(e) => e.currentTarget.style.color = '#8b8e98'}
                                            onClick={() => {
                                                setEditingEnquiry(enq);
                                                setIsModalOpen(true);
                                            }}
                                            title="Edit"
                                        >
                                            <FiEdit2 size={18} />
                                        </button>
                                        <button
                                            className="icon-btn text-muted transition-colors"
                                            style={{ color: '#8b8e98' }}
                                            onMouseEnter={(e) => e.currentTarget.style.color = '#f87171'}
                                            onMouseLeave={(e) => e.currentTarget.style.color = '#8b8e98'}
                                            onClick={() => handleDelete(enq.id, enq.fullData?._id)}
                                            title="Delete"
                                        >
                                            <FiTrash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <NewEnquiryModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleSaveEnquiry}
                initialData={editingEnquiry}
            />

            <CompleteEnrollmentModal
                isOpen={!!enrollmentModalData}
                onClose={() => setEnrollmentModalData(null)}
                enquiry={enrollmentModalData}
                onComplete={handleCompleteEnrollment}
            />
        </div>
    );
};

export default Enquiries;
