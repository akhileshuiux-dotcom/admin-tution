import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Bell, MoreHorizontal, ChevronDown, X, 
  Settings, LogOut, User, HelpCircle, BookOpen, 
  CheckCheck, Clock, MessageSquare, ArrowUpRight,
  TrendingUp, Calendar, Layout, FileText
} from 'lucide-react';

// ─── Data ────────────────────────────────────────────────────────────────────
const NOTIFICATIONS = [
  { id: 1, icon: '📝', title: 'New assignment added', body: 'Mrs. Murray added a new Social Studies task.', time: '5 min ago', unread: true },
  { id: 2, icon: '⏰', title: 'Deadline reminder', body: 'Math test preparation is due in 2 days.', time: '1 hr ago', unread: true },
  { id: 3, icon: '📅', title: 'Live class starting soon', body: 'Mathematics with Mrs. Goodman — 10 min.', time: '3 hr ago', unread: false },
];

const TASKS = [
  { id: 1, title: "Read poem & answer questions", subject: "English Literature", date: "Apr 28, 2025", comments: "12", status: "In progress", color: "blue" },
  { id: 2, title: "Create a comic strip with a story", subject: "Social Studies", date: "May 17, 2025", comments: "0", status: "To do", color: "emerald" },
  { id: 3, title: "Prepare for the math test", subject: "Math", date: "May 11, 2025", comments: "2", status: "To do", color: "amber" },
  { id: 4, title: "Biology Lab Report", subject: "Science", date: "May 15, 2025", comments: "5", status: "In progress", color: "purple" },
];

