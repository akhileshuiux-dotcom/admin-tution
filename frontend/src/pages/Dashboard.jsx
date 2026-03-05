import { useState } from 'react';
import { FiUsers, FiUserPlus, FiBookOpen, FiDollarSign } from 'react-icons/fi';
import './Dashboard.css';
import DemoDetailsModal from '../components/DemoDetailsModal';

const MOCK_DEMOS = [
    { id: 1, studentName: 'John Doe', grade: 'Grade 10', subject: 'Maths', date: 'Today', time: '4:00 PM', meetLink: 'https://meet.google.com/abc-defg-hij', tutor: 'Sarah Jenkins' },
    { id: 2, studentName: 'Emma Smith', grade: 'Grade 8', subject: 'Science', date: 'Tomorrow', time: '10:00 AM', meetLink: 'https://meet.google.com/xyz-uvwx-yz', tutor: 'David Lee' },
    { id: 3, studentName: 'Michael Brown', grade: 'Grade 12', subject: 'Physics', date: 'Mar 10, 2026', time: '2:30 PM', meetLink: 'https://meet.google.com/qwe-rtyu-iop', tutor: 'Robert Fox' }
];

const StatCard = ({ title, value, icon, colorClass }) => (
    <div className={`stat-card glass-panel ${colorClass}`}>
        <div className="stat-icon-wrapper">{icon}</div>
        <div className="stat-info">
            <h3 className="stat-title">{title}</h3>
            <p className="stat-value">{value}</p>
        </div>
    </div>
);

const Dashboard = () => {
    const [selectedDemo, setSelectedDemo] = useState(null);

    return (
        <div className="dashboard animate-fade-in">
            <div className="dashboard-header">
                <h1 className="h1">Good Morning, Sarah</h1>
                <p className="text-muted">Here's what's happening at Guardian Tutoring today.</p>
            </div>

            <div className="stats-grid">
                <StatCard
                    title="Active Students"
                    value="1,248"
                    icon={<FiUsers />}
                    colorClass="primary-card"
                />
                <StatCard
                    title="Open Enquiries"
                    value="42"
                    icon={<FiUserPlus />}
                    colorClass="accent-card"
                />
                <StatCard
                    title="Classes Today"
                    value="156"
                    icon={<FiBookOpen />}
                    colorClass="success-card"
                />
                <StatCard
                    title="Pending Payments"
                    value="18"
                    icon={<FiDollarSign />}
                    colorClass="warning-card"
                />
            </div>

            <div className="dashboard-content">
                <div className="main-panel glass-panel">
                    <h2 className="h2" style={{ marginBottom: '1.5rem' }}>Upcoming Demos</h2>
                    <div className="activity-list">
                        {MOCK_DEMOS.map((demo) => (
                            <div key={demo.id} className="activity-item">
                                <div className="activity-status pending"></div>
                                <div className="activity-details">
                                    <h4 className="activity-name">{demo.studentName} - {demo.grade} {demo.subject}</h4>
                                    <p className="activity-time">{demo.date}, {demo.time} • Google Meet</p>
                                </div>
                                <button className="btn btn-secondary btn-sm" onClick={() => setSelectedDemo(demo)}>View Details</button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="side-panel glass-panel">
                    <h2 className="h2" style={{ marginBottom: '1.5rem' }}>Recent Follow-ups</h2>
                    <div className="followup-list">
                        {[1, 2, 3].map((_, idx) => (
                            <div key={idx} className="followup-item">
                                <div className="avatar-small">
                                    <FiUserPlus />
                                </div>
                                <div className="followup-details">
                                    <h4 className="followup-name">Emma Smith</h4>
                                    <p className="followup-reason">Needs confirmation on timing</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <DemoDetailsModal
                isOpen={!!selectedDemo}
                onClose={() => setSelectedDemo(null)}
                demo={selectedDemo}
            />
        </div>
    );
};

export default Dashboard;
