import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Activity, Clock, Search, Filter, 
  Settings, UserPlus, CreditCard, ShieldCheck, 
  Trash2, Edit3, Monitor, CheckCircle
} from 'lucide-react';

const LOG_ENTRIES = [
  { id: 1, action: 'User Login', user: 'Admin', type: 'security', time: '12 minutes ago', device: 'iMac Pro (London)', status: 'Success', icon: ShieldCheck, color: 'text-emerald-500' },
  { id: 2, action: 'Student Registered', user: 'Admin', type: 'data', time: '1 hour ago', device: 'iMac Pro (London)', status: 'Success', details: 'Registered John Doe (STD-101)', icon: UserPlus, color: 'text-indigo-500' },
  { id: 3, action: 'Payment Verified', user: 'Admin', type: 'finance', time: '4 hours ago', device: 'iMac Pro (London)', status: 'Success', details: 'Verified $450 from Student ID 5', icon: CreditCard, color: 'text-emerald-500' },
  { id: 4, action: 'Settings Modified', user: 'Admin', type: 'system', time: 'Yesterday', device: 'iPhone 15 Pro', status: 'Success', details: 'Changed System Language to EN-US', icon: Settings, color: 'text-amber-500' },
  { id: 5, action: 'Profile Updated', user: 'Admin', type: 'security', time: 'April 15, 2:30 PM', device: 'iMac Pro (London)', status: 'Success', icon: Edit3, color: 'text-indigo-500' },
  { id: 6, action: 'Teacher Onboarded', user: 'Admin', type: 'data', time: 'April 14, 10:15 AM', device: 'Surface Laptop 5', status: 'Success', details: 'Added Dr. Sarah Smith', icon: UserPlus, color: 'text-indigo-500' },
  { id: 7, action: 'Course Deleted', user: 'Admin', type: 'data', time: 'April 13, 5:00 PM', device: 'iMac Pro (London)', status: 'Permanent', details: 'Removed Advanced Physics (ID 42)', icon: Trash2, color: 'text-rose-500' },
];

const AdminActivityLogView = () => {
  const [search, setSearch] = useState('');
  
  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-24">
       {/* Header */}
       <div className="flex justify-between items-center bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/30">
          <div className="flex items-center gap-6">
             <div className="w-16 h-16 rounded-3xl bg-slate-900 flex items-center justify-center text-white shadow-2xl">
                <Activity size={32} />
             </div>
             <div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">System Activity Log</h2>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-[11px] mt-1 ml-1">Historical Record of Neural Administrative Actions</p>
             </div>
          </div>
          <div className="flex items-center gap-3">
             <div className="px-5 py-3 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100 flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[11px] font-black uppercase tracking-widest">Live Sync Alpha Active</span>
             </div>
          </div>
       </div>

       {/* Toolbar */}
       <div className="flex gap-4 items-center">
          <div className="flex-1 relative">
             <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
             <input 
               value={search} onChange={e => setSearch(e.target.value)}
               placeholder="Search historical logs by action, device or details..." 
               className="w-full bg-white border border-slate-100 rounded-3xl pl-16 pr-6 py-4 text-sm font-bold text-slate-800 placeholder:text-slate-400 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/5 transition-all shadow-sm" 
             />
          </div>
          <button className="p-4 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-slate-900 transition-all shadow-sm">
             <Filter size={20} />
          </button>
       </div>

       {/* Log Table */}
       <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-2xl shadow-slate-200/40 overflow-hidden">
          <table className="w-full text-left border-collapse">
             <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                   <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Administrative Action</th>
                   <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Source Device</th>
                   <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Time Delta</th>
                   <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Result String</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-slate-50">
                {LOG_ENTRIES.filter(log => log.action.toLowerCase().includes(search.toLowerCase()) || log.details?.toLowerCase().includes(search.toLowerCase())).map(log => (
                  <tr key={log.id} className="hover:bg-slate-50/50 transition-colors group">
                     <td className="px-10 py-6">
                        <div className="flex items-center gap-5">
                           <div className={`p-3 bg-slate-50 rounded-2xl ${log.color} group-hover:scale-110 transition-transform`}>
                              <log.icon size={20} />
                           </div>
                           <div>
                              <p className="font-black text-slate-900 text-[15px]">{log.action}</p>
                              <p className="text-xs text-slate-400 font-bold">{log.details || 'System wide diagnostic success'}</p>
                           </div>
                        </div>
                     </td>
                     <td className="px-10 py-6">
                        <div className="flex items-center gap-2">
                           <Monitor size={14} className="text-slate-300" />
                           <span className="text-[13px] font-bold text-slate-600Case">{log.device}</span>
                        </div>
                     </td>
                     <td className="px-10 py-6">
                        <div className="flex items-center gap-2">
                           <Clock size={14} className="text-slate-300" />
                           <span className="text-[13px] font-bold text-slate-600">{log.time}</span>
                        </div>
                     </td>
                     <td className="px-10 py-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                           <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[9px] font-black uppercase tracking-widest border border-emerald-100 italic">Verified</span>
                           <CheckCircle size={14} className="text-emerald-500" />
                        </div>
                     </td>
                  </tr>
                ))}
             </tbody>
          </table>
       </div>

       {/* Footer Pagination */}
       <div className="flex justify-between items-center px-10">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Displaying 7 of 142 System Entries</p>
          <div className="flex items-center gap-2">
             <button className="px-6 py-2 bg-white border border-slate-100 rounded-xl text-xs font-black text-slate-400 hover:text-slate-900 transition-all">Previous</button>
             <button className="px-6 py-2 bg-indigo-600 text-white rounded-xl text-xs font-black shadow-lg shadow-indigo-100">Next Page</button>
          </div>
       </div>
    </div>
  );
};

export default AdminActivityLogView;
