import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Bell, Plus, MoreHorizontal, ChevronDown, X, Settings, LogOut, User, HelpCircle, BookOpen, CheckCheck, PlayCircle, CheckCircle, FileText, SlidersHorizontal, Clock } from 'lucide-react';
import api from '../api';

const NOTIFICATIONS = [
  { id: 1, icon: '📝', title: 'New assignment added', body: 'Mrs. Murray added a new Social Studies task.', time: '5 min ago', unread: true },
  { id: 2, icon: '⏰', title: 'Deadline reminder', body: 'Math test preparation is due in 2 days.', time: '1 hr ago', unread: true },
  { id: 3, icon: '📅', title: 'Live class starting soon', body: 'Mathematics with Mrs. Goodman — 10 min.', time: '3 hr ago', unread: false },
];

const NotificationDropdown = ({ onClose, notifications, setNotifications }) => (
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

      <div className="flex items-center gap-2">
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

const TaskDetailModal = ({ task, col, onClose, onProgressUpdate }) => {
  const [localProgress, setLocalProgress] = useState(task.progress ?? 0);
  const progressColor = localProgress >= 75 ? 'bg-emerald-500' : localProgress >= 40 ? 'bg-blue-500' : 'bg-amber-400';

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col"
      >
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-semibold text-slate-800">Task Details</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-bold text-slate-900">{task.title}</h2>
            <p className="text-sm text-slate-500">{task.subject}</p>
          </div>
          <div className="bg-slate-50 rounded-2xl p-4 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-slate-500" />
                <span className="text-sm font-semibold text-slate-700">Current Progress</span>
              </div>
              <span className={`text-sm font-bold px-3 py-1 rounded-full text-white ${progressColor}`}>
                {localProgress}%
              </span>
            </div>
            <input
              type="range" min="0" max="100" step="5"
              value={localProgress}
              onChange={(e) => setLocalProgress(Number(e.target.value))}
              className="w-full h-2 rounded-full appearance-none bg-slate-200 accent-blue-600 cursor-pointer"
            />
            <div className="flex gap-2">
              {[25, 50, 75, 100].map(v => (
                <button
                  key={v} onClick={() => setLocalProgress(v)}
                  className={`flex-1 py-1.5 rounded-xl text-[11px] font-bold border transition-all ${
                    localProgress === v ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200'
                  }`}
                >
                  {v}%
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={() => { onProgressUpdate(task.id, localProgress); onClose(); }}
            className="w-full py-3.5 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
          >
            Update Progress
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

const TaskItem = ({ id, title, subject, date, comments, status, progress, onClick }) => (
  <motion.div 
    whileHover={{ y: -2 }}
    onClick={() => status === 'In progress' && onClick()}
    className={`bg-white p-5 rounded-2xl shadow-sm border border-slate-150 flex flex-col gap-3 transition-all ${
      status === 'In progress' ? 'cursor-pointer hover:border-blue-200' : ''
    }`}
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
      <div className="flex items-center gap-1">
        <Clock className="w-3.5 h-3.5" />
        <span>{date}</span>
      </div>
      {status === 'In progress' ? (
        <span className="text-blue-600 font-semibold group flex items-center gap-1">
          Update <SlidersHorizontal className="w-3 h-3 transition-transform group-hover:rotate-180" />
        </span>
      ) : (
        <span>{comments} comments</span>
      )}
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
  const [tasks, setTasks] = useState([]);
  const [notes, setNotes] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [tResp, nResp] = await Promise.all([
        api.get('/exams/'), // Using exams as tasks for now, or if there's a specific task model
        api.get('/resources/'),
      ]);
      
      // Transform backend exams to dashboard tasks if needed
      const backendTasks = tResp.data.map(ex => ({
        id: ex.id,
        title: ex.title,
        subject: ex.course_name || 'General',
        date: new Date(ex.scheduled_date).toLocaleDateString(),
        status: ex.is_active ? 'In progress' : 'To do',
        progress: 0 // Mock progress for now as it's not in the backend Exam model
      }));

      setTasks(backendTasks.slice(0, 4));
      
      // Transform resources to notes
      const backendNotes = nResp.data.map(res => ({
        id: res.id,
        title: res.title,
        content: `Type: ${res.file_type.toUpperCase()}`,
        date: new Date().toLocaleDateString(), // Mock date
        color: res.file_type === 'pdf' ? 'bg-emerald-100 border border-emerald-200' : 'bg-indigo-100 border border-indigo-200'
      }));
      
      setNotes(backendNotes.slice(0, 2));

    } catch (err) {
      console.error("Failed to fetch dashboard data", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProgress = (taskId, newProgress) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, progress: newProgress } : t));
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      <DashboardHeader user={user} onLogout={onLogout} />
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
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
            {tasks.map(task => (
              <TaskItem 
                key={task.id} 
                {...task} 
                onClick={() => setSelectedTask(task)}
              />
            ))}
          </div>
          <button className="py-3 rounded-xl bg-white border border-slate-200 text-[12px] font-medium text-slate-600 hover:text-slate-900 hover:border-slate-300 transition-all shadow-sm">
            View all tasks →
          </button>
        </div>
        <AnimatePresence>
          {selectedTask && (
            <TaskDetailModal 
              task={selectedTask} 
              onClose={() => setSelectedTask(null)}
              onProgressUpdate={handleUpdateProgress}
            />
          )}
        </AnimatePresence>
        <div className="xl:col-span-7 flex flex-col gap-8">
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h3 className="text-[20px] font-semibold text-slate-800">My notes</h3>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {notes.length > 0 ? notes.map(note => (
                <NoteCard key={note.id} {...note} />
              )) : (
                <p className="text-slate-400 text-sm">No notes available.</p>
              )}
            </div>
          </div>
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
