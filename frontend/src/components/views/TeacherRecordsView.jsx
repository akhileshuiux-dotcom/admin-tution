import React from 'react';
import { motion } from 'framer-motion';
import { 
  Briefcase, Users, CheckCircle, Clock, 
  BarChart, Calendar, FileText, ChevronRight,
  Target, Award, Activity
} from 'lucide-react';

const RecordCard = ({ title, value, subtext, icon: Icon, color }) => (
  <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 flex items-center gap-6">
    <div className={`w-16 h-16 rounded-2xl bg-${color}-50 text-${color}-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-${color}-500/10`}>
      <Icon size={28} />
    </div>
    <div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{title}</p>
      <h3 className="text-3xl font-black text-slate-900 leading-tight">{value}</h3>
      <p className={`text-[11px] font-bold text-${color}-600/80 uppercase mt-1`}>{subtext}</p>
    </div>
  </div>
);

const TeacherRecordsView = ({ user, assignedClasses = [], onClassClick }) => {
  const stats = [
    { title: "Active Students", value: "148", subtext: "Across 4 Batches", icon: Users, color: "teal" },
    { title: "Attendance Rate", value: "94.2%", subtext: "Current Month", icon: CheckCircle, color: "emerald" },
    { title: "Workload / Week", value: "32h", subtext: "Standard Capacity", icon: Clock, color: "blue" },
    { title: "Module Rating", value: "4.9/5", subtext: "Student Feedback", icon: Award, color: "orange" },
  ];

  return (
    <div className="max-w-[1200px] mx-auto flex flex-col gap-10 pb-24">
      {/* Upper Banner */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-emerald-900 text-white p-12 rounded-[3.5rem] border border-white/10 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-[100px] -mr-48 -mt-48" />
        <div className="relative flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex flex-col gap-3 text-center md:text-left">
            <h2 className="text-4xl font-black tracking-tight">Professional Dossier</h2>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-2">
              <span className="px-5 py-2.5 bg-white/10 backdrop-blur-md rounded-2xl text-[11px] font-black uppercase tracking-widest border border-white/10">
                Staff ID: {user?.employee_id || 'PRO-001'} | {user?.specialization || 'Dept. of Sciences'}
              </span>
              <span className="px-5 py-2.5 bg-emerald-500/20 backdrop-blur-md rounded-2xl text-[11px] font-black uppercase tracking-widest border border-emerald-500/30 text-emerald-200">
                Performance Score: 98%
              </span>
            </div>
          </div>
          <div className="flex gap-4">
             <button className="px-8 py-5 bg-white/5 hover:bg-white/10 hover:scale-105 rounded-2xl transition-all border border-white/10 flex items-center gap-3 text-xs font-black uppercase tracking-widest">
               <Activity size={20} /> System Logs
             </button>
             <button className="px-10 py-5 bg-emerald-500 hover:bg-emerald-600 hover:scale-105 rounded-2xl transition-all shadow-xl shadow-emerald-500/20 flex items-center gap-3 text-xs font-black uppercase tracking-widest">
               <FileText size={20} /> Export Portfolio
             </button>
          </div>
        </div>
      </motion.div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((s, i) => <RecordCard key={i} {...s} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Class Management */}
        <div className="lg:col-span-8 flex flex-col gap-6">
           <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/30 overflow-hidden flex flex-col h-full">
              <div className="px-10 py-8 border-b border-slate-50 flex items-center justify-between">
                 <h3 className="text-xl font-black text-slate-900 flex items-center gap-3 uppercase tracking-[0.15em] text-[13px]">
                   <Calendar className="text-emerald-500" /> Current Class Load
                 </h3>
                 <span className="text-[10px] font-black text-slate-400 bg-slate-50 px-3 py-1 rounded-full uppercase tracking-widest italic font-bold">Total 4 Classes</span>
              </div>
              <div className="p-4 flex flex-col gap-3">
                 {assignedClasses.map((cls, i) => (
                    <motion.div 
                        key={i} 
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => onClassClick?.(cls)}
                        className="group flex flex-col md:flex-row md:items-center justify-between p-6 bg-slate-50/50 rounded-3xl border border-transparent hover:border-emerald-100 hover:bg-white hover:shadow-lg hover:shadow-emerald-500/5 transition-all cursor-pointer relative overflow-hidden"
                    >
                      <div className="flex items-center gap-5 relative z-10">
                         <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center text-teal-600 font-black text-lg">
                            {cls.name[0]}
                         </div>
                         <div>
                            <h4 className="text-[15px] font-bold text-slate-800">{cls.name}</h4>
                            <p className="text-[12px] text-slate-400 font-medium">{cls.timing}</p>
                         </div>
                      </div>
                      
                      <div className="flex items-center gap-10 mt-4 md:mt-0 relative z-10">
                         <div className="flex flex-col items-center">
                            <span className="text-[12px] font-black text-slate-900">{cls.students}</span>
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Students</span>
                         </div>
                         
                         <div className="w-32 flex flex-col gap-1.5">
                            <div className="flex justify-between text-[10px] font-black uppercase tracking-tight">
                               <span className="text-slate-400">Course Progress</span>
                               <span className="text-emerald-600">{cls.progress}%</span>
                            </div>
                            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                               <motion.div initial={{ width: 0 }} animate={{ width: `${cls.progress}%` }} className="h-full bg-emerald-500" />
                            </div>
                         </div>

                         <div className="p-3 bg-white rounded-xl text-slate-300 group-hover:text-emerald-500 group-hover:bg-emerald-50 transition-all shadow-sm">
                            <ChevronRight size={18} />
                         </div>
                      </div>
                    </motion.div>
                 ))}
              </div>
           </div>
        </div>

        {/* Right: Insights & Rating */}
        <div className="lg:col-span-4 flex flex-col gap-8">
           <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/30">
              <h3 className="text-[12px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-8 border-b border-emerald-50 pb-4">Activity Overview</h3>
              <div className="flex flex-col gap-6">
                 <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center flex-shrink-0"><FileText size={20} /></div>
                    <div>
                       <h4 className="text-[13px] font-bold text-slate-800 leading-tight">12 Exams Scheduled</h4>
                       <p className="text-[11px] text-slate-400 font-medium mt-1">Ready for publishing</p>
                    </div>
                 </div>
                 <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0"><Target size={20} /></div>
                    <div>
                       <h4 className="text-[13px] font-bold text-slate-800 leading-tight">4 Pending Meetings</h4>
                       <p className="text-[11px] text-slate-400 font-medium mt-1">Staff & Parent syncs</p>
                    </div>
                 </div>
                 <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center flex-shrink-0"><Award size={20} /></div>
                    <div>
                       <h4 className="text-[13px] font-bold text-slate-800 leading-tight">Senior Faculty Badge</h4>
                       <p className="text-[11px] text-slate-400 font-medium mt-1">Awarded Dec 2024</p>
                    </div>
                 </div>
              </div>

              <div className="mt-10 pt-8 border-t border-slate-50">
                 <div className="flex items-center justify-between mb-4">
                    <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Growth Index</h4>
                    <span className="text-xs font-bold text-emerald-600">+12.5%</span>
                 </div>
                 <div className="flex items-end gap-1.5 h-20">
                    {[3, 5, 4, 7, 6, 8, 5, 9, 7].map((h, i) => (
                      <motion.div 
                        key={i} 
                        initial={{ height: 0 }} 
                        animate={{ height: `${h * 10}%` }} 
                        className="flex-1 bg-emerald-500/20 rounded-t-md hover:bg-emerald-500 transition-all cursor-pointer"
                      />
                    ))}
                 </div>
              </div>
           </div>

           <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
              <div className="relative z-10">
                 <h4 className="text-white font-black text-xl mb-2">Need to adjust your workload?</h4>
                 <p className="text-emerald-100/60 text-[12px] font-medium mb-6">Raise a request to the academic dean for batch updates or leave assistance.</p>
                 <button className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest transition-all shadow-xl shadow-emerald-500/20">Contact Admin Desk</button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherRecordsView;
