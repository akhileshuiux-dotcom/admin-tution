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
  ChevronRight,
  Search,
  Layout
} from 'lucide-react';

const SidebarItem = ({ icon: Icon, label, active, badge, onClick }) => (
  <motion.div
    whileHover={{ x: 5 }}
    onClick={onClick}
    className={`group flex items-center justify-between px-4 py-3 rounded-2xl cursor-pointer transition-all ${
      active
        ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/10'
        : 'text-slate-500 hover:text-slate-900'
    }`}
  >
    <div className="flex items-center gap-3">
      <div className={`p-1.5 transition-colors ${
        active ? 'text-white' : 'text-slate-400 group-hover:text-slate-900'
      }`}>
        <Icon className="w-5 h-5" />
      </div>
      <span className="text-[15px] font-semibold font-plus-jakarta">{label}</span>
    </div>
    {badge && (
      <span className="bg-[#a78bfa] text-white text-[11px] font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">
        {badge}
      </span>
    )}
  </motion.div>
);

const StudentSidebar = ({ activeView = 'Dashboard', onNavigate, onLogout }) => {
  return (
    <aside className="w-64 h-screen bg-white/50 backdrop-blur-xl border-r border-slate-100/50 p-6 flex flex-col sticky top-0 left-0 z-[500] font-plus-jakarta">
      {/* Brand */}
      <div className="flex items-center gap-3 mb-10 px-2">
        <div className="w-10 h-10 bg-[#22c55e] rounded-xl flex items-center justify-center shadow-lg shadow-green-500/20">
          <Layout className="text-white w-6 h-6" />
        </div>
        <h2 className="text-[20px] font-bold text-slate-800 tracking-tight">EduWay</h2>
      </div>

      {/* Navigation Sections */}
      <div className="flex flex-col gap-1 flex-grow">
        <SidebarItem icon={LayoutDashboard} label="Dashboard" active={activeView === 'Dashboard'} onClick={() => onNavigate('Dashboard')} />
        <SidebarItem icon={Calendar} label="Schedule" active={activeView === 'Schedule'} onClick={() => onNavigate('Schedule')} />
        <SidebarItem icon={ClipboardList} label="Tasks" active={activeView === 'Tasks'} badge="3" onClick={() => onNavigate('Tasks')} />
        <SidebarItem icon={FileText} label="Tests" active={activeView === 'Tests'} onClick={() => onNavigate('Tests')} />
        <SidebarItem icon={BarChart3} label="Reports" active={activeView === 'Reports'} onClick={() => onNavigate('Reports')} />
        
        <div className="my-6 border-t border-slate-100/50" />
        
        <SidebarItem icon={MessageCircle} label="Chat" active={activeView === 'Chat'} badge="12" onClick={() => onNavigate('Chat')} />
        <SidebarItem icon={StickyNote} label="Notes" active={activeView === 'Notes'} badge="2" onClick={() => onNavigate('Notes')} />
      </div>

      {/* Profile/Footer Area */}
      <div className="flex flex-col gap-1 pt-6 border-t border-slate-100/50 mt-auto">
        <SidebarItem icon={Settings} label="Settings" active={activeView === 'Settings'} onClick={() => onNavigate('Settings')} />
        <SidebarItem icon={LogOut} label="Log out" onClick={onLogout} />
      </div>
    </aside>
  );
};

export default StudentSidebar;
