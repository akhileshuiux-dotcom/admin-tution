import React from 'react';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Calendar, 
  ClipboardList, 
  FileText, 
  BarChart3, 
  MessageCircle, 
  StickyNote, 
  Settings, 
  LogOut,
  ChevronRight
} from 'lucide-react';

const SidebarItem = ({ icon: Icon, label, active, badge, onClick }) => (
  <motion.div
    whileHover={{ x: 5 }}
    onClick={onClick}
    className={`group flex items-center justify-between px-5 py-3.5 rounded-2xl cursor-pointer transition-all ${
      active
        ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/10'
        : 'text-slate-500 hover:bg-white hover:text-slate-900 hover:shadow-sm'
    }`}
  >
    <div className="flex items-center gap-4">
      <div className={`p-2 rounded-xl transition-colors ${
        active ? 'bg-blue-600' : 'bg-slate-100 group-hover:bg-blue-50 group-hover:text-blue-600'
      }`}>
        <Icon className="w-4 h-4" />
      </div>
      <span className="text-[14px] font-bold font-plus-jakarta">{label}</span>
    </div>
    {badge ? (
      <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
        active ? 'bg-blue-400 text-white' : 'bg-blue-50 text-blue-600'
      }`}>
        {badge}
      </span>
    ) : (
      active && <ChevronRight className="w-4 h-4 text-blue-400 opacity-50 transition-all opacity-100 group-hover:translate-x-1" />
    )}
  </motion.div>
);

const StudentSidebar = ({ activeView = 'Dashboard', onNavigate, onLogout }) => {
  return (
    <aside className="w-72 h-screen bg-slate-50/40 backdrop-blur-xl border-r border-slate-200/50 p-6 flex flex-col sticky top-0 left-0 z-[500]">
      {/* Brand */}
      <div className="flex items-center gap-4 mb-12 px-2">
        <div className="w-12 h-12 bg-slate-900 rounded-[1.2rem] flex items-center justify-center shadow-2xl shadow-slate-900/10 rotate-3">
          <span className="text-white font-black text-xl italic font-plus-jakarta">G</span>
        </div>
        <div>
          <h2 className="text-[18px] font-extrabold text-slate-900 tracking-tight font-plus-jakarta leading-none">EduWay</h2>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Academy Portal</span>
        </div>
      </div>

      {/* Navigation Sections */}
      <div className="flex flex-col gap-8 flex-grow overflow-y-auto no-scrollbar">
        
        <section>
          <p className="text-[10px] font-extrabold text-slate-300 uppercase tracking-[0.2em] px-5 mb-4">Main Experience</p>
          <nav className="flex flex-col gap-2">
            <SidebarItem icon={LayoutDashboard} label="Dashboard" active={activeView === 'Dashboard'} onClick={() => onNavigate('Dashboard')} />
            <SidebarItem icon={Calendar} label="My Schedule" active={activeView === 'Schedule'} onClick={() => onNavigate('Schedule')} />
            <SidebarItem icon={ClipboardList} label="Assignments" active={activeView === 'Tasks'} badge="4" onClick={() => onNavigate('Tasks')} />
            <SidebarItem icon={FileText} label="Exams & Tests" active={activeView === 'Tests'} onClick={() => onNavigate('Tests')} />
          </nav> section>

        <section>
          <p className="text-[10px] font-extrabold text-slate-300 uppercase tracking-[0.2em] px-5 mb-4">Collaborate</p>
          <nav className="flex flex-col gap-2">
            <SidebarItem icon={BarChart3} label="Performance" active={activeView === 'Reports'} onClick={() => onNavigate('Reports')} />
            <SidebarItem icon={MessageCircle} label="Class Chat" active={activeView === 'Chat'} badge="9+" onClick={() => onNavigate('Chat')} />
            <SidebarItem icon={StickyNote} label="My Notes" active={activeView === 'Notes'} onClick={() => onNavigate('Notes')} />
          </nav>
        </section>

      </div>

      {/* Profile/Footer Area */}
      <div className="flex flex-col gap-2 pt-6 border-t border-slate-100 mt-auto">
        <SidebarItem icon={Settings} label="Settings" active={activeView === 'Settings'} onClick={() => onNavigate('Settings')} />
        <SidebarItem icon={LogOut} label="Sign Out" onClick={onLogout} />
      </div>

      {/* Featured Card */}
      <div className="mt-8 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2rem] p-6 text-white relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:rotate-12 transition-transform">
          <Settings className="w-12 h-12" />
        </div>
        <p className="text-[13px] font-extrabold font-plus-jakarta mb-1">Weekly Goal</p>
        <p className="text-[11px] font-medium opacity-70 mb-4 tracking-tight leading-snug">Prepare for Social Studies Exam on Friday.</p>
        <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: '65%' }}
            className="h-full bg-white"
          />
        </div>
      </div>
    </aside>
  );
};

export default StudentSidebar;