const NOTES = [
  { id: 1, title: "Math conspect", date: "May 05, 2025", content: "A linear equation is of the form: ax+b=c, where x is the unknown variable...", color: "emerald" },
  { id: 2, title: "Biology lesson", date: "Apr 29, 2025", content: "A cell is the basic structural, functional, and biological unit of all living organisms...", color: "blue" },
  { id: 3, title: "History Timeline", date: "May 01, 2025", content: "Key events during the French Revolution (1789-1799) including the Storming of the Bastille...", color: "amber" },
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
      <p className="text-[16px] font-bold font-plus-jakarta">{user?.first_name} {user?.last_name}</p>
      <p className="text-[12px] opacity-60 font-medium truncate mt-1">{user?.email}</p>
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

const TaskCard = ({ title, subject, date, status, comments, color }) => (
  <motion.div
    whileHover={{ y: -8, scale: 1.01 }}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="group bg-white/70 backdrop-blur-md rounded-[2.5rem] p-7 border border-white/50 shadow-[0_8px_30px_rgba(0,0,0,0.02)] hover:shadow-[0_25px_50px_rgba(0,0,0,0.06)] transition-all cursor-pointer relative overflow-hidden"
  >
    <div className="absolute top-0 right-0 p-7 opacity-0 group-hover:opacity-100 transition-all">
      <div className="w-12 h-12 bg-slate-900 rounded-full flex items-center justify-center text-white shadow-xl shadow-slate-900/10">
        <ArrowUpRight className="w-5 h-5" />
      </div>
    </div>
    <div className="flex items-center gap-3 mb-5">
      <div className={`px-4 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest ${
        status === 'In progress' ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'
      }`}>
        {status}
      </div>
      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{subject}</span>
    </div>
    <h4 className="text-[18px] font-extrabold text-slate-900 mb-6 leading-[1.3] font-plus-jakarta group-hover:text-blue-600 transition-colors pr-10">{title}</h4>
    <div className="flex items-center justify-between border-t border-slate-100 pt-5 mt-auto">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-slate-400">
          <Calendar className="w-3.5 h-3.5" />
          <span className="text-[11px] font-bold">{date}</span>
        </div>
        <div className="flex items-center gap-2 text-slate-400">
          <MessageSquare className="w-3.5 h-3.5" />
          <span className="text-[11px] font-bold">{comments}</span>
        </div>
      </div>
      <div className="flex -space-x-2">
        {[1, 2, 3].map(i => (
          <img 
            key={i} 
            src={`https://ui-avatars.com/api/?name=User+${i}&background=random`} 
            className="w-6 h-6 rounded-full border-2 border-white" 
            alt="user"
          />
        ))}
      </div>
    </div>
  </motion.div>
);

const NoteCard = ({ title, content, date, color }) => (
  <motion.div
    whileHover={{ scale: 1.02, rotate: [-0.5, 0.5, 0] }}
    className="min-w-[320px] bg-white/70 backdrop-blur-md rounded-[2.5rem] p-8 border border-white/50 shadow-[0_10px_30px_rgba(0,0,0,0.03)] hover:shadow-xl transition-all cursor-pointer group"
  >
    <div className="flex justify-between items-start mb-6">
      <div className={`w-14 h-14 rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform ${
        color === 'emerald' ? 'bg-emerald-50 text-emerald-600' : 
        color === 'blue' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'
      }`}>
        <FileText className="w-6 h-6" />
      </div>
      <MoreHorizontal className="w-5 h-5 text-slate-300 hover:text-slate-600 transition-colors" />
    </div>
    <h4 className="text-[18px] font-extrabold text-slate-900 mb-3 font-plus-jakarta">{title}</h4>
    <p className="text-[14px] text-slate-500 font-medium leading-relaxed line-clamp-2 mb-6">{content}</p>
    <div className="flex items-center justify-between">
      <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest">{date}</span>
      <ArrowUpRight className="w-4 h-4 text-blue-500 opacity-0 group-hover:opacity-100 transition-all" />
    </div>
  </motion.div>
);

const ScheduleItem = ({ time, lesson, teacher, location, active }) => (
  <motion.div 
    whileHover={{ x: 10 }}
    className={`flex items-center gap-6 p-5 rounded-[2rem] transition-all cursor-pointer ${
      active ? 'bg-slate-900 text-white shadow-2xl shadow-slate-900/10' : 'hover:bg-white/80'
    }`}
  >
    <div className="w-24 shrink-0">
      <span className={`text-[13px] font-extrabold font-plus-jakarta ${active ? 'text-blue-400' : 'text-slate-400'}`}>{time}</span>
    </div>
    <div className="w-28 shrink-0">
      <h5 className="text-[15px] font-extrabold font-plus-jakarta">{lesson}</h5>
    </div>
    <div className="flex items-center gap-3 flex-grow">
      <img src={`https://ui-avatars.com/api/?name=${teacher}&background=random`} className="w-8 h-8 rounded-full border-2 border-white/10" alt={teacher}/>
      <span className={`text-[13px] font-bold ${active ? 'text-white/80' : 'text-slate-600'}`}>{teacher}</span>
    </div>
    <div className="shrink-0 text-right opacity-40">
      <span className="text-[12px] font-bold tracking-tight">{location}</span>
    </div>
  </motion.div>
);

// ─── Main Component ──────────────────────────────────────────────────────────

const StudentDashboard = ({ user, onLogout }) => {
  const [showNotifs, setShowNotifs] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [notifications, setNotifications] = useState(NOTIFICATIONS);

  return (
    <div className="flex flex-col gap-10 w-full animate-fade-in pb-20">
      
      {/* Dynamic Header */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight font-plus-jakarta">My Dashboard</h1>
          <p className="text-[15px] font-bold text-slate-400 mt-2 uppercase tracking-[0.2em]">Learning Hub — Semester 2</p>
        </div>
        
        <div className="flex items-center gap-4 bg-white/40 backdrop-blur-xl p-2 rounded-[2.5rem] border border-white/50 shadow-sm">
          {/* Notifications */}
          <div className="relative">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => { setShowNotifs(!showNotifs); setShowProfile(false); }}
              className={`p-4 rounded-full transition-all relative ${showNotifs ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'text-slate-600 hover:bg-white/80'}`}
            >
              <Bell className="w-5 h-5 transition-transform group-hover:rotate-12" />
              {notifications.some(n => n.unread) && (
                <span className="absolute top-3 right-3 w-3 h-3 bg-rose-500 rounded-full border-2 border-white ring-2 ring-rose-500/20" />
              )}
            </motion.button>
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
          
          <div className="h-10 w-px bg-slate-200/50" />
          
          {/* Profile User */}
          <div className="relative">
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => { setShowProfile(!showProfile); setShowNotifs(false); }}
              className="flex items-center gap-4 pl-2 pr-6 py-2 rounded-full transition-all group"
            >
              <div className="relative">
                <img 
                  src={`https://ui-avatars.com/api/?name=${user?.first_name}+${user?.last_name}&background=0f172a&color=fff`} 
                  className="w-12 h-12 rounded-full shadow-lg border-2 border-white group-hover:border-blue-500/20 transition-all"
                  alt="Avatar"
                />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full shadow-sm" />
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-[14px] font-extrabold text-slate-900 leading-none">{user?.first_name}</p>
                <p className="text-[11px] font-bold text-slate-400 mt-1 uppercase tracking-widest">Year 9A</p>
              </div>
              <ChevronDown className={`w-4 h-4 text-slate-300 transition-transform ${showProfile ? 'rotate-180' : ''}`} />
            </motion.button>
            <AnimatePresence>
              {showProfile && <ProfileDropdown user={user} onLogout={onLogout} />}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left Section: Progress & Tasks */}
        <div className="lg:col-span-8 flex flex-col gap-10">
          
          {/* Featured Task Search / Filter */}
          <div className="bg-white/80 backdrop-blur-2xl p-8 rounded-[3rem] border border-white/60 shadow-xl shadow-blue-500/5">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="relative w-full md:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Seach your tasks..." 
                  className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl py-3 pl-12 pr-4 text-[14px] focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/20 transition-all"
                />
              </div>
              <div className="flex items-center gap-2 p-1 bg-slate-50 rounded-[1.5rem]">
                {['All Tasks', 'Ongoing', 'Completed'].map((tab, i) => (
                  <button key={tab} className={`px-6 py-2 rounded-2xl text-[12px] font-bold transition-all ${i === 0 ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>{tab}</button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {TASKS.map(task => <TaskCard key={task.id} {...task} />)}
          </div>
          
          <motion.button 
            whileHover={{ scale: 1.01 }}
            className="w-full py-6 rounded-[2.5rem] bg-slate-900 text-white font-bold text-[14px] uppercase tracking-[0.3em] flex items-center justify-center gap-3 shadow-2xl shadow-slate-900/10 hover:bg-slate-800 transition-all"
          >
            Explore all activities <ArrowUpRight className="w-5 h-5" />
          </motion.button>
        </div>

        {/* Right Section: Schedule & Performance */}
        <div className="lg:col-span-4 flex flex-col gap-10">
          
          {/* My Schedule Sidebar */}
          <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center px-4">
              <h3 className="text-[20px] font-extrabold font-plus-jakarta text-slate-900">My Schedule</h3>
              <button className="w-10 h-10 rounded-2xl bg-white border border-slate-100 flex items-center justify-center hover:bg-slate-50 transition-all">
                <Plus className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            
            <div className="bg-white/40 border border-white/60 p-4 rounded-[3rem] shadow-sm flex flex-col gap-2">
              {SCHEDULE.map((item, i) => <ScheduleItem key={i} {...item} />)}
            </div>
          </div>

          {/* Quick Insights Card */}
          <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-[3rem] p-10 text-white relative overflow-hidden group">
            <TrendingUp className="absolute -bottom-10 -right-10 w-64 h-64 text-white/5 group-hover:text-white/10 transition-all rotate-12" />
            <h3 className="text-2xl font-extrabold mb-2 relative z-10 font-plus-jakarta">Performance</h3>
            <p className="text-white/60 text-[14px] font-bold mb-8 relative z-10">Your average this week is higher than last week. Keep it up! 🚀</p>
            <div className="flex items-end gap-1 h-24 mb-6 relative z-10">
              {[40, 70, 45, 90, 65, 80, 50].map((h, i) => (
                <motion.div 
                  key={i} 
                  initial={{ height: 0 }}
                  animate={{ height: `${h}%` }}
                  transition={{ delay: i * 0.1, duration: 1 }}
                  className="flex-1 bg-white/20 rounded-t-lg group-hover:bg-white/40 transition-colors"
                />
              ))}
            </div>
            <button className="w-full py-4 bg-white/10 backdrop-blur-md rounded-2xl text-[13px] font-bold uppercase tracking-widest hover:bg-white/20 transition-all relative z-10">
              Full Report
            </button>
          </div>

        </div>

      </div>

      {/* Horizontal Notes Section */}
      <div className="mt-10 flex flex-col gap-6">
        <div className="flex justify-between items-center px-6">
          <h3 className="text-[20px] font-extrabold font-plus-jakarta text-slate-900">Recent Notes</h3>
          <button className="text-blue-600 font-bold text-[14px] hover:underline">View All</button>
        </div>
        <div className="flex gap-8 overflow-x-auto pb-8 snap-x snap-mandatory custom-scrollbar px-2">
          {NOTES.map(note => <NoteCard key={note.id} {...note} />)}
        </div>
      </div>

    </div>
  );
};

export default StudentDashboard;
