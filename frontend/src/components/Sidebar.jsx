import { Link, useLocation } from 'react-router-dom';
import {
    FiHome,
    FiUsers,
    FiFileText,
    FiCalendar,
    FiDollarSign,
    FiSettings,
    FiUserPlus,
    FiLogOut
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = () => {
    const location = useLocation();
    const { signOut } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        if (window.confirm('Are you sure you want to log out?')) {
            await signOut();
            navigate('/login');
        }
    };

    const navItems = [
        { path: '/dashboard', label: 'Dashboard', icon: <FiHome /> },
        { path: '/enquiries', label: 'Enquiries', icon: <FiUserPlus /> },
        { path: '/students', label: 'Students', icon: <FiUsers /> },
        { path: '/tutors', label: 'Tutors', icon: <FiFileText /> },
        { path: '/schedule', label: 'Schedule', icon: <FiCalendar /> },
        { path: '/payments', label: 'Payments', icon: <FiDollarSign /> },
    ];

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <div className="logo-icon">GT</div>
                <h2 className="sidebar-title">Guardian</h2>
            </div>

            <nav className="sidebar-nav">
                {navItems.map((item) => {
                    const isActive = location.pathname.startsWith(item.path);
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`nav-item ${isActive ? 'active' : ''}`}
                        >
                            <div className="nav-icon">{item.icon}</div>
                            <span className="nav-label">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="sidebar-footer">
                <Link to="/settings" className={`nav-item ${location.pathname.startsWith('/settings') ? 'active' : ''}`}>
                    <div className="nav-icon"><FiSettings /></div>
                    <span className="nav-label">Settings</span>
                </Link>
                <button className="nav-item logout-nav-item" onClick={handleLogout}>
                    <div className="nav-icon"><FiLogOut /></div>
                    <span className="nav-label">Log Out</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
