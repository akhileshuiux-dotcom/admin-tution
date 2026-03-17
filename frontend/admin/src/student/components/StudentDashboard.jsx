import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Bell, MoreHorizontal, ChevronDown, X, 
  Settings, LogOut, User, HelpCircle, BookOpen, 
  CheckCheck, Clock, MessageSquare, ArrowUpRight,
  TrendingUp, Calendar, Layout, FileText, Plus, PlayCircle, CheckCircle, SlidersHorizontal
} from 'lucide-react';
import TaskDetailModal from './TaskDetailModal';

// ─── Data ────────────────────────────────────────────────────────────────────
const NOTIFICATIONS = [
  { id: 1, icon: '📝', title: 'New assignment added', body: 'Mrs. Murray added a new Social Studies task.', time: '5 min ago', unread: true },
  { id: 2, icon: '⏰', title: 'Deadline reminder', body: 'Math test preparation is due in 2 days.', time: '1 hr ago', unread: true },
  { id: 3, icon: '📅', title: 'Live class starting soon', body: 'Mathematics with Mrs. Goodman — 10 min.', time: '3 hr ago', unread: false },
];

const STORAGE_KEY = 'eduway_student_tasks';

const INITIAL_TASKS = {
  'To Do': [
    { id: 1, title: 'Create a comic strip with a story', subject: 'Social Studies', due: 'May 17', teacher: 'Mrs. Murray', priority: 'medium', description: 'Create a 6-panel comic strip illustrating a historical event of your choice. Include dialogue and captions. Submit as PDF.', attachment: 'Comic_Template.pdf' },
    { id: 2, title: 'Prepare for the math test', subject: 'Math', due: 'May 11', teacher: 'Mrs. Goodman', priority: 'high', description: 'Study Chapter 3 (Linear Equations) and Chapter 4 (Quadratic Equations). Review examples from pages 45–72. Practice all end-of-chapter exercises.', attachment: null },
  ],
  'In Progress': [
    { id: 3, title: 'Read poem & answer questions', subject: 'English Literature', due: 'Apr 28', teacher: 'Ms. Melton', priority: 'high', progress: 45, description: 'Read "The Road Not Taken" by Robert Frost. Answer the 5 comprehension questions on the worksheet. Write a short reflection (150 words).', attachment: 'Poem_Worksheet.docx' },
  ],
  'Done': [
    { id: 4, title: 'Biology lab report', subject: 'Biology', due: 'Apr 20', teacher: 'Mr. Hodge', priority: 'low', submitted: true, description: 'Lab report on the cell structure experiment. Include methodology, observations, and conclusion.', attachment: 'Lab_Report_Template.docx' },
  ],
};

const NOTES = [
  { id: 1, title: "Math conspect", date: "May 05, 2025", content: "A linear equation is an equation of the form: ax+b=c, where x is the variable, a, b, and c are constants, and a ≠ 0.", color: "bg-[#bbf7d0]" },
  { id: 2, title: "Biology conspect", date: "Apr 29, 2025", content: "A cell is the basic structural, functional, and biological unit of all living organisms. It is the smallest unit capable of performing life functions.", color: "bg-[#a5b4fc]" },
];

const SCHEDULE = [
  { time: '8:30 AM', lesson: 'Math', teacher: 'Mrs. Goodman', location: 'B3, Room 124', active: true },
  { time: '10:30 AM', lesson: 'ELA', teacher: 'Ms. Melton', location: 'B2, Room 158' },
  { time: '12:00 PM', lesson: 'Biology', teacher: 'Mr. Hodge', location: 'B3, Room 310' },
  { time: '2:00 PM', lesson: 'Social', teacher: 'Mrs. Murray', location: 'B1, Room 112' },
];

// ─── Sub-Components ──────────────────────────────────────────────────────────

