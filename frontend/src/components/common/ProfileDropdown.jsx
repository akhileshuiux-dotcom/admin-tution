import React from 'react';
import { motion } from 'framer-motion';
import { User, Settings, BookOpen, HelpCircle, LogOut } from 'lucide-react';

const ProfileDropdown = ({ user, onLogout, onNavigate }) => {
  const menuItems = [
    { icon: User, label: 'My Profile', view: 'Profile' },
    { icon: Settings, label: 'Settings', view: 'Settings' },
    { icon: BookOpen, label: user?.role === 'teacher' ? 'Professional Records' : 'Academic Records', view: 'AcademicRecords' },
    { icon: HelpCircle, label: 'Help & Support', view: 'HelpSupport' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.97 }}
      transition={{ duration: 0.15 }}
      className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 overflow-hidden"
    >
      <div className="px-5 py-5 bg-slate-50 border-b border-slate-100">
        <p className="text-[14px] font-bold text-slate-800 leading-tight">
          {user?.first_name} {user?.last_name || ''}
        </p>
        <p className="text-[12px] text-slate-500 mt-1 truncate">{user?.email || user?.username}</p>
        <span className="inline-block mt-2.5 text-[10px] font-black bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full uppercase tracking-widest">
          {user?.role === 'teacher' ? 'Staff Portal' : `Class ${user?.grade || '9A'}`}
        </span>
      </div>
      <div className="flex flex-col py-2">
        {menuItems.map(({ icon: Icon, label, view }) => (
          <button 
            key={label} 
            onClick={() => onNavigate(view)} 
            className="flex items-center gap-3.5 px-5 py-3 text-[13px] font-semibold text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 transition-all text-left w-full group"
          >
            <Icon className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition-colors" />
            {label}
          </button>
        ))}
        <div className="border-t border-slate-50 mt-2 pt-2" />
        <button
          onClick={onLogout}
          className="flex items-center gap-3.5 px-5 py-3 text-[13px] font-bold text-rose-600 hover:bg-rose-50 transition-all text-left w-full group"
        >
          <LogOut className="w-4 h-4 text-rose-400 group-hover:text-rose-600 transition-colors" /> 
          Sign Out
        </button>
      </div>
    </motion.div>
  );
};

export default ProfileDropdown;
