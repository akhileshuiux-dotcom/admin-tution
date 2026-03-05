import { useRef } from 'react';
import { FiBell, FiSearch, FiUser, FiX } from 'react-icons/fi';
import './Header.css';
import { useSearch } from '../context/SearchContext';

const Header = () => {
    const { searchQuery, setSearchQuery } = useSearch();
    const inputRef = useRef(null);

    const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
            setSearchQuery('');
            inputRef.current?.blur();
        }
    };

    return (
        <header className="header">
            <div className="header-left">
                <div className="search-bar">
                    <FiSearch className="search-icon" />
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Search students, enquiries, tutors, sessions..."
                        className="search-input"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                    {searchQuery && (
                        <button
                            className="search-clear-btn"
                            onClick={() => { setSearchQuery(''); inputRef.current?.focus(); }}
                            title="Clear search (Esc)"
                        >
                            <FiX size={14} />
                        </button>
                    )}
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