const NotificationDropdown = ({ onClose, notifications, setNotifications }) => (
  <motion.div
    initial={{ opacity: 0, y: -20, scale: 0.95 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: -20, scale: 0.95 }}
    className="absolute right-0 top-full mt-4 w-[380px] bg-white/80 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.1)] border border-white/50 z-[200] overflow-hidden"
  >
    <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100/50">
      <h4 className="text-[17px] font-bold text-slate-900 font-plus-jakarta">Notifications</h4>
      <button onClick={() => {
        setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
      }} className="flex items-center gap-2 text-[12px] font-bold text-blue-600 hover:text-blue-700">
        <CheckCheck className="w-4 h-4" /> Mark all read
      </button>
    </div>
    <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
      {notifications.map(n => (
        <div
          key={n.id}
          className={`px-8 py-5 cursor-pointer hover:bg-slate-50/50 transition-all border-b border-slate-50 last:border-0 ${n.unread ? 'bg-blue-50/30' : ''}`}
        >
          <div className="flex gap-4">
            <span className="text-2xl mt-1">{n.icon}</span>
            <div className="flex-grow min-w-0">
              <p className="text-[14px] font-bold text-slate-900 truncate">
                {n.title}
              </p>
              <p className="text-[13px] font-medium text-slate-500 leading-snug mt-1">{n.body}</p>
              <p className="text-[11px] font-semibold text-slate-400 mt-2 flex items-center gap-1.5 uppercase tracking-wider">
                <Clock className="w-3 h-3" /> {n.time}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
    <div className="px-8 py-5 bg-slate-50/50 flex justify-center">
      <button className="text-[13px] font-bold text-slate-400 hover:text-blue-600 transition-colors uppercase tracking-widest">View all</button>
    </div>
  </motion.div>
);

const ProfileDropdown = ({ user, onLogout }) => (
  <motion.div
    initial={{ opacity: 0, y: -20, scale: 0.95 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: -20, scale: 0.95 }}
    className="absolute right-0 top-full mt-4 w-72 bg-white/80 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.1)] border border-white/50 z-[200] overflow-hidden p-2"
  >
    <div className="px-6 py-6 bg-slate-900 rounded-[2rem] text-white overflow-hidden relative group">
      <div className="absolute inset-0 bg-blue-600 opacity-0 group-hover:opacity-10 transition-opacity" />
      <p className="text-[16px] font-bold font-plus-jakarta">
        {user?.user?.first_name || user?.first_name} {user?.user?.last_name || user?.last_name}
      </p>
      <p className="text-[12px] opacity-60 font-medium truncate mt-1">{user?.user?.email || user?.email}</p>
      <div className="mt-4 flex items-center gap-2">
        <span className="bg-white/20 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">Student ID: 22045</span>
      </div>
    </div>
    <div className="mt-2 space-y-1">
      {[
        { icon: User, label: 'Profile', color: 'text-slate-600' },
        { icon: TrendingUp, label: 'Performance', color: 'text-slate-600' },
        { icon: Calendar, label: 'Schedule', color: 'text-slate-600' },
        { icon: Settings, label: 'Preferences', color: 'text-slate-600' },
      ].map(({ icon: Icon, label, color }) => (
        <button key={label} className="w-full flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-all rounded-2xl group text-left">
          <div className="flex items-center gap-3">
            <Icon className={`w-4 h-4 ${color}`} />
            <span className="text-[14px] font-bold text-slate-700 font-plus-jakarta">{label}</span>
          </div>
          <ChevronDown className="w-4 h-4 text-slate-300 -rotate-90 opacity-0 group-hover:opacity-100 transition-all" />
        </button>
      ))}
      <div className="h-px bg-slate-100 mx-4 my-2" />
      <button
        onClick={onLogout}
        className="w-full flex items-center gap-3 px-6 py-4 text-rose-600 hover:bg-rose-50 transition-all rounded-2xl font-bold text-[14px]"
      >
        <LogOut className="w-4 h-4" /> Log out
      </button>
    </div>
  </motion.div>
);

const TaskCard = ({ title, subject, due, status, progress }) => (
  <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-pointer">
    <div className="flex justify-between items-start mb-2">
      <span className="text-[12px] font-semibold text-slate-500">{subject}</span>
      <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase ${
        status === 'In Progress' ? 'bg-[#fef3c7] text-[#92400e]' : status === 'Done' ? 'bg-emerald-100 text-emerald-700' : 'bg-[#e0e7ff] text-[#3730a3]'
      }`}>
        {status}
      </span>
    </div>
    <h4 className="text-[16px] font-bold text-slate-800 mb-4">{title}</h4>
    
    <div className="flex gap-1 mb-4 h-2.5">
      {[...Array(10)].map((_, i) => (
        <div 
          key={i} 
          className={`flex-1 rounded-full ${
            i < (progress / 10) 
              ? 'bg-[#22c55e] opacity-50' 
              : 'bg-slate-100 border-2 border-slate-200 border-dashed border-opacity-20'
          }`}
          style={i < (progress / 10) ? { backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(255,255,255,0.2) 5px, rgba(255,255,255,0.2) 10px)' } : {}}
        />
      ))}
    </div>
 
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-1 text-slate-500">
        <span className="text-[11px] font-semibold">{due}</span>
      </div>
      <div className="flex items-center gap-1 text-slate-500 text-right">
        <span className="text-[11px] font-semibold">{progress || 0}% complete</span>
      </div>
    </div>
  </div>
);

const NoteCard = ({ title, date, content, color }) => (
  <div className={`${color} rounded-[2rem] p-6 min-w-[300px] flex-1 flex flex-col`}>
    <div className="flex justify-between items-center mb-6">
      <h4 className="text-[18px] font-bold text-slate-800">{title}</h4>
    </div>
    <p className="text-[14px] font-medium text-slate-800 mb-10 leading-relaxed flex-grow">{content}</p>
    <span className="text-[12px] font-bold text-slate-500">{date}</span>
  </div>
);

const ScheduleItem = ({ time, lesson, teacher, location, active }) => (
  <div className={`grid grid-cols-[80px_100px_1fr_100px] items-center gap-4 py-4 border-b border-slate-50 last:border-0`}>
    <span className="text-[14px] font-bold text-slate-800">{time}</span>
    <span className="text-[14px] font-bold text-slate-800">{lesson}</span>
    <div className="flex items-center gap-3">
      <img src={`https://ui-avatars.com/api/?name=${teacher}&background=random`} className="w-8 h-8 rounded-full" alt={teacher}/>
      <span className="text-[14px] font-bold text-slate-800">{teacher}</span>
    </div>
    <span className="text-[14px] font-semibold text-slate-500 text-right truncate">{location}</span>
  </div>
);

// ─── Main Component ──────────────────────────────────────────────────────────

const StudentDashboard = ({ user, onLogout }) => {
  const [showNotifs, setShowNotifs] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showMoreHeader, setShowMoreHeader] = useState(false);
  const [activeNoteMenu, setActiveNoteMenu] = useState(null);
  const [notifications, setNotifications] = useState(NOTIFICATIONS);
  const [tasks, setTasks] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : INITIAL_TASKS;
    } catch (error) {
      return INITIAL_TASKS;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  // Click outside to close menus
  useEffect(() => {
    const handleClick = () => {
      setShowMoreHeader(false);
      setActiveNoteMenu(null);
      setActiveTaskMenu(null);
    };
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);
  const [activeTaskMenu, setActiveTaskMenu] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [activeTab, setActiveTab] = useState('All task');

  const handleTaskStart = (task) => {
    setTasks(prev => {
      const todo = prev['To Do'].filter(t => t.id !== task.id);
      const inProg = [...prev['In Progress'], { ...task, progress: 0 }];
      return { ...prev, 'To Do': todo, 'In Progress': inProg };
    });
    setSelectedTask(null);
  };

  const handleTaskComplete = (task) => {
    setTasks(prev => {
      const inProg = prev['In Progress'].filter(t => t.id !== task.id);
      const done = [...prev['Done'], { ...task, submitted: true }];
      return { ...prev, 'In Progress': inProg, 'Done': done };
    });
    setSelectedTask(null);
  };

  const handleTaskProgressUpdate = (task, newProgress) => {
    setTasks(prev => ({
      ...prev,
      'In Progress': prev['In Progress'].map(t =>
        t.id === task.id ? { ...t, progress: newProgress } : t
      ),
    }));
    setSelectedTask(null);
  };

  const flatTasks = Object.entries(tasks).flatMap(([status, list]) => 
    list.map(t => ({ ...t, status }))
  ).sort((a, b) => {
    // Show In Progress first
    if (a.status === 'In Progress' && b.status !== 'In Progress') return -1;
    if (a.status !== 'In Progress' && b.status === 'In Progress') return 1;
    return 0;
  });

  return (
    <div className="flex flex-col gap-10 font-plus-jakarta pb-20 relative">
      
      {/* Background Ornaments to "feel the gap" - Enhanced Visibility */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] bg-emerald-100 rounded-full blur-[150px] opacity-70" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[700px] h-[700px] bg-purple-100 rounded-full blur-[180px] opacity-70" />
        <div className="absolute top-[30%] right-[-5%] w-[400px] h-[400px] bg-blue-100 rounded-full blur-[120px] opacity-50" />
        
        {/* Floating Decorative Boxes (Actual Boxes) */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={`box-${i}`}
            initial={{ rotate: Math.random() * 360, opacity: 0 }}
            animate={{ 
              y: [0, Math.random() * 60 - 30, 0],
              x: [0, Math.random() * 40 - 20, 0],
              rotate: [0, 10, -10, 0],
              opacity: 0.4
            }}
            transition={{ 
              duration: 10 + Math.random() * 10, 
              repeat: Infinity,
              delay: Math.random() * 5
            }}
            className="absolute rounded-3xl bg-white shadow-[0_8px_32px_rgba(0,0,0,0.03)] border border-white/50 backdrop-blur-sm"
            style={{
              width: Math.random() * 100 + 50,
              height: Math.random() * 100 + 50,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}

        {/* Decorative Floating Dots */}
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={`dot-${i}`}
            animate={{ 
              y: [0, Math.random() * 40 - 20, 0],
              opacity: [0.2, 0.5, 0.2]
            }}
            transition={{ 
              duration: 5 + Math.random() * 5, 
              repeat: Infinity,
              delay: Math.random() * 5
            }}
            className="absolute rounded-full bg-slate-300"
            style={{
              width: Math.random() * 12 + 6,
              height: Math.random() * 12 + 6,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex flex-col gap-10">
      
      {/* Top Header */}
      <div className="flex items-center justify-between gap-6 mb-4">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
             <div className="w-12 h-12 bg-[#22c55e] rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <span className="text-white font-black text-2xl">A</span>
             </div>
             <span className="text-[28px] font-black text-slate-900 tracking-tight">EduWay</span>
          </div>

          <div className="h-10 w-px bg-slate-200" />
          
          <div className="flex items-center gap-4">
          <button className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-slate-800 hover:bg-slate-50 transition-all">
            <Search className="w-5 h-5" />
          </button>
          <div className="relative">
             <button 
                onClick={() => setShowNotifs(!showNotifs)}
                className="w-12 h-12 rounded-2xl bg-[#a78bfa] text-white flex items-center justify-center shadow-lg shadow-purple-500/20 hover:bg-purple-500 transition-all"
             >
                <Bell className="w-5 h-5 fill-current" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 border-2 border-white rounded-full" />
             </button>
             <AnimatePresence>
                {showNotifs && (
                  <NotificationDropdown 
                    onClose={() => setShowNotifs(false)} 
                    notifications={notifications} 
                    setNotifications={setNotifications}
                  />
                )}
             </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
          <div className="relative">
            <button 
              onClick={() => setShowProfile(!showProfile)}
              className="flex items-center gap-4 px-4 py-2 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all group"
            >
              <img 
                src={`https://ui-avatars.com/api/?name=${user?.user?.first_name || user?.first_name || 'Kate'}+${user?.user?.last_name || user?.last_name || 'Malone'}&background=0f172a&color=fff`} 
                className="w-10 h-10 rounded-xl border-2 border-white"
                alt="Avatar"
              />
              <div className="text-left">
                <p className="text-[14px] font-bold text-slate-900 leading-none">{user?.user?.first_name || user?.first_name || 'Kate'} {user?.user?.last_name || user?.last_name || 'Malone'}</p>
                <p className="text-[11px] font-bold text-slate-400 mt-1 uppercase tracking-tight">Class 9A</p>
              </div>
              <ChevronDown className={`w-4 h-4 text-slate-300 transition-transform ${showProfile ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {showProfile && <ProfileDropdown user={user} onLogout={onLogout} />}
            </AnimatePresence>
          </div>
          <div className="relative">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setShowMoreHeader(!showMoreHeader);
              }}
              className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-slate-800 hover:bg-slate-50 transition-all"
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>
            <AnimatePresence>
              {showMoreHeader && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  className="absolute right-0 mt-4 w-56 bg-white rounded-3xl shadow-xl border border-slate-100 p-2 z-[200]"
                >
                  {['Dashboard Settings', 'Customize Layout', 'Export Data'].map(item => (
                    <button 
                      key={item}
                      className="w-full text-left px-5 py-3 text-[14px] font-bold text-slate-600 hover:bg-slate-50 hover:text-blue-600 rounded-2xl transition-all"
                    >
                      {item}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Main Content Multi-Column Layout */}
      <div className="grid grid-cols-12 gap-6 lg:gap-8">
        
        {/* Left Column: My Tasks */}
        <div className="col-span-12 lg:col-span-5 flex flex-col gap-4">
          <div className="bg-white/40 rounded-[2.5rem] p-5 border border-white shadow-sm flex flex-col h-full">
            <div className="flex justify-between items-center mb-6 px-2">
              <h3 className="text-[1.6rem] font-bold text-slate-800">My tasks</h3>
            </div>
            
            <div className="flex gap-2 mb-6 px-2 overflow-x-auto no-scrollbar">
              {['All task', 'To do', 'In progress', 'Done'].map((tab) => (
                <button 
                  key={tab} 
                  onClick={() => setActiveTab(tab)}
                  className={`px-5 py-2.5 rounded-full text-[13px] font-bold transition-all whitespace-nowrap ${
                    activeTab === tab 
                      ? 'bg-[#0f172a] text-white shadow-md' 
                      : 'text-slate-500 bg-white border border-slate-100 hover:border-slate-200'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-4">
              {flatTasks
                .filter(t => activeTab === 'All task' || t.status.toLowerCase() === activeTab.toLowerCase())
                .slice(0, 5)
                .map(task => (
                <div 
                  key={`${task.id}-${task.status}`} 
                  className="relative group/task"
                  onClick={() => setSelectedTask({ task, col: task.status })}
                >
                  <TaskCard {...task} />
                  <div className="absolute top-6 right-6 z-10">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveTaskMenu(activeTaskMenu === task.id ? null : task.id);
                      }}
                      className="w-8 h-8 rounded-full bg-black/5 flex items-center justify-center hover:bg-black/10 transition-colors"
                    >
                      <MoreHorizontal className="w-4 h-4 text-slate-600" />
                    </button>
                    
                    <AnimatePresence>
                      {activeTaskMenu === task.id && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: -10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: -10 }}
                          className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-[100]"
                        >
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveTaskMenu(null);
                              setSelectedTask({ task, col: task.status });
                            }}
                            className="w-full text-left px-4 py-2.5 text-[13px] font-bold text-slate-600 hover:bg-slate-50 hover:text-blue-600 rounded-xl transition-all flex items-center gap-2"
                          >
                            <ArrowUpRight className="w-4 h-4" /> View Details
                          </button>
                          {task.status === 'In Progress' && (
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveTaskMenu(null);
                                setSelectedTask({ task, col: task.status });
                              }}
                              className="w-full text-left px-4 py-2.5 text-[13px] font-bold text-slate-600 hover:bg-slate-50 hover:text-blue-600 rounded-xl transition-all flex items-center gap-2"
                            >
                              <SlidersHorizontal className="w-4 h-4" /> Update Progress
                            </button>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              ))}
            </div>

            <button className="mt-8 py-4 bg-white border border-slate-100 rounded-3xl text-[14px] font-bold text-slate-500 hover:text-slate-600 transition-all">
              View all tasks
            </button>
          </div>
        </div>

        {/* Right Column: Notes & Schedule */}
        <div className="col-span-12 lg:col-span-7 flex flex-col gap-6 lg:gap-8">
          
          {/* My Notes Section */}
          <div className="bg-white/40 rounded-[2.5rem] p-6 border border-white shadow-sm">
             <div className="flex justify-between items-center mb-5">
                <h3 className="text-[1.6rem] font-bold text-slate-800">My notes</h3>
             </div>
              <div className="flex gap-6 overflow-x-auto no-scrollbar pb-4">
                {NOTES.map(note => (
                  <div key={note.id} className="relative group/note min-w-[300px] flex-1">
                    <NoteCard {...note} />
                    <div className="absolute top-6 right-6 z-10">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveNoteMenu(activeNoteMenu === note.id ? null : note.id);
                        }}
                        className="w-8 h-8 rounded-full bg-black/5 flex items-center justify-center hover:bg-black/10 transition-colors"
                      >
                        <MoreHorizontal className="w-4 h-4 text-slate-600" />
                      </button>
                      
                      <AnimatePresence>
                        {activeNoteMenu === note.id && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -10 }}
                            className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-[100]"
                          >
                            {['Open Note', 'Pin to Top', 'Share', 'Delete'].map(item => (
                              <button 
                                key={item}
                                className={`w-full text-left px-4 py-2.5 text-[13px] font-bold rounded-xl transition-all ${item === 'Delete' ? 'text-rose-500 hover:bg-rose-50' : 'text-slate-600 hover:bg-slate-50 hover:text-blue-600'}`}
                              >
                                {item}
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                ))}
              </div>
          </div>

          {/* My Schedule Section */}
          <div className="bg-white/40 rounded-[2.5rem] p-6 border border-white shadow-sm">
             <div className="flex justify-between items-center mb-6">
                <h3 className="text-[1.6rem] font-bold text-slate-800">My schedule</h3>
                <button className="px-5 py-2.5 rounded-full bg-white border border-slate-100 text-[14px] font-bold text-slate-800 flex items-center gap-2">
                  May 14, Mon <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>
             </div>
             
             <div className="flex flex-col">
                <div className="grid grid-cols-[80px_100px_1fr_100px] gap-4 mb-4 text-[12px] font-bold text-slate-500 uppercase tracking-widest px-1">
                   <span>Time</span>
                   <span>Lesson</span>
                   <span>Teacher</span>
                   <span className="text-right">Location</span>
                </div>
                <div className="flex flex-col">
                  {SCHEDULE.map((item, i) => <ScheduleItem key={i} {...item} />)}
                </div>
             </div>
          </div>

        </div>

      </div>
      </div>
      {/* Task Details Modal */}
      <AnimatePresence>
        {selectedTask && (
          <TaskDetailModal
            task={selectedTask.task}
            col={selectedTask.col}
            onClose={() => setSelectedTask(null)}
            onStart={handleTaskStart}
            onComplete={handleTaskComplete}
            onProgressUpdate={handleTaskProgressUpdate}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default StudentDashboard;
