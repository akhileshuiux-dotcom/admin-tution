import { FiBell, FiSearch, FiUser } from 'react-icons/fi';
import './Header.css';

const Header = () => {
    return (
        <header className="header">
            <div className="header-left">
                <div className="search-bar">
                    <FiSearch className="search-icon" />
                    <input type="text" placeholder="Search students, enquiries, or tutors..." className="search-input" />
                </div>
            </div>

            <div className="header-right">
                <button className="icon-btn">
                    <FiBell />
                    <span className="notification-badge">3</span>
                </button>
                <div className="user-profile">
                    <div className="avatar">
                        <FiUser />
                    </div>
                    <div className="user-info">
                        <span className="user-name">Sarah Jenkins</span>
                        <span className="user-role">Admission Manager</span>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
