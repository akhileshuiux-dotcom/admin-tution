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
  UserCheck,
  BookOpen,
  Gamepad2
} from 'lucide-react';

const SidebarItem = ({ icon: Icon, label, active, badge, onClick }) => (
  <motion.div
    whileHover={{ x: 3 }}
    onClick={onClick}
    className={`flex items-center justify-between px-4 py-2.5 rounded-xl cursor-pointer transition-all ${
      active
        ? 'bg-slate-900 text-white'
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
    }`}
  >
    <div className="flex items-center gap-3">
      <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-slate-500'}`} />
      <span className="text-[14px] font-medium">{label}</span>
    </div>
    {badge && (
      <span className={`text-[11px] font-semibold px-1.5 py-0.5 rounded-full min-w-[20px] text-center ${
        active ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-700'
      }`}>
        {badge}
      </span>
    )}
  </motion.div>
);

const Sidebar = ({ activeView = 'Dashboard', onNavigate, onLogout }) => {
  return (
    <aside className="w-64 h-screen bg-white border-r border-slate-100 p-5 flex flex-col sticky top-0 left-0 shadow-sm">
      <div className="flex items-center gap-2.5 mb-8 px-1">
        <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center shadow-sm">
          <span className="text-white font-semibold text-sm italic">A</span>
        </div>
        <h2 className="text-[17px] font-semibold text-slate-900">EduWay</h2>
      </div>

      <nav className="flex flex-col gap-1 flex-grow">
        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest px-4 mb-2">Main</p>
        <SidebarItem icon={LayoutDashboard} label="Dashboard" active={activeView === 'Dashboard'} onClick={() => onNavigate('Dashboard')} />
        <SidebarItem icon={Calendar} label="Schedule" active={activeView === 'Schedule'} onClick={() => onNavigate('Schedule')} />
        <SidebarItem icon={FileText} label="Tests" active={activeView === 'Tests'} onClick={() => onNavigate('Tests')} />
        <SidebarItem icon={Gamepad2} label="Games" active={activeView === 'Games'} onClick={() => onNavigate('Games')} />
        <SidebarItem icon={UserCheck} label="Attendance" active={activeView === 'Attendance'} onClick={() => onNavigate('Attendance')} />
        <SidebarItem icon={BarChart3} label="Reports" active={activeView === 'Reports'} onClick={() => onNavigate('Reports')} />
        
        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest px-4 mb-2 mt-5">Communication</p>
        <SidebarItem icon={MessageCircle} label="Chat" active={activeView === 'Chat'} badge="12" onClick={() => onNavigate('Chat')} />
        <SidebarItem icon={StickyNote} label="Notes" active={activeView === 'Notes'} badge="3" onClick={() => onNavigate('Notes')} />
        <SidebarItem icon={BookOpen} label="Past Papers" active={activeView === 'PastPapers'} onClick={() => onNavigate('PastPapers')} />
      </nav>

      <div className="flex flex-col gap-1 border-t border-slate-100 pt-4">
        <SidebarItem icon={Settings} label="Settings" onClick={() => onNavigate('Settings')} />
        <SidebarItem icon={LogOut} label="Log out" onClick={onLogout} />
      </div>
    </aside>
  );
};

export default Sidebar;
