import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Award, BookOpen, BarChart3, Clock, 
  CheckCircle, XCircle, Printer, Download,
  Filter, ChevronRight, TrendingUp
} from 'lucide-react';
import api from '../../api';

const StatCard = ({ label, value, subtext, icon: Icon, color }) => (
  <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-lg flex items-center gap-6">
    <div className={`w-14 h-14 rounded-2xl bg-${color}-50 text-${color}-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-${color}-500/10`}>
      <Icon size={24} />
    </div>
    <div className="flex-grow min-w-0">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 truncate">{label}</p>
      <h3 className="text-2xl font-black text-slate-900 leading-tight">{value}</h3>
      <p className={`text-[11px] font-bold text-${color}-600/80 uppercase mt-1`}>{subtext}</p>
    </div>
  </div>
);

const StudentAcademicRecordsView = ({ user }) => {
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState([]);
  const [filter, setFilter] = useState('All Term');

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const resp = await api.get('/exam-results/?status=published');
        setResults(resp.data);
      } catch (err) {
        console.error("Failed to fetch academic records", err);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, []);

  const avgPercentage = results.length > 0 
    ? (results.reduce((acc, curr) => acc + curr.percentage, 0) / results.length).toFixed(1)
    : '0.0';

  const attendance = 92.4; // Mock attendance since it's not in the results model

  return (
    <div className="max-w-[1200px] mx-auto flex flex-col gap-10 pb-24">
      {/* Header Info Banner */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-900 text-white p-10 rounded-[3rem] border border-white/10 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-[100px] -mr-40 -mt-40" />
        <div className="relative flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col gap-2 text-center md:text-left">
            <h2 className="text-4xl font-black tracking-tight">Academic Milestone Hub</h2>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-2">
              <span className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-2xl text-[11px] font-black uppercase tracking-widest border border-white/10">
                {user?.first_name} {user?.last_name || ''} | Class {user?.grade || '9A'}
              </span>
              <span className="px-4 py-2 bg-indigo-500/20 backdrop-blur-md rounded-2xl text-[11px] font-black uppercase tracking-widest border border-indigo-500/30 text-indigo-300">
                Academic Year 2025-26
              </span>
            </div>
          </div>
          <div className="flex gap-3">
             <button className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-all border border-white/10 flex items-center gap-3 text-xs font-black uppercase tracking-widest">
               <Printer size={18} /> Print Repo
             </button>
             <button className="px-8 py-4 bg-indigo-500 hover:bg-indigo-600 rounded-2xl transition-all shadow-xl shadow-indigo-500/20 flex items-center gap-3 text-xs font-black uppercase tracking-widest">
               <Download size={18} /> Export PDF
             </button>
          </div>
        </div>
      </motion.div>

      {/* High-Level Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Overall Progress" value={`${avgPercentage}%`} subtext="Performing Well" icon={TrendingUp} color="indigo" />
        <StatCard label="Attendance" value={`${attendance}%`} subtext="Exceeds Target" icon={Clock} color="emerald" />
        <StatCard label="Completed Exams" value={results.length} subtext="Season 1" icon={BookOpen} color="purple" />
        <StatCard label="Best Grade" value="A+" subtext="Mathematics" icon={Award} color="orange" />
      </div>

      {/* Records Table Section */}
      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col">
        <div className="px-10 py-8 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-6">
          <h3 className="text-xl font-black text-slate-800 flex items-center gap-3 uppercase tracking-[0.15em] text-[13px]">
            <BarChart3 className="text-indigo-500" /> Subject-wise Performance
          </h3>
          <div className="flex gap-2">
             {['All Term', 'Term 1', 'Term 2', 'Finals'].map(t => (
               <button 
                key={t}
                onClick={() => setFilter(t)}
                className={`px-5 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border ${
                  filter === t ? 'bg-slate-900 text-white border-slate-900 shadow-lg' : 'bg-slate-50 text-slate-400 border-slate-100 hover:bg-slate-100'
                }`}
               >
                 {t}
               </button>
             ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Exam Name</th>
                <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Subject</th>
                <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Marks (Int/Ext)</th>
                <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Percentage</th>
                <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Grade</th>
                <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                   <td colSpan="6" className="px-10 py-20 text-center"><div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto opacity-30" /></td>
                </tr>
              ) : results.length > 0 ? results.map((res, i) => (
                <tr key={res.id} className="hover:bg-slate-50/30 transition-colors cursor-default">
                  <td className="px-10 py-6 font-bold text-slate-900 text-sm">{res.exam_title || 'Term Assessment'}</td>
                  <td className="px-10 py-6 font-semibold text-slate-500 text-sm">Mathematics</td>
                  <td className="px-10 py-6 font-bold text-slate-900 text-sm">20 + {res.score} / 100</td>
                  <td className="px-10 py-6 text-center">
                     <span className={`px-3 py-1.5 rounded-xl font-black text-[11px] ${res.percentage >= 80 ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-50 text-indigo-600'}`}>{res.percentage}%</span>
                  </td>
                  <td className="px-10 py-6 text-center font-black text-slate-900 text-lg">{res.grade}</td>
                  <td className="px-10 py-6 text-right">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                      res.grade !== 'F' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-rose-100 text-rose-700 border-rose-200'
                    }`}>
                      {res.grade !== 'F' ? 'Passed' : 'Fail'}
                    </span>
                  </td>
                </tr>
              )) : (
                <tr>
                   <td colSpan="6" className="px-10 py-20 text-center text-slate-400 font-bold italic">No academic records published yet for this term</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="p-8 bg-slate-50/50 border-t border-slate-50 flex flex-col md:flex-row items-center justify-between gap-6">
           <div className="flex flex-col gap-1">
              <h4 className="text-[12px] font-black text-slate-800 uppercase tracking-tight">Instructor Remarks</h4>
              <p className="text-[13px] text-slate-500 font-medium italic">"Excellent analytical skills in Mathematics. Needs to focus more on presentation in social studies." — Mrs. Murray</p>
           </div>
           <button className="text-xs font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2 hover:gap-3 transition-all">Details Performance View <ChevronRight /> </button>
        </div>
      </div>
    </div>
  );
};

export default StudentAcademicRecordsView;
