import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Bell, MoreHorizontal, ChevronDown, X, 
  Settings, LogOut, User, HelpCircle, BookOpen, 
  CheckCheck, Clock, MessageSquare, ArrowUpRight,
  TrendingUp, Calendar, Layout, FileText, Plus
} from 'lucide-react';

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
  { id: 1, title: "Math conspect", date: "May 05, 2025", content: "A linear equation is an equation of the form: ax+b=cax+b = cax+b=c, where xxx is the variable, aaa, bbb, and ccc are constants, and a≠0a \neq 0a=0.", color: "bg-[#bbf7d0]" },
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
      <div className="flex items-center gap-1 text-slate-500">
        <span className="text-[11px] font-semibold">{progress}% complete</span>
      </div>
    </div>
  </div>
);

const NoteCard = ({ title, date, content, color }) => (
  <div className={`${color} rounded-[2rem] p-6 min-w-[300px] flex-1 flex flex-col`}>
    <div className="flex justify-between items-center mb-6">
      <h4 className="text-[18px] font-bold text-slate-800">{title}</h4>
      <button className="w-8 h-8 rounded-full bg-black/5 flex items-center justify-center">
        <MoreHorizontal className="w-4 h-4 text-slate-600" />
      </button>
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
  const [notifications, setNotifications] = useState(NOTIFICATIONS);
  const [tasks] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : INITIAL_TASKS;
    } catch (error) {
      return INITIAL_TASKS;
    }
  });

  const flatTasks = Object.entries(tasks).flatMap(([status, list]) => 
    list.map(t => ({ ...t, status }))
  ).sort((a, b) => {
    // Show In Progress first
    if (a.status === 'In Progress' && b.status !== 'In Progress') return -1;
    if (a.status !== 'In Progress' && b.status === 'In Progress') return 1;
    return 0;
  });

  return (
    <div className="flex flex-col gap-10 font-plus-jakarta pb-20">
      
      {/* Top Header */}
      <div className="flex items-center justify-between gap-6">
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
          <button className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-slate-800 hover:bg-slate-50 transition-all">
             <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Content Multi-Column Layout */}
      <div className="grid grid-cols-12 gap-10">
        
        {/* Left Column: My Tasks */}
        <div className="col-span-12 lg:col-span-5 flex flex-col gap-6">
          <div className="bg-white/40 rounded-[3rem] p-6 border border-white shadow-sm flex flex-col h-full">
            <div className="flex justify-between items-center mb-8 px-2">
              <h3 className="text-[1.8rem] font-bold text-slate-800">My tasks</h3>
            </div>
            
            <div className="flex gap-2 mb-8 px-2 overflow-x-auto no-scrollbar">
              {['All task', 'To do', 'In progress', 'Done'].map((tab, i) => (
                <button key={tab} className={`px-5 py-2.5 rounded-full text-[13px] font-bold transition-all whitespace-nowrap ${i === 0 ? 'bg-[#0f172a] text-white shadow-md' : 'text-slate-500 bg-white border border-slate-100 hover:border-slate-200'}`}>
                  {tab}
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-4">
              {flatTasks.slice(0, 5).map(task => <TaskCard key={`${task.id}-${task.status}`} {...task} />)}
            </div>

            <button className="mt-8 py-4 bg-white border border-slate-100 rounded-3xl text-[14px] font-bold text-slate-500 hover:text-slate-600 transition-all">
              View all tasks
            </button>
          </div>
        </div>

        {/* Right Column: Notes & Schedule */}
        <div className="col-span-12 lg:col-span-7 flex flex-col gap-10">
          
          {/* My Notes Section */}
          <div className="bg-white/40 rounded-[3rem] p-8 border border-white shadow-sm">
             <div className="flex justify-between items-center mb-6">
                <h3 className="text-[1.8rem] font-bold text-slate-800">My notes</h3>
             </div>
             <div className="flex gap-6 overflow-x-auto no-scrollbar">
                {NOTES.map(note => <NoteCard key={note.id} {...note} />)}
             </div>
          </div>

          {/* My Schedule Section */}
          <div className="bg-white/40 rounded-[3rem] p-8 border border-white shadow-sm">
             <div className="flex justify-between items-center mb-8">
                <h3 className="text-[1.8rem] font-bold text-slate-800">My schedule</h3>
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
  );
};

export default StudentDashboard;
