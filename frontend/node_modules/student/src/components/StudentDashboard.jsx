import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Bell, Plus, MoreHorizontal, ChevronDown, X, Settings, LogOut, User, HelpCircle, BookOpen, CheckCheck } from 'lucide-react';

// ─── Notification Dropdown ────────────────────────────────────────────────────
const NOTIFICATIONS = [
  { id: 1, icon: '📝', title: 'New assignment added', body: 'Mrs. Murray added a new Social Studies task.', time: '5 min ago', unread: true },
  { id: 2, icon: '⏰', title: 'Deadline reminder', body: 'Math test preparation is due in 2 days.', time: '1 hr ago', unread: true },
  { id: 3, icon: '📅', title: 'Live class starting soon', body: 'Mathematics with Mrs. Goodman — 10 min.', time: '3 hr ago', unread: false },
];

const NotificationDropdown = ({ onClose, onMarkAllRead, notifications, setNotifications }) => (
  <motion.div
    initial={{ opacity: 0, y: -8, scale: 0.97 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: -8, scale: 0.97 }}
    transition={{ duration: 0.15 }}
    className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 overflow-hidden"
  >
    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
      <h4 className="text-[14px] font-semibold text-slate-800">Notifications</h4>
      <button onClick={() => {
        setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
      }} className="flex items-center gap-1 text-[11px] text-blue-600 hover:underline">
        <CheckCheck className="w-3 h-3" /> Mark all read
      </button>
    </div>
    <div className="flex flex-col divide-y divide-slate-50">
      {notifications.map(n => (
        <div
          key={n.id}
          onClick={() => setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, unread: false } : x))}
          className={`flex gap-3 px-4 py-3 cursor-pointer hover:bg-slate-50 transition-all ${n.unread ? 'bg-blue-50/50' : ''}`}
        >
          <span className="text-xl flex-shrink-0">{n.icon}</span>
          <div className="flex-grow min-w-0">
            <p className="text-[13px] font-semibold text-slate-800 flex items-center gap-2">
              {n.title} {n.unread && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block" />}
            </p>
            <p className="text-[12px] text-slate-500 leading-snug mt-0.5">{n.body}</p>
            <p className="text-[10px] text-slate-400 mt-1">{n.time}</p>
          </div>
        </div>
      ))}
    </div>
    <div className="px-4 py-2.5 border-t border-slate-100 text-center">
      <button className="text-[12px] text-blue-600 hover:underline">View all notifications</button>
    </div>
  </motion.div>
);

// ─── Profile Dropdown ─────────────────────────────────────────────────────────
const ProfileDropdown = ({ user, onLogout }) => (
  <motion.div
    initial={{ opacity: 0, y: -8, scale: 0.97 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: -8, scale: 0.97 }}
    transition={{ duration: 0.15 }}
    className="absolute right-0 top-full mt-2 w-60 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 overflow-hidden"
  >
    <div className="px-4 py-4 bg-slate-50 border-b border-slate-100">
      <p className="text-[14px] font-semibold text-slate-800">{user?.first_name} {user?.last_name}</p>
      <p className="text-[12px] text-slate-500 mt-0.5">{user?.email || 'student@eduway.com'}</p>
      <span className="inline-block mt-2 text-[10px] font-semibold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full uppercase">Class 9A</span>
    </div>
    <div className="flex flex-col py-1">
      {[
        { icon: User, label: 'My Profile', action: null },
        { icon: Settings, label: 'Settings', action: null },
        { icon: BookOpen, label: 'Academic Records', action: null },
        { icon: HelpCircle, label: 'Help & Support', action: null },
      ].map(({ icon: Icon, label, action }) => (
        <button key={label} onClick={action} className="flex items-center gap-3 px-4 py-2.5 text-[13px] text-slate-700 hover:bg-slate-50 transition-all text-left w-full">
          <Icon className="w-4 h-4 text-slate-400" />{label}
        </button>
      ))}
      <div className="border-t border-slate-100 mt-1" />
      <button
        onClick={onLogout}
        className="flex items-center gap-3 px-4 py-2.5 text-[13px] text-red-600 hover:bg-red-50 transition-all text-left w-full"
      >
        <LogOut className="w-4 h-4" /> Log out
      </button>
    </div>
  </motion.div>
);

// ─── Menu Dropdown ────────────────────────────────────────────────────────────
const MenuDropdown = () => (
  <motion.div
    initial={{ opacity: 0, y: -8, scale: 0.97 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: -8, scale: 0.97 }}
    transition={{ duration: 0.15 }}
    className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 overflow-hidden"
  >
    <div className="flex flex-col py-1">
      {['Download App', 'Dark Mode', 'Language', 'Accessibility', 'Report a Bug'].map(item => (
        <button key={item} className="px-4 py-2.5 text-[13px] text-slate-700 hover:bg-slate-50 transition-all text-left w-full">
          {item}
        </button>
      ))}
    </div>
  </motion.div>
);

