import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Bell, X, ChevronDown, MoreHorizontal, CheckCheck } from 'lucide-react';
import ProfileDropdown from './ProfileDropdown';
import NotificationPanel from './NotificationPanel';

const DashboardHeader = ({ user, onLogout, onNavigate }) => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifs, setShowNotifs] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  
  const headerRef = useRef(null);
  
  useEffect(() => {
    const handler = (e) => {
      if (headerRef.current && !headerRef.current.contains(e.target)) {
        setShowNotifs(false);
        setShowProfile(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const displayName = user?.first_name 
    ? `${user.first_name} ${user.last_name || ''}`.trim() 
    : user?.username || 'User';

  return (
    <div ref={headerRef} 
      style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)', boxShadow: 'var(--card-shadow)' }}
      className="flex justify-between items-center px-5 py-4 rounded-[2rem] border backdrop-blur-md relative z-40 transition-all duration-300">
      {/* Search Bar */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => { setSearchOpen(v => !v); setSearchQuery(''); }}
          className="bg-slate-900 p-3 rounded-2xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10"
        >
          {searchOpen ? <X className="w-4 h-4 text-white" /> : <Search className="w-4 h-4 text-white" />}
        </button>
        <AnimatePresence>
          {searchOpen && (
            <motion.input
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 280, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              autoFocus
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search anything..."
              className="bg-white border border-slate-200 rounded-2xl px-5 py-3 text-[13px] text-slate-800 placeholder:text-slate-400 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/5 transition-all"
            />
          )}
        </AnimatePresence>
      </div>

      {/* Actions & Profile */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => { setShowNotifs(v => !v); setShowProfile(false); }}
            style={{ background: showNotifs ? 'var(--nav-active-bg)' : 'var(--card-bg)', borderColor: 'var(--card-border)', color: showNotifs ? 'var(--nav-active-text)' : 'var(--text-muted)' }}
            className={`p-3 rounded-2xl transition-all relative border`}
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-2.5 right-2.5 w-4 h-4 bg-rose-500 border-2 border-white rounded-full flex items-center justify-center text-[8px] font-black text-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          <AnimatePresence>
            {showNotifs && (
              <NotificationPanel 
                onClose={() => setShowNotifs(false)} 
                onUnreadCountChange={setUnreadCount}
              />
            )}
          </AnimatePresence>
        </div>

        <div className="h-10 w-px bg-slate-100 mx-1" />

        {/* Profile Dropdown Toggle */}
        <div className="relative">
          <button
            onClick={() => { setShowProfile(v => !v); setShowNotifs(false); }}
            style={{ background: 'var(--card-bg)', borderColor: showProfile ? 'var(--nav-active-text)' : 'var(--card-border)' }}
            className={`flex items-center gap-4 px-3 py-2 rounded-2xl border transition-all ${showProfile ? 'shadow-md' : ''}`}
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-indigo-500/20">
              {displayName[0]?.toUpperCase()}
            </div>
            <div className="flex flex-col text-left hidden sm:flex">
              <span style={{ color: 'var(--text-main)' }} className="text-[13px] font-bold leading-none">{displayName}</span>
              <span style={{ color: 'var(--text-muted)' }} className="text-[10px] font-black uppercase tracking-widest mt-1">{user?.role || 'Student'}</span>
            </div>
            <ChevronDown style={{ color: showProfile ? 'var(--nav-active-text)' : 'var(--text-muted)' }} className={`w-4 h-4 transition-transform duration-300 ${showProfile ? 'rotate-180' : ''}`} />
          </button>
          
          <AnimatePresence>
            {showProfile && (
              <ProfileDropdown 
                user={user} 
                onLogout={onLogout} 
                onNavigate={(view) => {
                  setShowProfile(false);
                  onNavigate(view);
                }} 
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
