import { useState, useMemo, useEffect } from 'react';
import { FiUsers, FiUserPlus, FiBookOpen, FiDollarSign, FiCalendar, FiX } from 'react-icons/fi';
import './Dashboard.css';
import DemoDetailsModal from '../components/DemoDetailsModal';

const MOCK_DEMOS = [
    { id: 1, studentName: 'John Doe', grade: 'Grade 10', subject: 'Maths', date: '2026-03-09', time: '4:00 PM', meetLink: 'https://meet.google.com/abc-defg-hij', tutor: 'Sarah Jenkins' },
    { id: 2, studentName: 'Emma Smith', grade: 'Grade 8', subject: 'Science', date: '2026-03-10', time: '10:00 AM', meetLink: 'https://meet.google.com/xyz-uvwx-yz', tutor: 'David Lee' },
    { id: 3, studentName: 'Michael Brown', grade: 'Grade 12', subject: 'Physics', date: '2026-03-11', time: '2:30 PM', meetLink: 'https://meet.google.com/qwe-rtyu-iop', tutor: 'Robert Fox' }
];

import api from '../api';

const StatCard = ({ title, value, icon, colorClass, loading }) => (
    <div className={`stat-card glass-panel ${colorClass}`}>
        <div className="stat-icon-wrapper">{icon}</div>
        <div className="stat-info">
            <h3 className="stat-title">{title}</h3>
            {loading ? (
                <div className="animate-pulse h-6 w-16 bg-white/20 rounded"></div>
            ) : (
                <p className="stat-value">{value}</p>
            )}
        </div>
    </div>
);

const Dashboard = () => {
    const [stats, setStats] = useState({
        students: '0',
        enquiries: '0',
        classes: '0',
        payments: '0'
    });
    const [demos, setDemos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDemo, setSelectedDemo] = useState(null);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [preset, setPreset] = useState('all');

    const filteredDemos = useMemo(() => {
        if (!startDate && !endDate) return demos;
        return demos.filter(demo => {
            if (!demo.date) return true;
            if (startDate && new Date(demo.date) < new Date(startDate)) return false;
            if (endDate && new Date(demo.date) > new Date(endDate)) return false;
            return true;
        });
    }, [startDate, endDate, demos]);

    const handlePresetChange = (p) => {
        setPreset(p);
        const today = new Date();
        const start = new Date();
        if (p === 'all') {
            setStartDate('');
            setEndDate('');
        } else if (p === 'last7') {
            start.setDate(today.getDate() - 7);
            setStartDate(start.toISOString().split('T')[0]);
            setEndDate(today.toISOString().split('T')[0]);
        } else if (p === 'last1w') {
            start.setDate(today.getDate() - 7);
            setStartDate(start.toISOString().split('T')[0]);
            setEndDate(today.toISOString().split('T')[0]);
        } else if (p === 'last1m') {
            start.setMonth(today.getMonth() - 1);
            setStartDate(start.toISOString().split('T')[0]);
            setEndDate(today.toISOString().split('T')[0]);
        }
    };

    const fetchStats = async () => {
        setLoading(true);
        try {
            const [studentsRes, enquiriesRes, sessionsRes, financeRes, demosRes] = await Promise.all([
                api.get('/students/'),
                api.get('/enquiries/'),
                api.get('/sessions/'),
                api.get('/income/financial-summary/'),
                api.get('/enquiries/demo-requests/')
            ]);

            const studentsData = studentsRes.data.results || studentsRes.data;
            const enquiriesData = enquiriesRes.data.results || enquiriesRes.data;
            const sessionsData = sessionsRes.data.results || sessionsRes.data;
            const demoData = demosRes.data.results || demosRes.data;

            // Filter sessions for today
            const today = new Date().toISOString().split('T')[0];
            const sessionsToday = Array.isArray(sessionsData) ? sessionsData.filter(s => s.scheduledDate === today).length : 0;

            setStats({
                students: Array.isArray(studentsData) ? studentsData.length.toLocaleString() : '0',
                enquiries: Array.isArray(enquiriesData) ? enquiriesData.length.toString() : '0',
                classes: sessionsToday.toString(),
                payments: financeRes.data.pendingSalaries ? `RM ${financeRes.data.pendingSalaries}` : '0'
            });

            setDemos(Array.isArray(demoData) ? demoData : []);
        } catch (err) {
            console.error("Failed to fetch dashboard stats:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    return (
        <div className="dashboard animate-fade-in">
            <div className="dashboard-header">
                <div>
                    <h1 className="h1">Good Morning, Sarah</h1>
                    <p className="text-muted">Here's what's happening at Guardian Tutoring today.</p>
                </div>
                <div className="date-filter-group">
                    <div className="preset-options">
                        <button className={`preset-btn ${preset === 'all' ? 'active' : ''}`} onClick={() => handlePresetChange('all')}>All Time</button>
                        <button className={`preset-btn ${preset === 'last7' ? 'active' : ''}`} onClick={() => handlePresetChange('last7')}>7 Days</button>
                        <button className={`preset-btn ${preset === 'last1w' ? 'active' : ''}`} onClick={() => handlePresetChange('last1w')}>1 Week</button>
                        <button className={`preset-btn ${preset === 'last1m' ? 'active' : ''}`} onClick={() => handlePresetChange('last1m')}>1 Month</button>
                        <button className={`preset-btn ${preset === 'custom' ? 'active' : ''}`} onClick={() => setPreset('custom')}>Custom</button>
                    </div>

                    {preset === 'custom' && (
                        <div className="date-filter-container animate-fade-in">
                            <FiCalendar className="date-icon" />
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="date-input"
                            />
                            <span className="date-separator">→</span>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="date-input"
                            />
                            {(startDate || endDate) && (
                                <button className="clear-date" onClick={() => { setStartDate(''); setEndDate(''); setPreset('all'); }}>
                                    <FiX />
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div className="stats-grid">
                <StatCard
                    title="Active Students"
                    value={stats.students}
                    icon={<FiUsers />}
                    colorClass="primary-card"
                    loading={loading}
                />
                <StatCard
                    title="Open Enquiries"
                    value={stats.enquiries}
                    icon={<FiUserPlus />}
                    colorClass="accent-card"
                    loading={loading}
                />
                <StatCard
                    title="Classes Today"
                    value={stats.classes}
                    icon={<FiBookOpen />}
                    colorClass="success-card"
                    loading={loading}
                />
                <StatCard
                    title="Pending Payments"
                    value={stats.payments}
                    icon={<FiDollarSign />}
                    colorClass="warning-card"
                    loading={loading}
                />
            </div>

            <div className="dashboard-content">
                <div className="main-panel glass-panel">
                    <h2 className="h2" style={{ marginBottom: '1.5rem' }}>Upcoming Demos</h2>
                    <div className="activity-list">
                        {filteredDemos.map((demo) => (
                            <div key={demo.id} className="activity-item">
                                <div className="activity-status pending"></div>
                                <div className="activity-details">
                                    <h4 className="activity-name">{demo.studentName} - {demo.grade} {demo.subject}</h4>
                                    <p className="activity-time">{demo.date}, {demo.time} • Google Meet</p>
                                </div>
                                <button className="btn btn-secondary btn-sm" onClick={() => setSelectedDemo(demo)}>View Details</button>
                            </div>
                        ))}
                        {filteredDemos.length === 0 && (
                            <p className="text-muted" style={{ textAlign: 'center', padding: '2rem' }}>No demos found for this date range.</p>
                        )}
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
