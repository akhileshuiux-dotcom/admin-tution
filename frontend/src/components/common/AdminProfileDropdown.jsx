import React from 'react';
import { motion } from 'framer-motion';
import { 
  User, Settings, ShieldCheck, Bell, 
  Lock, Activity, HelpCircle, LogOut,
  ChevronRight, Mail, Hash
} from 'lucide-react';

const AdminProfileDropdown = ({ user, onNavigate, onLogout }) => {
  const menuItems = [
    { icon: User, label: 'My Profile', view: 'AdminProfile', color: 'text-indigo-500' },
    { icon: Settings, label: 'Account Settings', view: 'AdminAccountSettings', color: 'text-blue-500' },
    { icon: Lock, label: 'Security & Password', view: 'AdminSecurity', color: 'text-emerald-500' },
    { icon: Bell, label: 'Notifications', view: 'AdminNotifications', color: 'text-amber-500' },
    { icon: ShieldCheck, label: 'Role & Permissions', view: 'AdminRolePermissions', color: 'text-purple-500' },
    { icon: Activity, label: 'Activity Log', view: 'AdminActivityLog', color: 'text-rose-500' },
    { icon: HelpCircle, label: 'Help & Support', view: 'AdminHelpSupport', color: 'text-slate-500' },
  ];

  const adminName = user?.user?.first_name 
    ? `${user.user.first_name} ${user.user.last_name || ''}`.trim() 
    : user?.user?.username || 'Administrator';

  return (
    <motion.div
      initial={{ opacity: 0, y: -10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.98 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      className="absolute right-0 top-full mt-3 w-[360px] md:w-[380px] bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-100 z-50 overflow-hidden"
    >
      {/* Profile Card Header - Compact & Premium */}
      <div className="p-5 bg-slate-950 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 rounded-full blur-[60px] -mr-12 -mt-12 opacity-20" />
        
        <div className="relative flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-xl font-black shadow-lg border-2 border-white/10 shrink-0">
            {adminName[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-base font-black truncate tracking-tight text-white mb-0.5">{adminName}</h4>
            <div className="flex items-center gap-1.5">
               <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
               <p className="text-[9px] font-black uppercase tracking-[0.05em] text-indigo-300/80">Super Admin Access</p>
            </div>
          </div>
        </div>
        
        <div className="mt-4 flex flex-col gap-1.5">
           <div className="flex items-center gap-2.5 text-[10px] font-bold text-slate-400">
              <Mail size={12} className="text-slate-500 shrink-0" /> 
              <span className="truncate">{user?.user?.email}</span>
           </div>
           <div className="flex items-center gap-2.5 text-[10px] font-bold text-slate-400">
              <Hash size={12} className="text-slate-500 shrink-0" /> 
              <span>{user?.admin_id || 'ADM-SYSTEM-ALPHA'}</span>
           </div>
        </div>
      </div>

      {/* Menu Area - Compact Vertical Rhythm */}
      <div className="p-1.5 bg-white">
        <div className="flex flex-col gap-0.5">
           {menuItems.map((item) => (
             <button 
               key={item.view}
               onClick={() => onNavigate(item.view)}
               className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 transition-all group"
             >
               <div className="flex items-center gap-3.5">
                  <div className={`p-2 rounded-lg transition-all shadow-sm group-hover:shadow-md ${item.color.replace('text', 'bg')}/10 ${item.color} group-hover:bg-white group-hover:${item.color}`}>
                     <item.icon size={16} className="transition-colors" />
                  </div>
                  <span className="text-[12px] font-black tracking-tight text-slate-600 group-hover:text-slate-900 transition-colors uppercase">{item.label}</span>
               </div>
               <ChevronRight size={14} className="text-slate-200 group-hover:text-slate-900 transition-all group-hover:translate-x-0.5" />
             </button>
           ))}
        </div>

        <div className="h-px bg-slate-50 mx-4 my-1.5" />

        <div className="px-1 pb-1">
          <button 
            onClick={onLogout}
            className="w-full flex items-center justify-between p-2.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 transition-all group border border-rose-100/50"
          >
             <div className="flex items-center gap-3.5">
                <div className="p-2 bg-rose-500 text-white rounded-lg shadow-lg shadow-rose-500/20 group-hover:scale-105 transition-transform">
                   <LogOut size={16} />
                </div>
                <span className="text-[12px] font-black uppercase tracking-wider">Sign Out Securely</span>
             </div>
             <ChevronRight size={14} className="text-rose-200 group-hover:text-rose-600 mr-1" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default AdminProfileDropdown;
