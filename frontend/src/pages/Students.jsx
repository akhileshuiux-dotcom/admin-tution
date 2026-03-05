import React, { useState, useEffect } from 'react';
import { FiUserPlus, FiFilter, FiEdit2, FiTrash2 } from 'react-icons/fi';
import './Enquiries.css';
import axios from 'axios';

const MOCK_STUDENTS = [
    { id: 'STU001', name: 'Alex Johnson', grade: 'Grade 10', subject: 'Maths, Science', enrolledDate: '2026-03-01', status: 'Active', tutor: 'Sarah Jenkins' },
    { id: 'STU002', name: 'Michael Brown', grade: 'Grade 8', subject: 'English Literature', enrolledDate: '2026-02-15', status: 'Active', tutor: 'David Lee' },
    { id: 'STU003', name: 'Emily Chen', grade: 'Grade 11', subject: 'Physics, Chemistry', enrolledDate: '2026-01-20', status: 'Inactive', tutor: 'Unassigned' },
    { id: 'STU004', name: 'Daniel Kim', grade: 'Grade 9', subject: 'History', enrolledDate: '2026-03-02', status: 'Active', tutor: 'Sarah Jenkins' },
    { id: 'STU005', name: 'Sophia Martinez', grade: 'Grade 12', subject: 'Advanced Mathematics', enrolledDate: '2025-11-10', status: 'Graduated', tutor: 'Robert Fox' },
    { id: 'STU006', name: 'Liam Wilson', grade: 'Grade 7', subject: 'General Science', enrolledDate: '2026-03-03', status: 'Active', tutor: 'David Lee' },
    { id: 'STU007', name: 'Isabella Taylor', grade: 'Grade 10', subject: 'Spanish', enrolledDate: '2025-12-05', status: 'Active', tutor: 'Robert Fox' },
    { id: 'STU008', name: 'William Anderson', grade: 'Grade 8', subject: 'Maths', enrolledDate: '2026-02-28', status: 'Active', tutor: 'Sarah Jenkins' },
    { id: 'STU009', name: 'Mia Thomas', grade: 'Grade 11', subject: 'Biology', enrolledDate: '2026-01-15', status: 'Inactive', tutor: 'Unassigned' },
    { id: 'STU010', name: 'James Jackson', grade: 'Grade 12', subject: 'Economics', enrolledDate: '2025-10-22', status: 'Graduated', tutor: 'David Lee' },
];

const Students = () => {
    const [students, setStudents] = useState(MOCK_STUDENTS);

    useEffect(() => {
        const fetchStudents = async () => {
            const offlineStudents = JSON.parse(localStorage.getItem('offlineStudents') || '[]');
            try {
                const res = await axios.get('http://localhost:5000/api/students');
                const fetched = res.data.map(stu => ({
                    id: 'STU' + stu._id.substring(stu._id.length - 4).toUpperCase(),
                    name: stu.fullName,
                    grade: stu.grade,
                    subject: stu.syllabus || 'N/A',
                    enrolledDate: stu.createdAt,
                    status: stu.status || 'Active',
                    tutor: 'Unassigned',
                    fullData: stu
                }));
                // Combine with mock data
                setStudents([...offlineStudents, ...fetched, ...MOCK_STUDENTS]);
            } catch (err) {
                console.error("Failed to fetch real students from DB. Backend may be offline.", err);
                setStudents([...offlineStudents, ...MOCK_STUDENTS]);
            }
        };
        fetchStudents();
    }, []);

    const getStatusClass = (status) => {
        switch (status) {
            case 'Active': return 'status-badge-open';
            case 'Graduated': return 'status-badge-converted';
            case 'Inactive': return 'status-badge-closed-red';
            default: return 'status-badge-draft';
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
                    <button className="btn btn-secondary">
                        <FiFilter /> Filter
                    </button>
                </div>
            </div>

            <div className="glass-panel table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Student Name</th>
                            <th>Grade</th>
                            <th>Subject(s)</th>
                            <th>Enrolled Date</th>
                            <th>Assigned Tutor</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.map((student) => (
                            <tr key={student.id}>
                                <td className="font-medium text-muted">{student.id}</td>
                                <td className="font-semibold">{student.name}</td>
                                <td>{student.grade}</td>
                                <td>{student.subject}</td>
                                <td>{new Date(student.enrolledDate).toLocaleDateString()}</td>
                                <td>{student.tutor}</td>
                                <td>
                                    <span className={`status-badge ${getStatusClass(student.status)}`}>
                                        {student.status}
                                    </span>
                                </td>
                                <td>
                                    <div className="flex gap-2" style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button
                                            className="icon-btn text-muted transition-colors"
                                            style={{ color: '#8b8e98' }}
                                            onMouseEnter={(e) => e.currentTarget.style.color = '#b085f5'}
                                            onMouseLeave={(e) => e.currentTarget.style.color = '#8b8e98'}
                                            title="Edit"
                                        >
                                            <FiEdit2 size={18} />
                                        </button>
                                        <button
                                            className="icon-btn text-muted transition-colors"
                                            style={{ color: '#8b8e98' }}
                                            onMouseEnter={(e) => e.currentTarget.style.color = '#f87171'}
                                            onMouseLeave={(e) => e.currentTarget.style.color = '#8b8e98'}
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
        </div>
    );
};

export default Students;
