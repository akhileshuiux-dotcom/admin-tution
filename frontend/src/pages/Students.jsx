import React, { useState, useEffect } from 'react';
import { FiUserPlus, FiFilter, FiEdit2, FiTrash2, FiCheckSquare, FiCheckCircle } from 'react-icons/fi';
import './Enquiries.css';
import StudentModal from '../components/StudentModal';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import AttendanceModal from '../components/AttendanceModal';
import BulkAttendanceModal from '../components/BulkAttendanceModal';
import api from '../api';
import { useSearch } from '../context/SearchContext';

const Students = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingStudent, setEditingStudent] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [studentToDelete, setStudentToDelete] = useState(null);
    const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
    const [studentForAttendance, setStudentForAttendance] = useState(null);
    const [isBulkAttendanceModalOpen, setIsBulkAttendanceModalOpen] = useState(false);
    const [selectedStudentIds, setSelectedStudentIds] = useState([]);
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({ name: '', grade: '', status: '' });
    const [activeTab, setActiveTab] = useState('Active');
    const { searchQuery } = useSearch();

    const fetchStudents = async () => {
        setLoading(true);
        try {
            const res = await api.get('/students/');
            const fetched = res.data.map(stu => ({
                id: 'STU' + (stu.id || stu._id).toString().substring((stu.id || stu._id).toString().length - 4).toUpperCase(),
                name: stu.full_name || stu.fullName,
                grade: stu.grade,
                subject: stu.syllabus || 'N/A',
                enrolledDate: stu.created_at || stu.createdAt,
                status: stu.status || 'Active',
                tutor: stu.tutorName || stu.tutor || 'Unassigned',
                fullData: stu
            }));
            setStudents(fetched);
        } catch (err) {
            console.error("Failed to fetch students:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStudents();
    }, []);

    const getStatusClass = (status) => {
        switch (status) {
            case 'Active': return 'status-badge-open';
            case 'Graduate': return 'status-badge-converted';
            case 'Inactive': return 'status-badge-closed-red';
            default: return 'status-badge-draft';
        }
    };

    const filteredStudents = students.filter(student => {
        const q = searchQuery.toLowerCase();
        const matchesGlobalSearch = q === '' ||
            student.name?.toLowerCase().includes(q) ||
            student.grade?.toLowerCase().includes(q) ||
            student.subject?.toLowerCase().includes(q) ||
            student.tutor?.toLowerCase().includes(q) ||
            student.id?.toLowerCase().includes(q);

        const matchesTab = activeTab === 'All' ? true : student.status === activeTab;

        return matchesGlobalSearch && matchesTab &&
            (filters.name === '' || student.name.toLowerCase().includes(filters.name.toLowerCase())) &&
            (filters.grade === '' || (student.grade && student.grade.toLowerCase().includes(filters.grade.toLowerCase()))) &&
            (filters.status === '' || student.status === filters.status);
    });

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedStudentIds(filteredStudents.map(s => s.id));
        } else {
            setSelectedStudentIds([]);
        }
    };

    const handleSelectStudent = (id) => {
        setSelectedStudentIds(prev => 
            prev.includes(id) ? prev.filter(sId => sId !== id) : [...prev, id]
        );
    };

    const handleSaveStudent = async (formData, editId) => {
        const payload = {
            fullName: formData.name,
            grade: formData.grade,
            syllabus: formData.subject,
            tutor: formData.tutor,
            status: formData.status
        };

        try {
            if (editId) {
                const isMock = editId.startsWith('STU') && !editId.includes('offline'); // simple mock check
                if (!isMock || typeof editId !== 'string') {
                    await api.put(`/students/${editId}`, payload);
                }

                setStudents(prev => prev.map(stu => {
                    if (stu.id === editId || stu.fullData?._id === editId) {
                        return {
                            ...stu,
                            name: formData.name,
                            grade: formData.grade,
                            subject: formData.subject,
                            tutor: formData.tutor,
                            status: formData.status,
                            fullData: { ...(stu.fullData || {}), ...payload }
                        };
                    }
                    return stu;
                }));
            } else {
                const res = await api.post('/students', payload);
                const newTableEntry = {
                    id: 'STU' + res.data._id.substring(res.data._id.length - 4).toUpperCase(),
                    name: res.data.fullName,
                    grade: res.data.grade,
                    subject: res.data.syllabus || 'N/A',
                    enrolledDate: res.data.createdAt,
                    status: res.data.status,
                    tutor: res.data.tutor || 'Unassigned',
                    fullData: res.data
                };
                setStudents(prev => [newTableEntry, ...prev]);
            }
        } catch (error) {
            console.error("Backend error updating student", error);
            alert("Error saving student to backend.");
        }
    };

    const confirmDelete = async () => {
        if (!studentToDelete) return;

        try {
            if (studentToDelete.fullData?._id) {
                await api.delete(`/students/${studentToDelete.fullData._id}`);
            }
            setStudents(prev => prev.filter(s => s.id !== studentToDelete.id));
            setSelectedStudentIds(prev => prev.filter(id => id !== studentToDelete.id));
        } catch (err) {
            console.error("Backend error, removing locally", err);
            setStudents(prev => prev.filter(s => s.id !== studentToDelete.id));
            setSelectedStudentIds(prev => prev.filter(id => id !== studentToDelete.id));
        } finally {
            setIsDeleteModalOpen(false);
            setStudentToDelete(null);
        }
    };

    const handleSaveAttendance = async (attendanceData, student) => {
        try {
            console.log("Saving attendance for", student.name, attendanceData);
            setStudents(prev => prev.map(s => {
                if (s.id === student.id) {
                    return { ...s, todayAttendance: attendanceData.status };
                }
                return s;
            }));
            setIsAttendanceModalOpen(false);
            setStudentForAttendance(null);
        } catch (error) {
            console.error("Failed to save attendance:", error);
            alert("Error saving attendance.");
        }
    };

    const handleSaveBulkAttendance = async (attendanceData, selectedStudentsList) => {
        try {
            console.log(`Saving bulk attendance for ${selectedStudentsList.length} students`, attendanceData);
            const selectedIds = selectedStudentsList.map(s => s.id);
            setStudents(prev => prev.map(s => {
                if (selectedIds.includes(s.id)) {
                    return { ...s, todayAttendance: attendanceData.status };
                }
                return s;
            }));
            setIsBulkAttendanceModalOpen(false);
            setSelectedStudentIds([]); // clear selection after action
        } catch (error) {
            console.error("Failed to save bulk attendance:", error);
            alert("Error saving bulk attendance.");
        }
    };

    return (
        <div className="enquiries-page animate-fade-in">
            <div className="page-header">
                <div>
                    <h1 className="h1">Students</h1>
                    <p className="text-muted">Manage enrolled students, track progress, and view assigned tutors.</p>
                </div>
                <div className="page-actions flex gap-4">
                    <button className={`btn ${showFilters ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setShowFilters(!showFilters)}>
                        <FiFilter /> Filter
                    </button>
                    <button className="btn btn-primary" onClick={() => {
                        setEditingStudent(null);
                        setIsModalOpen(true);
                    }}>
                        <FiUserPlus /> New Student
                    </button>
                </div>
            </div>

            {showFilters && (
                <div className="glass-panel animate-fade-in" style={{ marginBottom: '1.5rem', padding: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', borderRadius: 'var(--radius-lg)' }}>
                    <input type="text" className="form-input" placeholder="Filter by Name" value={filters.name} onChange={e => setFilters({ ...filters, name: e.target.value })} style={{ flex: 1, minWidth: '200px' }} />
                    <input type="text" className="form-input" placeholder="Filter by Grade" value={filters.grade} onChange={e => setFilters({ ...filters, grade: e.target.value })} style={{ flex: 1, minWidth: '150px' }} />
                    <select className="form-input" value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value })} style={{ flex: 1, minWidth: '150px' }}>
                        <option value="">All Statuses</option>
                        <option value="Active">Active</option>
                        <option value="Graduate">Graduate</option>
                        <option value="Inactive">Inactive</option>
                    </select>
                    <button className="btn btn-secondary" onClick={() => setFilters({ name: '', grade: '', status: '' })}>Clear</button>
                </div>
            )}

            <div className="filter-tabs" style={{ marginBottom: '1rem' }}>
                <button 
                    className={`filter-tab ${activeTab === 'Active' ? 'active' : ''}`}
                    onClick={() => setActiveTab('Active')}
                >
                    Active
                </button>
                <button 
                    className={`filter-tab ${activeTab === 'Inactive' ? 'active' : ''}`}
                    onClick={() => setActiveTab('Inactive')}
                >
                    Inactive
                </button>
                <button 
                    className={`filter-tab ${activeTab === 'Graduate' ? 'active' : ''}`}
                    onClick={() => setActiveTab('Graduate')}
                >
                    Graduate
                </button>
            </div>

            {selectedStudentIds.length > 0 && (
                <div className="glass-panel animate-fade-in" style={{ marginBottom: '1.5rem', padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(37, 99, 235, 0.05)', border: '1px solid rgba(37, 99, 235, 0.2)' }}>
                    <div style={{ fontWeight: '600', color: 'var(--primary-color)' }}>
                        {selectedStudentIds.length} Student{selectedStudentIds.length > 1 ? 's' : ''} Selected
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button 
                            className="btn btn-primary" 
                            style={{ backgroundColor: '#10b981', borderColor: '#10b981' }}
                            onClick={() => setIsBulkAttendanceModalOpen(true)}
                        >
                            <FiCheckCircle /> Mark Attendance
                        </button>
                        <button className="btn btn-secondary" onClick={() => setSelectedStudentIds([])}>Cancel</button>
                    </div>
                </div>
            )}

            <div className="glass-panel table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            {activeTab === 'Active' && (
                                <th style={{ width: '40px' }}>
                                    <input 
                                        type="checkbox" 
                                        checked={filteredStudents.length > 0 && selectedStudentIds.length === filteredStudents.length}
                                        onChange={handleSelectAll}
                                        style={{ cursor: 'pointer' }}
                                    />
                                </th>
                            )}
                            <th>ID</th>
                            <th>Student Name</th>
                            <th>Grade</th>
                            <th>Subject(s)</th>
                            <th>Enrolled Date</th>
                            <th>Assigned Tutor</th>
                            {activeTab === 'Active' && <th>Attendance</th>}
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredStudents.map((student) => (
                            <tr key={student.id} style={{ backgroundColor: selectedStudentIds.includes(student.id) ? 'rgba(37, 99, 235, 0.05)' : 'transparent' }}>
                                {activeTab === 'Active' && (
                                    <td>
                                        <input 
                                            type="checkbox" 
                                            checked={selectedStudentIds.includes(student.id)}
                                            onChange={() => handleSelectStudent(student.id)}
                                            style={{ cursor: 'pointer' }}
                                        />
                                    </td>
                                )}
                                <td className="font-medium text-muted">{student.id}</td>
                                <td className="font-semibold">{student.name}</td>
                                <td>{student.grade}</td>
                                <td>{student.subject}</td>
                                <td>{new Date(student.enrolledDate).toLocaleDateString()}</td>
                                <td>{student.tutor}</td>
                                {activeTab === 'Active' && (
                                    <td>
                                        {student.todayAttendance ? (
                                            <span style={{ 
                                                display: 'inline-block',
                                                padding: '2px 8px', 
                                                borderRadius: '4px',
                                                fontSize: '0.75rem',
                                                fontWeight: '500',
                                                backgroundColor: student.todayAttendance === 'Present' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                                color: student.todayAttendance === 'Present' ? '#10b981' : '#ef4444'
                                            }}>
                                                {student.todayAttendance}
                                            </span>
                                        ) : (
                                            <span className="text-muted" style={{ fontSize: '0.85rem' }}>-</span>
                                        )}
                                    </td>
                                )}
                                <td>
                                    <span className={`status-badge ${getStatusClass(student.status)}`}>
                                        {student.status}
                                    </span>
                                </td>
                                <td>
                                    <div className="flex gap-2" style={{ display: 'flex', gap: '0.5rem' }}>
                                        {student.status === 'Active' && (
                                            <button
                                                className="icon-btn text-muted transition-colors"
                                                style={{ color: '#8b8e98' }}
                                                onMouseEnter={(e) => e.currentTarget.style.color = '#3b82f6'}
                                                onMouseLeave={(e) => e.currentTarget.style.color = '#8b8e98'}
                                                onClick={() => {
                                                    setStudentForAttendance(student);
                                                    setIsAttendanceModalOpen(true);
                                                }}
                                                title="Mark Attendance"
                                            >
                                                <FiCheckSquare size={18} />
                                            </button>
                                        )}
                                        <button
                                            className="icon-btn text-muted transition-colors"
                                            style={{ color: '#8b8e98' }}
                                            onMouseEnter={(e) => e.currentTarget.style.color = '#b085f5'}
                                            onMouseLeave={(e) => e.currentTarget.style.color = '#8b8e98'}
                                            onClick={() => {
                                                setEditingStudent(student);
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
                                            onClick={() => {
                                                setStudentToDelete(student);
                                                setIsDeleteModalOpen(true);
                                            }}
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

            <StudentModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleSaveStudent}
                initialData={editingStudent}
            />

            <ConfirmDeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false);
                    setStudentToDelete(null);
                }}
                onConfirm={confirmDelete}
                itemName={studentToDelete?.name}
            />

            <AttendanceModal
                isOpen={isAttendanceModalOpen}
                onClose={() => {
                    setIsAttendanceModalOpen(false);
                    setStudentForAttendance(null);
                }}
                student={studentForAttendance}
                onSave={handleSaveAttendance}
            />

            <BulkAttendanceModal
                isOpen={isBulkAttendanceModalOpen}
                onClose={() => setIsBulkAttendanceModalOpen(false)}
                selectedStudents={students.filter(s => selectedStudentIds.includes(s.id))}
                onSave={handleSaveBulkAttendance}
            />
        </div>
    );
};

export default Students;