// ─── Dashboard Header ─────────────────────────────────────────────────────────
const DashboardHeader = ({ user, onLogout }) => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifs, setShowNotifs] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [notifications, setNotifications] = useState(NOTIFICATIONS);

  const unreadCount = notifications.filter(n => n.unread).length;

  const headerRef = useRef(null);
  useEffect(() => {
    const handler = (e) => {
      if (headerRef.current && !headerRef.current.contains(e.target)) {
        setShowNotifs(false);
        setShowProfile(false);
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={headerRef} className="flex justify-between items-center bg-white/60 backdrop-blur-sm px-4 py-3 rounded-2xl border border-white/60 shadow-sm relative">
      {/* Search */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => { setSearchOpen(v => !v); setSearchQuery(''); }}
          className="bg-slate-800 p-2.5 rounded-xl hover:bg-slate-700 transition-all"
        >
          {searchOpen ? <X className="w-4 h-4 text-white" /> : <Search className="w-4 h-4 text-white" />}
        </button>
        <AnimatePresence>
          {searchOpen && (
            <motion.input
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 260, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              autoFocus
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search tasks, notes, subjects..."
              className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-[13px] text-slate-800 placeholder:text-slate-400 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 overflow-hidden"
            />
          )}
        </AnimatePresence>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2">
        
        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => { setShowNotifs(v => !v); setShowProfile(false); setShowMenu(false); }}
            className={`p-2.5 rounded-xl transition-all ${showNotifs ? 'bg-indigo-100 text-indigo-700' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'}`}
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-pink-500 text-white text-[9px] font-semibold rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>
          <AnimatePresence>
            {showNotifs && (
              <NotificationDropdown
                notifications={notifications}
                setNotifications={setNotifications}
                onClose={() => setShowNotifs(false)}
              />
            )}
          </AnimatePresence>
        </div>

        {/* Profile */}
        <div className="relative">
          <button
            onClick={() => { setShowProfile(v => !v); setShowNotifs(false); setShowMenu(false); }}
            className={`flex items-center gap-3 px-3 py-2 rounded-xl border transition-all ${showProfile ? 'bg-slate-100 border-blue-300' : 'bg-white border-slate-200 hover:border-blue-300'}`}
          >
            <img
              src={`https://ui-avatars.com/api/?name=${user?.first_name}+${user?.last_name}&background=1e293b&color=fff&size=32`}
              alt="Profile"
              className="w-8 h-8 rounded-lg"
            />
            <div className="flex flex-col text-left">
              <span className="text-[13px] font-semibold text-slate-800 leading-none">{user?.first_name} {user?.last_name}</span>
              <span className="text-[11px] text-slate-500 leading-none mt-0.5">Class 9A</span>
            </div>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${showProfile ? 'rotate-180' : ''}`} />
          </button>
          <AnimatePresence>
            {showProfile && <ProfileDropdown user={user} onLogout={onLogout} />}
          </AnimatePresence>
        </div>

        {/* 3-dot Menu */}
        <div className="relative">
          <button
            onClick={() => { setShowMenu(v => !v); setShowNotifs(false); setShowProfile(false); }}
            className={`p-2.5 rounded-xl transition-all ${showMenu ? 'bg-slate-100 text-slate-800' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'}`}
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
          <AnimatePresence>
            {showMenu && <MenuDropdown />}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};


const TaskItem = ({ title, subject, date, comments, status, progress }) => (
  <motion.div 
    whileHover={{ y: -2 }}
    className="bg-white p-5 rounded-2xl shadow-sm border border-slate-150 flex flex-col gap-3 cursor-pointer"
  >
    <div className="flex justify-between items-start gap-3">
      <div className="flex flex-col gap-1 flex-grow min-w-0">
        <h4 className="text-[15px] font-semibold text-slate-800 leading-snug">{title}</h4>
        <p className="text-[13px] text-slate-500">{subject}</p>
      </div>
      <span className={`flex-shrink-0 px-3 py-1 rounded-full text-[11px] font-medium uppercase ${
        status === 'In progress' ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-600'
      }`}>
        {status}
      </span>
    </div>
    <div className="flex justify-between items-center text-[12px] text-slate-500">
      <span>{date}</span>
      <span>{comments} comments</span>
    </div>
    {progress !== undefined && (
      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full bg-emerald-500 transition-all" style={{ width: `${progress}%` }} />
      </div>
    )}
  </motion.div>
);

const NoteCard = ({ title, content, date, color }) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    className={`p-5 rounded-2xl flex flex-col gap-3 min-w-[260px] shadow-sm flex-shrink-0 ${color}`}
  >
    <div className="flex justify-between items-center">
      <h4 className="text-[16px] font-semibold text-slate-900">{title}</h4>
      <MoreHorizontal className="w-4 h-4 text-slate-600 opacity-60" />
    </div>
    <p className="text-[13px] text-slate-700 leading-relaxed">
      {content}
    </p>
    <span className="text-[11px] text-slate-600 uppercase tracking-wide">{date}</span>
  </motion.div>
);

const ScheduleRow = ({ time, lesson, teacher, location, avatar }) => (
  <div className="flex items-center p-3 rounded-xl hover:bg-white/60 transition-all">
    <div className="w-20 flex-shrink-0">
      <span className="text-[13px] font-semibold text-slate-800">{time}</span>
    </div>
    <div className="w-20 flex-shrink-0">
      <span className="text-[13px] text-slate-700">{lesson}</span>
    </div>
    <div className="flex-grow flex items-center gap-2">
      <img
        src={avatar || `https://ui-avatars.com/api/?name=${teacher}&background=random&size=32`}
        alt={teacher}
        className="w-7 h-7 rounded-full"
      />
      <span className="text-[13px] text-slate-700">{teacher}</span>
    </div>
    <div className="flex-shrink-0 text-right">
      <span className="text-[12px] text-slate-500">{location}</span>
    </div>
  </div>
);

const StudentDashboard = ({ user, onLogout }) => {
  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Header */}
      <DashboardHeader user={user} onLogout={onLogout} />

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Left Column: Tasks */}
        <div className="xl:col-span-5 flex flex-col gap-5">
          <div className="flex justify-between items-center">
            <h3 className="text-[20px] font-semibold text-slate-800">My tasks</h3>
          </div>

          <div className="flex gap-1.5 p-1 bg-slate-100 rounded-xl w-full">
            {['All task', 'To do', 'In progress', 'Done'].map(tag => (
              <span key={tag} className={`flex-1 text-center px-2 py-1.5 rounded-lg text-[11px] font-medium cursor-pointer transition-all ${
                tag === 'All task'
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}>
                {tag}
              </span>
            ))}
          </div>

          <div className="flex flex-col gap-3">
            <TaskItem title="Read poem & answer questions" subject="English Literature" date="Apr 28, 2025" comments="12" status="In progress" progress={45} />
            <TaskItem title="Create a comic strip with a story" subject="Social Studies" date="May 17, 2025" comments="0" status="To do" />
            <TaskItem title="Prepare for the math test" subject="Math" date="May 11, 2025" comments="2" status="To do" />
            <TaskItem title="Read poem & answer questions" subject="English Literature" date="Apr 28, 2025" comments="12" status="To do" />
          </div>

          <button className="py-3 rounded-xl bg-white border border-slate-200 text-[12px] font-medium text-slate-600 hover:text-slate-900 hover:border-slate-300 transition-all shadow-sm">
            View all tasks →
          </button>
        </div>

        {/* Right Column: Notes & Schedule */}
        <div className="xl:col-span-7 flex flex-col gap-8">
          {/* My Notes */}
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h3 className="text-[20px] font-semibold text-slate-800">My notes</h3>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2">
              <NoteCard title="Math conspect" color="bg-emerald-100 border border-emerald-200" date="May 05, 2025" content="A linear equation is of the form: ax+b=c, where x is the unknown variable..." />
              <NoteCard title="Biology conspect" color="bg-indigo-100 border border-indigo-200" date="Apr 29, 2025" content="A cell is the basic structural, functional, and biological unit of all living organisms..." />
            </div>
          </div>

          {/* My Schedule */}
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h3 className="text-[20px] font-semibold text-slate-800">My schedule</h3>
              <div className="flex items-center gap-1.5 bg-white px-3 py-2 rounded-xl border border-slate-200 text-[12px] font-medium text-slate-700 cursor-pointer hover:border-slate-300 transition-all">
                <span>May 14, Mon</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </div>
            </div>
            <div className="bg-white rounded-2xl p-3 flex flex-col divide-y divide-slate-100 border border-slate-100 shadow-sm">
              <ScheduleRow time="8:30 AM" lesson="Math" teacher="Mrs. Goodman" location="B3, Room 124" />
              <ScheduleRow time="10:30 AM" lesson="ELA" teacher="Ms. Melton" location="B2, Room 158" />
              <ScheduleRow time="12:00 PM" lesson="Biology" teacher="Mr. Hodge" location="B3, Room 310" />
              <ScheduleRow time="2:00 PM" lesson="Social" teacher="Mrs. Murray" location="B1, Room 112" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
